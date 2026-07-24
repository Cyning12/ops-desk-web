import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/issues', () => ({
  fetchIssues: vi.fn(),
}))

import { fetchIssues } from '../src/api/issues'
import { buildIssueParams, emptyIssueFilters, useIssuesStore } from '../src/stores/issues'

function emptyPage(page = 1, pageSize = 20) {
  return { items: [], total: 0, page, page_size: pageSize }
}

describe('stores/issues · buildIssueParams 参数拼装', () => {
  it('空筛选：仅带 page/page_size', () => {
    expect(buildIssueParams(emptyIssueFilters(), 1, 20)).toEqual({ page: 1, page_size: 20 })
  })

  it('筛选 + 分页组合：全部字段拼进参数', () => {
    const params = buildIssueParams(
      { state: 'open', label: 'bug', module: 'auth', scan_status: 'success' },
      3,
      50,
    )
    expect(params).toEqual({
      state: 'open',
      label: 'bug',
      module: 'auth',
      scan_status: 'success',
      page: 3,
      page_size: 50,
    })
  })

  it('空字符串筛选不拼进参数', () => {
    const params = buildIssueParams(
      { state: 'closed', label: '', module: '', scan_status: '' },
      2,
      10,
    )
    expect(params).toEqual({ state: 'closed', page: 2, page_size: 10 })
  })
})

describe('stores/issues · store 行为', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('load：默认请求 page=1/page_size=20 并写入列表与总数', async () => {
    const items = [
      {
        id: 'i-1',
        number: 42,
        title: '示例 Issue',
        state: 'open',
        labels: ['bug'],
        module_tag: 'auth',
        updated_at: '2026-07-20T08:00:00',
      },
    ]
    vi.mocked(fetchIssues).mockResolvedValue({ items, total: 1, page: 1, page_size: 20 })
    const issues = useIssuesStore()

    await issues.load()
    expect(fetchIssues).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    expect(issues.items).toEqual(items)
    expect(issues.total).toBe(1)
    expect(issues.loading).toBe(false)
    expect(issues.error).toBeNull()
  })

  it('applyFilters：应用筛选并将 page 重置为 1', async () => {
    vi.mocked(fetchIssues).mockResolvedValue(emptyPage())
    const issues = useIssuesStore()

    // 先切到第 3 页
    await issues.setPage(3)
    expect(fetchIssues).toHaveBeenLastCalledWith({ page: 3, page_size: 20 })

    await issues.applyFilters({ state: 'open', label: 'bug' })
    expect(issues.page).toBe(1)
    expect(fetchIssues).toHaveBeenLastCalledWith({
      state: 'open',
      label: 'bug',
      page: 1,
      page_size: 20,
    })
  })

  it('setPage：分页切换带正确 page/page_size', async () => {
    vi.mocked(fetchIssues).mockResolvedValue(emptyPage(5, 20))
    const issues = useIssuesStore()

    await issues.setPage(5)
    expect(fetchIssues).toHaveBeenLastCalledWith({ page: 5, page_size: 20 })
    // 以服务端响应回写分页状态
    expect(issues.page).toBe(5)
    expect(issues.pageSize).toBe(20)
  })

  it('setPageSize：page 重置为 1 并带新 page_size', async () => {
    vi.mocked(fetchIssues).mockResolvedValue(emptyPage(1, 50))
    const issues = useIssuesStore()

    await issues.setPage(3)
    await issues.setPageSize(50)
    expect(fetchIssues).toHaveBeenLastCalledWith({ page: 1, page_size: 50 })
    expect(issues.page).toBe(1)
    expect(issues.pageSize).toBe(50)
  })

  it('筛选保留跨分页：setPage 仍携带已应用筛选', async () => {
    vi.mocked(fetchIssues).mockResolvedValue(emptyPage())
    const issues = useIssuesStore()

    await issues.applyFilters({ module: 'worker', scan_status: 'failed' })
    await issues.setPage(2)
    expect(fetchIssues).toHaveBeenLastCalledWith({
      module: 'worker',
      scan_status: 'failed',
      page: 2,
      page_size: 20,
    })
  })

  it('resetFilters：清空筛选并回到第 1 页', async () => {
    vi.mocked(fetchIssues).mockResolvedValue(emptyPage())
    const issues = useIssuesStore()

    await issues.applyFilters({ state: 'closed', label: 'p0' })
    await issues.resetFilters()
    expect(fetchIssues).toHaveBeenLastCalledWith({ page: 1, page_size: 20 })
    expect(issues.filters).toEqual(emptyIssueFilters())
  })

  it('接口错误：写入 error，不抛异常，loading 复位', async () => {
    const apiError: ApiError = { status: 500, message: '服务器错误', raw: null }
    vi.mocked(fetchIssues).mockRejectedValue(apiError)
    const issues = useIssuesStore()

    await issues.load()
    expect(issues.error).toEqual(apiError)
    expect(issues.loading).toBe(false)
  })
})
