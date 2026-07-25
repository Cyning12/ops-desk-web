import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { ChatSseCallbacks } from '../src/composables/useOpsChatSse'

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/composables/useOpsChatSse', () => ({
  streamOpsChat: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { streamOpsChat } from '../src/composables/useOpsChatSse'
import { useAuthStore } from '../src/stores/auth'
import { useChatStore } from '../src/stores/chat'

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let captured: ChatSseCallbacks
let abortMock: ReturnType<typeof vi.fn>

describe('stores/chat', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    abortMock = vi.fn(() => captured.onAborted?.())
    vi.mocked(streamOpsChat).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: abortMock, done: Promise.resolve() }
    })

    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    const chat = useChatStore()
    await chat.loadLatestSession()
  })

  it('loadLatestSession 成功：写入 session；失败：写入 sessionError', async () => {
    const chat = useChatStore()
    expect(chat.session).toEqual(fakeSession)
    expect(chat.sessionError).toBeNull()

    vi.mocked(fetchLatestSession).mockRejectedValueOnce({
      status: 500,
      message: 'server boom',
      raw: null,
    } as ApiError)
    const fresh = useChatStore()
    fresh.session = null
    await fresh.loadLatestSession()
    expect(fresh.session).toBeNull()
    expect(fresh.sessionError).toBe('server boom')
  })

  it('sendMessage 事件流：user/assistant 消息入列，thinking 分块、answer 增量拼接、done 收尾', () => {
    const chat = useChatStore()
    chat.sendMessage('  你好  ')

    expect(streamOpsChat).toHaveBeenCalledWith(
      { message: '你好', sessionId: 's-1', model: null },
      expect.any(Object),
    )
    expect(chat.streaming).toBe(true)
    expect(chat.messages).toHaveLength(2)
    expect(chat.messages[0]).toMatchObject({ role: 'user', content: '你好' })
    expect(chat.messages[1]).toMatchObject({ role: 'assistant', content: '' })

    captured.onEvent?.({ event_type: 'run.start', agent_role: 'system', payload: { run_id: 'r-1' } })
    captured.onEvent?.({ event_type: 'thinking', agent_role: 'intent', payload: { content: '理解' } })
    captured.onEvent?.({ event_type: 'thinking', agent_role: 'intent', payload: { content: '意图' } })
    captured.onEvent?.({ event_type: 'thinking', agent_role: 'context', payload: { content: '加载上下文' } })
    captured.onEvent?.({ event_type: 'answer', agent_role: 'answer', payload: { content: '回答' } })
    captured.onEvent?.({ event_type: 'answer', agent_role: 'answer', payload: { content: '片段' } })

    const assistant = chat.messages[1]
    expect(assistant.thinking).toEqual([
      { role: 'intent', content: '理解意图' },
      { role: 'context', content: '加载上下文' },
    ])
    expect(assistant.content).toBe('回答片段')
    expect(chat.streaming).toBe(true)

    captured.onEvent?.({
      event_type: 'done',
      agent_role: 'system',
      payload: { latency_ms: 1234, model: 'deepseek-v4-pro' },
    })
    expect(chat.streaming).toBe(false)
    expect(chat.lastDone).toEqual({ latency_ms: 1234, model: 'deepseek-v4-pro' })
    expect(chat.error).toBeNull()
  })

  it('error 事件：停止 streaming 并记录 stage/message/retryable', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onEvent?.({
      event_type: 'error',
      agent_role: 'system',
      payload: { stage: 'llm', message: 'model unavailable', retryable: false },
    })

    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'llm', message: 'model unavailable', retryable: false })
  })

  it('传输层错误：network 错误 retryable=true', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onError?.({ kind: 'network', status: null, message: 'Failed to fetch' })

    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'network', message: 'Failed to fetch', retryable: true })
  })

  it('传输层 401：清空 auth 会话并给出 auth 错误', () => {
    const auth = useAuthStore()
    auth.user = { id: 'u-1', username: 'admin', role: 'maintainer' }
    auth.ready = true

    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onError?.({ kind: 'http', status: 401, message: 'Invalid or expired session' })

    expect(auth.isLoggedIn).toBe(false)
    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'auth', message: '登录已过期，请重新登录', retryable: false })
  })

  it('stopStreaming：调用 abort，标记 interrupted，可继续重发', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')
    expect(chat.streaming).toBe(true)

    chat.stopStreaming()

    expect(abortMock).toHaveBeenCalledTimes(1)
    expect(chat.streaming).toBe(false)
    expect(chat.interrupted).toBe(true)
    expect(chat.error).toBeNull()

    // 中断后可重新发送
    chat.sendMessage('再来一次')
    expect(chat.streaming).toBe(true)
    expect(chat.interrupted).toBe(false)
    expect(chat.messages).toHaveLength(4)
  })

  it('streaming 中忽略重复发送；无 session 时忽略发送', async () => {
    const chat = useChatStore()
    chat.sendMessage('第一条')
    expect(streamOpsChat).toHaveBeenCalledTimes(1)

    chat.sendMessage('第二条（应被忽略）')
    expect(streamOpsChat).toHaveBeenCalledTimes(1)
    expect(chat.messages).toHaveLength(2)

    // 无 session
    setActivePinia(createPinia())
    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    const empty = useChatStore()
    empty.sendMessage('没有 session')
    expect(empty.messages).toHaveLength(0)
  })
})
