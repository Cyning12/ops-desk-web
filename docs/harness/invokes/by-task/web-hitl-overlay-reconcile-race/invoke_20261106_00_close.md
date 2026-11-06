# Invoke · 00 帽 · CLOSE 关账（web-hitl-overlay-reconcile-race）

| 字段 | 值 |
|------|-----|
| **帽** | `00`（关账棒 · docs-only · 禁改 src/） |
| **时间** | 2026-11-06（Asia/Shanghai） |
| **task** | `docs/tasks/done/task_web_hitl_overlay_reconcile_race.md`（active→done 迁档 · 本 invoke 落盘时完成） |
| **授权** | issue #95 CLOSE 评论（lead 代维护者 · 照 api#337 CLOSE 920c8e5 先例） |
| **分支** | `close/fix-task-95-ea7283fb4881`（自 origin/main `393fdc4` 切） |
| **机断** | `spec-wave task lint` PASS（迁档后路径 `--file docs/tasks/done/...` 同绿）· `lint-wiki-delta --target .` PASS · `pnpm lint` 退出码 0 |

---

## §1 · 全链索引（issue #95 缺陷链 · 单日全帽闭环）

| 棒 | 交付 | PR / SHA | 结论 |
|----|------|----------|------|
| 10 | task 档立案（DP-1 三形态 + DP-2 SSE 边界 · FP-1~11 · TC1–TC6 · R0–R5） | PR #96 `692f268` | HG-TASK-DRAFT approved |
| 20-R1 | 书面审查（NIT×3） | PR #98 `dcef6a7` | PASS-WITH-MINOR 零内容阻塞 |
| 签闸 | 余下四闸随档签（形态 A 帧首见锁 · TC7 入验收） | `efebe66` | 五闸全 approved · GO 30 |
| 30 | 形态 A 落地（chat.ts 纪元判据 · 红测先红 2 例 · TC7 两处 fixture 真值对齐零放宽） | PR #100 `e39c404` | 六条件亲验全 ✅ |
| 40 | 独立复跑验收（五门独立重跑 · TC1–TC7 逐条复验 · 红线独立证实） | PR #101 `393fdc4` | PASS 零阻塞零 NIT 新增 |
| CLOSE | 本棒：迁档 + 状态/修订回填 + volatile 移除 | 本 PR | 交 lead 关 issue #95 |

## §2 · 裁定链终态

- **HG-DESIGN-FORM = DP-1 形态 A · 键口径统一**：`hitlSnapshotStamp`（成功刷新 +1）+ `hitlFirstSeenStamps`（帧/历史/replay 首见登记 · 仅首写幂等）；仅「首见纪元 < 最近一次成功快照」的 id 参账；SSE 新到不参账待下一次刷新确证。选型 = 纪元戳 + 首见 Map（帧内时间键因 NIT-2 锁排除）。
- **NIT-2 首见口径锁** = 帧首见（零 created_at 依赖 · SSE 事件表零 diff 自洽）· **零轮询**。
- **NIT×3 终态**：全闭环（NIT-1 旧测 grep 影响面=30 invoke §1 + 40 复核；NIT-2=签闸锁+实现；NIT-3=回签书引用 DP-1 A 原文）。
- **20-R1 偏差登记闭环**：「spec 5 用例」= `hitl-card-reconcile.spec.ts` 4 it() + `chat-store-hitl.spec.ts` FP-6 一枚（两文件合计 5 面）。
- **红线三锁终态**：api 仓零触碰 · SSE 事件表零 diff · freeze `hitl-browser-decide-v1`（`src/api/hitl.ts` 零 diff）——30 交付佐证 + 40 独立证实双留痕。

## §3 · 遗留（不阻塞关账）

- 实机时序手测（新会话写请求 → hitl.waiting 到达 → 浮层即刻可动作）：照 sibling TC9 模式留**维护者联调复测回填**（时序行为已由 TC1 旧红新绿双证据机断锁定）。
- issue #95 由 lead 关闭（bot 不关 issue）。

## §4 · 本棒动作

- `git mv` active→done 迁档；头部状态行 → done（全链 SHA 回填）；修订记录 CLOSE 行（全链 SHA + 裁定链终态）。
- `docs/coding_wiki/volatile.md` 本分节移除（要点由 done 档承载 · 照 2026-11-04 sweep 先例，恢复「（空 —— 本波无进行中 code task）」标记）。
- active README 活跃数 1→0 + CLOSE 旁注。
- 40 审查文与既有 invoke 零改动（红线）。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 00 关账棒：迁档 + 状态/修订回填 + CLOSE invoke + volatile 移除 + README 旁注 · 三机断全绿 · PR 出货待审 · 交 lead 关 issue #95 |
