# Task：Harness 升级至 2.13.0（web）

> **状态**：completed  
> **类型**：基础设施（过程轨 upgrade）  
> **关联**：`Projects/docs/harness/guides/CHECKLIST_harness_pilot_dogfood_v1_zh.md` · npm `@cyning/harness@2.13.0` · 对齐 api 已升版本

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2.13.0` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 干净仓 `upgrade --yes`（不带 `--ide`，避 F1b）一把过；`harness check` 已是最新；业务三件套 `pnpm lint` / `pnpm test` / `pnpm build` 不因过程轨同步而红 |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸（RUNBOOK 基础设施惯例） |
| **git_branch** | `task/harness-upgrade-2.13.0` |
| **experience_capture** | `recommended` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 / IDE starter，不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者指示 web 升至 2.13.0 + 回填 checklist |
| **HG-AUDIT-R1** | approved | **30** | 00 代签（用户 2026-07-26 授权）：基础设施 upgrade，无业务逻辑 |

---

## 背景与目标

api 已升至 **2.13.0**；本仓仍为 **2.11.1**。需升级对齐产品包（含 2.12+ invoke hats · `lifecycle dry-run` close_*），并回填 dogfood checklist。

**完成态**：

- [x] `.cyning-harness/manifest.json` → `version: 2.13.0`
- [x] 干净工作区单次 `upgrade --yes`（无 `--ide`）**一把过**（无 S5）
- [x] `npx @cyning/harness check` → 已是最新
- [x] `npx @cyning/harness verify --target . --task <本文件>` PASS
- [x] 可选摸底：`lifecycle show` · `discipline show`
- [x] invoke 落盘 + 自检回填
- [x] Projects checklist 回填（web → 2.13.0）

**不做**：

- 业务前端改码
- 产品仓修 F1b
- ios 升级

---

## 范围

- `.cyning-harness/*` · `docs/harness/prompts/*` · IDE starter（若 sync 触及）
- 本 task / invoke / review · RUNBOOK 若需微调
- `Projects/docs/harness/guides/CHECKLIST_harness_pilot_dogfood_v1_zh.md` 回填

## 非范围

- `src/**` 业务逻辑
- 产品仓 cyning-harness 改码

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 工作区非干净即 upgrade | S5 中止 | 是 | 先 commit/stash |
| 带 `--ide` 触发 F1b | S5（profile 自脏） | 是 | 本轮不带 `--ide` |
| verify 因缺 review | 补 R1 文 | 是 | 按 2.11+ 要求 |

## 验收标准

- [x] manifest `version` = `2.13.0`，仅 schema 五字段
- [x] 单次 upgrade 退出码 0，无 S5 中止
- [x] `harness check` 已是最新
- [x] checklist 已回填 web → 2.13.0
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 仍绿（过程轨不影响业务）

---

### 自检结论（执行者）

- **upgrade 一把过**：干净仓 `npx @cyning/harness@2.13.0 upgrade --target . --yes`（无 `--ide`）；apply → local.json → manifest，无 S5。
- **manifest**：`version: 2.13.0` · `from_version: 2.11.1` · ide 保持 `cursor,claude,agents` · 仅五字段。
- **check / verify**：已是最新；`verify --task` PASS。
- **业务回归**：`pnpm lint` PASS；`pnpm test` **69 passed**；`pnpm build` PASS。
- **F1b**：本轮未带 `--ide`，未复现。
- **checklist**：Projects dogfood checklist 回填 web → 2.13.0。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-26 | 首版 · web 升至 2.13.0 + checklist 回填 |
| 2026-07-26 | 30/40 完成 · 一把过 · pnpm 三件套绿 |
