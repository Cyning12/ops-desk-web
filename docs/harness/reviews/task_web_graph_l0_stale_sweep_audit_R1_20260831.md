# Task Audit R1：web-graph-l0-stale-sweep

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_graph_l0_stale_sweep.md`（task lint **PASS** · W4 无思考轮 warn 1 条，task 已自注「由 SPEC R0–R5 全轮承载 · lint W4 合法」，实测）  
> **SPEC**：`docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P0（HG-SPEC-SIGNOFF approved · 维护者亲签 · PR #30 MERGED，git log 已核 merge commit `a4841f2`）  
> **SPEC 审查**：不在本审查范围  
> **上游缺口证据**：SPEC §1 G1（`l0/00_main.graph.yaml` L109–111 脱节边 · 已核原文）· G2（节点面旧 · 部分断言失准见 N2）  
> **前置**：lg-rag SSE T2–T6 全波 CLOSE（task 头部已列 PR #23/#25/#26/#28/#29；T6 已交付，volatile.md 已核 T6/T5/T4 短注在案）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-graph-l0-stale-sweep`（已核当前分支一致 · HEAD `26fbda9` 即本 task 起草 commit）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**仅新增本审查文一个文件**

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-graph-l0-stale-sweep` |
| freeze_id | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变，与 SPEC §0 freeze 点一致，已核） |
| test_strategy | `required`（graph-compile 绿 + grep 断言 + pnpm lint/test/build 回归 + verify；src 零变更面下回归负担合理） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸；invoke 目录 `by-task/web-graph-l0-stale-sweep/` 已核存在） |
| graph_change_layer | `G-L0`（仅 `l0/00_main.graph.yaml` + compile 再生成 `00_main.md` · 根/shared `graph.json`，与 00 定夺 compile 行 + graph_delta 行三处自洽） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：由 SPEC R0–R5 全轮承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / graph_delta / wiki_delta=volatile.md（文件已核存在 · 对齐仓内定制「新 task 勿默认 n/a」）/ test_strategy=required / 人工闸表四行齐 / close_pr_policy=required 与「勿 auto-merge」两处自洽（元信息 related_pr 行 · 文末合入策略）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31 · 维护者令「提前签收task」授权） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价，不阻塞（同 T2–T6 R1 先例，见 N1） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 维护者授权代签文档闸） | **30** | graph_delta 限 `l0/00_main.graph.yaml` + compile 产物、不新增一级模块；G-L0 页面节点补齐不触 `01_modules.md` 模块行（pages 行已覆盖，Obs 缺项见 N3）；不阻塞（对齐 T3–T6 先例） |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「20-task-audit R1 pass 后 web 00 即签（维护者『提前签收』授权）」；verify 实测 BLOCKED · pending（见 test_strategy 节） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波无跨仓联调，n/a 判定合理；验收以 CI + grep 断言承载 |

blocks_hats 方向正确（仅 HG-GRAPH-MODULES / HG-AUDIT-R1 blocks 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：00 定夺六行与 l0 yaml 现状逐行吻合（L109–111 脱节边 · L5 version 陈旧 · 现有 14 节点 / 12 边实测核对）；7 节点补齐清单与 `src/views/` 9 页实证一一对应（9 − 已有 chat/obs = 新增 7）；`lg_rag_page → api_client` 边与 src 调用链实证吻合（`invokeLgRag` 走 `http` axios 实例）；验收 7 条全机检可断言；非范围五项与 SPEC §4 对齐无漏（P1/P2/P3 不越界）；failure_paths 四行覆盖图谱清扫类全类风险；compile「不手改」纪律有脚本产物面实证支撑 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 6 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 00 定夺 ↔ l0 yaml 现状（逐行核对 · 2026-08-31 实测）

| 定夺项 | l0 现状（行号已核） | 审查 |
|---|---|---|
| 边修正：`sse_client → ops_api` label 改 `POST /api/ops/lg-rag/stream` | L109–111：`from: sse_client / to: ops_api / label: "POST /api/ops/chat/stream"`，与 SPEC G1 证据逐字一致 | ✓ 脱节边定位精确；`chat/stream` 字串在 l0 全文仅 L111 一处（chat_page / chat_flow / 10_flow_chat.md 引用均含 `chat` 但不含 `chat/stream`，grep 精确字串断言无误伤） |
| 节点补齐：7 新页节点 + includes 边 | 现有页节点仅 `chat_page`（L44–46）· `obs_page`（L48–50）；已有 includes 边 `pages→chat_page`（L93–95）· `pages→obs_page`（L97–99）；`pages` 容器节点存在（L40–42） | ✓ 7 节点 id/边接入点均有现状落点；与 `src/views/` 9 页实证一一对应（见下表） |
| `lg_rag_page → api_client`（invoke）调用边 | `api_client` 节点存在（L32–34 · kind=flow） | ✓ 与 src 调用链实证吻合（见下） |
| version 刷新 `2026-08-31` | L5 `version: "2026-07-27"`（字符串 · 陈旧） | ✓ 断言无歧义 |
| compile 再生成 `00_main.md` + 双写 graph.json | `scripts/graph-compile.sh` 已核全文：编译所有含 `*.graph.yaml` 目录 → md；`graph_yaml_to_json.py` L77–86 写 `shared/graph.json` + 根 `graph.json` 双写副本（C2 过渡注释在码） | ✓ 产物面与 task 三处表述一致；「不手改」纪律可执行（全部由脚本生成，见 N4） |
| 不新增一级模块 · `01_modules.md` 零 diff | modules.md L15 pages 行列 8 页（Login/Overview/Issues/Pulls/Graph/Chat/LC Evidence/LG RAG） | ✓ 7 新页均已被 pages 行覆盖（Obs 缺项为 G-L1 面历史欠账，见 N3） |

### 节点补齐清单 ↔ src/views 实证（9 页清单一一对应）

| src/views 实测（glob · 9 文件） | l0 现状 | task 动作 | 审查 |
|---|---|---|---|
| ChatView.vue | `chat_page` 已有 | 保留 | ✓ |
| ObsView.vue | `obs_page` 已有 | 保留 | ✓ |
| LoginView.vue | 缺 | 新增 `login_page` | ✓ |
| OverviewView.vue | 缺 | 新增 `overview_page` | ✓ |
| IssuesView.vue | 缺 | 新增 `issues_page` | ✓ |
| PullsView.vue | 缺 | 新增 `pulls_page` | ✓ |
| GraphView.vue | 缺 | 新增 `graph_page` | ✓ |
| LcEvidenceView.vue | 缺 | 新增 `lc_evidence_page` | ✓ |
| LgRagView.vue | 缺 | 新增 `lg_rag_page` | ✓ |

9 − 2 = 7，与 task 清单**一一对应 · 无臆造 · 无遗漏**。failure_paths 第 2 行「30 先 `ls src/views/` 实证再落（禁臆造）」与本实证闭合。

### `lg_rag_page → api_client` 边 ↔ src 调用链实证

- `src/views/LgRagView.vue` L4 import type `../api/lgRag`；`src/stores/lgRag.ts` L6/L11 import `invokeLgRag` 等 · L68 调用；
- `src/api/lgRag.ts` L3 `import { http } from './http'` · L143 `invokeLgRag` · L151 `http.post(...)`（`http` = `src/api/http.ts` L45 axios 实例，即 l0 `api_client` 节点语义）；
- 实际端点 `POST /api/ops/lg-rag/invoke`（lgRag.ts L8 注释已核）。

**invoke 边实证成立。**（lg-rag SSE 流式主线走 `useLgRagSse` 原生 fetch，不经 axios——00 定夺仅钉 invoke 边、chat_page streams 边保留且 sse_client 语义重释为 lg-rag SSE，与 AGENTS.md「useLgRagSse = 主 Chat 传输主线」口径自洽，见 N6。）

### 验收标准（全机检可断言性专项）

| # | 验收条 | 机检手段 | 审查 |
|---|---|---|---|
| 1 | l0 无 `chat/stream` · 边 label = lg-rag | `grep -c 'chat/stream' l0/00_main.graph.yaml` = 0 · grep 正向断言新 label | ✓ 精确字串无歧义（无误伤面，见上） |
| 2 | 7 节点 + includes 边齐 · 9 页一一对应 | grep/yamllint 断言 7 id + 7 includes 边 | ✓ |
| 3 | `lg_rag_page → api_client` 边存在 | grep 断言边三元组 | ✓ |
| 4 | `version` = `2026-08-31` | grep/yamllint | ✓ |
| 5 | compile 绿 · 产物再生成 · diff 限本 task 面 | `./scripts/graph-compile.sh` 退出码 + git diff | ✓（graph.json 时间戳行须容忍，见 N4） |
| 6 | pnpm lint/test/build 绿 · src 零 diff | `git diff main --stat -- src/` 为空 + CI | ✓ 与 ci.yml 三步同名同序（T6 R1 已核 · 本仓 CI 未变） |
| 7 | volatile.md 短注 · verify PASS | 文件 grep + `npx dsh-coding-kit verify` | ✓ |

**全部机检可断言 · 无人工目测条。**

### 非范围（对照 SPEC §3 P0/P1/P2/P3 与 §4 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| src 零变更 | 「`src/**` 任何变更（纯图谱波）」 | ✓ 在列；验收第 6 条 diff 断言兜底 |
| P1 不越界 | 「G-L1 flow 补全（SPEC P1）」 | ✓ 在列（`10_flow_lg_rag` 等不动） |
| P2 不越界 | 「G-L2 indexes 扩展（P2）」 | ✓ 在列 |
| P3 不越界 | 「双写收敛 / CI 强化（P3）」 | ✓ 在列；00 定夺 compile 行「双写现状维持 · 收敛属 SPEC P3」自洽 |
| 拓扑不重构 | 「l0 拓扑重构（只修脱节 + 补缺失节点 · 不重排分层）」 | ✓ 与 SPEC §4「G-L0 拓扑重构」逐字同源 |
| 跨仓不动 | 「api / iOS 仓图谱」 | ✓ 与 SPEC §4 一致 |
| schema 冻结 | 「schema 升级（`inform_graph.v3` 冻结）」 | ✓ 与 freeze_id=n/a 元信息自洽 |

**无漏项。**（task 范围虽较 SPEC P0 字面扩面，仍属 G-L0 层内补齐，不构成 P1–P3 越界，见 N2。）

### failure_paths（图谱清扫类适配性）

| 触发 | 审查 |
|---|---|
| compile 红（yaml 语法/schema）→ 不合入 · 修至绿 | ✓ 有真实承载：graph-compile.sh `set -euo pipefail` + CI tech-graph.yml L32–33 全量 compile+check |
| 新节点与 src/views 实际页不符 → 30 先实证再落 | ✓ 本审查已先行实证（9 页表）；30 复核成本极低 |
| graph.json 双写不一致 → 只由 compile 脚本生成 · 不手改 | ✓ 双写同源（同一 `out` 对象写两路径，py L80–86），手改是唯一不一致源，条文对症 |
| 误改 l1/l2 → 范围外 · diff 审查拦截 | ✓ graph_delta 限定 l0 文件；tech-graph CI 对 l1/l2 yaml 亦全量 compile（误改即红），双保险 |

**完整，无遗漏**（纯图谱波无运行时用户可见面，四行覆盖语法/实证/纪律/越界四类，合理）。

### test_strategy 与 CI / 工具一致性（本审查实测）

| 项 | task | 实测 | 审查 |
|---|---|---|---|
| graph-compile | `./scripts/graph-compile.sh` | 脚本已核全文（D-PIN `dsh-coding-kit@1.10.0` · 递归目录 compile + check + py 双写） | 一致 |
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | ci.yml 三步同名同序（T6 R1 已核） | 一致 |
| verify | `npx dsh-coding-kit verify --target . --task ...` | **实测**：`VERIFY: BLOCKED · HG-AUDIT-R1 pending`（其余闸 approved，blocks_30 方向正确） | ✓ 闸表机读与 task 表一致 |
| task lint | — | **实测** `task lint --file` **PASS**（W4 无思考轮 warn 1 条 · task 已自注 SPEC 承载，合法豁免） | 通过 |

### SPEC §3 P0 逐条对齐

| SPEC §3 P0 条文 | task 承载 | 审查 |
|---|---|---|
| 边 label 改 `POST /api/ops/lg-rag/stream` | 00 定夺「边修正」行 + 验收第 1 条 | ✓ 逐字一致 |
| 补 lg-rag / lc-evidence / obs 页节点与边 | 00 定夺「节点补齐」行（7 节点 · 含 lg_rag/lc_evidence；obs 已存在不重复加；另扩 login/overview/issues/pulls/graph 4 页） | ✓ 覆盖且加严（SPEC 字面 3 页中 obs 断言失准 · 扩面属 G-L0 层内，见 N2） |
| `version` 日期刷新 | 00 定夺 version 行 + 验收第 4 条 | ✓ |
| `graph-compile` 再生成 `00_main.md` + graph.json | 00 定夺 compile 行 + 验收第 5 条 | ✓ 含双写（SPEC P0 未明示双写，task 钉「双写现状维持」与 py 脚本 C2 过渡一致） |
| 验收：l0 无 `chat/stream` · compile 绿 · CI 绿 | 验收第 1/5/6 条 | ✓ task 加严为 7 条机检（SPEC 3 条为其子集） |

### 00 定夺内部一致性（专项）

- 「边修正」行 × 现状：`chat/stream` 全 l0 唯一出现点为 L111 目标边，改后 grep 断言即绿，**无第二遗漏点**。
- 「节点补齐」行 ×「chat_page streams 边保留」：sse_client 语义重释为 lg-rag SSE 后，chat_page→sse_client 边与新 label `lg-rag/stream` 自洽（Chat 页即 lg-rag SSE 主消费页），**无矛盾**。
- 「模块」行 × HG-GRAPH-MODULES 预签口径（不新增一级模块 · 仅 G-L0 l0 文件 + compile 产物）：graph_delta 行、闸表说明行、00 定夺行三处同文，**授权链自洽**。
- 「合入」行 × close_pr_policy=required × 文末合入策略：勿 auto-merge 三处钉死，**自洽**。
- version 钉死 `2026-08-31` × 任务日期/分支名，**自洽**。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | HG-TASK-DRAFT blocks_hats 值 `22-R1` 为旧帽名（现帽 20-task-audit R1），语义等价；verify 机读不误判（已实测该闸不 blocks 30） | 不改条文（同 T2–T6 R1 先例）；后续 task 起草可顺手用新帽名 |
| N2 | SPEC §1 G2 断言「无 lg-rag / lc-evidence / **obs** 页节点」与 l0 现状不符（`obs_page` L48–50 已存在）；§3 P0 字面「补 lg-rag / lc-evidence / obs 页节点」实为 2 页缺口。task 已正确处理（不重复加 obs · 扩为 7 节点全量对齐 9 页），扩面仍在 G-L0 层内、不触 P1–P3 | 30 按 task 执行即可；SPEC 已冻结不回改，本 note 仅为真值校 record；若后续 SPEC 修订可顺手校正 G2 表述 |
| N3 | `01_modules.md` L15 pages 行列 8 页（Login/Overview/Issues/Pulls/Graph/Chat/LC Evidence/LG RAG）**未含 Obs**（SPEC G3 同口径）；00 定夺「modules 零 diff（页面已覆盖于 pages 行）」对 Obs 不严格成立 | 不阻塞（modules 表属 G-L1 面 · 本 task 非范围不动）；建议 P1 或图谱维护 task 顺带把 Obs 补进 pages 行 |
| N4 | compile 再生成 `graph.json` 必带 `generated_at` 时间戳 + `freeze_id` 当日日期 diff 行（graph_yaml_to_json.py L65–71 已核）；`00_main.md` frontmatter `generated_at` 为 sha256 内容哈希（确定性 · 无此问题） | 验收第 5 条「diff 仅本 task 变更面」对双写 graph.json 应容忍时间戳/日期行；30/40 自检时在结论表注明即可 |
| N5 | l0 yaml L4 description 仍写「…**SSE Chat 消费**与后端 API 的关系」，边 label 改 lg-rag 后该表述同文件内轻度失真；00 定夺只钉边 label/节点/version，未钉 description | 30 顺手把 description 对齐 lg-rag 主线表述（l0 yaml 在范围内 · 文档卫生 · 一句话改动）；不改不阻塞 |
| N6 | 00 定夺将 sse_client 语义重释为「lg-rag SSE」但节点 label 仍「SSE Client」、lg_rag_page 仅接 api_client（invoke）边未接 sse_client：与 src 实证吻合（invoke 走 axios http · SSE 主线在 chat_page 经 useLgRagSse），但 l0 读者需自行推理语义重释 | 30 内决：可在 sse_client label 或 description 加 lg-rag 注记（l0 yaml 范围内）；lg_rag_page→sse_client 边属拓扑增量 · 00 定夺未钉则不加 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸清单（20 后 · 30 前）

> 依 task 人工闸表 `HG-AUDIT-R1` 行：「20-task-audit R1 pass 后 **web 00 即签**（维护者『提前签收task』授权）」。  
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
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 6 非阻塞）；内容签收；流程闸待 00 依 task 表授权代签 |
