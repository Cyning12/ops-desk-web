# invoke · 30-execute-code · web-fix-chat-live-reactivity

> **hat**：30  
> **日期**：2026-09-08  
> **分支**：`fix/web-chat-live-reactivity`  
> **task**：`docs/tasks/active/task_web_fix_chat_live_reactivity.md`

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 00 代签 · 维护者上报缺陷并要修复 | Y | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | 00 代签 · R1 pass-with-notes（N1 逃逸点收入修法/验收） | Y | Y | ✅ |
| HG-GRAPH-MODULES | approved | 00 代签 · 零图谱 diff | Y | — | ✅ |

reviews：`task_web_fix_chat_live_reactivity_audit_R1_20260908.md` 存在且 R1 pass-with-notes？ **是**

`git branch --show-current` → `fix/web-chat-live-reactivity` ✅

`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_fix_chat_live_reactivity.md` → **VERIFY: PASS**（exit 0）

**结论：可进入读码/改码**

---

## 修复前测红证据（新增 spec 对未修复码先跑一次）

`pnpm vitest run tests/chat-live-reactivity.spec.ts`（修复前，src 零改动）→ **2 failed / 2**：

| 用例 | 修复前失败断言 | 现象 |
|---|---|---|
| effect 监听末条 thinking/subtasks/content，喂 running+step+answer delta 帧 | `expected 1 to be greater than or equal to 4` | effect 全程零重跑（seen 恒为初始快照 `0|0|0|0`）——raw 突变绕过响应式实证 |
| R1-N1：done+output fake timers 逐 tick effect 观测 | `expected 1 to be greater than 2` | reveal 逐 tick 直写 raw block.content，effect 零重跑（lengths 恒 `[0]`）——逃逸点实证 |

与 task 根因节实证口径一致（raw 突变不触发 effect；直读 store 状态的历史断言测不出）。

---

## 改动摘要（最小 diff · 两处）

- `src/stores/chat.ts` `pushMessage`（L445）：返回 `messages.value[messages.value.length - 1]`（经响应式数组取回的代理）+ 注释（raw 突变绕过 Vue 响应式的根因说明）
- `src/stores/chat.ts` handleEvent done 分支（约 L580）：`const idx = upsertSubtaskBlock(...)`，reveal 改传 `assistant.subtasks[idx]`（R1-N1：upsert 整体替换，闭包必须持替换后数组中的代理 block）+ 注释
- `tests/chat-live-reactivity.spec.ts`（新增）：`effect()` 级响应式回归 2 用例（mock streamLgRag/replayLgRag 喂帧 · R1-N2 fake timers）
- `docs/coding_wiki/volatile.md`：末尾追加短注小节「chat 实流响应式」（根因 + 修法 + 真值指针）
- 图谱：**零 diff**（task 钉死 graph_delta=无）

---

## 验证（30 阶段快检）

| 命令 | 结果 |
|---|---|
| `pnpm vitest run tests/chat-live-reactivity.spec.ts`（修复后） | PASS（2/2 · exit 0） |
| `pnpm test` | PASS（23 files · **179 tests** · 既有 177 不回归 + 新增 2） |
| `pnpm lint` | PASS（exit 0 · 首轮 2 个 no-unused-vars 在 spec mock 上已修） |

40 完整质量门见 invoke_20260908_40。

---

## 自检结论（执行者）

30 交付完成：两处最小修复 + 修复前测红/修复后转绿的 effect 级回归 + volatile 短注。详见 40 invoke 逐条验收对照。
