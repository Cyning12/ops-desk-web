# Invoke：30（含 40）· harness-upgrade-2-22-1（web）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2-22-1` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_22_1.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_22_1_audit_R1_20260728.md` |
| git_branch | `task/harness-upgrade-2-18-migrate`（延伸） |
| notes | 维护者：继续更新 → 钉 @cyning/harness@2.22.1 + §1.2.1 overlay |

## GATE_VERIFY

| human_gate_id | task表status | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | Y | N | Y |
| HG-AUDIT-R1 | approved | Y | Y | Y |
| HG-GRAPH-MODULES | approved | Y | Y | Y |

结论：**可进入过程轨 / overlay 契约**

## 执行记录

- **契约**：`profile.graph_modules_path=l1/01_modules`；AGENTS/CLAUDE `cyning-harness-local`（产品 marker 外）→ 先 commit
- **upgrade**：`npx --yes @cyning/harness@2.22.1 upgrade --yes --target .` → exit 0；stdout `overlay · FRAGMENT graph_modules_path → l1/01_modules` + `hint · overlay`
- **manifest**：`2.19.0` → `2.22.1`；ide 未裁
- **二次 upgrade**：overlay 相关 `git diff` **空**（零手恢复 PASS）
- **check**：已是最新 · exit 0
- **lint-wiki-delta**：default + `--strict` 均 PASS（missing=0 · issues=0）
- **local.json**：沙箱 ephemeral → 改回 `/Users/cyning/Desktop/Projects/cyning-harness`

| 日期 | 说明 |
|---|---|
| 2026-07-28 | §1.2.1 + 一把升 2.22.1 + 二次 upgrade 验收 |
