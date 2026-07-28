# Task Audit R1：harness-upgrade-2.17.0（web）

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_harness_upgrade_2.17.0.md`  
> **日期**：2026-07-28 · 审查人：00 统筹（兼 20；用户下发：升级到 latest 并确认新版使用方案）

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | 零阻塞：过程轨 upgrade 至 2.17.0 + 新用法摸底；无业务改码 |
| **流程闸** | HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-TASK-DRAFT = approved |

## 核对项

- [x] 验收可执行（manifest 2.17.0 / check 最新 / verify --task / pnpm 三件套）
- [x] `invoke_retention_profile=minimal` + `required_invoke_hats=30`（避开 pre-30 硬闸误挡）
- [x] 已填 `graph_delta=none` + `graph_delta_note`；KPI 节可解析（关账用）
- [x] 非范围明确：不装强制 hook；不改 api / 产品仓；不批量回填历史 KPI
- [x] 禁止 `--ide`（避 F1b）
- [x] 已知破坏性：存量仅 30 invoke 的改码 task 升级后 verify 可能挡 30 → 补救路径须在自检写明

## 阻塞 / 非阻塞

无阻塞。

## 签收

**签收**。下一棒：`upgrade --yes` → verify → 回填 invoke → 确认使用方案。
