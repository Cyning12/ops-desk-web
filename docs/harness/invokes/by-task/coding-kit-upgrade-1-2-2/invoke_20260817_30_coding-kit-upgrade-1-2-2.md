# Invoke：30（含 40）· coding-kit-upgrade-1-2-2（web · FEEDBACK 验收）

| 字段 | 值 |
|---|---|
| hat_id | 30（含 40 自检） |
| task_slug | `coding-kit-upgrade-1-2-2` |
| task_paths | `docs/tasks/active/task_coding_kit_upgrade_1_2_2.md` |
| related_review_or_none | none（00 代签双闸 · 同型先例） |
| git_branch | `task/coding-kit-upgrade-1-2-2` |
| created_utc_or_local | 2026-08-17 |
| notes | 维护者：「coding-kit 已经根据 FEEDBACK 更新，更新并检查是否满足」 |

## GATE_VERIFY

| human_gate_id | task表status | blocks_30 | 30可开工？ |
|---------------|--------------|-----------|------------|
| HG-TASK-DRAFT | approved | N | Y |
| HG-AUDIT-R1 | approved（00 代签） | Y | Y |
| HG-GRAPH-MODULES | approved（00 代签） | Y | Y |

机械校验：`pnpm exec dsh-coding-kit verify --target . --task docs/tasks/active/task_coding_kit_upgrade_1_2_2.md` → **VERIFY: PASS**

## FEEDBACK 逐项验收（@1.2.2）

| 项 | 结论 | 证据 |
|----|------|------|
| **D1** peer 链安装失败 | ✅ **已修复** | `npm view dsh-coding-kit@1.2.2 peerDependenciesMeta` → cordis/dsh-tools 均 `optional: true`；净仓（/tmp/d1-cleanroom · pnpm 10 默认配置）`pnpm add -D -E dsh-coding-kit@1.2.2` 成功，`node_modules/@deepseek-ai` 不存在（peer 未被自动安装），CLI `--version` 正常 |
| **D2** adapter 字面滞后 | ✅ **已修复** | 1.2.2 `assets/ide/adapters/`（AGENTS/CLAUDE/cursor mdc/README 四件）命令字面全部为 `npx dsh-coding-kit verify`；反向 grep 零 `@cyning/harness` |
| **D3** README 钉版漂移 | ✅ **已修复** | README 首行/入口表/迁移节钉版均为 `1.2.2` |

## 执行记录

- `git rm .npmrc`（D1 变通移除）；`pnpm add -D -E dsh-coding-kit@1.2.2`（默认配置，未加任何 flag）→ 成功
- lockfile 回默认 `autoInstallPeers: true`；`CI=true pnpm install --frozen-lockfile` exit 0
- `pnpm exec dsh-coding-kit upgrade --yes` → `upgrade: 1.2.1 → 1.2.2`；manifest `version=1.2.2` · `from_version=1.2.1` · preset/ide 未裁
- 钉版字面：RUNBOOK（+1.2.2 要点行 + 修订记录）· coding_wiki 两处 `@1.2.1` → `@1.2.2`；FEEDBACK 文头补修复确认状态块
- `check` exit 0（已是最新）；`graph-compile.sh` 绿（时间戳噪声已还原）；`pnpm lint/test/build` 全绿（90 tests）

## 结论

FEEDBACK 三项全部满足，无回填项。1.2.2 可作为本仓稳定钉版。
