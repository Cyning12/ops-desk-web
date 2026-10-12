import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ApiError } from '../src/api/http'
import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'

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
import type { ChatThreadHistoryPage } from '../src/api/chatHistory'
import { decideHitlRequest, fetchHitlPending, resumeHitlRequest } from '../src/api/hitl'
import type { HitlDecideResponse } from '../src/api/hitl'
import { replayLgRag, streamLgRag } from '../src/composables/useLgRagSse'
import {
  LG_RAG_ACTIVE_RUN_STORAGE_KEY,
  useChatStore,
} from '../src/stores/chat'

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let captured: LgRagSseCallbacks

function apiError(status: number, message = 'err'): ApiError {
  return { status, message, raw: null }
}

/** 注入一帧 run.start（带 run_id/seq · processFrame 持久化 active-run） */
function emitRunStart(runId: string, threadId = 't-1'): void {
  captured.onEvent?.({
    event_type: 'run.start',
    run_id: runId,
    seq: 1,
    agent_role: 'system',
    payload: { run_id: runId, thread_id: threadId, mode: 'supervisor' },
  })
}

describe('stores/chat · F2 HITL 审批形态 + F1 历史（web-chat-history-hitl-ux）', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()

    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: vi.fn(), done: Promise.resolve() }
    })
    vi.mocked(replayLgRag).mockImplementation(() => ({
      abort: vi.fn(),
      done: Promise.resolve(),
    }))
    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })

    const chat = useChatStore()
    await chat.loadLatestSession()
  })

  describe('AC7 · hitl.waiting 帧 → 审批卡片态（现状 default 忽略 → 改后入列）', () => {
    it('payload {reason, requests:[{id}]} → message.hitl waiting（reason + 申请 id 入列）', () => {
      const chat = useChatStore()
      chat.sendMessage('部署服务')

      captured.onEvent?.({
        event_type: 'hitl.waiting',
        run_id: 'r-1',
        seq: 2,
        payload: { reason: '高危操作需人工审批', requests: [{ id: 'req-1', reason: '高危操作需人工审批' }] },
      })

      const assistant = chat.messages[1]
      expect(assistant.hitl).not.toBeNull()
      expect(assistant.hitl?.status).toBe('waiting')
      expect(assistant.hitl?.reason).toBe('高危操作需人工审批')
      expect(assistant.hitl?.requests.map((request) => request.id)).toEqual(['req-1'])
      // 不当完成态：流仍在进行
      expect(chat.streaming).toBe(true)
      expect(chat.lastDone).toBeNull()
    })

    it('FP-F11：缺 requests / 空 requests[] → 降级 unavailable（仅 reason · 不崩 · 不当完成态）', () => {
      const chat = useChatStore()
      chat.sendMessage('部署服务')

      captured.onEvent?.({
        event_type: 'hitl.waiting',
        payload: { reason: '需要审批' },
      })
      const assistant = chat.messages[1]
      expect(assistant.hitl?.status).toBe('unavailable')
      expect(assistant.hitl?.note).toBe('审批详情不可用')
      expect(assistant.hitl?.requests).toEqual([])

      captured.onEvent?.({
        event_type: 'hitl.waiting',
        payload: { reason: '需要审批', requests: [] },
      })
      expect(assistant.hitl?.status).toBe('unavailable')

      // 非 dict 条目被丢弃
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        payload: { reason: '需要审批', requests: ['bad', null, { id: 'req-2' }] },
      })
      expect(assistant.hitl?.status).toBe('waiting')
      expect(assistant.hitl?.requests).toHaveLength(1)
    })
  })

  describe('AC10 · done 按 payload.status 分支（FP-F1 修 bug 钉死）', () => {
    it("done{status:'waiting_approval'} → streaming=false + activeRun 保留 + 待审批视觉在", () => {
      const chat = useChatStore()
      chat.sendMessage('部署服务')
      emitRunStart('r-1')
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        run_id: 'r-1',
        seq: 2,
        payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
      })
      expect(chat.activeRun?.run_id).toBe('r-1')

      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 3,
        payload: { status: 'waiting_approval', latency_ms: 500, model: 'm-1' },
      })

      expect(chat.streaming).toBe(false)
      // waiting_approval ≠ 完成态：不清场（续看游标保留 · 审批后接力）
      expect(chat.activeRun).not.toBeNull()
      expect(chat.activeRun?.run_id).toBe('r-1')
      expect(window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)).not.toBeNull()
      // 待审批视觉持续（卡片不清除）
      expect(chat.messages[1].hitl?.status).toBe('waiting')
      expect(chat.canResume).toBe(true)
    })

    it("done{status:'completed'} → activeRun 清除（维持现行）", () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { status: 'completed', latency_ms: 1, model: '' },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)).toBeNull()
    })

    it("done{status:'resumed'}（T-W2 S3 实证真值字面）→ 终态清除 + lastDone 兜底（缺 latency_ms/model → 0/''）", () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      // S3 实证：resume 收尾 done 帧 payload.status='resumed' 且 latency_ms/model 缺省
      // （ops-desk-api resume.py close() · 终态以 done 帧为准 · 前端禁等 completed 字面）
      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { status: 'resumed' },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)).toBeNull()
      expect(chat.lastDone).toEqual({ latency_ms: 0, model: '' })
    })

    it("done{status:'failed'} → activeRun 清除（维持现行）", () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { status: 'failed' },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
    })

    it('done 无 status（旧帧）→ activeRun 清除（维持现行 · AC17 subset 安全）', () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { latency_ms: 12, model: 'm' },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.lastDone).toEqual({ latency_ms: 12, model: 'm' })
      expect(chat.activeRun).toBeNull()
    })
  })

  describe('T-W2 S2 · 未知帧 default 容错（SPEC §3.3 钉案 · 帧型前瞻兼容）', () => {
    it('hitl.resumed / tool_call / 未来帧型穿插 → 不崩 · 已知帧照常渲染 · 终态 done 照常清除', () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      // 后端真实帧型 hitl.resumed（resume 续跑宣告 · 前端无显式 case → default 忽略）
      captured.onEvent?.({
        event_type: 'hitl.resumed',
        run_id: 'r-1',
        seq: 2,
        payload: { request_id: 'req-1', decided_by: 'admin' },
      })
      // 既有未展示帧型（chat.ts default 注释在案：tool_call / model.fallback）
      captured.onEvent?.({
        event_type: 'tool_call',
        run_id: 'r-1',
        seq: 3,
        payload: { tool: 'x' },
      })
      // 前瞻未知帧型（未来后端新增）同路径容错
      captured.onEvent?.({
        event_type: 'x.future.v2',
        run_id: 'r-1',
        seq: 4,
        payload: { anything: true },
      })
      // 未知帧不得改写 hitl 审批态 / 不得置错
      expect(chat.error).toBeNull()
      expect(chat.messages[1].hitl).toBeNull()
      expect(chat.streaming).toBe(true)

      // 已知帧仍正常消费 + 终态照常
      captured.onEvent?.({
        event_type: 'answer',
        run_id: 'r-1',
        seq: 5,
        payload: { content: '答' },
      })
      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 6,
        payload: { status: 'resumed' },
      })

      expect(chat.messages[1].content).toBe('答')
      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
    })
  })

  describe('AC8 · 审批动作链：decide → resume 两步链式（契约钉 decide 不自动 resume）', () => {
    function seedWaitingCard() {
      const chat = useChatStore()
      chat.sendMessage('部署服务')
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
      })
      return chat
    }

    it('点「批准」→ POST decide {decision:approved} → 成功后 POST resume（调用顺序钉死）', async () => {
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
          cursor: 'r-1:9',
          events_persisted: 3,
          events_failed: 0,
          persisted: true,
          re_interrupted: false,
        },
        ts: 1,
      })
      const chat = seedWaitingCard()
      const assistant = chat.messages[1]

      await chat.decideHitl(assistant, 'req-1', 'approved')

      expect(decideHitlRequest).toHaveBeenCalledTimes(1)
      expect(decideHitlRequest).toHaveBeenCalledWith('req-1', 'approved')
      expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
      expect(resumeHitlRequest).toHaveBeenCalledWith('req-1')
      // decide 先于 resume（两步链 · 顺序断言）
      expect(vi.mocked(decideHitlRequest).mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(resumeHitlRequest).mock.invocationCallOrder[0],
      )
      expect(assistant.hitl?.status).toBe('decided')
      expect(assistant.hitl?.decision).toBe('approved')
      expect(assistant.hitl?.note).toContain('已批准')
      // AC16①：动作链完成后刷新审批态
      expect(fetchHitlPending).toHaveBeenCalled()
      expect(chat.error).toBeNull()
    })

    it('T-W2：immediate 决定 → decide 携 resume_mode=immediate；响应 required=false → 跳过第二步 resume（防撞 409 · S3 实证）', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue({
        ok: true,
        request: { id: 'req-1', status: 'approved' },
        resume: {
          required: false,
          auto_triggered: true,
          method: 'POST',
          endpoint: '/api/ops/hitl/requests/req-1/resume',
        },
      })
      const chat = seedWaitingCard()
      const assistant = chat.messages[1]

      await chat.decideHitl(assistant, 'req-1', 'approved', 'immediate')

      expect(decideHitlRequest).toHaveBeenCalledWith('req-1', 'approved', 'immediate')
      expect(resumeHitlRequest).not.toHaveBeenCalled()
      expect(assistant.hitl?.status).toBe('decided')
      expect(chat.error).toBeNull()
    })

    it('点「驳回」→ {decision:rejected} → resume；note 已驳回', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue({
        ok: true,
        request: {},
        resume: { required: true, method: 'POST', endpoint: '' },
      })
      vi.mocked(resumeHitlRequest).mockResolvedValue({
        ok: true,
        request: {},
        resume: {},
        replay: {
          run_id: 'r-1',
          cursor: '',
          events_persisted: 0,
          events_failed: 0,
          persisted: true,
          re_interrupted: false,
        },
        ts: 1,
      })
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'rejected')

      expect(decideHitlRequest).toHaveBeenCalledWith('req-1', 'rejected')
      expect(resumeHitlRequest).toHaveBeenCalledWith('req-1')
      expect(chat.messages[1].hitl?.note).toContain('已驳回')
    })

    it('动作中 acting 禁重复点击：并发第二次调用 decide 仅一次', async () => {
      const decideResult: HitlDecideResponse = {
        ok: true,
        request: {},
        resume: { required: true, method: 'POST', endpoint: '' },
      }
      let resolveDecide: (value: HitlDecideResponse) => void = () => {}
      vi.mocked(decideHitlRequest).mockImplementation(
        () =>
          new Promise<HitlDecideResponse>((resolve) => {
            resolveDecide = resolve
          }),
      )
      const chat = seedWaitingCard()
      const assistant = chat.messages[1]

      const first = chat.decideHitl(assistant, 'req-1', 'approved')
      expect(assistant.hitl?.status).toBe('acting')
      await chat.decideHitl(assistant, 'req-1', 'approved') // 重复点击被挡
      expect(decideHitlRequest).toHaveBeenCalledTimes(1)

      resolveDecide(decideResult)
      vi.mocked(resumeHitlRequest).mockResolvedValue({
        ok: true,
        request: {},
        resume: {},
        replay: {
          run_id: 'r-1',
          cursor: '',
          events_persisted: 0,
          events_failed: 0,
          persisted: true,
          re_interrupted: false,
        },
        ts: 1,
      })
      await first
      expect(assistant.hitl?.status).toBe('decided')
    })

    it('decide 失败则不调 resume（两步链不裸奔）', async () => {
      vi.mocked(decideHitlRequest).mockRejectedValue(apiError(500, 'boom'))
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(resumeHitlRequest).not.toHaveBeenCalled()
      // 网络/其他错误 → 回 waiting 可重试，不弹全局错误条
      expect(chat.messages[1].hitl?.status).toBe('waiting')
      expect(chat.messages[1].hitl?.note).toBe('boom')
      expect(chat.error).toBeNull()
    })
  })

  describe('AC9 · 分态处置（409/404/403/401）', () => {
    function seedWaitingCard() {
      const chat = useChatStore()
      chat.sendMessage('部署服务')
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
      })
      return chat
    }

    it('decide 409 → 卡片转「已被处理」态且不弹错误条 + 刷新审批态（FP-F2）', async () => {
      vi.mocked(decideHitlRequest).mockRejectedValue(apiError(409, '申请已是 approved'))
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(chat.messages[1].hitl?.status).toBe('resolved')
      expect(chat.messages[1].hitl?.note).toBe('该申请已被处理')
      expect(chat.error).toBeNull() // 不弹错误条
      expect(fetchHitlPending).toHaveBeenCalled() // 刷新审批态
      expect(resumeHitlRequest).not.toHaveBeenCalled()
    })

    it('decide 404 → 中性提示「申请不存在或已处理」（FP-F10 不泄露）', async () => {
      vi.mocked(decideHitlRequest).mockRejectedValue(apiError(404, '申请不存在'))
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(chat.messages[1].hitl?.status).toBe('resolved')
      expect(chat.messages[1].hitl?.note).toBe('申请不存在或已处理')
      expect(chat.error).toBeNull()
    })

    it('decide 403 → forbidden 降级「无审批权限」（FP-F4 不炸屏）', async () => {
      vi.mocked(decideHitlRequest).mockRejectedValue(apiError(403, 'forbidden'))
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(chat.messages[1].hitl?.status).toBe('forbidden')
      expect(chat.messages[1].hitl?.note).toBe('无审批权限')
      expect(chat.error).toBeNull()
    })

    it('decide 401 → 卡片回 waiting（全局跳登录由 http 拦截器负责 · 不弹错误条）', async () => {
      vi.mocked(decideHitlRequest).mockRejectedValue(apiError(401, 'unauthorized'))
      const chat = seedWaitingCard()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(chat.messages[1].hitl?.status).toBe('waiting')
      expect(chat.error).toBeNull()
    })
  })

  describe('F1 · openHistoryThread（B1 history → 既有 ChatMessage 映射 · 裁定 F-C）', () => {
    const RUN_COMPLETED = {
      run_id: 'r-1',
      started_at: '2026-10-04T00:59:00',
      query: '为什么部署失败',
      answer: '因为配置缺失',
      answer_truncated: false,
      subtasks: [{ seq: 3, agent_role: 'rag_subtask', status: 'done', message: '检索完成' }],
      terminal_status: 'completed',
      hitl: [],
    }

    it('AC2：按 run 序映射 query→user / answer→assistant / subtasks→子任务过程；threadId 切入', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-9',
        runs: [
          RUN_COMPLETED,
          { ...RUN_COMPLETED, run_id: 'r-2', query: '追问', answer: '追答', subtasks: [] },
        ],
        next_cursor: null,
      })
      const chat = useChatStore()

      await chat.openHistoryThread('t-9')

      expect(fetchThreadHistory).toHaveBeenCalledWith('t-9')
      expect(chat.messages).toHaveLength(4)
      expect(chat.messages[0]).toMatchObject({ role: 'user', content: '为什么部署失败' })
      expect(chat.messages[1]).toMatchObject({ role: 'assistant', content: '因为配置缺失' })
      expect(chat.messages[1].subtasks).toHaveLength(1)
      expect(chat.messages[1].subtasks[0]).toMatchObject({ role: 'rag_subtask', status: 'done' })
      expect(chat.messages[2]).toMatchObject({ role: 'user', content: '追问' })
      expect(chat.messages[3]).toMatchObject({ role: 'assistant', content: '追答' })
      expect(chat.threadId).toBe('t-9')
      // 完成态 run：无审批卡片 · activeRun 清除
      expect(chat.messages[1].hitl).toBeNull()
      expect(chat.activeRun).toBeNull()
      expect(chat.historyError).toBeNull()
    })

    it('AC2/AC6：terminal_status=waiting_approval → 待审批形态（非完成态）；answer_truncated 标记', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-9',
        runs: [
          {
            ...RUN_COMPLETED,
            run_id: 'r-2',
            answer: '半截回答',
            answer_truncated: true,
            terminal_status: 'waiting_approval',
            hitl: [{ id: 'req-7', reason: '需审批' }],
          },
        ],
        next_cursor: null,
      })
      const chat = useChatStore()

      await chat.openHistoryThread('t-9')

      const assistant = chat.messages[1]
      expect(assistant.hitl?.status).toBe('waiting')
      expect(assistant.hitl?.requests[0]?.id).toBe('req-7')
      expect(assistant.hitl?.reason).toBe('需审批')
      expect(assistant.truncated).toBe(true)
      // 非完成态：lastDone 不伪造
      expect(chat.lastDone).toBeNull()
    })

    it('AC3/F1-4：waiting_approval thread → active-run 挂起 + 一次性 fetchHitlPending 核对（AC16②）；续看走既有 replayLgRag', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-9',
        runs: [{ ...RUN_COMPLETED, run_id: 'r-2', terminal_status: 'waiting_approval', hitl: [{ id: 'req-7' }] }],
        next_cursor: null,
      })
      const chat = useChatStore()

      await chat.openHistoryThread('t-9')

      // active-run 语义挂起（契约未提供 last_seq → 0 从头 replay）
      expect(chat.activeRun).toMatchObject({ run_id: 'r-2', last_seq: 0, thread_id: 't-9' })
      expect(window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)).toContain('r-2')
      // AC16②：进入即一次性拉取核对（不轮询）
      expect(fetchHitlPending).toHaveBeenCalledTimes(1)
      expect(chat.canResume).toBe(true)

      // 续看复用既有 resumeFromCursor → replayLgRag（{run_id, after_seq}）· 不新造机制
      chat.resumeFromCursor()
      expect(replayLgRag).toHaveBeenCalledTimes(1)
      expect(replayLgRag).toHaveBeenCalledWith(
        { run_id: 'r-2', after_seq: 0 },
        expect.any(Object),
      )
    })

    it('AC16② 降级：pending 核对 403 → hitlPendingError 无审批权限（不炸屏）；404/网络错 → 服务暂不可用', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-9',
        runs: [{ ...RUN_COMPLETED, run_id: 'r-2', terminal_status: 'waiting_approval', hitl: [] }],
        next_cursor: null,
      })
      vi.mocked(fetchHitlPending).mockRejectedValue(apiError(403))
      const chat = useChatStore()
      await chat.openHistoryThread('t-9')
      await vi.waitFor(() => expect(chat.hitlPendingError).toBe('无审批权限'))
      expect(chat.error).toBeNull()

      vi.mocked(fetchHitlPending).mockRejectedValue(apiError(404))
      await chat.openHistoryThread('t-9')
      await vi.waitFor(() => expect(chat.hitlPendingError).toBe('审批服务暂不可用'))
      expect(chat.error).toBeNull()
    })

    it('AC4/FP-F6：query 空串 → 降级标题（run_id 前缀+时间）渲染不崩；runs 空 → 空消息流', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-9',
        runs: [{ ...RUN_COMPLETED, run_id: 'r-abcdef123456', query: '', answer: '' }],
        next_cursor: null,
      })
      const chat = useChatStore()
      await chat.openHistoryThread('t-9')

      expect(chat.messages[0].content).toContain('run r-abcdef')
      expect(chat.messages[0].content).toContain('2026-10-04T00:59:00')

      vi.mocked(fetchThreadHistory).mockResolvedValue({ thread_id: 't-8', runs: [], next_cursor: null })
      await chat.openHistoryThread('t-8')
      expect(chat.messages).toEqual([])
      expect(chat.historyError).toBeNull()
    })

    it('FP-F10/F8：404 → 中性「会话不存在或已过期」；500/网络错 →「历史服务暂不可用」· 主路径不受影响', async () => {
      const chat = useChatStore()
      chat.sendMessage('现行对话') // Chat 主路径在跑

      vi.mocked(fetchThreadHistory).mockRejectedValue(apiError(404))
      await chat.openHistoryThread('t-x')
      expect(chat.historyError).toBe('会话不存在或已过期')
      expect(chat.error).toBeNull() // 不炸全局错误条

      vi.mocked(fetchThreadHistory).mockRejectedValue(apiError(500))
      await chat.openHistoryThread('t-x')
      expect(chat.historyError).toBe('历史服务暂不可用')

      vi.mocked(fetchThreadHistory).mockRejectedValue(apiError(501))
      await chat.openHistoryThread('t-x')
      expect(chat.historyError).toBe('历史服务暂不可用')
    })

    it('historyLoading 防重：并发第二次调用仅一次请求', async () => {
      const emptyPage: ChatThreadHistoryPage = { thread_id: 't-9', runs: [], next_cursor: null }
      let resolveHistory: (value: ChatThreadHistoryPage) => void = () => {}
      vi.mocked(fetchThreadHistory).mockImplementation(
        () =>
          new Promise<ChatThreadHistoryPage>((resolve) => {
            resolveHistory = resolve
          }),
      )
      const chat = useChatStore()

      const first = chat.openHistoryThread('t-9')
      await chat.openHistoryThread('t-9')
      expect(fetchThreadHistory).toHaveBeenCalledTimes(1)

      resolveHistory(emptyPage)
      await first
      expect(chat.historyLoading).toBe(false)
    })
  })
})
