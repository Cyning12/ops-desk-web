# Invoke：30 · web-dsh-coding-kit-upgrade-1-6-1

> **用途**：T2 正式升级 1.2.2 → 1.6.1 执行实录（钉版 · D-PIN · upgrade 序列 · V-\*）。  
> **禁**：git commit / push / PR / `task close`（00 收口）。

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | approved（00 代签） | Y | N（22-R1） | — |
| HG-AUDIT-R1 | approved | approved（00 代签 · 基于 T1 GO） | Y | Y | ✅ |
| HG-GRAPH-MODULES | approved | approved（graph_change_layer=none） | Y | Y | ✅ |

reviews：缺 R\<n\> 审查文 · `--allow-no-review` 豁免留痕（维护者已签 HG-AUDIT-R1）

pre-30 invoke：`required_invoke_hats=10,30` · 10 invoke 已就位 · `minimal` 口径 · verify PASS

机械：`pnpm exec dsh-coding-kit verify --target . --task docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md --allow-no-review` → **VERIFY: PASS**

**结论：可进入改码（过程轨）**

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-dsh-coding-kit-upgrade-1-6-1` |
| task_paths | `docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md` |
| git_branch | `task/web-dsh-coding-kit-1-6-1` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-25 |
| T1 GO 证据 | `docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md` + `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/invoke_20260825_30_web-dsh-kit-upgrade-probe-1-6-1.md` |
| T1 基线 | `pnpm test` = 0 failed / 107 passed |

---

## KIT_CLI / D-PIN 策略（写死 · 禁止混用）

**选定策略（SPEC §6.2 推荐）**：

```bash
KIT_CLI="${KIT_CLI:-dsh-coding-kit@1.6.1}"
npx --yes "${KIT_CLI}" graph yaml …
```

- `package.json` / lock exact `1.6.1` → 开发机优先 `pnpm exec dsh-coding-kit`
- CI `.github/workflows/tech-graph.yml` **未改**（job 只跑 `./scripts/graph-compile.sh`、未 pnpm install；脚本内 `@1.6.1` npx 自足）
- 改前备份：`scripts/legacy/graph-compile.sh.20260825.pre-kit-1-6-1.bak`

---

## 命令实录（按序 · exit）

| # | 命令 | exit | 备注 |
|---|---|---|---|
| A1 | `pnpm add -D -E dsh-coding-kit@1.6.1` | 0 | 先遇 store 路径冲突 → `rm -rf node_modules` 后默认全局 store 重装成功 |
| A2 | `pnpm exec dsh-coding-kit --version` | 0 | **1.6.1** |
| A3 | `CI=true pnpm install --frozen-lockfile` | 0 | 绿 |
| B | 备份 + 改 `scripts/graph-compile.sh` 两处 compile/check | — | D-PIN 如上 |
| C1 | `pnpm exec dsh-coding-kit check --target .` | 0 | 可升级 · manifest 1.2.2 → 包 1.6.1 · 无「降级安装」误报 |
| C2 | `refresh-ide-blocks --dry-run` | 0 | rewrites=0 · plain_mentions=0 · 跳过 local×2 |
| C3 | `git stash push -u` → `refresh-ide-blocks --yes` → `stash pop` | 0 | dirty 策略；refresh files_written=0 |
| C4 | `upgrade --target . --yes` | 0 | **1.2.2 → 1.6.1** · from_version=**1.2.2** · preset=harness-only · ide 保留 |
| C5 | upgrade 二跑 + refresh dry-run + check | 0 | 幂等：1.6.1→1.6.1 · rewrites=0 · 「已是最新」 |
| C6 | local 块字节比对（改前 `/tmp/*.local.bak`） | — | AGENTS/CLAUDE **same=True**（零非预期） |
| C7 | `verify --task … --allow-no-review` | 0 | VERIFY: PASS |
| C8 | `./scripts/graph-compile.sh` | 0 | KIT_CLI=dsh-coding-kit@1.6.1；check OK |
| C9 | `pnpm lint` | 0 | |
| C9 | `pnpm test` | 0 | **107 passed / 0 failed**（= T1 基线 · 无新增失败） |
| C9 | `pnpm build` | 0 | vue-tsc + vite build OK |
| C10 | RUNBOOK + coding_wiki 钉版 → 1.6.1 | — | |
| C11 | V-GREP 鲜活区 | — | 无 `dsh-coding-kit@1.2.`；无鲜活 `npx @cyning/harness` |
| C12 | FEEDBACK | — | **免落**（见下） |

---

## V-LOCAL / graph 产物处理

### local

- `AGENTS.md` / `CLAUDE.md` 的 `<!-- cyning-harness-local:begin/end -->`：**零字节非预期变化**
- IDE 产品块：refresh/upgrade **未改写** AGENTS/CLAUDE（git diff 空于这两文件）

### graph-compile 产物

| 文件 | 处置 | 说明 |
|---|---|---|
| `l0/00_main.md` / `l1/10_flow_chat.md` | **保留** | 可解释 emit 升级（DEF-023 未回退）：节点一律双引号；边 `--"…"-->` → `\|"…"\|`；按 yaml `kind` 写入 `class`（R6/DEF-033）；边数与 yaml 一致（14 / 11）；无残留 `--"…"-->` |
| `shared/graph.json` + 根 `graph.json` | **保留** | 剥离 `generated_at`/`freeze_id` 后语义相等；仅日滚动 freeze_id + generated_at（K8 / SPEC §0 允许） |
| json 生成器 | **未换** | 仍 `scripts/graph_yaml_to_json.py`；未引入 normalize；未用 kit export |

---

## V-\* 总表

| ID | 结果 |
|---|---|
| V-MANIFEST | PASS · version=1.6.1 · from_version=1.2.2 · preset/ide 未裁 |
| V-PIN | PASS · package+lock exact 1.6.1 · frozen-lockfile 绿 |
| V-CLI | PASS · `pnpm exec`=1.6.1；graph-compile 日志 KIT_CLI=@1.6.1 |
| V-LOCAL | PASS · local 零非预期 |
| V-VERIFY | PASS · `--allow-no-review` 留痕 |
| V-GRAPH | PASS · graph-compile exit 0 |
| V-MERMAID | PASS · 无旧边语法；边数一致；class 按 kind |
| V-JSON | PASS · py 真值；check 绿 |
| V-FE | PASS · lint/test/build 绿；test 对照基线无新增失败 |
| V-GREP | PASS · 鲜活旧钉/旧包名清零（prompts 仅替换 CLI 字面；保留本仓 FRAGMENT `HG-GRAPH-MODULES` 行；QUICKREF 自 kit 模板刷新） |
| V-FB | PASS · 对照 api FEEDBACK · **免落** |
| V-HELP | PASS · 继承 T1（无破坏性） |
| wiki_delta | PASS · RUNBOOK + coding_wiki 已刷 |
| 10+30 invoke | PASS · 本文件 + 10 invoke |

---

## FEEDBACK（免落）

对照 `ops-desk-api/.../FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md`：

- D1/D2/D3/R6/K7：**不重复开缺陷**（本仓未消费 export；check 绿；class 按 kind 已显现；无「降级安装」误报）
- Mermaid emit 风格 diff = DEF-023 预期形态，非回退
- 无 severity≥P2 新出入 → **免落** FEEDBACK 文件

---

## 改动文件清单（本 30）

- `package.json` / `pnpm-lock.yaml`
- `.cyning-harness/manifest.json` / `.cyning-harness/QUICKREF.md`
- `scripts/graph-compile.sh` + `scripts/legacy/graph-compile.sh.20260825.pre-kit-1-6-1.bak`
- `docs/_tech_graph/{graph.json,shared/graph.json,l0/00_main.md,l1/10_flow_chat.md}`
- `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`
- `docs/coding_wiki/README.md` / `docs/coding_wiki/topics/wikilinks_export.md`
- `docs/harness/prompts/{10-task-requirements,20-spec-audit,20-task-audit,30-execute-code,40-self-check,FRAGMENT_30_gate_verify_v1_zh,TEMPLATE_30_gate_stop}.md`（CLI 字面）
- `docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md`（验收勾选 + 自检）
- 本 invoke

**未改**：`src/**` · CI tech-graph.yml · local 块 · graph_yaml_to_json.py
