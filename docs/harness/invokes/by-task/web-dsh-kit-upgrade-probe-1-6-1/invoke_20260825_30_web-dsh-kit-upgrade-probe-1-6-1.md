# Invoke：30 · web-dsh-kit-upgrade-probe-1-6-1（T1 CLI 面探查）

> **用途**：SPEC §6.1 D-JUMP help 探查 + D-BASELINE；产出 **GO/STOP** 供 T2。  
> **硬禁止已遵守**：未改 package/lock/manifest/graph-compile/src；未跑 `upgrade --yes` / `refresh-ide-blocks --yes`；未 commit/push；未执行 T2。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-dsh-kit-upgrade-probe-1-6-1` |
| task_paths | `docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md` |
| related_review_or_none | none（`--allow-no-review` 豁免留痕 · 见附件） |
| git_branch | `task/web-dsh-coding-kit-1-6-1` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-25 |
| notes | 串行 npx · `npm_config_cache=/tmp/npm-cache-web-kit`（防 D-CACHE） |

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 00 代签 approved | Y | N（22-R1） | — |
| HG-AUDIT-R1 | approved | 00 代签 approved | Y | Y | **可开工** |
| HG-GRAPH-MODULES | approved | 00 代签 · graph_change_layer=none | Y | Y | **可开工** |

reviews：task_*_audit_R1_*.md 存在且 R1 通过？ **否**（缺 20 审查文；本波用 `--allow-no-review` 豁免留痕，与 api 先例一致）

pre-30 invoke：`required ∩ {10,20,00}` → required=`10,30` · **10 已就位** · 20 非 required → **是**

结论：**可进入探查**（禁改码路径 · 仅 help/view/test 观察）

机械辅助：`npx --yes dsh-coding-kit@1.2.2 verify --target . --task docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md --allow-no-review` → **VERIFY: PASS · exit 0**

---

## 执行实录

### 1. registry 钉版

```text
npm view dsh-coding-kit version          → 1.6.1
npm view dsh-coding-kit@1.6.1 version    → 1.6.1
```

### 2. CLI 面 help（串行 · 防 D-CACHE）

环境：`npm_config_cache=/tmp/npm-cache-web-kit`；探查前已清 `_npx` 子缓存一次。

| 命令 | 1.2.2 exit | 1.6.1 exit | 备注 |
|---|---|---|---|
| `--help`（顶层） | 0 | 0 | 主 diff 源 |
| `verify --help` | 0 | 0 | 1.2.2 回落到顶层 help；1.6.1 专用一行 usage |
| `upgrade --help` | 0 | 0 | 1.2.2 回落；1.6.1 专用一行（参数面同顶层） |
| `graph yaml --help` | 0 | 0 | 1.2.2 回落；1.6.1 专用 graph 子命令表 |
| `graph yaml compile/check/export --help` | 0 | 0 | 1.6.1 三者与 `graph yaml --help` **同文** |

附件目录：`attachments/`（完整 stdout + `help_diff_summary.txt`）

### 3. help 关键差异摘要（1.2.2 → 1.6.1）

**顶层 `--help`（唯一完整可比面）**：

| 变更 | 类型 | 破坏性？ |
|---|---|---|
| `verify`：`[--task FILE]` → `[--task FILE \| --spec FILE] [--json]` | **增量**（对齐 api FEEDBACK §2） | 否 |
| 新增 `refresh-ide-blocks [--target] [--dry-run] [--yes] [--json]` | 新子命令 | 否 |
| `gate-check` 增 `[--json]` | 增量 | 否 |
| `lifecycle dry-run` 增 `[--target PATH]` | 增量 | 否 |
| `init` 注释 `（NAME 词表: harness-only）` | 文档提示 | 否 |
| `graph yaml compile\|check\|export …` 行 | **保留**（无删除） | 否 |

**`verify --help`（1.6.1 专用）**：

```text
用法: npx dsh-coding-kit verify [--target PATH] [--task FILE | --spec FILE] [--json]
      [--allow-no-review] [--allow-invoke-gap] [--allow-no-spec-review]
```

相对顶层再明示豁免旗；`--allow-no-review` 为 `--allow-no-spec-review` 别名语义见 api FEEDBACK（纯增量）。

**`upgrade --help`（1.6.1）**：`[--target PATH] [--yes]` — 与 1.2.2 顶层行一致，**无参数删除**。

**`graph yaml*`（1.6.1 专用表）**：compile / check / export / ingest / snapshot / axioms 均在；参数面含 `--graph-id` / `--all` / `--input` / `--graph-json` / `--out` 等。相对 1.2.2「仅顶层省略号」为 **帮助面增强**，非删参。

### 4. 对照 api FEEDBACK §2

| api 已知（1.5.2→1.6.1） | web 本波（1.2.2→1.6.1） |
|---|---|
| 仅 `verify --spec` 增量 | **已观测到**（顶层 + verify --help） |
| upgrade / refresh / check / graph yaml help 零变更（相对 1.5.2） | 相对 **1.2.2** 另有跨 minor 增量：`refresh-ide-blocks` 新命令、gate-check `--json`、lifecycle `--target`、子命令专用 help |
| 无参数删除 / 无语义反转 | **本波同样：无** |

额外破坏性变更清单：**无**

### 5. D-BASELINE · `pnpm test`

```text
Test Files  21 passed (21)
Tests       107 passed (107)
exit        0
失败条数    0
关键失败名  （无）
```

附件：`attachments/pnpm_test_baseline.txt`

### 6. 可选 verify

`npx --yes dsh-coding-kit@1.2.2 verify --target . --task … --allow-no-review` → **PASS exit 0**（缺 20 R1 审查文 · 豁免旗留痕）

附件：`attachments/verify_1.2.2_allow_no_review.txt`

---

## GO / STOP 判定

| 判据 | 结果 |
|---|---|
| registry = 1.6.1 | ✅ |
| 无参数删除 | ✅ |
| 无语义反转 | ✅ |
| 仅增量（含 api 已知 `verify --spec` + 跨 minor 文档/新命令） | ✅ |

**判定：GO** — 允许进入 T2 `web-dsh-coding-kit-upgrade-1-6-1`（本 invoke **不**执行 T2）。

---

## 工作树纪律

禁止路径本波 **未触碰**：

- `package.json` / `pnpm-lock.yaml`
- `.cyning-harness/manifest.json`
- `scripts/graph-compile.sh` / `src/**`
- 业务 CI

本波仅新增/更新：

- `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/invoke_20260825_30_….md`（本文件）
- `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/attachments/*`
- `docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md`（自检回填）

---

## 下一步 · 交 00

1. 确认本 task **GO** → 授权 30 执行 T2（另 task / 另波）。
2. T2 升级后只比较 `pnpm test` **新增**失败（本基线 = 0 failed / 107 passed）。
