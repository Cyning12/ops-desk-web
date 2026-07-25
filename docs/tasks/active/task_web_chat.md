# Task：Chat 页 + SSE 流式（Epic W7 · web-chat）

> **状态**：completed  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W7 · `../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md`

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-chat` |
| **test_strategy** | `required` |
| **test_strategy_note** | SSE 帧解析单测（伪造 ReadableStream：thinking/answer/done/error 序列）+ store 单测；联调冒烟视 LLM 可用性而定 |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 并行子任务（W3–W7 同发，各自 worktree 分支） |
| **git_branch** | `task/web-chat` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：pages/pinia/api + composables（既有 `src/composables/` 约定，AGENTS.md 已列 useOpsChatSse.ts），无新增一级模块 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：SSE 用原生 fetch + ReadableStream（Epic 拍板）；cookie 鉴权 fetch 需 `credentials: 'include'`；事件以实际帧格式为准 |

---

## 背景与目标

Chat 页：latest session 获取/创建、SSE 流式渲染、输入与状态管理。

**契约**（`api-auth-chat.md` §3/§4 + sse-chat-design 文档）：

- `GET /api/ops/chat/sessions/latest` → `{id, user_id, title, created_at, updated_at}`（无则自动创建，不会 404）
- `POST /api/ops/chat/stream`：body `{message, session_id, model: null}` → `text/event-stream`
- SSE 帧：`\n\n` 分割，去 `data: ` 前缀后 JSON 解析；事件按序：
  - `run.start`（system，{run_id}）
  - `thinking`（intent/context，思考文本）
  - `answer`（answer，回答文本片段，增量追加）
  - `done`（system，{latency_ms, model}）
  - `error`（system，{stage, message, retryable}）
- fetch 必须 `credentials: 'include'`（cookie 鉴权）

**完成态**：

- [x] `src/composables/useOpsChatSse.ts`：fetch + ReadableStream 读取、`\n\n` 分帧、JSON 解析、事件回调、AbortController 中断、401/网络错误回调
- [x] `src/api/chat.ts`：`fetchLatestSession()`（基于 axios 实例）
- [x] `src/stores/chat.ts`：session、消息列表（user/assistant/thinking 分块）、streaming 状态、error 状态
- [x] `src/views/ChatView.vue`（替换占位）：
  - 进入页面获取 latest session
  - 消息列表渲染：用户气泡 / assistant 回答 / thinking 折叠块（el-collapse 或 details 样式）
  - 输入框 + 发送（streaming 中禁用或提供停止按钮 → abort）
  - error 事件可见（el-alert，含 retryable 提示）
  - done 后显示 latency_ms/model（轻量 footer 文案）
- [x] 单测：SSE 解析器（伪造 stream 多帧/跨 chunk 半帧/坏 JSON 行容错）+ store 事件流状态迁移；pnpm 三件套全绿
- [x] 联调冒烟：`GET /api/ops/chat/sessions/latest` 200；`POST /api/ops/chat/stream` 视后端 LLM 配置可用性而定——若后端 error 事件返回，前端正确渲染错误态也算通过（记录证据）

**不做**：多 session 列表/切换；历史消息加载（后端 v1 未提供）；markdown 渲染（纯文本 + 换行即可，留后续）。

## 范围

- `src/composables/useOpsChatSse.ts`、`src/api/chat.ts`、`src/stores/chat.ts`、`src/views/ChatView.vue`、`tests/chat*.spec.ts`
- **禁止**改 `docs/_tech_graph/`、`docs/tasks/`、`docs/harness/`、`pnpm-lock.yaml`、`src/styles/index.css`

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| SSE error 事件 | 停止 streaming，渲染 error | el-alert（stage/message/retryable） |
| 网络中断/abort | 停止 streaming | 中断提示，可重发 |
| 401 | 全局拦截跳登录 | 登录页 |
| 半帧/坏 JSON | 跳过该行不崩溃 | 无感 |

## 验收标准

- [x] pnpm 三件套 exit 0
- [x] SSE 解析单测覆盖：完整帧序列、跨 chunk 半帧、坏行容错、error 事件、abort
- [x] latest session 获取并展示 session title/id
- [x] 流式事件按序渲染（单测模拟 + 联调记录）

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `/Users/cyning/Desktop/Ops-desk/ops-desk-api/docs/ios/api-auth-chat.md` §3/§4 4. `../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md` 5. `src/api/http.ts`、`src/stores/auth.ts`

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；SSE 契约附入 |
| 2026-07-25 | 30 并行子 agent 执行 + 00 集成复检全绿；invoke 落盘；合并 master |
