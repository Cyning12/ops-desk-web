# Task：web · 任务面板+轨迹回放（P3-T8 · issue web#23）

> **状态**：`in_progress`（2026-11-16 开工）  
> **类型**：feature / 前端轨  
> **统筹**：web 00；**禁止**改姐妹仓任何文件  
> **分支**：`task/web-p3-t8-task-panel`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-p3-t8-task-panel` |
| **git_branch** | `task/web-p3-t8-task-panel` |
| **implement_repo** | `ops-desk-web` |
| **task_kind** | `feature` |
| wave | P3-T8（14-p3-schedule-taskcard-design §2/§3/§10 T8 行 · 验证假设的用户可见面） |
| **orchestration** | P3 波次：api runs 只读端点（threads/{id}/runs keyset≤50 · runs/{id}/events 白名单8值500截断）+ Schedule REST 四端点已交付 · 本卡=web 面板+回放 · T9 admin memory 页并行（同仓隔离 worktree） |
| **test_strategy** | `required` |
| **test_strategy_note** | 新增 tests/task-panel-store.spec.ts + tests/task-panel.spec.ts + tests/run-replay-drawer.spec.ts；既有 spec 补 taskPanel mock；Vitest 全量 · vue-tsc 0 · eslint 0 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `l1`（components/api/pinia 行增量备注 · 无新一级模块/路由） |
| **graph_delta** | 01_struct.md components/api/pinia 行增量 + 签收行 |
| **wiki_delta** | `n/a` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；SSE 零新帧 · iOS 未知帧抛错硬约束） |
| **related_pr** | 待建 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-11-16 维护者预授权夜间自动执行（lead 派单「用户已预授权，不中途问问题」· P3-T8 实施者 exec-p3-t8） |
| HG-AUDIT-R1 | **approved** | **30** | 2026-11-16 · 维护者预授权夜间自动执行（同上派单授权 · exec-p3-t8 代录 · 承 t5b/t2b 预授权代录先例）；范围=14 §2/§3/§10 T8 行既定、非范围钉死、failure_paths 六行、R0–R5 齐备 |
| HG-WAVE-IMPL | **approved** | 30 | 同上，T8 范围=14 §2/§3/§10 T8 行既定（面板+定时子区+回放 · 非范围钉死） |

---

## 背景与目标

api P3 只读面已上线（runs keyset 分页 / events 白名单回放 / Schedule REST）。本卡=web 用户可见面：ChatView 对话窗内嵌 el-collapse 任务面板（run 卡片=六态映射+定时归因徽标+计数徽标）+ 同面板定时任务子区（pause/resume/cancel 双确认）+ el-drawer/el-timeline 轨迹回放抽屉。

## 范围

1. `src/api/taskPanel.ts`（新）：listThreadRuns / fetchRunEvents / listThreadSchedules / patchSchedule · 契约照抄 15 §1/§3（`{ok,data}` 拆壳采 chatHistory unwrapData 先例 · 404/422 语义 · 422 detail 逐字透传不二次包装 · limit≤50）。
2. `src/stores/taskPanel.ts`（新 · setup 式）：runs/schedules 状态 + loadPanel(threadId) REST 全量 + applySseFrame 既有帧增量（run.start→running 卡 · done→payload.status 终态 · hitl.waiting→waiting_approval · 幂等 upsert by run_id）+ 六态映射表 + 计数徽标（running+waiting_approval）+ keyset 分页 + 404/失败静默降级（FP-F8 同口径）。
3. `src/components/chat/TaskCard.vue`（新 · 同构 HitlApprovalCard 水墨风）：状态 el-tag + query_summary + 相对时间 + 定时归因徽标 · 点击交互（waiting_approval=锚定滚动到消息流 hitl 卡/消息不另开审批面 · done/error/resumed=回放 drawer · running/disconnected=续看既有入口）。
4. `src/components/chat/TaskPanel.vue`（新）：el-collapse-item title 插槽「任务 · N 进行中」+ run 卡列表 + 定时任务子区（active/paused 渲染 · 行内 pause/resume/cancel · ElMessageBox 双确认承 HitlApprovalView:277 先例 · humanized_display 字段优先展示）。
5. `src/components/chat/RunReplayDrawer.vue`（新）：el-drawer 右滑出 + el-timeline · 数据源 GET runs/{id}/events（after_seq 分页 · truncated 提示 · 否复用 replay SSE）· 八值帧渲染（run.start=起点/node.progress=节点步骤/subtask.progress=子任务/answer=回答/hitl.waiting=审批点/hitl.resumed=恢复/done=终点/error=失败）· payload 折叠详情 el-collapse。
6. `src/stores/chat.ts`：handleEvent run.start/done/hitl.waiting 分支挂 taskPanel store 增量回调（最小侵入 · 不引新帧）。
7. `src/views/ChatView.vue`：面板挂载（el-alert 区与消息流之间 · 承气泡内折叠区先例）+ waiting_approval 卡锚定滚动支持（hitl 卡/消息锚点）。

## 非范围

admin memory 页（T9 并行）· HITL 卡片逻辑改动 · iOS · SSE 新帧 · 跨会话全局管理页 · api 改动 · 新建定时任务表单（仅管理既有）。

## 失败路径

| 风险 | 缓解 |
|------|------|
| runs/schedules 接口 404/失败炸主路径 | 面板静默降级（空态/错误行内提示）· 不碰 error 主条 · 401 交 http 拦截器 |
| SSE 增量与 REST 全量竞争 | applySseFrame 幂等 upsert（run_id 键 · 终态不被 running 回退覆盖） |
| 既有 chat spec 污染 | 既有 spec 补 taskPanel client mock（默认空 runs/schedules） |
| ElMessageBox 双确认取消 | 状态不变 · 无请求 |
| 已 cancelled 再 PATCH → 422 | detail 逐字 toast（「已取消的定时任务不可修改」） |
| T9 并行同仓冲突 | 独立 worktree（../ops-desk-web-p3-t8）· 合 main 时 rebase 双侧保留 |

## 验收标准

- [ ] 六态映射渲染：running=进行中(primary+转圈) · waiting_approval=待审批(warning) · done=已完成(success) · error=失败(danger) · disconnected=中断(info) · resumed=已恢复(success 浅)
- [ ] 计数徽标「任务 · N 进行中」= running+waiting_approval 计数
- [ ] waiting_approval 卡点击=锚定滚动到消息流对应 hitl 卡/消息（不另开审批面）
- [ ] done/error/resumed 卡点击开回放 drawer；events after_seq 分页 + truncated 提示；八值帧渲染；error 卡含 error 摘要
- [ ] running/disconnected 卡点击=续看（既有 resumeFromCursor 链路）
- [ ] 定时任务子区 active/paused 渲染 · pause/resume/cancel ElMessageBox 双确认 · humanized_display 优先展示（如「每天 08:30（北京时间）」）
- [ ] runs 404 静默降级 · schedules 失败不炸面板 · SSE 既有帧增量刷新 · 零新帧
- [ ] 定时归因徽标=schedule_attribution 字段唯一真源（「定时任务 · {name}」）
- [ ] Vitest 全绿 + vue-tsc 0 + eslint 0 + task lint PASS
- [ ] tech graph 模块行登记+签收行

## 必读列表

- ../ops-desk-workspace/docs/01-scope/03-general-agent/14-p3-schedule-taskcard-design.md §2/§3/§10（设计真源）
- ../ops-desk-workspace/docs/01-scope/03-general-agent/15-p3-contracts.md §1/§3（契约 schema 逐字）
- src/api/chatHistory.ts（{ok,data} unwrapData 拆壳先例）
- src/components/chat/HitlApprovalCard.vue（卡片同构模式）
- src/views/HitlApprovalView.vue:277（ElMessageBox 双确认先例）
- src/stores/chat.ts handleEvent（SSE 帧管线挂点）

## 思考轮控制

| 轮 | 结论 | early_stop |
|----|------|-----------|
| R0 | 契约=15 §1/§3 逐字 · {ok,data} 包裹拆壳采 unwrapData 先例 · limit≤50 · 422 detail 逐字透传 | 无 |
| R1 | 面板降级口径对齐 FP-F8：任何接口失败不阻塞 Chat 主路径 · 401 交拦截器 | 无 |
| R2 | 面板挂点=ChatView el-alert 区与消息流之间 el-collapse（承气泡内折叠先例 · 否第四槽/侧栏/独立路由 · 定时子区同面板零新路由） | 无 |
| R3 | 风险=既有 spec 污染→补 mock · T9 并行→worktree 隔离 · SSE 竞争→幂等 upsert 终态不回退 | 无 |
| R4 | 回退=revert 单 commit（新文件为主 · chat.ts/ChatView 局部挂点） | 无 |
| R5 | 完成=验收全勾+CI（frontend）绿+squash merge main | 无 |

### R0 框定

feature 轨 · 设计真源 14 §2/§3/§10 T8 行 + 契约 15 §1/§3 逐字 · {ok,data} 拆壳采 chatHistory unwrapData 先例 · runs limit≤50 · 422 detail 逐字透传不二次包装。

### R1 证据

亲读：ChatView.vue 折叠区先例（assistant 气泡内 el-collapse）· HitlApprovalCard 卡片同构 · HitlApprovalView.vue:277 ElMessageBox 双确认 · chat.ts handleEvent 帧管线挂点（run.start/done/hitl.waiting）· chatHistory.ts unwrapData。面板降级口径对齐 FP-F8：任何接口失败不阻塞 Chat 主路径，401 交 http 拦截器。

### R2 方案

面板挂点=ChatView el-alert 区与消息流之间 el-collapse（承气泡内折叠先例 · 否第四槽/侧栏/独立路由 · 定时子区同面板零新路由）；回放=el-drawer+el-timeline 静态查阅（REST events · 否复用 replay SSE · 与续看 live 边界钉死）；SSE 零新帧（iOS 未知帧抛错硬约束）。

### R3 反例

勿改 api 仓/SSE 事件表（freeze lg-rag-sse-v1 只消费）；勿引新依赖（el-drawer/el-timeline 同库未用件）；勿碰 HITL 卡片逻辑；勿另开审批面（waiting_approval 点击=锚定滚动）；勿把「定时任务 · name」前缀当归因真源（唯一真源=schedule_attribution 字段）；勿忘既有 spec 补 mock；T9 并行→独立 worktree 隔离。

### R4 验收

六态映射渲染+计数徽标+锚定滚动+回放分页截断+双确认+humanized 展示逐条 Vitest 断言；404 降级；SSE 增量幂等 upsert；质量门 pnpm lint/test/build 全 0 + task lint PASS + graph-compile 绿。

### R5 收口

范围七项/非范围六条/failure_paths 六行/验收十条/必读六项齐备；人工闸 HG-TASK-DRAFT/HG-AUDIT-R1/HG-WAVE-IMPL approved（维护者预授权代录）；完成=验收全勾+CI 绿+squash merge main+CLOSE 迁档。

### 自检结论

（CLOSE 回填）

## 实现备忘

（CLOSE 回填）

## 测试策略

tests/task-panel-store.spec.ts（六态映射/计数徽标/增量 upsert/分页/404 降级/schedules patch 流）；tests/task-panel.spec.ts（渲染/点击行为/双确认/归因徽标/humanized 展示）；tests/run-replay-drawer.spec.ts（八值帧渲染/分页/截断/空态）；既有 chat spec 补 mock 零回归；全量 Vitest + vue-tsc + eslint。

## 修订记录

| 日期 | 内容 |
|------|------|
| 2026-11-16 | 初稿（P3-T8 派单 · exec-p3-t8 夜间自动执行） |
