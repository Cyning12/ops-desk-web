import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/pulls', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/api/pulls')>()
  return { ...original, fetchPulls: vi.fn() }
})

import { fetchPulls } from '../src/api/pulls'
import type { PullsListResponse } from '../src/api/pulls'
import { usePullsStore } from '../src/stores/pulls'

function emptyPage(page = 1, pageSize = 20): PullsListResponse {
  return { items: [], total: 0, page, page_size: pageSize }
}

/** 响应回显请求的分页参数（store 以服务端 page/page_size 为准） */
function mockEchoPage(): void {
  vi.mocked(fetchPulls).mockImplementation(async (params) =>
    emptyPage(params?.page ?? 1, params?.page_size ?? 20),
  )
}

describe('stores/pulls', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('初始加载：默认参数 page=1&page_size=20，不带筛选参数', async () => {
    vi.mocked(fetchPulls).mockResolvedValue(emptyPage())
    const pulls = usePullsStore()

    await pulls.load()

    expect(fetchPulls).toHaveBeenCalledTimes(1)
    expect(fetchPulls).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(pulls.items).toEqual([])
    expect(pulls.total).toBe(0)
    expect(pulls.error).toBeNull()
  })

  it('筛选变更：拼装筛选参数并将 page 重置为 1 重新请求', async () => {
    mockEchoPage()
    const pulls = usePullsStore()

    await pulls.load()
    await pulls.setPage(2)
    expect(fetchPulls).toHaveBeenLastCalledWith({ page: 2, page_size: 20 })

    await pulls.setFilter('state', 'open')
    expect(pulls.page).toBe(1)
    expect(fetchPulls).toHaveBeenLastCalledWith({ page: 1, page_size: 20, state: 'open' })

    await pulls.setFilter('ci_status', 'failure')
    expect(pulls.page).toBe(1)
    expect(fetchPulls).toHaveBeenLastCalledWith({
      page: 1,
      page_size: 20,
      state: 'open',
      ci_status: 'failure',
    })
  })

  it('筛选清空回 ""：参数被剔除，不发送给后端', async () => {
    vi.mocked(fetchPulls).mockResolvedValue(emptyPage())
    const pulls = usePullsStore()

    await pulls.setFilter('state', 'merged')
    await pulls.setFilter('state', '')

    expect(fetchPulls).toHaveBeenLastCalledWith({ page: 1, page_size: 20 })
  })

  it('分页变更：保留筛选，按新页码请求', async () => {
    mockEchoPage()
    const pulls = usePullsStore()

    await pulls.setFilter('state', 'closed')
    await pulls.setPage(3)

    expect(fetchPulls).toHaveBeenLastCalledWith({ page: 3, page_size: 20, state: 'closed' })
  })

  it('接口错误：写入 error，列表清空，retry 重新请求', async () => {
    vi.mocked(fetchPulls).mockRejectedValue({ status: 500, message: 'boom', raw: null })
    const pulls = usePullsStore()

    await pulls.load()
    expect(pulls.error?.message).toBe('boom')
    expect(pulls.items).toEqual([])

    vi.mocked(fetchPulls).mockResolvedValue(emptyPage())
    await pulls.retry()
    expect(pulls.error).toBeNull()
    expect(fetchPulls).toHaveBeenCalledTimes(2)
  })
})
