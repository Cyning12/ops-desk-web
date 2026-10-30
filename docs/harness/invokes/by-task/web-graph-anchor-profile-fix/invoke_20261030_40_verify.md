# Invoke：40 独立验收 · web-graph-anchor-profile-fix

> 帽：40 独立验收 · 日期：2026-10-30 · 分支：task/web-graph-anchor-profile-fix（HEAD 8a5c216 · base 1810be3）
> 图谱锚点字面（D5 面B 义务）：本 invoke 引用 `docs/_tech_graph/l1/01_struct.md` · `docs/_tech_graph/l1/01_modules.md`（指针 stub）· `docs/_tech_graph/l1/10_flow_*` · `docs/_tech_graph/l0/00_main.graph.yaml`
> 纪律：只验收不改实现 · 阻塞即写结论退回（本次无触发）· 本地 commit 仅验收留痕 · push/PR 禁 · `.codex/` untracked 未动 · 包管理器 `npx pnpm@10.32.1`

## 1. 对象与范围

- task 文档 `docs/tasks/active/task_web_graph_anchor_profile_fix.md` v0.5 + 30 交付（2939c0f 实现 10 文件 · 8a5c216 docs 10 文件）。
- 复核方式：不信 30 自报，逐项亲跑亲读；diff 全量亲读 495 行 / 20 文件。

## 2. ① diff 亲读结论（1810be3..HEAD）

- 双 profile `.coding-kit/profile.json:5` 与 `.cyning-harness/profile.json:5` 同改 `docs/_tech_graph/l1`；
- 新建 `docs/_tech_graph/l1/01_struct.md` 58 行（「## 1. 模块边界表」节 + 节内单表 + 跨模块契约/人签记录/关联节随迁 + 2026-10-30 新人签行）；
- `l1/01_modules.md` 指针化 7 行 stub 一跳指 l1/01_struct.md；根 stub 改指 l1/01_struct.md 一跳到底且本体存续（D2 单源）；
- `.spec-wave/graph-drift.yaml:4` struct_rel 随迁（:2 注释同步）；l0 三处 label 随迁（00_main.graph.yaml:85 · 00_main.md:34,93）；
- graph.json:173 / shared/graph.json:173 label 随迁 + freeze_id/generated_at 噪声（D3 声明内）；
- 引用面 N-3 枚举全落地 + AGENTS.md 三处 + docs/_tech_graph/README.md 两处；volatile 短注落盘。
- 上游源码亲读复核（node_modules spec-wave@3.5.0）：`lib/checks/graph-anchor.js:43` MODULE_SECTION_HEAD_RE=/^##\s+1\.\s*模块边界表/ · 节止于下一 ^## · 首列反引号词表；`lib/cli-graph-drift.js` 表头须含「路径 glob」否则 throw struct_unparseable · runGraphDrift 以 path.join(inputRoot, structRel) 定位——task 钉案全部属实。

## 3. ② 验收 1–8 逐项亲跑（全绿）

| # | 40 实证 |
|---|---------|
| 1 | node 断言亲跑：双值 = `docs/_tech_graph/l1` · resolve 后 isDirectory=true 双份一致 ✅ |
| 2 | 节标题 L9 匹配 RE；节内（L9→L22）恰 1 表；表头含「路径 glob」；首列反引号 8 词 = 旧 01_modules 模块表逐字一致（git show 1810be3 对照 · TABLE_IDENTICAL）✅ |
| 3 | 三指针（根 stub / 01_modules stub / l0 三 label）一跳到底无链；grep `l1/01_modules` 171 处余量全属历史留痕（done/reviews/invokes/旧 feedback/旧 SPEC）+ stub 自称 + 存量 active task_web_hitl_approval_page 五处自身历史叙述（该 task verify 仍 PASS）——非阻塞观察项 ✅ |
| 4 | verify 输出逐字复核：「图谱锚点命中（checked=2 hits=2 · 命中: docs/_tech_graph/l1 · 01_modules · 01_struct）」→「VERIFY: PASS」EXIT=0 · 不含「已跳过」✅ |
| 5 | active task_web_hitl_approval_page PASS（命中 l1 · 01_modules · 10_flow_capability）；done 三件全 PASS EXIT=0；零新增 BLOCKED · FP-1 未触发 ✅ |
| 6 | task lint --file PASS · lint-wiki-delta scanned=69 missing=0 issues=0 · 四闸全绿（yaml 12 OK · drift struct_layout: protocol drifts=0 · ib checked_ib=91 issues=0 · ast checked=55 issues=0）· graph-compile.sh EXIT=0 · 复跑 diff 仅 generated_at 时间戳噪声（已 git checkout 还原 · freeze_id 同日不变）✅ |
| 7 | diff 全量无 `--allow-no-graph-anchor`/`--allow-no-review` 使用痕；`git status --short -- src tests` 空（20 文件无 src/tests）✅ |
| 8 | `npx pnpm@10.32.1 lint` EXIT=0 · `test` 34 文件 334 passed 1 skipped（= baseline 34/334/1）EXIT=0 · `build` ✓ built in 1.81s EXIT=0（jsdom/rollup 注释 warn 为既有噪声）✅ |

## 4. ③ 30 落账抽核

- 30 invoke 含 D5 面B 图谱锚点字面（l1/01_struct.md · 01_modules.md · 10_flow_* · 00_main.graph.yaml）✓；
- 自检回填逐项与 40 亲跑一致（含 verify 输出逐字 · build 1.81s 一致）✓；
- v0.5 修订记录在档 ✓；
- 遗留四条照登合理：FRAGMENT overlay 值按 RUNBOOK:11 改登 · 01_modules stub 存续留待后续维护波 · 40 复验窗口（本棒即闭环）· D6 00_main 分层分歧照登 ✓。

## 5. 结论

**PASS** · 验收 1–8 逐项实证全绿 · 无阻塞项。非阻塞观察一项：存量 active `task_web_hitl_approval_page.md` 内五处 `l1/01_modules` 历史叙述行（该 task verify 仍 PASS · 留待其自身维护周期处置，不属本 task 范围）。
