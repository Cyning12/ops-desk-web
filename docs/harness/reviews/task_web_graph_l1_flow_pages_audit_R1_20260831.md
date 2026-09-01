# Task Audit R1：web-graph-l1-flow-pages

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_graph_l1_flow_pages.md`（task lint **PASS** · W4 无思考轮 warn 1 条，task 已自注「由 SPEC R0–R5 全轮承载 · lint W4 合法」，实测）  
> **SPEC**：`docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1（其余页 flow · L42）+ P2 先行切片（各域 indexes 同波同步 · L49 同步规则原文已核）+ §1 G3 缺口（L24 已核）  
> **SPEC 审查**：不在本审查范围  
> **前置**：P1a CLOSE · `docs/tasks/done/task_web_graph_l1_flow_lg_rag.md` · PR #33 MERGED（task 文内声明；格式与多域分段先例见 `l1/10_flow_lg_rag.graph.yaml` + l2 indexes 头注实测）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-graph-l1-flow-pages`（已核当前分支一致）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**仅新增本审查文一个文件**

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-graph-l1-flow-pages` |
| freeze_id | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变，与 SPEC §0/§4 冻结点一致） |
| test_strategy | `required`（graph-compile 绿 + 逐符号 grep 断言 + indexes↔flow 一一对应机检 + pnpm lint/test/build 回归 + verify；src 零变更面下回归负担合理） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| graph_change_layer | `G-L1`（+ G-L2 indexes 同步切片，与 graph_delta 行、00 定夺 l2 同步行三处自洽） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：由 SPEC R0–R5 全轮承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / graph_delta（7 flow + l2 indexes + 01_modules + l2 README + compile 产物五处落点明确）/ wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」）/ test_strategy=required / 人工闸表四行齐 / close_pr_policy=required 与「勿 auto-merge」两处自洽（元信息 related_pr 行 · 文末合入策略）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31 · 维护者「提前签收task」授权沿用） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价，不阻塞（同 P1a R1-N1 先例，见 N4） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 维护者授权代签文档闸） | **30** | 不新增一级模块（flow 属 G-L1）；`01_modules.md` L15 pages 行已含全部 9 页（Obs 已由 P1a 补入，已核 L15/L35）；预签口径与 SPEC §3 P1 L43 逐字同源；不阻塞 |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「20-task-audit R1 pass 后 web 00 即签」；verify 实测 BLOCKED · pending（见 test_strategy 节） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波无跨仓联调，n/a 判定合理；验收以 CI + grep/yaml 断言承载 |

blocks_hats 方向正确（仅 HG-GRAPH-MODULES / HG-AUDIT-R1 blocks 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：00 定夺七页锚点表与 src 实证逐条吻合（本审查 7/7 全量复核 · router 9 路由已核 · 每页 view→store→api 三段调用边逐文件核行号）；「l2 同波同步」切片有 SPEC §3 P2 L49「改 flow 同 task 必改 indexes」直接授权，非范围扩张；验收 7 条全机检可断言；非范围五项与 SPEC §4 及 P 阶段边界对齐无漏；failure_paths 五行覆盖图谱新增类全类风险（含 by_symbol 撞键预案行）；compile「不手改」纪律有脚本产物面实证支撑 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 web 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 6 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · web 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 00 定夺锚点表 ↔ src 实证（7/7 全量复核 · 2026-08-31 实测）

| 定夺锚点 | src 现状（行号已核） | 审查 |
|---|---|---|
| router 9 路由 | `src/router/index.ts`：login + AppLayout children 8 页（overview/obs/issues/pulls/graph/chat/lc-evidence/lg-rag）= 9 路由；chat/lg_rag 已由 P1a 覆盖 → 本波恰 7 页 | ✓ |
| overview：`OverviewView → useOverviewStore → api/overview.ts` | OverviewView.vue L4 import `useOverviewStore` · L5 import type `MedianMetric, TrendPoint` from api/overview；stores/overview.ts L4 import `fetchOverview` · L19 `load()`；api/overview.ts L12/L39 `MedianMetric`/`TrendPoint` 接口 · L61 `fetchOverview` | ✓ 类型旁注（MedianMetric/TrendPoint）实证成立 |
| issues：`IssuesView → useIssuesStore → api/issues.ts` | IssuesView.vue L4 import `useIssuesStore`；stores/issues.ts L4 import `fetchIssues` · L50 `load()`；api/issues.ts L38 `fetchIssues` | ✓ |
| pulls：`PullsView → usePullsStore → api/pulls.ts`（选项常量） | PullsView.vue L4 import `PULL_CI_STATUS_OPTIONS, PULL_STATE_OPTIONS` · L6 import `usePullsStore`；stores/pulls.ts L4 import `fetchPulls` · L40 `load()`；api/pulls.ts L33/L36 两常量 · L39 `fetchPulls` | ✓ 旁注常量实证（定夺写 `PULL_STATE/CI_STATUS`，实为 `PULL_STATE_OPTIONS`/`PULL_CI_STATUS_OPTIONS`，语义一致 · 30 以实证名为准） |
| graph：`GraphView → useGraphStore → api/graph.ts` | GraphView.vue L4 import `useGraphStore`；stores/graph.ts L4 import `fetchGraph` · L22 `load()`；api/graph.ts L25 `fetchGraph` | ✓ |
| lc_evidence：`LcEvidenceView → useLcEvidenceStore → api/lcEvidence.ts` | LcEvidenceView.vue L4 import `useLcEvidenceStore`；stores/lcEvidence.ts L5 import `invokeLcEvidence` · L19 `abort()` · L23 `invoke()`；api/lcEvidence.ts L9 `LC_EVIDENCE_INVOKE_PATH='/ops/lc-evidence/invoke'` · L148 `invokeLcEvidence` | ✓ 端点字面值精确 |
| obs：`ObsView → useObsStore → api/obs.ts`（ObsStatusScenario） | ObsView.vue L4 import `useObsStore` · L5 import type `ObsStatusScenario`；stores/obs.ts L5–6 import 两 fixture loader · L25 `load()`；api/obs.ts L50 `ObsStatusScenario` · L55/L65 `loadObsStatusFixture`/`loadObsTimelineFixture` | ✓ 锚点三段成立；**但 obs 链止于 fixture · 无 http/端点/ops_api 段**（见 N2） |
| login：`LoginView → useAuthStore → api/auth.ts`（登录/登出 · 守卫联动旁注） | LoginView.vue L6 import `useAuthStore`；stores/auth.ts L4 import `fetchMe/login/logout` · L23 `ensureMe` · L43 `login` · L48 `logout`；api/auth.ts L18 `login` · L27 `fetchMe` · L33 `logout`；router/index.ts beforeEach 守卫 + `setUnauthorizedHandler` 401 联动已核 | ✓ 守卫联动旁注有实证锚点 |
| http axios 段 | `src/api/http.ts` L45 `export const http = axios.create({ baseURL: '/api', … })`（obs 外 6 页通用） | ✓ |
| 不新增一级模块 | `01_modules.md` L15 pages 行 9 页全列（Obs 已由 P1a 补入 · L35 人签记录） | ✓ HG-GRAPH-MODULES 预签口径成立 |
| compile 产物不手改 | `scripts/graph-compile.sh` 存在（P0/P1a R1 已核：递归 compile + check + graph.json 双写） | ✓ 纪律可执行 |
| 合入：勿 auto-merge | 元信息 related_pr 行 + 文末合入策略 + close_pr_policy=required 三处同文 | ✓ |

**7 页 view→store→api 三段实证链全部成立，旁注全部有 src 锚点，无臆造。**

### 「l2 同波同步（7 域）」切片合法性专项

| 核对点 | SPEC 原文（行号已核） | 审查 |
|---|---|---|
| 同步规则 | L49「同步规则钉死：**改 flow 同 task 必改 indexes**」 | **直接授权本切片**：新建 7 flow 而不同波补 indexes 即违反本条；与 P1a 同口径。**结论：合法 · 非范围扩张** |
| 多域分段形态 | l2/indexes 现状：头注「多域：chat + lg_rag」· `graph_ids: ["10_flow_chat","10_flow_lg_rag"]` 列表 · 域分节注释 | ✓ task 定夺「P1a N3 分段形态沿用 · graph_ids 列表 · 头注加域」与现状逐字同型，有真实先例承载 |
| P2 验收形态 | L50「indexes 与 l1 flow implementedBy 一一对应（人工抽检 + P3 机检）」 | task 验收第 3 条加严为机检断言，与 SPEC 兼容且更严 |
| l2 README 覆盖域 | `l2/README.md` L4 现写「覆盖域：chat · lg_rag」· L5 非范围枚举其余 7 页 | 本波落地后该表述失真；task 已把「l2/README.md 覆盖域更正」列入范围第 3 条（P1a R1-N4 灰区本波已被正式收编进范围） | ✓ |

### by_symbol 撞键风险（7 域并入后实际评估 · 本审查实测）

现行 `by_symbol.yaml` 18 键（chat 9 + lg_rag 9）含泛名键 `invoke` / `abort` / `http`。7 域并入后的**确定性**冲突（符号同名 · path 不同）：

| 符号 | 现有/新增位置（已核行号） | 冲突性 |
|---|---|---|
| `load` | stores/overview.ts L19 · issues.ts L50 · pulls.ts L40 · graph.ts L22 · obs.ts L25 | **5 重撞键**（本波新增域内部互撞） |
| `invoke` | 现有键=stores/lgRag.ts L46 · 新 stores/lcEvidence.ts L23 | 撞现有键 |
| `abort` | 现有键=stores/lgRag.ts L37 · 新 stores/lcEvidence.ts L19 | 撞现有键 |
| `setPage` / `setPageSize` | stores/issues.ts L81/L87 · pulls.ts L66/L72 | 新增域互撞（若入 indexes） |
| `http` | 现有键=src/api/http.ts（lg_rag 域挂入）· 7 新域 flow 均引 http 节点 | 同符号同 path · 去重即可，**不算撞键**（见 N6） |

**结论：P1a N6 预案触发条件本波必然成立**（非条件性风险）。task failure_paths 第 3 行「by_symbol 撞键（泛名如 fetch/load）→ 启用 path#symbol 复合键」+ 验收第 3 条「撞键=0 或已升级复合键」已承载该情形，条文对症、判定权在 30 → **非阻塞**（执行建议见 N1）。

### 格式先例一致性（`10_flow_lg_rag.graph.yaml` + l2 多域分段 · 已核）

| 先例点 | P1a 现状 | task 定夺 | 审查 |
|---|---|---|---|
| schema / 分层 | schema v3 · G-L1 · depth method · implementedBy + layer_hint=G-L2 | 「对齐 10_flow_chat / 10_flow_lg_rag（schema v3 … layer_hint=G-L2 · version 2026-08-31）」 | ✓ 逐字段对齐（version 钉死当日日期，比 P1a「30 落盘当日」更严，无歧义） |
| l2 分段形态 | 双域分段 · graph_ids 列表 · 域分节注释 · 头注 R1-N6 撞键预案 | 「P1a N3 分段形态沿用 · 头注加域 · 撞键升级复合键（N6 预案启用条件）」 | ✓ 同文同源 |
| modules 人签 | `01_modules.md` L35 已有 P1a 人签行 | 「关联节补 7 条 flow 链接 + 人签记录」 | ✓ 与 SPEC §5 L72「人签记录回写 01_modules.md 人签表」一致 |

### 验收标准（全机检可断言性专项）

| # | 验收条 | 机检手段 | 审查 |
|---|---|---|---|
| 1 | 7 flow yaml 实证链节点/边齐 + 旁注 + compile .md | yamllint + grep 断言节点 id / 边三元组 / 旁注关键字 | ✓ |
| 2 | implementedBy 符号 src 真实存在（30 附证据清单进 invoke_30） | 逐符号 grep（本审查已先行实证一遍，30 复核成本低） | ✓ |
| 3 | l2 indexes 7 域条目与各自 flow implementedBy 一一对应 · 撞键=0 或复合键 | yaml 解析双向比对 + 撞键扫描 | ✓（比 SPEC P2 L50「人工抽检」加严） |
| 4 | 01_modules 关联节 7 链接 + 人签 · l2 README 覆盖域更正 | grep 断言 | ✓ |
| 5 | compile 绿 · graph.json 双写再生成 | `./scripts/graph-compile.sh` 退出码 + git diff | ✓（时间戳行须容忍，见 N5） |
| 6 | pnpm lint/test/build 回归绿 · src 零 diff | `git diff main --stat -- src/` 为空 + CI | ✓ 与 ci.yml 三步同名同序 |
| 7 | volatile.md 短注 · verify PASS | 文件 grep + `npx dsh-coding-kit verify` | ✓ |

**全部机检可断言 · 无人工目测条。**

### 非范围（对照 SPEC §3/§4 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| src 零变更 | 「src/** 任何变更（纯图谱波）」 | ✓ 在列；验收第 6 条 diff 断言兜底 |
| l0 不动 | 「l0 改动（P0 已 CLOSE）」 | ✓ |
| P3 不越界 | 「双写收敛 / CI 强化（SPEC P3）」 | ✓ 与 SPEC §3 P3 L54–55 对应 |
| 跨仓 / schema | 「api / iOS 仓图谱 · schema 升级」 | ✓ 与 SPEC §4 L61–62 一致 |
| 跨页编排不越界 | 「flow 间跨页编排图（每页独立 flow · 总图已在 l0）」 | ✓ 边界清晰 |

**无漏项。**（P1a R1-N4 的 l2/README 灰区本波已进范围第 3 条，灰区清零。）

### failure_paths（图谱新增类适配性）

| 触发 | 审查 |
|---|---|
| compile 红 → 不合入 · 修至绿 | ✓ graph-compile.sh + tech-graph CI 承载 |
| 某页链路与预实证锚点不符 → 30 以 src 实证为准修正 · invoke_30 记录偏差 | ✓ 本审查已先行实证；且为 obs fixture 偏离预留了合法纠偏通道（与 N2 联动） |
| by_symbol 撞键 → path#symbol 复合键（P1a N6） | ✓ 本波必然触发（上节实测），条文对症 |
| indexes 与 flow 不对齐 → 同 task 内修齐 | ✓ 验收第 3 条机检兜底 |
| 误改 l0 / src / scripts → 范围外 · diff 断言拦截 | ✓ 验收第 6 条 + tech-graph CI 双保险 |

**完整，无遗漏。**

### test_strategy 与 CI / 工具一致性（本审查实测）

| 项 | task | 实测 | 审查 |
|---|---|---|---|
| graph-compile | `./scripts/graph-compile.sh` | 脚本存在（P0/P1a R1 已核全文） | 一致 |
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | ci.yml 三步同名同序 | 一致 |
| verify | `npx dsh-coding-kit verify --target . --task …` | **实测**：`VERIFY: BLOCKED · HG-AUDIT-R1 pending`（HG-TASK-DRAFT / HG-GRAPH-MODULES approved；方向正确） | ✓ 闸表机读与 task 表一致 |
| task lint | — | **实测** PASS（W4 warn 1 条 · SPEC 承载豁免合法） | 通过 |

### SPEC §3 P1 逐条对齐

| SPEC 条文（行号已核） | task 承载 | 审查 |
|---|---|---|
| L42「其后按需 10_flow_overview / issues / pulls / lc_evidence / obs / login」 | 范围第 1 条 7 flow | ✓ 六页逐字对应；**L42 枚举未列 `10_flow_graph`**，但 G3 L24「8 页均无独立 flow」含 Graph 页 · l2/README L5 非范围枚举亦含 graph → 补 graph flow 属 G3 清零意图内正确解读（见 N3） |
| L43「.graph.yaml + compile 生成 .md · 挂 01_modules 关联节 · HG-GRAPH-MODULES 预签口径」 | 范围第 1/3 条 · 00 定夺 modules 行 · 闸表 | ✓ |
| L44「每 flow compile 绿 · modules 关联更新 · 顺序与优先级在 task 内钉」 | 验收第 1/4/5 条 · 00 定夺钉死表 | ✓ |
| L49「改 flow 同 task 必改 indexes」 | graph_delta l2 行 · 00 定夺 l2 同步行 · 范围第 2 条 | ✓ |
| §5 L72「HG-GRAPH-MODULES 人签记录回写」 | 00 定夺 modules 行「人签记录」· 验收第 4 条 | ✓ |

### 00 定夺内部一致性（专项）

- 「只画实证链（禁臆造）」×「每页 view→store→api→http→端点→ops_api」：对 obs 页两原则不可同时字面成立（obs 链止于 fixture），定夺内部已含解冲突序——「只画实证链」为建模原则首行、failure_paths 第 2 行授权以 src 实证为准，**30 可按实证链原则建模 obs 而不视为违令**（见 N2）。
- 「l2 同步」行 × 验收第 3 条「一一对应」× failure_paths 第 4 行：三处同文，闭环可机检。
- 「撞键复合键」行（00 定夺 l2 同步行）× failure_paths 第 3 行 × 验收第 3 条：三处同文，启用条件判定权在 30。
- 「compile 产物不手改」× failure_paths 第 1 行 × 验收第 5 条：脚本唯一生成源，纪律闭环。
- 「勿 auto-merge」三处同文（related_pr 行 · 00 定夺合入行 · 合入策略节）。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | **by_symbol 撞键本波必然触发，非条件性风险**：`load` 5 重（overview/issues/pulls/graph/obs stores）· `invoke`/`abort` 撞现有 lg_rag 键（lcEvidence store 同名 · 行号见核对节）· `setPage`/`setPageSize` issues/pulls 互撞。P1a N6 预案触发条件已提前成立 | 30 **开工即启用 `path#symbol` 复合键**（而非中途发现再返工）；task failure_paths 第 3 行 + 验收第 3 条已授权，无需退回 10 改条文 |
| N2 | **obs 页实证链止于 fixture**：api/obs.ts L55/L65 仅 `loadObsStatusFixture`/`loadObsTimelineFixture` 动态 import JSON（头注「禁止在浏览器执行 npx」），**无 http / 端点 / ops_api 段**；00 定夺「每页 view→store→api→http→端点→ops_api」对 obs 不可字面成立 | 30 依「只画实证链」首原则建模 obs flow 至 fixture 节点（旁注 fixture-only · 无旁路 API），链路缩短属 failure_paths 第 2 行授权的实证修正，invoke_30 记录偏差即可 |
| N3 | SPEC §3 P1 L42 枚举 6 页**未列 `10_flow_graph`**；但 G3 L24（8 页无独立 flow 含 Graph）+ l2/README L5 非范围枚举含 graph + GraphView/useGraphStore/fetchGraph 实证俱在 → 补 graph flow 属 G3 清零意图内正确解读而非范围扩张 | 30 按 task 执行即可；SPEC 冻结不回改，本 note 仅为真值校 record；若后续 SPEC 修订可顺手校正 L42 枚举 |
| N4 | HG-TASK-DRAFT blocks_hats 值 `22-R1` 为旧帽名（现帽 20-task-audit R1），语义等价；verify 实测该机读不误判 | 不改条文（同 P1a R1-N1 先例）；后续 task 起草可顺手用新帽名 |
| N5 | compile 再生成 graph.json 必带 `generated_at` 时间戳/当日日期 diff 行（P0 R1-N4 / P1a R1-N5 已核同型行为） | 验收第 5 条对双写 graph.json 应容忍时间戳行；30/40 自检结论表注明即可 |
| N6 | `http` 键已存在于 by_symbol（lg_rag 域挂入 · src/api/http.ts）；7 新域 flow 均引同一 http 节点，30 须**去重复用现有键**，勿在新增域分节重复定义同键 | 同符号同 path 不构成撞键，与 N1 复合键升级正交；indexes↔flow 一一对应机检时 http 条目按单一键判定 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸清单（20 后 · 30 前）

> 依 task 人工闸表 `HG-AUDIT-R1` 行：「20-task-audit R1 pass 后 **web 00 即签**（维护者『提前签收task』授权沿用）」。  
> 本审查文即为 R1 pass 书面凭据；**本帽不代签 · 不改人工闸表**。

- [ ] 已读 R1 审查结论（本文件）
- [ ] task 人工闸表 `HG-AUDIT-R1` → approved（web 00 依维护者授权代签 · 2026-08-31）
- [ ] commit task 文档 + 本审查文
- [ ] 下发 Harness 30（invoke_30）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 6 非阻塞）；内容签收；流程闸待 web 00 依 task 表授权代签 |
