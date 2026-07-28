# Invoke：30（含 40）· harness-upgrade-2.17.0（web）

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2.17.0` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2.17.0.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2.17.0_audit_R1_20260728.md` |
| git_branch | `task/harness-upgrade-2.17.0` |
| created_utc_or_local | 2026-07-28 |
| notes | 用户下发：升级到 npm latest 并确认 2.17.0 使用方案 |

---

## 可复制 Prompt 快照

```text
upgrade --yes（无 --ide）；manifest→2.17.0；check / verify --task；
确认 pre-30 invoke 硬闸与 close 闭环硬闸用法；pnpm lint/test/build；
不做业务改码 / 强制 hook / 改 api·产品仓。
```

---

## 交付摘要

- **upgrade**：`npx @cyning/harness@2.17.0 upgrade --target . --yes` → exit 0 **一把过**（未带 `--ide`）
- **manifest**：`2.16.1` → `2.17.0`；五字段；preset=`harness-only`；ide=`cursor,claude,agents`（**未被裁**）
- **sync 净 diff**：prompts `30-execute` / `FRAGMENT_30_gate_verify` / `TEMPLATE_30_gate_stop`（pre-30 硬闸文案）+ manifest + local.json；AGENTS/CLAUDE/cursor 指针与模板字节一致未入 diff
- **check**：已是最新 · exit 0
- **verify --task**：PASS（`minimal` + `required_invoke_hats=30` → 无 pre-30 BLOCK；缺 30 文件仅 WARN）
- **local.json**：沙箱 npx 缓存路径改为稳定产品仓 `/Users/cyning/Desktop/Projects/cyning-harness`（2.17.0）
- **业务三件套**：`pnpm lint` 0 · `pnpm test` 75 passed · `pnpm build` 0
- **graph-compile**：exit 0；时间戳噪声已还原不入 commit
- **摩擦**：无 F1b；无 ide 裁剪；CLI `--help` 顶层未列出 close 的 `--allow-kpi-gap` 等（真值见 USER_GUIDE §6.0 / close 实现）
- **下一棒**：纪律层 commit → 可选 push/PR → `task close`

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-28 | upgrade 2.16.1→2.17.0 + 新用法摸底 + pnpm 三件套 |
