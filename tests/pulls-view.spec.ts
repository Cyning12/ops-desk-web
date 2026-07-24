import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import type { PullsListResponse } from '../src/api/pulls'

vi.mock('../src/api/pulls', async (importOriginal) => {
  const original = await importOriginal<typeof import('../src/api/pulls')>()
  return { ...original, fetchPulls: vi.fn() }
})

import { fetchPulls } from '../src/api/pulls'
import PullsView from '../src/views/PullsView.vue'

// el-table 依赖 ResizeObserver，jsdom 未实现，打桩之
beforeAll(() => {
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver
})

function emptyPage(): PullsListResponse {
  return { items: [], total: 0, page: 1, page_size: 20 }
}

function mountView() {
  return mount(PullsView, {
    global: { plugins: [ElementPlus] },
  })
}

describe('views/PullsView', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('空列表：渲染 el-empty 空态，不渲染分页', async () => {
    vi.mocked(fetchPulls).mockResolvedValue(emptyPage())
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('暂无 Pull Requests')
    expect(wrapper.findComponent({ name: 'ElEmpty' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ElPagination' }).exists()).toBe(false)
  })

  it('有数据：draft 前缀 [Draft]，ci_status null 显示「—」，并渲染分页', async () => {
    vi.mocked(fetchPulls).mockResolvedValue({
      items: [
        {
          id: 'pr-1',
          number: 42,
          title: 'Refactor sync engine',
          state: 'open',
          draft: true,
          ci_status: null,
          updated_at: '2026-07-20T08:00:00Z',
        },
        {
          id: 'pr-2',
          number: 43,
          title: 'Fix login redirect',
          state: 'merged',
          draft: false,
          ci_status: 'success',
          updated_at: '2026-07-21T09:30:00Z',
        },
      ],
      total: 2,
      page: 1,
      page_size: 20,
    })
    const wrapper = mountView()
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('[Draft] Refactor sync engine')
    expect(text).toContain('Fix login redirect')
    expect(text).not.toContain('[Draft] Fix login redirect')
    expect(text).toContain('—')
    expect(text).toContain('success')
    expect(wrapper.findComponent({ name: 'ElPagination' }).exists()).toBe(true)
  })

  it('接口错误：渲染 el-alert 与重试按钮', async () => {
    vi.mocked(fetchPulls).mockRejectedValue({ status: 500, message: 'boom', raw: null })
    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('boom')
    expect(wrapper.text()).toContain('重试')
  })
})
