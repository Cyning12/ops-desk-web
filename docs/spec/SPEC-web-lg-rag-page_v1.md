# SPEC：Web · lg_rag 旁路使用页（v1）

> **状态**：`signed`（**HG-SPEC-SIGNOFF=approved** · 00 代签 2026-08-21）  
> **track**：`frontend` / `rag-debug`  
> **上游**：`ops-desk-api` task `lg-rag-http`（`docs/tasks/active/task_lg_rag_http.md` · active · 实施并行中）· 契约 freeze `lg-rag-http-v1`  
> **先例**：`docs/spec/SPEC-web-lc-evidence-page_v1.md`（signed）· `task_web_lc_evidence_page`（completed）  
> **下游**：人签本 SPEC → 00 起 web task（草稿已随附 `docs/tasks/active/task_web_lg_rag_page.md`）→ 20 审 → 30  
> **Open Folder（实现）**：`ops-desk-web/`（页面）；配套 API 在 `ops-desk-api/`  
> **Bounded Context**：本页**单独调用** lg_rag 旁路 HTTP，**不**替换现网 Chat（LangGraph SSE）；**不**改 Chat 默认路径。

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **spec_slug** | `web-lg-rag-page` |
| **invoke_slug** | `web-lg-rag-page` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：API client mock（`{ok,data}` 拆包 + 三 mode 样例）+ store/组件；联调冒烟依赖后端 lg-rag HTTP 路由可用 |
| **Open Folder（实现）** | `ops-desk-web/` |
| **默认分支** | `task/web-lg-rag-page` |
| **graph_change_layer（建议）** | `G-L1`（pages / api / pinia 增量） |
| **跨仓依赖** | `ops-desk-api` 正实施 HTTP 入口（task `lg-rag-http` · active）；页面 30 **blocked_by** API 可用或 mock 契约先行 |

### 人工闸（SPEC 阶段）

| human_gate_id | status | 说明 |
|---|---|---|
| **HG-SPEC-SIGNOFF** | approved | 00 代签 2026-08-21（获维护者授权）· 签收注记见下 |

---

## 0. 00 签收注记（实现冻结点 · 30 原样遵守）

- **HG-SPEC-SIGNOFF = approved**（00 代签 2026-08-21，获维护者授权签收权限）。
- 路由路径定为 **`/lg-rag`**；侧栏入口名定为 **「LG RAG」**（SPEC 正文「由维护者定」处按本注记执行，不再上浮决策）。
- 本波策略确认：**只开 web task · mock 契约先行**；联调冒烟 optional / `blocked_by api`（task `lg-rag-http`），非本波硬验收。
- 其余条款（freeze `lg-rag-http-v1` 契约、≥300s timeout、`{ok,data}` 仅本 client 拆包、refuse=正常 200、InMemory 续写文案、禁止 Chat SSE）原样冻结。

---

## 1. 背景与目标

### 背景

后端 lg_rag 旁路（LangGraph 版 RAG：Phase 1 basic → Phase 2 router 三路分流 → Phase 4 supervisor 多智能体）已分阶段交付，现由 task `lg-rag-http` 挂对外 HTTP（`POST /api/ops/lg-rag/invoke`），契约 freeze `lg-rag-http-v1`。  
前端现仅有 **Chat SSE**（生产 LangGraph）与 **LC Evidence**（LCEL 旁路）；**没有**页面调用 lg_rag 旁路。维护者需要调试台式页面：选择 mode、观察 route / chain_meta / subtasks，便于 RAG 排查、模式对比与演示。

### 目标（可验收）

1. Web 新增路由页（建议 `/lg-rag`，**最终路由与侧栏入口由维护者定**）；**登录后**可用（同 cookie 鉴权）。
2. 用户输入 `query`、选择 `mode`（缺省 `router`）→ 调用 lg_rag HTTP API → 展示：
   - `answer` 全文
   - `route` / `retry_count` / `mode` / `thread_id` 状态条
   - `chain_meta`（走过 rag 路径时非空：`gate_action` / `hit_count` / `kept_count` / `best_relevance` / `grade_count`）
   - `subtasks[]` / `subtask_results[]`（仅 supervisor 模式非空）
3. `thread_id` 回显并支持续写：同一 `thread_id` 再发问可续上下文（见 §3.4）。
4. 明确与 Chat / LC Evidence 的边界文案。
5. 前端类型与 freeze `lg-rag-http-v1` 字段对齐。

### 非目标

- 替换或改写 `ChatView` / `useOpsChatSse` 默认行为；**禁止**本页打 `/ops/chat/stream`
- 流式 SSE（**本契约 = 非流式 v1；SSE 另议 / 另开 task**）
- thread 历史列表 / 会话管理 UI（v1 仅单 thread 续写输入框）
- supervisor 子任务实时进度（非流式下只有最终结果）
- 匿名公开访问

---

## 2. 方案对比（R2）

| 方案 | 描述 | 结论 |
|---|---|---|
| A · 新页 + 同步 `POST /api/ops/lg-rag/invoke` | 前端薄客户端；后端薄包装三 mode 图调用（对齐 lc-evidence 先例） | **采用** |
| B · 前端打 Chat SSE，靠 Flag 切链 | 仍绑 graph/SSE；违背「单独调用 lg_rag 旁路」 | **否决** |
| C · 仅前端 mock、无后端路由 | 无法联调真实语料 | **否决**（可作单测夹具，不能当产品路径） |

**推荐 A**：页面在 web 仓；API 在 api 仓 task `lg-rag-http`（实施并行中）。契约 freeze 见下节；web 30 可 mock 契约先行，不阻塞。

---

## 3. 架构与契约

### 3.1 前端结构（建议）

```text
/lg-rag（需登录；路由与侧栏入口名由维护者定）
  AppLayout 侧栏：「LG RAG」（或「RAG · LangGraph」实验标签）
  src/views/LgRagView.vue
  src/api/lgRag.ts              # axios + credentials；本文件独立 timeout；仅本文件拆 {ok,data}
  src/stores/lgRag.ts           # query / mode / thread_id / loading / result / error
  （可选）src/components/lg-rag/*
```

### 3.2 HTTP 契约（freeze `lg-rag-http-v1`）

> **实现仓**：`ops-desk-api`（task `lg-rag-http`）。Web 30 以本契约为准；后端变更须升 freeze_id。  
> **非流式 v1**；SSE 流式（对齐 Chat 契约）另议 / 另开 task。

**请求**

```http
POST /api/ops/lg-rag/invoke
Cookie: ops_session=…
Content-Type: application/json

{
  "query": "string，1..8000 字",
  "mode": "router | basic | supervisor（可选，缺省 router）",
  "thread_id": "string 可选，≤255 字；缺省由服务端生成"
}
```

**响应 200**

```json
{
  "ok": true,
  "data": {
    "answer": "string（末条 AIMessage）",
    "mode": "router",
    "thread_id": "string（回显，供续写）",
    "route": "rag | direct | refuse | \"\"",
    "retry_count": 0,
    "chain_meta": {
      "gate_action": "",
      "hit_count": 0,
      "kept_count": 0,
      "best_relevance": "",
      "grade_count": 0
    },
    "subtasks": [],
    "subtask_results": []
  }
}
```

字段语义：

| 字段 | 说明 |
|---|---|
| `route` | router 模式三路分流结果（`rag` / `direct` / `refuse`）；basic 模式无 router → 空串 `""`（**正常值，非错误**） |
| `retry_count` | router 模式自纠错（rewrite）回环次数 |
| `chain_meta` | **仅走过 rag 路径时非空**；`gate_action=refuse` 是正常 200 成功态，**不是** error |
| `subtasks` / `subtask_results` | **仅 supervisor 模式非空**（多智能体拆解与子结果） |
| `thread_id` | 回显（请求缺省时为服务端生成）；同 `thread_id` 再发问 = 续写对话 |

**错误**

| HTTP | 含义 | 前端 |
|---|---|---|
| 401 / 403 | 未登录 / 无权限 | 复用既有 `setUnauthorizedHandler` 跳登录，本页不另写跳转 |
| 422 | query 空 / 超 8000 / mode 非法 / thread_id 超 255 | 表单校验提示（尽量本地预检，不发请求） |
| 500 | 图内异常：`{"ok": false, "error": {"code": "lg_rag_failed", "message": "旁路调用失败"}}` | 外壳 toast / Alert + 可重试；兼容 FastAPI `detail` |
| 404 / 502 | API 未部署 | 「旁路 API 不可用」错误态 |

**鉴权**：与 Chat / LC Evidence 相同 session cookie；复用现网 `http.ts`（`baseURL=/api` · `withCredentials: true`）。  
**超时**：supervisor 模式复合 query 实测可能 **100–250s**，本接口 client timeout **建议 ≥ 300_000 ms**（router/basic 同实例沿用即可，不必分级）；**禁止**改 `http.ts` 全局 30s。建议同时提供 Abort（axios signal）与「已等待 N 秒」进度提示（见 §3.4）。  
**续写有状态注意（与 lc-evidence 无状态先例的差异点）**：后端 v1 默认 `InMemorySaver`——**进程重启后同 thread_id 历史即丢**，前端不得假设跨重启续写；postgres checkpointer 需后端 env `LG_RAG_HTTP_CHECKPOINTER=postgres` 开启（生产默认不开）。UI 文案应注明「续写仅在服务进程内有效」。

### 3.3 TypeScript 类型（建议 · `src/api/lgRag.ts`）

```ts
export type LgRagMode = 'router' | 'basic' | 'supervisor'
export type LgRagRoute = 'rag' | 'direct' | 'refuse' | ''

export interface LgRagChainMeta {
  gate_action: string
  hit_count: number
  kept_count: number
  best_relevance: string
  grade_count: number
}

export interface LgRagSubtaskResult {
  // supervisor 子任务结果；字段以后端 freeze 为准，v1 可先宽松为 Record<string, unknown>
  [key: string]: unknown
}

export interface LgRagResult {
  answer: string
  mode: LgRagMode
  thread_id: string
  route: LgRagRoute
  retry_count: number
  chain_meta: LgRagChainMeta
  subtasks: unknown[]
  subtask_results: LgRagSubtaskResult[]
}

export interface LgRagInvokeRequest {
  query: string
  mode?: LgRagMode
  thread_id?: string
}
```

> `subtasks` / `subtask_results` 的元素结构后端 freeze 未细化（示例为 `[...]`），v1 前端先按宽松类型渲染（JSON 折叠块 / 键值列表），后端细化后升 freeze。

### 3.4 UI 行为（P0）

| 区域 | 行为 |
|---|---|
| mode 选择 | segmented / radio 三档：`router（默认·推荐）` / `basic` / `supervisor`；supervisor 档标注「多智能体拆解·慢（可能 2–4 分钟）」；提交中禁改 |
| 输入 | 多行 query（1..8000 字，本地字数校验）；可选 thread_id 输入框（留空=新会话）；提交中禁用；可 Abort |
| 等待态 | loading + 已等待秒数计时；supervisor 模式追加文案「多智能体拆解中，复合问题可能需要 2–4 分钟」；长超时（≥300s） |
| 状态条 | `mode` / `route` / `retry_count` / `thread_id`（可复制，用于续写）；`route=refuse` 或 `chain_meta.gate_action=refuse` 强调「无可用证据」（**正常 200 态**） |
| chain_meta 条 | 走过 rag 路径（`chain_meta` 非空）时展示 `gate_action` / `hit_count` / `kept_count` / `best_relevance` / `grade_count` |
| subtasks | 仅 supervisor：子任务列表 + 子结果折叠块 |
| Answer | 纯文本+换行（P0 可不做 Markdown） |
| 续写 | 「用此 thread_id 继续」按钮：把响应 `thread_id` 填回输入框；文案注明进程重启失效 |
| 空态 | 未请求 / 加载中 / 错误 三分态 |
| 边界文案 | 本页 = lg_rag 旁路实验（LangGraph）；Chat = 生产 LangGraph；LC Evidence = LCEL 旁路 |

### 3.5 curl 示例

```bash
# 登录拿 cookie（同既有登录态）
curl -c /tmp/ops_cookie.txt -X POST http://127.0.0.1:8000/api/ops/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "<user>", "password": "<pass>"}'

# router（默认 mode，可省略）
curl -b /tmp/ops_cookie.txt -X POST http://127.0.0.1:8000/api/ops/lg-rag/invoke \
  -H 'Content-Type: application/json' \
  -d '{"query": "检索并总结最近的部署失败原因", "mode": "router"}'

# basic（单次 RAG，无 router 分流 → route=""）
curl -b /tmp/ops_cookie.txt -X POST http://127.0.0.1:8000/api/ops/lg-rag/invoke \
  -H 'Content-Type: application/json' \
  -d '{"query": "什么是 evidence gate", "mode": "basic"}'

# supervisor（多智能体拆解复合问题；耗时长）
curl -b /tmp/ops_cookie.txt --max-time 300 -X POST http://127.0.0.1:8000/api/ops/lg-rag/invoke \
  -H 'Content-Type: application/json' \
  -d '{"query": "对比 A、B 两个服务的错误率并给出修复建议", "mode": "supervisor"}'

# 同 thread_id 续写
curl -b /tmp/ops_cookie.txt -X POST http://127.0.0.1:8000/api/ops/lg-rag/invoke \
  -H 'Content-Type: application/json' \
  -d '{"query": "那第二条建议的具体步骤呢", "thread_id": "<上一步响应的 thread_id>"}'

# 失败外壳（图内异常）
# HTTP 500 {"ok": false, "error": {"code": "lg_rag_failed", "message": "旁路调用失败"}}
```

---

## 4. 验收标准（SPEC 级）

1. 路由可进、需登录（未登录跳登录）；入口位置维护者定。
2. Mock 或真 API：三 mode 提交后 UI 正确渲染 `answer` + 状态条；supervisor 样例渲染 `subtasks` / `subtask_results`；rag 路径样例渲染 `chain_meta`。
3. `thread_id` 回显；「继续」续写路径走通（同 thread_id 再请求）。
4. **禁止**本页默认走 `POST /api/ops/chat/stream`；**禁止** import `useOpsChatSse`。
5. 本接口 client timeout ≥ 300_000；**未**改 `http.ts` 全局 30s；`{ok,data}` **仅**本 client 拆包。
6. Vitest：client/store（或组件）在 mock 响应下绿；`pnpm lint` / `pnpm test` / `pnpm build` 相关范围绿。
7. 联调：后端 `lg-rag-http-v1` 可用时本机冒烟（router 必跑，supervisor 可选）。
8. G-L1：`docs/_tech_graph/l1/01_modules.md`（web）登记页面/api 增量说明。

---

## 5. failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 401 / 403 | 复用既有 `setUnauthorizedHandler` 跳登录 | Y | 登录页 |
| 网络 / 超时（≥300s） | 停止 loading；Alert + 可重试 | Y | Alert |
| 422（本地预检未拦住） | 表单校验提示 | Y | 表单提示 |
| 500 `lg_rag_failed` | 外壳 Alert + 可重试；兼容 FastAPI `detail` | Y | Alert |
| API 未部署（404 / 502） | 停 loading；错误态 | N（等后端；mock 先行不挡 30） | 「旁路 API 不可用」 |
| `route=refuse` / `gate_action=refuse` | **正常 200**，写入 result，**不是** error | Y（换问法） | 状态条强调 + answer 拒答文案 |
| 后端进程重启后旧 thread_id 续写 | InMemory 历史丢 → 按新对话回答（后端不报错） | — | 文案预先注明「续写进程内有效」 |
| 误接 Chat SSE / import `useOpsChatSse` | 验收打回 | N | PR 拒绝 |

---

## 思考轮

### 思考轮控制

| 字段 | 值 |
|---|---|
| **actual_last_round** | R3 |
| **early_stop** | yes（契约直接沿用 lc-evidence 先例 + api task freeze，风险面小） |
| **residual_risks** | 后端 HTTP 未合入则前端只能 mock；supervisor 长延迟影响 UX（靠 ≥300s timeout + 进度提示缓解）；`subtasks` 元素结构后端未细化，前端先宽松渲染 |

### R0
要一个**单独调用 lg_rag 旁路**的前端使用页（三 mode 可选、可续写），不混在 Chat。

### R1
范围=新页+client+store+契约；非范围=改 Chat、SSE 流式、thread 列表管理、匿名。契约真值在 api 仓 task `lg-rag-http`（freeze `lg-rag-http-v1`）。

### R2
采用「新页 + 同步 invoke API」（对齐 lc-evidence 先例）；否决绑 Chat SSE。差异点：有状态 thread_id（v1 默认 InMemory，重启即丢）、supervisor 长延迟（timeout ≥300s）、`route` 空串为 basic 正常值。

### R3
鉴权/超时/refuse/API 缺失路径对齐先例；SPEC 落 draft 待人签；签后 00 审 task 草稿（已随附）→ 20 审 → 30（可 mock 先行）。

---

## 下一棒

1. 维护者 / 00 签收本 SPEC（HG-SPEC-SIGNOFF）
2. 00：审 `docs/tasks/active/task_web_lg_rag_page.md` 草稿（签 HG-TASK-DRAFT）→ 20 审 → 签 HG-AUDIT-R1 / HG-GRAPH-MODULES → 30（mock 契约先行，联调 `blocked_by api`）
3. 跨仓：`ops-desk-api` task `lg-rag-http` 合入后跑联调冒烟

---

## 修订

| 日期 | 说明 |
|---|---|
| 2026-08-21 | 首稿（draft）：lg_rag 旁路使用页 + freeze `lg-rag-http-v1` 契约；沿用 lc-evidence 先例；标注 InMemory 续写差异与 supervisor 长超时 |
