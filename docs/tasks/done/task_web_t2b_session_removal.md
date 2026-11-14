# Task：web · 摘除旧 chat session 门控（P0' T2b-W1 · issue #23）

> **状态**：`done`（2026-11-14 CLOSE · PR #103 合入 a7c8b42 · 验收 6 条全绿 · Vitest 358 passed/1 skipped）  
> **类型**：refactor / 前端轨  
> **统筹**：web 00；**禁止**改姐妹仓任何文件  
> **分支**：`task/web-t2b-session-removal`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-t2b-session-removal` |
| **git_branch** | `task/web-t2b-session-removal` |
| **implement_repo** | `ops-desk-web` |
| **task_kind** | `refactor` |
| wave | P0'-T2b-W1（紧随 api P0' 收官衍生卡 T2b · issue #23 R4 裁定 A3） |
| **orchestration** | P0' 收官衍生卡 T2b（拆分 W1 web 摘除 session 门控 → W2 api 410 化+drop 三表；本卡=W1） |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 全量 **356 passed/1 skipped（357）** 在案；动 stores/chat 门控须零回归。eslint + vue-tsc 双绿 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（无新页面/路由；ChatView 头部 session 标题块与错误条移除、composer 门控改 thread 语义） |
| **graph_delta** | `n/a` |
| **wiki_delta** | `n/a` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表） |
| **related_pr** | `#103`（MERGED 2026-11-14 · a7c8b42） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-11-14 维护者 m01326「继续」· goal-24fc4112 消化 T2b 衍生卡 |
| HG-WAVE-IMPL | **approved** | 30 | 同上，T2b-W1 范围=R4 裁定 A3 既定拆分 |

## 背景与目标

api P0' 收官衍生卡 T2b（`docs/tasks/draft_task_p0prime_t2b_chat_concept_cleanup.md` @ ops-desk-api）裁定拆两波：**W1（本卡 · web）**摘除旧 chat session 门控；**W2（api 另卡）** `/chat/models` + `/chat/sessions/latest` 410 化 + 归档导出 + alembic drop `ops_runs`/`ops_run_events`/`ops_sessions_chat`。

**现状**：`stores/chat.ts` 的 `session` 仅作 T2 门控（sendMessage/continueReply 发送闸 + ChatView 头部标题/错误条/composer disabled）；lg-rag 会话 SoT 自 T3 起已是 `thread_id`（localStorage `ops.lg-rag.thread-id`），`session` 不参与任何 lg-rag 数据链。iOS 无活跃消费（仅图谱 TODO 引用）。`src/api/chat.ts` 唯一导出 `fetchLatestSession` → `GET /ops/chat/sessions/latest`。

**目标**：session 门控整体摘除——SoT 单一化到 thread_id；`api/chat.ts` 删除；W2 的 410 化因此不再影响任何活跃客户端。

## 范围

- `src/stores/chat.ts`：删 session/sessionLoading/sessionError refs、`loadLatestSession`、`api/chat` import、两处发送门控 `!session.value`、相关 export 与注释
- `src/views/ChatView.vue`：删 onMounted `loadLatestSession()`、头部 session 标题/加载块、sessionError 错误条、composer 两处 `!chat.session` disabled 门控
- `src/api/chat.ts`：整文件删除
- `tests/chat-store.spec.ts` / `chat-store-hitl.spec.ts` / `chat-live-reactivity.spec.ts` / `chat-view.spec.ts`：移除 `api/chat` mock/fakeSession/loadLatestSession 调用与「无 session 忽略发送」用例

## 非范围

- api 侧 410 化与 drop 三表（W2 另卡，前置=本卡合并发布）
- thread_id/active-run 续看机制任何改动
- 历史（chatHistory）与 HITL 链路改动

## 失败路径

| 失败模式 | 处置 |
|---|---|
| 门控摘除后空 session 状态下发送异常 | 门控本就只剩 `!content`/`streaming` 语义，thread_id 缺失时 api 侧生成（T3 既定行为），不构成新风险 |
| 视图残留 `chat.session` 引用 | vue-tsc 编译闸拦截（本次实证：composer 两处漏改被 tsc+测试双拦截） |
| 测试假绿（mock 残留遮蔽） | eslint + tsc 双跑；vitest 全量非目标单跑 |

## 验收标准

- [x] `src/api/chat.ts` 删除，全仓 `sessions/latest`/`chat/models` 源码零引用（仅历史文档/图谱）
- [x] stores/chat.ts 零 session 状态与 `loadLatestSession`；发送门控=`content`+`streaming`
- [x] ChatView composer disabled 不再依赖 session；头部 session 块移除，thread 提示保留
- [x] Vitest 全量绿（356 passed/1 skipped）
- [x] eslint + vue-tsc 双绿
- [x] freeze lg-rag-sse-v1 零 diff（event 表不触碰）

## 必读列表

- ops-desk-api `docs/tasks/draft_task_p0prime_t2b_chat_concept_cleanup.md`（T2b 母卡）
- ops-desk-api `docs/tasks/done/task_p0prime_t2_chat_legacy_cleanup.md:53`（T2a 拆分裁定原文）
- ops-desk-workspace `docs/01-scope/03-general-agent/06-kickoff-readiness.md`（A3 下线顺序裁定）

## 思考轮控制

| 轮 | 结论 | early_stop | reason |
|---|---|---|---|
| R0 | 问题框定：session 是 T2 遗留门控，SoT 已切换 thread_id——纯摘除无功能替代需求 | no | — |
| R1 | 消费面盘点：store refs/gates + ChatView 4 处 + 4 测试文件 34 引用 + composer 2 处 disabled | no | — |
| R2 | 风险：视图隐藏绑定（composer disabled）易漏——tsc/测试双闸兜底验证 | no | — |
| R3 | 验收映射：6 条验收逐项可对 | no | — |
| R4 | 交叉复核：iOS 无活跃消费 · freeze 零 diff · 无未决冲突 | no | — |
| R5 | 收敛定稿：30 交付，无新增信息 | yes | 五轮覆盖问题/消费面/风险/验收/交叉面，继续空转 |

### R0 问题框定

session 自 T3 thread_id 成为 SoT 后退化为纯门控；摘除是单向简化，无行为替代设计。

### R1 消费面盘点

grep 闭包：`fetchLatestSession` 唯一生产消费点 stores/chat.ts:552；视图消费 ChatView.vue 4 处；测试 4 文件 34 引用；iOS 无活跃引用。

### R2 风险

模板内 `chat.session` 绑定不经 store export 类型检查路径仍可被 vue-tsc 拦截——实证拦截 composer 两处。

### R3 验收映射

六条验收与 diff 一一对应；测试改编最小化（仅删 mock 与门控相关断言，不删 HITL/历史断言）。

### R4 交叉复核

iOS 仅图谱 TODO 引用无活跃消费；freeze lg-rag-sse-v1 零 diff；无未决冲突。

### R5 收敛定稿

问题/消费面/风险/验收/交叉面五轮覆盖完整，30 交付。

### 自检结论

六条验收全过（api/chat.ts 删除零引用 · 门控单一化 · composer 无 session 依赖 · Vitest 358 passed/1 skipped · eslint/tsc 双绿 · freeze 零 diff）。rebase 后复跑全绿（#100 对账竞态修复同区合并，hitlSnapshotStamp 保留 + loadLatestSession 摘除语义正确并入）。

## 实现备忘

- session 摘除面：store refs/门控/exports + ChatView 挂载调用/头部块/错误条/composer 2 处 disabled + api/chat.ts 整删 + 5 测试文件去 mock（含 #100 新增 hitl-card-reconcile.spec.ts rebase 后适配）
- 坑位三条：① web 默认分支是 `main`（非 master）——切分支命令以 master 为基静默失败，提交误落 main 本地（branch -f 复位修复）；② composer disabled 模板绑定首轮漏改，被验收10 + vue-tsc 双拦截；③ rebase 撞上 #100 同区改动（return 块 hitlSnapshotStamp），手动解冲突保留两侧语义
- 经验：模板内 `chat.xxx` 绑定不走 store 类型导出面，摘除类改动必须 grep 视图模板 + tsc 双查

## 修订记录

| 日期 | 变更 |
|---|---|
| 2026-11-14 | 创建 task（P0' 衍生卡 T2b-W1 · 维护者 m01326「继续」· goal-24fc4112） |

| 2026-11-14 | CLOSE：PR #103 合入 a7c8b42（rebase 解 #100 同区冲突 · CI frontend+check 双绿）· task 迁 done · W2（api 410 化+drop 三表）前置解除 |
