# Invoke：40-self-check · web-graph-l1-flow-lg-rag

> **用途**：40 自检留痕（与 30 同上下文闭环 · 命令实跑 · 不通过则改码重跑）。  
> **对象**：30 交付（见 `invoke_20260831_30_web-graph-l1-flow-lg-rag.md`）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-graph-l1-flow-lg-rag` |
| git_branch | `task/web-graph-l1-flow-lg-rag` |
| created_utc_or_local | 2026-08-31 |

## 自检命令（实跑 · 退出码）

| # | 闸 | 命令 | 退出码 | 结论 |
|---|---|---|---|---|
| 1 | compile | `./scripts/graph-compile.sh` | 0 | `10_flow_lg_rag.md` 生成 · check OK ×3（00_main / 10_flow_chat / 10_flow_lg_rag）· graph.json 双写再生成（3 graphs / 44 nodes / 49 edges · 时间戳 diff 容忍 R1-N5） |
| 2 | lint | `pnpm lint` | 0 | 绿（eslint 无输出） |
| 3 | test | `pnpm test` | 0 | 绿（Vitest 全量通过） |
| 4 | build | `pnpm build` | 0 | 绿（✓ built in 2.08s） |
| 5 | verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l1_flow_lg_rag.md` | 0 | **VERIFY: PASS** |
| 6 | src 零 diff | `git diff main --stat -- src/` | 0（无输出） | 空断言成立（纯图谱波） |

## 验收逐项复核（对照 task 验收 7 条）

| # | 验收条 | 复核手段 | 结论 |
|---|---|---|---|
| 1 | flow 实证链节点/边齐 + 旁注 | yaml 解析：11 节点 13 边 · user→LgRagView→store→invokeLgRag→http→端点→ops_api 链贯 · description 含 refuse=200 / 非流式 / thread_id 回填 / mode 三档 / 超时 300s | ✅ |
| 2 | implementedBy 符号 src 真实存在 | grep 逐符号：9/9 命中（LgRagView 走 router import 文件约定 · 与 ChatView 先例同型） | ✅ |
| 3 | indexes 与 flow implementedBy 一一对应 | python3 yaml 双向集合比对：by_path / by_symbol lg_rag 域各 9 条 == flow 9 条 · exit 0 | ✅ |
| 4 | 01_modules 三断言 | grep：pages 行含 Obs · 关联节含 `10_flow_lg_rag.md` · 人签记录含本 task 行 | ✅ |
| 5 | compile 绿 + 产物 | 见 #1 · `10_flow_lg_rag.md` 新生成 · graph.json 双写 diff 仅新增 lg_rag 图 + 时间戳行 | ✅ |
| 6 | pnpm 回归绿 + src 零 diff | 见 #2–#4 · #6 | ✅ |
| 7 | volatile 短注 + verify PASS | volatile.md 本 task 短注已落 · 见 #5 | ✅ |

## 范围红线复核

- 未改 `src/**` / `l0/` / `scripts/` / `.github/`；未动其余页 flow、其余域 indexes；无双写收敛（P3）；commit 仅 add 本 task 路径（禁 `git add -A` · `.codex/` 未跟踪未 add）。
- R1 内决留痕：N3（同文件多域分段 + graph_ids 列表）· N6（裸符号键维持 · 撞键再改复合键）已记 invoke_30 与 task 修订记录。

## 结论

**40 自检 PASS**：五闸退出码全 0 · 验收 7 条全勾（task `### 自检结论` 已回填同表）· 范围红线零越界。可交 00 收口（PR 勿 auto-merge · CI 绿后 00 merge）。
