# Invoke · 20 帽 · task audit R1（web-hitl-overlay-reconcile-race）

| 字段 | 值 |
|------|-----|
| **帽** | `20`（task 书面审查棒 · 纯文档轨零业务码） |
| **时间** | 2026-11-06（Asia/Shanghai） |
| **task** | `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`（draft→pending · HG-TASK-DRAFT approved） |
| **审查文** | `docs/harness/reviews/task_web_hitl_overlay_reconcile_race_audit_R1_20261106.md` |
| **委托依据** | lead issue #95 comment（2026-11-06 16:36 CST · HG-TASK-DRAFT 已签 PR #96 `692f268` 合并 · 令执行 20-R1，审毕随档签余下四闸并给 30 授权 · 设计闸预告=DP-1 形态 A） |
| **机断** | `npx spec-wave task lint --file` PASS · `lint-wiki-delta --target .` PASS · `pnpm lint` 退出码 0 |

---

## §1 · 审查依据（亲读）

- **上游**：issue #95（缺陷链）· 维护者 trigger 四项要求 · done 族 `task_web_ux_state_sync.md` D2 裁定（存续不推翻）。
- **码面抽查（合并后 main `692f268` 基线）**：`ChatView.vue:41,55-61` · `chat.ts:454-459,738-751,1289-1318` · `HitlApprovalCard.vue:22-32,98` · `tests/hitl-card-reconcile.spec.ts`（5 用例在位 · 负样本缺失）· `src/api/hitl.ts`（freeze 在位）· 图谱三文件在位。

## §2 · 结论（PASS-WITH-MINOR · NIT×3 · 零内容阻塞）

- **维护者四项要求逐条 ✅**：①六要素+设计闸 DP-1/DP-2 独立成节且 10 未定夺实现；②红测先行入 test_strategy + TC1 负样本先红；③红线三锁入 FP-2/3/4（另补 FP-5/8/10）；④PR #96 三机断全绿 merge `692f268`。
- **NIT-1（K7）**：行为变更类缺「旧测 grep 影响面」单行——30 开工首步须核 `hitl-card-reconcile.spec.ts` 正样本 fixture 时序与形态 A 口径相容（首见早于快照→参账→仍转只读；翻红=真值对齐零放宽）。
- **NIT-2（给 lead 签闸措辞）**：形态 A 首见口径锁「帧首见」（不依赖后端 created_at 新字段，与 SSE 事件表零 diff 自洽）。
- **NIT-3**：HG-DESIGN-FORM 回签书引用 DP-1 A 原文，免 30 两读。

## §3 · 闸态（本棒不代签）

| 闸 | 状态 | 20 R1 意见 |
|----|------|------------|
| HG-TASK-DRAFT | approved（lead · PR #96 review · merge `692f268`） | 与委托一致 ✓ |
| HG-AUDIT-R1 | pending | 零内容阻塞 → 可签 |
| HG-DESIGN-FORM | pending | 预告=形态 A 复核一致 → 可签（锁 NIT-2 口径） |
| HG-GRAPH-MODULES | pending | 10 评估亲验合理 → 可签（30 实扫回签） |
| HG-CONTRACT-FREEZE | pending | 红线三锁佐证链完整 → 可签（30 diff 审查闭环） |

## §4 · 交接

- 本棒 PR（纯文档轨 · `agent/fix-task-95-audit-r1`）：审查文 + 本 invoke + task 档签录回填（HG-TASK-DRAFT approved 代录 · 状态 draft→pending · 修订记录两行）。
- 交 lead：随档签余下四闸（签时参考 NIT-2/NIT-3）→ commit task 档 → 下发 30 Prompt（红测先行 · 分支 `task/web-hitl-overlay-reconcile-race` · 开工首步旧测 grep 影响面）。
- 本棒：不改 `src/`、不改 `tests/`、不签闸。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 20 帽 R1 棒：PASS-WITH-MINOR（NIT×3）· 审查文 + invoke 落盘 · task 档签录回填 · 三机断全绿 · PR 出票待 lead 随档签余下四闸 |
