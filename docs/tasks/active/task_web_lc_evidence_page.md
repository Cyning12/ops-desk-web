# Task：Web · LangChain Evidence 旁路使用页（mock 契约先行）

> **状态**：active  
> **类型**：功能实现（新路由页 + client + store）  
> **关联**：`docs/spec/SPEC-web-lc-evidence-page_v1.md`（signed · HG-SPEC-SIGNOFF=approved · 00 2026-08-16）  
> **审查对照**：`docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md`（20-spec-audit · **pass**）  
> **帽子**：10-task 已起草 · 00 已签 `HG-TASK-DRAFT` 与 `HG-AUDIT-R1` · 20-task-audit R1 零阻塞

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lc-evidence-page` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：api client mock（含 `{ok,data}` 拆包 + snippet）+ store；断言 **不**调用 `/ops/chat/stream`；`pnpm lint` / `pnpm test` / `pnpm build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **code_quality_bar_note** | 本仓无 docs/standards/CODING_*_L2，跟现网 Vue/TS 风格 |
| **orchestration** | 单 task；本波只开 web（mock 契约先行）；api HTTP 另仓另 task，不阻塞本仓 30 |
| **git_branch** | `task/web-lc-evidence-page` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md` |
| **graph_delta_note** | pages 备注加 LC Evidence；新增路由 `/lc-evidence`；不新增一级模块 |
| **wiki_delta** | `docs/_tech_graph/l1/01_modules.md` |
| **wiki_delta_note** | G-L1 模块表增量；真值在 tech_graph |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `recommended` |
| **freeze_id** | `lc-evidence-http-v1` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签 2026-08-16：G-L1 pages/api/pinia 增量，不新增一级模块 |
| HG-TASK-DRAFT | approved | 22-R1 | 00 签 2026-08-16：接受 mock 先行 + 00 冻结点 |
| **HG-AUDIT-R1** | approved | **30** | 00 签 2026-08-16：已读 20 R1 零阻塞；mock 先行开工 |

---

## 背景与目标

后端已交付 LangChain LCEL 旁路（retrieve → grade/decide → answer），与 Chat 的 LangGraph **并行、默认不挂 graph**。  
前端现仅有 Chat SSE；没有独立页去「单独点一下跑 LCEL」。维护者需要调试台式页面：观察 evidence / gate / answer。

**本波策略（00 冻结）**：只开 **web task**；**mock 契约先行**。`ops-desk-api` 的 HTTP 入口另仓另 task，**不阻塞**本仓 30。联调 1 问冒烟标 optional / `blocked_by api`，非本波硬验收。

**完成态（草案 · 未勾）**：

- [x] 路由 `/lc-evidence`（需登录，**不要** `meta.public`）；`AppLayout` 侧栏有入口
- [x] `src/api/lcEvidence.ts`：axios + `withCredentials`；**本文件** timeout ≥ 120000；仅本文件拆 `{ok,data}`；类型与 mock **必须含** `snippet`
- [x] `src/stores/lcEvidence.ts`：query / loading / result / error
- [x] `src/views/LcEvidenceView.vue`（可选 `src/components/lc-evidence/*`）按 P0 UI 渲染
- [x] Vitest：client + store（或视图）mock 绿；断言 **不**调用 `/ops/chat/stream`；**禁止** import `useOpsChatSse`
- [x] `pnpm lint` / `pnpm test` / `pnpm build` exit 0
- [x] `docs/_tech_graph/l1/01_modules.md` pages 行备注加 LC Evidence；`./scripts/graph-compile.sh` exit 0

---

## 范围

- `src/views/LcEvidenceView.vue`
- `src/api/lcEvidence.ts`（axios + withCredentials；**本文件 timeout≥120000**；拆 `{ok,data}`；**禁止**改 `src/api/http.ts` 全局 timeout / 外壳约定）
- `src/stores/lcEvidence.ts`
- 可选 `src/components/lc-evidence/*`
- `src/router/index.ts` 增 `/lc-evidence`（需登录，不要 `meta.public`）
- `src/layouts/AppLayout.vue` 侧栏入口
- `tests/`：client + store（或视图）mock；**禁止**本页走 Chat SSE
- `docs/_tech_graph/l1/01_modules.md` pages 行备注加 LC Evidence
- 可选：`docs/_tech_graph/l1/10_flow_lc_evidence.graph.yaml`（非必须）

### P0 UI（必须）

| 区域 | 行为 |
|---|---|
| 输入 | 多行 query；提交中禁用；可 Abort（若 axios cancel） |
| Meta 条 | 展示 `gate_action` / `best_relevance` / `kept_count`；`refuse` 时强调「无可用证据」 |
| Evidence | 列表卡片；`relevance` 色标；展开 reason / snippet |
| Answer | 纯文本+换行（P0 可不做 Markdown）；`answer_partial` 时若正文未含「仅部分证据」仍以 meta 提示条补显 |
| 空态 | 未请求 / 加载中 / 错误 三分态 |
| 边界文案 | 本页 = LangChain 旁路实验；Chat = 生产 LangGraph |

### HTTP 契约（freeze `lc-evidence-http-v1` · 前端以本表为准）

- 方法/路径：`POST /api/ops/lc-evidence/invoke`（client 走现网 `baseURL=/api` 时写 `/ops/lc-evidence/invoke`）
- 鉴权：与 Chat 相同 session cookie；`withCredentials: true`
- 请求体：`{ "query": "string" }`
- 200 外壳：`{ "ok": true, "data": { query, evidence[], answer, meta } }`
- `evidence[]` 字段子集：`id` / `source_type` / `source_id` / `chunk_index` / `anchor` / `title` / `url` / **`snippet`（必含）** / `grade.evidence_id` / `grade.relevance` / `grade.reason`
- `meta` 字段子集：`hit_count` / `graded` / `grade_count` / `kept_count` / `gate_action` / `best_relevance`

---

## 非范围

- 不改 `ChatView` / `useOpsChatSse` / chat store 默认行为
- 不接 `/ops/chat/stream`；**禁止** import `useOpsChatSse`
- 不实现 SSE 流式、多轮 session、Ingest、金样评测 UI、独立「只检索不答」开关（P1）
- 不改 `ops-desk-api`（HTTP 另仓）；本波 **mock 契约先行**，联调冒烟非本波硬验收（可选 / `blocked_by api`）
- 不匿名公开（不要 `meta.public`）
- 不改 `src/api/http.ts` 全局 timeout（30s）或「无 `{ok,data}` 外壳」约定
- 不新增 G-L1 一级模块

---

## 依赖

- 已签收 SPEC：`docs/spec/SPEC-web-lc-evidence-page_v1.md`（**00 签收注记是实现冻结点**）
- SPEC 审查：`docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md`（判定 pass）
- 现网对照：`src/router/index.ts`、`src/layouts/AppLayout.vue`、`src/api/http.ts`、`src/api/chat.ts`、`tests/chat-store.spec.ts`、`tests/http.spec.ts`
- 图谱真值：`docs/_tech_graph/l1/01_modules.md`
- 跨仓（非本波硬依赖）：`ops-desk-api` 须另开 HTTP task 挂 `POST /api/ops/lc-evidence/invoke`；web 30 用 freeze + mock 自给

---

## 失败路径

对齐 SPEC §5：

| 触发 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 401 | 走既有 `setUnauthorizedHandler` 跳登录；本页不另写跳转 | Y | 登录页 |
| 网络/超时 | 停止 loading；Alert + 可重试。须本请求 timeout ≥ 120000，避免误用全局 30s | Y | Alert |
| 422（query 空/过长） | 不发或拦截后表单校验 | Y | 表单提示 |
| `gate_action=refuse` | **正常 200**，evidence 可能空；写入 result，**不是** error 态 | Y（换问法） | Meta 强调「无可用证据」+ answer 拒答文案 |
| API 未部署（404 / 502） | 停 loading；错误态 | N（等后端；本波 mock 先行不挡 30） | 「旁路 API 不可用」 |
| 500 | 兼容 FastAPI `detail` 与 `{ok:false,error}`；Alert + 可重试 | Y | Alert |
| 误接 Chat SSE / import `useOpsChatSse` / 打 `/ops/chat/stream` | **验收打回** | N | PR 拒绝 |

---

## 验收标准

- [x] 路由 `/lc-evidence` 可进；侧栏有入口；未登录跳 `/login?redirect=`（复用现网 `beforeEach`，无 `meta.public`）
- [x] Mock 提交后 UI 渲染 `evidence` + `answer` + `meta.gate_action`；`refuse` 样例强调「无可用证据」
- [x] **禁止**本页默认走 `POST /api/ops/chat/stream`；client/store 单测断言不调用该路径；源码 **禁止** import `useOpsChatSse`
- [x] `lcEvidence.ts`：仅本文件拆 `{ok,data}`；类型与 mock **必须含** `snippet`；本接口 timeout ≥ 120000；**未**改 `http.ts` 全局 timeout/外壳
- [x] P0 UI：多行 query；提交中禁用；Meta 条三字段；evidence `relevance` 色标；answer 纯文本+换行；空态/加载/错误三分态
- [x] Vitest：api client mock（拆包 + snippet）+ store（或视图）绿
- [x] `pnpm lint` · `pnpm test` · `pnpm build` exit 0
- [x] `docs/_tech_graph/l1/01_modules.md` pages 备注含 LC Evidence；不新增一级模块；`./scripts/graph-compile.sh` exit 0
- [ ] 联调 1 问冒烟：**可选** / `blocked_by api`（后端 `lc-evidence-http-v1` 可用时）；**非本波硬验收**

---

## 给 30 必读

1. 本 task（验收 + failure_paths + 非范围）
2. `docs/spec/SPEC-web-lc-evidence-page_v1.md` — **00 签收注记（2026-08-16）是实现冻结点**，原样遵守：
   - 响应 `{ok,data}` **仅** `lcEvidence.ts` 拆包
   - mock 与类型必须含 `snippet`
   - 本接口 timeout ≥ 120s（≥ 120000 ms）
   - 401 既有跳登录；422 表单；网络/超时 Alert+可重试；500 兼容 `detail` 与 `{ok:false,error}`
   - **禁止** import `useOpsChatSse`
3. `docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md`（方案 A 成立、方案 B Chat SSE 否决）
4. 现网：`src/api/http.ts`（全局 timeout 30s、无 `{ok,data}` 转换、401 拦截器）、`src/router/index.ts`、`src/layouts/AppLayout.vue`
5. 单测对照：`tests/http.spec.ts`、`tests/chat-store.spec.ts`（本页 **不要** mock `useOpsChatSse`）
6. 图谱：`docs/_tech_graph/l1/01_modules.md`（只改 pages 备注，不新增一级模块）
7. 风格：本仓无 `docs/standards/CODING_*_L2`，跟现网 Vue/TS（Element Plus、Pinia、水墨风）

**30 闸**：`HG-GRAPH-MODULES` / `HG-TASK-DRAFT` / `HG-AUDIT-R1` 均为 **approved**（00 2026-08-16）。20-task-audit R1 内容零阻塞。可 30。

---

## 思考轮控制

| 字段 | 值 |
|---|---|
| **thinking_profile** | `shortest` |
| **early_stop** | `no` |
| **early_stop_reason** | `""` |
| **actual_last_round** | `R5` |
| **residual_risks** | 后端 HTTP 未合入则仅 mock |

### R0 · 问题框定

SPEC 已签收且 20-spec-audit **pass**。10-task 不再论证「要不要单独页」，而是把「调试台式 LCEL 旁路」落成 **web 仓可执行切片**：本波只开 web、mock 契约先行，api HTTP 另仓不挡 30。必须把 00 冻结点写成 30 不可绕过的验收与失败路径。

### R1 · 范围切片

对照现网：`router/index.ts` 无 `/lc-evidence` 槽；`AppLayout.vue` 无此菜单；`http.ts` 约定「无 `{ok,data}`、timeout 30s」。范围 = 新 view/client/store（可选 components）+ 两处接线（router / 侧栏）+ G-L1 pages 备注。Chat 相关文件全部非范围。图谱 **不**新增一级模块。

### R2 · 相对现网的实现约束

若 30 复用全局 `http` 且不覆盖 timeout，120s 链会在 30s 被误杀 → timeout **必须**落在 `lcEvidence.ts`（独立实例或单次 `timeout` 覆盖），禁止改全局 30s。  
若 30 改 `http.ts` 拆 `{ok,data}`，会破坏 Issues/Chat 等直取约定 → 外壳拆包 **仅**本 client。  
`snippet` 必须进类型与 mock：后端 `EvidenceItem.snippet` 现为 `@property`，本波 web mock 自给，避免联调时静默丢字段。

### R3 · 失败路径可执行化

401 复用现网 `setUnauthorizedHandler`，本页不另写跳转。422 停在表单。网络/超时停 loading + Alert + 可重试。`gate_action=refuse` 是 **200 成功态**，不是 error。404/502 文案「旁路 API 不可用」；本波 mock 先行，联调非硬验收。误接 `/ops/chat/stream` 或 import `useOpsChatSse` → 验收打回（对齐否决方案 B）。

### R4 · 测试与图谱

Vitest：client mock 必须是 `{ok,data}` 且 evidence 含 `snippet`；store 覆盖 loading / success / refuse / error。断言 client **不**请求 `/ops/chat/stream`。质量门：`pnpm lint` / `pnpm test` / `pnpm build` + `./scripts/graph-compile.sh`。联调 1 问标 optional / `blocked_by api`。

### R5 · 交接与残留

task 起草后 `HG-TASK-DRAFT` 留给 00；`HG-AUDIT-R1` **保持 pending** 等 20-task-audit，10 **不**代签、不附 30 Prompt。残留：后端 HTTP 未合入则仅 mock；CE/LLM 延迟靠 ≥120s timeout + 可选 Abort。`early_stop=no`。

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-08-16 |
| **帽** | 30（含 40） |
| **命令** | `pnpm lint` exit 0；`pnpm test` exit 0（90 passed）；`pnpm build` exit 0；`./scripts/graph-compile.sh` exit 0（时间戳噪声已还原） |
| **交付** | `/lc-evidence` 页 + `lcEvidence` client/store + Vitest mock 契约；图谱 pages 备注；invoke `30_40` |
| **下一棒** | 交还 00；**未** `task close`；联调 1 问仍 optional / `blocked_by api` |
| **经验沉淀** | 旁路 invoke 的 120s timeout 必须落在 `lcEvidence.ts` 单次请求 config，不能改 `http.ts` 全局 30s，否则长链会被误杀。`{ok,data}` 只在本 client 拆包，避免破坏 Issues/Chat 直取约定。`gate_action=refuse` 按 200 成功写入 result，不要当成 error。 Wiki: `docs/_tech_graph/l1/01_modules.md` |
| **KPI** | （留给 00 CLOSE） |

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-16 | 10-task 首稿：mock 先行；三闸 GRAPH=approved / TASK-DRAFT=pending / AUDIT=pending |
| 2026-08-16 | 00 签 HG-TASK-DRAFT 与 HG-AUDIT-R1（20 R1 零阻塞后） |
| 2026-08-16 | 30（含 40）：实现 `/lc-evidence` + mock 契约单测；硬验收勾选；联调保持未勾 |
