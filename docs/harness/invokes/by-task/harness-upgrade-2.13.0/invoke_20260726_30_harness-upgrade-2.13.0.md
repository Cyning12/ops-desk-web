# Invoke：30 执行编码 · harness-upgrade-2.13.0（web）

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2.13.0` |
| freeze_id | — |
| task_paths | `docs/tasks/active/task_harness_upgrade_2.13.0.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2.13.0_audit_R1_20260726.md` |
| git_branch | `task/harness-upgrade-2.13.0` |
| worktree_root | — |
| created_utc_or_local | 2026-07-26 |
| notes | web 2.11.1→2.13.0；避 F1b（不带 `--ide`）；对齐 api |

---

## 可复制 Prompt 快照

```text
给web项目留下task，进行升级
```

---

## 交付摘要

### 升级结论

| 项 | 结果 | 证据 |
|---|---|---|
| `upgrade --yes`（无 `--ide`） | **一把过** | apply → local.json → manifest · 无 S5 |
| manifest | **2.13.0** | `from_version: 2.11.1` · 仅五字段 |
| `harness check` | 已是最新 | `@cyning/harness@2.13.0` |
| `verify --task` | **PASS** | 双闸 approved |
| 业务三件套 | **PASS** | `pnpm lint` · `pnpm test` 69 passed · `pnpm build` |

### 下一棒

自检勾选 → `task close` · checklist 回填 · 可选 PR

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-26 | 30/40 · web 2.11.1→2.13.0 一把过 |
