import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  listThreadRuns,
  listThreadSchedules,
  patchSchedule,
  type ScheduleItem,
  type ScheduleStatus,
  type ThreadRunItem,
} from '../api/taskPanel'
import type { ApiError } from '../api/http'
import type { LgRagSseEvent } from '../composables/useLgRagSse'

/**
 * P3-T8 任务面板 store（设计真源：14-p3-schedule-taskcard-design §2 · 契约 15 §1/§3）。
 *
 * 数据 = REST 全量拉（loadPanel）+ 既有 SSE 帧增量（applySseFrame · §2.4 零新帧 ·
 * iOS 未知帧抛错硬约束）：
 * - run.start → 插 running 卡（幂等 upsert by run_id）
 * - done → 按 payload.status 更新终态（completed→done · failed→error · waiting_approval→待审批）
 * - hitl.waiting → waiting_approval（replay 重放防御：终态卡不回退）
 *
 * 降级口径对齐 FP-F8：runs/schedules 404/失败一律静默降级空态，不阻塞 Chat 主路径；
 * 401 交 http.ts 拦截器全局跳登录。
 */

/** runs.status 六词表 → 卡片视觉态/交互（14 §2.3 表逐词） */
export interface RunStatusMeta {
  label: string
  /** Element Plus el-tag type */
  tagType: 'primary' | 'success' | 'info' | 'warning' | 'danger'
  /** resumed=success 浅（plain effect） */
  plain?: boolean
  /** running 转圈提示 */
  spinning?: boolean
  /** 点击行为：续看 / 锚定滚动 hitl 卡 / 回放 drawer */
  action: 'resume' | 'scroll-hitl' | 'replay'
}

export const RUN_STATUS_META: Record<string, RunStatusMeta> = {
  running: { label: '进行中', tagType: 'primary', spinning: true, action: 'resume' },
  waiting_approval: { label: '待审批', tagType: 'warning', action: 'scroll-hitl' },
  done: { label: '已完成', tagType: 'success', action: 'replay' },
  error: { label: '失败', tagType: 'danger', action: 'replay' },
  disconnected: { label: '中断', tagType: 'info', action: 'resume' },
  resumed: { label: '已恢复', tagType: 'success', plain: true, action: 'replay' },
}

export const RUN_STATUS_VOCABULARY = Object.keys(RUN_STATUS_META)

/** 未知 status 兜底（契约外宽松容忍：按 info 展示原词 · 不崩） */
export function runStatusMeta(status: string): RunStatusMeta {
  return (
    RUN_STATUS_META[status] ?? {
      label: status || '未知',
      tagType: 'info',
      action: 'replay',
    }
  )
}

/** 进行中计数口径（徽标「任务 · N 进行中」· 14 §2.2 R16） */
const IN_PROGRESS_STATUSES = new Set(['running', 'waiting_approval'])

/** 终态粘滞（replay 重放 hitl.waiting 不得把 done/error 打回 · 同 hitlActedRequestIds 守卫精神） */
const STICKY_TERMINAL_STATUSES = new Set(['done', 'error'])

function payloadString(event: LgRagSseEvent, key: string): string {
  const value = event.payload?.[key]
  return typeof value === 'string' ? value : ''
}

function frameRunId(event: LgRagSseEvent): string | null {
  if (typeof event.run_id === 'string' && event.run_id) return event.run_id
  const fromPayload = payloadString(event, 'run_id')
  return fromPayload || null
}

export const useTaskPanelStore = defineStore('taskPanel', () => {
  /** 当前面板所属 thread（loadPanel 登记 · SSE 增量只对同 thread 生效） */
  const panelThreadId = ref<string | null>(null)
  const runs = ref<ThreadRunItem[]>([])
  const runsNextCursor = ref<string | null>(null)
  const runsLoading = ref(false)
  /** true = 拉取失败/404 静默降级（面板空态 · 不阻塞 Chat 主路径） */
  const runsDegraded = ref(false)

  const schedules = ref<ScheduleItem[]>([])
  const schedulesLoading = ref(false)
  const schedulesDegraded = ref(false)
  /** 行内操作错误（422 detail 逐字透传 · 消费方 toast 不二次包装） */
  const scheduleActionError = ref<string | null>(null)

  /** 徽标计数（running + waiting_approval） */
  const inProgressCount = computed(
    () => runs.value.filter((run) => IN_PROGRESS_STATUSES.has(run.status)).length,
  )
  const activeSchedules = computed(() =>
    schedules.value.filter((schedule) => schedule.status === 'active'),
  )
  const pausedSchedules = computed(() =>
    schedules.value.filter((schedule) => schedule.status === 'paused'),
  )

  function upsertRun(item: ThreadRunItem): void {
    const idx = runs.value.findIndex((run) => run.run_id === item.run_id)
    if (idx >= 0) {
      runs.value[idx] = { ...runs.value[idx], ...item }
      return
    }
    // created_at 降序插入（服务端 keyset 降序 · 增量卡保持同序）
    const next = [...runs.value, item]
    next.sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    runs.value = next
  }

  async function loadRunsFirstPage(tid: string): Promise<void> {
    runsLoading.value = true
    try {
      const page = await listThreadRuns(tid)
      runs.value = page.runs
      runsNextCursor.value = page.next_cursor
      runsDegraded.value = false
    } catch {
      // FP-F8 同口径：404 跨用户/未知 thread、501/504/网络错 → 静默降级空态（401 已由拦截器接管）
      runs.value = []
      runsNextCursor.value = null
      runsDegraded.value = true
    } finally {
      runsLoading.value = false
    }
  }

  async function loadSchedules(tid: string): Promise<void> {
    schedulesLoading.value = true
    try {
      schedules.value = await listThreadSchedules(tid)
      schedulesDegraded.value = false
    } catch {
      schedules.value = []
      schedulesDegraded.value = true
    } finally {
      schedulesLoading.value = false
    }
  }

  /** REST 全量拉（面板挂载/thread 切换调用 · 幂等重置） */
  async function loadPanel(tid: string | null): Promise<void> {
    panelThreadId.value = tid
    scheduleActionError.value = null
    if (!tid) {
      runs.value = []
      runsNextCursor.value = null
      schedules.value = []
      runsDegraded.value = false
      schedulesDegraded.value = false
      return
    }
    await Promise.all([loadRunsFirstPage(tid), loadSchedules(tid)])
  }

  /** keyset 翻页（「加载更多」· 追加不重置） */
  async function loadMoreRuns(): Promise<void> {
    const tid = panelThreadId.value
    const cursor = runsNextCursor.value
    if (!tid || !cursor || runsLoading.value) return
    runsLoading.value = true
    try {
      const page = await listThreadRuns(tid, { cursor })
      const seen = new Set(runs.value.map((run) => run.run_id))
      runs.value = [...runs.value, ...page.runs.filter((run) => !seen.has(run.run_id))]
      runsNextCursor.value = page.next_cursor
    } catch {
      // 翻页失败保留现状（用户可再点）
    } finally {
      runsLoading.value = false
    }
  }

  /**
   * SSE 既有帧增量（§2.4 · chat store handleEvent 挂点调用 · 零新帧）。
   * 仅消费 run.start / done / hitl.waiting 三型；其余帧一律忽略。
   */
  function applySseFrame(event: LgRagSseEvent): void {
    const runId = frameRunId(event)
    if (!runId) return
    const existing = runs.value.find((run) => run.run_id === runId)
    if (existing && STICKY_TERMINAL_STATUSES.has(existing.status)) return
    const now = new Date().toISOString()

    switch (event.event_type) {
      case 'run.start': {
        if (existing) break // 幂等： replay/重连重放 run.start 不重复插卡
        const threadId = payloadString(event, 'thread_id') || panelThreadId.value || ''
        if (panelThreadId.value && threadId && threadId !== panelThreadId.value) break
        const query = payloadString(event, 'query')
        upsertRun({
          run_id: runId,
          thread_id: threadId,
          status: 'running',
          created_at: now,
          finished_at: null,
          query_summary: query.length > 80 ? query.slice(0, 80) : query,
          // 增量卡归因待下一次 REST 全量拉补齐（fires 台账为唯一真源 · R12）
          schedule_attribution: null,
        })
        break
      }
      case 'done': {
        const status = payloadString(event, 'status')
        const mapped =
          status === 'waiting_approval'
            ? 'waiting_approval'
            : status === 'failed'
              ? 'error'
              : 'done' // completed / 缺省（旧帧形同 chat store done 语义）
        upsertRun({
          run_id: runId,
          thread_id: existing?.thread_id ?? panelThreadId.value ?? '',
          status: mapped,
          created_at: existing?.created_at ?? now,
          finished_at: now,
          query_summary: existing?.query_summary ?? '',
          schedule_attribution: existing?.schedule_attribution ?? null,
        })
        break
      }
      case 'hitl.waiting': {
        if (!existing) break // 面板无此 run（如中途进会话）→ 待 REST 全量拉呈现
        upsertRun({ ...existing, status: 'waiting_approval' })
        break
      }
      default:
        break
    }
  }

  /**
   * 行内 pause/resume/cancel（调用方先 ElMessageBox 双确认 · R2）。
   * 成功即整体替换（服务端返回全字段）；422 detail 逐字落 scheduleActionError（不二次包装）。
   */
  async function setScheduleStatus(scheduleId: string, status: ScheduleStatus): Promise<boolean> {
    scheduleActionError.value = null
    try {
      const updated = await patchSchedule(scheduleId, { status })
      const idx = schedules.value.findIndex((schedule) => schedule.schedule_id === scheduleId)
      if (idx >= 0) schedules.value[idx] = updated
      return true
    } catch (error) {
      const apiError = error as ApiError
      // 422 detail 逐字透传（15 §1 词表 · 如「已取消的定时任务不可修改」）
      scheduleActionError.value =
        typeof apiError.detail === 'string' && apiError.detail
          ? apiError.detail
          : apiError.message
      if (apiError.status === 404 && panelThreadId.value) {
        // 不存在/跨用户 → 重新拉取对账（schedule 列表收敛）
        void loadSchedules(panelThreadId.value)
      }
      return false
    }
  }

  function dismissScheduleActionError(): void {
    scheduleActionError.value = null
  }

  return {
    panelThreadId,
    runs,
    runsNextCursor,
    runsLoading,
    runsDegraded,
    schedules,
    schedulesLoading,
    schedulesDegraded,
    scheduleActionError,
    inProgressCount,
    activeSchedules,
    pausedSchedules,
    loadPanel,
    loadMoreRuns,
    applySseFrame,
    setScheduleStatus,
    dismissScheduleActionError,
  }
})
