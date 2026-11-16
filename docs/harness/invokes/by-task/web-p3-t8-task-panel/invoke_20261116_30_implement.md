# invoke 30 · web-p3-t8-task-panel 实施

- 时间：2026-11-16 · 分支 task/web-p3-t8-task-panel（worktree ops-desk-web-p3-t8 · base origin/main 09a09c3 · 主工作区被 T9 并行占用故独立 worktree）
- 改动：
  - `src/api/taskPanel.ts`（新）：契约 15 §1/§3 逐字——listThreadRuns / fetchRunEvents（after_seq keyset）/ listThreadSchedules / patchSchedule；{ok,data} 宽松拆壳（chatHistory.ts 先例）；humanized_display 保真透传
  - `src/stores/taskPanel.ts`（新）：useTaskPanelStore · RUN_STATUS_META 六态 · loadPanel 双拉静默降级（FP-F8）· applySseFrame 复用既有 run.start/done/hitl.waiting 帧（零新 event_type · STICKY_TERMINAL 终态粘滞 · 跨 thread 忽略 · query 截 80）· setScheduleStatus（422 detail 逐字落 scheduleActionError · 404 重拉对账）
  - `src/stores/chat.ts`：processFrame 内 handleEvent 后扇出 `useTaskPanelStore().applySseFrame(event)`（try/catch 静默 · replay 重放同管线幂等）
  - `src/components/chat/TaskCard.vue`（新）：六态 border-left 状态色 + 状态 tag · 定时归因前缀 · query 两截
  - `src/components/chat/TaskPanel.vue`（新）：el-collapse 默认收起 · 徽标「任务 · N 进行中」· 加载更多（next_cursor）· 降级空态 · 定时任务子区行内暂停/恢复/取消（ElMessageBox 双确认 · 取消含 R2 终态不可逆文案）· activate(run, action) 上抛
  - `src/components/chat/RunReplayDrawer.vue`（新）：el-drawer 480px + el-timeline 八值帧（EVENT_LABELS）· fetchRunEvents 翻页去重 by seq · 404/失败中性化「回放数据暂不可用」
  - `src/views/ChatView.vue`：conversation tab 内嵌 TaskPanel · RunReplayDrawer 挂载 · onTaskActivate 三分支（scroll-hitl 滚 hitl-overlay / resume 仅本机 activeRun 走 resumeFromCursor 否则静态降级开回放 / replay 开 drawer）· loadPanel onMounted + threadId watch
  - 测试：tests/taskPanel-api.spec.ts（6 例）· tests/taskPanel-store.spec.ts（9 例）· tests/task-panel.spec.ts（13 例 · 组件+ChatView 联动）
  - 图谱：01_struct.md api/pinia/components 行增量备注 + 人签记录；10_flow_chat.graph.yaml 增 task_panel/task_replay_drawer/task_panel_store/task_panel_api 节点 + 6 边 · graph-compile.sh 绿
- 坑位：① EP 2.14.3 drawer 初始可见时 @open 永不触发（emit('open') 仅在 watch(modelValue) 回调内 · use-dialog.mjs 实证）→ 改 watch(visible, immediate) 自载；② ElMessageBox.confirm mockResolvedValue('confirm') 过不了 vue-tsc（MessageBoxData 型不合）→ 照 hitl-approval-page.spec.ts:92-105 先例 mockImplementation(()=>Promise.resolve('confirm' as Awaited<...>))；③ spec-wave 闸机：task 须 HG-AUDIT-R1 行 + R0–R5 六个 ### 子节 + 控制表 + reviews 审查文（含 ## 结论/签收 + 通过词 + 审查行为词）+ pre-30 invoke 20 帽文件，逐条修复后 task lint PASS
- 决策登记（实现备忘）：running/disconnected 卡 resume 仅当 run.run_id===chat.activeRun?.run_id 走续看，否则回放 drawer 静态降级（chat.ts:1190 resumeFromCursor 仅认 activeRun · 不新造机制）
- 验证：vitest 全量 394 passed/1 skipped（39 文件 · 新三 spec 28 例全过）· eslint 0 err · vue-tsc 0 err · build ✓ · graph-compile 绿 · spec-wave task lint PASS（W3 自检占位 warn-only · close 前回填）
