# Task：web · Chat 页 goal chip（P1-T5b · issue web#104）

> **状态**：`in_progress`（2026-11-15 开工）  
> **类型**：feature / 前端轨  
> **统筹**：web 00；**禁止**改姐妹仓任何文件  
> **分支**：`task/web-p1-t5b-goal-chip`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-p1-t5b-goal-chip` |
| **git_branch** | `task/web-p1-t5b-goal-chip` |
| **implement_repo** | `ops-desk-web` |
| **task_kind** | `feature` |
| wave | P1-T5b（07-p1-goal-design §5 T5 行 · web 端最小面） |
| **orchestration** | P1 Goal 主线 T1→T4 api 闭环（#385/#390/#391/#396）· T5a api 文档波（api#399/PR #400）· 本卡=web chip |
| **test_strategy** | `required` |
| **test_strategy_note** | 新增 tests/chat-store-goal.spec.ts 8 件；5 既有 spec 补 goals mock；Vitest 全量 366 passed/1 skipped · vue-tsc 0 · eslint 0 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（无新页面/路由；ChatView 头部加 chip） |
| **graph_delta** | `n/a` |
| **wiki_delta** | `n/a` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；goal 面零 SSE 帧） |
| **related_pr** | 待建 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-11-15 维护者 m02028「本窗口任务继续」+ m02610「继续」· goal-77c5c687 |
| HG-WAVE-IMPL | **approved** | 30 | 同上，T5b 范围=07 §5 T5 行既定（chip 文案「修订目标」禁用「重命名」 · 不进历史列表 · 无推送） |

---

## 背景与目标

api Goal REST 面已上线（GET/PATCH /api/ops/goals · P1-T2 #390）。本卡=web 端最小面：Chat 页头部 thread-id 旁 goal chip——展示当前 thread 目标（截断 24 字）+ 非 active 状态徽标 + el-dropdown 人工状态流转（迁移矩阵上游执行）。

## 范围

1. `src/api/goals.ts`（新）：listThreadGoals / patchGoalStatus · 契约照抄上游（{goals:[...]} 非 ok 包裹 · 422/404/409/401 语义）。
2. `src/stores/chat.ts`：currentGoal/goalActionError + loadThreadGoal（最新非终态优先 · 静默降级）+ patchCurrentGoalStatus（409 对账重拉 · 404 隐藏）；挂点 onDone/openHistoryThread/restoreThreadHistory/startNewSession/clearThreadId。
3. `src/views/ChatView.vue`：chip + 四动作菜单（active→暂停/完成/废弃 · paused→恢复/完成/废弃 · 终态仅展示）+ goalActionError alert；文案「修订目标」**禁用「重命名」**。

## 非范围

objective 编辑（上游仅 status 流转）；历史列表页 goal 列；iOS（另单）；api 改动。

## 失败路径

| 风险 | 缓解 |
|------|------|
| 闸 off 环境 chip 打扰 | listThreadGoals 返回 [] → currentGoal=null → chip v-if 隐藏 |
| goal 接口失败炸主路径 | loadThreadGoal 静默 catch → null；patch 错误走 goalActionError alert 不碰 error 主条 |
| 既有 spec 被 goals 调用污染 | 5 spec 补 vi.mock（listThreadGoals 默认 []） |

## 验收标准

- [ ] chip 仅 currentGoal 非空显示；文案截断 24 字 + tooltip「修订目标 · 全文」
- [ ] 四动作迁移矩阵与上游一致；终态无菜单项
- [ ] PATCH 成功即更新；409→「目标状态已变化」+重拉；404→隐藏
- [ ] 全仓无「重命名」字样
- [ ] Vitest 全绿 + vue-tsc 0 + eslint 0 + task lint PASS

## 必读列表

- ops-desk-api app/ops/goals/router.py（契约真源）
- 07-p1-goal-design.md §5 T5 行
- src/api/hitl.ts（client 体例先例）

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|-----------|
| R0 | 上游契约=非 ok 包裹 {goals:[...]} · 迁移矩阵上游执行前端只发目标态 | 无 |
| R1 | 降级口径对齐 FP-F8：goal 面任何失败不阻塞 Chat 主路径 | 无 |
| R2 | chip 挂点=头部 thread-id 旁（不进历史列表裁定） | 无 |
| R3 | 风险=既有 spec 污染 → 5 文件补 mock | 无 |
| R4 | 回退=revert 单 commit（新文件+局部 hook） | 无 |
| R5 | 完成=验收 5 条全勾+CI 绿 | 无 |

### 自检结论

（CLOSE 回填）

## 实现备忘

（CLOSE 回填）

## 测试策略

tests/chat-store-goal.spec.ts 8 件（选取/降级/成功/409/404/401/清空/渲染）；既有 5 spec 补 goals mock 零回归；全量 Vitest + vue-tsc + eslint。

## 修订记录

| 日期 | 内容 |
|------|------|
| 2026-11-15 | 初稿（派单 web#104） |
