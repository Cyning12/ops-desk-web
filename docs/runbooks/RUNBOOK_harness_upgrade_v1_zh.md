# RUNBOOK · Harness 升级 Checklist（ops-desk-web）

> **用途**：每次 `npx dsh-coding-kit@latest upgrade` 前照单执行。  
> **来源**：2.1.1→2.2.1（W0）与 2.2.1→2.11.0 两次升级实证；摩擦根因见  
> `Projects/docs/harness/guides/ANALYSIS_upgrade_wizard_friction_20260725_v1_zh.md`。  
> **2.11.1+**：F1（local.json 自脏）/ F2（死字段 WARN）已在产品修复；§1 旧变通已废止。  
> **残留**：`--ide` 仍可能在 apply 前写脏 `profile.json` 触发 S5（摩擦 **F1b**）→ 先单独 commit profile，或升级时不要带会改 profile 的 `--ide`。  
> **2.17.0+**：`verify --task` 对 **pre-30 invoke**（`required ∩ {10,20,00}`）硬闸；`task close` 增 **graph_delta / KPI / experience**。升级类 task 建议 `invoke_retention_profile: minimal` + `required_invoke_hats: 30`，并填 `graph_delta`/`graph_delta_note` 与可解析 `### KPI`。  
> **2.18.0+**：`task close` 增 **wiki_delta**（缺字段 BLOCK；`none`/`n/a` 须 note）；`experience_capture=required` 且 `wiki_delta=path` 时经验节须晋升指针。勿默认 `--allow-wiki-gap`。  
> **2.19.0+**：`task lint-wiki-delta` 替代手工 `rg -L`；启用 WikiTrack 后新 task **勿再默认 `n/a`**（`path` / `none`+note）。Obsidian vault 只开 `docs/coding_wiki/`。  
> **2.22.0+**：overlay 部分根治——仓内定制写 `<!-- cyning-harness-local:begin/end -->`（产品 marker **外**）；profile 可选 `graph_modules_path`（本仓 `l1/01_modules`）。  
> **2.22.1+**：RUNBOOK §1.2.1 **先迁并 commit 契约 → 再 upgrade**（脏树常 S5）。  
> **2.24.0+**：`graph yaml` G-L 递归发现；Skills 封装不随 upgrade 推入本仓。
> **dsh-coding-kit 1.2.1+**：产品迁仓更名（`@cyning/harness` → `dsh-coding-kit`，CLI 语义对齐 2.24.0）；命令前缀 `npx dsh-coding-kit`；manifest 目录仍 `.cyning-harness/`。
> **1.2.2+**：peer 已标 optional（D1 修复，pnpm 默认配置可直装；`.npmrc` 变通已移除）；adapter 示例命令字面已换名（D2 修复）。  
> **1.6.1**：与 ops-desk-api 对齐；`graph-compile.sh` D-PIN（`KIT_CLI=dsh-coding-kit@1.6.1` + `npx --yes`）。  
> **1.10.0**：补跑官方 `upgrade`（#21 仅钉 package 未升 manifest）；`KIT_CLI=dsh-coding-kit@1.10.0`；当前钉版 **1.10.0**。

---

## 0. 前置

- [ ] 工作区干净（`git status --short` 为空）
- [ ] 查最新版：`npm view dsh-coding-kit version`
- [ ] 起 task 文件 `docs/tasks/active/task_coding_kit_upgrade_<新版>.md`（类型：基础设施；双闸 00 代签）+ 分支 `task/coding-kit-upgrade-<新版>`
- [ ] **先 commit** task + R1（S5），再跑 upgrade；勿在脏仓硬 `--force` 除非人判

## 1. 升级执行

- [ ] `npx dsh-coding-kit@latest upgrade --target . --yes`
- [ ] 若需改 IDE tracks：优先**先**改 `profile.json` 并 commit，再 upgrade；或接受 F1b 后 commit profile 重跑
- [ ] 按向导警告删除 obsolete 帽文件（如 V2 更名残留），确认无新旧双真值并存
- [ ] 期望：**一把过**（apply 成功后再写 `local.json` / manifest）；stdout 若有死字段应见 `WARN: manifest 以下非标准字段将被移除…`

## 2. 升级后核查

- [ ] `git diff .cyning-harness/manifest.json`：确认 version 已更新
- [ ] **manifest 只保留 schema 五字段**（version / preset / ide / from_version / upgraded_at）
- [ ] 若仍含旧字段：精简删除并 commit（不应再恢复死字段）

## 3. 验证

- [ ] `npx dsh-coding-kit check` → 「已是最新」
- [ ] `npx dsh-coding-kit verify --target . --task <本 upgrade task>` → PASS（**2.11.0+** R\<n\> 审查文；**2.17.0+** pre-30 invoke / graph_delta WARN；**2.18.0+** wiki_delta WARN，`--strict-wiki-delta` 可 BLOCK）
- [ ] `npx dsh-coding-kit@1.10.0 task lint-wiki-delta --target . --scope all` → missing=0 · exit 0
- [ ] （若已启用 WikiTrack）`npx dsh-coding-kit@1.10.0 wiki export --json --target .` → nodes≥4 · edges>0
- [ ] （≥2.22）先完成 overlay 契约（profile `graph_modules_path` + AGENTS local）并 **commit**，再 upgrade；二次 upgrade 后 overlay 相关 diff 宜空
- [ ] `npx dsh-coding-kit task close --help` 正常输出（闭环豁免旗见 USER_GUIDE §6.0：含 `--allow-wiki-gap`；勿当默认绿路径）；关账用 `--file`，**勿**加 `--target .`
- [ ] 业务三件套回归：`pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [ ] upgrade 后看 `hint · overlay`；合规路径下 **无需**从 backup 手贴 local/FRAGMENT
- [ ] `./scripts/graph-compile.sh` 通过（若本仓启用图谱）；**还原**仅时间戳噪声，勿入 commit
- [ ] 只读摸底（可选）：`lifecycle show` / `discipline show` / `status --json`
- [ ] 若 Cursor Agent 在 sandbox 跑 upgrade：检查 `local.json` 是否指向 ephemeral npx 缓存，必要时改为本机产品仓根或用户 npx 缓存

## 4. 收尾

- [ ] invoke 落盘 `docs/harness/invokes/by-task/<slug>/`（含本次新摩擦记录，如有）
- [ ] task 回填自检结论 → `npx dsh-coding-kit task close --file <task> --yes`
- [ ] PR 合并回主分支，删分支
- [ ] 若踩到新摩擦：追加到 `Projects/docs/harness/guides/` 摩擦本（CHECKLIST §3 格式）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-25 | 首版：两次升级实证提炼；F1/F2 变通写入；死字段恢复动作废止 |
| 2026-07-26 | **2.11.1 回归**：删 F1/F2 变通；记 F1b（`--ide` 先写 profile） |
| 2026-07-28 | **2.17.0**：pre-30 / close 闭环硬闸；upgrade task 元信息与 local.json 沙箱路径注意 |
| 2026-07-28 | **2.18.0**：wiki_delta close 硬闸 + 晋升指针；存量 task 补 `n/a`+note；钉版 2.18.0 |
| 2026-07-28 | **2.19.0**：一把升自 2.18.0；lint-wiki-delta；WikiTrack 启用；钉版 2.19.0 |
| 2026-07-28 | **2.22.1**：一把升自 2.19.0；§1.2.1 overlay 契约；钉版 2.22.1 |
| 2026-08-16 | **2.24.0**：一把升自 2.22.1（含 2.22.2 / 2.23.0）；钉版 2.24.0；不拉 skills/ |
| 2026-08-17 | **dsh-coding-kit 1.2.1**：迁仓更名；命令前缀更换；钉版 1.2.1；pnpm 需 `--config.auto-install-peers=false`（peer 链含未发布包） |
| 2026-08-17 | **dsh-coding-kit 1.2.2**：FEEDBACK D1/D2/D3 修复验收；移除 `.npmrc` 变通；钉版 1.2.2 |
| 2026-08-25 | **dsh-coding-kit 1.6.1**：跳版自 1.2.2；D-PIN graph-compile；钉版 1.6.1 |
| 2026-08-31 | **dsh-coding-kit 1.10.0**：补跑 upgrade（manifest 自 1.6.1）；KIT_CLI / package 三钉一致；钉版 1.10.0 |
