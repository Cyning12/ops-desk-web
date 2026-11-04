import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/hitl', () => ({
  fetchHitlPending: vi.fn(),
  decideHitlRequest: vi.fn(),
  resumeHitlRequest: vi.fn(),
}))

import { fetchHitlPending } from '../src/api/hitl'
import HitlApprovalCard from '../src/components/chat/HitlApprovalCard.vue'
import type { ChatMessage } from '../src/stores/chat'
import { useChatStore } from '../src/stores/chat'

/**
 * task_web_ux_state_sync（30 · D2）· HITL 卡片对账渲染面（TC6/TC7 组件断言）：
 * chat store 已成功取回 hitlPending 且 request id 不在列 → waiting 卡转只读「已被处理或已失效」
 * （批准/驳回/resume_mode 三选不渲染）；id 在列 → 保持可点。403/网络错（fetch 未成功）/本地已动作
 * 不做对账（FP-4/5/6）。零轮询零新端点（复用 refreshHitlPending 既有刷新点）。
 */

function makeWaitingMessage(requestId = 'req-a1'): ChatMessage {
  return {
    id: 'm-1',
    role: 'assistant',
    content: '',
    thinking: [],
    subtasks: [],
    ts: 1,
    hitl: {
      reason: '高危操作需人工审批',
      requests: [{ id: requestId, reason: '高危操作需人工审批' }],
      status: 'waiting',
      decision: null,
      note: null,
    },
  } as unknown as ChatMessage
}

const PENDING_ITEM = {
  id: 'req-a1',
  run_id: 'r-1',
  thread_id: 't-1',
  reason: '高危操作需人工审批',
  blocked_by: { op: 'deploy' },
  created_at: '2026-11-03T01:00:00Z',
}

describe('HitlApprovalCard · state-sync 对账渲染（web-ux-state-sync · D2）', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  function mountCard(message = makeWaitingMessage()) {
    return mount(HitlApprovalCard, {
      props: { message },
      global: { plugins: [ElementPlus] },
    })
  }

  it('成功取回且 id 在列 → 保持可点：批准/驳回/resume_mode 渲染 · 无只读 note', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [PENDING_ITEM], count: 1 })
    const chat = useChatStore()
    await chat.refreshHitlPending()

    const wrapper = mountCard()
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(true)
    expect(wrapper.find('.hitl-card__reject').exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-resume-mode"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-card-reconciled"]').exists()).toBe(false)
  })

  it('成功取回且 id 不在列 → 只读「已被处理或已失效」：批准/驳回/resume_mode 不渲染', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    const chat = useChatStore()
    await chat.refreshHitlPending()

    const wrapper = mountCard()
    const note = wrapper.find('[data-test="hitl-card-reconciled"]')
    expect(note.exists()).toBe(true)
    expect(note.text()).toBe('已被处理或已失效')
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(false)
    expect(wrapper.find('.hitl-card__reject').exists()).toBe(false)
    expect(wrapper.find('[data-test="hitl-resume-mode"]').exists()).toBe(false)
  })

  it('FP-4：403 权限错（fetch 未成功）→ 不对账 · 保持可点', async () => {
    vi.mocked(fetchHitlPending).mockRejectedValue({ status: 403, message: 'Forbidden', raw: null })
    const chat = useChatStore()
    await chat.refreshHitlPending()
    expect(chat.hitlPendingError).toBe('无审批权限')

    const wrapper = mountCard()
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-card-reconciled"]').exists()).toBe(false)
  })

  it('FP-5：网络错（fetch 未成功）→ 不对账 · 保持可点', async () => {
    vi.mocked(fetchHitlPending).mockRejectedValue({
      status: null,
      message: 'Network Error',
      raw: null,
    })
    const chat = useChatStore()
    await chat.refreshHitlPending()
    expect(chat.hitlPendingError).toBe('审批服务暂不可用')

    const wrapper = mountCard()
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-card-reconciled"]').exists()).toBe(false)
  })
})