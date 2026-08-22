# SPEC Audit R1：web-lg-rag-page

> **hat_id**：20-spec-audit  
> **SPEC**：`docs/spec/SPEC-web-lg-rag-page_v1.md`  
> **invoke**：`docs/harness/invokes/by-task/web-lg-rag-page/invoke_20260821_00_web-lg-rag-page.md`（00 签收快照）  
> **日期**：2026-08-21  
> **审查人**：20-spec-audit  
> **git_branch**：`task/web-lg-rag-page`  
> **Open Folder**：`ops-desk-web/`  
> **对照现网**：`src/api/http.ts` · `src/api/lcEvidence.ts` · `src/router/index.ts` · `src/layouts/AppLayout.vue`  
> **跨仓对照**：`ops-desk-api/docs/tasks/done/task_lg_rag_http.md`（freeze `lg-rag-http-v1` 契约真值）

---

## 元信息

| 字段 | 值 |
|---|---|
| spec_slug | `web-lg-rag-page` |
| SPEC 状态 | `signed`（HG-SPEC-SIGNOFF=approved · 00 代签 2026-08-21 · 获维护者授权） |
| track | `frontend` / `rag-debug` |
| test_strategy | `required` |
| 本波范围 | **只开 web task**（mock 契约先行）；api HTTP 另仓 task `lg-rag-http` |
| 本审查动作 | 书面审查落盘；**不**改 SPEC 实质条款；**不**改闸回 pending；**不**签发 HG-AUDIT-R1 |

---

## 核对表

### 范围

| 项 | 结论 |
|---|---|
| 新路由页（§0 冻结 `/lg-rag`）+ AppLayout 侧栏入口「LG RAG」 | 成立；现网 `router/index.ts` 无此槽、`AppLayout.vue` 无此菜单，属增量 |
| 登录后可用（同 cookie 鉴权） | 成立；现网 `beforeEach` 已对非 `public` 路由跳 `/login?redirect=`，新子路由可复用 |
| 同步 `POST /api/ops/lg-rag/invoke`（非流式 v1） | **方案 A 成立**；前端薄客户端，不绑 Chat SSE |
| 展示 `answer` / 状态条（route / retry_count / mode / thread_id）/ `chain_meta` / `subtasks[]` | 目标可验收；字段逐一对齐 freeze `lg-rag-http-v1` |
| `thread_id` 回显 + 续写 | 目标可验收；InMemory 进程内有效的差异点已写入 §3.2 与 §5 |
| client + store（可选 components） | R1 范围闭合 |
| G-L1 图谱一行（`l1/01_modules.md`） | 验收第 8 条已写 |

**方案裁定（须记录）**

- **采用 A**：新页 + 同步 `POST /api/ops/lg-rag/invoke`（对齐 lc-evidence 先例）。
- **否决 B**：前端打 Chat SSE 靠 Flag 切链 —— 违背「单独调用 lg_rag 旁路」，且会污染现网 `useOpsChatSse` / `/ops/chat/stream`。
- **否决 C**：仅前端 mock 当产品路径 —— 可作 Vitest 夹具，不能当联调真值。

### 非范围

| 项 | 结论 |
|---|---|
| 不改 `ChatView` / `useOpsChatSse` 默认行为 | 明确；**禁止**本页打 `/ops/chat/stream`（验收 §4.4 + failure_paths 打回） |
| 不做流式 SSE（v1 非流式；SSE 另议 / 另开 task） | 明确 |
| 不做 thread 历史列表 / 会话管理 UI（v1 仅单 thread 续写输入框） | 明确 |
| 不做 supervisor 子任务实时进度 | 明确（非流式下只有最终结果） |
| 不匿名公开 | 明确 |
| 不改全局 `http.ts` 约定 | §0 冻结：`{ok,data}` 仅 `lgRag.ts` 拆包；timeout ≥300s 落本 client，禁止改全局 30s |

### freeze `lg-rag-http-v1` 契约一致性（§3.2 vs 跨仓真值）

| 维度 | SPEC §3.2 | api task `lg-rag-http`（done） | 审查 |
|---|---|---|---|
| 方法/路径 | `POST /api/ops/lg-rag/invoke` | 同 | 一致 |
| 鉴权 | cookie session | `CurrentUser`（同 lc-evidence） | 一致 |
| 请求体 | `query 1..8000` / `mode 缺省 router` / `thread_id ≤255` | 同；thread_id 超长 **422 显式拒绝**（00 已修正对齐 web SPEC） | 一致 |
| 200 外壳 | `{ok:true,data:{answer,mode,thread_id,route,retry_count,chain_meta,subtasks,subtask_results}}` | 逐字段同 | 一致 |
| `route` 空串 | basic 模式正常值 `""` | 同 | 一致 |
| 500 | `{ok:false,error:{code:"lg_rag_failed",message:"旁路调用失败"}}` | 同 | 一致 |
| checkpointer | v1 默认 InMemory；env 可切 postgres | 同（`LG_RAG_HTTP_CHECKPOINTER=postgres`） | 一致 |
| 非流式 | v1 非流式；SSE 另议 | 同 | 一致 |

**契约表与跨仓 freeze 真值逐字段一致，无漂移。**

### 验收（SPEC §4）

| # | 条款 | 可执行？ |
|---|---|---|
| 1 | 路由可进、需登录；入口位置维护者定（§0 已冻结 `/lg-rag` / 「LG RAG」） | 是 · 对齐现网守卫 |
| 2 | Mock 或真 API：三 mode 渲染 answer + 状态条；supervisor 渲染 subtasks；rag 路径渲染 chain_meta | 是 · **本波 mock 先行**（§0） |
| 3 | thread_id 回显；「继续」续写路径走通 | 是 |
| 4 | **禁止**默认走 `POST /api/ops/chat/stream`；**禁止** import `useOpsChatSse` | 是 · 可 Vitest / PR 打回 |
| 5 | 本 client timeout ≥ 300_000；未改 `http.ts` 全局 30s；`{ok,data}` 仅本 client 拆包 | 是 · §0 冻结；现网 `http.ts` `timeout: 30_000`、无外壳约定，lcEvidence 先例同模式 |
| 6 | Vitest client/store（或组件）mock 绿；lint / test / build | 是 |
| 7 | 联调：后端可用时本机冒烟（router 必跑，supervisor 可选） | 是 · §0 已降为 optional / `blocked_by api`，非本波硬验收 |
| 8 | G-L1 登记页面/api 增量 | 是 |

### failure_paths（§5）

| 触发 | SPEC 行为 | 审查 |
|---|---|---|
| 401 / 403 | 复用 `setUnauthorizedHandler` 跳登录 | 可复用现网拦截器（`http.ts` 已装配） |
| 网络 / 超时（≥300s） | 停 loading · Alert · 可重试 | 须本请求 ≥300s，避免误用全局 30s；supervisor 100–250s 实测依据已写 |
| 422 | 表单校验（尽量本地预检不发请求） | 与 api 侧 422 语义（含 thread_id 超长）对齐 |
| 500 `lg_rag_failed` | 外壳 Alert + 可重试；兼容 FastAPI `detail` | 现网 `normalizeError` 已吃 `detail` |
| 404 / 502 | 「旁路 API 不可用」 | mock 先行时本波不挡 30 |
| `route=refuse` / `gate_action=refuse` | **正常 200**，非 error | 与 freeze 字段语义一致 |
| 后端重启后旧 thread_id 续写 | InMemory 历史丢，按新对话回答；文案预先注明 | 与 lc-evidence 无状态先例的差异点，已显式管理 |
| 误接 Chat SSE / import `useOpsChatSse` | 验收打回 / PR 拒绝 | 与否决方案 B 闭合 |

### 思考轮 R0–R3 闭合

| 轮 | SPEC 要点 | 闭合 |
|---|---|---|
| R0 | 单独调用 lg_rag 旁路的调试页（三 mode、可续写），不混 Chat | 是 |
| R1 | 范围=新页+client+store+契约；非范围=改 Chat / SSE / thread 列表 / 匿名；契约真值在 api 仓 freeze | 是 |
| R2 | 采用方案 A；否决绑 Chat SSE；差异点=InMemory 续写 / supervisor 长延迟 / `route=""` 正常值 | 是 |
| R3 | 鉴权/超时/refuse/API 缺失路径对齐先例；签后 00 审 task 草稿 → 20 审 → 30（mock 先行） | 是 |

| 控制字段 | 值 | 审查 |
|---|---|---|
| actual_last_round | R3 | 与正文四轮一致 |
| early_stop | **yes** | 理由成立：契约直接沿用 lc-evidence 先例 + api task freeze，风险面小；符合 20-spec-audit 轻量路径 |
| residual_risks | 后端 HTTP 未合入则仅 mock；supervisor 长延迟 UX；`subtasks` 元素结构未细化（宽松渲染） | 已记录；见下节 |

**思考轮已闭合，`early_stop=yes` 理由充分。**

---

## 阻塞 / 非阻塞

### 阻塞

**none**

### 非阻塞 / residual

| 项 | 说明 | 本波 |
|---|---|---|
| 上游状态描述滞后 | SPEC 头部写 api task `lg-rag-http`「active · 实施并行中 · `docs/tasks/active/`」；现该 task 已 CLOSE 并归档 `ops-desk-api/docs/tasks/done/task_lg_rag_http.md`，freeze `lg-rag-http-v1` 已经 40 真机验证 | **有利方向的滞后**：联调 `blocked_by` 条件事实已解除；SPEC 保持 optional 表述仍合法，不改 SPEC |
| `subtasks` 元素结构未细化 | freeze 未细化元素结构；v1 前端宽松渲染（JSON 折叠 / 键值列表），后端细化后升 freeze | 已写入 §3.3 注记与 residual_risks |
| supervisor 长延迟 | UX 依赖 ≥300s timeout + 等待计时 + Abort | 已写入 §3.2 / §3.4 / §5 |

---

## 判定

**pass**

依据：范围 / 非范围 / 验收 / failure_paths 可执行且互洽；方案 A 成立、方案 B（Chat SSE）否决；§0 签收注记已冻结路由 `/lg-rag`、侧栏入口「LG RAG」、mock 先行、`{ok,data}` 仅本 client 拆包、≥300s timeout、refuse=正常 200、InMemory 续写文案、禁止 Chat SSE；freeze `lg-rag-http-v1` 契约表与跨仓 api task 真值逐字段一致；R0–R3 闭合且 `early_stop=yes` 理由成立；residual 已标明非本波阻塞。无书面缺口需退回 10-spec。

---

## HG-SPEC-SIGNOFF 建议

| 项 | 值 |
|---|---|
| SPEC 表内现状 | **approved**（00 代签 · 2026-08-21 · 获维护者授权） |
| 本审查建议 | **同意维持 approved** |
| 本审查动作 | **不代签**；**不改回 pending**；不改 SPEC 实质条款 |

---

## 下一棒

1. **00**：审 `docs/tasks/active/task_web_lg_rag_page.md` 草稿（HG-TASK-DRAFT 已签 2026-08-21）。
2. **20-task-audit**：审 web task → 见姊妹审查文 `docs/harness/reviews/task_web_lg_rag_page_audit_R1_20260821.md`。
3. 其后：人签 `HG-AUDIT-R1` → 30（mock 契约先行；联调 optional / `blocked_by api`，该条件事实已解除）。

**禁止**：本审查不附 30 Prompt；不签发 `HG-AUDIT-R1`。
