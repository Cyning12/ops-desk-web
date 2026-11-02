# Task：web · HITL resume 错误路径过期映射（镜像薄壳）

> **状态**：`active`（2026-11-02 · 四闸 approved（镜像同步 · api 仓 task 维护者三闸同签+设计四决策 · 00 代录）· **GO 30**）
> **类型**：fix / 薄改（单组件 catch 分支补映射）
> **真值指针**：api 仓 `../ops-desk-api/docs/tasks/active/task_api_w_join_gap_fix.md`（**W-fix-1-web 条 · 范围/钉死契约/验收以彼为准**）· 20-R2 审查文 `../ops-desk-api/docs/harness/reviews/task_api_w_join_gap_fix_audit_R2_20261102.md`
> **分支**：`task/web-hitl-resume-expired-mapping`（base：`main`）
> **10 注**：2026-11-02 · 20-R2 M4 闭环棒（维护者裁决路线=「镜像薄壳」· 满足 web 仓纪律「无 active task 不改码」· 维护者签闸时可推翻）；本棒仅落壳 + lint · **禁止**改 `src/`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-resume-expired-mapping` |
| **git_branch** | `task/web-hitl-resume-expired-mapping` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：resume 返过期错误（含「过期」文案）→ 行级提示「审批已过期，请刷新列表」可达 · 非过期错误路径回归不受影响；质量门 `pnpm lint && pnpm test && pnpm build` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（预估零 diff 或一句 · 以 30 实扫为准） |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md`（预计零 diff；若需备注则 hitl 模块一句「resume 过期映射」） |
| **graph_delta_note** | 薄改在既有 `HitlApprovalView` 组件内 · 不新增模块/路由/组件 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 语义真值在 api 仓 task 与 freeze（增补评估走 api 侧 HG-W-FIX-DESIGN） |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **orchestration** | api 仓 task `api-w-join-gap-fix` 四闸签收 → 本壳镜像确认（不重复签）→ 30（本分支单 PR）→ 40 → 与 api 修复合流后联调 A5 复测（workspace `task_stage_w_e2e_join_acceptance`） |
| **freeze_id** | `hitl-browser-decide-v1`（**D2 零分叉**：只消费既有 decide/resume 契约；resume 路径渲染语义增量随 api 侧 HG-W-FIX-DESIGN 评估 · 本壳不改 freeze 文件） |

### 人工闸（镜像 · 以 api 仓 task 闸为真值 · 本壳不重复签）

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved**（2026-11-02 镜像同步 · 00 代录） | 30 | **镜像**：真值 = api 仓 `task_api_w_join_gap_fix` 同闸（approved 2026-11-02 维护者签）；本壳仅登记 |
| HG-AUDIT-R1 | **approved**（2026-11-02 镜像同步 · 00 代录） | **30** | **镜像**：真值 = api 仓同闸（approved 2026-11-02 维护者签 · api 侧 R2 PASS-WITH-MINOR） |
| HG-GRAPH-MODULES | **approved**（2026-11-02 镜像同步 · 00 代录） | **30**（条件触发） | **镜像**：真值 = api 仓同闸（approved 2026-11-02 维护者签）；本壳预计零图谱 diff |
| HG-W-FIX-DESIGN | **approved**（2026-11-02 镜像同步 · 00 代录） | **30** | **镜像**：真值 = api 仓同闸（approved 2026-11-02 维护者签 · 四决策：409+approval_expired · freeze 增补 · resume/消费环 · STATUS_EXPIRED 启用）；web 映射文案与 api 出口「过期」字样联动 |

---

## 背景与目标

api 侧修复 task（`api-w-join-gap-fix` W-fix-1）将在手动 resume 链补 TTL 过期错误出口（文案含「过期」）。20-R1 审查 B1 坐实可达性断链：web 过期 mapping `/过期|expired/i` 仅存在于 decide 错误路径（`src/views/HitlApprovalView.vue` `decideErrorText:111` · `onDecide` catch `:150` 调用），**`onResume` catch（:173-180）无该 mapping**——409 透传「续跑失败：{message}」（`:176`）· 其余状态码泛化「续跑失败（网络/服务异常），可重试」（`:179`）。api 出口落地而 web 不补，A5「FP-5 行级过期提示可达」仍不可判定。

本壳只做一件事：`onResume` catch 补 `/过期|expired/i` 映射，文案与 decide 路径一致（「审批已过期，请刷新列表」）。

---

## 现状锚点（只读 · 30 必读 · 10 已核）

| 主题 | 路径 · 锚点 | 现状 |
|------|-------------|------|
| decide 路径 mapping（参照） | `src/views/HitlApprovalView.vue:109-111`（`decideErrorText` · `if (/过期|expired/i.test(error.message)) return '审批已过期，请刷新列表'`）· `:150`（onDecide catch 调用） | 已存在 · **本 task 不改** |
| resume 路径缺口 | `src/views/HitlApprovalView.vue:173-180`（`onResume` catch · 409 透传 `:176` · 泛化 `:179`） | **无过期 mapping · 唯一改点** |
| api 出口（上游） | api 仓 `app/ops/hitl/router.py:520 resume_request` · TTL 闸落地见 api task W-fix-1 | 出口语义以 api 仓 HG-W-FIX-DESIGN 签收为准；本壳只认「文案含过期」联动 |

---

## 范围（薄改 · 一条）

- [ ] **W-web-1 · onResume 过期映射**：`src/views/HitlApprovalView.vue` `onResume` catch（:173-180）补 `if (/过期|expired/i.test(error.message))` → 行级提示「审批已过期，请刷新列表」（与 :111 同文案同呈现）；Vitest 补命中用例 + 非过期路径回归

### 非范围

- api 仓一切（TTL 闸 · 出口 · 谓词 · 见 api task）
- decide 路径（`decideErrorText` / `onDecide`）**零 diff**
- 其余 UI 组件 / 路由 / store · SSE freeze · freeze 文件本体
- 联调 A5 复测执行（归 workspace 联调 task 回接 · 本壳只交付可复测条件）
- `tenant_id` / 跨租户任何语义

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| 闸未齐（api 侧真值闸 pending）即 30 | **拒开工** | 是 | 是 |
| mapping 文案与 decide 路径（:111）不一致 | 审查拒收（同文案红线） | 是（改文案） | 否 |
| 误改 decide 路径 / 其他 catch 分支 | diff 审查拒收（改点唯一性） | 是 | 否 |
| api 出口未合入即先行合 web（映射悬空） | 编排拦截：两 PR 均合入后才联调复测（orchestration 条） | 是 | 否 |
| 过期提示替代/吞掉 409 透传语义 | 负样本拦截：非过期 409 仍走 :176 透传 | 是 | 否 |

---

## 验收标准

- [ ] 镜像闸确认：api 仓 `task_api_w_join_gap_fix` 四闸 approved（本壳不重复签）
- [ ] `onResume` catch 命中含「过期」错误 → 行级提示「审批已过期，请刷新列表」（Vitest 用例绿）
- [ ] decide 路径（:109-111/:150）与 409 透传（:176）、泛化（:179）回归零变化
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 全绿
- [ ] 回接条件具备：api 修复合入后，联调 A5（TTL=90 短窗复现）可在本页面复现行级过期提示（证据归 workspace 联调 task）
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_resume_expired_mapping.md` PASS

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 真值 task | `../ops-desk-api/docs/tasks/active/task_api_w_join_gap_fix.md`（W-fix-1-web 条 · 钉死契约 · HG-W-FIX-DESIGN） |
| 审查文 | `../ops-desk-api/docs/harness/reviews/task_api_w_join_gap_fix_audit_R2_20261102.md`（M4 闭环路线=镜像薄壳） |
| 联调回接 | `../ops-desk-workspace/docs/tasks/active/task_stage_w_e2e_join_acceptance.md`（A5 挂账 · CLOSE 阻塞注记） |
| freeze | `hitl-browser-decide-v1`（D2 零分叉 · 只消费） |

---

## 给执行帽的必读列表

1. `AGENTS.md`
2. 本壳 + api 仓 task `task_api_w_join_gap_fix.md`（W-fix-1-web 条）
3. `src/views/HitlApprovalView.vue`（:109-180 · 唯一改点 :173-180）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 本壳 = 单点薄改镜像壳 · 真值与决策全在 api 侧 | yes | 无独立决策面（改点/文案/验收已由 api task + 20-R1/R2 钉死） | api 出口文案若偏离「过期」字样 → 映射不命中（闸行已联动提示） |
| R1 | （未开） | — | early_stop at R0 | — |
| R2 | （未开） | — | early_stop at R0 | — |
| R3 | （未开） | — | early_stop at R0 | — |
| R4 | （未开） | — | early_stop at R0 | — |
| R5 | （未开） | — | early_stop at R0 | — |

**actual_last_round**：R0 · **early_stop**：yes · **reason**：镜像薄壳无独立决策面，语义真值全在 api 仓 task（闸行已写明文案联动约束）· **residual_risks**：见 R0

### R0 · 问题框定

web 仓纪律「无 active task 不改码」，故为 api task 的 W-fix-1-web 条立镜像薄壳。壳的全部语义（改点 :173-180 · 同文案红线 · 联动约束）引用 api 侧，不自造第二真值。

### R1–R5 ·（未开 · early_stop）

不展开。

---

### 自检结论

| 命令 | 退出码 | 摘要 |
|------|--------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_resume_expired_mapping.md` | 0 | LINT: PASS（2026-11-02 · 10 落壳自检） |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-11-02 | 10 落壳（20-R2 M4 闭环棒 · 镜像薄壳路线 · 真值指针=api 仓 task_api_w_join_gap_fix）· 四闸镜像 pending（以 api 侧为真值 · 本壳不重复签）· R0 early_stop · lint PASS |
