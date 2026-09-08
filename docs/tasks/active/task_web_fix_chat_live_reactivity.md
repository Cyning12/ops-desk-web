# Task：Web · Chat 实流零渲染修复（pushMessage 返回原生对象 → Vue 响应式被绕过）

> **状态**：active（2026-09-08 · 维护者实流点验上报 · 00 统筹）  
> **类型**：紧急修复 / 响应式缺陷  
> **上游**：维护者实流反馈「EventStream 逐帧到达而 UI 不变：思考过程一直『处理中』· 无打字机」  
> **分支**：`fix/web-chat-live-reactivity`  
> **帽子**：00 起草 + 定根因 → 20 R1 → 30+40  
> **授权**：维护者上报缺陷并要求修复（本会话）；00 代签过程文档（沿用前波授权模式）  
> **无关**：改 api · 改 SSE 契约 · 改 reveal 速率常量 · 重构 store 结构

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-fix-chat-live-reactivity` |
| **git_branch** | `fix/web-chat-live-reactivity` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 响应式回归：`effect()` 监听 `store.messages[i].thinking/subtasks/content`，喂 mock 帧后断言 effect 重跑（修复前该测试必然失败）；既有 177 测不回归；`pnpm lint` → `pnpm test` → `pnpm build` |
| **code_quality_bar** | `strict` |
| **freeze_id** | `lg-rag-sse-v1`（零契约变更） |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | 无（零 diff；不新增模块/符号） |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注：raw-mutation 绕过响应式的根因与修法（pushMessage 返回代理） |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30` |
| **invoke_retention_profile** | `default` |
| **close_pr_policy** | `required` |
| **related_pr** | （待开） |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | 22-R1 | 2026-09-08 · **00 代签** · 维护者上报缺陷并要修复 |
| HG-AUDIT-R1 | **approved** | 30 | 2026-09-08 · **00 代签** · R1 [pass-with-notes](../../harness/reviews/task_web_fix_chat_live_reactivity_audit_R1_20260908.md) · N1 逃逸点收入修法/验收 · N2 fake timers · N3 30/40 实测回填 |
| HG-GRAPH-MODULES | approved | — | 零图谱 diff · **00 代签** |

---

## 根因（00 已实证）

`src/stores/chat.ts` `pushMessage()`（L445）把新建的 **raw** `ChatMessage` push 进 `messages`（ref 数组）后**返回 raw 引用**；`sendMessage`/replay 的 `processFrame` 全程突变该 raw 对象（`thinking.push` / `subtasks` upsert / reveal sink 写 `content`）。**raw 突变不经过 Vue proxy set 陷阱 → 不触发任何 effect** → 模板 `message.thinking.length` 等永不重算，直到 `streaming.value=false` 才一次性渲染。

实证（2026-09-08 · 临时 spec 已删）：`ref([msg])` + `effect` 监听 `messages.value[0].thinking.length`；raw `msg.thinking.push()` → effect 不重跑（observed 仍 0）；经代理 `messages.value[0].thinking.push()` → 重跑（observed=2）。

历史 Vitest 全绿的原因：断言直接读 store 状态（raw 可见），不经过模板渲染，测不出响应式绕过。

## 修复方案（钉死）

1. `pushMessage` 返回**经响应式数组取回的代理**：`messages.value[messages.value.length - 1]`。之后所有 `assistant.*` 突变经代理触发依赖。不改动其他任何写路径（replay/resume 同受惠）。
2. **R1-N1（残余逃逸点）**：`startSubtaskOutputReveal`（L413–429）闭包持有 raw `block`，RevealQueue 回调直写 `block.content` 同样绕过响应式 → 修复为经 `assistant.subtasks[idx]`（upsert 返回值索引）取**代理 block** 再入 reveal（可在函数内按 key 重解析，或调用点传代理）。

## 范围

1. `pushMessage` 返回响应式代理（一行级修复 + 注释）
2. `startSubtaskOutputReveal` 改用代理 block（R1-N1）
3. Vitest 响应式回归测（effect 监听 + mock 帧驱动 `processFrame` 路径；含 done+output 渐显的 effect 级断言，需 fake timers —— R1-N2）
4. volatile.md 短注

## 非范围

- 改 api / SSE 契约 / freeze
- 改 reveal 速率、UI 结构、其他 store 方法
- 图谱 diff（零变更）

## 失败路径

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 修复后回归测仍失败 | 拒合入，回查是否还有其他 raw 逃逸点（如 replay 新建消息） | 是 | — |
| HG-AUDIT-R1 pending 即 30 | **拒开工** | 是 | 须先签 |

## 验收标准

- [ ] 新增响应式回归测：`effect` 监听 `store.messages` 末条 thinking/subtasks/content，喂 mock subtask.progress（running+step+done）与 answer delta 帧后 **effect 重跑且读到新值**（修复前必失败）
- [ ] R1-N1 回归：done 帧带 `subtask_result.output` → fake timers 推进中 `effect` 能观测到 subtask block content 逐 tick 增长（修复前必失败）
- [ ] 既有 `pnpm test` 177 全绿不回归；`pnpm lint` / `pnpm build` 绿
- [ ] `npx --yes dsh-coding-kit task lint-wiki-delta --target .` 绿
- [ ] volatile.md 短注落盘

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | **00**：维护者实流上报（逐帧到达 UI 不变）；根因实证（raw 突变绕过响应式）；落盘 fix task · HG-TASK-DRAFT/HG-GRAPH-MODULES 00 代签 |
| 2026-09-08 | **20 R1** pass-with-notes（0 阻塞 · N1 startSubtaskOutputReveal raw block 逃逸 / N2 fake timers / N3 实测回填）→ N1 收入修法+验收 · **00 代签 HG-AUDIT-R1** |

### 自检结论（执行者）

（30/40 回填）

### KPI（00）

（CLOSE 回填）

### 经验总结

（CLOSE 回填）
