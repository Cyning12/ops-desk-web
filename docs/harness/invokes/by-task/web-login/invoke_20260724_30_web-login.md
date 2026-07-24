# Harness invoke 快照：web-login

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10（00）/ 30（子 agent）/ 40（00 复检） |
| task_slug | `web-login` |
| task_paths | `docs/tasks/active/task_web_login.md` |
| related_review_or_none | 无 |
| git_branch | `task/web-login` |
| created_utc_or_local | 2026-07-24 |
| notes | 后端 docker 在线，完成真实联调冒烟（直连 :8000 + 经 Vite proxy :5173 双链路） |

---

## 可复制 Prompt 快照

```text
30 执行：按 task_web_login.md 实现登录全流程——auth api/store、LoginView 表单、
路由守卫（ensureMe + redirect）、401 拦截落地、AppLayout 顶栏登出；单测 +
curl cookie jar 联调冒烟（login→me→logout→me 401）。
```

---

## 交付摘要

- **验证命令**：`pnpm lint` exit 0 · `pnpm test` 16 passed（http/auth-store/router-guard/app）· `pnpm build` exit 0 · `harness verify` PASS
- **联调证据**：直连 :8000 login 200+Set-Cookie(HttpOnly) → me 200 → logout 200 → me 401；经 Vite proxy 同链路 200/200/200/401；错误 token 401 "Invalid or expired invite token"
- **变更路径**：`src/api/auth.ts`、`src/stores/auth.ts`、`src/api/http.ts`（setUnauthorizedHandler）、`src/router/index.ts`（守卫）、`src/views/LoginView.vue`、`src/layouts/AppLayout.vue`、`tests/{auth-store,router-guard}.spec.ts`
- **决策**：setUnauthorizedHandler 回调解耦 http→router/store 循环依赖；ensureMe 仅缓存确定结论（200/401）、并发共享 inflight；logout 容错本地必清；redirect 仅接受 `/` 开头防开放跳转
- **发现（后端契约）**：invite token 一次性，复用得 401——联调用新 token；harness 产品包已至 2.4.0（本 Epic 锁 2.2.1）
- **下一棒**：交还 00 → CLOSE → W3 web-overview

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-24 | W2 10/30/40 完成，落盘 invoke |
