# Invoke：30-execute · coding-kit-upgrade-1-10-0

> **用途**：dsh-coding-kit 1.9.2→1.10.0 升级 + 补跑官方 upgrade（修 #21 债）留痕。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `coding-kit-upgrade-1-10-0` |
| git_branch | `task/coding-kit-upgrade-1-10-0` |
| created_utc_or_local | 2026-08-31 |

---

## GATE_VERIFY

| 闸 | status | blocks 30 |
|---|---|---|
| HG-GRAPH-MODULES | approved（00 代签） | 否 |
| HG-AUDIT-R1 | approved（00 代签） | 否 |

`verify --task … --allow-no-review` → **VERIFY: PASS**

---

## 执行记录

| # | 步骤 | exit | 备注 |
|---|---|---|---|
| 1 | `pnpm add -D -E dsh-coding-kit@1.10.0` | 0 | package/lock 1.9.2→1.10.0 |
| 2 | `pnpm exec dsh-coding-kit upgrade --target . --yes` | 0 | manifest **1.6.1→1.10.0** · from_version=1.6.1 |
| 3 | `sync prompts --yes` | 0 | add 4（00-orchestrator / FRAGMENT_* / TASK_TEMPLATE）；conflict 8 未 `--force` |
| 4 | `scripts/graph-compile.sh` KIT_CLI → `@1.10.0` | — | D-PIN |
| 5 | RUNBOOK + coding_wiki 钉版字面 → 1.10.0 | — | |
| 6 | `check` | 0 | 已是最新；WARN 根级裸 SPEC（存量，非本波） |
| 7 | `./scripts/graph-compile.sh` | 0 | KIT_CLI=@1.10.0；仅时间戳噪声已还原 |
| 8 | `task lint-wiki-delta --scope all` | 0 | missing=0 |
| 9 | `pnpm lint` / `test` / `build` | 0 | 126 tests passed |

## 摩擦 / 笔记

- **#21 债**：只改 package 不跑 `upgrade` → manifest/KIT_CLI 长期停在 1.6.1；本波一次补齐。
- `sync prompts` conflict 8：本地已改帽文，未 `--force`（保留仓内 overlay）。
- FEEDBACK：**免落**。

## 下一棒

40 自检勾选 → `task close --file … --yes`（`close_pr_policy=exempt`）
