# Task Audit R1：harness-upgrade-2-24-0（web）

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_harness_upgrade_2_24_0.md`  
> **日期**：2026-08-16 · 审查人：00 统筹（兼 20；用户：LC Evidence 任务前须升到 latest）

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | 零阻塞：一把 2.22.1→2.24.0；overlay 已在 2.22.1 就位；不拉 skills/；无业务改码 |
| **流程闸** | HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-TASK-DRAFT = approved（00 代签 · 基础设施） |

## 核对项

- [x] overlay 契约已存在（profile `graph_modules_path` + AGENTS local）；本波无需再迁
- [x] `invoke_retention_profile=minimal` + `required_invoke_hats=30`
- [x] `graph_delta=none`；`wiki_delta`=升级 RUNBOOK path + note
- [x] 非范围：不改业务 Vue/API；不改 cyning-harness 产品仓；不默认同步 `skills/`
- [x] 禁止 `--ide`；勿默认 `--allow-*-gap` / `--force`
- [x] 二次 upgrade 验收 `from_version` 保留（2.22.2 修复点 / 本仓 U1）
- [x] 2.24 `graph yaml` 递归：验收 compile 绿即可，不把脚本重构塞进本 task

## 签收

**签收**。下一棒：commit task+R1 → `upgrade --yes`（钉 `@2.24.0`）→ 二次 upgrade → lint/verify/pnpm/graph-compile → CLOSE。
