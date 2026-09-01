# Invoke：30-execute · web-graph-l1-flow-lg-rag

> **用途**：30 实现留痕（G-L1 新建 10_flow_lg_rag · lg-rag invoke 页实证链 flow + l2 indexes lg_rag 域同波同步 · 纯图谱波无业务码变更）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG n/a（纯图谱波无联调闸）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-graph-l1-flow-lg-rag` |
| freeze_id | n/a（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| git_branch | `task/web-graph-l1-flow-lg-rag` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_graph_l1_flow_lg_rag_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 6 note · N4 已随签收入范围 · N3/N6 本帽内决见下） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1 旧帽名 · 语义等价 R1-N1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（不新增一级模块 · 01_modules 仅 pages 行补 Obs + 关联节 + 人签） |
| HG-JOINT-DEBUG | n/a | N | 纯图谱波 · CI + grep/yaml 断言为验收 |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅（required{10,00,30,40} ∩ {10,20,00} = {10,00}）。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_lg_rag.md` → **VERIFY: PASS**（exit 0 · 改码前实测）。

## 30 产出（变更清单 · 严格按 00 定夺表）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/_tech_graph/l1/10_flow_lg_rag.graph.yaml` | 新建 | schema inform_graph.v3 · layer G-L1 · depth method · direction TB · version 2026-08-31；实证链 11 节点（user / lg_rag_view / lg_rag_store / invoke_action / abort_action / use_thread_id / elapsed_timer / invoke_api / invoke_path / http_client / ops_api）13 边；description 旁注六项：① refuse=200 成功态（lgRag.ts L141 · store L15 · view L19–23 三处互证）② 非流式 freeze lg-rag-http-v1（L139 · SSE 主线在 10_flow_chat 不重复建模）③ thread_id 续写回填（store L42–44 · L64–65）④ mode 三档 router/basic/supervisor（L13）⑤ 单次超时 300s 落请求 config 不改全局 30s（L6/L152）⑥ 404/502 统一文案 + 取消不写 error + elapsed 秒计时 |
| `docs/_tech_graph/l1/10_flow_lg_rag.md` | compile 生成 | `./scripts/graph-compile.sh` 产物 · 不手改 |
| `docs/_tech_graph/graph.json` · `shared/graph.json` | compile 再生成 | 双写现状维持（3 graphs / 44 nodes / 49 edges · 时间戳 diff 属正常噪声 R1-N5） |
| `docs/_tech_graph/l2/indexes/by_path.yaml` · `by_symbol.yaml` | 改 | 增 lg_rag 域 9 条目 · 与本 flow 全部 implementedBy 一一对应（yaml 解析双向比对机检过）；chat 试点 9 条目原样保留 |
| `docs/_tech_graph/l2/README.md` | 改 | R1-N4：「试点域=chat」失真 → 覆盖域 chat + lg_rag · 补范围/非范围句（其余页/域留 SPEC P2 后续切片） |
| `docs/_tech_graph/l1/01_modules.md` | 改 | pages 行补 Obs（`/obs` 可观测性状态页 · P0 R1-N3 欠账 · src/router/index.ts L32–35 实证）· 关联节加 `10_flow_lg_rag.md` · 人签记录追加本 task 行（HG-GRAPH-MODULES approved · web 00 预签 · 不新增一级模块） |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（flow 建模清单 + 真值指针 SPEC §3 P1/P2） |

## 实证纪律（failure_paths 第 2 行 · 先 grep 再落 · 禁臆造）

- `src/stores/lgRag.ts`：L17 `defineStore('lgRag')` · L46 `invoke()` · L37 `abort()` · L42 `useThreadId()` · L25 `elapsedSeconds` + L59–61 setInterval 秒计时 · L80–91 return 面全暴露。
- `src/api/lgRag.ts`：L143 `invokeLgRag` · L151 `http.post(LG_RAG_INVOKE_PATH,…)` · L9 `LG_RAG_INVOKE_PATH='/ops/lg-rag/invoke'` · L13 `LgRagMode` 三档 · L141 refuse=200 注释 · L139 非流式注释。
- `src/api/http.ts`：L45 `export const http = axios.create({baseURL:'/api',…})`。
- `src/views/LgRagView.vue`：L7 store 实例化 · L70 `store.invoke` · L83 `store.abort` · L87 `store.useThreadId`；组件名 LgRagView 为 `<script setup>` 文件约定（router/index.ts L70 import 实证 · 与 chat 试点 ChatView 同型 —— ChatView 在 ChatView.vue 内亦 0 字面命中，先例同型不判缺符号）。
- 机检断言（python3 yaml + grep · exit 0）：flow implementedBy 9 条 ↔ by_path/by_symbol lg_rag 域一一对应 · 9 符号 src 全树真实存在（非组件符号逐文件 \b 断言）· by_symbol 18 键零撞键 · 01_modules 三断言 · 旁注关键字五断言。

## R1 非阻塞 note 内决（N3/N6 授权 30 内决 · 落决记录）

| # | 决策 | 理由 |
|---|---|---|
| N3 | **同文件多域分段**（不拆分 `*_lg_rag` 文件对）：by_path/by_symbol 各维持单文件，头注改双域来源，`graph_id` 单值升级为 `graph_ids: ["10_flow_chat","10_flow_lg_rag"]` 列表，域间以分段注释分隔 | chat 试点条目零改动（最小 diff · 不动已验证真值）；两域同版号同 layer 单文件内聚；l2 yaml 非 `*.graph.yaml`，graph-compile/CI 不解析（已核 graph_yaml_to_json.py 仅 rglob graph.yaml），格式演进无机检风险；拆分文件对会造成 `by_path.yaml` 名存实亡的命名歧义 |
| N6 | **裸符号键维持**：本波 chat/lg_rag 两域 18 键零撞键（机检断言过）；by_symbol 头注明记「后续域扩展遇泛名撞键（invoke/abort/http）改 `path#symbol` 复合键」 | R1-N6 原文「本波无撞键 · 不改不阻塞」；复合键现在引入会破坏与 chat 试点格式对齐且无实际收益 |

## 非范围遵守

- `src/**` 零变更（`git diff main --stat -- src/` 为空 · exit 0 无输出）；l0 零改动；其余页 flow / 其余域 indexes 未动；双写收敛 / CI 强化（P3）未动；`scripts/` 与 CI 未动；`.codex/` 未跟踪杂物未 add。
- compile 产物不手改；`10_flow_chat.graph.yaml` 零 diff（其 .md 为确定性再生成 · git 无变化）。

## Verify（30 改码后 · 全绿）

| 命令 | 退出码 |
|---|---|
| `./scripts/graph-compile.sh` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |
| `npx dsh-coding-kit verify --target . --task …` | 0（VERIFY: PASS） |

> 40 自检结论见同目录 `invoke_20260831_40_*` 与 task `### 自检结论` 回填表。
