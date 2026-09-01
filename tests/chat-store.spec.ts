import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { replayLgRag, streamLgRag } from '../src/composables/useLgRagSse'
import { useAuthStore } from '../src/stores/auth'
import {
  LG_RAG_ACTIVE_RUN_STORAGE_KEY,
  LG_RAG_THREAD_ID_STORAGE_KEY,
  useChatStore,
} from '../src/stores/chat'

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let captured: LgRagSseCallbacks
let abortMock: ReturnType<typeof vi.fn>
let replayCaptured: LgRagSseCallbacks
let replayAbortMock: ReturnType<typeof vi.fn>

describe('stores/chat（T2 · lg-rag SSE）', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()

    abortMock = vi.fn(() => captured.onAborted?.())
    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: abortMock, done: Promise.resolve() }
    })
    replayAbortMock = vi.fn(() => replayCaptured.onAborted?.())
    vi.mocked(replayLgRag).mockImplementation((_input, callbacks) => {
      replayCaptured = callbacks ?? {}
      return { abort: replayAbortMock, done: Promise.resolve() }
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

  describe('T3 · thread_id 会话连续性', () => {
    /** 预置 localStorage 后重建 store，模拟刷新/重进 */
    async function createRestoredChat(id: string) {
      window.localStorage.setItem(LG_RAG_THREAD_ID_STORAGE_KEY, id)
      setActivePinia(createPinia())
      vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
      const chat = useChatStore()
      await chat.loadLatestSession()
      return chat
    }

    it('run.start 捕获 thread_id 并写入 localStorage；同会话续问带同一 id；续帧回显幂等', () => {
      const chat = useChatStore()
      chat.sendMessage('第一问')

      captured.onEvent?.({
        event_type: 'run.start',
        agent_role: 'system',
        payload: { run_id: 'r-1', thread_id: 't-abc' },
      })
      expect(chat.threadId).toBe('t-abc')
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBe('t-abc')

      captured.onEvent?.({ event_type: 'done', payload: { latency_ms: 1, model: 'm' } })
      chat.sendMessage('第二问')
      expect(vi.mocked(streamLgRag).mock.calls[1][0]).toEqual({
        query: '第二问',
        mode: 'supervisor',
        threadId: 't-abc',
      })

      // 续问轮 run.start 回显同 id：幂等覆盖写，localStorage 值不变（R1-N2）
      captured.onEvent?.({
        event_type: 'run.start',
        agent_role: 'system',
        payload: { run_id: 'r-2', thread_id: 't-abc' },
      })
      expect(chat.threadId).toBe('t-abc')
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBe('t-abc')
    })

    it('run.start 缺 thread_id：记 warn，本轮无续写，不阻断展示', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const chat = useChatStore()
      chat.sendMessage('你好')

      captured.onEvent?.({ event_type: 'run.start', agent_role: 'system', payload: { run_id: 'r-1' } })
      captured.onEvent?.({ event_type: 'answer', payload: { content: '仍正常展示' } })

      expect(warn).toHaveBeenCalledOnce()
      expect(chat.threadId).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(chat.messages[1].content).toBe('仍正常展示')
      warn.mockRestore()
    })

    it('刷新/重进：已存 id 恢复 + 提示条；发送带该 id；不回显历史消息', async () => {
      const chat = await createRestoredChat('t-stored')

      expect(chat.threadId).toBe('t-stored')
      expect(chat.restoredNotice).toBe(true)
      expect(chat.messages).toHaveLength(0)

      chat.sendMessage('恢复后第一问')
      expect(vi.mocked(streamLgRag).mock.calls[0][0]).toEqual({
        query: '恢复后第一问',
        mode: 'supervisor',
        threadId: 't-stored',
      })

      chat.dismissRestoredNotice()
      expect(chat.restoredNotice).toBe(false)
    })

    it('startNewSession：清 id + 清消息 + 清提示 + 清 localStorage；下轮 body 无 thread_id', async () => {
      const chat = await createRestoredChat('t-stored')
      chat.sendMessage('旧会话消息')
      captured.onEvent?.({ event_type: 'done', payload: { latency_ms: 1, model: 'm' } })
      expect(chat.messages).toHaveLength(2)

      chat.startNewSession()

      expect(chat.threadId).toBeNull()
      expect(chat.restoredNotice).toBe(false)
      expect(chat.messages).toHaveLength(0)
      expect(chat.error).toBeNull()
      expect(chat.lastDone).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()

      chat.sendMessage('新会话第一问')
      const input = vi.mocked(streamLgRag).mock.calls[1][0]
      expect(input).not.toHaveProperty('threadId')
    })

    it('startNewSession：streaming 中先 abort 再清（R1-N4）', async () => {
      const chat = await createRestoredChat('t-stored')
      chat.sendMessage('进行中')
      expect(chat.streaming).toBe(true)

      chat.startNewSession()

      expect(abortMock).toHaveBeenCalledTimes(1)
      expect(chat.streaming).toBe(false)
      expect(chat.interrupted).toBe(false)
      expect(chat.threadId).toBeNull()
    })

    it('已存 id 遇 404：清本地 id + 用户可见提示，不自动重发', async () => {
      const chat = await createRestoredChat('t-stored')
      chat.sendMessage('续问')

      captured.onError?.({ kind: 'http', status: 404, message: 'thread not found' })

      expect(chat.threadId).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(chat.streaming).toBe(false)
      expect(chat.error).toEqual({ stage: 'session', message: '会话已失效，请重新发送', retryable: true })
      expect(streamLgRag).toHaveBeenCalledTimes(1) // 不自动重发
    })

    it('已存 id 遇 422：清本地 id + 校验提示，不自动重发', async () => {
      const chat = await createRestoredChat('t-stored')
      chat.sendMessage('续问')

      captured.onError?.({ kind: 'http', status: 422, message: 'thread_id too long' })

      expect(chat.threadId).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(chat.error?.stage).toBe('session')
      expect(chat.error?.message).toContain('会话校验未通过')
      expect(streamLgRag).toHaveBeenCalledTimes(1)
    })

    it('未带 thread_id 的请求遇 404/422：按通用传输错误处理，不动本地 id', () => {
      const chat = useChatStore()
      chat.sendMessage('首轮')

      captured.onError?.({ kind: 'http', status: 422, message: 'query invalid' })

      expect(chat.error).toEqual({ stage: 'http', message: 'query invalid', retryable: true })
      expect(chat.threadId).toBeNull()
    })

    it('401：清本地 id + 清 auth 会话（沿用 T2 跳登录）', async () => {
      const chat = await createRestoredChat('t-stored')
      const auth = useAuthStore()
      auth.user = { id: 'u-1', username: 'admin', role: 'maintainer' }
      auth.ready = true
      chat.sendMessage('续问')

      captured.onError?.({ kind: 'http', status: 401, message: 'Invalid or expired session' })

      expect(chat.threadId).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(auth.isLoggedIn).toBe(false)
      expect(chat.error).toEqual({ stage: 'auth', message: '登录已过期，请重新登录', retryable: false })
    })

    it('localStorage 不可用：内存态降级，不 crash；刷新即新会话', () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('denied')
      })
      const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('denied')
      })

      setActivePinia(createPinia())
      const chat = useChatStore()
      expect(chat.threadId).toBeNull() // 读降级为 null
      expect(chat.restoredNotice).toBe(false)

      chat.session = fakeSession
      chat.sendMessage('你好')
      captured.onEvent?.({ event_type: 'run.start', payload: { run_id: 'r-1', thread_id: 't-mem' } })
      expect(chat.threadId).toBe('t-mem') // 内存态仍生效

      getItem.mockRestore()
      setItem.mockRestore()
    })
  })

  describe('T4 · 断联 / replay 续看（cursor 捕获 · seq 去重）', () => {
    function readActiveRun(): { run_id: string; last_seq: number } | null {
      const raw = window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)
      return raw ? (JSON.parse(raw) as { run_id: string; last_seq: number }) : null
    }

    /** 断网 mid-stream 的标准前置：live 收到 run.start+progress+answer（seq 1..3）后网络错误 */
    function seedBrokenLive(chat: ReturnType<typeof useChatStore>, runId = 'r-1') {
      chat.sendMessage('你好')
      captured.onEvent?.({
        event_type: 'run.start', run_id: runId, seq: 1, cursor: runId + ':1',
        agent_role: 'system', payload: { run_id: runId, thread_id: 't-1' },
      })
      captured.onEvent?.({
        event_type: 'node.progress', run_id: runId, seq: 2, cursor: runId + ':2',
        agent_role: 'intent', payload: { summary: '意图识别完成' },
      })
      captured.onEvent?.({
        event_type: 'answer', run_id: runId, seq: 3, cursor: runId + ':3',
        agent_role: 'aggregator', payload: { content: '前半' },
      })
      captured.onError?.({ kind: 'network', status: null, message: 'Failed to fetch' })
    }

    it('live 帧 cursor/seq 捕获 → active-run 持久化；done 终态即清除', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')

      captured.onEvent?.({
        event_type: 'run.start', run_id: 'r-1', seq: 1, cursor: 'r-1:1',
        payload: { run_id: 'r-1', thread_id: 't-1' },
      })
      captured.onEvent?.({
        event_type: 'node.progress', run_id: 'r-1', seq: 2, cursor: 'r-1:2',
        agent_role: 'intent', payload: { summary: '意图识别完成' },
      })
      captured.onEvent?.({
        event_type: 'answer', run_id: 'r-1', seq: 3, cursor: 'r-1:3',
        payload: { content: '部分' },
      })

      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 3, thread_id: 't-1' })
      expect(readActiveRun()).toMatchObject({ run_id: 'r-1', last_seq: 3 })

      captured.onEvent?.({
        event_type: 'done', run_id: 'r-1', seq: 4, cursor: 'r-1:4',
        payload: { latency_ms: 1, model: 'm' },
      })
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
    })

    it('帧缺顶层 cursor：以 run_id+seq 合成；仅 cursor 帧：解析合成 run_id/seq', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')

      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-1', seq: 1, payload: { run_id: 'r-1', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 5, payload: { content: 'A' } })
      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 5 })

      // 仅 cursor 的帧（run_id/seq 缺失）：从 cursor 合成
      captured.onEvent?.({ event_type: 'answer', cursor: 'r-1:7', payload: { content: 'B' } })
      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 7 })
      expect(chat.messages[1].content).toBe('B')
    })

    it('error 事件 / 手动 abort 均为终态：清除 active-run（N6 停止后不可续看）', () => {
      const chat = useChatStore()
      chat.sendMessage('第一问')
      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-1', seq: 1, cursor: 'r-1:1', payload: { run_id: 'r-1', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 2, cursor: 'r-1:2', payload: { content: 'A' } })
      expect(readActiveRun()).not.toBeNull()

      captured.onEvent?.({ event_type: 'error', run_id: 'r-1', seq: 3, cursor: 'r-1:3', payload: { stage: 'supervisor', message: 'boom', retryable: false } })
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()

      chat.sendMessage('第二问')
      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-2', seq: 1, cursor: 'r-2:1', payload: { run_id: 'r-2', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-2', seq: 2, cursor: 'r-2:2', payload: { content: 'B' } })
      expect(readActiveRun()).toMatchObject({ run_id: 'r-2', last_seq: 2 })

      chat.stopStreaming()
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(chat.canResume).toBe(false)
    })

    it('断网 mid-stream：active-run 保留 + 错误条 + 续看 → replay body={run_id,after_seq:lastSeq}，帧渲染进新消息', () => {
      const chat = useChatStore()
      seedBrokenLive(chat)

      expect(chat.streaming).toBe(false)
      expect(chat.error?.stage).toBe('network')
      expect(chat.canResume).toBe(true)
      expect(readActiveRun()).toMatchObject({ run_id: 'r-1', last_seq: 3 })

      chat.resumeFromCursor()
      expect(replayLgRag).toHaveBeenCalledWith({ run_id: 'r-1', after_seq: 3 }, expect.any(Object))
      expect(chat.messages).toHaveLength(3) // 新 assistant 承接 replay 帧
      expect(chat.streaming).toBe(true)

      replayCaptured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 4, cursor: 'r-1:4', payload: { content: '整段终答' } })
      replayCaptured.onEvent?.({ event_type: 'done', run_id: 'r-1', seq: 5, cursor: 'r-1:5', payload: { latency_ms: 1, model: 'm' } })

      expect(chat.messages[2].content).toBe('整段终答')
      expect(chat.messages[1].content).toBe('前半') // 原消息不动
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(chat.streaming).toBe(false)
      expect(chat.resumeHint).toBeNull()
    })

    it('seq 去重：seq<=lastAppliedSeq 帧忽略（answer 不重复 · thinking 不重复）；跨 run 重置基线', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')

      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-1', seq: 1, cursor: 'r-1:1', payload: { run_id: 'r-1', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'node.progress', run_id: 'r-1', seq: 2, cursor: 'r-1:2', agent_role: 'intent', payload: { summary: 'P1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 3, cursor: 'r-1:3', payload: { content: 'A1' } })
      // 重复/回退帧（replay 与 live 已收帧重叠的防御场景）
      captured.onEvent?.({ event_type: 'node.progress', run_id: 'r-1', seq: 2, cursor: 'r-1:2', agent_role: 'intent', payload: { summary: 'P1-dup' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 3, cursor: 'r-1:3', payload: { content: 'A1-dup' } })
      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-1', seq: 1, cursor: 'r-1:1', payload: { run_id: 'r-1', thread_id: 't-1' } })

      const assistant = chat.messages[1]
      expect(assistant.thinking).toEqual([{ role: 'intent', content: 'P1' }])
      expect(assistant.content).toBe('A1')

      // 新 seq 仍正常应用
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 4, cursor: 'r-1:4', payload: { content: 'A2' } })
      expect(assistant.content).toBe('A2')

      // 跨 run：run_id 变化 → 去重基线重置
      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-2', seq: 1, cursor: 'r-2:1', payload: { run_id: 'r-2', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-2', seq: 2, cursor: 'r-2:2', payload: { content: 'B1' } })
      expect(assistant.content).toBe('B1')
    })

    it('live 401：清 thread_id + 清 active-run（R1-N3）+ 清 auth', () => {
      const auth = useAuthStore()
      auth.user = { id: 'u-1', username: 'admin', role: 'maintainer' }
      auth.ready = true
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.({ event_type: 'run.start', run_id: 'r-1', seq: 1, cursor: 'r-1:1', payload: { run_id: 'r-1', thread_id: 't-1' } })
      captured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 2, cursor: 'r-1:2', payload: { content: 'A' } })
      expect(readActiveRun()).not.toBeNull()

      captured.onError?.({ kind: 'http', status: 401, message: 'Invalid or expired session' })

      expect(chat.threadId).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(auth.isLoggedIn).toBe(false)
      expect(chat.error?.stage).toBe('auth')
    })

    it('replay 404/422：清 active-run + 用户可见提示，不自动重试', () => {
      const chat = useChatStore()
      seedBrokenLive(chat)
      chat.resumeFromCursor()
      replayCaptured.onError?.({ kind: 'http', status: 404, message: 'run not found' })

      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(chat.error?.stage).toBe('resume')
      expect(chat.error?.message).toContain('已无法续看')
      expect(chat.canResume).toBe(false)
      expect(replayLgRag).toHaveBeenCalledTimes(1) // 不自动重试

      // 422（非法游标防御）：同语义（新一轮 run 用新 run_id——run_id 由 api 生成唯一）
      seedBrokenLive(chat, 'r-2')
      chat.resumeFromCursor()
      expect(vi.mocked(replayLgRag).mock.calls[1][0]).toEqual({ run_id: 'r-2', after_seq: 3 })
      replayCaptured.onError?.({ kind: 'http', status: 422, message: 'invalid cursor' })
      expect(chat.activeRun).toBeNull()
      expect(chat.error?.stage).toBe('resume')
      expect(chat.error?.message).toContain('校验未通过')
      expect(replayLgRag).toHaveBeenCalledTimes(2)
    })

    it('replay 401：清 thread_id + 清 active-run + 清 auth 跳登录', () => {
      const auth = useAuthStore()
      auth.user = { id: 'u-1', username: 'admin', role: 'maintainer' }
      auth.ready = true
      const chat = useChatStore()
      seedBrokenLive(chat)
      chat.resumeFromCursor()

      replayCaptured.onError?.({ kind: 'http', status: 401, message: 'Invalid or expired session' })

      expect(chat.threadId).toBeNull()
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)).toBeNull()
      expect(auth.isLoggedIn).toBe(false)
      expect(chat.error).toEqual({ stage: 'auth', message: '登录已过期，请重新登录', retryable: false })
    })

    it('replay 网络错：保留 active-run 可再点续看；流再断 lastSeq 已推进可接力', () => {
      const chat = useChatStore()
      seedBrokenLive(chat)
      chat.resumeFromCursor()
      expect(vi.mocked(replayLgRag).mock.calls[0][0]).toEqual({ run_id: 'r-1', after_seq: 3 })

      // replay 中途推进到 seq 4 后再断
      replayCaptured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 4, cursor: 'r-1:4', payload: { content: 'A4' } })
      replayCaptured.onError?.({ kind: 'network', status: null, message: 'Failed to fetch' })

      expect(chat.streaming).toBe(false)
      expect(chat.error?.stage).toBe('network')
      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 4 })
      expect(chat.canResume).toBe(true)

      // 接力续看：after_seq 用推进后的新值
      chat.resumeFromCursor()
      expect(vi.mocked(replayLgRag).mock.calls[1][0]).toEqual({ run_id: 'r-1', after_seq: 4 })
    })

    it('replay 空流（0 帧 onDone）：保留 active-run + 「暂无新进度」提示（N4）；部分帧无终态 → 接力提示', () => {
      const chat = useChatStore()
      seedBrokenLive(chat)
      chat.resumeFromCursor()
      replayCaptured.onDone?.()

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 3 })
      expect(chat.resumeHint).toBe('暂无新进度，稍后再点「续看」')

      // 有部分新帧但未见终态：提示接力
      chat.resumeFromCursor()
      replayCaptured.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 4, cursor: 'r-1:4', payload: { content: 'A4' } })
      replayCaptured.onDone?.()
      expect(chat.activeRun).toMatchObject({ run_id: 'r-1', last_seq: 4 })
      expect(chat.resumeHint).toBe('回答仍在生成中，可稍后再次「续看」接力')
    })

    it('刷新/重进：有未完成 active-run → 「上次回答未完成·续看」条；续看渲染进新消息（N5）；终态后条不再出现', async () => {
      window.localStorage.setItem(
        LG_RAG_ACTIVE_RUN_STORAGE_KEY,
        JSON.stringify({ run_id: 'r-9', last_seq: 7, thread_id: 't-9', updated_at: '2026-08-31T00:00:00Z' }),
      )
      setActivePinia(createPinia())
      vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
      const chat = useChatStore()

      expect(chat.activeRun).toMatchObject({ run_id: 'r-9', last_seq: 7, thread_id: 't-9' })
      expect(chat.resumeNotice).toBe(true)
      expect(chat.restoredNotice).toBe(false) // thread-id 未存：无 T3 条
      expect(chat.messages).toHaveLength(0) // 历史不回显（T3 钉死）

      chat.resumeFromCursor()
      expect(replayLgRag).toHaveBeenCalledWith({ run_id: 'r-9', after_seq: 7 }, expect.any(Object))
      expect(chat.resumeNotice).toBe(false)
      expect(chat.messages).toHaveLength(1) // 新建 assistant 承接

      replayCaptured.onEvent?.({ event_type: 'answer', run_id: 'r-9', seq: 8, cursor: 'r-9:8', payload: { content: '补发终答' } })
      replayCaptured.onEvent?.({ event_type: 'done', run_id: 'r-9', seq: 9, cursor: 'r-9:9', payload: { latency_ms: 1, model: 'm' } })
      expect(chat.messages[0].content).toBe('补发终答')
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()

      // 终态后再刷新：条不再出现
      setActivePinia(createPinia())
      const fresh = useChatStore()
      expect(fresh.resumeNotice).toBe(false)
      expect(fresh.canResume).toBe(false)
    })

    it('刷新/重进：仅有 thread_id 无 active-run → 沿用 T3 恢复提示，无续看条', async () => {
      window.localStorage.setItem(LG_RAG_THREAD_ID_STORAGE_KEY, 't-stored')
      setActivePinia(createPinia())
      vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
      const chat = useChatStore()
      await chat.loadLatestSession()

      expect(chat.restoredNotice).toBe(true)
      expect(chat.resumeNotice).toBe(false)
      expect(chat.canResume).toBe(false)
    })

    it('startNewSession：清 active-run + 续看条（新会话显式放弃旧上下文）', async () => {
      window.localStorage.setItem(
        LG_RAG_ACTIVE_RUN_STORAGE_KEY,
        JSON.stringify({ run_id: 'r-9', last_seq: 7, thread_id: 't-9', updated_at: 'x' }),
      )
      setActivePinia(createPinia())
      vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
      const chat = useChatStore()
      await chat.loadLatestSession()
      expect(chat.resumeNotice).toBe(true)

      chat.startNewSession()
      expect(chat.activeRun).toBeNull()
      expect(readActiveRun()).toBeNull()
      expect(chat.resumeNotice).toBe(false)
    })
  })

  describe('T5 · answer delta 打字机（delta 追加 · final 替换）', () => {
    /** 构造带 run_id/seq/cursor 的帧（T4 管线参与去重与 active-run 推进） */
    function seqFrame(seq: number, eventType: string, payload: Record<string, unknown>, agentRole = 'aggregator') {
      return {
        event_type: eventType,
        run_id: 'r-1',
        seq,
        cursor: 'r-1:' + seq,
        agent_role: agentRole,
        payload,
      }
    }

    it('delta 帧按 seq 有序追加（中间态断言）；终帧 content+final 全量替换，拼接==终帧 content（非叠加）', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))

      captured.onEvent?.(seqFrame(2, 'answer', { delta: '你' }))
      expect(chat.messages[1].content).toBe('你')
      captured.onEvent?.(seqFrame(3, 'answer', { delta: '好' }))
      expect(chat.messages[1].content).toBe('你好')
      captured.onEvent?.(seqFrame(4, 'answer', { delta: '，世界' }))
      expect(chat.messages[1].content).toBe('你好，世界')

      // 终帧：全量替换（严禁 append 到 delta 拼接结果之后 —— §10.4 常见坑）
      captured.onEvent?.(seqFrame(5, 'answer', { content: '你好，世界', final: true }))
      expect(chat.messages[1].content).toBe('你好，世界')

      captured.onEvent?.(seqFrame(6, 'done', { latency_ms: 1, model: 'm' }, 'system'))
      expect(chat.streaming).toBe(false)
    })

    it('终帧 content 与 delta 拼接不一致：以终帧 content 为准（替换语义兜底，非拼接+content 叠加）', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'answer', { delta: 'AB' }))
      captured.onEvent?.(seqFrame(3, 'answer', { delta: 'CD' }))
      expect(chat.messages[1].content).toBe('ABCD')

      captured.onEvent?.(seqFrame(4, 'answer', { content: 'ABCD（修订终稿）', final: true }))
      expect(chat.messages[1].content).toBe('ABCD（修订终稿）')
    })

    it('两键同帧（防御空隙 R1-N1）：content 优先替换，忽略 delta 并记 warn', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'answer', { delta: '碎' }))
      captured.onEvent?.(seqFrame(3, 'answer', { content: '终稿', delta: '不该出现' }))

      expect(chat.messages[1].content).toBe('终稿')
      expect(warn).toHaveBeenCalledOnce()
      expect(warn.mock.calls[0][0]).toContain('content')
      warn.mockRestore()
    })

    it('done / error / abort 后停止追加：迟到 answer 帧（seq 递增、去过重）被忽略', () => {
      const chat = useChatStore()
      // done 后迟到 delta
      chat.sendMessage('第一问')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'answer', { delta: '完' }))
      captured.onEvent?.(seqFrame(3, 'done', { latency_ms: 1, model: 'm' }, 'system'))
      captured.onEvent?.(seqFrame(4, 'answer', { delta: '迟到' }))
      expect(chat.messages[1].content).toBe('完')

      // error 后迟到 content 帧
      chat.sendMessage('第二问')
      captured.onEvent?.({ ...seqFrame(1, 'run.start', { run_id: 'r-2', thread_id: 't-1' }, 'system'), run_id: 'r-2', cursor: 'r-2:1' })
      captured.onEvent?.({ ...seqFrame(2, 'answer', { delta: '半' }), run_id: 'r-2', cursor: 'r-2:2' })
      captured.onEvent?.({ ...seqFrame(3, 'error', { stage: 'supervisor', message: 'boom', retryable: false }, 'system'), run_id: 'r-2', cursor: 'r-2:3' })
      captured.onEvent?.({ ...seqFrame(4, 'answer', { content: '迟到整段' }), run_id: 'r-2', cursor: 'r-2:4' })
      expect(chat.messages[3].content).toBe('半')

      // abort 后迟到 delta
      chat.sendMessage('第三问')
      captured.onEvent?.({ ...seqFrame(1, 'run.start', { run_id: 'r-3', thread_id: 't-1' }, 'system'), run_id: 'r-3', cursor: 'r-3:1' })
      captured.onEvent?.({ ...seqFrame(2, 'answer', { delta: '停' }), run_id: 'r-3', cursor: 'r-3:2' })
      chat.stopStreaming()
      captured.onEvent?.({ ...seqFrame(3, 'answer', { delta: '迟到' }), run_id: 'r-3', cursor: 'r-3:3' })
      expect(chat.messages[5].content).toBe('停')
    })

    it('delta 与 node.progress / subtask.progress 并存：thinking 与 content 各归各位不串台', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'node.progress', { summary: '意图识别完成' }, 'intent'))
      captured.onEvent?.(seqFrame(3, 'answer', { delta: '根据' }))
      captured.onEvent?.(seqFrame(4, 'subtask.progress', { summary: '检索完成' }, 'rag_subtask'))
      captured.onEvent?.(seqFrame(5, 'answer', { delta: '检索结果' }))
      captured.onEvent?.(seqFrame(6, 'answer', { content: '根据检索结果', final: true }))

      const assistant = chat.messages[1]
      expect(assistant.thinking).toEqual([
        { role: 'intent', content: '意图识别完成' },
        { role: 'rag_subtask', content: '检索完成' },
      ])
      expect(assistant.content).toBe('根据检索结果')
    })

    it('降级整段（无 delta 帧 · provider 不支持流式）：仅整段 content 帧，T2 行为不变', () => {
      const chat = useChatStore()
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'answer', { content: '整段终答' }))
      expect(chat.messages[1].content).toBe('整段终答')
      // 占位帧（basic/router 无 aggregator · 契约保证无 delta 帧同 run 混出）：T2 现行为覆盖为空
      captured.onEvent?.(seqFrame(3, 'answer', { content: '', note: 'no_aggregator' }))
      expect(chat.messages[1].content).toBe('')
      captured.onEvent?.(seqFrame(4, 'done', { latency_ms: 1, model: 'm' }, 'system'))
      expect(chat.streaming).toBe(false)
    })

    it('replay 续看含 delta：复用 T4 管线，delta 序列拼接完整，终帧替换收口', () => {
      const chat = useChatStore()
      // live：收到两段 delta 后断网（active-run 保留在 seq 3）
      chat.sendMessage('你好')
      captured.onEvent?.(seqFrame(1, 'run.start', { run_id: 'r-1', thread_id: 't-1' }, 'system'))
      captured.onEvent?.(seqFrame(2, 'answer', { delta: '前半' }))
      captured.onEvent?.(seqFrame(3, 'answer', { delta: '段一' }))
      captured.onError?.({ kind: 'network', status: null, message: 'Failed to fetch' })
      expect(chat.messages[1].content).toBe('前半段一')
      expect(chat.canResume).toBe(true)

      chat.resumeFromCursor()
      expect(replayLgRag).toHaveBeenCalledWith({ run_id: 'r-1', after_seq: 3 }, expect.any(Object))

      // replay 补发剩余 delta + 终帧 + done（帧形状同 live）
      replayCaptured.onEvent?.(seqFrame(4, 'answer', { delta: '段二' }))
      expect(chat.messages[2].content).toBe('段二') // 新消息承接（T4 R1-N5）
      replayCaptured.onEvent?.(seqFrame(5, 'answer', { delta: '段三' }))
      expect(chat.messages[2].content).toBe('段二段三')
      replayCaptured.onEvent?.(seqFrame(6, 'answer', { content: '前半段一段二段三', final: true }))
      replayCaptured.onEvent?.(seqFrame(7, 'done', { latency_ms: 1, model: 'm' }, 'system'))

      expect(chat.messages[2].content).toBe('前半段一段二段三') // replay delta 序列完整收口
      expect(chat.messages[1].content).toBe('前半段一') // 原消息不动（视觉割裂边界 R1-N2：终帧到达即自愈）
      expect(chat.activeRun).toBeNull()
      expect(chat.streaming).toBe(false)
    })
  })
})
