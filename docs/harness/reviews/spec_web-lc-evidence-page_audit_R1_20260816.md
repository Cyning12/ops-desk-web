# SPEC Audit R1：web-lc-evidence-page

> **hat_id**：20-spec-audit  
> **SPEC**：`docs/spec/SPEC-web-lc-evidence-page_v1.md`  
> **invoke**：`docs/harness/invokes/by-task/web-lc-evidence-page/invoke_20260816_10_spec_web-lc-evidence-page.md`  
> **日期**：2026-08-16  
> **审查人**：20-spec-audit  
> **git_branch**：`task/web-lc-evidence-page`  
> **Open Folder**：`ops-desk-web/`  
> **对照现网**：`src/api/http.ts` · `src/router/index.ts` · `src/layouts/AppLayout.vue`

---

## 元信息

| 字段 | 值 |
|---|---|
| spec_slug | `web-lc-evidence-page` |
| SPEC 状态 | `signed`（HG-SPEC-SIGNOFF=approved · 00 2026-08-16） |
| track | `frontend` / `rag-debug` |
| test_strategy | `required` |
| 本波范围 | **只开 web task**（mock 契约先行）；api HTTP 另仓另 task |
| 本审查动作 | 书面审查落盘；**不**改 SPEC 实质条款；**不**改闸回 pending；**不**签发 HG-AUDIT-R1 |

---

## 核对表

### 范围

| 项 | 结论 |
|---|---|
| 新路由页 `/lc-evidence` + AppLayout 侧栏入口 | 成立；现网 `router/index.ts` 无此槽、`AppLayout.vue` 无此菜单，属增量 |
| 登录后可用（同 cookie 鉴权） | 成立；现网 `beforeEach` 已对非 `public` 路由跳 `/login?redirect=`，新子路由可复用 |
| 同步 `POST /api/ops/lc-evidence/invoke` | **方案 A 成立**；前端薄客户端，不绑 Chat |
| 展示 `meta` / `evidence[]` / `answer` | 目标可验收；字段子集对齐 `ChainResult` / `EvidenceItem` / `GateDecision` |
| client + store（可选 components） | R1 范围闭合 |
| G-L1 图谱一行（`l1/01_modules.md`） | 验收第 6 条已写 |

**方案裁定（须记录）**

- **采用 A**：新页 + 同步 `POST /api/ops/lc-evidence/invoke`。
- **否决 B**：绑 Chat SSE / Flag 切链 —— 违背「单独调用 LangChain」，且会污染现网 `useOpsChatSse` / `/ops/chat/stream`。
- **否决 C**：仅 mock 当产品路径 —— 可作 Vitest 夹具，不能当联调真值。

### 非范围

| 项 | 结论 |
|---|---|
| 不改 `ChatView` / `useOpsChatSse` 默认行为 | 明确；00 加严：**禁止** import `useOpsChatSse` / 打 `/ops/chat/stream` |
| 不做流式 SSE（P0 同步 JSON） | 明确 |
| 不多轮会话 / session 历史 | 明确 |
| 不做 Ingest / 金样评测 / 只检索开关（P1） | 明确 |
| 不匿名公开 | 明确 |
| 不改全局 `http.ts` 约定 | 00 裁定：外壳仅 `lcEvidence.ts` 拆包 |

### 验收

| # | 条款 | 可执行？ |
|---|---|---|
| 1 | 路由可进；侧栏有入口；未登录跳登录 | 是 · 对齐现网守卫 |
| 2 | Mock 或真 API：渲染 evidence + answer + `meta.gate_action` | 是 · **本波 mock 先行**（00） |
| 3 | **禁止**本页默认走 `POST /api/ops/chat/stream` | 是 · 可 Vitest / PR 打回 |
| 4 | Vitest client/store（或组件）mock 绿；lint / test / build | 是 |
| 5 | 联调：后端 `lc-evidence-http-v1` 可用时 1 问冒烟 | 是 · **非本波阻塞**（见 residual） |
| 6 | G-L1 登记页面/api 增量 | 是 |

**00 已裁定（冻结，10-task 须原样带入，本审查不改条款）**

| 项 | 裁定 | 现网对照 |
|---|---|---|
| 响应外壳 | freeze `{ok, data}`；**仅** `lcEvidence.ts` 拆包 | `http.ts` 约定「无 `{ok,data}` 外壳、不做转换」；禁止改全局 |
| `snippet` | 前端类型与 **mock 必须含** `snippet` | 契约 JSON 已含；后端 `@property` 序列化属 api 仓 |
| 超时 | 本接口 axios timeout **≥ 120000** | 全局 `http` `timeout: 30_000`；禁止改全局 30s |
| 错误 | 401 既有跳登录；422 表单；网络/超时 Alert+可重试；500 兼容 FastAPI `detail` 与 `{ok:false,error}` | `normalizeError` 已吃 `detail`；401 拦截器已装配 |
| Chat 边界 | **禁止** `useOpsChatSse` | `src/composables/useOpsChatSse.ts` 仅 Chat 使用 |
| 图谱 | G-L1 `01_modules.md` pages 备注；可选 flow yaml | 与 SPEC §4.6 一致 |
| 本波策略 | **web 30 mock 先行**；api HTTP 另仓不阻塞 web 30 | 与「00 签收注记」一致 |

### failure_paths

| 触发 | SPEC 行为 | 审查 |
|---|---|---|
| 401 | 跳登录 | 可复用现网 `setUnauthorizedHandler` |
| 网络/超时 | 停 loading · Alert · 可重试 | 须本请求 ≥120s，避免误用全局 30s |
| `gate_action=refuse` | 200 + Meta 提示 + 拒答文案 | 正常路径，非错误 |
| API 未部署 | 502/404 · 「旁路 API 不可用」 | mock 先行时本波不挡 30 |
| 误接 Chat SSE | 验收打回 / PR 拒绝 | 与否决方案 B 闭合 |

### 思考轮 R0–R5 闭合

| 轮 | SPEC 要点 | 闭合 |
|---|---|---|
| R0 | 单独调用 LangChain 旁路页，不混 Chat | 是 |
| R1 | 范围=新页+client+store+契约；非范围=改 Chat / 流式 / 匿名 | 是 |
| R2 | 采用方案 A；否决绑 Chat SSE | 是 |
| R3 | 鉴权/超时/refuse/API 缺失；freeze `lc-evidence-http-v1` | 是 |
| R4 | Vitest mock + lint/test/build；联调 1 问；G-L1 | 是 |
| R5 | 可交人签；签后拆 web task + api HTTP task（web mock 先行） | 是 |

| 控制字段 | 值 | 审查 |
|---|---|---|
| actual_last_round | R5 | 与正文六轮一致 |
| early_stop | **no** | 未提前收束 |
| residual_risks | 后端 HTTP 未合入则只能 mock；CE/LLM 延迟影响 UX | 已记录；见下节 |

**思考轮已闭合，`early_stop=no`。**

---

## 阻塞 / 非阻塞

### 阻塞

**none**

### 非阻塞 / residual

| 项 | 说明 | 本波 |
|---|---|---|
| 真实联调依赖 api HTTP | `POST /api/ops/lc-evidence/invoke` 在 `ops-desk-api` 另仓另 task；Web 以 freeze 契约 + mock 自给 | **非本波阻塞** |
| invoke 字面仍写 draft/pending | `invoke_20260816_10_spec_*.md` 为 10-spec 当时快照；真值以 SPEC 人工闸表 `approved` 为准 | 不改 invoke；不改闸 |
| CE/LLM 延迟 | UX 依赖 ≥120s timeout + Abort；属实现注意，非 SPEC 缺口 | 10-task 带入即可 |

---

## 判定

**pass**

依据：范围 / 非范围 / 验收 / failure_paths 可执行且互洽；方案 A 成立、方案 B（Chat SSE）否决；00 签收注记已冻结外壳拆包、snippet、timeout、mock 先行、禁止 `useOpsChatSse`；R0–R5 闭合且 `early_stop=no`；residual（api HTTP 联调）已标明非本波阻塞。无书面缺口需退回 10-spec。

---

## HG-SPEC-SIGNOFF 建议

| 项 | 值 |
|---|---|
| SPEC 表内现状 | **approved**（00 · 2026-08-16） |
| 本审查建议 | **同意维持 approved** |
| 本审查动作 | **不代签**；**不改回 pending**；不改 SPEC 实质条款 |

---

## 下一棒

1. **00 / 10-task**：本仓起草 `task_web_lc_evidence_page.md`（mock 契约先行；带入上表 00 裁定）。
2. `ops-desk-api` 的 `task_lc_evidence_http.md` **另仓另 task**，不阻塞本仓 web 30。
3. 其后：20-task-audit 审 web task → 人签 `HG-AUDIT-R1` → 30。

**禁止**：本审查不附 30 Prompt；不签发 `HG-AUDIT-R1`。
