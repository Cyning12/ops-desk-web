import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/capability', () => ({
  fetchCapabilityMine: vi.fn(),
  fetchAdminCapabilityCatalog: vi.fn(),
}))

import { fetchAdminCapabilityCatalog, fetchCapabilityMine } from '../src/api/capability'
import { useAuthStore } from '../src/stores/auth'
import { useCapabilityStore } from '../src/stores/capability'

const MINE_ITEM = {
  id: 'deploy_service',
  kind: 'write',
  description: '部署服务',
  when_to_use: '发布时',
  tags: ['deploy'],
  risk_level: 'high',
  side_effect: 'write',
  enabled: true,
  status: 'available',
}

function setRole(role: string | null): void {
  const auth = useAuthStore()
  auth.user = role === null ? null : { id: 'u-1', username: 'u', role }
}

describe('stores/capability · 可见集加载', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('load：写入 items/count · loading 复位 · error 清空', async () => {
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: [MINE_ITEM], count: 1 })
    setRole('viewer')
    const store = useCapabilityStore()

    await store.load()

    expect(fetchCapabilityMine).toHaveBeenCalledTimes(1)
    expect(store.items).toEqual([MINE_ITEM])
    expect(store.count).toBe(1)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.isEmpty).toBe(false)
  })

  it('空集（items=[] · count=0）：isEmpty=true 不视为故障', async () => {
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: [], count: 0 })
    setRole('viewer')
    const store = useCapabilityStore()

    await store.load()

    expect(store.items).toEqual([])
    expect(store.count).toBe(0)
    expect(store.isEmpty).toBe(true)
    expect(store.error).toBeNull()
  })

  it('接口错误：写 error · 清空列表 · loading 复位 · 不抛异常', async () => {
    const apiError: ApiError = { status: 500, message: '服务器错误', raw: null }
    vi.mocked(fetchCapabilityMine).mockRejectedValue(apiError)
    setRole('viewer')
    const store = useCapabilityStore()

    await store.load()

    expect(store.error).toEqual(apiError)
    expect(store.items).toEqual([])
    expect(store.count).toBe(0)
    expect(store.loading).toBe(false)
  })
})

describe('stores/capability · maintainer 面 role 驱动（/auth/me role · 零探测面）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: [MINE_ITEM], count: 1 })
  })

  it('viewer：不请求 admin catalog · manifest 恒 null', async () => {
    setRole('viewer')
    const store = useCapabilityStore()

    await store.load()

    expect(fetchAdminCapabilityCatalog).not.toHaveBeenCalled()
    expect(store.manifest).toBeNull()
    expect(store.manifestError).toBeNull()
  })

  it('未解析到用户（user=null）：同样不请求 admin catalog', async () => {
    setRole(null)
    const store = useCapabilityStore()

    await store.load()

    expect(fetchAdminCapabilityCatalog).not.toHaveBeenCalled()
    expect(store.manifest).toBeNull()
  })

  it('maintainer：请求 admin catalog 并写入 summary 两键', async () => {
    vi.mocked(fetchAdminCapabilityCatalog).mockResolvedValue({
      manifest_errors: 1,
      manifest_error_details: [{ path: '/m/bad.yaml', error: 'boom' }],
    })
    setRole('maintainer')
    const store = useCapabilityStore()

    await store.load()

    expect(fetchAdminCapabilityCatalog).toHaveBeenCalledTimes(1)
    expect(store.manifest?.manifest_errors).toBe(1)
    expect(store.manifest?.manifest_error_details).toEqual([{ path: '/m/bad.yaml', error: 'boom' }])
    // 可见集不受影响
    expect(store.items).toEqual([MINE_ITEM])
  })

  it('maintainer admin 面失败：manifestError 落 · 可见集表数据保留', async () => {
    const apiError: ApiError = { status: 403, message: 'Maintainer role required', raw: null }
    vi.mocked(fetchAdminCapabilityCatalog).mockRejectedValue(apiError)
    setRole('maintainer')
    const store = useCapabilityStore()

    await store.load()

    expect(store.manifestError).toEqual(apiError)
    expect(store.manifest).toBeNull()
    expect(store.items).toEqual([MINE_ITEM])
    expect(store.error).toBeNull()
  })

  it('可见集失败时仍按 role 处理 maintainer 面（viewer 不请求）', async () => {
    vi.mocked(fetchCapabilityMine).mockRejectedValue({ status: 500, message: 'x', raw: null })
    setRole('viewer')
    const store = useCapabilityStore()

    await store.load()

    expect(store.error).not.toBeNull()
    expect(fetchAdminCapabilityCatalog).not.toHaveBeenCalled()
  })
})
