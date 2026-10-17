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
import { decideHitlRequest, fetchHitlPending, resumeHitlRequest } from '../src/api/hitl'
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

function apiError(status: number, message = 'err'): ApiError {
  return { status, message, raw: null }
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

  it('T-W2 AC：waiting 卡片渲染 resume_mode 三选（默认 inherit）；默认批准 → decide 精确 2 参（不送键）', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue({
      ok: true,
      request: { id: 'req-42', status: 'approved' },
      resume: { required: true, method: 'POST', endpoint: '/api/ops/hitl/requests/req-42/resume' },
    })
    vi.mocked(resumeHitlRequest).mockResolvedValue({
      ok: true,
      request: {},
      resume: {},
      replay: {
        run_id: 'r-1',
        cursor: 'r-1:9',
        events_persisted: 3,
        events_failed: 0,
        persisted: true,
        re_interrupted: false,
      },
      ts: 1,
    })
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署生产服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      run_id: 'r-1',
      seq: 2,
      payload: { reason: '需审批', requests: [{ id: 'req-42' }] },
    })
    // done{waiting_approval} 后 streaming=false → 卡片控件解锁
    captured.onEvent?.({
      event_type: 'done',
      run_id: 'r-1',
      seq: 3,
      payload: { status: 'waiting_approval' },
    })
    await flushPromises()

    const group = wrapper.find('[data-test="hitl-resume-mode"]')
    expect(group.exists()).toBe(true)
    expect(group.findAll('.el-radio-button')).toHaveLength(3)
    expect(group.text()).toContain('续跑默认')
    expect(group.text()).toContain('批准即续跑')
    expect(group.text()).toContain('手动续跑')

    await wrapper.find('.hitl-card__approve').trigger('click')
    await flushPromises()

    // 默认 inherit = 不送 resume_mode 键（精确 2 参 · 与 tests/chat-store-hitl.spec.ts AC8 同钉）
    expect(decideHitlRequest).toHaveBeenCalledWith('req-42', 'approved')
    expect(vi.mocked(decideHitlRequest).mock.calls[0]).toHaveLength(2)
    expect(resumeHitlRequest).toHaveBeenCalledWith('req-42')
  })

  it('T-W2 AC：选「批准即续跑」→ decide 携 resume_mode=immediate；响应 auto_triggered → 不再链 resume', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue({
      ok: true,
      request: { id: 'req-42', status: 'approved' },
      resume: {
        required: false,
        auto_triggered: true,
        method: 'POST',
        endpoint: '/api/ops/hitl/requests/req-42/resume',
      },
    })
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署生产服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      run_id: 'r-1',
      seq: 2,
      payload: { reason: '需审批', requests: [{ id: 'req-42' }] },
    })
    // done{waiting_approval} 后 streaming=false → 卡片控件解锁
    captured.onEvent?.({
      event_type: 'done',
      run_id: 'r-1',
      seq: 3,
      payload: { status: 'waiting_approval' },
    })
    await flushPromises()

    const radios = wrapper.findAll('[data-test="hitl-resume-mode"] .el-radio-button')
    expect(radios).toHaveLength(3)
    // EP el-radio-button：v-model 绑在内部原生 input 的 change 上（jsdom label 点击不转发）→ 直驱 input
    await radios[1].find('input').setValue(true) // immediate「批准即续跑」
    await flushPromises()

    await wrapper.find('.hitl-card__approve').trigger('click')
    await flushPromises()

    expect(decideHitlRequest).toHaveBeenCalledWith('req-42', 'approved', 'immediate')
    expect(resumeHitlRequest).not.toHaveBeenCalled()
    expect(chat.messages[1].hitl?.status).toBe('decided')
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

  it('TC-W1/W2/W3 视图：running 半截+生成中无继续回复；error 半截+继续回复按钮（≠续看）', async () => {
    const partial = '半截可见答案'
    vi.mocked(fetchThreadHistory).mockResolvedValue({
      thread_id: 't-cta',
      runs: [
        {
          run_id: 'r-run',
          started_at: '2026-10-14T01:00:00',
          query: '问 running',
          answer: partial,
          answer_truncated: false,
          subtasks: [],
          terminal_status: 'running',
          hitl: [],
        },
      ],
      next_cursor: null,
    })
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    await chat.openHistoryThread('t-cta')
    await flushPromises()

    expect(wrapper.find('.chat-message--assistant .chat-message__text').text()).toBe(partial)
    expect(wrapper.find('[data-test="run-status-running"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="run-status-running"]').text()).toContain('生成中')
    expect(wrapper.find('[data-test="continue-reply"]').exists()).toBe(false)
    // 文案分词：续看按钮不因 History running 出现（无 active-run）
    expect(wrapper.text()).not.toContain('继续回复')

    vi.mocked(fetchThreadHistory).mockResolvedValue({
      thread_id: 't-cta',
      runs: [
        {
          run_id: 'r-err',
          started_at: '2026-10-14T01:00:00',
          query: '问 error',
          answer: partial,
          answer_truncated: false,
          subtasks: [],
          terminal_status: 'error',
          hitl: [],
        },
      ],
      next_cursor: null,
    })
    await chat.openHistoryThread('t-cta')
    await flushPromises()

    expect(wrapper.find('.chat-message--assistant .chat-message__text').text()).toBe(partial)
    expect(wrapper.find('[data-test="continue-reply"]').exists()).toBe(true)
    expect(wrapper.find('[data-test="continue-reply"]').text()).toBe('继续回复')
    // 与「续看」分词：错误条无 active-run → 不渲染续看
    const resumeButtons = wrapper
      .findAll('button')
      .filter((b) => b.text().trim() === '续看')
    expect(resumeButtons.length).toBe(0)

    await wrapper.find('[data-test="continue-reply"]').trigger('click')
    await flushPromises()
    expect(streamLgRag).toHaveBeenCalledWith(
      expect.objectContaining({
        threadId: 't-cta',
        continueFromRunId: 'r-err',
        query: '请继续完成回答。',
      }),
      expect.any(Object),
    )
    expect(resumeHitlRequest).not.toHaveBeenCalled()
  })

  it('R1-NIT-2 / TC3 徽标（裁定 A）：done 缺 latency_ms → 耗时段显「—」（非 0ms）；携实值 → 如实渲染', async () => {
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('问')
    captured.onEvent?.({
      event_type: 'run.start',
      run_id: 'r-1',
      seq: 1,
      payload: { run_id: 'r-1', thread_id: 't-1' },
    })
    // 缺 latency_ms（pre-fix 历史旧帧残留面）：耗时段显「—」如实不误导（禁假 0ms）
    captured.onEvent?.({
      event_type: 'done',
      run_id: 'r-1',
      seq: 2,
      payload: { status: 'resumed' },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('完成 · 耗时 —')
    expect(wrapper.text()).not.toContain('0ms')
    // 裁定 B：model 恒缺键 → 模型段不渲染（v-if 零改动）
    expect(wrapper.text()).not.toContain('模型')

    // F-OBS-1 闭环：携 latency_ms 实值（live 实证 139650）→ 原样渲染
    chat.sendMessage('再问')
    captured.onEvent?.({
      event_type: 'run.start',
      run_id: 'r-2',
      seq: 1,
      payload: { run_id: 'r-2', thread_id: 't-1' },
    })
    captured.onEvent?.({
      event_type: 'done',
      run_id: 'r-2',
      seq: 2,
      payload: { status: 'resumed', latency_ms: 139650 },
    })
    await flushPromises()

    expect(wrapper.text()).toContain('完成 · 耗时 139650ms')
  })

  it('TC1：挂载 Chat 页即拉 pending 恰 1 次（S1 事件驱动 · 零定时器轮询）', async () => {
    mountView()
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(1)
  })

  it('TC1：pending 拉取 403/501/网络错 → 降级文案呈现 · 主路径（提问/流式）不阻塞', async () => {
    // 403 → 无审批权限
    vi.mocked(fetchHitlPending).mockRejectedValue(apiError(403, 'forbidden'))
    const wrapper = mountView()
    await flushPromises()
    expect(wrapper.find('[data-test="hitl-pending-error"]').text()).toContain('无审批权限')
    // 主路径不阻塞：仍可提问进入流式
    const chat = useChatStore()
    chat.sendMessage('还能提问')
    expect(chat.streaming).toBe(true)
    expect(chat.messages[0].content).toBe('还能提问')

    // 501 → 审批服务暂不可用
    vi.mocked(fetchHitlPending).mockRejectedValue(apiError(501, 'not implemented'))
    const wrapper501 = mountView()
    await flushPromises()
    expect(wrapper501.find('[data-test="hitl-pending-error"]').text()).toContain('审批服务暂不可用')

    // 网络错（无 status）→ 同中性降级
    vi.mocked(fetchHitlPending).mockRejectedValue({ message: 'Network Error' })
    const wrapperNet = mountView()
    await flushPromises()
    expect(wrapperNet.find('[data-test="hitl-pending-error"]').text()).toContain('审批服务暂不可用')
  })

  it('TC2：pending 非空 → 提示行「待审批 N 条」+ 手动刷新按钮再拉恰 1 次', async () => {
    vi.mocked(fetchHitlPending).mockResolvedValue({
      items: [
        {
          id: 'req-9',
          run_id: 'r-9',
          thread_id: 't-9',
          reason: '高危操作需审批',
          blocked_by: null,
          created_at: '2026-10-17T00:00:00Z',
        },
      ],
      count: 1,
    })
    const wrapper = mountView()
    await flushPromises()

    const hint = wrapper.find('[data-test="hitl-pending-hint"]')
    expect(hint.exists()).toBe(true)
    expect(hint.text()).toContain('待审批 1 条')
    expect(fetchHitlPending).toHaveBeenCalledTimes(1) // 挂载 1 次

    await wrapper.find('[data-test="hitl-pending-refresh"]').trigger('click')
    await flushPromises()
    expect(fetchHitlPending).toHaveBeenCalledTimes(2) // 手动刷新再拉恰 1 次
  })

  it('TC6 DOM：resume 200 携 cursor → 追帧 done{resumed,latency_ms:435584} → 徽标 435584ms 且模型段 DOM 不存在', async () => {
    vi.mocked(decideHitlRequest).mockResolvedValue({
      ok: true,
      request: { id: 'req-1', status: 'approved' },
      resume: { required: true, method: 'POST', endpoint: '/api/ops/hitl/requests/req-1/resume' },
    })
    vi.mocked(resumeHitlRequest).mockResolvedValue({
      ok: true,
      request: {},
      resume: {},
      replay: {
        run_id: 'r-1',
        cursor: 'r-1:2',
        events_persisted: 3,
        events_failed: 0,
        persisted: true,
        re_interrupted: false,
      },
      ts: 1,
    })
    vi.mocked(replayLgRag).mockImplementation((_input, cb) => {
      cb?.onEvent?.({ event_type: 'hitl.resumed', run_id: 'r-1', seq: 3, payload: {} })
      cb?.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 4, payload: { delta: '恢复后的回答' } })
      cb?.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 5,
        payload: { status: 'resumed', latency_ms: 435584 },
      })
      cb?.onDone?.()
      return { abort: vi.fn(), done: Promise.resolve() }
    })
    const wrapper = mountView()
    await flushPromises()
    const chat = useChatStore()

    chat.sendMessage('部署服务')
    captured.onEvent?.({
      event_type: 'run.start',
      run_id: 'r-1',
      seq: 1,
      payload: { run_id: 'r-1', thread_id: 't-1' },
    })
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      run_id: 'r-1',
      seq: 2,
      payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
    })
    await flushPromises()

    await chat.decideHitl(chat.messages[1], 'req-1', 'approved')
    await flushPromises()

    // 徽标如实渲染 latency_ms（TC12 同帧形：无 model 键 → 模型段 DOM 不存在）
    expect(wrapper.text()).toContain('435584ms')
    expect(wrapper.text()).not.toContain('模型')
    expect(wrapper.text()).toContain('恢复后的回答')
  })
})
