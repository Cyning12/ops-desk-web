# Task：图谱 × Skill 物理分层 · Phase γ（ops-desk-web）

> **状态**：completed  
> **类型**：图谱 / Skill 试点落盘（无业务功能改码）  
> **关联**：`docs/_tech_graph/` · `docs/skills/` · 对齐 api Phase α

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `glayer-phase-gamma-web` |
| **git_branch** | `task/glayer-phase-gamma-web` |
| **graph_change_layer** | `mixed` |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `tripartite` |
| **skill_refs** | `[s-l0-project-map, s-l1-tech-graph-ops]` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `30` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `./scripts/graph-compile.sh`；文件存在性；`pnpm lint/test/build` 不因图谱搬家而红 |
| **code_quality_bar** | `not_applicable` |
| **experience_capture** | `recommended` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 存量 done · 关账时未启用 WikiTrack（不必回刷为 path） |

### 拍板默认（C1–C4）

| ID | 采用 |
|----|------|
| C1 | `shared/graph.json` 为真值；根目录过渡双写副本 |
| C2 | 闸改指 `l1/01_modules` 后，根 stub **≥1 Epic** 再删 |
| C3 | 「初步完善」= 迁移 DoD + 人签（本 task 仅 web γ） |
| C4 | 本仓先包递归 export；形状稳后再回灌产品 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-PILOT-OPSDESK-GLAYER** | approved | **30** | 维护者已批 api/web 试点；用户 2026-07-27 下令 web 迁移 |
| **HG-GRAPH-MODULES** | approved | **30** | 模块表真值迁至 `l1/01_modules.md`；根 `01_struct.md` stub 保留 |
| HG-TASK-DRAFT | approved | 22-R1 | 计划已确认（Web Tech Graph Phase γ） |
| HG-AUDIT-R1 | approved | 30 | 无业务逻辑改码；仅文档/图谱/脚本 |

---

## 背景与目标

把平铺 `docs/_tech_graph` 升为物理分层（G-L0/G-L1/G-L2），Skill 真值落 `docs/skills`，递归 export 跑通。本仓为 **Phase γ**（api=α 已完成）。

**完成态**：

- [x] `l0|l1|l2|shared` + `LAYER_README`
- [x] `l1/01_modules.md` 为模块真值；根 stub；AGENTS 闸路径已更新
- [x] chat 域 G-L2：`implementedBy` + `l2/indexes`
- [x] `docs/skills` S-L0 + S-L1
- [x] `./scripts/graph-compile.sh` 递归通过；`shared/graph.json` 产出（WEB freeze_id）
- [x] 未改业务 `src/`；未装 CI；未改 api/ios

**不做**：业务 UI 改码；GitHub CI；ios 分层；回灌 cyning-harness；多条非 chat `10_flow_*`

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 |
|---|---|---|
| 仅迁目录未改递归 export | compile 漏图 / 空 json | 是 |
| 闸路径漏改 | 误拒/误放 | 是 |
| R1 文件名未对齐 task stem | `status --check` exit 2 | 是 |

---

## 验收标准

- [x] 存在 `docs/_tech_graph/{l0,l1,l2,shared}` 与 `docs/skills/s-l0-*`、`s-l1-*`
- [x] 模块真值在 `l1/01_modules.md`；`HG-GRAPH-MODULES` 路径已更新
- [x] chat G-L2 indexes 可按 path/symbol 反查
- [x] `./scripts/graph-compile.sh` 绿；`freeze_id` 含 `OPS_DESK_WEB`
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿
- [x] 正文无裸架构义「L0/L1/L2」（目录名与历史引用除外）

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-27 |
| **命令** | `./scripts/graph-compile.sh` → 0；`status --check` → 0；pnpm lint/test(69)/build → 0 |
| **freeze** | `OPS_DESK_WEB_TECH_GRAPH_FREEZE_20260727_V1` · graphs=`00_main`,`10_flow_chat` |
| **下一棒** | commit；push/PR 等人确认；CI 另棒 |
