# Task Audit R1：web-lc-evidence-page

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lc_evidence_page.md`  
> **SPEC**：`docs/spec/SPEC-web-lc-evidence-page_v1.md`（signed · HG-SPEC-SIGNOFF=approved · 00 2026-08-16）  
> **SPEC 审查**：`docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md`（20-spec-audit · **pass**）  
> **10 invoke**：`docs/harness/invokes/by-task/web-lc-evidence-page/invoke_20260816_10_web-lc-evidence-page.md`  
> **日期**：2026-08-16  
> **审查人**：20-task-audit  
> **git_branch**：`task/web-lc-evidence-page`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**不**附 30 Prompt

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lc-evidence-page` |
| freeze_id | `lc-evidence-http-v1` |
| test_strategy | `required` |
| thinking_profile | `shortest`（正文仍预置 R0–R5） |
| invoke_retention_profile | `default`（`required_invoke_hats=10,30,40`） |
| graph_change_layer | `G-L1` |
| 本波策略 | **只开 web**；**mock 契约先行**；api HTTP 另仓不阻塞本仓 30 |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | 本审查 |
|---|---|---|
| **HG-GRAPH-MODULES** | **approved**（00 · 2026-08-16） | 一致；G-L1 pages/api/pinia 增量、不新增一级模块 |
| **HG-TASK-DRAFT** | **approved**（00 · 2026-08-16） | 一致；接受 mock 先行 + 00 冻结点 |
| **HG-AUDIT-R1** | **pending**（blocks **30**） | **保持 pending**；本帽不签发、不改表 |

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零阻塞**：范围 / 非范围 / 验收 / failure_paths / test_strategy 可执行且互洽；与 SPEC **方案 A** 一致、**禁止 Chat SSE**（方案 B 否决已写入失败路径与验收）；00 冻结点（外壳仅 `lcEvidence.ts` 拆包、timeout≥120s、mock 含 `snippet`、不改 `http.ts` 全局）已原样进入范围/验收/给 30 必读；思考轮 R0–R5 闭合、`early_stop=no` |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。`HG-GRAPH-MODULES=approved`、`HG-TASK-DRAFT=approved` 与表一致。30 **不可**开工，直至维护者在 task 表签 `HG-AUDIT-R1=approved`。本审查 **不附 30 Prompt** |

**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 维护者签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 SPEC 方案 A + 00 冻结）

| 项 | task | 审查 |
|---|---|---|
| 新页 + client + store | `LcEvidenceView.vue` / `api/lcEvidence.ts` / `stores/lcEvidence.ts`；可选 `components/lc-evidence/*` | 对齐 SPEC §3.1；现网 `router/index.ts` 无 `/lc-evidence` 槽，属增量 |
| 路由 `/lc-evidence` 需登录 | 不要 `meta.public`；复用 `beforeEach` | 对齐现网守卫（非 public → `/login?redirect=`） |
| AppLayout 侧栏入口 | 范围内 | 现网无此菜单，属增量 |
| 同步 `POST /ops/lc-evidence/invoke` | freeze `lc-evidence-http-v1`；`baseURL=/api` 时写相对路径 | **方案 A 成立**；不绑 Chat |
| 外壳拆包 | **仅** `lcEvidence.ts` 拆 `{ok,data}` | 对齐 00 冻结；现网 `http.ts` 约定「无 `{ok,data}`、不做转换」 |
| timeout | **本文件** ≥ 120000；禁止改全局 30s | 对齐 00 冻结；现网 `http.ts` `timeout: 30_000` |
| `snippet` | 类型与 mock **必须含** | 对齐 00 冻结与契约 JSON |
| G-L1 | `01_modules.md` pages 备注加 LC Evidence；可选 flow yaml | 不新增一级模块 |

### 非范围（对照 SPEC 非目标 + 否决方案 B）

| 项 | task | 审查 |
|---|---|---|
| 不改 `ChatView` / `useOpsChatSse` / chat store 默认行为 | 明确 | 与 SPEC 非目标一致 |
| **禁止** import `useOpsChatSse` / 打 `/ops/chat/stream` | 非范围 + 验收 + 失败路径「验收打回」 | **方案 B 否决已闭合** |
| 不实现 SSE 流式、多轮、Ingest、金样、只检索开关（P1） | 明确 | 与 SPEC 非目标一致 |
| 不改 `ops-desk-api` | mock 先行；联调 optional / `blocked_by api` | 对齐 00「本波只开 web」 |
| 不匿名公开 | 不要 `meta.public` | 明确 |
| 不改 `src/api/http.ts` 全局 timeout / 外壳约定 | 范围与非范围双写 | 对齐 00 冻结 |
| 不新增 G-L1 一级模块 | 明确 | 与 GRAPH 闸说明一致 |

### 验收

| # | 条款 | 可执行？ |
|---|---|---|
| 1 | 路由可进；侧栏入口；未登录跳 `/login?redirect=` | 是 · 复用现网 `beforeEach` |
| 2 | Mock 提交后渲染 evidence + answer + `meta.gate_action`；`refuse` 强调「无可用证据」 | 是 · **本波 mock 先行** |
| 3 | **禁止**默认走 `POST /api/ops/chat/stream`；单测断言不调用该路径；源码禁止 import `useOpsChatSse` | 是 · 可 Vitest / PR 打回 |
| 4 | `lcEvidence.ts` 仅本文件拆 `{ok,data}`；类型与 mock 含 `snippet`；timeout ≥ 120000；未改 `http.ts` 全局 | 是 · 00 冻结原样 |
| 5 | P0 UI：多行 query；提交中禁用；Meta 三字段；relevance 色标；answer 纯文本+换行；三分态 | 是 · 与 SPEC §3.3 同表 |
| 6 | Vitest：api client mock（拆包 + snippet）+ store（或视图）绿 | 是 · `test_strategy=required` |
| 7 | `pnpm lint` / `pnpm test` / `pnpm build` exit 0 | 是 |
| 8 | `01_modules.md` pages 备注含 LC Evidence；不新增一级模块；`graph-compile.sh` exit 0 | 是 |
| 9 | 联调 1 问冒烟 **可选** / `blocked_by api`；**非本波硬验收** | 是 · 不把 api 仓未就绪当本仓 30 阻塞 |

### failure_paths

对齐 SPEC §5，并按 00 冻结补全 422 / 500：

| 触发 | task 行为 | 审查 |
|---|---|---|
| 401 | 既有 `setUnauthorizedHandler`；本页不另写跳转 | 可复用现网拦截器 |
| 网络/超时 | 停 loading；Alert + 可重试；须本请求 timeout ≥ 120000 | 避免误用全局 30s |
| 422 | 不发或拦截后表单校验 | 00 冻结已带入 |
| `gate_action=refuse` | **正常 200**，写入 result，**不是** error 态 | 与 SPEC 一致 |
| API 未部署（404/502） | 停 loading；「旁路 API 不可用」；本波 mock 先行不挡 30 | residual，非本波硬验收 |
| 500 | 兼容 FastAPI `detail` 与 `{ok:false,error}` | 00 冻结已带入 |
| 误接 Chat SSE / import `useOpsChatSse` / 打 `/ops/chat/stream` | **验收打回** | 与否决方案 B 闭合 |

### test_strategy

| 项 | 值 | 审查 |
|---|---|---|
| `test_strategy` | `required` | 与 SPEC 元信息一致 |
| `test_strategy_note` | Vitest：api client mock（`{ok,data}` 拆包 + snippet）+ store；断言 **不**调用 `/ops/chat/stream`；`pnpm lint` / `pnpm test` / `pnpm build`；`./scripts/graph-compile.sh` | 可执行；覆盖 00 冻结与 Chat 边界 |
| 联调 | optional / `blocked_by api` | 正确降级；不阻塞 web 30 |
| 单测对照 | `tests/http.spec.ts`、`tests/chat-store.spec.ts`；本页 **不要** mock `useOpsChatSse` | 给 30 必读已写 |

### invoke 留档

| 项 | 值 | 审查 |
|---|---|---|
| `invoke_retention_profile` | `default` | 对应 `10,30,40` |
| `required_invoke_hats` | `10,30,40` | 与 default 一致 |
| 10 invoke | **已有** `invoke_20260816_10_web-lc-evidence-page.md` | 满足本阶段 |
| 30 / 40 invoke | **待后帽** | 正确；本审查不要求预写 |
| 20 invoke | 不要求 | default 集合不含 20；审查结论落 `reviews/` |

### 思考轮控制表与 R0–R5 闭合

| 控制字段 | 值 | 审查 |
|---|---|---|
| thinking_profile | `shortest` | 合法；仍预置六轮正文 |
| actual_last_round | `R5` | 与 `### R0` … `### R5` 六槽一致 |
| early_stop | `no` | 未提前收束；`early_stop_reason=""` 合法 |
| residual_risks | 后端 HTTP 未合入则仅 mock | 已记录；与 00 策略一致 |

| 轮 | task 要点 | 闭合 |
|---|---|---|
| R0 | SPEC 已签；本波只开 web、mock 先行；00 冻结写成 30 不可绕过的验收/失败路径 | 是 · 不再论证「要不要单独页」 |
| R1 | 范围=新 view/client/store + router/侧栏 + G-L1 pages 备注；Chat 全非范围；不新增一级模块 | 是 · 对照现网无 `/lc-evidence` 槽 |
| R2 | timeout 必须落在 `lcEvidence.ts`；外壳拆包仅本 client；`snippet` 进类型与 mock | 是 · 00 冻结可执行化 |
| R3 | 401 复用既有跳转；422 表单；refuse=200 成功态；404/502 不挡 30；误接 Chat SSE 打回 | 是 |
| R4 | Vitest 拆包+snippet；store 覆盖 loading/success/refuse/error；质量门 + graph-compile；联调 optional | 是 |
| R5 | `HG-AUDIT-R1` 保持 pending；10 不代签、不附 30；残留=仅 mock + ≥120s timeout | 是 |

**思考轮审查通过**（控制表完整 · 回填闭合 · `early_stop=no` · residual 已写）。**不退回 10-task。**

---

## 阻塞 / 非阻塞

### 阻塞（内容）

**none**

### 非阻塞 / residual

| 项 | 说明 | 本波 |
|---|---|---|
| 真实联调依赖 api HTTP | `POST /api/ops/lc-evidence/invoke` 在 `ops-desk-api` 另仓另 task；web 以 freeze + mock 自给 | **非本波阻塞** |
| 修订记录滞后 | task 修订记录仍写「TASK-DRAFT=pending」（10 首稿当时）；人工闸表已是 `approved`。真值以表为准 | 不改 task；不退回 10 |
| 「给 30 必读」末段起草时态 | 写「起草时 HG-TASK-DRAFT 与 HG-AUDIT-R1 均为 pending」；表内 TASK-DRAFT 现已 approved。30 以 **人工闸表** 为准 | 非内容缺口 |
| 10 invoke notes 快照 | invoke 写「HG-TASK-DRAFT 保持 pending」是 10 当时指令；不改 invoke | 快照 vs 表分工正确 |
| 30/40 invoke 未落 | `required_invoke_hats=10,30,40`；10 已有，30/40 待后帽 | 正确 |
| CE/LLM 延迟 | UX 靠 ≥120s timeout + 可选 Abort | 已写入范围/失败路径 |

---

## 签收

**内容：签收。** 范围 / 非范围 / 验收 / failure_paths / test_strategy / 思考轮均可执行；与 SPEC 方案 A 及 00 签收注记一致；方案 B（Chat SSE）已否决并写入打回路径。

**流程闸：未签收 30 授权。** `HG-AUDIT-R1` **仍为 pending**（本审查刻意不改 task 表）。`verify` 显示不可 30 / `may_start_30=false` 是 **正确** 行为。

本审查 **禁止** 附 30 可复制 Prompt。下一动作见文末维护者签闸清单。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
