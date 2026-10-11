import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  ADMIN_CAPABILITY_CATALOG_PATH,
  CAPABILITY_MINE_PATH,
  fetchAdminCapabilityCatalog,
  fetchCapabilityMine,
} from '../src/api/capability'
import { http } from '../src/api/http'

/**
 * F5 capability client 契约测试（task_web_capability_catalog · W8）：
 * - mine：路径钉死 /ops/capability/mine（http baseURL=/api · 全形 /api/ops/capability/mine）；
 *   九键白名单投影逐键对齐上游 project_capability（排除 adapter/args_schema）；
 *   {items,count} 照登 + 缺键兜底。
 * - admin catalog：只取顶层两键 manifest_errors/manifest_error_details（其余键不消费）；
 *   键缺失照登为 null/[]（failure_paths：渲染空态 + invoke 记录，不臆造）。
 */

const NINE_KEY_ITEM = {
  id: 'deploy_service',
  kind: 'write',
  description: '部署服务到目标环境',
  when_to_use: '需要发布新版本时',
  tags: ['deploy', 'prod'],
  risk_level: 'high',
  side_effect: 'write',
  enabled: true,
  status: 'available',
}

describe('api/capability · fetchCapabilityMine（九键投影 · {items,count}）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/capability/mine：{items,count} 照登，九键逐键对齐（无 adapter/args_schema）', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { items: [NINE_KEY_ITEM], count: 1 },
    })

    const resp = await fetchCapabilityMine()

    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe(CAPABILITY_MINE_PATH)
    expect(get.mock.calls[0][0]).toBe('/ops/capability/mine')
    expect(resp.count).toBe(1)
    expect(resp.items).toHaveLength(1)
    // 九键白名单投影：逐键对齐上游 project_capability
    expect(Object.keys(resp.items[0]).sort()).toEqual(
      [
        'id',
        'kind',
        'description',
        'when_to_use',
        'tags',
        'risk_level',
        'side_effect',
        'enabled',
        'status',
      ].sort(),
    )
    // 契约排除面：adapter / args_schema 不出站（若后端多吐即 FP-1，前端不臆删渲染但类型不收）
    expect(resp.items[0]).not.toHaveProperty('adapter')
    expect(resp.items[0]).not.toHaveProperty('args_schema')
  })

  it('空集 200 如实：{items:[], count:0}', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { items: [], count: 0 } })
    const resp = await fetchCapabilityMine()
    expect(resp).toEqual({ items: [], count: 0 })
  })

  it('缺 count → 以 items 长度兜底；items 非数组 → 空列表不崩', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { items: [NINE_KEY_ITEM] } })
    const resp = await fetchCapabilityMine()
    expect(resp.count).toBe(1)

    vi.spyOn(http, 'get').mockResolvedValue({ data: {} })
    const empty = await fetchCapabilityMine()
    expect(empty).toEqual({ items: [], count: 0 })
  })
})

describe('api/capability · fetchAdminCapabilityCatalog（只取 summary 两键）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/admin/capability/catalog：只消费 manifest_errors/manifest_error_details', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: {
        // catalog 全形含大量其余键（filter/principal/visible_ids/items/summary...），本 client 不消费
        filter: { baseline: true },
        principal: { user_id: 'u-1' },
        visible_ids: ['a'],
        items: [{ id: 'a' }],
        manifest_errors: 2,
        manifest_error_details: [
          { path: '/m/bad_a.yaml', error: 'yaml parse error' },
          { path: '/m/bad_b.yaml', error: 'missing field kind' },
        ],
      },
    })

    const resp = await fetchAdminCapabilityCatalog()

    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe(ADMIN_CAPABILITY_CATALOG_PATH)
    expect(get.mock.calls[0][0]).toBe('/ops/admin/capability/catalog')
    expect(resp.manifest_errors).toBe(2)
    expect(resp.manifest_error_details).toEqual([
      { path: '/m/bad_a.yaml', error: 'yaml parse error' },
      { path: '/m/bad_b.yaml', error: 'missing field kind' },
    ])
    // 返回形只含两键（其余 catalog 键不透出）
    expect(Object.keys(resp).sort()).toEqual(['manifest_error_details', 'manifest_errors'].sort())
  })

  it('零故障：manifest_errors=0 · details=[]', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({
      data: { manifest_errors: 0, manifest_error_details: [] },
    })
    const resp = await fetchAdminCapabilityCatalog()
    expect(resp).toEqual({ manifest_errors: 0, manifest_error_details: [] })
  })

  it('summary 缺 manifest_errors 键 → null 照登（不臆造 · failure_paths 空态+记录）', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { items: [] } })
    const resp = await fetchAdminCapabilityCatalog()
    expect(resp.manifest_errors).toBeNull()
    expect(resp.manifest_error_details).toEqual([])
  })
})
