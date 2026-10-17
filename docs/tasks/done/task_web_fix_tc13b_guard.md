# Task：Web · 修复 TC13(b) guard main 本地恒红（diff 空判 skip/pass · 双场景锁存）

> **状态**：active（10 落稿 · 待 HG-AUDIT-R1 / HG-GRAPH-MODULES 人签 · **30 拒开工**）  
> **类型**：fix / test-infrastructure（测试基建 · guard 语义修复 · 零 src/ 改动）  
> **统筹**：**web 00**  
> **上游**：`docs/tasks/done/task_web_hitl_decision_surface.md`（TC13 guard 来源 · PR #73 squash `e07e4ac` 已并 main）  
> **分支**：`task/web-fix-tc13b-guard`（base：`main` @ `f077908`）  
> **00 注**：2026-10-17 · 维护者令「批准 · 另立 guard 修复 task」· 本窗 10 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-fix-tc13b-guard` |
| **git_branch** | `task/web-fix-tc13b-guard` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 + HG-GRAPH-MODULES → 30（红测先行 · guard 改写 + 双场景 Vitest 锁存）→ PR+CI 绿 → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | main 基线 Vitest **283 例 = 282 绿 + 1 既有红**（TC13(b) `tests/hitl-decision-surface-guards.spec.ts:152` · 20 帽 main 工作树实跑复证 `Tests 1 failed | 282 passed (283)` 在案 docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md §2.3）；30 后口径 = **全量绿零红**（283 + 新增双场景断言例 · 30 实测填报）。verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（仓 packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（仅 `tests/**` guard 与 docs 面 · 零 src/ 页面/路由/模块改动 · `docs/_tech_graph/l1/01_modules.md` 零改动预判） |
| **graph_delta** | `n/a` |
| **graph_delta_note** | 不新增一级模块；测试基建修复无 flow 面 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（guard 恒红根因 → 本 task）；对齐仓内定制「新 task 勿默认 n/a」，文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30`（纯测试基建 · 无 40 live 面） |
| **invoke_retention_profile** | `minimal`（实际留档以 required_invoke_hats=10,20,30 为准） |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费** · useLgRagSse.ts 本体零触达） |
| **related_pr** | PR #81（squash 并 main `3e67bf0` · 2026-10-17 · CI check/frontend 双绿） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-17 维护者令「批准 · 另立 guard 修复 task」· 00 代录 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-17 维护者签（「双闸全签」）· 20 R1 PASS-with-NIT 在案 `docs/harness/reviews/task_web_fix_tc13b_guard_audit_R1_20261017.md` · 00 代录 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-17 维护者签（同上）· n/a 预判经 20 核成立（仅 tests/ 与 docs 面 · 零 src/）· 00 代录 |

---

## 背景与目标

`task_web_hitl_decision_surface`（PR #73 squash `e07e4ac` · 2026-10-17 已并 main 并 CLOSE）落地 N3 钉形态 guard `tests/hitl-decision-surface-guards.spec.ts`，其中 **TC13(b)**（:121-153）为「CI 鲁棒基线链」diff 断言：

- `:152` `expect(added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)` —— 硬断言 useLgRagSse.ts 对基线 diff **增行必含 `retryAfterSeconds`**。该断言**仅在 decision-surface 本支**（该支实增 retryAfterSeconds 错误面增键 · 裁定 D-C）成立；main 及任何不动该文件的分支 diff 为空 → `added.some(...)` 恒 false → **本地恒红**。
- `:124-128` 基线不可达且 CI 环境 → `ctx.skip()` 留痕（CI 浅克隆无任何基线 ref 走此路径）→ **CI 绿**；非 CI 不可达 → 抛错拒绿（:130）。

**实证在案**：20-task-audit R1（web-http-error-i18n）main 工作树实跑复证 `Tests 1 failed | 282 passed (283)`，唯一红 = TC13(b) 失败于 :152（docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md §2.3）。由此衍生两害：

1. **main 本地恒红驯化**：开发者习惯「那一个红是既有的」，红信号失真，后续真实回归易被淹没。
2. **新 task 验收口径被迫开口**：后续 task 的 test_strategy_note 须逐个声明「283 = 282 绿 + 1 既有红」特例（web-http-error-i18n 已在案），计数闸不可机断。

**目标**：guard 语义修复为「**diff 为空或非 decision-surface 上下文 → skip/pass 留痕（非红）**」，仅 decision-surface 上下文（diff 增行实含 `retryAfterSeconds`）才硬断言；判定逻辑抽为可测纯函数并以**双场景 Vitest 断言**锁存（空 diff → skip/pass 路径 · 含增行 → 硬断言路径），修复后 main 本地 `pnpm test` 全量绿零红。

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| TC13(b) 全貌 | `tests/hitl-decision-surface-guards.spec.ts:121-153` | 基线解析 → diff → 删行/增行口径断言 + :152 retryAfterSeconds 硬断言 |
| :152 硬断言 | `tests/hitl-decision-surface-guards.spec.ts:152` | `expect(added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)`（恒红根因） |
| CI skip 逻辑 | `tests/hitl-decision-surface-guards.spec.ts:122-131` | base===null 且 CI → `ctx.skip()` 留痕；非 CI → throw 拒绿（语义存续面） |
| 删行/增行口径（上下文无关 · 保留面） | `tests/hitl-decision-surface-guards.spec.ts:138-150` | 删行仅限 `onError` 错误面；增行禁含解析段字面（`event_type`/`payload`/`FrameParser`/`.feed(`/`TextDecoder`/`ReadableStream`） |
| 基线回退链 | `tests/hitl-decision-surface-guards.spec.ts:54-75` | 本地 main → GITHUB_BASE_REF 系 → origin/main → origin/HEAD → origin/master；全不可达 → null |
| 兄弟 guard（零触达面） | `tests/hitl-decision-surface-guards.spec.ts:78-119` | TC3（setInterval 白名单）· TC12（伪造 model 字面）· TC13(a)（hitl.resumed 零字面） |
| guard 来源 task | `docs/tasks/done/task_web_hitl_decision_surface.md` | AC13/TC13/F3 · 裁定 D-C（retryAfterSeconds 仅错误面可选增键）· PR #73 `e07e4ac` |
| 恒红实跑证据 | `docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md` §2.3 | 20 帽 main 实跑 `Tests 1 failed | 282 passed (283)` · 唯一红 TC13(b) :152 |
| main HEAD | `f077908` | 基线 ref（本 task base） |

---

## 范围

- [ ] **F1（30 · guard 改写 · 红测先行）**：TC13(b) 语义修复——**diff 为空 → skip/pass 留痕（console.warn 或 ctx.skip · 不再恒红）**；diff 非空 → :138-150 删行/增行口径存续；**:152 retryAfterSeconds 硬断言仅在 decision-surface 上下文成立**（diff 增行实含 `retryAfterSeconds`）。判定逻辑抽为**可测纯函数**（建议形如 `evaluateTc13bDiff(diffText: string)` 返回判定结果 · guard 例调之），使空 diff / 含增行两路径可脱离 git 环境单测。基线不可达分支（:122-131 CI skip / 非 CI throw）语义**存续零改动**。
- [ ] **F2（30 · 双场景 Vitest 锁存）**：新增断言覆盖两场景——**空 diff → skip/pass 路径**；**含 `retryAfterSeconds` 增行的 diff fixture → 硬断言路径成立**（fixture 取自 PR #73 `e07e4ac` 真实 diff 形态留痕 · 字面机断）。边界面（非空 diff 但无 retryAfterSeconds 增行 = 其他任务动文件上下文）不恒红且 :138-150 口径仍生效——30 定稿留痕。
- [ ] **F3（回执落盘）**：invoke 10/20/30 齐（`docs/harness/invokes/by-task/web-fix-tc13b-guard/`）· `docs/coding_wiki/volatile.md` 短注落盘 · `docs/tasks/active/README.md` 同步。

## 非范围

- **`src/composables/useLgRagSse.ts` 本体零触达**（freeze lg-rag-sse-v1 只消费 · 任何 src/ 改动禁入）。
- **TC3 / TC12 / TC13(a) guard 语义零改动**（:78-119 面）；`resolveDiffBase` 回退链（:54-75）与基线不可达分支 CI skip / 非 CI throw（:122-131）语义存续。
- **不引入新测试框架 / 断言库**（Vitest 既有体系内改写）。
- 图谱零改动（`docs/_tech_graph/` 任何文件）；CI 工作流零改动（`.github/workflows/`）。
- `task_web_http_error_i18n` 面（draft 分支在案 · **勿混入**）；decision-surface 历史 task 文档回填。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 HG-AUDIT-R1 / HG-GRAPH-MODULES pending 即 30 改码 | 执行 Agent **拒开工**（GATE_VERIFY 首输出 · task 人工闸表为真值 · `npx spec-wave verify`） | 是（签后重来） | 无 |
| FP-2 guard 误松致 decision-surface 上下文失效（含增行场景被误判 skip/pass） | F2 双场景断言红拦：fixture（PR #73 真实 diff 形态）硬断言路径失守 → Vitest 红 → 30 回退 | 是 | 无 |
| FP-3 误判 skip 条件（空 diff 误走硬断言 / 含增行误走 skip） | F2 双场景 Vitest 断言双向锁存（空 diff → skip/pass · 含增行 → 硬断言）· 任一误判即红 | 是 | 无 |
| FP-4 改写误伤 TC3/TC12/TC13(a) 或基线不可达分支语义 | 全量 Vitest 计数闸（283 + 新增例 · 零红）+ CI 浅克隆 skip 存续（工作流绿）· 红即回退 | 是 | 无 |
| FP-5 其他分支动 useLgRagSse.ts 但非 retryAfterSeconds 面 | :138-150 口径存续不误放（删行仅限 `onError` · 增行禁解析段字面）· :152 不恒红（边界 30 定稿留痕） | 是 | 无 |
| FP-6 verify 跑错 pnpm（PATH 前置 pnpm 11 拒跑） | 钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（T-W2 NIT-1 口径） | 是 | 无 |

---

## 验收标准

- [ ] **TC1（30 · 恒红消除 · 红测先行）**：main / 不动 useLgRagSse.ts 的分支本地 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` **全量绿零红**（基线 283 例 + 新增双场景例全绿 · 30 实测填报计数）；TC13(b) 在空 diff 下 skip/pass 留痕不再红；RED（现 :152 恒红在案）→ GREEN 时序 git 可查。
- [ ] **TC2（30 · 双场景断言）**：新增 Vitest 例字面机断两场景——空 diff 输入 → skip/pass 判定；含 `retryAfterSeconds` 增行 diff fixture → 硬断言判定成立。fixture 取自 PR #73 `e07e4ac` 真实 diff 形态并在测试注释留痕来源。
- [ ] **TC3（30 · 存续面零回归）**：TC3/TC12/TC13(a) 断言零改动全绿；:138-150 删行/增行口径断言存续（非空 diff 时删行仅限 `onError` · 增行禁解析段字面仍在断言面内）；:122-131 基线不可达分支语义零改动（diff 字面可机核）。
- [ ] **TC4（30 · 三门绿）**：`pnpm lint` · `pnpm test` · `pnpm build` 全 EXIT=0（钉死 pnpm 路径）。
- [ ] **TC5（回执落盘）**：invoke 10/20/30 齐备（`docs/harness/invokes/by-task/web-fix-tc13b-guard/`）· `docs/coding_wiki/volatile.md` 短注在案 · README 同步。
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_fix_tc13b_guard.md` PASS。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| guard 真值 | `tests/hitl-decision-surface-guards.spec.ts`（:54-75 回退链 · :121-153 TC13(b) 全貌） |
| guard 来源 task | `docs/tasks/done/task_web_hitl_decision_surface.md`（AC13/TC13 · 裁定 D-C · PR #73 `e07e4ac`） |
| 恒红实跑证据 | `docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md` §2.3（283 = 282 绿 + 1 红复证） |
| CI 口径 | `.github/workflows/ci.yml`（浅克隆 → :124-128 skip 路径 · 本 task 零改动只读参照） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（范围/非范围 · failure_paths · 人工闸表）
2. `tests/hitl-decision-surface-guards.spec.ts` 全文（:54-75 回退链 · :78-119 兄弟 guard · :121-153 TC13(b)）
3. `docs/tasks/done/task_web_hitl_decision_surface.md`（AC13/TC13 · 裁定 D-C 语义真值）
4. `docs/harness/reviews/task_web_http_error_i18n_audit_R1_20261017.md` §2.3（恒红实跑证据 · FP-7 亲读结论）
5. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：main 本地恒红 = TC13(b) :152 硬断言仅在 decision-surface 本支成立 · 分支已并 main 后任何上下文 diff 为空 → 恒红；修复 = 上下文判定 + 双场景锁存，零 src/ 面 | false | — | none |
| R1 | 证据收集：guard 全文亲读（:152 字面 · :124-128 CI skip · :138-150 口径 · :54-75 回退链）；来源 task AC13/裁定 D-C 核真；20 帽 R1 实跑复证 `Tests 1 failed | 282 passed (283)` 在案 | false | — | 边界场景（非空 diff 无 retryAfterSeconds）口径留 30 定稿 |
| R2 | 方案生成：判定逻辑抽纯函数（git 环境解耦可单测）· 空 diff → skip/pass 留痕 · 含增行 → 硬断言；:122-131 不可达分支与 :138-150 口径存续零改动（最小面修复 · 误松风险由双场景断言对冲） | false | — | 纯函数签名/落点（同文件导出 vs helper）由 30 定稿 |
| R3 | 反例与边界：FP-2 误松（含增行误判 skip）由 fixture 硬断言路径锁存；FP-5 他支动文件面 :138-150 存续；CI 浅克隆 skip 路径不受影响（:124-128 在判定之前） | false | — | CI 真跑到非浅克隆形态时行为留 CI 实证 |
| R4 | 验收可测性：TC1 计数闸（零红）· TC2 断言字面 + fixture 留痕 · TC3 diff 字面机核 · TC4 EXIT 码 · TC5 invoke 齐备——全机断 | false | — | RED→GREEN 时序须 git 可查（红测先行纪律） |
| R5 | 收口：范围 F1–F3 · 非范围五条 · failure_paths 六行 · 验收六条 · 依赖四条 · 必读五项齐备；HG-TASK-DRAFT approved（维护者令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签 | true | fix-lite 机理单一（单断言上下文判定）· 锚点全亲读核真 · 实跑证据在案 · 再轮无新增信息 | 双闸待人签 · 边界口径 30 定稿 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

TC13(b) :152 把「decision-surface 本支的 diff 形态」写成了无上下文硬断言。该支已并 main（PR #73 `e07e4ac`），此后 main 及任何不动 useLgRagSse.ts 的分支 diff 为空 → `added.some(...)` 恒 false → 本地恒红。CI 因浅克隆走 :124-128 skip 而绿，形成「CI 绿 / 本地恒红」割裂。修复本质 = 给 :152 加上下文判定（空 diff → skip/pass · 含增行 → 硬断言），并用双场景单测把判定钉死。

### R1 · 证据收集

guard 全文亲读：`resolveDiffBase` :54-75 回退链（本地 main 优先 → 本地环境 base 恒可达 → 走 diff 断言而非 skip）；:138-150 删行仅限 `onError` / 增行禁解析段字面（上下文无关口径 · 保留面）；:152 恒红根因字面。来源核真：`task_web_hitl_decision_surface.md` AC13「useLgRagSse.ts diff hunk 仅限错误面可选增键 retryAfterSeconds」· 裁定 D-C。实跑证据：20 帽 R1 main 工作树 `Tests 1 failed | 282 passed (283)` 唯一红 TC13(b) :152。

### R2 · 方案生成

- **判定抽出**：`evaluateTc13bDiff(diffText)` 纯函数（建议名 · 30 定稿）输入 diff 文本输出判定（empty → skip/pass 留痕 / has-retryAfterSeconds-added → 硬断言路径 / other-nonempty → :138-150 口径存续不恒红）——git 环境解耦，双场景可单测。
- **最小面**：:122-131 基线不可达分支（CI skip / 非 CI throw）与 :138-150 口径零改动；仅 :152 从无条件硬断言改为上下文条件。
- **对冲误松**：F2 fixture 取 PR #73 真实 diff 形态，含增行场景硬断言路径失守即红（FP-2）。

### R3 · 反例与边界

- 空 diff 走 skip/pass 后，main 本地是否丧失 guard 价值？——不丧失：guard 的存续价值在「他支动文件时 :138-150 口径拦越界 diff」（FP-5），:152 的本支使命已随 PR #73 合并完成，固化进双场景 fixture。
- CI 浅克隆：:124-128 在 diff 计算之前 return，修复面在其后，CI 行为零变化。
- 非 CI 且基线不可达：:130 throw 拒绿存续（防「无基线假绿」）。

### R4 · 验收可测性

TC1 计数闸零红（机断）；TC2 双场景断言字面 + fixture 来源注释（机断）；TC3 存续面 git diff 字面机核（兄弟 guard 与 :122-131/:138-150 零改动）；TC4 三门 EXIT 码；TC5 invoke/wiki/README 齐备机核。RED 签名 = 现 :152 恒红在案（R1 实跑证据），GREEN 后全量绿，时序 git 可查。

### R5 · 收口

范围/非范围/failure_paths/验收/依赖/必读齐备；方案最小面（单断言上下文判定）· 风险由双场景锁存对冲；early_stop at R5。双闸 pending 待人签，30 拒开工。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_fix_tc13b_guard.md` | **PASS**（2026-10-17 落稿实跑 · EXIT=0） |
| 结论 | HG-AUDIT-R1 / HG-GRAPH-MODULES **pending → 30 拒开工** |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | v0 · 10 落稿：维护者令「批准 · 另立 guard 修复 task」· 锚点全亲读核真（guard :54-153 全文 · 来源 task AC13/裁定 D-C · 20 帽 R1 实跑复证 283=282 绿+1 红）· R0–R5 思考轮（early_stop at R5）· HG-TASK-DRAFT approved · HG-AUDIT-R1/HG-GRAPH-MODULES pending 待人签 |
| 2026-10-17 | v1 · CLOSE：PR #81 squash 并 main `3e67bf0`（RED a0c1523 → GREEN 3486638 · `evaluateTc13bDiff` 三态判定 · PR #73 真实 diff fixture 锁存 · 边界例 other-nonempty 不恒红）· main 本地亲验 296 绿+1 skip 零红（既有红消除）· CI check/frontend 双绿 · 10/20/30 invoke 齐 · 20 R1 审查文随支落 main（含标题机读化修正 51ca882 内容零改）· 00 迁 done |
