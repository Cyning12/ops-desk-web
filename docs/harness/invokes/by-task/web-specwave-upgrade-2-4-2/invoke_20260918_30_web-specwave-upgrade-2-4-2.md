# Invoke：30 · web-specwave-upgrade-2-4-2

| 字段 | 值 |
|------|-----|
| hat | 30 |
| task_slug | `web-specwave-upgrade-2-4-2` |
| task_paths | `docs/tasks/active/task_web_specwave_upgrade_2_4_2.md` |
| related_review | `docs/harness/reviews/task_web_specwave_upgrade_2_4_2_audit_R1_20260918.md` |
| git_branch | `task/web-specwave-2-4-2` |
| started_at | 2026-09-18 |

## GATE_VERIFY（开工）

| human_gate_id | status | evidence |
|---------------|--------|----------|
| HG-GRAPH-MODULES | approved | task 表 · 过程轨不改模块 |
| HG-TASK-DRAFT | approved | task 表 · 维护者 Implement |
| HG-AUDIT-R1 | approved | R1 PASS · task 表 |

## 计划步骤

1. 钉 `spec-wave@2.4.2` + upgrade
2. 字面 / D-PIN / refresh / sync
3. 裸 SPEC 迁夹
4. 验收 + FEEDBACK
