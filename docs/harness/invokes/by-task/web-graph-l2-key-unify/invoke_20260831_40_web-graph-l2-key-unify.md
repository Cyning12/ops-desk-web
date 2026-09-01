# Invoke：40-self-check · web-graph-l2-key-unify

> **用途**：40 自检留痕（30 同上下文闭环 · 复跑迁移机检与全量 Verify）。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-graph-l2-key-unify` |
| git_branch | `task/web-graph-l2-key-unify` |
| created_utc_or_local | 2026-08-31 |
| 依据 | task `### 自检结论` 回填表 + `invoke_20260831_30_*` 机检命令 |

## 40 复跑矩阵（全绿）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| 机检① 零裸键 | python3 断言（见 invoke_30 贴文） | 0 | PASS（total=69 bare=0） |
| 机检② 值集合全等 | 迁移前 snapshot vs 迁移后 | 0 | PASS（pre==post） |
| 机检③ 撞键=0 | 键级重复断言 | 0 | PASS（dup=0） |
| 机检④ indexes↔flow | 唯一 (path,symbol) 对双向差集 | 0 | PASS（69==69 · 差集空） |
| compile | `./scripts/graph-compile.sh` | 0 | PASS（10 graphs / 112 nodes / 120 edges · check 全 OK） |
| lint | `pnpm lint` | 0 | PASS |
| test | `pnpm test` | 0 | PASS（22 files · 153 tests） |
| build | `pnpm build` | 0 | PASS |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l2_key_unify.md` | 0 | VERIFY: PASS |
| src 零变更 | `git diff --stat -- src/` | — | 空 |

## 验收对照（task 六项全勾选）

- [x] 零裸键 · 条目 69 不变 · 值集合全等（证据进 invoke_30）
- [x] `http` → `src/api/http.ts#http` 且命中 flow=7（R1-N1 校正落实 · 机检实证 7 flow）
- [x] indexes ↔ 9 flow implementedBy 复验 exit 0
- [x] 头注 / README / `01_modules.md` 人签记录更新
- [x] compile 绿 · lint/test/build 回归绿 · src diff 空
- [x] `volatile.md` 短注落盘 · verify PASS

## 结论

**40 自检通过**：纯键形态迁移四断言全 PASS · 全量回归绿 · 范围外零 diff。可交 00 收口（PR 勿 auto-merge · CI 绿后 00 merge）。
