# Invoke · 40 验收棒 · web-doc-health-sweep（2026-11-04）

## 棒信息

| 字段 | 值 |
|------|-----|
| hat | 40（验收 · lead 亲验） |
| task_slug | `web-doc-health-sweep` |
| 30 交付 | PR [#91](https://github.com/Cyning12/ops-desk-web/pull/91) → squash merge `de3ed60`（CI 2/2 绿） |
| 结论 | **CLOSE · AC-1~7 全绿 · 零阻塞** |

## 40 独立验收实录（PR head 22c9fc1 实跑）

### AC-1 volatile 清扫（`docs/coding_wiki/volatile.md`）

- `grep -c 'CLOSE'` → **0**（原 ≥12 已关账条目全清）
- `grep -c 'active/task_'` → **0**（13 处断链指针清零；文件内唯余 1 处 `docs/tasks/active/` 目录自指注释，属 AC-1 允许的「自身 1 条」空态注记 N1）
- `grep -c 'in_progress'`（volatile + `_views/done.md`）→ **0/0**
- FP-4 前置核验：被清条目指向的 12 个 done 档逐文件 `test -f` 全在位，无独有决策丢失 ✅

### AC-2 Hub 补登（`docs/tasks/done/README.md`）

- 六 slug 逐条 grep 全命中（hitl_approval_page / graph_anchor_profile_fix / approval_overlay_ux / resume_chase_ux / ux_state_sync / resume_expired_mapping）
- 归档行 20 → **26**

### AC-3 `_views/done.md` 断链

- `in_progress.md`（不存在文件）已移除；活指针 `../active/` 在位（grep=1）✅

### AC-4 README 页清单

- 补 Capability / HITL 审批 / LcEvidence / LgRag / Obs 5 页；与 `ls src/views/` 实扫 11 页一致 ✅

### AC-5 by_path 补条（`docs/_tech_graph/l2/indexes/by_path.yaml`）

- HitlApprovalView.vue（node_id=`hitl_view`）/ CapabilityCatalogView.vue（node_id=`capability_view`）——node_id 与 `10_flow_hitl.graph.yaml` / `10_flow_capability.graph.yaml` 的 flow id 逐字对齐（30 曾误写 hitl_approval_view 已核正）
- `./scripts/graph-compile.sh` → **done**（graph.json/shared 正常再生）

### AC-6 CHECKLIST 双指针

- `CHECKLIST_lg_rag_sse_joint_release_v1.md` web/api 双档均指 `tasks/done/`（纠偏注记在档）✅

### AC-7 零 src/ 触碰

- `git diff --name-only 8d46087...HEAD -- src/` → **0 文件** ✅

## 面门复跑（PR head）

- `npx spec-wave task lint` → **PASS** · `npx spec-wave verify` → **PASS**（R3–R5 槽位/审查文机读化/invoke hats/图谱锚点四硬闸齐）
- PR #91 CI：check pass + frontend pass（2/2）

## 非范围复核

⑦⑧ 未动（随 B8）· src/ 零 diff · api 仓零触碰 · legacy 33 笔 Hub 历史缺口维持 40 观察项登记。

## 签认

40 结论：**CLOSE** —— B9 处置口径（00 已定 2026-10-30）①–⑥ 全量落地，维护者可 CLOSE 并归档。关账 PR = active→done 迁档 + 修订表 + Hub 行（本 PR）。
