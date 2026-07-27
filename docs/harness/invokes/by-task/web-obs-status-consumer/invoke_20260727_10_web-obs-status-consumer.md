# Invoke：10-task · web-obs-status-consumer

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-obs-status-consumer` |
| task_paths | `docs/tasks/active/task_web_obs_status_consumer.md` |
| related_review_or_none | —（待 20） |
| git_branch | （尚未开工；建议 `task/web-obs-status-consumer`） |
| created_utc_or_local | 2026-07-27 |
| notes | 维护者签收 HG-TASK-DRAFT（fixture MVP）；HG-AUDIT-R1 仍 pending |

---

## 可复制 Prompt 快照

```text
接受建议，先出10-task，仅做了web UI能有可观察数据吗
```

---

## 交付摘要

- 起草 P3b MVP task：fixture 驱动只读观测页
- 结论写入 task：浏览器不能 npx；fixture 能「看见」契约数据；live 需中间件/api follow-up
- **HG-TASK-DRAFT = approved**（维护者 2026-07-27 签收）
- HG-AUDIT-R1 / HG-GRAPH-MODULES 仍 pending

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-27 | 10-task 首稿 |
| 2026-07-27 | 维护者签收 HG-TASK-DRAFT + commit |
