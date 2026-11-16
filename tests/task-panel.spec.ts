import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRoute: () => ({ fullPath: '/chat', params: {} }),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('../src/api/taskPanel', () => ({
  listThreadRuns: vi.fn().mockResolvedValue({ runs: [], next_cursor: null }),
  fetchRunEvents: vi.fn(),
  listThreadSchedules: vi.fn().mockResolvedValue([]),
  patchSchedule: vi.fn(),
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
  listThreadGoals: vi.fn().mockResolvedValue([]),
  patchGoalStatus: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

import { fetchRunEvents, patchSchedule } from '../src/api/taskPanel'
import type { RunEventItem, ScheduleItem, ThreadRunItem } from '../src/api/taskPanel'
import { replayLgRag } from '../src/composables/useLgRagSse'
import { useChatStore } from '../src/stores/chat'
import { useTaskPanelStore } from '../src/stores/taskPanel'
import TaskCard from '../src/components/chat/TaskCard.vue'
import TaskPanel from '../src/components/chat/TaskPanel.vue'
import RunReplayDrawer from '../src/components/chat/RunReplayDrawer.vue'
import ChatView from '../src/views/ChatView.vue'

// jsdom 未实现 HTMLElement.scrollTo（ChatView 消息滚动 watcher）→ 测试桩（chat-view.spec.ts 同例）
window.HTMLElement.prototype.scrollTo = vi.fn() as unknown as typeof window.HTMLElement.prototype.scrollTo

/**
 * P3-T8 任务面板组件断言（14 §2.2/§2.3/§2.4 · task_web_p3_t8_task_panel AC2–AC9）：
 * 徽标计数常显 · 默认收起 · 卡片六态点击行为 · 定时任务子区双确认行内操作 ·
 * 422 detail 逐字 toast · 轨迹回放抽屉八值帧 · ChatView 续看联动（activeRun 命中 / 静态降级）。
 */

function run(overrides: Partial<ThreadRunItem> = {}): ThreadRunItem {
  return {
    run_id: 'run-1',
    thread_id: 'th-1',
    status: 'running',
    created_at: '2026-11-16T10:00:00Z',
    finished_at: null,
    query_summary: '每天早上推送晨报',
    schedule_attribution: null,
    ...overrides,
  }
}

function schedule(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    schedule_id: 'sch-1',
    tenant_id: 't',
    user_id: 'u',
    thread_id: 'th-1',
    name: '晨报',
    instruction: '推送晨报',
    schedule_kind: 'daily_at',
    run_at: null,
    interval_seconds: null,
    time_of_day: '08:30',
    timezone: 'Asia/Shanghai',
    next_fire_at: '2026-11-17T00:30:00Z',
    catchup_policy: 'skip',
    status: 'active',
    fire_count: 0,
    max_fires: null,
    last_fired_at: null,
    created_at: '2026-11-10T00:00:00Z',
    updated_at: '2026-11-10T00:00:00Z',
    humanized_display: '每天 08:30（Asia/Shanghai）',
    ...overrides,
  }
}

function event(overrides: Partial<RunEventItem> = {}): RunEventItem {
  return {
    seq: 1,
    event_type: 'run.start',
    payload: { query: '每天早上推送晨报' },
    created_at: '2026-11-16T10:00:01Z',
    ...overrides,
  }
}

function mountPanel() {
  return mount(TaskPanel, { global: { plugins: [ElementPlus] } })
}

async function expandPanel(wrapper: ReturnType<typeof mountPanel>) {
  await wrapper.find('.el-collapse-item__header').trigger('click')
  await flushPromises()
}

describe('TaskPanel（P3-T8 · 折叠面板 + 徽标 + 卡片点击）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('徽标「任务 · N 进行中」收起亦可见 · 默认收起', async () => {
    const store = useTaskPanelStore()
    store.runs = [run({ status: 'running' }), run({ run_id: 'r-2', status: 'waiting_approval' }), run({ run_id: 'r-3', status: 'done' })]

    const wrapper = mountPanel()
    await flushPromises()

    expect(wrapper.find('[data-test="task-panel-badge"]').text()).toBe('任务 · 2 进行中')
    expect(wrapper.find('.el-collapse-item__wrap').attributes('style')).toContain('display: none')
  })

  it('展开后渲染任务卡片；running 卡点击 → activate(resume)', async () => {
    const store = useTaskPanelStore()
    store.runs = [run({ schedule_attribution: { schedule_id: 'sch-1', name: '晨报', fire_id: 'f-1' } })]

    const wrapper = mountPanel()
    await expandPanel(wrapper)

    const card = wrapper.find('[data-test="task-card"]')
    expect(card.exists()).toBe(true)
    expect(wrapper.find('[data-test="task-card-attr"]').text()).toBe('「晨报」')
    expect(wrapper.find('[data-test="task-card-status"]').text()).toContain('进行中')

    await card.trigger('click')
    const emitted = wrapper.emitted('activate')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toMatchObject({ run_id: 'run-1' })
    expect(emitted![0][1]).toBe('resume')
  })

  it('waiting_approval 卡点击 → activate(scroll-hitl) · done 卡 → replay', async () => {
    const store = useTaskPanelStore()
    store.runs = [
      run({ run_id: 'r-w', status: 'waiting_approval' }),
      run({ run_id: 'r-d', status: 'done', finished_at: '2026-11-16T11:00:00Z' }),
    ]

    const wrapper = mountPanel()
    await expandPanel(wrapper)

    const cards = wrapper.findAllComponents(TaskCard)
    expect(cards).toHaveLength(2)
    await cards[0].trigger('click')
    await cards[1].trigger('click')

    const emitted = wrapper.emitted('activate')!
    expect(emitted[0][1]).toBe('scroll-hitl')
    expect(emitted[1][1]).toBe('replay')
    expect(wrapper.find('[data-test="task-card-status"]').exists()).toBe(true)
  })

  it('runs 降级 → 中性化空态文案；schedules 空 → 「暂无定时任务」', async () => {
    const store = useTaskPanelStore()
    store.runs = []
    store.runsDegraded = true
    store.schedules = []

    const wrapper = mountPanel()
    await expandPanel(wrapper)

    expect(wrapper.find('[data-test="task-panel-runs-empty"]').text()).toBe('任务列表暂不可用，稍后重试')
    expect(wrapper.find('[data-test="task-panel-schedules-empty"]').text()).toBe('暂无定时任务')
  })
})

describe('TaskPanel 定时任务子区（行内操作 + ElMessageBox 双确认）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('行渲染 name + humanized_display + 状态 + 下次触发；cancelled 行无动作钮', async () => {
    const store = useTaskPanelStore()
    store.schedules = [schedule(), schedule({ schedule_id: 'sch-2', name: '旧任务', status: 'cancelled' })]

    const wrapper = mountPanel()
    await expandPanel(wrapper)

    const rows = wrapper.findAll('[data-test="schedule-row"]')
    expect(rows).toHaveLength(2)
    expect(rows[0].find('[data-test="schedule-name"]').text()).toBe('晨报')
    expect(rows[0].find('[data-test="schedule-desc"]').text()).toBe('每天 08:30（Asia/Shanghai）')
    expect(rows[0].find('[data-test="schedule-status"]').text()).toBe('已启用')
    expect(rows[0].find('[data-test="schedule-next"]').text()).toContain('下次')
    expect(rows[0].find('[data-test="schedule-pause"]').exists()).toBe(true)
    expect(rows[0].find('[data-test="schedule-cancel"]').exists()).toBe(true)
    // 已取消终态：无动作钮（R2 不可逆）
    expect(rows[1].find('[data-test="schedule-pause"]').exists()).toBe(false)
    expect(rows[1].find('[data-test="schedule-cancel"]').exists()).toBe(false)
  })

  it('暂停：确认 → PATCH status=paused；取消对话框 → 不调用', async () => {
    const store = useTaskPanelStore()
    store.panelThreadId = 'th-1'
    store.schedules = [schedule()]
    vi.mocked(patchSchedule).mockResolvedValue(schedule({ status: 'paused' }))
    const confirm = vi
      .spyOn(ElMessageBox, 'confirm')
      .mockImplementation(() =>
        Promise.resolve('confirm' as Awaited<ReturnType<typeof ElMessageBox.confirm>>),
      )

    const wrapper = mountPanel()
    await expandPanel(wrapper)
    await wrapper.find('[data-test="schedule-pause"]').trigger('click')
    await flushPromises()

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(patchSchedule).toHaveBeenCalledWith('sch-1', { status: 'paused' })
    expect(store.schedules[0].status).toBe('paused')

    vi.mocked(patchSchedule).mockClear()
    confirm.mockImplementation(() => Promise.reject(new Error('cancel')))
    store.schedules = [schedule()] // 恢复 active 行（首段已置 paused · 按钮已换「恢复」）
    await flushPromises()
    await wrapper.find('[data-test="schedule-pause"]').trigger('click')
    await flushPromises()
    expect(patchSchedule).not.toHaveBeenCalled()
  })

  it('取消：双确认文案含「确认取消」+ 终态提示 → PATCH status=cancelled', async () => {
    const store = useTaskPanelStore()
    store.panelThreadId = 'th-1'
    store.schedules = [schedule({ status: 'paused' })]
    vi.mocked(patchSchedule).mockResolvedValue(schedule({ status: 'cancelled' }))
    const confirm = vi
      .spyOn(ElMessageBox, 'confirm')
      .mockImplementation(() =>
        Promise.resolve('confirm' as Awaited<ReturnType<typeof ElMessageBox.confirm>>),
      )

    const wrapper = mountPanel()
    await expandPanel(wrapper)
    await wrapper.find('[data-test="schedule-cancel"]').trigger('click')
    await flushPromises()

    const [, title, options] = confirm.mock.calls[0]
    expect(String(title)).toBe('取消定时任务')
    expect((options as { confirmButtonText?: string }).confirmButtonText).toBe('确认取消')
    expect(patchSchedule).toHaveBeenCalledWith('sch-1', { status: 'cancelled' })
  })

  it('422 → detail 逐字 toast 不二次包装', async () => {
    const store = useTaskPanelStore()
    store.panelThreadId = 'th-1'
    store.schedules = [schedule()]
    vi.mocked(patchSchedule).mockRejectedValue({
      status: 422,
      message: '请求参数无效',
      detail: '已取消的定时任务不可修改',
    })
    vi
      .spyOn(ElMessageBox, 'confirm')
      .mockImplementation(() =>
        Promise.resolve('confirm' as Awaited<ReturnType<typeof ElMessageBox.confirm>>),
      )
    const toast = vi.spyOn(ElMessage, 'error').mockImplementation(vi.fn() as never)

    const wrapper = mountPanel()
    await expandPanel(wrapper)
    await wrapper.find('[data-test="schedule-pause"]').trigger('click')
    await flushPromises()

    expect(toast).toHaveBeenCalledWith('已取消的定时任务不可修改')
  })
})

describe('RunReplayDrawer（P3-T8 · 轨迹回放只读）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('打开拉取事件 → el-timeline 铺帧 · 八值标签 · seq 升序', async () => {
    vi.mocked(fetchRunEvents).mockResolvedValue({
      run_id: 'run-1',
      events: [
        event({ seq: 1, event_type: 'run.start' }),
        event({ seq: 2, event_type: 'node.progress', payload: { node: 'planner' } }),
        event({ seq: 3, event_type: 'hitl.waiting', payload: {} }),
        event({ seq: 4, event_type: 'done', payload: { status: 'completed' } }),
      ],
      truncated: false,
      next_after_seq: null,
    })

    const wrapper = mount(RunReplayDrawer, {
      props: { run: run(), modelValue: true },
      global: { plugins: [ElementPlus] },
    })
    await flushPromises()
    await nextTick()

    expect(fetchRunEvents).toHaveBeenCalledWith('run-1')
    expect(wrapper.find('[data-test="replay-item-run.start"]').text()).toContain('任务开始')
    expect(wrapper.find('[data-test="replay-item-node.progress"]').text()).toContain('节点进度')
    expect(wrapper.find('[data-test="replay-item-hitl.waiting"]').text()).toContain('等待审批')
    expect(wrapper.find('[data-test="replay-item-done"]').text()).toContain('完成')
    expect(wrapper.find('[data-test="replay-more"]').exists()).toBe(false)
  })

  it('truncated + next_after_seq → 「加载更早事件」翻页', async () => {
    vi.mocked(fetchRunEvents)
      .mockResolvedValueOnce({
        run_id: 'run-1',
        events: [event({ seq: 500, event_type: 'answer', payload: { text: '后半' } })],
        truncated: true,
        next_after_seq: 500,
      })
      .mockResolvedValueOnce({
        run_id: 'run-1',
        events: [event({ seq: 1, event_type: 'run.start' })],
        truncated: false,
        next_after_seq: null,
      })

    const wrapper = mount(RunReplayDrawer, {
      props: { run: run(), modelValue: true },
      global: { plugins: [ElementPlus] },
    })
    await flushPromises()
    await nextTick()

    const more = wrapper.find('[data-test="replay-more"]')
    expect(more.exists()).toBe(true)
    await more.trigger('click')
    await flushPromises()

    expect(fetchRunEvents).toHaveBeenLastCalledWith('run-1', 500)
    expect(wrapper.find('[data-test="replay-item-run.start"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="replay-more"]').exists()).toBe(false)
  })

  it('404/失败 → 中性化「回放数据暂不可用」不炸', async () => {
    vi.mocked(fetchRunEvents).mockRejectedValue({ status: 404, message: 'Not Found' })

    const wrapper = mount(RunReplayDrawer, {
      props: { run: run(), modelValue: true },
      global: { plugins: [ElementPlus] },
    })
    await flushPromises()
    await nextTick()

    expect(wrapper.find('[data-test="replay-error"]').text()).toBe('回放数据暂不可用')
  })
})

describe('ChatView 联动（P3-T8 · 面板激活路由）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('running 卡 + 本机 activeRun 命中 → 续看（replayLgRag 路径）；非本机 run → 静态降级回放 drawer', async () => {
    const chat = useChatStore()
    const panel = useTaskPanelStore()
    const wrapper = mount(ChatView, { global: { plugins: [ElementPlus] } })
    await flushPromises()

    // 面板挂载首拉触发（降级静默 · 不打穿 Chat 主路径）
    expect(wrapper.findComponent(TaskPanel).exists()).toBe(true)

    // activeRun 命中 → 续看
    chat.activeRun = {
      run_id: 'run-live',
      last_seq: 3,
      thread_id: 'th-1',
      updated_at: new Date().toISOString(),
    }
    panel.runs = [run({ run_id: 'run-live', status: 'running' })]
    wrapper.findComponent(TaskPanel).vm.$emit('activate', panel.runs[0], 'resume')
    await flushPromises()
    expect(replayLgRag).toHaveBeenCalled()

    // 非本机活动 run → 静态降级回放 drawer
    vi.mocked(replayLgRag).mockClear()
    wrapper.findComponent(TaskPanel).vm.$emit('activate', run({ run_id: 'run-old', status: 'running' }), 'resume')
    await flushPromises()
    expect(replayLgRag).not.toHaveBeenCalled()
    const drawer = wrapper.findComponent(RunReplayDrawer)
    expect(drawer.props('modelValue')).toBe(true)
    expect(drawer.props('run')?.run_id).toBe('run-old')
  })

  it('replay 行为 → 直接开 drawer 不走续看', async () => {
    const wrapper = mount(ChatView, { global: { plugins: [ElementPlus] } })
    await flushPromises()

    wrapper.findComponent(TaskPanel).vm.$emit('activate', run({ run_id: 'r-done', status: 'done' }), 'replay')
    await flushPromises()

    expect(vi.mocked(replayLgRag)).not.toHaveBeenCalled()
    expect(wrapper.findComponent(RunReplayDrawer).props('modelValue')).toBe(true)
  })
})
