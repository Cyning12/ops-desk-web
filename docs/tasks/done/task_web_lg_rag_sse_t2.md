# Task：Web · lg-rag SSE T2 联调（主 Chat 切流 · 废弃 chat stream）

> **状态**：completed（2026-08-31 CLOSE · PR [#23](https://github.com/Cyning12/ops-desk-web/pull/23) MERGED · 00 统筹归档）  
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
| **related_pr** | `#23` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 30 实现 → 40 自检；api 仓仅 Spec/PR，**不改本仓代码** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest mock SSE 帧序；断言主 Chat **不**调 `/ops/chat/stream`；`pnpm lint/test/build`；可选 `./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml` |
| **graph_delta_note** | `10_flow_chat` / pages 备注：主 Chat 传输改为 lg-rag SSE；不新增一级模块 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 联调/传输切换；无 coding_wiki 增量；真值在 tech_graph flow 备注与 Spec/checklist |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-SPEC-SIGNOFF** | approved | 22/30 | 2026-08-31 · web 00 签 · 维护者令「签收」· `SPEC-web-lg-rag-sse-t2_v1.md` §0 冻结生效 |
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 本 task 草案签收 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（维护者授权代签文档闸）· graph_delta=update 限 `10_flow_chat` 备注 · 不新增一级模块（对齐 lc-evidence/lg-rag-page 先例） |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 代签（维护者授权）· R1 审 [reviews/task_web_lg_rag_sse_t2_audit_R1_20260831.md](../../harness/reviews/task_web_lg_rag_sse_t2_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 5 非阻塞 note（30 内决） |
| **HG-JOINT-DEBUG** | approved | **merge** | 2026-08-31 · 维护者 cyning 亲签 checklist §1.4（T2 联调通过 · 本地环境 · 双 PR 允许 merge） |

---

## 背景与目标

api T2 已提供 `POST /api/ops/lg-rag/stream`（`lg-rag-sse-v1`）。产品主线 **弃用 chat stream**；本 task 让 **主 Chat UI** 改走 lg-rag SSE，并完成与 api 的 **T2 联调**，通过人工 checklist 后与 api **联合发版**。

## 验收标准

> 完成态（30 交付时逐项勾选；联调签字项由维护者 checklist §1 承载）：

- [x] `src/composables/useLgRagSse.ts`（或等价）：解析 §4.2 事件 · `credentials:'include'` · timeout ≥300s（30 · 2026-08-31：`LG_RAG_STREAM_TIMEOUT_MS=300_000`）  
- [x] `ChatView` / `chat` store：**发送走 `/stream`** · 渲染 progress + answer（30：`streamLgRag {query, mode:'supervisor'}` · thread_id 留空）  
- [x] **主路径废弃** `useOpsChatSse`（文件可保留但 Chat **不得** import；Vitest 断言）（30：`tests/chat-stream-deprecation.spec.ts` 静态守卫）  
- [x] `/lg-rag` invoke 页 **不改**（30：`api/lgRag.ts` / `LgRagView` 零 diff）  
- [x] Vitest + lint + build 绿（40 · 2026-08-31：125 tests passed）  
- [x] G-L1 chat flow 备注更新 · graph-compile 绿（30：yaml 改 + compile OK）  
- [x] 维护者 checklist T2 **全勾** · PR **勿 auto-merge** 直至联调通过（2026-08-31 · cyning 签 §1.4）  

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

## 40 自检

### 自检结论

> 40 · 2026-08-31 · web 00 线

| 闸 | 命令 | 结果 |
|---|---|---|
| lint | `pnpm lint` | ✅ exit 0 |
| test | `pnpm test` | ✅ 23 files / **125 tests passed** |
| build | `pnpm build` | ✅ built（vue-tsc 无错） |
| graph | `./scripts/graph-compile.sh` | ✅ OK 10_flow_chat |
| verify | `npx dsh-coding-kit verify --task …` | ✅ VERIFY PASS（30 前） |

**结论**：自检全绿；维护者 checklist T2 / HG-JOINT-DEBUG 已亲签；web PR #23 已 MERGED。

---

### KPI

Task_KPI%: 100

| 维 | 分 |
|---|---|
| D1 完成度 | 5 |
| D2 可验证 | 5 |
| D3 范围纪律 | 5 |
| D4 摩擦记录 | 5 |
| D5 文档对齐 | 5 |

---

### 经验沉淀（recommended）

- 进度帧 payload 键（`intent/route/subtasks/…`）与旧 `summary/content/message` 不一致时须显式 `summarizeProgress`，否则 UI 静默丢帧。
- T2 `answer` 为整段下发属契约设计；打字机属 T5，勿当 bug。
- Wiki: n/a（见 wiki_delta_note）

---

## CLOSE

| 项 | 值 |
|---|---|
| 日期 | 2026-08-31 |
| web PR | [#23](https://github.com/Cyning12/ops-desk-web/pull/23) MERGED |
| checklist | HG-JOINT-DEBUG approved · §1.4 亲签 |
| 归档 | `docs/tasks/done/task_web_lg_rag_sse_t2.md` |
