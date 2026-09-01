# Invoke：40-self-check · web-graph-l1-flow-pages

> **用途**：40 自检留痕（与 30 同上下文跑闸 · 不通过则改码重跑 · 本波一次通过）。  
> **前置**：30 交付完成（见同目录 `invoke_20260831_30_*`）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-graph-l1-flow-pages` |
| git_branch | `task/web-graph-l1-flow-pages` |
| created_utc_or_local | 2026-08-31 |

---

## 自检执行（命令实跑 · 退出码实测）

| # | 闸 | 命令 | 退出码 | 结论 |
|---|---|---|---|---|
| 1 | compile | `./scripts/graph-compile.sh` | 0 | 9 个 l1 flow yaml→.md 全生成 · graph check 10 图全 OK · graph.json 双写再生成（10 graphs / 112 nodes / 120 edges） |
| 2 | lint | `pnpm lint` | 0 | 绿 |
| 3 | test | `pnpm test` | 0 | 绿 |
| 4 | build | `pnpm build` | 0 | 绿（`pnpm lint && pnpm test && pnpm build` 链 FINAL_EXIT=0） |
| 5 | verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_pages.md` | 0 | VERIFY: PASS（30 改码前 + 改码后各一次均 PASS） |
| 6 | 机检 | python3 yaml 断言（/tmp/check_graph_p1b.py） | 0 | ALL ASSERTIONS PASS：57 implementedBy 符号 src 实证 · by_path/by_symbol ↔ 7 flow 一一对应 · 51 复合键零撞键 · 18 裸键不迁移 · 无重复键 |
| 7 | src 零变更 | `git diff main --stat -- src/` | 0（无输出） | 纯图谱波断言成立 |
| 8 | 范围守护 | git status 审查 | — | 变更仅限 `docs/_tech_graph/` + `docs/coding_wiki/volatile.md` + task/invoke 文档；`.codex/` 未跟踪未 add；l0/scripts/CI 未动 |

## 验收标准逐项核对（task §验收标准）

- [x] 7 flow yaml 新建 · 实证链节点/边齐 · 页级旁注 · compile 生成 .md ✅（闸 1）
- [x] implementedBy 符号 src 真实存在（逐符号断言 · 证据清单在 invoke_30）✅（闸 6）
- [x] l2 indexes 7 域 ↔ flow 一一对应 · by_symbol 51 复合键撞键=0 ✅（闸 6）
- [x] 01_modules 关联节 7 链接 + 人签 · l2 README 覆盖域更正 ✅（git diff 核对）
- [x] graph-compile.sh 绿 · graph.json 双写再生成 ✅（闸 1）
- [x] lint/test/build 回归绿 · src 零 diff ✅（闸 2/3/4/7）
- [x] volatile.md 短注落盘 · verify PASS ✅（闸 5）

## 结论

40 自检 **通过**（8/8 闸绿 · 无返工轮次）。task `### 自检结论` 与验收勾选已回填；修订记录已追加 30/40 行。可交 00 收口：PR 勿 auto-merge · CI（含 tech-graph）绿后 00 merge。
