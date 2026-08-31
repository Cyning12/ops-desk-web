# Task：Web · lg-rag SSE T2 联调（主 Chat 切流 · 废弃 chat stream）

> **状态**：active（2026-08-31 · **api 00 代起草** · **web 00 已统筹签收**）  
> **类型**：跨仓联调 / 传输切换  
> **统筹**：**web 00 Agent** 签收 Spec · 排 30 实现 · **禁止 ops-desk-api Agent 改本仓 Vue/TS**  
> **上游 Spec**：[`SPEC-web-lg-rag-sse-t2_v1.md`](../../spec/SPEC-web-lg-rag-sse-t2_v1.md) · api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §10–§11  
> **上游 api task**：[`task_lg_rag_sse_stream_updates`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_stream_updates.md) · 分支 `task/lg-rag-sse-stream-updates`  
> **人工 checklist**：[`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md)（**发版闸门**）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-t2` |
| **git_branch** | `task/web-lg-rag-sse-t2` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 30 实现 → 40 自检；api 仓仅 Spec/PR，**不改本仓代码** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest mock SSE 帧序；断言主 Chat **不**调 `/ops/chat/stream`；`pnpm lint/test/build`；可选 `./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `update` |
| **graph_delta_note** | `10_flow_chat` / pages 备注：主 Chat 传输改为 lg-rag SSE；不新增一级模块 |
| **wiki_delta** | `n/a` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **freeze_id** | `lg-rag-sse-v1` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-SPEC-SIGNOFF** | **approved**（2026-08-31 · web 00 签 · 维护者令「签收」） | 22/30 | `SPEC-web-lg-rag-sse-t2_v1.md` §0 冻结生效 |
| **HG-TASK-DRAFT** | **approved**（2026-08-31 · web 00 签） | 22-R1 | 本 task 草案签收 · 可排 10 task 审 |
| **HG-GRAPH-MODULES** | pending | **30** | 随 30 更新 G-L1 chat flow 备注 |
| **HG-AUDIT-R1** | pending | **30** | 20-task-audit 通过后 **web 00** 签 |
| **HG-JOINT-DEBUG** | pending | **merge** | 维护者签 checklist §T2 · **与 api PR 同日发版前** |

---

## 背景与目标

api T2 已提供 `POST /api/ops/lg-rag/stream`（`lg-rag-sse-v1`）。产品主线 **弃用 chat stream**；本 task 让 **主 Chat UI** 改走 lg-rag SSE，并完成与 api 的 **T2 联调**，通过人工 checklist 后与 api **联合发版**。

**完成态（草案）**：

- [ ] `src/composables/useLgRagSse.ts`（或等价）：解析 §4.2 事件 · `credentials:'include'` · timeout ≥300s  
- [ ] `ChatView` / `chat` store：**发送走 `/stream`** · 渲染 progress + answer  
- [ ] **主路径废弃** `useOpsChatSse`（文件可保留但 Chat **不得** import；Vitest 断言）  
- [ ] `/lg-rag` invoke 页 **不改**  
- [ ] Vitest + lint + build 绿  
- [ ] G-L1 chat flow 备注更新 · graph-compile 绿（若本仓 CI 要求）  
- [ ] 维护者 checklist T2 **全勾** · PR **勿 auto-merge** 直至联调通过  

---

## 范围

- `src/composables/useLgRagSse.ts`（新建）  
- `src/views/ChatView.vue` · `src/stores/chat.ts` · `src/api/chat.ts`（改 SSE 端点常量或废弃 chat stream 调用）  
- `tests/`：`chat-sse` 或新 spec · mock lg-rag SSE  
- `docs/_tech_graph/l1/10_flow_chat.md`（及可选 `.graph.yaml`）传输备注  
- `docs/spec/SPEC-web-lg-rag-sse-t2_v1.md`（00 签收）  
- `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（执行勾选）

### 非范围

- api 实现 / 改 `ops-desk-api`  
- T3 session UI · T4 replay · T5 token 打字机  
- 删 `/ops/chat/stream` 后端（api T6）  
- iOS（另仓 task）  
- 改 `/lg-rag` 为 SSE  

---

## failure_paths

| 触发 | 期望 |
|---|---|
| 未登录 | 401 → 登录流；不无限重连 SSE |
| query 空/超长 | 422 · 前端预检 + 后端校验 |
| SSE 半包 JSON | 缓冲至完整行再 parse；不 crash |
| 仅 `error` 帧 | UI 展示错误；loading 结束 |
| 断网 mid-stream | T2：提示失败或等待至 timeout；**不**假 replay |
| supervisor 慢 | client timeout ≥300s；超时友好提示 |

---

## 依赖与联调

| 依赖 | 说明 |
|---|---|
| api `/stream` | 联调可用 api 分支部署或本地 `uvicorn` + web dev proxy |
| api PR | [`task/lg-rag-sse-stream-updates`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_stream_updates.md) · **勿先 merge web  alone** |
| 发版 | checklist 全勾 → merge api → merge web → 生产冒烟（见 checklist §4） |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
# 可选
./scripts/graph-compile.sh
```

---

## CLOSE（待）

| 项 | 值 |
|---|---|
| api PR | 联调通过后与 web **同日** merge |
| web PR | **勿 auto-merge** 直至 HG-JOINT-DEBUG approved |
| checklist | 归档勾选记录至 invoke 40 附件 |
