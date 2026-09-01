# Task Audit R1：web-graph-l2-key-unify

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_graph_l2_key_unify.md`（task lint **PASS** · W4 无思考轮 warn 1 条，task L138 已自注「由 SPEC R0–R5 全轮承载 · lint W4 合法」，实测）  
> **SPEC**：`docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P2（l2 indexes 扩展 · L46–50 已核）+ §5 验收（L70/L72 已核）  
> **SPEC 审查**：不在本审查范围  
> **前置**：P1b CLOSE · `docs/tasks/done/task_web_graph_l1_flow_pages.md` · PR #34 MERGED（task 文内声明；双形态现状见 `l2/indexes/by_symbol.yaml` 头注 L3–9 实测）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-graph-l2-key-unify`（已核当前分支一致 · 工作树仅 `.codex/` untracked，无业务 diff）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**仅新增本审查文一个文件**

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-graph-l2-key-unify` |
| freeze_id | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变，与 SPEC §0/§4 冻结点一致） |
| test_strategy | `required`（迁移机检三断言 + indexes↔flow 复验 + compile 绿 + pnpm lint/test/build 回归 + verify；src 零变更面下回归负担合理） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| graph_change_layer | `G-L2`（by_symbol 键形态 + by_path 头注 + l2 README；与 graph_delta 行、范围节三处自洽） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：由 SPEC R0–R5 全轮承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / graph_delta（by_symbol + by_path + l2 README 三落点明确）/ wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」）/ test_strategy=required / 人工闸表四行齐 / close_pr_policy=required 与「勿 auto-merge」两处自洽（元信息 related_pr 行 · 文末合入策略）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31 · 维护者令「P2收尾后再进P3」+ 提前签收授权沿用） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价，不阻塞（同 P1a R1-N1 / P1b R1-N4 先例，见 N3） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 维护者授权代签文档闸） | **30** | 不新增一级模块 · 仅 l2 键形态；`01_modules.md` 人签表（L30–36）已有同口径先例两行；预签合法，不阻塞 |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「20-task-audit R1 pass 后 web 00 即签」；verify 实测 BLOCKED · pending（见 test_strategy 节） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波无跨仓联调，n/a 判定合理；验收以机检断言 + CI 承载 |

blocks_hats 方向正确（仅 HG-GRAPH-MODULES / HG-AUDIT-R1 blocks 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：迁移面实证与 task 逐字吻合（18 裸键 + 51 复合键 = 69 · 头注双形态决策段在案）；迁移后撞键=0 与 indexes↔flow 一一对应本审查已用 python+yaml **预演全绿**；验收 6 条全机检可断言；非范围四项与 SPEC §3 P3 / §4 对齐无漏；failure_paths 四行覆盖纯键迁移全类风险 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 web 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 4 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · web 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 迁移面实证（by_symbol.yaml 现状 · 本审查 python+yaml 实测 · 2026-08-31）

| 核对点 | 实测 | 审查 |
|---|---|---|
| 条目总数 | **69**（yaml 解析计数） | ✓ 与 task「69=18+51」一致 |
| 裸键数与清单 | **18**：chat 域 9（ChatView/useChatStore/loadLatestSession/sendMessage/fetchLatestSession/resumeFromCursor/streamLgRag/replayLgRag/LgRagSseFrameParser）+ lg_rag 域 9（LgRagView/useLgRagStore/invoke/abort/useThreadId/elapsedSeconds/invokeLgRag/LG_RAG_INVOKE_PATH/**http**） | ✓ 与 task「chat + lg_rag 域 · 含 http 例外条」逐字吻合 |
| 复合键数 | **51**（overview 4 · issues 9 · pulls 11 · graph 4 · lc_evidence 6 · obs 10 · login 7） | ✓ |
| 头注决策史 | L3–4 键决策（R1-N6 裸键维持）· L5–7 双形态决策（R1-N1 · P1b）· L8–9 http 例外（30 内决） | ✓ 双形态决策段在案，task「改写为统一复合键 + 历史留痕一句」有真值可改写 |
| graph_ids | 9 flow 列表（L12） | ✓ 与 l1 目录 9 个 `10_flow_*.graph.yaml` 实测一致 |

### 迁移仿真（本审查预演 30 机检 · 全绿）

| 断言 | 预演方法 | 结果 |
|---|---|---|
| 撞键=0（迁移后全集） | 18 裸键逐一映射 `{path}#{key}` 与既有 51 键合并计重 | **69 键 · 0 撞键**（chat/lgRag 路径与 51 键路径集合无交集；同 path 多 symbol 各自唯一） |
| 零裸键 | 迁移后全部键含 `#` | 可断言（构造即满足） |
| 值全等 | 值（path/node_id/kind）不触碰，仅键重写 | 条文兜底充分；30 以值 multiset 比对机检落实 |
| indexes↔flow 一一对应 | 9 flow implementedBy 共 **75 条** → 唯一 (path,symbol) 对 **69**；与索引 69 条 (path,symbol) 集合比对 | **完全相等**（missing=∅ · extra=∅）；http 7 flow 各 1 条去重为索引单条，正好解释 75→69 |

**结论：task 机检三断言 + 一一对应复验全部可执行且预演通过，30 落地风险极低。**

### http 例外条专项（审查要点指定）

| 核对点 | 实测 | 审查 |
|---|---|---|
| http 复合键化目标 | `http` → `src/api/http.ts#http`（值 src/api/http.ts / http_client / module 不变） | ✓ 与 flow implementedBy（path=src/api/http.ts · symbol=http）同型，一一对应机检天然兼容 |
| 9 flow 命中语义 | **实测 http_client 仅出现于 7 个 flow**（graph/issues/lc_evidence/lg_rag/login/overview/pulls）；`10_flow_chat` 无 http_client 节点（fetch_session_api 直边 ops_api · SSE 直边 ops_api）；`10_flow_obs` fixture 驱动无 http 段（L4 自证「实证链止于 fixture」） | **语义保持**：复合键化后单条仍全域命中、索引内不重复；但「**9** flow 复用/命中」计数与实测 **7** 不符（by_symbol L8 · by_path L7/L74 现文同误）→ 见 N1（非阻塞，语义本身无损） |
| 命中不重复 | 7 flow 各引同一节点（path/symbol/node_id 全同）→ 索引单条 | ✓ 一一对应机检按唯一 (path,symbol) 对判定即可 |

### by_path 不动键断言合理性

by_path.yaml 键即 path（L15 起 `"src/views/ChatView.vue"` 等），本非 symbol 维度，**无裸键问题可迁移**；task「键不动 · 仅头注对齐（键形态约定句）」断言合理且最小化。唯头注 L7/L74「全部 9 个 flow 复用」现文失真（实测 7），并入 N1 一并校正。

### 验收标准（全机检可断言性专项）

| # | 验收条 | 机检手段 | 审查 |
|---|---|---|---|
| 1 | 零裸键 · 69 不变 · 值全等（30 附 diff 证据进 invoke_30） | python+yaml 键扫描 / 计数 / 值 multiset 比对（本审查已预演全绿） | ✓ |
| 2 | http 复合键化且 9 flow 命中不重复 | 键存在性 grep + flow 引用去重计数 | ✓ 可机检；计数表述见 N1（7/9） |
| 3 | indexes↔9 flow implementedBy 一一对应（机检 exit 0） | 双向集合比对（本审查预演 missing/extra 均 ∅） | ✓ 比 SPEC §3 P2 L50「人工抽检 + P3 机检」加严且兼容 |
| 4 | 头注/README/01_modules 人签记录更新 | grep 断言关键句 + 人签表行 | ✓ |
| 5 | compile 绿 · lint/test/build 回归绿 · `git diff main --stat -- src/` 为空 | 脚本退出码 + CI + diff 断言 | ✓（graph.json 时间戳 diff 容忍已在 00 定夺 compile 行钉死） |
| 6 | volatile.md 短注 · verify PASS | 文件 grep + `npx dsh-coding-kit verify` | ✓ |

**全部机检可断言 · 无人工目测条。**

### 非范围（对照 SPEC §3/§4 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| src 零变更 | 「src/** 任何变更」 | ✓ 在列；验收第 5 条 diff 断言兜底 |
| flow/l0 不动 | 「l0 / l1 flow 内容变更（implementedBy 不动）」 | ✓ 键迁移不改 flow，边界正确 |
| P3 不越界 | 「双写收敛 / CI 强化（SPEC P3）」 | ✓ 与 SPEC §3 P3 L54–55 对应；task 文末「CLOSE 后按维护者令进 P3」同向 |
| 跨仓 / schema | 「api / iOS 仓图谱 · schema 升级」 | ✓ 与 SPEC §4 L61–62 一致 |
| 条目值/增删 | 「任何条目值变更或条目增删（值全等断言兜底）」 | ✓ 纯键迁移的核心护栏，与验收第 1 条闭环 |

**无漏项。**

### failure_paths（纯键迁移适配性）

| 触发 | 审查 |
|---|---|
| 迁移误改值 → 值全等断言拦截 · 不合入 | ✓ 对症首要风险，机检兜底 |
| 复合键与既有 51 键撞键 → 撞键=0 断言（含合并后全集） | ✓ 本审查预演 0 撞键；条文含「新旧合并全集」语义严谨 |
| compile 红 → 不合入 · 修至绿 | ✓ graph-compile.sh（递归 compile + check + graph.json 双写，P0/P1a/P1b 已核）+ tech-graph CI 承载 |
| 误改 flow/l0/src → 范围外 · diff 断言拦截 | ✓ 与验收第 5 条双保险 |

**完整，无遗漏。**（纯键迁移无「新脱节」类风险，SPEC §6 第 1 行不适用，四行足够。）

### test_strategy 与 CI / 工具一致性（本审查实测）

| 项 | task | 实测 | 审查 |
|---|---|---|---|
| graph-compile | `./scripts/graph-compile.sh` | 脚本在案（KIT_CLI 钉 1.10.0 · 递归 compile/check + graph.json 双写） | 一致 |
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | 仓内定制质量门同名同序 | 一致 |
| verify | `npx dsh-coding-kit verify --target . --task …` | **实测**：`VERIFY: BLOCKED · HG-AUDIT-R1 pending`（HG-TASK-DRAFT / HG-GRAPH-MODULES approved；方向正确） | ✓ 闸表机读与 task 表一致 |
| task lint | — | **实测** `task lint --file` PASS（W4 warn 1 条 · SPEC 承载豁免合法） | 通过 |

### SPEC §3 P2 / §5 逐条对齐

| SPEC 条文（行号已核） | task 承载 | 审查 |
|---|---|---|
| L48「chat 试点外扩展：优先 lg_rag 域 → 其余模块按『有 flow 才配 indexes』跟进」 | P1a/P1b 已落地（lg_rag + 7 域）；本 task 为 P2 **收尾**（键形态归一） | ✓ P2 内容清零前的合理收尾切片，非新增范围 |
| L49「改 flow 同 task 必改 indexes」 | 不改 flow；反向（改 indexes 键形态）不要求改 flow，条文本向不约束 | ✓ 不冲突 |
| L50「indexes 与 l1 flow implementedBy 一一对应（人工抽检 + P3 机检）」 | 验收第 3 条机检 exit 0（加严） | ✓ |
| §5 L70「P2：lg_rag 域 indexes 落地 · 与 flow 符号一致」 | 已落地；本 task 复验一一对应 | ✓ |
| §5 L72「HG-GRAPH-MODULES 人签记录回写 01_modules.md 人签表」 | 范围第 4 条 + 验收第 4 条 | ✓ |

### 00 定夺内部一致性（专项）

- 「值一律不变」行 × 验收第 1 条「值集合全等」× failure_paths 第 1 行：三处同文，闭环可机检。
- 「零裸键 + 撞键=0」行 × 验收第 1/3 条 × failure_paths 第 2 行：三处同文，本审查预演全绿。
- 「by_path 键不动仅头注对齐」行 × 范围第 2 条 × 非范围「条目值/增删」：同向，最小改动面。
- 「头注双形态段改写为统一复合键 + 历史留痕一句」× 范围第 1/3 条（README 同步）：覆盖 by_symbol 头注与 l2 README 两处失真面（README L5「双形态并存…裸键（不迁移）」句迁移后必改，见 N4）。
- 「勿 auto-merge」三处同文（related_pr 行 · 00 定夺合入行 · 合入策略节）。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | **http「9 flow 复用/命中」实测为 7**：`http_client` 节点仅现于 graph/issues/lc_evidence/lg_rag/login/overview/pulls 七 flow；`10_flow_chat` 无 http_client 节点（fetch_session_api 与 SSE 均直边 ops_api）、`10_flow_obs` fixture 驱动无 http 段。by_symbol L8、by_path L7/L74 现文及 task 验收第 2 条「9 flow 命中不重复」的计数口径均与实测 7 不符（语义本身无损：单条全域命中 · 索引内不重复，本审查已实测） | 30 改写头注时顺手校正为「7/9 flow 复用（chat/obs 不含 http_client 节点）」；by_path 头注对齐时同改 L7/L74；验收第 2 条判定按「http 在引用它的 flow 集合内去重单条」执行，invoke_30 注明实测计数 7 |
| N2 | 机检三断言（零裸键 / 值全等 / 撞键=0）task 未钉具体命令或脚本落点（仅「grep/python 断言」+ 证据进 invoke_30） | 本审查已用 python+yaml 预演全绿（69→69 · 撞键 0 · 75 flow 条目去重为 69 唯一对 · missing/extra 均 ∅）；建议 30 将断言脚本/一行命令原文贴入 invoke_30，供 40 复检直接复跑 |
| N3 | HG-TASK-DRAFT blocks_hats 值 `22-R1` 为旧帽名（现帽 20-task-audit R1），语义等价；verify 实测机读不误判 | 不改条文（同 P1a R1-N1 / P1b R1-N4 先例）；后续 task 起草可顺手用新帽名 |
| N4 | `l2/README.md` L5 现文「by_symbol 双形态并存：chat/lg_rag 裸键（不迁移）+ …复合键」在迁移后失真 | 范围第 3 条已含 README 更新；提醒 30 改写时以「2026-08-31 P2 起统一 path#symbol 复合键（历史双形态决策见 by_symbol 头注留痕）」口径落地，勿只改 by_symbol 头注而漏 README 句 |

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
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 4 非阻塞）；内容签收；流程闸待 web 00 依 task 表授权代签。迁移面 python+yaml 全量实测：18 裸 + 51 复合 = 69 · 迁移后撞键 0 · indexes↔flow 唯一对完全相等（75→69）· http 实测 7 flow |
