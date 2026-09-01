# Task：Web · 图谱 P0 · G-L0 脱节清扫（l0 边/节点对齐 T2–T6 后现状）

> **状态**：completed（2026-08-31 CLOSE · PR [#31](https://github.com/Cyning12/ops-desk-web/pull/31) MERGED · 纯图谱波 CI 绿收口 · 00 统筹归档）  
> **类型**：图谱/文档（无业务代码变更）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现  
> **上游 SPEC**：[`SPEC-web-tech-graph-incremental-completion_v1.md`](../../spec/SPEC-web-tech-graph-incremental-completion_v1.md) §3 P0（HG-SPEC-SIGNOFF approved · 维护者令「签收spec」）  
> **前置**：lg-rag SSE T2–T6 全波 CLOSE（web #23/#25/#26/#28/#29）· kit 1.10.0 已最新（免升级波）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-graph-l0-stale-sweep` |
| **git_branch** | `task/web-graph-l0-stale-sweep` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 20 R1 审 → 30 实现 → 40 自检（闸已获维护者「提前签收」授权 · R1 后即签） |
| **test_strategy** | `required` |
| **test_strategy_note** | `graph-compile.sh` 绿 + grep 断言（l0 无 `chat/stream` · 新页节点齐）+ `pnpm lint/test/build` 回归绿（src 零变更） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L0` |
| **graph_delta** | `docs/_tech_graph/l0/00_main.graph.yaml`（+ compile 再生成 `00_main.md` · 根/shared `graph.json`） |
| **graph_delta_note** | l0 边 label 对齐 lg-rag 主线 · 补齐 7 个缺失页节点 · version 刷新；不新增一级模块 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：l0 清扫清单 + 真值指针（SPEC §3 P0）；不长文粘贴 |
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
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者令「提前签收task」授权 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（维护者授权代签文档闸）· 不新增一级模块 · 仅 G-L0 l0 文件 + compile 产物 |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 即签（维护者「提前签收」授权）· R1 审 [reviews/task_web_graph_l0_stale_sweep_audit_R1_20260831.md](../../harness/reviews/task_web_graph_l0_stale_sweep_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 6 非阻塞 note（N4–N6 已随签收入 task · N1–N3 见修订记录勘误） |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波 · 无跨仓联调；以 CI + grep 断言为验收 |

---

## 背景与目标

G-L0 顶层图自 2026-07-27 未跟进：`sse_client → ops_api` 边 label 仍 `POST /api/ops/chat/stream`（api T6 后 410 Gone · T2 切流起脱节 · SPEC G1）；页面节点仅 chat/obs，缺 Login/Overview/Issues/Pulls/Graph/LC Evidence/LG RAG 七页（SPEC G2）；version 陈旧。本 task 把 l0 对齐 T2–T6 后现状。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| 边修正 | `sse_client → ops_api` label 改 `POST /api/ops/lg-rag/stream`；l0 全文不得再出现 `chat/stream`。`sse_client` 语义重释为 lg-rag SSE（label 注记 · R1-N6）；l0 `description` 旧表述「SSE Chat 消费」同步改为 lg-rag SSE 主线（R1-N5） |
| 节点补齐 | 新增页节点：`login_page` · `overview_page` · `issues_page` · `pulls_page` · `graph_page` · `lc_evidence_page` · `lg_rag_page`（id 蛇形 · label 中文页名 · kind=flow）；自 `pages` 节点 `includes` 边接入；`lg_rag_page` 增加 → `api_client`（invoke）调用边；chat_page 的 streams 边保留（sse_client 语义即 lg-rag SSE） |
| version | `version` 刷新为 `2026-08-31` |
| compile | `./scripts/graph-compile.sh` 再生成 `l0/00_main.md` + 根 `graph.json` + `shared/graph.json`（双写现状维持 · 收敛属 SPEC P3） |
| 模块 | 不新增一级模块；`01_modules.md` 零 diff（页面已覆盖于 pages 行） |
| 合入 | PR **勿 auto-merge**；CI 绿即合（无联调闸） |

---

## 范围

- `docs/_tech_graph/l0/00_main.graph.yaml`（边 label · 7 新页节点+边 · version）
- compile 产物：`l0/00_main.md` · `graph.json` · `shared/graph.json`（脚本再生成 · 不手改）
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- `src/**` 任何变更（纯图谱波）
- G-L1 flow 补全（SPEC P1）· G-L2 indexes 扩展（P2）· 双写收敛 / CI 强化（P3）
- l0 拓扑重构（只修脱节 + 补缺失节点 · 不重排分层）
- api / iOS 仓图谱
- schema 升级（`inform_graph.v3` 冻结）

---

## 验收标准

> 完成态（30 交付时逐项勾选）：

- [x] l0 yaml 全文无 `chat/stream` 字样（grep 断言 exit 1 零命中 · 2026-08-31 30/40）· `sse_client → ops_api` label = `POST /api/ops/lg-rag/stream`
- [x] 7 个新页节点 + `includes` 边齐（grep 断言 · 与 `src/views/` 实证 9 页清单一一对应：Chat/Obs 已有 + 新增 7）
- [x] `lg_rag_page → api_client` 调用边存在（label `calls（invoke · POST /api/ops/lg-rag/invoke）` · 实证链 grep 核过）
- [x] `version` = `2026-08-31`
- [x] `./scripts/graph-compile.sh` 绿（exit 0 · OK 00_main/10_flow_chat）· `00_main.md` / 双写 graph.json 再生成（diff 仅本 task 变更面）
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 回归绿（全 exit 0 · 22 files / 153 tests）· src 零变更（`git diff main --stat -- src/` 空输出）
- [x] `graph.json` 再生成允许含时间戳 diff 行（R1-N4 · 正常产物噪声 · 不算验收缺口）
- [x] `volatile.md` 短注落盘 · `verify` PASS（exit 0）

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| compile 红（yaml 语法/schema） | 不合入 · 修至绿 | 是 | CI 红 |
| 新节点与 src/views 实际页不符 | 30 先 `ls src/views/` 实证再落（禁臆造） | 是 | — |
| graph.json 双写不一致 | 只由 compile 脚本生成 · 不手改 | 是 | CI 红 |
| 误改 l1/l2 | 范围外 · diff 审查拦截 | — | — |

---

## 依赖

| 依赖 | 说明 |
|---|---|
| SPEC | P0 节（§3）· 缺口证据 G1/G2（§1） |
| 工具 | `scripts/graph-compile.sh`（kit 1.10.0）· CI `tech-graph.yml` |
| 现状真值 | `src/views/` 9 页清单（Chat/Graph/Issues/LcEvidence/LgRag/Login/Obs/Overview/Pulls） |

---

## test_strategy

```bash
./scripts/graph-compile.sh
pnpm lint && pnpm test && pnpm build   # 回归（src 零变更）
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l0_stale_sweep.md
```

---

### 自检结论

> 30/40 交付回填（2026-08-31 · 同上下文执行）：

| 闸 | 命令 | 退出码 | 结论 |
|---|---|---|---|
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat · graph.json 双写再生成（33 nodes / 37 edges） |
| lint | `pnpm lint` | 0 | ✅ 无告警 |
| test | `pnpm test` | 0 | ✅ 22 files / 153 tests passed |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l0_stale_sweep.md` | 0 | ✅ VERIFY: PASS |

grep/diff 断言：l0 无 `chat/stream`（grep exit 1）· 7 新页节点+includes 边+lg_rag_page→api_client 齐 · version=2026-08-31 · `git diff main --stat -- src/` 空（src 零变更）· l1/l2/scripts/CI 零越界。
留痕：`docs/harness/invokes/by-task/web-graph-l0-stale-sweep/invoke_20260831_30_*.md` · `invoke_20260831_40_*.md`。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `docs/_tech_graph/README.md` + `LAYER_README.md`（G-L 约定）· `shared/99_mermaid_protocol.md`（如涉）
3. `docs/_tech_graph/l0/00_main.graph.yaml` 现状（L109–111 脱节边）· `src/views/` 页清单
4. `docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P0

> 思考轮：由 SPEC（R0–R5 全轮已回填）承载；本文件不预置 R0–R5（lint W4 合法）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · SPEC HG-SPEC-SIGNOFF 已签（维护者令）· kit 1.10.0 已最新免升级波 · 维护者令「提前签收task」授权 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 |
| 2026-08-31 | **20** R1 pass-with-notes（0 阻塞 / 6 note）→ **00** 即签 HG-AUDIT-R1 · N4 graph.json 时间戳 diff 合规 · N5 l0 description 旧表述入范围 · N6 sse_client 语义注记入范围 · 勘误：N1 闸表 blocks_hats 旧帽名 22-R1（沿用系列口径不改）· N2 SPEC G2 表述过宽（obs_page 已存在 · P0 节点 7 个为 G-L0 层内合法扩面）· N3 modules pages 行未含 Obs（留 P1 补） |
| 2026-08-31 | **00 CLOSE**：CI 绿 + 00 抽查（8/8 · src 零 diff · l0 无 chat/stream）→ PR #31 MERGED → KPI 100 · 归档 done/ |
| 2026-08-31 | **30/40** 交付：l0 边 label → lg-rag/stream · sse_client 语义注记 · description 主线改写 · 7 页节点+includes+invoke 边 · version 刷新；compile/lint/test/build/verify 全 exit 0；验收 8 项全勾；volatile 短注落盘；invoke_30/40 留痕；src 零变更（diff 断言空） |

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

- 图谱脱节清扫先「唯一出现点」grep 定位（本波 chat/stream 全 l0 仅 L111 一处），断言零误伤面。
- compile 产物只由脚本再生成（含双写与时间戳噪声行）；手改产物是返工源头。
- gh pr create 正文含反引号须用 --body-file（30 本波实操踩坑已自愈）。
- Wiki: `docs/coding_wiki/volatile.md`（见 wiki_delta_note）。

---

## CLOSE

| 项 | 值 |
|---|---|
| 日期 | 2026-08-31 |
| web PR | [#31](https://github.com/Cyning12/ops-desk-web/pull/31) MERGED |
| 交付 | l0 边 label → lg-rag 主线 · sse_client 重释注记 · description 改写 · 7 页节点+includes+invoke 边 · version 2026-08-31 · compile 再生产物（33 nodes / 37 edges） |
| 归档 | `docs/tasks/done/task_web_graph_l0_stale_sweep.md` |
| 下一棒 | SPEC §3 **P1**：`10_flow_lg_rag` flow 新建（+ modules pages 行补 Obs · R1-N3） |

---

## 合入策略

- PR：**勿 auto-merge**（close_pr_policy=required）· 纯图谱波无联调闸 · CI（含 tech-graph）绿 + 00 抽查后 00 收口 merge
- CLOSE 后按 SPEC §3 开 P1（`10_flow_lg_rag` 优先）
