# Invoke：30-execute · web-graph-l0-stale-sweep

> **用途**：30 实现留痕（G-L0 脱节清扫 · l0 边/节点对齐 T2–T6 后现状 · 纯图谱波无业务码变更）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG n/a（纯图谱波无联调闸）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-graph-l0-stale-sweep` |
| freeze_id | n/a（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| git_branch | `task/web-graph-l0-stale-sweep` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_graph_l0_stale_sweep_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 6 note · N4–N6 已随签收入 task 定夺） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（不新增一级模块 · `01_modules.md` 零 diff） |
| HG-JOINT-DEBUG | n/a | N | 纯图谱波 · CI + grep 断言为验收 |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l0_stale_sweep.md` → **VERIFY: PASS**（exit 0）。

## 30 产出（变更清单 · 严格按 00 定夺表）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/_tech_graph/l0/00_main.graph.yaml` | 改 | ① L109–111 边 `sse_client → ops_api` label `POST /api/ops/chat/stream` → `POST /api/ops/lg-rag/stream`（l0 全文 grep `chat/stream` 零命中）② `sse_client` label 改「SSE Client（lg-rag SSE 主线）」（语义重释注记 · R1-N6）③ description「SSE Chat 消费」→「lg-rag SSE 主线消费」（R1-N5）④ 补 7 页节点（`login_page` 登录 / `overview_page` 概览 / `issues_page` Issue / `pulls_page` PR / `graph_page` 图谱 / `lc_evidence_page` LC 证据 / `lg_rag_page` LG RAG · id 蛇形 · kind=flow · label 中文页名）+ `pages` → 各新节点 `includes` 边 ⑤ `lg_rag_page → api_client` 调用边（label `calls（invoke · POST /api/ops/lg-rag/invoke）` · 实证链 LgRagView→stores/lgRag→invokeLgRag→http 已 grep 实证）⑥ version `2026-07-27` → `2026-08-31` |
| `docs/_tech_graph/l0/00_main.md` | compile 再生成 | `./scripts/graph-compile.sh` 产物 · 不手改 |
| `docs/_tech_graph/graph.json` · `shared/graph.json` | compile 再生成 | 双写现状维持（收敛属 SPEC P3 · 本波不动）；33 nodes / 37 edges |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（l0 清扫清单 + 真值指针：本 task 00 定夺表 + SPEC §3 P0） |

## 实证纪律（failure_paths 第 2 行）

- `ls src/views/` 实证 9 页：ChatView / GraphView / IssuesView / LcEvidenceView / LgRagView / LoginView / ObsView / OverviewView / PullsView → 既有 `chat_page`/`obs_page` + 新增 7 一一对应 · 零臆造。
- lg-rag 实证链 grep：`LgRagView.vue` → `stores/lgRag.ts`（`invokeLgRag`）→ `api/lgRag.ts` `LG_RAG_INVOKE_PATH='/ops/lg-rag/invoke'`（baseURL=/api → POST /api/ops/lg-rag/invoke）；SSE 主线 `useLgRagSse.ts` `LG_RAG_STREAM_PATH='/api/ops/lg-rag/stream'`。

## R1 非阻塞 note 落决（N4–N6 已随签收入定夺 · 照做）

| # | 决策 |
|---|---|
| N4 | graph.json 时间戳 diff 属正常产物噪声 · 不算验收缺口（验收第 7 条已列） |
| N5 | description 旧表述「SSE Chat 消费」已改 lg-rag SSE 主线表述 |
| N6 | sse_client 语义重释已落 label 注记「（lg-rag SSE 主线）」 |

## 非范围遵守

- `src/**` 零变更（`git diff main --stat -- src/` 为空 · exit 0 无输出）；未改 l1/l2 任何文件（`01_modules.md` 零 diff · `10_flow_chat` 仅 compile 时间戳级再生成）；未改 `scripts/` / CI；无双写收敛（SPEC P3）；无拓扑重构（只修脱节 + 补缺失节点）。
- compile 产物不手改；chat_page streams 边保留（sse_client 语义即 lg-rag SSE · 定夺表钉死）。
