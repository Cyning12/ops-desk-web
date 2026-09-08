# Task Audit R1：web-fix-chat-live-reactivity

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_fix_chat_live_reactivity.md`（task lint **PASS** · 2 warn · 本审查实测）  
> **SPEC/freeze**：`lg-rag-sse-v1`（零契约变更 · task 已钉死）  
> **日期**：2026-09-08  
> **审查人**：20-task-audit（R1）  
> **git_branch（task 表）**：`fix/web-chat-live-reactivity`（工作区当前分支已核一致）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改代码；**不**改 task 条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-fix-chat-live-reactivity` |
| freeze_id | `lg-rag-sse-v1`（零变更） |
| test_strategy | `required`（Vitest effect 级响应式回归 + 既有 177 测不回归 + lint/test/build） |
| required_invoke_hats | `10,00,30`（不含 20 → 本审查以 reviews 落盘为硬闸） |
| graph_delta | 无（零 diff · G-L1 无新增） |
| wiki_delta | `docs/coding_wiki/volatile.md` 短注 |
| code_quality_bar | `strict` |
| 思考轮 | 无节（bugfix 轨豁免 · lint W4 合法） |

元信息齐备：slug / branch / implement_repo / freeze_id / required_invoke_hats / graph_delta / wiki_delta / test_strategy=required / code_quality_bar=strict / 人工闸表三行齐 / close_pr_policy=required。**通过。**

### task lint（本审查实测）

```
warn: [W3] 自检结论为占位符（draft 期合法 · close 前须回填）
warn: [W4] 无思考轮节（SPEC 承载 / bugfix 轨合法豁免 · 有节则查 R0–R5 与控制表）
LINT: PASS · task_web_fix_chat_live_reactivity.md
```

**PASS**（exit 0 · 两条 warn 均为 draft/bugfix 期合法，CLOSE 前回填自检结论即可）。

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| HG-TASK-DRAFT | approved（00 代签 · 2026-09-08 · 维护者上报缺陷并要求修复） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名，语义等价于本审轮，不阻塞（同前波先例） |
| HG-GRAPH-MODULES | approved（00 代签 · 零图谱 diff） | — | `01_modules.md` 闸表已核为 approved 序列；graph_delta=无 自洽，不阻塞 30 |
| HG-AUDIT-R1 | **pending** | 30 | **保持 pending**；本帽不签发；task 表已注明「待 20 R1 落盘后 00 代签」 |

blocks_hats 方向正确（AUDIT 挡 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：根因陈述与源码一致（已核）；修法对 sendMessage / replay 两条 processFrame 管线的 assistant 引用全覆盖；failure_paths 已预留「raw 逃逸点回查」行，与 N1 发现同向 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 3 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 根因陈述 vs 源码（已核）

- `src/stores/chat.ts` L445–455 `pushMessage`：`const message: ChatMessage = {...}` → `messages.value.push(message)` → **`return message`（raw 引用）**。与 task 根因陈述逐字一致。
- `processFrame`（L500）→ `handleEvent`（L520）全程突变传入的 `assistant`：`assistant.thinking.push`（L538）、`upsertSubtaskBlock(assistant, ...)`（L555/566/580/596）、`ensureAnswerReveal(assistant)` 闭包写 `assistant.content`（L387）。raw 突变不经 proxy set 陷阱 → 不触发 effect，与实证结论同向。

### 修法覆盖性（pushMessage 调用点全核）

| 调用点 | 用途 | 修法后 |
|---|---|---|
| L659 / L665 `pushMessage('user').content = content` | user 消息（422 预检 / 正常） | 返回 proxy → 写经陷阱 ✓ |
| L666 `const assistant = pushMessage('assistant')`（sendMessage） | live 管线渲染目标 | proxy → processFrame 突变全经陷阱 ✓（L387 answer reveal 闭包捕获的也是该 proxy ✓） |
| L771 `const assistant = pushMessage('assistant')`（resumeFromCursor / replay） | replay 管线渲染目标 | 同上 ✓ |

pushMessage 全局仅 4 处调用（grep 全仓 `src/` 核实），sendMessage 与 replay 的 assistant **均**来自 pushMessage，修法对两条管线全覆盖。**无遗漏调用点。**

### raw 引用逃逸点扫描

| 位置 | 持有方式 | 修法后是否仍绕过 |
|---|---|---|
| `ensureAnswerReveal` 闭包（L386–388） | 捕获 `assistant` | **否**——assistant 即 proxy，`assistant.content = text` 经陷阱 ✓ |
| `startSubtaskOutputReveal` 闭包（L413–429） | 捕获 **raw `block`**，RevealQueue 回调直写 `block.content = text`（L423） | **是——见 N1** |
| `subtaskReveals` Map（L367/427） | 存 RevealQueue（队列内部持有上述 raw block 闭包） | 同 N1 |
| 组件/视图 | 自 store 读取渲染，不持有 store 外副本 | 无逃逸 |

### 范围 / 非范围 / failure_paths / 验收

- 范围三条（一行修复 + 回归测 + volatile 短注）与非范围（不改契约 / 速率 / 结构 / 图谱）自洽，无漏项。
- failure_paths 首行「回查是否还有其他 raw 逃逸点（如 replay 新建消息）」——replay 新建消息已核受惠（L771 同管线）；真实残余逃逸点是 N1 的 subtask-output reveal 闭包，方向一致。
- 验收四条均可执行可断言；「修复前必失败」与 00 实证同向。

### test_strategy 与仓 CI

| 项 | task | 审查 |
|---|---|---|
| `pnpm lint` → `pnpm test` → `pnpm build` | 与仓门禁同序 | 一致 |
| `task lint-wiki-delta --target .` | harness | 一致 |
| 既有 177 测不回归 | 声明值 | 本审查未独立重跑套件（书面审查）；`tests/chat-store.spec.ts` 已核存在（65 个 it），由 30/40 实测锁定（见 N3） |
| task lint | 本审查实测 **PASS** | 通过 |

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 / 00 收入定夺 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | **残余 raw 逃逸点（subtask-output 打字机）**：`startSubtaskOutputReveal`（L413–429）在闭包中持有**新建的 raw `ChatThinkingBlock`**（handleEvent L573 构造 → L580 upsert 进数组 → L582 传入），RevealQueue 回调直写 `block.content = text` / `block.revealing = ...`（L423–424）。pushMessage 改返 proxy 后，`assistant.subtasks` 数组本身经陷阱，但模板读到的 `block` 代理追踪的依赖键挂在 raw 对象上，闭包突变 raw 仍**不触发 effect**——done+output 帧的 subtask 渐显在修复后**可能依旧不实流**（与维护者上报「无打字机」中的 subtask 段同因）。task 的钉死修法未覆盖此路径 | 30 内决（建议方向，由 00 定夺）：`upsertSubtaskBlock` 返回`assistant.subtasks[idx]`（经数组取回的代理）并以该代理作为 reveal 闭包目标；或将回归测扩展到「done+output reveal（fake timers）」让该逃逸点先被测红再修。无论何者，验收须补一条覆盖 subtask-output reveal 的响应式断言，否则该路径回归形同空转 |
| N2 | 验收条「喂 mock subtask.progress（running+step+done）与 answer delta 帧」未指明 done 帧是否带 `subtask_result.output`（fromOutput → reveal 需 fake timers 推进）。若 mock done 无 output，N1 逃逸点测不出来 | 30 写用例时至少含一条 done+output 帧 + fake-timers 推进断言（与 N1 联动）；用例命名标注 anti-regression 意图 |
| N3 | task 声明「既有 177 测」为 00 口径，本审查未独立重跑 `pnpm test` 复核计数 | 非阻塞；30/40 verify 阶段以实测计数为准回填即可 |

---

## 回填清单

无（零阻塞，无需回填 task；N1 修法扩展由 00 定夺时收入即可，不强制改文）。

---

## 维护者签闸（20 后 · 30 前）

> 依 task 人工闸表：「HG-AUDIT-R1 待 20 R1 落盘后 **00 代签**」。  
> **本审查不附 30 Prompt**（`HG-AUDIT-R1` 仍为 pending）。

- [ ] 已读 R1 审查结论（本文件 · 含 N1–N3）
- [ ] （可选）就 N1 收入 00 定夺：subtask-output reveal 逃逸点的修法扩展 + 验收补断言
- [ ] 在 task 人工闸表将 `HG-AUDIT-R1` 改为 approved（00 代签 · 日期）
- [ ] commit task 文档或确认已签（含本审查文）
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | R1 初版：pass-with-notes（0 阻塞 · 3 非阻塞 N1–N3）；lint PASS（2 合法 warn）；根因与修法覆盖性核对通过；N1 指出 subtask-output reveal 残余 raw 逃逸点；内容签收；流程闸待 00 依授权代签；未附 30 Prompt |
