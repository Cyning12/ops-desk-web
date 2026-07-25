# Harness invoke 快照：web-e2e-build

| 字段 | 值 |
|------|-----|
| hat_id | 10（00）/ 22（00 · R1）/ 30（子 agent）/ 40（00 复检） |
| task_slug | `web-e2e-build` |
| task_paths | `docs/tasks/active/task_web_e2e_build.md` |
| related_review_or_none | `docs/harness/reviews/task_web_e2e_build_audit_R1_20260725.md` |
| git_branch | `task/web-e2e-build` |
| created_utc_or_local | 2026-07-25 |

## Prompt 快照
```text
30 执行：按 task_web_e2e_build.md —— manualChunks 拆 vendor 消警告；dev proxy 带 cookie
全端点联调 + SSE 序列验证；dist 静态服务验证；docs/deployment/nginx-static-hosting.md
（SPA fallback + /api 反代 + SSE 三要点）；02_version.md 登记 v1.0.0。
```

## 交付摘要
- **验证**：pnpm lint/test(69)/build 全绿，>500kB 警告 0（改前单 chunk 1064kB → 改后最大 vendor-ep-base 372.79kB）
- **联调 checklist 全过**：me/overview/issues/pulls/graph/sessions latest 经代理带 cookie 全 200；chat/stream SSE 26 帧完整（run.start→thinking×2→answer×22→done，DeepSeek-V4-Pro，3409ms）；6 路由全 200；logout→/me 401
- **dist 验证**：`/` 200、22 assets 全 200、深链 404 为预期（Nginx fallback 解决）
- **变更**：`vite.config.ts`、`docs/deployment/nginx-static-hosting.md`、`README.md`、`docs/_tech_graph/02_version.md`（v1.0.0）+ compile 再生成
- **00 复检澄清**：agent 报告"AGENTS.md SSE 行未更正"为误报——第 86 行已是原生 fetch + ReadableStream（W1 已落地）
- **遗留**：@vueuse/core PURE 注释 Rollup info 提示（依赖侧，非阻塞）；联调在 chat session 留有测试消息 1 条
- **下一棒**：交还 00 → CLOSE → Epic 完成
