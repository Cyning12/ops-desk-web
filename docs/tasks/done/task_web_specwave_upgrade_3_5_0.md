# Task：spec-wave 升级 3.5.0（web · 3.3.0 → 3.5.0）

> **状态**：`done`（2026-10-30 验收通过 · 全程本地零 push/PR · close_pr_policy=required 偏差授权 · 授权锚 m00236）  
> **类型**：基础设施 / harness 过程轨 minor  
> **前置**：3.3.0 wave done（`task_web_specwave_upgrade_3_3_0` · PR #55 MERGED）  
> **分支**：`task/specwave-upgrade-3-5-0`（base：`main`）  
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue / SSE；**全程本地**（允许本地 commit · 严禁 push / 开 PR）  
> **00 授权**：2026-10-30 维护者指令「更新specwave」

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-specwave-upgrade-3-5-0` |
| **git_branch** | `task/specwave-upgrade-3-5-0` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `pnpm exec spec-wave --version`=3.5.0；`npx spec-wave@3.5.0 upgrade --target . --yes`；`check`；`task lint` / `verify --task` 存量抽跑；`KIT_CLI=spec-wave@3.5.0` + graph-compile 复跑零意外 diff；图谱闸链（yaml check / drift / ib / ast）复验；`pnpm lint/test/build`（test 用 npx pnpm@10.32.1） |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue（`src/` 零改动） |
| **graph_delta** | `docs/_tech_graph/` |
| **graph_delta_note** | **不改模块边界 / 不改业务拓扑语义**：仅 graph-compile 复跑再生产物（预期仅时间戳噪声 · 若零 diff 则不入库）；3.5.0 图谱先读为条件触发（profile 已声明 `graph_modules_path: l1/01_modules`）· 实证其对存量 verify 的影响并照登 |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | RUNBOOK §修订记录 追加 3.5.0 历史行（钉版字面同步）；同类活文档钉版字面（coding_wiki README / wikilinks_export 若载 3.3.0 字面）一并同步 |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **related_pr** | `n/a` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-R1, 30 | 00 代录 approved（维护者长期授权锚 **m00236**「授权00签收后续文档」· 升级类 task 双闸代录 · 2026-10-30 指令「更新specwave」） |
| HG-AUDIT-R1 | approved | 30 | 00 代录 approved（授权锚 **m00236** · 同上） |

---

## 背景与目标

上游 **`spec-wave@3.5.0`**（自 3.3.0 跨 3.4 / 3.5 两个 minor）：
- **3.4.0**（minor · additive）：review-gates **址B 双址扫描**——`findLatestReview` 扫描面扩第三址 `docs/audits/task-review/` + 址B 命名口径 `YYYYMMDD_<slug>_r<n>.md`；址A（`docs/harness/reviews` · `reviews/`）扫描与命名判定逐字不变。无强制迁移。
- **3.5.0**（minor）：**图谱先读纪律**（条件触发 · 无 profile 零变化）——profile 声明可达的 `graph_modules_path` 后，`verify --task` 才检查图谱锚点引用。**本仓 profile 已声明 `graph_modules_path: "l1/01_modules"`** → 该闸对本仓**条件触发**，须实证对存量 active task verify 的影响。

包内无 CHANGELOG.md（files 白名单未含）；MIGRATION.md 明示两个 minor 均「无强制动作项」。

**完成态**：`package.json` / lock / manifest / `KIT_CLI` **四钉 3.5.0**；`check` 已是最新；存量 task lint/verify 抽跑实证（3.5.0 新闸行为照登）；graph-compile 复跑零意外 diff；三件套绿；FEEDBACK 落盘；RUNBOOK 历史行补齐。

## 范围

1. 钉 `"spec-wave": "3.5.0"`（exact）+ pnpm install（npx pnpm@10.32.1）
2. `npx spec-wave@3.5.0 upgrade --target . --yes`（manifest `from_version=3.3.0`）
3. `scripts/graph-compile.sh`：`KIT_CLI=spec-wave@3.5.0` + 复跑（仅时间戳噪声不入库）
4. 钉位全量对齐 grep 复扫（排除 node_modules / docs/tasks / docs/harness/reviews / by-task / audits / reports 历史留痕）
5. 升级后验证：`check` · `task lint --file` 现存 task 抽跑 · `verify --task` 现存 active task 抽跑（闸 pending → BLOCKED 属预期 · 记录）· 图谱四闸复验 · 三件套
6. FEEDBACK 档 `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md`
7. RUNBOOK §修订记录 补 3.5.0 行

## 非范围

- Vue/SSE 业务源码（`src/` / `tests/` 零改动）；历史档（done task / reviews / 旧 FEEDBACK / 旧 invoke）旧字面不改；api / workspace 仓改动；hooks 物化入库；push / PR（**严禁** · 全程本地）；启用 `graph indexes check`（opt-in · 另议）；profile 结构变更（3.5.0 图谱先读为既有 `graph_modules_path` 条件触发 · 非新增字段）

## 失败路径

| ID | 触发 | 行为 |
|----|------|------|
| F-1 | install/upgrade 失败 | STOP |
| F-2 | upgrade 冲掉仓内定制（cyning-harness-local 块 / HG-GRAPH-MODULES 本地行 / profile `graph_modules_path`） | 手合恢复 · 拒 `--force` 盲盖 · FEEDBACK 照登 |
| F-3 | 3.5.0 图谱先读闸对存量 active task verify 新增 BLOCK | 照登实证 · 判定是否属预期（条件触发语义）；不为凑闸改业务图谱语义 |
| F-4 | 3.4.0 址B 扫描误捕非审查文 | 照登实证；址A 真值不变 |
| F-5 | graph-compile 仅时间戳 diff | 还原 · 不入库 |
| F-6 | hooks 入库导致 pre-commit 裸 verify 红 | 删 hooks · FEEDBACK（维持不入库惯例） |

## 验收标准

- [x] `"spec-wave": "3.5.0"` · manifest version=3.5.0 · from_version=3.3.0
- [x] `--version`=3.5.0 · `check` 已是最新
- [x] `KIT_CLI=spec-wave@3.5.0` · graph-compile exit 0 · 产物零意外 diff（freeze_id/时间戳噪声已还原）
- [x] 钉位全仓 grep 复扫：3.3.0 活钉位清零（历史留痕目录除外）
- [x] `task lint --file` 现存 task 抽跑 PASS；`verify --task` 现存 active task（本 task）PASS（含 3.5.0 图谱先读闸行为实证 · 见自检结论）
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 全 exit 0
- [x] FEEDBACK 落盘 · RUNBOOK 历史行补齐
- [x] 全部 commit 在 `task/specwave-upgrade-3-5-0` · 零 push 零 PR

### 自检结论

| 命令 | 退出码 | 备注 |
|------|--------|------|
| `./node_modules/.bin/spec-wave --version` | 0 | 3.5.0 |
| `npx spec-wave@3.5.0 upgrade --target . --yes` | 0 | 3.3.0 → 3.5.0 · 一把过 · 仅 manifest 三行 diff |
| `npx spec-wave@3.5.0 sync prompts --target . --yes` | 0 | skip 3 · add 1（FRAGMENT_graph_first_read）· conflict 9 全部保留未覆盖 |
| `npx spec-wave@3.5.0 check --target .` | 0 | 已是最新（包 3.5.0 · manifest 3.5.0） |
| `npx spec-wave@3.5.0 task lint --file <本 task>` | 0 | LINT: PASS（W3/W4 draft 期合法豁免） |
| `npx spec-wave@3.5.0 task lint --file <3_3_0 done task>` | 0 | LINT: PASS（存量抽跑零回归） |
| `npx spec-wave@3.5.0 verify --task <本 task>` | 0→（R1 前 2） | R1 落盘前 BLOCKED · missing R<n> review（预期机检）；落盘后 **VERIFY: PASS** · **3.5.0 图谱锚点闸实证**：`INFO · 图谱锚点检查未生效（已跳过 · graph_path_unreachable · graph_modules_path=l1/01_modules）`（条件触发 · 不挡） |
| `graph yaml check --all` | 0 | 10/10 OK |
| `graph drift` | 0 | PASS · struct_layout=protocol · drifts=0 |
| `graph ib check` | 0 | PASS · checked_ib=80 · issues=0 |
| `graph ast check` | 0 | PASS · checked=49 · issues=0 · cross_path=29 inform |
| `task lint-wiki-delta --scope all` | 0 | scanned=65 · missing=0 · issues=0 |
| `./scripts/graph-compile.sh` | 0 | KIT_CLI=@3.5.0 · 10 graphs OK · 产物仅 freeze_id/时间戳噪声（已还原 · 零意外 diff） |
| `npx pnpm@10.32.1 lint / test / build` | 0 | 三件套全绿（test：33 文件 · 296 passed / 1 skipped · 2026-10-30） |

### KPI

Task_KPI%: 100（三钉对齐 · 验证全绿 · 全程本地零 push/PR · close_pr_policy=required 偏差同 2026-10-28 先例已授权）

---

## 给执行帽（30）必读

1. 本 task 闸表（HG-TASK-DRAFT / HG-AUDIT-R1 均 00 代录 approved · 授权锚 m00236）
2. 3.3.0 wave FEEDBACK：`docs/spec/doc-health/feedback/2026-10-11_3.3.0_web_upgrade.md`
3. 上游 MIGRATION.md「3.3.0 → 3.4.0」/「3.4.0 → 3.5.0」节（两 minor 均无强制动作项；3.5.0 图谱先读条件触发）
4. **禁入库 hooks**（F-6）；全程本地零 push/PR
