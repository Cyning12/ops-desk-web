# Task Audit R1：web-lg-rag-sse-t6

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_t6.md`（task lint **PASS** · W4 无思考轮 warn 1 条，task 已自注「由上游 SPEC + 00 定夺承载 · 对齐 T3–T5 先例」，实测）  
> **SPEC / 契约**：api freeze `lg-rag-sse-v1`（web 侧不改契约；api 410 契约已 freeze 于 api T6）  
> **SPEC 审查**：不在本审查范围  
> **api 联调真值**：`ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md` §10.5（已核原文 · 2026-08-31 回写实现句：`POST /api/ops/chat/stream` → **410 Gone**，JSON `{"error":"chat_stream_deprecated","migrate_to":"/api/ops/lg-rag/stream",...}` + `Deprecation: true` + `Link: ...; rel="successor-version"`；保留 `GET /chat/models` · `GET /chat/sessions/latest` · WS `/chat/ws` 行为不变；不删 chat 代码/图/表）  
> **上游**：api T6 `task_lg_rag_deprecate_chat_stream` completed 已归档 `done/`（PR #108 MERGED · 2026-09-01 CLOSE，已核文件头）；api 00 `PROMPT_web_00_t6_remove_chat_sse`（已核 · 建议范围 5 条与 web task 范围逐条对应）；web T5 `task_web_lg_rag_sse_t5` done/ CLOSE（PR #28 MERGED，git log 已核 merge commit）；就绪闸 `WAVE_READINESS_lg_rag_sse_v0.md` §2 行 1 已勾（api+web T5 CLOSE，已核原文）· 行 2 仍 `[ ]`（见 N5）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-sse-t6`（已核当前分支一致）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-t6` |
| freeze_id | `lg-rag-sse-v1`（沿用 · web 侧不改契约，与 api §10.5 / api T6 task freeze 行一致，已核） |
| test_strategy | `required`（守卫改写 + 既有全套 + lint/test/build + graph-compile + dist grep 联调） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸；invoke_10 已核存在 `by-task/web-lg-rag-sse-t6/`） |
| graph_change_layer | `G-L1`（`10_flow_chat` 备注 update；`01_modules.md` 零 diff 已核——模块表无 useOpsChatSse/chat stream 引用） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：思考由 api 05 §10.5 + api 00 Prompt 与本 task 00 定夺承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / G-L1 / test_strategy=required / 人工闸表四行齐 / wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」，文件已核存在）· close_pr_policy=required 与「勿 auto-merge」三处自洽（元信息 related_pr · 00 定夺合入行 · 文末合入/联调策略）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31 · 维护者令「api-T6已完成」放行） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价，不阻塞（同 T2–T5 R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 授权代签文档闸） | **30** | graph_delta=update 限 `10_flow_chat` 备注、不新增一级模块；`01_modules.md` 零 diff 已核成立；不阻塞（对齐 T3–T5 先例） |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「待 20-task-audit R1 pass 后 web 00 代签」 |
| **HG-JOINT-DEBUG** | pending | **merge** | 不属本审；40 脚本化记录（dist grep）**或**维护者亲签；web PR 勿 auto-merge 三处钉死 |

blocks_hats 方向正确。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：删/留清单无歧义且与代码现状逐点吻合（`useOpsChatSse` 全仓引用点逐一核对归属，见核对项）；保留钉死（`fetchLatestSession`/`ChatSession`）与 api §10.5 保留端点清单 + chat store 消费点三方一致；守卫改写口径可机检（文件缺席 + 字符串缺席两类断言均有成熟先例）；failure_paths 四行覆盖清扫类任务全类风险；联调（dist grep）可执行；非范围六项审查要点无漏；00 定夺九行内部无矛盾；chat-sse.spec 删除后全套仍绿的依据成立（该 spec 为唯一 importer，自包含） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 6 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 删/留清单 ↔ 代码现状（全仓 grep 逐点核对 · 2026-08-31 实测）

**`useOpsChatSse` 全部引用点归属**（grep 全仓，逐点定归属）：

| 引用点 | 归属 | 审查 |
|---|---|---|
| `src/composables/useOpsChatSse.ts`（本体 · L5 注释含 `/api/ops/chat/stream` · L109 `fetch('/api/ops/chat/stream')` 唯一代码字面量） | 删除对象 | ✓ task 删除行覆盖 |
| `tests/chat-sse.spec.ts` L3–4（import `SseFrameParser`/`streamOpsChat`/`ChatSseEvent`） | **唯一活 import** · 随文件同删 | ✓ task 删除行覆盖；src 树无任何活 import（stores/chat.ts · ChatView.vue 经守卫与 grep 双重确认无引用） |
| `src/composables/useLgRagSse.ts` L12–13（注释「与 chat SSE（useOpsChatSse）差异…禁止 import useOpsChatSse」） | 注释对照提及 | ✓ task 00 定夺「引用清理」行 + 范围「注释引导清扫」覆盖（改历史注记） |
| `src/api/chat.ts` L7–8（注释「POST /ops/chat/stream 不走 axios，见 useOpsChatSse.ts」） | 注释引导 · 指向将删文件 | ✓ 00 定夺常量行「grep 清扫含注释引导」覆盖；范围 `src/api/chat.ts` 行对应（见 N1） |
| `AGENTS.md` L67（关键入口表列 `useOpsChatSse.ts`） | 仓导航文档 · **不在 task 范围** | 见 N3（删后悬空指针） |
| `docs/_tech_graph/l2/indexes/by_symbol.yaml` L29–36 · `by_path.yaml` L28–34 | 图谱 L2 索引 · graph_delta 未覆盖 | 见 N4（自 T2 起已脱节 · 删后条目悬空） |
| `docs/**` 其余（done tasks · reviews · invokes · SPEC） | 历史档案 | ✓ 不追（failure_paths「仓外/历史文档不追」同义覆盖） |
| `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` L84（§5 T6 段「web 删除 useOpsChatSse 死代码」未勾） | 人工 checklist | ✓ 与 task 头部第 11 行引用一致，CLOSE 时勾选 |

**`/ops/chat/stream` 引用点**：src 树仅 `useOpsChatSse.ts`（L5 注释 + L109 代码字面量 · 注意字面量全长 `/api/ops/chat/stream`，含子串 `/ops/chat/stream`，守卫/dist grep 均可命中）与 `chat.ts` L7 注释；**无任何命名路径常量**（CHAT_STREAM 类符号 grep 全仓零命中，见 N1）。tests 树含该字符串处均为「不打该路径」负向断言或对照用例（`chat-sse.spec` 随删；`lg-rag-api.spec`/`lc-evidence-api.spec`/`lg-rag-sse.spec` 各自只扫描本页三文件，**不受 T6 注释政策影响、不误伤**，已核扫描清单）。

**保留钉死 ↔ 消费方**：`src/api/chat.ts` 当前仅导出 `ChatSession`（interface L11–17）与 `fetchLatestSession`（L20–23 · `GET /ops/chat/sessions/latest`）；消费方唯一 = `src/stores/chat.ts`（L4–5 import · L186 `ref<ChatSession|null>` · L231 调用，T3 元数据门控）——与 task 保留行 + api §10.5「保留 `GET /chat/sessions/latest`」三方一致。`/chat/models` 在 src 全树零引用，task 保留行「若有引用同样保留」为条件句，**无歧义**。

### 守卫改写口径（可机检性专项）

- 现状 `tests/chat-stream-deprecation.spec.ts`（已核全文）：3 例，仅扫 `stores/chat.ts` + `ChatView.vue` 两文件（禁 import 字符串 + 禁 `streamOpsChat(` + 禁路径 + 正向断言走 useLgRagSse）。
- 改写目标（00 定夺守卫行 + 验收第 1/2 条）：① `useOpsChatSse.ts` 文件缺席（fs existsSync 断言，机检无歧义）② src 全树无 `/ops/chat/stream` 活引用。
- 「活引用 vs 注释提及」的机检分界条文未定义（00 定夺允许「注释引导可留但须指向 lg-rag 主线」，failure_paths 第 2 行「守卫只断言活引用/文件缺席」）——若 30 用朴素全树 `not.toContain('/ops/chat/stream')` 则会误伤含路径字面量的注释。**判为非阻塞**：failure_paths 已预留解释空间，且最简实现（全树字面量缺席 + 注释改写时去掉路径字面量）同时满足 dist grep 口径；见 N2。
- 联调 `grep -rn '/ops/chat/stream' dist/`（test_strategy 末行）：构建剥离注释，唯一代码字面量随 `useOpsChatSse.ts` 删除即清，**可执行、可复现**；HG-JOINT-DEBUG「40 脚本化记录或维护者亲签」双通道明确。

### 既有测试影响面（chat-sse.spec 删除后全套仍绿的依据）

- `chat-sse.spec.ts` 仅 import 被删 composable，**无反向依赖**：全仓 grep 确认无任何其他 src/tests 文件 import `useOpsChatSse`（守卫 spec 只做字符串负向断言，不做模块 import）。
- `chat-store.spec.ts`（T3–T5 用例）mock 的是 `useLgRagSse` 模块（T5 R1 已核 L11），与 chat SSE 零耦合；`fetchLatestSession` 保留 → chat store 元数据门控用例不受影响。
- 守卫 spec 为**改写**非删除，用例数变化不影响其他 spec；`lg-rag-*.spec` / `lc-evidence-*.spec` 扫描清单不含将删文件。
- **依据成立。**

### 非范围（对照审查要点六项 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| api 改码 | 「api 实现 / 改 `ops-desk-api` 任何代码（410 契约已 freeze）」 | ✓ 在列 |
| 存活端点 | 「删/改 `fetchLatestSession` · `/chat/models` · `/chat/sessions/latest` 相关封装（api 侧未下线）」 | ✓ 在列；与 api §10.5 保留清单逐字对应 |
| C0–C4 | 「**C0–C4** Host 沟通轨 · iOS（若仍用 chat 须另仓 task）」 | ✓ 在列（iOS 同行） |
| lg-rag 行为 | 「改 lg-rag SSE 行为（T2–T5 已交付语义不动）」 | ✓ 在列 |
| /lg-rag 页 | 「改 `/lg-rag` invoke 页（零 diff）」 | ✓ 在列 |
| 生产监控 | 「生产监控告警配置（联调项『无 404 洪流』以代码侧无请求发起来承载）」 | ✓ 在列；与文末联调策略「无 404/410 洪流（代码侧无发起方即满足）」自洽 |

**无漏项。**

### failure_paths（清扫类任务适配性）

| 触发 | 审查 |
|---|---|
| 误删存活端点封装 → CI 测试红（chat store 用例依赖 fetchLatestSession）→ 不得合入 | ✓ 有真实承载：chat-store.spec 经 stores/chat.ts L231 调用链覆盖；拦截机制成立 |
| 守卫误伤注释提及 → 只断言活引用/文件缺席 · 注释改指 lg-rag 主线 | ✓ 在列；机检分界细化见 N2（非阻塞） |
| 第三方书签/旧文档指向 chat stream → 本仓文档清扫 · 仓外不追 | ✓ 合理边界（历史 done/review/invoke 档案不追，与核对项归属表一致） |
| api 410 被前端触发 → 本 task 后前端无 chat stream 请求 · 若出现=回归 bug | ✓ 与联调用例②「全站无 chat stream 请求」闭合 |

**完整，无遗漏**（死代码删除类 task 无运行时用户可见面，四行覆盖误删/误伤/文档/回归四类，合理）。

### 契约一致性（task 00 定夺 ↔ api §10.5 ↔ api 00 Prompt）

| 钉死项 | task | api 契约 / Prompt | 审查 |
|---|---|---|---|
| 410 语义 | 背景行：410 Gone（JSON 迁移指针 + Deprecation + Link successor-version） | §10.5 回写实现句逐字同构 | ✓ 一致 |
| 保留端点 | `fetchLatestSession`/`ChatSession` 保留；`/chat/models` 若有引用同样保留 | §10.5「保留 `GET /chat/models` · `GET /chat/sessions/latest` · WS `/chat/ws`」；Prompt 非范围同 | ✓ 一致（WS /chat/ws 前端本就不用，无需 task 条目） |
| 删除范围 | useOpsChatSse + chat-sse.spec + chat stream 常量 + 守卫改写 + README | Prompt 建议范围 5 条逐条对应 | ✓ 一致 |
| 注释清扫 | grep 清扫含注释引导 | Prompt 第 3 条「grep 清扫 chat/stream · useOpsChatSse 活引用（含注释引导）」 | ✓ 逐字同源 |
| freeze / 模块 / 合入 | web 不改契约 · freeze 不动 · 不新增一级模块 · 勿 auto-merge | api T6 task「不删 chat 代码/图/表 · 不新增/不删一级模块」 | ✓ 分工正确（api 保代码 · web 删死代码，两仓正交） |

### 00 定夺内部一致性（专项）

- 「删除」行 ×「保留」行：删除清单（composable + 其专属 spec）与保留清单（api/chat.ts 存活端点封装）不相交，已核 `chat.ts` 不 import composable（仅注释提及），删文件不触及保留符号。**无矛盾。**
- 「常量」行（移除 `/ops/chat/stream` 路径常量）× 代码现状（无命名常量，仅字面量）：措辞与现状有缝但释义唯一（字面量随删文件即清 + 注释清扫），**不构成执行歧义**，见 N1。
- 「静态守卫」行（注释引导可留但须指向 lg-rag 主线）× 验收第 2 条（src 全树无 `/ops/chat/stream` 活引用 · 守卫断言）：「活引用」分界依赖实现口径，failure_paths 第 2 行已预留解释空间；两种自洽实现均存在（朴素全树缺席 / 剥注释后断言），**不致 30 无所适从**，见 N2。
- 「README」行 ×「引用清理」行：README 传输主线钉 lg-rag + chat stream 标弃用，与注释历史注记口径同源（指向 lg-rag 主线），**无矛盾**；README 现行 L13/L18「Chat SSE」表述已核为待改点。
- 「模块」行（`10_flow_chat` 仅备注 · 残留符号引用同步删）× 现状：l1 yaml implementedBy 已无 useOpsChatSse 引用（T2 起即切 streamLgRag/LgRagSseFrameParser，已核全文），删文件不破 graph check；description 已含「废弃 chat stream 主路径」字样，T6 备注增量明确。**无矛盾**（L2 索引脱节另见 N4）。

### test_strategy 与仓 CI 一致性

| 项 | task | CI 真值 | 审查 |
|---|---|---|---|
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | `.github/workflows/ci.yml` L31–38 三步同名同序（已核） | 一致 |
| graph-compile | `./scripts/graph-compile.sh` | `.github/workflows/tech-graph.yml` L32–33（已核；compile+check 仅扫 `*.graph.yaml` 目录，l2/indexes 非 graph.yaml 不入编译） | 一致 |
| verify | `npx dsh-coding-kit verify --task ...` | harness 约定 | 一致 |
| task lint | — | 本审查实测 `task lint --file` **PASS**（W4 豁免 warn 1 条，task 已自注合法） | 通过 |
| 联调 | `grep -rn '/ops/chat/stream' dist/` 应为空 | HG-JOINT-DEBUG 承载（blocks merge） | 可执行 |

### 依赖与联调策略可执行性

- api T6 #108 MERGED：`../ops-desk-api/docs/tasks/done/task_lg_rag_deprecate_chat_stream.md` 文件头已核（completed · 2026-09-01 CLOSE · PR #108）；§10.5 实现句与 task 背景逐句吻合（410 + 迁移指针 + Deprecation/Link 头 + 保留三端点 + 不删 chat 代码）。
- api 00 `PROMPT_web_00_t6_remove_chat_sse` 已核：建议范围 5 条与非范围 1 条，web task 范围/非范围全覆盖且无越界（Prompt 联调条「DevTools Network 人工勾选」被 task 升级为 dist grep 脚本化 + HG-JOINT-DEBUG，加严方向合理）。
- 就绪闸 `WAVE_READINESS_lg_rag_sse_v0.md` §2：行 1 `[x]`（api+web T5 CLOSE）已核与 task 头部第 9 行一致；行 2 仍 `[ ]`（「维护者下线窗口未定」· web-00 2026-08-31 核）——task 以 HG-TASK-DRAFT 闸表「维护者令 api-T6已完成」为放行真值，**授权链在 task 内自洽**；就绪闸行 2 回填欠账见 N5（跨仓文档卫生，不阻塞）。
- checklist `CHECKLIST_lg_rag_sse_joint_release_v1.md` §5 T6 段已核存在（3 项未勾，与 task 头部第 11 行引用一致），CLOSE 时勾选路径明确。
- 联调用例三条（dist grep · 全站无 chat stream 请求 · 既有回归绿）与 api §10.5 联调清单（§10.5 下方 checklist「web Chat 不再请求 /ops/chat/stream」）对应，**可执行、无歧义**。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | 00 定夺/范围「移除 `/ops/chat/stream` 路径常量」：代码现状**无命名常量**（CHAT_STREAM 类符号全仓零命中），唯一代码字面量为 `useOpsChatSse.ts` L109 `fetch('/api/ops/chat/stream')`，随删文件即清；`chat.ts` L7–8 注释指向将删文件，须随「grep 清扫含注释引导」改写 | 30 按「字面量 + 注释清扫」理解即可，无需寻找常量；`chat.ts` 头部注释改写为指向 lg-rag 主线（如「流式走 useLgRagSse」），不改条文 |
| N2 | 守卫「活引用 vs 注释提及」机检分界未定义：若朴素全树 `not.toContain('/ops/chat/stream')`，00 定夺允许的「注释引导（含路径字面量）」会被误伤；failure_paths 第 2 行已预留解释空间 | 建议 30 采最简一致口径：**src 全树（含注释）无 `/ops/chat/stream` 字面量**，注释改写时去掉路径字面量（保留「chat stream 已弃用 · 见 lg-rag」类人读注记）——与 dist grep 口径天然一致、零误伤、断言最简单；`useOpsChatSse` 标识符同理（lg-rag-api/lc-evidence 守卫先例已是全字符串缺席口径） |
| N3 | `AGENTS.md` L67 关键入口表仍列 `src/composables/useOpsChatSse.ts`（Chat SSE 封装），删文件后悬空；不在 task 范围/非范围任一侧 | 建议 30 顺手删除/改写该表行（文档级清扫，范围「注释/文档引导清扫…等」可覆盖；AGENTS.md 的 harness 托管块不动，仅业务导航表）；若 00 认为越界则留文档维护 task，30 内在 invoke 记录取舍 |
| N4 | `docs/_tech_graph/l2/indexes/by_symbol.yaml` L29–36 · `by_path.yaml` L28–34 仍映射 `streamOpsChat`/`SseFrameParser` → node `stream_sse`/`sse_parser`：自 T2 起已与 l1 yaml 脱节（l1 现节点为 streamLgRag/LgRagSseFrameParser），删文件后条目悬空；两文件非 `*.graph.yaml`，graph-compile/CI 不校验（已核 graph-compile.sh 扫描逻辑），task graph_delta 未覆盖 | 30 内决：建议顺手删除该两索引条目（图谱文档卫生 · 不破 CI）；但 HG-GRAPH-MODULES 预签范围为「graph_delta=update 限 `10_flow_chat` 备注」，若 00 认为动 l2 索引越出预签，则留图谱维护 task 并在 invoke_30 记录——两条路均不阻塞 |
| N5 | `WAVE_READINESS_lg_rag_sse_v0.md` §2 行 2 仍 `[ ]`（「维护者下线窗口未定」· web-00 2026-08-31 核），结论行仍写「T6 待维护者下线窗口」；本 task 以闸表「维护者令 api-T6已完成」为放行真值，授权链自洽，但跨仓就绪闸回填欠账 | 不阻塞（放行真值在 task 闸表 · 维护者令已记录）；建议 HG-JOINT-DEBUG 或 CLOSE 时由 web/api 00 回填 §2 行 2 + 结论行，保持唯一入口不失真 |
| N6 | README 必读 L25（`01-sse-chat-design.md`）与联调 L47（`api-auth-chat.md`）为旧 chat SSE 设计/接口文档指针：task 只钉「传输主线 = lg-rag SSE · chat stream 标弃用」，未明示这两行去留 | 30 内决：L13/L18 必改（传输主线）；L25/L47 可保留为历史/接口参考但建议加「（旧 chat SSE · 已弃用）」注记，与 00 定夺「chat stream 标为已弃用」同口径 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸清单（20 后 · 30 前）

> 依 task 人工闸表 `HG-AUDIT-R1` 行：「待 20-task-audit R1 pass 后 **web 00 代签**」。  
> **HG-JOINT-DEBUG（merge 闸）不在代签范围**：40 脚本化联调记录（dist grep 无 chat stream）或维护者亲签，未过前 web PR 勿 auto-merge。

- [ ] 已读 R1 审查结论（本文件）
- [ ] task 人工闸表 `HG-AUDIT-R1` → approved（00 代签 · 2026-08-31）
- [ ] commit task 文档 + 本审查文
- [ ] 下发 Harness 30（invoke_30）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 6 非阻塞）；内容签收；流程闸待 00 依 task 表授权代签 |
