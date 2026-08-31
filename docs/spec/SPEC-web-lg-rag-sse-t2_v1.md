# SPEC：Web · lg-rag SSE T2（主 Chat 切流 · 废弃 chat stream）

> **状态**：`draft`（待 00 签收 · HG-SPEC-SIGNOFF）  
> **freeze_id**：`lg-rag-sse-v1`（对齐 api `05_lg_rag_transport_and_session_plan_v0.md` §4.2）  
> **上游 api**：`POST /api/ops/lg-rag/stream` · 分支 `task/lg-rag-sse-stream-updates` 或合入后 master  
> **关联 task**：[`task_web_lg_rag_sse_t2_joint`](../tasks/active/task_web_lg_rag_sse_t2_joint.md)  
> **联调真值**：api `05` §10–§11 · [`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md)

---

## 0. 签收注记（00 冻结 · 待签）

| 项 | 冻结值 |
|---|---|
| 主 Chat 传输 | **`POST /api/ops/lg-rag/stream`**（SSE）；**不再**调用 `/api/ops/chat/stream` |
| Composable | 新建 `useLgRagSse`（或 `src/composables/useLgRagSse.ts`）；**主 UI 禁止** import `useOpsChatSse` |
| `/lg-rag` invoke 页 | **不动**（仍非流式 invoke；调试台） |
| 默认 mode | `supervisor`（与 api T2 默认一致） |
| 鉴权 | `fetch`/`EventSource` 等价：`credentials: 'include'` |
| Client timeout | ≥ **300000** ms（对齐 lgRag invoke 页 supervisor 耗时） |
| PR / 发版 | 开 PR · **勿 auto-merge** · checklist 全勾后与 api **同日发版 |

---

## 1. 背景

api T2 已交付 `lg-rag-sse-v1` SSE（节点 updates + 整段 `answer`）。产品主线弃用 chat stream；web 本波将 **ChatView 切到 lg-rag SSE**，为后续 T3 session / T5 token 流铺路。

---

## 2. 非目标（本 SPEC 波）

- 不断线 replay（T4）· token 打字机（T5）· api 删 chat 路由（T6）  
- 不改 `/lg-rag` invoke 页为 SSE  
- 不在 **ops-desk-api** 仓改码（契约只读 api Spec）

---

## 3. HTTP / SSE 契约（前端以本表 + api §4.2 为准）

### 3.1 请求

- **方法/路径**：`POST /api/ops/lg-rag/stream`（dev proxy 下 `/ops/lg-rag/stream`）  
- **Headers**：`Content-Type: application/json` · `Accept: text/event-stream`  
- **Body**：`{ query: string(1..8000), mode?: "router"|"basic"|"supervisor", thread_id?: string(≤255) }`  
- **缺省**：`mode=supervisor`

### 3.2 SSE 帧（T2 · updates）

每事件一行 `event:` + 一行 `data:`（JSON）。`data` 建议解析为：

| 字段 | 说明 |
|---|---|
| `run_id` | 本次 run |
| `seq` | 单调递增（T2 用于日志；T4 再用于 replay UI） |
| `ts_ms` | 时间戳 |
| `agent_role` | 见 api §4.2 表 |
| `event_type` | `run.start` · `node.progress` · `subtask.progress` · `answer` · `done` · `error` |
| `payload` | 事件体（节点摘要 / 终答文本 / 错误信息） |

**期望顺序**：`run.start` →（≥1 进度帧）→ `answer` → `done`；异常 → `error`（可无 `done`）。

### 3.3 与 chat SSE 差异（必读）

| chat | lg-rag T2 |
|---|---|
| `thinking` / 多段 reasoning | **`node.progress` / `subtask.progress`** |
| token delta `answer` | T2 **整段** `answer`；T5 再 delta |
| chat 专用 payload | **不**假设兼容；按 §4.2 映射 |

### 3.4 HTTP 错误

| 状态 | 处理 |
|---|---|
| 401/403 | 跳转登录 / 提示未登录 |
| 422 | 表单校验（query 长度等） |
| 500 | 展示 `error` 帧或 HTTP 错误文案 |

---

## 4. UI / 状态（P0）

- Chat 输入区：发送后走 `/stream`；loading 至 `done`/`error`  
- 进度区：展示最近 `node.progress` / `subtask.progress` 摘要（可折叠）  
- 终答区：`answer` payload 填入 assistant 消息  
- **废弃**：主 Chat 不再订阅 chat stream 事件类型

---

## 5. 测试（Vitest）

- mock SSE 流：断言帧序与 store 更新  
- 断言 **Chat 路径不**调用 `/ops/chat/stream`  
- `pnpm lint` · `pnpm test` · `pnpm build` exit 0

---

## 6. 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | 初版：T2 主 Chat 切 lg-rag SSE · 废弃 chat stream 主路径 |
