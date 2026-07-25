import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GraphResponse } from '../src/api/graph'
import type { ApiError } from '../src/api/http'

vi.mock('../src/api/graph', () => ({
  fetchGraph: vi.fn(),
}))

import { fetchGraph } from '../src/api/graph'
import GraphView from '../src/views/GraphView.vue'

/** 当前后端实测响应：无快照时全 null */
const nullResponse: GraphResponse = {
  snapshot: null,
  module_matrix: null,
  repo_id: null,
  created_at: null,
}

async function mountView() {
  const wrapper = mount(GraphView, {
    global: { plugins: [createPinia(), ElementPlus] },
  })
  await flushPromises()
  return wrapper
}

describe('GraphView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('全 null 响应：完整渲染空态，无报错', async () => {
    vi.mocked(fetchGraph).mockResolvedValue(nullResponse)

    const wrapper = await mountView()

    // snapshot 元信息区空态
    expect(wrapper.text()).toContain('暂无图谱快照')
    // module_matrix 空态：el-empty + 操作说明
    expect(wrapper.find('.el-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无 module_matrix 数据')
    expect(wrapper.text()).toContain('需先在后端执行 scan/graph 生成图谱快照')
    // 无错误提示
    expect(wrapper.find('.el-alert').exists()).toBe(false)
  })

  it('有数据 fixture：snapshot 元信息与 module_matrix 表格渲染', async () => {
    vi.mocked(fetchGraph).mockResolvedValue({
      snapshot: { node_count: 120, edge_count: 340 },
      module_matrix: [
        { module_id: 'core', issue_count: 12, p0_count: 2 },
        { module_id: 'web', issue_count: 5, p0_count: 0 },
      ],
      repo_id: 'repo-1',
      created_at: '2026-07-15T08:00:00Z',
    })

    const wrapper = await mountView()

    // 元信息区
    expect(wrapper.text()).toContain('repo-1')
    expect(wrapper.text()).not.toContain('暂无图谱快照')
    // snapshot payload 标量字段防御性展示
    expect(wrapper.text()).toContain('node_count')
    expect(wrapper.text()).toContain('120')

    // 表格：列头 + 两行数据
    const headers = wrapper.findAll('.graph-page__table th').map((th) => th.text())
    expect(headers).toEqual(['module_id', 'issue_count', 'p0_count'])
    const rows = wrapper.findAll('.graph-page__table tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('core')
    expect(rows[0].text()).toContain('12')
    expect(rows[1].text()).toContain('web')
    expect(wrapper.find('.el-empty').exists()).toBe(false)
  })

  it('module_matrix 为对象映射：防御性表格化（module 列 + 详情列）', async () => {
    vi.mocked(fetchGraph).mockResolvedValue({
      snapshot: null,
      module_matrix: {
        core: { issue_count: 12 },
        web: { issue_count: 5 },
      },
      repo_id: 'repo-1',
      created_at: null,
    })

    const wrapper = await mountView()

    const headers = wrapper.findAll('.graph-page__table th').map((th) => th.text())
    expect(headers).toEqual(['module', 'issue_count'])
    const rows = wrapper.findAll('.graph-page__table tbody tr')
    expect(rows).toHaveLength(2)
    expect(rows[0].text()).toContain('core')
    expect(rows[1].text()).toContain('web')
  })

  it('接口错误：el-alert 展示错误信息并可重试', async () => {
    const serverError: ApiError = { status: 500, message: 'Internal Server Error', raw: null }
    vi.mocked(fetchGraph).mockRejectedValueOnce(serverError).mockResolvedValueOnce(nullResponse)

    const wrapper = await mountView()

    expect(wrapper.find('.el-alert').exists()).toBe(true)
    expect(wrapper.text()).toContain('Internal Server Error')

    // 点击重试后恢复空态
    await wrapper.find('.el-alert .el-button').trigger('click')
    await flushPromises()
    expect(fetchGraph).toHaveBeenCalledTimes(2)
    expect(wrapper.find('.el-alert').exists()).toBe(false)
    expect(wrapper.text()).toContain('暂无 module_matrix 数据')
  })
})
