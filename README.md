# ops-desk-web

Ops Desk Kimi Code 的 Web 前端。

## 技术栈

- Vue 3 + TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- Tailwind CSS
- markdown-it + highlight.js
- `@microsoft/fetch-event-source`

## 仓库职责

- Ops Desk 各页面实现：Login / Overview / Issues / Pulls / Graph / Chat
- Chat SSE 流式消费与思考过程展示
- 水墨风 UI（延续现有视觉风格）

## 必读

1. **`AGENTS.md`** — 本仓 Agent 导航
2. `../ops-desk-workspace/docs/03-frontend-analysis/00-current-state.md` — 前端现状分析
3. `../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md` — SSE Chat 设计
4. `../ops-desk-workspace/docs/01-scope/00-project-brief.md` — 项目范围

## 开发命令

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm build
```

## API 基址

开发环境通过 Vite proxy 转发 `/api` 到 `http://localhost:8000`。

## 相关仓库

| 仓库 | SSH 地址 |
|---|---|
| workspace | `git@github.com:Cyning12/ops-desk-workspace.git` |
| api | `git@github.com:Cyning12/ops-desk-api.git` |
| ios | `git@github.com:Cyning12/ops-desk-ios.git` |
