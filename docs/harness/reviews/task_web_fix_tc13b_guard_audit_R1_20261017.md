# 审查文：task_web_fix_tc13b_guard · 20-task-audit R1（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 20-task-audit（R1 书面审查） |
| **审查对象** | 分支 `task/web-guard-tc13b-fix-draft`（origin · commit `0e559ea`）：`docs/tasks/active/task_web_fix_tc13b_guard.md` + `docs/tasks/active/README.md` 改动 + 10 invoke `docs/harness/invokes/by-task/web-fix-tc13b-guard/invoke_20261017_10_task_draft.md` |
| **审查方式** | `git show origin/task/web-guard-tc13b-fix-draft:<path>` 只读 · 零改 task 实质内容 |
| **本帽工作点** | 独立 worktree `ops-desk-web-wt-guard-audit`（分支 `task/web-guard-tc13b-audit-r1` · base main `f077908`） |
| **委派** | web 00（重点核对五条逐项见 §2） |

---

## 1. 结论摘要

| 维度 | 结论 |
|------|------|
| **task 内容** | **PASS-with-NIT**（零内容阻塞 · NIT×2 非阻塞见 §4） |
| **流程闸 HG-AUDIT-R1** | **pending**（task 人工闸表真值 · 本帽不代签 · 维护者签认清单见 §5） |
| **流程闸 HG-GRAPH-MODULES** | **pending**（图谱预判 n/a 经核成立：仅 tests/ 与 docs 面 · 零 src/ · 待维护者同波签认） |
| **HG-TASK-DRAFT** | approved 依据在案（2026-10-17 维护者令「批准 · 另立 guard 修复 task」· 00 代录 · invoke §闸状态同载） |
| **task lint** | **PASS · EXIT=0**（本帽 2026-10-17 主仓 `npx spec-wave task lint --file` 对 worktree 绝对路径**复跑**，与 10 落稿实跑结论一致） |
| **基线实跑复证** | 本帽 main 基线工作树（`f077908`）钉死 pnpm 路径亲跑：`Tests 1 failed | 282 passed (283)`，唯一红 = TC13(b) 失败于 `:152`（AssertionError: expected false to be true · 堆栈指 `hitl-decision-surface-guards.spec.ts:152:64`）——与草稿 test_strategy_note 及前棒 20 证据（`task_web_http_error_i18n_audit_R1_20261017.md` §2.3）**逐字吻合** |

**30 开工授权：不签发。** HG-AUDIT-R1 / HG-GRAPH-MODULES 均 pending → 30 拒开工（FP-1 在案）。

---

## 2. 重点核对（逐条结论）

### 2.1 guard 现状描述逐字核对 —— **全吻合**

亲读 main 基线 `f077908:tests/hitl-decision-surface-guards.spec.ts` 全文（:1-154），逐项比对草稿「现状锚点」表与 R1 节：

| 草稿表述 | 亲读核真 | 结果 |
|----------|----------|------|
| TC13(b) 全貌 `:121-153`（基线解析 → diff → 删行/增行口径 + :152 硬断言） | `it('TC13(b)…', (ctx) => {` 起于 :121，闭于 :153 | ✓ |
| :152 恒红根因字面 `expect(added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)` | :152 逐字相同 | ✓ |
| `:122-131` 基线不可达分支：CI → `ctx.skip()` 留痕（`:124-128`）· 非 CI → throw 拒绿（`:130`） | `const base = resolveDiffBase()` :122 · `base === null` :123 · `if (process.env.CI)` :124 · console.warn :126 · `ctx.skip()` :127 · return :128 · throw :130 · 闭 :131 | ✓ |
| `:138-150` 删行仅限 `onError` · 增行禁含 `event_type`/`payload`/`FrameParser`/`.feed(`/`TextDecoder`/`ReadableStream` | removed 过滤 :138 + `toMatch(/onError/)` :141；added 过滤 :143 + 禁字面正则 :147 逐字相同 | ✓ |
| `:54-75` 回退链：本地 main → GITHUB_BASE_REF 系 → origin/main → origin/HEAD → origin/master → 全不可达 null | candidates 数组 :56-62 逐字吻合 | ✓ |
| 兄弟 guard `:78-119`（TC3 setInterval 白名单 · TC12 伪造 model 字面 · TC13(a) hitl.resumed 零字面） | TC3 :78-93 · TC12 :95-107 · TC13(a) :109-119 | ✓ |
| 来源 task AC13「diff hunk 仅限错误面可选增键 retryAfterSeconds」· 裁定 D-C | `docs/tasks/done/task_web_hitl_decision_surface.md:117` AC13 逐字吻合；裁定 D-C 见 :34/:77/:98 | ✓ |
| PR #73 squash `e07e4ac` 已并 main | `git merge-base --is-ancestor e07e4ac f077908` 成立 | ✓ |
| CI 浅克隆 → :124-128 skip 路径 | `.github/workflows/ci.yml` `actions/checkout@v5` 无 fetch-depth 覆盖（默认浅克隆） | ✓ |
| 恒红实跑证据 `283 = 282 绿 + 1 红` | 前棒 20 §2.3 在案 + 本帽复跑复证（见 §1） | ✓ |

### 2.2 「判定抽纯函数 + 双场景锁存」防护力 —— **不弱化（机理在案）**

- **本支防护固化**：:152 的 decision-surface 本支使命已随 PR #73 并 main 完成；F2 以 PR #73 `e07e4ac` 真实 diff fixture 把「含 `retryAfterSeconds` 增行 → 硬断言路径成立」锁为 Vitest 断言，判定函数被改松（含增行误判 skip/pass）即红拦（FP-2）。本支语义**由分支期断言转为仓库内固化断言**，防护力不弱反可脱离 git 环境机断。
- **缺增行仍红**：fixture 场景下若 30 改写使硬断言路径失守（增行存在却判 skip 或断言缺失），双场景例红 —— 「该红仍红」由锁存保证。
- **存续面向前防护**：他支动 useLgRagSse.ts 时 `:138-150` 上下文无关口径（删行仅限 `onError` · 增行禁解析段字面）**零改动存续**（TC3 验收 diff 字面可机核 · FP-5 在案）。
- **边界语义变更是明示且有意**：非空 diff 但无 `retryAfterSeconds` 增行 → 不再恒红（旧 :152 在该边界必红）。草稿 R3 已记此判定与理由（guard 存续价值在 :138-150 · :152 本支使命固化进 fixture），F2 要求 30 定稿留痕。**判定：属修复目标的合理语义收口，非误松。**
- **纯函数抽出**（建议 `evaluateTc13bDiff(diffText: string)` · 名留 30 定稿）使空 diff / 含增行两路径脱离 git 环境单测 —— 可测性增强，无误松面。

### 2.3 非范围边界钉死 —— **成立**

草稿非范围五条逐字钉死：`src/composables/useLgRagSse.ts` 本体零触达（freeze `lg-rag-sse-v1` 只消费 · 任何 src/ 改动禁入）；TC3/TC12/TC13(a)（:78-119）与 `resolveDiffBase` 回退链（:54-75）、基线不可达分支 CI skip / 非 CI throw（:122-131）语义零改动；不引入新测试框架；图谱与 CI 工作流零改动；`task_web_http_error_i18n` 面勿混入。范围 F1 文末亦复述「:122-131 语义存续零改动」。**全部钉死，无逃逸口。**

### 2.4 验收可机断性 —— **六条全机断**

| 验收 | 机断面 |
|------|--------|
| TC1（恒红消除） | 钉死命令 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` + 计数闸（零红 · 283 基线 + 新增例 30 实测填报）+ RED→GREEN 时序 git 可查 |
| TC2（双场景） | Vitest 断言字面机断 + fixture 来源注释留痕（PR #73 `e07e4ac`） |
| TC3（存续面） | git diff 字面机核（兄弟 guard / :138-150 / :122-131 零改动） |
| TC4（三门绿） | `pnpm lint/test/build` EXIT 码 |
| TC5（回执） | invoke/wiki/README 齐备机核 |
| lint 项 | `npx spec-wave task lint` PASS（本帽复跑 EXIT=0） |

### 2.5 闸表 —— **合规**

HG-TASK-DRAFT approved 依据在案（维护者 2026-10-17 令 · 00 代录 · invoke 同载）；HG-AUDIT-R1 / HG-GRAPH-MODULES **pending 未代签**（task 表「禁代签」字面在案 · 本帽亦不代签）。

### 2.6 思考轮审查（阶段 C）—— **通过**

R0–R5 控制表全填（结论 / early_stop / reason / residual_risks 四列无缺），各轮回填节闭合。R5 early_stop 理由成立：fix-lite 机理单一（单断言上下文判定）· 锚点全亲读核真（本帽 §2.1 复证）· 实跑证据在案且本帽复跑逐字吻合 · 再轮无新增信息。残余风险如实登记（双闸待人签 · 边界口径 30 定稿），由 FP-2/FP-3 双场景锁存对冲。

### 2.7 行为变更类 checklist（K7 提醒）—— **覆盖**

本 task 改 guard 断言语义（测试基建行为变更）。「旧测影响面」由 TC1 全量计数闸（283 基线 + 新增例零红）+ TC3 存续面 diff 字面机核 + FP-4 共同覆盖，机断面齐备，无需退回补列。

---

## 3. 阻塞项

**内容阻塞：零。** 流程闸阻塞：HG-AUDIT-R1 / HG-GRAPH-MODULES pending（维护者签认事项，非内容问题）。

## 4. NIT 清单（非阻塞）

- **NIT-1（invoke 验收编号松差）**：10 invoke §委派映射写「验收 TC1–TC6」，task 实为 TC1–TC5 + 未编号 lint 复选项（共 6 个复选框）。计数相符、编号松差，无碍机断；维护者签认时知悉即可，无需退回 10。
- **NIT-2（README 合并面对账）**：草稿 README 改「当前活跃任务 1 件」；并行在案的 `task/web-http-error-i18n-draft` 分支亦改同文件 README。两 draft 各自基于 main 落稿，并 main 时需对账 active 清单口径——合并面提示，非本 task 内容阻塞。

## 5. 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（本文 · PASS-with-NIT）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] 同波签认 HG-GRAPH-MODULES（图谱 n/a 预判经本帽 §2.3 核成立：仅 tests/ 与 docs 面 · 零 src/）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | R1 · 20-task-audit：五重点项逐条核结（§2.1 字面全吻合 · §2.2 防护力不弱化 · §2.3 非范围钉死 · §2.4 验收全机断 · §2.5 闸表合规）+ 思考轮通过 + lint 复跑 PASS + 基线 283=282 绿+1 红本帽复证 · 结论 PASS-with-NIT（NIT×2 非阻塞）· 双闸 pending 待人签 |
