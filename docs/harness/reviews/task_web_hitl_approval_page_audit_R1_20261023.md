# task_web_hitl_approval_page 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_hitl_approval_page.md`（draft · feature 前端新页面 · 242 行）  
> **审查帽**：20-task-audit（书面审查 · 未改 task 实质 · 未改 `src/` · 未改 api 仓 · **未代签**任何闸 · 零 git）  
> **日期**：2026-10-23 · **仓态**：cwd=`ops-desk-web`（本帽未切分支）  
> **需求真值（对照基准）**：`../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`（自包含 Prompt v1 · 7 条功能需求 / 4 条非范围 / 5 条验收）· 无上游 SPEC  
> **10 invoke**：`docs/harness/invokes/by-task/web-hitl-approval-page/invoke_20261023_10_web-hitl-approval-page.md`  
> **本审查动作**：落盘 reviews + 20 invoke；**禁止**附 30 Prompt；**本轮不代维护者签闸**

---

## 结论摘要

**结论：approved-with-comments**（内容**零阻塞** · 签收 · 非阻塞 NIT ×3 · 流程闸仍 pending）

| 维度 | 结论 |
|------|------|
| task **内容**可执行 | **签收**。范围 10 条 / 非范围 7 条 / TC1–TC9 / FP-1–FP-14 / D1–D9 / R0–R5 逐项对照 Prompt 与冻结契约亲读核对通过，无漏项、无越界扩项、无臆造引用 |
| **流程闸**（审查当时） | 人工闸表三行全 **pending**：`HG-TASK-DRAFT`（blocks 22-R1, 30）、`HG-AUDIT-R1`（blocks 30）、`HG-GRAPH-MODULES`（blocks 30）。本帽**未代签**；30 在三闸 approved 前拒开工 |
| lint 复跑 | `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_approval_page.md` → **LINT: PASS · EXIT=0**（W3 自检结论占位符为 draft 期合法警告 · 2026-10-23 本帽实跑） |
| verify 复跑 | `npx spec-wave verify --target . --task docs/tasks/active/task_web_hitl_approval_page.md` → **VERIFY: BLOCKED · EXIT=2**，三闸 pending 与表一致（draft 期预期行为 · 2026-10-23 本帽实跑） |
| 签收 | **签收**（approved-with-comments）。下一棒 = 维护者签闸（见文末清单），**非** 30 直接开工 |

---

## 核对项（通过面 · 全部亲读实证）

### 1. 范围 10 条 ↔ Prompt 功能需求 7 条 ✅ 全映射无漏项

| Prompt 需求 | task 承载 | 审查 |
|---|---|---|
| §3.1 路由与导航（/hitl + 菜单 + 沿用守卫） | 范围条 1–2 · D1 | ✅ `src/router/index.ts:99-111` 守卫亲读属实（ensureMe → 非 public 未登录跳 `/login?redirect=<fullPath>`） |
| §3.2 列表视图（reason / blocked_by JSON 快照 / created_at+已等待 / 双 id 截断） | 范围条 3 · D3 · TC1 | ✅ 字段族与 `src/api/hitl.ts:26-33` HitlPendingItem 六键逐键对齐 |
| §3.3 状态完备（loading / 空 / 403 / 网络 / TTL 过期） | 范围条 3（403 单列）· FP-4 网络 · FP-5 TTL · TC1 + TC6 | ✅ 三态在范围、网络与过期错误在 FP/TC 闭合，无漏 |
| §3.4 决策动作（二次确认 / resume_mode 三选同语义 / 防重） | 范围条 4 · D4 · TC2/TC3 | ✅ |
| §3.5 续跑动作 + 「回到会话查看」（携 thread_id 跳 Chat · **若不支持先核实**） | 范围条 5 · D5/D6 · TC4/TC5 | ✅ D6 执行了 Prompt 明文允许的条件分支：亲读核实 Chat 不支持 thread 定位（见 §4），故仅跳 `{ name: 'chat' }` 不携参——**忠实执行，非漏项** |
| §3.6 刷新纪律（手动 · 不轮询 · visibilitychange 可选须声明） | 范围条 8 · D7 · FP-13 | ✅ D7 采纳可选项并给足理由（事件驱动单次 ≠ 轮询 · TTL 3600s 陈旧列表价值低 · 卸载即移除监听） |
| §3.7 零分叉 | 范围条 4 · D2 · TC3 | ✅ |

### 2. 非范围 7 条 ↔ Prompt 非范围 4 条 ✅ 全承 + 合理收紧

- Prompt 4 条逐字全承（改后端/hitl.ts 契约 · 自造字段/第四值/新后端调用 · 轮询/WS/通知中心 · 重构 HitlApprovalCard/ChatView）。
- task 扩 3 条均非越界：**chat store `decideHitl` 零触碰**（「存量零触碰」的同义收紧，且 Prompt §3.7 要求不引入新语义）；**Chat thread 深链另立 task**（D6 配套 · Prompt §3.5 的核实分支必然产物）；**审批页不消费 replay 补帧**（Prompt §3.5 只要求「按 replay 提示给入口」，task 保留 run_id/cursor 摘要展示，保守解读合理）；**不改 CI workflow**（Harness 常规）。

### 3. 验收 TC1–TC9 ↔ Prompt 验收 5 条 ✅ 全映射

| Prompt 验收 | task 承载 | 审查 |
|---|---|---|
| ① /hitl 直达 + 空/加载/403/过期四态 UI | TC1（列表/空/loading）+ TC6（403/网络/过期/409） | ✅ 四态各有断言归属 |
| ② 批准→显式续跑→回到会话查看 手测链路 | TC9 | ✅ 含本地 api 构造挂起 run 的前置说明 |
| ③ 驳回路径 + immediate auto_triggered 分支 | TC7 + TC5 | ✅ |
| ④ lint/test/build 全绿 + 组件级测试四面 | TC8 + TC1–TC7 | ✅ `packageManager: pnpm@10.32.1` 亲读属实（`package.json:38`） |
| ⑤ PR 材料：四态截图 + 语义对照表 + 闸表截图 | TC9 | ✅ 逐项对应 |

TC 可机断性：TC1–TC8 由 Vitest 或命令退出码机断；TC9 手测 + PR 材料人机混合验收，R4 已声明分工。TC4 锁「decide 成功后未自动调 resumeHitlRequest」反向断言，两步链防塌到位。

### 4. 现状断言抽核 ✅ 全部属实（本帽亲读）

| task 断言 | 实证 |
|---|---|
| `src/router/index.ts:13-86` 无审批页路由 | ✅ 路由表 login + AppLayout children 九条（overview/obs/issues/pulls/graph/chat/lc-evidence/lg-rag/capability），无 hitl |
| 守卫 `:99-111` · 401 拦截 `:118-125` | ✅ 行号与语义逐字属实 |
| `/chat` 路由 `:56-62` 无 path/query 参数 | ✅ |
| ChatView 全文无 `route.query`/`route.params` 消费，仅 `:65` `route.fullPath`（登录 redirect） | ✅ grep 实证：`route.` 全文仅 :65 一处命中——**D6「仅跳 { name: 'chat' }」依据成立** |
| `ChatHistoryPanel.vue:16,77` emit('select', thread_id) 页内选择 | ✅ :16 `defineEmits<{ select: [threadId: string] }>` · :77 `emit('select', thread.thread_id)` |
| `ChatView.vue:43-44` 进页一次性 pending 核对（不轮询）· `:101-104` 手动刷新 | ✅ :43 注释 + :44 `chat.refreshHitlPending()` · :101-104 `onRefreshPending` 逐字属实 |
| `ChatView.vue:23-58` visibility 监听仅服务 SSE 游标分流 | ✅ :23-36 三监听函数 + :38-58 挂载/卸载，均调 `notePageVisible` 系游标逻辑，与 pending 刷新无关——**D7 新页独立监听与 ChatView 既有裁定零冲突成立** |
| `AppLayout.vue:38-51` el-menu router 模式 | ✅ :38 `el-menu :default-active router` · :39-50 菜单项，新增一行即入口 |
| `01_modules.md:15` pages 行 · `:29-40` 人签记录既有模式 | ✅ :15 正是 pages 行（glob `src/views/**`, `src/pages/**`）；:36-39 多条「不新增一级模块 + 行增量备注随 30 交付落盘」先例在案 |

### 5. 冻结契约断言 ✅ 亲读 `src/api/hitl.ts` 无臆造

| task 断言 | 实证 |
|---|---|
| `HitlPendingItem` 六键 {id, run_id, thread_id, reason, blocked_by, created_at} | ✅ `hitl.ts:26-33` 逐键一致 |
| `fetchHitlPending()` GET pending · 仅本人 owner · 非 maintainer 403 · 未登录 401 | ✅ `hitl.ts:82-87` + 契约注释 :12 |
| `decideHitlRequest(id, decision, resumeMode?)` · resumeMode 仅 immediate/manual 送键、**inherit 不送**（task 引 :99-100） | ✅ `hitl.ts:94-106`，:99-100 正是 `const body = { decision }` 与 `if (resumeMode && resumeMode !== 'inherit') body.resume_mode = resumeMode`——行号精确 |
| 错误码面 409 重复/已决 · 404 未知/跨用户 · 422 非法 decision · 400 未知 resume_mode | ✅ 契约注释 :14-16 逐字 |
| `resumeHitlRequest(id)` · `HitlDecideResponse.resume` {required, method, endpoint, auto_triggered?} · `HitlResumeResponse.replay` {run_id, cursor, ...} | ✅ :51-61 · :64-79 · :109-114 |
| 后端 `router.py` 白名单三值、未知值 400（task 引 :184） | ⚠️ **语义属实 · 行号漂移**：白名单校验实际在 `ops-desk-api/app/ops/hitl/router.py:203-208`（`:204 if payload.resume_mode not in auto_resume.RESUME_MODES → raise 400`）。`hitl.ts:14,43` 冻结注释同源写 :184。见 NIT N1 |
| 审批 TTL 3600s | ✅ `ops-desk-api/app/ops/lg_rag/multi/nodes.py:296` `DEFAULT_APPROVAL_CONSUMPTION_TTL_SECONDS = 3600`（单一旋钮 `OPS_HITL_APPROVAL_CONSUMPTION_TTL_SECONDS` · 默认 3600） |

### 6. failure_paths FP-1–FP-14 ✅ 点名五类全覆盖 + 合理补齐

| Prompt 点名失效语义 | task | 审查 |
|---|---|---|
| TTL 3600s 过期项 decide 失败 | FP-5 · TC6 | ✅ 后端 TTL 3600 实证（§5） |
| 403 非 maintainer | FP-2 · TC6 | ✅ |
| resume_mode 白名单（第四值 400） | FP-8 | ✅ 前端三选发不出第四值 + 后端 400 兜底双层 |
| 两步链断裂 | FP-9（含 Vitest 反向断言）· FP-12 · TC4/TC5 | ✅ |
| 防重 | FP-10（按钮 disabled）· FP-6（409 兜底）· TC2 | ✅ |

补齐项合理：FP-3 401（复用 `router/index.ts:118-125` 既有拦截 · 亲读属实）· FP-4 网络 · FP-7 404 · FP-11 resume 失败 · FP-13 visibility 边沿 · FP-1/FP-14 流程闸。可重试/用户可见两列填写完整。

### 7. 闸表与图谱增量 ✅

- 三闸 4 列齐全、blocks 关系正确：`HG-TASK-DRAFT` blocks 22-R1+30、`HG-AUDIT-R1` blocks 30、`HG-GRAPH-MODULES` blocks 30（「22-R1」为旧编号，见 N2）。
- `graph_delta` 声明（`01_modules.md` pages 行增量备注 + 新增 `10_flow_hitl.graph.yaml` + `graph-compile.sh` 绿）与既有先例一致：`01_modules.md:36-39` 四条「不新增一级模块 + 行增量备注」人签记录在案；`10_flow_capability.graph.yaml` 存在（capability 先例 :40 实为「新增一级模块行」，task 仅引其为 **flow 形态参照**，措辞准确无误引）。`scripts/graph-compile.sh` 存在。
- FP-14「30 实证需新增一级模块则停并回签」兜底合理。
- `docs/coding_wiki/volatile.md` 存在 · `docs/tasks/active/task_web_lg_rag_sse_tab_hide_resume.md`（格式参照）存在 · `tests/chat-view.spec.ts` 存在——引用零臆造。

### 8. R0–R5 思考轮 + test_strategy ✅

- 控制表五列齐全；`early_stop=true` 仅 R5，reason「契约/路由/组件/图谱锚点已亲读，需求 7 条与验收 5 条逐条落入，再轮没有新的代码证据」——本帽复读后成立；`actual_last_round=R5` 与正文一致。
- residual_risks 诚实标注未实证项（后端过期 decide 具体错误码/文案未钉 → FP-5 按泛化行级提示设计），未把未验证风险写成已关闭。
- 无上游 SPEC 时 R0–R5 写在本 task，与 R0 声明一致，合规。
- test_strategy=`required` + 红测先行（先 Vitest 后 src）+ 三门按序 + graph-compile + task lint，与 AGENTS.md 仓内定制一致；lint/verify 本帽实跑复验（见结论摘要）。
- **K7 提醒核对**：本 task 为纯新增页面、存量审批面零触碰、不改默认值/校验/策略门/fallback 语义——**非行为变更类**，「旧测 grep 影响面」验收项不适用；必读列表第 9 条已含「不放宽既有断言」，TC8 三门全绿兜底存量回归。不因此退回。

---

## 阻塞

**无内容阻塞。**

---

## 非阻塞

| # | NIT | 处置 |
|---|-----|------|
| N1 | 后端锚点行号漂移：task（现状锚点表 · FP-8 · 依赖表）与 `src/api/hitl.ts:14,43` 冻结注释均引 `router.py:184` 白名单，实际校验在 `router.py:203-208`。语义核对属实（三值白名单 400），仅行号引用漂移；契约注释同源，非 task 臆造 | 建议 30 交付时在 invoke 留痕该行号差；hitl.ts 注释勘正属「类型注释级完善可议」范畴（须 PR 说明）。不阻塞 |
| N2 | `HG-TASK-DRAFT` blocks 写「22-R1」为 20-task-audit 旧编号（V2 拆分后 22→20）；参照 task `task_web_lg_rag_sse_tab_hide_resume.md:44` 同写法，属仓内现行惯例 | 建议后续 task 统一改写 20-R1；本 task 与惯例一致，不阻塞 |
| N3 | TC6「审批已过期**类**提示」措辞为泛化口径（后端过期 decide 具体错误码/文案未实证，R1 residual 已诚实标注）；Vitest 断言文案子串仍可机断 | 接受现状；若 30 实证后端错误体，可在 invoke 补钉具体文案，不阻塞 |

---

## 回填清单

**无**（零内容阻塞，无需退回 10-task）。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（approved-with-comments · 内容零阻塞 · NIT ×3 非阻塞）
- [ ] 在 task 人工闸表将 `HG-TASK-DRAFT` 改为 approved（维护者 · 日期）
- [ ] 在 task 人工闸表将 `HG-AUDIT-R1` 改为 approved（维护者 · 日期）
- [ ] 在 task 人工闸表将 `HG-GRAPH-MODULES` 改为 approved（或确认 10 评估「不新增一级模块 + 行增量备注随 30 交付」既有模式授权 · 维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt（30 红测先行 · 切 `task/web-hitl-approval-page` 分支）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-23 | R1 · 20-task-audit：**approved-with-comments**（内容零阻塞签收 · NIT ×3：router.py:184→:203-208 行号漂移 / 22-R1 旧编号 / TC6 泛化口径）· 范围 10 条 ↔ 需求 7 条、非范围 7 条 ↔ 4 条、TC1–TC9 ↔ 验收 5 条、FP-1–FP-14 ↔ 点名五类全映射 · 冻结契约与现状断言全部亲读实证 · lint PASS EXIT=0 · verify BLOCKED 与三闸 pending 一致 · 未代签 · 未改 task 与 src · 零 git · 未附 30 Prompt |
