# Task：Web · lg_rag 旁路使用页（mock 契约先行）

> **状态**：completed（2026-08-21 CLOSE · 30+40 全绿 · 00 统筹归档）
> **类型**：功能实现（新路由页 + client + store）  
> **关联**：`docs/spec/SPEC-web-lg-rag-page_v1.md`（**signed** · HG-SPEC-SIGNOFF=approved · 00 代签 2026-08-21 · §0 签收注记=实现冻结点）  
> **上游**：`ops-desk-api` task `lg-rag-http`（active · 实施并行中 · freeze `lg-rag-http-v1`）  
> **先例**：`task_web_lc_evidence_page`（completed · mock 契约先行模式照搬）  
> **帽子**：10-task（HG-TASK-DRAFT 已签）· 20 审中 → 30 待 HG-AUDIT-R1 / HG-GRAPH-MODULES

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-page` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：api client mock（`{ok,data}` 拆包 + 三 mode 样例 + refuse 样例）+ store；断言 **不**调用 `/ops/chat/stream`；`pnpm lint` / `pnpm test` / `pnpm build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **code_quality_bar_note** | 本仓无 docs/standards/CODING_*_L2，跟现网 Vue/TS 风格 |
| **orchestration** | 单 task；本波只开 web（mock 契约先行）；api HTTP 另仓 task `lg-rag-http`（active）不阻塞本仓 30 |
| **git_branch** | `task/web-lg-rag-page` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md` |
| **graph_delta_note** | pages 备注加 LG RAG；新增路由（路径维护者定，建议 `/lg-rag`）；不新增一级模块 |
| **wiki_delta** | `docs/_tech_graph/l1/01_modules.md` |
| **wiki_delta_note** | G-L1 模块表增量；真值在 tech_graph |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `recommended` |
| **freeze_id** | `lg-rag-http-v1` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签 2026-08-21（对齐 lc-evidence 先例预签：graph_delta 限 `l1/01_modules.md` pages 备注、不新增一级模块，随 30 落地、40 以 graph-compile 验证） |
| HG-TASK-DRAFT | approved | 22-R1 | 00 代签 2026-08-21（获授权）；路由 `/lg-rag`、侧栏入口「LG RAG」按 SPEC §0 签收注记冻结 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签 2026-08-21 · 依 `docs/harness/reviews/task_web_lg_rag_page_audit_R1_20260821.md`（**pass-with-notes** · 0 阻塞；N1–N3 已修，N4 旧帽名/N5 留痕不挡） |

---

## 背景与目标

后端 lg_rag 旁路（basic / router / supervisor 三 mode）正由 `ops-desk-api` task `lg-rag-http` 挂对外 HTTP（freeze `lg-rag-http-v1`，非流式 v1，SSE 另议）。前端需要调试台式页面：选 mode、发问、观察 `route` / `chain_meta` / `subtasks`，支持同 `thread_id` 续写。

**本波策略（对齐 lc-evidence 先例 · 00 已确认 2026-08-21）**：只开 **web task**；**mock 契约先行**。api HTTP 另仓实施中，**不阻塞**本仓 30。联调冒烟标 optional / `blocked_by api`，非本波硬验收。

**完成态（草案 · 未勾）**：

- [x] 路由 **`/lg-rag`**（SPEC §0 签收注记冻结；需登录，**不要** `meta.public`）；`AppLayout` 侧栏入口「LG RAG」
- [x] `src/api/lgRag.ts`：axios + `withCredentials`；**本文件** timeout ≥ 300000（supervisor 100–250s）；仅本文件拆 `{ok,data}`；类型对齐 freeze（`subtasks` 元素宽松）
- [x] `src/stores/lgRag.ts`：query / mode / thread_id / loading / result / error
- [x] `src/views/LgRagView.vue`（可选 `src/components/lg-rag/*`）按 P0 UI 渲染（mode 三档、等待计时、状态条、chain_meta、subtasks、续写按钮）
- [x] Vitest：client + store（或视图）mock 绿；断言 **不**调用 `/ops/chat/stream`；**禁止** import `useOpsChatSse`
- [x] `pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [x] `docs/_tech_graph/l1/01_modules.md` pages 行备注加 LG RAG；`./scripts/graph-compile.sh` exit 0

---

## 范围

- `src/views/LgRagView.vue`
- `src/api/lgRag.ts`（axios + withCredentials；**本文件 timeout≥300000**；拆 `{ok,data}`；**禁止**改 `src/api/http.ts` 全局 timeout / 外壳约定）
- `src/stores/lgRag.ts`
- 可选 `src/components/lg-rag/*`
- `src/router/index.ts` 增路由 **`/lg-rag`**（SPEC §0 冻结；需登录，不要 `meta.public`）
- `src/layouts/AppLayout.vue` 侧栏入口「LG RAG」（SPEC §0 冻结）
- `tests/`：client + store（或视图）mock；**禁止**本页走 Chat SSE
- `docs/_tech_graph/l1/01_modules.md` pages 行备注加 LG RAG
- 可选：`docs/_tech_graph/l1/10_flow_lg_rag.graph.yaml`（非必须）

### HTTP 契约（freeze `lg-rag-http-v1` · 前端以本表为准 · 详见 SPEC §3.2）

- 方法/路径：`POST /api/ops/lg-rag/invoke`（client 走现网 `baseURL=/api` 时写 `/ops/lg-rag/invoke`）
- 鉴权：与 Chat 相同 session cookie；`withCredentials: true`
- 请求体：`{ query: string(1..8000), mode?: "router"|"basic"|"supervisor"（缺省 router）, thread_id?: string(≤255) }`
- 200 外壳：`{ ok: true, data: { answer, mode, thread_id, route, retry_count, chain_meta, subtasks, subtask_results } }`
- `subtasks` / `subtask_results` 仅 supervisor 非空；`chain_meta` 仅 rag 路径非空；basic 模式 `route=""` 为正常值
- 500：`{ok:false, error:{code:"lg_rag_failed", message:"旁路调用失败"}}`；422 参数非法；401/403 未登录
- **非流式 v1**；SSE 另议

---

## 非范围

- 不改 `ChatView` / `useOpsChatSse` / chat store 默认行为；不接 `/ops/chat/stream`
- 不实现 SSE 流式、thread 历史列表 / 会话管理、supervisor 实时进度（P1+）
- 不改 `ops-desk-api`（HTTP 另仓 task `lg-rag-http`）；本波 **mock 契约先行**，联调冒烟非本波硬验收（可选 / `blocked_by api`）
- 不匿名公开（不要 `meta.public`）
- 不改 `src/api/http.ts` 全局 timeout（30s）或「无 `{ok,data}` 外壳」约定
- 不新增 G-L1 一级模块

---

## 依赖

- SPEC：`docs/spec/SPEC-web-lg-rag-page_v1.md`（**signed** · HG-SPEC-SIGNOFF=approved；§0 签收注记=实现冻结点）
- 契约真值：`ops-desk-api/docs/tasks/active/task_lg_rag_http.md`（freeze `lg-rag-http-v1`）
- 现网对照：`src/router/index.ts`、`src/layouts/AppLayout.vue`、`src/api/http.ts`、`src/api/lcEvidence.ts`（**先例：独立 timeout + 仅本 client 拆包**）、`src/stores/lcEvidence.ts`、`tests/http.spec.ts`
- 图谱真值：`docs/_tech_graph/l1/01_modules.md`
- 跨仓（非本波硬依赖）：api task `lg-rag-http` 合入后联调

---

## 失败路径

对齐 SPEC §5：

| 触发 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 401 / 403 | 走既有 `setUnauthorizedHandler` 跳登录；本页不另写跳转 | Y | 登录页 |
| 网络/超时 | 停止 loading；Alert + 可重试。须本请求 timeout ≥ 300000，避免误用全局 30s | Y | Alert |
| 422（query 空/超 8000、mode 非法、thread_id 超 255） | 本地预检不发或拦截后表单校验 | Y | 表单提示 |
| `route=refuse` / `gate_action=refuse` | **正常 200**，写入 result，**不是** error 态 | Y（换问法） | 状态条强调 + answer 拒答文案 |
| 500 `lg_rag_failed` | 兼容 FastAPI `detail` 与 `{ok:false,error}`；Alert + 可重试 | Y | Alert |
| API 未部署（404 / 502） | 停 loading；错误态 | N（等后端；本波 mock 先行不挡 30） | 「旁路 API 不可用」 |
| 后端进程重启后旧 thread_id 续写 | InMemory 历史丢，按新对话回答（后端不报错） | — | 文案注明「续写进程内有效」 |
| 误接 Chat SSE / import `useOpsChatSse` / 打 `/ops/chat/stream` | **验收打回** | N | PR 拒绝 |

---

## 验收标准

- [x] 路由 `/lg-rag` 可进（SPEC §0 冻结）；侧栏入口「LG RAG」；未登录跳 `/login?redirect=`（复用现网 `beforeEach`，无 `meta.public`）
- [x] Mock 三 mode 提交后 UI 渲染 `answer` + 状态条（mode/route/retry_count/thread_id）；supervisor 样例渲染 `subtasks` / `subtask_results`；rag 路径样例渲染 `chain_meta` 五字段；`refuse` 样例强调「无可用证据」
- [x] `thread_id` 回显可复制；「用此 thread_id 继续」把 id 填回输入框；续写请求带同 thread_id
- [x] **禁止**本页默认走 `POST /api/ops/chat/stream`；client/store 单测断言不调用该路径；源码 **禁止** import `useOpsChatSse`
- [x] `lgRag.ts`：仅本文件拆 `{ok,data}`；本接口 timeout ≥ 300000；**未**改 `http.ts` 全局 timeout/外壳
- [x] P0 UI：mode 三档（router 默认、supervisor 标慢）；query 1..8000 本地校验；等待计时 + supervisor 长等待文案；可 Abort；空态/加载/错误三分态；边界文案（lg_rag 旁路实验 vs Chat 生产）
- [x] Vitest：api client mock（拆包 + 三 mode + refuse）+ store（或视图）绿
- [x] `pnpm lint` · `pnpm test` · `pnpm build` exit 0
- [x] `docs/_tech_graph/l1/01_modules.md` pages 备注含 LG RAG；不新增一级模块；`./scripts/graph-compile.sh` exit 0
- [x] 联调冒烟（router 必跑，supervisor 可选）：**本波豁免**（optional / `blocked_by api`，待 api task `lg-rag-http` 合入）

---

## 给 30 必读

1. 本 task（验收 + failure_paths + 非范围）
2. `docs/spec/SPEC-web-lg-rag-page_v1.md` — 签收注记（若有）是实现冻结点，原样遵守；核心约束：
   - 响应 `{ok,data}` **仅** `lgRag.ts` 拆包；禁止改全局 `http.ts` 约定
   - 本接口 timeout ≥ 300s（supervisor 100–250s）；禁止改全局 30s
   - `refuse`（route / gate_action）按 200 成功写入 result，不当 error；basic `route=""` 为正常值
   - 续写文案注明 InMemory 进程内有效
   - **禁止** import `useOpsChatSse`
3. 现网先例：`src/api/lcEvidence.ts`（独立 timeout + 拆包模式）、`src/api/http.ts`（401 拦截器 / `setUnauthorizedHandler`）、`src/router/index.ts`、`src/layouts/AppLayout.vue`
4. 单测对照：`tests/http.spec.ts`、`tests/chat-store.spec.ts`（本页 **不要** mock `useOpsChatSse`）
5. 图谱：`docs/_tech_graph/l1/01_modules.md`（只改 pages 备注，不新增一级模块）
6. 风格：本仓无 `docs/standards/CODING_*_L2`，跟现网 Vue/TS（Element Plus、Pinia、水墨风）

**30 闸**：`HG-GRAPH-MODULES` / `HG-TASK-DRAFT` / `HG-AUDIT-R1` 均 **approved**（00 代签 2026-08-21；AUDIT 依 20-task-audit R1 `pass-with-notes`）→ **30 可开工**。

---

## 思考轮控制

| 字段 | 值 |
|---|---|
| **thinking_profile** | `shortest` |
| **early_stop** | `yes` |
| **early_stop_reason** | `契约与实现模式完全沿用 lc-evidence 先例（已闭环 KPI 100），增量仅 mode/thread_id/长超时` |
| **actual_last_round** | `R3` |
| **residual_risks** | 后端 HTTP 未合入则仅 mock；`subtasks` 元素结构后端未细化（宽松渲染）；supervisor 长延迟 UX |

### R0 · 问题框定

api 仓 task `lg-rag-http` 已 freeze 契约 `lg-rag-http-v1`（对齐 lc-evidence 先例），实施并行中。10-task 不再论证「要不要单独页」，照搬 `task_web_lc_evidence_page` 已闭环的「web 仓可执行切片 + mock 契约先行」模式，把 mode 选择 / thread_id 续写 / 长超时三个增量写成 30 不可绕过的验收与失败路径。

### R1 · 范围切片

对照现网：`router/index.ts` 无 lg-rag 槽；`AppLayout.vue` 无此菜单；`http.ts` 约定「无 `{ok,data}`、timeout 30s」。范围 = 新 view/client/store（可选 components）+ 两处接线（router / 侧栏，路径与入口名维护者定）+ G-L1 pages 备注。Chat 相关文件全部非范围。图谱 **不**新增一级模块。

### R2 · 相对先例的实现增量

lc-evidence 120s timeout 对本页不够：supervisor 复合 query 100–250s → 本接口 timeout **≥ 300000**，仍落在 `lgRag.ts` 单次请求 config，禁止改全局 30s。`{ok,data}` 拆包同先例仅本 client。新增 thread_id 有状态续写：v1 后端默认 InMemorySaver，重启即丢 → UI 文案预先注明，不把「续写失败」做成错误态。`subtasks` 元素结构 freeze 未细化 → 宽松类型 + JSON 折叠渲染，后端细化后升 freeze。

### R3 · 失败路径可执行化与交接

401/403 复用现网 `setUnauthorizedHandler`；422 本地预检 + 表单；网络/超时停 loading + Alert + 可重试；`refuse` 是 200 成功态；404/502「旁路 API 不可用」；误接 `/ops/chat/stream` → 验收打回。task 落 draft，三闸全 pending 待人审；不附 30 Prompt。残留：后端 HTTP 未合入则仅 mock；supervisor 延迟靠 ≥300s timeout + 等待计时 + Abort。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-21 | 10-task 首稿（**draft**）：mock 先行；三闸 GRAPH/TASK-DRAFT/AUDIT 全 pending 待人审；freeze `lg-rag-http-v1`；照搬 lc-evidence 先例，增量 mode/thread_id/≥300s 超时 |
| 2026-08-21 | CLOSE：三闸 approved（00 代签）· 20 双 R1（SPEC pass / task pass-with-notes，N1–N3 已修）· 30 实现 commit `64db791`（12 files, +925）· 40 四项 exit 0 经 00 独立复验（107/107）· 联调冒烟按豁免留 P1（api `lg-rag-http` 已合入，可随时补冒烟）· 归档 done |