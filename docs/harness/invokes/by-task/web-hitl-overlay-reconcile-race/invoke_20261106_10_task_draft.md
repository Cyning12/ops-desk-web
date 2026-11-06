# Invoke · 10 帽 · task 起草（web-hitl-overlay-reconcile-race）

| 字段 | 值 |
|------|-----|
| **帽** | `10`（task 起草棒 · 纯文档轨零业务码） |
| **时间** | 2026-11-06（Asia/Shanghai） |
| **task** | `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`（draft · 五闸 pending 起） |
| **受理依据** | 维护者 trigger 2026-11-06 13:40 授权（issue #95 comment · lead 全程代行签收与验收）· 10 帽边界 = 只产 task 档 + invoke + lint PASS + PR，30 改码待闸签收后另行授权 |
| **机断** | `npx spec-wave task lint --file` PASS · `lint-wiki-delta --target .` PASS · `pnpm lint` 退出码 0 |

---

## §1 · 起草依据（证据亲读）

- **上游立案**：issue #95（backlog · 现象/根因 bot 诊断/两条修复线索/复现路径 · 证据截图 04/08 在 #93 联调验证报告）——web 仓外，文字诊断为准。
- **码面亲读**：`src/views/ChatView.vue:41,55-61,108-111`（onMounted 快照 T₀ :58 · 条带「人工审批·待审批」矛盾面 :41）· `src/stores/chat.ts:454-459`（`hitlPendingFetched` 布尔位无时点）· `:738-751`（hitl.waiting 消费后无 pending 联动）· `:1289-1318`（refreshHitlPending + `isHitlRequestReconciled` 无纪元判据 = 根因锚）· `:1359-1468,1599,1652`（其余刷新点均不覆盖「帧先到快照后至」时序）· `src/components/chat/HitlApprovalCard.vue:22-32,98,138`（reconciledAway 消费面）· `src/api/hitl.ts`（freeze 只读）· 既有测试 `tests/hitl-card-reconcile.spec.ts`（正样本/防误判在 · 负样本缺失）。

## §2 · 关键定夺（DP-1/DP-2 摘要 · 10 不定夺实现）

- **DP-1 修复形态（留 HG-DESIGN-FORM 人签）**：A 键口径统一（快照纪元对齐，SSE 新到 id 不参账待确证）/ B 对账时机（hitl.waiting 消费后一次性刷新 + 幂等防抖防风暴）/ C 其他（回签后生效）。
- **DP-2 SSE 流改动边界**：默认最小面 = chat.ts 判据/时机 + 既有刷新点 + 测试；`useLgRagSse.ts` / `processFrame` 事件消费分支默认不动，必须动时先在设计闸圈定并附 api 仓 SSE 事件表零 diff 佐证。
- **红线三锁**：api 仓零触碰 / SSE 事件表零 diff / `hitl-browser-decide-v1` 请求面零变更（入 failure_paths FP-2/3/4 + TC5）。
- **负样本（维护者建议）**：浮层早期渲染时实体键滞后不再显示死态——构造「快照 T₀ 先成、hitl.waiting 帧后至」时序，卡保持可动作；正样本转只读零回归（FP-8 防「永不转只读」凑绿）。

## §3 · 闸态

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-TASK-DRAFT | pending | 待维护者初稿人扫 |
| HG-AUDIT-R1 | pending | 待 20-task-audit R1 + 人签 |
| HG-DESIGN-FORM | pending | **设计闸**：修复形态三选一 + SSE 流改动边界（30 前置） |
| HG-GRAPH-MODULES | pending | 10 评估：零新增一级模块/路由/事件管线（30 实扫回签） |
| HG-CONTRACT-FREEZE | pending | 红线三锁佐证（30 diff 审查） |

## §4 · 交接

- 本棒 PR（纯文档轨 · ticket 分支 `agent/fix-task-95-ea7283fb4881`）：task 档 + 本 invoke + active/README 旁注（如有）· **不改 `src/`、不改 `tests/`、不签闸**。
- 交维护者签 HG-TASK-DRAFT → 20-task-audit R1 → 人签 HG-AUDIT-R1 / HG-DESIGN-FORM / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE → **另行授权 30**（红测先行 · 分支 `task/web-hitl-overlay-reconcile-race`）。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 10 帽起草棒：task draft 落盘（DP-1/DP-2 · FP-1~FP-11 · TC1–TC6 · R0–R5 early_stop）· task lint / lint-wiki-delta / pnpm lint 三机断全绿 · invoke 落档 · PR 出票待审 |
