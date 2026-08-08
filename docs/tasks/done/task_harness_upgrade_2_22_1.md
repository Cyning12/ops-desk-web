# Task：Harness 升级至 2.22.1（web）· overlay 契约

> **状态**：completed  
> **类型**：基础设施（upgrade + §1.2.1 overlay 首次接入）  
> **关联**：npm `@cyning/harness@2.22.1` · api dogfood 2.22 · RUNBOOK §1.2.1  
> **上游**：已 CLOSE `harness-upgrade-2-19-0`（WikiTrack 已启用）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-22-1` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | §1.2.1 先 commit 契约再 `upgrade --yes`（无 `--ide`）；二次 upgrade 验收零手恢复；`check`；`lint-wiki-delta`（可选 `--strict`）；`verify --task`；`pnpm lint/test/build` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸；一把 2.19.0→2.22.1 |
| **git_branch** | `task/harness-upgrade-2-18-migrate`（延伸 PR #15） |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 / overlay 契约 / 版本钉；不改 Inform 模块边界 |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版与 overlay §1.2.1；顺带 bump coding_wiki 命令版本字面 |
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
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 + overlay 契约 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者：继续更新 cyning-harness → 钉 2.22.1 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：无业务 Vue/API 逻辑 |

---

## 背景与目标

本仓 `manifest=2.19.0`；npm latest=`2.22.1`。按产品 RUNBOOK §1.2.1：**先迁 profile + AGENTS local 并 commit**，再一把升到 **2.22.1**。

**完成态**：

- [x] profile `graph_modules_path=l1/01_modules` + AGENTS/CLAUDE local 块（产品 marker 外）
- [x] 契约先 commit → `upgrade --yes` → manifest `2.22.1`
- [x] FRAGMENT 含 `l1/01_modules`；local 关键词仍在；二次 upgrade overlay diff 空
- [x] `check` 已是最新；`lint-wiki-delta` missing=0（含 `--strict`）
- [x] 升级 RUNBOOK 钉版；`verify --task`；`pnpm` 三件套绿
- [x] invoke + 自检 + CLOSE；更新 PR #15

**不做**：业务 Vue/API；产品仓源码；强制 CI `--strict`

---

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| S5 dirty | 先 commit 契约；勿默认 `--force` | 是 |
| local 仍被冲 | 核对写在产品 marker 外；记摩擦 | 是 |
| FRAGMENT 回 `01_struct` | 查 profile `graph_modules_path` | 是 |
| lint missing>0 | 补 wiki_delta | 是 |

---

## 验收标准

- [x] manifest=2.22.1 · preset=`harness-only` · ide 未裁
- [x] overlay 零手恢复（local + FRAGMENT 路径）
- [x] lint-wiki-delta PASS（含 strict）；pnpm 三件套绿
- [x] PR 更新说明

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

- ≥2.22 必须先 commit overlay 契约再 upgrade（§1.2.1）；合规路径下二次 upgrade overlay diff 可空。
- `graph_modules_path` 展开 FRAGMENT；`src/**` 仍非产品字段，记在 AGENTS local。
- Wiki: docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-28 |
| **manifest** | `2.22.1`（from 2.19.0）· preset=`harness-only` · ide 未裁 |
| **check** | 已是最新 · exit 0 |
| **overlay** | local 保留；FRAGMENT=`l1/01_modules`；二次 upgrade overlay diff 空 |
| **lint-wiki-delta** | missing=0 · strict issues=0 |
| **pnpm** | lint/test(75)/build 全绿 |
| **摩擦** | local.json 仍写 ephemeral npx（gitignore 已列；收尾改回产品仓根） |
| **R1** | `docs/harness/reviews/task_harness_upgrade_2_22_1_audit_R1_20260728.md` |
