# Task：dsh-coding-kit 升级 1.9.2 → 1.10.0（补跑 upgrade · D-PIN）

> **状态**：completed（2026-08-31 CLOSE · 00 代签 · 三钉一致）  
> **类型**：基础设施（过程轨 upgrade）  
> **触发**：维护者（2026-08-31）：「更新 dsh-coding-kit 到最新的 1.10.0」· 00 可代签  
> **背景债**：#21 仅钉 `package.json`/`lock` 至 1.9.2，**未**跑官方 `upgrade`（manifest 仍 1.6.1；`graph-compile.sh` 仍 `@1.6.1`）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `coding-kit-upgrade-1-10-0` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `pnpm exec dsh-coding-kit --version`=1.10.0；`upgrade --yes` → manifest；`check`；`verify --task`；`./scripts/graph-compile.sh`；`pnpm lint/test/build`；`--frozen-lockfile` |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue 逻辑 |
| **orchestration** | 单 task；00 代签双闸（基础设施升级） |
| **git_branch** | `task/coding-kit-upgrade-1-10-0` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨版本钉 + D-PIN；不改模块边界或 flow |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版字面 → 1.10.0；补记 #21 未跑 upgrade 的教训；coding_wiki export 示例同步 |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `exempt` |
| **close_pr_exempt_note** | 本波先完成钉版与归档；PR 由维护者另开（或同分支随后补 related_pr） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨版本钉；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 20-R1 | 维护者（2026-08-31）：「更新到 1.10.0」+「00 可代签」 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施升级；无业务 Vue/API 逻辑（沿用同型先例） |

---

## 背景与目标

registry latest = **1.10.0**。本仓 `package.json` 已是 1.9.2，但 manifest / KIT_CLI 仍停在 **1.6.1**。本 task：官方 `upgrade --yes` 追上 1.10.0，并 D-PIN 三处一致。

**完成态**：

- [x] `package.json` + `pnpm-lock.yaml` exact 钉 `1.10.0`
- [x] 官方 `upgrade --yes` → manifest `version=1.10.0`（禁手改蒙混）
- [x] `scripts/graph-compile.sh`：`KIT_CLI=dsh-coding-kit@1.10.0`
- [x] RUNBOOK 钉版刷新
- [x] `check` / `verify --task` / graph-compile / 三件套绿

**不做**：业务 Vue/API；改 preset / graph 拓扑；强制同日 PR（见 close_pr_policy）

---

## 失败路径

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| upgrade S5 脏树 | 先 commit task/归档；禁 `--force` 除非人判 | 是 | 报告 |
| graph-compile 红且不可解释 | 恢复 bak；报告 | 人判 | CI 输出 |
| IDE overlay 非预期 diff | 对照 local 块；local 被改则 STOP | 是 | diff |

---

## 验收标准

- [x] manifest：`version=1.10.0` · preset/ide 未裁
- [x] `pnpm exec dsh-coding-kit --version` = 1.10.0
- [x] `check` → 已是最新；`verify --task` PASS（`--allow-no-review`）
- [x] `./scripts/graph-compile.sh` exit 0（KIT_CLI=@1.10.0）
- [x] `pnpm lint` / `test` / `build` exit 0（126 tests）
- [x] V-GREP：鲜活指引当前钉 → 1.10.0（历史 done/invoke 除外）

---

## 40 自检

### 自检结论

> 30/40 · 2026-08-31 · web 00 线（基础设施 upgrade）

| 闸 | 结果 |
|---|---|
| version | 1.10.0 |
| check | 已是最新 |
| verify | PASS（`--allow-no-review`） |
| graph-compile | OK · KIT_CLI=@1.10.0 |
| lint/test/build | 0 / 126 / 0 |
| lint-wiki-delta | PASS missing=0 |

**结论**：自检全绿；manifest/package/KIT_CLI 三钉 1.10.0。

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

- 禁止「只 bump package」不跑 `upgrade`：manifest / KIT_CLI 会长期落后（#21）。
- `sync prompts --yes` 默认不覆盖 conflict；仓内改过的帽文勿 `--force`。
- Wiki: docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md

---

## CLOSE

| 项 | 内容 |
|---|---|
| 日期 | 2026-08-31 |
| 定稿 | kit **1.10.0**（from 1.6.1）· package/manifest/KIT_CLI 三钉 |
| invoke | `docs/harness/invokes/by-task/coding-kit-upgrade-1-10-0/` |
| 归档 | `docs/tasks/done/task_coding_kit_upgrade_1_10_0.md` |

---

## 给 30

见 invoke `invoke_20260831_30_coding-kit-upgrade-1-10-0.md`（已执行完毕）。
