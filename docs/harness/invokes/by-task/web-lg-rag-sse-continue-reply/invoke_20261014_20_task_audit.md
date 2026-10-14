# Invoke：web_lg_rag_sse_continue_reply · 20-task-audit R1（2026-10-14）

| 字段 | 值 |
|------|-----|
| **hat_id** | 20-task-audit |
| **task** | `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` |
| **分支** | `task/web-lg-rag-sse-continue-reply` |
| **cwd** | `ops-desk-web`（未改 api · 未改 `src/`） |
| **落盘依据** | task `required_invoke_hats=10,20,30,40` 含 20 → 20 invoke 强制 |

## 真读清单（逐一亲读）

- `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` 全文
- `docs/harness/invokes/by-task/web-lg-rag-sse-continue-reply/invoke_20261014_10_task_draft.md`
- 只读 api：`../ops-desk-api/docs/tasks/active/task_lg_rag_sse_run_worker.md`（产品口径 · TC-B3/B6 · co-CLOSE 指针）
- 只读方案：`../ops-desk-api/docs/harness/invokes/by-task/lg-rag-sse-disconnect-completion/invoke_20261014_00_e3_wave_b_plan.md`（D3 · 继续回复≠resume）
- web 锚点：`src/api/chatHistory.ts` · `src/stores/chat.ts`（`mapHistoryRunsToMessages` / `openHistoryThread` / error / `resumeFromCursor`）· `src/composables/useLgRagSse.ts`（`streamLgRag` body）· `src/views/ChatView.vue`（「续看」）
- 样例结构：`docs/harness/reviews/task_web_lg_rag_sse_t4_audit_R1_20260831.md` · api `task_lg_rag_sse_run_worker_audit_R1_20261014.md`

## 裁定

1. **结论 PASS · 零阻塞**（内容面签收 · 四条 NIT 非阻塞）。
2. 硬点全过：继续回复≠HITL resume · running 勿假续算 · `continue_from_run_id` 对齐 · api co-CLOSE 只作指针 · 验收 TC-W1–W7 可机断 · **非** joint-check。
3. **须交 10 重写的项：无**。
4. **流程闸**三闸仍 **pending** → 交维护者；**未附 30 Prompt**；**未代签**；**未 commit**。

## 机检

```text
npx spec-wave task lint --file docs/tasks/active/task_web_lg_rag_sse_continue_reply.md
→ LINT: PASS · task_web_lg_rag_sse_continue_reply.md
→ EXIT=0（2026-10-14 · 20 复跑）
```

## 交付物

- [x] 审查文：`docs/harness/reviews/task_web_lg_rag_sse_continue_reply_audit_R1_20261014.md`
- [x] 本 invoke
- [x] task lint PASS 照登

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-14 | 20 R1：PASS · 零阻塞 · reviews+invoke · 未改 src/api · 未 commit |
