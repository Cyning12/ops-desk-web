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
import type { ChatHistoryRun, ChatThreadHistoryPage } from '../src/api/chatHistory'
import { decideHitlRequest, fetchHitlPending, resumeHitlRequest } from '../src/api/hitl'
import type { HitlDecideResponse, HitlResumeResponse } from '../src/api/hitl'
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

    it("done{status:'resumed'} 缺 latency_ms（裁定 A · pre-fix 历史旧帧残留面）→ 终态清除 + lastDone.latency_ms===null（禁假 0 · model 兜底 '' 保留）", () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      // 裁定 A：裁 ': 0' 假值兜底——缺 latency_ms 存 null（徽标耗时段显「—」如实不误导）；
      // 裁定 B：model 兜底 ': ''' 零改动（后端 FP-1 钉案 model 键永不提供）
      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { status: 'resumed' },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
      expect(window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)).toBeNull()
      expect(chat.lastDone).toEqual({ latency_ms: null, model: '' })
    })

    it("done{status:'resumed'} 携 latency_ms 实值（F-OBS-1 · live 实证 139650）→ 原样透传（非 0 假值）", () => {
      const chat = useChatStore()
      chat.sendMessage('问')
      emitRunStart('r-1')

      // F-OBS-1 闭环：resume 终帧 done{status:'resumed'} 携 latency_ms int≥0 实值
      // （本 task 40 live 实证 fobs_s3_full.sse seq18 latency_ms=139650 · model 键不存在）
      captured.onEvent?.({
        event_type: 'done',
        run_id: 'r-1',
        seq: 2,
        payload: { status: 'resumed', latency_ms: 139650 },
      })

      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
      expect(chat.lastDone).toEqual({ latency_ms: 139650, model: '' })
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

      // D11 改钉（task_web_hitl_approval_overlay_ux · 影响面清单声明项）：无参调用 → 携 limit=100 全量翻页首页请求
      expect(fetchThreadHistory).toHaveBeenCalledWith('t-9', { limit: 100 })
      expect(fetchThreadHistory).toHaveBeenCalledTimes(1) // next_cursor=null 单页不多发
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

    it('D11：openHistoryThread 全量翻页循环（cursor 至 null · limit=100）消除首页 20 静默截断', async () => {
      vi.mocked(fetchThreadHistory)
        .mockResolvedValueOnce({ thread_id: 't-9', runs: [RUN_COMPLETED], next_cursor: 'cur-2' })
        .mockResolvedValueOnce({
          thread_id: 't-9',
          runs: [{ ...RUN_COMPLETED, run_id: 'r-2', query: '第二页问', answer: '第二页答' }],
          next_cursor: null,
        })
      const chat = useChatStore()

      await chat.openHistoryThread('t-9')

      expect(fetchThreadHistory).toHaveBeenCalledTimes(2)
      expect(vi.mocked(fetchThreadHistory).mock.calls[0]).toEqual(['t-9', { limit: 100 }])
      expect(vi.mocked(fetchThreadHistory).mock.calls[1]).toEqual(['t-9', { limit: 100, cursor: 'cur-2' }])
      expect(chat.messages).toHaveLength(4)
      expect(chat.messages[2]).toMatchObject({ role: 'user', content: '第二页问' })
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

  describe('D3 · terminal_status → CTA 矩阵（web-lg-rag-sse-continue-reply · TC-W1–W4）', () => {
    const PARTIAL = '半截回答可见内容'
    const RUN_BASE: ChatHistoryRun = {
      run_id: 'r-partial',
      started_at: '2026-10-14T01:00:00',
      query: '请总结上文',
      answer: PARTIAL,
      answer_truncated: false,
      subtasks: [],
      terminal_status: 'completed',
      hitl: [],
    }

    function historyRun(
      overrides: Partial<ChatHistoryRun> & { terminal_status: string; run_id?: string },
    ): ChatHistoryRun {
      return { ...RUN_BASE, answer: PARTIAL, ...overrides }
    }

    it('TC-W1：running|error 半截 answer 打开后 assistant 气泡保留', async () => {
      for (const status of ['running', 'error'] as const) {
        vi.mocked(fetchThreadHistory).mockResolvedValue({
          thread_id: 't-partial',
          runs: [historyRun({ terminal_status: status, run_id: `r-${status}` })],
          next_cursor: null,
        })
        const chat = useChatStore()
        await chat.openHistoryThread('t-partial')
        const assistant = chat.messages[1]
        expect(assistant.role).toBe('assistant')
        expect(assistant.content).toBe(PARTIAL)
        expect(assistant.runTerminalStatus).toBe(status)
      }
    })

    it('TC-W2：running → 无继续回复 CTA；零 HITL resume；续看文案不混', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-run',
        runs: [historyRun({ terminal_status: 'running', run_id: 'r-running' })],
        next_cursor: null,
      })
      const chat = useChatStore()
      await chat.openHistoryThread('t-run')

      const assistant = chat.messages[1]
      expect(assistant.allowContinueReply).toBeFalsy()
      expect(assistant.continueFromRunId).toBeFalsy()
      expect(assistant.runTerminalStatus).toBe('running')
      expect(chat.activeRun).toBeNull()
      expect(resumeHitlRequest).not.toHaveBeenCalled()
      expect(replayLgRag).not.toHaveBeenCalled()
      expect(streamLgRag).not.toHaveBeenCalled()
    })

    it('TC-W3：error → 继续回复 = 新 stream + continue_from_run_id；零 HITL resume', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-err',
        runs: [historyRun({ terminal_status: 'error', run_id: 'r-failed' })],
        next_cursor: null,
      })
      const chat = useChatStore()
      await chat.openHistoryThread('t-err')

      const assistant = chat.messages[1]
      expect(assistant.allowContinueReply).toBe(true)
      expect(assistant.continueFromRunId).toBe('r-failed')
      expect(assistant.content).toBe(PARTIAL)

      chat.continueReply(assistant)

      expect(streamLgRag).toHaveBeenCalledTimes(1)
      expect(vi.mocked(streamLgRag).mock.calls[0][0]).toEqual({
        query: '请继续完成回答。',
        mode: 'supervisor',
        threadId: 't-err',
        continueFromRunId: 'r-failed',
      })
      expect(resumeHitlRequest).not.toHaveBeenCalled()
      expect(replayLgRag).not.toHaveBeenCalled()
    })

    it('TC-W3b：disconnected → 同 error CTA（继续回复 + continue_from）', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-disc',
        runs: [historyRun({ terminal_status: 'disconnected', run_id: 'r-disc' })],
        next_cursor: null,
      })
      const chat = useChatStore()
      await chat.openHistoryThread('t-disc')

      expect(chat.messages[1].allowContinueReply).toBe(true)
      expect(chat.messages[1].continueFromRunId).toBe('r-disc')
      chat.continueReply(chat.messages[1])
      expect(vi.mocked(streamLgRag).mock.calls[0][0]).toMatchObject({
        threadId: 't-disc',
        continueFromRunId: 'r-disc',
        query: '请继续完成回答。',
      })
      expect(resumeHitlRequest).not.toHaveBeenCalled()
    })

    it('TC-W4：live error.stage=lg_rag.worker_failed → 同继续回复 CTA', () => {
      const chat = useChatStore()
      chat.sendMessage('live 问')
      emitRunStart('r-live-fail', 't-live')
      captured.onEvent?.({
        event_type: 'answer',
        run_id: 'r-live-fail',
        seq: 2,
        payload: { delta: PARTIAL },
      })
      captured.onEvent?.({
        event_type: 'error',
        run_id: 'r-live-fail',
        seq: 3,
        payload: {
          stage: 'lg_rag.worker_failed',
          message: 'worker failed',
          retryable: false,
        },
      })

      const assistant = chat.messages[1]
      expect(assistant.allowContinueReply).toBe(true)
      expect(assistant.continueFromRunId).toBe('r-live-fail')
      expect(assistant.runTerminalStatus).toBe('error')
      expect(chat.activeRun).toBeNull()

      vi.mocked(streamLgRag).mockClear()
      chat.continueReply(assistant)
      expect(streamLgRag).toHaveBeenCalledWith(
        expect.objectContaining({
          continueFromRunId: 'r-live-fail',
          threadId: 't-live',
          query: '请继续完成回答。',
        }),
        expect.any(Object),
      )
      expect(resumeHitlRequest).not.toHaveBeenCalled()
    })

    it('waiting_approval / completed 零 diff：无继续回复 CTA', async () => {
      vi.mocked(fetchThreadHistory).mockResolvedValue({
        thread_id: 't-ok',
        runs: [
          historyRun({ terminal_status: 'completed', run_id: 'r-ok' }),
          historyRun({
            terminal_status: 'waiting_approval',
            run_id: 'r-hitl',
            hitl: [{ id: 'req-1', reason: '需审批' }],
          }),
        ],
        next_cursor: null,
      })
      const chat = useChatStore()
      await chat.openHistoryThread('t-ok')

      expect(chat.messages[1].allowContinueReply).toBeFalsy()
      expect(chat.messages[3].allowContinueReply).toBeFalsy()
      expect(chat.messages[3].hitl?.status).toBe('waiting')
      expect(chat.activeRun?.run_id).toBe('r-hitl')
    })
  })

  describe('web-hitl-decision-surface · D3 resume 后自动追帧（TC4–TC12 / TC14）', () => {
    const decideOk: HitlDecideResponse = {
      ok: true,
      request: { id: 'req-1', status: 'approved' },
      resume: { required: true, method: 'POST', endpoint: '/api/ops/hitl/requests/req-1/resume' },
    }

    function resumeOk(cursor: string): HitlResumeResponse {
      return {
        ok: true,
        request: {},
        resume: {},
        replay: {
          run_id: 'r-1',
          cursor,
          events_persisted: 3,
          events_failed: 0,
          persisted: true,
          re_interrupted: false,
        },
        ts: 1,
      }
    }

    /** 种 waiting 审批卡片 + active-run 游标（run.start seq1 → hitl.waiting seq2 · activeRun.last_seq=2） */
    function seedWaitingCardWithRun() {
      const chat = useChatStore()
      chat.sendMessage('部署服务')
      emitRunStart('r-1')
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        run_id: 'r-1',
        seq: 2,
        payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
      })
      return chat
    }

    /** 追帧 replay 序列 mock：每次调用同步执行 handler（handler 须以 onDone/onError/onAborted 收尾以解开 chase await） */
    function mockChaseReplay(handlers: Array<(cb: LgRagSseCallbacks) => void>): void {
      let i = 0
      vi.mocked(replayLgRag).mockImplementation((_input, cb) => {
        const handler = handlers[Math.min(i, handlers.length - 1)]
        i += 1
        handler(cb ?? {})
        return { abort: vi.fn(), done: Promise.resolve() }
      })
    }

    async function flushMicrotasks(): Promise<void> {
      for (let i = 0; i < 5; i += 1) await Promise.resolve()
    }

    it('TC4：decide→resume→replayLgRag 顺序链 · 起点游标 = replay.cursor 解析值（r-1:9 → after_seq 9）', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:9'))
      const chat = seedWaitingCardWithRun()
      const assistant = chat.messages[1]
      const pendingCallsBefore = vi.mocked(fetchHitlPending).mock.calls.length

      await chat.decideHitl(assistant, 'req-1', 'approved')

      // 调用顺序钉死：decide → resume → replayLgRag
      expect(vi.mocked(decideHitlRequest).mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(resumeHitlRequest).mock.invocationCallOrder[0],
      )
      expect(vi.mocked(resumeHitlRequest).mock.invocationCallOrder[0]).toBeLessThan(
        vi.mocked(replayLgRag).mock.invocationCallOrder[0],
      )
      // 起点游标 = cursor 解析值（非 active-run 游标 2）
      expect(vi.mocked(replayLgRag).mock.calls[0][0]).toEqual({ run_id: 'r-1', after_seq: 9 })
      expect(assistant.hitl?.status).toBe('decided')
      expect(assistant.hitl?.note).toBe('已批准 · 恢复进行中')
      // TC2：动作链完成后审批态再刷新恰 1 次（存续）
      expect(vi.mocked(fetchHitlPending).mock.calls.length).toBe(pendingCallsBefore + 1)
      expect(chat.error).toBeNull()
    })

    it('TC5：immediate required=false + active-run → 不调 resume · 以 active-run 游标（last_seq=2）起追帧', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue({
        ok: true,
        request: { id: 'req-1', status: 'approved' },
        resume: { required: false, auto_triggered: true, method: 'POST', endpoint: '' },
      })
      const chat = seedWaitingCardWithRun()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved', 'immediate')

      expect(resumeHitlRequest).not.toHaveBeenCalled()
      expect(vi.mocked(replayLgRag).mock.calls[0][0]).toEqual({ run_id: 'r-1', after_seq: 2 })
      expect(chat.messages[1].hitl?.note).toBe('已批准 · 恢复进行中')
      expect(chat.error).toBeNull()
    })

    it('TC6：追帧帧流 hitl.resumed→进度→answer→done{resumed,435584} 经 processFrame 渲染 · 终帧收尾完整', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
      mockChaseReplay([
        (cb) => {
          cb.onEvent?.({
            event_type: 'hitl.resumed',
            run_id: 'r-1',
            seq: 3,
            payload: { reason: '需审批', request_id: 'req-1' },
          })
          cb.onEvent?.({
            event_type: 'node.progress',
            run_id: 'r-1',
            seq: 4,
            agent_role: 'ops',
            payload: { node: 'resume', detail: '恢复段重放' },
          })
          cb.onEvent?.({ event_type: 'answer', run_id: 'r-1', seq: 5, payload: { delta: '恢复后的回答' } })
          cb.onEvent?.({
            event_type: 'done',
            run_id: 'r-1',
            seq: 6,
            payload: { status: 'resumed', latency_ms: 435584 },
          })
          cb.onDone?.()
        },
      ])
      const chat = seedWaitingCardWithRun()
      const assistant = chat.messages[1]

      await chat.decideHitl(assistant, 'req-1', 'approved')
      await flushMicrotasks()

      // 终帧后：streaming 复位 · active-run 清 · 徽标数据如实（TC12 同帧形：无 model 键 → ''）
      expect(chat.streaming).toBe(false)
      expect(chat.activeRun).toBeNull()
      expect(chat.canResume).toBe(false)
      expect(chat.lastDone?.latency_ms).toBe(435584)
      expect(chat.lastDone?.model).toBe('')
      // hitl.resumed：default 忽略不崩不误渲（卡片仍 decided · 不重建 waiting）
      expect(assistant.hitl?.status).toBe('decided')
      // web-hitl-resume-chase-ux 范围2 改钉（同 commit）：终帧即消——进度态撤回收官文案「已批准」
      expect(assistant.hitl?.note).toBe('已批准')
      // 进度帧入 thinking · answer delta 渲染进同一 assistant 消息（processFrame 管线复用实证）
      expect(assistant.thinking.length).toBeGreaterThan(0)
      expect(assistant.content).toContain('恢复后的回答')
    })

    it('TC7：干净结束未见终帧 → 递增退避 2s→3s→4.5s→6.75s→8s（顶）· 连追 10 次上限降级「恢复仍在进行，可稍后手动续看」+ active-run 保留', async () => {
      // web-hitl-resume-chase-ux 范围3 改钉（同 commit）：固定 2s → 递增退避（起始 2s 钉死 · ×1.5 · 封顶 8s）
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
        mockChaseReplay([
          (cb) => {
            cb.onEvent?.({
              event_type: 'node.progress',
              run_id: 'r-1',
              seq: 10,
              payload: { node: 'resume' },
            })
            cb.onDone?.() // 干净结束 · 未见终帧（恢复段在写）
          },
        ])
        const chat = seedWaitingCardWithRun()
        const assistant = chat.messages[1]

        await chat.decideHitl(assistant, 'req-1', 'approved')
        expect(replayLgRag).toHaveBeenCalledTimes(1)

        // 阶梯逐档钉死：前一毫秒不触发、整档触发（2s 起始不变 · 后续单调递增）
        const ladder = [2000, 3000, 4500, 6750, 8000]
        for (const [index, wait] of ladder.entries()) {
          await vi.advanceTimersByTimeAsync(wait - 1)
          expect(replayLgRag).toHaveBeenCalledTimes(index + 1)
          await vi.advanceTimersByTimeAsync(1)
          expect(replayLgRag).toHaveBeenCalledTimes(index + 2)
        }
        // 游标随帧推进（seq 2 → 10）
        expect(vi.mocked(replayLgRag).mock.calls[1][0]).toEqual({ run_id: 'r-1', after_seq: 10 })

        // 封顶 8s 续追至 10 次上限（墙钟 56.25s < 120s · 次数先到为准）
        await vi.advanceTimersByTimeAsync(8000 * 4)
        expect(replayLgRag).toHaveBeenCalledTimes(10)
        await vi.advanceTimersByTimeAsync(8000)
        expect(replayLgRag).toHaveBeenCalledTimes(10) // 第 11 次进入上限判定 → 降级不再发请求

        expect(assistant.hitl?.note).toBe('恢复仍在进行，可稍后手动续看')
        expect(chat.resumeHint).toBe('恢复仍在进行，可稍后手动续看')
        expect(chat.streaming).toBe(false)
        expect(chat.activeRun?.run_id).toBe('r-1') // 上限降级不清 active-run
        expect(chat.canResume).toBe(true) // 手动续看兜底可用
        await vi.advanceTimersByTimeAsync(10_000)
        expect(replayLgRag).toHaveBeenCalledTimes(10)
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC-U1：同一 run 只允许一条 chase 链 —— replay 重放 hitl.waiting 不打回已决卡片 · decide/resume 恰一次 · 总追帧 ≤10（验收1/4 · 14>10 根因钉）', async () => {
      // 根因实证（现行代码红）：attempts 单调用作用域完好（TC7 单链恰 10 顶）· 全仓 replay 仅 2 调用点，
      // 14>10 唯有多链并发 —— 重放 waiting 帧重建卡片重置守卫 → 第二入口新链（repro-chase-overflow 实证 4+10=14）
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
        let call = 0
        vi.mocked(replayLgRag).mockImplementation((_input, cb) => {
          call += 1
          if (call === 1) {
            // 陈旧游标重放 hitl.waiting（seq 3）——已决卡片不得被打回 waiting
            cb?.onEvent?.({
              event_type: 'hitl.waiting',
              run_id: 'r-1',
              seq: 3,
              payload: { reason: '需审批', requests: [{ id: 'req-1' }] },
            })
          }
          cb?.onDone?.() // 干净结束未见终帧
          return { abort: vi.fn(), done: Promise.resolve() }
        })
        const chat = seedWaitingCardWithRun()
        const assistant = chat.messages[1]

        await chat.decideHitl(assistant, 'req-1', 'approved')
        expect(replayLgRag).toHaveBeenCalledTimes(1)
        // 重放 waiting 帧后：本端已受理申请不重建（幂等守卫）
        expect(assistant.hitl?.status).toBe('decided')

        // 链 A 推进至第 4 次（递增退避 2s/3s/4.5s）
        await vi.advanceTimersByTimeAsync(2000)
        await vi.advanceTimersByTimeAsync(3000)
        await vi.advanceTimersByTimeAsync(4500)
        expect(replayLgRag).toHaveBeenCalledTimes(4)

        // 已决单重入：哪怕卡片态被外部打回 waiting，也只发一次 decide+resume
        assistant.hitl!.status = 'waiting'
        await chat.decideHitl(assistant, 'req-1', 'approved')
        expect(decideHitlRequest).toHaveBeenCalledTimes(1)
        expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
        expect(replayLgRag).toHaveBeenCalledTimes(4) // 无第二条链

        // 链 A 独享上限：全程恰 10 次后降级（4 + 6，总数不破 10）
        await vi.advanceTimersByTimeAsync(120_000)
        expect(replayLgRag).toHaveBeenCalledTimes(10)
        expect(assistant.hitl?.note).toBe('恢复仍在进行，可稍后手动续看')
        expect(chat.activeRun?.run_id).toBe('r-1')
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC-P1：追帧等待期进度双落点常驻（hitl.note + resumeHint）· 终帧即消且零续追（验收2/3）', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
        mockChaseReplay([
          (cb) => cb.onDone?.(), // 第 1 次干净结束 → 进入退避等待
          (cb) => {
            cb.onEvent?.({
              event_type: 'done',
              run_id: 'r-1',
              seq: 6,
              payload: { status: 'resumed', latency_ms: 68_000 },
            })
            cb.onDone?.() // 第 2 次携终帧
          },
        ])
        const chat = seedWaitingCardWithRun()
        const assistant = chat.messages[1]

        await chat.decideHitl(assistant, 'req-1', 'approved')
        // 进入退避等待：恢复段在长耗时执行，进度可见态常驻（双落点）
        // （mock 同步回放压缩了网络在飞时间：首追帧瞬结即入等待期 · 「已批准 · 恢复进行中」初始文案由 TC4/TC5 悬挂 mock 存续钉死）
        await vi.advanceTimersByTimeAsync(0)
        expect(assistant.hitl?.note).toContain('恢复中')
        expect(chat.resumeHint).toContain('恢复中')

        // 终帧即消：done{resumed} 到达 → 进度态消失 · 不再有任何 replay
        await vi.advanceTimersByTimeAsync(2000)
        expect(chat.resumeHint).toBeNull()
        expect(assistant.hitl?.note).toBe('已批准')
        expect(chat.streaming).toBe(false)
        expect(chat.activeRun).toBeNull()
        await vi.advanceTimersByTimeAsync(120_000)
        expect(replayLgRag).toHaveBeenCalledTimes(2)
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC-I1a：卡片连点（decide 在飞）只发一次 decide+resume · 重放打回后再入也被受理幂等拦（验收4）', async () => {
      const chat = seedWaitingCardWithRun()
      const assistant = chat.messages[1]

      // 连点：decide 承诺悬挂期第二次点击被拦（acting 同步守卫 + 受理幂等双保险）
      let resolveDecide!: (value: HitlDecideResponse) => void
      vi.mocked(decideHitlRequest).mockImplementation(
        () => new Promise<HitlDecideResponse>((resolve) => { resolveDecide = resolve }),
      )
      vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
      const first = chat.decideHitl(assistant, 'req-1', 'approved')
      const second = chat.decideHitl(assistant, 'req-1', 'approved')
      resolveDecide(decideOk)
      await Promise.all([first, second])
      expect(decideHitlRequest).toHaveBeenCalledTimes(1)
      expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
      expect(assistant.hitl?.status).toBe('decided')
    })

    it('TC-I1b：decide 网络错回 waiting → 受理标记解除 · 同 id 合法重试照常成功（幂等不误伤重试 · 验收4）', async () => {
      const chat = seedWaitingCardWithRun()
      const assistant = chat.messages[1]

      vi.mocked(decideHitlRequest).mockRejectedValueOnce(apiError(0, '网络异常'))
      await chat.decideHitl(assistant, 'req-1', 'approved')
      expect(assistant.hitl?.status).toBe('waiting')
      expect(resumeHitlRequest).not.toHaveBeenCalled()

      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
      await chat.decideHitl(assistant, 'req-1', 'approved')
      expect(decideHitlRequest).toHaveBeenCalledTimes(2) // 1（网络错）+1（重试）
      expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
      expect(assistant.hitl?.status).toBe('decided')
    })

    it.each([
      // detail 只消费（hitl-browser-decide-v1 冻结契约不改）· 后端文案真值 api router.py/resume.py
      [
        '申请里没有 thread_id —— 定位不到挂起的 checkpoint，无法恢复',
        '该申请缺少会话定位信息，无法恢复，请重新开会话',
      ],
      [
        'thread abc 有未完成任务但没有 interrupt 元数据 —— 多半是升级前旧版本格式的 checkpoint，无法恢复（只能作废重开）',
        '该会话挂起点为旧版本残留，无法恢复，请作废重开',
      ],
      [
        '已批准但拿不到待解锁的步骤（unlock_subtask_id 为空）',
        '已批准但无可解锁步骤，无法恢复，请重新开会话',
      ],
      [
        '申请状态为 pending，只有已决（approved/rejected）才能恢复',
        '该会话已无法恢复，请重新开会话',
      ],
    ])('TC-D1：resume 409 detail 分类「%s」→「%s」（验收5）', async (detail, expected) => {
      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockRejectedValue(apiError(409, detail))
      const chat = seedWaitingCardWithRun()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')

      expect(chat.error).toEqual({ stage: 'resume', message: expected, retryable: false })
      expect(replayLgRag).not.toHaveBeenCalled() // 不可恢复面不自动重试
    })

    it('TC8：replay 409 + Retry-After 按头退避不弹错误条 · 缺头默认 2s · 连续 409 计入同上限', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:9'))
        mockChaseReplay([
          (cb) => cb.onError?.({ kind: 'http', status: 409, message: 'run active', retryAfterSeconds: 3 }),
          (cb) => cb.onError?.({ kind: 'http', status: 409, message: 'run active' }),
          (cb) => {
            cb.onEvent?.({
              event_type: 'done',
              run_id: 'r-1',
              seq: 12,
              payload: { status: 'resumed', latency_ms: 100 },
            })
            cb.onDone?.()
          },
        ])
        const chat = seedWaitingCardWithRun()

        await chat.decideHitl(chat.messages[1], 'req-1', 'approved')
        expect(replayLgRag).toHaveBeenCalledTimes(1)
        expect(chat.error).toBeNull() // 409 退避不弹错误条（FP-H2）

        // Retry-After: 3 → 2999ms 不触发 · +1ms 触发第二次
        await vi.advanceTimersByTimeAsync(2999)
        expect(replayLgRag).toHaveBeenCalledTimes(1)
        await vi.advanceTimersByTimeAsync(1)
        expect(replayLgRag).toHaveBeenCalledTimes(2)
        expect(chat.error).toBeNull()
        // 409 无新帧 → 游标不变仍 9
        expect(vi.mocked(replayLgRag).mock.calls[1][0]).toEqual({ run_id: 'r-1', after_seq: 9 })

        // 缺 Retry-After 头 → 默认 2s
        await vi.advanceTimersByTimeAsync(1999)
        expect(replayLgRag).toHaveBeenCalledTimes(2)
        await vi.advanceTimersByTimeAsync(1)
        expect(replayLgRag).toHaveBeenCalledTimes(3)

        // 第三次见终帧 → 收尾（两次 409 已计入 attempts 上限 · 本例未触顶）
        expect(chat.streaming).toBe(false)
        expect(chat.activeRun).toBeNull()
        expect(chat.lastDone?.latency_ms).toBe(100)
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC9：resume 409「正在执行中」→「恢复进行中」非「已被处理」· 不并发第二次 resume · 有游标起追帧等沉降', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockRejectedValue(apiError(409, '该申请的恢复正在执行中，待沉降后再试'))
      const chat = seedWaitingCardWithRun()
      const assistant = chat.messages[1]

      await chat.decideHitl(assistant, 'req-1', 'approved')

      expect(assistant.hitl?.status).toBe('decided')
      expect(assistant.hitl?.note).toBe('恢复进行中')
      expect(assistant.hitl?.note).not.toContain('已被处理') // decide 409 语义禁混（分流对侧由 AC9 decide 409 存续测钉死）
      expect(resumeHitlRequest).toHaveBeenCalledTimes(1) // 不并发重提
      expect(chat.error).toBeNull()
      // active-run 游标起追帧等沉降
      expect(vi.mocked(replayLgRag).mock.calls[0][0]).toEqual({ run_id: 'r-1', after_seq: 2 })
    })

    it('TC10：resume 503 → 中性错误条「恢复服务暂不可用」· 不自动重试不发 replay', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockRejectedValue(apiError(503, 'checkpoint store not configured'))
        const chat = seedWaitingCardWithRun()
        const assistant = chat.messages[1]

        await chat.decideHitl(assistant, 'req-1', 'approved')

        expect(assistant.hitl?.status).toBe('decided')
        expect(assistant.hitl?.note).toBe('已批准 · 点击续看推进')
        expect(chat.error).toEqual({
          stage: 'resume',
          message: '恢复服务暂不可用，请稍后重试',
          retryable: false,
        })
        await vi.advanceTimersByTimeAsync(10_000)
        expect(replayLgRag).not.toHaveBeenCalled() // 不当可重试面自动重试
        expect(resumeHitlRequest).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC10：stranded 409（非「正在执行中」）→ 中性「该会话已无法恢复，请重新开会话」· 不自动重试', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockRejectedValue(apiError(409, 'stranded_checkpoint'))
        const chat = seedWaitingCardWithRun()
        const assistant = chat.messages[1]

        await chat.decideHitl(assistant, 'req-1', 'approved')

        expect(assistant.hitl?.note).toBe('已批准 · 点击续看推进')
        expect(chat.error).toEqual({
          stage: 'resume',
          message: '该会话已无法恢复，请重新开会话',
          retryable: false,
        })
        await vi.advanceTimersByTimeAsync(10_000)
        expect(replayLgRag).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC11：追帧中 stopStreaming → 退避定时器清除不再追 · streaming 复位', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
        mockChaseReplay([(cb) => cb.onDone?.()]) // 干净结束 → 2s 后再追（定时器挂起）
        const chat = seedWaitingCardWithRun()

        await chat.decideHitl(chat.messages[1], 'req-1', 'approved')
        expect(replayLgRag).toHaveBeenCalledTimes(1)

        chat.stopStreaming()
        expect(chat.streaming).toBe(false)
        await vi.advanceTimersByTimeAsync(10_000)
        expect(replayLgRag).toHaveBeenCalledTimes(1) // 定时器已清 + 代际失效：零残留定时器
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC11：追帧中 startNewSession → 退避定时器清除不再追', async () => {
      vi.useFakeTimers()
      try {
        vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
        vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
        mockChaseReplay([(cb) => cb.onDone?.()])
        const chat = seedWaitingCardWithRun()

        await chat.decideHitl(chat.messages[1], 'req-1', 'approved')
        expect(replayLgRag).toHaveBeenCalledTimes(1)

        chat.startNewSession()
        expect(chat.streaming).toBe(false)
        await vi.advanceTimersByTimeAsync(10_000)
        expect(replayLgRag).toHaveBeenCalledTimes(1)
      } finally {
        vi.useRealTimers()
      }
    })

    it('TC12：done{resumed} 缺 latency_ms/model → lastDone 如实 null/空串（禁伪造兜底）', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue(decideOk)
      vi.mocked(resumeHitlRequest).mockResolvedValue(resumeOk('r-1:2'))
      mockChaseReplay([
        (cb) => {
          cb.onEvent?.({ event_type: 'done', run_id: 'r-1', seq: 3, payload: { status: 'resumed' } })
          cb.onDone?.()
        },
      ])
      const chat = seedWaitingCardWithRun()

      await chat.decideHitl(chat.messages[1], 'req-1', 'approved')
      await flushMicrotasks()

      expect(chat.lastDone).toEqual({ latency_ms: null, model: '' })
    })

    it('TC14：mock 字段族与契约逐键对齐 + 未知键容忍（hitl.waiting payload / decide / resume 响应携未知键不崩）', async () => {
      vi.mocked(decideHitlRequest).mockResolvedValue({
        ...decideOk,
        future_decide_key: { nested: true },
      } as unknown as HitlDecideResponse)
      vi.mocked(resumeHitlRequest).mockResolvedValue({
        ...resumeOk('r-1:2'),
        future_resume_key: 'tolerated',
      } as unknown as HitlResumeResponse)
      const chat = useChatStore()
      chat.sendMessage('部署服务')
      emitRunStart('r-1')
      captured.onEvent?.({
        event_type: 'hitl.waiting',
        run_id: 'r-1',
        seq: 2,
        payload: {
          reason: '需审批',
          requests: [{ id: 'req-1', unknown_req_key: 1 }],
          future_payload_key: { any: 'thing' },
        },
      })
      const assistant = chat.messages[1]
      expect(assistant.hitl?.status).toBe('waiting')

      await chat.decideHitl(assistant, 'req-1', 'approved')

      expect(assistant.hitl?.status).toBe('decided')
      expect(assistant.hitl?.note).toContain('已批准')
      expect(chat.error).toBeNull()
    })
  })
})

/* ==================== task_web_ux_state_sync（30 · 红测先行 · D2 卡片对账） ==================== */

describe('stores/chat · state-sync TC6/TC7 HITL 卡片对账（web-ux-state-sync · D2）', () => {
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

  it("TC6 两向：成功取回且 id 不在列 → true（卡片转只读「已被处理或已失效」）；id 在列 → false（保持可点）", async () => {
    const chat = useChatStore()
    vi.mocked(fetchHitlPending).mockResolvedValue({
      items: [
        {
          id: 'req-on-list',
          run_id: 'r-1',
          thread_id: 't-1',
          reason: '高危操作需人工审批',
          blocked_by: { op: 'deploy' },
          created_at: '2026-11-03T01:00:00Z',
        },
      ],
      count: 1,
    })
    await chat.refreshHitlPending()

    expect(chat.isHitlRequestReconciled('req-on-list')).toBe(false) // 在列 → 保持可点
    expect(chat.isHitlRequestReconciled('req-gone')).toBe(true) // 成功取回且不在列 → 只读
  })

  it('TC7 三向之一（FP-4）：403 权限错 → fetch 未成功 → 不做对账（false）', async () => {
    const chat = useChatStore()
    vi.mocked(fetchHitlPending).mockRejectedValue(apiError(403, 'Forbidden'))
    await chat.refreshHitlPending()

    expect(chat.hitlPendingError).toBe('无审批权限')
    expect(chat.isHitlRequestReconciled('req-gone')).toBe(false)
  })

  it('TC7 三向之二（FP-5）：网络错 → fetch 未成功 → 不做对账（false）', async () => {
    const chat = useChatStore()
    vi.mocked(fetchHitlPending).mockRejectedValue({ status: null, message: 'Network Error', raw: null })
    await chat.refreshHitlPending()

    expect(chat.hitlPendingError).toBe('审批服务暂不可用')
    expect(chat.isHitlRequestReconciled('req-gone')).toBe(false)
  })

  it('TC7 三向之三（FP-6）：本地已动作 → 优先不对账（false · 不被「不在列」误判回 waiting）', async () => {
    const chat = useChatStore()
    // seed waiting 卡 → 本地 decide 成功（ acted 集合入账 ）
    chat.sendMessage('部署服务')
    captured.onEvent?.({
      event_type: 'hitl.waiting',
      run_id: 'r-1',
      seq: 2,
      payload: { reason: '高危操作需人工审批', requests: [{ id: 'req-1', reason: '高危操作需人工审批' }] },
    })
    const assistant = chat.messages[1]
    vi.mocked(decideHitlRequest).mockResolvedValue({
      ok: true,
      request: { id: 'req-1', status: 'approved' },
      resume: { required: false, method: 'POST', endpoint: '' },
    })
    await chat.decideHitl(assistant, 'req-1', 'approved')
    expect(assistant.hitl?.status).toBe('decided')

    // 服务端 pending 列表已不含 req-1（动作链后刷新）→ 仍不得对账误判
    vi.mocked(fetchHitlPending).mockResolvedValue({ items: [], count: 0 })
    await chat.refreshHitlPending()
    expect(chat.isHitlRequestReconciled('req-1')).toBe(false) // FP-6：本地已动作优先
  })

  it('守卫：取回前（refresh 未跑过）→ 不做对账（false · 空列表≠成功取回）', async () => {
    const chat = useChatStore()
    // beforeEach 的 loadLatestSession 不触发 refreshHitlPending（消费点在 ChatView 挂载）
    expect(chat.hitlPending).toEqual([])
    expect(chat.isHitlRequestReconciled('req-gone')).toBe(false)
  })
})

