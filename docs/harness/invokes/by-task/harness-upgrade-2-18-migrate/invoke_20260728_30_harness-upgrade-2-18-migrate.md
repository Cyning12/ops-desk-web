# Invoke：30（含 40）· harness-upgrade-2-18-migrate（web）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2-18-migrate` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_18_migrate.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_18_migrate_audit_R1_20260728.md` |
| git_branch | `task/harness-upgrade-2-18-migrate` |
| notes | 维护者下发：钉 @cyning/harness@2.18.0 + wiki_delta 存量迁移；禁 Demo 图页 |

## 范围

upgrade --yes（无 --ide）；manifest→2.18.0；对齐 RUNBOOK 版本钉；docs/tasks/** 补 wiki_delta；
check / verify --task；pnpm 三件套；开 PR（写明 close BLOCK / 禁默认 allow-*-gap）。

## 执行记录

- **upgrade**：`npx @cyning/harness@2.18.0 upgrade --target . --yes` → exit 0 **一把过**（未带 `--ide`）
- **manifest**：`2.17.0` → `2.18.0`；五字段；preset=`harness-only`；ide=`cursor,claude,agents`（**未被裁**）
- **sync**：prompts `30`/`40` 更新（wiki_delta / 晋升指针关账文案）；其它 prompts plan 后无 diff
- **local.json**：沙箱 ephemeral npx 路径 → 稳定产品仓 `/Users/cyning/Desktop/Projects/cyning-harness`（同 2.17.0 摩擦）
- **wiki_delta 迁移**：active 1 + done 20（含 epic）补 `n/a` +「harness-only · 未启用 WikiTrack」；无 `experience_capture=required` → 无需晋升指针
- **版本钉**：README / CI / scripts **无**硬钉 2.17.0；RUNBOOK 增补 2.18.0 说明与修订记录
- **check**：已是最新 · exit 0
- **verify**：`--task` active upgrade / done 2.17.0 / done web-obs-status-consumer → PASS
- **pnpm**：lint / test(75) / build 全绿

| 日期 | 说明 |
|---|---|
| 2026-07-28 | upgrade 2.17.0→2.18.0 + wiki_delta 存量迁移 + pnpm 三件套 |
