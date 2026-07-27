# Invoke：30（含 40）· glayer-phase-gamma-web

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `glayer-phase-gamma-web` |
| task_paths | `docs/tasks/active/task_glayer_phase_gamma_web.md` |
| related_review_or_none | `docs/harness/reviews/task_glayer_phase_gamma_web_audit_R1_20260727.md` |
| git_branch | `task/glayer-phase-gamma-web` |
| created_utc_or_local | 2026-07-27 |
| notes | Phase γ：平铺 → l0/l1/l2/shared；对齐 api α；无业务改码；未装 CI |

---

## 可复制 Prompt 快照

```text
Web Tech Graph Phase γ 迁移：物理分层 + 递归 compile + chat G-L2 + docs/skills + AGENTS 闸改指。
```

---

## 交付摘要

- **骨架**：`l0|l1|l2|shared` + `LAYER_README` / `README` / `POINTERS_cross_repo`
- **模块真值**：`l1/01_modules.md`；根 `01_struct.md` stub（C2）
- **chat flow**：`l1/10_flow_chat.graph.yaml` + `l2/indexes/{by_path,by_symbol}.yaml`
- **脚本**：递归 `graph-compile.sh` / `graph_yaml_to_json.py`；`freeze_id=OPS_DESK_WEB_TECH_GRAPH_FREEZE_20260727_V1`
- **compile**：exit 0 · OK `00_main` · OK `10_flow_chat` · 2 graphs / 23 nodes / 24 edges
- **闸**：AGENTS `HG-GRAPH-MODULES` → `l1/01_modules.md`；FRAGMENT overlay 同步
- **skills**：`docs/skills` S-L0 + S-L1；`.claude/skills/ops-desk-tech-graph.md` 已刷新
- **业务三件套**：lint/test(69)/build 全绿
- **status --check**：exit 0（R1 齐）
- **下一棒**：维护者审 commit；push/PR 等人确认；CI 另棒

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-27 | Phase γ 物理分层落地 + 自检 |
