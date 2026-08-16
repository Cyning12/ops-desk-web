# Task：Harness 升级至 2.24.0（web）

> **状态**：active  
> **类型**：基础设施（过程轨 upgrade）  
> **关联**：npm `@cyning/harness@2.24.0` · api 仓已钉 2.24.0 · RUNBOOK_harness_upgrade_v1_zh  
> **上游**：已 CLOSE `harness-upgrade-2-22-1`（overlay 契约已接入）  
> **触发**：维护者：LC Evidence 任务前须先升到最新 harness

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-24-0` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `upgrade --yes`（无 `--ide`）；`check` 最新；二次同版 upgrade 确认 `from_version` 仍为 `2.22.1`；`lint-wiki-delta`（含 `--strict`）；`wiki export --json`；`verify --task`；`pnpm lint/test/build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸；一把 2.22.1→2.24.0（含 2.22.2 / 2.23.0） |
| **git_branch** | `task/harness-upgrade-2-24-0` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 sync / manifest 升级 / 版本钉；不改 Inform 模块边界或 flow |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版 2.24.0；顺带 bump coding_wiki 命令版本字面 |
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
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 + 版本钉；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者：任务前升到 latest（2.24.0） |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施 upgrade；无业务 Vue/API 逻辑 |

---

## 背景与目标

本仓 `manifest=2.22.1`；npm latest 与 `ops-desk-api` 均为 **2.24.0**。overlay 契约（`graph_modules_path` + AGENTS local）已在 2.22.1 接入，本波 **不必再迁契约**，一把升到 **2.24.0**。

跨版要点（产品 CHANGELOG）：

- **2.22.2**：同钉版二次 upgrade 保留 `from_version`（本仓 FEEDBACK U1 已合入产品）
- **2.23.0**：Agent Skills 封装；`skills/` **不**随 upgrade 推入本仓（待消费者拉动信号）
- **2.24.0**：`graph yaml` G-L 递归发现 / `export --input DIR`；本仓 `scripts/graph-compile.sh` 先保持兼容，不顺手改业务脚本除非 compile 红

**完成态**：

- [x] `npx @cyning/harness@2.24.0 upgrade --target . --yes`（无 `--ide`）→ manifest `2.24.0`
- [x] `check` → 已是最新
- [ ] 二次同版 upgrade：`from_version` 仍为 `2.22.1`（非 null）；overlay diff 空
- [x] `task lint-wiki-delta --scope all` missing=0；可选 `--strict`
- [x] `wiki export --json`：nodes≥4 · edges>0
- [x] RUNBOOK / coding_wiki 命令字面钉 `@2.24.0`
- [x] `verify --task` PASS；`pnpm lint` / `test` / `build` 绿
- [x] `./scripts/graph-compile.sh` 通过（仅还原时间戳噪声）
- [x] invoke 已回填；不拉 `skills/` 进本仓（自检/CLOSE 仍待二次 upgrade）

**不做**：业务 Vue/API；cyning-harness 产品仓源码；默认把 `skills/` 同步进 web；改 Chat / LC Evidence 页面；强制 CI `--strict`

---

## 失败路径

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| S5 dirty 挡 upgrade | 先 commit task+R1；勿默认 `--force` | 是 | Agent 停，报告脏文件 |
| upgrade 冲掉 overlay local | diff 后确认写在产品 marker 外；记摩擦 | 是 | 过程轨 diff |
| 二次 upgrade `from_version=null` | 停并记 FEEDBACK；不手改蒙混 | 否（产品回归） | 报告维护者 |
| lint-wiki-delta missing>0 | 补 wiki_delta + note | 是 | CLI 列表 |
| graph-compile 红 | 先查 2.24 递归行为；不扩大改业务 yaml | 是 | compile stderr |
| pnpm 三件套红且与 harness 无关 | 只报告，不顺手大改业务 | 人判 | CI 输出 |
| local.json 写 ephemeral npx | 改回产品仓根（gitignore 已列） | 是 | 路径 |

---

## 验收标准

- [x] manifest=2.24.0 · preset=`harness-only` · ide 三轨未裁 · `from_version=2.22.1`
- [x] `check` 已是最新 · exit 0
- [x] overlay：AGENTS/CLAUDE local 块仍在产品 marker 外；FRAGMENT 仍为 `l1/01_modules`
- [x] 未新增仓根 `skills/`（2.23 默认不分发执行帽，且本仓不拉动）
- [x] lint-wiki-delta PASS；wiki export nodes≥4 · edges>0
- [x] pnpm 三件套绿；graph-compile 通过

---

### KPI

Task_KPI%: （CLOSE 时填）

| 维 | 分 |
|---|---|
| D1 完成度 | |
| D2 可验证 | |
| D3 范围纪律 | |
| D4 摩擦记录 | |
| D5 文档对齐 | |

---

### 经验沉淀（recommended）

（CLOSE 前填；Wiki: docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md）

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | |
| **manifest** | |
| **check** | |
| **overlay** | |
| **from_version 二次 upgrade** | |
| **lint-wiki-delta** | |
| **pnpm** | |
| **摩擦** | |
| **R1** | `docs/harness/reviews/task_harness_upgrade_2_24_0_audit_R1_20260816.md` |
