# Task：Web · 独立 HITL 审批页（/hitl · 第四审批入口 · 冻结契约零分叉）

> **状态**：`done`（v1.0 · 2026-10-30 CLOSE · 30/40 已交付（40 结论 approved-with-comments 零阻塞 · 三门复跑 EXIT=0）· 分支 `task/web-hitl-approval-page` 已完整合入 main（merge-base = 分支尖 c271761 · 实现 commit a34c626 已在位）· D9 volatile 短注已补 · **TC9 待维护者手测回填**（维护者定夺 2026-10-30）· 00 代签 · 授权锚 = 维护者当面定夺 2026-10-30 · 全程本地零 push）  
> **类型**：feature / 前端新页面（Vitest 组件级 · api-only-consume）  
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api；**禁止**改 `src/api/hitl.ts` 契约语义；存量审批面（HitlApprovalCard / ChatView / chat store）零触碰  
> **分支**：`task/web-hitl-approval-page`（30 开工时才切 · 本棒不切分支、不改 src、不 commit）  
> **00 注**：2026-10-23 · 需求真值 `../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`（自包含 Prompt v1）· 无上游 SPEC · R0–R5 写在本 task · **30 在 HG-AUDIT-R1=pending 时拒开工**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-approval-page` |
| **git_branch** | `task/web-hitl-approval-page`（30 开工时才切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · 切分支）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 组件级红测先行（新页面 spec：列表渲染、决策确认、两步链、错误态），再改 `src/`。质量门在仓根按序执行 `pnpm lint`、`pnpm test`、`pnpm build`（`package.json` 的 `packageManager` 为 `pnpm@10.32.1`）。图谱改动后加跑 `./scripts/graph-compile.sh`。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `hitl-browser-decide-v1`（`src/api/hitl.ts` 冻结契约 · 只消费禁改） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md`（pages 行增量备注）+ 新增 `docs/_tech_graph/l1/10_flow_hitl.graph.yaml` |
| **graph_delta_note** | 10 评估（2026-10-23 亲读）：新页面落在既有 `pages`（`src/views/**`）与 `router`（`src/router/**`）一级模块内，**预计不新增一级模块**。30 交付时：pages 行增量备注（新增 HITL 审批页 `/hitl`）；新增 `10_flow_hitl.graph.yaml`（形态参照 `10_flow_capability.graph.yaml`）并在关联节补链接；跑 `./scripts/graph-compile.sh` 使 `10_flow_hitl.md` 与 yaml 一致。若 30 实证需新增一级模块：停并回签 HG-GRAPH-MODULES（FP-14）。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：独立审批页 = 第四审批入口，与 Chat 内联卡片消费同一份冻结契约 `src/api/hitl.ts` 零分叉；decide 成功 ≠ 自动 resume 的两步钉死在本页同样成立。真值指针 = 本 task。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 2026-10-23 · 10 落稿 · 维护者授权 00 代录签收（m00042） |
| HG-AUDIT-R1 | approved | 30 | 2026-10-23 · 20-task-audit R1 approved-with-comments（`docs/harness/reviews/task_web_hitl_approval_page_audit_R1_20261023.md` · NIT×3 非阻塞）· 维护者授权 00 代录签收（m00042） |
| HG-GRAPH-MODULES | approved | 30 | 2026-10-23 · 10 评估：新页面在 `src/views/` + `src/router/` 既有 pages/router 模块内，预计**不新增一级模块**；30 交付时同步 `docs/_tech_graph/l1/01_modules.md` pages 行增量备注 + 新增 `10_flow_hitl.graph.yaml` + `./scripts/graph-compile.sh` 绿（见 graph_delta_note 与 D8）· 维护者授权 00 代录签收（m00042） |

---

## 背景与目标

现有审批面全在 Chat 页：消息流内联卡片 `src/components/chat/HitlApprovalCard.vue`（live 帧/replay/历史三入口同一渲染）、侧栏待审批徽章、`ChatView.vue:43-44` 进页一次性 pending 核对 + `:101-104` 手动刷新（**刻意不轮询**）。审批人必须进 Chat 页才能看到待审批项。

完成态：新增**独立 HITL 审批页**（路由 `/hitl` + 主导航入口），聚合展示当前用户全部待审批项，支持批准/驳回（二次确认 + 防重复提交 + resume_mode 三选）与显式续跑两步链，作为 Chat 页内联审批之外的**第四入口**，与既有契约语义零分叉。

### 00 定夺

维护者可后改。10 不得推翻，只补可机断措辞。

| id | 定夺 |
|----|------|
| D1 | 第四入口：新增路由 `/hitl`（name `hitl`）挂 AppLayout children + `src/layouts/AppLayout.vue` 主导航菜单入口；未登录沿用既有守卫（`src/router/index.ts:99-111`）跳 login。存量审批面零触碰。 |
| D2 | api-only-consume。只消费 `src/api/hitl.ts` 三函数（`fetchHitlPending` / `decideHitlRequest` / `resumeHitlRequest`）；不改其契约语义；不自造 pending 字段（`HitlPendingItem` 六键照登）；不自造 resume_mode 第四值。 |
| D3 | 列表每行展示：reason、`blocked_by` 只读 JSON 快照（审批人必须看到「将要执行的确切内容」，对应后端 hitl_snapshot_fields 防批A执行B语义）、created_at 与已等待时长、thread_id/run_id 截断展示。 |
| D4 | 决策动作：批准/驳回需二次确认；决策中防重复提交（按钮 disabled）；resume_mode 三选 UI 与 `HitlApprovalCard.vue:49-60` 同文案同语义（续跑默认 inherit **不送键** / 批准即续跑 immediate / 手动续跑 manual · 前端发不出第四值）。 |
| D5 | 两步钉死：decide 成功 ≠ 自动 resume。`resume.required=true` 且非 `auto_triggered` 时该行出现显式「续跑」按钮调 `resumeHitlRequest`；`resume_mode=immediate` 且响应 `resume.auto_triggered=true` 时不显示「续跑」，显示已自动续跑提示。 |
| D6 | 「回到会话查看」链接形态（thread 定位核实结论 · 见下节）：Chat 页**不支持** thread 定位参数。链接 = 仅跳 `{ name: 'chat' }`，**不携 thread_id query**（不臆造路由参数）；进入后由 ChatView `onMounted` 既有门控（`loadLatestSession` + `refreshHitlPending`）呈现。thread_id 在审批页行内照常截断展示供人工对照。Chat 页 thread 深链参数另立 task，本 task 非范围。 |
| D7 | 刷新纪律：手动刷新按钮，**不轮询**（与 `ChatView.vue:43,101` 既有裁定一致）。**采纳可选项** visibilitychange：`document.hidden` 由 true 回 false 的边沿刷新一次 `fetchHitlPending()`。理由：事件驱动单次、非轮询，不与「不轮询」裁定冲突；TTL 3600s 下长时间挂页的陈旧列表（含已过期项）价值低，回前台刷一次成本低。监听挂在新页组件生命周期内，卸载即移除；不触碰 ChatView 既有 visibilitychange 监听（其职责是游标分流，互不影响）。 |
| D8 | 图谱：不新增一级模块；30 交付时 `01_modules.md` pages 行增量备注 + 新增 `10_flow_hitl.graph.yaml` + `./scripts/graph-compile.sh` 绿（graph_delta_note）。 |
| D9 | wiki：`docs/coding_wiki/volatile.md` 短注（wiki_delta_note），禁无理由 `n/a`。 |

---

## 现状锚点（只读 · 10 亲读 2026-10-23）

| 主题 | 锚点 | 现状 |
|------|------|------|
| 路由表 | `src/router/index.ts:13-86` | login + AppLayout children（overview/obs/issues/pulls/graph/chat/lc-evidence/lg-rag/capability），**无审批页路由** |
| 认证守卫 | `src/router/index.ts:99-111` | `ensureMe` 探测 → 非 public 未登录跳 `/login?redirect=<fullPath>`；新页面零新增守卫逻辑 |
| 401 拦截 | `src/router/index.ts:118-125` | `setUnauthorizedHandler`：clearSession + 跳 /login（带 redirect），复用既有 |
| 主导航 | `src/layouts/AppLayout.vue:38-51` | `el-menu router` 模式按 index 路径跳转；新增菜单项即一行 |
| Chat pending 核对 | `src/views/ChatView.vue:43-44` | `onMounted` 一次性 `loadLatestSession()` + `refreshHitlPending()`（不轮询） |
| Chat 手动刷新 | `src/views/ChatView.vue:101-104` | `onRefreshPending` 单行提示 + 刷新钮（F1/D1-3 裁定 · 不轮询） |
| Chat visibility 监听 | `src/views/ChatView.vue:23-58` | visibilitychange/pagehide/pageshow 仅服务 SSE 游标分流（tab-hide-resume task），与 pending 刷新无关；新页独立监听互不影响 |
| Chat thread 定位 | `src/views/ChatView.vue` 全文 + `src/router/index.ts:56-62` | `/chat` 无 path/query 参数定义；ChatView 仅用 `route.fullPath`（:65，登录 redirect），全文无 `route.query` / `route.params` 消费；`ChatHistoryPanel.vue:16,77` 经 `emit('select', thread_id)` 页内选择。**结论：不支持 thread 定位参数** |
| 语义对照面 | `src/components/chat/HitlApprovalCard.vue:49-60` | resume_mode 三选文案：续跑默认 / 批准即续跑 / 手动续跑（默认 inherit · `:19`）；`:21-23` onDecide → store `decideHitl`（两步链在 store）；`:25-28,85-93` decide 成功后「续看推进」走 Chat 页既有 `resumeFromCursor`（审批页**不复用**该机制） |
| 冻结契约 | `src/api/hitl.ts` | `fetchHitlPending()` → GET pending（仅本人 owner · 非 maintainer 403 · 未登录 401）；`HitlPendingItem` 六键 {id, run_id, thread_id, reason, blocked_by, created_at}；`decideHitlRequest(id, decision, resumeMode?)` resumeMode 仅 immediate/manual 送键、inherit 不送（:99-100）；decide 409=重复/已决、404=未知/跨用户、422=非法 decision、400=未知 resume_mode；`resumeHitlRequest(id)`；`HitlDecideResponse.resume` {required, method, endpoint, auto_triggered?}；`HitlResumeResponse.replay` {run_id, cursor, ...} |
| 模块表 | `docs/_tech_graph/l1/01_modules.md:15` | pages 行路径 glob `src/views/**`, `src/pages/**`；:29-40 人签记录既有模式 = 不新增一级模块时行增量备注随 30 交付落盘 |
| flow 形态参照 | `docs/_tech_graph/l1/10_flow_capability.graph.yaml` | 最近一次「新页面 → 新 flow yaml + graph-compile」先例（capability 目录页） |
| 后端锚点（禁改只读） | `../ops-desk-api/app/ops/hitl/router.py` | pending/decide/resume；审批 TTL 3600s（过期项 decide 失败）；owner-only 鉴权；:184 resume_mode 白名单三值、未知值 400 |

---

## 范围

- [ ] 新路由 `/hitl`（name `hitl` · meta.title 建议「审批」）挂 AppLayout children；未登录沿用既有守卫（D1）。
- [ ] `src/layouts/AppLayout.vue` 主导航新增菜单入口（D1）。
- [ ] 新视图（建议 `src/views/HitlApprovalView.vue`，30 可微调命名但须在 invoke 留痕）：`onMounted` 一次性 `fetchHitlPending()`；列表渲染 D3 字段；loading / 空列表（「无待审批」）/ 错误三态齐备（403 单列权限文案）。
- [ ] 决策动作（D4）：二次确认 + 决策中防重复提交 + resume_mode 三选与 HitlApprovalCard 同语义。
- [ ] 两步链（D5）：decide 成功后按 `resume.required` / `auto_triggered` 渲染「续跑」按钮或已自动续跑提示；点续跑调 `resumeHitlRequest`；成功后展示「回到会话查看」入口（跳 `/chat` · D6），可展示 `replay.run_id` / `cursor` 摘要。
- [ ] 驳回路径：`decision='rejected'` 成功后该行不再出现续跑按钮，列表刷新。
- [ ] decide / resume 成功后联动刷新 pending 列表（过期项随 FP-5 文案显现或被移除）。
- [ ] 刷新纪律（D7）：手动刷新按钮；visibilitychange 回前台边沿刷新一次；组件卸载移除监听；不轮询。
- [ ] Vitest 组件级测试红测先行（建议 `tests/hitl-approval-page.spec.ts`）：列表渲染、决策确认 + 防重、两步链、错误态（TC1–TC7）。
- [ ] D8 图谱（pages 行增量备注 + `10_flow_hitl.graph.yaml` + graph-compile 绿）+ D9 wiki 短注 + task lint PASS。

## 非范围

- 改后端任何文件；改 `src/api/hitl.ts` 的契约语义（类型注释级完善可议，须在 PR 说明）。
- 自造 pending 字段、自造 resume_mode 第四值、新增审批相关后端调用。
- 轮询 / WebSocket / 全局通知中心（超范围，另立 task）。
- 重构 HitlApprovalCard / ChatView / chat store `decideHitl`（本任务只做新页面，存量零触碰）。
- Chat 页 thread 定位 / 深链参数（另立 task · D6）。
- 审批页消费 `replay` 补帧（replay 消费属 Chat 页既有机制；本页仅给导航入口与 run_id/cursor 摘要）。
- 不改 CI workflow 文件。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 `HG-AUDIT-R1` 仍为 pending 即 30 改码 | GATE_VERIFY 拒开工 | 是（人签后） | 无 |
| FP-2 `fetchHitlPending` 403（非 maintainer / 越界） | 错误态渲染权限文案（如「无权限查看审批列表」）；不渲染列表 | 换有权限账号后手动刷新 | 权限错误条 |
| FP-3 任一请求 401 会话失效 | 沿用 `http.ts` 401 拦截 → clearSession + 跳 `/login?redirect=/hitl`（`router/index.ts:118-125` 既有机制 · 零新增） | 重登后回跳 | 跳登录页 |
| FP-4 `fetchHitlPending` 网络失败 / 超时 | 错误态 + 手动重试（刷新按钮） | 是 | 网络错误条 |
| FP-5 TTL 3600s 过期项 decide | 后端 decide 失败；行级「审批已过期」类提示；刷新列表移除/标记该项 | 否（该项）；列表可手动刷新 | 行级过期提示 |
| FP-6 decide 409（重复/已决，含防重复提交被绕过的兜底） | 行级「该审批已被处理」提示；刷新列表 | 否 | 行级提示 |
| FP-7 decide 404（未知/跨用户 · 后端不泄露存在性） | 行级「审批不存在或无权处理」提示；刷新列表 | 否 | 行级提示 |
| FP-8 resume_mode 臆造第四值 | UI 只提供三选，前端根本发不出第四值；若契约外值漏出，后端 `router.py:184` 白名单 **400** → 决策失败提示，不置已决 | 修正后重试 | 决策失败提示（400） |
| FP-9 decide 成功但 UI 误以为已续跑（两步链断裂） | 违反 D5：decide 成功 ≠ 自动 resume；`resume.required=true` 且非 `auto_triggered` 时必须等用户显式点「续跑」；Vitest 锁「decide 成功后未自动调 resumeHitlRequest」断言 | 是（点续跑） | 「续跑」按钮保持可见 |
| FP-10 决策中重复点击批准 / 驳回 / 续跑 | 决策中按钮 disabled（防重复提交 · D4）；双请求兜底由 FP-6 的 409 承接 | — | 按钮禁用态 |
| FP-11 resume 失败（网络 / 404 / 409） | 网络类：「续跑」按钮保持可重试；404/409：行级提示并刷新列表 | 网络类是；404/409 否 | 行级失败提示 |
| FP-12 `resume_mode=immediate` 且 `auto_triggered=true` | 不显示「续跑」按钮；显示「已批准并自动续跑」提示 + 「回到会话查看」入口 | — | 行级成功提示 |
| FP-13 visibilitychange 频繁切换 | 仅 hidden→visible 边沿刷新一次（单次 fetch）；不轮询；决策中不被刷新打断行内状态 | 是 | 无 |
| FP-14 30 实证需新增一级模块 | 停并回签 HG-GRAPH-MODULES（D8 · 评估预计不发生） | 人签后继续 | 无 |

---

## 验收标准

- [ ] **TC1（列表渲染三态）**：mock `fetchHitlPending` 返回 2 条 → 行内可见 reason、`blocked_by` JSON 快照、created_at / 已等待时长、thread_id/run_id 截断展示；`items=[]` → 空态「无待审批」；加载中 → loading 态。三态各有断言。
- [ ] **TC2（决策确认 + 防重）**：点批准 → 出现二次确认；确认后 `decideHitlRequest` 恰好调用一次且 `decision='approved'`；确认后决策中按钮 disabled；连续点击不产生第二次请求。
- [ ] **TC3（resume_mode 语义零分叉）**：选 inherit 时 decide body **不含** `resume_mode` 键；选 immediate/manual 时含对应键；选项文案与 `HitlApprovalCard.vue:57-59` 一致（续跑默认 / 批准即续跑 / 手动续跑）；UI 不存在第四选项。
- [ ] **TC4（两步链）**：decide 响应 `resume.required=true`（无 `auto_triggered`）→ 行内出现「续跑」按钮且**未**自动调 `resumeHitlRequest`；点续跑 → `resumeHitlRequest` 调用一次；成功 → 出现「回到会话查看」入口（router-link 目标 name=`chat` · **无 query 参数** · D6）。
- [ ] **TC5（immediate 分支）**：decide 响应 `resume.auto_triggered=true` → 不出现「续跑」按钮；出现已自动续跑提示与「回到会话查看」入口。
- [ ] **TC6（错误态）**：`fetchHitlPending` 403 → 权限错误态；网络失败 → 网络错误态可重试；decide 过期失败 → 行级「审批已过期」类提示；decide 409 → 「已被处理」类提示。各自断言。
- [ ] **TC7（驳回路径）**：驳回二次确认后 `decideHitlRequest`（`decision='rejected'`）；成功后列表刷新且该行不出现续跑按钮。
- [ ] **TC8（质量门 + 过程）**：仓根 `pnpm lint` / `pnpm test` / `pnpm build` 退出码均 0（`packageManager` 为 `pnpm@10.32.1`）；`./scripts/graph-compile.sh` 退出码 0；`01_modules.md` pages 行增量备注已落、`10_flow_hitl.graph.yaml` 新增且编译产物一致、未新增一级模块；`docs/coding_wiki/volatile.md` 有本 task 短注；`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_approval_page.md` 为 PASS。
- [ ] **TC9（手测 + PR 材料）**：本地起 ops-desk-api + 构造挂起 run，手测 批准 →（required 时）显式续跑 → 「回到会话查看」链路通过；PR 描述含 `/hitl` 四态截图（列表 / 空 / 403 / 过期错误）、与 HitlApprovalCard 的语义对照表、Harness 闸表截图。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 需求真值 | `../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`（自包含 Prompt v1 · 2026-10-23 · 任务一句话/现状/7 条功能需求/非范围/5 条验收） |
| 冻结契约 | `src/api/hitl.ts`（freeze `hitl-browser-decide-v1` · 只消费禁改） |
| 语义对照面 | `src/components/chat/HitlApprovalCard.vue`（resume_mode 三选 · 两步链 · 防重） |
| 现状锚点 | `src/router/index.ts` · `src/layouts/AppLayout.vue` · `src/views/ChatView.vue` |
| 图谱 | `docs/_tech_graph/l1/01_modules.md`（pages 行增量备注）· `docs/_tech_graph/l1/10_flow_capability.graph.yaml`（新 flow 形态参照） |
| 后端锚点（禁改只读） | `../ops-desk-api/app/ops/hitl/router.py`（pending/decide/resume · TTL 3600s · owner-only · :184 白名单） |
| 格式粒度参照 | `docs/tasks/active/task_web_lg_rag_sse_tab_hide_resume.md`（结构参照 · 内容无关） |

## 给执行帽的必读列表

1. 本 task（00 定夺 D1–D9、failure_paths、TC1–TC9）。`HG-AUDIT-R1` 为 pending 时 30 拒开工。
2. `AGENTS.md` 仓内定制：质量门 `pnpm lint` → `pnpm test` → `pnpm build`；`wiki_delta` 勿默认 `n/a`。
3. 需求真值 `../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`。
4. `src/api/hitl.ts`（冻结契约逐字段 · decide/resume 响应形状 · 错误码面）。
5. `src/components/chat/HitlApprovalCard.vue`（语义对照 · 文案对齐 · 不复用其 store 链路）。
6. `src/views/ChatView.vue:23-58,101-104`（visibility 监听先例 · 手动刷新不轮询裁定）与 `src/router/index.ts`（守卫 · 401 拦截 · 无 thread 参数现状）。
7. `src/layouts/AppLayout.vue:38-51`（菜单挂载点）。
8. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）。
9. 既有组件级测试参照：`tests/chat-view.spec.ts` 等 `tests/*.spec.ts`（本 task 新增 spec · 不放宽既有断言）。
10. `docs/_tech_graph/l1/01_modules.md` 与 `docs/_tech_graph/l1/10_flow_capability.graph.yaml`（图谱增量形态）。
11. 本仓无 `docs/standards/CODING_*_L2`，以 `AGENTS.md` 约束为准。

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 框定：新增独立审批页第四入口，冻结契约零分叉，两步钉死，不轮询。无上游 SPEC，思考写在本 task | false | — | 闸未签，30 拒开工 |
| R1 | 证据：路由表无审批页；ChatView 不消费 route.query/params（thread 定位不支持）；HitlApprovalCard 三选文案与两步链在 store；hitl.ts 错误码面（403/401/409/404/422/400）与 TTL 3600s 已钉 | false | — | 后端 decide 过期失败的具体错误码/文案未钉（按行级失败提示泛化处理） |
| R2 | 方案：D1–D9 入表；visibilitychange 采纳并声明理由；「回到会话查看」= 仅跳 /chat 不携参；图谱不新增一级模块 | false | — | 视图命名与行级组件拆分留给 30（invoke 留痕） |
| R3 | 反例：勿臆造 `?thread=` 路由参数；勿臆造 resume_mode 第四值；勿轮询；勿 decide 后自动 resume；勿触碰存量审批面；勿在审批页消费 replay 补帧 | false | — | 30 可能想把 decide+resume 合成一键（违反 D5，测试锁死） |
| R4 | 验收：TC1–TC8 可由 Vitest 或命令退出码机断；TC9 手测 + PR 材料由 40/维护者核 | false | — | 手测依赖本地 ops-desk-api 构造挂起 run |
| R5 | 收口：范围/非范围/failure_paths/TC 齐备可交 20；本窗不改 src、不切分支、不 commit、不签闸 | true | 契约/路由/组件/图谱锚点已亲读，需求 7 条与验收 5 条逐条落入，再轮没有新的代码证据 | 过期 decide 的具体错误体未实证（FP-5 按泛化失败提示设计）；HG-AUDIT-R1 仍 pending |

**actual_last_round**：R5（early_stop）

### R0

问题：审批面只在 Chat 页内联，审批人必须进 Chat 才能看到待审批项。完成态：独立 `/hitl` 页聚合本人 pending 列表，支持批准/驳回与显式续跑，语义与既有契约零分叉。无上游 SPEC，R0–R5 不能省。

### R1

亲读核实：`src/router/index.ts` 九条路由无审批页；守卫与 401 拦截可直接复用。`ChatView.vue` 全文无 `route.query`/`route.params` 消费（仅 :65 `route.fullPath` 供登录 redirect），历史选择走 `ChatHistoryPanel` 页内 emit——Chat 页不支持 thread 定位参数，故「回到会话查看」只能是纯导航。`HitlApprovalCard.vue:49-60` 钉住 resume_mode 三选文案；两步链 `decideHitl` 在 chat store，新页不复用（卡片机制与 Chat 消息流耦合）。`src/api/hitl.ts` 钉住：inherit 不送键、409/404/422/400 错误码面、`resume.required`/`auto_triggered`/`replay` 响应形状。`01_modules.md` 人签记录显示「不新增一级模块 + 行增量备注」是既有模式。

### R2

方案落成 D1–D9。visibilitychange 取舍：**采纳**——事件驱动单次刷新不是轮询，不与 `ChatView.vue:43,101` 裁定冲突；TTL 3600s 下陈旧列表（含已过期项）价值低，回前台刷一次成本低；监听随组件卸载移除。图谱侧预计零新一级模块，新增 `10_flow_hitl.graph.yaml` 参照 capability 先例。

### R3

反例清单：臆造 `?thread=` 参数（无路由承载，D6 禁）；臆造 resume_mode 第四值（后端 400，FP-8）；decide 成功即视为已续跑（两步链断裂，FP-9，TC4 锁）；轮询 pending（违反裁定）；在审批页复用 chat store `decideHitl`（与消息流耦合，且会触碰存量）；审批页消费 replay 补帧（属 Chat 页机制）。

### R4

TC1–TC3 锁列表/决策/三选语义；TC4–TC5 锁两步链两分支；TC6 锁错误态四例；TC7 锁驳回；TC8 用命令退出码与文件断言机断过程项；TC9 为手测与 PR 材料（人机混合验收）。failure_paths 覆盖需求点名的五类（TTL 过期 / 403 / 第四值 400 / 两步链断裂 / 防重）并补齐 401/网络/resume 失败/409/404。

### R5

草稿可交 20-task-audit。需求 Prompt 的 7 条功能需求 → 范围与 D1–D9；5 条验收 → TC1–TC9；非范围 4 条 → 非范围节；failure_paths 五类点名全覆盖。`HG-AUDIT-R1` 保持 pending。本窗不改 `src/`、不改 `tests/`、不切分支、不 commit。

---

## 实现备忘（子 Agent 回填）

| 项 | 状态 | 备注 |
|----|------|------|
| 视图/路由/菜单 | done | `src/views/HitlApprovalView.vue` 已落（采纳建议名）· `src/router/index.ts` `/hitl` 路由（name=hitl · AppLayout children · 守卫零改动复用）· `src/layouts/AppLayout.vue` 主导航「审批」菜单项 · 实现 commit a34c626 已随分支并入 main（30 invoke 2026-10-23 留痕） |
| Vitest 组件级 | done | `tests/hitl-approval-page.spec.ts` 红测先行 · **17 用例**（40 复跑：hitl spec 单跑 17/17 · 全量 35 文件 324 passed 1 skipped） |
| 图谱增量 + wiki 短注 | done | `docs/_tech_graph/l1/01_modules.md` pages 行增量备注 + 新增 `10_flow_hitl.graph.yaml`（inform_graph.v3 · 8 节点 10 边）+ 编译产物 `10_flow_hitl.md` + graph-compile EXIT=0 · 未新增一级模块 · volatile 短注 2026-10-30 本棒补落（D9 欠账清账） |

---

## 测试策略（Harness）

**test_strategy**: `required`

- 先写会失败的 Vitest 组件级测试（TC1–TC7），再改 `src/`。
- TC8 与仓内质量门一致：仓根 `pnpm lint`，然后 `pnpm test`，然后 `pnpm build`。
- 图谱改动后加跑 `./scripts/graph-compile.sh`。
- 手测项（TC9）配本地 ops-desk-api 构造挂起 run 验证链路。

### 自检结论（执行者）

> 回填 2026-10-30 · 00 代签 CLOSE（授权锚 = 维护者当面定夺 2026-10-30 · 全程本地零 push）
> 30/40 执行证据真值：`docs/harness/invokes/by-task/web-hitl-approval-page/`（10/20/30/40 四帽齐备）+ 审查文 `docs/harness/reviews/task_web_hitl_approval_page_review_40_20261023.md`

- **合并态**：分支 `task/web-hitl-approval-page` 已完整合入 main（merge-base = 分支尖 c271761 · 实现 commit a34c626 已在位 · 中途经 dd537d7 并入 web-hitl-resume-chase-ux 支再随该支合入 · 00 亲验 2026-10-30）。
- **质量门（40 invoke 2026-10-23 载明复跑）**：`pnpm lint` EXIT=0 · `pnpm test` EXIT=0（35 文件 324 passed 1 skipped · hitl spec 单跑 17/17）· `pnpm build` EXIT=0 · `./scripts/graph-compile.sh` EXIT=0（重跑产物字节一致）· `npx spec-wave task lint` PASS。
- **40 结论**：approved-with-comments（零阻塞 · NIT ×3 非阻塞：expired 正则优先级保守取舍 / D7 用例二次 unmount / 30 invoke「10 边」实为 9 边笔误——30 invoke 交付摘要自报「8 节点 10 边」，40 核定笔误不改注释仅留痕）。

#### TC1–TC9 逐项落账

| TC | 结果 | 承接依据 |
|----|------|----------|
| TC1 列表渲染三态 | ✅ | 17 用例承接（30 invoke 逐项表：2 行字段族断言 reason/blocked_by JSON/created_at+已等待/thread·run 截断 · 空态「暂无待审批的请求」· loading 态）· 40 复跑 17/17 |
| TC2 决策确认 + 防重 | ✅ | 17 用例承接（二次确认出现 · decide 恰 1 次 decision='approved' · 决策中按钮 disabled · 连点无第二请求；防重提前到 confirm 前更严） |
| TC3 resume_mode 零分叉 | ✅ | 17 用例承接（inherit → 第三参 undefined 不送键 · immediate/manual → 对应键 · 三文案与 HitlApprovalCard.vue:57-59 一致 · 无第四选项） |
| TC4 两步链 | ✅ | 17 用例承接（required=true → 「续跑」按钮出现且 resumeHitlRequest 调用 0 次 · 点续跑调 1 次 · 「回到会话查看」toEqual({name:'chat'}) 无 query · D6） |
| TC5 immediate 分支 | ✅ | 17 用例承接（auto_triggered=true → 无续跑按钮 · 「已批准并自动续跑」提示 + 回会话入口） |
| TC6 错误态 | ✅ | 17 用例承接（403 权限态 · 网络失败错误条+重试 · decide 过期行级提示 · 409 已被处理行级提示） |
| TC7 驳回路径 | ✅ | 17 用例承接（驳回二次确认 · decision='rejected' · 成功后刷新且无续跑按钮） |
| TC8 质量门 + 过程 | ✅ | 40 invoke 2026-10-23 复跑：pnpm lint/test/build 三门 EXIT=0 · graph-compile EXIT=0 · pages 行增量备注已落 · `10_flow_hitl.graph.yaml` 新增且编译产物一致 · 未新增一级模块 · task lint PASS；**D9 volatile 短注 2026-10-30 本棒补落**（30 遗留#1 清账） |
| TC9 手测 + PR 材料 | ⏸ **待维护者手测回填**（维护者定夺 2026-10-30：TC9 手测由维护者自行执行，通过后回报再回填；本 task 先行 CLOSE，本行如实挂起） | 手测需本地 ops-desk-api + 构造挂起 run（批准 → 显式续跑 → 「回到会话查看」链路 + 四态截图/语义对照表/闸表截图） |

#### 遗留（非阻塞照登）

1. **TC9 手测**：待维护者手测回填（维护者定夺 2026-10-30）。
2. **graph.json 产物归属**（30 invoke 遗留#3）：2026-10-30 核查现状——`docs/_tech_graph/graph.json` 与 `docs/_tech_graph/shared/graph.json` 均已跟踪入库且工作树净（含 hitl flow 节点各 35 处命中 · 由后续提交 2cbd3b3「web-hitl-approval-overlay-ux 图谱增量」自然带入 · 与 30 预判「由后续提交自然带入」一致）；本棒不硬改产物归属，仅在 CLOSE invoke 如实记录。
3. **close_pr_policy=required 偏差**：全程本地零 push/未开 PR（维护者当面定夺 2026-10-30 授权 00 代签 CLOSE · 承 246e8e0 / m00085 先例口径）。
