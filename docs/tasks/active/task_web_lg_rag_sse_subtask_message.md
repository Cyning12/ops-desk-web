# Task：Web · lg-rag SSE · 消费 `subtask.progress.message` 上屏

> **状态**：active（2026-09-08 · 维护者授权 00 统筹 · 00 代签闸）  
> **类型**：Chat UI / SSE 消费  
> **上游**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) **§10.7**（拟增补可选 `message`）· api task [`lg-rag-sse-subtask-message`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_subtask_message.md)  
> **前置**：[`task_web_lg_rag_sse_progressive_reveal`](./task_web_lg_rag_sse_progressive_reveal.md)（step 即时 / done→output 渐显）· api `lg-rag-sse-subtask-message` **合入或可 mock 带 `message` 的帧**  
> **分支**：`task/web-lg-rag-sse-subtask-message`（实现时切出；本草稿可先落盘）  
> **帽子**：10 起草 → 人签闸 → 20（可选）→ 30+40  
> **授权**：维护者令「身为 00 统筹 api 和 web 的任务 task_lg_rag_sse_subtask_message · 授权签收后续文档，直至完成并 PR」（含闸表 / 过程 invoke·reviews 代签；**不含**未明示的 00 亲自 30 改码）  
> **无关**：改 api · 新 `event_type` · 假打字机速率 · markdown · invoke 页 · 改 idle/keepalive · 维护完整 step 中文词典（api 已生成）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-subtask-message` |
| **git_branch** | `task/web-lg-rag-sse-subtask-message` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | api-first 下游；api 合入不阻塞本草稿落盘；**30 改码建议等 api `message` 可观测或 Vitest mock 对齐 §10.7** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：running/step/done 帧带非空 `payload.message` → 过程区可见该文案；无 `message` 时本地兜底不回归；done 有 `output` 时仍走 reveal，不以短 `message` 覆盖长 output；`pnpm lint` → `pnpm test` → `pnpm build` |
| **code_quality_bar** | `strict` |
| **freeze_id** | `lg-rag-sse-v1`（不新 freeze · 不新 event_type；消费可选键） |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | 不新增一级模块；备注「subtask.progress 优先 payload.message」 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：message 优先 + done/output 边界 + 真值指针 |
| **wiki_promotion** | `volatile` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `required` |
| **related_pr** | （待开） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | 22-R1 | 2026-09-08 · **00 代签 · 维护者授权签收后续文档** |
| HG-AUDIT-R1 | **pending** | 30 | 待 HG-TASK-DRAFT 通过后签发；**未签不得 30 改码** |
| HG-GRAPH-MODULES | approved | — | 不新增一级模块 · **00 代签**（仅 `10_flow_chat` 备注） |

---

## 背景与目标

api 将为 `subtask.progress` 的 `running` / `step` / `done` 帧增加可选 **`payload.message`（中文短句，确定性模板，≤约 200 字）**。  
现状 web 已用 `PROGRESS_DIRECT_KEYS`（含 `message`）做部分直出，但：

1. `formatRunningSubtaskContent` 在有 `message` 时仍可能套「执行中 · …」前缀，与 api 成句叠床架屋；  
2. `formatStepSubtaskContent` 仍维护本地 step/detail 拼装（与 api 文案职责重叠）；  
3. `status=done` 走 `extractSubtaskDoneText` / progressive-reveal，**完全忽略**短 `message`——无 `output` 时错过可用摘要。

本 task 钉死：**有非空 `message` 则过程区优先原样消费**；无则保留本地兜底；**不**用短 `message` 取代 done 的 `output` 打字机。

完成态：联调/实流时，同 `subtask_id` 的过程行可读中文短句来自 api，web 不必再扩完整 step 词典。

---

## 00 定夺（草案 · 待人签）

| 项 | 钉死（草案） |
|---|---|
| **slug** | `web-lg-rag-sse-subtask-message` |
| **字段** | 消费 `payload.message`：可选 `string`；空串视为缺省（与 api「禁止空串冒充有内容」对齐） |
| **running** | 非空 `message` → **原样**写入子任务过程行（即时）；**禁止**再强制包一层「执行中 ·」若会与成句重复；无 `message` → 现有 `formatRunningSubtaskContent` 兜底 |
| **step** | 非空 `message` → **原样**即时上屏（无打字机）；同 `subtask_id` 合并键沿用 #38 / progressive-reveal；无 `message` → 现有 `formatStepSubtaskContent` 兜底 |
| **done + 有 output** | **仍**解析 `subtask_result.output` → progressive-reveal 渐显；短 `message` **不得**覆盖 / 截断 / 替代长 `output` |
| **done + 无 output** | 优先非空 `message` 作完成摘要；再降级现有 `extractSubtaskDoneText` 可读摘要；**禁止** JSON dump |
| **本地词典** | 降级为 **fallback only**；本波不要求删光拼装逻辑，但验收测须证明有 `message` 时不走「仅键名拼装」路径 |
| **兼容** | 旧 api / 无 `message` 帧：行为与 progressive-reveal CLOSE 后一致，不回归 |
| **freeze** | `lg-rag-sse-v1`；零新 `event_type` |
| **模块** | 不新增一级模块；`01_modules.md` 零 diff |

---

## 范围

1. `src/stores/chat.ts`：`subtask.progress` 三态对 `message` 的优先消费与 done/output 边界（必要时抽小纯函数便于测）  
2. Vitest（`tests/chat-store.spec.ts` 或邻接 spec）：有/无 `message`、done±output、同 id 合并、与 answer 不串台  
3. `docs/_tech_graph/l1/10_flow_chat.*` 备注 + `graph-compile`  
4. `docs/coding_wiki/volatile.md` 本 task 短注  

## 非范围

- 改 `ops-desk-api` / 代写 api 文案词典  
- 新 SSE `event_type` / 重开 freeze  
- 改 reveal 速率 / SoT 双缓冲机制（沿用 progressive-reveal）  
- markdown / 代码高亮 / invoke 页  
- 改 idle / keepalive 数值  
- 在 web 侧再造完整 step→中文映射表（与 api 职责重复）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 帧无 `message` 或空串 | 走现有 running/step/done 本地兜底；不抛 | — | 仍有可读行（可能偏「键名风」） |
| `message` 超长（api 应已截断） | 原样展示或 UI 侧再截断至合理行宽（30 内决；须可测）；不崩 | — | 一行过程文案 |
| done 同时有 `message` 与长 `output` | **只**对 `output` 渐显；忽略用 message 替换 content | — | 打字机输出正文 |
| done 无 output、有 `message` | 即时展示 `message` 为完成摘要 | — | 一句完成短句 |
| api 未合入、仅 mock | Vitest 用合成帧验收；实流联调可后置 | 是 | — |
| HG-AUDIT-R1 pending 即 30 | **拒开工** | 是 | 须先人签 |

---

## 验收标准

- [ ] mock：`status=running` + 非空 `message` → 子任务过程区 content **等于**该 `message`（或文档钉死的极轻前缀规则，且测锁定）  
- [ ] mock：`status=step` + 非空 `message` → 即时上屏该文案；同 `subtask_id` 后续 step **替换**不堆行  
- [ ] mock：无 `message` 的 step/running → 本地兜底仍非空、不回归 progressive-reveal / #38  
- [ ] mock：`status=done` + `subtask_result` 含长 `output` + 另有短 `message` → 渐显文本来自 **output**，终态 ≠ 仅短 message  
- [ ] mock：`status=done` + 无可用 `output` + 非空 `message` → 展示该 `message`  
- [ ] 与 `node.progress` / answer reveal **不串台**  
- [ ] `pnpm lint` → `pnpm test` → `pnpm build` 绿；`./scripts/graph-compile.sh` 绿  
- [ ] `npx --yes dsh-coding-kit task lint-wiki-delta --target .` 绿  
- [ ] `10_flow_chat` 备注 + `volatile.md` 短注落盘  

---

## 给执行帽的必读列表

1. `AGENTS.md` · 本 task 00 定夺表  
2. api task [`lg-rag-sse-subtask-message`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_subtask_message.md) · 05 §10.7（`message` 落盘后）  
3. [`task_web_lg_rag_sse_progressive_reveal`](./task_web_lg_rag_sse_progressive_reveal.md)（done→output · step 即时）  
4. [`task_web_lg_rag_sse_subtask_live`](../done/task_web_lg_rag_sse_subtask_live.md)（同 id 合并）  
5. `src/stores/chat.ts`（`formatRunningSubtaskContent` / `formatStepSubtaskContent` / `extractSubtaskDoneText` / `processFrame`）· `tests/chat-store.spec.ts`  

---

## 依赖与协作

| 项 | 说明 |
|---|---|
| api | 上游提供可选 `message`；本仓只消费；api 合入不阻塞本草稿 |
| progressive-reveal | 本波建立在其 SoT / done-output 之上；若仍 active，建议 CLOSE/合入后再开本波 30（非硬阻塞草稿） |
| 联调 | api+web 均合后：过程区可见中文短句且终答/output 渐显不互相覆盖 |

---

## 思考轮控制

| 项 | 值 |
|---|---|
| **rounds_planned** | R0–R1 |
| **early_stop** | yes |
| **early_stop_reason** | api 方案 B 已钉；web 仅为消费优先级与 done/output 边界；残余为 running 前缀是否完全去掉 |
| **residual_risks** | api 文案与「执行中」前缀叠句；done.message 与 output 用户期望混淆；api 未合时仅靠 mock |

### R0

- **问题**：api 有可读 `message` 后，web 是否仍靠本地 step 词典？  
- **结论**：有 `message` 优先原样上屏；本地逻辑降级 fallback。  

### R1

- **问题**：done 的短 `message` 是否替代 output 打字机？  
- **结论**：否；有 output 仍渐显 output；message 仅作无 output 时的完成摘要。  

---

### 自检结论（执行者）

（30/40 回填 · draft 阶段空）

### KPI（00）

（CLOSE 回填）

### 经验总结

（CLOSE 回填 · 若 `experience_capture=recommended`）

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | **10-task**：据 api `lg-rag-sse-subtask-message` 生成 web 下游草稿 · 闸 pending |
| 2026-09-08 | **00**：维护者令统筹并授权签收后续文档；代签 HG-TASK-DRAFT / HG-GRAPH-MODULES；前置 progressive-reveal CLOSE（#40）；HG-AUDIT-R1 待 20 R1 落盘后代签 |
