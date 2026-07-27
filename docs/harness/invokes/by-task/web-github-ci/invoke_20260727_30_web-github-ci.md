# Invoke：30 · web-github-ci

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `web-github-ci` |
| task_paths | `docs/tasks/active/task_web_github_ci.md` |
| related_review_or_none | `docs/harness/reviews/task_web_github_ci_audit_R1_20260727.md` |
| git_branch | `task/glayer-phase-gamma-web` |
| created_utc_or_local | 2026-07-27 |

---

## 交付摘要

- `.github/workflows/ci.yml`：pnpm 10.32.1 + Node 24 · lint → test → build
- `.github/workflows/tech-graph.yml`：Python PyYAML + `./scripts/graph-compile.sh`
- 触发：`pull_request` + `push` → `main`
- 无 Secrets；未改 `src/`

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-27 | 补齐 web GitHub CI |
