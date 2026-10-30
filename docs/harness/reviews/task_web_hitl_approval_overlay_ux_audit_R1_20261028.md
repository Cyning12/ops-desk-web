# task_web_hitl_approval_overlay_ux 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_hitl_approval_overlay_ux.md`（draft · bugfix+前端交互重构 · v0.1 · 188 行）
> **审查帽**：20-task-audit（书面审查 · **未改 task 任何内容** · **未改 src/** · **未代签**任何闸 · 未切分支 · 未 commit）
> **日期**：2026-10-28 · **仓态**：cwd=`ops-desk-web`（本帽未动分支/工作区）
> **审查基准**：task v0.1（HG-TASK-DRAFT=approved · HG-AUDIT-R1/HG-GRAPH-MODULES=pending）+ 需求锚 m00171（父窗 · 见 N4 核验边界声明）+ 前作 `docs/tasks/done/task_web_hitl_resume_chase_ux.md`（CLOSE · 40 PASS · commit 584db64）
> **本审查动作**：落盘本审查文；`required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制，不落；**HG-AUDIT-R1 仍 pending → 禁止附 30 Prompt**；本帽**不代签**

---

## 结论摘要

**结论：退回 10-task**（内容阻塞 B1/B2 · NIT ×5）。两阻塞项均为**文档级轻量回填**（补清单行 + 补一条 D/failure_path），不涉及方向性返工；回填后复审（R2）走增量核对。

| 维度 | 结论 |
|------|------|
| 内容（范围/验收/旧测面/failure_paths 可执行性） | **退回**：B1 旧测影响面清单实证遗漏三处（其一与 D1 实现形态直接耦合）；B2 浮层新风险面未封闭（层叠/遮挡/窄屏/streaming 控件禁用），R3 early_stop「开放点已全落 D 表」据此不完全成立 |
| 流程闸 | HG-TASK-DRAFT=approved（2026-10-28 维护者签 · 00 代录）✅；HG-AUDIT-R1=**pending** ✅（本帽不代签）；HG-GRAPH-MODULES=pending（10 评估不新增一级模块 · 本帽认可，见核对项 5） |
| 代码钉案（§二/§六全部锚点） | ✅ 逐条亲读属实（核对项 1） |
| 范围/非范围/验收可机断 | ✅（核对项 2） |
| D1–D9 自洽闭环 | ✅ 主链闭环（核对项 3）；D5 数据源点名建议见 N3 |
| 与已 CLOSE chase task 重叠区裁定 | ✅ 显式且含「改钉与改码同 PR 可见 · 禁静默改钉」（核对项 4） |
| graph_delta 不新增一级模块 | ✅ 结论站得住（核对项 5） |
| 思考轮 R0–R3 + R4/R5 记法 | ✅ 合规（核对项 6）；early_stop 理由受 B2 削弱 |
| 机械闸 | `npx spec-wave task lint` → **LINT: PASS · EXIT=0**（W3 自检占位符 draft 期合法 · 2026-10-28 本帽实跑） |
| 下一棒 | **10-task 回填 B1/B2（+ NIT 酌处）→ 20-task-audit R2 增量复审**；HG-AUDIT-R1 保持 pending，30 拒开工 |

---

## 阻塞项（退回 10-task 回填）

### B1 · §二「旧测影响面（初扫）」清单实证遗漏三处（其一与 D1 实现形态耦合）

task §二旧测影响面行（task:71）与验收 7（task:122）机制本身合规（清单 + 可机断处置规则 + 禁静默改钉/禁为保旧钉回退范围），但本帽独立 grep + 亲读实证清单**不完整**：

1. **`tests/chat-store.spec.ts:657`（漏 · 与 D1 形态耦合 · 最重要）**：`chat.resumeFromCursor()` 后、replay 帧到达**前**立即断言 `expect(chat.messages).toHaveLength(3) // 新 assistant 承接 replay 帧`——此钉锁死 `src/stores/chat.ts:1183`「立即 pushMessage」现状。D1 授权 30 二选一定稿「延迟 pushMessage vs onDone 回收」：**若选延迟建泡，此钉必红**。未预列入清单 → 30 撞红后要么即兴改钉（违禁静默改钉精神），要么被迫弃延迟形态（变相「为保旧钉回退范围」——验收 7 自禁事项）。**回填要求**：补入清单并标「条件命中 · 依 D1 定稿形态：选延迟建泡则适配（改钉与改码同 PR 可见 · 理由注明行为语义由立即建泡改延迟建泡）；选 onDone 回收则存续」。
2. **`tests/chat-store-hitl.spec.ts:1037` 与 `:1095`（漏 · hitl.note 钉腿）**：清单列 :1038（TC7 的 resumeHint 腿）却漏同测 :1037（TC7 的 `assistant.hitl?.note` 腿，断言行号紧邻）；:1095（TC-U1 上限降级 `assistant.hitl?.note` 钉）整测未入清单。另 :991（TC6 终帧收官 note=「已批准」）同属 hitl.note 钉面。**回填要求**：补齐三行（:991/:1037/:1095），或按类归并为「chat-store-hitl.spec.ts hitl.note 双落点/收官钉面 :991,:1037-1038,:1095,:1102-1131,:1283,:1307」。
3. **`tests/hitl-decision-surface-guards.spec.ts` TC13(b)（漏 · 范围②条件命中面）**：该守卫（:139-179）钉 `src/composables/useLgRagSse.ts` diff 口径——删行仅限 onError 错误面、增行禁触解析段（event_type/payload/FrameParser/.feed(/TextDecoder/ReadableStream）。范围② replay 数据链调查若根因落前端 useLgRagSse（候选之一即 replay 取帧全链），修复 diff 极易触红此守卫。**回填要求**：作为条件命中项预列入清单（核对结论大概率「零改动存续」，但须预裁定，避免 30 撞红后即兴处置；同 file TC3 setInterval 白名单对新浮层组件为仓级口径，新组件引入 setInterval 即红，一并注明）。

**顺手建议（非阻塞增量）**：清单行可注「store 侧 hitl.note 钉（上列）在 D3『store/帧管线零改』前提下**预期存续零改动**；view 侧 `tests/chat-view.spec.ts` 六测必适配浮层」——使 30 核对结论可预判、40 可机断复核。

### B2 · 浮层新风险面未封闭（failure_paths / D 表），R3 early_stop 理由被削弱

浮层化为本 task 最大改动面，但其引入的新风险面在 D 表与 failure_paths 中**未封闭**：

1. **浮层与既有提示条带的共存/层叠未裁定**：D2 只定「composer 上方 · 非消息流内 · 非全屏模态 · 不遮输入」。而 ChatView 消息列表与 composer 之间已有共存条带——错误条（ChatView.vue:274-292）、resumeHint（:293）、hitlPending 提示（:294-302）、interrupted/lastDone 行（:303-308）。浮层落位与这些条带的相对顺序/互遮规则未裁定，30 将自由发挥维护者敏感 UX（本需求恰源于维护者观感反馈）。
2. **遮挡与窄屏未提**：浮层是否遮挡消息流尾部（新帧到达自动滚动 interplay）、窄屏下处置（通栏降级/折叠），均无裁定亦无 failure_path。
3. **streaming 中浮层控件禁用语义未明示随迁**：现状卡片 `:disabled="chat.streaming"`（HitlApprovalCard.vue:55/:63/:76）是 **view 层绑定**，不在 store 分态内——failure_paths「decideHitl 既有分态零改，仅呈现位置随迁浮层」（task:134）覆盖不到它。

R3 early_stop 理由为「开放点已全落 D 表」（task:153）——B2 三项即未落表的开放点，理由不完全成立。**回填要求**（二选一或并用）：补一条 D（建议 D10：浮层落位与提示条带共存规则 · 不遮消息流尾部/自动滚动不互踩 · streaming 中动作控件禁用沿用卡片语义 · 窄屏通栏降级通则），或补对应 failure_paths 行；并同步 R3 理由措辞。

---

## 非阻塞 NIT（10-task 酌处 · 不阻 R2 通过）

- **N1 · D1 判据边界**：D1 为「replay 干净结束（onDone 无终帧）**且**零落墨」AND 关系；若 replay 携终帧（done 仅元信息）但零内容落墨，空气泡判定逃逸（`runTerminalStatus` 落墨不计入内容面）。建议复核该边界是否有意排除；若非有意，判据宜以「零内容落墨」为主条件（无终帧仅为典型场景）。
- **N2 · 编号悬指**：graph_delta_note 与闸表引「FP-14」，本 task failure_paths 未编号、仓内无 FP-14 所指；验收 4 引「FP-H10」为前作 chase task 编号系（可溯 `src/stores/chat.ts:1020` 注释）。建议改描述性引用或注明出处。
- **N3 · D5 进度区数据源未点名**：D3 定「单一数据源 · 从当前最新 hitl 态消息取数」；chase `showProgress` 写 `assistant.hitl.note`（chat.ts:1043）——浮层进度区应即以 `message.hitl.note` 为读取源（D3×D5 在此解读下方闭环）。建议 D5 或验收 4 点名，防 30 另造 store 进度字段违反 D3。
- **N4 · 需求锚核验边界声明**：m00171 为父窗消息，本帽（委托子 Agent）无法亲读原文。§一引文与 00 转发单四点映射完整：②空泡→范围 1、③(a)replay 数据链→范围 2、③(b)浮层化→范围 3、④tab 合并→前提（dd537d7 已在仓）、①chase 语义答疑已由 done 的 chase task 收口。引文忠实度以 00 转发为准，本帽未发现映射缺口。
- **N5 · 闸表旧帽名**：HG-TASK-DRAFT 行 blocks_hats 写「22-R1」（V2 已改名 20-task-audit）——与 done chase task 同款旧称，建议顺手勘误为 20-R1。

---

## 核对项（全部亲读/亲跑实证 · 2026-10-28）

### 1. §二现状钉案 + §六依赖锚点逐条亲读 ✅

| task 锚 | 亲读结果 |
|---|---|
| `src/stores/chat.ts:1183` 无条件 `pushMessage('assistant')` 先于 replay | ✅ 逐字属实；onDone :1237-1247 仅设 resumeHint（:1242-1245 双文案）不回收空泡 |
| ChatView.vue:177-271 气泡容器无判空 | ✅ 容器恒渲染（:177-182）；内容面 :224-238 全空且非 streaming 时残留空泡外壳 |
| chase 常量 :978-986（10 次/120s · 2s×1.5 封顶 8s）· 唯一链 :1028-1029 | ✅ 逐字属实 |
| showProgress 双落点 :1041-1045 / degrade :1047-1055 / 终帧收官 :1148-1156 | ✅ 三处逐字属实（hitl.note + resumeHint 双写 · 终帧 note 回 settledNote + hint 清空） |
| parseReplayCursor :989-996 · resumeConflictMessage :1003-1008 · lastAppliedSeq :1073-1075/:1184-1186 · resumeNotice/resumeHint :435-438 | ✅ 逐字属实 |
| HitlApprovalCard.vue 179 行 · :1-8 三入口头注 · :49-60 resume_mode 三选 · :85-93 续看推进 · :26-28 onResume | ✅ 逐字属实（onResume 实 :26-28 script 内） |
| ChatView.vue:267 内联卡挂载 · :293 resumeHint 条 · :310-338 composer | ✅ 逐字属实 |
| `src/api/hitl.ts:63-79` HitlResumeReplay 六键 + HitlResumeResponse | ✅ 逐字属实（:64-71 六键 · :73-79 头部） |
| `src/composables/useLgRagSse.ts:112` LG_RAG_REPLAY_PATH · :161-166 replayLgRag | ✅ 逐字属实（body `{run_id, after_seq}` :165） |
| HitlApprovalView 消费 api/hitl.ts 三函数 · 不消费 replay 补帧 | ✅ 头注 :1-11 + import :16-21 属实（decide/fetch/resume 三函数） |

### 2. 范围/非范围/验收可机断 ✅

- 范围三主项边界清晰；调查项（范围 ②）交付物形态明确：验收 2 定「五段数据链钉案 + 根因归属裁定 + 证据」三件套，前端根因→修复+钉测随 task、后端根因→观察报告上抛且 src 零对应改动（双分支交付形态均可机断）✅。
- 非范围八项与冻结契约（lg-rag-sse-v1 · hitl-browser-decide-v1 只消费禁改）、chase 数值/机制冻结、数据层不动（D3）切割干净 ✅。
- 验收 1/3/4/5/6/7 均可机断（钉测断言点明确 · 三门命令明确 · graph-compile EXIT=0 · task lint PASS）✅。

### 3. D1–D9 自洽闭环 ✅（主链）

- D2×D4：消息流不再渲染审批动作面 + 三入口同浮层 + 历史已决留轻量只读标记 → 「不被截断」与「历史可读」兼得，逻辑闭环 ✅。
- D3×D5：store/帧管线零改前提下，浮层以 `message.hitl`（含 note）为单一数据源 → chase 进度/降级文案 store 侧照写、渲染落点迁浮层+resumeHint，「双落点语义存续 · 数值机制不动」成立 ✅（数据源点名建议见 N3）。
- D6×failure_paths「单一数据源失配」：多 hitl 态消息并存取当前最新一条、不并列多浮层 → 多审批并发排队风险面已覆盖 ✅。
- D7 /hitl 页存续与本 task 零改动声明一致 ✅。

### 4. 与已 CLOSE chase task 重叠区裁定 ✅

- §二「chase 进度双落点」行显式标注「hitl.note 落点绑定卡片形态，与浮层化直接冲突，须随迁重裁定」（task:65）；R2 正文（task:169）点名重叠区；D5 落定随迁裁定；非范围冻结 chase 数值/唯一性/幂等机制（task:82）✅。
- 验收 7 保留「改钉与改码同 PR 可见 · **禁止静默改钉，禁止为保旧钉回退范围**」（task:122）——与前作 chase task 验收 7（done task :94）同款纪律 ✅。

### 5. graph_delta 评估 ✅

改动面 = ChatView.vue + 新浮层组件（components/chat/ 既有模块面内）+ store 渲染层行为微调 → 不新增一级模块的结论站得住；实证需新增则停并回签的机制在（惟编号 FP-14 悬指，见 N2）✅。

### 6. 思考轮记法合规 ✅

R0–R3 回填闭合、控制表四列齐备、`actual_last_round: R3（early_stop）`、R4/R5 标「未开 · early_stop at R3 · 不伪造」——记法合规 ✅。惟 R3 early_stop 理由「D 表已封闭开放点」因 B2 不完全成立（回填时同步措辞）。

### 7. 旧测清单已列部分抽验 ✅（对照 B1 遗漏面）

- `tests/chat-view.spec.ts` 六测属实：AC7 渲染 :89-114 · T-W2 默认 inherit :116-170 · T-W2 immediate :172-215 · FP-F11 降级卡 :217-235 · AC10 :237-260 · AC2/AC6 历史待审批 :262-298（断言行恰落 :101-296 区间）✅。
- `tests/chat-store-hitl.spec.ts:1102-1131`（TC-P1 双落点+终帧即消）· :1283/:1307（「已批准 · 点击续看推进」）✅；`tests/chat-store.spec.ts:801-816`（空流 resumeHint 双文案）✅；`tests/hitl-approval-page.spec.ts:19/:236`（契约与文案同语义参照）✅。
- 本帽全量 grep 复核面：`hitl-card|HitlApprovalCard`（tests/ 13 命中 · 仅 chat-view 与 hitl-approval-page 两文件）、`resumeHint|resumeNotice`（13 命中）、`hitl\.note|恢复仍在进行|正在获取进展`（5 命中）、`resumeFromCursor|续看`（47 命中）——遗漏面即 B1 三项。

---

## 回填清单（→ 10-task）

| # | 落点（task 小节） | 回填内容 |
|---|---|---|
| B1-1 | §二「旧测影响面」行 + §六依赖「旧测影响面」行 | 补 `tests/chat-store.spec.ts:657`（条件命中 · 依 D1 形态 · 处置预案见 B1-1 文） |
| B1-2 | 同上 | 补 `tests/chat-store-hitl.spec.ts:991,:1037,:1095`（hitl.note 钉面归并或逐行） |
| B1-3 | 同上 | 补 `tests/hitl-decision-surface-guards.spec.ts` TC13(b)/TC3 条件命中说明 |
| B1-4（顺手） | 同上 | 注「store 钉预期存续（D3）· view 钉必适配」预判 |
| B2-1 | §五 D 表（建议新增 D10）或 failure_paths | 浮层与提示条带共存/层叠 · 遮挡消息流尾与自动滚动 · 窄屏通则 |
| B2-2 | 同上 | streaming 中浮层动作控件禁用语义沿用卡片（HitlApprovalCard.vue:55/:63/:76） |
| B2-3 | §思考轮 R3 行 | early_stop 理由措辞同步 |
| N1–N5 | 酌处 | 见 NIT 清单 |

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（退回 · B1/B2 回填后 R2 复审）
- [ ] R2 通过后，在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-28 | R1 · 20-task-audit：钉案全量亲读属实 + 旧测面独立 grep 复核 → **退回**（B1 旧测清单遗漏三处 :657/:991,:1037,:1095/guards TC13(b) · B2 浮层新风险面未封闭）+ NIT ×5；lint PASS；三闸状态核实（HG-AUDIT-R1 pending 不代签 · 未附 30 Prompt） |
