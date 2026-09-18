import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
  switchTenant: vi.fn(),
}))

import { fetchMe } from '../src/api/auth'
import router from '../src/router'

const fakeUser = { id: 'u-1', username: 'admin', role: 'maintainer' }
const fakeMe = { user: fakeUser, tenantId: 'ops-desk-pilot' }

describe('router 认证守卫', () => {
  beforeEach(() => {
    // 每个用例使用全新 Pinia，auth store 缓存随之重置
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('未登录访问受保护路由 → 重定向 /login?redirect=<原路径>', async () => {
    vi.mocked(fetchMe).mockRejectedValue({
      status: 401,
      message: 'Invalid or expired session',
      raw: null,
    } as ApiError)

    await router.push('/issues')
    expect(router.currentRoute.value.path).toBe('/login')
    expect(router.currentRoute.value.query.redirect).toBe('/issues')
  })

  it('已登录访问受保护路由 → 正常放行', async () => {
    vi.mocked(fetchMe).mockResolvedValue(fakeMe)

    await router.push('/issues')
    expect(router.currentRoute.value.path).toBe('/issues')
  })

  it('已登录访问 /login → 重定向 /overview', async () => {
    vi.mocked(fetchMe).mockResolvedValue(fakeMe)

    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/overview')
  })

  it('未登录访问 /login → 放行停留在登录页', async () => {
    vi.mocked(fetchMe).mockRejectedValue({
      status: 401,
      message: 'Invalid or expired session',
      raw: null,
    } as ApiError)

    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('首次导航等待 ensureMe 完成后才放行（/me 慢响应不提前渲染）', async () => {
    let resolveFetch!: (u: typeof fakeMe) => void
    vi.mocked(fetchMe).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    const navigation = router.push('/overview')
    // fetchMe 未返回前导航不应完成
    let settled = false
    void navigation.then(() => {
      settled = true
    })
    await vi.waitFor(() => {
      expect(fetchMe).toHaveBeenCalled()
    })
    expect(settled).toBe(false)

    resolveFetch(fakeMe)
    await navigation
    expect(router.currentRoute.value.path).toBe('/overview')
  })
})
