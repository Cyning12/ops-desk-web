import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it, vi } from 'vitest'

import App from '../src/App.vue'
import OverviewView from '../src/views/OverviewView.vue'

// OverviewView 挂载即拉取总览数据；冒烟测试 mock 为空态契约
vi.mock('../src/api/overview', () => ({
  fetchOverview: vi.fn().mockResolvedValue({
    cycle_time: { median_days: null, sample_size: 0 },
    review_time: { median_days: null, sample_size: 0 },
    issue_throughput: { count: 0, period_days: 30 },
    as_of: '2026-07-24T12:36:48.065313Z',
    sync_status: 'idle',
    sync_run: null,
    scan_snapshot: null,
    trend: [],
  }),
}))

describe('App 冒烟', () => {
  it('挂载 App 并渲染 /overview 视图', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/overview', component: OverviewView }],
    })
    router.push('/overview')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router, createPinia(), ElementPlus] },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('同步状态')
    expect(wrapper.text()).toContain('暂无同步记录')
  })
})
