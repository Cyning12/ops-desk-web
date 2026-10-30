# Invoke：web_graph_anchor_profile_fix · 10-task 起草/回填（2026-10-30）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10-task |
| **task** | `docs/tasks/active/task_web_graph_anchor_profile_fix.md` |
| **分支 / HEAD** | `task/web-graph-anchor-profile-fix`（30 开工才切 · 本棒落稿于 main 态 · 闸代录 commit d8c031c 时分支已切） |
| **来源** | 00 派单（2026-10-30）：3.5.0 升级棒遗留 G-1（图谱锚点闸恒 dormant）承接 · 授权锚 m00500 |
| **cwd** | `ops-desk-web` |

## 落稿 / 回填链

| 版本 | 动作 |
|------|------|
| v0.1 | 10 落稿：升级棒实证钉案（R1 审查 G-1 + FEEDBACK 摩擦点 1）+ 亲读 `node_modules/spec-wave/lib/checks/graph-anchor.js` 复核（probeGraphAnchor isDirectory 硬要求 · 词表节 RE `## 1. 模块边界表` · 面A/面B 判定链）· 范围四项 + D1–D7 定夺 + 验收 1–8 + FP-1–FP-7 + R0–R5 early_stop |
| v0.2 | 闸代录：HG-TASK-DRAFT pending→approved（00 代录 · 授权锚 m00500）· commit 78fdda3 |
| v0.3 | R1 退回回填：审查文 `docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md` 之 B-1（drift 输入随迁 `.spec-wave/graph-drift.yaml:4` struct_rel→`l1/01_struct.md` · 01_struct 节双兼容列形+单表约束）+ B-2（l0 三处引用随迁改 label 直指 `docs/_tech_graph/l1/01_struct.md` 写死 D3）+ NIT×6 全采纳 · commit c8b2546 |
| R2 | 复审通过零阻塞：审查文 `docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R2_20261030.md` |
| v0.4 | 闸代录：HG-AUDIT-R1 + HG-GRAPH-MODULES pending→approved（00 代录 · 授权锚 m00500 · 本 invoke 补落 hats:10 后 verify 复核）· commit d8c031c |

## 亲读核真锚点（10 已读）

- `node_modules/spec-wave/lib/checks/graph-anchor.js` 全文件（probeGraphAnchor :13-41 · extractGraphAnchorModuleVocab :54-88 · judgeGraphAnchor :214-248）
- `docs/_tech_graph/01_struct.md`（根 stub 8 行 · 无词表节）· `docs/_tech_graph/l1/01_modules.md`（节名 `## 模块表（必填）` 不匹配 RE · 迁移源 8 模块）
- `.coding-kit/profile.json:5` · `.cyning-harness/profile.json:5`（双 profile 同值 `l1/01_modules`）
- `docs/harness/reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md`（G-1）· `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md`（摩擦点 1）

## 图谱锚点引用（D5 面B 义务 · 本 task 生效后首件活体过闸）

- 词表源归位目标：`docs/_tech_graph/l1/01_struct.md`（`## 1. 模块边界表` 节 · 8 模块：entry/router/pages/components/api/pinia/capability/styles）
- `01_modules.md` 指针化 · l0 引用随迁（`l0/00_main.graph.yaml:85` · `l0/00_main.md:34,93`）· flow yaml（`10_flow_*`）零改动

## 闸状态（起草时 → v0.4）

| 闸 | 起草时 | v0.4 |
|----|--------|------|
| HG-TASK-DRAFT | pending | approved（v0.2 代录 · m00500） |
| HG-AUDIT-R1 | pending（不代签原则 · 后被 m00500 授权覆盖） | approved（v0.4 代录 · R1→v0.3→R2 零阻塞） |
| HG-GRAPH-MODULES | pending | approved（v0.4 代录 · 闸路径随迁入范围/D2/D3） |

## 机检

```text
npx spec-wave task lint --file docs/tasks/active/task_web_graph_anchor_profile_fix.md
→ LINT: PASS · EXIT=0（2026-10-30 · v0.4 态）
```

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-30 | 10 落稿 v0.1（未 commit 于起草时）→ 本 invoke 于 v0.4 闸代录后补落（verify 卡 missing pre-30 invoke hats:10 · 按 task 棒指令补落简述落稿/回填链） |
