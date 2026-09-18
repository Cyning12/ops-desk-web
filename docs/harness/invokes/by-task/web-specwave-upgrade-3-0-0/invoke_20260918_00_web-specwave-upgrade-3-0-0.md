# Invoke：00 · web-specwave-upgrade-3-0-0（统筹签收 + 派工）

| 字段 | 值 |
|------|-----|
| hat | 00 |
| task_slug | `web-specwave-upgrade-3-0-0` |
| related_review | `docs/harness/reviews/task_web_specwave_upgrade_3_0_0_audit_R1_20260918.md` |
| git_branch | `task/web-specwave-3-0-0` |
| started_at | 2026-09-18 |

## 00 裁定

> 「继续统筹 3.0.0 的升级」

| 项 | 结论 |
|----|------|
| 目标钉 | `spec-wave@3.0.0` |
| hooks 物化 | **不入库**（删 `.cursor/hooks.json` · 还原 Claude PreToolUse hook-guard） |
| schema v2 | 不强制 |

### 闸复签

| human_gate_id | status |
|---------------|--------|
| HG-GRAPH-MODULES | approved |
| HG-TASK-DRAFT | approved |
| HG-AUDIT-R1 | approved |

## 派工板

| 序 | 帽 | 工作包 | 状态 |
|----|----|--------|------|
| 1 | 10/20 | task + R1 | done（本窗） |
| 2 | 00 | 签收 + 派 30 | **本窗** |
| 3 | 30 | 钉版/upgrade/字面/host update（无 hooks）/验收/FEEDBACK | **派 · 立即开工** |
| 4 | 00 | push + PR | pending 30 后 |
| 5 | 维护者 | CI 绿 merge | pending |
| 6 | 00/30 | CLOSE | merge 后 |
