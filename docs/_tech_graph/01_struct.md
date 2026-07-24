# 模块边界登记表（L0-b · D4-a 人签真值）

> **用途**：`docs/_tech_graph/01_struct.md` — **一级模块** 边界；**HG-GRAPH-MODULES** approved 后方可 **30 执行改码**。  
> **范围**：Ops Desk Web 前端（`ops-desk-web`）。

---

## 模块表（必填）

| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |
|-----------|------|-----------|----------------------|-------------|
| `entry` | 入口与配置 | `src/main.ts`, `vite.config.ts` | → `router`, `pinia` | Vue 应用实例、Vite 配置 |
| `router` | 路由层 | `src/router/**` | → `pages` | Vue Router 路由定义 |
| `pages` | 页面组件 | `src/views/**`, `src/pages/**` | → `components`, `api`, `pinia` | Login / Overview / Issues / Pulls / Graph / Chat |
| `components` | 通用组件 | `src/components/**` | → — | Element Plus 封装、水墨风 UI 组件 |
| `api` | API 客户端 | `src/api/**` | → — | 封装 fetch、SSE 消费、错误处理 |
| `pinia` | 状态管理 | `src/stores/**` | → `api` | Pinia store |
| `styles` | 样式与主题 | `src/styles/**`, `tailwind.config.*` | → — | Tailwind、水墨风主题 |

## 跨模块契约

| 契约 | 提供方 module_id | 消费方 | 说明 |
|---|---|---|---|
| `ApiClient` | `api` | `pages`, `pinia` | 统一 HTTP / SSE 请求封装 |
| `SseEvent` | `api` | `chat_page` | 后端 SSE 事件类型 |

## 人签记录

| human_gate_id | status | 签核人 | 日期 | 说明 |
|---|---|---|---|---|
| HG-GRAPH-MODULES | approved | | 2026-07-16 | 模块表覆盖 ops-desk-web 一级模块（初稿） |

## 关联

- 顶层图：[`00_main.md`](./00_main.md) · 源 [`00_main.graph.yaml`](./00_main.graph.yaml)
- Mermaid 约定：[`99_mermaid_protocol.md`](./99_mermaid_protocol.md)
