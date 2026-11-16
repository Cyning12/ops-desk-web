import { http } from './http'

/**
 * P3-T8 任务面板只读/管理 client（契约真源：ops-desk-workspace 15-p3-contracts §1/§3 · 只承接禁改）。
 *
 * 上游真值（ops-desk-api · 已交付）：
 * - GET /api/ops/lg-rag/threads/{thread_id}/runs → `{ok:true, data:{runs:[...], next_cursor}}`
 *   keyset 分页：limit 默认 20 上限 50（超限 422）· cursor 不透明只回传；跨用户/未知 thread → 404（不泄露存在性）
 * - GET /api/ops/lg-rag/runs/{run_id}/events → `{ok:true, data:{run_id, events:[...], truncated, next_after_seq}}`
 *   event_type 白名单 8 值（run.start/answer/subtask.progress/node.progress/hitl.waiting/done/error/hitl.resumed）·
 *   ≤500 帧超出 truncated:true + next_after_seq；after_seq 增量翻页；跨用户/未知 run → 404
 * - GET /api/ops/schedules?thread_id= → `{ok:true, data:{schedules:[...]}}`（v1 不分页 · 仅本人）
 * - PATCH /api/ops/schedules/{schedule_id} → `{ok:true, data:{schedule}}`
 *   status ∈ {active, paused, cancelled}；cancelled 终态不可逆（已 cancelled 再 PATCH → 422）
 *
 * 错误纪律：422 detail 逐字透传（前端不二次包装 · 15 §1 词表）；`{ok,data}` 拆壳采
 * chatHistory.ts unwrapData 先例（仅本文件拆 · http.ts 不统一转换）。
 */

/** 相对 http.baseURL=/api，实际路径 GET /api/ops/lg-rag/threads/{thread_id}/runs */
export const LG_RAG_THREAD_RUNS_PATH = '/ops/lg-rag/threads'

/** 相对 http.baseURL=/api，实际路径 GET /api/ops/lg-rag/runs/{run_id}/events */
export const LG_RAG_RUN_EVENTS_PATH = '/ops/lg-rag/runs'

/** 相对 http.baseURL=/api，实际路径 GET/PATCH /api/ops/schedules */
export const SCHEDULES_PATH = '/ops/schedules'

/** runs.status 六词表（15 §1 钉死 · 消费方不扩词） */
export type RunStatus =
  | 'running'
  | 'waiting_approval'
  | 'done'
  | 'error'
  | 'disconnected'
  | 'resumed'

/** 定时归因（唯一归因真源 · R12：前缀文案仅展示，不在前端拼归因） */
export interface ScheduleAttribution {
  schedule_id: string
  name: string
  fire_id: string
}

/** threads/{id}/runs 单条（字段族逐键对齐契约 · 不自造字段；query_summary 上游截 80） */
export interface ThreadRunItem {
  run_id: string
  thread_id: string
  status: string
  created_at: string
  finished_at: string | null
  query_summary: string
  schedule_attribution: ScheduleAttribution | null
}

export interface ThreadRunsPage {
  runs: ThreadRunItem[]
  /** keyset 游标；null = 无更多 */
  next_cursor: string | null
}

export interface ThreadRunsParams {
  cursor?: string
  /** 默认 20 · 上限 50（超限 422） */
  limit?: number
}

/** runs/{id}/events 帧（event_type 白名单 8 值 · 宽松容忍不依赖未知键） */
export interface RunEventItem {
  seq: number
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

export interface RunEventsPage {
  run_id: string
  events: RunEventItem[]
  /** true = 超 500 帧截断，用 next_after_seq 翻页 */
  truncated: boolean
  next_after_seq: number | null
}

export type ScheduleKind = 'once_at' | 'interval' | 'daily_at'
export type ScheduleStatus = 'active' | 'paused' | 'cancelled'

/** Schedule 字段族（15 §3 逐键 · humanized_display 优先展示） */
export interface ScheduleItem {
  schedule_id: string
  tenant_id: string
  user_id: string
  thread_id: string
  name: string
  instruction: string
  schedule_kind: ScheduleKind
  run_at: string | null
  interval_seconds: number | null
  time_of_day: string | null
  timezone: string
  next_fire_at: string | null
  catchup_policy: string
  status: ScheduleStatus
  fire_count: number
  max_fires: number | null
  last_fired_at: string | null
  created_at: string
  updated_at: string
  /** 服务端人类化文案（如「每天 08:30（北京时间）」· 前端优先展示不自拼） */
  humanized_display: string
}

/** PATCH body（全可选至少一项 · 本卡仅用 status 流转） */
export interface SchedulePatch {
  status?: ScheduleStatus
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * 拆 `{ok:true,data}` 外壳（chatHistory.ts 同一先例：仅本文件拆，http.ts 不统一转换）；
 * 契约外宽松容忍：非外壳形原样返回（mock/契约微漂不炸）。
 */
function unwrapData(payload: unknown): Record<string, unknown> {
  if (isRecord(payload) && payload.ok === true && isRecord(payload.data)) {
    return payload.data
  }
  return isRecord(payload) ? payload : {}
}

/** P3 单 thread run 列表（keyset 降序 · 跨用户/未知 → 404 由调用方中性化） */
export async function listThreadRuns(
  threadId: string,
  params: ThreadRunsParams = {},
): Promise<ThreadRunsPage> {
  const query: Record<string, unknown> = {}
  if (params.cursor) query.cursor = params.cursor
  if (params.limit !== undefined) query.limit = params.limit
  const { data: payload } = await http.get(
    `${LG_RAG_THREAD_RUNS_PATH}/${encodeURIComponent(threadId)}/runs`,
    { params: query },
  )
  const data = unwrapData(payload)
  const runs = Array.isArray(data.runs) ? (data.runs as ThreadRunItem[]) : []
  const nextCursor = typeof data.next_cursor === 'string' ? data.next_cursor : null
  return { runs, next_cursor: nextCursor }
}

/** P3 run 事件回放（白名单 8 值 · after_seq 增量翻页 · 跨用户/未知 → 404 由调用方中性化） */
export async function fetchRunEvents(runId: string, afterSeq?: number): Promise<RunEventsPage> {
  const query: Record<string, unknown> = {}
  if (afterSeq !== undefined) query.after_seq = afterSeq
  const { data: payload } = await http.get(
    `${LG_RAG_RUN_EVENTS_PATH}/${encodeURIComponent(runId)}/events`,
    { params: query },
  )
  const data = unwrapData(payload)
  const events = Array.isArray(data.events) ? (data.events as RunEventItem[]) : []
  const rid = typeof data.run_id === 'string' ? data.run_id : runId
  const truncated = data.truncated === true
  const nextAfterSeq = typeof data.next_after_seq === 'number' ? data.next_after_seq : null
  return { run_id: rid, events, truncated, next_after_seq: nextAfterSeq }
}

/** P3 当前 thread 定时任务列表（v1 不分页 · 仅本人） */
export async function listThreadSchedules(threadId: string): Promise<ScheduleItem[]> {
  const { data: payload } = await http.get(SCHEDULES_PATH, {
    params: { thread_id: threadId },
  })
  const data = unwrapData(payload)
  return Array.isArray(data.schedules) ? (data.schedules as ScheduleItem[]) : []
}

/**
 * P3 定时任务状态流转（pause/resume/cancel · cancelled 终态不可逆）。
 * 422 detail 逐字透传（如「已取消的定时任务不可修改」· 前端不二次包装 · 15 §1 词表）。
 */
export async function patchSchedule(
  scheduleId: string,
  patch: SchedulePatch,
): Promise<ScheduleItem> {
  const { data: payload } = await http.patch(
    `${SCHEDULES_PATH}/${encodeURIComponent(scheduleId)}`,
    patch,
  )
  const data = unwrapData(payload)
  return data.schedule as ScheduleItem
}
