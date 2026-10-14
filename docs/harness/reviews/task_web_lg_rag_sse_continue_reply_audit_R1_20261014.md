# task_web_lg_rag_sse_continue_reply 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_lg_rag_sse_continue_reply.md`（D3：History 半截 +「继续回复」新 stream · **非联调**）  
> **审查帽**：20-task-audit（书面审查 · 未改 task 实质 · 未改 `src/` · 未改 api 仓 · **未代签**闸）  
> **日期**：2026-10-14 · **仓态**：分支 `task/web-lg-rag-sse-continue-reply` · cwd=`ops-desk-web`  
> **10 invoke**：`docs/harness/invokes/by-task/web-lg-rag-sse-continue-reply/invoke_20261014_10_task_draft.md`  
> **只读 api**：`../ops-desk-api/docs/tasks/active/task_lg_rag_sse_run_worker.md` ·  
> `../ops-desk-api/docs/harness/invokes/by-task/lg-rag-sse-disconnect-completion/invoke_20261014_00_e3_wave_b_plan.md`  
> **本审查动作**：落盘 reviews + 20 invoke；**禁**附 30 Prompt（`HG-AUDIT-R1`=pending）

---

## 结论与签收

**结论：PASS · 零阻塞**

| 维度 | 结论 |
|------|------|
| task **内容**可执行 | **PASS · 零阻塞**——范围/非范围/CTA 矩阵/FP/TC-W1–W7/思考轮闭合；与 api 产品口径与 `continue_from_run_id` 对齐；本仓锚点亲读核真；**非** joint-check |
| **流程闸**（审查当时） | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES = **pending** → 交维护者签；本帽**未代签** |
| lint 复跑 | `npx spec-wave task lint --file docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` → **LINT: PASS** · EXIT=0 |
| 签收 | **内容签收**（交维护者签 `HG-AUDIT-R1` 后方可下发 30） |

---

## 核对项（硬点）

### 1. 「继续回复」≠ HITL resume · ≠「续看」✅

| 钉死点 | task 落点 | 审查 |
|--------|-----------|------|
| 继续回复 = 同 `thread_id` **新** `/lg-rag/stream` | 完成态矩阵 · F3 · TC-W3 | ✅ 与 wave_b_plan §继续回复 · api 产品口径 #3 · TC-B3 同向 |
| 禁 HITL `/resume` | 非范围 · FP-3 · TC-W2/W3 spy | ✅ |
| 「续看」= T4 `replay` 只读补帧 | 背景缺口 #4 · F2 · FP-5 分词 | ✅ 现状 `resumeFromCursor`→`replayLgRag` 亲读核真；task 保留分词正确 |
| waiting_approval 零改语义 | 完成态行 · 非范围 | ✅ |

### 2. running 勿假续算 ✅

| 钉死点 | task | 审查 |
|--------|------|------|
| `terminal_status=running`：半截可见 · **勿**出「继续回复」 | 完成态矩阵 · F2 · TC-W2 | ✅ |
| 禁 resume / 禁把 replay 标为继续生成 | F2 · FP-2 | ✅ |
| 有 active-run 时「续看」= replay 补帧 | 完成态矩阵 running 行 | ✅ 与 Wave B「worker 仍跑 · History running」一致 |

### 3. 对齐 `continue_from_run_id` ✅

| 钉死点 | task | api 真值 | 审查 |
|--------|------|----------|------|
| body 可选 `continue_from_run_id=<失败/中止 run_id>` | F3/F4 · TC-W3 | run_worker F-C1 · TC-B3 · router Field | ✅ 字段名与 api 已接线一致 |
| freeze 只扩 REST body · 零新 `event_type` | F4 · freeze_id 消费 | wave_b_plan 帧类型表 | ✅ |
| 无 run_id 时降级 | FP-4 · 30 钉一字面 | 可选字段语义 | ✅ 可执行 |

**现状缺口核真（web）**：`StreamLgRagInput` / `streamLgRag` body 仅 `query`/`mode`/`thread_id?` · **无** `continue_from_run_id`——与 task 背景 #3 / F4 一致。

### 4. 与 api co-CLOSE 指针（本仓边界）✅

| 项 | 审查 |
|----|------|
| 契约真值 → api `task_lg_rag_sse_run_worker`（B6/B3/B5 PASS） | ✅ 依赖表 · related_tasks |
| 旧 disconnect = **只读史实指针** · 勿改正文 | ✅ 头部 · 非范围 · 依赖表 |
| api TC-B10 co-CLOSE 属 **api 仓关账**；本 web task **不**承担双 slug 关账 | ✅ 正确外置 |
| 本 task = 实现+Vitest 机断 · **非** `web-api-joint-check` | ✅ TC-W7 · test_strategy_note · 非范围「跨仓联调非关账硬条件」 |

### 5. 验收可机断 ✅

| TC | 机断方式 | 审查 |
|----|----------|------|
| TC-W1 History 半截 | fixture `running\|error` + answer → 气泡断言 | ✅ |
| TC-W2 running 勿假续算 | 无「继续回复」· 零 resume / 文案 | ✅ |
| TC-W3 继续回复=新 stream | fetch/mock：`thread_id` + `continue_from_run_id` · 零 HITL resume | ✅ |
| TC-W4 live `error.stage` / History error | 至少 History 必过；live 可选 | ✅（live 软 → NIT） |
| TC-W5 lint/test/build | 钉死 pnpm 路径 · EXIT=0 | ✅ |
| TC-W6 过程 | invoke 10/20/30/40 · wiki · task lint | ✅（本棒补 20） |
| TC-W7 非联调边界 | 关账不依赖跨仓 live | ✅ |

### 6. 现状锚点亲读（对照 10 声称）✅

| 主题 | 路径 | 实证 |
|------|------|------|
| History 类型 | `src/api/chatHistory.ts` | `terminal_status: string`；注释含 running/error/waiting_approval/completed |
| History 映射 | `src/stores/chat.ts` `mapHistoryRunsToMessages` | 渲染 query/answer/subtasks；**仅** `waiting_approval`→hitl；无 error/running CTA |
| openHistory | `openHistoryThread` | latest=`waiting_approval` 写 active-run；其余 `clearActiveRun` |
| live error | error 分支 | `clearActiveRun` · 注释「续看无意义」——与 Wave B「失败后继续回复」产品口径冲突（task 缺口 #2 正确） |
| 续看 | `resumeFromCursor` + ChatView「续看」 | = `POST /lg-rag/replay`（保留） |
| stream body | `useLgRagSse.ts` | **无** `continue_from_run_id` |

### 7. 范围 / 非范围 / FP / 思考轮 ✅

- **F1–F5** 覆盖半截可见 · running 纪律 · error/disconnected CTA · 传输层 · Vitest/过程——与 D3 / wave_b_plan B3 切片同向。  
- **非范围**：改 api · 联调硬关账 · HITL 语义 · replay≡LLM · 新 event_type · Retry-After 自动退避 · 多副本/ASGI——闭合。  
- **FP-1–FP-8**：闸 · 假续算 · resume 误用 · 无 continue_from · 文案混淆 · T4/HITL 回归 · api 未部署 · 绝对路径——主险覆盖。  
- **R0–R5**：控制表齐 · early_stop@R5 · residual 明示 query 字面/闸未签——**思考轮闭合通过**。

### 8. 行为变更 · 旧测影响面（K7）✅ 代查 · 零退回

本 task 改 History CTA / stream body / live error 产品口径，属行为变更。验收 TC-W5 + FP-6 + 必读测试列表已覆盖挂载面；本帽代查：

| 面 | 文件（必读已列） | 30 纪律 |
|----|------------------|---------|
| History/store | `tests/chat-store*.spec.ts` · `chat-history-*.spec.ts` | CTA 矩阵增量 · waiting_approval 零 diff |
| 续看 T4 | `chat-view.spec.ts` · store resume | 「续看」文案/按钮保留 · 与「继续回复」分词 |
| SSE body | `lg-rag-sse.spec.ts` | `continue_from_run_id` 透传断言 |
| HITL | `chat-store-hitl.spec.ts` | resume 路径零调用（spy） |

---

## 阻塞 / 非阻塞

### 阻塞

**零阻塞。**

### 非阻塞 NIT（30 内决 · 零退回 10）

| # | NIT | 建议 |
|---|-----|------|
| N1 | `ChatLatestRunStatus` 联合类型尚无 `disconnected`；`terminal_status` 已是 `string`，History CTA 可按字面驱动 | 30 若用窄类型分支，可顺手扩联合；或继续用 string 比较 |
| N2 | 「继续回复」触发时 `query` 字面（确认句 / 空串+仅 continue_from）留 30 裁定 | TC-W3 旁 Vitest **钉死一字面**；对齐 api 草稿注入行为 |
| N3 | TC-W4 live `error.stage` 路径标「能做则做」 | History 路径必过即可关主验收；live 做了则记 invoke |
| N4 | 基线「既有绿」计数随 30/40 填报 | 自检用 `N files / M tests` 格式，与仓先例一致 |

---

## 回填清单

无（零内容阻塞 · 无需退回 10-task）。

---

## 维护者签闸（20 后 · 30 前）

- [x] 已读 R1 审查结论（**PASS · 零阻塞**）
- [x] HG-AUDIT-R1 **approved**（00 代录 2026-10-14）
- [x] HG-TASK-DRAFT / HG-GRAPH-MODULES **approved**（00 代录）
- [ ] commit task/审查文档（交维护者 / 30 同批）
- [x] 再下发 Harness 30 Prompt（00 派）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 `TEMPLATE_30_gate_stop.md`）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-14 | R1 · 20-task-audit：PASS · 零阻塞 · 锚点亲读 · lint PASS · 未代签 · 未 commit |
