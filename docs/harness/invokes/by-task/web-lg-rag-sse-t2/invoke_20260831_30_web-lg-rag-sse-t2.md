# Invoke：30-execute · web-lg-rag-sse-t2

> **用途**：30 实现留痕（主 Chat 切 lg-rag SSE · 废弃 chat stream 主路径）。  
> **前置闸**：HG-SPEC-SIGNOFF / HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-lg-rag-sse-t2` |
| freeze_id | `lg-rag-sse-v1` |
| git_branch | `task/web-lg-rag-sse-t2` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_lg_rag_sse_t2_audit_R1_20260831.md`（pass-with-notes · 0 阻塞） |

---

## 30 产出（改码清单）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/composables/useLgRagSse.ts` | 新建 | `streamLgRag` + `LgRagSseFrameParser`；`credentials:'include'`；AbortController+计时器实现 `LG_RAG_STREAM_TIMEOUT_MS=300_000`（R1-N5）；帧型以 data JSON `event_type` 为准 |
| `src/stores/chat.ts` | 改 | 切换 `streamLgRag`（`{query, mode:'supervisor'}` · thread_id 留空 → R1-N1）；progress 事件各成一块（非 chat thinking 聚合）；`answer` 整段替换；422 预检 8000 字；401 清会话跳登录保留；保留 session 门控（R1-N2） |
| `src/views/ChatView.vue` | 改 | 文案：「思考过程」→「节点进度」、「思考中…」→「处理中…」 |
| `src/composables/useOpsChatSse.ts` | **保留不改** | 主路径废弃；留文件 + 对照单测（T6 再删） |
| `tests/lg-rag-sse.spec.ts` | 新建 | 11 例：帧序 / 半帧 / event: 行不依赖 / 坏 JSON / fetch 参数（URL≠chat/stream · body 无 thread_id）/ error 帧 / 401 / network / abort / 300s 超时 |
| `tests/chat-store.spec.ts` | 改写 | 11 例：mock `streamLgRag` · 帧序入 store · 整段 answer · 422 预检 · 超时 stage · 401 · 中断重发 |
| `tests/chat-stream-deprecation.spec.ts` | 新建 | 静态守卫：chat store/view 禁 import 旧封装 · 禁 `/ops/chat/stream` |
| `docs/_tech_graph/l1/10_flow_chat.graph.yaml` | 改 | `streamOpsChat→streamLgRag` · `SseFrameParser→LgRagSseFrameParser` · 边 `POST /api/ops/lg-rag/stream` · description 传输备注 |
| `docs/_tech_graph/l1/10_flow_chat.md` 等 | 生成 | `./scripts/graph-compile.sh` 绿 |

## R1 非阻塞 note 落决

| # | 决策 |
|---|---|
| N1 | `thread_id` T2 留空（api 生成 · run.start 返回不消费；T3 再多轮） |
| N2 | 保留 `loadLatestSession` 展示与发送门控（最小 diff；端点未在 T2 弃用清单） |
| N3 | `useLgRagSse` 自建 parser（废弃主路径语义清晰；未复用旧类） |
| N4 | api 仓 2 处旧 task 文件名链接 → 交 api 侧顺手修（不阻塞） |
| N5 | AbortController + `setTimeout(300_000)`；超时走 `onError kind='timeout'`（store 映射 stage=timeout · retryable） |

## 非范围遵守

- 未改 `ops-desk-api`；未改 `/lg-rag` invoke 页；未动 T3/T4/T5；未删 chat 后端路由
