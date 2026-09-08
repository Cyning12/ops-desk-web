# Task：Web · Chat 实流零渲染修复（pushMessage 返回原生对象 → Vue 响应式被绕过）

> **状态**：completed（2026-09-08 CLOSE · PR [#43](https://github.com/Cyning12/ops-desk-web/pull/43) MERGED · 归档 done）  
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
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md`（声明零 diff：不新增模块/符号，PR 未触碰） |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注：raw-mutation 绕过响应式的根因与修法（pushMessage 返回代理） |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30` |
| **invoke_retention_profile** | `default` |
| **close_pr_policy** | `required` |
| **related_pr** | `#43` |
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

- [x] 新增响应式回归测：`effect` 监听 `store.messages` 末条 thinking/subtasks/content，喂 mock subtask.progress（running+step+done）与 answer delta 帧后 **effect 重跑且读到新值**（修复前必失败）—— 修复前实测 `expected 1 to be >= 4`（零重跑），修复后 2/2 绿
- [x] R1-N1 回归：done 帧带 `subtask_result.output` → fake timers 推进中 `effect` 能观测到 subtask block content 逐 tick 增长（修复前必失败）—— 修复前实测 lengths 恒 `[0]`，修复后单调增至终态 == output
- [x] 既有 `pnpm test` 177 全绿不回归（179=177+2 · exit 0）；`pnpm lint` / `pnpm build` 绿（exit 0）
- [x] `npx --yes dsh-coding-kit task lint-wiki-delta --target .` 绿（exit 0 · missing 0 · issues 0）
- [x] volatile.md 短注落盘（末尾小节「chat 实流响应式」：根因 + 修法 + 真值指针）

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | **00**：维护者实流上报（逐帧到达 UI 不变）；根因实证（raw 突变绕过响应式）；落盘 fix task · HG-TASK-DRAFT/HG-GRAPH-MODULES 00 代签 |
| 2026-09-08 | **20 R1** pass-with-notes（0 阻塞 · N1 startSubtaskOutputReveal raw block 逃逸 / N2 fake timers / N3 实测回填）→ N1 收入修法+验收 · **00 代签 HG-AUDIT-R1** |
| 2026-09-08 | **00 CLOSE**：PR [#43](https://github.com/Cyning12/ops-desk-web/pull/43) MERGED（CI 两绿 · 修复前测红/修复后转绿证据齐）· `task close --yes` PASS · 归档 done/ · Hub 补登 |

---

## 关账（CLOSE）

| 项 | 值 |
|---|---|
| PR | [#43](https://github.com/Cyning12/ops-desk-web/pull/43) MERGED（2026-09-08） |
| 验收 | 5/5（含修复前测红证据 · 179 tests 绿） |
| 归档 | `docs/tasks/done/task_web_fix_chat_live_reactivity.md` |
| Hub | 2026-09-08 补登 |
| 后置 | 维护者实流复验（硬刷新后：过程区逐句更新 + 打字机） |

### 自检结论（执行者）

30+40（2026-09-08 · fix/web-chat-live-reactivity）：两处最小修复落盘——① `pushMessage` 返回 `messages.value[messages.value.length - 1]` 响应式代理；② R1-N1 done 分支 reveal 改持 `assistant.subtasks[idx]` 代理 block。新增 `tests/chat-live-reactivity.spec.ts` effect 级回归 2 用例：**修复前测红实录**（git stash src 复跑 exit 1 · 2 failed，断言 `expected 1 to be >= 4` / `expected 1 to be > 2` 与根因预测逐字一致），修复后转绿；`pnpm test` 179=177+2 全绿、lint/build/lint-wiki-delta/verify 全 exit 0。验收 5/5。过程真值：`docs/harness/invokes/by-task/web-fix-chat-live-reactivity/invoke_20260908_30_*.md` / `invoke_20260908_40_*.md`。残余风险：实流浏览器点验后置；未来绕过 pushMessage 的写路径需防同类逃逸（volatile 已留教训）。

### KPI（00）

Task_KPI%: 100 · D1 范围钉死（+8/-3 最小修复 · 零契约/图谱变更）· D2 闸齐（三闸 00 代签 · R1 pass-with-notes N1 收入）· D3 过程档齐（invoke 10/00/30/40 + R1 审查文 + 修复前测红证据）· D4 图谱零 diff（声明即无变更）· D5 关账补登 2026-09-08（Hub + 修订记录）

### 经验总结

1. **store 内建对象一律经响应式代理回流给突变方**：`pushMessage` 返回 raw 引用导致全部实流突变绕过 Vue effect——此类 bug 直读 store 状态的 Vitest 永远测不出，必须配 `effect()` 级响应式回归。
2. **闭包捕获也是逃逸点**：reveal 队列 sink 直写闭包内 raw `block`（R1-N1），修法是持数组内代理而非参数 raw。
3. **修复前先写测红**：用未修复码复跑新 spec 确认必失败（exit 1 证据入 invoke），再修复转绿，杜绝「测试形同空转」。
