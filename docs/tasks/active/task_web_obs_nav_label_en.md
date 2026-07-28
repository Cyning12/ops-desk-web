# Task：过程观测侧栏文案英文化（与导航风格对齐）

> **状态**：completed  
> **类型**：文案 / UX 一致性（无逻辑变更）  
> **关联**：`task_web_obs_status_consumer`（P3b 已 merge）  
> **00 统筹**：维护者指示 — 侧栏「过程观测」改英文，便于观测对照；PR 过 CI 后 merge；生产一般只重构建前端
> **合入**：PR #5 · `76e5966` · 2026-07-28

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-obs-nav-label-en` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 无行为变更；`pnpm lint` / `pnpm test` / `pnpm build`；可选抽查侧栏文案 |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task · 文案-only |
| **git_branch** | `task/web-obs-nav-label-en` |
| **graph_change_layer** | `none` |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `tripartite` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `skip` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：无模块/路由结构变更；仅文案 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者 2026-07-28：侧栏英文化 + PR merge |
| **HG-AUDIT-R1** | approved | **30** | 见 `docs/harness/reviews/task_web_obs_nav_label_en_audit_R1_20260728.md`；维护者同指令代签开工 |

---

## 背景与目标

侧栏其余项均为英文（Overview / Issues / Pulls / Graph / Chat），「过程观测」为中文，观测对照时不一致。  
改为 **Observability**（顶栏 `route.meta.title` 同步），与侧栏单词语风格对齐。

### 完成态

- [x] `AppLayout` 侧栏 `/obs` 文案为 `Observability`
- [x] `router` `meta.title` 同步为 `Observability`（顶栏一致）
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿
- [x] PR → CI 绿 → merge `main`
- [x] 通知维护者验收（生产：前端 `pnpm build` + 仅同步 `dist`，一般 `--skip-api`）

### 非范围

- Obs 页内中文说明/告警文案（页内可读性保持）
- 自动部署 GHA
- api / 图谱结构变更

## 失败路径

| 触发 | 系统行为 | 可重试 |
|---|---|---|
| CI 红 | 不 merge；修后重推 | 是 |
| 文案拼写争议 | 以本 task「Observability」为准，另开 follow-up | — |

## 部署备注

合入 `main` 后生产更新：**仅前端重新构建并 rsync `dist/`**（`deploy.sh --skip-api`），无需重建 api 容器。
