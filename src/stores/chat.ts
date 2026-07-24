import { ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchLatestSession } from '../api/chat'
import type { ChatSession } from '../api/chat'
import type { ApiError } from '../api/http'
import { streamOpsChat } from '../composables/useOpsChatSse'
import type { ChatSseController, ChatSseEvent } from '../composables/useOpsChatSse'
import { useAuthStore } from './auth'

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

function payloadString(event: ChatSseEvent, key: string): string {
  const value = event.payload?.[key]
  return typeof value === 'string' ? value : ''
}

/**
 * Chat 会话状态：
 * - 进入页面 loadLatestSession() 获取/创建 session
 * - sendMessage() 追加 user/assistant 消息并启动 SSE 流；
 *   thinking 增量进 thinking 块、answer 增量拼接 content、done/error 收尾
 * - stopStreaming() abort 中断，可继续重发
 */
export const useChatStore = defineStore('chat', () => {
  const session = ref<ChatSession | null>(null)
  const sessionLoading = ref(false)
  /** latest session 获取失败的提示文案（401 由全局拦截跳登录） */
  const sessionError = ref<string | null>(null)

  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  /** 流被手动中断（abort）后的一次性提示标记 */
  const interrupted = ref(false)
  const error = ref<ChatErrorState | null>(null)
  const lastDone = ref<ChatDoneInfo | null>(null)

  let controller: ChatSseController | null = null
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

  function handleEvent(event: ChatSseEvent, assistant: ChatMessage): void {
    switch (event.event_type) {
      case 'run.start':
        break
      case 'thinking': {
        const content = payloadString(event, 'content')
        if (!content) break
        const role = event.agent_role ?? 'thinking'
        const last = assistant.thinking[assistant.thinking.length - 1]
        if (last && last.role === role) last.content += content
        else assistant.thinking.push({ role, content })
        break
      }
      case 'answer':
        assistant.content += payloadString(event, 'content')
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

    pushMessage('user').content = content
    const assistant = pushMessage('assistant')

    streaming.value = true
    const sessionId = session.value.id
    controller = streamOpsChat(
      { message: content, sessionId, model: null },
      {
        onEvent: (event) => handleEvent(event, assistant),
        onError: (transportError) => {
          streaming.value = false
          if (transportError.status === 401) {
            // SSE fetch 不经 axios 拦截器：本地清会话，交给路由守卫/视图跳登录
            useAuthStore().clearSession()
            error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
          } else {
            error.value = {
              stage: transportError.kind === 'http' ? 'http' : 'network',
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

  return {
    session,
    sessionLoading,
    sessionError,
    messages,
    streaming,
    interrupted,
    error,
    lastDone,
    loadLatestSession,
    sendMessage,
    stopStreaming,
  }
})
