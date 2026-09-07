# Task：Web · lg-rag SSE idle 超时 + 子任务过程分区

> **状态**：active（2026-09-07 · 维护者令 Implement plan）  
> **类型**：传输 / Chat UI  
> **上游**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) **§10.6**  
> **前置**：api task `lg-rag-sse-idle-keepalive`（keepalive）；T5/T5.1 已合  
> **分支**：`task/web-lg-rag-sse-idle-subtask`  
> **帽子**：00 / 10 / 20 / 30+40  
> **无关**：invoke 页 axios 墙钟 · Nginx · 新 event_type

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-idle-subtask` |
| **git_branch** | `task/web-lg-rag-sse-idle-subtask` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **freeze_id** | `lg-rag-sse-v1`（不新 freeze） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | 22-R1 | 2026-09-07 · 维护者令 Implement plan |
| HG-AUDIT-R1 | approved | 30 | 2026-09-07 · 维护者令 Implement plan |
| HG-GRAPH-MODULES | approved | — | 不新增一级模块 |

---

## 00 定夺

| 项 | 钉死 |
|---|---|
| idle | `LG_RAG_STREAM_IDLE_TIMEOUT_MS=120_000`；任意 read 字节重置 |
| UI | `node.progress`→编排进度；`subtask.progress`→子任务过程 |
| 文案 | 超时「超过 Ns 无响应」 |

---

## 范围

1. `useLgRagSse.ts` idle  
2. `chat.ts` / `ChatView.vue` 分区  
3. 单测 + checklist §5.1  

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-07 | 00 起草并实现（随 Implement plan） |
