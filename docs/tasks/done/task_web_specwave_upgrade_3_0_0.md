# Task：spec-wave 升级 3.0.0（web · 2.4.2 → 3.0.0）

> **状态**：`done`  
> **类型**：基础设施 / harness 过程轨 major  
> **前置**：Wave A done（`spec-wave@2.4.2` · PR #45/#46 CLOSE）  
> **分支**：`task/web-specwave-3-0-0`（base：`main`）  
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue / SSE  
> **00 授权**：2026-09-18「继续统筹 3.0.0 的升级」

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-specwave-upgrade-3-0-0` |
| **git_branch** | `task/web-specwave-3-0-0` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `pnpm exec spec-wave --version`=3.0.0；`upgrade --yes`；`check`；`verify --task`；`KIT_CLI=spec-wave@3.0.0` + graph-compile；`host update --yes`（**不入库 hooks**）；`pnpm lint/test/build` |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue |
| **graph_delta** | `none` |
| **graph_delta_note** | 过程轨 major；不改 YAML 源；compile 戳 diff 可接受 |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版字面 → 3.0.0 |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **related_pr** | `#47` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-GRAPH-MODULES | approved | 30 | 00：过程轨 · 不改业务模块边界 |
| HG-TASK-DRAFT | approved | 20-R1, 30 | 00 本窗签收「继续统筹 3.0.0」 |
| HG-AUDIT-R1 | approved | 30 | R1 PASS · 00 签收 |

---

## 背景与目标

Wave A 已把本仓钉到 **`spec-wave@2.4.2`**（对齐当时 api）。上游 **`spec-wave@3.0.0`** 已发布：host-adapt schema v1→v2 **可选**（内置宿主零改动兼容）；`host update` 可能物化 Cursor/Claude **hooks**（裸 `verify` 会扫历史 done reviews 缺口）——本波 **明确不入库 hooks**（门禁仍以 CLI `verify --task` 为准）。

**完成态**：`package.json` / lock / manifest / `KIT_CLI` 三钉 **3.0.0**；`check` / `verify --task` / graph-compile / 三件套绿；FEEDBACK 落盘；**无** `.cursor/hooks.json` / Claude PreToolUse hook-guard。

## 范围

1. 钉 `"spec-wave": "3.0.0"`（exact）+ `pnpm install`
2. `pnpm exec spec-wave upgrade --yes`（manifest `from_version=2.4.2`）
3. `scripts/graph-compile.sh`：`KIT_CLI=spec-wave@3.0.0`；coding_wiki / RUNBOOK 钉版字面
4. `host update --yes` 后：**删除** `.cursor/hooks.json`（若生成）；**还原** `.claude/settings.json` 中 hook-guard 段（若写入）；`docs/harness/audit/` gitignore 已有则维持
5. `sync prompts`：conflict 默认不 `--force`；若需刷包资产则手合 **保留** `HG-GRAPH-MODULES` 于 FRAGMENT/TEMPLATE
6. `check` / `verify --task` / graph-compile / `pnpm lint|test|build`
7. FEEDBACK；`assets verify` / `pins check` 基线留痕（业务仓缺 assets 时 exit 2 **不挡**）
8. **不**启用自定义 schema v2 表

## 非范围

- Vue/SSE 业务；历史档旧字面；api 仓改动；强制 hooks 物化入库；legacy-gate-exempt 全量清偿（可另 task）

## 失败路径

| ID | 触发 | 行为 |
|----|------|------|
| F-1 | install/upgrade 失败 | STOP |
| F-2 | sync 冲掉 HG-GRAPH-MODULES | 手合恢复 · 拒 `--force` 盲盖 |
| F-3 | hooks 入库导致 pre-commit 裸 verify 红 | 删 hooks · FEEDBACK（本波预期处置） |
| F-4 | graph-compile 仅戳 diff | 接受入库 |

## 验收标准

- [x] `"spec-wave": "3.0.0"` · manifest version=3.0.0 · from_version=2.4.2
- [x] `--version`=3.0.0 · `check` 已是最新
- [x] `KIT_CLI=spec-wave@3.0.0` · graph-compile exit 0
- [x] 无入库 `.cursor/hooks.json`；Claude settings 无 hook-guard PreToolUse（或与 main 一致无新增）
- [x] `grep -n "HG-GRAPH-MODULES" docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md` 有命中
- [x] `verify --task` PASS · lint/test/build 绿
- [x] FEEDBACK 落盘

### 自检结论

| 命令 | 退出码 | 备注 |
|------|--------|------|
| `spec-wave --version` | 0 | 3.0.0 |
| `check --target .` | 0 | 已是最新 |
| `verify --task` | 0 | PASS |
| `./scripts/graph-compile.sh` | 0 | KIT_CLI=@3.0.0 |
| `pnpm lint/test/build` | 0 | 179 tests |
| hooks 入库 | — | 已删 hooks.json · settings 已还原 |

### KPI

Task_KPI%: 100（PR #47 MERGED 2026-09-18 · 滞后关账：2026-10-11 随 3.3.0 wave 补归档 · 00「一并处理掉」）

---

## 给执行帽（30）必读

1. 本 task 闸表（须 approved）
2. Wave A FEEDBACK：`docs/spec/doc-health/feedback/2026-09-18_2.4.2_web_upgrade.md`
3. 上游 `MIGRATION.md`「2.4.2 → 3.0.0」节（内置宿主零改动）
4. **禁入库 hooks**（F-3）
