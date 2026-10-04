import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'

vi.mock('../src/api/chatHistory', () => ({
  fetchChatThreads: vi.fn(),
  fetchThreadHistory: vi.fn(),
}))

import { fetchChatThreads } from '../src/api/chatHistory'
import ChatHistoryPanel from '../src/components/chat-history/ChatHistoryPanel.vue'

/**
 * F1 · 历史侧栏组件断言（AC1/AC4/AC5 + FP-F6/F8/F9）：
 * 徽标 / 空态 / 降级标题 / 加载更多拼接不重不漏 / 端点未上线降级。
 */

function thread(overrides: Record<string, unknown> = {}) {
  return {
    thread_id: 't-1',
    title: '部署排查',
    last_activity_at: '2026-10-04T01:00:00',
    run_count: 2,
    latest_run_status: 'completed',
    ...overrides,
  }
}

function apiError(status: number): ApiError {
  return { status, message: `e${status}`, raw: null }
}

function mountPanel() {
  return mount(ChatHistoryPanel, {
    global: { plugins: [createPinia(), ElementPlus] },
  })
}

describe('components/ChatHistoryPanel（F1 · 历史侧栏）', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC1：渲染列表；latest_run_status=waiting_approval 条目渲染徽标，其余状态不渲染', async () => {
    vi.mocked(fetchChatThreads).mockResolvedValue({
      threads: [
        thread({ thread_id: 't-1', latest_run_status: 'waiting_approval' }),
        thread({ thread_id: 't-2', latest_run_status: 'completed' }),
        thread({ thread_id: 't-3', latest_run_status: 'running' }),
        thread({ thread_id: 't-4', latest_run_status: 'error' }),
      ],
      next_cursor: null,
    })
    const wrapper = mountPanel()
    await flushPromises()

    const items = wrapper.findAll('[data-test="chat-history-item"]')
    expect(items).toHaveLength(4)
    const badges = wrapper.findAll('[data-test="chat-history-badge"]')
    expect(badges).toHaveLength(1)
    expect(badges[0].text()).toContain('待审批')
    // 徽标只挂在 waiting_approval 条目
    expect(items[0].find('[data-test="chat-history-badge"]').exists()).toBe(true)
    expect(items[1].find('[data-test="chat-history-badge"]').exists()).toBe(false)
    expect(items[2].find('[data-test="chat-history-badge"]').exists()).toBe(false)
    expect(items[3].find('[data-test="chat-history-badge"]').exists()).toBe(false)
    // 元信息：末活动时间 + run 数
    expect(items[0].text()).toContain('2026-10-04T01:00:00')
    expect(items[0].text()).toContain('2 run')
  })

  it('AC1：点击条目 emit select(thread_id)', async () => {
    vi.mocked(fetchChatThreads).mockResolvedValue({
      threads: [thread({ thread_id: 't-9' })],
      next_cursor: null,
    })
    const wrapper = mountPanel()
    await flushPromises()

    await wrapper.find('[data-test="chat-history-item"]').trigger('click')

    expect(wrapper.emitted('select')).toEqual([['t-9']])
  })

  it('AC4：threads 空数组 → 空态文案「暂无历史会话」', async () => {
    vi.mocked(fetchChatThreads).mockResolvedValue({ threads: [], next_cursor: null })
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find('[data-test="chat-history-empty"]').text()).toContain('暂无历史会话')
  })

  it('AC4/FP-F6：title 空串 → 降级标题（run_id 前缀+时间）渲染不崩', async () => {
    vi.mocked(fetchChatThreads).mockResolvedValue({
      threads: [thread({ thread_id: 't-abcdef1234567890', title: '' })],
      next_cursor: null,
    })
    const wrapper = mountPanel()
    await flushPromises()

    const item = wrapper.find('[data-test="chat-history-item"]')
    expect(item.text()).toContain('run t-abcdef')
    expect(item.text()).toContain('2026-10-04T01:00:00')
  })

  it('AC5/FP-F9：cursor 分页「加载更多」拼接不重不漏（thread_id 并集无重复）', async () => {
    vi.mocked(fetchChatThreads)
      .mockResolvedValueOnce({
        threads: [
          thread({ thread_id: 't-1', title: '会话一' }),
          thread({ thread_id: 't-2', title: '会话二' }),
        ],
        next_cursor: 'cur-2',
      })
      .mockResolvedValueOnce({
        // 第二页含一页重叠条目（服务端游标漂移防御）→ 不得重复入列
        threads: [
          thread({ thread_id: 't-2', title: '会话二' }),
          thread({ thread_id: 't-3', title: '会话三' }),
        ],
        next_cursor: null,
      })
    const wrapper = mountPanel()
    await flushPromises()

    const more = wrapper.find('[data-test="chat-history-more"]')
    expect(more.exists()).toBe(true)
    await more.trigger('click')
    await flushPromises()

    expect(fetchChatThreads).toHaveBeenNthCalledWith(2, { cursor: 'cur-2' })
    const ids = wrapper
      .findAll('[data-test="chat-history-item"]')
      .map((item) => item.find('.chat-history__item-title').text())
    // 并集不重不漏：t-1/t-2/t-3 各一次（t-2 标题相同 · 用 key 数断言总数 3）
    expect(wrapper.findAll('[data-test="chat-history-item"]')).toHaveLength(3)
    expect(new Set(ids).size).toBe(3)
    // 无更多 → 按钮消失
    expect(wrapper.find('[data-test="chat-history-more"]').exists()).toBe(false)
  })

  it('AC13/FP-F8：404（端点未上线）→ 降级文案「历史服务暂不可用」，不炸屏', async () => {
    vi.mocked(fetchChatThreads).mockRejectedValue(apiError(404))
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find('[data-test="chat-history-unavailable"]').text()).toContain(
      '历史服务暂不可用',
    )
  })

  it('AC13/FP-F8：501 / 网络错 → 同款降级文案', async () => {
    vi.mocked(fetchChatThreads).mockRejectedValue(apiError(501))
    const wrapper = mountPanel()
    await flushPromises()
    expect(wrapper.find('[data-test="chat-history-unavailable"]').exists()).toBe(true)

    vi.mocked(fetchChatThreads).mockRejectedValue(apiError(0 as unknown as number))
    vi.mocked(fetchChatThreads).mockRejectedValue({ status: null, message: 'network', raw: null })
    await wrapper.find('.chat-history__header button').trigger('click')
    await flushPromises()
    expect(wrapper.find('[data-test="chat-history-unavailable"]').text()).toContain(
      '历史服务暂不可用',
    )
  })

  it('401 → 不呈现降级文案（全局跳登录由 http 拦截器负责）', async () => {
    vi.mocked(fetchChatThreads).mockRejectedValue(apiError(401))
    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find('[data-test="chat-history-unavailable"]').exists()).toBe(false)
  })
})
