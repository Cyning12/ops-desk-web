# Task：web · Chat 审批浮层对账竞态修复（快照时点滞后误判「已被处理或已失效」· issue #95）

> **状态**：`done`（2026-11-06 · lead 关账 · 30 D 形态 A 落地 + 40 独立复跑验收 PASS 零阻塞零 NIT 新增 · PR #100 merge `e39c404`（30）· PR #101 merge `393fdc4`（40）· 实机时序手测遗留=维护者联调回填 sibling TC9 模式）
> **类型**：fix / 前端 UX 状态同步（issue #95 backlog 立案 · #93 联调验证缺陷上报）
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api 任何文件；**禁止**改 SSE 事件表（api 仓零 diff 红线）；**禁止**动 freeze `hitl-browser-decide-v1`（`src/api/hitl.ts` 请求面只消费禁改）
> **分支**：`task/web-hitl-overlay-reconcile-race`（30 开工时才切；**10 棒 PR 走 ticket 分支 `agent/fix-task-95-ea7283fb4881`，纯文档轨**）
> **10 注**：本 task 按维护者 trigger（2026-11-06 13:40 授权 · lead 全程代行签收与验收）只产 **task 档 + invoke + lint PASS + PR**；**30 改码待闸签收后另行授权**。`HG-DESIGN-FORM`（修复形态 + SSE 流改动边界）为 30 前置设计闸。

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-overlay-reconcile-race` |
| **git_branch** | `task/web-hitl-overlay-reconcile-race`（30 开工时才切 · 10 棒 PR 用 ticket 分支） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 + invoke → 维护者签 HG-TASK-DRAFT → 20-task-audit R1 → 人签 HG-AUDIT-R1 / HG-DESIGN-FORM / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE → 30（红测先行 · 切分支）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 红测先行：先写会失败的负样本（浮层早期渲染实体键滞后的死态断言），再改 `src/`。质量门仓根按序 `pnpm lint` → `pnpm test` → `pnpm build`（`packageManager` 钉 `pnpm@10.32.1`，与 corepack 冲突时用 `npx -y pnpm@10.32.1 <cmd>`）。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `hitl-browser-decide-v1`（`src/api/hitl.ts` 冻结契约存续 · 本 task 只动对账判据/时机，不动协议与请求面） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `docs/_tech_graph/l1/01_struct.md`（hitl/chat 行备注或零 diff 留痕 · 30 实扫）+ `docs/_tech_graph/l1/10_flow_hitl.graph.yaml`（若 flow 语义变化 · 30 实扫） |
| **graph_delta_note** | 10 评估（2026-11-06 亲读）：修复收敛面预计全部落在既有 `src/stores/chat.ts` 对账判据 + 既有刷新点 + 既有测试 spec 内，**预计不新增一级模块、不新增路由、不变 SSE 事件管线**。30 交付时 `01_struct.md` 实扫双核对（对 `01_modules.md`）；若对账时机形态改了 flow 语义则同步 `10_flow_hitl.graph.yaml` 并跑 `./scripts/graph-compile.sh`。若 30 实证需新增一级模块或动事件管线：停并回签 HG-GRAPH-MODULES / HG-DESIGN-FORM（FP-5）。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：浮层对账快照时点/纪元判据口径（竞态根因与修复形态选定后记），真值指针 = 本 task。30 交付时随码补注；10 棒仅立案不补正文。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **related_pr** | issue #95（backlog 立案源 · #93 验证报告缺陷上报） |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-task-audit R1, 30 | 2026-11-06 · lead 签认（PR #96 review · 窗口授权 2026-11-06 13:40 · 依据 #95 受理评论 · merge `692f268` · 00 代录） |
| HG-AUDIT-R1 | approved | 30 | 2026-11-06 · lead 签认（PR #98 review · R1 结论 PASS-WITH-MINOR 零内容阻塞 · merge `dcef6a7` · 偏差登记：审查文「5 用例」实=本文件 4 枚 it() + `tests/chat-store-hitl.spec.ts:1495` FP-6 一枚） |
| HG-DESIGN-FORM | approved | 30 | 2026-11-06 · lead 签认 · **裁决=DP-1 形态 A**（键口径统一·对账纪元不晚于最近一次成功快照）· **首见口径锁「帧首见」**（NIT-2：本端经 hitl.waiting 首次见到 id 的时点 · 不依赖后端 created_at 新字段 · 与 SSE 事件表零 diff 自洽）· 回签书引用 DP-1 A 原文（NIT-3） |
| HG-GRAPH-MODULES | approved | 30 | 2026-11-06 · lead 签认（20-R1 亲验 10 评估合理 · 零新增一级模块/路由/事件管线；30 实扫出图谱面须回签） |
| HG-CONTRACT-FREEZE | approved | 30 | 2026-11-06 · lead 随档签（红线三锁佐证链完整 · FP-2/3/4 + TC5；30 diff 审查佐证闭环） |

---

## 背景与目标

Chat 页审批浮层存在**对账竞态**（issue #95 · #93 联调验证时上报 · bot 先报不修入 backlog）：

- **现象**：新会话发写请求 → `hitl.waiting` 帧到达 → 浮层首个挂起申请**即刻被误转「已被处理或已失效」**（批准/驳回按钮不渲染），同屏编排进度条带却显示「人工审批 · 待审批」（`ChatView.vue:41`）——同一申请两判据自相矛盾。绕径：F5 手动刷新后浮层恢复可动作。
- **维护者框定**：数据聚合两条流（`/sse` 通用打标 与 `/hitl/receipts` 浮层视图）串行消费；浮层**早期渲染**时两条流的**实体键可能滞后**于任务卡派工数据，导致「数据已请求并渲染、卡仍显示死态」。观测面以 issue #95 为准（死态 = 误转「已被处理或已失效」）。
- **根因（bot 诊断 · 10 亲读码面证实）**：`isHitlRequestReconciled` 用 **ChatView 挂载时点**的 pending 快照判对账——快照（T₀）之后服务端才创建、经 `hitl.waiting` 帧到达本端的申请，其 id 必不在 T₀ 快照内 → 被「不在列 = 已被处理」误判转只读。F5 恢复 = onMounted 重拉快照追平。

**完成态**：浮层早期渲染（实体键滞后于 pending 快照）时，waiting 卡**保持可动作**（不陷死态，亦不误转只读）；快照确证服务端已处理后，对账转只读「已被处理或已失效」**仍正确生效**（正样本零回归）；红线三锁全程不破（api 仓零触碰 / SSE 事件表零 diff / 请求面零变更）。

### 设计闸决策点（HG-DESIGN-FORM · 30 前置定夺 · 10 不定夺）

| 决策点 | 候选 | 说明 |
|--------|------|------|
| **DP-1 修复形态** | **A · 键口径统一** | 对账键集合与快照纪元对齐：仅对「本端已知且纪元不晚于最近一次成功快照」的请求 id 参账；SSE 新到（快照后创建/首见）的 id **不参账**，待下一次成功刷新确证。实现口径（纪元戳 / seen 集合 / 帧内时间键）由 30 依实证选型，不得引入轮询。 |
| | **B · 对账时机** | `hitl.waiting` 消费后触发**一次** `refreshHitlPending`（issue #95 修复线索②），令快照追平帧。须带幂等/防抖约束：重复帧、replay 重放帧不得引发刷新风暴（30 实证留痕）。 |
| | **C · 其他** | 20/30 提案，须书面回签 HG-DESIGN-FORM 后生效。 |
| **DP-2 SSE 流改动边界** | 默认最小面 | 收敛面默认 = `src/stores/chat.ts` 对账判据/时机 + 既有 `refreshHitlPending` 刷新点 + 既有测试 spec；`src/composables/useLgRagSse.ts` 与 `processFrame` 事件消费分支（`chat.ts:738-751`）**默认不动**。若所选形态必须动事件管线：先在 HG-DESIGN-FORM 圈定增量，并附 **api 仓 SSE 事件表零 diff** 佐证，否则停。 |

---

## 现状锚点（只读 · 10 亲读 2026-11-06）

| 主题 | 锚点 | 现状 |
|------|------|------|
| 竞态触发点① | `src/views/ChatView.vue:55-61` | onMounted fire-and-forget `refreshHitlPending()`（:58）——快照 T₀ 于挂载时取 |
| 竞态触发点② | `src/views/ChatView.vue:108-111` | 手动刷新入口（F5 恢复路径同源） |
| 快照数据源 | `src/stores/chat.ts:1289-1303` | `refreshHitlPending`：成功置 `hitlPending` + `hitlPendingFetched=true`；403/网络错不置位（FP-4/5） |
| 误判断据 | `src/stores/chat.ts:1313-1318` | `isHitlRequestReconciled`：`hitlPendingFetched && id ∉ hitlPending` → true——**无快照纪元/键首见判据**，T₀ 后新 id 必误判 |
| 标志位 | `src/stores/chat.ts:454-459` | `hitlPendingFetched`：「fetch 成功过」布尔位（D2 判据之一 · 无时点/代际信息） |
| 帧消费 | `src/stores/chat.ts:738-751` | `hitl.waiting` case → `buildHitlState` 写卡；本端已动作守卫（:747）存续——**消费后无任何 pending 刷新联动** |
| 其他刷新点 | `src/stores/chat.ts:1359-1468,1599,1652` | 动作链后（AC16①）与进入 waiting_approval thread（AC16②）刷新；均不覆盖「帧先到、快照后至」时序 |
| 卡片渲染 | `src/components/chat/HitlApprovalCard.vue:22-32,98,138` | `reconciledAway` = waiting ∧ `isHitlRequestReconciled(id)` → 只读 note（`data-test=hitl-card-reconciled`）+ `--reconciled` 样式 |
| 同屏矛盾面 | `src/views/ChatView.vue:41` | 条带文案按 `message.hitl` 出「人工审批 · 待审批（在下方浮层处理）」——与浮层死态并存的矛盾观测面 |
| 既有测试 | `tests/hitl-card-reconcile.spec.ts` · `tests/chat-store-hitl.spec.ts` | 对账正样本（真已处理→转只读）与防误判（403/网络/已动作）已覆盖；**负样本（快照滞后新帧→保持可动作）缺失 = 本 task 红测入口** |
| 冻结契约 | `src/api/hitl.ts` | `fetchHitlPending` / `decideHitlRequest` / `resumeHitlRequest`（freeze `hitl-browser-decide-v1` · 只消费禁改） |
| 上游登记 | issue #95（复现 + bot 诊断 + 修复线索）· issue #93 联调验证报告（证据截图 04/08） | web 仓只读引用 |
| 兄弟 done task | `docs/tasks/done/task_web_ux_state_sync.md` | D2 卡片对账裁定本 task **存续不推翻**——本 task 修的是 D2 判据的时序盲区，非重做对账 |

---

## 范围

- [x] **HG-DESIGN-FORM 定夺后**按所选形态修 `src/stores/chat.ts` 对账判据/时机（A=键口径/纪元判据；B=帧消费后一次性刷新 + 幂等防抖；C=回签后圈定），消除「快照 T₀ 后新到 hitl.waiting 被误判转只读」。
- [x] **正样本零回归**：服务端真已处理（快照确证不在列）→ 转只读「已被处理或已失效」语义不变；403/网络错/本地已动作不做对账（FP-4/5/6 语义）不变。
- [x] **Vitest 红测先行**：负样本先红——构造「快照先于 hitl.waiting 帧」时序 → 卡片保持可动作（`hitl-card-reconciled` 不渲染、批准/驳回可点）；正样本/防误判既有断言零放宽（`tests/hitl-card-reconcile.spec.ts` 扩充）。
- [x] **图谱 + wiki**：30 交付时 `01_struct.md` 实扫备注（或零 diff 留痕）；flow 语义变化则同步 `10_flow_hitl.graph.yaml` + `graph-compile`；`docs/coding_wiki/volatile.md` 补对账纪元/竞态判据短注。
- [x] **红线佐证**：diff 审查证明 api 仓零触碰、SSE 事件表零 diff、`src/api/hitl.ts` 请求面零变更、改码面 ⊆ HG-DESIGN-FORM 圈定面。

## 非范围

- 改 api 仓任何文件（含 SSE 事件表任何 diff——硬红线）；新增/变更后端端点。
- 轮询 / WebSocket / 全局通知中心（既有「零轮询」裁定存续；形态 B 只允许帧驱动的一次性刷新）。
- decide/resume 请求面任何变更（freeze `hitl-browser-decide-v1`）；两步链 / `chaseResumedRun` 追帧管线重构。
- F6 两入口 decide 链式差异统一（freeze 评议另议）；/hitl 审批页行为（本 task 只修 Chat 浮层判据）。
- SSE 事件类型/载荷语义任何变更；`useLgRagSse.ts` 传输解析层改动（除非 HG-DESIGN-FORM 显式圈定）。
- Chat thread 深链、已决单可见性等其他 UX 面（各归其 task）。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 `HG-DESIGN-FORM`（或 HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE）仍为 pending 即 30 改码 | GATE_VERIFY 拒开工 | 是（人签后） | 无 |
| FP-2 30 方案需 api 仓 SSE 事件表任何 diff 才能成立 | 停并回签维护者（越硬红线，形态作废重选） | 否（该项） | 无 |
| FP-3 改码面超出 HG-DESIGN-FORM 圈定收敛面（如擅动事件消费管线/传输层） | 停并回签 HG-DESIGN-FORM | 人签后 | 无 |
| FP-4 `pnpm lint` / `pnpm test` / `pnpm build` 任一非 0（质量门红线） | 30 不得交付，CI 拒合 | 修复后 | 无 |
| FP-5 30 实证需新增一级模块/路由或动 SSE 事件管线 | 停并回签 HG-GRAPH-MODULES / HG-DESIGN-FORM | 人签后 | 无 |
| FP-6 pending 拉取 403 / 网络错 / 401 | 不做对账（既有语义存续）：卡片维持现状，后端 403/409 兜底；401 走 http.ts 全局跳登录 | 换账号/重试 | 既有降级呈现 |
| FP-7 本地已动作（`hitlActedRequestIds` 含 id） | 不参账，acting/decided 不被对账打回（既有守卫优先） | — | 无 |
| FP-8 修复退化防退：服务端真已处理（新快照确证不在列） | 对账转只读**仍须生效**——负样本修复不得以「永不转只读」为代价 | — | 误修防线 |
| FP-9 replay / 历史重放 `hitl.waiting` 帧 | 判据不得把重放帧当「新请求」豁免对账，亦不得把真新帧误判为已处理（与 :747 已动作守卫协同 · 30 实证） | — | 无 |
| FP-10 形态 B 选中而帧高频重复/重放 | 幂等防抖约束必须生效：重复帧不得引发刷新风暴（30 以计数断言实证） | — | 无 |
| FP-11 负样本红测无法先红 | 形态选型或判据落点错误 → 退回 HG-DESIGN-FORM 重定 | — | 无 |

---

## 验收标准

- [x] **TC1（负样本 · 红测先行 · 维护者建议形态）**：构造「pending 快照成功取回（T₀）→ `hitl.waiting` 帧后至（实体键滞后）」时序 → 浮层 waiting 卡**保持可动作**：`hitl-card-reconciled` 不渲染、批准/驳回按钮在且不陷任何死态。测试**先红后绿**（先于实现合入）。
- [x] **TC2（正样本零回归 · FP-8）**：快照成功取回且确证 id 不在列（服务端真已处理）→ 卡片转只读「已被处理或已失效」照常生效；既有 `tests/hitl-card-reconcile.spec.ts` 全绿、断言零放宽。
- [x] **TC3（防误判三向 · FP-6/7）**：403 / 网络错 / 本地已动作三种态下不做对账、卡片态不被改动（沿用既有断言，语义不漂移）。
- [x] **TC4（形态一致性）**：按 HG-DESIGN-FORM 选定形态落断言——形态 A：早于最近一次成功快照的已知 id 缺席→转只读、快照后首见 id 不参账；形态 B：帧消费后恰好触发一次 pending 刷新、重复/重放帧不引发刷新风暴（计数断言）；形态 C：按回签书落。
- [x] **TC5（红线锁 + 质量门）**：diff 审查证明 api 仓零触碰、SSE 事件表零 diff、`src/api/hitl.ts` 请求面零变更、改码面 ⊆ 设计闸圈定面；仓根 `pnpm lint` / `pnpm test` / `pnpm build` 退出码均 0；`01_struct.md` 实扫（或零 diff 留痕），flow 变化时 `10_flow_hitl.graph.yaml` + `./scripts/graph-compile.sh` 绿；`docs/coding_wiki/volatile.md` 短注已落；`npx spec-wave task lint --file` PASS。
- [x] **TC6（10 帽本棒 · 即立案 PR）**：task 档 + 10 invoke 落盘；`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_overlay_reconcile_race.md` PASS；`npx spec-wave task lint-wiki-delta --target .` PASS；`pnpm lint` 退出码 0；PR 出票待审（维护者 trigger 要求 4）。
- [x] **TC7（旧测影响面 · NIT-1 · 30 开工首步）**：grep `tests/hitl-card-reconcile.spec.ts` 4 枚用例 + `tests/chat-store-hitl.spec.ts:1495`（FP-6 面）fixture 时序与形态 A「帧首见」口径相容性——正样本「id 不在列 → 转只读」（:77）fixture 帧先于 fetch 成功存在，按形态 A 口径仍应转只读（保持绿）；翻红=真值对齐断言零放宽。结果回填 30 invoke。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 上游立案 | issue #95（backlog · 复现/根因/修复线索 · #93 验证报告截图 04/08 证据）——web 仓只读引用 |
| 兄弟 done task | `docs/tasks/done/task_web_ux_state_sync.md`（D2 对账裁定存续 · 本 task 修其判据时序盲区不推翻） |
| 冻结契约 | `src/api/hitl.ts`（freeze `hitl-browser-decide-v1` · 只消费禁改） |
| 图谱 | `docs/_tech_graph/l1/01_struct.md` · `docs/_tech_graph/l1/01_modules.md` · `10_flow_hitl.graph.yaml` |
| 既有测试 | `tests/hitl-card-reconcile.spec.ts` · `tests/chat-store-hitl.spec.ts`（扩充不放宽） |

## 给执行帽的必读列表

1. 本 task（设计闸决策点 DP-1/DP-2、failure_paths、TC1–TC6）。**HG-DESIGN-FORM 未签前 30 拒开工**。
2. `AGENTS.md` 仓内定制：质量门 `pnpm lint` → `pnpm test` → `pnpm build`；`wiki_delta` 勿默认 `n/a`。
3. issue #95 正文（复现路径 + bot 根因诊断 + 两条修复线索）。
4. 现状锚点全表（上节）：`src/stores/chat.ts:454-459,738-751,1289-1318,1359-1468,1599,1652` · `src/views/ChatView.vue:41,55-61,108-111` · `src/components/chat/HitlApprovalCard.vue:22-32,98,138`。
5. `docs/tasks/done/task_web_ux_state_sync.md` D2 对账裁定（零轮询零新端点 · FP-4/5/6 防线存续）。
6. `src/api/hitl.ts`（冻结契约逐字段 · 错误码面）。
7. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY · 真值=本 task 人工闸表）。
8. 既有测试 `tests/hitl-card-reconcile.spec.ts`（负样本红测入口 · 断言零放宽）。
9. 本仓无 `docs/standards/CODING_*_L2`，以 `AGENTS.md` 约束为准。

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 框定：bugfix task（issue #95 backlog 立案）· 10 帽只产文档+lint+PR · 30 改码待闸另行授权 · bugfix 合法跳 SPEC | false | — | 闸未签，30 拒开工 |
| R1 | 证据：亲读码面证实竞态链路——onMounted 快照 T₀（ChatView.vue:58）→ `hitlPendingFetched` 布尔位（chat.ts:459）→ `isHitlRequestReconciled` 无纪元判据（:1313-1318）→ 卡误转只读（HitlApprovalCard.vue:28-32）；F5 恢复 = 重拉快照 | false | — | issue #93 截图 04/08 未亲读（web 仓外）——以 issue #95 文字诊断 + 码面锚为准 |
| R2 | 方案：不定夺实现，留 HG-DESIGN-FORM——DP-1 三形态（A 键口径/纪元 · B 帧后一次性刷新 · C 其他）+ DP-2 SSE 流改动边界（默认最小面，事件管线默认不动） | false | — | 形态 B 的刷新风暴约束、形态 A 的纪元口径均需 30 实证——设计闸须人签 |
| R3 | 反例：勿改 api 仓/SSE 事件表（硬红线）；勿轮询/WebSocket；勿放宽正样本转只读（FP-8）；勿动 freeze 请求面/两步链/chase 管线；勿顺手统一 F6；负样本不得靠「永不转只读」凑绿 | false | — | 30 可能为负样本把对账整体禁用——TC2/FP-8 已锁，20-R1 复核 |
| R4 | 验收：TC1 负样本先红（维护者建议形态：浮层早期渲染实体键滞后不再显示死态）；TC2/TC3 锁正样本与防误判零回归；TC4 按形态落断言；TC5 红线+质量门；TC6 锁本棒 10 帽交付 | false | — | 实机时序手测（新会话写请求 → 帧到达）未入 TC——依赖 40/联调复测，照 sibling 先例留待 40 定夺 |
| R5 | 收口：范围/非范围/failure_paths/设计闸/TC 齐备可交 20-task-audit；本棒不改 `src/`、不改 `tests/`、不签闸 | true | 代码锚点/竞态链路/红线均已亲读核实，维护者 trigger 四项要求逐条落入，再轮无新证据 | HG-DESIGN-FORM 未定（30 前置）；#93 截图未亲读（以 issue #95 文字诊断为锚） |

**actual_last_round**：R5（early_stop）

### R0

问题：issue #95 立案——Chat 浮层首个挂起申请在快照滞后的早期渲染中被误转「已被处理或已失效」，与编排进度「人工审批·待审批」自相矛盾；F5 可恢复。维护者 trigger 圈定本 task 为 **10 帽活**：只产 task 档 + invoke + lint PASS + PR；30 改码待闸签收后另行授权。bugfix 有上游 issue 承载（#95 + #93 证据），合法无 SPEC。完成态：实体键滞后时浮层保持可动作、真已处理时对账转只读零回归、红线三锁不破。

### R1

亲读核实竞态链路：`ChatView.vue:55-61` onMounted fire-and-forget 拉快照（T₀）；`chat.ts:1289-1303` 成功才置 `hitlPendingFetched`；`:1313-1318` 判据 = `fetched ∧ id∉pending` ——**无纪元/首见判据**，T₀ 后服务端新建、经 `hitl.waiting` 帧（`:738-751`）到达的申请 id 必不在 T₀ 快照 → 误判转只读；卡片 `:28-32` `reconciledAway` 直接消费该判据；`ChatView.vue:41` 条带按 `message.hitl` 出「待审批」→ 同屏矛盾复现 issue #95 现象。F5 恢复路径 = onMounted 重拉（`:58` 同源）。既有测试 `hitl-card-reconcile.spec.ts` 覆盖正样本与防误判，**负样本（滞后时序）缺失**。

### R2

方案留设计闸不定夺：DP-1 形态 A（键口径统一/快照纪元，SSE 新到 id 不参账待确证）、形态 B（对账时机，`hitl.waiting` 消费后一次性刷新，幂等防抖防风暴）、形态 C（其他须回签）；DP-2 SSE 流改动边界——默认收敛面 = chat.ts 判据/时机 + 既有刷新点 + 测试，事件管线（useLgRagSse/processFrame）默认不动。取舍理由：10 帽无授权定实现，维护者 trigger 明示决策点形态与边界；两候选形态各有实证约束（A 的纪元口径、B 的刷新风暴），须 30 实证 + 人签。

### R3

反例清单：改 api 仓或 SSE 事件表任何 diff（硬红线 · 形态作废）；引入轮询/WebSocket（违反零轮询裁定）；为凑负样本把对账整体禁用或永不转只读（FP-8 防退 + TC2）；动 freeze 请求面/两步链/chase 管线；顺手统一 F6 两入口链式差异；形态 B 无防抖约束直接上（FP-10）。

### R4

TC1 负样本先红（构造 T₀ 快照后至帧时序 · 维护者建议：早期渲染实体键滞后不再显示死态）；TC2 正样本零回归 + TC3 防误判三向（既有断言不放宽）；TC4 按 HG-DESIGN-FORM 形态落断言（A/B/C 分支）；TC5 红线锁 + 质量门 + 图谱/wiki；TC6 锁本棒 10 帽交付物（task lint + lint-wiki-delta + pnpm lint + PR）。实机时序手测照 sibling 先例留 40。

### R5

草稿可交 20-task-audit：维护者 trigger 四项要求逐条落入——① task 档含范围/非范围/验收/ failure_paths/人工闸表/思考轮 + 设计闸决策点（修复形态 + SSE 边界）；② 红测先行入测试策略，负样本按建议形态定；③ 红线三锁入 failure_paths（FP-2/3/4 + TC5）；④ lint PASS 后出 PR。`HG-DESIGN-FORM` 入闸表 blocks 30。本棒不改 `src/`、不改 `tests/`、不签闸。

---

## 实现备忘（子 Agent 回填）

| 项 | 状态 | 备注 |
|----|------|------|
| 对账竞态修复（DP-1 形态 A · 帧首见锁） | ✅ | `chat.ts`：`hitlSnapshotStamp`（成功刷新 +1）+ `hitlFirstSeenStamps`（`stampHitlFirstSeen` 三入口统一登记 · live 帧 / 历史 replay · 仅首写幂等）；`isHitlRequestReconciled` 加「在列→false」与「首见纪元 < 快照纪元」双判据；`hitlSnapshotStamp` 入 store 导出（测试可读）。零轮询 · 不动事件管线（useLgRagSse/processFrame 零 diff） |
| 负样本红测 + 既有断言零放宽 | ✅ | 新增 2 红测（先红后绿）：TC1 组件负样本（快照 T₀ → 帧后至 → 可动作 + 二次刷新转只读）· TC1/TC4 store 纪元往返。TC7 两处 fixture 真值对齐（零放宽）：`hitl-card-reconcile.spec.ts` 正样本改「帧首见→确认快照」生产时序并经 store 帧路径 seed；`chat-store-hitl.spec.ts` TC6 先帧首见 req-gone 再断言。全量 359 绿 |
| 图谱实扫 + wiki 短注 | ✅ | `01_struct.md` pinia 行增量备注（形态 A 纪元化）· graph-compile 绿 · `docs/coding_wiki/volatile.md` 短注已落 |

---

## 测试策略（Harness）

**test_strategy**: `required`

- **红测先行**：先写会失败的 Vitest 负样本（TC1：快照先于 `hitl.waiting` 帧的滞后时序 → 卡片保持可动作、无死态），再改 `src/`。
- 负样本按 HG-DESIGN-FORM 所选形态定（维护者建议：浮层早期渲染时实体键滞后不再显示「派工中/已被处理或已失效」死态）；正样本与防误判既有断言零放宽。
- 质量门与仓内一致：仓根 `pnpm lint` → `pnpm test` → `pnpm build`；图谱改动后加跑 `./scripts/graph-compile.sh`。
- 环境提示：`npx -y pnpm@10.32.1 <cmd>` 绕 corepack 冲突。

### 自检结论（执行者）

- **30（2026-11-06）**：形态 A 落地（见实现备忘）；红测先红 2 例后全绿（359 tests）；质量门 lint/test/build 全 0；红线三锁佐证齐（diff 自查）。
- **40（2026-11-06）**：独立复跑验收 **PASS（零阻塞 · 零 NIT 新增）**——五门独立复跑全 0（359 tests）；TC1–TC7 逐条复验全过；红线三锁独立证实（hitl.ts / useLgRagSse.ts / 事件分支零 diff）；HG-DESIGN-FORM 五条款对拍一致；NIT×3 + 20-R1 偏差登记闭环；闸语义对拍一致。审查文 `docs/harness/reviews/task_web_hitl_overlay_reconcile_race_review_40_20261106.md`。实机时序手测留维护者联调复测回填（sibling TC9 模式 · 不阻塞）。交 lead 关账。

---

### KPI（00）

（`kpi_aggregator: CLOSE` · 关账回溯填写 · 至少一种可解析分数：`Task_KPI%: N` / D1–D5 表 / 四维 1–5）

---

### 经验总结

（`experience_capture: recommended` 时关账必填 · ≥80 字或 ≥3 条列表）
（`wiki_delta=path` 时须含 wiki 指针：`coding_wiki` 路径 / `wiki_promoted:` / `Wiki:`）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 10 帽起草棒（ticket `fix-task-95` · 维护者 trigger 2026-11-06 13:40 授权 · lead 代行签收与验收）：issue #95 立案落稿——设计闸 DP-1 三形态 + DP-2 SSE 边界 · FP-1~FP-11 · TC1–TC6 · R0–R5 early_stop · 五闸 pending 起 |
| 2026-11-06 | lead 签 HG-TASK-DRAFT approved（PR #96 review · 窗口授权 2026-11-06 13:40 · 依据 #95 受理评论 · merge `692f268` · 00 代录）· 状态 draft→pending |
| 2026-11-06 | 20-task-audit R1 PASS-WITH-MINOR（NIT×3 · 审查文 `docs/harness/reviews/task_web_hitl_overlay_reconcile_race_audit_R1_20261106.md`）：零内容阻塞，余下四闸可随档签；lead 预告 HG-DESIGN-FORM=DP-1 形态 A（键口径统一·对账纪元不晚于快照 · 正式签时锁「帧首见」口径 = NIT-2）· 30 开工首步旧测 grep 影响面（NIT-1） |
| 2026-11-06 | lead 随档签 HG-AUDIT-R1 / HG-DESIGN-FORM / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE approved（PR #98 merge `dcef6a7` · 依据 19:04 大授权窗口 + 13:40 授权）· 设计闸锁 DP-1 形态 A「帧首见」口径（NIT-2/NIT-3）· 验收标准补 TC7 旧测影响面（NIT-1）· 状态 pending→active · GO 30 |
| 2026-11-06 | 偏差登记：20-R1 审查文「spec 5 用例在位」实= `hitl-card-reconcile.spec.ts` 4 枚 it() + `chat-store-hitl.spec.ts:1495` FP-6 一枚（跨文件 bundling 不精确 · 覆盖实质不缺失 · 30 以本登记为准） |
| 2026-11-06 | **30 棒交付**（分支 `task/web-hitl-overlay-reconcile-race` · 授权=issue #95 30 GO 评论 · 19:04 大授权窗口）：形态 A 落地（见实现备忘 · 红测先红 2 例后全绿 359 tests · TC7 两处 fixture 真值对齐零放宽）· 质量门 lint/test/build 全 0 · task lint / lint-wiki-delta PASS · graph-compile 绿 · `01_struct.md` 增量备注 + volatile 短注已落 · PR 出票待审 |
| 2026-11-06 | **40 棒验收 PASS**（分支 `verify-40/fix-task-95-ea7283fb4881` · docs-only · 授权=issue #95 40 评论）：五门独立复跑全 0（359 tests）· TC1–TC7 逐条复验 · 红线三锁独立证实 · 裁定对拍一致 · NIT×3+偏差登记闭环（审查文 `docs/harness/reviews/task_web_hitl_overlay_reconcile_race_review_40_20261106.md`）· 零阻塞零 NIT 新增 · 交 lead 关账（实机时序手测留维护者回填 · sibling TC9 模式） |
| 2026-11-06 | **CLOSE 关账**（[00] 帽 · 授权=issue #95 CLOSE 评论 · 照 api#337 CLOSE 先例）：active→done 迁档 · 全链 SHA——10=PR #96 `692f268` · 20-R1=PR #98 `dcef6a7` · 30=PR #100 `e39c404` · 40=PR #101 `393fdc4` · 裁定链终态=DP-1 形态 A 键口径统一（帧首见锁 · 纪元戳+首见 Map 选型）· NIT×3 全闭环 · 20-R1 偏差登记闭环 · volatile 本分节移除（要点由本 done 档承载）· issue #95 由 lead 关 |
