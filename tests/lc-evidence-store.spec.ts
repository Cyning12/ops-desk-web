import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LcEvidenceResult } from '../src/api/lcEvidence'

vi.mock('../src/api/lcEvidence', async () => {
  const actual = await vi.importActual<typeof import('../src/api/lcEvidence')>('../src/api/lcEvidence')
  return {
    ...actual,
    invokeLcEvidence: vi.fn(),
  }
})

import { invokeLcEvidence } from '../src/api/lcEvidence'
import { useLcEvidenceStore } from '../src/stores/lcEvidence'

function successResult(overrides: Partial<LcEvidenceResult> = {}): LcEvidenceResult {
  return {
    query: '示例问法',
    evidence: [
      {
        id: 1,
        source_type: 'issue',
        source_id: '2720',
        chunk_index: 4,
        anchor: '2720#4',
        title: '示例标题',
        url: null,
        snippet: '证据片段必须存在',
        grade: { evidence_id: 1, relevance: 'exact', reason: '命中关键句' },
      },
    ],
    answer: '基于证据的回答',
    meta: {
      hit_count: 5,
      graded: true,
      grade_count: 5,
      kept_count: 1,
      gate_action: 'answer',
      best_relevance: 'exact',
    },
    ...overrides,
  }
}

describe('stores/lcEvidence', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('success：写入 result，error 为空，loading 开合', async () => {
    const data = successResult()
    let resolveInvoke!: (value: LcEvidenceResult) => void
    vi.mocked(invokeLcEvidence).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveInvoke = resolve
        }),
    )
    const store = useLcEvidenceStore()

    const pending = store.invoke('示例问法')
    expect(store.loading).toBe(true)
    expect(store.error).toBeNull()

    resolveInvoke(data)
    await pending

    expect(invokeLcEvidence).toHaveBeenCalledWith(
      '示例问法',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    )
    expect(store.result).toEqual(data)
    expect(store.result?.evidence[0].snippet).toBe('证据片段必须存在')
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
    expect(store.query).toBe('示例问法')
  })

  it('gate_action=refuse 仍是成功态，不是 error', async () => {
    const data = successResult({
      evidence: [],
      answer: '没有足够证据作答。',
      meta: {
        hit_count: 3,
        graded: true,
        grade_count: 3,
        kept_count: 0,
        gate_action: 'refuse',
        best_relevance: 'none',
      },
    })
    vi.mocked(invokeLcEvidence).mockResolvedValue(data)
    const store = useLcEvidenceStore()

    await store.invoke('无关问题')

    expect(store.result?.meta.gate_action).toBe('refuse')
    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('error：写入 error，result 清空，loading 复位', async () => {
    const apiError: ApiError = { status: 500, message: '服务器错误', raw: null }
    vi.mocked(invokeLcEvidence).mockRejectedValue(apiError)
    const store = useLcEvidenceStore()

    await store.invoke('示例问法')

    expect(store.error).toEqual(apiError)
    expect(store.result).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('abort：取消进行中的请求，不写入 error', async () => {
    vi.mocked(invokeLcEvidence).mockImplementation((_query, options) => {
      return new Promise((_resolve, reject) => {
        options?.signal?.addEventListener('abort', () => {
          reject({ status: null, message: 'canceled', raw: null })
        })
      })
    })
    const store = useLcEvidenceStore()

    const pending = store.invoke('长查询')
    expect(store.loading).toBe(true)
    store.abort()
    await pending

    expect(store.error).toBeNull()
    expect(store.loading).toBe(false)
  })
})
