import { http } from './http'

/**
 * P1-T5b Goal 人工管理面 client（web-p1-t5b-goal-chip · 契约冻结面照抄上游 · 只承接禁改）。
 *
 * 上游真值（ops-desk-api · 只读）：
 * - 设计 07-p1-goal-design.md §4/§5（ops-desk-workspace）
 * - 实现 app/ops/goals/router.py（P1-T2 · issue #390）
 * - 图谱 docs/_tech_graph/l1/10_flow_goals.md（P1-T5a）
 *
 * 端点（cookie 鉴权 · 复用 http.ts axios 封装与 401 拦截）：
 * - GET /api/ops/goals?thread_id= → {goals: GoalItem[]}（**非** {ok,data} 包裹 · 闸 off 无 goal 时 []）
 * - PATCH /api/ops/goals/{goal_id} body {status} → GoalItem
 *   词表外 422 · 跨租户/不存在 404（防探测）· 非法流转/终态 409 · 未登录 401
 *
 * 状态机（上游 store 执行 · 前端只发目标态）：active→{paused,done,abandoned} ·
 * paused→{active,done,abandoned}（O-1：paused 仅人工 PATCH 复活）· done/abandoned 终态不可逆。
 */

/** 相对 http.baseURL=/api，实际路径 GET/PATCH /api/ops/goals */
export const GOALS_PATH = '/ops/goals'

/** 上游 GoalStatus 词表（Literal 前置 · 词表外 422） */
export type GoalStatus = 'active' | 'paused' | 'done' | 'abandoned'

/** 上游 _to_dict 字段族（逐键对齐 · 不自造字段） */
export interface GoalItem {
  goal_id: string
  tenant_id: string
  thread_id: string
  objective: string
  status: GoalStatus
  created_at: string | null
  updated_at: string | null
}

export interface GoalListResponse {
  goals: GoalItem[]
}

/** 按 thread 列 goal（含终态 · 上游 1:1 执行面下至多一条非终态） */
export async function listThreadGoals(threadId: string): Promise<GoalItem[]> {
  const resp = await http.get<GoalListResponse>(GOALS_PATH, { params: { thread_id: threadId } })
  return resp.data.goals
}

/** 人工状态流转（O-1：paused→active 唯一复活通道）；409=非法流转/终态 · 404=不存在/跨租户 */
export async function patchGoalStatus(goalId: string, status: GoalStatus): Promise<GoalItem> {
  const resp = await http.patch<GoalItem>(GOALS_PATH + '/' + encodeURIComponent(goalId), { status })
  return resp.data
}
