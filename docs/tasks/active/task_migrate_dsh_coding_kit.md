# Task：迁移 @cyning/harness → dsh-coding-kit@1.2.1（web）

> **状态**：30/40 完成 · 待 CLOSE  
> **类型**：基础设施（过程轨 migrate）  
> **关联**：npm `dsh-coding-kit@1.2.1`（latest）· 产品仓 [Cyning12/dsh-coding-kit](https://github.com/Cyning12/dsh-coding-kit) · 旧包 `@cyning/harness@2.24.0`  
> **触发**：维护者（2026-08-17 对话）：「对当前项目进行迁移」

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `migrate-dsh-coding-kit` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `dsh-coding-kit check`；`verify --task`；`./scripts/graph-compile.sh`；`pnpm lint/test/build`；迁移后仓内 grep 无 `npx @cyning/harness` 鲜活引用 |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸（基础设施迁移，无业务 Vue/API 逻辑） |
| **git_branch** | `task/migrate-dsh-coding-kit` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨迁移 + 版本钉；不改 Inform 模块边界或 flow |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 命令前缀 @cyning/harness → dsh-coding-kit；钉版 1.2.1 |
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
| HG-TASK-DRAFT | approved | 20-R1 | 维护者（2026-08-17 对话）：「对当前项目进行迁移」 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施迁移；无业务 Vue/API 逻辑（沿用 task_harness_upgrade_2_24_0 同型先例） |

---

## 背景与目标

产品侧已将 `@cyning/harness` 迁移为 **dsh-coding-kit**（DSH bundle 插件 + 同包 CLI，语义对齐 2.24.0）。本仓当前 `manifest=2.24.0`，纯 npx 用法（无 devDependency）。目标：**切到 `dsh-coding-kit@1.2.1` 并钉版，仓内不再依赖旧包名**。

关键兼容事实（迁移前已核源码）：

- 状态目录仍为 `.cyning-harness/`（`manifest.json` 路径不变）
- IDE marker 仍为 `cyning-harness:begin/end` + `cyning-harness-local`（local 块不被改写）
- `init/upgrade/sync/skills build` 不覆盖 S2 过程域（`docs/tasks/`、`reviews/`、`invokes/by-task/`）
- 历史留痕（done tasks / invokes / reviews / evidence）**不回写**，保留旧包名字样

**完成态**：

- [x] `package.json` devDependency 钉 `dsh-coding-kit@1.2.1`（exact）
- [x] `pnpm exec dsh-coding-kit upgrade --yes` → manifest `version=1.2.1` · `from_version=2.24.0`
- [x] `scripts/graph-compile.sh`：`npx @cyning/harness graph yaml` → `pnpm exec dsh-coding-kit graph yaml`（2 处）
- [x] `src/api/obs.ts` 注释：契约字样改 dsh-coding-kit
- [x] `.cursor/rules/06-harness-pointer.mdc` 刷新为新包 adapter 内容
- [x] `AGENTS.md` / `CLAUDE.md` 产品块命令字面刷新；`cyning-harness-local` 块原样保留
- [x] `check` / `verify --task` PASS；`graph-compile.sh` 绿；`pnpm lint/test/build` 绿
- [x] 历史 S2 文档零改动（`docs/tasks/done`、`docs/harness/invokes`、`reviews`、`evidence`）

**不做**：业务 Vue/API 逻辑；历史文档包名清洗；DSH 插件 profile 安装（个人级，另议）；`.dsh/skills/` 拉动（另议）

---

## 失败路径

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| npx/pnpm 因 `~/.npm` 属主 EACCES | 用 `npm_config_cache=/tmp/npm-cache` 或 `pnpm exec` 绕过；禁止 sudo 改属主 | 是 | Agent 停，报告 |
| upgrade 未识别旧 manifest | 停并报告；不手改 manifest 蒙混 | 否 | 报告维护者 |
| upgrade/sync 冲掉 local 块 | diff 后确认 local 在产品 marker 外；记摩擦 | 是 | 过程轨 diff |
| graph-compile 红 | 先查 1.2.1 graph yaml 行为差异；不扩大改业务 yaml | 是 | compile stderr |
| pnpm 三件套红且与迁移无关 | 只报告，不顺手大改业务 | 人判 | CI 输出 |
| grep 仍有鲜活 `npx @cyning/harness` | 补齐遗漏文件再验收 | 是 | grep 列表 |

---

## 验收标准

- [x] manifest：`version=1.2.1` · `from_version=2.24.0` · preset/ide 未裁
- [x] `package.json` 钉 `dsh-coding-kit` exact 版；无 `@cyning/harness` 依赖
- [x] 仓内 grep `npx @cyning/harness`：命中仅历史 S2 文档（done/invokes/reviews/evidence/runbook 旧记录），零鲜活引用
- [x] `AGENTS.md`/`CLAUDE.md` local 块内容逐字未变
- [x] `dsh-coding-kit check` exit 0；`verify --task` PASS
- [x] `./scripts/graph-compile.sh` 通过
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿

---

## 40 自检结论（2026-08-17）

全部完成态与验收标准达成；执行明细与摩擦 F1–F3 见 `docs/harness/invokes/by-task/migrate-dsh-coding-kit/invoke_20260817_30_migrate-dsh-coding-kit.md`。
CLOSE：`pnpm exec dsh-coding-kit task close --file docs/tasks/active/task_migrate_dsh_coding_kit.md --yes`（维护者确认后执行）。
