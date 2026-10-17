# Task：Web · D3 · History 半截可见 +「继续回复」CTA（对齐 api RunWorker）

> **状态**：done（2026-10-17 CLOSE · PR #67 MERGED main `028ed29` · 三闸 approved · 40 PASS 263 tests 三门绿 · 归档 done/）  

> **类型**：feature-lite / 前端实现（**非联调主交付** · Vitest 机断优先）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS；**禁止**本 task 改 api  
> **上游**：api `task_lg_rag_sse_run_worker`（TC-B6/B3/B5 **PASS** · Wave B RunWorker）· 方案  
> `../ops-desk-api/docs/harness/invokes/by-task/lg-rag-sse-disconnect-completion/invoke_20261014_00_e3_wave_b_plan.md`（D3=须开 web）  
> **关联指针（只读）**：api 旧 disconnect task **co-CLOSE 只作史实指针** · **勿改其正文**  
> **分支**：`task/web-lg-rag-sse-continue-reply`（已存在 · 本棒落稿）  
> **00 注**：2026-10-14 · api D3 同步开 web · 本窗 **10-task** 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web_lg_rag_sse_continue_reply` |
| **git_branch** | `task/web-lg-rag-sse-continue-reply` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签闸 → 30（红测先行 · CTA 矩阵）→ 40 机断/可选冒烟 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 红测先行：History `terminal_status`→CTA 矩阵；`continue_from_run_id` body；禁 HITL resume/禁假续算。verify 钉死 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（仓 packageManager pnpm@10.32.1）。**非联调主交付**：40 不以跨仓 live 为关账硬条件；可选本机冒烟另记 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（预判：无新页面/路由/一级模块；chat 面内 CTA + stream body 扩展；若 30 判须备注 chat/lg_rag flow 则升 G-L1 备注一句并回填闸） |
| **graph_delta** | `n/a`（可选：`docs/_tech_graph/l1/10_flow_chat.graph.yaml` / `10_flow_lg_rag.graph.yaml` 备注「继续回复=新 stream+continue_from_run_id」） |
| **graph_delta_note** | 不新增一级模块；flow 备注由 30 实判 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注：History 半截 + running 勿假续算 + error→「继续回复」新 stream；真值指针本 task + api run_worker |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不新 `event_type`；消费既有 `terminal_status` / `error.stage` / 可选 `continue_from_run_id`） |
| **related_tasks** | api `../ops-desk-api/docs/tasks/active/task_lg_rag_sse_run_worker.md`（契约真值）；旧 disconnect 仅指针 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-R1, 30 | 维护者签 · 00 代录 2026-10-14 · 过程文档签收权 |
| HG-AUDIT-R1 | approved | 30 | 维护者签 · 00 代录 2026-10-14 · 20 R1 **PASS**（`task_web_lg_rag_sse_continue_reply_audit_R1_20261014.md`） |
| HG-GRAPH-MODULES | approved | 30 | 维护者签 · 00 代录 2026-10-14 · 预判 n/a 在册；30 若动 flow 备注须回填 |

---

## 背景与目标

api Wave B（`task_lg_rag_sse_run_worker`）已把执行与 SSE 订阅解耦：断连后 worker 可继续；成功落盘普通 `done`；失败落盘 `error{stage:lg_rag.worker_failed}`；History 可机读 `terminal_status`（含 `running` / `error` / 可选补偿 `disconnected`）；「继续回复」在 **api** 侧已钉为同 `thread_id` **新** `POST /lg-rag/stream` + 可选 body `continue_from_run_id`（**禁** HITL `/resume` · **禁** replay≡再调 LLM）。TC-B6/B3/B5 已 PASS。

本仓现状缺口（10 亲读）：

1. History `mapHistoryRunsToMessages` 只特殊处理 `waiting_approval`，**不**按 `running`/`error`/`disconnected` 驱动 CTA。  
2. live `error` 帧清 `activeRun` 且文案偏「续看无意义」——与 Wave B「失败后继续回复」产品口径冲突。  
3. `streamLgRag` / `StreamLgRagInput` **无** `continue_from_run_id` 字段。  
4. UI 仅有「续看」= `replay`（T4 正确语义）；**缺**「继续回复」= 新 stream。

### 完成态（钉死）

| `terminal_status`（History / 机读） | 用户可见 | CTA | 动作 |
|-------------------------------------|----------|-----|------|
| `running` | **半截 answer 可见** +「生成中」类提示 | **勿**出「继续回复」；**勿**假续算（禁 resume / 禁 replay 当 LLM） | 刷新 History 看进度；若本机仍有 active-run 才可沿用既有「续看」= replay（收已落盘帧） |
| `completed`（或缺省完成） | 完整回答 | 无新 CTA | 零 diff |
| `error`（含 stage `lg_rag.worker_failed`） | 半截 + 失败可见 | **「继续回复」** | 同 `thread_id` 新 `/lg-rag/stream` + 可选 `continue_from_run_id=<失败 run_id>`；**零** HITL resume |
| `disconnected`（补偿终态） | 半截 + 中止可见 | **「继续回复」**（同 error） | 同上 |
| `waiting_approval` | 既有审批卡 | 既有 HITL | **本 task 零改语义** |

**「继续回复」≠「续看」≠ HITL resume。**

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| History 类型 | `src/api/chatHistory.ts` | `terminal_status: string`；词表注释含 running/error/waiting_approval/completed |
| History 映射 | `src/stores/chat.ts` `mapHistoryRunsToMessages` | 渲染 query/answer/subtasks；**仅** `waiting_approval`→hitl；无 error/running CTA |
| openHistory | `src/stores/chat.ts` `openHistoryThread` | 仅 latest=`waiting_approval` 写 active-run；其余 `clearActiveRun` |
| live error | `src/stores/chat.ts` error 分支 | `clearActiveRun` · 无「继续回复」 |
| 续看 | `resumeFromCursor` + `ChatView`「续看」 | = `POST /lg-rag/replay`（T4 · **保留**） |
| stream body | `src/composables/useLgRagSse.ts` `streamLgRag` | body=`query`/`mode`/`thread_id?` · **无** `continue_from_run_id` |
| 测试面 | `tests/chat-store*.spec.ts` · `chat-view.spec.ts` · `lg-rag-sse.spec.ts` · `chat-history-*.spec.ts` | 须扩 CTA / body 断言 |

---

## 范围

- [x] **F1 · History 半截可见**：`openHistoryThread` / `mapHistoryRunsToMessages` 对 `running`/`error`/`disconnected` **保留已聚合 `answer`**（勿因非 completed 清空）；UI 可区分终态徽标/文案（轻量 · 不重做视觉体系）。（30 · 2026-10-14）
- [x] **F2 · running 勿假续算**：`terminal_status=running` **禁止**渲染「继续回复」；**禁止**调用 HITL resume；**禁止**把 replay 宣传为「继续生成」。既有 active-run「续看」= 只读补帧，文案勿混。（30）
- [x] **F3 · error / worker_failed / disconnected →「继续回复」**：点击 → 同 `thread_id` 调 `streamLgRag`（新 run）；body 带可选 `continue_from_run_id`（失败/中止 run 的 `run_id`）；query 字面 **`请继续完成回答。`**（30 裁定 · Vitest 钉死）。
- [x] **F4 · 传输层**：`StreamLgRagInput` + `streamLgRag` 透传 `continue_from_run_id`（freeze 只扩 REST body · 不新 SSE `event_type`）。（30）
- [x] **F5 · 测试与过程**：Vitest 覆盖 CTA 矩阵 + body 字段 + **resume 零调用**；`pnpm lint`/`test`/`build` 绿；invoke 10/20/30（**40 待派**）；`wiki_delta` 短注；flow 备注实判 **n/a**。

## 非范围

- **改 api / 合入 api 分支 / 代关 api task**（含旧 `task_lg_rag_sse_disconnect_completion` 正文 · 仅指针）。
- **跨仓联调 live 作为关账硬条件**（本 task=实现+机断；live 冒烟可选 · 另记 invoke）。
- **HITL decide/resume / waiting_approval 状态机**语义改动。
- **replay 隐式再调 LLM**；silent 新 `event_type` / 新 freeze。
- **Retry-After 自动退避**、租户切换、iOS、admin 无关面。
- **多副本租约 / ASGI disconnect 钩**（api 史实 · web 不碰）。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 HG-AUDIT-R1 pending 即 30 改码 | GATE_VERIFY **拒开工** | 是（签后） | — |
| FP-2 running 误出「继续回复」或误调 resume | Vitest 红拦；产品=半截+生成中 | 是 | 假续算误导 |
| FP-3 「继续回复」走 HITL `/resume` 或同 run replay 当生成 | 禁止；TC 钉零 resume / 须新 stream | 是 | 状态机乱 / 4xx |
| FP-4 error 后无 run_id 可 continue_from | CTA 仍可新 stream（无 continue_from）；或降级提示重新提问 · 30 钉一字面 | 是 | 可重试提问 |
| FP-5 与 waiting_approval「续看推进」文案混淆 | 文案/按钮分词：「续看」≠「继续回复」· 测试锁 | 是 | 误点 |
| FP-6 动 stream/history 致既有 T4/HITL 回归 | FP 闸：Vitest 全量绿（基线随 30 填报） | 是 | — |
| FP-7 依赖 api 未部署 continue_from | 本仓 Vitest mock body；联调缺口报回 api · 禁前端迁就造协议 | 是 | 可选冒烟跳过 |
| FP-8 绝对本机路径写入 task/invoke | `task lint` E6 失败 · 改相对路径 | 是 | — |

---

## 验收标准

- [x] **TC-W1（History 半截）**：fixture `terminal_status=running|error` 且 `answer` 非空 → 打开 thread 后 assistant 气泡含该半截（Vitest / 视图断言机断）。（30）
- [x] **TC-W2（running 勿假续算）**：`running` → **无**「继续回复」按钮；触发路径 **零** `hitl` resume / **零** 将 replay 标为继续生成（spy/文案断言）。（30）
- [x] **TC-W3（继续回复=新 stream）**：`error`（及 `disconnected`）→ 可见「继续回复」→ 点击后 `POST /lg-rag/stream` body 含同 `thread_id` + `continue_from_run_id=<该 run_id>`（fetch/mock 断言）；**HITL resume 零调用**。（30）
- [x] **TC-W4（live error.stage）**：消费 `error` 帧且 `stage=lg_rag.worker_failed`（或 History 已为 error）→ 同 TC-W3 CTA（History + live 均过）。（30）
- [x] **TC-W5（反回归闸）**：钉死 pnpm 路径下 `lint` · `test` · `build` EXIT=0 · 零既有红（基线 **263** it · 30 填报；40 复跑确认）。（30）
- [x] **TC-W6（过程）**：invoke 目录含 10/20/30/**40**；`wiki_delta` 短注已落盘；task lint PASS。（40 · 2026-10-14 · `invoke_20261014_40_verify.md`）
- [x] **TC-W7（非联调边界）**：task/invoke 明示关账**不**依赖跨仓 live；本棒未做跨仓 live。（30）

---

## 依赖

| 依赖 | 说明 |
|------|------|
| api RunWorker 契约 | `../ops-desk-api/docs/tasks/active/task_lg_rag_sse_run_worker.md`（TC-B6/B3/B5 PASS · `continue_from_run_id` · `error.stage=lg_rag.worker_failed`） |
| 产品方案 | `../ops-desk-api/docs/harness/invokes/by-task/lg-rag-sse-disconnect-completion/invoke_20261014_00_e3_wave_b_plan.md`（D3 ·「继续回复」≠ resume） |
| 旧 disconnect 指针 | `../ops-desk-api/docs/tasks/active/task_lg_rag_sse_disconnect_completion.md`（**只读 · 勿改正文** · co-CLOSE 史实） |
| 本仓 History/T4/HITL | `src/api/chatHistory.ts` · `src/stores/chat.ts` · `src/composables/useLgRagSse.ts` · `src/views/ChatView.vue` · 既有 Vitest |
| freeze | `lg-rag-sse-v1` 只消费 |

## 给执行帽的必读列表

1. 本 task 全文（CTA 矩阵 · 非范围 · 闸 pending）。  
2. api `task_lg_rag_sse_run_worker.md` 产品口径 #1–#3 + TC-B3（禁信转述）。  
3. `invoke_20261014_00_e3_wave_b_plan.md` §产品路径 / §继续回复。  
4. `src/stores/chat.ts`（`mapHistoryRunsToMessages` · `openHistoryThread` · error/`resumeFromCursor`/`sendMessage`）。  
5. `src/composables/useLgRagSse.ts`（`streamLgRag` body）。  
6. `src/views/ChatView.vue`（续看按钮 · 错误条 · 勿与新 CTA 混词）。  
7. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）。  
8. 既有测试：`tests/chat-store.spec.ts` · `chat-store-hitl.spec.ts` · `chat-view.spec.ts` · `lg-rag-sse.spec.ts` · `chat-history-*.spec.ts`。

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 框定：D3=History 半截 + running 勿假续算 + error→新 stream「继续回复」；非联调；禁 HITL resume | false | — | 闸未签 |
| R1 | 证据：api B3/B6 PASS；web 缺 continue_from 与 error CTA；续看=replay 须保留分词 | false | — | query 字面 30 裁定 |
| R2 | 方案：F1–F5；CTA 矩阵五态；stream body 扩字段；Vitest 机断 | false | — | disconnected 与 error 同 CTA |
| R3 | 反例：running 误 CTA · resume 误用 · 文案与 HITL「续看推进」混淆 · 回归 T4 | false | — | live error 路径可选 |
| R4 | 验收：TC-W1–W7 均可命令/断言机断；联调非硬条件 | false | — | 基线计数随 30 |
| R5 | 收口：闸 pending · 交 20；禁 30；未 commit | true | 产品与锚点已钉 · 再轮无新证据 | HG 未签 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

api 已提供机读终态与 `continue_from_run_id`；web 仍把失败当「不可续看」、History 不驱动「继续回复」。D3 要补的是前端 CTA 与 stream body，不是再赌断连钩或联调大场面。

### R1 · 证据收集

亲读 chatHistory / chat store History 映射 / useLgRagSse stream body / ChatView「续看」。api task 与 wave_b_plan 钉死：继续回复=新 stream；running 半截可见勿假续算。

### R2 · 方案生成

按终态矩阵分流 CTA；扩展 `streamLgRag`；Vitest 锁 body 与零 resume；wiki 短注。

### R3 · 反例与边界

勿动 HITL；勿把 replay 当生成；running 禁「继续回复」；旧 disconnect 正文不改。

### R4 · 验收/可测性

TC-W1–W5 纯前端机断；W6 过程；W7 钉非联调边界。

### R5 · 收口

草稿交 20；三闸 pending；本窗不改 `src/`、不 commit。

---



### 自检结论（执行者）

| 检查 | 结果 |
|------|------|
| 钉死 pnpm lint | **EXIT=0**（`$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` · pnpm@10.32.1） |
| 钉死 pnpm test | **EXIT=0** · Test Files 31 · Tests **263** passed |
| 钉死 pnpm build | **EXIT=0**（vue-tsc + vite） |
| `spec-wave verify --task …` | **VERIFY: PASS**（三闸 approved） |
| `spec-wave task lint` | **LINT: PASS** |
| TC-W1–W7 | **全 pass**（机断 + 本棒复跑；TC-W6 本棒勾） |
| 跨仓 live | **未测**（task 钉非硬关账 · TC-W7） |
| 禁区 | **未改 api** · **未 commit** · 零实现码改动 |
| 结论 | **40 PASS** · invoke `invoke_20261014_40_verify.md` · 建议 00 commit→PR→CLOSE |

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` | **PASS**（2026-10-14 落稿实跑 · EXIT=0） |
| 结论 | 10 落稿 lint PASS · 交 20 |
| **20** | R1 **PASS**（零阻塞 · NIT 照登） |
| **00** | 三闸 **approved**（2026-10-14）· **可派 30** |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | v1.0 · PR #67 已合并 main `028ed29` → 迁 `done/` 收口（50+CLOSE · 00 代笔） |
| 2026-10-14 | v0.3 · 40 自检 PASS：lint/test/build 复跑 · 263 · verify PASS · TC-W6 勾 · **未 commit** |
| 2026-10-14 | v0.2 · 30 实现：F1–F5 · TC-W1–W5/W7 勾 · query 字面钉死 · wiki_delta · 图谱 n/a · **未 commit** · 建议派 40 |
| 2026-10-14 | v0.1 · 00 代录三闸 approved · 可 30 |
| 2026-10-14 | v0 · 10 落稿：D3 CTA 矩阵 · R0–R5 early_stop · 关联 api run_worker · 闸 pending · 非联调 |
