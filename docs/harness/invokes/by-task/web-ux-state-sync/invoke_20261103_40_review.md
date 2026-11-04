# invoke · 20261103 · hat 40 · task_web_ux_state_sync

- **task**：`docs/tasks/active/task_web_ux_state_sync.md`（四闸 approved · GO 30）
- **验收对象**：分支 `task/web-ux-state-sync`（base main `c522436` · `51d1201` + `e3c41b7` · 本地零 push）
- **验收文**：`docs/harness/reviews/task_web_ux_state_sync_review_40_20261103.md`
- **结论**：**approved-with-comments**（零必补项 · NIT×2 · 记录性说明×2）

## 1. 独立复验摘要（不复用 30 结论）

| 项 | 40 独立结果 |
|---|---|
| 分支/commit | `task/web-ux-state-sync` @ `e3c41b7` ← `51d1201` ← base `c522436` · 工作区仅 `.codex/` untracked ✓ |
| lint | EXIT=0（`npx -y pnpm@10.32.1 lint`） |
| test | EXIT=0 · 357 passed / 1 skipped / 35 files |
| build | EXIT=0（vue-tsc + vite · built in 2.40s） |
| graph-compile | EXIT=0（10 flow 全 OK） |
| task lint | EXIT=0（LINT: PASS） |
| 单跑复核 | hitl-approval-page + chat-store-hitl + hitl-card-reconcile + chat-view = 111 tests 全绿 |
| TC1–TC8 | 逐项 PASS（逐项证据见验收文 TC 表） |
| freeze 零分叉 | `git diff main -- src/api/hitl.ts` = 0 行；api/router/ChatView/Overlay 零文件；decide/resume 既有 7 调用点参数零变化，唯一新增调用点 = 已决区 `onDecidedResume` 消费既有 `resumeHitlRequest(row.id)` |

## 2. 重点核对结论

- 30 自述两处既有断言改写（TC1 UTC 直出 → title 保原文 + 正文不含 ISO；TC8 镜像写窗透传 → D4 中性文案）：**语义对齐非放宽**（前者 UTC 可见性经 title 保留且锚点更精确；后者为 task 范围明文立项且 TC5 新增未命中透传用例锁 FP-8）。
- chat-view.spec.ts 三用例修复：**纯 fixture 补真值**（`PENDING_REQ_42` 入 mock pending 列表 · 断言零删改 · 含 vue-tsc `target` 键补全）。
- D1–D4 语义抽查全符（键/版本/FIFO 双向/静默降级/整键丢弃/对账三守卫顺序/Intl+title+回退/子串判据位置与未命中透传）。
- NIT-1/2/3/4 全部落账（NIT-1 task 文件可选回填行未补 → 40 NIT-2 建议 CLOSE 补记）。

## 3. 40 新发现（非阻塞）

- NIT-1（40 编号）：已决区并发窄竞态——`upsertDecidedSnapshot` 重建数组归零在飞行 resuming/error，续跑 pending 中操作另一行时守卫短暂失效 + 在飞错误不呈现；后端 409 幂等兜底，建议下波把交互态迁入按 id Map。
- NIT-2（40 编号）：20-R1 NIT-1 的 task 文件可选回填行未落，建议 CLOSE 补记。
- 记录性说明：30 红测首跑历史证据采信 invoke 留痕（重演需回退代码）；`.codex/` 维持 untracked。

## 4. 移交

- 可进 PR + CI。40 未改任何实现码/测试码；两文档（本 invoke + 验收文）为本棒全部落盘。
