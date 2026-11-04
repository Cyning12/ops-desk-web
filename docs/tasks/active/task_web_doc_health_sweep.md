# Task：web · 文档卫生 sweep（volatile 滞留 + Hub 缺登 + 断链 + 页清单 + by_path 缺口 · B9 ①–⑥）

> **状态**：`active`（2026-11-04 · 维护者三闸同签 · **GO 30**）  
> **类型**：docs / 纯文档轨（零 `src/` 触碰 · 零业务语义变化）  
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api 任何文件；**禁止**改 `src/` 任何文件  
> **分支**：`task/web-doc-health-sweep`（30 开工时已切 · 本棒仅落 task 档）  
> **10 注**：workspace backlog B9 处置口径（00 已定 2026-10-30）：「web 仓窗口开 task_web_doc_health_sweep（纯文档轨）一次性清理 ①–⑥；⑦⑧ 两处 TC9 瑕疵随 TC9 回填棒（B8）同改」· 2026-11-04 维护者 invoke 选定为下一任务 · **30 在 HG-AUDIT-R1=pending 时拒开工**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-doc-health-sweep` |
| **git_branch** | `task/web-doc-health-sweep`（30 开工时已切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 维护者签 HG-TASK-DRAFT → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 / HG-GRAPH-MODULES → 30（纯文档 · grep 断言驱动）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | 纯文档轨：验收 = grep / 路径存在性断言（断链清零 · 缺登补齐 · 图谱 compile 绿），不新增 Vitest。CI 前端门照跑（零 `src/` diff 必过）。图谱面 `./scripts/graph-compile.sh` 必跑（by_path.yaml 补条后产物一致）。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `n/a`（纯文档轨 · 不触任何冻结面） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `docs/_tech_graph/l2/indexes/by_path.yaml`（补 HitlApprovalView.vue / CapabilityCatalogView 两 path 条目）· 交付时跑 `./scripts/graph-compile.sh` 使产物一致 |
| **graph_delta_note** | 10 亲验（2026-11-04）：`by_path.yaml` 缺 `src/views/HitlApprovalView.vue` 与 `src/views/CapabilityCatalogView.vue` 两条目（grep 空集实证），其余图谱文件零改动。不新增一级模块/路由。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md`（本波 active 节滞留清理） |
| **wiki_delta_note** | volatile「本波 active」节当前 ≥11 条已 CLOSE 滞留（13 处 `docs/tasks/active/` 断链指针 · :22 progressive-reveal「30 实现中」误写）；30 清理后该节只留真 active 条目（关账时本 task 自身）。真值指针 = 本 task。 |
| **wiki_promotion** | `volatile` |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-task-audit R1, 30 | 2026-11-04 · 10 落稿 · 维护者签收（m00649 · 00 代录） |
| HG-AUDIT-R1 | approved | 30 | 2026-11-04 · 20-task-audit R1 PASS 零阻塞（`docs/harness/reviews/task_web_doc_health_sweep_audit_R1_20261104.md` · NIT×1 非阻塞）· 维护者签收（m00649 · 00 代录） |
| HG-GRAPH-MODULES | approved | 30 | 2026-11-04 · by_path.yaml 补条属图谱文件改动 · 10 评估不新增一级模块/路由 · 20-R1 亲验合理 · 维护者签收（m00649 · 00 代录） |

---

## 背景与目标

2026-10-30 夜 00 只读巡检发现 web 仓文档面 8 条 stale-minor（0 blocker），持续腐蚀文档真值。本 task 按 backlog B9 处置口径清理 **①–⑥**（纯文档轨）；**⑦⑧（TC9 两处瑕疵）不在本 task 范围**——随 B8（维护者手测 TC9 场次）回填棒同改。

六条现状锚点（10 帽 2026-11-04 亲验，全部仍 stale）：

| # | 位置 | 实证 |
|---|---|---|
| ① | `docs/coding_wiki/volatile.md`「本波 active」节 | ≥11 条已 CLOSE 滞留（`web-ux-state-sync`/`web-graph-anchor-profile-fix`/`web-fix-tc13b-guard`/`web-http-error-i18n`/`web-lg-rag-sse-continue-reply`/`web-hitl-fobs-receipt`/`web-chat-history-hitl-ux`/`web-hitl-decision-surface`/`web-hitl-resume-chase-ux` 等）；13 处 `docs/tasks/active/task_` 断链指针（条目已迁 `done/`）；:22 `web-lg-rag-sse-progressive-reveal` 误写「30 实现中」 |
| ② | `docs/tasks/done/README.md` Hub | 表尾停在 2026-10-30；缺 **6 笔** 关账登记：`web-hitl-approval-page`（B9 快照 4 笔之一）· `web-graph-anchor-profile-fix` · `web-hitl-approval-overlay-ux` · `web-hitl-resume-chase-ux` + 2026-11-04 新增两笔 `web-ux-state-sync`（PR #87）· `web-hitl-resume-expired-mapping`（PR #88） |
| ③ | `docs/tasks/_views/done.md:14` | 「进行中 → `in_progress.md`」断链（该文件不存在） |
| ④ | `README.md:17` 仓库职责页清单 | 缺 5 个已上线页：`LcEvidenceView` / `LgRagView` / `ObsView` / `CapabilityCatalogView` / `HitlApprovalView`（`ls src/views/` 实扫 11 页） |
| ⑤ | `docs/_tech_graph/l2/indexes/by_path.yaml` | 缺 `HitlApprovalView.vue` / `CapabilityCatalogView.vue` 两条目（grep 空集） |
| ⑥ | `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md:5` | 「关 task」双指针指向 `../tasks/active/`（`task_web_lg_rag_sse_t2` 与 api `task_lg_rag_sse_stream_updates` 均已关账迁 done/）→ 双断链 |

## 范围

1. **① volatile 清理**：「本波 active」节删除全部已 CLOSE 条目（含「以下为已交付指针，关账后可裁」段）；条目内 `docs/tasks/active/` 指针随之消零；:22 progressive-reveal 误写改为交付态注记或随条目清除。
2. **② Hub 补登**：`docs/tasks/done/README.md` 补 6 笔关账登记行（上表 ② 列出的 6 个 slug · 格式对齐既有行：日期 + slug + 关账依据）。
3. **③ done 视图断链**：`_views/done.md` 的 `in_progress.md` 指针修除（改为指向 Hub 或删除该行）。
4. **④ 页清单**：`README.md` 仓库职责行补 5 个已上线页。
5. **⑤ by_path 补条**：`by_path.yaml` 补两 path 条目（格式对齐既有条目）；跑 `./scripts/graph-compile.sh` 产物一致。
6. **⑥ checklist 指针**：CHECKLIST 双 task 指针 `active/` → `done/`（api 侧指针同步改 api done 路径）。

## 非范围

- **⑦⑧**：TC9 证据落点重定义 +「构造挂起 run」配方——随 B8（维护者手测 TC9）回填棒同改（backlog 处置口径）。
- `src/` 任何文件（含 `src/api/hitl.ts` 冻结契约）零触碰；api 仓零触碰。
- Hub **legacy 历史缺口**（33 笔早期关账未登记 · 含 task_web_login 等）：不在本 sweep 范围——30 实扫后按「观察项」记入修订表，是否补登由维护者定夺（避免一次性历史改写）。
- `done_by_domain.md` / `docs/harness/legacy-gate-exempt.yaml` 等其他文档面。
- 不改 CI / 不加新测试文件。

## 依赖

- workspace `docs/tasks/backlog/backlog_20261030_post_stage_w.md` §B9（处置口径真值）
- web `docs/tasks/done/`（关账档存在性 · 断链修复目标路径）
- web `docs/_tech_graph/l2/indexes/by_path.yaml`（既有条目格式样板）
- api `docs/tasks/done/`（⑥ 的 api 侧指针目标存在性）

## 验收标准

- [ ] **AC-1**：volatile「本波 active」节零已 CLOSE 条目；`grep -c "docs/tasks/active/task_" volatile.md` 结果 = 真 active task 档实有指针数（关账时 = 0 或本 task 自身 1 条）——grep + `ls docs/tasks/active/` 反证
- [ ] **AC-2**：Hub 含 6 笔新登记行（`web-hitl-approval-page` / `web-graph-anchor-profile-fix` / `web-hitl-approval-overlay-ux` / `web-hitl-resume-chase-ux` / `web-ux-state-sync` / `web-hitl-resume-expired-mapping` 逐 slug grep 命中）
- [ ] **AC-3**：`_views/done.md` 无 `in_progress.md` 断链指针；文件内其余相对链接全部可达（逐链接 `test -f`）
- [ ] **AC-4**：`README.md` 页清单含 LcEvidence / LgRag / Obs / CapabilityCatalog / HitlApproval 5 页（grep 5 页名）
- [ ] **AC-5**：`by_path.yaml` 含 `HitlApprovalView.vue` / `CapabilityCatalogView.vue` 两条新 path 条目；`./scripts/graph-compile.sh` 绿
- [ ] **AC-6**：CHECKLIST 双指针指向 done/ 且目标文件存在（web + api 各一 · grep + `test -f`）
- [ ] **AC-7**：`git diff main...HEAD --stat` 零 `src/` 文件

### 自检结论

10 棒自校：六条现状锚点 2026-11-04 亲验全部仍 stale（13 处断链指针 / Hub 缺 6 笔 / in_progress.md 不存在 / README 缺 5 页 / by_path 缺 2 条 / checklist 双断链）；范围与非范围按 B9 处置口径零自由发挥；failure_paths 四路全「合并前拦截」；零绝对本机路径。待 20-R1 审。

## failure_paths

| fp_id | 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|---|
| FP-1 | ① 清理误删仍在 active 的条目 | 验收 AC-1 以 `ls docs/tasks/active/` 反证必挂 → 30 当场回滚该行 | 是（git revert 单文件） | 无（合并前拦截） |
| FP-2 | ③ ⑥ 断链修成新断链（目标路径写错） | AC-3/AC-6 存在性断言挂 → 修正路径重跑 | 是 | 无（合并前拦截） |
| FP-3 | ⑤ by_path.yaml 条目格式不符 | graph-compile 红 → 对齐既有条目格式重跑 | 是 | 无（合并前拦截） |
| FP-4 | ① 清理丢真值指针 | 被清理条目均为已 CLOSE 摘要，真值=done/ 档本身（条目内 pointer 已指 done/ 或随条目删除）；若某条目含 unique 决策真值无 done 档承载 → 停并回签维护者 | 否（须人裁） | 无 |

## 给执行帽必读

- `docs/coding_wiki/volatile.md`（① 目标 · 清理前先全节通读）
- `docs/tasks/done/README.md`（② 目标 · 既有行格式样板）
- `docs/_tech_graph/l2/indexes/by_path.yaml`（⑤ 目标 · 条目格式样板）
- workspace backlog B9 节（处置口径真值 · ⑦⑧ 勿混入）

---

## 思考轮

### R0（发散）

六条 stale 的根因分型：①②③ 属「关账流程未闭环」——CLOSE 时漏了 volatile/Hub/视图三处配套更新（流程性缺口，非内容错误）；④⑤ 属「新增页面未回写入口文档」（Capability/HITL/LcEvidence/LgRag/Obs 上线时漏更 README 与图谱 by_path）；⑥ 属「跨仓指针随关账漂移」。三类根因同向：**关账配套动作没有 checklist 化**。本 task 只清存量，是否立「关账 checklist 增补」观察项由 40 定夺。

### R1（收敛 · 范围裁剪）

- B9 ①–⑥ 全收（处置口径明确）。② 从 4 笔扩到 6 笔：今日（2026-11-04）两笔关账（ux-state-sync / resume-expired-mapping）同样是「关账未登记 Hub」，与 B9 四点同根因同修法——纳入是清理而非扩范围（10 有权在同类内补齐，已在修订表留痕）。
- legacy 33 笔 Hub 缺口：不纳入（历史改写面大 · 维护者定夺 · 记入非范围+40 观察项）。
- ⑦⑧：按口径随 B8，不混入。

### R2（30 面预研）

- ① 执行顺序：先 `ls docs/tasks/active/` 取真集 → 再逐条比对 volatile 节 → 删非交集。防 FP-1 的机械护栏。
- ⑤ 条目格式：抄既有 `src/views/...` 条目样板（path/kind/symbols 字段对齐）。
- ⑥ api 侧指针：目标 `../../../ops-desk-api/docs/tasks/done/task_lg_rag_sse_stream_updates.md`——30 先 `test -f` 确认存在再改。

### R3（预留 · early_stop 已停于 R2）

按规程点名预留：若 20 审查轮或 30 实扫发现设计分叉（如 FP-4 人裁触发 / legacy 缺口改判纳入），在此槽位回填并重启轮次；无则空转。

### R4（预留 · early_stop 已停于 R2）

供 40 观察项回填（关账配套 checklist 化建议 / legacy 33 笔 Hub 缺口定夺结果）。

### R5（预留 · early_stop 已停于 R2）

供 CLOSE 前终轮收口（残余风险销项）。

### 思考轮控制

| 轮 | 结论 | early_stop |
|---|---|---|
| R0 | done：根因分型（①②③ 关账流程未闭环 / ④⑤ 入口文档漏更 / ⑥ 跨仓指针漂移） | — |
| R1 | done：范围收敛（② 同类扩 6 笔 · legacy 33 笔排除 · ⑦⑧ 随 B8） | — |
| R2 | done：30 面预研（执行顺序 + 格式样板 + 存在性护栏） | 停 |
| R3 | pending：预留给 20 审查轮回填 | — |
| R4 | pending：预留给 20 审查轮回填 | — |
| R5 | pending：预留给 30 实扫回填 | — |
| early_stop | reason：六条均为清单型清理，无设计分叉 | R2 后停 |
| residual_risks | legacy 33 笔 Hub 历史缺口待维护者定夺（FP-4 观察项） | — |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-04 | 10 落稿（B9 立项 · 维护者 invoke 选定 · 六条现状锚点亲验 · R0–R2 收敛 early_stop）· 四闸 pending · lint PASS |
| 2026-11-04 | 维护者三闸同签（HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES · m00649 · 00 代录）· 状态 draft→active · GO 30 |
