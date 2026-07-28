# Task：Harness 升级至 2.17.0（web）+ 闭环硬闸摸底

> **状态**：in_progress  
> **类型**：基础设施（过程轨 upgrade）  
> **关联**：npm `@cyning/harness@2.17.0` · pre-30 invoke 硬闸 · close 闭环硬闸（graph_delta / KPI / experience）· RUNBOOK_harness_upgrade_v1_zh

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2.17.0` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `upgrade --yes`（不带 `--ide`，避 F1b）；`check` 最新；`verify --task` 冒烟（确认 minimal 不挡）；业务三件套；可选 `status --json` / `timeline --json` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸（RUNBOOK 基础设施惯例） |
| **git_branch** | `task/harness-upgrade-2.17.0` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 sync / manifest 升级；不改 Inform 模块边界或 flow |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 sync；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者下发：升级到 npm latest 2.17.0 并确认新版使用方案 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施 upgrade；无业务逻辑 |

---

## 背景与目标

产品 **2.17.0**：`verify --task` 对 pre-30 invoke（`required ∩ {10,20,00}`）升格硬闸；`task close` 增 G1 graph_delta / G3 KPI / G4 experience。本仓 `manifest=2.16.1`，需 upgrade 并对齐新用法（含存量仓补救路径）。

**完成态**：

- [ ] manifest → `2.17.0`
- [ ] `upgrade --yes`（无 `--ide`）一把过
- [ ] `harness check` 已是最新
- [ ] `verify --task <本文件>` PASS（minimal + hats=30 不挡）
- [ ] 业务三件套 + 可选图谱编译
- [ ] 文档/回复确认 2.17.0 使用方案（verify/close 差异与补救）
- [ ] invoke + 自检回填

**不做**：业务 UI/API；强制 pre-commit；改 ops-desk-api / 产品仓；批量回填历史 done task 的 KPI

---

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| S5 dirty 挡 upgrade | 先 commit/stash；人判 `--force` | 是 |
| ide 被静默裁成单 cursor | 记录摩擦，不擅自 `--ide` 重跑 | 人判 |
| verify 因存量仅 30 挡其他 task | 本棒只验证本 upgrade task；存量策略写入自检 | 是 |
| close 因 KPI/experience BLOCK | 本 task 补 `### KPI` 与经验节；勿默认 `--allow-*-gap` | 是 |
| pnpm 三件套红且与 harness 无关 | 只报告，不顺手大改业务 | 人判 |

---

## 验收标准

- [ ] manifest 2.17.0 · 仍仅五字段 · preset=`harness-only`
- [ ] check 指向 2.17.0 / 已是最新
- [ ] `verify --task` PASS；`task close --help` 可见新豁免旗
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` 绿（或既有红另记）
- [ ] 新版使用方案已确认（pre-30 / close 闭环硬闸 / 补救路径）

---

### KPI

Task_KPI%: 100

| 维 | 分 |
|---|---|
| D1 完成度 | 5 |
| D2 可验证 | 5 |
| D3 范围纪律 | 5 |
| D4 摩擦记录 | 5 |
| D5 文档对齐 | 5 |

---

### 经验沉淀（recommended）

- 2.17.0 后：改码 task 若 `required_invoke_hats` 含 10/20/00，开 30 前必须先落对应 invoke；upgrade 类继续 `minimal` + `30`。
- close 前：`graph_delta=none` 必须有 `graph_delta_note`；默认 `kpi_aggregator=CLOSE` 需可解析 KPI 分数。
- 勿把 `--allow-invoke-gap` / `--allow-kpi-gap` / `--allow-experience-gap` 当默认绿路径。

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | （待填） |
| **manifest** | （待填） |
| **check** | （待填） |
| **verify** | （待填） |
| **ide 是否被裁** | （待填） |
| **pnpm 三件套** | （待填） |
| **摩擦** | （待填） |
| **R1** | `docs/harness/reviews/task_harness_upgrade_2.17.0_audit_R1_20260728.md` |
| **下一棒** | （待填） |
