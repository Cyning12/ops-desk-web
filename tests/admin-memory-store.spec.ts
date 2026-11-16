import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/adminMemory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/api/adminMemory')>()
  return {
    ...actual,
    fetchMemoryFacts: vi.fn(),
    fetchMemoryEpisodes: vi.fn(),
    revokeMemoryFact: vi.fn(),
  }
})

import { fetchMemoryEpisodes, fetchMemoryFacts, revokeMemoryFact } from '../src/api/adminMemory'
import { useAdminMemoryStore } from '../src/stores/adminMemory'

const FACT = {
  id: 'fact-1',
  tenant_id: 'tenant-a',
  user_id: 'u-1',
  key: 'k',
  value: 'v',
  kind: 'fact',
  source_run_id: null,
  source_turn: 1,
  status: 'active',
  expires_at: null,
  created_at: '2026-11-16T10:00:00Z',
  updated_at: '2026-11-16T10:00:00Z',
}

const EPISODE = {
  id: 'ep-1',
  tenant_id: 'tenant-a',
  run_id: 'run-9',
  task_domain: 'deploy',
  context_fingerprint: 'fp',
  plan_summary: 'p',
  tool_sequence: ['a'],
  outcome: 'success',
  failure_class: null,
  status: 'active',
  created_at: '2026-11-16T10:00:00Z',
}

/**
 * P3-T9 admin memory store 测试（task_web_p3_t9_admin_memory）：
 * 加载/错误态照登（403 不炸页不抛）· keyset cursor 栈翻页 · 过滤重置 ·
 * tenant_id 空前端闸（零请求）· revoke 幂等成功重拉当前页 · episodes 同形态。
 */
describe('stores/adminMemory · facts 加载与错误态', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('applyFactsFilters：写入 facts/nextCursor · loading 复位 · 请求参数对齐过滤', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: 'cur-2' })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    store.factsUserId = ' u-1 '
    store.factsStatus = 'revoked'
    store.factsKind = 'preference'
    store.factsLimit = 200

    await store.applyFactsFilters()

    expect(fetchMemoryFacts).toHaveBeenCalledTimes(1)
    expect(vi.mocked(fetchMemoryFacts).mock.calls[0][0]).toEqual({
      tenantId: 'tenant-a',
      userId: 'u-1',
      status: 'revoked',
      kind: 'preference',
      limit: 200,
      cursor: null,
    })
    expect(store.facts).toEqual([FACT])
    expect(store.factsNextCursor).toBe('cur-2')
    expect(store.factsLoading).toBe(false)
    expect(store.factsError).toBeNull()
    expect(store.factsIsEmpty).toBe(false)
    expect(store.factsCanNext).toBe(true)
    expect(store.factsCanPrev).toBe(false)
    expect(store.factsPageIndex).toBe(1)
  })

  it('tenant_id 空（含纯空白）：前端必填闸 · 零请求', async () => {
    const store = useAdminMemoryStore()
    store.factsTenantId = '   '

    await store.applyFactsFilters()

    expect(fetchMemoryFacts).not.toHaveBeenCalled()
    expect(store.facts).toEqual([])
    expect(store.factsError).toBeNull()
  })

  it('403（Maintainer role required）：error 态照登 · 列表清空 · 不抛异常', async () => {
    const apiError: ApiError = { status: 403, message: 'Maintainer role required', raw: null }
    vi.mocked(fetchMemoryFacts).mockRejectedValue(apiError)
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'

    await store.applyFactsFilters()

    expect(store.factsError).toEqual(apiError)
    expect(store.facts).toEqual([])
    expect(store.factsNextCursor).toBeNull()
    expect(store.factsLoading).toBe(false)
  })
})

describe('stores/adminMemory · facts keyset 翻页（cursor 栈 · 无总数）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('下一页推入 next_cursor · 上一页弹栈重拉 · 首页禁用上一页', async () => {
    vi.mocked(fetchMemoryFacts)
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: 'cur-2' })
      .mockResolvedValueOnce({ facts: [{ ...FACT, id: 'fact-2' }], nextCursor: null })
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: 'cur-2' })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()

    await store.nextFactsPage()
    expect(vi.mocked(fetchMemoryFacts).mock.calls[1][0].cursor).toBe('cur-2')
    expect(store.factsPageIndex).toBe(2)
    expect(store.factsCanPrev).toBe(true)
    expect(store.factsCanNext).toBe(false)
    expect(store.facts[0].id).toBe('fact-2')

    await store.prevFactsPage()
    expect(vi.mocked(fetchMemoryFacts).mock.calls[2][0].cursor).toBeNull()
    expect(store.factsPageIndex).toBe(1)
    expect(store.factsCanPrev).toBe(false)
    expect(store.facts[0].id).toBe('fact-1')
  })

  it('next_cursor=null 时 nextFactsPage 为 no-op；首页 prevFactsPage 为 no-op', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()

    await store.nextFactsPage()
    await store.prevFactsPage()

    expect(fetchMemoryFacts).toHaveBeenCalledTimes(1)
    expect(store.factsPageIndex).toBe(1)
  })

  it('过滤变更重置 cursor 栈回首页', async () => {
    vi.mocked(fetchMemoryFacts)
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: 'cur-2' })
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: null })
      .mockResolvedValueOnce({ facts: [], nextCursor: null })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()
    await store.nextFactsPage()
    expect(store.factsPageIndex).toBe(2)

    store.factsStatus = 'active'
    await store.applyFactsFilters()

    expect(store.factsPageIndex).toBe(1)
    expect(vi.mocked(fetchMemoryFacts).mock.calls[2][0].cursor).toBeNull()
  })
})

describe('stores/adminMemory · revoke（幂等 · 成功重拉当前页）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('revokeFact：body 带行级 tenant_id/user_id · 成功后重拉当前页 · 返回 affected', async () => {
    vi.mocked(fetchMemoryFacts)
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: null })
      .mockResolvedValueOnce({ facts: [{ ...FACT, status: 'revoked' }], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockResolvedValue({ affected: 1 })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()

    const affected = await store.revokeFact(FACT)

    expect(affected).toBe(1)
    expect(revokeMemoryFact).toHaveBeenCalledTimes(1)
    expect(vi.mocked(revokeMemoryFact).mock.calls[0]).toEqual([
      'k',
      { tenantId: 'tenant-a', userId: 'u-1' },
    ])
    // 成功重拉当前页（cursor 栈不动 · 第二发为 reload）
    expect(fetchMemoryFacts).toHaveBeenCalledTimes(2)
    expect(store.facts[0].status).toBe('revoked')
  })

  it('affected=0 幂等正常态：同样重拉当前页不视为错误', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockResolvedValue({ affected: 0 })
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()

    const affected = await store.revokeFact(FACT)

    expect(affected).toBe(0)
    expect(fetchMemoryFacts).toHaveBeenCalledTimes(2)
    expect(store.factsError).toBeNull()
  })

  it('revoke 失败（403）：抛 ApiError 由视图层承接 · 不重拉', async () => {
    const apiError: ApiError = { status: 403, message: 'Maintainer role required', raw: null }
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockRejectedValue(apiError)
    const store = useAdminMemoryStore()
    store.factsTenantId = 'tenant-a'
    await store.applyFactsFilters()

    await expect(store.revokeFact(FACT)).rejects.toEqual(apiError)
    expect(fetchMemoryFacts).toHaveBeenCalledTimes(1)
  })
})

describe('stores/adminMemory · episodes 只读', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('applyEpisodesFilters：参数对齐 · 翻页栈同 facts 形态', async () => {
    vi.mocked(fetchMemoryEpisodes)
      .mockResolvedValueOnce({ episodes: [EPISODE], nextCursor: 'ecur-2' })
      .mockResolvedValueOnce({ episodes: [{ ...EPISODE, id: 'ep-2' }], nextCursor: null })
    const store = useAdminMemoryStore()
    store.episodesTenantId = 'tenant-a'
    store.episodesRunId = 'run-9'
    store.episodesStatus = 'active'
    store.episodesOutcome = 'failure'
    store.episodesLimit = 200

    await store.applyEpisodesFilters()

    expect(vi.mocked(fetchMemoryEpisodes).mock.calls[0][0]).toEqual({
      tenantId: 'tenant-a',
      runId: 'run-9',
      status: 'active',
      outcome: 'failure',
      limit: 200,
      cursor: null,
    })
    expect(store.episodes).toEqual([EPISODE])
    expect(store.episodesCanNext).toBe(true)

    await store.nextEpisodesPage()
    expect(vi.mocked(fetchMemoryEpisodes).mock.calls[1][0].cursor).toBe('ecur-2')
    expect(store.episodesPageIndex).toBe(2)
    expect(store.episodes[0].id).toBe('ep-2')
  })

  it('tenant_id 空：零请求；403：error 照登不抛', async () => {
    const apiError: ApiError = { status: 403, message: 'Maintainer role required', raw: null }
    const store = useAdminMemoryStore()
    store.episodesTenantId = ''
    await store.applyEpisodesFilters()
    expect(fetchMemoryEpisodes).not.toHaveBeenCalled()

    vi.mocked(fetchMemoryEpisodes).mockRejectedValue(apiError)
    store.episodesTenantId = 'tenant-a'
    await store.applyEpisodesFilters()
    expect(store.episodesError).toEqual(apiError)
    expect(store.episodes).toEqual([])
  })
})
