# Invoke：10-task · web-integration-regression（补录）

> **补录声明**：本文件为 2026-10-12 补录（spec-wave 3.3.0 pre-30 invoke 机检口径对齐 · `required_invoke_hats=10,20,30,40` 须 10/20 落盘）。所记事件均真实发生于 2026-10-11（commit / 审查文 / PR 在案可查），**非事后编造审查行为**——事实锚点逐项可经 git log / gh pr 核验。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-integration-regression` |
| freeze_id | `web-integration-v0`（只消费 · 本帽零代码改动） |
| git_branch | `task/web-integration-task-drafts`（三 task 同棒起草） |
| created_utc_or_local | 2026-10-11（事件日）· 2026-10-12（补录日） |
| 执行体 | web 00 委派子 Agent ee9d1653 |

---

## 10 起草实录

- **任务**：T-W1 联调回归批（F1/F4/F6/F7 四面已接通功能的权威回归验收 + role 菜单核对 + 契约对拍），对照 SPEC-web-integration_v0 §4/§9 拆 task。

- **产物**：`docs/tasks/active/task_web_integration_regression.md`（commit 8f76d5f · 随 PR #58 合入 main）
- **自检**：`npx spec-wave task lint` → **LINT: PASS**（task 文内自检行在案 · 后由 20 审查独立重跑复核一致）
- **闸态**：HG-TASK-DRAFT=**approved**（2026-10-11 维护者令联调链执行 · 00 代录）；HG-AUDIT-R1=**pending**（维持 · 待人签 · 未伪造 pre-approval）；HG-GRAPH-MODULES=approved（00 代录 · 回归批零图谱改动 · graph_change_layer=n/a）
- **后续**：草稿交付 20-task-audit R1 书面审查（见同目录 invoke_20261011_20_web-integration-regression.md）
