# invoke · 30-execute-code · web-lg-rag-sse-progressive-reveal

> **hat**：30  
> **日期**：2026-09-08  
> **分支**：`task/web-lg-rag-sse-progressive-reveal`  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md`

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 00 代签 | Y | N | — |
| HG-AUDIT-R1 | approved | 父会话 VERIFY PASS | Y | Y | ✅ |
| HG-GRAPH-MODULES | approved | 00 预签 · 仅 flow 备注 | Y | — | ✅ |

reviews：`task_web_lg_rag_sse_progressive_reveal_audit_R1_20260908.md` 存在且 R1 pass-with-notes？ **是**

pre-30 invoke：`required ∩ {10,20,00}` → 10 + 00 齐全？ **是**（required_invoke_hats=10,30,40；20 以 reviews 落盘）

`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md` → **VERIFY: PASS**

**结论：可进入读码/改码**

---

## 30 内决（R1-N1～N4）

| note | 内决 |
|---|---|
| N1 速率 | `REVEAL_CHARS_PER_SECOND=60` · `REVEAL_TICK_MS=50` · `REVEAL_CHARS_PER_TICK=3` |
| N2 终止 | done/error/abort/传输层终断 → `flushRevealQueues()` 刷齐已收 |
| N3 replay | `REVEAL_REPLAY_SPEED_MULTIPLIER=4`（≥4× live） |
| N4 SoT | 双缓冲：`RevealQueue.received` vs `assistant.content` / `subtasks[].content` |

---

## 改动摘要

- 新增 `src/composables/useRevealQueue.ts`
- `src/stores/chat.ts`：answer 入队匀速出队；subtask step/done 分流；终帧/终止刷齐；replay 加速
- `src/views/ChatView.vue`：subtask `revealing` 光标态
- `tests/chat-store.spec.ts`：T5 fake timers + progressive-reveal 用例
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml` + compile
- `docs/coding_wiki/volatile.md` 短注

---

## 验证

| 命令 | 结果 |
|---|---|
| `pnpm lint` | PASS |
| `pnpm test` | PASS · 165 |
| `pnpm build` | PASS |
| `./scripts/graph-compile.sh` | PASS · 10_flow_chat OK |
| `lint-wiki-delta` | PASS |
| `verify --task` | PASS |

---

## 自检结论（执行者）

30 交付完成：reveal 队列 + subtask step/done 分流 + Vitest + graph/wiki。未 commit/push。建议 40 人工点验实流观感与 step payload 键兼容。
