# Invoke：30 · web-specwave-upgrade-3-0-2

| 字段 | 值 |
|------|-----|
| hat | 30 |
| task_slug | `web-specwave-upgrade-3-0-2` |
| related_review | `docs/harness/reviews/task_web_specwave_upgrade_3_0_2_audit_R1_20260930.md` |
| git_branch | `task/web-specwave-3-0-2` |
| started_at | 2026-09-30 |

## GATE_VERIFY

| human_gate_id | status | evidence |
|---------------|--------|----------|
| HG-GRAPH-MODULES | approved | task 表 · 00 签收 |
| HG-TASK-DRAFT | approved | task 表 · 00「更新specwave到最新版本」 |
| HG-AUDIT-R1 | approved | R1 PASS-with-conditions · 00 二次授权签收 |

结论：**30 开工前置齐备**（本波 30 实为先行执行 · 闸序倒置已由 00 留痕判认 · 见 00 invoke G-1 节）

## 30 落地面（实际执行）

| 项 | 结果 |
|----|------|
| 钉版 | `package.json` + `pnpm-lock.yaml` → `spec-wave@3.0.2` |
| upgrade | `3.0.0 → 3.0.2` · manifest `from_version=3.0.0` |
| host update | PASS · `kit_semver=3.0.2` · 新增 `table_source.kind=builtin` |
| hooks | **不入库**：删 `.cursor/hooks.json` · 还原 `.claude/settings.json` PreToolUse 段 |
| sync prompts | 9 skip · 3 conflict · 手合 `TASK_TEMPLATE.md` 1 hunk · 保留 `HG-GRAPH-MODULES` |
| 钉版字面 | `scripts/graph-compile.sh` · `docs/coding_wiki/README.md` · `docs/coding_wiki/topics/wikilinks_export.md` · RUNBOOK 历史行 |
| 验收 | `check` / `verify --task` / `pins check --consumer` / graph-compile / `pnpm lint|test|build` 全绿（179 tests） |
| FEEDBACK | `docs/spec/doc-health/feedback/2026-09-30_3.0.2_web_upgrade.md` |

**业务源码改动：零**（`src/` / `tests/` 未触碰）。
