# coding_wiki · volatile

> **层**：volatile · **当前 active task** 专属；关账后清空或归档要点

## 相关页

- 稳定层：[[stable]]
- 项目层：[[context]]

## 本波 active

- **`web-chat-history-hitl-ux`**（2026-10-04 · 30 实现）：**`waiting_approval` ≠ 完成态**——`done` 按 `payload.status` 分支：waiting_approval 不清场（保留 active-run 续看游标 · 不记 lastDone 防「假完成」）；审批动作链 **decide → resume 两步**（契约钉 decide 不自动 resume · 前端链式两调用）；历史 run 视图映射既有 ChatMessage（裁定 F-C）· 续看复用 replayLgRag 不新造。真值：`docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md` §2/§6/§7 + `docs/tasks/active/task_web_chat_history_hitl_ux.md`。
- **`web-lg-rag-sse-progressive-reveal`**（2026-09-08 · 30 实现中）：客户端 reveal 队列（`useRevealQueue`）——速率 **60 字/秒**（tick 50ms · 3 字/tick）；answer delta 入网络缓冲匀速出队；`content`/`final` 取消并以终稿替换；`done`/`error`/abort **刷齐已收**；subtask `step` 即时可读、`done` 解析 `subtask_result.output` 打字机；replay 默认 **4×** 加速。真值：`docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md`（00 定夺表）· 前置 T5/#28 · subtask-live/#38。
- （以下为已交付指针，关账后可裁）
- **`web-graph-l2-key-unify`**（2026-08-31 · 30/40 交付）：l2 by_symbol 键形态统一——18 裸键（chat+lg_rag 域 · 含 http 例外条）全部改 `path#symbol` 复合键，**值（path/node_id/kind）一律不变**，条目 69=18+51 不变；机检四断言：零裸键 · 值集合全等 · 撞键=0 · indexes↔9 flow implementedBy 唯一 (path,symbol) 对相等（75 条去重=69）；http 计数校正 7 非 9（chat flow 无 http_client · obs 无 http 段 · R1-N1）。真值：`docs/tasks/done/task_web_graph_l2_key_unify.md`（00 定夺表）+ `docs/spec/web-tech-graph-incremental-completion/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P2。
- **`web-graph-l1-flow-pages`**（2026-08-31 · 30/40 交付）：G-L1 补齐 7 页 flow——`10_flow_{overview,issues,pulls,graph,lc_evidence,obs,login}` 全实证链（view → store → api → http → 端点 → ops_api；obs 止 fixture「本地 fixture 驱动 · 无后端调用」）；l2 indexes 同波 7 域条目（by_symbol 新条目一律 `path#symbol` 复合键 · R1-N1：load×5 / invoke/abort / setPage(Size) 撞键；既有 chat/lg_rag 裸键不迁移双形态并存；http 共享节点单条不重复）；`01_modules.md` 关联节 7 链接 + 人签；l2 README 覆盖域 = 全模块 9 域。真值：`docs/tasks/done/task_web_graph_l1_flow_pages.md`（00 定夺表）+ `docs/spec/web-tech-graph-incremental-completion/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1。
- **`web-graph-l1-flow-lg-rag`**（2026-08-31 · 30/40 交付）：G-L1 新建 `10_flow_lg_rag`——实证链 LgRagView → useLgRagStore（invoke/abort/useThreadId/elapsedSeconds）→ invokeLgRag → http axios → POST /api/ops/lg-rag/invoke → ops_api；旁注 refuse=200 · 非流式（SSE 主线在 10_flow_chat）· thread_id 回填 · mode 三档；l2 indexes 同波扩 lg_rag 域（N3：同文件多域分段 graph_ids 列表 · N6：裸符号键零撞键维持）；`01_modules.md` pages 行补 Obs + 关联节 + 人签；l2 README 试点域表述更新（N4）。真值：`docs/tasks/done/task_web_graph_l1_flow_lg_rag.md`（00 定夺表）+ `docs/spec/web-tech-graph-incremental-completion/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P1/P2。
- **`web-graph-l0-stale-sweep`**（2026-08-31 · 30/40 交付）：G-L0 脱节清扫——l0 边 `sse_client → ops_api` label 改 `POST /api/ops/lg-rag/stream`（sse_client 重释为 lg-rag SSE 主线 · 全文无 chat/stream）；补 7 页节点（login/overview/issues/pulls/graph/lc_evidence/lg_rag · pages includes 接入 · lg_rag_page → api_client invoke 边）；version 刷新 2026-08-31；compile 再生成 00_main.md + 双写 graph.json（时间戳 diff 属正常噪声）。真值：`docs/tasks/done/task_web_graph_l0_stale_sweep.md`（00 定夺表）+ `docs/spec/web-tech-graph-incremental-completion/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P0。
- **`web-lg-rag-sse-t6`**（2026-08-31 · 30/40 交付）：chat SSE 死代码清除——删 `src/composables/useOpsChatSse.ts` + `tests/chat-sse.spec.ts`（api chat stream 已 410 Gone · api PR #108）；守卫 `tests/chat-stream-deprecation.spec.ts` 升级为「文件缺席 + src 全树无 chat stream 字面量」（R1-N2 口径）；保留 `fetchLatestSession`/`ChatSession`（api 会话元数据端点未下线）；README/AGENTS.md 传输主线钉 lg-rag SSE。真值：`docs/tasks/done/task_web_lg_rag_sse_t6.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §10.5。
- **`web-lg-rag-sse-t5`**（2026-08-31 · 30/40 交付）：answer 帧分支规则——payload 含 `delta` 键 → 追加到 assistant.content；含 `content` 键 → 全量替换（终帧 `final:true` 同此，严禁叠加到 delta 拼接后；两键同帧 content 优先 + warn）；done/error/abort 后停止追加。真值：`docs/tasks/done/task_web_lg_rag_sse_t5.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.4。
- **`web-lg-rag-sse-t4`**（2026-08-31 · 30/40 交付）：断联/replay 续看——每帧捕获可选顶层 `cursor`（缺失以 run_id+seq 合成），active-run 落 `localStorage`（key `ops.lg-rag.active-run`，终态 done/error/abort 即清除）；断网/刷新后手动「续看」→ `POST /api/ops/lg-rag/replay` body `{run_id, after_seq}`（帧形状同 live，复用同一解析/渲染管线，渲染进新建 assistant 消息）；per run_id 记 `lastAppliedSeq`，`seq<=lastAppliedSeq` 帧整体忽略（answer 不重复 append · thinking 不重复）；replay 404/422 清 active-run 不重试，401（live/replay）清 thread_id+active-run 跳登录。真值：`docs/tasks/done/task_web_lg_rag_sse_t4.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.3。

## subtask.message（web-lg-rag-sse-subtask-message · 2026-09-08）

- **`web-lg-rag-sse-subtask-message`**（2026-09-08 · 30/40 交付）：subtask.progress 三态优先消费可选 payload.message（api subtask_message.py 确定性模板 · ≤200 字）——running 非空 message **原样零前缀**（不再套「执行中 ·」叠句 · R1-N3）；step 原样即时上屏、同 subtask_id 替换不堆行；done 有 subtask_result.output 仍打字机渐显 output（message 不得覆盖/截断/替代），无 output 时 message **显式优先**作完成摘要（先于 summary/content · R1-N1/N2）再降级 extractSubtaskDoneText；空串视为缺省走本地兜底；node.progress 的 summarizeProgress 直出顺序（summary→content→message）**不变**。真值：docs/tasks/active/task_web_lg_rag_sse_subtask_message.md（00 定夺表）· 入口 src/stores/chat.ts extractPayloadMessage。

## 执行帽速链

- Active tasks：`../tasks/active/`
- WikiTrack RUNBOOK：[`../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md)
- 升级 Checklist：[`../runbooks/RUNBOOK_harness_upgrade_v1_zh.md`](../runbooks/RUNBOOK_harness_upgrade_v1_zh.md)

## 关账后

- 可复用条目 → 晋升 [[context]] / [[stable]]（仍只写指针，不双份正文）
- 本表清空，避免下一 task 读到 stale volatile

## chat 实流响应式（web-fix-chat-live-reactivity · 2026-09-08）

- **根因**：`pushMessage` 把新建 raw `ChatMessage` push 进 ref 数组后**返回 raw 引用**，sendMessage/replay 全程突变 raw（thinking.push / subtasks upsert / reveal sink 写 content）——raw 突变不经 Vue proxy set 陷阱 → 不触发任何 effect → 模板永不重算（实流零渲染/无打字机）。**修法**：`pushMessage` 返回 `messages.value[messages.value.length - 1]`（响应式代理）；R1-N1 残余逃逸点 `startSubtaskOutputReveal` 闭包改持 `upsertSubtaskBlock` 替换后数组中的代理 block（`assistant.subtasks[idx]`）。教训：**store 内建对象一律经代理回流给突变方**；直读 store 状态的断言测不出响应式绕过，须用 `effect()` 级回归。真值：`docs/tasks/active/task_web_fix_chat_live_reactivity.md`。
