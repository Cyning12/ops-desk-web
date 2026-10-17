# Invoke：web-fix-tc13b-guard · 30 实现（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 30（实现帽） |
| **task** | docs/tasks/active/task_web_fix_tc13b_guard.md |
| **分支 / HEAD** | task/web-guard-tc13b-fix-draft（base main @ f077908 · 独立 worktree ops-desk-web-wt-guard） |
| **来源** | web 00 委派（红测先行 · F1 guard 改写 + F2 双场景锁存 + F3 回执） |

## GATE_VERIFY（首输出 · 开工前实跑）

- 命令：主仓 `npx spec-wave verify --target /Users/cyning/Desktop/Ops-desk/ops-desk-web-wt-guard --task .../task_web_fix_tc13b_guard.md`（worktree 无 node_modules · 按委派用主仓 npx 加 --target 绝对路径）
- 闸表：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 approved**（task 人工闸表真值 · 无 pending → 不拒开工）
- **插曲**：首跑 VERIFY=BLOCKED，原因非闸 pending，而是 20 R1 审查文「## 1. 结论摘要」阿拉伯数字序号不匹配 spec-wave 3.3.0 结论节正则（须以「结论/签收」起首 · 仅允许中文数字前缀）。00 裁定准 30 做最小标题机读化修正（同 i18n 线先例 7352bed）：`51ca882` chore commit 改「## 一、结论摘要」**内容一字不动** → 复跑 **VERIFY=PASS · EXIT=0**。

## 实现动作（RED→GREEN · git 时序可查）

1. **基线复证**：worktree 钉死 pnpm 全量跑 `Tests 1 failed | 282 passed (283)`，唯一红 = TC13(b) 失败于 :152（与 20 R1 复证逐字吻合）。
2. **RED**（`a0c1523`）：先提交 F2 三例锁存块（空 diff / PR #73 fixture / 边界），引用未实现的 `evaluateTc13bDiff` → 实跑 4 红（旧 :152 + 3 新例 ReferenceError）· 282 绿（286 例）。
3. **GREEN**（`3486638`）：F1 实现——
   - 抽纯函数 `evaluateTc13bDiff(diffText: string)` 返回 `{ verdict, removed, added }`，三态：`empty` / `retry-after-seconds-added` / `other-nonempty`（git 环境解耦可单测 · 名与落点同文件导出为本帽定稿）。
   - TC13(b) 改写：空 diff → console.warn 留痕 + `ctx.skip()`（不再恒红）；非空 diff → :138-150 删行仅限 `onError` / 增行禁解析段字面**逐字存续**；原 :152 `retryAfterSeconds` 硬断言仅在 `retry-after-seconds-added`（decision-surface 上下文）下成立。
   - `:122-131` 基线不可达分支（CI skip / 非 CI throw）与 `resolveDiffBase` 回退链 `:54-75`、兄弟 guard TC3/TC12/TC13(a) `:78-119` **零改动**（git diff f077908 字面机核在案）。
   - fixture 取自 `git show e07e4ac -- src/composables/useLgRagSse.ts`（PR #73 真实 diff 形态）逐字内嵌 + 注释留痕来源。
4. **GREEN 实证**：全量 `Tests 285 passed | 1 skipped (286)` **零红**；skip 者即 TC13(b)（空 diff · console.warn 留痕「diff 为空（非 decision-surface 上下文）」机核在案）。

## 验收勾选（30 自核）

- [x] **TC1**：恒红消除——本分支（不动 useLgRagSse.ts）本地钉死 pnpm 全量 **285 绿 + 1 skip · 零红**（基线 283 → 286 例 · 新增 3 例）；RED（a0c1523 · 4 红）→ GREEN（3486638 · 零红）时序 git 可查。
- [x] **TC2**：双场景断言字面机断——空 diff → `empty`；PR #73 `e07e4ac` 真实 diff fixture → `retry-after-seconds-added` 且 `added.some(retryAfterSeconds)` 硬断言成立（缺增行仍红由该例锁存 · FP-2）；边界例（非空 diff 无增键 → `other-nonempty` · :152 不恒红 · FP-5）30 定稿留痕入第三例。
- [x] **TC3**：存续面零回归——TC3/TC12/TC13(a) 全绿零改动；:138-150 / :122-131 / :54-75 git diff f077908 字面机核零触达（removed/added 计算移入纯函数 · 过滤表达式逐字相同）。
- [x] **TC4**：三门绿——`pnpm lint` EXIT=0 · `pnpm test` EXIT=0（285+1skip 零红）· `pnpm build` EXIT=0（钉死 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` · FP-6 规避）。
- [x] **TC5**：invoke 10/20/30 齐备（本文件）· `docs/coding_wiki/volatile.md` 短注落盘 · active/README.md 同步（NIT-2 对账：i18n 未并 main · 仅其 R1 审查文随 PR #78 在 main · README 保留 i18n 行 + guard 行两件形态）。
- [x] `npx spec-wave task lint --file docs/tasks/active/task_web_fix_tc13b_guard.md` PASS（30 复跑 EXIT=0 · 见下）。

## 非范围零触达自证

- `src/` 零改动（git diff --stat f077908 仅 tests/ + docs/ 五文件 · freeze lg-rag-sse-v1 只消费）。
- 图谱 `docs/_tech_graph/` 与 `.github/workflows/` 零改动；`task_web_http_error_i18n` 面未混入（README 行仅为 NIT-2 对账指针 · 其 task 文件不在本支）。

## 残留风险 / 移交 00

- **审查文标题修正 commit `51ca882`**：内容零改的机读化修正（00 裁定 · 同 i18n 7352bed 先例）——PR 描述须注明，避免误读为 30 改动 20 审查实质。
- **边界语义变更**（非空 diff 无 retryAfterSeconds 增行 → 不再恒红）系 task R3 明示收口，已由 F2 第三例锁存；CI 真跑到非浅克隆形态的行为留 CI 实证（R3 residual 在案）。
- 本帽未开 PR 未合并（归 00）；分支已推送 origin/task/web-guard-tc13b-fix-draft。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 30 实现落盘（RED a0c1523 → GREEN 3486638 · 三门绿 · TC1–TC5 自核全勾 · 不开 PR 不合并） |
