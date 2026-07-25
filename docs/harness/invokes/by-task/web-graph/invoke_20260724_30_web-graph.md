# Harness invoke 快照：web-graph

| 字段 | 值 |
|------|-----|
| hat_id | 10（00）/ 30（并行子 agent · worktree）/ 40（00 集成复检） |
| task_slug | `web-graph` |
| task_paths | `docs/tasks/active/task_web_graph.md` |
| git_branch | `task/web-graph` → merged `29ee463` |
| created_utc_or_local | 2026-07-24 |

## Prompt 快照
```text
30 执行：按 task_web_graph.md 实现 Graph 页 v1（snapshot 元信息 + module_matrix 防御性
表格）；全 null 空态为验收重点；不做可视化图。
```

## 交付摘要
- **验证**：agent 报告 25/25 tests、三件套全绿（含数组/对象映射 fixture 表格渲染）；00 集成复检通过
- **变更**：`src/api/graph.ts`、`src/stores/graph.ts`、`src/views/GraphView.vue`、`tests/graph-{store,view}.spec.ts`
- **决策**：原生 table 替代 el-table（jsdom ResizeObserver + 动态列防御）；normalizeMatrix 四种结构归一
- **下一棒**：交还 00 → CLOSE
