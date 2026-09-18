# Invoke：00 · web-specwave-upgrade-2-4-2（统筹签收 + 派工）

| 字段 | 值 |
|------|-----|
| hat | 00 |
| task_slug | `web-specwave-upgrade-2-4-2` |
| task_paths | `docs/tasks/active/task_web_specwave_upgrade_2_4_2.md` |
| related_review | `docs/harness/reviews/task_web_specwave_upgrade_2_4_2_audit_R1_20260918.md` |
| git_branch | `task/web-specwave-2-4-2` @ `22b921f` |
| started_at | 2026-09-18 |

## 00 裁定（维护者本窗口述）

> 「身为00，授权签收所有过程文档，先升级到2.4.2，开始统筹派工」

| 裁定项 | 结论 |
|--------|------|
| Wave A 目标钉 | **`spec-wave@2.4.2`**（对齐 ops-desk-api 当前态） |
| Wave B（3.0.0） | **本波不做** · 已 `git reset` 撤掉超前 3.0.0 提交（未 push）· 待 api FEEDBACK 或另开 task |
| 过程文档签收 | 下列文件 **00 授权签收**（等同维护者签闸） |

### 签收清单

| 文档 | 状态 |
|------|------|
| `docs/tasks/active/task_web_specwave_upgrade_2_4_2.md` | 签收 · 闸表 approved 有效 |
| `docs/harness/reviews/task_web_specwave_upgrade_2_4_2_audit_R1_20260918.md` | 签收 · R1 PASS 有效 |
| `docs/harness/invokes/by-task/web-specwave-upgrade-2-4-2/invoke_20260918_30_*.md` | 签收 · 30 已执行 |
| `docs/spec/doc-health/feedback/2026-09-18_2.4.2_web_upgrade.md` | 签收 |

### 人工闸（00 复签）

| human_gate_id | status | 说明 |
|---------------|--------|------|
| HG-GRAPH-MODULES | approved | 过程轨 · 不改业务模块 |
| HG-TASK-DRAFT | approved | 00 本窗复签 2026-09-18 |
| HG-AUDIT-R1 | approved | R1 PASS · 00 本窗复签 2026-09-18 |

## 仓态核验（00）

| 项 | 结果 |
|----|------|
| `pnpm exec spec-wave --version` | 2.4.2 |
| `.coding-kit/manifest.json` | version=2.4.2 · from_version=1.10.0 |
| `verify --task` | PASS |
| `check` | 已是最新 |
| 活面 `npx dsh-coding-kit` | 零命中 |
| 根级裸 SPEC | 已迁夹 |
| HEAD | `22b921f`（Wave A）；3.0.0 提交已撤 |

## 派工板

| 序 | 帽 | 工作包 | 状态 | 产出 |
|----|----|--------|------|------|
| 1 | 10/20 | task + R1 | **done** | active task · R1 审查文 |
| 2 | 30 | 钉版/upgrade/字面/sync/SPEC 迁夹/FEEDBACK | **done** | commit `22b921f` |
| 3 | 40 | 自检回填（随 30） | **done** | task 验收勾选 |
| 4 | 00/维护者 | push + PR（`close_pr_policy=required`） | **本窗派 · 执行中** | PR URL |
| 5 | 00 | merge 后 `task close --yes` | pending | done/ |
| 6 | — | Wave B → 3.0.0 | **deferred** | 另 task · 等 api |

## 禁派

- 本波 **禁止** 再钉 / upgrade 到 3.0.0
- 禁止改 Vue/SSE 业务码
- 禁止 `--force` 冲 `HG-GRAPH-MODULES` 定制行
