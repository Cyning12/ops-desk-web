# Task：web · dsh-coding-kit 1.2.2→1.6.1 CLI 面探查（D-JUMP · GO/NO-GO）

> **状态**：`completed`（00 验收 · 待 task close 归档）  
> **类型**：基础设施 / harness 过程轨 · **验证+对比型（禁止改依赖与业务码）**  
> **执行 SPEC**：`docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md`（**HG-SPEC-SIGNOFF=approved** · §0 冻结 · §6.1 CLI 面探查）  
> **切分**：T1（本 task · **GO 已落**）→ T2 `web-dsh-coding-kit-upgrade-1-6-1`  
> **分支**：`task/web-dsh-coding-kit-1-6-1`  
> **执行模式**：30 probe 完成 · 00 验收 GO · 进入 CLOSE

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-dsh-kit-upgrade-probe-1-6-1` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `npm view` 钉版；`@1.2.2` vs `@1.6.1` 顶层/--help 与 verify/upgrade/graph yaml 子 help diff 落 invoke；记录 `pnpm test` 失败基线（D-BASELINE）；对照 api FEEDBACK 已知增量（`verify --spec`）；产出 GO/STOP 写入 task 自检或 invoke |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 探查型；不改业务源码 |
| **orchestration** | T1 of 2；与 T2 同分支累积；T2 仅在本 task GO 后执行 |
| **git_branch** | `task/web-dsh-coding-kit-1-6-1` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 过程轨探查；不改模块边界或 flow；不跑 graph-compile 改产物 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | probe 无 wiki 增量；钉版刷新属 T2 |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `10,30` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-25 00 代签：graph_change_layer=`none`；过程轨探查不改业务模块 |
| HG-TASK-DRAFT | approved | 22-R1 | 2026-08-25 00 代签（维护者授权中间文档签收 · 对齐 SPEC §6.1 + 2-task 切分） |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-25 00 代签：探查型禁止改 package/lock/manifest/graph-compile/业务码；基础设施无业务逻辑 |

---

## 背景与目标

web 过程轨仍钉 `dsh-coding-kit@1.2.2`，与 api 已落地的 `1.6.1` 分裂。SPEC 允许 **一次跳版**（1.2.2→1.6.1），但强制 **D-JUMP**：升级前必须做 CLI 面探查与基线记录，破坏性变更则 **STOP**，不进入 T2 upgrade。

api FEEDBACK（2026-08-25）已实证 1.5.2→1.6.1 仅增量 `verify --spec`（无参数删除、无语义反转）。本 task 在 web 起点 **1.2.2** 上复验到 **1.6.1** 终态 help 面，并记录本仓 `pnpm test` 既有失败基线，供 T2 只比较「新增失败」。

**完成态**：

- [x] `npm view dsh-coding-kit version` 记录（期望 `1.6.1`；例外须维护者书面接受）
- [x] `@1.2.2` vs `@1.6.1`：顶层 `--help` + `verify` / `upgrade` / `graph yaml`（及 compile/check/export 子 help）diff 落盘 invoke
- [x] 对照 api FEEDBACK：已知增量（`verify --spec`）已标注；额外破坏性变更清单（无则写「无」）
- [x] `pnpm test` 失败基线（失败数 / 用例名摘要）写入 task 自检区或 30 invoke
- [x] **GO/STOP** 判定写入 task 自检区或 invoke（STOP → T2 不执行）

---

## 范围

1. **registry 钉版探查**：`npm view dsh-coding-kit version`（及必要时 `npm view dsh-coding-kit@1.6.1 version`）。
2. **CLI 面 diff（SPEC §6.1）**：串行、防 D-CACHE（可用 `npm_config_cache=/tmp/npm-cache-web-kit`）：
   - `npx --yes dsh-coding-kit@1.2.2 --help` vs `@1.6.1 --help`
   - 子命令：`verify --help`、`upgrade --help`、`graph yaml --help`（及 compile/check/export 子 help）
   - diff 附件或摘要写入 30 invoke
3. **对照**：只读 `ops-desk-api/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md` §2（已知 `verify --spec` 增量）。
4. **D-BASELINE**：升级前记录 `pnpm test` 现状（失败条数与关键用例名）；**不**修测试、不改业务码。
5. **判定**：通过标准 = 无参数删除、无语义反转；仅增量可 **GO**。出现破坏性 → **STOP** 报 00，不执行 T2。

### 禁止改动（硬约束）

- `package.json` / `pnpm-lock.yaml`
- `.cyning-harness/manifest.json`
- `scripts/graph-compile.sh` / `scripts/graph_yaml_to_json.py`
- 业务源码（`src/**`）、路由、CI 业务 job
- 官方 `upgrade` / `refresh-ide-blocks --yes`（探查阶段禁止）
- 手改 `<!-- cyning-harness-local:begin/end -->` 产品块

---

## 非范围

- 依赖钉版与 `upgrade --yes`（属 T2）
- graph-compile D-PIN 钉版、RUNBOOK / coding_wiki 钉版刷新（属 T2）
- 引入 normalize、切换 kit `graph yaml export` 为 graph.json 真值
- 关账 / commit / PR（00/维护者另令）
- 改 api 仓任何文件

---

## 依赖

- SPEC：`docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md`（§0 · §3.2 D-JUMP/D-BASELINE/D-CACHE · §6.1 · §8）
- api 先例（只读）：`ops-desk-api/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md`
- api task（只读）：`ops-desk-api/docs/tasks/done/task_dsh_coding_kit_upgrade_1_6_1.md`、`ops-desk-api/docs/tasks/done/task_dsh_kit_graph_migrate_probe.md`
- 下游：`docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md`（依赖本 task **GO**）

---

## 失败路径

对齐 SPEC §8（探查子集）：

| 触发 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| help 显式破坏性变更（参数删除 / 语义反转） | **STOP**；不 upgrade；判定写入 invoke；T2 不执行 | 否（等产品或改 SPEC） | 报告 00 |
| `npm view` ≠ 1.6.1 且无维护者书面例外 | **STOP** 或挂起；不进入 T2 | 否（等人） | 报告维护者 |
| npx 缓存半成品 / `command not found`（D-CACHE） | 清 `_npx` 子缓存后串行重跑 | 是 | invoke 记备查 |
| `pnpm test` 红 | **记基线**，不当作探查失败；不修测 | — | 基线表 |
| 误改 package/lock/manifest/业务码 | **验收打回**；还原 | 否 | PR/ diff 拒绝 |

---

## 验收标准

- [x] `npm view` 结果已记录（期望 registry 最新 = `1.6.1`）
- [x] 1.2.2 vs 1.6.1 help diff（顶层 + verify/upgrade/graph yaml 子 help）已落 30 invoke（或附件路径）
- [x] 破坏性变更清单明确（无则「无」）；对照 api 已知增量已标注
- [x] `pnpm test` 失败基线已记录（D-BASELINE）
- [x] GO/STOP 判定已写入 task 自检区或 30 invoke
- [x] 工作树 **无** package.json / lock / manifest / graph-compile / `src/**` 因本 task 产生的改动
- [x] 10 + 30 invoke 就位（`required_invoke_hats=10,30`）

---

## 给 30 必读

1. 本 task（范围硬禁止 + failure_paths + 验收）
2. `docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md` — §0 冻结 · §6.1 · §8；**禁止**跳步 upgrade
3. `ops-desk-api/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md` §2（CLI 增量对照）
4. 串行防 D-CACHE；优先 `npx --yes dsh-coding-kit@<ver>`，勿依赖无版本 `npx dsh-coding-kit`
5. 产出：help diff + 基线 + **GO/STOP**；STOP 时明确「T2 不执行」

**30 闸**：`HG-GRAPH-MODULES` / `HG-TASK-DRAFT` / `HG-AUDIT-R1` 均须 **approved**（00 代签）后方可开工。闸为 pending 时 **拒开工**。

---

## 思考轮控制

| 字段 | 值 |
|---|---|
| **thinking_profile** | `shortest` |
| **early_stop** | `yes` |
| **early_stop_reason** | `SPEC §6.1 已冻结探查步骤与通过标准；api FEEDBACK 已实证 1.6.1 CLI 仅 verify --spec 增量；本 task 只做 web 起点 1.2.2 对照复验 + 基线` |
| **actual_last_round** | `R2` |
| **residual_risks** | 1.2.2→1.6.1 跨多 minor，help 外行为差异可能在 T2 才暴露；D-CACHE 半成品需串行 |

### R0 · 问题框定

跳版升级的最大风险是 D-JUMP（未探查即 upgrade）。00 已切分 T1 probe / T2 upgrade；本 task 只回答「CLI 面是否可安全进入 upgrade」与「测试基线是什么」，不触碰钉版与 refresh。

### R1 · 范围切片

允许：registry view、带版本 npx help、只读对照 api FEEDBACK、`pnpm test` 观察。禁止：任何会改变 lock/manifest/IDE 产品块/图谱脚本/业务码的命令。判定输出必须可被 T2 依赖（GO）或阻断（STOP）。

### R2 · 交接与失败路径

破坏性 help → STOP + 报 00；D-CACHE → 清缓存重试；测试红 → 记基线不修。闸 pending 交 00；30 仅在三闸 approved 后执行探查。

---

### 自检结论（30 回填）

| 项 | 内容 |
|---|---|
| **日期** | 2026-08-25 |
| **npm view** | `dsh-coding-kit` registry latest = **1.6.1**（`@1.6.1` 同） |
| **help diff 摘要** | 顶层仅增量：`verify --spec`/`--json`；新命令 `refresh-ide-blocks`；`gate-check --json`；`lifecycle dry-run --target`；init 词表注释。verify/upgrade/graph 子 help：1.2.2 回落顶层、1.6.1 专用短 help；无删参。完整 diff → `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/attachments/help_diff_summary.txt` |
| **破坏性？** | **无**（对照 api FEEDBACK §2：`verify --spec` 已标注；跨 minor 额外增量均为加命令/加旗标；破坏性清单 = 无） |
| **pnpm test 基线** | **0 failed / 107 passed**（21 files · exit 0 · 无失败用例名） |
| **GO/STOP** | **GO**（允许进入 T2；本波未执行 T2） |
| **工作树纪律** | 无 package/lock/manifest/graph-compile/src 改动 |

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

- 跳版（跨 4 minor）须独立 probe：help 面仅增量即可 GO；破坏性则 STOP，避免先动 lock 再回滚。
- D-BASELINE：本仓 `pnpm test` 升级前已全绿（0/107），T2 只比新增失败。
- Wiki: n/a（probe 无 wiki 增量）

---

## CLOSE

| 项 | 内容 |
|---|---|
| 日期 | 2026-08-25 |
| 定稿 | T1 probe **GO**；允许 T2 upgrade |
| 归档 | `docs/tasks/done/task_web_dsh_kit_upgrade_probe_1_6_1.md` |
| PR | （与 T2 同 PR · 00 收口） |

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-25 | 10-task 首稿（**active** / draft 待闸）：对齐 SPEC §6.1 + 00 切分 T1；三闸 pending；禁 upgrade |
| 2026-08-25 | 30 T1 probe 完成：GATE_VERIFY 通过；help diff + 基线落盘；**GO**；自检/验收勾选 |
| 2026-08-25 | 00 验收 GO · 状态→completed · CLOSE 节补录 · 待 task close |
