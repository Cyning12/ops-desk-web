# Invoke：30（含 40）· harness-upgrade-2-24-0（web）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2-24-0` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_24_0.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_24_0_audit_R1_20260816.md` |
| git_branch | `task/harness-upgrade-2-24-0` |
| created_utc_or_local | 2026-08-16 |
| notes | 维护者：LC Evidence 任务前升到 @cyning/harness@2.24.0；禁 --ide；不拉 skills/ |

## GATE_VERIFY

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 任务前须升级 | Y | N | Y |
| HG-AUDIT-R1 | approved | 00 代签基础设施 | Y | Y | Y |
| HG-GRAPH-MODULES | approved | 00 代签仅过程轨 | Y | Y | Y |

reviews：`task_harness_upgrade_2_24_0_audit_R1_20260816.md` 存在且 R1 通过？ **是**

pre-30 invoke：`minimal` → 无 preRequired，不挡 30。

结论：**可进入过程轨 upgrade（不改业务 Vue/API）**

## 范围

`npx @cyning/harness@2.24.0 upgrade --target . --yes`（无 `--ide`）；
manifest→2.24.0；对齐 RUNBOOK / coding_wiki 版本钉；
check / 二次 upgrade / lint-wiki-delta / wiki export / verify --task / pnpm 三件套 / graph-compile。

## 执行记录

（upgrade 后回填）
