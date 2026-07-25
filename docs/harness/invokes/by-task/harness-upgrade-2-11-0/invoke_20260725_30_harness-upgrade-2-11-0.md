# Harness invoke 快照：harness-upgrade-2-11-0

| 字段 | 值 |
|------|-----|
| hat_id | 10 / 22 / 30 / 40（00 统筹同会话顺次） |
| task_slug | `harness-upgrade-2-11-0` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_11_0.md` |
| related_review_or_none | `docs/harness/reviews/task_harness_upgrade_2_11_0_audit_R1_20260725.md` |
| git_branch | `task/harness-upgrade-2-11-0` |
| created_utc_or_local | 2026-07-25 |
| notes | 部署前版本对齐；依据 dogfood checklist（关账 2.11.0）；后端仓不动（部署会话并发） |

## Prompt 快照
```text
30 执行：npx @cyning/harness@latest upgrade --target . --yes 升 2.11.0；处理 V2 帽文件
更名残留；恢复 manifest 自定义字段；check / lifecycle show / discipline show 摸底；
verify PASS + 三件套回归。
```

## 交付摘要
- **验证**：`harness check` 包/manifest 均 2.11.0「已是最新」；`lifecycle show`（5 状态机）/ `discipline show`（28 条：mechanical 13 / partial 6 / prompt-only 9）只读摸底；`verify` PASS；pnpm lint/test(69)/build 全绿；graph-compile OK
- **变更**：`.cyning-harness/manifest.json`（2.2.1→2.11.0，字段合并恢复）；`docs/harness/prompts/`（V2 更名：10-spec-requirements / 10-task-requirements / 20-spec-audit / 20-task-audit 新进，10-requirements / 22-task-audit 删除）；FRAGMENT/README 刷新
- **摩擦记录**（供 dogfood 摩擦本）：① upgrade 复制文件后 sync apply 因自身造成的脏工作区（local.json M）中止，须 commit 后重跑——向导应自清或自动续跑；② upgrade 再次整体重写 manifest 丢失自定义字段（name/tech_graph_dir/tasks_dir/hooks/ide 裁剪），W0 已踩过同一坑，2.11.0 仍未修
- **下一棒**：交还 00 → CLOSE
