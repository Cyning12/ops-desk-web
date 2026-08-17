# Invoke：30（含 40）· migrate-dsh-coding-kit（web）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `migrate-dsh-coding-kit` |
| task_paths | `docs/tasks/active/task_migrate_dsh_coding_kit.md` |
| related_review_or_none | none（00 代签双闸 · 沿用 task_harness_upgrade_2_24_0 同型先例） |
| git_branch | `task/migrate-dsh-coding-kit` |
| created_utc_or_local | 2026-08-17 |
| notes | 维护者：「对当前项目进行迁移」（@cyning/harness → dsh-coding-kit）；DSH 会话内执行 |

## GATE_VERIFY

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 维护者指令迁移 | Y | N | Y |
| HG-AUDIT-R1 | approved | 00 代签基础设施 | Y | Y | Y |
| HG-GRAPH-MODULES | approved | 00 代签仅过程轨 | Y | Y | Y |

pre-30 invoke：`minimal` → 无 preRequired，不挡 30。  
机械校验：`pnpm exec dsh-coding-kit verify --target . --task docs/tasks/active/task_migrate_dsh_coding_kit.md` → **VERIFY: PASS**

结论：**可进入过程轨迁移（不改业务 Vue/API 逻辑）**

## 执行记录

- **依赖**：`pnpm add -D -E dsh-coding-kit@1.2.1 --config.auto-install-peers=false`（peer 链含未公开发布的 `@deepseek-ai/*` 包，见摩擦 F1）；新增仓根 `.npmrc` `auto-install-peers=false` 固定解析，`--frozen-lockfile` 复装绿
- **upgrade**：`pnpm exec dsh-coding-kit upgrade --yes` → `upgrade: 2.24.0 → 1.2.1`；manifest `version=1.2.1` · `from_version=2.24.0` · preset/ide 未裁；未触碰 S2 / IDE 块
- **鲜活引用换名**（3 类 8 文件）：`scripts/graph-compile.sh`（2 处 → `pnpm exec dsh-coding-kit graph yaml`）；`src/api/obs.ts` 契约注释；`AGENTS.md`/`CLAUDE.md`/`.cursor/rules/06-harness-pointer.mdc` verify 命令字面；`docs/coding_wiki/README.md` + `topics/wikilinks_export.md` wiki export 钉 1.2.1；`docs/_tech_graph/shared/99_mermaid_protocol.md` 生成器字面；`docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` 全量换前缀 + 修订记录
- **local 块**：`AGENTS.md` / `CLAUDE.md` 的 `cyning-harness-local` 内容逐字未变
- **历史零改动**：`docs/tasks/done` / `invokes` / `reviews` / `evidence` / wikitrack RUNBOOK（钉 2.19.0 一次性记录）/ acceptance 旧清单
- **验证**：`check` exit 0（已是最新）；`verify --task` PASS；`graph-compile.sh` 绿（时间戳噪声已还原）；`pnpm lint/test/build` 全绿（90 tests）；`CI=true pnpm install --frozen-lockfile` 绿
- **grep 验收**：鲜活 `npx @cyning/harness` 引用 = 0（残余命中仅本 task 文 + 历史 S2 + acceptance 旧记录）

## 摩擦（FEEDBACK 候选）

- **F1 · peer 链断**：`dsh-coding-kit@1.2.1` 的 peerDependencies（`@deepseek-ai/cordis` / `dsh-tools`）深层依赖未公开发布的 `@deepseek-ai/dsh-type-meta`，pnpm 默认 `auto-install-peers=true` 直接装失败。CLI 纯用法本不需要 peer。建议产品侧：peer 改 `peerDependenciesMeta.optional=true`，或 README 迁移节注明 pnpm 需关 auto-install-peers
- **F2 · adapter 字面滞后**：`assets/ide/adapters/*.example`（1.2.1）内文仍写 `npx @cyning/harness verify`；业务仓只能手改命令字面，无 sync 代劳
- **F3 · 沙箱/环境**：本机 `~/.npm` 属主损坏致 npx EACCES（绕过：`npm_config_cache=/tmp/npm-cache` 或 `pnpm exec`）；DSH 文件沙箱下 pnpm 回退仓内 `.pnpm-store`（已 gitignore），仓外首次 `pnpm install` 会提示 relink 一次
