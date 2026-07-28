# RUNBOOK · Harness 升级 Checklist（ops-desk-web）

> **用途**：每次 `npx @cyning/harness@latest upgrade` 前照单执行。  
> **来源**：2.1.1→2.2.1（W0）与 2.2.1→2.11.0 两次升级实证；摩擦根因见  
> `Projects/docs/harness/guides/ANALYSIS_upgrade_wizard_friction_20260725_v1_zh.md`。  
> **2.11.1+**：F1（local.json 自脏）/ F2（死字段 WARN）已在产品修复；§1 旧变通已废止。  
> **残留**：`--ide` 仍可能在 apply 前写脏 `profile.json` 触发 S5（摩擦 **F1b**）→ 先单独 commit profile，或升级时不要带会改 profile 的 `--ide`。  
> **2.17.0+**：`verify --task` 对 **pre-30 invoke**（`required ∩ {10,20,00}`）硬闸；`task close` 增 **graph_delta / KPI / experience**。升级类 task 建议 `invoke_retention_profile: minimal` + `required_invoke_hats: 30`，并填 `graph_delta`/`graph_delta_note` 与可解析 `### KPI`。

---

## 0. 前置

- [ ] 工作区干净（`git status --short` 为空）
- [ ] 查最新版：`npm view @cyning/harness version`
- [ ] 起 task 文件 `docs/tasks/active/task_harness_upgrade_<新版>.md`（类型：基础设施；双闸 00 代签）+ 分支 `task/harness-upgrade-<新版>`
- [ ] **先 commit** task + R1（S5），再跑 upgrade；勿在脏仓硬 `--force` 除非人判

## 1. 升级执行

- [ ] `npx @cyning/harness@latest upgrade --target . --yes`
- [ ] 若需改 IDE tracks：优先**先**改 `profile.json` 并 commit，再 upgrade；或接受 F1b 后 commit profile 重跑
- [ ] 按向导警告删除 obsolete 帽文件（如 V2 更名残留），确认无新旧双真值并存
- [ ] 期望：**一把过**（apply 成功后再写 `local.json` / manifest）；stdout 若有死字段应见 `WARN: manifest 以下非标准字段将被移除…`

## 2. 升级后核查

- [ ] `git diff .cyning-harness/manifest.json`：确认 version 已更新
- [ ] **manifest 只保留 schema 五字段**（version / preset / ide / from_version / upgraded_at）
- [ ] 若仍含旧字段：精简删除并 commit（不应再恢复死字段）

## 3. 验证

- [ ] `npx @cyning/harness check` → 「已是最新」
- [ ] `npx @cyning/harness verify --target . --task <本 upgrade task>` → PASS（**2.11.0+** R\<n\> 审查文；**2.17.0+** pre-30 invoke / graph_delta WARN）
- [ ] `npx @cyning/harness task close --help` 正常输出（闭环豁免旗见 USER_GUIDE §6.0，勿依赖顶层 help 全文列出）
- [ ] 业务三件套回归：`pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [ ] `./scripts/graph-compile.sh` 通过（若本仓启用图谱）；**还原**仅时间戳噪声，勿入 commit
- [ ] 只读摸底（可选）：`lifecycle show` / `discipline show` / `status --json`
- [ ] 若 Cursor Agent 在 sandbox 跑 upgrade：检查 `local.json` 是否指向 ephemeral npx 缓存，必要时改为本机产品仓根或用户 npx 缓存

## 4. 收尾

- [ ] invoke 落盘 `docs/harness/invokes/by-task/<slug>/`（含本次新摩擦记录，如有）
- [ ] task 回填自检结论 → `npx @cyning/harness task close --file <task> --yes`
- [ ] PR 合并回主分支，删分支
- [ ] 若踩到新摩擦：追加到 `Projects/docs/harness/guides/` 摩擦本（CHECKLIST §3 格式）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-25 | 首版：两次升级实证提炼；F1/F2 变通写入；死字段恢复动作废止 |
| 2026-07-26 | **2.11.1 回归**：删 F1/F2 变通；记 F1b（`--ide` 先写 profile） |
| 2026-07-28 | **2.17.0**：pre-30 / close 闭环硬闸；upgrade task 元信息与 local.json 沙箱路径注意 |
