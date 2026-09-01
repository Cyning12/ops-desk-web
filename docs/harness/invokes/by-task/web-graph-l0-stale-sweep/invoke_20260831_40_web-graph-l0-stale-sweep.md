# Invoke：40-self-check · web-graph-l0-stale-sweep

> **用途**：40 自检留痕；web PR 前最后自动闸。纯图谱波 · HG-JOINT-DEBUG n/a · 无人工待签闸。  
> **下一步（人工）**：CI 绿后由 00 抽查收口 merge（**勿 auto-merge**）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-graph-l0-stale-sweep` |
| git_branch | `task/web-graph-l0-stale-sweep` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31 · 同上下文执行）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat · shared+root graph.json 双写再生成（33 nodes / 37 edges） |
| lint | `pnpm lint` | 0 | ✅ eslint 全仓无告警 |
| test | `pnpm test` | 0 | ✅ 22 files / 153 tests passed（src 零变更 · 全量回归） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l0_stale_sweep.md` | 0 | ✅ VERIFY: PASS |

## grep / diff 断言（验收机检项）

| 断言 | 命令 | 结果 |
|---|---|---|
| l0 无 `chat/stream` | `grep -n 'chat/stream' docs/_tech_graph/l0/00_main.graph.yaml` | exit 1（零命中 = 通过）✓ |
| 边 label 对齐 | `grep 'lg-rag/stream' l0/00_main.graph.yaml + 00_main.md` | `POST /api/ops/lg-rag/stream` 命中（yaml 边 + md 图/表）✓ |
| 7 新页节点 + includes 边 | `grep 'login_page\|overview_page\|issues_page\|pulls_page\|graph_page\|lc_evidence_page\|lg_rag_page' l0 yaml` | 7 节点 + 7 includes 边 + lg_rag_page→api_client 调用边齐 ✓ |
| version | yaml L5 | `2026-08-31` ✓ |
| src 零变更 | `git diff main --stat -- src/` | 空输出（exit 0）✓ |
| l1/l2 零越界 | `git diff main --stat` | 变更面仅 l0 yaml/md + 双写 graph.json + task/wiki/invoke ✓ |

## 验收勾选口径

- 8 项验收全勾：机检 6 条由上表 grep/diff 断言 + 五闸承载；graph.json 时间戳 diff 行属 R1-N4 正常产物噪声（验收第 7 条明示不算缺口）；`volatile.md` 短注已落盘 + verify PASS。
- 全部人工闸 approved / n/a，无待签闸；PR 勿 auto-merge，CI（含 tech-graph）绿后 00 收口。

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31（维护者令「提前签收task」授权） |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸 · 不新增一级模块） |
| HG-AUDIT-R1 | approved | web 00 即签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| HG-JOINT-DEBUG | n/a | 纯图谱波 · 无跨仓联调 |

## 遗留（非阻塞）

1. `graph.json` 双写维持现状（收敛属 SPEC P3 · 本波不动）。
2. `01_modules.md` pages 行未含 Obs（R1-N3 勘误 · 留 SPEC P1 补）。
3. G-L1 flow 补全（`10_flow_lg_rag` 优先）/ G-L2 indexes 扩展归 SPEC P1/P2 后续 task。
4. T6 invoke_40 遗留第 2 条（l0 L111 chat/stream 脱节）已由本 task 清除 ✔。
