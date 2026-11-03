import { http } from './http'

/**
 * B2 HITL 浏览器决策面 client（web-chat-history-hitl-ux F2-2 · 契约冻结面照抄上游 · 只承接禁改）。
 *
 * 上游真值（ops-desk-api · 只读）：
 * - SPEC `docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md` §2 B2
 * - task `task_hitl_browser_decide.md`（ready · 三闸 approved 2026-09-30）
 * - 实现 `app/ops/hitl/router.py`（pending / decide / resume）
 *
 * 端点（cookie maintainer 鉴权 · 复用 http.ts axios 封装与 401 拦截）：
 * - GET /api/ops/hitl/pending → `{items:[...], count}`（仅本人 owner · 非 maintainer 403 · 未登录 401）
 * - POST /api/ops/hitl/requests/{id}/decide，body `{decision}` —— 置已决，**不自动 resume**（两步钉死）；
 *   可选键 `resume_mode`（inherit/immediate/manual · 上游 router.py:184 白名单 · 未知值 **400** 非 422；
 *   缺省/inherit 由后端按全局 env 裁定，前端默认**不送**该键）；
 *   重复/已决 → 409 · 未知/跨用户 → 404（不泄露存在性）· 非法 decision → 422
 * - POST /api/ops/hitl/requests/{id}/resume —— 既有端点复用（零改动 · 只新增 client 封装）
 *
 * freeze `hitl-browser-decide-v1` 增补 TTL 条（2026-11-02 `HG-W-FIX-DESIGN` 决策②签署生效 · 上游真值
 * api 仓 `docs/tasks/done/task_hitl_browser_decide.md`「freeze 增补条款」节 · 六要素逐字对齐）：
 * - **触发**：`POST /hitl/requests/{id}/resume` 遇 `approved` 单据且 `now - decided_at > TTL`
 *   （或 `decided_at` 不可解析 · fail-closed 视同过期）；
 * - **出口**：**409** + detail 含 `approval_expired` 字样（中文文案含「**过期**」二字，
 *   命中 web mapping `/过期|expired/i`）；
 * - **终态**：拒绝同时单据置 **`expired`**（`STATUS_EXPIRED` · approved→expired 单向迁移，
 *   不覆写 rejected/已 expired 终态）；
 * - **TTL 单一旋钮**：`OPS_HITL_APPROVAL_CONSUMPTION_TTL_SECONDS`（默认 **3600s** · 合法域 [1,86400] ·
 *   越界/非法回退默认 · 真源 `app/ops/lg_rag/multi/nodes.py:328`）——手动 resume 闸与消费环
 *   `_match_fresh_approved` 同一判据，**禁第二旋钮**；
 * - **作用面收窄**：闸只罩 resume/消费环；**decide 不拒超龄 pending**（「批准不过期，执行权过期」）；
 *   **rejected 单据 resume 豁免**；
 * - **渲染语义增量（web 侧承接）**：resume 错误路径新增「过期」触发面，
 *   `HitlApprovalView.vue` `onResume` catch 按 `/过期|expired/i` mapping 行级渲染
 *   「审批已过期，请刷新列表」（W-web-1）。
 *
 * OA 签名面（GET /hitl/requests · GET /hitl/runtime · POST /hitl/callback）零触碰。
 */

export const HITL_PENDING_PATH = '/ops/hitl/pending'
export const HITL_REQUESTS_PATH = '/ops/hitl/requests'

/** pending 列表单条（字段族逐键对齐上游 _PENDING_FIELDS · 不自造字段） */
export interface HitlPendingItem {
  id: string
  run_id: string
  thread_id: string
  reason: string
  blocked_by: unknown
  created_at: string
}

export interface HitlPendingResponse {
  items: HitlPendingItem[]
  count: number
}

export type HitlDecision = 'approved' | 'rejected'

/**
 * decide 可选键 resume_mode（T-W2 · 上游 router.py:184 白名单三值 · 未知值 400）：
 * - inherit：缺省（跟随后端全局 env OPS_HITL_AUTO_RESUME）——前端默认，**不送键**
 * - immediate：decide(approved) 持久化成功后后端进程内自动续跑
 * - manual：显式不自动续跑（维持两步钉死字面）
 */
export type HitlResumeMode = 'inherit' | 'immediate' | 'manual'

/** decide 响应（上游 decide_request 返回形）；`resume` 提示恢复是客户端第二个显式动作 */
export interface HitlDecideResponse {
  ok: boolean
  request: Record<string, unknown>
  resume: {
    required: boolean
    method: string
    endpoint: string
    /** resume_mode=immediate 时后端进程内自动续跑标记（T-W2 S3 实证键 · 可选） */
    auto_triggered?: boolean
  }
}

/** resume 响应中的 replay 提示（前端拿 run_id/cursor 调 lg-rag replay 续看批准后那段） */
export interface HitlResumeReplay {
  run_id: string
  cursor: string
  events_persisted: number
  events_failed: number
  persisted: boolean
  re_interrupted: boolean
}

export interface HitlResumeResponse {
  ok: boolean
  request: Record<string, unknown>
  resume: unknown
  replay: HitlResumeReplay
  ts: number
}

/** B2 浏览器审批列表（当前 maintainer 可见的 pending · 仅本人 owner） */
export async function fetchHitlPending(): Promise<HitlPendingResponse> {
  const { data } = await http.get<HitlPendingResponse>(HITL_PENDING_PATH)
  const items = Array.isArray(data?.items) ? data.items : []
  const count = typeof data?.count === 'number' ? data.count : items.length
  return { items, count }
}

/**
 * B2 置已决（批准/驳回 · 与 OA callback 同语义）；成功不自动 resume。
 * T-W2：`resumeMode` 可选键——仅 immediate/manual 时随载荷送出；
 * 缺省/inherit **不送键**（后端按全局 env 裁定 · 既有 {decision} 载荷字面不变）。
 */
export async function decideHitlRequest(
  requestId: string,
  decision: HitlDecision,
  resumeMode?: HitlResumeMode,
): Promise<HitlDecideResponse> {
  const body: Record<string, unknown> = { decision }
  if (resumeMode && resumeMode !== 'inherit') body.resume_mode = resumeMode
  const { data } = await http.post<HitlDecideResponse>(
    `${HITL_REQUESTS_PATH}/${encodeURIComponent(requestId)}/decide`,
    body,
  )
  return data
}

/** 复用既有 resume 端点（零改动 · 只封装）；decide 成功后由调用方显式第二步触发 */
export async function resumeHitlRequest(requestId: string): Promise<HitlResumeResponse> {
  const { data } = await http.post<HitlResumeResponse>(
    `${HITL_REQUESTS_PATH}/${encodeURIComponent(requestId)}/resume`,
  )
  return data
}
