# Epic Task：Web 前端 v1（Vue3 + TS + Element Plus）

> **状态**：completed（W0–W8 全部完成并合入 master · 2026-07-25）  
> **关联**：`../ops-desk-workspace/docs/05-plan/00-migration-roadmap.md` Phase 4 · `../ops-desk-workspace/docs/03-frontend-analysis/00-current-state.md` · `docs/_tech_graph/01_struct.md`  
> **阻塞关系**：**部署轨（Epic 8）pending 于本 Epic 完成**（用户 2026-07-24 拍板：等 Web 一起部署 API+PG+Web+Nginx+SSL）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |

## 背景

后端 Epic 3–6 已全部完成并合入 master（auth / admin sync / issues / pulls / graph / overview / chat SSE / chat models），真实数据已导入本地。`ops-desk-web` 目前仅有文档骨架，无 `src/`。本 Epic 交付 v1 全部前端页面，完成后启动部署。

## 子任务拆解

| # | slug | 内容 | 后端依赖（已就绪） | 建议验收 |
|---|---|---|---|---|
| **W0** | `harness-upgrade-2-2-1` | harness 2.1.1 → 2.2.1 升级；AGENTS.md / CLAUDE.md 补 Harness Starter 片段（当前缺失）；验证 gate-check / verify / task close / lint-done 在仓内可用；invokes 目录就位 | — | `npx @cyning/harness verify` PASS；`task close`/`lint-done` 可用 |
| **W1** | `web-skeleton` | Vite + Vue3 + TS + Element Plus + Pinia + Router + axios 封装（`withCredentials` 携带 cookie）+ ESLint/Prettier + `pnpm dev` 可跑 | — | `pnpm build` 通过；空白页可访问 |
| **W2** | `web-login` | 登录页（username + invite token）、cookie 会话保持、路由守卫、401 拦截跳登录 | `POST /api/ops/auth/login` · `GET /api/ops/auth/me` · `POST /api/ops/auth/logout` | 登录→刷新保持→登出全流程 |
| **W3** | `web-overview` | Overview 页：cycle/review/throughput 指标卡片 + trend 图 + sync/scan 状态 | `GET /api/ops/overview` | 真实数据渲染正确 |
| **W4** | `web-issues` | Issues 页：列表 + state/label/module 筛选 + 分页 | `GET /api/ops/issues` | 筛选分页与接口一致 |
| **W5** | `web-pulls` | PRs 页：列表 + state/ci_status 筛选 + 分页 | `GET /api/ops/pulls` | 筛选分页与接口一致 |
| **W6** | `web-graph` | Graph 页：v1 为 module_matrix 表格 + snapshot 元信息（非可视化图） | `GET /api/ops/graph` | 矩阵渲染正确 |
| **W7** | `web-chat` | Chat 页：latest session 获取/创建、SSE 流式渲染（thinking/tool_result/answer/done/error）、输入与状态管理 | `GET /api/ops/chat/sessions/latest` · `POST /api/ops/chat/stream` | 流式事件按序渲染；错误态可见 |
| **W8** | `web-e2e-build` | Vite dev proxy 联调后端、全页面走查、`pnpm build` 产物验证、Nginx 静态托管说明（供部署 task 使用） | 全部 | 构建产物可用；联调 checklist 全过 |

**执行顺序**：W0 → W1 → W2 为基线；W3–W7 可并行（各自独立 task 分支）；W8 收尾。每个子任务独立走 10-task 起草 → 22 审查 → 闸签 → 30 执行 → 40 自检 → `harness task close` 归档流程。

## 技术选型（已拍板，见 project-brief）

- Vue 3 + TypeScript + Vite
- Element Plus（UI）+ Pinia + Vue Router
- SSE 原生消费（`fetch` + ReadableStream，参考 `docs/02-backend-analysis/01-sse-chat-design.md`）
- 水墨风主题（见 `01_struct.md` styles 模块备注；具体设计稿待 W1 确认）

## 接口契约真值

- 后端接口均为 **snake_case**、无 `{ok,data}` 外壳（camelCase/外壳统一为后续契约对齐任务，前端按现状对接）。
- 鉴权：HttpOnly cookie `ops_session`，axios 须 `withCredentials: true`；本地联调 cookie `secure=false`。
- 接口文档：`ops-desk-api/docs/ios/api-auth-chat.md`（auth+chat 链路同样适用于 web）、`ops-desk-workspace/docs/contracts/data-v1.md`（字段以实际响应为准）。

## 完成后解锁

- 部署 task（Epic 8）：API + PG + Web + Nginx + SSL 一次上线；WS 端点生产禁用（`OPS_CHAT_WS_ENABLED` 开关，部署 task 内实现）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 创建 Epic 母单：W0–W8 拆解（含 harness 2.2.1 导入升级 W0）；部署轨 pending 于本 Epic |
| 2026-07-25 | W0–W8 全部完成：harness 2.2.1 / 骨架 / 登录 / Overview / Issues / Pulls / Graph / Chat SSE / E2E 联调+构建+Nginx 文档；部署轨（Epic 8）解锁 |
