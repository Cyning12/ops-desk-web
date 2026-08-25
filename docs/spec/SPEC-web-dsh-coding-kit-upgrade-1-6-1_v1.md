# SPEC · ops-desk-web · dsh-coding-kit 1.2.2 → 1.6.1 升级迁移（v1）

> **状态**：`approved`（**HG-SPEC-SIGNOFF** 已签 · 2026-08-25）  
> **track**：`infra` / `harness-process-rail`  
> **Open Folder（实现）**：`ops-desk-web/`  
> **目标钉版**：`dsh-coding-kit@1.6.1`（exact）  
> **起点**：manifest `1.2.2` · `package.json` `"dsh-coding-kit": "1.2.2"` · preset=`harness-only`  
> **先例仓（真值）**：`ops-desk-api` 已完成 1.5.1 → 1.5.2 → 1.6.1 升级 + graph 命令面切换（2026-08-25）  
> **下游**：00 起 web **2 task**（probe → upgrade）→ 20 审（可代签）→ 30 执行 → PR + CI automerge  
> **本 SPEC 目的**：把 api 仓已实证路径压成 **可复现、可对照、可回滚** 的 web 执行契约，压低跨仓跳版误差漂移。

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **spec_slug** | `web-dsh-coding-kit-upgrade-1-6-1` |
| **invoke_slug** | `web-dsh-coding-kit-upgrade-1-6-1` |
| **test_strategy** | `required` |
| **test_strategy_note** | §7 矩阵全绿；`pnpm lint/test/build`；`./scripts/graph-compile.sh`；`verify --task`；local 块零字节；钉版三处一致（manifest / package.json / lockfile） |
| **Open Folder（实现）** | `ops-desk-web/` |
| **默认分支** | `task/web-dsh-coding-kit-1-6-1` |
| **graph_change_layer（建议）** | `none`（过程轨升级；图谱语义不变；emit 风格差异须可解释） |
| **跨仓依赖** | 只读引用 `ops-desk-api` 已归档 task / FEEDBACK / graph SPEC；**不**改 api 仓 |

### 人工闸（SPEC 阶段）

| human_gate_id | status | 说明 |
|---|---|---|
| **HG-SPEC-SIGNOFF** | approved | 2026-08-25 00 代签（维护者授权：中间文档无需逐次询问；2 task 切分已确认；PR→main + CI 后自动合并） |

---

## 0. 00 签收注记（实现冻结点 · 签收后 30 原样遵守）

> 签收时由 00/维护者勾选并改 status→approved；下列条款签后不得口头改写。

- [x] **跳版策略**：允许 **1.2.2 → 1.6.1 一次到位**（不强制经 1.5.x）；但 §6.1 CLI 面探查与 §7 矩阵仍按 1.6.1 终态验收。
- [x] **安装真值**：`package.json` + `pnpm-lock.yaml` 钉 exact `1.6.1`；日常 CLI **优先** `pnpm exec dsh-coding-kit`（与 lock 一致）。禁止长期依赖无版本 `npx dsh-coding-kit` 作为默认路径（见 §3 D-PIN）。
- [x] **graph-compile.sh**：本波 **仅钉版对齐**（`pnpm exec` 或 `npx dsh-coding-kit@1.6.1`），**不**引入 api 的 normalize / GRAPH_CLI harness 回退口（web 无 normalize 历史债）。
- [x] **graph.json**：继续以本仓 `scripts/graph_yaml_to_json.py` 为真值；**不**在本波改用 kit `graph yaml export`（api 1.6.1 已证 kit export 与本仓脚本语义不等价项仍在：layer / freeze_id / 根双写）。
- [x] **产物噪声**：graph-compile 仅允许 `generated_at`（及既有 freeze_id 日滚动）类时间戳 diff；其余 mermaid/json 差异须逐文件解释，无法解释则 **STOP** 并落 FEEDBACK。
- [x] **local 块**：`<!-- cyning-harness-local:begin/end -->` 零手改、零字节预期变化；若 refresh 改写 → 恢复并报。
- [x] **非范围冻结**：不改业务 Vue、不改路由、不改 CI 业务 job 逻辑；关账/commit/PR 由维护者 2026-08-25 授权 00（PR→main + CI automerge）。

---

## 1. 目的与非目标

### 1.1 目的

1. 将 web 过程轨从 **1.2.2** 升到与 api 对齐的 **1.6.1**，消除跨仓 kit 版本分裂。
2. 用 api 已关闭的缺陷表（DEF-023 / DEF-028–033 等）做 **验收对照**，避免 web 重复踩已修坑或误报未修。
3. 消除本仓已存在的 **钉版漂移源**（`package.json=1.2.2` vs `graph-compile.sh` 无版本 `npx`）。

### 1.2 非目标

- 不做 `@cyning/harness` → kit **首迁**（web 已在 `task_migrate_dsh_coding_kit` / `task_coding_kit_upgrade_1_2_2` 完成）。
- 不移植 api 的 `graph_mermaid_normalize.py` / 命令面切换 SPEC（web 编译入口已是 kit）。
- 不把 kit `graph yaml export` 替换本仓 `graph_yaml_to_json.py`。
- 不升级 DSH 宿主插件生态、不改 preset（保持 `harness-only`，除非 §0 另签）。

---

## 2. 真值来源（只读 · 禁止凭记忆）

执行前 **必须** 对照下列归档件；冲突时以 **1.6.1 FEEDBACK + 本 SPEC §0** 为准。

| 优先级 | 路径（相对 Ops-desk 根） | 用途 |
|---|---|---|
| P0 | `ops-desk-api/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_api_20260825.md` | 1.6.1 验收结论、CLI 增量、D1–D3/R6/K7/K8/DEF-023 |
| P0 | `ops-desk-api/docs/tasks/done/task_dsh_coding_kit_upgrade_1_6_1.md` | 升级序列、五项自检、人工闸样例 |
| P0 | `ops-desk-api/docs/harness/invokes/by-task/dsh-coding-kit-upgrade-1-6-1/` | 30 命令与 exit 码实录 |
| P1 | `ops-desk-api/docs/tasks/done/task_dsh_coding_kit_upgrade_1_5_1.md` + `…_1_5_2.md` | 渐进路径与 refresh/local 块纪律 |
| P1 | `ops-desk-api/docs/spec/SPEC-harness-to-dsh-kit-graph-migrate_v0.md` + `task_dsh_kit_graph_command_switch` | **仅作对照**：web **不执行** harness→kit 切换；取其「备份 / 矩阵 / 失败即回滚」纪律 |
| P1 | `ops-desk-web/docs/tasks/done/task_migrate_dsh_coding_kit.md` + `task_coding_kit_upgrade_1_2_2.md` | web 本仓 pnpm exact 钉版、local 块、RUNBOOK 习惯 |
| P2 | `ops-desk-web/docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_2_1_from_ops_desk_web_20260817.md` | 历史 D1/D2/D3（peer/adapter/README）— 1.2.2 已关；本波只抽查未回退 |
| P2 | `ops-desk-web/docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` | 升级 checklist；本波结束后钉版字面改 1.6.1 |

### 2.1 api → web 可复用结论（已实证 · 禁止重开争论）

| ID | 结论（1.6.1） | web 本波动作 |
|---|---|---|
| DEF-023 | Mermaid emit 三规则未回退 | §7 V-MERMAID 抽查 |
| DEF-031 D1 | export 保留边 label | 本波不消费 export；可选抽查 |
| DEF-032 D2/D3 | graph_id 声明值 + check/export 互认 | 不换 json 生成器；compile/check 须绿 |
| DEF-033 R6 | class 按 yaml kind | §7 对照 class 行 |
| DEF-030 K7 | 跨产品线误报判据已收窄 | check 文案不得再报「降级安装」类误导（kit 线 from_version） |
| K8 | kit freeze_id 有固定常量；日滚动属本仓 py 脚本 | 时间戳 diff → checkout 还原或入库决策记 invoke |
| CLI | 1.5.2→1.6.1 仅 `verify --spec` 增量 | minor/大跳版均须 `--help` diff 记录；有破坏性 → STOP |
| upgrade 序列 | check → refresh dry-run → refresh --yes → upgrade --yes → 幂等复检 | §6 原样采用（web 用 pnpm exec） |
| local 块 | refresh 跳过 local；产品块由 upgrade/refresh 管 | §7 V-LOCAL |

---

## 3. 现状快照与漂移风险矩阵（web · 2026-08-25 盘点）

### 3.1 现状

| 组件 | 现状 | 风险 |
|---|---|---|
| `.cyning-harness/manifest.json` | `version=1.2.2` · `from_version=1.2.1` · preset=`harness-only` | 与 api `1.6.1` 分裂 |
| `package.json` | `"dsh-coding-kit": "1.2.2"` exact | 与目标差 4 个 minor 跨度 |
| `scripts/graph-compile.sh` | `npx dsh-coding-kit` **无版本钉** | **D-PIN**：CI/本地可能解析到 registry latest，与 lock 不一致 |
| `graph_yaml_to_json.py` | 本仓真值 | 保留；勿换 kit export |
| normalize | **无** | emit 升级后 diff 更「裸」——须矩阵解释 |
| IDE 产品块 | AGENTS/CLAUDE/mdc 已是 `npx dsh-coding-kit verify` | refresh 预期 rewrites≈0；仍须 diff |
| `docs/harness/prompts/*` | 多处仍写 `npx @cyning/harness` | upgrade 应刷产品资产；签收后核对鲜活引用 |
| `.cyning-harness/QUICKREF.md` | 仍写旧 `@cyning/harness` | 升级后应刷新或可删 |
| coding_wiki / RUNBOOK | 钉字面 `1.2.2` / `1.2.1` | 本波同步改 1.6.1 |
| 图谱 | `l0/00_main` · `l1/10_flow_chat`（2 张 yaml） | 小于 api；矩阵可缩短但不可跳过 |
| active task | 无 | 须新建 upgrade task 后方可 30 |

### 3.2 漂移风险（本 SPEC 强制防控）

| ID | 漂移模式 | 防控 |
|---|---|---|
| **D-PIN** | lock=1.2.2 / npx 无钉 → 静默用到 ≠1.6.1 | §6.2 三钉一致；graph-compile 改为 `pnpm exec dsh-coding-kit`（或 `@1.6.1`）；验收 `pnpm exec dsh-coding-kit --version` = 1.6.1 |
| **D-JUMP** | 跳过 1.3–1.5 行为变更未探查 | §6.1 `--help` + README「消费者注意」对照；破坏性 STOP |
| **D-EMIT** | 1.2.2→1.6.1 mermaid 风格变化被当成业务回归 | §7 V-MERMAID；仅允许 DEF-023 类风格修复；拓扑/边数不变 |
| **D-JSON** | 误把 kit export 当 graph.json | §0 冻结；保留 py 脚本 |
| **D-LOCAL** | refresh 伤仓内定制 | V-LOCAL；备份 AGENTS/CLAUDE 于 invoke 附 diff |
| **D-STALE** | 文档/prompts/QUICKREF 旧包名或旧钉版残留 | §7 V-GREP；RUNBOOK/wiki 钉版刷新 |
| **D-BASELINE** | 把既有红测当升级失败 | 升级前记录 `pnpm test` 基线；只比较「新增失败」 |
| **D-CROSS** | 把 api 的 harness→kit 切换步骤原样抄到 web | §1.2 / §4 非范围；web 已是 kit 命令面 |
| **D-CACHE** | npx 缓存半成品导致 `command not found` | 串行；必要时清 `npm_config_cache` 的 `_npx`（api FEEDBACK §6 备查） |

---

## 4. 范围 / 非范围

### 4.1 范围（30 允许改）

1. `package.json` / `pnpm-lock.yaml`：钉 `dsh-coding-kit@1.6.1` exact。
2. `.cyning-harness/manifest.json`：经官方 `upgrade --yes` 写入（禁手改蒙混）。
3. IDE 产品块：仅经 `refresh-ide-blocks` / `upgrade`（禁手改 begin/end 内文，除非 DEF-029 类无 marker 文件经 §0 授权）。
4. `scripts/graph-compile.sh`：钉版对齐（消除 D-PIN）；可选加一行注释指向本 SPEC。
5. 文档钉版字面：`RUNBOOK_harness_upgrade_v1_zh.md`、`docs/coding_wiki/**` 中 `1.2.2`/`@1.2.1` → `1.6.1`（鲜活指引，非历史 done/invoke）。
6. FEEDBACK（有出入时）：`docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_web_<date>.md`。
7. task / invoke 留痕（下游 task 目录）。

### 4.2 非范围

- 业务页面 / API client / pinia / 路由
- 改 preset、改 `graph_modules_path` 业务含义、改 yaml 拓扑
- 引入 normalize、切换 graph.json 生成器、改 tech-graph.yml 结构（仍调用 `./scripts/graph-compile.sh` 即可）
- 关账归档、强制 PR（由 00/维护者另令）

---

## 5. 前置条件（全部满足才开 30）

- [ ] 本 SPEC **HG-SPEC-SIGNOFF=approved**
- [ ] 存在 active task（建议 slug=`web-dsh-coding-kit-upgrade-1-6-1`），且 **HG-AUDIT-R1=approved**
- [ ] 分支为 `task/web-dsh-coding-kit-1-6-1`（禁 main 直改）
- [ ] `npm view dsh-coding-kit version` = `1.6.1`（或维护者书面接受预发布例外）
- [ ] 工作树无无关脏改；或已 stash 策略写入 invoke（api 先例：stash -u 护 refresh）
- [ ] 已读 §2 P0 两份文档（FEEDBACK 1.6.1 + task_dsh_coding_kit_upgrade_1_6_1）

---

## 6. 建议执行序列（冻结棒 · 禁止跳步）

> 所有 kit CLI 默认：`pnpm exec dsh-coding-kit …`（安装后）。  
> 安装前探查可用：`npm_config_cache=/tmp/npm-cache-web-kit npx --yes dsh-coding-kit@1.6.1 …`（串行，防 D-CACHE）。

### 6.1 CLI 面探查（跳版强制）

1. 保存 `dsh-coding-kit@1.2.2 --help` 与 `@1.6.1 --help`（及 `verify`/`upgrade`/`graph yaml` 子 help）diff。
2. **通过标准**：无参数删除、无语义反转；仅增量（api 已知：`verify --spec`）可继续。
3. 出现破坏性变更 → **STOP** 报 00，不执行 upgrade。

### 6.2 依赖钉版

```bash
pnpm add -D -E dsh-coding-kit@1.6.1
pnpm exec dsh-coding-kit --version   # 期望 1.6.1
CI=true pnpm install --frozen-lockfile
```

同步改 `scripts/graph-compile.sh` 两处 CLI 调用为：

```bash
pnpm exec dsh-coding-kit graph yaml compile --input "${dir}" --all
pnpm exec dsh-coding-kit graph yaml check --input "${dir}" --all --graph-json "${GRAPH_JSON}"
```

> **CI 注意**：`tech-graph.yml` 当前未 `pnpm install`。若改用 `pnpm exec`，须在该 job **先安装依赖**（或改回 `npx dsh-coding-kit@1.6.1` 并在 SPEC 验收中锁定该字面）。**二选一必须在 invoke 写死**，禁止混用。  
> **推荐（减漂移）**：CI 与本地统一 `npx --yes dsh-coding-kit@1.6.1`（与 manifest 同钉），`package.json` 仍 exact 钉 1.6.1 供开发机 `pnpm exec`；graph-compile 内用：

```bash
KIT_CLI="${KIT_CLI:-dsh-coding-kit@1.6.1}"
npx --yes "${KIT_CLI}" graph yaml …
```

本地可用 `KIT_CLI=dsh-coding-kit` + 已 install 的 PATH，但 **默认必须带 @1.6.1**。

### 6.3 升级序列（对齐 api 1.6.1 invoke）

| # | 步骤 | 期望 |
|---|---|---|
| 1 | `check --target .` | exit 0；状态可升级；无「降级安装」误报 |
| 2 | `refresh-ide-blocks --dry-run` | 记录 rewrites / plain_mentions |
| 3 | （若有脏树）`git stash push -u` → `refresh-ide-blocks --yes` → `stash pop` | local 块不被改 |
| 4 | `upgrade --target . --yes` | manifest → **1.6.1**；`from_version` 记直接前驱（预期 `1.2.2`） |
| 5 | upgrade 二跑 + refresh dry-run + check | 幂等；check=已是最新 |
| 6 | `git diff AGENTS.md CLAUDE.md` | **空**（或仅产品块预期刷新且 local 完整） |
| 7 | `verify --task <本task>` | 严格态缺 R\<n\> 时可 `--allow-no-review` 留痕；invoke hats 须齐 |
| 8 | `./scripts/graph-compile.sh` | exit 0；噪声还原纪律见 §0 |
| 9 | `pnpm lint` → `pnpm test` → `pnpm build` | 无**新增**失败（对照 D-BASELINE） |
| 10 | 文档钉版刷新 + V-GREP | §7 |
| 11 | 有出入 → FEEDBACK 落盘 | 无出入则 task 自检注明「免落」 |

### 6.4 备份纪律（改 graph-compile 前）

```bash
STAMP=$(date +%Y%m%d)
mkdir -p scripts/legacy
cp scripts/graph-compile.sh \
  "scripts/legacy/graph-compile.sh.${STAMP}.pre-kit-1-6-1.bak"
# 若本波改动 py 脚本（默认不改）再备份 graph_yaml_to_json.py
```

备份文件建议入库，便于回滚对照。

---

## 7. 验收矩阵

| # | 检查 | 通过标准 |
|---|---|---|
| V-MANIFEST | manifest | `version=1.6.1`；preset/ide 未裁；`from_version` 非手改谎言 |
| V-PIN | package + lock | exact `1.6.1`；`frozen-lockfile` 绿 |
| V-CLI | graph-compile / 开发命令 | 实际解析版本 = 1.6.1（`pnpm exec … --version` 或 `npx dsh-coding-kit@1.6.1 --version`） |
| V-LOCAL | AGENTS/CLAUDE local 块 | 定制段完整；非预期 diff → FAIL |
| V-VERIFY | `verify --task` | PASS（允许文档化的 `--allow-no-review`） |
| V-GRAPH | `./scripts/graph-compile.sh` | exit 0；tech-graph 同入口 |
| V-MERMAID | 两张图 md 围栏 | 无 `--"…"-->`；锚点为 `%%` 风格（DEF-023）；边数与 yaml 一致 |
| V-JSON | `shared/graph.json` | 仍由本仓 py 生成；check 绿 |
| V-FE | pnpm 三件套 | 无新增失败 |
| V-GREP | 鲜活旧钉/旧包名 | 指引区无 `dsh-coding-kit@1.2.`；无鲜活 `npx @cyning/harness`（历史 done/invoke 除外） |
| V-FB | 对照 api FEEDBACK 表 | D1/D2/D3/R6/K7 不重复开缺陷；回退则新 FEEDBACK severity≥P2 |
| V-HELP | CLI help diff | 已附件到 invoke；无破坏性 |

**总判定**：V-\* 全过 → 可提 PR；任一项 FAIL → 回滚 bak / 还原 lock + manifest，写失败报告，不扩大改业务。

---

## 8. 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| help 显式破坏性变更 | STOP；不 upgrade | 否（等产品或改 SPEC） |
| upgrade 改坏 local 块 | 自备份恢复；报 FEEDBACK | 是 |
| graph-compile 红且 diff 不可解释 | 恢复 graph-compile.bak；固定 KIT_CLI@1.2.2 临时自保并报告 | 是 |
| CI tech-graph 因 pnpm/npx 策略红 | 按 §6.2 选定策略改 job 或脚本，保持版本钉 | 是 |
| pnpm peer 再现 1.2.1 类故障 | 记录 FEEDBACK；对照 1.2.2 optional peer；不擅自改业务 `.npmrc` 除非验收需要 | 是 |
| verify 因缺 invoke/R\<n\> | 补 invoke 或留痕豁免；不改业务混过 | 是 |

---

## 9. 下游 task 草稿字段（00 起 task 时照抄）

| 字段 | 建议值 |
|---|---|
| task_slug | `web-dsh-coding-kit-upgrade-1-6-1` |
| git_branch | `task/web-dsh-coding-kit-1-6-1` |
| implement_repo | `ops-desk-web` |
| test_strategy | `required` |
| graph_change_layer | `none` |
| wiki_delta | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`（+ coding_wiki 钉版） |
| required_invoke_hats | `10,30`（与 api 1.6.1 对齐；若仓 profile 为 minimal 则按 profile） |
| 执行 SPEC | 本文件 |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1（+ 沿用 HG-GRAPH-MODULES 若仓仍要求） |

---

## 10. 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-25 | v1 draft：汇总 api 1.5.1/1.5.2/1.6.1 + graph 切换归档，针对 web 1.2.2 现状给出防漂移升级 SPEC（D-PIN/D-JUMP/D-EMIT 等） |
| 2026-08-25 | **HG-SPEC-SIGNOFF=approved**（00 代签 · 维护者授权中间文档签收 + 2 task 切分 + PR/CI automerge）；下游：T1 probe → T2 upgrade |
