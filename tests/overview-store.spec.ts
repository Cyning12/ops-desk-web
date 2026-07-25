import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { Overview } from '../src/api/overview'

vi.mock('../src/api/overview', () => ({
  fetchOverview: vi.fn(),
}))

import { fetchOverview } from '../src/api/overview'
import { useOverviewStore } from '../src/stores/overview'

const fakeOverview: Overview = {
  cycle_time: { median_days: 2.5, sample_size: 12 },
  review_time: { median_days: 0.8, sample_size: 8 },
  issue_throughput: { count: 23, period_days: 30 },
  as_of: '2026-07-24T12:36:48.065313Z',
  sync_status: 'success',
  sync_run: {
    id: 'run-1',
    started_at: '2026-07-24T09:00:00Z',
    finished_at: '2026-07-24T09:05:00Z',
    status: 'success',
    records_issue: 120,
    records_pr: 45,
  },
  scan_snapshot: { parsed_summary: { total_open: 15 }, created_at: '2026-07-24T08:00:00Z' },
  trend: [{ date: '2026-07-24', closed_issues: 1, merged_prs: 2 }],
}

function serverError(message = '服务器内部错误'): ApiError {
  return { status: 500, message, raw: null }
}

describe('stores/overview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('load 成功：写入数据态，loading 复位，error 清空', async () => {
    vi.mocked(fetchOverview).mockResolvedValue(fakeOverview)
    const store = useOverviewStore()

    expect(store.data).toBeNull()
    expect(store.loading).toBe(false)

    await store.load()

    expect(store.data).toEqual(fakeOverview)
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(fetchOverview).toHaveBeenCalledTimes(1)
  })

  it('load 失败：进入错误态，data 保持 null', async () => {
    vi.mocked(fetchOverview).mockRejectedValue(serverError())
    const store = useOverviewStore()

    await store.load()

    expect(store.data).toBeNull()
    expect(store.error).toEqual(serverError())
    expect(store.loading).toBe(false)
  })

  it('失败后重试成功：error 清空并写入数据', async () => {
    vi.mocked(fetchOverview).mockRejectedValueOnce(serverError()).mockResolvedValue(fakeOverview)
    const store = useOverviewStore()

    await store.load()
    expect(store.error).not.toBeNull()

    await store.load()
    expect(store.error).toBeNull()
    expect(store.data).toEqual(fakeOverview)
    expect(fetchOverview).toHaveBeenCalledTimes(2)
  })

  it('load 进行中重复调用不并发请求', async () => {
    let resolveFetch!: (o: Overview) => void
    vi.mocked(fetchOverview).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const store = useOverviewStore()

    const p1 = store.load()
    const p2 = store.load()
    expect(store.loading).toBe(true)

    resolveFetch(fakeOverview)
    await Promise.all([p1, p2])
    expect(fetchOverview).toHaveBeenCalledTimes(1)
    expect(store.data).toEqual(fakeOverview)
  })
})
