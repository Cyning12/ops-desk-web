import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/auth', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}))

import { fetchMe, login as apiLogin, logout as apiLogout } from '../src/api/auth'
import { useAuthStore } from '../src/stores/auth'

const fakeUser = { id: 'u-1', username: 'admin', role: 'maintainer' }

function unauthorized(message = 'Invalid or expired session'): ApiError {
  return { status: 401, message, raw: null }
}

describe('stores/auth', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('ensureMe 成功：拉取 /me 并缓存，重复调用不再请求', async () => {
    vi.mocked(fetchMe).mockResolvedValue(fakeUser)
    const auth = useAuthStore()

    expect(await auth.ensureMe()).toEqual(fakeUser)
    expect(auth.user).toEqual(fakeUser)
    expect(auth.isLoggedIn).toBe(true)

    expect(await auth.ensureMe()).toEqual(fakeUser)
    expect(fetchMe).toHaveBeenCalledTimes(1)
  })

  it('ensureMe 401：user=null，不抛异常，且结论被缓存', async () => {
    vi.mocked(fetchMe).mockRejectedValue(unauthorized())
    const auth = useAuthStore()

    await expect(auth.ensureMe()).resolves.toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)

    await expect(auth.ensureMe()).resolves.toBeNull()
    expect(fetchMe).toHaveBeenCalledTimes(1)
  })

  it('ensureMe 网络错误：user=null，但不缓存，下次重试', async () => {
    vi.mocked(fetchMe)
      .mockRejectedValueOnce({ status: null, message: 'Network Error', raw: null } as ApiError)
      .mockResolvedValueOnce(fakeUser)
    const auth = useAuthStore()

    await expect(auth.ensureMe()).resolves.toBeNull()
    expect(auth.ready).toBe(false)

    await expect(auth.ensureMe()).resolves.toEqual(fakeUser)
    expect(fetchMe).toHaveBeenCalledTimes(2)
  })

  it('ensureMe 并发调用共享同一请求', async () => {
    let resolveFetch!: (u: typeof fakeUser) => void
    vi.mocked(fetchMe).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const auth = useAuthStore()

    const p1 = auth.ensureMe()
    const p2 = auth.ensureMe()
    resolveFetch(fakeUser)
    await expect(p1).resolves.toEqual(fakeUser)
    await expect(p2).resolves.toEqual(fakeUser)
    expect(fetchMe).toHaveBeenCalledTimes(1)
  })

  it('login 成功后写入 user 并标记 ready', async () => {
    vi.mocked(apiLogin).mockResolvedValue(fakeUser)
    const auth = useAuthStore()

    await auth.login('admin', 'token-abc')
    expect(auth.user).toEqual(fakeUser)
    expect(auth.isLoggedIn).toBe(true)
    expect(apiLogin).toHaveBeenCalledWith('admin', 'token-abc')

    // login 后 ensureMe 命中缓存，不再请求 /me
    await auth.ensureMe()
    expect(fetchMe).not.toHaveBeenCalled()
  })

  it('logout 即使接口失败也会清空本地会话', async () => {
    vi.mocked(apiLogin).mockResolvedValue(fakeUser)
    vi.mocked(apiLogout).mockRejectedValue(unauthorized('session already gone'))
    const auth = useAuthStore()

    await auth.login('admin', 'token-abc')
    expect(auth.isLoggedIn).toBe(true)

    await auth.logout()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('clearSession 清空 user（供 401 拦截器调用）', async () => {
    vi.mocked(apiLogin).mockResolvedValue(fakeUser)
    const auth = useAuthStore()

    await auth.login('admin', 'token-abc')
    auth.clearSession()
    expect(auth.user).toBeNull()
    expect(auth.isLoggedIn).toBe(false)
  })

  it('clearSession / logout 同步清 lg-rag thread_id 本地持久化（T3 · R1-N1 防换账号串号）', async () => {
    window.localStorage.setItem('ops.lg-rag.thread-id', 't-x')
    const auth = useAuthStore()

    auth.clearSession()
    expect(window.localStorage.getItem('ops.lg-rag.thread-id')).toBeNull()

    window.localStorage.setItem('ops.lg-rag.thread-id', 't-y')
    vi.mocked(apiLogout).mockResolvedValue(undefined)
    await auth.logout()
    expect(window.localStorage.getItem('ops.lg-rag.thread-id')).toBeNull()
  })

  it('clearSession / logout 同步清 lg-rag active-run 续看游标（T4 · 换账号后 replay 必 404/401）', async () => {
    window.localStorage.setItem('ops.lg-rag.active-run', JSON.stringify({ run_id: 'r-x', last_seq: 3, thread_id: 't-x', updated_at: 'x' }))
    const auth = useAuthStore()

    auth.clearSession()
    expect(window.localStorage.getItem('ops.lg-rag.active-run')).toBeNull()

    window.localStorage.setItem('ops.lg-rag.active-run', JSON.stringify({ run_id: 'r-y', last_seq: 1, thread_id: 't-y', updated_at: 'x' }))
    vi.mocked(apiLogout).mockResolvedValue(undefined)
    await auth.logout()
    expect(window.localStorage.getItem('ops.lg-rag.active-run')).toBeNull()
  })
})
