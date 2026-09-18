# Task：Web · 阶段 T · Chat 请求租户上下文

> **状态**：`active` · **壳** · **NO-GO 30**（仅等 `HG-STAGE-T-DATA`；`HG-CONTRACT-FREEZE` ✅ · `HG-D5-UI-SCOPE` ✅；建议等 api T1 可联调）  
> **类型**：feature / 只读多租户客户端  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：workspace `docs/contracts/api-v1-tenant-readonly-context-draft.md` · `docs/05-plan/06_stage_t_second_tenant_prep_v0_zh.md` · api `task_tenant_readonly_predicate`  
> **分支**：`task/web-tenant-context-chat`（建议；base：`main`）  
> **00 注**：2026-09-18 · 维护者令「起草」· 仅落壳；**D5 已拍：本波含租户切换 UI（直观可查看）**；验收含 **Agent Playwright 实操页面**（Cursor MCP / 本机 Playwright；仓内暂无 `@playwright/test` 依赖）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-tenant-context-chat` |
| **git_branch** | `task/web-tenant-context-chat` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | workspace 契约 freeze → api 上下文就绪 → web 30 → 联调冒烟 |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：lg-rag 请求带租户头/字段；**必交** Agent Playwright（或等价浏览器 MCP）切换 A↔B：UI 可见当前租户 + Network 头断言；仓内可不强制加 `@playwright/test` 本波 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（或等价 chat flow 备注） |
| **graph_delta_note** | 备注：Chat 请求携带租户上下文；不新增一级模块 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约在 workspace；本仓 checklist 可增一节（可选） |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；默认不改 event 表） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-09-18 维护者令本地 30 · 00 代签 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-09-18 维护者令本地 30 · 00 代签 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-09-18 · 仅 chat flow 备注 · 00 代签 |
| **HG-STAGE-T-DATA** | **approved** | **30** | 2026-09-18 Fixture 轨 · 本地跑通 |
| **HG-CONTRACT-FREEZE** | **approved** | **30** | 2026-09-18 · 对齐 workspace 契约 freeze（F1=C 等）· 00 代签 |
| **HG-D5-UI-SCOPE** | **approved** | 含切换 UI 的 30 范围 | 2026-09-18 维护者：「web 做切换，需直观可查看」+ Playwright agent 实操验收 |

---

## 背景与目标

api 阶段 T 将拒绝「无租户 / 错租户」的只读查询。Web 主 Chat（`useLgRagSse` · cookie `credentials:'include'`）须按契约把 **当前租户** 带进请求，避免仍依赖服务端全局 pilot 注入。

### 完成态（竖切 = 注入 + 切换 UI）

1. lg-rag stream（及必要的并行只读 API）按 freeze 附带租户上下文。  
2. Vitest 覆盖「带租户 / 缺租户不静默假成功」。  
3. **不**改 SSE 事件解析表（除非另开联调闸）。  
4. **租户切换 UI（D5 · 必做）**：当前租户**常驻可见**（如顶栏/Chat 区标签）；可在试点列表 A/B 间切换；切换后下一问走新租户。  
5. **Playwright agent 验收**：Agent 用 Playwright MCP（或本机 Playwright）打开页面，完成登录→看见当前租户→切换 A↔B→发一问；证据落 invoke（截图路径 + Network 头摘要）。

---

## 现状锚点（只读）

| 主题 | 路径 | 缺口 |
|------|------|------|
| SSE | `src/composables/useLgRagSse.ts` | `credentials:'include'`；**无**租户头/字段 |
| Chat 发送 | `ChatView` / `stores/chat` / `api/*` | 30 实扫钉携带点 |
| 契约 | workspace **freeze** · F1–F6 齐（含 F4 对外 404） |

---

## 10 钉死契约（草案 · 随 freeze）

| 项 | 钉死（草案） |
|----|----------------|
| **传输** | 继续 lg-rag SSE；`credentials:'include'` 保留 |
| **租户携带** | **F1=C**：切换先写 session；lg-rag 请求带 `X-Ops-Tenant-Id`（= session）；禁止与 session 不一致时强行发送 |
| **缺租户** | 前端预检或展示错误；不发起「裸」跨租户试探刷屏 |
| **SSE 事件** | 默认不增/改 `event_type` |
| **UI** | **必做切换器**；当前租户文案常驻可见（勿只藏在设置里）；试点选项至少 `ops-desk-pilot` / `ops-desk-pilot-b` |

---

## 范围

- [x] **W1 · 注入**：`useLgRagSse`（及 chat API 封装）按 freeze 带租户  
- [x] **W2 · 守卫**：Vitest 断言请求含约定头/字段；不一致路径不静默  
- [x] **W3 · 切换 UI**：当前租户可见 + A/B 切换（对齐 D5）；切换失败有明确错误态  
- [x] **W4 · Playwright agent 冒烟**：Agent 实操页面；invoke 留截图/Network 头证据（本波**不强制**把 `@playwright/test` 钉进 `package.json`，除非 30 另开）  
- [x] **W5 · 冒烟清单**：checklist 增「租户切换」节  
- [x] **W6 · 图谱**：chat flow 备注一句  

### 非范围

- 改 `ops-desk-api`（切换 session API 若需后端，归 api task / 契约 freeze 后联调，本仓只消费）  
- 阶段 W HITL 确认单 UI  
- 改 SSE freeze / 重做 Chat 视觉大改  
- ios  
- 完整租户管理后台（邀请、计费、任意租户 CRUD）  
- 本波强制入库 Playwright CI 套件（可后置；Agent MCP 验收先过）
---

## failure_paths

| 触发 | 期望 |
|------|------|
| 闸 pending 即 30 | **拒开工** |
| 未登录 | 既有 401 → 登录流 |
| 租户头与 session 不一致（api 403） | UI 明确错误；不自动换号重试死循环 |
| api 尚未部署 T | 联调失败 → 阻塞 merge，不假 CLOSE |
| 误改 SSE 解析致过程帧丢失 | 审查/测拒收 |

---

## 验收标准

- [x] `HG-STAGE-T-DATA` · `HG-CONTRACT-FREEZE` · `HG-AUDIT-R1` · `HG-GRAPH-MODULES` approved（`HG-D5-UI-SCOPE` 已 approved）  
- [x] W1–W3 完成；`pnpm lint` / `pnpm test` / `pnpm build` 绿  
- [x] W4：Agent Playwright 实操证据落盘（切换可见 + 请求租户正确）  
- [x] 图谱备注 + `./scripts/graph-compile.sh` 绿（若改）  
- [x] A/B 各至少一问 Chat（数据齐后 · 2026-09-18 retry · Playwright · stream 200）  
- [ ] 跨租户负样本与 api 联调勾选  
- [x] `npx spec-wave task lint --file docs/tasks/active/task_web_tenant_context_chat.md` PASS

---

## 依赖

| 依赖 | 说明 |
|------|------|
| workspace 过程 | `../ops-desk-workspace/docs/tasks/active/task_stage_t_tenant_contract.md` |
| 契约 | `../ops-desk-workspace/docs/contracts/api-v1-tenant-readonly-context-draft.md` |
| api task | `../ops-desk-api/docs/tasks/active/task_tenant_readonly_predicate.md` |
| 既有 SSE | `src/composables/useLgRagSse.ts` · lg-rag T2–T6 done |
| 联调清单（可扩） | `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` |

---

## 给执行帽的必读列表

1. `AGENTS.md`  
2. 本 task  
3. workspace 契约 + 06  
4. api `task_tenant_readonly_predicate`（联调语义）  
5. `useLgRagSse.ts` 与 chat 发送路径  
6. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（若有）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | Web T = 请求携带租户 + 可见切换 | no | — | none |
| R1 | D5 已拍：必做切换 UI | no | — | none |
| R2 | 不改 SSE 事件表；Playwright agent 验收 | yes | 范围与验收面已钉 | api 未就绪时联调阻塞 |
| R3 | （未开） | — | early_stop at R2 | — |
| R4 | （未开） | — | early_stop at R2 | — |
| R5 | （未开） | — | early_stop at R2 | — |

**actual_last_round**：R2 · **early_stop**：yes · **residual_risks**：见 R2

### R0 · 问题框定

无客户端携带，服务端只能继续全局 pilot——T 验收不成立；无可见切换则「直观可查看」不成立。

### R1 · UI 范围

维护者拍：切换 UI 本波必做；常驻显示当前租户。

### R2 · 契约面 + 测法

只加请求元数据，不动事件 freeze；验收用 Agent Playwright MCP（仓内可不钉 e2e 包）。

### R3 ·（未开 · early_stop）

本轮不展开。

### R4 ·（未开 · early_stop）

本轮不展开。

### R5 ·（未开 · early_stop）

本轮不展开。

---

### 自检结论

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_tenant_context_chat.md` | **待跑**（draft 占位 · close 前须回填） |
| 结论 | **10 壳已落 · D5 UI+Playwright 已钉 · NO-GO 30** |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-09-18 | 10 起草壳 · NO-GO 30 · D5 默认仅注入 |
| 2026-09-18 | D5 改为必做切换 UI · HG-D5 代签 · Playwright agent 验收 |
| 2026-09-18 | 对齐契约 F1=C / F2 / F3 |
| 2026-09-18 | F4 接受 · `HG-CONTRACT-FREEZE` approved |
