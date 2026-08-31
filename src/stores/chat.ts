import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchLatestSession } from '../api/chat'
import type { ChatSession } from '../api/chat'
import type { ApiError } from '../api/http'
import { replayLgRag, streamLgRag } from '../composables/useLgRagSse'
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

/**
 * T4 · active-run 本地持久化键（00 定夺：续看 SoT = run_id + seq/cursor，run 级与 thread 正交）。
 * 值形 {run_id, last_seq, thread_id, updated_at}；run 终态（done/error/abort）即清除；
 * localStorage 不可用退化内存态（刷新即失，静默降级）。stores/auth.ts clearSession 直写同键清除。
 */
export const LG_RAG_ACTIVE_RUN_STORAGE_KEY = 'ops.lg-rag.active-run'

export interface LgRagActiveRun {
  run_id: string
  last_seq: number
  thread_id: string | null
  updated_at: string
}

/** 读已存 active-run；缺失/坏 JSON/键不齐/localStorage 不可用 → null（静默降级，不 crash） */
function readStoredActiveRun(): LgRagActiveRun | null {
  try {
    const raw = window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LgRagActiveRun>
    if (typeof parsed.run_id !== 'string' || !parsed.run_id) return null
    if (typeof parsed.last_seq !== 'number' || !Number.isFinite(parsed.last_seq)) return null
    return {
      run_id: parsed.run_id,
      last_seq: parsed.last_seq,
      thread_id: typeof parsed.thread_id === 'string' ? parsed.thread_id : null,
      updated_at: typeof parsed.updated_at === 'string' ? parsed.updated_at : '',
    }
  } catch {
    return null
  }
}

function writeStoredActiveRun(run: LgRagActiveRun): void {
  try {
    window.localStorage.setItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY, JSON.stringify(run))
  } catch {
    // localStorage 不可用：仅内存态生效，静默降级
  }
}

function clearStoredActiveRun(): void {
  try {
    window.localStorage.removeItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)
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
 * - 断联/replay 续看（T4 · freeze lg-rag-sse-v1 沿用）：每帧捕获可选顶层 cursor（缺失以 run_id+seq 合成），
 *   active-run 持久化（key=ops.lg-rag.active-run）；run 终态（done/error/abort）即清除；
 *   断网/超时 mid-stream → 错误条 + 「续看」（手动触发 replay，不自动重试）；
 *   刷新/重进有未完成 run → 「上次回答未完成·续看」条；replay 帧复用同一渲染管线、渲染进新建 assistant 消息；
 *   per run_id 记 lastAppliedSeq，seq <= lastAppliedSeq 的帧忽略（answer 不重复 · thinking 不重复）；
 *   replay 404/422 → 清 active-run + 提示不重试；401（live/replay）→ 清 thread_id + 清 active-run + 跳登录
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

  // T4：刷新/重进恢复未完成 run 的续看游标（run 级 SoT，与 thread_id 正交）
  const initialActiveRun = readStoredActiveRun()
  /** 未完成 run 的续看游标；run 终态（done/error/abort）即清除；null = 无可续看 */
  const activeRun = ref<LgRagActiveRun | null>(initialActiveRun)
  /** 刷新/重进发现有未完成 run 时展示「上次回答未完成·续看」条（手动触发，不自动 replay） */
  const resumeNotice = ref<boolean>(initialActiveRun !== null)
  /** 续看提示（replay 空流「暂无新进度」/ 接力「仍在生成中」等一次性文案） */
  const resumeHint = ref<string | null>(null)

  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  /** 流被手动中断（abort）后的一次性提示标记 */
  const interrupted = ref(false)
  const error = ref<ChatErrorState | null>(null)
  const lastDone = ref<ChatDoneInfo | null>(null)

  /** 可点「续看」：有未完成 run 且当前无流在进行 */
  const canResume = computed(() => activeRun.value !== null && !streaming.value)

  let controller: LgRagSseController | null = null
  let messageSeq = 0
  // T4：per run_id 的 seq 去重基线（lastAppliedSeq）；run 切换即重置
  let currentRunId: string | null = null
  let lastAppliedSeq = 0

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

  /** 清 active-run（ref + localStorage + 刷新续看条）；run 终态/401/手动停止/新会话调用 */
  function clearActiveRun(): void {
    activeRun.value = null
    resumeNotice.value = false
    clearStoredActiveRun()
  }

  interface FrameCursor {
    runId: string | null
    seq: number | null
  }

  /**
   * T4 帧游标提取：优先帧自带顶层 run_id/seq；可选顶层 cursor="{run_id}:{seq}" 兜底合成；
   * run.start 等帧 run_id 可能仅在 payload。seq 非有限数按缺失处理（该帧不参与去重/持久化）。
   */
  function extractFrameCursor(event: LgRagSseEvent): FrameCursor {
    let runId = typeof event.run_id === 'string' && event.run_id ? event.run_id : null
    let seq = typeof event.seq === 'number' && Number.isFinite(event.seq) ? event.seq : null
    const cursor = typeof event.cursor === 'string' ? event.cursor : ''
    if (cursor && (!runId || seq === null)) {
      const idx = cursor.lastIndexOf(':')
      if (idx > 0) {
        if (!runId) runId = cursor.slice(0, idx)
        if (seq === null) {
          const cursorSeq = Number(cursor.slice(idx + 1))
          if (Number.isFinite(cursorSeq)) seq = cursorSeq
        }
      }
    }
    if (!runId) {
      const payloadRunId = payloadString(event, 'run_id')
      if (payloadRunId) runId = payloadRunId
    }
    return { runId, seq }
  }

  /**
   * T4 统一帧入口（live / replay 同一管线）：
   * - per run_id 记 lastAppliedSeq，seq <= lastAppliedSeq 的帧整体忽略（answer 不重复 append · thinking 不重复入列）
   * - 每推进一格 seq 即持久化 active-run（断网/刷新后可接力）；终态帧由 handleEvent 内清除兜底
   * - 无 run_id/seq 的帧（旧帧形）不参与去重与持久化，直接渲染（T2/T3 行为不回退）
   */
  function processFrame(event: LgRagSseEvent, assistant: ChatMessage): void {
    const { runId, seq } = extractFrameCursor(event)
    if (runId && runId !== currentRunId) {
      currentRunId = runId
      lastAppliedSeq = 0
    }
    if (runId && seq !== null) {
      if (seq <= lastAppliedSeq) return
      lastAppliedSeq = seq
      activeRun.value = {
        run_id: runId,
        last_seq: seq,
        thread_id: threadId.value,
        updated_at: new Date().toISOString(),
      }
      writeStoredActiveRun(activeRun.value)
    }
    handleEvent(event, assistant)
  }

  function handleEvent(event: LgRagSseEvent, assistant: ChatMessage): void {
    switch (event.event_type) {
      case 'run.start': {
        // T3：捕获 api 生成/回显的 thread_id 并落存（幂等赋值 · 唯一捕获点，不做响应头校验——R1-N3）；
        // 缺 id 仅记 warn，本轮退化为无续写，不阻断展示；seq/cursor 由 processFrame 统一消费（T4）
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
        clearActiveRun() // T4：run 终态即清除 active-run（含 replay 补发的 done——断连期间服务端跑完的收尾闭环）
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
        clearActiveRun() // T4：error 终态同清除（服务端已判失败，续看无意义）
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
    resumeHint.value = null

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
        onEvent: (event) => processFrame(event, assistant),
        onError: (transportError) => {
          streaming.value = false
          if (transportError.status === 401) {
            // SSE fetch 不经 axios 拦截器：本地清会话 + thread_id + active-run（R1-N3），交给路由守卫/视图跳登录
            clearThreadId()
            clearActiveRun()
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
            // T4：断网/超时 mid-stream —— active-run 已随帧推进保留，错误条 + 「续看」手动接力（不自动重试）
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
          clearActiveRun() // T4：abort 属 run 终态（00 定夺）；停止后不可续看（R1-N6 产品语义）
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

  /** 新会话：清 thread_id + 清消息 + 清提示 + 清 active-run；下轮发送 body 不带 thread_id（api 生成新 id） */
  function startNewSession(): void {
    stopStreaming() // streaming 中先 abort（R1-N4）
    clearThreadId()
    clearActiveRun() // T4：显式放弃旧上下文，未完成 run 一并丢弃（30 内决，对齐「新会话」语义）
    messages.value = []
    error.value = null
    lastDone.value = null
    interrupted.value = false
    resumeHint.value = null
  }

  /** 关闭「已恢复上次会话上下文」提示条 */
  function dismissRestoredNotice(): void {
    restoredNotice.value = false
  }

  /** 关闭「上次回答未完成·续看」提示条（保留 active-run，仅不再打扰） */
  function dismissResumeNotice(): void {
    resumeNotice.value = false
  }

  /**
   * T4 续看：从 active-run 游标调 replay（POST /api/ops/lg-rag/replay · body {run_id, after_seq:last_seq}），
   * 帧复用 processFrame 同一渲染管线；渲染目标为**新建** assistant 消息（R1-N5：刷新后 messages 为空，
   * 断连续看亦新开一条承接后续帧）。手动触发，绝不自动 replay。
   */
  function resumeFromCursor(): void {
    const run = activeRun.value
    if (!run || streaming.value) return

    error.value = null
    resumeHint.value = null
    resumeNotice.value = false

    const assistant = pushMessage('assistant')
    // 接力去重基线：已推进的 seq 一律忽略（防御 replay 与 live 已收帧重叠）
    currentRunId = run.run_id
    lastAppliedSeq = run.last_seq
    let sawTerminal = false

    streaming.value = true
    controller = replayLgRag(
      { run_id: run.run_id, after_seq: run.last_seq },
      {
        onEvent: (event) => {
          if (event.event_type === 'done' || event.event_type === 'error') sawTerminal = true
          processFrame(event, assistant)
        },
        onError: (transportError) => {
          streaming.value = false
          if (transportError.status === 401) {
            // replay 401：清 thread_id + 清 active-run + 清 auth，跳登录（与 live 401 同语义）
            clearThreadId()
            clearActiveRun()
            useAuthStore().clearSession()
            error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
          } else if (transportError.status === 404 || transportError.status === 422) {
            // 404 未知/跨用户 run · 422 非法游标（防御）：清 active-run + 用户可见提示，不自动重试
            clearActiveRun()
            error.value = {
              stage: 'resume',
              message:
                transportError.status === 404
                  ? '已无法续看（对话记录不存在或已过期），请重新提问'
                  : '续看请求校验未通过（' + transportError.message + '），请重新提问',
              retryable: false,
            }
          } else {
            // replay 网络错/超时：保留 active-run，可再点「续看」
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
          clearActiveRun() // abort 终态（与 live 一致）
        },
        onDone: () => {
          streaming.value = false
          // R1-N4 空流/未完边界：replay 干净结束但未见终态帧 → run 仍在服务端推进；
          // 保留 active-run，提示稍后再试（seq 已推进则提示接力）
          if (!sawTerminal && activeRun.value) {
            resumeHint.value =
              activeRun.value.last_seq > run.last_seq
                ? '回答仍在生成中，可稍后再次「续看」接力'
                : '暂无新进度，稍后再点「续看」'
          }
        },
      },
    )
  }

  return {
    session,
    sessionLoading,
    sessionError,
    threadId,
    restoredNotice,
    activeRun,
    resumeNotice,
    resumeHint,
    canResume,
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
    dismissResumeNotice,
    resumeFromCursor,
  }
})
