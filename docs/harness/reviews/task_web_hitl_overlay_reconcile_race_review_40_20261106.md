# 审查 · 40 验收 · task_web_hitl_overlay_reconcile_race（2026-11-06）

| 字段 | 值 |
|------|-----|
| **验收帽** | 40（独立复跑验收棒 · docs-only · 未改任何 src/） |
| **验收对象** | PR #100 squash merge → main HEAD `e39c404`（30 交付 · DP-1 形态 A） |
| **验收日期** | 2026-11-06 |
| **授权** | issue #95 40 授权评论（lead 代维护者 · 19:04 大授权窗口链） |
| **验收基线** | `verify-40/fix-task-95-ea7283fb4881`（自 origin/main `e39c404` 切） |
| **验收方式** | 全部机断本棒独立复跑（非转录）+ 代码逐行对拍 + diff 独立审查 |

---

## 结论摘要

**验收结论：PASS（approved · 零阻塞 · 零 NIT 新增）** —— 五道质量门独立复跑全 0；TC1–TC7 逐条独立复验全过；红线三锁独立证实；HG-DESIGN-FORM 裁定逐条对拍一致；NIT×3 + 20-R1 偏差登记全部闭环。可交 lead 关账（active→done 迁档 + CLOSE）。

### 1. 五道质量门独立复跑（本棒亲跑 · 非转录）

| 门 | 命令 | 结果 |
|----|------|------|
| lint | `pnpm lint`（10.32.1） | 退出码 0 |
| test | `pnpm test` | 退出码 0 · **359 passed / 1 skipped（35 files）** |
| build | `pnpm build` | 退出码 0 |
| task lint | `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_overlay_reconcile_race.md` | PASS |
| wiki-delta | `npx spec-wave task lint-wiki-delta --target .` | PASS（scanned 73 · missing 0） |
| graph | `./scripts/graph-compile.sh` | 退出码 0（仅 `generated_at` 时间戳浮动 → 已回退，不入户） |

### 2. TC 逐条独立复验

| TC | 复验方式 | 结果 |
|----|----------|------|
| TC1 负样本 | 独立重跑 `hitl-card-reconcile.spec.ts` 5 用例全绿——负样本用例含两段断言：快照 T₀ 后帧至 → 可动作（`hitl-card-reconciled` 不渲染 · 三动作在）；二次成功刷新 → 转只读（确证路径）。逐行读断言确认 = 维护者建议形态（早期渲染实体键滞后不再显示死态） | ✅ |
| TC1/TC4 纪元往返 | `chat-store-hitl.spec.ts` 独立重跑 58 用例全绿——纪元往返四断言（刷新 T₀ → 帧首见 → `false` → 再刷新 → `true`）逐行核对 | ✅ |
| TC2 正样本零回归 | 正样本用例（帧首见→确认快照→转只读）绿；`isHitlRequestReconciled` 守卫序（FP-6 → FP-4/5 → 在列 → 未首见 → 纪元）逐行读码确认正样本路径不受影响 | ✅ |
| TC3 防误判三向 | FP-4（403）/ FP-5（网络错）/ FP-6（本地已动作）三用例绿；守卫序确认三判据均**先于**纪元判据短路 | ✅ |
| TC4 形态一致性 | 形态 A 断言（首见纪元 < 快照纪元才参账）与回签书逐字对拍一致；形态 B/C 分支未触发（设计闸裁决 A） | ✅ |
| TC5 红线 + 质量门 | 见第 3 节 + 第 1 节 | ✅ |
| TC6（10 棒） | PR #96 合并 `692f268` 在档 · 三机断当时全绿（20-R1/40 两级复核均在文） | ✅ |
| TC7 旧测影响面 | 30 invoke §1 grep 表逐条复核：两文件 6 消费点中 2 处 fixture 真值对齐——① 组件正样本改「帧首见（store 真帧路径 `seedWaitingFrame`）→ 确认快照」生产时序，断言内容零放宽（顺带修正 prop 直传不经 store 的仿真缺口，形态 A 下必须经 store 登记首见）；② store TC6 先 `captured.onEvent` 帧首见 req-gone 再断言。其余 4 消费点（在列/FP-4/FP-5/守卫）判据不涉纪元，原样保持绿——逐行核对属实 | ✅ |

### 3. 红线三锁独立证实（diff 独立审查 · `git diff e39c404^ e39c404`）

| 红线 | 证据 | 结果 |
|------|------|------|
| api 仓零触碰 | 本仓 merge diff 仅 9 文件（src 1 + tests 2 + docs 6）；无跨仓操作 | ✅ |
| SSE 事件表零 diff | `src/composables/useLgRagSse.ts` / `processFrame` 事件分支零 diff（git diff 为空）；首见口径不依赖后端 created_at | ✅ |
| freeze `hitl-browser-decide-v1` | `src/api/hitl.ts` 零 diff（git diff 为空） | ✅ |
| 改码面 ⊆ 圈定面 | src 改动 = `src/stores/chat.ts` 单文件（40 行变更 · 对账判据/时机 + 首见登记），⊆ DP-2 圈定面（chat.ts 判据/时机 + 既有刷新点 + 既有测试 spec）；**未动事件管线** | ✅ |

### 4. HG-DESIGN-FORM 裁定逐条对拍

| 裁定条款 | 实现 | 结果 |
|----------|------|------|
| DP-1 形态 A：仅「本端已知且纪元不晚于最近一次成功快照」的 id 参账 | `isHitlRequestReconciled`：未首见 → false（本端已知门）；`firstSeen < hitlSnapshotStamp`（纪元门）；在列 → false | ✅ |
| SSE 新到（快照后首见）不参账，待下一次成功刷新确证 | 首见 stamp 取登记时当前纪元；快照后首见 stamp = 当前纪元 → `<` 不成立 → false；下一次成功刷新 stamp+1 → 参账。TC1 十行纪元往返覆盖 | ✅ |
| NIT-2 首见口径锁 = 帧首见（不依赖后端 created_at） | `stampHitlFirstSeen` 在 store 帧摄入/历史映射时点登记，无任何后端时间字段引用 | ✅ |
| 零轮询 | 无新定时器/轮询；`hitlSnapshotStamp` 自增仅在既有 `refreshHitlPending` 成功路径 | ✅ |
| 实现选型由 30 依实证定（纪元戳/seen 集合/帧内时间键） | 选型 = 纪元戳 + 首见 Map（帧内时间键因 NIT-2 被锁排除，正确） | ✅ |

### 5. NIT×3 + 20-R1 偏差登记闭环

| 项 | 状态 | 闭环证据 |
|----|------|----------|
| NIT-1（K7 旧测 grep 影响面） | ✅ 闭环 | 30 invoke §1 表 + TC7 复验（第 2 节）；结果已回填 invoke 与 task 档 |
| NIT-2（签闸锁帧首见口径） | ✅ 闭环 | HG-DESIGN-FORM 签认行（task 档 :47）含锁；实现零 created_at 依赖 |
| NIT-3（回签书引用 DP-1 A 原文） | ✅ 闭环 | 30 GO 评论回签书逐字引用 task DP-1 A 原文 |
| 20-R1 偏差登记（「5 用例」= 4 it() + chat-store-hitl FP-6 一枚） | ✅ 闭环 | 本棒 TC7 复验按「两文件合计 5 面」口径执行；task 档偏差登记行在档 |

### 6. 实机时序手测（可选项 · 留痕）

未执行：本棒为独立静态复跑（环境无 dev server / 后端联调面）。建议照 sibling web-ux-state-sync TC9 模式，由维护者联调复测「新会话发写请求 → hitl.waiting 到达 → 浮层即刻可动作（非死态）」实机时序后回填——**不阻塞本验收结论**（时序行为已由 TC1 负样本旧红新绿双证据机断锁定）。

### 闸语义对拍（30 invoke GATE_VERIFY 表 vs 40 授权）

30 invoke §0 GATE_VERIFY 表（五闸 approved · blocks 30 标注）与 40 授权前置状态（五闸全 approved · task 档 `efebe66` · 20-R1 `dcef6a7`）**逐条一致**；40 复跑期间无闸态变更需求。

---

## 阻塞项

无。

## 建议（非阻塞 · 交关账时可选）

- 实机时序手测按第 6 节留痕回填后 CLOSE（sibling TC9 模式）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 40 验收：PASS（零阻塞 · 零 NIT 新增）· 五门独立复跑全 0（359 tests）· TC1–TC7 逐条复验 · 红线三锁独立证实 · 裁定对拍一致 · NIT×3+偏差登记闭环 · 交 lead 关账 |
