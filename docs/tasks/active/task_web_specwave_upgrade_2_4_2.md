# Task：spec-wave 升级 2.4.2（web · dsh-coding-kit 1.10.0 → SpecWave）

> **状态**：`in_progress`  
> **类型**：基础设施 / harness 过程轨升级（包改名 + 跨多版闸强化）  
> **前置**：manifest / package 钉 `dsh-coding-kit@1.10.0`（`.cyning-harness/manifest.json`）；目标 **`spec-wave@2.4.2`**（对齐 ops-desk-api 当前态）  
> **分支**：`task/web-specwave-2-4-2`（base：`main`）  
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue / SSE 业务逻辑  
> **授权**：维护者确认计划「Implement the plan」（2026-09-18）· Wave A 目标钉 2.4.2

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-specwave-upgrade-2-4-2` |
| **git_branch** | `task/web-specwave-2-4-2` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `pnpm exec spec-wave --version`=2.4.2；`upgrade --yes`；`check`；`verify --task`；`./scripts/graph-compile.sh`（KIT_CLI=`spec-wave@2.4.2`）；`pnpm lint` / `pnpm test` / `pnpm build`；活面 grep 旧命令零命中 |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue 逻辑 |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 过程轨升级；compile 产物若仅戳/格式 diff 可接受入库 |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版与命令前缀切至 spec-wave@2.4.2；coding_wiki 示例命令面同步 |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-GRAPH-MODULES | approved | 30 | 00 代签：仅过程轨版本钉与命令字面；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 20-R1, 30 | 2026-09-18 维护者确认计划 Implement · 00 本窗代签 |
| HG-AUDIT-R1 | approved | 30 | R1 PASS（见 reviews）· 2026-09-18 维护者 Implement 授权 · 00 本窗代签 |

---

## 背景与目标

本仓仍钉废弃包 **`dsh-coding-kit@1.10.0`**，过程落盘在 legacy **`.cyning-harness/`**。ops-desk-api 已完成改名并钉 **`spec-wave@2.4.2`**。上游 [SpecWave](https://github.com/Cyning12/SpecWave) / `MIGRATION.md`：安装终点始终是 `spec-wave`，勿再 `npm i dsh-coding-kit`。

本波（Wave A）把 web **对齐 api 当前态**：依赖改名 + `upgrade` 写入 `.coding-kit/` + 活命令字面 / D-PIN / IDE / prompts 切到 `npx spec-wave`，消费 2.3+/2.4.x 审查文结论机读闸。

**完成态**：`package.json` exact `spec-wave@2.4.2`；`.coding-kit/manifest.json` `version=2.4.2` · `from_version=1.10.0`；活面无 `npx dsh-coding-kit`；`check` / `verify --task` / graph-compile / 三件套绿。

---

## 范围

### A. 依赖与 manifest

1. `package.json`：删 `dsh-coding-kit`，加 `"spec-wave": "2.4.2"`（exact）+ `pnpm install`
2. `npx spec-wave upgrade --yes`：写 `.coding-kit/manifest.json`；**不删** `.cyning-harness/`

### B. IDE / prompts

3. `refresh-ide-blocks` dry-run → 审报告 → 需要时 `--yes`；`cyning-harness-local` 块零改写
4. `sync prompts --yes`：冲突默认以包资产为准，diff 核对 `HG-GRAPH-MODULES` 定制行；禁 `--force` 冲定制；`prompts/README.md` 若不在白名单则手合包资产
5. 无 marker 的 `.cursor/rules` 若残留旧命令 → **手改**（api FEEDBACK）

### C. 字面 / D-PIN / 活文档

6. `scripts/graph-compile.sh`：`KIT_CLI=spec-wave@2.4.2`
7. IDE 产品块：`AGENTS.md` / `CLAUDE.md` / `.cursor/rules/06-harness-pointer.mdc` → `npx spec-wave`
8. 活文档命令面：`docs/coding_wiki/**`、`docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`、`docs/harness/templates/TASK_TEMPLATE.md`；`src/api/obs.ts` 注释可选改 SpecWave
9. `.gitignore`：补 `.coding-kit/backups/`（及必要时 local 口径）

### D. 推荐步

10. `skills install`（`.dsh/skills` 不入库）
11. `host apply` / `host update --tools cursor,claude,agents --profile core --yes`（与 profile ide 对齐）

### E. 验收与 FEEDBACK

12. `check` / `verify --task` / `graph-compile.sh` / `pnpm lint|test|build`
13. FEEDBACK 落盘 `docs/spec/doc-health/feedback/`
14. **裸 SPEC**：根级 `docs/spec/SPEC-web-*.md` 同波迁入 `docs/spec/<slug>/`（夹内保留原文件名；史实指针按需更新）

## 非范围

- 不改 Vue / SSE / `src/` 业务逻辑（obs 注释除外）
- 不改写 `docs/tasks/done/`、`docs/harness/reviews|invokes` 历史档旧包名
- 不升到 3.0.0（属 Wave B）
- 不 `npm publish`；不以 `--force` 覆盖含 `HG-GRAPH-MODULES` 的 prompts 定制
- 不删除 `.cyning-harness/`

---

## 失败路径

| ID | 触发 | 行为 |
|----|------|------|
| F-1 | `pnpm install` / registry 失败 | STOP；不重试超过一次；入 FEEDBACK |
| F-2 | `upgrade` 未写 `.coding-kit/manifest.json` | STOP · FEEDBACK kit |
| F-3 | `sync prompts` 冲掉 `HG-GRAPH-MODULES` | 拒 `--force`；手合后 FEEDBACK |
| F-4 | `refresh-ide-blocks` 改写 local 块 | git checkout 回滚 · FEEDBACK |
| F-5 | verify 结论机读闸 BLOCKED | 补 R1 结论节后复跑；不滥用 `--allow-no-review` |
| F-6 | graph-compile 仅戳/格式 diff | 接受并入库（若有） |
| F-7 | 脏树挡 refresh `--yes` | 先 commit task+R1；再 `--yes` |

---

## 验收标准

- [x] `package.json` `"spec-wave": "2.4.2"`；lock 对齐；无 `dsh-coding-kit` 依赖
- [x] `.coding-kit/manifest.json` `version`=2.4.2 · `from_version`=1.10.0
- [x] `pnpm exec spec-wave --version` = 2.4.2
- [x] `pnpm exec spec-wave check --target .` exit 0 ·「已是最新」
- [x] `refresh-ide-blocks` 后 `cyning-harness-local` 块内容零非预期变化（本波手改命令字面；local 块保留）
- [x] `grep -rn "npx dsh-coding-kit" AGENTS.md CLAUDE.md .cursor/rules/ docs/runbooks/ docs/coding_wiki/ docs/harness/templates/ docs/harness/prompts/` 零命中
- [x] `grep -n "HG-GRAPH-MODULES" docs/harness/prompts/30-execute-code.md` 有命中
- [x] `grep -n 'KIT_CLI=.*spec-wave@2.4.2' scripts/graph-compile.sh` 命中；`./scripts/graph-compile.sh` exit 0
- [x] 根级裸 `docs/spec/SPEC-web-*.md` 已迁夹；`pnpm exec spec-wave check` 无根级裸 SPEC WARN
- [x] `pnpm lint` / `pnpm test` / `pnpm build` exit 0（179 tests）
- [x] `pnpm exec spec-wave verify --target . --task docs/tasks/active/task_web_specwave_upgrade_2_4_2.md` PASS
- [x] FEEDBACK 落盘 `docs/spec/doc-health/feedback/2026-09-18_2.4.2_web_upgrade.md`

---

## 给执行帽（30）必读

1. 本 task 人工闸表（须 `approved`）
2. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`
3. 上游 SpecWave `MIGRATION.md`（钉版 → upgrade → 字面 → refresh/sync）
4. api 参照：`ops-desk-api/docs/tasks/done/task_specwave_upgrade_2_4_2.md` + FEEDBACK `2026-09-17_2.4.2_*`

---

## 自检结论

| 命令 | 退出码 | 备注 |
|------|--------|------|
| `spec-wave --version` | 0 | 2.4.2 |
| `check --target .` | 0 | 已是最新 |
| `verify --task` | 0 | PASS |
| `./scripts/graph-compile.sh` | 0 | KIT_CLI=@2.4.2 |
| `pnpm lint/test/build` | 0 | 179 tests |

### KPI

Task_KPI%: 100（Wave A 过程轨完成；关账待 PR）
