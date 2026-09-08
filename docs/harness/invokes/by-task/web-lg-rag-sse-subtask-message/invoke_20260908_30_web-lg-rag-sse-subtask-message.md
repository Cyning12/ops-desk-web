# invoke · 30-execute-code · web-lg-rag-sse-subtask-message

> **hat**：30  
> **日期**：2026-09-08  
> **分支**：`task/web-lg-rag-sse-subtask-message`  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_subtask_message.md`

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 00 代签 · 维护者授权 | Y | N | — |
| HG-AUDIT-R1 | approved | 00 代签 · R1 pass-with-notes（N1–N5） | Y | Y | ✅ |
| HG-GRAPH-MODULES | approved | 00 代签 · 仅 10_flow_chat 备注 | Y | — | ✅ |

reviews：`task_web_lg_rag_sse_subtask_message_audit_R1_20260908.md` 存在且 R1 pass-with-notes？ **是**

pre-30 invoke：`required ∩ {10,20,00}` → 10 + 00 齐全？ **是**（required_invoke_hats=10,30,40；20 以 reviews 落盘）

`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_subtask_message.md` → **VERIFY: PASS**（exit 0）

**结论：可进入读码/改码**

---

## 30 内决（00 定夺 + R1-N1/N2/N3 收入）

| 项 | 内决 |
|---|---|
| message 提取 | 新纯函数 `extractPayloadMessage(payload)`：非空 string 才有效，**空串视为缺省** |
| running | 非空 message → **原样零前缀**（R1-N3：去掉「执行中 · 」叠句）；无 → `formatRunningSubtaskContent` 本地兜底不变 |
| step | 非空 message → 原样即时上屏；同 `subtask_id` 走既有 `upsertSubtaskBlock` 合并键（#38）替换不堆行；无 → `formatStepSubtaskContent` 兜底不变 |
| done + output | `extractSubtaskDoneText` 先解析 `subtask_result.output` → progressive-reveal 渐显；message **不得**覆盖/截断/替代 |
| done 无 output | 非空 message **显式优先**（先于 summary/content · R1-N1/N2）→ 再降级 summary/content → 「已完成 · kind · id」；禁 JSON dump |
| node.progress | `summarizeProgress` / `PROGRESS_DIRECT_KEYS` 顺序**零改动**（不影响编排进度路径） |

---

## 改动摘要

- `src/stores/chat.ts`：新增 `extractPayloadMessage`；`formatRunningSubtaskContent` / `formatStepSubtaskContent` / `extractSubtaskDoneText` 三处 message 显式优先
- `tests/chat-store.spec.ts`：新 describe「subtask.progress · payload.message 优先消费」12 用例（N1/N2 区分性断言 · N3 零前缀 · N4 不回归 lock-in 命名/注释标注）
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml` 备注 + `graph-compile` 再生成
- `docs/coding_wiki/volatile.md` 短注小节「subtask.message」

---

## 验证

| 命令 | 结果 |
|---|---|
| `pnpm lint` | PASS（exit 0） |
| `pnpm test` | PASS（exit 0 · 22 files · 177 tests） |
| `pnpm build` | PASS（exit 0） |
| `./scripts/graph-compile.sh` | PASS（exit 0 · 10_flow_chat OK） |
| `npx --yes dsh-coding-kit task lint-wiki-delta --target .` | PASS（exit 0） |
| `verify --task` | PASS（exit 0） |

---

## 自检结论（执行者）

30 交付完成：message 显式优先三态消费 + done/output 边界 + Vitest 12 新用例 + graph/wiki。详见 40 invoke 逐条验收对照。