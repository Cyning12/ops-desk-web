# Harness invoke 快照：harness-upgrade-2-2-1

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 / 30 / 40（00 统筹同会话顺次执行） |
| task_slug | `harness-upgrade-2-2-1` |
| task_paths | `docs/tasks/active/task_harness_upgrade_2_2_1.md` |
| related_review_or_none | 无 |
| git_branch | `task/harness-upgrade-2-2-1` |
| created_utc_or_local | 2026-07-24 |
| notes | 人闸权限已由用户授权 00 统筹代签（HG-AUDIT-R1 / HG-GRAPH-MODULES） |

---

## 可复制 Prompt 快照

```text
10-task 起草：依 Kickoff Prompt W0 —— harness 2.1.1→2.2.1 升级；AGENTS.md 补
「新会话启动纪律」+ Harness Starter 片段（Verify 改 pnpm lint/test/build）；
CLAUDE.md 经 @AGENTS.md 继承，不重复片段。验收：verify PASS；task close /
lint-done 可用。30 执行：upgrade/install 落盘 prompts 与 invokes；编辑
AGENTS.md；40 自检：verify --target . PASS、CLI 子命令可用、manifest 关键字段
（name/tech_graph_dir/tasks_dir/hooks）保留。
```

---

## 交付摘要（本帽结束时填）

- **验证命令**：`npx @cyning/harness verify --target .` → PASS（exit 0）；`task close --help` / `task lint-done` 正常输出（CLI v2.2.1）
- **变更路径**：
  - `.cyning-harness/manifest.json`（2.1.1 → 2.2.1，preset harness-only，保留 name/tech_graph_dir/tasks_dir/hooks）
  - `.cyning-harness/profile.json`、`QUICKREF.md`、`local.json`（install 新增）
  - `docs/harness/prompts/`（8 个 2.2.1 prompts）、`docs/harness/invokes/TEMPLATE_invoke.md`
  - `.cursor/rules/06-harness-pointer.mdc`
  - `docs/tasks/_views/`、`docs/tasks/done/`（目录就位）
  - `AGENTS.md`（+新会话启动纪律节、+Harness Starter 片段）
- **决策记录**：原 manifest preset 为 `fullstack-node-py`，但 install 向导在缺 profile 时仅提供 harness-only / fullstack-node-py 两档；fullstack 会写入 Next+pytest CI 样例与 coding_wiki，不适用本仓（Vue 前端），故选 harness-only，图谱/wikipedia 轨沿用既有文件。
- **下一棒**：交还 00 → CLOSE

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-24 | W0 10/30/40 同会话完成，落盘 invoke |
