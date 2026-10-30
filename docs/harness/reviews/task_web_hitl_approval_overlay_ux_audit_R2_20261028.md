# task_web_hitl_approval_overlay_ux 审查（R2 · 20-task-audit · 增量复审）

> **审查对象**：`docs/tasks/active/task_web_hitl_approval_overlay_ux.md`（draft · bugfix+前端交互重构 · **v0.2** · 193 行 · R1 退回回填版）
> **审查帽**：20-task-audit（书面审查 · **未改 task 任何内容** · **未改 src/** · **未代签**任何闸 · 未切分支 · 未 commit）
> **日期**：2026-10-28 · **仓态**：cwd=`ops-desk-web` · 分支仍 `task/web-hitl-resume-chase-ux`（dd537d7 合并态 · 未切新分支）· task 文/R1 审查文未 commit（?? 态 · 符合「30 开工才切」纪律）
> **审查基准**：R1 审查文 `docs/harness/reviews/task_web_hitl_approval_overlay_ux_audit_R1_20261028.md`（退回：B1 旧测面遗漏三处 · B2 浮层新风险面未封闭 · NIT×5）→ 本轮仅做**增量核对**，不重开 R1 已通过项实质重审
> **本审查动作**：落盘本审查文；`required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制，不落；**HG-AUDIT-R1 仍 pending → 禁止附 30 Prompt**；本帽**不代签**

---

## 结论摘要

**结论：通过**（R1 两阻塞项 B1/B2 全量落位属实 · NIT×5 全采纳属实 · 回填未引入新矛盾 · 零新增阻塞 · 零新增 NIT）。

| 维度 | 结论 |
|------|------|
| B1 旧测影响面三处补齐（:657 预裁定 · hitl.note 钉面归并 · guards TC13(b)/TC3 条件命中） | ✅ 落位属实（§二 task:71 · §六 task:112 · D1 task:94 联动 · 全部锚点抽验亲读属实，核对项 1） |
| B2 浮层新风险面封闭（D10 + failure_paths 行 + R3 措辞同步） | ✅ 落位属实（D10 task:103 · failure_paths task:134 · 控制表 R3 task:155 + R3 正文 v0.2 段 task:177，核对项 2） |
| NIT×5 采纳 | ✅ 全采纳且忠实（N1 D1 判据主条件化 task:94 · N2 FP-14 勘误 task:29/:46 + FP-H10 注明出处 task:120 · N3 D5 数据源点名 task:98 · N4 锚边界声明 task:50 · N5 闸表 20-R1 task:44，核对项 3） |
| 回填新矛盾扫描 | ✅ 零矛盾（D1×:657 预裁定 · D10×D2/D3/D5 · 思考轮控制表×正文同步性，核对项 4） |
| 修订记录 v0.2 行 | ✅ 落位（task:193 · 与实际回填逐项吻合） |
| 机械闸 | `npx spec-wave task lint` → **LINT: PASS · EXIT=0**（W3 自检占位符 draft 期合法 · 2026-10-28 本帽实跑复验）；`npx spec-wave verify` → **VERIFY: BLOCKED · EXIT=2**（HG-AUDIT-R1/HG-GRAPH-MODULES pending · **符合预期** · 闸态未被动过） |
| 流程闸 | HG-TASK-DRAFT=approved ✅；HG-AUDIT-R1=**pending**（待维护者亲签 · 本帽不代签）；HG-GRAPH-MODULES=pending（10 评估不新增一级模块 · R1 已认可） |
| 下一棒 | **维护者签 HG-AUDIT-R1 → 30**（签闸清单见文末；30 以 task 表为真值） |

---

## 核对项（增量 · 全部亲读/亲跑实证 · 2026-10-28）

### 1. B1 逐项落位核对 ✅（含新引锚点抽验）

| R1 要求 | v0.2 落点 | 抽验结果 |
|---|---|---|
| B1-1 `tests/chat-store.spec.ts:657` 条件命中 + D1 形态预裁定 | §二 task:71 + §六 task:112 + D1 task:94「选延迟建泡须按 §二预裁定处置 :657 旧钉」 | ✅ 亲读 :657 = `expect(chat.messages).toHaveLength(3) // 新 assistant 承接 replay 帧`（resumeFromCursor 后、replay 帧到达前 · 锁死立即建泡）——task 描述逐字属实；处置预案（改钉同 PR 可见 · 禁静默改钉 · 或选 onDone 回收则存续）与 R1 回填要求一致 |
| B1-2 `chat-store-hitl.spec.ts` hitl.note 钉面补 :991,:1037,:1095 | §二 task:71 + §六 task:112 按 R1 建议归并为「:991（TC6 终帧收官 note=「已批准」）,:1037-1038（TC7 note+resumeHint 双腿）,:1095（TC-U1 上限降级 note 整测）,:1102-1131,:1283,:1307」 | ✅ 亲读 :991 = `expect(assistant.hitl?.note).toBe('已批准')`；:1037-1038 = TC7 note+resumeHint 双断言；:1095 = TC-U1 `expect(assistant.hitl?.note).toBe('恢复仍在进行，可稍后手动续看')`——三处逐字属实，归并表述准确 |
| B1-3 guards TC13(b):139-179 + TC3 setInterval 条件命中 | §二 task:71 + §六 task:112（预声明处置路径 = 优先绕开解析段修法，否则停并与维护者裁定守卫口径，禁即兴改钉） | ✅ 亲读 guards :139-179：删行仅限 onError 错误面（:163-166）、增行禁触 event_type/payload/FrameParser/.feed(/TextDecoder/ReadableStream（:167-173）——task 引述口径逐字属实；TC3 setInterval 仓级口径注记一并落位 |
| B1-4（顺手建议）存续/适配预判注 | §二 task:71 末「**预判**：store 侧 hitl.note 钉在 D3『store/帧管线零改』前提下预期存续零改动；view 侧 chat-view.spec.ts 六测必适配浮层」 | ✅ 落位 |

### 2. B2 逐项落位核对 ✅（含新引锚点抽验）

| R1 要求 | v0.2 落点 | 抽验结果 |
|---|---|---|
| B2-1 条带共存/层叠 · 遮挡消息流尾/自动滚动 · 窄屏 | **D10**（task:103 · v0.2 新增）①②③ + failure_paths 新行（task:134） | ✅ 亲读 ChatView.vue：错误条 el-alert :274-292 · resumeHint 条 :293 · hitlPendingError/hitlPending 提示 :294-302 · interrupted :303 · lastDone :304-308 · composer footer :310-338——条带区确居消息列表与 composer 之间，D10①「浮层恒居条带区之下、composer 正上方 · 纵向并列互不覆盖」与实际 DOM 序兼容，裁定可执行 |
| B2-2 streaming 中浮层控件禁用随迁 | D10④ + failure_paths task:134 末句 | ✅ 亲读 HitlApprovalCard.vue:55（resume_mode radio）/:63（批准）/:76（驳回）均为 `:disabled="chat.streaming"` view 层绑定——task 引述逐字属实；D10④ 明示「该禁用是 view 层绑定、不在 store 分态内，decideHitl 分态零改覆盖不到渲染层禁用态，须显式随迁」精准封闭 R1-B2-3 缺口 |
| B2-3 R3 early_stop 措辞同步 | 控制表 R3 行 reason（task:155）+ R3 正文 v0.2 段（task:177）「D 表 = D1–D10 · 据此补强成立」 | ✅ 双处同步落位，措辞不再裸称「开放点已全落 D 表」而给出 D10 依据 |

### 3. NIT×5 采纳核对 ✅

- **N1** → D1（task:94）改为「零内容落墨为主判据（runTerminalStatus 等元信息落墨不计入内容面）…replay 携终帧但零内容落墨同属本判据、不逃逸」——采纳且与建议方向一致（主条件化 · 无终帧降为典型场景）✅
- **N2** → graph_delta_note（task:29）「本 task failure_paths 不设编号 —— R1-N2 勘误原『FP-14』悬指」+ 闸表 HG-GRAPH-MODULES 行（task:46）同步勘误；验收 4（task:120）「FP-H10 系前作 chase task 编号系 · 可溯 `src/stores/chat.ts:1020` 注释」——亲读 chat.ts:1020 注释确含「stopStreaming/startNewSession → 清退避定时器 + 代际戳失效 + 活链释放（FP-H10 不泄漏）」✅ 出处可溯属实
- **N3** → D5（task:98）「浮层进度区数据源点名 = 当前最新 hitl 态消息的 `hitl.note`（showProgress 落点 `src/stores/chat.ts:1041-1045` 写入 · R1-N3：禁止另造 store 进度字段违 D3）」——亲读 chat.ts:1041-1045：`showProgress()` 写 `assistant.hitl.note = text`（:1043）+ `resumeHint.value = text`（:1044）双落点 ✅ 逐字属实
- **N4** → §一标题（task:50）落「锚在父窗：委托子帽不可亲读原文，引文忠实度以 00 转发为准 —— R1-N4 核验边界声明 · 四点映射无缺口」✅
- **N5** → 闸表 HG-TASK-DRAFT 行 blocks_hats 已改「20-R1, 30」并注明勘误（task:44）——verify 实跑输出同步显示 `HG-TASK-DRAFT | approved | 20-R1, 30` ✅

### 4. 回填新矛盾扫描 ✅（零矛盾）

- **D1 × :657 预裁定**：D1 保留「实现形态 30 定稿」授权，同时把 :657 处置预案显式挂进 D1 与 §二/§六——30 选延迟建泡有预裁定路径（改钉同 PR 可见 · 禁静默改钉）、选 onDone 回收则存续，与验收 7 纪律自洽，无矛盾 ✅
- **D10 × D2**：D2 定「composer 上方独立浮层 · 非消息流内」；D10① 细化为「条带区之下、composer 正上方」——亲读 ChatView.vue DOM 序（条带 :274-308 在 composer :310 之上），D10 是 D2 的精化而非冲突 ✅
- **D10 × D3**：D10④ 明确 streaming 禁用是 view 层绑定随迁、不进 store 分态——与 D3「数据层不动 · store/帧管线零改」正交，无越界 ✅
- **D10 × D5**：D5 定进度落点 = 浮层进度区 + resumeHint 条；D10① 定浮层与 resumeHint 条带纵向并列不互遮——两者可同屏共存，无冲突 ✅
- **思考轮控制表 × 正文同步**：R3 行结论列（task:155）注「v0.2 增补 D10（R1-B2）」、reason 列同步补强；R3 正文主段（task:175）保留 D1–D9 表述 + 紧接 v0.2 段（task:177）补 D10 封闭说明——表文互指一致；「给执行帽必读」（task:141）已同步为 D1–D10 ✅
- **failure_paths 新行（task:134）** 与 D10 四条通则逐条对应（条带共存 · 不遮消息流尾 · 窄屏通栏 · streaming 禁用随迁），无第二口径 ✅

### 5. R1 已通过项抽查 ✅（不实质重开）

- 三闸状态未被动过：HG-TASK-DRAFT=approved · HG-AUDIT-R1=pending · HG-GRAPH-MODULES=pending（verify 实跑复核一致）✅
- 修订记录 v0.2 行（task:193）与实际回填逐项吻合（B1 三处 + B2 D10/failure_paths/R3 + NIT×5 逐条点名 · 三闸不动 · 未改 src/未切分支/未 commit）✅
- 仓态纪律：本帽 git 复核——分支仍 `task/web-hitl-resume-chase-ux`，src/ 零改动，task 文与 R1 审查文 ?? 未 commit——与 v0.2 行自述一致 ✅

---

## 阻塞项

**零内容阻塞。**

## 非阻塞 NIT

**零新增 NIT**（R1-NIT×5 已全采纳；本增量轮未发现新的可改进点）。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R2 审查结论（**通过** · R1 退回项全量封闭）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
（HG-GRAPH-MODULES 维持 pending 至 30 交付时 flow 增量 + graph-compile 绿 · 实证需新增一级模块则停并回签，路径见 task graph_delta_note。）

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-28 | R2 · 20-task-audit 增量复审：B1 三处补齐 + B2 D10/failure_paths/R3 同步 + NIT×5 采纳逐项亲读属实（新引锚点 chat.ts:1041-1045/:1020 · ChatView.vue:274-308 · HitlApprovalCard.vue:55/:63/:76 · tests :657/:991/:1037-1038/:1095 · guards TC13(b):139-179 全抽验）· 零新矛盾 · lint PASS 复验 · verify BLOCKED 于 HG-AUDIT-R1/HG-GRAPH-MODULES pending 符合预期 → **通过** · 请维护者签 HG-AUDIT-R1 |
