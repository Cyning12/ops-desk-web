# 20-task-audit R1 审查：task_web_chat_history_hitl_ux（web-chat-history-hitl-ux）

> **hat**：20-task-audit（task 书面审 · 不实现 · 不改 task 实质内容 · 不代签 human_gate）
> **审查对象**：`docs/tasks/active/task_web_chat_history_hitl_ux.md`（active · draft · HG-TASK-DRAFT/HG-AUDIT-R1=pending）
> **关联 invoke**：`docs/harness/invokes/by-task/web-chat-history-hitl-ux/invoke_20261004_10_web-chat-history-hitl-ux.md`（10-task 留档 · 与 task 落盘一致）
> **日期**：2026-10-04 · **轮次**：R1
> **对照真值（全部真读）**：signed SPEC `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md` · SPEC R1 审查文 `docs/harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_20261004.md`（pass · nit N1/N2）· 上游只读契约 `ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md` + `ERRATA-..._20260930.md`（存在性已核）· 上游 task `task_chat_history_api.md`（B1 · ready · 三闸 approved）· `task_hitl_browser_decide.md`（B2 · ready · 三闸 approved）· 本仓 `src/stores/chat.ts` / `src/composables/useLgRagSse.ts` / `src/api/http.ts` / `src/views/ChatView.vue` / `src/api/` 目录 / `src/components/`（不存在实测）· 旧测面 `tests/chat-store.spec.ts`
> **分支实测**：`task/chat-history-hitl-ux`（本帽未切分支 · 未改 src/ · 未改 task）

## 判定：**fail**（内容阻塞 2 条 · 退回 10-task 补列 · 均为小回填）

- **内容**：范围/非范围/验收映射/FP/依赖/思考轮/锚点 **全部核对通过**；但 ① 行为变更类 task 缺「旧测 grep 影响面」验收项（K7 · 与上游 B1 task R1 退回先例同型）；② AC3 钉死的 grep 断言形态与现状基线不符（会假红）。两条均须 10-task 回填后交 R2。
- **流程闸**：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-JOINT-DEBUG 均 **pending**（未代签 · 与本帽判定一致，维持 pending）。

---

## 一、核对表

### 1. 范围 F1/F2 与 SPEC 一致性（无越界）

| SPEC §3 | task 承接 | 结果 |
|---|---|---|
| F1-1 B1 client（`src/api/chatHistory.ts` · 字段族逐键对齐） | F1-1 逐字承接 + 显式列字段族（thread_id/title/last_activity_at/run_count/latest_run_status + cursor；history 视图 query/answer/subtasks/terminal_status/hitl + answer_truncated） | ✅ |
| F1-2 侧栏 UI（裁定 F-B 内嵌 · 不新开路由） | F1-2 承接 + 仓内实证注记（`src/components/` 不存在 · 内嵌 ChatView 或新建目录则图谱补注）——本帽实测 `ls src/components` 不存在，属实 | ✅ |
| F1-3 历史渲染映射既有 ChatMessage（裁定 F-C） | F1-3 承接（query→user · answer→assistant · subtasks · terminal_status/hitl→末态/审批卡片 · answer_truncated 截断标记） | ✅ |
| F1-4 续看复用 T4（不新造） | F1-4 承接（`resumeFromCursor`/`replayLgRag` `{run_id, after_seq}`） | ✅ |
| F2-1 `hitl.waiting` 新 case → 内联审批卡片（裁定 F-A） | F2-1 承接（reason + 申请 id + 双按钮） | ✅ |
| F2-2 B2 client（`src/api/hitl.ts` · resume 只封装） | F2-2 承接（fetchHitlPending/decideHitlRequest/resumeHitlRequest） | ✅ |
| F2-3 decide→resume 两步链式 | F2-3 承接（契约钉 decide 不自动 resume · loading 防重） | ✅ |
| F2-4 done 按 status 分支修 bug（`chat.ts:621-633`） | F2-4 承接 + **增补 SPEC 建议②**：`chat.ts:308`/`:631` T4 注释同步更正 | ✅ |
| 越界检查 | 全局面板显式列入非范围第十条（裁定 F-A S2 弃选 · 留作后续另立 task）；无 WS/轮询；无新路由 | ✅ 无越界 |

### 2. 非范围（照 SPEC §4 锁死）

✅ 十条全列且逐条对应 SPEC：改 api 仓 · 新 SSE 事件/改帧语义/改传输解析层 · OA 签名面（requests/runtime/callback 明列）· 后端端点语义 · 历史删改重命名 · WS 推送/轮询定时器 · 新造续看机制/端点 · chat legacy 410 亡端点 · decide 合并 resume · 全局 pending 面板（SPEC 九条 + F-A S2 弃选项 = 十条，与 task R1 思考轮自述一致）。

### 3. 验收映射（SPEC AC1–AC15 全覆盖 + N1/N2 回填）

| 项 | 核对结果 |
|---|---|
| AC1–AC15 映射 | ✅ 逐条对拍 SPEC §7：AC1 徽标 · AC2 历史渲染非完成态 · AC4 空态/降级标题 · AC5 分页不重不漏 · AC6 截断标记 · AC7 审批卡片 · AC8 decide 先于 resume 双调用 · AC9 409/404/401/403 分态 · AC10 done 按 status 逐分支（修 bug 钉死）· AC12 字段族逐键不自造 · AC13 404 降级不阻塞主路径 · AC14 lint→test→build · AC15 G-L1 + graph-compile + HG-GRAPH-MODULES——全部可 Vitest/命令级机断，无自造字段 |
| N1 回填（AC16） | ✅ `fetchHitlPending()` 消费点钉死两处：① decide/resume 动作链后刷新（FP-F2）② 进入 waiting_approval thread 一次性核对（**不轮询** · 403/404 静默降级）；附 grep 断言无 `setInterval` 新增——落在契约冻结面内（B2 pending 端点在 SPEC §2），裁定合理、不越界 |
| N2 回填（AC3/AC11 断言形态） | ⚠️ AC11 形态钉死正确（merge-base diff 空断言 + 文件内无 `hitl` 字面 · 本帽实测基线成立：`grep -n "hitl" src/composables/useLgRagSse.ts` 无命中）；**AC3 第二条 grep 形态与基线不符**——详见阻塞 B2 |
| AC3 第一条 | ✅ `grep -rln "replayLgRag" src/ \| wc -l` 本帽实测 = 2（`useLgRagSse.ts` 定义 + `chat.ts` 消费），基线属实 |

### 4. failure_paths（FP-F1~FP-F12 实现层处置）

✅ 12 条全量映射且落点真实：FP-F1 修现状 bug（waiting_approval 保留 active-run + 待审批视觉 · 必修）· FP-F2 409 卡片态不弹错误条 + fetchHitlPending 刷新 · FP-F3 401（SSE 沿用 `chat.ts:687-692/797-802` 实测一致 · REST 走 http.ts 拦截器）· FP-F4 403 降级不炸屏 · FP-F5 replay 中断分态（网络/超时重试 · 404/422 清场中性提示 · 锚点 :793-822 实测一致）· FP-F6 空态/标题降级 · FP-F7 decide 后未 resume 卡片可再触发 · FP-F8 端点未上线降级不阻塞主路径 + mock 先行 · FP-F9 分页/截断 · FP-F10 404 中性不泄露 · FP-F11 requests 空降级卡片 · FP-F12 未签 HG-AUDIT-R1 拒开工。

### 5. 人工闸表

✅ 四闸齐：HG-TASK-DRAFT（blocks 20-R1, 30）· HG-AUDIT-R1（blocks 30 · pending 拒开工）· HG-GRAPH-MODULES（blocks 30 · 随 30 交付签录）· HG-JOINT-DEBUG（blocks merge · blocked_by api · **未联调不假 CLOSE** 明写）——均 pending，无代签；闸说明与 SPEC 头部「维护者授权 00 签收过程文档闸」留痕一致，先置 pending 走 20 流程的做法合规。

### 6. wiki_delta / 思考轮 / 30 要点 / 依赖时序

| 项 | 结果 |
|---|---|
| wiki_delta | ✅ `docs/coding_wiki/volatile.md`（非 n/a · 文件实测存在 · 短注 + 真值指针风格符合 WikiTrack 约定） |
| 思考轮 R0–R5 | ✅ 控制表 + 逐轮回填闭合 · early_stop=no · residual_risks 如实登记（api 端点未上线 → 联调阻塞 merge · HG-JOINT-DEBUG 兜底）· R2 不重开 SPEC 裁定 F-A/F-B/F-C、N1 裁定留痕 |
| 30 实现要点 | ✅ 10 条 · 含 T4 注释同步更正（`chat.ts:308`/`:631` · 第 3 条）· 标注「建议非钉死 · 语义以范围表为准」 |
| 依赖时序 | ✅ 后端 B1/B2 ready（三闸 approved 2026-09-30 本帽真读两 task 头部核实）· 端点实现进行中 → mock 契约先行不阻塞 30 · 联调 blocked_by api（FP-F8 运行时降级兜底） |

### 7. file:line 锚点真实性抽查（本帽独立真读复核 · 不引 SPEC R1 结论）

| task 声明 | 实测 | 结果 |
|---|---|---|
| switch 六分支 run.start:525 / node.progress:537 / subtask.progress:544 / answer:604 / done:621 / error:634 · default:647-650 静默忽略 | 逐行对拍一致 | ✅ |
| done:621-633 不看 status · streaming=false:628 · clearActiveRun():631（含 T4 行内注释「run 终态即清除」） | 逐行对拍一致 | ✅ |
| T4 注释 :308「run 终态（done/error/abort）即清除」 | :308 一致 | ✅ |
| clearActiveRun :461-465 · extractFrameCursor :476-495 · processFrame :503-521 | 全部一致 | ✅ |
| resumeFromCursor :768-843 · replay onError 401/404/422 :793-822 · live 401 :687-692 | 全部一致 | ✅ |
| useLgRagSse.ts:21-31（event_type: string）· 解析透传 :81-101 · LG_RAG_REPLAY_PATH :107 · replayLgRag :150-155 | 逐行对拍一致 | ✅ |
| http.ts:47-51（baseURL `/api` · withCredentials）· setUnauthorizedHandler/401 拦截 :62-78 | 一致 | ✅ |
| `src/api/` 现有十 client | 实测 10 文件全中 | ✅ |
| `src/components/` 不存在 · ChatView 单列 860px · 提示条/错误条/续看按钮区 | 实测一致 | ✅ |
| `grep -rln "replayLgRag" src/` = 2 · useLgRagSse.ts 无 `hitl` 字面 | 实测成立 | ✅ |

锚点抽查 10/10 通过，无虚构行号。

---

## 二、阻塞项（内容 · 退回 10-task 补列）

- **B1 · 缺「旧测 grep 影响面」验收项（K7 · 行为变更类 task 必备）**。F2-4 改造 `done` 终态处理语义（waiting_approval 不再清 active-run），属行为变更类 task；按 checklist 纪律验收须含「旧测 grep 影响面」清点项，本 task AC1–AC16 未列。**同型先例**：上游 `task_chat_history_api.md` R1 即因唯一阻塞「缺旧测 grep 影响面」退回 10-task（见其修订记录 2026-09-30）。本帽实测旧测面：`tests/chat-store.spec.ts` 多处注入 `event_type:'done'` 帧并断言 `activeRun` 清除（:585-651 · :792-805 · :890/:928/:977/:1003 等）；**所注入 done 帧均无 `payload.status`**，与 AC10「无 status 旧帧 → 维持现行（clearActiveRun）」相容，预期零回归——但须 10-task 把该清点面显式列入验收，供 30/40 回归对拍，防止实现期口径漂移。
- **B2 · AC3 钉死的 grep 断言形态与基线不符（会假红）**。AC3 钉：`grep -rn "lg-rag/replay" src/ | grep -v useLgRagSse | wc -l` = `0`；本帽实测现状即为 `1`——`src/stores/chat.ts:764` 既有文档注释含「POST /api/ops/lg-rag/replay」。该断言在 30 开工前就不成立，验收期必假红或倒逼 30 改无关注释。建议改钉为对**封装定义/调用**的计数形态（如对 `replayLgRag` import 行计数、或排除注释行），或如实注明基线=1（注释）且实现后不得新增第二条封装。

## 三、非阻塞 nit

- **nit a**：AC16 ②「进入含 waiting_approval run 的 thread 时一次性拉取核对」与 FP-F4「fetchHitlPending 403 → 动作隐藏或降级提示」语义一致，但 AC16 写「403/404 静默降级」、FP-F4 写「降级提示」——「静默」与「提示」口径略有出入，建议 10-task 回填时顺手统一为「不炸屏 · 降级呈现」（不阻塞，30 按 FP 表语义执行亦可）。
- **nit b**：HG-TASK-DRAFT 说明行「维护者已授权 00 签收……走流程后签录」表述清晰，但闸表 status 为 pending 期间，task 头部状态行的「维护者已授权」字样可能让下游误以为已可代签——维持 pending 是真值，无需改；仅提示 R2/签录时以闸表为准。

---

## 四、回填清单（退回 10-task）

1. **补「旧测 grep 影响面」验收项**（对照上游 B1 task 验收写法）：清点 `tests/chat-store.spec.ts` 中 done 帧断言面（activeRun 清除/toMatchObject 各点 · 约 :585-651/:792-805/:890/:928/:977/:1003）列入回归，并注明「旧测注入 done 帧均无 `payload.status` · 与 AC10 无 status 分支相容 · subset 安全」；test_strategy_note 可顺带一提。
2. **更正 AC3 第二条 grep 断言形态**：使基线成立（现状 `chat.ts:764` 注释已含 `lg-rag/replay` 字面），改钉封装计数/排除注释/注明基线三选一。
3. （顺手 · 非阻塞）统一 AC16 ②「静默降级」与 FP-F4「降级提示」口径。

回填后交 **20-task-audit R2** 复审。

## 五、HG-AUDIT-R1 建议

**暂不签 · 维持 pending。** 理由：B1/B2 两条内容阻塞未闭合；其余维度（范围/非范围/AC 映射/FP/闸表/wiki/思考轮/依赖/锚点）全部通过，回填量小，预期 R2 可通过。

**本帽不代签**——task 人工闸表四闸维持 pending，待 10-task 回填 + R2 通过后由维护者（或获授权的 00）签录。

## 六、下一棒

**退回 10-task**（禁止附 30 Prompt · HG-AUDIT-R1 仍 pending）：按第四节回填清单修订 task（仅验收节与 AC3 断言形态 · 不动范围/非范围/FP），修订记录追加一行，复跑 `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` 后交 20-task-audit R2。

### 维护者签闸（20 R2 通过后 · 30 前）

```text
- [ ] 已读 R2 审查结论（B1/B2 闭合）
- [ ] 在 task 人工闸表将 HG-TASK-DRAFT / HG-AUDIT-R1 改为 approved（维护者或获授权 00 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt（HG-GRAPH-MODULES 随 30 交付签录 · HG-JOINT-DEBUG 待 api 端点上线联调）

30 Agent 将以 task 表为准；pending 时必须拒开工（FP-F12 · TEMPLATE_30_gate_stop.md）。
```

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-04 | 20-task-audit R1：**fail**（内容阻塞 2 条 · B1 缺旧测 grep 影响面 · B2 AC3 grep 断言形态与基线不符）→ 退回 10-task；范围/非范围/AC 映射/FP-F1~F12/闸表/wiki_delta/思考轮 R0–R5/依赖时序/锚点抽查（10/10）全通过；未代签任何 human_gate · 未改 task 与 src/ 任何文件 |
