# Invoke：30（含 40）· web-obs-status-consumer

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `web-obs-status-consumer` |
| task_paths | `docs/tasks/active/task_web_obs_status_consumer.md` |
| related_review_or_none | `docs/harness/reviews/task_web_obs_status_consumer_audit_R1_20260727.md` |
| git_branch | `task/web-obs-status-consumer` |
| created_utc_or_local | 2026-07-27 |
| notes | P3b MVP：fixture 驱动 /obs；只读声明；无 api / 无浏览器 npx |

---

## 交付摘要

- `/obs` 路由 + 侧栏「过程观测」
- fixture：`status_ready` / `status_blocked` / `timeline_empty` / `timeline_events`
- store + ObsView：场景切换、闸表、may_start_30、verify_preview、timeline 空/有事件
- 图谱：`00_main` 增 `obs_page` 节点
- 验证：`pnpm lint` · test **75** · build · graph-compile · `status --check` 全绿

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-27 | 30/40 · fixture MVP 落地 |
