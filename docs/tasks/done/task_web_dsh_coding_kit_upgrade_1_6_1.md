# Task：web · dsh-coding-kit 升级 1.2.2 → 1.6.1

> **状态**：`completed`（00 验收 V-\* 全过 · 待 task close 归档）  
> **类型**：基础设施 / harness 过程轨升级（跳版 + D-PIN 钉版对齐）  
> **执行 SPEC**：`docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md`（**HG-SPEC-SIGNOFF=approved** · §0 冻结）  
> **依赖**：T1 `web-dsh-kit-upgrade-probe-1-6-1` **GO**（已确认 2026-08-25）  
> **分支**：`task/web-dsh-coding-kit-1-6-1`  
> **执行模式**：30 upgrade 完成 · 00 验收 · 进入 CLOSE / PR

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-dsh-coding-kit-upgrade-1-6-1` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | SPEC §7 V-\* 矩阵全绿；`pnpm lint` → `pnpm test` → `pnpm build`（无**新增**失败，对照 T1 D-BASELINE）；`./scripts/graph-compile.sh`；`verify --task`；local 块零字节；钉版三处一致（manifest / package.json / lockfile） |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue 逻辑 |
| **orchestration** | T2 of 2；同分支；依赖 T1 GO |
| **git_branch** | `task/web-dsh-coding-kit-1-6-1` |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 过程轨升级；图谱语义不变；emit 风格差异须可解释（V-MERMAID）；不可解释则 STOP + FEEDBACK |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | 钉版字面 → 1.6.1；同步 `docs/coding_wiki/**` 鲜活指引中的 `1.2.2`/`@1.2.1` → `1.6.1`（历史 done/invoke 除外） |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `10,30` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-25 00 代签：graph_change_layer=`none`；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 2026-08-25 00 代签（维护者授权 · 对齐 SPEC §4.1 / §6.2–6.3 / §7） |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-25 00 代签：T1 probe **GO**（help 仅增量、无删参/语义反转；pnpm test 基线 0 failed/107 passed） |

---

## 背景与目标

在 T1 确认 CLI 面无破坏性变更后，将 web 过程轨从 **1.2.2** 升到与 api 对齐的 **1.6.1**，消除跨仓 kit 分裂，并消除 `graph-compile.sh` 无版本 `npx` 的 **D-PIN** 漂移源。

执行契约以 SPEC §0 / §6 / §7 为冻结棒；api 升级序列与 FEEDBACK 项作对照，不重开已裁定争论（不换 json 生成器、不引入 normalize、不切 kit export）。

**完成态**：

- [x] `package.json` + `pnpm-lock.yaml` exact 钉 `1.6.1`；`CI=true pnpm install --frozen-lockfile` 绿
- [x] 官方 `upgrade --yes` → manifest `version=1.6.1`（`from_version` 预期 `1.2.2`）；禁手改蒙混
- [x] `scripts/graph-compile.sh` D-PIN 钉版（推荐 SPEC §6.2：`KIT_CLI=dsh-coding-kit@1.6.1` + `npx --yes`；策略写死 invoke；若动 CI tech-graph 须同钉）
- [x] SPEC §6.3 升级序列全跑（check → refresh dry-run → refresh --yes → upgrade → 幂等）
- [x] §7 V-\* 矩阵全过；有出入落 FEEDBACK
- [x] RUNBOOK + coding_wiki 钉版刷新；V-GREP 鲜活旧钉清零

---

## 范围

严格对齐 SPEC **§4.1** + **§6.2–6.3** + **§7**：

1. `package.json` / `pnpm-lock.yaml`：`pnpm add -D -E dsh-coding-kit@1.6.1`
2. `.cyning-harness/manifest.json`：经官方 `upgrade --yes` 写入（禁手改）
3. IDE 产品块：仅经 `refresh-ide-blocks` / `upgrade`（禁手改 begin/end 内文）
4. `scripts/graph-compile.sh`：钉版对齐（消除 D-PIN）；改前按 §6.4 备份入 `scripts/legacy/`
5. 文档钉版：`docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`、`docs/coding_wiki/**` 鲜活 `1.2.2`/`@1.2.1` → `1.6.1`
6. 有出入 → `docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_web_<date>.md`；无出入则自检注明「免落」
7. task / invoke 留痕

### graph-compile / CI 钉版策略（SPEC §6.2 · 推荐）

默认脚本形态（须在 30 invoke 写死，禁止混用）：

```bash
KIT_CLI="${KIT_CLI:-dsh-coding-kit@1.6.1}"
npx --yes "${KIT_CLI}" graph yaml …
```

- `package.json` 仍 exact 钉 1.6.1，供开发机 `pnpm exec dsh-coding-kit`
- 若改用 `pnpm exec` 进脚本，则 CI `tech-graph` job **须先 install** 或改回 `@1.6.1` npx；**二选一写死 invoke**

### 升级序列（SPEC §6.3 · 禁止跳步）

| # | 步骤 | 期望 |
|---|---|---|
| 1 | `check --target .` | exit 0；可升级；无「降级安装」误报 |
| 2 | `refresh-ide-blocks --dry-run` | 记录 rewrites / plain_mentions |
| 3 | （若有脏树）`git stash push -u` → `refresh-ide-blocks --yes` → `stash pop` | local 块不被改 |
| 4 | `upgrade --target . --yes` | manifest → **1.6.1** |
| 5 | upgrade 二跑 + refresh dry-run + check | 幂等 |
| 6 | `git diff AGENTS.md CLAUDE.md` | **空**（或仅产品块预期刷新且 local 完整） |
| 7 | `verify --task <本task>` | PASS（可 `--allow-no-review` 留痕） |
| 8 | `./scripts/graph-compile.sh` | exit 0；噪声纪律见 SPEC §0 |
| 9 | `pnpm lint` → `pnpm test` → `pnpm build` | 无**新增**失败 |
| 10 | 文档钉版 + V-GREP | §7 |
| 11 | 有出入 → FEEDBACK | 无则「免落」 |

CLI 默认：安装后 `pnpm exec dsh-coding-kit …`；安装前探查可用带版本 `npx --yes dsh-coding-kit@1.6.1 …`。

---

## 非范围

对齐 SPEC **§4.2** / **§1.2**：

- 业务页面 / API client / pinia / 路由
- 改 preset、改 `graph_modules_path` 业务含义、改 yaml 拓扑
- 引入 normalize、切换 graph.json 生成器为 kit export、改 tech-graph.yml 结构（仍调用 `./scripts/graph-compile.sh`）
- 手改 `<!-- cyning-harness-local:begin/end -->` 产品块
- 关账归档、强制 PR（00/维护者另令）
- 改 api 仓

---

## 依赖

- SPEC：`docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md`（§0 · §4 · §5 · §6.2–6.4 · §7 · §8）
- **硬依赖**：`docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md` 自检/invoke 判定 = **GO**
- api 先例（只读）：`ops-desk-api/docs/tasks/done/task_dsh_coding_kit_upgrade_1_6_1.md`、`ops-desk-api/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md`
- 本仓先例：`docs/tasks/done/task_coding_kit_upgrade_1_2_2.md`、`docs/tasks/done/task_migrate_dsh_coding_kit.md`
- RUNBOOK：`docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`

### 前置条件（SPEC §5 · 全部满足才开 30）

- [x] SPEC **HG-SPEC-SIGNOFF=approved**（已满足）
- [x] 本 task **HG-AUDIT-R1=approved**
- [x] 分支 `task/web-dsh-coding-kit-1-6-1`
- [x] T1 **GO**；`npm view` = `1.6.1`（或书面例外）
- [x] 工作树无无关脏改；或 stash 策略写入 invoke
- [x] 已读 §2 P0（api FEEDBACK 1.6.1 + api upgrade task）

---

## 失败路径

对齐 SPEC §8：

| 触发 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| T1 STOP / 未 GO | **拒开工**；本 task 不执行 | 否 | 报告 00 |
| help 破坏性（T1 漏网） | STOP；不继续 upgrade | 否 | 报告 00 |
| upgrade 改坏 local 块 | 自备份恢复；报 FEEDBACK | 是 | FEEDBACK |
| graph-compile 红且 diff 不可解释 | 恢复 bak；临时固定 KIT_CLI@1.2.2 自保并报告 | 是 | 失败报告 |
| CI tech-graph 因 pnpm/npx 策略红 | 按 §6.2 选定策略改 job 或脚本，保持版本钉 | 是 | CI 输出 |
| pnpm peer 再现类故障 | 记 FEEDBACK；不擅自改业务 `.npmrc` 除非验收需要 | 是 | FEEDBACK |
| verify 缺 invoke/R\<n\> | 补 invoke 或留痕豁免；不改业务混过 | 是 | verify 日志 |
| V-\* 任一项 FAIL | 回滚 bak / 还原 lock+manifest；写失败报告；不扩大改业务 | 人判 | 报告 |

---

## 验收标准

对齐 SPEC §7（可勾选）：

- [x] **V-MANIFEST**：`version=1.6.1`；preset/ide 未裁；`from_version` 非手改谎言
- [x] **V-PIN**：package + lock exact `1.6.1`；`frozen-lockfile` 绿
- [x] **V-CLI**：graph-compile / 开发命令实际解析 = 1.6.1
- [x] **V-LOCAL**：AGENTS/CLAUDE local 块完整；非预期 diff → FAIL
- [x] **V-VERIFY**：`verify --task` PASS（允许文档化的 `--allow-no-review`）
- [x] **V-GRAPH**：`./scripts/graph-compile.sh` exit 0
- [x] **V-MERMAID**：两张图无 `--"…"-->`；锚点 `%%` 风格；边数与 yaml 一致
- [x] **V-JSON**：`shared/graph.json` 仍由本仓 py 生成；check 绿
- [x] **V-FE**：pnpm 三件套无**新增**失败（对照 T1 基线）
- [x] **V-GREP**：鲜活指引无 `dsh-coding-kit@1.2.`；无鲜活 `npx @cyning/harness`（历史 done/invoke 除外）
- [x] **V-FB**：对照 api FEEDBACK；D1/D2/D3/R6/K7 不重复开缺陷；回退则新 FEEDBACK severity≥P2
- [x] **V-HELP**：CLI help diff 已在 T1/本 task invoke；无破坏性
- [x] wiki_delta：RUNBOOK + coding_wiki 钉版已刷
- [x] 10 + 30 invoke 就位

**总判定**：V-\* 全过 → 可提 PR；任一项 FAIL → 回滚，不扩大改业务。

---

## 给 30 必读

1. 本 task（范围 / 非范围 / 序列 / V-\* / failure_paths）
2. `docs/spec/SPEC-web-dsh-coding-kit-upgrade-1-6-1_v1.md` — **§0 签收注记为实现冻结点，原样遵守**
3. T1 自检/invoke：**必须 GO**；基线用于 V-FE
4. api FEEDBACK + api upgrade task（只读对照）
5. **禁止**手改 `cyning-harness-local` 产品块；**禁止**换 graph.json 生成器；**禁止**引入 normalize
6. graph-compile：改前备份；钉版策略写死 invoke（推荐 `KIT_CLI@1.6.1` + `npx --yes`）
7. 产物噪声：仅允许 `generated_at`（及既有 freeze_id 日滚动）类时间戳；其余须解释或 STOP

**30 闸**：三闸 **approved** + T1 **GO** → 可开工；任一 pending / STOP → **拒开工**。

---

## 思考轮控制

| 字段 | 值 |
|---|---|
| **thinking_profile** | `shortest` |
| **early_stop** | `yes` |
| **early_stop_reason** | `SPEC §0/§4/§6/§7 已冻结范围与序列；api 1.6.1 路径已实证；本仓仅跳版 + D-PIN，不重开 graph 命令面争论` |
| **actual_last_round** | `R2` |
| **residual_risks** | emit 风格跨多 minor 的不可解释 diff；CI tech-graph 未 install 与 pnpm exec 冲突（用推荐 npx@1.6.1 减漂移）；local 块被 refresh 误伤 |

### R0 · 问题框定

目标是跨仓 kit 对齐 + 消除 D-PIN，不是首迁或 graph 工具链重做。T1 负责 D-JUMP；本 task 负责钉版、官方 upgrade 序列与 §7 矩阵。

### R1 · 范围切片

§4.1 七项可改；§4.2 全禁。graph-compile 仅钉版；json 真值仍为本仓 py。文档只刷鲜活钉版，不动历史归档字面。

### R2 · 失败与交接

T1 STOP 则本 task 空转不执行。V-\* FAIL → 回滚 bak/lock/manifest。有出入落 FEEDBACK；无出入「免落」。闸与 commit/PR 交 00。

---

### 自检结论（30 回填）

| 项 | 内容 |
|---|---|
| **日期** | 2026-08-25 |
| **T1 GO 证据** | `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/invoke_20260825_30_web-dsh-kit-upgrade-probe-1-6-1.md`（GO；基线 0 failed/107 passed） |
| **manifest** | `version=1.6.1` · `from_version=1.2.2` · preset=`harness-only` · ide 保留 · 官方 `upgrade --yes` |
| **V-LOCAL** | PASS · AGENTS/CLAUDE local 块相对改前备份 **same=True**（零非预期字节变化） |
| **KIT_CLI 策略** | 推荐策略写死：`KIT_CLI="${KIT_CLI:-dsh-coding-kit@1.6.1}"` + `npx --yes`；CI tech-graph **未改** |
| **V-\* 总表** | 全 PASS（见 30 invoke） |
| **FEEDBACK** | **免落**（D1/D2/D3/R6/K7 不重复开缺陷；mermaid emit 为 DEF-023 预期） |
| **pnpm 三件套** | lint 0 · test 107/107（=T1 基线）· build 0 · 无新增失败 |

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

- D-PIN：CI tech-graph 未 `pnpm install` 时，`graph-compile.sh` 默认 `KIT_CLI=dsh-coding-kit@1.6.1` + `npx --yes`，与 package exact 钉并存。
- 跳版后 mermaid emit 差异按 DEF-023/R6 解释保留，勿盲目 checkout。
- Wiki: docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md

---

## CLOSE

| 项 | 内容 |
|---|---|
| 日期 | 2026-08-25 |
| 定稿 | kit **1.6.1**（from 1.2.2）· V-\* 全过 · FEEDBACK 免落 |
| 归档 | `docs/tasks/done/task_web_dsh_coding_kit_upgrade_1_6_1.md` |
| PR | （00 收口 · CI automerge） |

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-25 | 10-task 首稿（**active** / draft 待闸）：对齐 SPEC §4.1/§6.2–6.3/§7 + 00 切分 T2；依赖 T1 GO；三闸 pending |
| 2026-08-25 | 30 执行 T2：钉版 1.6.1 + D-PIN + upgrade 序列 + V-\* 全 PASS；FEEDBACK 免落；待 00 CLOSE+PR |
| 2026-08-25 | 00 验收 V-\* · 状态→completed · CLOSE 节补录 · 待 task close |
