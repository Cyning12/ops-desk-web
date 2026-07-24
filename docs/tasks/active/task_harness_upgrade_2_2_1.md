# Task：Harness 2.1.1 → 2.2.1 升级 + AGENTS/CLAUDE 补 Starter 片段（Epic W0）

> **状态**：completed  
> **类型**：基础设施  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W0 · `../ops-desk-api/AGENTS.md`（Starter 片段参照）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-2-1` |
| **test_strategy** | `none`（无业务代码；以 harness verify + CLI 可用性为验收） |
| **test_strategy_note** | 本仓尚无 src/；验证依赖 `npx @cyning/harness verify` 与 CLI 子命令可用性 |
| **code_quality_bar** | `L1_docs` |
| **orchestration** | 单 task |
| **git_branch** | `task/harness-upgrade-2-2-1` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：本 task 不改 `docs/_tech_graph/01_struct.md` 模块边界，仅 harness 工具链升级 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签（用户 2026-07-24 授权人闸权限给 00）：升级 2.2.1 + 补 Starter 片段，Verify 命令改前端 pnpm 三件套 |

---

## 背景与目标

本仓已接入 cyning-harness 2.1.1（`.cyning-harness/manifest.json`），但：

1. `docs/harness/prompts/` 为空、`docs/harness/invokes/` 不存在 —— 升级 2.2.1 落盘。
2. `AGENTS.md` 缺「新会话启动纪律」节与 `<!-- cyning-harness:begin -->` Harness Starter 片段 —— 参照 `../ops-desk-api/AGENTS.md` 补齐，Verify 命令改为前端 `pnpm lint` / `pnpm test` / `pnpm build`。
3. `CLAUDE.md` 仅 `@AGENTS.md` 导入，继承 AGENTS 内容即可，不重复片段。

**完成态**：

- [x] `npx @cyning/harness upgrade --target . --yes` 执行成功，manifest version = 2.2.1
- [x] `docs/harness/prompts/` 落盘 2.2.1 prompts；`docs/harness/invokes/` 就位
- [x] `AGENTS.md` 含「新会话启动纪律」节 + Harness Starter 片段（pnpm 三件套）
- [x] `npx @cyning/harness verify --target .` PASS
- [x] `npx @cyning/harness task close --help` 与 `task lint-done` 可用
- [x] invoke 落盘 `docs/harness/invokes/by-task/harness-upgrade-2-2-1/`
- [x] `harness task close` 归档 + 合并回 master

**不做**：不改 `docs/_tech_graph/` 内容；不创建 src/（W1 范围）。

---

## 范围

- [x] `.cyning-harness/manifest.json`（upgrade 改写）
- [x] `docs/harness/`（upgrade 落盘 + invoke）
- [x] `AGENTS.md`（补两节）
- [x] `docs/tasks/active/task_harness_upgrade_2_2_1.md`（本文件）

## 非范围

- src/ 任何前端代码
- `docs/_tech_graph/` 模块边界变更
- CI workflows（本仓暂无 `.github/`，留待后续）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| upgrade 失败/中断 | git 工作区可 `git checkout .` 回滚 | 是 | 终端报错 |
| Starter 片段与既有 AGENTS 内容冲突 | 手工合并，业务约定保留 | 是 | diff 可见 |
| verify 报缺项 | 按提示补齐后重跑 | 是 | verify 输出 |

---

## 验收标准

- [x] `npx @cyning/harness verify --target .` PASS
- [x] `npx @cyning/harness task close --help` 正常输出
- [x] `npx @cyning/harness task lint-done` 可运行
- [x] `grep -c "cyning-harness:begin" AGENTS.md` ≥ 1
- [x] `grep "pnpm lint" AGENTS.md` 命中（Verify 表为前端命令）

---

## 给执行帽的必读列表

1. `AGENTS.md`（本仓现状）
2. `../ops-desk-api/AGENTS.md` 的「新会话启动纪律」与 Harness Starter 节（移植源）
3. `.cyning-harness/manifest.json`

---

### 自检结论（执行者）

- `npx @cyning/harness verify --target .` PASS（manifest 2.2.1 / harness-only，双闸 approved）。
- `task close --help` 与 `task lint-done` 正常输出（CLI v2.2.1）。
- install 向导曾重写 manifest 丢失 name/tech_graph_dir/tasks_dir/hooks，已手工合并恢复；preset 决策为 harness-only（fullstack-node-py 会带入 Next+pytest CI 样例与 coding_wiki，不适用本仓）。
- CLAUDE.md 经 `@AGENTS.md` 导入继承 Harness Starter，未重复片段。
- invoke 已落盘 `docs/harness/invokes/by-task/harness-upgrade-2-2-1/`。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved（用户授权人闸权限给 00） |
| 2026-07-24 | 30+40 完成：preset 决策 harness-only（fullstack 会写入不适用本仓的 Next/pytest CI 样例）；manifest 关键字段手工合并保留 |
