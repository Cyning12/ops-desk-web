# Task：dsh-coding-kit 升级 1.9.2 → 1.10.0（补跑 upgrade · D-PIN）

> **状态**：active  
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
| **wiki_delta_note** | 钉版字面 → 1.10.0；补记 #21 未跑 upgrade 的教训 |
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

- [ ] `package.json` + `pnpm-lock.yaml` exact 钉 `1.10.0`
- [ ] 官方 `upgrade --yes` → manifest `version=1.10.0`（禁手改蒙混）
- [ ] `scripts/graph-compile.sh`：`KIT_CLI=dsh-coding-kit@1.10.0`
- [ ] RUNBOOK 钉版刷新
- [ ] `check` / `verify --task` / graph-compile / 三件套绿

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

- [ ] manifest：`version=1.10.0` · preset/ide 未裁
- [ ] `pnpm exec dsh-coding-kit --version` = 1.10.0
- [ ] `check` → 已是最新；`verify --task` PASS
- [ ] `./scripts/graph-compile.sh` exit 0（KIT_CLI=@1.10.0）
- [ ] `pnpm lint` / `test` / `build` exit 0
- [ ] V-GREP：鲜活指引无长期 `@1.6.1` / `@1.9.2` 作为当前钉（历史 done/invoke 除外）

---

## 给 30

1. 本 task + `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`
2. `pnpm add -D -E dsh-coding-kit@1.10.0`
3. `pnpm exec dsh-coding-kit upgrade --target . --yes`
4. 钉 `scripts/graph-compile.sh` KIT_CLI → `@1.10.0`
5. 刷新 RUNBOOK 钉版字面
6. 验证矩阵 → invoke 30 留痕 → 交 CLOSE
