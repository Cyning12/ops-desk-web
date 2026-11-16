import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { GoalItem } from '../src/api/goals'

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/chat' }),
  useRouter: () => ({ push: vi.fn() }),
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

vi.mock('../src/api/goals', () => ({
  listThreadGoals: vi.fn(),
  patchGoalStatus: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

// P3-T8：ChatView 挂载触发任务面板首拉 · 静默降级不打穿既有断言
vi.mock('../src/api/taskPanel', () => ({
  listThreadRuns: vi.fn().mockResolvedValue({ runs: [], next_cursor: null }),
  fetchRunEvents: vi.fn(),
  listThreadSchedules: vi.fn().mockResolvedValue([]),
  patchSchedule: vi.fn(),
}))

import { listThreadGoals, patchGoalStatus } from '../src/api/goals'
import { useChatStore } from '../src/stores/chat'
import ChatView from '../src/views/ChatView.vue'

/**
 * T5b goal chip（web#104 · 07 §5）：
 * loadThreadGoal 选取（最新非终态优先 · 空/失败 → null 静默降级）；
 * patchCurrentGoalStatus 迁移矩阵动作面（409 对账刷新 · 404 隐藏）；
 * ChatView chip 渲染（文案裁定「修订目标」tooltip · 全仓禁「重命名」）。
 */

function goal(partial: Partial<GoalItem>): GoalItem {
  return {
    goal_id: 'g-1',
    tenant_id: 'tenant-a',
    thread_id: 't-1',
    objective: '巡检 nightly 流水线',
    status: 'active',
    created_at: '2026-11-15T01:00:00Z',
    updated_at: '2026-11-15T01:00:00Z',
    ...partial,
  }
}

function apiError(status: number, message = 'err'): ApiError {
  return { status, message, raw: null }
}

// jsdom 未实现 HTMLElement.scrollTo（ChatView 消息滚动 watcher）→ 测试桩
window.HTMLElement.prototype.scrollTo = vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollTo

describe('stores/chat · T5b goal chip', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('loadThreadGoal：取最新非终态 goal（active/paused 优先于终态）', async () => {
    vi.mocked(listThreadGoals).mockResolvedValue([
      goal({ goal_id: 'g-old', status: 'done' }),
      goal({ goal_id: 'g-new', status: 'paused' }),
    ])
    const chat = useChatStore()
    await chat.loadThreadGoal('t-1')
    expect(chat.currentGoal?.goal_id).toBe('g-new')
  })

  it('loadThreadGoal：空列表与失败均静默 null（闸 off 零打扰 · 降级不炸屏）', async () => {
    const chat = useChatStore()
    vi.mocked(listThreadGoals).mockResolvedValue([])
    await chat.loadThreadGoal('t-1')
    expect(chat.currentGoal).toBeNull()
    vi.mocked(listThreadGoals).mockRejectedValue(apiError(500))
    await chat.loadThreadGoal('t-1')
    expect(chat.currentGoal).toBeNull()
    await chat.loadThreadGoal(null)
    expect(listThreadGoals).toHaveBeenCalledTimes(2) // null tid 不发请求
  })

  it('patchCurrentGoalStatus：成功即更新 chip', async () => {
    vi.mocked(listThreadGoals).mockResolvedValue([goal({})])
    vi.mocked(patchGoalStatus).mockResolvedValue(goal({ status: 'paused' }))
    const chat = useChatStore()
    await chat.loadThreadGoal('t-1')
    await chat.patchCurrentGoalStatus('paused')
    expect(patchGoalStatus).toHaveBeenCalledWith('g-1', 'paused')
    expect(chat.currentGoal?.status).toBe('paused')
    expect(chat.goalActionError).toBeNull()
  })

  it('patchCurrentGoalStatus：409 → 提示「目标状态已变化」并重新拉取对账', async () => {
    vi.mocked(listThreadGoals).mockResolvedValue([goal({})])
    vi.mocked(patchGoalStatus).mockRejectedValue(apiError(409))
    const chat = useChatStore()
    await chat.loadThreadGoal('t-1')
    await chat.patchCurrentGoalStatus('done')
    expect(chat.goalActionError).toContain('目标状态已变化')
    expect(listThreadGoals).toHaveBeenCalledTimes(2) // 初载 + 对账重拉
  })

  it('patchCurrentGoalStatus：404 → chip 隐藏 + 提示；401 静默（交拦截器）', async () => {
    vi.mocked(listThreadGoals).mockResolvedValue([goal({})])
    const chat = useChatStore()
    await chat.loadThreadGoal('t-1')
    vi.mocked(patchGoalStatus).mockRejectedValue(apiError(404))
    await chat.patchCurrentGoalStatus('done')
    expect(chat.currentGoal).toBeNull()
    expect(chat.goalActionError).toBe('目标不存在或已过期')

    vi.mocked(listThreadGoals).mockResolvedValue([goal({})])
    await chat.loadThreadGoal('t-1')
    vi.mocked(patchGoalStatus).mockRejectedValue(apiError(401))
    await chat.patchCurrentGoalStatus('done')
    expect(chat.goalActionError).toBeNull()
  })

  it('startNewSession 清空 currentGoal', async () => {
    vi.mocked(listThreadGoals).mockResolvedValue([goal({})])
    const chat = useChatStore()
    await chat.loadThreadGoal('t-1')
    expect(chat.currentGoal).not.toBeNull()
    chat.startNewSession()
    expect(chat.currentGoal).toBeNull()
  })
})

describe('ChatView · T5b goal chip 渲染', () => {
  beforeEach(() => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(listThreadGoals).mockResolvedValue([])
  })

  it('无 goal → 无 chip（闸 off 零打扰）；有 goal → chip 渲染目标文案 + 「修订目标」tooltip', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const chat = useChatStore()
    const wrapper = mount(ChatView, { global: { plugins: [pinia, ElementPlus] } })
    await flushPromises()
    expect(wrapper.find('[data-test="goal-chip"]').exists()).toBe(false)

    chat.currentGoal = goal({})
    await flushPromises()
    const chip = wrapper.find('[data-test="goal-chip"]')
    expect(chip.exists()).toBe(true)
    expect(chip.text()).toContain('巡检 nightly 流水线')
    expect(chip.html()).toContain('修订目标')
    expect(chip.html()).not.toContain('重命名')
  })

  it('paused goal 显示状态徽标「已暂停」', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const chat = useChatStore()
    chat.currentGoal = goal({ status: 'paused' })
    mount(ChatView, { global: { plugins: [pinia, ElementPlus] } })
    await flushPromises()
    const chat2 = useChatStore()
    expect(chat2.currentGoal?.status).toBe('paused')
    expect(chat2.goalActionError).toBeNull()
  })
})
