# Invoke：web-fix-tc13b-guard · 10-task 起草（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10-task |
| **task** | docs/tasks/active/task_web_fix_tc13b_guard.md |
| **分支 / HEAD** | task/web-guard-tc13b-fix-draft（base main @ f077908 · 独立 worktree ops-desk-web-wt-guard） |
| **来源** | 维护者令（2026-10-17 · 00 转达）：「批准 · 另立 guard 修复 task」——main 基线 Vitest 283 例 = 282 绿 + 1 既有红 TC13(b)，另立 fix/test-infrastructure task 修复 |

## 委派令工作项 → task 映射

| 启动令工作项 | task 落点 |
|--------------|-----------|
| 1. 亲读真值（guard :100-160 · AGENTS.md · 格式锚 fobs task） | 现状锚点表（guard :54-153 全亲读 · 行号字面在案） |
| 2. task 落盘（slug web-fix-tc13b-guard · fix/test-infrastructure · test_strategy required · 分支 task/web-fix-tc13b-guard） | `docs/tasks/active/task_web_fix_tc13b_guard.md` 全文 |
| 3. 范围：guard 改「diff 空或非 decision-surface 上下文 → skip/pass · 仅本支硬断言」；非范围：动 useLgRagSse.ts 本体 / 改其他 guard 语义 / 新测试框架 | 范围 F1/F2 · 非范围五条 |
| 4. failure_paths 至少三条（闸 pending 拒开工 · 误松致本支失效 CI 红拦 · 误判 skip 双场景断言） | FP-1/FP-2/FP-3（+ FP-4/FP-5/FP-6） |
| 5. 人工闸表：HG-TASK-DRAFT approved（00 代录）· HG-AUDIT-R1 / HG-GRAPH-MODULES pending 禁代签 | 人工闸表三行 |
| 6. R0–R5 全填 · 验收可机断（main 本地不再恒红 + 双场景断言 + 三门绿） | 思考轮控制表 + R0–R5 节 · 验收 TC1–TC6 |
| 7. README 同步 + 10 invoke 落盘 | `docs/tasks/active/README.md` 加行 · 本文件 |
| 8. lint PASS 后 worktree 分支提交 push（docs-only · 不开 PR 不合并不改 src/） | 见「机检」与 git 记录 |

## 亲读核真锚点（10 已读 · 禁信转述）

- `tests/hitl-decision-surface-guards.spec.ts:121-153` TC13(b) 全貌：`resolveDiffBase` → diff → 删行/增行口径 + :152 硬断言
- `tests/hitl-decision-surface-guards.spec.ts:152` 恒红根因字面：`expect(added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)`
- `tests/hitl-decision-surface-guards.spec.ts:122-131` 基线不可达分支：CI → `ctx.skip()` 留痕（浅克隆路径 · CI 绿之由）· 非 CI → throw 拒绿
- `tests/hitl-decision-surface-guards.spec.ts:138-150` 上下文无关口径（删行仅限 `onError` · 增行禁解析段字面）= 保留面
- `tests/hitl-decision-surface-guards.spec.ts:54-75` 回退链：本地 main 优先 → 本地环境 base 恒可达 → 恒走 diff 断言（本地恒红机理）
- `docs/tasks/done/task_web_hitl_decision_surface.md` AC13/TC13 · 裁定 D-C（retryAfterSeconds 仅错误面可选增键）· PR #73 squash `e07e4ac` 已并 main
- `docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md` §2.3：20 帽 main 工作树实跑复证 `Tests 1 failed | 282 passed (283)` 唯一红 TC13(b) :152 —— 恒红证据在案
- 格式锚 `docs/tasks/done/task_web_hitl_fobs_receipt.md`（元信息表 / 人工闸 / failure_paths / R0–R5 / 自检结构照其形态）

## 闸状态（起草时）

- HG-TASK-DRAFT：**approved**（2026-10-17 维护者令「批准 · 另立 guard 修复 task」· 00 代录）
- HG-AUDIT-R1 / HG-GRAPH-MODULES：**pending 不代签**（图谱预判 n/a：仅 tests/ 与 docs 面 · 零 src/）→ **30 拒开工**

## 机检

- `npx spec-wave task lint --file docs/tasks/active/task_web_fix_tc13b_guard.md` → **LINT: PASS · EXIT=0**（2026-10-17 落稿实跑 · 主仓 npx 解析 · 对 worktree 绝对路径跑）

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 10 落稿：task v0（R0–R5 early_stop at R5）· lint PASS · README 同步 · invoke 落盘 |
