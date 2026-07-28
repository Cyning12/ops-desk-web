# Task：归档 active/ 中已完成任务（web）

> **状态**：completed  
> **类型**：仓库卫生（docs-only）  
> **关联**：00 统筹 `../ops-desk-workspace/docs/05-plan/03-post-go-live-hygiene-orchestration.md` 棒 B

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `archive-completed-tasks` |
| **git_branch** | `task/archive-completed-tasks` |
| **graph_change_layer** | `none` |
| **review_hat** | `20` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 无强制 `pnpm test`；核对 active 清单与 done 路径 |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 00 统筹棒 B；00 代签双闸 |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅 task/Prompt 搬家与状态字；不改 src |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者 2026-07-28：先收尾 |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：docs-only |

---

## 背景与目标

`docs/tasks/active/` 残留多份已合入/已完成条目，干扰新会话扫描。

**须归档到 `done/`（或等价目录）**：

| 文件 | 处置 |
|---|---|
| `TASK_epic_web_frontend_v1.md` | → done；状态已 completed |
| `task_glayer_phase_gamma_web.md` | → done |
| `task_harness_upgrade_2_16_1.md` | → done |
| `task_web_github_ci.md` | → done |
| `task_web_obs_status_consumer.md` | → done |
| `task_web_obs_nav_label_en.md` | 标 **completed**（PR #5 MERGED）→ done |
| `PROMPT_epic_web_frontend_kickoff.md` | → done 或 `docs/tasks/archive/prompts/`（二选一，优先 done） |
| `PROMPT_web_prod_e2e.md` | 同上（历史 kickoff，非进行中） |

**完成态**：

- [x] 分支 `task/archive-completed-tasks` 基于最新 `main`
- [x] 上表文件离开 `active/`
- [x] `active/` 为空，或仅留本 task + 其 30 Prompt（合入前）
- [x] commit → push → PR

**不做**：改 `src/`、重跑 E2E、删远程分支（已净）、改生产配置

---

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| done 下重名 | 保留较完整版本或加日期后缀，记入自检 | 是 |
| active 仍有未完成项 | 停手报告，不误搬 | 人判 |

---

## 验收标准

- [x] `docs/tasks/active/` 无上表 completed/历史 Prompt
- [x] `web-obs-nav-label-en` 正文状态为 completed
- [x] 未改业务源码

---

## 30/40 自检（合入前）

| 项 | 结果 |
|---|---|
| 表内 8 文件 | 已 `git mv` → `docs/tasks/done/` |
| `task_web_obs_nav_label_en` | 正文已是 `completed`（PR #5）；未改状态字 |
| 表外扫描 | `task_web_gha_deploy_frontend.md` **已在** `done/`；active 无其它 completed |
| done 重名 | 无冲突 |
| 未完成项误搬 | 无（仅搬 completed / 历史 Prompt） |
| src / CI / 图谱正文 | 未改 |

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-28 |
| **合入** | PR [#11](https://github.com/Cyning12/ops-desk-web/pull/11) · `74e5826` · MERGED |
| **verify** | `VERIFY: PASS`（active 开工 + done 合入前） |
| **CI** | `frontend` / `tech-graph check` 全绿后 merge |
| **active/** | 空 |
| **摩擦** | 本棒合入前已迁 `done/`；`task close` 拒绝对 done 二次 close（预期） |
| **下一棒** | CLOSE 关账完成；棒 C 在 workspace |

### KPI

| 指标 | 分 / 值 | 说明 |
|---|---|---|
| 清单闭环 | 10/10 | 表内 8 + 本 task/PROMPT 均离 active |
| 误搬风险 | 0 | 未完成项零误搬 |
| 范围纪律 | 10/10 | 无 src / CI / 图谱正文改动 |
| 合入质量 | PASS | CI 绿 · squash/merge 干净 |
