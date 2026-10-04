# 模块边界登记表（G-L1 · D4-a 人签真值）

> **用途**：`docs/_tech_graph/l1/01_modules.md` — **一级模块** 边界；**HG-GRAPH-MODULES** approved 后方可 **30 执行改码**。  
> **范围**：Ops Desk Web 前端（`ops-desk-web`）。  
> **历史**：原根目录 `01_struct.md`（Phase γ 迁入本路径；根 stub 保留 ≥1 Epic）。

---

## 模块表（必填）

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
| `entry` | 入口与配置 | `src/main.ts`, `vite.config.ts` | → `router`, `pinia` | Vue 应用实例、Vite 配置 |
| `router` | 路由层 | `src/router/**` | → `pages` | Vue Router 路由定义 |
| `pages` | 页面组件 | `src/views/**`, `src/pages/**` | → `components`, `api`, `pinia` | Login / Overview / Issues / Pulls / Graph / Chat / LC Evidence（`/lc-evidence`，LangChain 旁路实验页）/ LG RAG（`/lg-rag`，lg_rag 旁路实验页，LangGraph 三 mode · thread_id 续写）/ Obs（`/obs`，可观测性状态页 · Observability） |
| `components` | 通用组件 | `src/components/**` | → — | Element Plus 封装、水墨风 UI 组件；2026-10-04 新增 `chat-history/ChatHistoryPanel.vue`（F1 历史侧栏 · 裁定 F-B）与 `chat/HitlApprovalCard.vue`（F2 消息流内联审批卡片 · 裁定 F-A）（task_web_chat_history_hitl_ux） |
| `api` | API 客户端 | `src/api/**` | → — | 封装 fetch、SSE 消费、错误处理；2026-10-04 新增 `chatHistory.ts`（B1 threads/history 只读契约）与 `hitl.ts`（B2 pending/decide/resume · decide→resume 两步链）（task_web_chat_history_hitl_ux） |
| `pinia` | 状态管理 | `src/stores/**` | → `api` | Pinia store；2026-10-04 chat store 扩展：`hitl.waiting` 分支（审批卡片态）/ `done` 按 `payload.status` 分支（waiting_approval ≠ 完成态 · 保留 active-run）/ `openHistoryThread` 历史加载映射既有 ChatMessage（F-C）/ `decideHitl` 两步动作链 + `refreshHitlPending` 两消费点（不轮询）（task_web_chat_history_hitl_ux） |
| `styles` | 样式与主题 | `src/styles/**` | → — | 水墨风主题（CSS 变量）；Epic W1 拍板不引 Tailwind |

## 跨模块契约

| 契约 | 提供方 module_id | 消费方 | 说明 |
|---|---|---|---|
| `ApiClient` | `api` | `pages`, `pinia` | 统一 HTTP / SSE 请求封装 |
| `SseEvent` | `api` | `chat_page` | 后端 SSE 事件类型 |

## 人签记录

| human_gate_id | status | 签核人 | 日期 | 说明 |
|---|---|---|---|---|
| HG-GRAPH-MODULES | approved | | 2026-07-16 | 模块表覆盖 ops-desk-web 一级模块（初稿） |
| HG-GRAPH-MODULES | approved | 00统筹（代签） | 2026-07-24 | styles 模块去除 Tailwind；水墨风用 CSS 变量 |
| HG-GRAPH-MODULES | approved | 00统筹（代签） | 2026-07-27 | Phase γ：真值迁至 `l1/01_modules.md`；根 stub 保留 |
| HG-GRAPH-MODULES | approved | web 00（预签 · 维护者授权代签文档闸） | 2026-08-31 | task_web_graph_l1_flow_lg_rag：**不新增一级模块**（flow 属 G-L1）；pages 行补 Obs 页（P0 R1-N3 欠账）+ 关联节加 `10_flow_lg_rag.md` |
| HG-GRAPH-MODULES | approved | web 00（预签 · 维护者授权代签文档闸） | 2026-08-31 | task_web_graph_l1_flow_pages：**不新增一级模块**；关联节补 7 条 flow 链接（overview/issues/pulls/graph/lc_evidence/obs/login · SPEC P1 清零） |
| HG-GRAPH-MODULES | approved | web 00（预签 · 维护者授权代签文档闸） | 2026-08-31 | task_web_graph_l2_key_unify：**不新增一级模块**；仅 l2 by_symbol 18 裸键统一为 `path#symbol` 复合键（值不变 · G-L2 键形态迁移） |
| HG-GRAPH-MODULES | approved | 00（代录 · 维护者授权「签收，后续文档授权00签收」） | 2026-10-04 | task_web_chat_history_hitl_ux：**不新增一级模块**；api/pinia/components 行增量备注（chatHistory/hitl client · chat store hitl.waiting/done-status/openHistoryThread 扩展 · chat-history/chat 组件目录）随 30 交付落盘 |

## 关联

- 顶层图：[`../l0/00_main.md`](../l0/00_main.md) · 源 [`../l0/00_main.graph.yaml`](../l0/00_main.graph.yaml)
- Chat flow：[`10_flow_chat.md`](./10_flow_chat.md)
- LG RAG flow：[`10_flow_lg_rag.md`](./10_flow_lg_rag.md)
- Overview flow：[`10_flow_overview.md`](./10_flow_overview.md)
- Issues flow：[`10_flow_issues.md`](./10_flow_issues.md)
- Pulls flow：[`10_flow_pulls.md`](./10_flow_pulls.md)
- Graph flow：[`10_flow_graph.md`](./10_flow_graph.md)
- LC Evidence flow：[`10_flow_lc_evidence.md`](./10_flow_lc_evidence.md)
- Obs flow：[`10_flow_obs.md`](./10_flow_obs.md)
- Login flow：[`10_flow_login.md`](./10_flow_login.md)
- Mermaid 约定：[`../shared/99_mermaid_protocol.md`](../shared/99_mermaid_protocol.md)
