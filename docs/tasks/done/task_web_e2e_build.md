# Task：E2E 联调 + 构建产物验证 + Nginx 托管说明（Epic W8 · web-e2e-build）

> **状态**：completed  
> **类型**：集成验证 + 文档  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W8 · 部署轨（Epic 8）输入

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-e2e-build` |
| **test_strategy** | `required` |
| **test_strategy_note** | 既有套件保持全绿 + 联调 checklist（dev proxy 全端点带 cookie 实测）+ dist 产物静态服务验证 |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task（Epic 收尾） |
| **git_branch** | `task/web-e2e-build` |
| **experience_capture** | `recommended` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：仅构建配置与文档，不改模块边界 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：允许 vite manualChunks 拆分 vendor（消除 >500kB 警告）；Nginx 说明为文档产出，不改部署 |

---

## 背景与目标

Epic 收尾：全页面联调走查、构建产物验证、为部署 task 提供 Nginx 静态托管说明。后端 docker 在线（localhost:8000，真实 LLM 可用）。

**完成态**：

- [x] `vite.config.ts`：`build.rollupOptions.output.manualChunks` 拆分 vue/element-plus vendor，消除 >500kB chunk 警告
- [x] 联调走查（dev server + 代理 + 真实 cookie）：
  - 登录 → /me → 6 页面路由全部可访问
  - `/api/ops/overview` / `issues` / `pulls` / `graph` / `chat/sessions/latest` 经代理带 cookie 全 200
  - `POST /api/ops/chat/stream` 经代理 SSE 序列完整（run.start→thinking→answer→done）
  - 登出 → /me 401
- [x] dist 产物验证：`pnpm build` 后用静态服务器（如 `python3 -m http.server` 于 dist/）验证 index.html 可加载、静态资源 200、深链路由需 SPA fallback（记录现象，Nginx 配置解决）
- [x] `docs/deployment/nginx-static-hosting.md`：
  - `location /` → dist root + `try_files $uri /index.html`（SPA fallback）
  - `location /api/` → proxy_pass 后端 + cookie 透传（`proxy_set_header Cookie $http_cookie` 非必需，默认透传；注明 `ops_session` 依赖）
  - SSE 注意事项：`proxy_buffering off`、`proxy_read_timeout`、HTTP/1.1
  - gzip/static 缓存建议（assets 长缓存、index.html no-cache）
- [x] `docs/_tech_graph/02_version.md` 登记 v1.0.0（Epic W0–W8 完成）
- [x] `README.md` 开发/构建/联调说明核对更新
- [x] invoke + close + 合并

**不做**：真实 Nginx 部署（Epic 8）；E2E 测试框架引入；CD。

## 范围

- `vite.config.ts`（manualChunks）
- `docs/deployment/nginx-static-hosting.md`（新）
- `docs/_tech_graph/02_version.md`、`README.md`
- 联调证据记录（invoke）

## 非范围

- 业务页面改动（发现 bug 另开 fix task）
- 后端改动
- 真实部署

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| manualChunks 配置错误 | build 失败回滚 | 终端报错 |
| 代理 SSE 被缓冲 | dev proxy http-proxy 默认支持 SSE；若异常记录并调整 | 流式卡顿 |
| dist 深链 404 | 静态服务器无 SPA fallback 属预期 | Nginx 配置解决 |

## 验收标准

- [x] pnpm 三件套 exit 0 且无 >500kB chunk 警告
- [x] 联调 checklist 全过（证据：状态码/SSE 事件序列）
- [x] dist 静态服务可访问首页与静态资源
- [x] Nginx 文档覆盖 SPA fallback + /api 反代 + SSE 三要点
- [x] `./scripts/graph-compile.sh` 通过

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `vite.config.ts`、`src/router/index.ts` 4. `../ops-desk-api/docs/ios/api-auth-chat.md`（联调端点）

---

### 自检结论（00 复检）

- 三件套全绿；build 无 >500kB 警告（1064kB 单 chunk → 最大 372.79kB vendor chunk）。
- 联调 checklist 全过（全端点 200 + SSE 26 帧完整序列 + 登出 401）。
- dist 静态服务首页/assets 200，深链 404 预期（Nginx 文档已给解法）。
- agent 遗留项 1（AGENTS.md SSE 行）经 00 核实为误报，该行 W1 已更正。
- Epic W0–W8 全部完成，02_version.md 登记 v1.0.0。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-25 | 00统筹起草；双闸代签 approved |
| 2026-07-25 | 30 执行 + 00 复检全绿；联调 checklist 全过；invoke 落盘 |
