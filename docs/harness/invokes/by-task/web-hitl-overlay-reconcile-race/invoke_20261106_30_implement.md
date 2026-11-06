# Invoke · 30 帽 · implement（web-hitl-overlay-reconcile-race）

| 字段 | 值 |
|------|-----|
| **帽** | `30`（执行棒 · 形态 A 落地） |
| **时间** | 2026-11-06（Asia/Shanghai） |
| **task** | `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`（active · 五闸全 approved · GO 30） |
| **授权** | issue #95 30 GO 评论（lead 代维护者 · 19:04 大授权窗口 + 13:40 授权链）· 设计闸回签=DP-1 形态 A + 首见口径锁「帧首见」 |
| **分支** | `task/web-hitl-overlay-reconcile-race`（自 origin/main `efebe66` 切） |
| **机断** | `pnpm lint` / `pnpm test` / `pnpm build` 退出码全 0（359 tests · 35 files）· `spec-wave task lint` PASS · `lint-wiki-delta` PASS · `graph-compile.sh` 绿 |

---

## §0 · GATE_VERIFY（首输出 · 真值=task 人工闸表）

| 闸 | status | blocks 30 | 30 影响 |
|----|--------|-----------|--------|
| HG-TASK-DRAFT | approved | 20-R1, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ |
| HG-DESIGN-FORM | approved（形态 A · 帧首见锁） | 30 | ✅ |
| HG-GRAPH-MODULES | approved | 30 | ✅ |
| HG-CONTRACT-FREEZE | approved | 30 | ✅ |

`npx spec-wave verify --target . --task docs/tasks/active/task_web_hitl_overlay_reconcile_race.md` → **VERIFY: PASS**。

## §1 · TC7 旧测影响面（开工首步 · NIT-1 + lead 偏差登记）

grep 两文件全部对账消费点（store API 6 处 + 组件渲染 1 文件）：

| 用例 | 判据路径 | 形态 A 影响 | 处置 |
|------|----------|-------------|------|
| `hitl-card-reconcile.spec.ts` 在列可点 | present → false | 不涉纪元 | 保持绿（原样） |
| `hitl-card-reconcile.spec.ts` 不在列→只读 | absent → true | **fixture 顺序=先快照后 mount（首见晚于快照）→ 翻红** | 真值对齐：改「帧首见（store 帧路径 seed）→ 确认快照」生产时序；断言内容零放宽。顺带修正 prop 直传消息不经 store 的仿真缺口（形态 A 首见登记本就在 store） |
| `hitl-card-reconcile.spec.ts` FP-4 / FP-5 | fetched/error 守卫 | 不涉纪元 | 保持绿（原样） |
| `chat-store-hitl.spec.ts` TC6 req-gone→true | absent → true | **req-gone 未经帧首见 → 形态 A 下 false → 翻红** | 真值对齐：先经 `captured.onEvent` hitl.waiting 帧首见 req-gone 再断言 |
| `chat-store-hitl.spec.ts` TC7 三向 / 取回前守卫 | 守卫判据 | 不涉纪元 | 保持绿（原样 · 含 :1524 req-gone false：未经首见亦 false，与形态 A 一致） |

结论：2 处既有 fixture 需真值对齐（时序对齐生产 · 断言零放宽），其余全绿预期——实测对齐后旧码上 61 过 2 红（红=新负样本），新码 63/63 绿。

## §2 · 红测先行（TC1）

先于实现合入 2 例负样本，旧码实测**先红**：

1. **TC1 组件负样本**（`hitl-card-reconcile.spec.ts`）：快照 T₀ 成功取回（空列）→ `hitl.waiting` 帧后至（store 帧路径 seed）→ 卡保持可动作（`hitl-card-reconciled` 不渲染 · 三动作在）→ **二次成功刷新后转只读**（确证路径）。旧码红：`reconciledAway=true`。
2. **TC1/TC4 store 纪元往返**（`chat-store-hitl.spec.ts`）：刷新 T₀ → 帧首见 → `false` → 再刷新 → `true`。旧码红：首步即 `true`。

实现后两例转绿，全量 359 tests 绿。

## §3 · 实现（形态 A · 改码面 ⊆ 圈定面）

仅 `src/stores/chat.ts`（+2 测试文件 + 图谱/wiki 文档）：

- `hitlSnapshotStamp = ref(0)`：每次 `refreshHitlPending` 成功 +1（对账纪元）。
- `hitlFirstSeenStamps = new Map<string, number>()` + `stampHitlFirstSeen()`：live 帧（hitl.waiting case）与历史/replay（waiting_approval 映射）两入口统一登记首见纪元，仅首写幂等。
- `isHitlRequestReconciled`：守卫序不变（FP-6 → FP-4/5 → 在列 false），尾部改纪元双判据——未经首见 false；`首见纪元 < 快照纪元` 才参账。
- `hitlSnapshotStamp` 入 store 导出（测试/渲染可读）。
- **零轮询 · 不动事件管线**：`useLgRagSse.ts` / `processFrame` 分支零 diff；无新端点、无 event_type 变更。

## §4 · 红线佐证（TC5）

- api 仓零触碰：diff 仅 5 文件（chat.ts / 2 spec / 01_struct.md / volatile.md / task 档+invoke）——本仓内。
- SSE 事件表零 diff：无 event_type/载荷变更；首见口径不依赖后端 created_at。
- freeze `hitl-browser-decide-v1`：`src/api/hitl.ts` 零 diff。
- 改码面 ⊆ 设计闸圈定面（chat.ts 判据 + 既有刷新点 + 既有测试 spec）✓。

## §5 · 质量门

`pnpm lint` 0 · `pnpm test` 359 绿（35 files · 先红 2 后全绿）· `pnpm build` 0 · `spec-wave task lint` PASS · `lint-wiki-delta` PASS（73）· `graph-compile.sh` 绿。

## §6 · 交接

- PR 出票待审（40 帽验收下一棒 · 实机时序手测建议照 sibling 先例留 40）。
- task 档实现备忘三行 ✅ + 修订记录 30 行已回填。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 30 棒：GATE_VERIFY PASS → TC7 grep → 红测 2 例先红 → 形态 A 落地（chat.ts 纪元判据）→ 全量绿 + 五门 0 → 图谱/wiki 落盘 → PR 出货 |
