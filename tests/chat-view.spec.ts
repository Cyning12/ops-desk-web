import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/chat' }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/api/chatHistory', () => ({
  fetchChatThreads: vi.fn(),
  fetchThreadHistory: vi.fn(),
}))

vi.mock('../src/api/hitl', () => ({
  fetchHitlPending: vi.fn(),
  decideHitlRequest: vi.fn(),
  resumeHitlRequest: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { fetchThreadHistory } from '../src/api/chatHistory'
import { fetchHitlPending } from '../src/api/hitl'
import { replayLgRag, streamLgRag } from '../src/composables/useLgRagSse'
import { useChatStore } from '../src/stores/chat'
import ChatView from '../src/views/ChatView.vue'

/**
 * ChatView 组件渲染断言（AC2/AC6/AC7 + F-A/F-B 裁定形态）：
 * hitl.waiting 帧 → 消息流内联审批卡片（reason + 申请 id + 双按钮）；
 * 历史 run 映射渲染（user/assistant/子任务/截断标记/待审批非完成态）；
 * 侧栏内嵌 + history 404 降级。
 */

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let pinia: Pinia
let captured: LgRagSseCallbacks

// jsdom 未实现 HTMLElement.scrollTo（ChatView 消息滚动 watcher）→ 测试桩
window.HTMLElement.prototype.scrollTo = vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollTo

function mountView() {
  return mount(ChatView, {
    global: { plugins: [pinia, ElementPlus] },
  })
}

describe('views/ChatView（F1 历史 + F2 HITL 渲染断言）', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    pinia = createPinia()
    setActivePinia(pinia)
    vi.clearAllMocks()

    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: vi.fn(), done: Promise.resolve() }
    })
    vi.mocked(replayLgRag).mockImplementation(() => ({ abort: vi.fn(), done: Promise.resolve() }))
    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
  })

  it('AC7：注入 hitl.waiting 帧 → 渲染审批卡片（reason + 申请 id + 批准/驳回双按钮）', async () => {
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署生产服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      payload: { reason: '高危操作需人工审批', requests: [{ id: 'req-42' }] },
    })
    await flushPromises()

    const card = wrapper.find('[data-test="hitl-card"]')
    expect(card.exists()).toBe(true)
    expect(card.text()).toContain('人工审批')
    expect(card.text()).toContain('高危操作需人工审批')
    expect(card.text()).toContain('req-42')
    const approve = card.find('.hitl-card__approve')
    const reject = card.find('.hitl-card__reject')
    expect(approve.exists()).toBe(true)
    expect(approve.text()).toContain('批准')
    expect(reject.exists()).toBe(true)
    expect(reject.text()).toContain('驳回')
    // 待审批徽标
    expect(card.find('.hitl-card__badge').text()).toContain('待审批')
  })

  it('AC7：FP-F11 降级卡片（缺 requests → 仅 reason + 审批详情不可用 · 无双按钮）', async () => {
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署生产服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      payload: { reason: '需要审批但详情缺失' },
    })
    await flushPromises()

    const card = wrapper.find('[data-test="hitl-card"]')
    expect(card.exists()).toBe(true)
    expect(card.text()).toContain('需要审批但详情缺失')
    expect(card.text()).toContain('审批详情不可用')
    expect(card.find('.hitl-card__approve').exists()).toBe(false)
    expect(card.find('.hitl-card__reject').exists()).toBe(false)
  })

  it('AC10 视觉：done{waiting_approval} 后卡片仍在；done{completed} 后无待审批形态', async () => {
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署生产服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      run_id: 'r-1',
      seq: 2,
      payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
    })
    captured.onEvent?.({
      event_type: 'done',
      run_id: 'r-1',
      seq: 3,
      payload: { status: 'waiting_approval' },
    })
    await flushPromises()

    // 待审批卡片持续可见 · 不呈现「完成」hint
    expect(wrapper.find('[data-test="hitl-card"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('完成 · 耗时')
  })

  it('AC2/AC6：历史 run 映射渲染（query→user · answer→assistant · 子任务列 · 截断标记 · 待审批形态）', async () => {
    vi.mocked(fetchThreadHistory).mockResolvedValue({
      thread_id: 't-9',
      runs: [
        {
          run_id: 'r-1',
          started_at: '2026-10-04T00:59:00',
          query: '为什么部署失败',
          answer: '因为配置缺失',
          answer_truncated: true,
          subtasks: [{ seq: 3, agent_role: 'rag_subtask', status: 'done', message: '检索完成' }],
          terminal_status: 'waiting_approval',
          hitl: [{ id: 'req-7', reason: '需审批' }],
        },
      ],
      next_cursor: null,
    })
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    await chat.openHistoryThread('t-9')
    await flushPromises()

    const userBubble = wrapper.find('.chat-message--user .chat-message__text')
    expect(userBubble.text()).toBe('为什么部署失败')
    const assistantBubble = wrapper.find('.chat-message--assistant .chat-message__text')
    expect(assistantBubble.text()).toBe('因为配置缺失')
    // 子任务过程列
    expect(wrapper.text()).toContain('子任务过程')
    expect(wrapper.text()).toContain('检索完成')
    // AC6 截断标记
    expect(wrapper.find('[data-test="answer-truncated"]').text()).toContain('内容过长已截断')
    // 待审批形态（非完成态）
    expect(wrapper.find('[data-test="hitl-card"]').exists()).toBe(true)
    expect(wrapper.text()).not.toContain('完成 · 耗时')
  })

  it('F-B：历史侧栏内嵌（默认收起 · 切换按钮展开）；AC13 history 404 → 降级提示不炸屏', async () => {
    vi.mocked(fetchThreadHistory).mockRejectedValue({
      status: 404,
      message: 'not found',
      raw: null,
    } as ApiError)
    const wrapper = mountView()
    await flushPromises()

    // 默认收起 → 展开
    expect(wrapper.find('.chat-page__sidebar').exists()).toBe(false)
    await wrapper.find('[data-test="history-toggle"]').trigger('click')
    expect(wrapper.find('.chat-page__sidebar').exists()).toBe(true)

    const chat = useChatStore()
    await chat.openHistoryThread('t-x')
    await flushPromises()
    expect(wrapper.find('[data-test="history-error"]').text()).toContain('会话不存在或已过期')
    // Chat 主路径不受影响：composer 仍可用
    expect(wrapper.find('.chat-page__composer').exists()).toBe(true)
  })
})
