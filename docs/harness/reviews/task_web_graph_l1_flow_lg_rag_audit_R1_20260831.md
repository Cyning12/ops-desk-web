# Task Audit R1：web-graph-l1-flow-lg-rag

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_graph_l1_flow_lg_rag.md`（task lint **PASS** · W4 无思考轮 warn 1 条，task 已自注「由 SPEC R0–R5 全轮承载 · lint W4 合法」，实测）  
> **SPEC**：`docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1（`10_flow_lg_rag` 优先）+ P2 先行切片（lg_rag 域 indexes 同步 · SPEC L48–49 原文已核）  
> **SPEC 审查**：不在本审查范围  
> **上游缺口证据**：SPEC §1 G3（lg-rag 页无独立 flow）· G4（l2 仅 chat 试点 · T6 R1-N4 脱节前科），已核原文 L25  
> **前置**：P0 CLOSE · `docs/tasks/done/task_web_graph_l0_stale_sweep.md` · PR #31 MERGED（git log 已核 merge commit `a8bf76e`）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-graph-l1-flow-lg-rag`（已核当前分支一致 · HEAD `187add5` 即本 task 起草 commit）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**仅新增本审查文一个文件**

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-graph-l1-flow-lg-rag` |
| freeze_id | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变，与 SPEC §0/§4 冻结点一致，已核） |
| test_strategy | `required`（graph-compile 绿 + grep/yaml 断言 + pnpm lint/test/build 回归 + verify；src 零变更面下回归负担合理） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| graph_change_layer | `G-L1`（+ G-L2 indexes 同步切片，与 graph_delta 行、00 定夺 l2 同步行三处自洽） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：由 SPEC R0–R5 全轮承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / graph_delta（l1 flow + l2 indexes + 01_modules + compile 产物四处落点明确）/ wiki_delta=volatile.md（文件已核存在 · 对齐仓内定制「新 task 勿默认 n/a」）/ test_strategy=required / 人工闸表四行齐 / close_pr_policy=required 与「勿 auto-merge」两处自洽（元信息 related_pr 行 · 文末合入策略）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31 · 维护者「提前签收task」授权沿用） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价，不阻塞（同 T2–T6 / P0 R1 先例，见 N1） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 维护者授权代签文档闸） | **30** | 不新增一级模块（flow 属 G-L1 · `01_modules.md` L15 pages 行已含 LG RAG 页，已核）；`01_modules.md` 改动限 pages 行补 Obs + 关联节 + 人签记录，与 SPEC §3 P1 L43 预签口径逐字同源；不阻塞 |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「20-task-audit R1 pass 后 web 00 即签（维护者『提前签收』授权）」；verify 实测 BLOCKED · pending（见 test_strategy 节） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波无跨仓联调，n/a 判定合理；验收以 CI + grep/yaml 断言承载 |

blocks_hats 方向正确（仅 HG-GRAPH-MODULES / HG-AUDIT-R1 blocks 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：00 定夺六行与 src 实证逐条吻合（LgRagView → useLgRagStore → invokeLgRag → http axios → POST /api/ops/lg-rag/invoke 调用链已逐文件核行号）；旁注四项（refuse=200 · 非流式 · thread_id 回填 · mode 三档）在 src 均有实证锚点；「l2 同波同步」切片有 SPEC §3 P2 L49「改 flow 同 task 必改 indexes」同步规则直接授权，非范围扩张；验收 7 条全机检可断言；非范围五项与 SPEC §4 及 P 阶段边界对齐无漏；failure_paths 四行覆盖图谱新增类全类风险；compile「不手改」纪律有脚本产物面实证支撑 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 6 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 00 定夺 ↔ src 实证（逐行核对 · 2026-08-31 实测）

| 定夺项 | src 现状（行号已核） | 审查 |
|---|---|---|
| `LgRagView` 节点 | `src/views/LgRagView.vue` L5 import `useLgRagStore` · L7 实例化 · L70 `store.invoke(q, modeDraft, tid)` · L83 `store.abort()` · L87 `store.useThreadId()` | ✓ view → store 调用边实证成立 |
| `useLgRagStore`（invoke / abort / useThreadId / elapsed 计时） | `src/stores/lgRag.ts` L17 `defineStore('lgRag')` · L46 `invoke()` · L37 `abort()` · L42 `useThreadId()` · L25 `elapsedSeconds` + L59–61 setInterval 秒计时（「elapsed 计时」语义即此）· L80–91 return 面四符号全暴露 | ✓ 四符号真实存在 · 无臆造 |
| `api/lgRag.ts` `invokeLgRag` | `src/api/lgRag.ts` L143 `export async function invokeLgRag` · L151 `http.post<LgRagEnvelope>(LG_RAG_INVOKE_PATH, body, …)` | ✓ |
| `api/http.ts` axios | `src/api/http.ts` L45 `export const http: AxiosInstance = axios.create({ baseURL: '/api', … })` | ✓ |
| `POST /api/ops/lg-rag/invoke` → ops_api | lgRag.ts L9 `LG_RAG_INVOKE_PATH = '/ops/lg-rag/invoke'` + L8 注释「相对 http.baseURL=/api，实际路径 POST /api/ops/lg-rag/invoke」 | ✓ 端点字面值精确无歧义（与 l0 P0 波 `lg_rag_page → api_client` 边同源实证） |
| 旁注：refuse=200 | lgRag.ts L141 注释「refuse（route / gate_action）是 200 成功态，由调用方写入 result」· store L15 同口径注释 · LgRagView L19–23 `isRefuse` 按 `route==='refuse' || gate_action==='refuse'` 判正常响应 | ✓ 三处实证互证 |
| 旁注：非流式 | lgRag.ts L139 注释「freeze lg-rag-http-v1，非流式」· 全文无 SSE/流式读取；SSE 主线在 `useLgRagSse`（chat 域，属 `10_flow_chat`） | ✓ 与「非流式（SSE 主线在 10_flow_chat）」定夺自洽 |
| 旁注：thread_id 回填 | store L42–44 `useThreadId()` 把 `result.thread_id` 回填 `threadId` 输入 · LgRagView L86–89 `onUseThreadId` | ✓ |
| 旁注：mode 三档 | lgRag.ts L13 `LgRagMode = 'router' \| 'basic' \| 'supervisor'` · LgRagView L117–121 三档 radio | ✓ |
| 不新增一级模块 | `01_modules.md` L15 pages 行已含「LG RAG（/lg-rag …）」 | ✓ HG-GRAPH-MODULES 预签口径成立 |
| compile 产物不手改 | `scripts/graph-compile.sh` 已核存在（P0 R1 已核全文：递归 compile + check + `graph_yaml_to_json.py` 双写 graph.json） | ✓ 纪律可执行 |
| 合入：勿 auto-merge | 元信息 related_pr 行 + 文末合入策略 + close_pr_policy=required 三处同文 | ✓ |

**实证链五段（view → store → api → http → 端点）全部落地，四旁注全部有 src 锚点，无臆造、无遗漏。**

### 「l2 同波同步」切片合法性专项（SPEC §3 P2 措辞核对）

| 核对点 | SPEC 原文（行号已核） | 审查 |
|---|---|---|
| P2 优先域 | L48「chat 试点外扩展：优先 `lg_rag` 域（`useLgRagSse` / `streamLgRag` / replay 符号）」 | 括号例证符号为 SSE 三符号，**已被 chat 试点覆盖**（`by_path.yaml` L31–40 `useLgRagSse.ts` 下 streamLgRag/replayLgRag/LgRagSseFrameParser 已在 indexes）；task 把 lg_rag 切片落在**新 flow 的 implementedBy 符号**（LgRagView/useLgRagStore/invoke/abort/useThreadId/invokeLgRag/http），与 SPEC §5 L70「lg_rag 域 indexes 落地 · 与 flow 符号一致」验收口径自洽（见 N2） |
| 同步规则 | L49「同步规则钉死：**改 flow 同 task 必改 indexes**（对齐 api 仓 05 §9 同款义务）」 | **直接授权本切片**：新建 `10_flow_lg_rag` 而不同波补 indexes 即违反本条；task graph_delta_note「防脱节（防再造 T6 前脱节）」与 SPEC G4 缺口证据同源。**结论：合法 · 非范围扩张** |
| l2 README 纪律 | `l2/README.md` L4「拓扑变更须同步更新 indexes」 | ✓ 仓内纪律同向 |
| P2 验收形态 | L50「indexes 与 l1 flow `implementedBy` 一一对应（人工抽检 + P3 机检）」 | task 验收第 3 条加严为 yaml 断言机检，与 SPEC 兼容且更严 |

### 格式先例一致性（`10_flow_chat.graph.yaml` · l2 chat 试点 · 已核全文）

| 先例点 | chat 现状 | task 定夺 | 审查 |
|---|---|---|---|
| implementedBy 结构 | 每节点 `implementedBy: [{path, symbol, kind}]`（L20–23 等 9 节点实证） | 「每节点挂 implementedBy（path/symbol/kind）」 | ✓ 逐字段对齐 |
| layer_hint | flow 节点 `layer_hint: "G-L2"`（L19 等） | 「layer_hint=G-L2」 | ✓ |
| 节点 kind 取值 | flow / struct / external（chat yaml 实证） | 定夺未限死 kind 集合，30 按先例取 | ✓ |
| external 节点 | `ops_api` / `api_chat_flow` 无 implementedBy | 链尾 `→ ops_api` 隐含 external 尾节点 | ✓ 与先例同型 |
| l2 indexes 结构 | by_path/by_symbol 双倒排 · 头注「源：l1/10_flow_chat.graph.yaml implementedBy」· `graph_id` 单值 | 「格式对齐 chat 试点」 | ✓ 方向对齐（单 graph_id 面结构决策见 N3） |

### 验收标准（全机检可断言性专项）

| # | 验收条 | 机检手段 | 审查 |
|---|---|---|---|
| 1 | flow 实证链节点/边齐 + 旁注三项 | yamllint + grep 断言节点 id / 边三元组 / 旁注关键字 | ✓ |
| 2 | implementedBy 符号 src 真实存在 | 逐符号 grep（本审查已先行实证一遍，30 复核成本极低） | ✓ |
| 3 | l2 indexes lg_rag 条目与 flow implementedBy 一一对应 | yaml 解析双向比对 | ✓（比 SPEC P2 L50「人工抽检」加严为机检） |
| 4 | 01_modules pages 行含 Obs · 关联节含 10_flow_lg_rag.md · 人签记录追加 | grep 三断言 | ✓（Obs 欠账已核：L15 现列 8 页无 Obs，P0 R1-N3 同口径） |
| 5 | compile 绿 · 10_flow_lg_rag.md 生成 · graph.json 双写再生成 | `./scripts/graph-compile.sh` 退出码 + git diff | ✓（graph.json 时间戳行须容忍，见 N5） |
| 6 | pnpm lint/test/build 回归绿 · src 零 diff | `git diff main --stat -- src/` 为空 + CI | ✓ 与 ci.yml 三步同名同序（P0/T6 R1 已核 · 本仓 CI 未变） |
| 7 | volatile.md 短注落盘 · verify PASS | 文件 grep + `npx dsh-coding-kit verify` | ✓ |

**全部机检可断言 · 无人工目测条。**

### 非范围（对照 SPEC §3/§4 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| src 零变更 | 「`src/** ` 任何变更（纯图谱波）」 | ✓ 在列；验收第 6 条 diff 断言兜底 |
| P1 其余页不越界 | 「其余页 flow（overview/issues/pulls/graph/lc_evidence/obs/login · SPEC P1 后续子 task）」 | ✓ 与 SPEC §3 P1 L42 排队清单逐字对应 |
| P2 其余域不越界 | 「l2 indexes 其余域扩展（SPEC P2 本波仅 lg_rag 先行切片）」 | ✓ 切片边界清晰 |
| P3 不越界 | 「双写收敛 / CI 强化（SPEC P3）」 | ✓ 与 SPEC §3 P3 L54–55 对应 |
| l0 不动 | 「l0 改动（P0 已 CLOSE）」 | ✓ P0 PR #31 已 MERGED（git log 已核） |
| 跨仓 / schema | 「api / iOS 仓图谱 · schema 升级」 | ✓ 与 SPEC §4 L61–62 一致 |

**无漏项。**（`l2/README.md` 更新既未列范围也未列非范围，属灰区，见 N4。）

### failure_paths（图谱新增类适配性）

| 触发 | 审查 |
|---|---|
| compile 红（yaml 语法/schema）→ 不合入 · 修至绿 | ✓ 有真实承载：graph-compile.sh + tech-graph CI 全量 compile+check（P0 R1 已核） |
| implementedBy 符号与 src 不符 → 30 先 grep 实证再落（禁臆造） | ✓ 本审查已先行实证（上行对照表）；条文对症 |
| indexes 与 flow 不一一对应 → 同 task 内修齐 | ✓ 与本 task 同步义务条文自洽；验收第 3 条 yaml 断言兜底 |
| 误改 l0 / src → 范围外 · diff 断言拦截 | ✓ 验收第 6 条 + tech-graph CI 双保险 |

**完整，无遗漏**（纯图谱波无运行时用户可见面，四行覆盖语法/实证/一致性/越界四类，合理）。

### test_strategy 与 CI / 工具一致性（本审查实测）

| 项 | task | 实测 | 审查 |
|---|---|---|---|
| graph-compile | `./scripts/graph-compile.sh` | 脚本已核存在（P0 R1 已核全文：D-PIN `dsh-coding-kit@1.10.0` · 递归 compile + check + py 双写） | 一致 |
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | ci.yml 三步同名同序（P0/T6 R1 已核） | 一致 |
| verify | `npx dsh-coding-kit verify --target . --task …` | **实测**：`VERIFY: BLOCKED · HG-AUDIT-R1 pending`（HG-TASK-DRAFT / HG-GRAPH-MODULES approved；HG-AUDIT-R1 blocks 30 方向正确） | ✓ 闸表机读与 task 表一致 |
| task lint | — | **实测** `task lint --file` **PASS**（W4 无思考轮 warn 1 条 · task 已自注 SPEC 承载，合法豁免） | 通过 |

### SPEC §3 P1（+ P2 切片）逐条对齐

| SPEC 条文（行号已核） | task 承载 | 审查 |
|---|---|---|
| L42「新增 `10_flow_lg_rag`（lg-rag invoke 页 · 优先）」 | 全 task 主题；范围第 1 条 | ✓ |
| L43「`.graph.yaml` + compile 生成 `.md` · 挂 `01_modules.md` 关联节 · HG-GRAPH-MODULES 按『不新增一级模块』预签口径」 | 范围第 1/3 条 · 00 定夺 modules 补行 · 闸表 HG-GRAPH-MODULES 行 | ✓ 三点全承载 |
| L44「验收：每 flow compile 绿 · modules 关联更新 · 顺序与优先级在 task 内钉」 | 验收第 4/5 条 · 00 定夺钉死表 | ✓ |
| L49「改 flow 同 task 必改 indexes」 | graph_delta l2 行 · 00 定夺 l2 同步行 · 范围第 2 条 | ✓ 直接授权切片（见上专项） |
| §5 L72「HG-GRAPH-MODULES 人签记录回写 `01_modules.md` 人签表」 | 00 定夺 modules 补行「人签记录追加本 task 行」· 验收第 4 条 | ✓ |

### 00 定夺内部一致性（专项）

- 「flow 建模真值」行 ×「非流式（SSE 主线在 10_flow_chat）」：与 `10_flow_chat.graph.yaml` L4 description（chat 主 Chat 切 lg-rag SSE）及 AGENTS.md「useLgRagSse = 主 Chat 传输主线」口径自洽，**两 flow 域无重叠建模**。
- 「l2 同步」行 ×「覆盖本 flow 全部 implementedBy 符号」× 验收第 3 条「一一对应」：三处同文，闭环可机检。
- 「modules 补」行 × HG-GRAPH-MODULES 预签说明行 × graph_delta 行：三处同文（pages 行补 Obs + 关联节 + 人签记录），**授权链自洽**。
- 「compile」行「产物不手改」× failure_paths 第 1 行 × 验收第 5 条：脚本唯一生成源，**纪律闭环**。
- version 未钉死具体日期（chat 先例 version 为字符串日期）；30 落盘当日日期即可，**无歧义**。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | HG-TASK-DRAFT blocks_hats 值 `22-R1` 为旧帽名（现帽 20-task-audit R1），语义等价；verify 机读不误判（已实测该闸不 blocks 30） | 不改条文（同 T2–T6 / P0 R1 先例）；后续 task 起草可顺手用新帽名 |
| N2 | SPEC §3 P2 L48 括号例证（`useLgRagSse`/`streamLgRag`/replay 符号）已被 chat 试点 indexes 覆盖（by_path.yaml L31–40 实证），与新 flow 的 implementedBy 符号（invoke 链）不重叠；task 将 lg_rag 切片落在后者，与 §5 L70「与 flow 符号一致」验收口径自洽，属正确解读而非字面偏离 | 30 按 task 执行即可；SPEC 已冻结不回改，本 note 仅为真值校 record；若后续 SPEC 修订可顺手校正 P2 例证表述 |
| N3 | 现行 `by_path.yaml` / `by_symbol.yaml` 为**单 graph_id 单域**结构（头注「chat 域」· `graph_id: "10_flow_chat"` 单值）；加入 lg_rag 域条目需 30 决策扩展形态（同文件多域分段 vs 拆分 `*_lg_rag` 文件对），task 定夺「格式对齐 chat 试点」未钉到这一层 | 30 内决；任一形态下验收第 3 条 yaml 断言均可机检，不阻塞；建议形态选定后在文件头注记双域来源 |
| N4 | `l2/README.md` L4 现写「试点域：`chat`」；本 task 落地后该表述失真，而 README 更新既未列入范围也未列入非范围（灰区） | 30 顺手把试点域表述更新为「chat · lg_rag」（文档卫生 · 一句话改动）；若 00 认为须严守范围字面，则由 00 追认后 30 再动 |
| N5 | compile 再生成 `graph.json` 必带 `generated_at` 时间戳 + 当日日期 diff 行（graph_yaml_to_json.py 行为，P0 R1-N4 已核同型）；`10_flow_lg_rag.md` frontmatter `generated_at` 为 sha256 内容哈希（确定性 · 无此问题） | 验收第 5 条对双写 graph.json 应容忍时间戳/日期行；30/40 自检时在结论表注明即可 |
| N6 | 新增 by_symbol 键含泛名符号（`invoke` / `abort` / `http` 等）；by_symbol 以符号名为唯一键，未来跨域扩展存在撞键风险（如他域 store 亦暴露 `invoke`） | 30 内决：可在撞键时引入 `path#symbol` 复合键或域前缀（P2 后续域扩展时再说）；本波 chat/lg_rag 两域无撞键（已核现有 9 键），不改不阻塞 |

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
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 6 非阻塞）；内容签收；流程闸待 00 依 task 表授权代签 |
