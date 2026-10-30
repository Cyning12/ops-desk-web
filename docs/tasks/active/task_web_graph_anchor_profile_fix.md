# Task：Web · 图谱锚点闸 profile 修复（graph_modules_path 指向 + 01_struct 词表源归位）

> **状态**：`in_progress`（v0.6 · 40 独立验收 PASS · 验收 1–8 逐项亲跑实证全绿 · 无阻塞项 · 待维护者 CLOSE）
> **类型**：基础设施 / harness 过程轨修复（profile 配置 + 图谱词表源 plumbing · 业务源码零改动）
> **前置**：spec-wave 3.5.0 升级 wave CLOSE（`docs/tasks/done/task_web_specwave_upgrade_3_5_0.md` · 分支 task/specwave-upgrade-3-5-0 · commit 32e2800）
> **分支**：`task/web-graph-anchor-profile-fix`（base：3.5.0 升级落地后的 main 合并态 · **30 开工才切** · 本棒不切分支）
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue/SSE/`src/`；**禁用** `--allow-no-review` 与 `--allow-no-graph-anchor` 常态化豁免（维护者 2026-10-30 新立原则：豁免路线不符合长久发展，升级/流程类 task 一律走 20-R1 审查）
> **10 注**：2026-10-30 · 00 派单 · 实证钉案直接引用升级棒已实证结论（R1 审查 G-1 + FEEDBACK 摩擦点 1 · 本棒亲读 node_modules spec-wave@3.5.0 源码复核成立）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-graph-anchor-profile-fix` |
| **git_branch** | `task/web-graph-anchor-profile-fix`（新开 · base = 3.5.0 升级合并态 · 30 开工才切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-TASK-DRAFT + HG-AUDIT-R1（**不代录**）→ 30 → 40 → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | `npx spec-wave verify --target . --task <task>`（本 task + 存量 active task 回归）· `task lint --file` · `task lint-wiki-delta --scope all` · 图谱四闸（`graph yaml check --all` / `drift` / `ib check` / `ast check`）· `./scripts/graph-compile.sh` 复跑零意外 diff · `pnpm lint` / `pnpm test` / `pnpm build`（packageManager pnpm@10.32.1 · 过程轨仍跑三件套为质量门） |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue（`src/` / `tests/` 零改动） |
| **graph_delta** | `docs/_tech_graph/` |
| **graph_delta_note** | **不改模块边界语义 / 不改业务拓扑**：l1/01_struct.md 新建（词表源归位 · 表内容自 01_modules.md 平移）· l1/01_modules.md 指针化 · 根 stub 指向更新；flow yaml 零改动；graph-compile 复跑除 D3 声明的 l0 label 随迁预期 diff（graph.json / shared/graph.json label 行 · R1-B-2）外零意外 diff |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：3.5.0 图谱锚点闸自 dormant 修复为生效（profile 指向 l1 目录 + 01_struct 词表源归位）；真值指针 = 本 task。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **related_pr** | `n/a` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。~~双闸保持 pending，等维护者亲签，任何人不得代录~~ → 2026-10-30 维护者授权锚 m00500「授权签收所有文档」，双闸由 00 代录 approved（见下表）。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-R1, 30 | 00 代录 · 授权锚 m00500（维护者令启动后续 task · 授权签收所有文档 · 不走 `--allow-no-review`） |
| HG-AUDIT-R1 | approved | 30 | 2026-10-30 · 00 代录 · 授权锚 m00500 · R1 退回→v0.3 回填→R2 通过零阻塞 · 审查文 R1/R2 双件 |
| HG-GRAPH-MODULES | approved | 30 | 00 代录 · 授权锚 m00500 · 本 task 即图谱闸路径语义变更本体 · 闸路径随迁已入范围/D2/D3 · R2 审查文核闭 |

---

## 背景与目标

**实证钉案（升级棒已实证 · 本棒亲读复核）**：

1. **3.5.0 新增图谱先读闸**：`verify --task` 增图谱锚点引用检查，条件触发于 profile `graph_modules_path`（源码 `lib/checks/graph-anchor.js#probeGraphAnchor`：`path.resolve(target, declared)` 须 `statSync(...).isDirectory()`，否则 `graph_path_unreachable` → 检查步跳过不挡）。
2. **本仓闸恒 dormant**：双 profile（`.coding-kit/profile.json:5` 主读 + `.cyning-harness/profile.json:5` legacy 兜底）`graph_modules_path="l1/01_modules"` 为 2.22 时代 overlay 旧义（指模块表**文件**去扩展名），自仓根解析为 `<root>/l1/01_modules` **不可达**（真值实为文件 `docs/_tech_graph/l1/01_modules.md`）→ verify 输出 `INFO · 图谱锚点引用检查 · 图谱锚点检查未生效（已跳过 · graph_path_unreachable · graph_modules_path=l1/01_modules）`，exit 0 不挡，**闸自 3.5.0 升级起对本仓从未生效**。
3. **词表源第二重缺口**（升级棒 R1 已点名 G-1）：即使改指可达目录，闸词表源要求 `<graphPath>/01_struct.md` 内含 `## 1. 模块边界表` 节（`graph-anchor.js` `MODULE_SECTION_HEAD_RE = /^##\s+1\.\s*模块边界表/` · 首列表首列反引号词为模块词表）；仓内 `docs/_tech_graph/01_struct.md` 为 8 行 stub（真值已迁 l1 · 无该节），`docs/_tech_graph/l1/01_modules.md` 节名为 `## 模块表（必填）` **不匹配 RE**——两处均不满足，词表抽取必失败（`vocabulary_empty` → skip 不挡）。
4. **出处引用**：`docs/tasks/done/task_web_specwave_upgrade_3_5_0.md`（自检结论 verify 行）· `docs/harness/reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md`（G-1 非阻塞观察「另议」）· `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md`（摩擦点 1「profile 语义二义」）。本 task = G-1「另议」的承接。

**完成态**：profile 指向自仓根可达目录；`01_struct.md` 词表源归位（单一真值 · 无漂移面）；verify 实测锚点闸**生效且 PASS**（本 task 为首件活体过闸任务）；存量 task verify 回归无新 BLOCKED；引用面（AGENTS local 块 / 根 stub / HG-GRAPH-MODULES 路径表述）同步。

## 范围

1. **profile 指向修复**：`.coding-kit/profile.json` + `.cyning-harness/profile.json` 双份同步，`graph_modules_path` 改指可达目录（推荐 `docs/_tech_graph/l1` · 定夺见 D1；须先读 profile 结构 + `lib/checks/graph-anchor.js` 判定逻辑定夺，已亲读落 R1/R2）。
2. **词表源 01_struct.md 归位**：新建 `docs/_tech_graph/l1/01_struct.md` 含 `## 1. 模块边界表` 节（内容自 `01_modules.md` 模块表逐字平移 · 8 模块全量：entry/router/pages/components/api/pinia/capability/styles）。该节**双兼容两套机器读法**（R1-B-1）：graph-anchor 词表读法（首列反引号 module_id 词 · `graph-anchor.js:43` 节 RE + `:54-88` 吃节内全部表行首列词）+ drift protocol 列形（表头含「路径 glob」列 · `cli-graph-drift.js:95-97` 无此表头即 throw struct_unparseable）；**该节限单一模块表**（N-4：节内多表会多吃词入词表）；`01_modules.md` 指针化（沿用仓内 stub 先例模式）；HG-GRAPH-MODULES 真值位置随迁（D2/D3）。
3. **drift 闸输入随迁（R1-B-1 补列）**：`.spec-wave/graph-drift.yaml:4` `struct_rel: l1/01_modules.md` → `l1/01_struct.md`（drift 闸 `cli-graph-drift.js:229` 以 `join(inputRoot, structRel)` 定位 struct 文件 · 配置硬读非文字引用面 · 01_modules 指针化后不改指则 drift 闸必 FAIL）；
4. **生效实测**：`npx spec-wave verify --task` 本 task，图谱锚点检查步**不再输出「已跳过」**且 VERIFY: PASS（面A = 本 task 验收/failure_paths 节内图谱锚点引用 · 面B = 30/40 invoke + 20 审查文锚点引用 · D5）。
5. **存量回归**：闸生效后全量 active task + 近期 done task 抽跑 verify，无新 BLOCKED；新增 BLOCKED 逐项按 FP-1 处置（回退口实证留痕）。

## 非范围

- 图谱内容扩充（模块表语义增补 / flow yaml 拓扑改动 / l0/l2 层结构调整；`l0/00_main.md` 与上游 FRAGMENT 期望的 `<graphPath>/00_main` 分层分歧仅照登不强迁 · D6）；l0 label 随迁改指属引用内容同步（nodes/edges 拓扑零改动 · 非结构调整 · D3 定夺已列范围）
- spec-wave 再升级 / 上游源码改动（`probeGraphAnchor` 不支持文件路径属上游设计 · 不改上游）
- 业务源码 `src/` / `tests/`（零改动）；api / workspace 姐妹仓
- 历史留痕（docs/tasks/done · reviews · invokes · 旧 FEEDBACK）旧字面值不改（含旧文中 `graph_modules_path=l1/01_modules` 记载）
- `--allow-no-graph-anchor` / `--allow-no-review` 豁免旗标的常规化使用（应急单次使用须维护者授权 + 留痕 + 回填 task · D4）
- hooks 物化入库（沿用惯例）

## 00 定夺（10 草案裁定 · 维护者可后改 · 10 不得推翻只补可机断措辞）

| ID | 定夺 |
|----|------|
| D1 | **指向 = `docs/_tech_graph/l1`**。候选 B（`docs/_tech_graph` 根）排除：flow yaml 不在目录面 → 锚点词表贫瘠（仅文件 stem），且根 01_struct.md 为 stub 无词表节 → 仍 skip；候选 C（指文件路径 `docs/_tech_graph/l1/01_modules`）排除：`probeGraphAnchor` 硬要求 isDirectory（改上游 = 非范围）。l1 目录面锚点词表最富（前缀 + 10_flow_*.graph.yaml nodes/edges id + 文件 stem）。 |
| D2 | **词表源归位 = 真值迁移**：`l1/01_struct.md` 成为模块边界表唯一真值（含 `## 1. 模块边界表` 节 · 表自 01_modules.md 逐字平移 · **节内限单一模块表**（N-4：`extractGraphAnchorModuleVocab` :54-88 吃节内全部表行首列词 · 多表即多吃词）· **双兼容列形**（R1-B-1）：首列反引号 module_id + 表头含「路径 glob」列 · 模板约束写死进验收 2）；`01_modules.md` 改指针 stub（沿用根 stub「真值已迁至」先例模式）。**禁止双真值并存镜像**（无防漂移机检 · FP-3）。备选（维护者可后改）：01_modules.md 留真值 + 01_struct.md 受管镜像——因缺漂移机检不推荐。 |
| D3 | **闸路径随迁 + l0 引用处置定夺**：HG-GRAPH-MODULES 真值位置改指 `docs/_tech_graph/l1/01_struct.md`；AGENTS.md :134 cyning-harness-local 块「图谱闸路径」行同步（**CLAUDE.md local 块实无闸路径行** · 仅指回 AGENTS.md · 免改 · N-5）；根 stub `docs/_tech_graph/01_struct.md` 指向文案一跳到底改指 l1/01_struct.md（**禁指针链** root→01_modules→01_struct）；根 stub 本体按其自载保留策略「闸改指后 ≥1 Epic 再删」**存续不删**。**l0 引用处置（R1-B-2 · 二选一写死 = 随迁改 label）**：`l0/00_main.graph.yaml:85` · `l0/00_main.md:34,93` 三处 `>../l1/01_modules.md` 随迁改指 `>../l1/01_struct.md`（不改则指针化后成 l0→01_modules 指针→01_struct **指针链** · 正面违反禁指针链）；graph-compile 产物 `graph.json:173` / `shared/graph.json:173` label 行随之 diff —— **声明为预期 diff**（验收 6 口径随迁 · graph_delta_note 已对齐）；label 随迁属引用内容同步，nodes/edges 拓扑零改动，不触非范围「l0 层结构调整」。 |
| D4 | **回退口 = 还原 profile**：闸生效后若存量 task 突发不可解 BLOCKED，回退 = 双 profile `graph_modules_path` 还原 `"l1/01_modules"`（一行 revert 级 · 闸复归 dormant）；**严禁**以 `--allow-no-graph-anchor` 常态化绕过（维护者原则）。回退后须另立 task 回填根治。 |
| D5 | **面B 锚点义务**：本 task 生效后，30/40 invoke 与 20 审查文必须含图谱锚点字面引用（`docs/_tech_graph/l1/01_struct.md` / `01_modules` / `10_flow_*` 级），否则 verify 面B 判 blocked；写入 30 必读。 |
| D6 | **00_main 分层分歧照登**：上游 FRAGMENT_graph_first_read 期望 `<graphPath>/{00_main, 01_struct}`，仓内 00_main 在 `l0/`；闸机检不依赖 00_main（词表仅取 01_struct.md），FRAGMENT 为指导性条文——照登为已知差异，本 task 不强迁分层。 |
| D7 | **存量回归口径**：宁回退不豁免——新增 BLOCKED 逐项判定：真缺锚点引用且该 task 涉图谱模块 → 属闸设计语义，按 D4 回退并记录清单另行根治；不为过闸给存量 task 硬塞锚点字面（历史留痕不改原则优先）。 |

## 依赖

- `node_modules/spec-wave/lib/checks/graph-anchor.js`（3.5.0 · probeGraphAnchor :13-41 目录判定（N-1 校正 · 函数体至 :41）· extractGraphAnchorModuleVocab :54-88 词表节 RE · extractGraphAnchorAnchorVocab :91-145 锚点词表 · judgeGraphAnchor :214-248 面A/面B 判定）
- `node_modules/spec-wave/lib/cli/verify.js:507`（inform 输出行实证）· `lib/cli-lifecycle.js:193`（lifecycle 守卫同口径）· `lib/cli/verify.js:564`（done 目录闸 blocked 降级 warn · N-6 回归判定口径）
- `.spec-wave/graph-drift.yaml:4`（`struct_rel: l1/01_modules.md` · drift 闸 struct 文件定位真值 · **R1-B-1 补列**：`cli-graph-drift.js:229` `join(inputRoot, structRel)` 定位 · `parseStructModuleGlobs :95-97` 无「路径 glob」表头即 throw struct_unparseable · 随迁 `l1/01_struct.md`）
- `.coding-kit/profile.json:5` · `.cyning-harness/profile.json:5`（双 profile · resolveLayoutFile 读序：.coding-kit 优先 · legacy 兜底）
- `docs/_tech_graph/l1/01_modules.md`（模块表真值 · 8 模块 · 迁移源）· `docs/_tech_graph/01_struct.md`（根 stub · 保留策略自载）
- `docs/harness/prompts/FRAGMENT_graph_first_read_v1_zh.md`（3.5.0 sync 新增 · verify 行为条文 + 豁免仅 `--allow-no-graph-anchor`）
- 出处三件套：`docs/tasks/done/task_web_specwave_upgrade_3_5_0.md` · `docs/harness/reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md`（G-1）· `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md`（摩擦点 1）
- AGENTS.md :134 cyning-harness-local 块（HG-GRAPH-MODULES 闸路径表述行 · upgrade 不改写区 · CLAUDE.md local 块无该行 · 免改 · N-5）

## 验收标准

- [ ] 1. 双 profile（`.coding-kit/profile.json` + `.cyning-harness/profile.json`）`graph_modules_path` 值一致且 `path.resolve(仓根, 该值)` `statSync().isDirectory()=true`（node 一行断言可机断）。
- [ ] 2. `docs/_tech_graph/l1/01_struct.md` 落盘：含 `## 1. 模块边界表` 节标题（匹配 `/^##\s+1\.\s*模块边界表/`）；**节内限单一模块表**（N-4 · 机断口径 = 该节标题至下一 `##` 节之间仅一张 markdown 表）；该表**双兼容两套机器读法**（R1-B-1）：① graph-anchor 词表读法 —— 首列反引号 module_id 集合 = 现 `01_modules.md` 模块表 8 项逐字一致（entry / router / pages / components / api / pinia / capability / styles · 迁移期逐行 diff 核对）；② drift protocol 列形 —— 表头含「路径 glob」列（`cli-graph-drift.js:95-97` 无此表头即 throw struct_unparseable）。
- [ ] 3. `01_modules.md` 指针化（真值落点一跳明确）；根 stub `docs/_tech_graph/01_struct.md` 指向改 `l1/01_struct.md`（一跳到底 · 无指针链）且本体存续；AGENTS.md :134 local 块 HG-GRAPH-MODULES 闸路径行同步（CLAUDE.md local 块无该行 · 免改 · N-5）；**l0 三处引用随迁改 label 直指** `>../l1/01_struct.md`（`l0/00_main.graph.yaml:85` · `l0/00_main.md:34,93` · D3 定夺 · 无指针链）；全仓 grep `l1/01_modules` 引用清单逐项处置（历史留痕目录除外并声明），**枚举面**（N-3）：`.claude/skills/ops-desk-tech-graph.md:52,56,75` · `docs/skills/s-l0-project-map/SKILL.md:26` · `docs/skills/s-l1-tech-graph-ops/SKILL.md:15` · `docs/coding_wiki/context.md:25` · `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md:15`（overlay 值 · 改动须留意下次 upgrade 的 overlay 还原流程 `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md:11`）。
- [ ] 4. `npx spec-wave verify --target . --task docs/tasks/active/task_web_graph_anchor_profile_fix.md`：图谱锚点检查步输出**不含「已跳过」**且 `VERIFY: PASS`（exit 0）；输出原文贴入自检结论。
- [ ] 5. 存量回归：闸生效态下现存全部 active task + 至少 3 件近期 done task verify 抽跑，**零新增 BLOCKED**；若有新增 BLOCKED → FP-1 回退路径实跑 + 全量输出照登（含被挡 task 清单与缺失面点名）。**回归判定点**（N-6）：`verify.js:564` done 目录闸 blocked 降级 warn（done 抽跑不可能新 BLOCKED · 仅作观察面）；真实判定 = 存量 active task（现存 `task_web_hitl_approval_page`）verify 仍 PASS。
- [ ] 6. `npx spec-wave task lint --file` 本 task PASS；`task lint-wiki-delta --scope all` 零新缺口；图谱四闸（yaml check / drift / ib / ast）复验零回归 —— **drift 输入随迁机断口径**（R1-B-1③）：`.spec-wave/graph-drift.yaml:4` `struct_rel` 已改指 `l1/01_struct.md`，`npx spec-wave graph drift` 输出 `struct_layout: protocol`（以新 01_struct.md「路径 glob」列形解析成功 · 非 struct_unparseable）· drifts=0 · exit 0；`./scripts/graph-compile.sh` exit 0，除 D3 声明的 l0 label 随迁预期 diff（graph.json / shared/graph.json label 行）外零意外 diff。
- [ ] 7. 全程命令留痕可证：未使用 `--allow-no-graph-anchor` / `--allow-no-review`；`git status --short -- src tests` 空（业务源码零改动）。
- [ ] 8. `pnpm lint` / `pnpm test` / `pnpm build` 全 exit 0（过程轨质量门）；wiki_delta volatile 短注落盘。

### 自检结论（执行者）

**30 回填（2026-10-30 · invoke `docs/harness/invokes/by-task/web-graph-anchor-profile-fix/invoke_20261030_30_implement.md`）**：

| # | 验收 | 机断结果 |
|---|------|----------|
| 1 | 双 profile 一致 + isDirectory | ✅ `.coding-kit/profile.json:5` 与 `.cyning-harness/profile.json:5` 均 = `docs/_tech_graph/l1` · node 断言 isDirectory=true 双份一致 |
| 2 | 01_struct 节 RE + 单表 + 8 模块词逐字一致 | ✅ 「## 1. 模块边界表」行 9 匹配 MODULE_SECTION_HEAD_RE · 节内单表 10 行与旧 `l1/01_modules.md:11-20` 逐字一致（含「路径 glob」列 · drift protocol 双兼容） |
| 3 | 引用面 grep 清单处置 | ✅ N-3 枚举面全落地：AGENTS.md 三处 · `docs/_tech_graph/README.md` · `.claude/skills/ops-desk-tech-graph.md:52,56,75` · `docs/skills/s-l0-project-map/SKILL.md:26` · `docs/skills/s-l1-tech-graph-ops/SKILL.md:15` · `docs/coding_wiki/context.md:25` · `FRAGMENT_30_gate_verify_v1_zh.md:15`（overlay 值照登 · RUNBOOK:11 还原提醒存续） |
| 4 | verify 不含「已跳过」且 PASS | ✅ 输出原文逐字：`verify: INFO · 图谱锚点引用检查 · 图谱锚点命中（checked=2 hits=2 · 命中: docs/_tech_graph/l1 · 01_modules · 01_struct）` → `VERIFY: PASS · task_web_graph_anchor_profile_fix.md` · EXIT=0 |
| 5 | 存量回归零新 BLOCKED | ✅ N-6 真实判定点 active `task_web_hitl_approval_page` PASS（命中 l1 · 01_modules · 10_flow_capability）；done 三件 `task_web_specwave_upgrade_3_5_0`（checked=0 不涉模块）/ `task_web_hitl_approval_overlay_ux` / `task_web_hitl_decision_surface` 全 PASS EXIT=0 · 零新增 BLOCKED · FP-1 未触发 |
| 6 | task lint / lint-wiki-delta / 图谱四闸 / drift / graph-compile | ✅ `task lint --file` PASS（W3 warn 随本回填消除）；`lint-wiki-delta --scope all` PASS（scanned=69 missing=0）；`graph yaml check --all` 12 文件全 OK；`graph drift` PASS `struct_layout: protocol · dirs=1 anchors=0 drifts=0`（R1-B-1 机断口径达成 · 非 struct_unparseable）；`graph ib check` PASS checked_ib=91 issues=0；`graph ast check` PASS checked=55 issues=0；`graph-compile.sh` EXIT=0 · 除 D3 声明 l0 label 随迁预期 diff（`00_main.md:34,93` / `graph.json:173` / `shared/graph.json:173` · freeze_id 日期戳+generated_at 再生成照登）外零意外 diff |
| 7 | 豁免零使用 + src/tests 零改动 | ✅ 全程未用 `--allow-no-graph-anchor` / `--allow-no-review`；`git status --short -- src tests` 空 |
| 8 | pnpm 三件套 + volatile 短注 | ✅ `npx pnpm@10.32.1 lint` exit 0 · `test` 34 文件 334 绿 1 skip（= baseline 34/334/1）exit 0 · `build` ✓ built in 1.81s exit 0；`docs/coding_wiki/volatile.md` 短注已落 |

**闸状态对实行影响**：三闸 approved 状态零改动；HG-GRAPH-MODULES 真值位置自 `l1/01_modules.md` 迁至 `l1/01_struct.md`（AGENTS.md local 块已同步 · CLAUDE.md 免改 N-5）。

**40 独立验收（2026-10-30 · invoke `docs/harness/invokes/by-task/web-graph-anchor-profile-fix/invoke_20261030_40_verify.md`）**：不信 30 自报 · `git diff 1810be3..HEAD` 全量亲读（495 行 · 20 文件）+ 验收 1–8 逐项亲跑——全绿 PASS。

| # | 40 亲跑实证 |
|---|-------------|
| ①diff | 与 v0.5 范围①②③ 逐点对齐：双 profile :5 同值改指 · `l1/01_struct.md` 58 行新建（节+单表+四节随迁）· `01_modules.md` 7 行指针 stub · 根 stub 一跳到底本体存续（D2）· graph-drift.yaml:4 随迁 · l0 三处 label 直指 · graph.json/shared graph.json:173 label+freeze_id/generated_at 噪声符合 D3 声明 · N-3 枚举面+AGENTS.md 三处+README 两处全落地；上游 spec-wave@3.5.0 源码亲读复核（graph-anchor.js:43 RE · cli-graph-drift.js「路径 glob」表头 · runGraphDrift path.join 定位）钉案全部属实 ✅ |
| 1 | node 断言亲跑：双值 = `docs/_tech_graph/l1` · resolve 后 isDirectory=true 双份一致 ✅ |
| 2 | 节标题 L9 匹配 RE；节内（L9→L22）恰 1 表；表头含「路径 glob」；首列反引号 8 词与旧 `l1/01_modules.md` 模块表逐字一致（git show 1810be3 对照）✅ |
| 3 | 三指针一跳到底无链；grep `l1/01_modules` 171 处余量全属历史留痕/stub 自称/存量 task 历史叙述（该 task verify 仍 PASS）· 非阻塞观察项照登 ✅ |
| 4 | verify 输出逐字复核「图谱锚点命中（checked=2 hits=2 · 命中: docs/_tech_graph/l1 · 01_modules · 01_struct）」· 不含「已跳过」· VERIFY: PASS EXIT=0 ✅ |
| 5 | 存量回归零新 BLOCKED：active task_web_hitl_approval_page PASS；done 三件全 PASS EXIT=0 · FP-1 未触发 ✅ |
| 6 | task lint --file PASS · lint-wiki-delta scanned=69 missing=0 · 图谱四闸全绿（yaml 12 OK · drift struct_layout: protocol drifts=0 · ib checked_ib=91 issues=0 · ast checked=55 issues=0）· graph-compile.sh EXIT=0 复跑 diff 仅 generated_at 时间戳噪声（已还原工作树）✅ |
| 7 | 豁免零使用（diff 全量无 `--allow-no-graph-anchor`/`--allow-no-review` 痕）· `git status --short -- src tests` 空 ✅ |
| 8 | `npx pnpm@10.32.1` lint EXIT=0 · test 34 文件 334 passed 1 skipped（= baseline 34/334/1）EXIT=0 · build ✓ built in 1.81s EXIT=0 ✅ |
| ③落账 | 30 invoke 含 D5 面B 图谱锚点字面 ✓ · 自检回填逐项与 40 亲跑一致 ✓ · v0.5 在档 ✓ · 遗留四条照登合理（FRAGMENT overlay RUNBOOK:11 还原提醒 · 01_modules stub 存续 · 40 复验窗口本棒闭环 · D6 00_main 分层分歧照登）✓ |

**40 结论：PASS** · 无阻塞项；非阻塞观察一项——存量 active `task_web_hitl_approval_page.md` 文内五处 `l1/01_modules` 历史叙述行（该 task verify 仍 PASS · 留待其自身维护周期处置 · 不属本 task 范围）。

## failure_paths

| ID | 触发 | 行为（触发 → 行为 → 可重试 → 用户可见） |
|----|------|------|
| FP-1 | 闸生效后存量 task verify 突发 BLOCKED（missing graph anchor reference · 点名面A/面B） | 触发 → 按 D4 回退双 profile（闸复归 dormant · revert 级）→ 可重试（词表/锚点口径修好后重开生效）→ 用户可见 = verify exit 2 输出点名缺失面 + 本 task 自检结论照登被挡清单；**禁用 `--allow-no-graph-anchor` 遮掩** |
| FP-2 | 改指目录后词表抽取仍失败（skip · vocabulary_empty · 节名不匹配 RE / 表解析为空） | 触发 → 核对 01_struct.md 节标题与表结构（验收 2 机断面）→ 修复后重跑 verify → 用户可见 = verify INFO 行仍含「已跳过」 |
| FP-3 | 01_struct 与 01_modules 双真值漂移 | 触发 → D2 单一真值纪律阻断（01_modules 指针化 · 禁镜像）→ 迁移期逐行 diff 核对（验收 2）→ 用户可见 = 图谱四闸 drift 面 |
| FP-4 | 双 profile 改一份漏一份（.coding-kit 已改 · .cyning-harness 未改） | 触发 → 验收 1 机械断言拦截（两值一致 + isDirectory）→ 补齐重跑 → 用户可见 = verify 行为分叉（主读生效 · legacy 兜底失同步隐患） |
| FP-5 | 引用面失同步（AGENTS local 块 / 根 stub / wiki 旧指向未更新 · 禁指针链违反） | 触发 → 验收 3 grep 清单核对拦截 → 补齐 → 用户可见 = Agent 落到旧路径读错真值 |
| FP-6 | 锚点词表过宽致大量 task 恒 involved（模块词如 `api`/`pages` 高频命中 · 面A/面B 义务面扩大） | 触发 → 评估词表精化（01_struct 表内容口径 · 不动匹配规则——匹配规则属上游「可收紧不可放宽」）→ 仍不可解 → FP-1 回退 → 用户可见 = 多 task verify 新 BLOCKED 清单 |
| FP-7 | 上游 3.5.0 实机行为与升级棒实证/本 task 亲读不符 | 触发 → STOP 照登差异（版本 + 命令 + 原文输出）→ 维护者裁定 → 不臆造绕过 |

## 给执行帽（30）必读

1. 本 task 闸表（三闸 pending · **维护者亲签前拒开工** · 不代录 · 无 `--allow-no-review`）
2. `node_modules/spec-wave/lib/checks/graph-anchor.js` 全文件（判定链亲读 · 勿凭本 task 转述改码）
3. `docs/harness/reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md` G-1 + `docs/spec/doc-health/feedback/2026-10-30_3.5.0_web_upgrade.md` 摩擦点 1（实证原始记录）
4. `docs/harness/prompts/FRAGMENT_graph_first_read_v1_zh.md`（各帽义务 + verify 行为 + 豁免口径）
5. D5：本 task 全部 invoke / 审查文必须引用图谱锚点字面（`docs/_tech_graph/l1/01_struct.md` 等）——本 task 是锚点闸生效后首件活体过闸任务，面B 义务自本 task 起算
6. D4 回退口：一行 revert 双 profile 即复归 dormant；回退不是失败，是设计好的安全口
7. `docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md`（R1 退回审查 · B-1 drift 输入随迁 / B-2 l0 引用处置 / NIT×6 · 均已回填 v0.3 · 30 开工前核对落位节号）

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|-----------|----------------------|----------------|
| R0 | 需求 = 升级棒遗留 G-1（锚点闸恒 dormant）+ 维护者新原则（禁豁免 · 走 20-R1） | - | - | - |
| R1 | 亲读钉案：probeGraphAnchor 须 isDirectory；词表节 RE 与仓内两处候选均不匹配；双 profile 读序 | - | - | 3.5.0 升级尚未合入 main（实证基于 node_modules 3.5.0 + 升级分支档） |
| R2 | 指向候选三方分析：B（仓根）词表贫瘠仍 skip · C（文件路径）上游不支持 → 推荐 A（l1） | - | - | l1 指向下锚点词表宽度对存量 task 的 involved 面未全量实测 |
| R3 | 影响面盘点：HG-GRAPH-MODULES 真值迁移涟漪（AGENTS local / 根 stub / 未来 task 闸表）+ 面A/面B 义务设计 | - | - | 01_struct/01_modules 迁移期表述措辞 30 定稿 |
| R4 | 定夺封闭 D1–D7（指向 · 真值迁移单一源 · 一跳到底 · 回退口 · 面B 义务 · 00_main 照登 · 宁回退不豁免） | - | - | D2 备选一（镜像制）维护者可翻转 |
| R5 | 验收 1–8 全部可机断（isDirectory 断言 · 节 RE 匹配 · verify 输出字面 · grep 清单 · 豁免零使用留痕）；failure_paths 含回退口 FP-1 | yes | 开放点全落 D 表与验收机断面；R6 不增新决策 | 闸生效后存量 task involved 面实证只能在 30 期实跑（FP-1/FP-6 已预置） |

**actual_last_round**：R5（early_stop）

### R0

00 派单（2026-10-30）：3.5.0 升级两仓 CLOSE 后遗留事项分立 task 跟进；本仓 = 图谱锚点闸恒 dormant 修复。维护者新立原则：升级/流程类 task 一律走 20-R1 审查、禁用 `--allow-no-review`、豁免扩列须带截止条件——本 task 三闸全 pending 等亲签，不承 3.5.0 升级棒的 00 代录先例（该授权锚 m00236 为当次限定）。

### R1

亲读 `graph-anchor.js` 全链：probeGraphAnchor（isDirectory 硬要求）→ extractGraphAnchorModuleVocab（`## 1. 模块边界表` 节 RE + 首列反引号）→ extractGraphAnchorAnchorVocab（路径前缀 + flow yaml nodes/edges id + 文件 stem）→ judgeGraphAnchor（面A task 文 / 面B invokes∪reviews · 模块词命中才进入锚点判定）。仓内真值核对：根 `01_struct.md` = 8 行 stub 无节；`l1/01_modules.md` 节名 `## 模块表（必填）` 不匹配 RE；双 profile 同值 `l1/01_modules`——两重缺口互相独立，只修指向仍会 `vocabulary_empty` skip，故范围①②必须同修。

### R2

指向三候选：A `docs/_tech_graph/l1`（锚点词表最富：11 份 flow yaml 的 nodes/edges id（N-2 校正 · 实测 11 份） + `01_modules`/`10_flow_*` stem + 前缀）；B `docs/_tech_graph` 根（flow yaml 在子目录不入词表 · 根 01_struct 仍 stub → 双重不达标）；C 指文件（上游 isDirectory 硬拒）。选 A。词表源归位随之落在 l1/01_struct.md。

### R3

影响面：HG-GRAPH-MODULES 真值位置迁移 → AGENTS.md :134 local 块表述（CLAUDE.md local 块无闸路径行 · 免改 · N-5）、根 stub 指向（禁指针链 · 一跳到底）、未来 task 闸表措辞；（v0.3 回填：R1 指出原盘点漏列 `.spec-wave/graph-drift.yaml:4` 配置硬读面与 l0 层三处引用 —— 分别落范围 ③/依赖与 D3 定夺 · B-1/B-2）历史留痕不改（旧文 `l1/01_modules` 记载合法存续）。面A/面B 义务：本 task 生效后自身即被闸判——验收/failure_paths 节内已预埋锚点字面（`docs/_tech_graph/l1/01_struct.md`），面B 义务写入 30 必读（D5）。

### R4

定夺封闭 D1–D7。关键取舍：D2 选真值迁移（单源）而非镜像（双源无防漂移机检 · FP-3）；D4 回退口设计成一行 revert 级（profile 还原即 dormant · 上游契约照登）；D7 宁回退不豁免对齐维护者原则。

### R5

验收全机断化：1（isDirectory 断言）2（节 RE + 表逐行 diff）3（grep 清单）4（verify 输出不含「已跳过」+ PASS）5（存量回归零新 BLOCKED）7（豁免零使用留痕）。failure_paths 七条含回退口/词表失败/漂移/半改/失同步/词表过宽/上游行为漂移。early_stop：R6 不增新决策。

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-30 | v0.1 · 10-task 落稿：升级棒实证钉案（G-1 + FEEDBACK 摩擦点 1）+ graph-anchor.js 源码亲读复核（isDirectory / 词表节 RE / 面A面B 判定链）+ 范围四项 + 非范围六项 + D1–D7 定夺 + 验收 1–8 + failure_paths FP-1–FP-7（含回退口）+ R0–R5 early_stop · 三闸 pending 等维护者亲签（不代录 · 禁豁免）· 未改实现码 / 未切分支 / 未 commit |
| 2026-10-30 | v0.2 · 闸代录：HG-TASK-DRAFT pending→approved（00 代录 · 授权锚 m00500 · 维护者令「完成后开始 web 和 api 的后续 task，授权签收所有文档」）；HG-AUDIT-R1 / HG-GRAPH-MODULES 保持 pending 不动 |
| 2026-10-30 | v0.3 · R1 退回回填（审查文 `docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md` · untracked 留存未 commit）：**B-1** drift 输入随迁（范围 ③ 补列 `.spec-wave/graph-drift.yaml:4` struct_rel→`l1/01_struct.md` · 01_struct 节双兼容列形+单表约束落 范围②/D2/验收 2 · 验收 6 补 drift 机断口径）+ **B-2** l0 引用处置定夺写死 D3（随迁改 label 直指 01_struct · graph-compile label diff 声明预期 · graph_delta_note/非范围对齐）+ **NIT×6 全采纳**（N-1 probeGraphAnchor :13-44→:13-41 · N-2 flow yaml 10→11 份 · N-3 验收 3 引用面枚举五处 · N-4 节限单表 · N-5 CLAUDE.md 免改 · N-6 验收 5 回归判定点=存量 active `task_web_hitl_approval_page`）· 闸一律不动 |
| 2026-10-30 | v0.4 · 闸代录：HG-AUDIT-R1 + HG-GRAPH-MODULES pending→approved（00 代录 · 授权锚 m00500 · R1 退回→v0.3 回填→R2 通过零阻塞 · 审查文 R1/R2 双件入库）；闸表头注与状态行「不代录/双闸 pending」字面同步修正对齐 m00500 授权 |
| 2026-10-30 | v0.5 · 30 实现落账：范围①②③ 全落地（双 profile→`docs/_tech_graph/l1` · `l1/01_struct.md` 词表真值新建+表自 `l1/01_modules.md:11-20` 逐字平移 · 01_modules 指针化 · 根 stub 一跳到底 · drift `struct_rel`+l0 三处 label 随迁）+ 引用面 N-3 枚举全同步 + 30 invoke 落盘（D5 面B 义务）+ 自检结论验收 1–8 逐项机断回填（verify 真判定 `checked=2 hits=2` 不再 skip · 回归零新 BLOCKED · 四闸+drift protocol drifts=0 · 三件套全绿 = baseline 34/334/1）· 待 40 复验 |
| 2026-10-30 | v0.6 · 40 独立验收落账：diff 1810be3..HEAD 全量亲读 + 验收 1–8 逐项亲跑实证全绿（上游 3.5.0 源码复核钉案属实 · verify 真判定 checked=2 hits=2 逐字复核 · 存量回归零新 BLOCKED · 四闸+drift protocol drifts=0 · graph-compile 复跑仅 generated_at 噪声 · 三件套全绿 = baseline 34/334/1）+ 30 落账抽核通过（D5 面B 字面 / 回填质量 / v0.5 在档 / 遗留四条照登合理）→ **结论 PASS · 无阻塞项** · 非阻塞观察一项（存量 active task_web_hitl_approval_page 文内五处 `l1/01_modules` 历史叙述行 · 该 task verify 仍 PASS）· 40 invoke 落盘 · 待维护者 CLOSE |
