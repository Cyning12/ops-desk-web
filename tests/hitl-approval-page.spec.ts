import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils'
import ElementPlus, { ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/hitl', () => ({
  fetchHitlPending: vi.fn(),
  decideHitlRequest: vi.fn(),
  resumeHitlRequest: vi.fn(),
}))

import { decideHitlRequest, fetchHitlPending, resumeHitlRequest } from '../src/api/hitl'
import HitlApprovalView from '../src/views/HitlApprovalView.vue'

/**
 * 独立 HITL 审批页（task_web-hitl-approval-page · TC1–TC7 + D7）：
 * 列表三态 / 决策二次确认+防重 / resume_mode 三选零分叉 / 两步链（decide≠自动 resume）/
 * immediate auto_triggered 分支 / 错误态（403·网络·过期·409）/ 驳回路径 / visibilitychange 边沿刷新。
 * 冻结契约 src/api/hitl.ts 只消费禁改；文案与 HitlApprovalCard.vue:49-60 同语义。
 */

const ITEM_A = {
  id: 'req-a1',
  run_id: 'run-abcdef1234567890',
  thread_id: 'thread-xyz9876543210',
  reason: '部署生产环境需审批',
  blocked_by: { op: 'deploy', target: 'prod' },
  created_at: '2026-10-20T01:00:00Z',
}
const ITEM_B = {
  id: 'req-b2',
  run_id: 'run-b2',
  thread_id: 'thread-b2',
  reason: '删除历史数据',
  blocked_by: ['db.drop'],
  created_at: '2026-10-21T02:00:00Z',
}

const DECIDE_REQUIRED = {
  ok: true,
  request: { id: 'req-a1', status: 'approved' },
  resume: {
    required: true,
    method: 'POST',
    endpoint: '/api/ops/hitl/requests/req-a1/resume',
  },
}
const DECIDE_AUTO = {
  ok: true,
  request: { id: 'req-a1', status: 'approved' },
  resume: {
    required: true,
    method: 'POST',
    endpoint: '/api/ops/hitl/requests/req-a1/resume',
    auto_triggered: true,
  },
}
const RESUME_OK = {
  ok: true,
  request: { id: 'req-a1', status: 'approved' },
  resume: { status: 'completed' },
  replay: {
    run_id: 'run-abcdef1234567890',
    cursor: 'run-abcdef1234567890:9',
    events_persisted: 3,
    events_failed: 0,
    persisted: true,
    re_interrupted: false,
  },
  ts: 1,
}

const mountedWrappers: ReturnType<typeof mount>[] = []

afterEach(() => {
  // 每用例卸载：避免 document 级 visibilitychange 监听在用例间泄漏（D7 断言依赖精确调用次数）
  for (const wrapper of mountedWrappers.splice(0)) wrapper.unmount()
})

function mountView() {
  const wrapper = mount(HitlApprovalView, {
    global: {
      plugins: [ElementPlus],
      stubs: { RouterLink: RouterLinkStub },
    },
  })
  mountedWrappers.push(wrapper)
  return wrapper
}

/** 二次确认通过（ElMessageBox.confirm resolve 'confirm' action） */
function mockConfirmPass() {
  return vi
    .spyOn(ElMessageBox, 'confirm')
    .mockImplementation(() =>
      Promise.resolve('confirm' as Awaited<ReturnType<typeof ElMessageBox.confirm>>),
    )
}

/** 二次确认取消（ElMessageBox.confirm reject 'cancel'） */
function mockConfirmCancel() {
  return vi
    .spyOn(ElMessageBox, 'confirm')
    .mockImplementation(() => Promise.reject(new Error('cancel')))
}

async function approveRow(wrapper: ReturnType<typeof mountView>) {
  await wrapper.find('[data-test="hitl-approve"]').trigger('click')
  await flushPromises()
}

describe('HitlApprovalView · TC1 列表渲染三态', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('加载中 → loading 态；完成后消失', async () => {
    let release: (v: { items: typeof ITEM_A[]; count: number }) => void = () => {}
    vi.mocked(fetchHitlPending).mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve
        }),
    )

    const wrapper = mountView()
    await flushPromises() // 让 onMounted 里的 refresh 渲染出 loading 态（deferred 未决）
    expect(wrapper.find('[data-test="hitl-loading"]').exists()).toBe(true)

    release({ items: [ITEM_A], count: 1 })
    await flushPromises()
    expect(wrapper.find('[data-test="hitl-loading"]').exists()).toBe(false)
  })

  it('2 条 pending：reason / blocked_by JSON 快照 / created_at+已等待 / id 截断展示', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A, ITEM_B], count: 2 })

    const wrapper = mountView()
    await flushPromises()

    const rows = wrapper.findAll('[data-test="hitl-row"]')
    expect(rows).toHaveLength(2)
    const text = wrapper.text()
    // reason
    expect(text).toContain('部署生产环境需审批')
    expect(text).toContain('删除历史数据')
    // blocked_by 只读 JSON 快照（审批人看到将要执行的确切内容）
    expect(text).toContain('"op": "deploy"')
    expect(text).toContain('"target": "prod"')
    expect(text).toContain('db.drop')
    // created_at 本地化渲染（D3/web-ux-state-sync · FP-9 title 保 UTC 原文 · 文本不再直出 ISO）
    const createdAt = rows[0].find('[data-test="hitl-created-at"]')
    expect(createdAt.exists()).toBe(true)
    expect(createdAt.attributes('title')).toBe('2026-10-20T01:00:00Z')
    expect(createdAt.text()).not.toContain('2026-10-20T01:00:00Z')
    expect(createdAt.text()).toContain('创建时间')
    expect(text).toContain('已等待')
    // thread_id / run_id 截断展示（文本内不出现完整 id）
    expect(text).toContain('run-abcdef12…')
    expect(text).toContain('thread-xyz98…')
    expect(text).not.toContain('run-abcdef1234567890')
    expect(text).not.toContain('thread-xyz9876543210')
  })

  it('items=[] → 空态「无待审批」，不渲染行', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-empty"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无待审批')
    expect(wrapper.findAll('[data-test="hitl-row"]')).toHaveLength(0)
  })
})

describe('HitlApprovalView · TC2 决策确认 + 防重', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
  })

  it('点批准 → 二次确认 → decide 恰好一次且 decision=approved；决策中按钮 disabled，连点无第二次请求', async () => {
    const confirmSpy = mockConfirmPass()
    let release: (v: typeof DECIDE_REQUIRED) => void = () => {}
    vi.mocked(decideHitlRequest).mockImplementation(
      () =>
        new Promise((resolve) => {
          release = resolve
        }),
    )

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-test="hitl-approve"]').trigger('click')
    await flushPromises()

    // 二次确认已弹；确认后 decide 恰好一次
    expect(confirmSpy).toHaveBeenCalledTimes(1)
    expect(decideHitlRequest).toHaveBeenCalledTimes(1)
    expect(decideHitlRequest).toHaveBeenCalledWith('req-a1', 'approved', undefined)

    // 决策中：批准/驳回按钮均 disabled；连续点击不产生第二次请求
    expect(wrapper.find('[data-test="hitl-approve"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-test="hitl-reject"]').attributes('disabled')).toBeDefined()
    await wrapper.find('[data-test="hitl-approve"]').trigger('click')
    await flushPromises()
    expect(decideHitlRequest).toHaveBeenCalledTimes(1)

    release(DECIDE_REQUIRED)
    await flushPromises()
  })

  it('二次确认取消 → 不调 decide', async () => {
    mockConfirmCancel()

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    expect(decideHitlRequest).not.toHaveBeenCalled()
  })
})

describe('HitlApprovalView · TC3 resume_mode 语义零分叉', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)
  })

  it('三选文案与 HitlApprovalCard 一致（续跑默认/批准即续跑/手动续跑）· 无第四选项 · 默认 inherit', async () => {
    const wrapper = mountView()
    await flushPromises()

    const group = wrapper.find('[data-test="hitl-resume-mode"]')
    expect(group.exists()).toBe(true)
    const options = group.findAll('.el-radio-button')
    expect(options).toHaveLength(3)
    expect(options[0].text()).toBe('续跑默认')
    expect(options[1].text()).toBe('批准即续跑')
    expect(options[2].text()).toBe('手动续跑')
  })

  it('默认 inherit：decide 第三参为 undefined（契约层不送 resume_mode 键）', async () => {
    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    expect(decideHitlRequest).toHaveBeenCalledTimes(1)
    const [, , mode] = vi.mocked(decideHitlRequest).mock.calls[0]
    expect(mode).toBeUndefined()
  })

  it('选 immediate：decide 第三参送 immediate', async () => {
    const wrapper = mountView()
    await flushPromises()

    // 原生 radio input 置 checked + change（jsdom 对 label/click 激活行为支持不全）
    const inputs = wrapper.findAll('[data-test="hitl-resume-mode"] input[type="radio"]')
    expect(inputs).toHaveLength(3)
    ;(inputs[1].element as HTMLInputElement).checked = true // 批准即续跑
    await inputs[1].trigger('change')
    await flushPromises()
    await approveRow(wrapper)
    expect(vi.mocked(decideHitlRequest).mock.calls[0][2]).toBe('immediate')
  })

  it('选 manual：decide 第三参送 manual', async () => {
    const wrapper = mountView()
    await flushPromises()

    const inputs = wrapper.findAll('[data-test="hitl-resume-mode"] input[type="radio"]')
    expect(inputs).toHaveLength(3)
    ;(inputs[2].element as HTMLInputElement).checked = true // 手动续跑
    await inputs[2].trigger('change')
    await flushPromises()
    await approveRow(wrapper)
    expect(vi.mocked(decideHitlRequest).mock.calls[0][2]).toBe('manual')
  })
})

describe('HitlApprovalView · TC4 两步链（decide ≠ 自动 resume）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
  })

  it('resume.required=true（无 auto_triggered）→ 出现「续跑」且未自动调 resume；点续跑 → resume 一次 → 「回到会话查看」= {name:chat} 无 query', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)
    vi.mocked(resumeHitlRequest).mockResolvedValue(RESUME_OK)

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    // FP-9 锁：decide 成功后未自动调 resumeHitlRequest
    expect(resumeHitlRequest).not.toHaveBeenCalled()
    // 行内出现显式「续跑」按钮
    const resumeBtn = wrapper.find('[data-test="hitl-resume"]')
    expect(resumeBtn.exists()).toBe(true)
    expect(resumeBtn.text()).toContain('续跑')
    // decide 成功后联动刷新 pending 列表
    expect(fetchHitlPending).toHaveBeenCalledTimes(2)

    await resumeBtn.trigger('click')
    await flushPromises()

    expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
    expect(resumeHitlRequest).toHaveBeenCalledWith('req-a1')

    // 「回到会话查看」入口：仅跳 { name: 'chat' }，不携 thread_id / 任何 query（D6）
    const back = wrapper.findComponent(RouterLinkStub)
    expect(back.exists()).toBe(true)
    expect(wrapper.find('[data-test="hitl-back-to-chat"]').exists()).toBe(true)
    expect(back.props('to')).toEqual({ name: 'chat' })
    // replay 摘要可见
    expect(wrapper.text()).toContain('run-abcdef1234567890:9')
  })
})

describe('HitlApprovalView · TC5 immediate auto_triggered 分支', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
  })

  it('auto_triggered=true → 无「续跑」按钮 · 显示已自动续跑提示 + 「回到会话查看」', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_AUTO)

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    expect(resumeHitlRequest).not.toHaveBeenCalled()
    expect(wrapper.find('[data-test="hitl-resume"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('已批准并自动续跑')
    const back = wrapper.findComponent(RouterLinkStub)
    expect(back.exists()).toBe(true)
    expect(back.props('to')).toEqual({ name: 'chat' })
  })
})

describe('HitlApprovalView · TC6 错误态', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('fetchHitlPending 403 → 权限错误态，不渲染列表', async () => {
    vi.mocked(fetchHitlPending).mockRejectedValue({ status: 403, message: 'Forbidden', raw: null })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-error-forbidden"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无权限查看审批列表')
    expect(wrapper.findAll('[data-test="hitl-row"]')).toHaveLength(0)
  })

  it('fetchHitlPending 网络失败 → 网络错误态 + 重试可恢复', async () => {
    vi.mocked(fetchHitlPending).mockRejectedValueOnce({ status: null, message: 'Network Error', raw: null })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-error-network"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('网络')

    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    await wrapper.find('[data-test="hitl-retry"]').trigger('click')
    await flushPromises()

    expect(fetchHitlPending).toHaveBeenCalledTimes(2)
    expect(wrapper.findAll('[data-test="hitl-row"]')).toHaveLength(1)
  })

  it('decide 过期失败 → 行级「审批已过期」类提示', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockRejectedValue({
      status: 409,
      message: 'approval request expired',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toContain('审批已过期')
  })

  it('decide 409（重复/已决）→ 行级「已被处理」类提示', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockRejectedValue({
      status: 409,
      message: 'request already decided',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toContain('已被处理')
  })
})

describe('HitlApprovalView · TC7 驳回路径', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
  })

  it('驳回二次确认 → decide decision=rejected；成功后列表刷新且该行不出现续跑按钮', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue({
      ok: true,
      request: { id: 'req-a1', status: 'rejected' },
      resume: { required: false, method: 'POST', endpoint: '' },
    })

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-test="hitl-reject"]').trigger('click')
    await flushPromises()

    expect(decideHitlRequest).toHaveBeenCalledTimes(1)
    expect(decideHitlRequest).toHaveBeenCalledWith('req-a1', 'rejected', undefined)
    // 列表联动刷新
    expect(fetchHitlPending).toHaveBeenCalledTimes(2)
    // 该行不出现续跑按钮
    expect(wrapper.find('[data-test="hitl-resume"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('已驳回')
  })
})

describe('HitlApprovalView · TC8 resume 错误态过期映射（task_web-hitl-resume-expired-mapping · W-web-1）', () => {
  // W-web-1：onResume catch 补 /过期|expired/i 映射，文案与 decide 路径（decideErrorText）同
  // 「审批已过期，请刷新列表」；非过期 409 透传与其余错误泛化既有行为零回归。
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)
  })

  /** 推进到 await_resume 行态并点「续跑」（resumeHitlRequest 由各用例 mock 拒绝） */
  async function triggerResume(wrapper: ReturnType<typeof mountView>) {
    await approveRow(wrapper)
    const resumeBtn = wrapper.find('[data-test="hitl-resume"]')
    expect(resumeBtn.exists()).toBe(true)
    await resumeBtn.trigger('click')
    await flushPromises()
  }

  it('resume 错误含「审批已过期」→ 行级提示「审批已过期，请刷新列表」（与 decide 路径同文案）', async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: 409,
      message: '审批已过期（approval_expired）',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await triggerResume(wrapper)

    expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toBe('审批已过期，请刷新列表')
  })

  // NIT-1 影响面（web-ux-state-sync）：本用例原断言「续跑失败：Resume is writing new events」409 透传，
  // 与 task_web_ux_state_sync D4/TC5 写窗中性化直接冲突 → 按 D4 改写（30 交付 · invoke 留痕）。
  it('resume 409 写窗错误（Resume is writing new events）→ D4 中性化「恢复写入中，请稍后重试」', async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: 409,
      message: 'Resume is writing new events',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await triggerResume(wrapper)

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toBe('恢复写入中，请稍后重试')
  })

  it('resume 其他错误（网络异常）→ 泛化文案「续跑失败（网络/服务异常），可重试」不变', async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: null,
      message: 'Network Error',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await triggerResume(wrapper)

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toBe('续跑失败（网络/服务异常），可重试')
  })
})

describe('HitlApprovalView · D7 刷新纪律（不轮询 · visibilitychange 边沿）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
  })

  it('hidden→visible 边沿刷新一次；visible→hidden 不刷；卸载后监听移除', async () => {
    const wrapper = mountView()
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(1)

    const hiddenSpy = vi.spyOn(document, 'hidden', 'get')

    // visible→hidden：不刷新
    hiddenSpy.mockReturnValue(true)
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(1)

    // hidden→visible：边沿刷新一次
    hiddenSpy.mockReturnValue(false)
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(2)

    // 卸载后监听移除：再切不再刷
    wrapper.unmount()
    document.dispatchEvent(new Event('visibilitychange'))
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(2)

    hiddenSpy.mockRestore()
  })
})

/* ==================== task_web_ux_state_sync（30 · 红测先行） ==================== */

/** sessionStorage 已决区键（D1 · FP-3 版本字段 · FIFO 20） */
const DECIDED_KEY = 'ops.hitl.decided.v1'

interface DecidedSnapshotFixture {
  v: number
  id: string
  item: typeof ITEM_A
  decision: 'approved' | 'rejected' | null
  status: string
  replay: { run_id: string; cursor: string } | null
  decidedAt: number
}

function makeSnapshot(i: number, status = 'await_resume'): DecidedSnapshotFixture {
  return {
    v: 1,
    id: `req-s${i}`,
    item: {
      id: `req-s${i}`,
      run_id: `run-s${i}`,
      thread_id: `thread-s${i}`,
      reason: `历史审批 ${i}`,
      blocked_by: { op: 'snapshot', target: 'fixture' },
      created_at: '2026-10-20T01:00:00Z',
    },
    decision: 'approved',
    status,
    replay: null,
    decidedAt: 1_730_000_000_000 + i,
  }
}

function readDecidedStorage(): DecidedSnapshotFixture[] {
  const raw = window.sessionStorage.getItem(DECIDED_KEY)
  return raw ? (JSON.parse(raw) as DecidedSnapshotFixture[]) : []
}

describe('HitlApprovalView · state-sync TC1 已决区回灌（D1 · F1 会话内保留）', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    vi.mocked(resumeHitlRequest).mockResolvedValue(RESUME_OK)
  })

  it('mount 回灌：预置 v=1 快照（approved·待续跑）→ 已决区分组渲染 · 显式「续跑」入口在 → 点击走 resumeHitlRequest 一次', async () => {
    window.sessionStorage.setItem(DECIDED_KEY, JSON.stringify([makeSnapshot(0)]))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-decided"]').exists()).toBe(true)
    const decidedRows = wrapper.findAll('[data-test="hitl-decided-row"]')
    expect(decidedRows).toHaveLength(1)
    expect(decidedRows[0].text()).toContain('历史审批 0')
    const resumeBtn = wrapper.find('[data-test="hitl-decided-resume"]')
    expect(resumeBtn.exists()).toBe(true)

    await resumeBtn.trigger('click')
    await flushPromises()

    expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
    expect(resumeHitlRequest).toHaveBeenCalledWith('req-s0')
  })

  it('快照版本字段校验：v 非 1 → 整键丢弃（FP-3）· 页面不炸', async () => {
    const bad = { ...makeSnapshot(0), v: 2 }
    window.sessionStorage.setItem(DECIDED_KEY, JSON.stringify([bad]))

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-decided"]').exists()).toBe(false)
    expect(window.sessionStorage.getItem(DECIDED_KEY)).toBeNull()
  })
})

describe('HitlApprovalView · state-sync TC2 已决区落盘 + 重挂载可见（D1 · F2）', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
  })

  it('decide 成功 → sessionStorage 快照（id+六键 item+决策+两步链态+版本字段）；卸载重挂已决区仍在', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    const stored = readDecidedStorage()
    expect(stored).toHaveLength(1)
    expect(stored[0].v).toBe(1)
    expect(stored[0].id).toBe('req-a1')
    expect(stored[0].decision).toBe('approved')
    expect(stored[0].status).toBe('await_resume')
    expect(stored[0].item).toMatchObject({
      id: 'req-a1',
      run_id: 'run-abcdef1234567890',
      thread_id: 'thread-xyz9876543210',
      reason: '部署生产环境需审批',
      created_at: '2026-10-20T01:00:00Z',
    })

    // 会话内保留：卸载重挂（同 tab · sessionStorage 存续）→ 已决区仍渲染 + 续跑入口在
    wrapper.unmount()
    const remounted = mountView()
    await flushPromises()

    expect(remounted.find('[data-test="hitl-decided"]').exists()).toBe(true)
    expect(remounted.findAll('[data-test="hitl-decided-row"]')).toHaveLength(1)
    expect(remounted.find('[data-test="hitl-decided-resume"]').exists()).toBe(true)
  })
})

describe('HitlApprovalView · state-sync TC3 已决区降级三态（D1 · FP-2/3/12）', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)
  })

  it('FP-2 写失败静默降级：setItem 抛错 → 不炸屏 · 已决区内存态仍渲染 · 键未写入', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded')
    })

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)

    // 页面未崩 · 内存降级态可渲染已决区（等同现状不劣化）
    expect(wrapper.find('[data-test="hitl-decided"]').exists()).toBe(true)
    expect(window.sessionStorage.getItem(DECIDED_KEY)).toBeNull()
  })

  it('FP-3 损坏 JSON → 整键丢弃 · 已决区不渲染 · 页面正常', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    window.sessionStorage.setItem(DECIDED_KEY, '{corrupted')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-test="hitl-decided"]').exists()).toBe(false)
    expect(window.sessionStorage.getItem(DECIDED_KEY)).toBeNull()
    expect(wrapper.find('[data-test="hitl-empty"]').exists()).toBe(true)
  })

  it('FP-12 FIFO 20：预置 21 条 → 回灌后仅存最新 20 条（最旧被挤掉）', async () => {
    window.sessionStorage.setItem(
      DECIDED_KEY,
      JSON.stringify(Array.from({ length: 21 }, (_, i) => makeSnapshot(i))),
    )

    const wrapper = mountView()
    await flushPromises()

    const decidedRows = wrapper.findAll('[data-test="hitl-decided-row"]')
    expect(decidedRows).toHaveLength(20)
    // 最旧的 req-s0 被挤掉 · 最新 req-s20 在列
    expect(decidedRows[0].text()).not.toContain('历史审批 0')
    expect(wrapper.text()).not.toContain('历史审批 0')
    expect(wrapper.text()).toContain('历史审批 20')
  })
})

describe('HitlApprovalView · state-sync TC4 created_at 本地化（D3 · NIT-3）', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('合法 ISO → Intl 本地时区渲染 · title 保 UTC 原文 · 文本不直出 ISO', async () => {
    const iso = '2026-11-03T06:51:59+00:00'
    vi.mocked(fetchHitlPending).mockResolvedValue({
      items: [{ ...ITEM_A, created_at: iso }],
      count: 1,
    })

    const wrapper = mountView()
    await flushPromises()

    const createdAt = wrapper.find('[data-test="hitl-created-at"]')
    expect(createdAt.exists()).toBe(true)
    // 期望值与组件同参 Intl 计算（不钉 TZ · 避免环境时区脆弱）
    const expected = new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(new Date(iso))
    expect(createdAt.text()).toContain(expected)
    expect(createdAt.attributes('title')).toBe(iso)
    expect(createdAt.text()).not.toContain(iso)
  })

  it('非法 created_at → 回退原文渲染（不炸 · title 同原文）', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({
      items: [{ ...ITEM_A, created_at: 'not-a-date' }],
      count: 1,
    })

    const wrapper = mountView()
    await flushPromises()

    const createdAt = wrapper.find('[data-test="hitl-created-at"]')
    expect(createdAt.exists()).toBe(true)
    expect(createdAt.text()).toContain('not-a-date')
    expect(createdAt.attributes('title')).toBe('not-a-date')
  })
})

describe('HitlApprovalView · state-sync TC5 resume 409 写窗中性化（D4）', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.restoreAllMocks()
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [ITEM_A], count: 1 })
    mockConfirmPass()
    vi.mocked(decideHitlRequest).mockResolvedValue(DECIDE_REQUIRED)
  })

  it("子串 'settles'（blocked until the run settles）→「恢复写入中，请稍后重试」", async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: 409,
      message: 'blocked until the run settles',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)
    await wrapper.find('[data-test="hitl-resume"]').trigger('click')
    await flushPromises()

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toBe('恢复写入中，请稍后重试')
  })

  it('D4 未命中维持透传：409 非写窗（generic conflict）→「续跑失败：generic conflict」', async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: 409,
      message: 'generic conflict',
      raw: null,
    })

    const wrapper = mountView()
    await flushPromises()
    await approveRow(wrapper)
    await wrapper.find('[data-test="hitl-resume"]').trigger('click')
    await flushPromises()

    const rowError = wrapper.find('[data-test="hitl-row-error"]')
    expect(rowError.exists()).toBe(true)
    expect(rowError.text()).toBe('续跑失败：generic conflict')
  })

  it('已决区续跑 409 写窗 → 同样中性化（resumeErrorText 共享落点）', async () => {
    vi.mocked(resumeHitlRequest).mockRejectedValue({
      status: 409,
      message: 'Resume is writing new events',
      raw: null,
    })
    window.sessionStorage.setItem(DECIDED_KEY, JSON.stringify([makeSnapshot(0)]))

    const wrapper = mountView()
    await flushPromises()
    await wrapper.find('[data-test="hitl-decided-resume"]').trigger('click')
    await flushPromises()

    const decidedError = wrapper.find('[data-test="hitl-decided-error"]')
    expect(decidedError.exists()).toBe(true)
    expect(decidedError.text()).toBe('恢复写入中，请稍后重试')
  })
})

