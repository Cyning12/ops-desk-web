# Harness invoke 快照：web-pulls

| 字段 | 值 |
|------|-----|
| hat_id | 10（00）/ 30（并行子 agent · worktree）/ 40（00 集成复检） |
| task_slug | `web-pulls` |
| task_paths | `docs/tasks/active/task_web_pulls.md` |
| git_branch | `task/web-pulls` → merged `af8eae9` |
| created_utc_or_local | 2026-07-24 |

## Prompt 快照
```text
30 执行：按 task_web_pulls.md 实现 PRs 页（state/ci_status 筛选 + el-table [Draft] 前缀
+ 分页 + 空态）；空列表为实测主线。
```

## 交付摘要
- **验证**：agent 报告 24/24 tests、三件套全绿；00 集成复检通过；带筛选 curl 401（端点在线鉴权生效）
- **变更**：`src/api/pulls.ts`、`src/stores/pulls.ts`、`src/views/PullsView.vue`、`tests/pulls-{store,view}.spec.ts`
- **决策**：分页组件仅 total>0 渲染；store 以服务端 page 回写；jsdom 下 el-table 打桩 ResizeObserver
- **下一棒**：交还 00 → CLOSE
