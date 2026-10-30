# invoke 30 · web-specwave-upgrade-3-5-0（2026-10-30）

> **帽**：30（执行） · **task**：`docs/tasks/active/task_web_specwave_upgrade_3_5_0.md`  
> **分支**：`task/specwave-upgrade-3-5-0`（base：main） · **模式**：全程本地 · 零 push/PR  
> **闸核验**：`npx spec-wave@3.5.0 verify --task …` → 闸表 HG-TASK-DRAFT / HG-AUDIT-R1 均 approved（00 代录 · 授权锚 m00236）· R1 审查文落盘后 VERIFY: PASS

## 执行记录

| 步骤 | 结果 |
|------|------|
| 前置 | 工作树干净化（`.codex/` 未跟踪 stash · 完成后 pop）；自 main 新开支线 |
| `npm view spec-wave version` | 3.5.0（time.modified 2026-10-21） |
| upgrade | `npx spec-wave@3.5.0 upgrade --target . --yes` 一把过 · manifest version=3.5.0 from_version=3.3.0 |
| sync prompts | add `FRAGMENT_graph_first_read_v1_zh.md` · conflict 9 本地定制全保留（HG-GRAPH-MODULES 行 grep 复核 1 命中）· 零 --force |
| 钉位 | package.json / pnpm-lock / KIT_CLI → 3.5.0 · coding_wiki ×2 + RUNBOOK §3 钉版字面同步 · 全仓复扫活钉位清零（历史留痕不改） |
| 图谱四闸 | yaml 10/10 · drift 0 · ib 80/0 · ast 49/0 |
| graph-compile | exit 0 · 产物仅 freeze_id/时间戳噪声 → 还原不入库 |
| 三件套 | lint 0 · test 33 文件 296 passed/1 skipped · build 0 |
| 文档 | R1 审查文 `reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md` · FEEDBACK `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md` |

## 新摩擦 / 观察（已入 FEEDBACK）

1. 3.5.0 图谱锚点闸对本仓 dormant（profile `graph_modules_path=l1/01_modules` 自仓根非可达目录 → graph_path_unreachable 跳过不挡 · inform 如实输出）；是否改 profile 使闸生效另议（非本 task 范围）。
2. 包内无 CHANGELOG.md（files 白名单未含 · MIGRATION.md 指针落空）。
3. verify 闸序：missing R<n> review 先于图谱锚点步 BLOCK · 首次诊断需二次执行。

**自检结论真值**：见 task 文「### 自检结论」表（与本记录一致）。
