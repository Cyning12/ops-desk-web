import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LgRagResult } from '../src/api/lgRag'

vi.mock('../src/api/lgRag', async () => {
  const actual = await vi.importActual<typeof import('../src/api/lgRag')>('../src/api/lgRag')
  return {
    ...actual,
    invokeLgRag: vi.fn(),
  }
})

import { invokeLgRag } from '../src/api/lgRag'
import { useLgRagStore } from '../src/stores/lgRag'

function successResult(overrides: Partial<LgRagResult> = {}): LgRagResult {
  return {
    answer: '旁路回答',
    mode: 'router',
    thread_id: 'thr-1',
    route: 'rag',
    retry_count: 0,
    chain_meta: { gate_action: 'answer', hit_count: 5, kept_count: 2, best_relevance: 'exact', grade_count: 5 },
    subtasks: [],
    subtask_results: [],
    ...overrides,
  }
}

describe('stores/lgRag', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('success：写入 result，error 为空，loading 开合', async () => {
    const data = successResult()
    let resolveInvoke!: (value: LgRagResult) => void
    vi.mocked(invokeLgRag).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInvoke = resolve
        }),
    )
    const store = useLgRagStore()

    const pending = store.invoke('检索部署失败原因', 'router', '')
    expect(store.loading).toBe(true)
    expect(store.error).toBeNull()

    resolveInvoke(data)
    await pending

    expect(invokeLgRag).toHaveBeenCalledWith(
      { query: '检索部署失败原因', mode: 'router' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(store.result).toEqual(data)
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.query).toBe('检索部署失败原因')
    expect(store.mode).toBe('router')
    expect(store.elapsedSeconds).toBe(0)
  })

  it('route=refuse 仍是成功态，不是 error', async () => {
    const data = successResult({
      route: 'refuse',
      answer: '无可用证据，无法作答。',
      chain_meta: { gate_action: 'refuse', hit_count: 2, kept_count: 0, best_relevance: 'none', grade_count: 2 },
    })
    vi.mocked(invokeLgRag).mockResolvedValue(data)
    const store = useLgRagStore()

    await store.invoke('无关问题', 'router', '')

    expect(store.result?.route).toBe('refuse')
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('error：写入 error，result 清空，loading 复位', async () => {
    const apiError: ApiError = { status: 500, message: '旁路调用失败', raw: null }
    vi.mocked(invokeLgRag).mockRejectedValue(apiError)
    const store = useLgRagStore()

    await store.invoke('示例问法', 'basic', '')

    expect(store.error).toEqual(apiError)
    expect(store.result).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('abort：取消进行中的请求，不写入 error', async () => {
    vi.mocked(invokeLgRag).mockImplementation((_req, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject({ status: null, message: 'canceled', raw: null })
        })
      })
    })
    const store = useLgRagStore()

    const pending = store.invoke('长查询', 'supervisor', '')
    expect(store.loading).toBe(true)
    store.abort()
    await pending

    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('thread_id 回填：useThreadId 把响应 id 写回输入框，续写请求带同 thread_id', async () => {
    vi.mocked(invokeLgRag).mockResolvedValue(successResult({ thread_id: 'thr-42' }))
    const store = useLgRagStore()

    await store.invoke('首问', 'router', '')
    expect(store.result?.thread_id).toBe('thr-42')
    expect(store.threadId).toBe('')

    store.useThreadId()
    expect(store.threadId).toBe('thr-42')

    await store.invoke('那第二条建议呢', 'router', store.threadId)

    expect(invokeLgRag).toHaveBeenLastCalledWith(
      { query: '那第二条建议呢', mode: 'router', thread_id: 'thr-42' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
  })
})
