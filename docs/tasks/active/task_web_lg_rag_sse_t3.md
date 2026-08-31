# Task：Web · lg-rag SSE T3 · thread_id 会话连续性（稳定续问 · 刷新恢复）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：session / 前端状态配套（跨仓联调收尾）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现 · **禁止 ops-desk-api Agent 改本仓 Vue/TS**  
> **上游 Spec**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §4.2 · §10.2（T3 已回写实现句）· 本仓 [`SPEC-web-lg-rag-sse-t2_v1.md`](../../spec/SPEC-web-lg-rag-sse-t2_v1.md)（契约不变）  
> **上游 api task**：[`task_lg_rag_session_continuity`](../../../ops-desk-api/docs/tasks/done/task_lg_rag_session_continuity.md) · api PR [#100](https://github.com/Cyning12/ops-desk-api/pull/100) **MERGED**（api-only 先合策略已执行）  
> **前置**：web T2 CLOSE · [`task_web_lg_rag_sse_t2`](../done/task_web_lg_rag_sse_t2.md) · web PR [#23](https://github.com/Cyning12/ops-desk-web/pull/23) MERGED  
> **人工 checklist**：沿用 [`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md)（T3 联调签字区见「合入 / 联调策略」）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-t3` |
| **git_branch** | `task/web-lg-rag-sse-t3` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 20 R1 审 → 30 实现 → 40 自检；api 仓只读契约，**不改 api 码** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest mock SSE 帧序（run.start 带 thread_id）；断言同会话续问 body 带同一 thread_id · 新会话新 id · 404/422 清本地 id；localStorage mock；`pnpm lint/test/build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | `10_flow_chat` 备注：thread_id SoT 持久化 + 刷新恢复策略；不新增一级模块 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：thread_id 前端持久化/恢复策略一句话 + 真值指针（本 task + api 05 §10.2）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**不**新开 freeze · **不**新增 SSE event_type） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者 Prompt 授权「起草 web T3 task · 授权签收所有过程文档」 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（维护者授权代签文档闸）· graph_delta=update 限 `10_flow_chat` 备注 · 不新增一级模块（对齐 T2 先例） |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 代签（维护者授权签收过程文档）· R1 审 [reviews/task_web_lg_rag_sse_t3_audit_R1_20260831.md](../../harness/reviews/task_web_lg_rag_sse_t3_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 5 非阻塞 note（30 内决） |
| **HG-JOINT-DEBUG** | pending | **merge** | T3 联调（同 thread 续问有上下文 · 新 thread 隔离）· **维护者亲签** · 未签前 web PR **勿 auto-merge** |

---

## 背景与目标

api T3（PR #100 已 MERGED）交付 lg-rag session 连续性：`POST /api/ops/lg-rag/stream` 按 `thread_id` 加载历史 + 窗口压缩（默认 `max_full_turns=6` · `group_size=2`）注入图输入；独立表 `ops_lg_rag_threads/turns`；缺 `thread_id` 服务端生成并回写（`run.start` payload + 响应头 `X-Ops-Lg-Rag-Thread-Id`）；跨用户 404 · 非法 422 · 未登录 401。

web T2 时主 Chat 发送 **thread_id 留空**（每问新 uuid，无多轮上下文）。本 task 让主 Chat **发送稳定 thread_id**：同会话续问同一 id（有上下文）· 新会话新 id（隔离）· 刷新/重进按下定策略恢复。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| SoT | **`thread_id`**（lg-rag）；**禁止**当 chat `session_id` 用；`fetchLatestSession` 仅保留 T2 元数据门控，**不**作 lg-rag 会话真值 |
| id 获取 | 客户端 **不自生成**；首轮留空 → api 生成 → 从 **`run.start` payload.`thread_id`** 捕获（响应头 `X-Ops-Lg-Rag-Thread-Id` 为备选校验）；捕获失败仅记 warn，本轮退化为无续写，**不阻断**展示 |
| 持久化 | `localStorage` key `ops.lg-rag.thread-id`；**登出 / 401 清除**；localStorage 不可用则退化为内存态（刷新即新会话，不 crash） |
| 刷新/重进策略 | **恢复**：重进 Chat 沿用已存 thread_id 续问（后端历史连续）；**不做历史消息回显**（api 无 GET history 端点，另 task）；消息列表清空 + 顶部提示条「已恢复上次会话上下文（历史消息不回显）」 |
| 新会话 | 「新会话」按钮 → 清本地 id + 清消息列表 + 清提示；下一轮发送 body 不带 `thread_id`（api 生成新 id） |
| 已存 id 404/422 | 清本地 id + 用户可见提示「会话已失效，请重新发送」；**不自动重发** |
| 合入 | web PR **勿 auto-merge**；HG-JOINT-DEBUG 维护者亲签后方可 merge（api #100 已合，联调对 api master 或本地 uvicorn） |
| freeze | 沿用 `lg-rag-sse-v1`；不新增 `event_type`；不改 SSE 帧序 |
| 模块 | 不新增一级模块；`01_modules.md` 零 diff；仅 `10_flow_chat` 备注 |

---

## 范围

- `src/stores/chat.ts`：thread_id 状态（ref）+ run.start 捕获 + localStorage 持久化/恢复 + 新会话 `startNewSession()` + 404/422 清 id 处理
- `src/composables/useLgRagSse.ts`：原则上 **零 diff**（threadId 入参已存在；run.start 经 onEvent 已可达）；仅当确需暴露响应头时最小扩展
- `src/views/ChatView.vue`：恢复提示条 + 「新会话」按钮 +（可选）session 元数据展示（当前 thread_id 短码）
- `tests/`：chat store spec 扩展（mock SSE 帧序含 run.start thread_id；localStorage mock）
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md）备注更新 + `graph-compile` 绿
- `docs/coding_wiki/volatile.md`：本 task 短注（见 wiki_delta_note）

## 非范围

- **T4** replay UI / seq cursor 消费 / 断线 resume
- **T5** token 打字机（answer delta）
- 再切回 `/ops/chat/stream`；删 `useOpsChatSse` 文件（静态守卫保留）
- **C0–C4** Host 沟通轨
- 改 `ops-desk-api` 任何代码 / 新增 GET 历史 REST（等 api 另 task）
- 改 `/lg-rag` invoke 页（手动 thread_id 调试台保持现状）
- 多 tab 同步 / 多会话列表管理 / 会话重命名
- 历史消息回显（无 api 端点；恢复仅恢复 **后端上下文**）

---

## 验收标准

> 完成态（30 交付时逐项勾选；联调签字项由维护者 HG-JOINT-DEBUG 承载）：

- [ ] 同会话第二次发送 body 带 **同一** `thread_id`（Vitest 断言 `streamLgRag` 入参）
- [ ] `run.start` 捕获 `thread_id` 并写入 localStorage（mock 帧序断言）
- [ ] 刷新/重进：已存 id → 恢复并显示提示条；发送带该 id（Vitest + 手测）
- [ ] 「新会话」：清 id + 清消息 + 清提示；下轮 body 无 `thread_id`
- [ ] 已存 id 遇 404/422：清本地 id + 用户可见提示；**不自动重发**
- [ ] 401：清本地 id + 跳登录（沿用 T2 行为，回归不破）
- [ ] （可选）ChatView 展示当前 thread_id 短码 / session 元数据
- [ ] `useOpsChatSse` 仍禁止 import（`tests/chat-stream-deprecation.spec.ts` 静态守卫绿）
- [ ] `/lg-rag` invoke 页 **零 diff**
- [ ] `pnpm lint` / `pnpm test` / `pnpm build` 绿；`./scripts/graph-compile.sh` 绿
- [ ] `10_flow_chat` 备注更新；`volatile.md` 短注落盘
- [ ] 联调（维护者签）：同 thread 续问有上下文 · 新 thread 隔离 · 超长历史压缩后 SSE 仍 `done`

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| localStorage 不可用/被清 | 退化内存态；刷新即新会话 | 是 | 无（静默降级） |
| `run.start` 缺 `thread_id` | 记 warn；本轮无续写；不阻断 | 下轮自愈 | 无 |
| 已存 id 404（会话失效/他用户） | 清本地 id；不自动重发 | 用户重发 | 「会话已失效，请重新发送」 |
| 已存 id 422（非法/超长，防御） | 同上 | 用户重发 | 校验错误提示 |
| 断网 mid-stream | 沿用 T2：提示失败或等 timeout；**不**假 replay | 是 | 传输错误提示 |
| 未登录 401 | 清本地 id + 跳登录 | 重登后新会话 | 登录过期提示 |
| 多 tab 同 id 并发 | 允许；各自渲染本 tab 流；后写覆盖 localStorage（同值） | — | 无 |
| 历史加载/压缩失败（api 侧） | api 降级继续（`05` §10.2）；web 无额外处理 | — | 可能丢多轮上下文 |

---

## 依赖与联调

| 依赖 | 说明 |
|---|---|
| api T3 | PR [#100](https://github.com/Cyning12/ops-desk-api/pull/100) **MERGED**；联调对 api master 或本地 `uvicorn` + web dev proxy |
| 契约 | `lg-rag-sse-v1` 不变；`run.start` 含 `thread_id`；缺省生成 + `X-Ops-Lg-Rag-Thread-Id` 响应头 |
| 联调用例 | ① 同 thread 续问有上下文（追问指代可解）② 新 thread 隔离（不串历史）③ 超长历史压缩后 SSE 仍 `done` ④ 刷新后恢复 thread 续问 |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t3.md
```

---

### 自检结论

> 30/40 交付时回填：`pnpm lint` / `pnpm test` / `pnpm build` / `graph-compile` / `verify` 退出码与结论表（对齐 T2 40 自检格式）。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `src/stores/chat.ts` · `src/composables/useLgRagSse.ts`（T2 现状：thread_id 留空注释在 `sendMessage`）
3. api `05_lg_rag_transport_and_session_plan_v0.md` §4.2 · §10.2（只读契约）
4. `docs/spec/SPEC-web-lg-rag-sse-t2_v1.md` §3（HTTP/SSE 契约）
5. `tests/chat-stream-deprecation.spec.ts`（静态守卫，保持绿）

> 思考轮：由上游 SPEC（api `05` §10.2 + session ROADMAP）与本 task 00 定夺承载；本文件不预置 R0–R5（lint W4 合法，对齐 api T3 先例）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者 Prompt 授权 web T3 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · api T3 #100 已 MERGED 为背景 |
| 2026-08-31 | **20** R1 pass-with-notes（0 阻塞 / 5 note）→ **00** 代签 HG-AUDIT-R1 · 闸全开可派 30 |

## 合入 / 联调策略

- web PR：**勿 auto-merge**（close_pr_policy=required）
- api 已 api-only 先合（#100 MERGED）；web 本 PR 合入**不阻塞 api**，但合入前须 HG-JOINT-DEBUG 维护者亲签
- 联调通过标准：同 thread 续问有上下文 · 新 thread 隔离 · 刷新恢复续问 · 超长历史压缩后 SSE 仍 `done`（对齐 api `05` §10.2）
