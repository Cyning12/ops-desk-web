# Task：Harness 2.2.1 → 2.11.0 升级（部署前版本对齐）

> **状态**：in_progress  
> **类型**：基础设施  
> **关联**：`/Users/cyning/Desktop/Projects/docs/harness/guides/CHECKLIST_harness_pilot_dogfood_v1_zh.md`（关账包版本 2.11.0）· 部署 Epic 前置

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-11-0` |
| **test_strategy** | `none`（工具链升级；以 verify/close 可用性为验收） |
| **test_strategy_note** | 业务三件套回归（lint/test/build）确认不受影响 |
| **code_quality_bar** | `L1_docs` |
| **orchestration** | 单 task |
| **git_branch** | `task/harness-upgrade-2-11-0` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：不动模块边界；如 upgrade 改写 manifest 丢失 name/tech_graph_dir/tasks_dir/hooks 字段须手工合并恢复（W0 已有先例） |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签（用户授权延续）：按 dogfood checklist 对齐 2.11.0；本仓已接入故走 upgrade 而非 init；不动后端仓（部署会话进行中） |

---

## 背景与目标

部署前按 harness 最新 dogfood checklist 对齐版本：2.2.1 → 2.11.0。本仓已接入（profile.json 存在），走 `upgrade --yes`。

**完成态**：

- [ ] `npx @cyning/harness@latest upgrade --target . --yes` 成功，manifest version = 2.11.0
- [ ] manifest 关键字段保留（name / tech_graph_dir / tasks_dir / hooks / ide）
- [ ] `docs/harness/prompts/` 刷新为 2.11.0
- [ ] `npx @cyning/harness check` 版本可读；`lifecycle show` / `discipline show` 只读摸底
- [ ] `npx @cyning/harness verify --target .` PASS；`task close --help` 可用
- [ ] 业务三件套回归（pnpm lint/test/build 全绿）
- [ ] invoke 落盘 + close 归档 + 合并 master

**不做**：后端仓升级（部署会话负责）；`--apply` / G7 / N2-C（checklist §4 明确不做）；改产品包码。

## 范围

- `.cyning-harness/`、`docs/harness/`、`AGENTS.md`（若 Starter 片段需对齐新版）、`docs/tasks/active/task_harness_upgrade_2_11_0.md`

## 非范围

- 后端仓 ops-desk-api
- 业务 src/
- CI workflows

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| upgrade 改写 manifest 丢字段 | 手工合并恢复（W0 先例） | 是 | diff 可见 |
| 新版 verify 规则变严（如 review/lint 闸） | 按输出补齐或留痕豁免 | 是 | verify 输出 |
| 升级中断 | git 回滚 | 是 | 终端报错 |

## 验收标准

- [ ] manifest version 2.11.0 且关键字段齐全
- [ ] `harness verify` PASS、`task close --help` 可用
- [ ] pnpm lint/test/build exit 0
- [ ] `./scripts/graph-compile.sh` 通过

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-25 | 00统筹起草；双闸代签 approved；部署前版本对齐（checklist 关账 2.11.0） |
