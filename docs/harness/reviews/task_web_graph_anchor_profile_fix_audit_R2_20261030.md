# task_web_graph_anchor_profile_fix 审查（R2 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_graph_anchor_profile_fix.md`（v0.3 · commit c8b2546 · R1 退回回填毕）
> **审查帽**：20-task-audit（R2 复审 · R1 两阻塞项闭合核对 + NIT×6 核位 + 新矛盾扫描）
> **日期**：2026-10-30 · **仓**：ops-desk-web · **分支**：`task/web-graph-anchor-profile-fix`（审毕切回 main）
> **对照钉案**：spec-wave@3.5.0 包源码（`node_modules/spec-wave/lib/checks/graph-anchor.js` · `lib/cli/verify.js` · `lib/cli-graph-drift.js` · `lib/cli-lifecycle.js` · `lib/checks/review-gates.js`）· R1 审查文 `docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md`
> **审查纪律**：书面审查不改 task 实质内容 · 闸一律不动（本审查不签任何 human_gate）· 不 commit（本审查文 untracked 留存）
> **面B 锚点义务（D5）**：本审查文含图谱锚点字面引用 `docs/_tech_graph/l1/01_struct.md` · `docs/_tech_graph/l1/01_modules.md` · `docs/_tech_graph/l1/10_flow_*.graph.yaml`

---

## 结论

本审查 **通过**（零内容阻塞 · 零阻塞项遗留 · 残余 NIT×2 不阻塞 · 可交维护者签闸）。

**内容维度**：R1 两阻塞项 B-1（drift 闸输入随迁）/ B-2（l0 引用处置定夺）经包源码与仓内文件逐锚点独立复核**闭合属实**；NIT×6 全部如实落位且行号/路径/计数与实证一致；v0.2→v0.3 回填改动面（+21/-17）通读，与 R0–R5 思考轮、验收 1–8、failure_paths FP-1–FP-7、非范围交叉核对**无新增矛盾**。task 已达可执行可验收标准。

**流程维度**：HG-TASK-DRAFT 代录 approved（锚 m00500）已核不动；HG-AUDIT-R1 保持 **pending**（本审查通过 · 依纪律不代签 · 等维护者亲签）；HG-GRAPH-MODULES 保持 pending 不动。verify 当前 BLOCKED 于 HG-AUDIT-R1 pending，属预期。

---

## R1 退回沿革（独立成节 · 沿革记录非本轮结论）

- R1（`docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R1_20261030.md` · 2026-10-30）：结论退回，内容阻塞 2 项（B-1 `.spec-wave/graph-drift.yaml:4` `struct_rel` 迁移漏列 → 验收 6 不可达；B-2 l0 层 `>../l1/01_modules.md` 引用与 D3 禁指针链存在未裁决冲突）+ NIT×6（N-1 行号微偏 / N-2 flow 份数 / N-3 引用面枚举 / N-4 节限单表 / N-5 CLAUDE.md 免改 / N-6 回归判定点）。
- 10-task 回填 → v0.3（commit c8b2546 · +21/-17 · 闸一律不动）。
- 本轮 R2 职责即核对上列退回项是否真正闭合；逐项核对结果见 §2/§3/§4，闭合属实，沿革至此闭环。

---

## 1. 独立重跑闸（本审查实跑 · 真实输出）

| 命令 | 实跑结果 | 与预期一致？ |
|------|----------|--------------------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_graph_anchor_profile_fix.md` | `LINT: PASS`（W3 自检占位 warn · draft 期合法）· exit 0 | ✓ |
| `npx spec-wave verify --target . --task docs/tasks/active/task_web_graph_anchor_profile_fix.md` | `VERIFY: BLOCKED · HG-AUDIT-R1 pending` · exit 2（闸表：HG-TASK-DRAFT approved / HG-AUDIT-R1 pending 拒 30 / HG-GRAPH-MODULES pending） | ✓ 预期（pending 拒开工口径正确） |
| `git status --short` | 仅 reviews 审查文等文档面 untracked · 业务源码零改动 | ✓ |
| `git diff 78fdda3..c8b2546 --stat` | 单文件 +21/-17（仅 task 文档） | ✓ 与修订记录 v0.3 行自述一致 |

## 2. B-1 闭合核对（drift 闸输入随迁）—— **闭合 ✓**

R1 回填要求三条逐项核对：

- **① 范围/依赖补列 + struct_rel 随迁**：范围③（task :64）补列 `.spec-wave/graph-drift.yaml:4` `struct_rel: l1/01_modules.md` → `l1/01_struct.md`；依赖（task :93）同列。实证复核：`.spec-wave/graph-drift.yaml:4` 现值确为 `struct_rel: l1/01_modules.md` ✓；`cli-graph-drift.js:229` 实为 `const structAbs = path.join(opts.inputRoot, structRel);` ✓（task 引 `join(inputRoot, structRel)` 属实）；`parseStructModuleGlobs` 的 `if (!layout) throw` 块实居 :95-97（throw 行 :96）✓，`struct_unparseable` drift kind 见 :247 ✓。
- **②「## 1. 模块边界表」节双兼容**：范围②（task :63）/ D2（task :82）/ 验收 2（task :103）三处写死双兼容列形——graph-anchor 词表读法（首列反引号 module_id 词 · `graph-anchor.js:43` 节 RE + :54-88 吃节内全部表行首列词）+ drift protocol 列形（表头含「路径 glob」列）。实证复核：`MODULE_SECTION_HEAD_RE = /^##\s+1\.\s*模块边界表/` 实居 `graph-anchor.js:43` ✓；`extractGraphAnchorModuleVocab` 实居 :54-88（export :54 · 收尾 `}` :88），其 seenHeader 仅跳首行、节内全部表行首列词皆入词表 ✓（N-4 依据成立）；drift 侧 protocol 布局判定 = 表头含「路径 glob」列（`cli-graph-drift.js:48` `layout = 'protocol'`）✓。现 `docs/_tech_graph/l1/01_modules.md:11` 表头恰含「路径 glob」列（`| module_id | 名称 | 路径 glob | 依赖方向（仅指向谁） | 负责人/备注 |`），逐字平移后双兼容天然成立 ✓。
- **③ 验收 6 drift 机断口径**：验收 6（task :107）补「`struct_rel` 已改指 `l1/01_struct.md`，`npx spec-wave graph drift` 输出 `struct_layout: protocol` · drifts=0 · exit 0」——与 R1 §1 实跑现状基线（`struct_layout: protocol` · drifts=0）同口径，迁移后机断可达 ✓。

## 3. B-2 闭合核对（l0 引用处置定夺）—— **闭合 ✓**

R1 要求「D3 或依赖节补 l0 引用处置口径 + graph-compile 预期 diff 声明方式；非范围与 graph_delta_note 相应对齐」：

- **D3 定夺写死 = 随迁改 label**（task :83）：`l0/00_main.graph.yaml:85` · `l0/00_main.md:34,93` 三处 `>../l1/01_modules.md` 随迁改指 `>../l1/01_struct.md`，理由（不改则成 l0→01_modules 指针→01_struct 指针链 · 正面违反禁指针链）成立。实证复核三处行号：`l0/00_main.graph.yaml:85` = `label: ">../l1/01_modules.md"` ✓；`l0/00_main.md:34` = `modules_doc[">../l1/01_modules.md"]` ✓、`:93` = `| modules_doc | >../l1/01_modules.md | external |` ✓。
- **graph.json / shared/graph.json:173 label diff 声明为预期 diff**：D3 与验收 6（task :107）均声明。实证复核：`docs/_tech_graph/graph.json:173` 与 `docs/_tech_graph/shared/graph.json:173` 均为 `"label": ">../l1/01_modules.md"`（modules_doc 节点）✓。
- **graph_delta_note / 非范围对齐**：graph_delta_note（task :25）改「除 D3 声明的 l0 label 随迁预期 diff（graph.json / shared/graph.json label 行 · R1-B-2）外零意外 diff」✓；非范围（task :70）补「l0 label 随迁改指属引用内容同步（nodes/edges 拓扑零改动 · 非结构调整 · D3 定夺已列范围）」✓。B-2 原口径张力（零意外 diff vs label diff · l0 结构调整 vs label 随迁）已消解 ✓。验收 3（task :104）同步列入 l0 三处随迁 ✓。

## 4. NIT×6 逐条核位 —— **全落位 ✓**

| ID | R1 要求 | v0.3 落位 | 本审查实证复核 |
|----|---------|-----------|----------------|
| N-1 | probeGraphAnchor :13-44 → 函数体实至 :41 | 依赖（task :91）改 `probeGraphAnchor :13-41 目录判定（N-1 校正 · 函数体至 :41）` | ✓ `graph-anchor.js` export :13 · 收尾 `}` :41（:42 起为下节注释） |
| N-2 | l1/ 下 flow yaml 10 份 → 实测 11 份 | R2 思考轮（task :160）改「11 份 flow yaml …（N-2 校正 · 实测 11 份）」 | ✓ `ls docs/_tech_graph/l1/` 实测 `10_flow_*.graph.yaml` 恰 11 份；全文无「10 份」残留（grep 核实） |
| N-3 | 验收 3 引用面枚举五处 | 验收 3（task :104）枚举 `.claude/skills/ops-desk-tech-graph.md:52,56,75` · `docs/skills/s-l0-project-map/SKILL.md:26` · `docs/skills/s-l1-tech-graph-ops/SKILL.md:15` · `docs/coding_wiki/context.md:25` · `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md:15` + RUNBOOK :11 overlay 提醒 | ✓ 五处逐行 sed 复核皆命中 `l1/01_modules` 字面；`FRAGMENT_30_gate_verify_v1_zh.md:15` 确为 `{l1/01_modules或—}` overlay 值；`RUNBOOK_harness_upgrade_v1_zh.md:11` 确载 overlay 还原流程 |
| N-4 | 节限单一模块表约束 | 范围②（task :63）/ D2（task :82）/ 验收 2（task :103 · 机断口径 = 节标题至下一 `##` 节之间仅一张 markdown 表）三处写死 | ✓ 与 `extractGraphAnchorModuleVocab` :54-88 实机行为（节内全部表行吃词 · seenHeader 仅跳首行 · HEADING_L2_RE 止节）一致 |
| N-5 | CLAUDE.md 免改（local 块无闸路径行） | D3（task :83）/ 依赖（task :98）/ 验收 3（task :104）/ R3（task :164）四处改「AGENTS.md :134 为准 · CLAUDE.md 免改」 | ✓ `AGENTS.md:134` 确为「图谱闸路径：`HG-GRAPH-MODULES` → `docs/_tech_graph/l1/01_modules.md`」行；CLAUDE.md local 块全文仅「仓内定制见 `AGENTS.md` 的 cyning-harness-local 块」一句，无闸路径行 |
| N-6 | 验收 5 回归判定点 = 存量 active task | 验收 5（task :106）补「`verify.js:564` done 目录闸 blocked 降级 warn · 真实判定 = 存量 active task（现存 `task_web_hitl_approval_page`）verify 仍 PASS」；依赖（task :92）同列 | ✓ `verify.js:564` 实为 `else if (isDoneTask) {` 降级 warn 分支（:565 `done 目录审计降级 warn`）；`docs/tasks/active/` 现存 active task 确为 `task_web_hitl_approval_page.md`（+ 本 task 自身） |

## 5. 新矛盾扫描（v0.2→v0.3 回填面 +21/-17 通读）—— **未见新矛盾 ✓**

- **范围重编号**：旧 ③④ 顺延为 ④⑤，全文无按旧编号引用范围条目处（R3 思考轮 task :164「分别落范围 ③/依赖」恰指新 ③ = drift 随迁 ✓）。
- **依赖节行号联动修正**：extractGraphAnchorModuleVocab :62-87→:54-88、judgeGraphAnchor :218-248→:214-248，与 R1 §2 核对 1/核对 5 的实证行号一致 ✓（judgeGraphAnchor 实证 export :214 · 收尾 `}` :248 ✓）。
- **验收 2/3/5/6 改写**：与范围②③、D2/D3、N-3/N-4/N-5/N-6 交叉一致；验收 6 的 graph-compile 预期 diff 声明与 graph_delta_note（task :25）、非范围（task :70）、D3（task :83）四面口径合一 ✓。
- **30 必读新增第 7 条**（task :135 · R1 审查文落位节号核对）：与修订记录 v0.3 行、本审查 §2–§4 闭合结论互洽 ✓。
- **思考轮 R0–R5**：仅 R2（11 份校正）/ R3（v0.3 回填注记）有改动，R5 early_stop 结论与 actual_last_round 不动，回填未引入新决策轮 ✓。
- **闸表零改动**：v0.3 diff 不触人工闸表，HG-TASK-DRAFT approved / HG-AUDIT-R1 pending / HG-GRAPH-MODULES pending 维持 ✓（「闸一律不动」属实）。
- **历史留痕边界**：修订记录 v0.1 行自述「范围四项」为 v0.1 当时事实的历史记载，非现行口径，不构成矛盾 ✓。

## 6. 残余 NIT（不阻塞 · 30 期顺手或另案）

| ID | 内容 |
|----|------|
| R2-N-1 | 依赖（task :91）`extractGraphAnchorAnchorVocab :91-145` 实测函数体 :92-143（:91 为上方注释行 · :144 起为下一函数注释块）——与 R1 N-1 同类的行号微偏，不影响语义；30 必读第 2 条本就要求亲读 `graph-anchor.js` 全文件，误导风险为零 |
| R2-N-2 | 范围②/依赖/验收 2 的「无『路径 glob』表头即 throw struct_unparseable」措辞沿袭 R1 原文，实机上 `parseStructModuleGlobs` 尚有 dogfood_legacy 旧列形兜底（`cli-graph-drift.js:58` · 模块\|职责\|读\|写 列形不 throw）；但验收 6 机断口径锁死 `struct_layout: protocol`，dogfood 落形会被该口径拦下，机断面无缺口 |

## 7. 签闸记录

| 闸 | 状态 | 记录 |
|----|------|------|
| HG-TASK-DRAFT | approved（代录 · 锚 m00500） | 本审查核对 · 不动 |
| HG-AUDIT-R1 | **pending（不动）** | 本审查 R2 通过 · 依纪律不代签 · 待维护者亲签 |
| HG-GRAPH-MODULES | pending（不动） | 本 task 生效后随迁对象 · 非本审查处置面 |

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R2 审查结论（通过 · 零内容阻塞 · 残余 NIT×2 不阻塞）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] HG-GRAPH-MODULES 闸路径语义变更（01_modules.md → 01_struct.md · D2/D3）一并签收
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

> 审查文路径：`docs/harness/reviews/task_web_graph_anchor_profile_fix_audit_R2_20261030.md`（untracked · 不 commit · 由上级处置）
