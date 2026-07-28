# Task：Harness 升级至 2.22.1（web）· overlay 契约

> **状态**：active  
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
| **wiki_delta_note** | 钉版与 overlay §1.2.1 指针；coding_wiki 仅版本字面 bump 若触及 |
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

本仓 `manifest=2.19.0`；npm latest=`2.22.1`。api 已 dogfood 至 2.22.0（overlay U2）。按产品 RUNBOOK §1.2.1：**先迁 profile `graph_modules_path` + AGENTS local 块并 commit**，再一把升到 **2.22.1**，验收合规零手恢复。

**完成态**：

- [ ] profile `graph_modules_path=l1/01_modules` + AGENTS/CLAUDE local 块（产品 marker 外）
- [ ] 契约先 commit → `upgrade --yes` → manifest `2.22.1`
- [ ] FRAGMENT 含 `l1/01_modules`；local 关键词仍在；二次 upgrade overlay 相关 diff 宜空
- [ ] `check` 已是最新；`lint-wiki-delta` missing=0
- [ ] 升级 RUNBOOK 钉版；`verify --task`；`pnpm` 三件套绿
- [ ] invoke + 自检 + CLOSE；更新 PR #15

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

- [ ] manifest=2.22.1 · preset=`harness-only` · ide 未裁
- [ ] overlay 零手恢复（local + FRAGMENT 路径）
- [ ] lint-wiki-delta PASS；pnpm 三件套绿
- [ ] PR 更新说明
