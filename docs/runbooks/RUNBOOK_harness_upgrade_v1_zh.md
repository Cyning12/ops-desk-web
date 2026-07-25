# RUNBOOK · Harness 升级 Checklist（ops-desk-web）

> **用途**：每次 `npx @cyning/harness@latest upgrade` 前照单执行。  
> **来源**：2.1.1→2.2.1（W0）与 2.2.1→2.11.0 两次升级实证；摩擦根因见  
> `Projects/docs/harness/guides/ANALYSIS_upgrade_wizard_friction_20260725_v1_zh.md`。  
> **废止条件**：产品仓修复 F1/F2（顺序调整 + warning 清单）发布后，§3 变通段可删。

---

## 0. 前置

- [ ] 在 `master` 且工作区干净（`git status --short` 为空）
- [ ] 查最新版：`npm view @cyning/harness version`
- [ ] 起 task 文件 `docs/tasks/active/task_harness_upgrade_<新版>.md`（类型：基础设施；双闸 00 代签）+ 分支 `task/harness-upgrade-<新版>`

## 1. 升级执行

- [ ] `npx @cyning/harness@latest upgrade --target . --yes`
- [ ] **若 S5 中止（摩擦 F1，必然发生于 npx 缓存路径变化时）**：
  `git add -A && git commit` 已复制的文件 → **重跑同一条 upgrade 命令**（幂等）
- [ ] 按向导警告删除 obsolete 帽文件（如 V2 更名残留 `10-requirements.md` / `22-task-audit.md`），确认无新旧双真值并存

## 2. 升级后核查（摩擦 F2 变通 · 产品修复前必做）

- [ ] `git diff .cyning-harness/manifest.json`：确认 version 已更新
- [ ] **manifest 只保留 schema 五字段**（version / preset / ide / from_version / upgraded_at）：
  2.11.0 起产品不读 `name` / `harness_version` / `tech_graph_dir` / `tasks_dir` / `hooks`，
  **不再恢复这些死字段**（2.2.1 时代的恢复动作已废止；tasks 定位为硬编码双路径、
  tech graph 硬编码 `docs/_tech_graph`）
- [ ] 若 manifest 仍含旧字段：精简删除并 commit

## 3. 验证

- [ ] `npx @cyning/harness check` → 「已是最新」
- [ ] `npx @cyning/harness verify --target .` → PASS（**2.11.0 起 verify 也要求 R<n> 审查文**，缺则先补 `docs/harness/reviews/task_<slug>_audit_R1_<日期>.md`）
- [ ] `npx @cyning/harness task close --help` 正常输出
- [ ] 业务三件套回归：`pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [ ] `./scripts/graph-compile.sh` 通过
- [ ] 只读摸底新能力（可选）：`lifecycle show` / `discipline show`

## 4. 收尾

- [ ] invoke 落盘 `docs/harness/invokes/by-task/<slug>/`（含本次新摩擦记录，如有）
- [ ] task 回填自检结论 → `npx @cyning/harness task close --file <task> --yes`
- [ ] `--no-ff` 合并回 master，删分支
- [ ] 若踩到新摩擦：追加到 `Projects/docs/harness/guides/` 摩擦本（CHECKLIST §3 格式）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-25 | 首版：两次升级实证提炼；F1/F2 变通写入；死字段恢复动作废止 |
