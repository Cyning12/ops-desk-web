# Invoke：30 · harness-upgrade-2-18-migrate（web）

| 字段 | 值 |
|---|---|
| hat_id | 30 |
| task_slug | `harness-upgrade-2-18-migrate` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_18_migrate.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_18_migrate_audit_R1_20260728.md` |
| git_branch | `task/harness-upgrade-2-18-migrate` |
| notes | 维护者下发：钉 @cyning/harness@2.18.0 + wiki_delta 存量迁移；禁 Demo 图页 |

## 范围

upgrade --yes（无 --ide）；manifest→2.18.0；对齐版本钉；docs/tasks/** 补 wiki_delta；
check / verify --task；pnpm 三件套；开 PR（写明 close BLOCK / 禁默认 allow-*-gap）。

## 执行记录

（upgrade 后回填）
