# GitHub Actions · 前端自动部署（合入 main）

> **日期**：2026-07-28  
> **Workflow**：`.github/workflows/deploy-web.yml`  
> **范围**：仅 `pnpm build` + rsync `dist/` → 服务器；**不**重启 API / Docker Compose  
> **手动应急**：`ops-desk-workspace/deploy/deploy.sh --skip-api`  
> **生产验收**：2026-07-28 通过（run `30324158818`）

---

## 触发

| 事件 | 行为 |
|---|---|
| `push` → `main`（含 PR merge） | 自动构建并部署前端 |
| `workflow_dispatch` | Actions 页手动重跑部署 |

校验（lint/test/build）仍由 `.github/workflows/ci.yml` 负责；本 workflow 为发版通道。

---

## 所需 GitHub Secrets

在仓库 **Settings → Secrets and variables → Actions** 添加：

| Secret | 示例 / 说明 |
|---|---|
| `DEPLOY_HOST` | 服务器公网 IP 或域名 |
| `DEPLOY_USER` | SSH 用户（现网常用 `ubuntu`） |
| `DEPLOY_SSH_KEY` | **无口令** ed25519 私钥全文（含 `-----BEGIN…-----`） |
| `DEPLOY_PATH`（可选） | 默认 `/opt/ops-desk/web/dist` |

本机带 passphrase 的 lighthouse 私钥 **不能**直接给 Actions。

---

## 一次性：生成 GHA 专用密钥并上服务器

在维护者本机执行（路径可自定）：

```bash
ssh-keygen -t ed25519 -N "" -f ~/.ssh/ops-desk-gha-deploy -C "ops-desk-web-gha-deploy"

# 将公钥追加到服务器 ubuntu 的 authorized_keys
ssh ops-desk 'mkdir -p ~/.ssh && chmod 700 ~/.ssh'
ssh-copy-id -i ~/.ssh/ops-desk-gha-deploy.pub ops-desk
# 或：手动 cat ~/.ssh/ops-desk-gha-deploy.pub 后追加到服务器 ~/.ssh/authorized_keys
```

写入 Secrets（勿把私钥 commit 进 git）：

```bash
cd /path/to/ops-desk-web
gh secret set DEPLOY_HOST --body "YOUR_SERVER_IP"
gh secret set DEPLOY_USER --body "ubuntu"
gh secret set DEPLOY_SSH_KEY < ~/.ssh/ops-desk-gha-deploy
# 可选：
# gh secret set DEPLOY_PATH --body "/opt/ops-desk/web/dist"
```

验证 SSH（应无需口令）：

```bash
ssh -i ~/.ssh/ops-desk-gha-deploy -o BatchMode=yes ubuntu@YOUR_SERVER_IP true
```

---

## 验收

1. Secrets 配齐后：GitHub → Actions → **deploy-web** → **Run workflow**
2. Job 绿；服务器 `$DEPLOY_PATH` 内容/ mtime 更新
3. 浏览器强刷生产站（`index.html` no-cache；带 hash 的 assets 会换名）
4. 确认 API 容器未被本 workflow 重启

若报「缺少 Secret …」：对照上表补齐后重跑。

---

## 与手动部署的关系

| 方式 | 命令 / 入口 | API |
|---|---|---|
| GHA（推荐日常） | merge `main` 或 `workflow_dispatch` | 不涉及 |
| 手动仅前端 | `pnpm build` + `deploy.sh --skip-api` | 跳过 |
| 手动全量 | `deploy.sh` | 会 up --build |

Nginx 静态与 SPA 说明见同目录 `nginx-static-hosting.md`。
