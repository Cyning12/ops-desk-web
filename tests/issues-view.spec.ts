import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/issues', () => ({
  fetchIssues: vi.fn(),
}))

import { fetchIssues } from '../src/api/issues'
import IssuesView from '../src/views/IssuesView.vue'

function mountView() {
  return mount(IssuesView, {
    global: { plugins: [ElementPlus] },
  })
}

describe('IssuesView 渲染', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('空列表（当前后端实际状态）：渲染 el-empty 空态与分页 total=0', async () => {
    vi.mocked(fetchIssues).mockResolvedValue({ items: [], total: 0, page: 1, page_size: 20 })

    const wrapper = mountView()
    await flushPromises()

    // 挂载即请求默认分页
    expect(fetchIssues).toHaveBeenCalledWith({ page: 1, page_size: 20 })
    // 空态可见
    const empty = wrapper.find('.el-empty')
    expect(empty.exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无 Issues 数据')
    // 不渲染表格行
    expect(wrapper.find('.el-table').exists()).toBe(false)
    // 分页仍渲染且 total=0
    expect(wrapper.find('.el-pagination').exists()).toBe(true)
    expect(wrapper.text()).toContain('0')
  })

  it('有数据：渲染表格行（state tag / labels / module / 本地化时间）', async () => {
    vi.mocked(fetchIssues).mockResolvedValue({
      items: [
        {
          id: 'i-1',
          number: 7,
          title: '扫描失败告警',
          state: 'open',
          labels: ['bug', 'p0'],
          module_tag: 'worker',
          updated_at: '2026-07-20T08:00:00+00:00',
        },
        {
          id: 'i-2',
          number: 8,
          title: '空标签与空模块',
          state: 'closed',
          labels: [],
          module_tag: null,
          updated_at: null,
        },
      ],
      total: 2,
      page: 1,
      page_size: 20,
    })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.el-empty').exists()).toBe(false)
    const text = wrapper.text()
    expect(text).toContain('扫描失败告警')
    expect(text).toContain('open')
    expect(text).toContain('bug')
    expect(text).toContain('p0')
    expect(text).toContain('worker')
    // 空 labels / 空 module_tag / 空 updated_at 渲染占位符
    expect(text).toContain('—')
  })

  it('接口错误：渲染 el-alert 与重试按钮', async () => {
    vi.mocked(fetchIssues).mockRejectedValue({ status: 500, message: '服务器错误', raw: null })

    const wrapper = mountView()
    await flushPromises()

    const alert = wrapper.find('.el-alert--error')
    expect(alert.exists()).toBe(true)
    expect(wrapper.text()).toContain('服务器错误')
    expect(wrapper.text()).toContain('重试')
  })
})
