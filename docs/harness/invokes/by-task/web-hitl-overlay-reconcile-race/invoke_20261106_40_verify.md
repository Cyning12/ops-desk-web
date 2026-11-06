# Invoke · 40 帽 · verify（web-hitl-overlay-reconcile-race）

| 字段 | 值 |
|------|-----|
| **帽** | `40`（独立复跑验收棒 · docs-only · 未改任何 src/） |
| **时间** | 2026-11-06（Asia/Shanghai） |
| **task** | `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`（active · 30 已 merge `e39c404`） |
| **审查文** | `docs/harness/reviews/task_web_hitl_overlay_reconcile_race_review_40_20261106.md` |
| **授权** | issue #95 40 授权评论（lead 代维护者 · 19:04 大授权窗口链） |
| **分支** | `verify-40/fix-task-95-ea7283fb4881`（自 origin/main `e39c404` 切） |
| **机断** | 五门独立复跑全 0：pnpm lint/test（359 绿 35 files）/build · spec-wave task lint PASS · lint-wiki-delta PASS（73）· graph-compile 绿（时间戳浮动已回退不入户） |

---

## §1 · 五门独立复跑（非转录）

全部本棒在 `e39c404` 基线亲跑：lint=0 · test=0（359 passed / 1 skipped）· build=0 · task lint PASS · wiki-delta PASS · graph-compile=0。对账两 spec 另做定向复跑（hitl-card-reconcile 5 全绿 · chat-store-hitl 58 全绿）。

## §2 · TC 逐条独立复验（全过 ✅）

TC1 负样本（可动作+二次刷新确证两段断言）· TC1/TC4 纪元往返 · TC2 正样本（守卫序逐行读码确认）· TC3 三向（守卫先于纪元短路）· TC4 形态 A 对拍 · TC5 红线+质量门 · TC6 在档 · TC7 两处 fixture 真值对齐逐行核对（时序对齐生产 · 断言零放宽 · 顺带修正 prop 直传不经 store 的仿真缺口）。细节见审查文 §2。

## §3 · 红线三锁独立证实

merge diff 独立审查（9 文件）：`src/api/hitl.ts` / `useLgRagSse.ts` / 事件分支 git diff 为空；src 改动 = chat.ts 单文件 ⊆ DP-2 圈定面；api 仓零触碰。

## §4 · 裁定对拍 + NIT 闭环

HG-DESIGN-FORM 五条款逐条对拍一致（含 NIT-2 帧首见锁零 created_at 依赖 · 零轮询）；NIT×3 + 20-R1 偏差登记（4 it()+:1495）全闭环；闸语义对拍：30 invoke GATE_VERIFY 表 vs 40 授权前置状态逐条一致。

## §5 · 结论

**PASS（零阻塞 · 零 NIT 新增）** —— 交 lead 关账（active→done 迁档 + CLOSE）。实机时序手测照 sibling TC9 模式留维护者联调复测回填（不阻塞）。

## §6 · 交接

- 本棒 PR（docs-only）：40 review 文 + 本 invoke + task 档回填（TC1–TC7 勾选 + 自检结论 + 修订记录 40 行）。
- 未改任何 src/；graph json 时间戳浮动已回退不入户。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 40 棒：五门独立复跑 → TC 逐条复验 → 红线/裁定/NIT 闭环 → PASS 审查文 + invoke 落盘 → PR 出货待 lead 关账 |
