import { http } from './http'

/**
 * P3-T9 admin memory 管理页 client（task_web_p3_t9_admin_memory · issue web#106 ·
 * 设计真源 14-p3-schedule-taskcard-design §4 D-D + 15-p3-contracts §5 · 契约冻结面照抄上游）。
 *
 * 上游真值（ops-desk-api app/ops/admin/memory.py:257-456 · FP-1 以端点实际行为为准）：
 * - GET /api/ops/admin/memory/facts：keyset 分页（created_at DESC, id DESC · cursor base64url
 *   不透明透传）；tenant_id 必填（strip 空 400）；status 词表 active/superseded/revoked/expired
 *   （默认 active）；kind fact/preference；limit 默认 50 上限 200；十二字段投影（无 embedding）。
 * - POST /api/ops/admin/memory/facts/{key}/revoke：body {tenant_id, user_id?}（user_id 显式空白
 *   400 · 故空值不出站）；幂等——已撤销/无匹配 200 affected=0（14 §4 D-D 裁定 · 否 409）。
 * - GET /api/ops/admin/memory/episodes：只读；tenant_id 必填；run_id 可选；status active/revoked；
 *   outcome success/failure/partial；十一字段（无 updated_at）。
 *
 * **{ok, data} 包裹壳例外**：admin memory 端点响应为 {"ok":true,"data":{...}} 包裹（与
 * http.ts「无包装」惯例不同）——本 client 内解包取 data 键，页面/状态层只见解包后形态。
 * 权限：cookie maintainer 200 · 非 maintainer 403「Maintainer role required」· 未登录 401
 * （401 跳登录复用 http.ts 全局拦截器）。响应体 snake_case 照登，不自造字段。
 */

export const ADMIN_MEMORY_FACTS_PATH = '/ops/admin/memory/facts'
export const ADMIN_MEMORY_EPISODES_PATH = '/ops/admin/memory/episodes'
export function adminMemoryFactRevokePath(key: string): string {
  return `${ADMIN_MEMORY_FACTS_PATH}/${encodeURIComponent(key)}/revoke`
}

/** facts status 词表（15 §5 · 默认 active · 词表外上游 422） */
export const MEMORY_FACT_STATUSES = ['active', 'superseded', 'revoked', 'expired'] as const
export type MemoryFactStatus = (typeof MEMORY_FACT_STATUSES)[number]

/** facts kind 词表（15 §5） */
export const MEMORY_FACT_KINDS = ['fact', 'preference'] as const
export type MemoryFactKind = (typeof MEMORY_FACT_KINDS)[number]

/** episodes status 词表（15 §5） */
export const MEMORY_EPISODE_STATUSES = ['active', 'revoked'] as const
export type MemoryEpisodeStatus = (typeof MEMORY_EPISODE_STATUSES)[number]

/** episodes outcome 词表（15 §5） */
export const MEMORY_EPISODE_OUTCOMES = ['success', 'failure', 'partial'] as const
export type MemoryEpisodeOutcome = (typeof MEMORY_EPISODE_OUTCOMES)[number]

/** limit 档位（15 §5 · 默认 50 上限 200） */
export const MEMORY_PAGE_LIMITS = [50, 200] as const
export const MEMORY_DEFAULT_LIMIT = 50

/**
 * 记忆事实单条：十二字段投影（15 §5 逐键对齐 · 无 embedding）。
 * expires_at/source_run_id 可空照登（上游 nullable）。
 */
export interface MemoryFact {
  id: string
  tenant_id: string
  user_id: string
  key: string
  value: string
  kind: string
  source_run_id: string | null
  source_turn: number
  status: string
  expires_at: string | null
  created_at: string
  updated_at: string
}

/** 经验剧集单条：十一字段（15 §5 · 无 updated_at） */
export interface MemoryEpisode {
  id: string
  tenant_id: string
  run_id: string
  task_domain: string
  context_fingerprint: string
  plan_summary: string
  tool_sequence: string[]
  outcome: string
  failure_class: string | null
  status: string
  created_at: string
}

export interface MemoryFactsQuery {
  tenantId: string
  userId?: string
  status?: MemoryFactStatus
  kind?: MemoryFactKind
  limit?: number
  cursor?: string | null
}

export interface MemoryFactsPage {
  facts: MemoryFact[]
  nextCursor: string | null
}

export interface MemoryEpisodesQuery {
  tenantId: string
  runId?: string
  status?: MemoryEpisodeStatus
  outcome?: MemoryEpisodeOutcome
  limit?: number
  cursor?: string | null
}

export interface MemoryEpisodesPage {
  episodes: MemoryEpisode[]
  nextCursor: string | null
}

/** {ok:true, data:{...}} 包裹壳解包（admin 端点例外 · 缺键兜底不臆造） */
interface OkEnvelope<T> {
  ok?: boolean
  data?: T
}

/** 「记忆 facts」分页浏览（tenant_id 必填 · keyset cursor 透传 · 十二字段投影） */
export async function fetchMemoryFacts(query: MemoryFactsQuery): Promise<MemoryFactsPage> {
  const { data } = await http.get<OkEnvelope<{ facts?: MemoryFact[]; next_cursor?: string | null }>>(
    ADMIN_MEMORY_FACTS_PATH,
    {
      params: {
        tenant_id: query.tenantId,
        ...(query.userId ? { user_id: query.userId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.kind ? { kind: query.kind } : {}),
        limit: query.limit ?? MEMORY_DEFAULT_LIMIT,
        ...(query.cursor ? { cursor: query.cursor } : {}),
      },
    },
  )
  const payload = data?.data ?? {}
  const facts = Array.isArray(payload.facts) ? payload.facts : []
  const nextCursor = typeof payload.next_cursor === 'string' ? payload.next_cursor : null
  return { facts, nextCursor }
}

/**
 * 撤销记忆（幂等 · 200 affected=0/N 皆正常态 —— 已撤销/无匹配亦 200，非错误非 409）。
 * user_id 空值不出站（上游显式空白 400 · 仅逐字非空时携带）。
 */
export async function revokeMemoryFact(
  key: string,
  body: { tenantId: string; userId?: string },
): Promise<{ affected: number }> {
  const { data } = await http.post<OkEnvelope<{ affected?: number }>>(
    adminMemoryFactRevokePath(key),
    {
      tenant_id: body.tenantId,
      ...(body.userId ? { user_id: body.userId } : {}),
    },
  )
  const payload = data?.data ?? {}
  return { affected: typeof payload.affected === 'number' ? payload.affected : 0 }
}

/** 「历程 episodes」只读视图（tenant_id 必填 · run_id/status/outcome 可选过滤） */
export async function fetchMemoryEpisodes(query: MemoryEpisodesQuery): Promise<MemoryEpisodesPage> {
  const { data } = await http.get<OkEnvelope<{ episodes?: MemoryEpisode[]; next_cursor?: string | null }>>(
    ADMIN_MEMORY_EPISODES_PATH,
    {
      params: {
        tenant_id: query.tenantId,
        ...(query.runId ? { run_id: query.runId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.outcome ? { outcome: query.outcome } : {}),
        limit: query.limit ?? MEMORY_DEFAULT_LIMIT,
        ...(query.cursor ? { cursor: query.cursor } : {}),
      },
    },
  )
  const payload = data?.data ?? {}
  const episodes = Array.isArray(payload.episodes) ? payload.episodes : []
  const nextCursor = typeof payload.next_cursor === 'string' ? payload.next_cursor : null
  return { episodes, nextCursor }
}
