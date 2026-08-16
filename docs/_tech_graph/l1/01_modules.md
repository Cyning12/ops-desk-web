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
| `pages` | 页面组件 | `src/views/**`, `src/pages/**` | → `components`, `api`, `pinia` | Login / Overview / Issues / Pulls / Graph / Chat / LC Evidence（`/lc-evidence`，LangChain 旁路实验页） |
| `components` | 通用组件 | `src/components/**` | → — | Element Plus 封装、水墨风 UI 组件 |
| `api` | API 客户端 | `src/api/**` | → — | 封装 fetch、SSE 消费、错误处理 |
| `pinia` | 状态管理 | `src/stores/**` | → `api` | Pinia store |
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

## 关联

- 顶层图：[`../l0/00_main.md`](../l0/00_main.md) · 源 [`../l0/00_main.graph.yaml`](../l0/00_main.graph.yaml)
- Chat flow：[`10_flow_chat.md`](./10_flow_chat.md)
- Mermaid 约定：[`../shared/99_mermaid_protocol.md`](../shared/99_mermaid_protocol.md)
