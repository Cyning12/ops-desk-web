import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ADMIN_MEMORY_EPISODES_PATH,
  ADMIN_MEMORY_FACTS_PATH,
  adminMemoryFactRevokePath,
  fetchMemoryEpisodes,
  fetchMemoryFacts,
  revokeMemoryFact,
} from '../src/api/adminMemory'
import { http } from '../src/api/http'

/**
 * P3-T9 admin memory client 契约测试（task_web_p3_t9_admin_memory · 15 §5 逐字）：
 * - 路径钉死（http baseURL=/api · 全形 /api/ops/admin/memory/**）；
 * - **{ok, data} 包裹壳解包**（admin 端点例外 · http.ts「无包装」惯例不适用）；
 * - facts 十二字段投影（无 embedding）· episodes 十一字段（无 updated_at）；
 * - tenant_id 必填 · user_id/run_id/status/kind/outcome 空值不出站 · limit 默认 50；
 * - revoke 幂等：200 affected=0/N 皆正常态；user_id 空不出站（上游显式空白 400）。
 */

const FACT_12 = {
  id: 'fact-1',
  tenant_id: 'tenant-a',
  user_id: 'u-1',
  key: 'preferred_language',
  value: 'zh-CN',
  kind: 'preference',
  source_run_id: 'run-9',
  source_turn: 3,
  status: 'active',
  expires_at: null,
  created_at: '2026-11-16T10:00:00Z',
  updated_at: '2026-11-16T10:00:00Z',
}

const EPISODE_11 = {
  id: 'ep-1',
  tenant_id: 'tenant-a',
  run_id: 'run-9',
  task_domain: 'deploy',
  context_fingerprint: 'fp-abc',
  plan_summary: '部署三步走',
  tool_sequence: ['search_docs', 'deploy_service'],
  outcome: 'success',
  failure_class: null,
  status: 'active',
  created_at: '2026-11-16T10:00:00Z',
}

describe('api/adminMemory · fetchMemoryFacts（{ok,data} 解包 · 十二字段投影）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/admin/memory/facts：路径钉死 · 参数序列化 · 解包取 data 键', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { facts: [FACT_12], next_cursor: 'cur-2' } },
    })

    const page = await fetchMemoryFacts({
      tenantId: 'tenant-a',
      userId: 'u-1',
      status: 'revoked',
      kind: 'preference',
      limit: 200,
      cursor: 'cur-1',
    })

    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe(ADMIN_MEMORY_FACTS_PATH)
    expect(get.mock.calls[0][0]).toBe('/ops/admin/memory/facts')
    expect(get.mock.calls[0][1]).toEqual({
      params: {
        tenant_id: 'tenant-a',
        user_id: 'u-1',
        status: 'revoked',
        kind: 'preference',
        limit: 200,
        cursor: 'cur-1',
      },
    })
    expect(page.facts).toEqual([FACT_12])
    expect(page.nextCursor).toBe('cur-2')
    // 十二字段投影逐键对齐（15 §5 · 无 embedding）
    expect(Object.keys(page.facts[0]).sort()).toEqual(
      [
        'id',
        'tenant_id',
        'user_id',
        'key',
        'value',
        'kind',
        'source_run_id',
        'source_turn',
        'status',
        'expires_at',
        'created_at',
        'updated_at',
      ].sort(),
    )
    expect(page.facts[0]).not.toHaveProperty('embedding')
  })

  it('可选参数空值不出站：仅 tenant_id + limit 默认 50', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { facts: [], next_cursor: null } },
    })

    const page = await fetchMemoryFacts({ tenantId: 'tenant-a' })

    expect(get.mock.calls[0][1]).toEqual({ params: { tenant_id: 'tenant-a', limit: 50 } })
    expect(page).toEqual({ facts: [], nextCursor: null })
  })

  it('包裹壳缺 data 键/字段缺键：兜底空页不臆造', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { ok: true } })
    const page = await fetchMemoryFacts({ tenantId: 'tenant-a' })
    expect(page).toEqual({ facts: [], nextCursor: null })
  })
})

describe('api/adminMemory · revokeMemoryFact（幂等 200 affected=0/N 正常态）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POST /facts/{key}/revoke：key encodeURIComponent · body {tenant_id, user_id} · 解包 affected', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: true, data: { affected: 2 } },
    })

    const resp = await revokeMemoryFact('key/with slash', { tenantId: 'tenant-a', userId: 'u-1' })

    expect(post).toHaveBeenCalledTimes(1)
    expect(post.mock.calls[0][0]).toBe(adminMemoryFactRevokePath('key/with slash'))
    expect(post.mock.calls[0][0]).toBe('/ops/admin/memory/facts/key%2Fwith%20slash/revoke')
    expect(post.mock.calls[0][1]).toEqual({ tenant_id: 'tenant-a', user_id: 'u-1' })
    expect(resp.affected).toBe(2)
  })

  it('user_id 空不出站（上游显式空白 400）· affected=0 正常态照登', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: true, data: { affected: 0 } },
    })

    const resp = await revokeMemoryFact('k', { tenantId: 'tenant-a' })

    expect(post.mock.calls[0][1]).toEqual({ tenant_id: 'tenant-a' })
    expect(resp.affected).toBe(0)
  })

  it('affected 缺键兜底 0（不臆造）', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data: {} } })
    const resp = await revokeMemoryFact('k', { tenantId: 'tenant-a' })
    expect(resp.affected).toBe(0)
  })
})

describe('api/adminMemory · fetchMemoryEpisodes（只读 · 十一字段）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/admin/memory/episodes：路径钉死 · 过滤参数序列化 · 解包', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { episodes: [EPISODE_11], next_cursor: null } },
    })

    const page = await fetchMemoryEpisodes({
      tenantId: 'tenant-a',
      runId: 'run-9',
      status: 'active',
      outcome: 'success',
      limit: 200,
    })

    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe(ADMIN_MEMORY_EPISODES_PATH)
    expect(get.mock.calls[0][0]).toBe('/ops/admin/memory/episodes')
    expect(get.mock.calls[0][1]).toEqual({
      params: {
        tenant_id: 'tenant-a',
        run_id: 'run-9',
        status: 'active',
        outcome: 'success',
        limit: 200,
      },
    })
    expect(page.episodes).toEqual([EPISODE_11])
    // 十一字段逐键对齐（无 updated_at）
    expect(Object.keys(page.episodes[0]).sort()).toEqual(
      [
        'id',
        'tenant_id',
        'run_id',
        'task_domain',
        'context_fingerprint',
        'plan_summary',
        'tool_sequence',
        'outcome',
        'failure_class',
        'status',
        'created_at',
      ].sort(),
    )
    expect(page.episodes[0]).not.toHaveProperty('updated_at')
  })

  it('可选参数空值不出站 · 缺 data 兜底空页', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({ data: { ok: true } })
    const page = await fetchMemoryEpisodes({ tenantId: 'tenant-a' })
    expect(get.mock.calls[0][1]).toEqual({ params: { tenant_id: 'tenant-a', limit: 50 } })
    expect(page).toEqual({ episodes: [], nextCursor: null })
  })
})
