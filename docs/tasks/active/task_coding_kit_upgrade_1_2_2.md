# Task：dsh-coding-kit 升级至 1.2.2（web · FEEDBACK 修复验收）

> **状态**：30/40 完成 · 待 CLOSE  
> **类型**：基础设施（过程轨 upgrade + FEEDBACK 验收）  
> **关联**：npm `dsh-coding-kit@1.2.2` · `docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_2_1_from_ops_desk_web_20260817.md`（D1/D2/D3）  
> **上游**：`task/migrate-dsh-coding-kit`（1.2.1 迁移，待 CLOSE/合并）  
> **触发**：维护者（2026-08-17 对话）：「coding-kit 已经根据 FEEDBACK 更新，更新并检查是否满足」

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `coding-kit-upgrade-1-2-2` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 净仓 pnpm 默认配置安装验收（D1）；adapter 字面 grep（D2）；README 钉版（D3）；`upgrade --yes` 钉 manifest；`check` / `verify --task`；`graph-compile.sh`；`pnpm lint/test/build`；`--frozen-lockfile` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸（基础设施升级，无业务逻辑） |
| **git_branch** | `task/coding-kit-upgrade-1-2-2` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨版本钉 + FEEDBACK 验收；不改模块边界或 flow |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版 1.2.1 → 1.2.2；移除 auto-install-peers 变通记录（D1 已修） |
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
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨版本钉；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 20-R1 | 维护者（2026-08-17 对话）：「更新并检查是否满足」 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施升级 + FEEDBACK 验收；无业务 Vue/API 逻辑（沿用同型先例） |

---

## 背景与目标

产品侧按本仓 FEEDBACK（D1 peer 链 / D2 adapter 字面 / D3 钉版漂移）发布 `dsh-coding-kit@1.2.2`（2026-08-17T12:29Z）。本 task：**升级钉版并逐项验收 FEEDBACK 是否满足**，含移除 D1 变通（`.npmrc` auto-install-peers=false）。

**完成态**：

- [x] D1 验收：净仓（/tmp 新项目 · pnpm 默认配置）`pnpm add dsh-coding-kit@1.2.2` 成功
- [x] D2 验收：1.2.2 `assets/ide/adapters/*.example` 命令字面 = `npx dsh-coding-kit`（grep 无 `@cyning/harness`）
- [x] D3 验收：README 迁移节钉版 = 1.2.2
- [x] 本仓 devDependency 钉 `1.2.2`；移除 `.npmrc` 变通；lockfile 重解；`--frozen-lockfile` 绿
- [x] `upgrade --yes` → manifest `version=1.2.2` · `from_version=1.2.1`
- [x] RUNBOOK / coding_wiki 钉版字面 1.2.1 → 1.2.2；FEEDBACK 文头补修复确认状态
- [x] `check` / `verify --task` / graph-compile / pnpm 三件套全绿

**不做**：业务 Vue/API；1.2.1 迁移 task 的 CLOSE（维护者另行）；DSH 插件安装

---

## 失败路径

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| D1 净仓安装仍失败 | 保留 `.npmrc` 变通；回填 FEEDBACK 未满足项 | 是 | 报告维护者 |
| 移除 .npmrc 后 lockfile 设置冲突 | `pnpm install --no-frozen-lockfile` 重解一次并入库 | 是 | lockfile diff |
| adapter 仍含旧包名 | 记 D2 未满足；本仓指令块已手修不受影响 | 是 | grep 输出 |
| graph-compile / 三件套红且与升级无关 | 只报告，不扩大改业务 | 人判 | CI 输出 |

---

## 验收标准

- [x] D1/D2/D3 三项逐项 ✅/❌ 结论写入 invoke 与 FEEDBACK 文头状态块
- [x] manifest：`version=1.2.2` · `from_version=1.2.1` · preset/ide 未裁
- [x] `.npmrc` 已移除；`CI=true pnpm install --frozen-lockfile` exit 0
- [x] `check` exit 0；`verify --task` PASS；graph-compile 绿；三件套绿
