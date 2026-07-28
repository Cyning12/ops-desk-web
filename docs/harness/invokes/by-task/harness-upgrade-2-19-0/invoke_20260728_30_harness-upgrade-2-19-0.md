# Invoke：30（含 40）· harness-upgrade-2-19-0（web）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `harness-upgrade-2-19-0` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_19_0.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_19_0_audit_R1_20260728.md` |
| git_branch | `task/harness-upgrade-2-18-migrate`（延伸） |
| notes | 维护者下发：钉 @cyning/harness@2.19.0 + 同波启用 WikiTrack；禁业务改码 |

## GATE_VERIFY（开工）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 维护者下发 | Y | N | Y |
| HG-AUDIT-R1 | approved | 00 代签 | Y | Y | Y |
| HG-GRAPH-MODULES | approved | 00 代签 | Y | Y | Y |

reviews：`task_harness_upgrade_2_19_0_audit_R1_20260728.md` 存在且签收？ **是**  
pre-30 invoke：`minimal` 无 preRequired → **不挡**  
结论：**可进入改过程轨 / 文档**

## 范围

棒 A：upgrade → 2.19.0；恢复 overlay；check；lint-wiki-delta；pnpm 三件套。  
棒 B：coding_wiki 入口 + RUNBOOK 拷贝；wiki export 有边；Obsidian 约定 vault=`coding_wiki/`。

## 执行记录

（升级后回填）
