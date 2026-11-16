# invoke 50 · web-p3-t8-task-panel CLOSE

- 时间：2026-11-16 · PR #108 MERGED 53dd4d3（CI frontend 49s + check 11s 双绿 · squash）
- 验证台账：Vitest 425 passed/1 skipped（rebase T9 后全量复跑 · 本任务新增 28 例：api 6 + store 9 + 组件/联动 13）· eslint 0 err · vue-tsc 0 err · build ✓ · graph-compile 绿 · spec-wave task lint PASS（W3 自检已回填）
- rebase：T9（web#107 c939408）先合并 → 冲突三处皆图谱——01_struct.md 人签记录行（双侧保留 T9/T8 各一行）· docs/_tech_graph/graph.json + shared/graph.json（编译产物 · 取 theirs 后重跑 compile 消解）
- 偏差登记：
  ① `docs/harness/audit_gates/registry.yaml` 非 web 仓工件（仅 ops-desk-api 有）→ 本仓无登记面 · 派单「图谱登记」以 01_struct.md + 10_flow_chat.graph.yaml 增量完成
  ② 测试策略预判名 tests/run-replay-drawer.spec.ts 未单建——drawer 用例并入 tests/task-panel.spec.ts（drawer 段 3 例：八值帧渲染/翻页/404 中性化）· task 档已修正记述
  ③ running/disconnected 卡 resume 静态降级（仅本机 activeRun 续看 · 非本机开回放抽屉）——chat.ts:1190 resumeFromCursor 仅认 localStorage activeRun · 不新造机制 · 决策已录 invoke_30
- 后续：P3-T8 收口完毕；T9（admin memory）已先行关账（7881356）；P3 波 web 侧剩余项以 issue #23 系列为准
