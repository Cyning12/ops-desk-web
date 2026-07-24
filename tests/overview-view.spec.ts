import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { Overview } from '../src/api/overview'

vi.mock('../src/api/overview', () => ({
  fetchOverview: vi.fn(),
}))

import { fetchOverview } from '../src/api/overview'
import OverviewView from '../src/views/OverviewView.vue'

/** 近 30 天逐日趋势（全 0，与后端空库实测一致） */
function emptyTrend(): Overview['trend'] {
  const today = new Date('2026-07-24T00:00:00Z')
  return Array.from({ length: 30 }, (_, i) => {
    const day = new Date(today)
    day.setUTCDate(today.getUTCDate() - (29 - i))
    return { date: day.toISOString().slice(0, 10), closed_issues: 0, merged_prs: 0 }
  })
}

/** 后端空库实测契约（2026-07-24）：median null、sync_run/scan_snapshot null、trend 全 0 */
const EMPTY_OVERVIEW: Overview = {
  cycle_time: { median_days: null, sample_size: 0 },
  review_time: { median_days: null, sample_size: 0 },
  issue_throughput: { count: 0, period_days: 30 },
  as_of: '2026-07-24T12:36:48.065313Z',
  sync_status: 'idle',
  sync_run: null,
  scan_snapshot: null,
  trend: emptyTrend(),
}

const FULL_OVERVIEW: Overview = {
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
  trend: emptyTrend().map((p, i) => ({
    ...p,
    closed_issues: i % 3,
    merged_prs: i % 2,
  })),
}

function mountView() {
  return mount(OverviewView, {
    global: { plugins: [createPinia(), ElementPlus] },
  })
}

describe('OverviewView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('空数据态（当前后端实际状态）：完整渲染，无 NaN/undefined/null 上屏', async () => {
    vi.mocked(fetchOverview).mockResolvedValue(EMPTY_OVERVIEW)
    const wrapper = mountView()
    await flushPromises()

    const text = wrapper.text()
    // 空态兜底文案
    expect(text).toContain('—')
    expect(text).toContain('样本 0')
    expect(text).toContain('暂无同步记录')
    expect(text).toContain('暂无扫描快照')
    expect(text).toContain('数据截止')
    // 不得出现渲染事故
    expect(text).not.toContain('NaN')
    expect(text).not.toContain('undefined')
    expect(text).not.toContain('null')
    // trend SVG 双线正常渲染（全 0 时贴基线）
    expect(wrapper.findAll('svg polyline')).toHaveLength(2)
  })

  it('有数据态：指标 / sync_run / scan_snapshot / trend 均渲染', async () => {
    vi.mocked(fetchOverview).mockResolvedValue(FULL_OVERVIEW)
    const wrapper = mountView()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('2.5 天')
    expect(text).toContain('0.8 天')
    expect(text).toContain('样本 12')
    expect(text).toContain('23')
    expect(text).toContain('近 30 天关闭')
    expect(text).toContain('开放事项 15 项')
    expect(text).not.toContain('暂无同步记录')
    expect(text).not.toContain('暂无扫描快照')
    expect(wrapper.findAll('svg polyline')).toHaveLength(2)
  })

  it('错误态：el-alert + 重试按钮，重试成功后渲染数据', async () => {
    const apiError: ApiError = { status: 500, message: '服务器内部错误', raw: null }
    vi.mocked(fetchOverview).mockRejectedValueOnce(apiError).mockResolvedValue(EMPTY_OVERVIEW)
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('总览数据加载失败')
    expect(wrapper.text()).toContain('服务器内部错误')

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(fetchOverview).toHaveBeenCalledTimes(2)
    expect(wrapper.text()).toContain('数据截止')
  })
})
