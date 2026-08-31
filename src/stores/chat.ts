import { ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchLatestSession } from '../api/chat'
import type { ChatSession } from '../api/chat'
import type { ApiError } from '../api/http'
import { streamLgRag } from '../composables/useLgRagSse'
import type { LgRagSseController, LgRagSseEvent } from '../composables/useLgRagSse'
import { useAuthStore } from './auth'

/**
 * lg-rag thread_id 本地持久化键（T3 · 00 定夺：SoT=thread_id · 登出/401 清除）。
 * stores/auth.ts clearSession 直写同键清除（避免 auth→chat 循环 import），改动须双侧同步。
 */
export const LG_RAG_THREAD_ID_STORAGE_KEY = 'ops.lg-rag.thread-id'

/** 读已存 thread_id；localStorage 不可用 → 返回 null（内存态降级，刷新即新会话，不 crash） */
function readStoredThreadId(): string | null {
  try {
    return window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredThreadId(id: string): void {
  try {
    window.localStorage.setItem(LG_RAG_THREAD_ID_STORAGE_KEY, id)
  } catch {
    // localStorage 不可用：仅内存态生效，静默降级
  }
}

function clearStoredThreadId(): void {
  try {
    window.localStorage.removeItem(LG_RAG_THREAD_ID_STORAGE_KEY)
  } catch {
    // 静默降级
  }
}

/** assistant 消息的思考过程分块（按 agent_role 聚合） */
export interface ChatThinkingBlock {
  role: string
  content: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** 纯文本（markdown 不渲染，保留换行） */
  content: string
  /** assistant 消息的 thinking 块序列 */
  thinking: ChatThinkingBlock[]
}

/** SSE error 事件 / 传输层错误的统一展示结构 */
export interface ChatErrorState {
  stage: string
  message: string
  retryable: boolean
}

export interface ChatDoneInfo {
  latency_ms: number
  model: string
}

function payloadString(event: LgRagSseEvent, key: string): string {
  const value = event.payload?.[key]
  return typeof value === 'string' ? value : ''
}

/**
 * 进度帧 payload → 单行摘要（api sse_stream._summarize_payload 真实键形）：
 * - 优先直出 summary/content/message（字符串键）
 * - 否则按已知键拼 `key: value`（JSON 截断），最多 3 段
 * - 兜底列出 payload 键名
 */
const PROGRESS_DIRECT_KEYS = ['summary', 'content', 'message'] as const
const PROGRESS_DETAIL_KEYS = [
  'intent',
  'route',
  'critic_verdict',
  'subtasks',
  'allowed_capability_ids',
  'subtask_result',
  'answer_preview',
  'retry_count',
  'rebinding_count',
  'keys',
] as const

function summarizeProgress(payload: Record<string, unknown> | undefined): string {
  if (!payload) return ''
  for (const key of PROGRESS_DIRECT_KEYS) {
    const value = payload[key]
    if (typeof value === 'string' && value) return value
  }
  const parts: string[] = []
  for (const key of PROGRESS_DETAIL_KEYS) {
    const value = payload[key]
    if (value === undefined || value === null) continue
    const text = typeof value === 'string' ? value : JSON.stringify(value)
    if (!text) continue
    parts.push(`${key}: ${text.length > 80 ? text.slice(0, 79) + '…' : text}`)
    if (parts.length >= 3) break
  }
  if (parts.length) return parts.join(' · ')
  return Object.keys(payload).slice(0, 5).join(', ')
}

/**
 * Chat 会话状态（T3 · freeze lg-rag-sse-v1）：
 * - 进入页面 loadLatestSession() 获取/创建 session（元数据端点，仅 T2 门控，非 lg-rag SoT）
 * - sendMessage() 追加 user/assistant 消息并启动 lg-rag SSE 流（POST /api/ops/lg-rag/stream）；
 *   node.progress/subtask.progress 进进度块、answer 整段填入 content、done/error 收尾
 * - thread_id 会话连续性（T3）：客户端不自生成；首轮留空 → api 生成 → run.start payload 捕获；
 *   localStorage 持久化（key=ops.lg-rag.thread-id，不可用则内存态降级）；
 *   刷新/重进恢复（仅后端上下文，不回显历史消息，顶部提示条）；
 *   401/登出清除；已存 id 遇 404/422 → 清本地 id + 提示，不自动重发；
 *   startNewSession() 开新会话（清 id + 清消息 + 清提示）
 * - stopStreaming() abort 中断，可继续重发
 * - 主路径已废弃 chat stream（旧 SSE 封装仅留文件/单测对照，本 store 禁止 import）
 */
export const useChatStore = defineStore('chat', () => {
  const session = ref<ChatSession | null>(null)
  const sessionLoading = ref(false)
  /** latest session 获取失败的提示文案（401 由全局拦截跳登录） */
  const sessionError = ref<string | null>(null)

  // T3：刷新/重进恢复已存 thread_id（仅恢复后端上下文，不回显历史消息）
  const initialThreadId = readStoredThreadId()
  /** lg-rag 会话 SoT（禁止当 chat session_id 用）；null = 下轮由 api 生成 */
  const threadId = ref<string | null>(initialThreadId)
  /** 重进恢复了已存 thread_id 时展示顶部提示条（可关闭） */
  const restoredNotice = ref<boolean>(initialThreadId !== null)

  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  /** 流被手动中断（abort）后的一次性提示标记 */
  const interrupted = ref(false)
  const error = ref<ChatErrorState | null>(null)
  const lastDone = ref<ChatDoneInfo | null>(null)

  let controller: LgRagSseController | null = null
  let messageSeq = 0

  async function loadLatestSession(): Promise<void> {
    if (sessionLoading.value) return
    sessionLoading.value = true
    sessionError.value = null
    try {
      session.value = await fetchLatestSession()
    } catch (err) {
      const apiError = err as ApiError
      sessionError.value = apiError.message || '获取会话失败'
    } finally {
      sessionLoading.value = false
    }
  }

  function pushMessage(role: ChatMessage['role']): ChatMessage {
    const message: ChatMessage = { id: `m-${++messageSeq}`, role, content: '', thinking: [] }
    messages.value.push(message)
    return message
  }

  function handleEvent(event: LgRagSseEvent, assistant: ChatMessage): void {
    switch (event.event_type) {
      case 'run.start': {
        // T3：捕获 api 生成/回显的 thread_id 并落存（幂等赋值 · 唯一捕获点，不做响应头校验——R1-N3）；
        // 缺 id 仅记 warn，本轮退化为无续写，不阻断展示；seq/cursor 消费属 T4
        const capturedThreadId = payloadString(event, 'thread_id')
        if (capturedThreadId) {
          threadId.value = capturedThreadId
          writeStoredThreadId(capturedThreadId)
        } else {
          console.warn('[chat] run.start 缺 thread_id：本轮无续写，不阻断展示')
        }
        break
      }
      case 'node.progress':
      case 'subtask.progress': {
        // 节点完成摘要（非全文 dump · api §4.2）；payload 键形以 api _summarize_payload 为准
        const content = summarizeProgress(event.payload)
        if (!content) break
        assistant.thinking.push({ role: event.agent_role ?? event.event_type, content })
        break
      }
      case 'answer':
        // T2 整段 answer（非 delta）；重复帧取最新整段
        assistant.content = payloadString(event, 'content')
        break
      case 'done': {
        const latency = event.payload?.latency_ms
        const model = event.payload?.model
        lastDone.value = {
          latency_ms: typeof latency === 'number' ? latency : 0,
          model: typeof model === 'string' ? model : '',
        }
        streaming.value = false
        break
      }
      case 'error': {
        const retryable = event.payload?.retryable
        error.value = {
          stage: payloadString(event, 'stage') || 'unknown',
          message: payloadString(event, 'message') || '对话出错',
          retryable: retryable === true,
        }
        streaming.value = false
        break
      }
      default:
        // tool_call / model.fallback 等 v1 未展示的事件：忽略
        break
    }
  }

  function sendMessage(text: string): void {
    const content = text.trim()
    if (!content || streaming.value || !session.value) return

    error.value = null
    lastDone.value = null
    interrupted.value = false

    // 422 预检（SPEC §3.1：query 1..8000）；后端仍兜底校验
    if (content.length > 8000) {
      pushMessage('user').content = content
      pushMessage('assistant')
      error.value = { stage: 'validation', message: '消息过长（上限 8000 字），请精简后重发', retryable: false }
      return
    }

    pushMessage('user').content = content
    const assistant = pushMessage('assistant')

    streaming.value = true
    // T3：已存 thread_id 则带上续问（同会话同一 id）；无则由 api 生成（run.start 捕获落存）
    const sentThreadId = threadId.value
    controller = streamLgRag(
      { query: content, mode: 'supervisor', ...(sentThreadId ? { threadId: sentThreadId } : {}) },
      {
        onEvent: (event) => handleEvent(event, assistant),
        onError: (transportError) => {
          streaming.value = false
          if (transportError.status === 401) {
            // SSE fetch 不经 axios 拦截器：本地清会话 + thread_id，交给路由守卫/视图跳登录
            clearThreadId()
            useAuthStore().clearSession()
            error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
          } else if ((transportError.status === 404 || transportError.status === 422) && sentThreadId) {
            // 已存 thread_id 失效（404 会话失效/他用户 · 422 非法/超长防御）：
            // 清本地 id + 用户可见提示；不自动重发（用户重发将以新 thread 进行）
            clearThreadId()
            error.value = {
              stage: 'session',
              message:
                transportError.status === 404
                  ? '会话已失效，请重新发送'
                  : '会话校验未通过，请重新发送（' + transportError.message + '）',
              retryable: true,
            }
          } else {
            error.value = {
              stage: transportError.kind,
              message: transportError.message,
              retryable: true,
            }
          }
        },
        onAborted: () => {
          streaming.value = false
          interrupted.value = true
        },
        onDone: () => {
          streaming.value = false
        },
      },
    )
  }

  function stopStreaming(): void {
    controller?.abort()
    controller = null
  }

  /** 清本地 thread_id（ref + localStorage + 恢复提示条） */
  function clearThreadId(): void {
    threadId.value = null
    restoredNotice.value = false
    clearStoredThreadId()
  }

  /** 新会话：清 thread_id + 清消息 + 清提示；下轮发送 body 不带 thread_id（api 生成新 id） */
  function startNewSession(): void {
    stopStreaming() // streaming 中先 abort（R1-N4）
    clearThreadId()
    messages.value = []
    error.value = null
    lastDone.value = null
    interrupted.value = false
  }

  /** 关闭「已恢复上次会话上下文」提示条 */
  function dismissRestoredNotice(): void {
    restoredNotice.value = false
  }

  return {
    session,
    sessionLoading,
    sessionError,
    threadId,
    restoredNotice,
    messages,
    streaming,
    interrupted,
    error,
    lastDone,
    loadLatestSession,
    sendMessage,
    stopStreaming,
    startNewSession,
    dismissRestoredNotice,
  }
})
