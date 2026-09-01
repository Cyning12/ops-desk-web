# Invoke：30-execute · web-graph-l1-flow-pages

> **用途**：30 实现留痕（G-L1 补齐 7 页 flow · l2 indexes 7 域同波同步 · 纯图谱波无业务码变更）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG n/a（纯图谱波无联调闸）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-graph-l1-flow-pages` |
| freeze_id | n/a（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| git_branch | `task/web-graph-l1-flow-pages` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_graph_l1_flow_pages_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 6 note · N1 复合键 / N2 obs fixture 链已随签收入 00 定夺） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（不新增一级模块 · 01_modules 仅关联节 + 人签） |
| HG-JOINT-DEBUG | n/a | N | 纯图谱波 · CI + grep/yaml 断言为验收 |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅（required{10,00,30,40} ∩ {10,20,00} = {10,00}）。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_pages.md` → **VERIFY: PASS**（exit 0 · 改码前实测；改码后复跑同 PASS）。

## 30 产出（变更清单 · 严格按 00 定夺表）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/_tech_graph/l1/10_flow_overview.graph.yaml` | 新建 | 实证链 7 节点 6 边：OverviewView → useOverviewStore.load → fetchOverview → http → GET /api/ops/overview → ops_api；旁注：load 幂等（store L20）· 失败不污染旧 data · dev 库空态正常（MedianMetric/TrendPoint 类型在案 api L12–44）· 401 全局拦截器 |
| `docs/_tech_graph/l1/10_flow_issues.graph.yaml` | 新建 | 12 节点 15 边：筛选草稿→查询才 applyFilters（page=1）· resetFilters · setPage/setPageSize · buildIssueParams 纯函数 → fetchIssues → GET /api/ops/issues；旁注：空值不拼 query（api L39–46）· 后端 updated_at desc 固定排序 |
| `docs/_tech_graph/l1/10_flow_pulls.graph.yaml` | 新建 | 14 节点 16 边：即改即查 setFilter · PULL_STATE_OPTIONS/PULL_CI_STATUS_OPTIONS 选项常量（api L33/L36）· setPage(Size) 同值跳过 · retry → fetchPulls → GET /api/ops/pulls |
| `docs/_tech_graph/l1/10_flow_graph.graph.yaml` | 新建 | 7 节点 6 边：GraphView → useGraphStore.load → fetchGraph → GET /api/ops/graph；旁注：全 null 为正常数据态 · module_matrix 防御性渲染 · store reset() 页内无触发点不入链 |
| `docs/_tech_graph/l1/10_flow_lc_evidence.graph.yaml` | 新建 | 9 节点 10 边（对齐 lg_rag 先例形态）：invoke/abort → invokeLcEvidence → LC_EVIDENCE_INVOKE_PATH → http → POST /api/ops/lc-evidence/invoke；旁注六项：refuse=200 写 result · {ok,data} 信封仅 api 层拆 · 非流式 freeze lc-evidence-http-v1 · 单次超时 120s 不改全局 30s · 404/502 统一文案 · 取消不写 error |
| `docs/_tech_graph/l1/10_flow_obs.graph.yaml` | 新建 | 9 节点 9 边 · **实证链止于 fixture（R1-N2）**：load → Promise.all(loadObsStatusFixture/loadObsTimelineFixture) → dynamic import 4 个本地 JSON；description 旁注「**本地 fixture 驱动 · 无后端调用**」；场景语义联动 ready↔events / blocked↔empty（store L44–49） |
| `docs/_tech_graph/l1/10_flow_login.graph.yaml` | 新建 | 10 节点 10 边：LoginView → useAuthStore.login → api login → POST /api/ops/auth/login；登出链 AppLayout（L13 实证）→ logout → POST /api/ops/auth/logout；旁注：HttpOnly cookie · login 自身 401 豁免全局跳转（http.ts L65–67）· clearSession 清 lg-rag thread-id/active-run · 路由守卫 ensureMe/401 回调联动（router/index.ts L88–114） |
| `docs/_tech_graph/l1/10_flow_*.md` ×7 | compile 生成 | `./scripts/graph-compile.sh` 产物 · 不手改 |
| `docs/_tech_graph/graph.json` · `shared/graph.json` | compile 再生成 | 双写现状维持（10 graphs / 112 nodes / 120 edges · 时间戳 diff 容忍） |
| `docs/_tech_graph/l2/indexes/by_path.yaml` | 改 | 增 7 域分段 57 条目 + http.ts 提「共享」段（9 flow 复用同节点不重复）；graph_ids 升 9 域列表 |
| `docs/_tech_graph/l2/indexes/by_symbol.yaml` | 改 | 增 51 条 `path#symbol` 复合键（R1-N1）；既有 chat/lg_rag 18 裸键不迁移 · 头注注明双形态；http 共享符号单条（30 内决见下） |
| `docs/_tech_graph/l2/README.md` | 改 | 覆盖域更新为全模块 9 域清单 + 双形态说明 |
| `docs/_tech_graph/l1/01_modules.md` | 改 | 关联节补 7 条 flow 链接 · 人签记录追加本 task 行（HG-GRAPH-MODULES approved · web 00 预签 · 不新增一级模块） |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（7 flow 清单 + 真值指针 SPEC §3 P1） |

## 实证纪律（failure_paths 第 2 行 · 先 grep 再落 · 禁臆造）

00 预实证锚点 7/7 复核 **无偏差**（锚点表即 src 实证）。逐域证据：

- **overview**：view L9–10 onMounted load · L129 重试；store L14 defineStore('overview') · L19 load；api L61 fetchOverview · L62 http.get('/ops/overview')。
- **issues**：view L50–51 onMounted · L23 applyFilters · L28 resetFilters · L32/L36 分页 · L100 重试；store L41 defineStore · L50 load · L67/74/81/87 四 action · L21 buildIssueParams；api L38 fetchIssues · L47 http.get。
- **pulls**：view L32–33 onMounted · L47/56 setFilter · L49/58 选项常量 · L112 setPage · L70 retry；store L23 defineStore · L40 load · L59/66/72/80 action · L33 buildParams；api L39 fetchPulls · L33/L36 常量。
- **graph**：view L8–9 onMounted · L87 刷新 · L98 重试；store L15 defineStore · L22 load；api L25 fetchGraph · L26 http.get。
- **lc_evidence**：view L43/52 invoke · L56/86 abort · L21 isRefuse；store L11 defineStore · L23 invoke（L24 先 abort · L34 await）· L19 abort；api L148 invokeLcEvidence · L9 INVOKE_PATH · L6 TIMEOUT_MS · L108 mapError · L87 isCanceledError。
- **obs**：view L9–10 onMounted · L31 setStatusScenario · L56/68 重载；store L17 defineStore · L25 load（Promise.all L30–33）· L44 setStatusScenario；api L55/L65 fixture loader · L58–61/L68–71 dynamic import；fixtures 4 JSON 文件在案（`ls src/fixtures/obs/` 实证）。
- **login**：view L28 login · L30 push；store L15 defineStore · L43 login · L48 logout · L59 clearSession；api L18 login · L19 http.post · L33 logout；AppLayout L13 auth.logout 实证；router/index.ts L88–114 守卫/401 回调（旁注）。
- 机检断言（python3 yaml + 词边界 grep · exit 0 · `/tmp/check_graph_p1b.py`）：7 flow 共 **57 条 implementedBy** 全符号 src 真实存在（组件按 `<script setup>` 文件名约定先例同型 · fixture json 按 default 导出）· by_path/by_symbol 与 flow 一一对应 · 51 新键全复合键零撞键 · 18 既有裸键原样 · 无重复键。

## R1 非阻塞 note 内决（授权 30 内决 · 落决记录）

| # | 决策 | 理由 |
|---|---|---|
| N1 | **7 域新条目全 `path#symbol` 复合键**（51 键）；既有 chat/lg_rag 18 裸键不迁移，by_symbol 头注注明双形态并存 | 撞键必然：load×5（overview/issues/pulls/graph/obs）· invoke/abort 撞 lg_rag 既有裸键 · setPage/setPageSize issues↔pulls 互撞 · login/logout store↔api 互撞；不迁移保已验证真值最小 diff |
| —（追加内决） | **http 共享符号不重复建复合键**：9 个 flow 的 http_client 节点 path/symbol/node_id 全同，既有裸键 `http` 单条即可全域命中；by_path 提「共享」段 | 复合键 `src/api/http.ts#http` 与裸键 `http` 内容全等，重复条目只增维护面与漂移风险；头注已注明 |
| N2 | obs flow 画到 fixture 数据源止（status/timeline 各 2 JSON · dynamic import default 导出建模为 struct 节点），无 http/ops_api 段；description 旁注「本地 fixture 驱动 · 无后端调用」 | 00 定夺已钉 · api/obs.ts 头注 L1–4「本棒仅从 fixture 加载；禁止在浏览器执行 npx」实证 |

## 非范围遵守

- `src/**` 零变更（`git diff main --stat -- src/` exit 0 无输出）；l0 零改动（00_main.md 为确定性再生成 · 仅时间戳噪声容忍内）；`scripts/` 与 CI 未动；双写收敛（P3）未动；api/iOS 仓图谱未动；schema 未动；`.codex/` 未跟踪杂物未 add。
- compile 产物不手改；`10_flow_chat.graph.yaml` / `10_flow_lg_rag.graph.yaml` 零 diff（其 .md 为确定性再生成）。

## Verify（30 改码后 · 全绿）

| 命令 | 退出码 |
|---|---|
| `./scripts/graph-compile.sh` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0 |
| `pnpm build` | 0 |
| `npx dsh-coding-kit verify --target . --task …` | 0（VERIFY: PASS） |
| python3 机检（57 符号实证 · indexes↔flow · 撞键=0） | 0（ALL ASSERTIONS PASS） |

> 40 自检结论见同目录 `invoke_20260831_40_*` 与 task `### 自检结论` 回填表。
