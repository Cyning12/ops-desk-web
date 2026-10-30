# Invoke · 30 实现 · web-graph-anchor-profile-fix（2026-10-30）

- **帽**：30 实现
- **task**：`docs/tasks/active/task_web_graph_anchor_profile_fix.md`（v0.4 · 三闸 approved · 授权锚 m00500）
- **分支**：`task/web-graph-anchor-profile-fix`（base HEAD 1810be3）
- **图谱锚点引用（D5 面B 义务）**：本 invoke 字面条目 `docs/_tech_graph/l1/01_struct.md`（词表真值）· `docs/_tech_graph/l1/01_modules.md`（过渡 stub）· `docs/_tech_graph/l1/10_flow_*.graph.yaml`（flow 锚点词表源）· `docs/_tech_graph/l0/00_main.graph.yaml`。

## 1. 开工核验

- GATE_VERIFY 基线（改码前首跑）：`HG-TASK-DRAFT/HG-AUDIT-R1/HG-GRAPH-MODULES` 均 approved（task 人工闸表真值 · 授权锚 m00500）；图谱锚点检查输出 `已跳过 · graph_path_unreachable · graph_modules_path=l1/01_modules`（dormant 实证 · 本 task 修复对象）；EXIT=0 → 可开工。
- 源码亲读复核（node_modules spec-wave@3.5.0）：`graph-anchor.js` probeGraphAnchor :13-41 isDirectory 硬要求；MODULE_SECTION_HEAD_RE=/^##\s+1\.\s*模块边界表/；extractGraphAnchorModuleVocab :54-88 节内表行首列反引号词；judgeGraphAnchor :214-248 面A（task 验收∪failure_paths 节）/面B（invokes∪reviews）。`cli-graph-drift.js` :95-97 无「路径 glob」表头即 struct_unparseable · :229 join(inputRoot, structRel)。

## 2. 改动面（与 task 范围 ①②③ 一一对应）

① **profile 指向**：`.coding-kit/profile.json:5` 与 `.cyning-harness/profile.json:5` 双份 `graph_modules_path` → `docs/_tech_graph/l1`（isDirectory 可达 · node 断言双份一致）。

② **词表真值迁移单源**：新建 `docs/_tech_graph/l1/01_struct.md`（「## 1. 模块边界表」节 · 节内限单表 · 表 10 行自 `l1/01_modules.md:11-20` 逐字平移 · 表头含「路径 glob」列 drift protocol 双兼容 · 跨模块契约/人签记录（追加本 task 人签行）/关联节随迁）；`l1/01_modules.md` 指针化（一跳指 `l1/01_struct.md` · 禁指针链）；根 `docs/_tech_graph/01_struct.md` stub 改指 `l1/01_struct.md`（D2 一跳到底）；`AGENTS.md` 闸真值位置行 + 关键约束行 + local 块闸路径行随迁（:134 · CLAUDE.md 无该行免改 · N-5）。

③ **drift 闸输入随迁**：`.spec-wave/graph-drift.yaml:4` `struct_rel` → `l1/01_struct.md`（:2 注释同步）；`l0/00_main.graph.yaml:85` label → `>../l1/01_struct.md`；`graph-compile.sh` EXIT=0 复跑后 `l0/00_main.md:34,93` + `graph.json:173` + `shared/graph.json:173` label 随迁为 D3 声明的预期 diff（freeze_id 日期戳 + generated_at 随编译再生成 · 同文件载 label 必提交故照登入库）；flow .md 重生成零 diff。

**引用面同步（验收 3 · N-3 枚举面）**：`docs/_tech_graph/README.md`（读序第 3 步 + 结构行）· `.claude/skills/ops-desk-tech-graph.md:52,56,75` · `docs/skills/s-l0-project-map/SKILL.md:26` · `docs/skills/s-l1-tech-graph-ops/SKILL.md:15` · `docs/coding_wiki/context.md:25` · `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md:15`（overlay 值照登 · RUNBOOK:11 还原提醒存续）。

## 3. 实证（验收口径）

- 本 task verify 真判定（首件活体过闸）：`verify: INFO · 图谱锚点引用检查 · 图谱锚点命中（checked=2 hits=2 · 命中: docs/_tech_graph/l1 · 01_modules · 01_struct）` → `VERIFY: PASS · task_web_graph_anchor_profile_fix.md` · EXIT=0，**不再含「已跳过」**（面A=task 文 01_struct 字面 · 面B=R1/R2 审查文+本 invoke 的 l1/01_modules 字面）。
- 存量回归零新 BLOCKED：active `task_web_hitl_approval_page` PASS（命中 l1 · 01_modules · 10_flow_capability · N-6 真实判定点）；done 三件 `task_web_specwave_upgrade_3_5_0`（checked=0 不涉模块）/ `task_web_hitl_approval_overlay_ux` / `task_web_hitl_decision_surface` 全 PASS EXIT=0。
- 图谱四闸零回归：`graph yaml check --all` 12 文件全 OK；`graph drift` PASS（`struct_layout: protocol` · checked dirs=1 anchors=0 drifts=0 · 非 struct_unparseable）；`graph ib check` PASS（checked_ib=91 issues=0）；`graph ast check` PASS（checked=55 skipped_ib=16 issues=0）。
- 质量门：`task lint --file` 本 task PASS；`task lint-wiki-delta --scope all` PASS（scanned=69 missing=0）；`npx pnpm@10.32.1 lint/test/build` 全 exit 0（test 34 文件 334 绿 1 skip = baseline）。
- 纪律：全程未使用 `--allow-no-graph-anchor` / `--allow-no-review`；`src/` `tests/` 零改动（git status 空）；`.codex/` untracked 未触。

## 4. 遗留与移交

- FRAGMENT overlay 值已按 3.5.0 RUNBOOK:11 口径改登（还原提醒存续 · 非本 task 处置范围）。
- l1/01_modules.md 过渡 stub 状态由后续图谱维护波决定是否摘除（非范围）。
- 40 复验窗口：verify 真判定输出 + 回归 + 四闸 + 三件套均在本 invoke 与 task 自检结论落盘。
