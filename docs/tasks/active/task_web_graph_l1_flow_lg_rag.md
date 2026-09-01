# Task：Web · 图谱 P1a · G-L1 新建 10_flow_lg_rag（lg-rag 页流程 + l2 indexes 同步）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：图谱/文档（无业务代码变更）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现  
> **上游 SPEC**：[`SPEC-web-tech-graph-incremental-completion_v1.md`](../../spec/SPEC-web-tech-graph-incremental-completion_v1.md) §3 P1（flow 补全 · lg-rag 优先）+ P2 先行切片（lg_rag 域 indexes 同步 · 防脱节）  
> **前置**：P0 CLOSE · [`task_web_graph_l0_stale_sweep`](../done/task_web_graph_l0_stale_sweep.md) · PR [#31](https://github.com/Cyning12/ops-desk-web/pull/31) MERGED

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-graph-l1-flow-lg-rag` |
| **git_branch** | `task/web-graph-l1-flow-lg-rag` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 20 R1 审 → 30 实现 → 40 自检（闸沿用维护者「提前签收」授权 · R1 后即签） |
| **test_strategy** | `required` |
| **test_strategy_note** | `graph-compile.sh` 绿 + grep/yaml 断言（flow 节点 implementedBy 与 src 符号一一对应 · indexes 同步）+ `pnpm lint/test/build` 回归绿（src 零变更） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（+ G-L2 indexes 同步切片） |
| **graph_delta** | 新建 `docs/_tech_graph/l1/10_flow_lg_rag.graph.yaml`（compile 生成 .md）· `l1/01_modules.md`（关联 + pages 行补 Obs · R1-N3 欠账）· `l2/indexes/by_path.yaml` / `by_symbol.yaml`（lg_rag 域条目） |
| **graph_delta_note** | 新增 G-L1 flow（不新增一级模块）；l2 indexes 同 task 同步（对齐「改 flow 必同步 indexes」义务 · 防再造 T6 前脱节） |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：flow 建模清单 + 真值指针（SPEC §3 P1）；不长文粘贴 |
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
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者「提前签收task」授权沿用 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· **不新增一级模块**（flow 属 G-L1 · 页面已覆盖 pages 行）；`01_modules.md` 仅 pages 行补 Obs + 关联节 + 人签记录 |
| **HG-AUDIT-R1** | pending | **30** | 20-task-audit R1 pass 后 web 00 即签 · review 落盘 `docs/harness/reviews/task_web_graph_l1_flow_lg_rag_audit_R1_20260831.md` |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波 · 无跨仓联调；CI + grep 断言为验收 |

---

## 背景与目标

G-L1 目前仅 `10_flow_chat`；lg-rag invoke 页（T2–T6 主线真值所在域的调试台）无独立 flow（SPEC G3）。本 task 新建 `10_flow_lg_rag`，并同波同步 l2 indexes lg_rag 域条目（防「有 flow 无 indexes」再造脱节），顺带补 P0 R1-N3 欠账（`01_modules.md` pages 行缺 Obs 页）。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| flow 建模真值 | **只画实证链**（30 先读码再落）：`LgRagView` → `useLgRagStore`（`invoke` / `abort` / `useThreadId` / elapsed 计时）→ `api/lgRag.ts` `invokeLgRag` → `api/http.ts` axios → `POST /api/ops/lg-rag/invoke` → ops_api；旁注：mode 三档（router/basic/supervisor）· thread_id 续写回填 · `route=refuse`/`gate_action=refuse` 为 200 成功态 · 非流式（SSE 主线在 `10_flow_chat`） |
| implementedBy | 每节点挂 `implementedBy`（path/symbol/kind · layer_hint=G-L2 · 对齐 `10_flow_chat` 格式）；符号须真实存在于 src（禁臆造） |
| l2 同步 | `l2/indexes/by_path.yaml` / `by_symbol.yaml` 增 lg_rag 域条目（覆盖本 flow 全部 implementedBy 符号）；格式对齐 chat 试点 |
| modules 补 | `01_modules.md`：pages 行补 Obs 页（P0 R1-N3）· 关联节加 `10_flow_lg_rag.md` 链接 · 人签记录追加本 task 行 |
| compile | `./scripts/graph-compile.sh` 生成 `10_flow_lg_rag.md` + graph.json 双写 · 产物不手改 |
| 模块 | 不新增一级模块 |
| 合入 | PR **勿 auto-merge**；CI 绿即合（无联调闸） |

---

## 范围

- 新建 `docs/_tech_graph/l1/10_flow_lg_rag.graph.yaml`（+ compile 产物 `10_flow_lg_rag.md`）
- `docs/_tech_graph/l2/indexes/by_path.yaml` · `by_symbol.yaml`（lg_rag 域条目 · 与 flow implementedBy 一一对应）
- `docs/_tech_graph/l1/01_modules.md`（pages 行补 Obs · 关联节 · 人签记录）
- compile 产物：graph.json 双写（脚本再生成）
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- `src/**` 任何变更（纯图谱波）
- 其余页 flow（overview/issues/pulls/graph/lc_evidence/obs/login · SPEC P1 后续子 task）
- l2 indexes 其余域扩展（SPEC P2 本波仅 lg_rag 先行切片）
- 双写收敛 / CI 强化（SPEC P3）· l0 改动（P0 已 CLOSE）
- api / iOS 仓图谱 · schema 升级

---

## 验收标准

> 完成态（30 交付时逐项勾选）：

- [ ] `10_flow_lg_rag.graph.yaml` 新建：实证链节点/边齐（view → store → api → http → invoke 端点）· 旁注含 refuse=200 · 非流式 · thread_id 回填
- [ ] 全部 `implementedBy` 符号在 src 真实存在（grep 逐符号断言）
- [ ] l2 indexes lg_rag 域条目与 flow implementedBy 一一对应（yaml 断言）
- [ ] `01_modules.md` pages 行含 Obs · 关联节含 `10_flow_lg_rag.md` · 人签记录追加
- [ ] `./scripts/graph-compile.sh` 绿 · `10_flow_lg_rag.md` 生成 · graph.json 双写再生成
- [ ] `pnpm lint` / `pnpm test` / `pnpm build` 回归绿 · `git diff main --stat -- src/` 为空
- [ ] `volatile.md` 短注落盘 · `verify` PASS

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| compile 红（yaml 语法/schema） | 不合入 · 修至绿 | 是 | CI 红 |
| implementedBy 符号与 src 不符 | 30 先 grep 实证再落（禁臆造）· 审查拦截 | 是 | — |
| indexes 与 flow 不一一对应 | 同 task 内修齐（本 task 同步义务） | 是 | — |
| 误改 l0 / src | 范围外 · diff 断言拦截 | — | — |

---

## 依赖

| 依赖 | 说明 |
|---|---|
| SPEC | §3 P1（+ P2 先行切片授权）· G3/G4 缺口证据 |
| 格式先例 | `l1/10_flow_chat.graph.yaml`（implementedBy/layer_hint 格式）· `l2/indexes/` chat 试点 |
| 现状真值 | `src/views/LgRagView.vue` · `src/stores/lgRag.ts` · `src/api/lgRag.ts` · `src/api/http.ts` |

---

## test_strategy

```bash
./scripts/graph-compile.sh
pnpm lint && pnpm test && pnpm build   # 回归（src 零变更）
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_lg_rag.md
```

---

### 自检结论

> 30/40 交付时回填：compile / lint / test / build / verify 退出码与结论表。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `docs/_tech_graph/README.md` + `LAYER_README.md` · `l2/README.md`（indexes 纪律）
3. `l1/10_flow_chat.graph.yaml`（格式先例）· `l2/indexes/by_path.yaml` / `by_symbol.yaml`（chat 试点格式）
4. 实证源码：`src/views/LgRagView.vue` · `src/stores/lgRag.ts` · `src/api/lgRag.ts` · `src/api/http.ts`
5. `docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1/P2

> 思考轮：由 SPEC（R0–R5 全轮已回填）承载；本文件不预置 R0–R5（lint W4 合法）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · P0 CLOSE（#31）续开 P1a · 维护者「提前签收task」授权沿用 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · l2 lg_rag 域 indexes 同波同步（防脱节） |

## 合入策略

- PR：**勿 auto-merge**（close_pr_policy=required）· 纯图谱波无联调闸 · CI（含 tech-graph）绿 + 00 抽查后 00 收口 merge
- CLOSE 后续开 P1 其余页 flow（优先级 task 内再钉）或按维护者指示直接进 P2/P3
