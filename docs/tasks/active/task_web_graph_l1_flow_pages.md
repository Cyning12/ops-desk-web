# Task：Web · 图谱 P1b · G-L1 其余页 flow 补全（7 页 · l2 indexes 同波同步）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：图谱/文档（无业务代码变更）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现  
> **上游 SPEC**：[`SPEC-web-tech-graph-incremental-completion_v1.md`](../../spec/SPEC-web-tech-graph-incremental-completion_v1.md) §3 P1（其余页 flow）+ P2 先行切片（各域 indexes 同波同步）  
> **前置**：P1a CLOSE · [`task_web_graph_l1_flow_lg_rag`](../done/task_web_graph_l1_flow_lg_rag.md) · PR [#33](https://github.com/Cyning12/ops-desk-web/pull/33) MERGED（格式与多域分段先例）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-graph-l1-flow-pages` |
| **git_branch** | `task/web-graph-l1-flow-pages` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 20 R1 审 → 30 实现 → 40 自检（闸沿用维护者「提前签收」授权 · R1 后即签） |
| **test_strategy** | `required` |
| **test_strategy_note** | `graph-compile.sh` 绿 + 逐 flow 断言（implementedBy 符号 grep 实证 · indexes↔flow 一一对应）+ `pnpm lint/test/build` 回归绿（src 零变更） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（+ G-L2 indexes 同步切片） |
| **graph_delta** | 新建 `l1/10_flow_{overview,issues,pulls,graph,lc_evidence,obs,login}.graph.yaml`（compile 生成 .md）· `l2/indexes/` 各域条目 · `l1/01_modules.md` 关联节 · `l2/README.md` 覆盖域 |
| **graph_delta_note** | 7 个 G-L1 flow 新建（不新增一级模块）；l2 indexes 同波同步（P1a 防脱节纪律沿用） |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：7 flow 清单 + 真值指针（SPEC §3 P1）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者令「继续P1」+「提前签收task」授权沿用 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· 不新增一级模块（flow 属 G-L1 · 页面已覆盖 pages 行） |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 即签（维护者「提前签收」授权沿用）· R1 审 [reviews/task_web_graph_l1_flow_pages_audit_R1_20260831.md](../../harness/reviews/task_web_graph_l1_flow_pages_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 6 非阻塞 note（N1 复合键、N2 obs fixture 链已随签收入 00 定夺 · N3 见修订记录勘误 · 余 30 内决） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波 · 无跨仓联调；CI + grep 断言为验收 |

---

## 背景与目标

P1a 已交付 `10_flow_lg_rag` 并立「flow + 同域 l2 indexes 同波同步」先例（多域分段 · `graph_ids` 列表）。本 task 一次性补齐其余 7 页 flow（SPEC G3 清零）：overview / issues / pulls / graph / lc_evidence / obs / login。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| 建模原则 | **只画实证链**（30 先读码 grep 再落 · 禁臆造）；每页 view → store → api → http → 端点 → ops_api；页级特有语义写 description 旁注 |
| obs 特殊性 | obs 页实证链止于 fixture（无 http/ops_api 段 · R1-N2）→ flow 画到 fixture 数据源为止并在 description 旁注「本地 fixture 驱动 · 无后端调用」 |
| 页→链锚点（00 预实证 · 30 复核） | overview：`OverviewView → useOverviewStore → api/overview.ts`（MedianMetric/TrendPoint 类型在案）· issues：`IssuesView → useIssuesStore → api/issues.ts` · pulls：`PullsView → usePullsStore → api/pulls.ts`（PULL_STATE/CI_STATUS 选项常量）· graph：`GraphView → useGraphStore → api/graph.ts` · lc_evidence：`LcEvidenceView → useLcEvidenceStore → api/lcEvidence.ts` · obs：`ObsView → useObsStore → api/obs.ts`（ObsStatusScenario）· login：`LoginView → useAuthStore → api/auth.ts`（登录/登出 · 路由守卫联动可在旁注） |
| 格式 | 对齐 `10_flow_chat` / `10_flow_lg_rag`（schema v3 · G-L1 · depth method · implementedBy+layer_hint=G-L2 · version 2026-08-31） |
| l2 同步 | 每 flow 的全部 implementedBy 符号同波进 `by_path.yaml` / `by_symbol.yaml`（P1a N3 分段形态沿用 · `graph_ids` 列表 · 头注加域）；**by_symbol 本波直接启用 `path#symbol` 复合键**（R1-N1：撞键必然触发——load×5 · invoke/abort 撞 lg_rag 现有键 · setPage/setPageSize 互撞；新条目一律复合键，既有 chat/lg_rag 裸键条目不迁移、头注注明双形态） |
| modules/l2 README | `01_modules.md` 关联节补 7 条 flow 链接 + 人签记录；`l2/README.md` 覆盖域更新为全模块清单 |
| compile | `./scripts/graph-compile.sh` 生成各 .md + graph.json 双写 · 产物不手改 · 时间戳 diff 容忍 |
| 模块 | 不新增一级模块 |
| 合入 | PR **勿 auto-merge**；CI 绿即合（无联调闸） |

---

## 范围

- 新建 7 个 `docs/_tech_graph/l1/10_flow_*.graph.yaml`（+ compile 产物 .md）
- `docs/_tech_graph/l2/indexes/by_path.yaml` · `by_symbol.yaml`（7 域条目 · 与各自 flow implementedBy 一一对应）
- `docs/_tech_graph/l2/README.md`（覆盖域 = 全模块）· `docs/_tech_graph/l1/01_modules.md`（关联节 + 人签记录）
- compile 产物：graph.json 双写（脚本再生成）
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- `src/**` 任何变更（纯图谱波）
- l0 改动（P0 已 CLOSE）· 双写收敛 / CI 强化（SPEC P3）
- api / iOS 仓图谱 · schema 升级
- flow 间跨页编排图（本波每页独立 flow · 总图已在 l0）

---

## 验收标准

> 完成态（30 交付时逐项勾选）：

- [ ] 7 个 flow yaml 新建：各自实证链节点/边齐 · 页级旁注（特有语义）· compile 生成对应 .md
- [ ] 全部 `implementedBy` 符号在 src 真实存在（逐符号 grep 断言 · 30 附证据清单进 invoke_30）
- [ ] l2 indexes 7 域条目与各自 flow implementedBy 一一对应（机检断言）；by_symbol 撞键=0 或已升级复合键
- [ ] `01_modules.md` 关联节 7 链接齐 + 人签记录追加 · `l2/README.md` 覆盖域更正
- [ ] `./scripts/graph-compile.sh` 绿 · graph.json 双写再生成
- [ ] `pnpm lint` / `pnpm test` / `pnpm build` 回归绿 · `git diff main --stat -- src/` 为空
- [ ] `volatile.md` 短注落盘 · `verify` PASS

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| compile 红（yaml 语法/schema） | 不合入 · 修至绿 | 是 | CI 红 |
| 某页链路与预实证锚点不符 | 30 以 src 实证为准修正 flow · invoke_30 记录偏差 | 是 | — |
| by_symbol 撞键（泛名如 fetch/load） | 启用 `path#symbol` 复合键（P1a N6 预案） | 是 | — |
| indexes 与 flow 不对齐 | 同 task 内修齐（同步义务） | 是 | — |
| 误改 l0 / src / scripts | 范围外 · diff 断言拦截 | — | — |

---

## 依赖

| 依赖 | 说明 |
|---|---|
| SPEC | §3 P1（其余页）· G3 缺口 |
| 先例 | P1a `10_flow_lg_rag` 格式 + l2 多域分段形态（N3/N6 内决已录） |
| 现状真值 | `src/views/` · `src/stores/` · `src/api/`（00 预实证锚点见 00 定夺 · 30 复核） |

---

## test_strategy

```bash
./scripts/graph-compile.sh
pnpm lint && pnpm test && pnpm build   # 回归（src 零变更）
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_pages.md
```

---

### 自检结论

> 30/40 交付时回填：compile / lint / test / build / verify 退出码与结论表。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `docs/_tech_graph/README.md` + `LAYER_README.md` · `l2/README.md`
3. 格式先例：`l1/10_flow_lg_rag.graph.yaml`（P1a · 含多域 indexes 分段形态）· `l2/indexes/` 现状
4. 实证源码：`src/views/*.vue` · `src/stores/*.ts` · `src/api/*.ts`（00 定夺锚点表复核）
5. `docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1

> 思考轮：由 SPEC（R0–R5 全轮已回填）承载；本文件不预置 R0–R5（lint W4 合法）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者令「继续P1」· P1a CLOSE（#33）· 闸沿用「提前签收」授权 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · 7 页 00 预实证锚点已核（router/stores/api 全量在案） |
| 2026-08-31 | **20** R1 pass-with-notes（0 阻塞 / 6 note · 7/7 页锚点全量复核通过）→ **00** 即签 HG-AUDIT-R1 · N1 by_symbol 撞键必然 → 本波直接启用 `path#symbol` 复合键（既有裸键不迁移）· N2 obs 链止 fixture 入 00 定夺 · 勘误 N3：SPEC P1 枚举漏 `10_flow_graph`（G3 意图覆盖 · 本 task 范围已含 graph 页 · SPEC 已签不改正文） |

## 合入策略

- PR：**勿 auto-merge**（close_pr_policy=required）· 纯图谱波无联调闸 · CI（含 tech-graph）绿 + 00 抽查后 00 收口 merge
- CLOSE 后：SPEC P1 全清 → 进 P2 收尾判定（各域 indexes 已随 flow 同波落地 · P2 或仅剩复合键升级等余量）或按维护者指示直接进 P3
