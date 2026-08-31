# Task Audit R1：web-lg-rag-sse-t2

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_t2.md`（10 审改名对齐 slug · task lint PASS）  
> **SPEC**：`docs/spec/SPEC-web-lg-rag-sse-t2_v1.md`（active · HG-SPEC-SIGNOFF=approved · web 00 2026-08-31 · §0 签收注记=实现冻结点）  
> **SPEC 审查**：不在本审查范围；SPEC 状态以文件头与 §0 签收注记为准  
> **api 联调真值**：`ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md` §4.2 / §10–§11（已核）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-sse-t2`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-t2` |
| freeze_id | `lg-rag-sse-v1`（对齐 api §4.2 T2 冻结，已核） |
| test_strategy | `required`（Vitest mock SSE 帧序 + 断言不调 `/ops/chat/stream` + lint/test/build） |
| required_invoke_hats | `10,00,30,40`（20 以 reviews 落盘为硬闸，无需 invoke_20） |
| graph_change_layer | `G-L1`（`10_flow_chat` 传输备注 update；不新增一级模块） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：思考由 SPEC §6 修订/api 05 §6 R0–R5 承载） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / G-L1 / test_strategy=required / 人工闸表五行齐。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-SPEC-SIGNOFF** | **approved**（web 00 · 2026-08-31） | 22/30 | 一致；SPEC §0 冻结生效 |
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞 |
| **HG-GRAPH-MODULES** | pending | **30** | graph_delta=update 且仅限 `10_flow_chat` 备注、不新增一级模块；对齐 lc-evidence / lg-rag-page 先例，可由 00 预签（维护者已授权 00 代签文档闸） |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；待 00 依本审查结论签（维护者 2026-08-31 授权 00 代签后续所有文档闸） |
| **HG-JOINT-DEBUG** | pending | **merge** | 不属本审；维护者签 checklist §1.4，**00 代签授权不覆盖此闸**（须真实联调） |

blocks_hats 方向正确。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽可验收；契约与 SPEC §3 + api §4.2/§10.1 逐条一致；failure_paths 覆盖 401/422/半包/error 帧/断网/超时；验收与 SPEC §4–§5 对齐；现网对照已核（见核对项） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 5 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 SPEC §0/§3 + api §10.1 · 现网已核）

| 项 | task | 审查 |
|---|---|---|
| 新建 `useLgRagSse.ts` | 解析 §4.2 事件 · `credentials:'include'` · timeout ≥300s | 对齐 SPEC §0；现网 `useOpsChatSse.ts` 的 `SseFrameParser` 为纯函数可单测范式（已核 L54–91），新 composable 可参照同模式自建；**fetch 无原生 timeout**，需 AbortController+计时器实现 ≥300s（见 N5） |
| ChatView / chat store 切流 | 发送走 `/stream` · 渲染 progress + answer | 现网 `stores/chat.ts` `handleEvent` 走 `thinking` 增量（L90–98），须按 SPEC §3.3 映射表改为 `node.progress`/`subtask.progress` 摘要 + **整段** `answer`（T2 无 delta）；现网 `ChatView.vue` 思考过程折叠区（L90–101）可承载进度摘要，最小 diff |
| 废弃主路径 `useOpsChatSse` | 文件可保留但 Chat **不得** import；Vitest 断言 | 现网唯二 import 点：`stores/chat.ts` L7–8（已核）；`tests/chat-sse.spec.ts` 为对照单测可保留（task 明示「文件可保留」） |
| `/lg-rag` invoke 页不改 | 非范围明示 | 现网 `api/lgRag.ts`（非流式 invoke · LG_RAG_TIMEOUT_MS=300_000）不动，已核 |
| api/chat.ts | 改 SSE 端点常量或废弃 chat stream 调用 | 现网 `api/chat.ts` 仅含 `fetchLatestSession`（session 元数据，非 SSE）；T2 是否保留 session 门控见 N2 |
| tests | mock lg-rag SSE 帧序 | 现网 `tests/chat-sse.spec.ts`（parser 单测）保留；新增 lg-rag SSE spec + 改写 `chat-store.spec.ts`；断言主路径不打 `/ops/chat/stream` |
| G-L1 | `10_flow_chat` 备注更新 | 现网 `10_flow_chat.graph.yaml` 存在，`.md` 由 `scripts/graph-compile.sh` 生成（已核 frontmatter `source: 10_flow_chat.graph.yaml`）；**须改 yaml 再 compile**，不得手改 .md |

### 非范围（对照 SPEC §2 + api §10.1）

| 项 | task | 审查 |
|---|---|---|
| 不改 `ops-desk-api` | 明示 | 一致；联调依赖 api 分支部署或本地 uvicorn |
| T3 session UI / T4 replay / T5 token | 明示 | 一致；`thread_id` 在 T2 body 中为可选（SPEC §3.1），T2 留空策略见 N1 |
| 删 `/ops/chat/stream` 后端 | api T6 | 一致 |
| 改 `/lg-rag` 为 SSE | 明示 | 一致 |
| iOS | 另仓 task | 一致 |

### failure_paths（对照 api §4.3 + SPEC §3.4）

| 触发 | task 期望 | 审查 |
|---|---|---|
| 未登录 401 | 登录流；不无限重连 | 现网 chat store 401 路径（L147–151：清本地会话 + auth watcher 跳登录）模式可复用，已核 |
| query 空/超长 422 | 前端预检 + 后端校验 | SPEC §3.1 query 1..8000；现网发送前仅 `trim()` 非空判（store L130），**30 须补 8000 上限预检**（已入验收推导） |
| SSE 半包 JSON | 缓冲至完整行再 parse | 现网 `SseFrameParser` 半帧缓冲 + 坏行跳过（L59–90）已证可单测；新 parser 同要求 |
| 仅 `error` 帧 | UI 展示错误；loading 结束 | 对齐 SPEC §4 |
| 断网 mid-stream | 提示失败或等 timeout；不假 replay | 对齐 api §4.3「T2=跑完不收齐」；**禁止**前端伪造 cursor/replay |
| supervisor 慢 | client timeout ≥300s | 对齐 SPEC §0（invoke 页实测 100–250s） |

### 契约一致性（SPEC §3.2 ↔ api §4.2）

| 字段/帧 | SPEC | api §4.2 | 审查 |
|---|---|---|---|
| 帧字段 `run_id/seq/ts_ms/agent_role/event_type/payload` | ✓ | ✓ | 逐字一致 |
| 帧序 `run.start`→进度→`answer`→`done`/`error` | ✓ | ✓（§10.1 联调项 ②–⑤） | 一致 |
| `event:` 行处理 | SPEC §3.2「每事件一行 event: + 一行 data:」 | api §10.1 常见坑「忽略 event: 行只读 body」 | **30 注意**：data JSON 自带 `event_type`，parser 可读 data 行即可，但不得依赖 `event:` 行值（T2 帧型以 data JSON 为准） |
| `route=refuse` | — | api §10.1 常见坑「把 route=refuse 当 HTTP 错误」 | refuse 经 `answer` 帧正常下发，**非** HTTP 错误；30 不得特殊分支 |

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | `thread_id` T2 策略未定 | 建议 T2 **留空**由 api 生成、`run.start` 返回后仅做日志/展示；多轮语义属 T3，勿用 chat `session.id` 冒充 `thread_id` |
| N2 | 现网发送门控 `!session.value`（store L130）与输入框 `:disabled="!chat.session"` 依赖 chat session 端点 | 建议 T2 **保留** `loadLatestSession` 展示与门控（端点未在 T2 弃用清单内，最小 diff）；若联调期 session 端点不可用再议，30 内决 |
| N3 | parser 复用 vs 自建 | `SseFrameParser` 语义通用，但「废弃主路径」语义下建议 `useLgRagSse.ts` **自建**解析（或 import 该纯函数类均可）；验收只卡「Chat 不得 import `useOpsChatSse` 的 `streamOpsChat` 主路径」，30 内决 |
| N4 | api 仓 2 处旧 task 文件名链接（`05` §10 指针 · `task_lg_rag_sse_stream_updates.md` 依赖表） | 已记入 invoke_10 输出；api 侧顺手修，**不阻塞** web 30 |
| N5 | fetch 无原生 timeout | `useLgRagSse` 须 AbortController + `setTimeout(≥300_000)` 实现超时中止，超时提示对齐 failure_paths「超时友好提示」 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸清单（20 后 · 30 前）

> 维护者已于 2026-08-31 授权：**「授权00签收后续所有文档，最终停留在需要人参与的checklist前」**。  
> 故下列签闸由 **web 00 代签**（文档闸）；**HG-JOINT-DEBUG（merge 闸）不在授权范围**，仍待维护者真实联调后亲签。

- [ ] 已读 R1 审查结论（本文件）
- [ ] task 人工闸表 `HG-AUDIT-R1` → approved（00 代签 · 2026-08-31）
- [ ] task 人工闸表 `HG-GRAPH-MODULES` → approved（00 预签 · graph_delta 限 `10_flow_chat` 备注 · 不新增一级模块）
- [ ] commit task 文档
- [ ] 下发 Harness 30（invoke_30）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 5 非阻塞）；内容签收；流程闸待 00 依维护者授权代签 |
