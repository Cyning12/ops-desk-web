# task_web_graph_anchor_profile_fix 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_graph_anchor_profile_fix.md`（v0.2 · HG-TASK-DRAFT 代录 approved · 授权锚 m00500）
> **审查帽**：20-task-audit（R1 · 新原则首单：全走审查零豁免）
> **日期**：2026-10-30 · **仓**：ops-desk-web · **分支**：`task/web-graph-anchor-profile-fix`（base：`main` 856b641 · 含 3.5.0 钉版）
> **对照钉案**：spec-wave@3.5.0 包源码（`node_modules/spec-wave/lib/checks/graph-anchor.js` · `lib/verify.js` · `lib/cli-graph-drift.js` · `lib/checks/review-gates.js`）· 上游 MIGRATION.md 3.5.0 · 升级棒 R1 审查 G-1（`docs/harness/reviews/task_web_specwave_upgrade_3_5_0_audit_R1_20261030.md:62`）
> **审查纪律**：书面审查不改 task 实质内容 · 闸一律不动（本审查不签任何 human_gate）

---

## 结论

本审查 **退回**（内容阻塞 · 2 项阻塞 + 6 项 NIT）。

**内容维度**：task 对 3.5.0 图谱锚点闸的契约理解（probeGraphAnchor 可达性判定、MODULE_SECTION_HEAD_RE 词表源、双重缺口诊断、面A/面B 义务）经包源码逐行独立复核**全部属实**，方向正确、诊断扎实。但 D2「真值迁移单源」的影响面盘点漏掉一处**硬耦合**（B-1：`.spec-wave/graph-drift.yaml` 的 `struct_rel` 指向将被指针化的 `docs/_tech_graph/l1/01_modules.md`，graph drift 闸在迁移后必 FAIL，验收 6 不可达），且 l0 层对 01_modules 的引用与 D3「禁指针链」存在未裁决的口径冲突（B-2）。两项均属「30 开工后必踩、且须 10 先行定夺」的结构性缺口，依零豁免首单标准退回回填。

**流程维度**：HG-TASK-DRAFT 代录 approved（锚 m00500）已核；HG-AUDIT-R1 保持 **pending**（本审查退回 · 不签）；HG-GRAPH-MODULES 不动。verify 当前 BLOCKED 于 HG-AUDIT-R1 pending，属预期。

---

## 1. 独立重跑闸（本审查实跑 · 真实输出）

| 命令 | 实跑结果 | 与预期一致？ |
|------|----------|--------------------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_graph_anchor_profile_fix.md` | `LINT: PASS`（W3 自检占位 warn · draft 期合法）· exit 0 | ✓ |
| `npx spec-wave verify --target . --task docs/tasks/active/task_web_graph_anchor_profile_fix.md` | `VERIFY: BLOCKED · HG-AUDIT-R1 pending` · exit 2（闸表：HG-TASK-DRAFT approved / HG-AUDIT-R1 pending 拒 30 / HG-GRAPH-MODULES pending） | ✓ 预期 |
| `npx spec-wave graph drift`（现状基线） | `PASS` · struct_layout: protocol · dirs=1 anchors=0 drifts=0 · exit 0 | ✓（B-1 的「现状绿」前提成立） |
| `git status --short` | 仅 task/审查文等文档面 · 业务源码零改动 | ✓ |

## 2. 派单重点逐项核对（对照钉案独立复核）

### 核对 1 · probeGraphAnchor 可达性判定与词表源契约 —— **属实 ✓**

包源码亲读（`node_modules/spec-wave/lib/checks/graph-anchor.js`）：

- `probeGraphAnchor`（:13-41）：`statSync(graphPath).isDirectory()`（:33）为可达性硬条件，不可达 → `graph_path_unreachable` → 检查步 skip 不挡 ✓
- `MODULE_SECTION_HEAD_RE = /^##\s+1\.\s*模块边界表/`（:43）✓ 词表源确为 `<graphPath>/01_struct.md` 中「## 1. 模块边界表」节
- `extractGraphAnchorModuleVocab`（:54-88）：收集节内**全部**表行首列反引号词（只跳首行当表头）——task 理解正确；节内若有多张表会多吃词（见 NIT N-4）

### 核对 2 · 双重缺口诊断 —— **属实 ✓**

- 仓根 `docs/_tech_graph/01_struct.md`：8 行 stub，无「## 1. 模块边界表」节 ✓
- `docs/_tech_graph/l1/01_modules.md:9`：节名「## 模块表（必填）」不匹配 RE ✓
- 双 profile `.coding-kit/profile.json:5` 与 `.cyning-harness/profile.json:5` 均 `graph_modules_path: "l1/01_modules"`（自仓根不可达为目录 → 闸 dormant）✓ 与升级棒 R1 G-1 互证

### 核对 3 · D1 定夺与 D2 真值迁移影响面 —— **方向成立 · 两处缺口见 §3 阻塞项**

- D1 指向 `docs/_tech_graph/l1`（目录 · 过 isDirectory）成立；l1/ 内含 `01_modules.md` 与 11 份 `10_flow_*.graph.yaml`（task 行文「10 份」· 见 NIT N-2）
- D2 迁移面（`docs/_tech_graph/l1/01_struct.md` 成真值 · `docs/_tech_graph/l1/01_modules.md` 指针化 · HG-GRAPH-MODULES 闸路径随迁）整体成立，但：
  - profile `graph_modules_path` 现值 `"l1/01_modules"` 的双文件（.coding-kit / .cyning-harness）改值面 task 已列 ✓
  - AGENTS.md 引用面（:28 必读表 · :90 闸表 · :134 local 块闸路径行）已列 ✓；CLAUDE.md local 块无闸路径行（见 NIT N-5）
  - **漏列 `.spec-wave/graph-drift.yaml`（B-1）与 l0 层引用（B-2）** —— 见 §3

### 核对 4 · 验收 1–8 可机断性 / failure_paths / 非范围 / R0–R5 —— **结构合规 · 一处可达性缺陷**

- 验收 1–8 逐条均可机断（命令 + 期望输出可判）；但验收 6「图谱四闸复验零回归」在 B-1 未回填前**不可达**（drift 必 FAIL）
- FP-1–FP-7 结构齐整：FP-1 存量 task BLOCKED 回退口（--allow-no-graph-anchor / profile 回退）与 FRAGMENT_graph_first_read :32 豁免清单自洽 ✓（D6 照登成立：豁免仅此一口）
- 非范围 6 项边界清晰；R0–R5 思考轮结构过 lint ✓
- `verify.js` 闸序实证：gate-check（:335）→ test_strategy → task lint → 思考轮 G4 → findReview（:416）→ 审查文结论机读（:432）→ pre-30 invoke hats（:473 · PRE30={10}）→ graph anchor（:498）→ wiki-lint；task 引用的 :507 inform 行逐字一致 ✓

### 核对 5 · 「锚点闸首件活体过闸」自洽性 —— **自洽 ✓**

- `judgeGraphAnchor`（:214-248）：面A=task 全文、判定面=验收∪failure_paths 节、面B=invokes∪reviews；`listTaskReviews` 址A 模式 `task_<slug>_audit_R<n>_*.md` —— 本审查文命名匹配，落盘后即入面B ✓
- 面B 非空无锚点且非豁免 → blocked 点名面B ✓；本审查文已按 D5 义务含图谱锚点字面引用（`docs/_tech_graph/l1/01_struct.md` · `docs/_tech_graph/l1/01_modules.md` · `docs/_tech_graph/l1/10_flow_*.graph.yaml`）
- 30/40 invoke 义务（required_invoke_hats 含 30）与闸判定逻辑自洽 ✓
- 存量回归预判：active `task_web_hitl_approval_page` 面A 含 `docs/_tech_graph/l1` 前缀 + 验收含 `pages` 模块词 · 面B 3/5 invoke + R1 审查文含锚点字面 → 闸生效后预判 PASS，验收 5 可行 ✓（注：`verify.js:564` done 目录 blocked 降级 warn，故验收 5 的 done 抽跑不可能新 BLOCKED · 真实回归面=存量 active，task 表述可再精确 · 并入 NIT N-6）

---

## 3. 阻塞项（退回理由 · 须 10 回填后 R2 复审）

### B-1 · `.spec-wave/graph-drift.yaml` 的 `struct_rel` 迁移漏列 → 验收 6 不可达

- **实证**：`.spec-wave/graph-drift.yaml:4` `struct_rel: l1/01_modules.md`。graph drift 闸以 `join(docs/_tech_graph, structRel)` 定位 struct 文件（`cli-graph-drift.js:229`），`parseStructModuleGlobs` 在无「路径 glob」表头时直接 throw（:95-97）→ `struct_unparseable`。
- **后果链**：D2 将 `docs/_tech_graph/l1/01_modules.md` 指针化（stub 无协议列表头）→ drift 闸由现状 PASS（struct_layout: protocol · drifts=0 · 本审查 §1 实跑）转为 FAIL → 验收 6「图谱四闸复验零回归」**机断不可达**。
- **漏列面**：task 全文（范围 / R3 影响面盘点 / 依赖）未提及 `.spec-wave/graph-drift.yaml`；该文件在 `docs/` 之外，恰是 grep 引用面盘点最易漏的一类（配置硬读，非文字引用）。
- **回填要求（钉案锚点）**：① 范围/依赖补列 `.spec-wave/graph-drift.yaml`，`struct_rel` 随迁 `l1/01_struct.md`；② 新 `docs/_tech_graph/l1/01_struct.md` 的「## 1. 模块边界表」节**必须同时满足两套机器读法**——graph-anchor 词表（首列反引号模块词 · `graph-anchor.js:43,54-88`）与 drift protocol 列形（「路径 glob」表头 · `cli-graph-drift.js:95-97`）；task 须把该双兼容列形写进模板/验收，否则 drift 仍 unparseable。③ 验收 6 补一条 drift 输入随迁的机断口径。

### B-2 · l0 层对 01_modules 的引用 → 与 D3「禁指针链」存在未裁决冲突

- **实证**：`docs/_tech_graph/l0/00_main.graph.yaml:85`、`docs/_tech_graph/l0/00_main.md:34,93`、编译产物 `docs/_tech_graph/graph.json` 与 `shared/graph.json`（:173）均指 `>../l1/01_modules.md`。
- **冲突**：01_modules 指针化后形成 l0 → `l1/01_modules.md`（指针）→ `l1/01_struct.md` 的**指针链**，正面违反 task D3「禁指针链」；若改 l0 label 直指 01_struct，则触发 graph-compile 产物 diff，与 `graph_delta_note`「零意外 diff」及非范围「l0 层结构调整」形成口径张力。
- **定夺缺口**：l0 引用是「随迁改 label（声明预期 diff）」还是「豁免 l0 指针（D3 注明例外与理由）」，task 未给裁决路径 —— 属 10 定夺，非 30 现场可判。
- **回填要求**：D3 或依赖节补 l0 引用处置口径 + graph-compile 预期 diff 的声明方式；非范围与 graph_delta_note 相应对齐。

---

## 4. NIT 清单（不阻塞 · 回填时顺手修）

| ID | 内容 |
|----|------|
| N-1 | task 引用 `graph-anchor.js:13-44` 实测函数体至 :41（行号微偏 · 不影响语义） |
| N-2 | D1/R2 写 l1/ 下「10 份 10_flow_*.graph.yaml」· 实测 **11** 份 |
| N-3 | 引用面 grep 条款（验收 3）可兜但建议枚举：`.claude/skills/ops-desk-tech-graph.md:52,56,75` · `docs/skills/s-l0-project-map/SKILL.md:26` · `docs/skills/s-l1-tech-graph-ops/SKILL.md:15` · `docs/coding_wiki/context.md:25` · `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md:15`（`{l1/01_modules或—}` overlay 值 · 改动须留意下次 upgrade 的 overlay 还原流程 `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md:11`） |
| N-4 | `extractGraphAnchorModuleVocab` 对节内**所有**表行取首列词（仅跳首行）——新 `01_struct.md` 若在「## 1. 模块边界表」节内放多张表会多吃词；建议 task 模板注明「该节单一模块表」约束 |
| N-5 | D3 措辞「AGENTS.md/CLAUDE.md 双文件同步」——CLAUDE.md local 块实无闸路径行（仅指回 AGENTS.md）· 建议改为「AGENTS.md :134 local 块行为准 · CLAUDE.md 免改」 |
| N-6 | 验收 5「done 抽跑」注记：`verify.js:564` done 目录闸 blocked 降级 warn，抽跑不可能新 BLOCKED——建议把回归判定点明确为「存量 active task（task_web_hitl_approval_page）verify 仍 PASS」 |

---

## 5. 签闸记录

| 闸 | 状态 | 记录 |
|----|------|------|
| HG-TASK-DRAFT | approved（代录 · 锚 m00500） | 本审查核对 · 不动 |
| HG-AUDIT-R1 | **pending（不动）** | 本审查退回（B-1/B-2）· 待 10 回填 + R2 复审后由维护者签 |
| HG-GRAPH-MODULES | pending（不动） | 本 task 生效后随迁对象 · 非本审查处置面 |

> 审查文路径：`docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md`（untracked · 不 commit · 由上级处置）
