# Task：Web · lg-rag SSE subtask running 起步帧 UI

> **状态**：active（2026-09-07 · 维护者令开启 · 对齐 api §10.7）  
> **类型**：Chat UI / SSE 消费  
> **上游**：api 05 **§10.7** · api task [`lg-rag-sse-subtask-live`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_subtask_live.md)  
> **前置**：web idle CLOSE · [#36](https://github.com/Cyning12/ops-desk-web/pull/36) / [#37](https://github.com/Cyning12/ops-desk-web/pull/37)  
> **分支**：`task/web-lg-rag-sse-subtask-live`  
> **无关**：invoke 页 · 假打字机 · 改 idle 数值

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-subtask-live` |
| **git_branch** | `task/web-lg-rag-sse-subtask-live` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **freeze_id** | `lg-rag-sse-v1` |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | 22-R1 | 2026-09-07 · 维护者令开启 |
| HG-AUDIT-R1 | approved | 30 | 2026-09-07 · 维护者令开启 · subagent 可执行 |
| HG-GRAPH-MODULES | approved | — | 不新增一级模块 |

---

## 00 定夺

| 项 | 钉死 |
|---|---|
| UI | 「子任务过程」对 `status=running` **立即**追加一行（可标「执行中」） |
| 更新 | 同 `subtask_id`/`id` 的后续 `status=done`（或完成摘要）**更新/替换**该行，不重复堆叠无 id 混乱 |
| 兼容 | 无 `status` 的旧完成帧仍 append（T2 行为） |

---

## 范围

1. `stores/chat.ts`：`subtask.progress` 按 status/id 合并  
2. `ChatView.vue`：running 态可见文案  
3. Vitest：running→done 同 id 合并；与 node.progress 不串台  

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-07 | 00 起草（维护者令开启） |
