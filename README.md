# ops-desk-web

Ops Desk Kimi Code 的 Web 前端。

## 技术栈

- Vue 3 + TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- 水墨风主题（CSS 变量，不引 Tailwind）
- Chat SSE：原生 `fetch` + `ReadableStream`

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

## 联调

1. 启动后端 `ops-desk-api`（本地 docker 或 uvicorn，监听 `:8000`）
2. `pnpm dev` 启动前端，`/api/**` 请求经代理直达后端
3. 登录页使用「用户名 + 邀请密钥」登录（密钥由后端 `scripts/create_initial_user.py` 签发）；会话基于 HttpOnly `ops_session` cookie
4. 接口细节见 `../ops-desk-api/docs/ios/api-auth-chat.md`

## 构建与部署

```bash
pnpm build    # 输出 dist/（vue-tsc 类型检查 + vite build）
pnpm preview  # 本地预览构建产物
```

- 构建已通过 `manualChunks` 拆分 vendor（vue / element-plus），单 chunk 均低于 500kB
- dist 为纯静态产物，SPA 深链需服务端 fallback；Nginx 托管配置见 `docs/deployment/nginx-static-hosting.md`
- **合入 `main` 后自动部署前端**：见 `docs/deployment/gha-frontend-deploy.md`（须先配 GitHub Secrets）

## 相关仓库

| 仓库 | SSH 地址 |
|---|---|
| workspace | `git@github.com:Cyning12/ops-desk-workspace.git` |
| api | `git@github.com:Cyning12/ops-desk-api.git` |
| ios | `git@github.com:Cyning12/ops-desk-ios.git` |
