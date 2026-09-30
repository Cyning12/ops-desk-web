# task_web_specwave_upgrade_3_0_2 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_specwave_upgrade_3_0_2.md`  
> **审查帽**：20-task-audit（R1）  
> **日期**：2026-09-30 · **仓**：ops-desk-web · **分支**：`task/web-specwave-3-0-2`（base：`main`）  
> **前置**：Wave B CLOSE（`spec-wave@3.0.0` · PR #47）  
> **对照**：`docs/tasks/active/task_web_specwave_upgrade_3_0_0.md` · `docs/tasks/done/task_web_specwave_upgrade_2_4_2.md` · 既有 R1 范式  
> **审查性质**：**事后（post-hoc）R1**——实现已存在于未提交工作树，本审查为补做的人签前书面审核

---

## 结论

本审查 **PASS-with-conditions（内容通过 · 流程闸有条件放行）**。

**内容维度**：task 文档结构、元信息字段与验收口径与 3.0.0 / 2.4.2 先例一致；四项关键声明经独立复核**全部为真**（见 §2）：单一 prompt conflict 手合、`HG-GRAPH-MODULES` 保留、无 hooks 入库、`src/`+`tests/` 零改动、graph diff 仅时间戳。命令闸实跑结果与 task 自检结论一致（`task lint` PASS · `check`/`pins check --consumer` exit 0）。**内容零阻塞**，无需返回 10-task 重做。

**流程维度（条件所在）**：本波 **30 已先于 20-R1 执行完毕**，`HG-AUDIT-R1` 至今 `pending`，`verify --task` 实跑 **BLOCKED（exit 2）**。task 文档第 40 行已**诚实自陈**「未走 20-R1 前置」，但该事实本身违反仓内「`HG-AUDIT-R1` pending → 30 拒改码」硬规（`AGENTS.md` 新会话启动纪律 + `TEMPLATE_30_gate_stop.md`）。因此本 R1 **是事后审计，不具备对已完成实现的追认授权力**；20 帽**不签发** 30 开工授权，`HG-AUDIT-R1` 仍须维护者本人签。

实质说明：本波为过程轨 patch 热修，风险面（依赖钉版 + 文档字面 + 图谱戳）小且已实证收敛；流程倒置未造成业务污染（`src/`/`tests/` 干净），故判 PASS-with-conditions 而非 FAIL——但闸序倒置必须留痕，不得因「结果正确」而抹平。

---

## 1. 独立重跑闸（本审查实跑 · 真实输出）

| 命令 | 实跑结果 | exit | 与 task 自检一致？ |
|------|----------|------|--------------------|
| `pnpm exec spec-wave --version` | `3.0.2` | 0 | ✓ |
| `pnpm exec spec-wave check --target .` | 包版本 3.0.2 · manifest.version 3.0.2 · preset harness-only · **状态：已是最新** | 0 | ✓ |
| `pnpm exec spec-wave pins check --consumer --target .` | `PINS: PASS · 0/0 落点一致`；真值源 `package.json#devDependencies.spec-wave = 3.0.2`；「未声明 `.spec-wave/pins-consumer.yaml` 且未发现 CI workflow 钉面 · 0 落点」 | 0 | ✓ |
| `pnpm exec spec-wave task lint --file docs/tasks/active/task_web_specwave_upgrade_3_0_2.md` | `LINT: PASS` · warn `[W4] 无思考轮节（SPEC 承载 / bugfix 轨合法豁免）` | 0 | ✓（W4 非阻塞，见 N-4） |
| `pnpm exec spec-wave verify --target . --task …3_0_2.md` | `HG-AUDIT-R1 pending · blocks 30 ❌ 拒 30` → `VERIFY: BLOCKED` | **2** | ✓（task 第 84 行已标 `[ ]`） |
| `git status --short` | 10 项 `M` + 3 项 `??`（详见 §3） | 0 | 见 G-5 |
| `git diff --stat docs/_tech_graph/graph.json docs/_tech_graph/shared/graph.json` | 2 files changed · 4 insertions(+), 4 deletions(-) | 0 | ✓ |

> 按指令**未**重跑 `pnpm lint` / `pnpm test` / `pnpm build`（耗时）；改以核对 task §自检结论 与 FEEDBACK §自检结论两处记录的存在性与一致性（见 §2 C-6）。

---

## 2. 关键声明逐项核对（指令 5 项 claims + 结构对照）

### 2.1 声明 1（prompt conflict 手合 · HG-GRAPH-MODULES 保留）

| 核对项 | 证据 | 结果 |
|--------|------|------|
| 唯一手合文件 = `TASK_TEMPLATE.md` | `git diff docs/harness/templates/TASK_TEMPLATE.md` 仅 **1 hunk**：新增闸表「4 列 / id 单元格勿粗体」上游注 | ✓ |
| `HG-GRAPH-MODULES` 保留于 `FRAGMENT_30_gate_verify_v1_zh.md` | grep 命中 L15 `\| HG-GRAPH-MODULES \| …` | ✓ |
| `HG-GRAPH-MODULES` 保留于 `TEMPLATE_30_gate_stop.md` | grep 命中 L14 `\| HG-GRAPH-MODULES \| …` | ✓ |
| 未用 `--force` 盲盖 | 两个 prompt 文件**均未出现在 `git status`**（= 与 HEAD 逐字节一致，未被改动/未被覆盖） | ✓ 与「保留」一致 |
| 手合后与包内逐字节一致（FEEDBACK §4 声称） | **无法从工作树独立复核**（需上游包内原文比对） | ⚠ 仅记为报告性声明 |

### 2.2 声明 2（无 hooks 入库）

| 核对项 | 证据 | 结果 |
|--------|------|------|
| 无 `.cursor/hooks.json` | `.cursor/` 下仅 `commands/ rules/ skills/`；`git ls-files .cursor/` 无 hooks.json | ✓ |
| `.claude/settings.json` 无 `PreToolUse` | 文件实读：`hooks` 仅含 `PostToolUse`（graph-compile 段）；`grep -n PreToolUse` → exit 1（0 命中）；且该文件**不在 `git status`** → 与 HEAD 一致（「还原」成立） | ✓ |
| 无其它 hooks 制品 | **`.codex/hooks.json` 存在**（untracked · 未 gitignore · 内容为 `PostToolUse` graph 段，无 `PreToolUse`） | ⚠ 见 G-4 |

### 2.3 声明 3（业务源码零改动）

`git status --short -- src tests` → **空输出**。`src/` 与 `tests/` 无任何修改/新增/删除。✓

### 2.4 声明 4（graph.json 仅时间戳）

两文件 diff 均为同一 2 行改动：`freeze_id` `…FREEZE_20260918_V1` → `…FREEZE_20260930_V1`；`generated_at` `2026-09-18T08:28:02Z` → `2026-09-30T09:21:05Z`。**无节点/边/图结构改动**。✓ 与 F-4「戳 diff 接受入库」一致。

### 2.5 五钉一致性

| 钉点 | 实测值 |
|------|--------|
| `package.json#devDependencies.spec-wave` | `3.0.2` ✓ |
| `pnpm-lock.yaml` | `spec-wave@3.0.2`（L1564/3305）✓ |
| `.coding-kit/manifest.json` | `version=3.0.2` · `from_version=3.0.0` · `upgraded_at=2026-09-30T09:20:25Z` ✓ |
| `.coding-kit/host-tools.json` | `kit_semver=3.0.2` · 新增 `table_source:{kind:"builtin"}` ✓ |
| `scripts/graph-compile.sh#KIT_CLI` | `spec-wave@3.0.0` → `spec-wave@3.0.2` ✓ |

### 2.6 结构对照 3.0.0 先例

| 核对项 | 结果 |
|--------|------|
| Harness 元信息 17 字段（task_slug … review_hat） | 逐字段齐全，与 3.0.0 同构 ✓ |
| 人工闸表 4 列 | ✓（且本波新增的模板注要求 4 列 · 自洽） |
| 范围 / 非范围 / 失败路径 / 验收 / 自检结论 / KPI / 给执行帽必读 | 齐全 ✓ |
| failure_paths | 本波**多**一列「本波实际」（F-3/F-4 标注「已触发并处置/已触发」），优于 3.0.0 ✓ |
| 自检结论含 `verify --task` 行 | **缺失**（3.0.0 有）→ G-3 |
| `test_strategy_note` 含 `verify --task` | **缺失**（3.0.0 有）→ G-3 |
| 验收含 `pins check --consumer` | 本波**新增**（3.0.2 上游新能力）✓ |
| wiki_delta | 4 路径全为实际改动路径，字面已同步（README / wikilinks_export → `spec-wave@3.0.2`；RUNBOOK 追加 2026-09-30 行）✓ |
| `pnpm lint/test/build` 记录 | task 自检结论行（`0 / 179 tests`）+ FEEDBACK 分行（lint 0 · test 179 passed/23 files · build vue-tsc+vite 0）**两处均在** ✓ |
| KPI | `待 HG-AUDIT-R1 签收后关账`（未虚报 100）✓ 诚实 |

---

## 3. 工作树实际变更面（`git status --short`）

```
 M .coding-kit/host-tools.json
 M .coding-kit/manifest.json
 M docs/_tech_graph/graph.json
 M docs/_tech_graph/shared/graph.json
 M docs/coding_wiki/README.md
 M docs/coding_wiki/topics/wikilinks_export.md
 M docs/harness/templates/TASK_TEMPLATE.md
 M docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md
 M package.json
 M pnpm-lock.yaml
 M scripts/graph-compile.sh
?? .codex/
?? docs/harness/invokes/by-task/post-h-alpha-smoke/
?? docs/spec/doc-health/feedback/2026-09-30_3.0.2_web_upgrade.md
?? docs/tasks/active/task_web_specwave_upgrade_3_0_2.md
```

---

## 4. 缺口 / 差异清单（found gaps）

| ID | 级别 | 内容 |
|----|------|------|
| **G-1** | **流程（material）** | **闸序倒置**：30 已完成实现，`HG-AUDIT-R1` 仍 `pending`；`verify --task` 实跑 BLOCKED(exit 2)。task L40 已诚实自陈「未走 20-R1 前置」，task 文档本身为事后补写（untracked · mtime 17:22，晚于 `upgraded_at` 09:20Z）。内容无阻塞，但**不得**以本 R1 追认 30 授权；须由维护者补签并留痕。 |
| **G-2** | **交付物未闭合** | 两条验收仍为 `[ ]`：① `verify --task` PASS（人工闸未签，属预期）；② invoke 落盘 `docs/harness/invokes/by-task/web-specwave-upgrade-3-0-2/` —— 该目录**经查不存在**。`required_invoke_hats: 30` 使 30 invoke 快照为必落；3.0.0 先例已落盘该目录。 |
| **G-3** | 结构（minor） | `自检结论` 表**无 `verify --task` 行**，`test_strategy_note` 亦**未列 `verify --task`**；两处相对 3.0.0 先例均为退化，削弱「门禁以 CLI `verify --task` 为准」的可追溯性。 |
| **G-4** | 验收口径不完整 | 「无 hooks」验收仅点名 `.cursor/hooks.json` + Claude `PreToolUse`，**未覆盖 `.codex/hooks.json`**（untracked · **未被 .gitignore 忽略** · 若 `git add -A` 将入库）。其实测内容仅 `PostToolUse` graph 段（与 `.claude` 基线同构 · 不触发 F-3 裸 verify 风险），且 mtime 为 **Sep 18 09:35（Wave B 遗留）**、非本波产物 → **非本波回归**；但判据建议泛化为「`.cursor`/`.claude`/`.codex` 均无 `PreToolUse` 且工作树无 hooks 制品」。 |
| **G-5** | 上下文差异（非 task 缺陷） | 派工上下文给出的 changed-path 清单**遗漏** `scripts/graph-compile.sh`（实际已改，且 task §范围 3 与 FEEDBACK §钉版均正确覆盖）；另 `.codex/` 与 `docs/harness/invokes/by-task/post-h-alpha-smoke/` 两个 untracked 路径未列，均属他波遗留、非本波范围。 |
| **G-6** | 卫生（nit） | 新增 FEEDBACK 与 task 文档权限为 `-rw-------`(0600)，同目录既有 FEEDBACK 为 `0644`。 |
| **N-4** | 非阻塞注记 | `task lint` 的 `W4`（无思考轮节）对本波（过程轨 patch · 无 SPEC 承载）为**合法豁免**，与 3.0.0 先例一致；不构成退回 10-task 理由。 |

---

## 5. 签闸建议

| 闸 | 现状 | 本 R1 建议 |
|----|------|-----------|
| `HG-GRAPH-MODULES` | approved | 维持 approved（过程轨 · 不改业务模块边界；未触碰 `l1/01_modules.md` 语义） |
| `HG-TASK-DRAFT` | approved | 维持 approved（00 本窗授权「更新 specwave 到最新版本」） |
| `HG-AUDIT-R1` | **pending** | **可由维护者签 approved** —— 本 R1 内容零阻塞；但须同时：(a) 认可 G-1 闸序倒置留痕；(b) 补 G-2 的 30 invoke 落盘；(c) 关闭 G-3/G-4 判据缺口（可并入 PR 前收尾） |

**20 帽不签发 30 开工授权**；30 是否「已完成」由维护者按 G-1 事实判认，本审查文不构成对既成实现的追认。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
