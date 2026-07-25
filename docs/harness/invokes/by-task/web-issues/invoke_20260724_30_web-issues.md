# Harness invoke 快照：web-issues

| 字段 | 值 |
|------|-----|
| hat_id | 10（00）/ 30（并行子 agent · worktree）/ 40（00 集成复检） |
| task_slug | `web-issues` |
| task_paths | `docs/tasks/active/task_web_issues.md` |
| git_branch | `task/web-issues` → merged `1912b12` |
| created_utc_or_local | 2026-07-24 |

## Prompt 快照
```text
30 执行：按 task_web_issues.md 实现 Issues 页（筛选 state/label/module/scan_status +
el-table + el-pagination + el-empty）；筛选变更 page 重置 1；空列表为实测主线。
```

## 交付摘要
- **验证**：agent 报告 29/29 tests、三件套全绿；00 集成复检通过
- **变更**：`src/api/issues.ts`、`src/stores/issues.ts`、`src/views/IssuesView.vue`、`tests/issues-{store,view}.spec.ts`
- **决策**：updated_at 可 null（后端源码核实）渲染「—」；scan_status 选项内置常量待真实数据校准；筛选为「查询」按钮显式应用
- **下一棒**：交还 00 → CLOSE
