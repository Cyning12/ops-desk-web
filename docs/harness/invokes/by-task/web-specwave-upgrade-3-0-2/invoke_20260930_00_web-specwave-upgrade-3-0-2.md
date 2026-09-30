# Invoke：00 · web-specwave-upgrade-3-0-2（统筹签收 + 派工）

| 字段 | 值 |
|------|-----|
| hat | 00 |
| task_slug | `web-specwave-upgrade-3-0-2` |
| related_review | `docs/harness/reviews/task_web_specwave_upgrade_3_0_2_audit_R1_20260930.md` |
| git_branch | `task/web-specwave-3-0-2` |
| started_at | 2026-09-30 |

## 00 裁定

> 「更新specwave到最新版本」（web + workspace）  
> 「签收当前task，后续过程文档授权00签收，完成后PR 通过CI后merge，最后CLOSE」

| 项 | 结论 |
|----|------|
| 目标钉 | `spec-wave@3.0.2`（自 3.0.0） |
| hooks 物化 | **不入库**（删 `.cursor/hooks.json` · 还原 Claude PreToolUse hook-guard） |
| schema v2 | 不强制 |
| 范围 | 本仓 + ops-desk-workspace；**api 不在本波** |

### 闸复签

| human_gate_id | status | 依据 |
|---------------|--------|------|
| HG-GRAPH-MODULES | approved | 过程轨 · 不改业务模块边界 |
| HG-TASK-DRAFT | approved | 00 本窗授权 |
| HG-AUDIT-R1 | approved | R1 PASS-with-conditions（内容零阻塞）· 00 授权签收 |

### G-1 闸序倒置留痕（诚实口径）

30 先于 20-R1 执行完毕、`verify --task` 曾 BLOCKED(exit 2) 属实。R1 **不追认**既成实现；00 依二次授权签收并承担该判认：本波为过程轨 patch 热修（依赖钉版 + 文档字面 + 图谱戳），`src/` / `tests/` 零改动，业务污染面为零。该倒置不得成为先例。

### R1 缺口闭合

| ID | 处置 |
|----|------|
| G-1 | 留痕（上表）· 00 判认 |
| G-2 | 闭合：本 invoke 目录落 00 + 30 |
| G-3 | 闭合：`test_strategy_note` / 自检结论 补 `verify --task` |
| G-4 | 判据泛化至三宿主；`.codex/hooks.json`（2026-09-18 他波遗留）不提交 · 不删除 |
| G-6 | 闭合：新文档 0644 |

## 派工板

| 序 | 帽 | 工作包 | 状态 |
|----|----|--------|------|
| 1 | 30 | 钉版/upgrade/字面/host update（无 hooks）/验收/FEEDBACK | done |
| 2 | 20 | R1 审查文 | done |
| 3 | 00 | 闸复签 + R1 缺口闭合 + invoke 落盘 | **本窗** |
| 4 | 00 | push + PR | **本窗** |
| 5 | 00 | CI 绿 → merge | **本窗**（00 代维护者执行 · 授权「通过CI后merge」） |
| 6 | 00 | CLOSE（归档 active→done + done/README 索引 + KPI） | merge 后 |
