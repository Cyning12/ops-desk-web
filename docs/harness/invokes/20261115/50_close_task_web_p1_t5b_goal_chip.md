---
doc_type: invoke
task: task_web_p1_t5b_goal_chip
invoke_type: 50_close
date: 2026-11-15
---

# Invoke 50 · CLOSE：P1-T5b web goal chip

## 执行记录

- PR：web#105（squash 合并 6ec6d11a29f118d943528a059f687c35732e8859）
- CI：frontend + check 双绿（首波过）
- 终验：Vitest 366 passed / 1 skipped · vue-tsc 0 · eslint 0 · task lint PASS

## 偏差登记

1. tests/chat-store-goal.spec.ts 初版声明未使用的 mountView 变量 → TS6133（tsc+eslint 双红），删除即过；
   教训：spec 文件同样过 noUnusedLocals。
2. ChatView.vue composer disabled 两处（:356/:372）首轮漏改属 W1 旧事，本波无新增漏改；
   chip 接线五挂点全数命中（onDone/openHistoryThread/restoreThreadHistory/startNewSession/clearThreadId）。

## 关联

- 上游契约：api 仓 app/ops/goals/router.py（P1-T2 · #392）
- 设计真源：workspace docs/01-scope/03-general-agent/07-p1-goal-design.md §5 T5 行
