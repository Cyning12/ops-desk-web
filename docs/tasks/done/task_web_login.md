# Task：登录页 + 会话保持（Epic W2 · web-login）

> **状态**：completed  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W2 · `../ops-desk-api/docs/ios/api-auth-chat.md`（auth 契约）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-login` |
| **test_strategy** | `required` |
| **test_strategy_note** | auth store 单测（mock axios）+ 路由守卫单测；另做后端真实联调冒烟（后端已在线 localhost:8000） |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task |
| **git_branch** | `task/web-login` |
| **experience_capture** | `recommended` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：在 pages/pinia/api 既有模块内实现，无新增一级模块 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：契约以实际响应为准——login 返回 `{ok, user}`、me 返回 `{user}`、logout 返回 `{ok}`（auth 链路特例，非 {ok,data} 外壳冲突）；HttpOnly cookie `ops_session` 由浏览器自动携带，前端不碰 token |

---

## 背景与目标

实现登录→刷新保持→登出全流程。后端已在线（`localhost:8000`，docker compose 运行中），Vite proxy `/api` 已配（W1）。

**契约要点**（`api-auth-chat.md`，以实际响应为准）：

- `POST /api/ops/auth/login`：body `{username, invite_token}` → `{ok: true, user: {id, username, role}}`，Set-Cookie `ops_session`（HttpOnly）
- `GET /api/ops/auth/me` → `{user: {id, username, role}}`；401 = 未登录
- `POST /api/ops/auth/logout` → `{ok: true}`，清 cookie
- 401 场景：未登录 / session 过期 / invite token 无效

**完成态**：

- [x] `src/api/auth.ts`：login / fetchMe / logout 三个封装
- [x] `src/stores/auth.ts`：user 状态、login/logout/ensureMe actions（ensureMe 幂等，首次导航时拉取并缓存）
- [x] `src/views/LoginView.vue`：username + invite_token 表单（Element Plus），登录成功跳 `/overview`，失败展示后端错误 message
- [x] 路由守卫：目标路由非 /login 时 ensureMe，401 → 重定向 /login?redirect=<原路径>；已登录访问 /login 跳 /overview
- [x] `src/api/http.ts` 401 拦截器落地：除 login 请求与 /login 页外，401 清 user 并跳 /login
- [x] AppLayout 顶栏显示当前 username + 登出按钮（调 logout 后跳 /login）
- [x] 单测：auth store（mock http）+ 守卫逻辑；`pnpm lint` / `pnpm test` / `pnpm build` 全绿
- [x] 真实联调冒烟：用 `../ops-desk-api` 的 `scripts/create_initial_user.py` 建测试用户，走通 登录→/me→刷新保持→登出→/me 401（可用 curl -c/-b 或 playwright 式手动验证，证据记入 invoke）
- [x] invoke 落盘 + close + 合并

**不做**：注册/邀请管理 UI；记住我；token 刷新（cookie 会话，无 refresh 概念）。

---

## 范围

- [x] `src/api/auth.ts`（新）
- [x] `src/stores/auth.ts`（新）
- [x] `src/views/LoginView.vue`（替换占位）
- [x] `src/router/index.ts`（守卫）
- [x] `src/api/http.ts`（401 拦截落地）
- [x] `src/layouts/AppLayout.vue`（用户信息 + 登出）
- [x] `tests/`（auth store / guard 单测）

## 非范围

- 其他业务页面
- 后端改动
- E2E 框架引入（W8 评估）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| invite token 错误 | 401，表单展示后端 message | 是 | 错误提示 |
| 后端未启动 | 网络错误提示"服务不可达" | 是 | 错误提示 |
| session 过期（操作中 401） | 拦截器清 user 跳 /login | 重新登录 | 跳转登录页 |
| 刷新页面 | ensureMe 拉 /me 恢复会话；401 则跳 /login | — | 保持或跳登录 |

---

## 验收标准

- [x] `pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [x] 登录成功 → cookie 设置 → 跳 /overview → AppLayout 显示 username
- [x] 刷新页面会话保持（/me 200）
- [x] 登出 → /me 401 → 跳 /login
- [x] 未登录直接访问 /issues 等 → 重定向 /login
- [x] 错误 token 登录 → 表单错误提示，不跳转

---

## 给执行帽的必读列表

1. `AGENTS.md`
2. `docs/tasks/active/task_web_login.md`（本文件）
3. `../ops-desk-api/docs/ios/api-auth-chat.md` §1/§2/§5/错误码
4. `src/api/http.ts` / `src/router/index.ts` / `src/layouts/AppLayout.vue`（W1 现状）

---

### 自检结论（00 复检）

- 30 子 agent 交付后 00 复检：`pnpm lint` exit 0、`pnpm test` 16 passed、`pnpm build` exit 0。
- 真实联调双链路走通（直连 :8000 与 Vite proxy :5173）：login 200+Set-Cookie(HttpOnly) → me 200 → logout 200 → me 401；错误 token 401 表单提示不跳转。
- 发现后端契约：invite token 一次性，复用 401（属后端设计，非前端问题）。
- 决策记录：setUnauthorizedHandler 解耦循环依赖；ensureMe 幂等+inflight 共享；logout 容错；redirect 防开放跳转。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；确认后端在线可真实联调 |
| 2026-07-24 | 30 子 agent 执行 + 00 复检全绿；真实联调通过；invoke 落盘 |
