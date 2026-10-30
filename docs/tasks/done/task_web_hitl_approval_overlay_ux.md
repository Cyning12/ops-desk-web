# Task：Web · HITL 审批浮层化 + 空 replay 不渲染空气泡 + replay/恢复数据链实证 + 会话历史全量加载 + 对话历史 tab

> **状态**：`done`
> **类型**：bugfix + 前端交互重构（Vitest 红测先行 · api-only-consume · 调查先行）
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api（replay 数据链调查若指向后端，只出观察报告上抛，不改）；**禁止**改 replay/resume 冻结契约帧形状
> **分支**：新开 `task/web-hitl-approval-overlay-ux`，基于当前 `task/web-hitl-resume-chase-ux` 合并态（dd537d7 · 独立审批页 /hitl 已在仓 · 321 绿）；**30 开工才切** · 本棒不切分支、不改 src、不 commit
> **00 注**：2026-10-28 · 需求真值 = 维护者实测反馈原话（锚 m00171 · 00 转发，见 §一）· 无上游 SPEC · R0–R5 写在本 task · **30 在 HG-AUDIT-R1=pending 时拒开工**
> **00 注（v0.3）**：2026-10-28 · 维护者 R2 通过后追加两项需求（原话锚 m00231 · 00 转发，见 §一第 4 条）——①恢复上次会话加载所有历史消息 ②增加对话历史选择 tab；并入范围④⑤ + D11–D14 + failure_paths 补行；HG-AUDIT-R1 未签，须增量复审后再签，不可带病签闸

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-approval-overlay-ux` |
| **git_branch** | `task/web-hitl-approval-overlay-ux`（新开 · 基于 task/web-hitl-resume-chase-ux 合并态 dd537d7 · 30 开工时才切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · 切分支）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 红测先行（空泡钉测 + 浮层渲染落点钉测 + chase 进度落点随迁钉测），再改 `src/`。质量门在仓根按序执行 `pnpm lint`、`pnpm test`、`pnpm build`（`packageManager` 为 `pnpm@10.32.1`）。图谱改动后加跑 `./scripts/graph-compile.sh`。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `lg-rag-sse-v1`（replay 帧形状只消费禁改）· `hitl-browser-decide-v1`（`src/api/hitl.ts` 契约只消费禁改） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（审批渲染落点/续看描述增量 + v0.3 恢复历史全量加载与历史 tab 形态增量）+ `docs/_tech_graph/l1/10_flow_hitl.graph.yaml`（描述内 HitlApprovalCard 参照更新）· 预计**不新增一级模块**（v0.3 重评估存续 · graph_delta_note） |
| **graph_delta_note** | 10 评估（2026-10-28 亲读）：浮层化改动面在 `src/views/ChatView.vue` + `src/components/chat/`（既有 components/pages 一级模块面内）+ `src/stores/chat.ts` 渲染层行为，预计图谱零新增模块；30 交付时同步两份 flow yaml 增量备注并跑 `./scripts/graph-compile.sh` 绿。若 30 实证需新增一级模块：停并回签 HG-GRAPH-MODULES（流程性回签路径即本行 · 本 task failure_paths 不设编号 —— R1-N2 勘误原「FP-14」悬指）。**v0.3 重评估**（2026-10-28 亲读）：历史 tab = ChatView 页内 tab 承载既有 `src/components/chat-history/ChatHistoryPanel.vue`（components/pages 既有模块面内 · `docs/_tech_graph/l1/01_modules.md:16` 已有 chat-history 条目）；`src/router/index.ts` **零新增路由**（D13）；`01_modules.md` 零新行 → 不新增一级模块结论存续，回签路径不变。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：HITL 审批动作面自消息流内联卡片迁移为 composer 上方浮层（渲染层迁移 · 数据层 message.hitl 不动）；replay 干净结束零新帧不产空气泡（resumeHint 兜底存续）。真值指针 = 本 task。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-R1, 30 | 2026-10-28 · 维护者签（本窗指令「签收」· 00 代录）· blocks_hats 旧帽名 22-R1 勘误为 20-R1（R1-N5 · V2 已改名 20-task-audit） |
| HG-AUDIT-R1 | approved | 30 | 2026-10-28 · 00 代录（维护者授权 m00236「授权00签收后续文档」· 承 m00230 先例）· 审查链闭环：R1 退回（B1/B2+NIT×5）→ v0.2 → R2 通过零阻塞 → v0.3 新需求并入（m00231）→ R3 通过+NIT×1（非阻塞锚点精度 · 随签带交 30：httpErrorI18n.ts 504 映射实在 :22 非 :7 · :851-871/:521-780 为指示性引用）· 审查文 docs/harness/reviews/task_web_hitl_approval_overlay_ux_audit_R3_20261028.md |
| HG-GRAPH-MODULES | approved | 30 | 2026-10-28 · 00 代录（维护者授权 m00236 · 承 m00230 先例）· 10 评估+v0.3 重评估：不新增一级模块（01_modules.md:16 chat-history 条目在册 · router 零新增）；30 交付硬条件 = 10_flow_chat/10_flow_hitl flow 增量 + `./scripts/graph-compile.sh` 绿；实证需新增模块则停并回签（路径见 graph_delta_note · 无 failure_paths 编号对应 · R1-N2 勘误） |

---

## 一、需求真值（维护者 2026-10-28 实测反馈 · 原话锚 m00171 · 00 转发 · 锚在父窗：委托子帽不可亲读原文，引文忠实度以 00 转发为准 —— R1-N4 核验边界声明 · 四点映射无缺口；v0.3 追加第 4 条 · 锚 m00231 同边界）

1. 「10次后无数据返回，点击"续看推进"返回空不要展示一个空对话气泡」——chase 超限降级后手动续看（resumeNotice → replay）若取回零新帧，当前渲染一个**空气泡**；要求空结果不产出气泡。
2. 「replay出来的数据是从哪取出来的，replay没有数据返回，因为审核在对话框中，前后的内容被截断了，把审批作为单独弹窗放在对话框上方」——两大子项：
   - (a) **实证调查 replay 数据链**：`POST /api/ops/lg-rag/replay {run_id, after_seq}` 取回服务端持久化帧；实测「没数据返回」现象须定位（疑似恢复段帧未持久化 / 游标语义 / 前后内容被分段截断）。
   - (b) **交互重构**：HITL 审批从目前消息流内联卡片（HitlApprovalCard）改为**对话框（输入区）上方的独立浮层/弹窗**形态，消息流不再被审批卡截断。
3. 环境前提：task/web-hitl-approval-page 已按维护者令并入当前分支 task/web-hitl-resume-chase-ux（dd537d7 · 独立审批页 /hitl 在仓 · 321 绿）；本 task 在此合并态上继续。
4. **v0.3 追加**（维护者 2026-10-28 · 原话锚 m00231 · 00 转发）：「1、修改展示，恢复上次会话加载所有历史消息 2、增加对话历史选择tab」——①恢复上次会话时历史消息加载（现状钉案 = 自动路径零加载 + 手动路径静默截断，§二）②对话历史选择入口升级为 tab 形态（现状 = 默认收起的内嵌侧栏，§二）；两项与既有范围②同属数据链完整性/会话可读性专题，范围扩为④⑤（§三），形态封闭 D11–D14（§五）。

## 二、现状钉案（只读 · 10 亲读 2026-10-28）

| 主题 | 锚点 | 现状 |
|------|------|------|
| 空气泡根因候选 | `src/stores/chat.ts:1175-1250` resumeFromCursor | **:1183 无条件 `pushMessage('assistant')`** 先于 replay；replay 干净结束零新帧时 onDone（:1237-1247）只设 resumeHint「暂无新进度，稍后再点『续看』」，已 push 的空 assistant 消息（content='' · thinking/subtasks 空 · hitl=null）残留，ChatView 渲染空气泡外壳（`src/views/ChatView.vue:177-271` 气泡容器无判空） |
| 触发链 | `src/components/chat/HitlApprovalCard.vue:85-93` + `ChatView.vue:147-149,290` | chase 超限降级（chat.ts:1047-1055 · note=「恢复仍在进行，可稍后手动续看」）→ decided+canResume「续看推进」钮 :26-28 onResume → `chat.resumeFromCursor()`；resumeNotice/错误条「续看」同入口 |
| replay 数据链 | `src/composables/useLgRagSse.ts:112` LG_RAG_REPLAY_PATH + `:161-166` replayLgRag | POST /api/ops/lg-rag/replay body `{run_id, after_seq}`；游标来源 = resume 200 `replay.cursor`（parseReplayCursor chat.ts:989-996）或 activeRun.last_seq；去重基线 lastAppliedSeq（chat.ts:1073-1075/:1184-1186）seq<=基线帧忽略 |
| chase 进度双落点 | `src/stores/chat.ts:1041-1045` showProgress / `:1047-1055` degrade / `:1148-1156` 终帧收官 | 进度文案写 `assistant.hitl.note`（卡片内落点）+ `resumeHint`（页底提示条）双落点——**hitl.note 落点绑定卡片形态，与浮层化直接冲突，须随迁重裁定** |
| 审批卡三入口 | `HitlApprovalCard.vue:1-8` 头注 + `ChatView.vue:267` | live hitl.waiting 帧 / replay 重放 / 历史 waiting_approval run 三入口同一内联渲染形态；卡片嵌在消息泡内（`<HitlApprovalCard v-if="message.hitl">`），长消息流被审批卡截断 |
| decide 动作链 | `src/stores/chat.ts:1282-1422` decideHitl | 两步钉死（decide→resume）；幂等 hitlActedRequestIds :1292-1294；409 detail 分类 resumeConflictMessage :1003-1008；resume 200 cursor → chaseResumedRun 自动追帧 |
| chase 器 | `src/stores/chat.ts:978-1168` | 上限 10 次/120s（:979-980）· 递增退避 2s×1.5 封顶 8s（:982-986）· 单链唯一 activeChaseRunId（:1028-1029）——**均已定稿，本 task 不动数值与机制** |
| /hitl 独立页 | `src/views/HitlApprovalView.vue` | 第四审批入口（task_web_hitl_approval_page · 已并入）；自洽消费 `src/api/hitl.ts` 三函数，不消费 replay 补帧；与卡片 resume_mode 文案同语义 |
| 冻结契约 | `src/api/hitl.ts:63-79` | HitlResumeReplay 六键 + HitlResumeResponse 头部 · 只消费禁改 |
| 恢复上次会话路径（v0.3 实证 · 需求①） | `src/views/ChatView.vue:21-25` onMounted · `src/stores/chat.ts:541-553` loadLatestSession · `src/api/chat.ts:20-23` fetchLatestSession | **历史消息零加载**：onMounted 仅调 loadLatestSession → GET /ops/chat/sessions/latest（元数据端点 · 仅 T2 门控 · 非 lg-rag SoT）+ refreshHitlPending；T3（chat.ts:424-429）只自 localStorage 恢复 thread_id + activeRun 游标 + restoredNotice 顶部提示条，messages 空数组起步——「恢复上次会话」现状 = 恢复上下文指针，**不回显任何历史消息**（chat.ts:424 注释自证「仅恢复后端上下文，不回显历史消息」；钉测锁死 tests/chat-store.spec.ts:419） |
| 历史加载截断点（v0.3 实证 · 需求①） | `src/stores/chat.ts:1502` · `src/api/chatHistory.ts:15,109-122` | 唯一历史加载入口 = 手动点面板 openHistoryThread → `fetchThreadHistory(tid)` **无 limit/cursor 参数**（chat.ts:1502 · 钉测锁死 tests/chat-store-hitl.spec.ts:546 `toHaveBeenCalledWith('t-9')`）→ 服务端默认 limit=20 生效（chatHistory.ts:15「分页：cursor/limit（服务端默认 20 · 上限 100 · 超限 422）」）→ **next_cursor 丢弃、无翻页循环**（chat.ts:1505 只取 page.runs）——截断点钉案 = 自动路径 0 条、手动路径 ≤ 服务端默认首页 20 runs，超出静默丢失 |
| 对话历史入口现状（v0.3 实证 · 需求②） | `src/components/chat-history/ChatHistoryPanel.vue` · `src/views/ChatView.vue:18-19,87-113` · `src/router/index.ts:56-91` | 列表数据源**已在仓在消费**：ChatHistoryPanel 消费 fetchChatThreads（cursor 分页 + 去重追加 :54-58 · 空态 data-test="chat-history-empty" :96），内嵌 ChatView 左侧栏、**默认收起**（historyOpen=false :19 · F-B 裁定），头部「历史/收起历史」toggle（data-test="history-toggle" :105-113）；选中闭环已在（onSelectHistory :87-90 → openHistoryThread 含 stopStreaming 中断 + waiting_approval 挂起）；路由 = AppLayout 平铺 children，**仓内零 el-tabs 先例**（grep 零命中），/hitl 平铺路由为先例（router/index.ts:84-91）——需求② = 入口形态重构，**非数据源新建** |
| 旧测影响面（v0.1 初扫 · v0.2 按 R1-B1 实证补全） | `tests/chat-view.spec.ts:101-296` | 六处直钉消息流内 `[data-test="hitl-card"]` 渲染位置/动作钮（浮层化必动 · view 侧必适配浮层）；`tests/chat-store-hitl.spec.ts` hitl.note 双落点/收官钉面 :991（TC6 终帧收官 note=「已批准」）,:1037-1038（TC7 note+resumeHint 双腿）,:1095（TC-U1 上限降级 note 整测）,:1102-1131,:1283,:1307；`tests/chat-store.spec.ts:801-816` 钉 replay 空流 resumeHint 文案（空泡修复相邻面）；`tests/chat-store.spec.ts:657`（**条件命中 · 依 D1 定稿形态**：`resumeFromCursor()` 后、replay 帧到达前断言 `expect(chat.messages).toHaveLength(3)` 锁死立即建泡——选延迟建泡则适配（改钉与改码同 PR 可见 · 理由注明行为语义由立即建泡改延迟建泡 · **禁静默改钉**），选 onDone 回收则存续）；`tests/hitl-decision-surface-guards.spec.ts` TC13(b):139-179（**条件命中**：钉 useLgRagSse.ts diff 口径——删行仅限 onError 错误面、增行禁触解析段（event_type/payload/FrameParser/.feed(/TextDecoder/ReadableStream）；范围②调查若根因落前端 useLgRagSse，修复 diff 必撞红，预声明处置路径 = 优先绕开解析段修法，否则停并与维护者裁定守卫口径适配，禁即兴改钉；同 file TC3 setInterval 白名单为仓级口径，新浮层组件引入 setInterval 即红）；`tests/hitl-approval-page.spec.ts:19,236` 参照卡片文案（/hitl 页存续则绿）。**预判**：store 侧 hitl.note 钉（上列）在 D3「store/帧管线零改」前提下预期存续零改动；view 侧 `tests/chat-view.spec.ts` 六测必适配浮层。**v0.3 扩扫（历史加载/路由面）**：`tests/chat-store.spec.ts:419` T3「刷新/重进：已存 id 恢复 + 提示条；发送带该 id；**不回显历史消息**」——需求①**必命中**（改钉与改码同 PR 可见 · 禁静默改钉）；`:851-871`（仅 thread_id 无 active-run → T3 恢复提示钉 · 随 D12 重核）；`:63-78`（loadLatestSession 钉 · 存续预期）；`tests/chat-store-hitl.spec.ts:521-780` openHistoryThread 全套，其中 **:546 无参调用钉 `toHaveBeenCalledWith('t-9')` 必适配** D11 分页/翻页形态（其余 waiting_approval 挂起/404·500·501 降级/竞态 :672-682 钉预期存续）；`tests/chat-view.spec.ts:263-380`（历史选择渲染 + history-toggle :311 钉 · D13 tab 形态必适配入口断言）；`tests/chat-history-panel.spec.ts`（面板自身 · D13 复用则存续）；`tests/chat-history-api.spec.ts:112`（cursor 分页参数钉 · 存续）。**预判**：需求①落地后「进入即加载历史」成默认行为，T3 系恢复钉（:419,:851-871）全数重核；router 零新增（D13）故无路由测试新增面 |

## 三、范围

1. **空 replay 不渲染空气泡**（小 · 可独立验收）：resumeFromCursor 路径 replay 干净结束且零新帧（无 content/thinking/subtasks/hitl 任何落墨）时，不产出空 assistant 气泡——实现方向（延迟建泡 / 终态回收空泡）30 定稿红测先行；resumeHint「暂无新进度」兜底文案存续（D1）。
2. **replay 无数据实证调查**（交付 = 调查结论 + 数据链钉案）：实证 `POST /api/ops/lg-rag/replay` 取帧全链（游标来源 → 请求 → 服务端持久化帧 → 前端去重基线 → 渲染），定位维护者实测「没数据返回 / 前后内容被截断」根因（候选：恢复段帧未持久化时序 / after_seq 游标语义 / lastAppliedSeq 吞帧 / hitl.waiting 重放打回卡片的截断观感）。**调查先行**（D8）：根因在前端 → 修复方案随本 task 落地；根因在后端 → 只出观察报告上抛 ops-desk-api（禁改姐妹仓），前端侧按报告结论做防御性处置或不处置。v0.3 扩：与范围④并列为同一「数据链完整性」专题——replay 链五段实证 + history 恢复链三段实证（恢复路径 → 请求参数 → 截断点/翻页完备性）同法同报告结构。
3. **审批浮层化重构**：HITL 审批动作面自消息流内联卡片迁移为**输入区（composer）上方独立浮层**（D2/D3）；三入口形态重裁定（D4）；chase 进度可见落点随迁（D5）；decided 态「续看推进」入口随迁（D6）；/hitl 独立页存续关系裁定 = 存续不动（D7）。
4. **恢复上次会话历史消息加载**（v0.3 · 需求① · 与②同属数据链完整性专题）：进入 Chat 页存在已存 thread_id 时加载该会话历史消息回显（触发点/边界 D12）；加载完备性 = **全量加载或显式分页加载，不再有静默截断**（现状钉案：自动路径零加载 + 手动路径截于服务端默认首页 20 runs）；具体形态（全量翻页循环 vs 显式分页「加载更早」）留 D11 定夺 · **红测先行**；若实证截断根因在后端 API 行为（默认 limit/聚合截断），同样只出观察报告上抛 ops-desk-api 禁改。
5. **对话历史选择 tab**（v0.3 · 需求② · 新 UI 功能）：历史选择入口自「默认收起的内嵌侧栏 toggle」升级为**显式 tab 形态**（入口位置 · 与 /hitl 页关系裁定 D13）；列表数据源 = 既有 fetchChatThreads + ChatHistoryPanel 组件复用（实证：数据源已在仓 · §二 · 无需调查项/降级裁定）；选中切换会话行为 = 复用 openHistoryThread 既有闭环并与范围④全量/分页加载联动（D14 交叉状态裁定）。

## 四、非范围

- 不改后端任何文件；replay/resume/decide 契约与帧形状零触碰（双 freeze 只消费）。
- 不改 chase 上限/退避数值（10 次/120s · 2s×1.5 封顶 8s）与唯一性/幂等机制（前一 task 定稿，本 task 只迁可见落点）。
- 不改 `src/api/hitl.ts` 契约语义；不自造 pending 字段；不自造 resume_mode 第四值。
- /hitl 独立页（HitlApprovalView）功能面不扩、交互不重做（存续关系仅裁定不改码）。
- Chat 页 thread 定位/深链参数（另立 task · 承 approval-page D6）。
- 全局通知中心 / 轮询 / WebSocket（超范围）。
- 不改既有 task 文件（含 active/done 全部）；不改 CI workflow。
- 数据层结构不动：审批态仍挂 `message.hitl`、store 帧管线（processFrame/buildHitlState）零改——本 task 只做**渲染层迁移**（D3）。
- v0.3：不改 loadLatestSession 元数据端点语义（fetchLatestSession 存续 · T2 门控不动）；不新造历史/会话端点（B1 history 既有两端点消费 · chatHistory.ts 契约面只承接禁改）；历史 tab 不做会话管理动作（删除/重命名/搜索超范围）。
- v0.3：需求①若实证截断根因在后端（服务端默认 limit/聚合行为）→ 只出观察报告上抛 ops-desk-api，本 task 不改后端、前端不臆造绕过补偿（防御性处置须报告背书 · 同范围②纪律）。
- v0.3：不新增平铺路由/深链参数（D13 · 与「Chat 页 thread 定位/深链参数另立 task」一致）；/hitl 独立页与历史 tab 无联动重做（D7 存续语义沿用）。

## 五、00 定夺（10 草案裁定 · 维护者可后改 · 10 不得推翻只补可机断措辞）

| id | 定夺 |
|----|------|
| D1 | 空泡修复判据：承接消息**零内容落墨为主判据**（content 空 + thinking/subtasks 空 + hitl null；runTerminalStatus 等元信息落墨不计入内容面）且 replay 干净结束——onDone 无终帧为典型场景，replay 携终帧（done 仅元信息）但零内容落墨同属本判据、不逃逸（R1-N1）→ 该 assistant 泡不渲染/回收；resumeHint「暂无新进度，稍后再点『续看』」存续。实现形态（延迟 pushMessage vs onDone 回收）30 定稿，红测先行；选延迟建泡须按 §二预裁定处置 `tests/chat-store.spec.ts:657` 旧钉（改钉与改码同 PR 可见 · 禁静默改钉）。 |
| D2 | 浮层位置：ChatView 输入区（`footer.chat-page__composer` :310-338）**上方**独立浮层；非消息流内、非全屏模态、不遮输入；消息流内不再渲染审批动作面。 |
| D3 | 数据层不动：审批态仍挂 `message.hitl`，store/帧管线零改；浮层从「当前最新 hitl 态消息」取数渲染（单一数据源 · 无第二份审批状态）。 |
| D4 | 三入口形态：live/replay/历史 waiting 审批**同一浮层形态**零分叉；历史已决（decided/resolved/forbidden/unavailable）在消息流保留**轻量只读收尾标记**（一行 note · 无动作钮），保证历史可读且消息流不被动作卡截断。 |
| D5 | chase 进度落点随迁：hitl.note 卡片内落点消失后，进度/降级文案落点 = **浮层进度区** + `resumeHint` 页底提示条（双落点语义存续 · 数值机制不动）；超限降级「恢复仍在进行，可稍后手动续看」文案语义不变。**浮层进度区数据源点名 = 当前最新 hitl 态消息的 `hitl.note`**（showProgress 落点 `src/stores/chat.ts:1041-1045` 写入 · R1-N3：禁止另造 store 进度字段违 D3）。 |
| D6 | decided「续看推进」入口：迁入浮层（decided + canResume 时呈现）；resumeNotice/错误条既有「续看」入口不动。 |
| D7 | /hitl 独立页存续：第四入口不变、功能面不动；浮层 = Chat 页内审批面的形态重构，两者消费同一冻结契约零分叉。 |
| D8 | 调查先行：范围②实证结论先于与其耦合的修复定稿；根因在后端 → 观察报告落盘 invoke 留档并上抛，本 task 不改后端。 |
| D9 | 图谱/wiki：不新增一级模块；30 交付时两份 flow yaml 增量 + graph-compile 绿 + volatile 短注（graph_delta_note / wiki_delta_note）。 |
| D10 | 浮层落位与共存/交互通则（R1-B2 封闭 · v0.2 新增）：①**与既有提示条带共存**——ChatView 错误条（ChatView.vue:274-292）/ resumeHint 条（:293）/ hitlPending 提示（:294-302）/ interrupted·lastDone 行（:303-308）保持原位，浮层恒居**条带区之下、composer 正上方**（最贴近输入区），纵向并列、互不覆盖；②**不遮消息流尾部**——浮层不覆盖消息列表，浮层出现/消失不改消息流自动滚动语义（不新增滚动逻辑 · 自动滚动不互踩）；③**窄屏通栏降级**——浮层 100% 宽通栏呈现，不横向溢出、不遮 composer；④**streaming 中控件禁用随迁**——浮层动作控件（批准/驳回/resume_mode 三选）禁用态沿用卡片既有 view 层绑定语义 `:disabled="chat.streaming"`（HitlApprovalCard.vue:55/:63/:76）：该禁用是 view 层绑定、不在 store 分态内，failure_paths「decideHitl 分态零改」覆盖不到渲染层禁用态，须显式随迁。 |
| D11 | 恢复加载完备性形态（v0.3 · 需求①封闭）：进入 Chat 页存在已存 thread_id 时**自动加载历史**（触发点 = onMounted · 复用 openHistoryThread 数据链抽取共用实现 · 不复制第二份映射逻辑）；完备性默认形态 = **全量翻页循环**（fetchThreadHistory 携 cursor 至 next_cursor=null · limit 上限 100 内取值）；若 30 实证大会话（数十页 runs）性能/渲染不可行 → 降级 = 显式分页「加载更早」+ 可见「还有更多」指示——**两形态都必须消除静默截断**；红测先行（多页 mock 截断钉测先于改码）；既有 `tests/chat-store-hitl.spec.ts:546` 无参调用钉随形态适配（同 PR 可见 · 禁静默改钉）。 |
| D12 | 恢复边界（v0.3）：仅当 localStorage 已存 thread_id 时自动加载（无 thread_id = 新用户/新会话后 · 零加载零打扰）；loadLatestSession 元数据调用存续不动；restoredNotice 提示条存续（文案随「真恢复历史」语义调整 · 不删条）；active-run 续看「不自动 replay」语义存续——历史加载 ≠ 续看追帧，waiting_approval thread 挂起语义沿用 openHistoryThread 既有闭环（last_seq=0 从头 replay 由手动续看触发）。 |
| D13 | 历史 tab 入口形态（v0.3 · 需求②封闭）：**Chat 页内 tab 形态**承载——「对话 | 历史」双 tab（data-test 落点 · 仓内零 el-tabs 先例故组件形态 30 定稿 · Element Plus el-tabs 或自绘 tab 条均可 · 水墨风存续）；历史 tab 内**复用既有 ChatHistoryPanel 组件**（threads 列表 + cursor 分页「加载更多」+ FP-F8/F10 降级文案零重写）；**不新增平铺路由**（/hitl 平铺先例不复制 · 深链面不入本 task）；与 /hitl 独立页关系 = 存续不动（D7 语义沿用 · 无联动重做）；既有「历史/收起历史」侧栏 toggle（history-toggle）由 tab 形态取代或保留为窄屏降级 · 30 定稿（旧钉 tests/chat-view.spec.ts:311 随形态适配 · 同 PR 可见）；入口具体落位（页头 tab 条位置/样式）维护者可后改。 |
| D14 | tab 切换/恢复加载与 streaming·chase 交叉（v0.3）：选中历史会话沿用 openHistoryThread 既有 stopStreaming 中断语义（chat.ts:1503 · chase 定时器链随清理不泄漏）；进入页自动历史加载与在途流不并存（刷新后 streaming 必 false · active-run 只挂续看条不自动 replay · D12）；chase 进行中切 tab 不另造暂停语义；浮层（D2/D10）数据源 = 当前最新 hitl 态消息，切会话/历史重载后浮层随 messages 随迁，**不残留上一会话审批面**。 |

## 六、依赖

- `src/stores/chat.ts:978-996`（chase 常量 + parseReplayCursor）· `:1010-1168` chaseResumedRun 全段 · `:1175-1250` resumeFromCursor 全段（:1183 空泡根因候选）· `:1282-1422` decideHitl 全段 · `:435-438` resumeNotice/resumeHint
- `src/components/chat/HitlApprovalCard.vue`（179 行全量 · 三入口内联渲染形态 :1-8 · resume_mode 三选 :49-60 · 续看推进 :85-93）
- `src/views/ChatView.vue`（:267 内联卡片挂载点 · :310-338 composer · :293 resumeHint 提示条 · :177-271 气泡渲染无判空）
- `src/views/HitlApprovalView.vue`（/hitl 独立页 · 存续裁定对象）
- `src/api/hitl.ts:63-79`（HitlResumeReplay/HitlResumeResponse 冻结只消费）· `src/composables/useLgRagSse.ts:112,161-166`（replayLgRag 数据链）
- 旧测影响面：`tests/chat-view.spec.ts:101-296` · `tests/chat-store-hitl.spec.ts:991,:1037-1038,:1095,:1102-1131,:1283,:1307`（hitl.note 钉面归并 · R1-B1 补全）· `tests/chat-store.spec.ts:801-816` + `:657`（条件命中 · 依 D1 形态预裁定见 §二）· `tests/hitl-decision-surface-guards.spec.ts` TC13(b):139-179 + TC3 setInterval 白名单（条件命中 · 范围②/新组件口径预声明）· `tests/hitl-approval-page.spec.ts`
- v0.3 新增：`src/views/ChatView.vue:18-25,87-113`（historyOpen 侧栏态 + onMounted 入口 + onSelectHistory）· `src/components/chat-history/ChatHistoryPanel.vue`（全量 · fetchChatThreads 分页去重 :54-58）· `src/api/chatHistory.ts:15,90-122`（分页契约「服务端默认 20 · 上限 100 · 超限 422」+ fetchThreadHistory 参数面）· `src/api/chat.ts:20-23`（fetchLatestSession 元数据端点 · 存续不动）· `src/stores/chat.ts:424-429,541-553,1497-1544`（T3 恢复指针 + loadLatestSession + openHistoryThread 截断点 :1502）· `src/router/index.ts:56-91`（平铺 children · /hitl 先例 · 零新增 D13）
- 前序（只读参照）：`docs/tasks/done/task_web_hitl_resume_chase_ux.md`（chase 机制定稿 · 进度双落点与卡片形态冲突裁定背景）· `docs/tasks/active/task_web_hitl_approval_page.md`（/hitl 页 · 已并入 · 本 task 不动该文件）

## 验收标准

- [ ] 1. 空泡钉测：resumeFromCursor 路径 replay 干净结束零新帧 → messages 不新增空 assistant 泡（断言无「零落墨」泡残留）且 resumeHint=「暂无新进度，稍后再点『续看』」存续；chase 超限降级 → 点「续看推进」零帧同钉；replay 有新帧路径不回归（泡正常渲染）。
- [ ] 2. 调查报告：invoke 留档含 replay 数据链钉案（游标来源 → 请求体 → 服务端持久化帧 → 去重基线 → 渲染 五段实证）+ 根因归属裁定（前端/后端）+ 证据（复现步骤/请求响应实录/钉测）；根因前端 → 修复 + 钉测随本 task；根因后端 → 观察报告文件路径在交付说明给出且 src 零对应改动。
- [ ] 3. 浮层钉测：waiting 审批动作面渲染于 composer 上方浮层（组件结构断言 · data-test 落点）而非消息流内；消息流不被审批动作卡截断（历史已决仅轻量只读标记）；live/replay/历史三入口浮层同形态零分叉；resume_mode 三选文案与 `HitlApprovalCard.vue:49-60` 同语义（inherit 不送键）。
- [ ] 4. chase 进度随迁钉测：追帧等待期进度可见落点 = 浮层进度区 + resumeHint（双落点断言）；终帧即消；超限降级文案语义不变；stopStreaming/startNewSession 清理不泄漏（FP-H10 系前作 chase task 编号系 · 可溯 `src/stores/chat.ts:1020` 注释 · 指清理路径存续 · R1-N2 注明出处）。
- [ ] 5. /hitl 页存续：`tests/hitl-approval-page.spec.ts` 全绿不回归；浮层与 /hitl 页消费同一冻结契约（无第二份 decide/resume 封装）。
- [ ] 6. 质量门：`pnpm lint` / `pnpm test` / `pnpm build` 全绿；`./scripts/graph-compile.sh` EXIT=0；`npx spec-wave task lint --file` 本 task PASS。
- [ ] 7. 旧测影响面处置（可机断）：§二「旧测影响面」清单逐项核对——旧钉要么适配浮层/空泡新形态（改钉与改码同 PR 可见），要么显式声明废弃并给出理由；**禁止静默改钉，禁止为保旧钉回退范围**。
- [ ] 8. 恢复全量加载钉测（v0.3 · 需求①）：已存 thread_id 进入 Chat 页 → 历史消息自动加载渲染（messages 非空 · 映射既有 ChatMessage 结构）；多页会话（mock next_cursor 两页以上）→ 全量翻页拉取至 next_cursor=null 或显式分页「加载更早」指示可见（依 D11 定稿形态断言其一）；单页会话不多发请求；无 thread_id 零加载零打扰；加载失败（404/504/网络）→ FP-F8/F10 降级文案 + 主路径可发新问不阻塞。
- [ ] 9. 历史 tab 钉测（v0.3 · 需求②）：tab 入口可见可切（data-test 落点 · 对话/历史双 tab）；历史 tab 内列表 = ChatHistoryPanel 复用（threads 渲染 + 「加载更多」分页存续 + 空态/降级文案存续）；选中条目 → openHistoryThread 闭环（消息渲染 + waiting_approval 挂起 + D11 形态全量/分页加载联动）；/hitl 页存续不回归（tests/hitl-approval-page.spec.ts 全绿）。
- [ ] 10. 交叉状态钉测（v0.3）：streaming/chase 中选中历史会话 → 在途流中断（stopStreaming 语义）+ chase 定时器链清理不泄漏；切会话后浮层不残留上一会话审批面；恢复加载中发新问不双轨渲染（loading 门控或队列语义 · 依 D11/D12 定稿）。

### 自检结论（执行者）

CLOSE 回填（2026-10-28 · 00 代录 · 维护者授权 m00236 + 「验收通过后再CLOSE」）：

- **逐项验收 1–10**：40 独立验收全 ✅（invoke_20261028_40_verify.md）：①sawInk 五型落墨判定+onDone 回收+resumeHint 存续 ②调查②报告五段链钉案+PG 实证+上抛后端 ③消息流仅只读标记 ④浮层包装 HitlApprovalCard 零分叉·hitl.note 数据源零改 ⑤chase 随迁浮层·超限降级存续 ⑥三入口同浮层+task lint PASS ⑦hitl-browser-decide-v1 零偏差 ⑧终帧浮层消失不残留 ⑨双 tab 复用面板·router diff=0 ⑩自动加载+historyLoading 门控。
- **三门实跑**（npx pnpm@10.32.1 钉版 · 40 复跑与 30 一致）：lint EXIT=0 · test EXIT=0（334 passed/1 skipped/34 files · skip=guards TC13(b) diff 空留痕预期）· build EXIT=0 · ./scripts/graph-compile.sh EXIT=0。
- **根因实证结论**（范围②调查）：后端面 · 时序窗口非丢数据——PG 实证 run 38cb1138 seq 1-19 连续无洞，恢复段后台异步实测 68–289s（router.py 自承 130–310s）> chase 预算 56s，在写窗口 replay 因 run_stream_closed 合法返回 200 零帧；前端防御（无气泡+resumeHint）已落地，「在写期 replay 409/Retry-After」语义化报告上抛 ops-desk-api 待维护者排期（40 抽查后端引用成立 · 小瑕疵 409 机制实在 event_store.py 非报告所写 sse_replay.py，不影响结论）。
- **旧测处置清单**：chat-store.spec.ts:419 改写/:657 扩展、chat-store-hitl.spec.ts:546 适配、chat-view.spec.ts:311 废止+AC7 六钉适配浮层落点——全部在 commit 6223007 同 commit 带理由注释，独立 grep 零清单外静默改钉；guards TC13(b) 未触（范围②根因在后端 · useLgRagSse 零改动）。
- **冻结面**：src/api/hitl.ts + src/composables/useLgRagSse.ts diff dd537d7..HEAD = 0 行；HitlApprovalCard.vue 仅头注 5 行；/hitl 页与 17 钉存续零改。
- **commit 链**（分支 task/web-hitl-approval-overlay-ux · 本地零 push）：b375ab4 docs(v0.4+审查文+invoke) → 82b19c6 docs(approval-page 遗留档) → 6223007 feat → 2cbd3b3 docs(30 invoke+图谱) → ef13e36 docs(40 invoke) → ff1dbf4 docs(volatile 短注 · D9 补齐 · 40 退回单项关闭)。
- **遗留（确认接受的非阻塞项）**：①后端 replay 在写窗口语义化上抛 api 仓 ②chase 预算 56s<恢复段 68–289s（超限靠手动续看 · 策略面）③大会话加载性能无大样本实证（风险低）。

## failure_paths

- replay 零帧干净结束 → 不产空气泡 + resumeHint「暂无新进度」；用户可再点续看（可重试 · 用户可见提示条）。
- replay 401/404/422/网络错 → 沿用 resumeFromCursor 既有分态（401 清游标跳登录 / 404·422 清 active-run + 中性提示 / 网络错保留可重试）；**空泡回收不得吞掉错误落点**（错误条照常呈现）。
- chase 超限降级 → 浮层进度区 + resumeHint「恢复仍在进行，可稍后手动续看」；active-run 保留不清，手动续看兜底（语义承 chat.ts:1047-1055 不改）。
- 浮层与既有提示条带同屏/遮挡/窄屏/streaming 禁用 → 按 D10 四条通则处置：条带原位共存不互遮 · 不遮消息流尾且自动滚动不互踩 · 窄屏通栏降级 · streaming 中动作控件禁用沿用 `:disabled="chat.streaming"` view 层语义随迁（R1-B2 · 用户无阻塞面）。
- 浮层单一数据源失配（多条 hitl 态消息并存：历史已决 + 当前 waiting）→ 浮层只取**当前最新 waiting/decided** 一条（D3/D4），历史条留消息流只读标记；不并列多浮层。
- decide/resume 各错误分态（409 已处理/404 中性/403 降级/401 跳登录/503 与 stranded 中性错误条）→ 沿用 decideHitl 既有分态零改，仅呈现位置随迁浮层。
- 范围②调查根因在后端 → 冻结：只出观察报告上抛 ops-desk-api，本 task 不改后端、不在前端臆造补偿逻辑（防御性处置须报告背书）。
- v0.3 全量加载性能/大会话渲染（需求①）→ 翻页循环遇大会话（数十页 runs）按 D11 降级路径 = 显式分页「加载更早」+ 首屏最近一页；history 504（History aggregation timeout · `src/stores/httpErrorI18n.ts:7` 映射面已有）→ 「历史服务暂不可用」降级不阻塞 Chat 主路径（FP-F8 语义沿用 · 可重试 · 用户可见提示）。
- v0.3 tab 切换与 streaming/chase 中状态交叉（需求②）→ 按 D14：选中历史会话中断在途流 + chase 定时器链清理；切会话后浮层随 messages 重载随迁不残留上一会话审批面；恢复加载失败不阻塞发新问（FP-F8/F10 文案存续 · 消息流空起步可用）。

## 给执行帽（30）必读

- 需求真值原话：本 task §一（维护者 2026-10-28 · 锚 m00171 + v0.3 第 4 条锚 m00231）；00 定夺 D1–D14（§五 · D10 = 浮层共存/遮挡/窄屏/streaming 禁用随迁通则 · v0.2 新增；D11–D14 = 恢复加载形态/边界 · tab 入口 · 交叉状态 · v0.3 新增）。
- 空泡根因候选：`src/stores/chat.ts:1183` 无条件 `pushMessage('assistant')`；浮层挂载点：`src/views/ChatView.vue:267`（内联卡）与 `:310-338`（composer）。
- 调查先行（D8）：先落 replay 数据链五段实证钉案，再定与其耦合的修复；**不允许不定位直接改**（承前 task「实证先于改码」纪律）。
- 红测先行：先写失败钉测（空泡 / 浮层落点 / 进度随迁），再动 src。
- 旧测影响面：红测先行前先落 §二旧测清单核对；改钉与改码同 PR 可见，禁静默改钉。
- v0.3 实证钉案：恢复路径自动加载 = 0 条（chat.ts:424-429 T3 只恢复指针 · :541-553 元数据端点）；手动历史加载截于服务端默认首页 20 runs（chat.ts:1502 无参调用 + chatHistory.ts:15 默认 20 · next_cursor 丢弃）；历史列表数据源已在仓（ChatHistoryPanel · 零新端点 · D13 复用）。
- 冻结：`src/api/hitl.ts` 与 replay 帧形状只消费禁改；`src/api/chatHistory.ts` 契约面只承接禁改；姐妹仓 ops-desk-api 禁改。

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|-----------|----------------------|----------------|
| R0 | 需求 = 维护者实测两问（空气泡 / replay 无数据 + 审批浮层化）+ 合并态前提 | - | - | - |
| R1 | 现状亲读钉案：空泡根因候选 :1183 无条件 pushMessage；双落点绑卡片与浮层冲突；replay 链路五段可实证 | - | - | replay 无数据根因未实证（前端/后端未定） |
| R2 | 范围三主项切割 + 调查先行原则 + 非范围冻结面切割 | - | - | 浮层历史已决态形态需裁定 |
| R3 | 浮层形态裁定落成 D1–D9（数据层不动 · 渲染层迁移 · 历史已决留只读标记 · /hitl 存续）· v0.2 增补 D10（浮层共存/遮挡/窄屏/streaming 禁用随迁 · R1-B2） | yes（v0.2 时点 · v0.3 新需求 m00231 重开 R4/R5 · 追加轮次非伪造） | 改动面收敛于渲染层（ChatView + 新浮层组件 + store 行为微调），契约/数据层/机制零触碰，D 表已封闭开放点（v0.2 含 D10 浮层共存/遮挡/窄屏/streaming 禁用随迁裁定 · R1-B2 封闭回填）；继续 R4+ 不增新信息（v0.2 时点结论 · v0.3 被新需求证伪重开） | replay 根因归属待 30 实证；D4 历史只读标记形态维护者可后改 |
| R4 | v0.3 新需求实证（m00231 两项）：恢复路径自动加载 = 0 条（onMounted → loadLatestSession 元数据端点 · T3 只恢复 thread_id/activeRun 指针）；手动历史加载截于服务端默认首页 20 runs（fetchThreadHistory 无参 · next_cursor 丢弃无翻页）；历史列表数据源已在仓在消费（ChatHistoryPanel 侧栏默认收起 · fetchChatThreads cursor 分页）；仓内零 el-tabs 先例 · /hitl 平铺路由先例 | - | - | 全量翻页性能面待 30 实证（D11 降级路径已预置） |
| R5 | v0.3 形态封闭 D11–D14（恢复加载完备性/边界 · tab 入口 · 交叉状态）+ 范围④⑤ + 非范围补三项 + failure_paths 补两行 + 旧测影响面扩扫（chat-store.spec.ts:419 必动 · chat-store-hitl.spec.ts:546 必适配 · chat-view.spec.ts history-toggle 系必适配）+ graph_delta 重评估（不新增一级模块 · 路由零新增 · HG-GRAPH-MODULES 回签路径存续） | yes | 两项新需求开放点全落 D 表（形态/边界/入口/交叉），数据源全部在仓零新端点，调查纪律沿用 D8；继续 R6 不增新决策 | D11 全量 vs 显式分页最终形态 30 红测定稿；D13 tab 落位维护者可后改；大会话性能降级路径待 30 实证 |

**actual_last_round**：R5（early_stop · v0.3 追加轮次：R3 为 v0.2 时点 early_stop，新需求 m00231 重开 R4/R5）

### R0

维护者 2026-10-28 实测反馈（原话锚 m00171 · 00 转发）：①「10次后无数据返回，点击"续看推进"返回空不要展示一个空对话气泡」；②「replay出来的数据是从哪取出来的，replay没有数据返回，因为审核在对话框中，前后的内容被截断了，把审批作为单独弹窗放在对话框上方」；③环境前提 approval-page 已并入（dd537d7 · 321 绿）。需求 = 两 bug 观感 + 一交互重构，落一个新 task 承接。

### R1

亲读钉案（§二）：空泡根因候选 = resumeFromCursor :1183 无条件 pushMessage 先于 replay，零帧干净结束时 onDone 只设 resumeHint 不回收空泡；ChatView 气泡容器无判空。审批卡内联于消息泡（ChatView.vue:267），chase 进度双落点之一 hitl.note 绑死卡片形态——浮层化必须随迁。replay 数据链五段（游标来源 → 请求 → 服务端持久化帧 → lastAppliedSeq 去重 → 渲染）全部可前端实证。「没数据返回」不能未实证先改 → 立范围②调查先行。

### R2

范围三主项切割（§三）：①空泡（小 · 可独立验收）②调查（交付=钉案报告 · 根因归属定修复走向）③浮层化（渲染层迁移）。非范围冻结面：契约/数值机制/数据层/姐妹仓/既有 task 文件全切出（§四）。与刚 CLOSE 的 chase task 重叠区（showProgress 双落点 vs 卡片形态）裁定点 = D5 随迁。

### R3

浮层形态封闭为 D1–D9：数据层不动（D3）消掉帧管线回归面；三入口同浮层 + 历史已决留只读标记（D4）兼顾「消息流不被截断」与历史可读；/hitl 页存续不动（D7）消掉第四入口回归面；调查先行（D8）兜底根因在后端的情形。early_stop：开放点已全落 D 表，R4+ 不增新决策。

v0.2（R1 退回回填）：B2 指出的浮层新风险面（与既有条带共存层叠 · 遮挡消息流尾/自动滚动 interplay · 窄屏 · streaming 中渲染层控件禁用随迁）封闭为 **D10** 并同步补 failure_paths 行——early_stop 理由「开放点已全落 D 表」据此补强成立（D 表 = D1–D10）。

### R4 · v0.3 新需求实证（2026-10-28 · m00231 重开）

维护者 R2 通过后追加两需求（原话锚 m00231 · 00 转发 · §一第 4 条）：①「修改展示，恢复上次会话加载所有历史消息」②「增加对话历史选择tab」。R3 early_stop 为 v0.2 时点结论，新需求重开本轮（追加轮次 · 非伪造）。

亲读实证钉案（§二新增三行）：

- 需求①恢复路径：`src/views/ChatView.vue:21-25` onMounted → `loadLatestSession`（`src/stores/chat.ts:541-553`）→ `fetchLatestSession` GET /ops/chat/sessions/latest（`src/api/chat.ts:20-23` · 元数据端点 · 仅 T2 门控）→ **历史消息零加载**；T3（chat.ts:424-429）只自 localStorage 恢复 thread_id/activeRun 指针 + restoredNotice 提示条，messages 空起步。唯一历史加载 = 手动 `openHistoryThread`（chat.ts:1497-1544）→ `fetchThreadHistory(tid)` **无 limit/cursor 参数**（:1502）→ 服务端默认 limit=20 生效（chatHistory.ts:15「服务端默认 20 · 上限 100 · 超限 422」）→ next_cursor 丢弃无翻页循环（:1505）。「现在到底加载多少、截断点在哪」钉案 = **自动路径 0 条；手动路径 ≤ 服务端默认首页 20 runs，超出静默丢失**。需求①与范围② replay 链同属「数据链完整性」专题（恢复段 = replay 链 + history 链双链），同法实证、同报告结构；若截断根因在后端 API 行为 → 报告上抛 ops-desk-api 禁改。
- 需求②历史 tab：列表 API **已在仓在消费**——`fetchChatThreads`（`src/components/chat-history/ChatHistoryPanel.vue:12,38` · cursor 分页 + 去重追加 :54-58）；入口现状 = ChatView 内嵌侧栏**默认收起**（ChatView.vue:19 · F-B 裁定 · history-toggle :105-113）；选中闭环已在（:87-90 → openHistoryThread）；`src/router/index.ts` = AppLayout 平铺 children，仓内零 el-tabs 先例（grep 零命中），/hitl 平铺路由先例（:84-91）。结论：需求② = **入口形态重构**，非数据源新建——无「列表 API 不存在 → 降级/非范围」情形，范围按全量 UI 落地 + D13 封闭入口形态。

### R5 · v0.3 形态封闭（D11–D14 · early_stop）

- D11 恢复加载完备性：自动触发 + **全量翻页循环为默认形态**（cursor 至 null · limit ≤100），大会话性能不可行时降级显式分页「加载更早」+ 可见指示——两形态都必须消除静默截断；红测先行；chat-store-hitl.spec.ts:546 无参钉随形态适配（同 PR 可见）。
- D12 恢复边界：仅已存 thread_id 触发；loadLatestSession 存续；restoredNotice 存续调文案；active-run「不自动 replay」语义不动（历史加载 ≠ 续看追帧）。
- D13 tab 入口：Chat 页内「对话 | 历史」双 tab 复用 ChatHistoryPanel（数据源/分页/降级文案零重写）；不新增平铺路由；/hitl 存续（D7 沿用）；history-toggle 去留 30 定稿（旧钉适配同 PR 可见）；落位维护者可后改。
- D14 交叉状态：选中历史沿用 stopStreaming 中断 + chase 清理（chat.ts:1503）；自动加载与在途流不并存；浮层随会话切换随迁不残留上一会话审批面。
- 范围扩 ④⑤、非范围补三项、验收补 8–10、failure_paths 补两行（全量加载性能/大会话 · tab×streaming/chase 交叉）。旧测影响面扩扫：tests/chat-store.spec.ts:419「不回显历史消息」钉需求①**必动**（改钉与改码同 PR 可见 · 禁静默）；:851-871 T3 恢复提示钉重核；chat-view.spec.ts:263-380 历史选择/history-toggle 钉随 tab 形态必适配；chat-history-panel.spec.ts 复用则存续；router 零新增无路由测试新增面。
- graph_delta 重评估：tab 在 ChatView/pages + components/chat-history 既有面内（01_modules.md:16 已有 chat-history 条目）、router 零新增 → **不新增一级模块结论存续**，HG-GRAPH-MODULES 回签路径不变；flow 增量 = 10_flow_chat.graph.yaml（恢复全量加载 + tab 形态）。
- early_stop：两项新需求开放点全落 D 表（形态/边界/入口/交叉），数据源全部在仓零新端点，调查纪律沿用 D8；R6 不增新决策。

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-28 | v0 · 10-task 落稿：需求真值原话锚 m00171 + 现状钉案（空泡根因候选 chat.ts:1183 · 双落点冲突 · replay 五段链 · 旧测初扫）+ 范围三主项 + 非范围八项 + D1–D9 定夺 + R0–R3 early_stop · 三闸 pending · 未改 src/未切分支/未 commit |
| 2026-10-28 | v0.1 · 维护者签 HG-TASK-DRAFT（00 代录 · 本窗指令「签收」）· 其余两闸仍 pending |
| 2026-10-28 | v0.2 · R1 审查退回回填（reviews/task_web_hitl_approval_overlay_ux_audit_R1_20261028.md）：**B1** §二/§六旧测影响面实证补齐三处（`tests/chat-store.spec.ts:657` 条件命中+D1 形态预裁定 · `tests/chat-store-hitl.spec.ts` hitl.note 钉面归并补 :991,:1037,:1095 · guards TC13(b):139-179/TC3 条件命中预声明处置路径）+ 存续/适配预判注；**B2** 浮层新风险面封闭 = 新增 D10（条带共存层叠 · 不遮消息流尾/自动滚动不互踩 · 窄屏通栏 · streaming 控件禁用随迁）+ failure_paths 补行 + R3 early_stop 措辞补强；**NIT×5 全采纳**（N1 D1 判据零内容落墨主条件化 · N2 FP-14 悬指勘误+FP-H10 注明前作出处 · N3 D5 点名 message.hitl.note 数据源 · N4 m00171 锚父窗核验边界声明 · N5 闸表 22-R1→20-R1）· 三闸状态不动（HG-TASK-DRAFT=approved · HG-AUDIT-R1/HG-GRAPH-MODULES=pending）· 未改 src/未切分支/未 commit |
| 2026-10-28 | v0.3 · 维护者 R2 通过后追加两需求（原话锚 m00231 · 00 转发）：①恢复上次会话加载所有历史消息 ②增加对话历史选择 tab。§一补第 4 条原话；§二新增三行实证钉案（恢复路径零历史加载 chat.ts:424-429,541-553 · 手动历史加载截于默认首页 20 runs chat.ts:1502+chatHistory.ts:15 · 历史数据源已在仓 ChatHistoryPanel 侧栏默认收起 + 仓内零 el-tabs 先例）+ 旧测影响面 v0.3 扩扫（chat-store.spec.ts:419 必动 · chat-store-hitl.spec.ts:546 必适配 · chat-view.spec.ts history-toggle 系必适配）；范围扩④⑤ + 非范围补三项；D 表新增 D11–D14（恢复加载完备性默认全量翻页可降级显式分页 · 恢复边界 · Chat 页内双 tab 复用面板不新增路由 · 交叉状态中断语义）；验收补 8–10；failure_paths 补两行（全量加载性能/大会话 · tab×streaming/chase 交叉）；思考轮 R4/R5 启用（R3 early_stop 为 v0.2 时点 · 追加轮次非伪造 · actual_last_round=R5）；graph_delta 重评估 = 不新增一级模块存续（01_modules.md:16 已有 chat-history 条目 · router 零新增 · HG-GRAPH-MODULES 回签路径不变）；HG-AUDIT-R1 注记须增量复审后再签 · 三闸状态不动（HG-TASK-DRAFT=approved · 其余 pending）· 未改 src/未切分支/未 commit |
| 2026-10-28 | v0.4 · 00 代录双闸（维护者授权 m00236「授权00签收后续文档」· 承 m00230 先例）：HG-AUDIT-R1=approved（R1→v0.2→R2→v0.3→R3 审查链闭环 · R3 通过+NIT×1 随签带交 30）· HG-GRAPH-MODULES=approved（不新增一级模块 · flow 增量+graph-compile 绿为 30 验收硬条件）· 30 解锁（切分支 task/web-hitl-approval-overlay-ux · 红测先行）· 未改 src/未 commit |
| 2026-10-28 | v1.0 · CLOSE（00 代录 · 维护者授权 m00236+「验收通过后再CLOSE」· close_pr_policy=required 偏差授权全程本地零 push/PR）：30 交付五项范围全 ✅（commit 6223007）→ 40 独立验收逐项 1–10 ✅ 三门绿 退回单项 volatile 短注 → ff1dbf4 补齐关闭 → task 迁 done/ · 状态 draft→done · 自检结论回填 · 遗留三项非阻塞记录 |
| 2026-10-28 | v1.1 · 维护者 CLOSE 后签收确认（本窗指令「当前任务签收」· 00 代录）· 交付形态（浮层审批/全量历史回显/对话|历史双 tab）维护者验收认可 · 遗留上抛项转入 api 仓 replay 优化 task 起草 |
