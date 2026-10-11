# Task：spec-wave 升级 3.3.0（web · 3.0.2 → 3.3.0）+ tech_graph 格式固定

> **状态**：`done`  
> **类型**：基础设施 / harness 过程轨 minor（含图谱 schema 迁移）  
> **前置**：3.0.2 wave done（`spec-wave@3.0.2` · PR #50 CLOSE）  
> **分支**：`task/web-specwave-3-3-0`（base：`main`）  
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue / SSE  
> **00 授权**：2026-10-11「更新spec-wave到3.3.0，并根据新的规则来固定tech_graph格式」

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-specwave-upgrade-3-3-0` |
| **git_branch** | `task/web-specwave-3-3-0` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `pnpm exec spec-wave --version`=3.3.0；`upgrade --yes`；`check`；`verify --task`；`KIT_CLI=spec-wave@3.3.0` + graph-compile；`graph yaml check --all` / `graph drift` / `graph ib check` / `graph ast check` 四闸绿；`pnpm lint/test/build` |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue（`src/` 零改动） |
| **graph_delta** | `docs/_tech_graph/` |
| **graph_delta_note** | **不改模块边界 / 不改业务拓扑语义**：① 9 个 `*.graph.yaml` 的 `nodes[].implementedBy` 数组形 → 3.2+ schema 对象形 `{path, symbol?}`（丢 `kind` 子键 · export 本就不透传）；② obs 两节点多实现 → 主实现入 `implementedBy`、副实现入 YAML 注释（3.3.0 每节点单一 IB）；③ lg_rag `use_thread_id→lg_rag_store` 边为同 path 内部态写（非调用）· 折叠进 inbound 边 label（3.3 ast 闸 `missing_bounded_call` 修复）；④ 新增 `.spec-wave/graph-drift.yaml`（`struct_rel: l1/01_modules.md` · 模块表 Phase γ 真值路径） |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | RUNBOOK 追加 3.3.0 历史行 + §3 钉版字面；同类活文档字面同步：`docs/coding_wiki/README.md` · `docs/coding_wiki/topics/wikilinks_export.md`（钉版字面 → 3.3.0） |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **related_pr** | `#55` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-GRAPH-MODULES | approved | 30 | **不新增/不改动一级模块**（`l1/01_modules.md` 零 diff · 人签记录无需新行）；仅 IB 字段形状迁移 + 一条非调用边折叠 |
| HG-TASK-DRAFT | approved | 20-R1, 30 | 00 本窗授权「更新spec-wave到3.3.0，并根据新的规则来固定tech_graph格式」 |
| HG-AUDIT-R1 | approved | 30 | 00 于 2026-10-11 本窗签收「签收」（30 由 00 直接指令先行 · 同 3.0.2 G-1 闸序留痕惯例） |

---

## 背景与目标

上游 **`spec-wave@3.3.0`**（自 3.0.2 跨 3.1/3.2/3.3 三个 minor）带来图谱保真闸链：`graph scaffold`（3.1）· `graph drift`（3.1 W3/3.2 W2 · 模块表覆盖+边锚点）· `.spec-wave/graph-vocab.yaml` 仓级词表（3.1 W4）· `graph ib check`（3.2 W1 · **`implementedBy` 须为 object** · 点 path 存在性）· `graph indexes check`（3.2 W3 · opt-in）· `graph ast check`（3.3 · opt-in · symbol + 同 path 有界 call）。本仓 9 个 flow 图谱的 `implementedBy` 为 3.0.2 时代数组形（`- path/symbol/kind`），不合 3.2+ schema（`check` 报 `implementedBy 须为 object` ×73）。

**完成态**：`package.json` / lock / manifest / `KIT_CLI` **四钉 3.3.0**；tech_graph 9 图 IB 全改对象形；`graph yaml check --all` / `graph drift` / `graph ib check` / `graph ast check` 四闸绿；graph-compile 再生产物入库；`check` / `verify --task` / 三件套绿；FEEDBACK 落盘；hooks 不入库。

## 范围

1. 钉 `"spec-wave": "3.3.0"`（exact）+ `pnpm install`
2. `pnpm exec spec-wave upgrade --yes`（manifest `from_version=3.0.2`）
3. **tech_graph 格式固定**：9 个 `l1/*.graph.yaml` `implementedBy` 数组形 → 对象形；obs 双实现节点主从处置；lg_rag 非调用边折叠
4. 新增 `.spec-wave/graph-drift.yaml`（`struct_rel: l1/01_modules.md` · 对齐 Phase γ 模块表真值路径）
5. `scripts/graph-compile.sh`：`KIT_CLI=spec-wave@3.3.0`；重跑 compile 再生产物（md 戳 + graph.json）入库
6. coding_wiki / RUNBOOK 钉版字面 → 3.3.0
7. `sync prompts`（dry-run 核查）：conflict 不 `--force` · **保留** `HG-GRAPH-MODULES` 本地行
8. `check` / `verify --task` / 四图谱闸 / `pnpm lint|test|build`
9. FEEDBACK 落盘；hooks 不入库维持

## 非范围

- Vue/SSE 业务源码（`src/` / `tests/` 零改动）；历史档（done task / reviews / 旧 FEEDBACK / 旧 invoke）旧字面；api / workspace 仓改动；hooks 物化入库；`graph scaffold` 重生成（本仓图谱为人签真值 · 不用草稿覆盖）；`graph indexes check` 启用（opt-in · 需另配 `graph-indexes.yaml` · 另议）；自定义本体（3.0 ONTO-OPEN 裁定本体层不开放）

## 失败路径

| ID | 触发 | 行为 |
|----|------|------|
| F-1 | install/upgrade 失败 | STOP |
| F-2 | sync 冲掉 `HG-GRAPH-MODULES` | 手合恢复 · 拒 `--force` 盲盖（本波实测 conflict ×2 仅本地闸行 diff · 保留） |
| F-3 | hooks 入库导致 pre-commit 裸 verify 红 | 删 hooks · FEEDBACK |
| F-4 | graph-compile 仅戳 diff | 接受入库（本波另有 IB 形状 diff · 一并入库） |
| F-5 | 多实现节点信息丢失 | 副实现路径入 YAML 注释（`另有实现:`）· md 叙述节已载四 fixture 全路径 |
| F-6 | ast 闸报真实代码问题 | 不改业务代码凑闸；边语义修正须保真（本波 `use_thread_id→lg_rag_store` 实证为内部态写 · 折叠 label） |

## 验收标准

- [x] `"spec-wave": "3.3.0"` · manifest version=3.3.0 · from_version=3.0.2
- [x] `--version`=3.3.0 · `check` 已是最新
- [x] 9 图 `implementedBy` 全对象形 · `graph yaml check --all --input docs/_tech_graph` 10/10 OK
- [x] `.spec-wave/graph-drift.yaml` 落盘 · `graph drift` PASS（struct_layout=protocol · drifts=0）
- [x] `graph ib check` PASS（checked_ib=73 · issues=0）
- [x] `graph ast check` PASS（checked=45 · issues=0 · cross_path=25 inform）
- [x] `KIT_CLI=spec-wave@3.3.0` · graph-compile exit 0（10 graphs · 112 nodes · 119 edges）
- [x] `grep -n "HG-GRAPH-MODULES" docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md` 有命中（sync conflict 保留本地行）
- [x] 钉版字面：coding_wiki ×2 · RUNBOOK §3 + 历史行
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿
- [x] FEEDBACK 落盘（`docs/spec/doc-health/feedback/2026-10-11_3.3.0_web_upgrade.md`）
- [x] `verify --task` PASS（2026-10-11 · HG-AUDIT-R1 00 签收 + R1 审查文落盘后）
- [x] invoke 落盘 `docs/harness/invokes/by-task/web-specwave-upgrade-3-3-0/`

### 自检结论

| 命令 | 退出码 | 备注 |
|------|--------|------|
| `spec-wave --version` | 0 | 3.3.0 |
| `upgrade --yes` | 0 | 3.0.2 → 3.3.0 · prompts 未自动同步 |
| `check --target .` | 0 | 已是最新（升级后复检） |
| `graph yaml check --all` | 0 | 10/10 OK（IB 对象形迁移后） |
| `graph drift` | 0 | PASS · struct_layout=protocol · drifts=0 |
| `graph ib check` | 0 | PASS · checked_ib=73 · issues=0 |
| `graph ast check` | 0 | PASS · checked=45 · issues=0 |
| `./scripts/graph-compile.sh` | 0 | KIT_CLI=@3.3.0 · 10 graphs · 112 nodes · 119 edges |
| `pnpm lint/test/build` | 0 | 三件套全绿（2026-10-11） |
| `verify --task` | 0 | **PASS**（HG-AUDIT-R1 00 签收 + `reviews/task_web_specwave_upgrade_3_3_0_audit_R1_20261011.md`） |

### KPI

Task_KPI%: 100（PR #55 MERGED 2026-10-11 · CI 绿后 merge · 关账）

---

## 给执行帽（30）必读

1. 本 task 闸表（HG-AUDIT-R1 **pending** · 待 00 签收）
2. 3.0.2 wave FEEDBACK：`docs/spec/doc-health/feedback/2026-09-30_3.0.2_web_upgrade.md`
3. 上游 `MIGRATION.md`「消费仓 graph:ci / Python yaml 工具 → SpecWave graph yaml」节（双栈 · 无强制删脚本）；README 图谱节（drift/ib/indexes/ast 保真分责）
4. **禁入库 hooks**（F-3）；`graph ast check` 为 opt-in 有界闸 · **非**完整 callgraph · 不进默认 verify
