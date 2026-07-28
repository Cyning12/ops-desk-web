# Task：Harness 升级至 2.18.0（web）+ wiki_delta 存量迁移

> **状态**：completed  
> **类型**：基础设施（过程轨 upgrade + 文档迁移）  
> **关联**：npm `@cyning/harness@2.18.0` · wiki_delta close 硬闸 · 经验晋升指针 · `wiki export` · RUNBOOK_harness_upgrade_v1_zh

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-18-migrate` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `upgrade --yes`（不带 `--ide`，避 F1b）；`check` 最新；`verify --task`；存量 task `wiki_delta` 回填后抽检 close 规则；`pnpm lint` / `test` / `build` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task；00 代签双闸（RUNBOOK 基础设施惯例） |
| **git_branch** | `task/harness-upgrade-2-18-migrate` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 sync / manifest 升级与 task 元信息补字段；不改 Inform 模块边界或 flow |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |
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
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 sync + task 元信息；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者下发：钉 2.18.0 + wiki_delta 迁移；不做可观测 Demo 图页 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施 upgrade；无业务逻辑 |

---

## 背景与目标

产品 **2.18.0**：`task close` 对 **wiki_delta** 缺字段 BLOCK；`none`/`n/a` 须 note；`experience_capture=required` 且 `wiki_delta=path` 时经验节须晋升指针。本仓 `manifest=2.17.0` · preset=`harness-only` · **未启用** `docs/coding_wiki`。

**完成态**：

- [x] manifest → `2.18.0`
- [x] `upgrade --yes`（无 `--ide`）一把过
- [x] 对齐 README / CI / scripts / RUNBOOK 中的版本钉（2.17.0 → 2.18.0）
- [x] 扫描 `docs/tasks/**`：补 `wiki_delta` + `wiki_delta_note`（harness-only → `n/a` +「harness-only · 未启用 WikiTrack」）
- [x] `experience_capture=required` + path 时补晋升指针（本仓无 required → 跳过）
- [x] `harness check` 已是最新；`verify --task` PASS
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿
- [x] invoke + 自检回填；PR 写明 close 缺字段 BLOCK、禁默认 `--allow-*-gap`

**不做**：ops-desk-api 业务码；纪律包 / harness-web Demo 图页；强制启用 coding_wiki

---

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| S5 dirty 挡 upgrade | 先 commit task+R1；人判 `--force` | 是 |
| ide 被静默裁成单 cursor | 记录摩擦，不擅自 `--ide` 重跑 | 人判 |
| 存量 task 缺 wiki_delta 导致未来 close BLOCK | 本棒批量补 `n/a`+note | 是 |
| close 因缺字段 BLOCK | 补字段；勿默认 `--allow-wiki-gap` | 是 |
| pnpm 三件套红且与 harness 无关 | 只报告，不顺手大改业务 | 人判 |

---

## 验收标准

- [x] manifest 2.18.0 · 仍仅五字段 · preset=`harness-only`
- [x] check 指向 2.18.0 / 已是最新
- [x] `verify --task` PASS；存量 task 均有 wiki_delta（抽检）
- [x] `pnpm lint` · `pnpm test` · `pnpm build` 绿（或既有红另记）
- [x] PR 说明：close 缺 wiki_delta → BLOCK；禁默认 `--allow-*-gap`

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

- 2.18.0 后：关账缺 `wiki_delta` → `CLOSE: BLOCKED`；harness-only 填 `n/a` + note「harness-only · 未启用 WikiTrack」。
- `experience_capture=required` 且 `wiki_delta=path` 时经验节须含 `coding_wiki` / `Wiki:` / `wiki_promoted:`；本仓未启用 WikiTrack，无需路径晋升。
- 勿把 `--allow-wiki-gap` / `--allow-invoke-gap` / `--allow-kpi-gap` / `--allow-experience-gap` 当默认绿路径。
- Cursor Agent sandbox 跑 upgrade 仍会把 `local.json` 写成 ephemeral npx 缓存；收尾改回本机产品仓根。

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-28 |
| **manifest** | `2.18.0`（from 2.17.0）· 五字段 · ide 三轨未裁 · preset=`harness-only` |
| **check** | 已是最新 · exit 0 |
| **verify** | active upgrade / done 2.17.0 / done web-obs → PASS |
| **ide 是否被裁** | 否（仍 cursor,claude,agents） |
| **pnpm 三件套** | lint/test(75)/build 全绿 |
| **wiki_delta 迁移** | 21 份 done/epic + 1 active；全 `n/a`+note；无 required 经验晋升 |
| **摩擦** | local.json 沙箱路径（同 2.17.0）；已改回 Projects/cyning-harness |
| **R1** | `docs/harness/reviews/task_harness_upgrade_2_18_migrate_audit_R1_20260728.md` |
| **下一棒** | PR 合并后 `task close` |
