# Task：spec-wave 升级 3.5.0（web · 3.3.0 → 3.5.0）

> **状态**：`active`  
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

- [ ] `"spec-wave": "3.5.0"` · manifest version=3.5.0 · from_version=3.3.0
- [ ] `--version`=3.5.0 · `check` 已是最新
- [ ] `KIT_CLI=spec-wave@3.5.0` · graph-compile exit 0 · 产物零意外 diff
- [ ] 钉位全仓 grep 复扫：3.3.0 活钉位清零（历史留痕目录除外）
- [ ] `task lint --file` 现存 task 抽跑 PASS；`verify --task` 现存 active task 抽跑结果照登（含 3.5.0 图谱先读闸行为实证）
- [ ] `pnpm lint` / `pnpm test` / `pnpm build` 全 exit 0
- [ ] FEEDBACK 落盘 · RUNBOOK 历史行补齐
- [ ] 全部 commit 在 `task/specwave-upgrade-3-5-0` · 零 push 零 PR

### 自检结论

（执行后回填）

### KPI

Task_KPI%: 0（draft · 执行后回填）

---

## 给执行帽（30）必读

1. 本 task 闸表（HG-TASK-DRAFT / HG-AUDIT-R1 均 00 代录 approved · 授权锚 m00236）
2. 3.3.0 wave FEEDBACK：`docs/spec/doc-health/feedback/2026-10-11_3.3.0_web_upgrade.md`
3. 上游 MIGRATION.md「3.3.0 → 3.4.0」/「3.4.0 → 3.5.0」节（两 minor 均无强制动作项；3.5.0 图谱先读条件触发）
4. **禁入库 hooks**（F-6）；全程本地零 push/PR
