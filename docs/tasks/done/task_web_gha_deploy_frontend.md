# Task：合入 main 后 GHA 自动部署前端 dist

> **状态**：CLOSE  
> **类型**：CI/CD（workflow + 文档；不改业务 src）  
> **关联**：手动 `deploy.sh --skip-api` 仍保留作应急；本棒只加 GitHub Actions 前端通道  
> **合入**：PR #8 · `686cfda` · 2026-07-28  
> **生产验收**：2026-07-28 维护者确认生产已正确更新 · deploy-web run `30324158818`  
> **关账**：CLOSE · 迁入 `docs/tasks/done/`

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-gha-deploy-frontend` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | 无强制改测；`pnpm lint`/`test`/`build` 由现有 `ci.yml` 覆盖；deploy job 缺 Secrets 时失败信息须可读 |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task · graph none |
| **git_branch** | `task/web-gha-deploy-frontend` |
| **graph_change_layer** | `none` |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `skip` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：无模块/图谱变更；仅 workflow + docs |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者计划确认：合入 main 后自动部署前端 |
| **HG-AUDIT-R1** | approved | **30** | 见 `docs/harness/reviews/task_web_gha_deploy_frontend_audit_R1_20260728.md` |

---

## 背景与目标

生产前端此前靠本地 `pnpm build` + `ops-desk-workspace/deploy/deploy.sh` rsync。  
需求：任意变更合入 `main` 后，由 GHA **自动构建并只同步** `/opt/ops-desk/web/dist`，**不**重建 API/compose。

### 完成态

- [x] `.github/workflows/deploy-web.yml`：`push`→`main` + `workflow_dispatch`
- [x] Job：pnpm/node 对齐 `ci.yml` → install → build → rsync `dist/`（部署前备份旧 dist）
- [x] Secrets：`DEPLOY_HOST` · `DEPLOY_USER` · `DEPLOY_SSH_KEY`（可选 `DEPLOY_PATH`）— 文档已交付；维护者配齐前 job 会红
- [x] `docs/deployment/gha-frontend-deploy.md` + README 指针
- [x] PR → CI 绿 → merge `main`
- [x] 交付维护者 Secrets / 无口令 deploy key 操作清单（Agent 不写私钥入仓）

### 非范围

- API / docker compose 自动部署
- 使用带 passphrase 的本机 lighthouse 私钥
- 改 Nginx
- `archive-completed-tasks` 卫生棒

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| Secrets 未配 | deploy job 失败并提示缺哪项 | 是（配齐后 re-run / dispatch） |
| SSH 拒连 | job 红；检查 authorized_keys / 安全组 | 是 |
| rsync 权限 | job 红；确认远端目录属主 | 是 |

## 部署备注

合入后 **首次** 需维护者配齐 Secrets 与 GHA 专用无口令 key，再用 `workflow_dispatch` 验收。

## 关账

- 维护者 2026-07-28：生产站已确认更新正确。
- GHA 公钥已写入服务器 `authorized_keys`（`ops-desk-web-gha-deploy`）。
- 后续合入 `main` 自动部署前端；应急仍可用 `deploy.sh --skip-api`。
