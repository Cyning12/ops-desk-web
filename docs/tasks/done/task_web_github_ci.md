# Task：补齐 GitHub CI（web）

> **状态**：completed  
> **类型**：基础设施（CI）  
> **关联**：`.github/workflows/` · AGENTS Verify 表 · Phase γ 图谱

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-github-ci` |
| **git_branch** | `task/glayer-phase-gamma-web`（同窗落地；与 γ 一并 PR） |
| **graph_change_layer** | `none` |
| **review_hat** | `20` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | workflow 命令与本地一致：`pnpm lint` / `pnpm test` / `pnpm build`；另 job `./scripts/graph-compile.sh` |
| **code_quality_bar** | `not_applicable` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 不改模块边界；仅加 CI |
| HG-TASK-DRAFT | approved | 22-R1 | 用户明示「CI 还是需要的」 |
| **HG-AUDIT-R1** | approved | **30** | 无业务 `src/` 改码 |

---

## 背景与目标

`AGENTS.md` Verify 表要求与 `.github/workflows/` 一致，但本仓此前无 workflow。补齐 PR/push 必绿：前端三件套 + 图谱 compile。

**完成态**：

- [x] `.github/workflows/ci.yml`：pnpm lint → test → build
- [x] `.github/workflows/tech-graph.yml`：`./scripts/graph-compile.sh`
- [x] 触发：`pull_request` + `push` to `main`
- [x] 无 Secrets / 无业务改码

**不做**：强制 pre-commit hook；改业务 `src/`；改 api CI

---

## 验收标准

- [x] workflow 文件存在且命令与本地一致
- [x] 本地 `pnpm lint/test/build` 与 `./scripts/graph-compile.sh` 仍绿（本棒已验证过）
- [x] invoke + commit

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-27 |
| **结果** | `ci.yml` + `tech-graph.yml` 已落盘；`status --check` 绿；同分支 commit |
