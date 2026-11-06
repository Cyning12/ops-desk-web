import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

vi.mock('../src/api/hitl', () => ({
  fetchHitlPending: vi.fn(),
  decideHitlRequest: vi.fn(),
  resumeHitlRequest: vi.fn(),
}))

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { fetchHitlPending } from '../src/api/hitl'
import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'
import { replayLgRag, streamLgRag } from '../src/composables/useLgRagSse'
import HitlApprovalCard from '../src/components/chat/HitlApprovalCard.vue'
import type { ChatMessage } from '../src/stores/chat'
import { useChatStore } from '../src/stores/chat'

/**
 * task_web_ux_state_sync（30 · D2）+ task_web_hitl_overlay_reconcile_race（30 · DP-1 形态 A）·
 * HITL 卡片对账渲染面（TC6/TC7/TC1 组件断言）：chat store 已成功取回 hitlPending 且 request id
 * 不在列 → waiting 卡转只读「已被处理或已失效」（批准/驳回/resume_mode 三选不渲染）；id 在列 → 保持可点。
 * 403/网络错（fetch 未成功）/本地已动作不做对账（FP-4/5/6）。零轮询零新端点（复用 refreshHitlPending 既有刷新点）。
 * 形态 A：仅「帧首见早于最近一次成功快照」的 id 参账；快照 T₀ 后首见的 id（实体键滞后）不参账，
 * 待下一次成功刷新确证（TC1 负样本 · issue #95）。
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

let captured: LgRagSseCallbacks

/**
 * 形态 A 帧首见登记走 store 帧摄入路径（live hitl.waiting · chat.ts processFrame），
 * 与生产一致：卡片渲染的 hitl 态只经「SSE 帧 / replay / 历史」三入口产生，prop 直传消息不登记首见。
 */
function seedWaitingFrame(chat: ReturnType<typeof useChatStore>, requestId: string): ChatMessage {
  chat.sendMessage('部署服务')
  captured.onEvent?.({
    event_type: 'hitl.waiting',
    run_id: 'r-1',
    seq: 2,
    payload: { reason: '高危操作需人工审批', requests: [{ id: requestId, reason: '高危操作需人工审批' }] },
  })
  const message = chat.messages.find((m) => m.hitl?.status === 'waiting')
  if (!message) throw new Error('seedWaitingFrame: waiting 消息未产生')
  return message
}

describe('HitlApprovalCard · state-sync 对账渲染（web-ux-state-sync · D2 + reconcile-race · 形态 A）', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(fetchLatestSession).mockResolvedValue({
      id: 's-1',
      user_id: 'u-1',
      title: 'New Chat',
      created_at: '2026-07-24T01:00:00',
      updated_at: '2026-07-24T01:00:00',
    })
    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: vi.fn(), done: Promise.resolve() }
    })
    vi.mocked(replayLgRag).mockImplementation(() => ({
      abort: vi.fn(),
      done: Promise.resolve(),
    }))
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
    const chat = useChatStore()
    await chat.loadLatestSession()
    // 形态 A 真值对齐（TC7/NIT-1）：帧首见先于确认快照（生产时序）——首见登记须经 store 帧路径
    const message = seedWaitingFrame(chat, 'req-a1')
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    await chat.refreshHitlPending()

    const wrapper = mountCard(message)
    const note = wrapper.find('[data-test="hitl-card-reconciled"]')
    expect(note.exists()).toBe(true)
    expect(note.text()).toBe('已被处理或已失效')
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(false)
    expect(wrapper.find('.hitl-card__reject').exists()).toBe(false)
    expect(wrapper.find('[data-test="hitl-resume-mode"]').exists()).toBe(false)
  })

  it('TC1 负样本（issue #95 · 形态 A）：快照 T₀ 成功取回后 hitl.waiting 帧后至（实体键滞后）→ 保持可动作 · 不误转只读；下一次成功刷新确证后才转只读', async () => {
    const chat = useChatStore()
    await chat.loadLatestSession()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    await chat.refreshHitlPending() // T₀ 快照成功（空列）

    const message = seedWaitingFrame(chat, 'req-late1') // 帧后至：首见纪元 = T₀ → 不参账
    const wrapper = mountCard(message)
    expect(wrapper.find('[data-test="hitl-card-reconciled"]').exists()).toBe(false)
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(true)
    expect(wrapper.find('.hitl-card__reject').exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-resume-mode"]').exists()).toBe(true)

    // 确证路径：下一次成功刷新后（首见纪元 < 快照纪元）且仍不在列 → 转只读
    await chat.refreshHitlPending()
    await nextTick()
    const note = wrapper.find('[data-test="hitl-card-reconciled"]')
    expect(note.exists()).toBe(true)
    expect(note.text()).toBe('已被处理或已失效')
    expect(wrapper.find('.hitl-card__approve').exists()).toBe(false)
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