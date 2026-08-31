import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { streamLgRag } from '../src/composables/useLgRagSse'
import { useAuthStore } from '../src/stores/auth'
import { useChatStore } from '../src/stores/chat'

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let captured: LgRagSseCallbacks
let abortMock: ReturnType<typeof vi.fn>

describe('stores/chat（T2 · lg-rag SSE）', () => {
  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()

    abortMock = vi.fn(() => captured.onAborted?.())
    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
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

  it('sendMessage 走 lg-rag stream：query/mode=supervisor，thread_id 留空（T2）', () => {
    const chat = useChatStore()
    chat.sendMessage('  你好  ')

    expect(streamLgRag).toHaveBeenCalledWith({ query: '你好', mode: 'supervisor' }, expect.any(Object))
    const input = vi.mocked(streamLgRag).mock.calls[0][0]
    expect(input).not.toHaveProperty('threadId')
    expect(chat.streaming).toBe(true)
    expect(chat.messages).toHaveLength(2)
    expect(chat.messages[0]).toMatchObject({ role: 'user', content: '你好' })
    expect(chat.messages[1]).toMatchObject({ role: 'assistant', content: '' })
  })

  it('事件流：node/subtask progress 入进度块，answer 整段填入，done 收尾', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onEvent?.({ event_type: 'run.start', agent_role: 'system', payload: { run_id: 'r-1', thread_id: 't-1', mode: 'supervisor' } })
    captured.onEvent?.({ event_type: 'node.progress', agent_role: 'intent', payload: { summary: '意图识别完成' } })
    captured.onEvent?.({ event_type: 'subtask.progress', agent_role: 'rag_subtask', payload: { summary: '检索完成' } })
    captured.onEvent?.({ event_type: 'answer', agent_role: 'aggregator', payload: { content: '整段终答' } })

    const assistant = chat.messages[1]
    // 进度事件各成一块（不做 chat thinking 式增量聚合）
    expect(assistant.thinking).toEqual([
      { role: 'intent', content: '意图识别完成' },
      { role: 'rag_subtask', content: '检索完成' },
    ])
    expect(assistant.content).toBe('整段终答')
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

  it('进度帧按 api 真实 payload 键形渲染（route/subtasks/subtask_result/answer_preview）', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    // 与 api sse_stream._summarize_payload 产出对齐的帧形
    captured.onEvent?.({
      event_type: 'node.progress',
      agent_role: 'supervisor',
      payload: { route: 'rag', subtasks: [{ id: 't1', query: 'Kimi Code aborted' }] },
    })
    captured.onEvent?.({
      event_type: 'subtask.progress',
      agent_role: 'rag_subtask',
      payload: { subtask_result: { id: 't1', hits: 3 }, answer_preview: '根据检索…' },
    })
    // 空摘要帧（无已知键 → 兜底键名；完全空 → 丢弃）
    captured.onEvent?.({ event_type: 'node.progress', agent_role: 'critic', payload: { foo: 1 } })
    captured.onEvent?.({ event_type: 'node.progress', agent_role: 'x', payload: {} })

    const blocks = chat.messages[1].thinking
    expect(blocks[0].role).toBe('supervisor')
    expect(blocks[0].content).toContain('route: rag')
    expect(blocks[0].content).toContain('subtasks:')
    expect(blocks[1].role).toBe('rag_subtask')
    expect(blocks[1].content).toContain('subtask_result:')
    expect(blocks[1].content).toContain('answer_preview: 根据检索…')
    expect(blocks[2]).toEqual({ role: 'critic', content: 'foo' })
    expect(blocks).toHaveLength(3) // 空 payload 帧被丢弃
  })

  it('answer 整段语义：重复 answer 帧取最新（非增量拼接）', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onEvent?.({ event_type: 'answer', agent_role: 'aggregator', payload: { content: '第一版' } })
    captured.onEvent?.({ event_type: 'answer', agent_role: 'aggregator', payload: { content: '整段终答' } })

    expect(chat.messages[1].content).toBe('整段终答')
  })

  it('error 事件：停止 streaming 并记录 stage/message/retryable', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onEvent?.({
      event_type: 'error',
      agent_role: 'system',
      payload: { stage: 'supervisor', message: 'model unavailable', retryable: false },
    })

    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'supervisor', message: 'model unavailable', retryable: false })
  })

  it('传输层错误：network 错误 retryable=true', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onError?.({ kind: 'network', status: null, message: 'Failed to fetch' })

    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'network', message: 'Failed to fetch', retryable: true })
  })

  it('client 超时：stage=timeout 且 retryable', () => {
    const chat = useChatStore()
    chat.sendMessage('你好')

    captured.onError?.({ kind: 'timeout', status: null, message: '响应超时（>300s），请稍后重试' })

    expect(chat.streaming).toBe(false)
    expect(chat.error).toEqual({ stage: 'timeout', message: '响应超时（>300s），请稍后重试', retryable: true })
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

  it('422 预检：query 超 8000 字不发请求，写入 validation 错误', () => {
    const chat = useChatStore()
    chat.sendMessage('x'.repeat(8001))

    expect(streamLgRag).not.toHaveBeenCalled()
    expect(chat.streaming).toBe(false)
    expect(chat.error).toMatchObject({ stage: 'validation', retryable: false })
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
    expect(streamLgRag).toHaveBeenCalledTimes(1)

    chat.sendMessage('第二条（应被忽略）')
    expect(streamLgRag).toHaveBeenCalledTimes(1)
    expect(chat.messages).toHaveLength(2)

    // 无 session
    setActivePinia(createPinia())
    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    const empty = useChatStore()
    empty.sendMessage('没有 session')
    expect(empty.messages).toHaveLength(0)
  })
})
