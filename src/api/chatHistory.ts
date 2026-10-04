import { http } from './http'

/**
 * B1 会话历史只读 client（web-chat-history-hitl-ux F1-1 · 契约冻结面照抄上游 · 只承接禁改）。
 *
 * 上游真值（ops-desk-api · 只读）：
 * - SPEC `docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md` §2 B1
 * - task `task_chat_history_api.md`（ready · 三闸 approved 2026-09-30）
 * - 实现 `app/ops/lg_rag/history_router.py` / `history.py`
 *
 * 端点（cookie 鉴权 · 复用 http.ts axios 封装与 401 拦截）：
 * - GET /api/ops/chat/threads → `{ok:true, data:{threads:[...], next_cursor}}`
 * - GET /api/ops/chat/threads/{thread_id}/history → `{ok:true, data:{thread_id, runs:[...], next_cursor}}`
 *
 * 分页：cursor/limit（服务端默认 20 · 上限 100 · 超限 422）；cursor 不透明，只回传不解析。
 * 归属：跨用户/未知 thread → 404（不泄露存在性 · FP-F10）。
 */

/** 相对 http.baseURL=/api，实际路径 GET /api/ops/chat/threads */
export const CHAT_THREADS_PATH = '/ops/chat/threads'

/** latest_run_status 词表（上游 H1 钉死） */
export type ChatLatestRunStatus = 'running' | 'waiting_approval' | 'completed' | 'error'

/** H1 threads 列表单条（字段族逐键对齐上游 build_thread_summary · 不自造字段） */
export interface ChatThreadItem {
  thread_id: string
  title: string
  last_activity_at: string
  run_count: number
  latest_run_status: string
}

export interface ChatThreadsPage {
  threads: ChatThreadItem[]
  /** 下一页游标；null = 无更多 */
  next_cursor: string | null
}

/** H2 history run 内 subtask.progress 摘要（seq/role/status + 透传摘要键 · 上游 summarize_subtasks） */
export interface ChatHistorySubtask {
  seq: number
  agent_role: string
  status: string
  /** 透传摘要键（subtask_result / answer_preview / message / step），宽松容忍不依赖 */
  [key: string]: unknown
}

/** H2 单 run 消息视图（字段族逐键对齐上游 build_run_view · 不自造字段） */
export interface ChatHistoryRun {
  run_id: string
  started_at: string
  query: string
  answer: string
  /** 单 run answer 超 32000 字符截断标记（上游 N3） */
  answer_truncated: boolean
  subtasks: ChatHistorySubtask[]
  /** done.status（缺省 completed）/ error / running / waiting_approval（上游 run_terminal_status） */
  terminal_status: string
  /** hitl.waiting 帧 payload.requests 原样透传（申请 id 等在条目内） */
  hitl: Array<Record<string, unknown>>
}

export interface ChatThreadHistoryPage {
  thread_id: string
  runs: ChatHistoryRun[]
  next_cursor: string | null
}

export interface ChatHistoryPageParams {
  cursor?: string
  limit?: number
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * 拆 `{ok:true,data}` 外壳（与 api/lgRag.ts 同一先例：仅本文件拆，http.ts 不统一转换）；
 * 契约外宽松容忍：非外壳形原样返回（mock 先行期契约微漂不炸）。
 */
function unwrapData(payload: unknown): Record<string, unknown> {
  if (isRecord(payload) && payload.ok === true && isRecord(payload.data)) {
    return payload.data
  }
  return isRecord(payload) ? payload : {}
}

function buildParams(params: ChatHistoryPageParams): Record<string, unknown> {
  const query: Record<string, unknown> = {}
  if (params.cursor) query.cursor = params.cursor
  if (params.limit !== undefined) query.limit = params.limit
  return query
}

/** B1 线程列表（当前用户 · last_activity_at 倒序 · cursor 分页） */
export async function fetchChatThreads(
  params: ChatHistoryPageParams = {},
): Promise<ChatThreadsPage> {
  const { data: payload } = await http.get(CHAT_THREADS_PATH, { params: buildParams(params) })
  const data = unwrapData(payload)
  const threads = Array.isArray(data.threads) ? (data.threads as ChatThreadItem[]) : []
  const nextCursor = typeof data.next_cursor === 'string' ? data.next_cursor : null
  return { threads, next_cursor: nextCursor }
}

/** B1 单 thread 完整历史（run 升序消息视图 · 跨用户/未知 → 404 由调用方中性化） */
export async function fetchThreadHistory(
  threadId: string,
  params: ChatHistoryPageParams = {},
): Promise<ChatThreadHistoryPage> {
  const { data: payload } = await http.get(
    `${CHAT_THREADS_PATH}/${encodeURIComponent(threadId)}/history`,
    { params: buildParams(params) },
  )
  const data = unwrapData(payload)
  const runs = Array.isArray(data.runs) ? (data.runs as ChatHistoryRun[]) : []
  const nextCursor = typeof data.next_cursor === 'string' ? data.next_cursor : null
  const tid = typeof data.thread_id === 'string' ? data.thread_id : threadId
  return { thread_id: tid, runs, next_cursor: nextCursor }
}
