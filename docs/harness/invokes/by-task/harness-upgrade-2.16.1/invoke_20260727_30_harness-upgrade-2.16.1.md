# Invoke：30（含 40）· harness-upgrade-2.16.1（web）

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2.16.1` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_16_1.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_16_1_audit_R1_20260727.md` |
| git_branch | `task/harness-upgrade-2.16.1` |
| created_utc_or_local | 2026-07-27 |
| notes | 维护者 30 Prompt：钉到 @cyning/harness@2.16.1 + 过程可观测冒烟；对齐 api；补 R1 后开 PR |

---

## 可复制 Prompt 快照

```text
upgrade --yes（无 --ide）；manifest→2.16.1；冒烟 check / status --json / timeline --json / status --check；
pnpm lint/test/build；纪律层 commit；不做 P3b / 强制 hook / 业务改码。
```

---

## 交付摘要

- **upgrade**：`npx @cyning/harness@2.16.1 upgrade --target . --yes` → exit 0 **一把过**（无 S5；未带 `--ide`）
- **manifest**：`2.13.0` → `2.16.1`；五字段；preset=`harness-only`；ide=`cursor,claude,agents`（**未被裁**）
- **净 diff（upgrade）**：仅 `.cyning-harness/manifest.json` + `local.json`（prompts / IDE starter / AGENTS·CLAUDE 与 2.13.0 **字节一致**，apply 无内容变更）
- **check**：已是最新 · exit 0
- **status --json（全局）**：`obs_status_list.v1` · `tasks: []`（当时无 active task）· exit 0
- **status --task --json**：`obs_status.v1` · `may_start_30=true` · exit 0
- **timeline --json**：`obs_timeline.v1` · WARN 无 HGM · exit 0（未 `--ingest`）
- **status --check**：初轮缺 R1 → exit 2；补 `task_harness_upgrade_2_16_1_audit_R1_*.md` 后 → **exit 0**
- **lifecycle / discipline show**：可用（勿传 `--target`）· exit 0；discipline `as_of: 2.16.1`
- **业务三件套**：`pnpm lint` 0 · `pnpm test` 69 passed · `pnpm build` 0
- **graph-compile**：exit 0；仅刷新 `generated_at`/`freeze_id` 时间戳 → **已还原不入 commit**
- **摩擦**：无 F1b；无 ide 裁剪；跨度 2.13→2.16.1 但 harness-only 轨内容未变（短 diff 属正常）；R1 文件名须对齐 task 文件名 stem（`2_16_1` 非 `2.16.1`）
- **下一棒**：push + PR；P3b 另棒

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-27 | upgrade + 过程可观测冒烟 + pnpm 三件套 + 纪律层 commit |
| 2026-07-27 | 补 R1；`status --check` 绿；开 PR |
