# Task：Web · 联调 T-W1 · 回归批（F1/F4/F6/F7）

> **状态**：`done`（2026-10-12 验收通过 · S1/S4/S6/S7 全过 · main verify 252/252 绿 · R2/R2.1 审查 PASS · PR #59 MERGED · 归位 #62）  
> **类型**：regression / 联调回归验证（后端功能面已接通 · 本批以验证为主）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：`docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · Q1-Q4 已裁 2026-10-11 维护者 m00026）§4 F1/F4/F6/F7 · §9 拆 task 规划  
> **分支**：`task/web-integration-regression`（建议；base：`main`）  
> **00 注**：2026-10-11 · 维护者令联调链执行 · 00 代录起草；本批**无依赖可先行**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-integration-regression` |
| **git_branch** | `task/web-integration-regression` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | SPEC signed → 本 task（10）→ 20-task-audit R1 → 维护者人签 HG-AUDIT-R1 → web 30 → 联调验收 S1/S4/S6/S7 |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 回归（pnpm test 全量 225 条基线）+ **D1 倾向 A 本地双跑**（web `vite dev` + api `uvicorn`）联调实操：S1/S4/S6/S7 四场景照单执行，证据落 invoke |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（回归批无新页面/路由/模块变更预期；核对暴露缺口另立 task） |
| **graph_delta** | `n/a` |
| **graph_delta_note** | 回归验证不改图谱；若 role 菜单核对暴露缺口，缺口 task 按实判 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 联调环境坑沉淀至本 task「联调环境与坑位」节 + 验收 invoke |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表） |
| **related_pr** | `#59`（MERGED 2026-10-12 · 栈式合入 drafts）· 落账归位 main PR `#62`（MERGED 2026-10-12） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-11 维护者令联调链执行 · 00 代录 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-11 · 维护者授权 00 代录（m00230「授权00签收后续文档」）；20-task-audit R1 **PASS-WITH-NIT** 零内容阻塞（审查文 `docs/harness/reviews/task_web-integration_audit_R1_20261011.md` · 58bf8de）· NIT-1/NIT-3 已随签回填 · NIT-2 留 web#57 合并后自然消解 · 30 可开工 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-11 · 00 代录 · 理由：回归批无新页面/路由/模块变更，`docs/_tech_graph/l1/01_modules.md` 零改动预期 |

---

## 背景与目标

SPEC §4 已核真：F1 认证会话 / F4 会话历史 / F6 仪表盘 / F7 lc-evidence·lg-rag invoke 四面**已接通**（api/auth.ts · chatHistory.ts · overview/issues/pulls/graph.ts · lcEvidence.ts/lgRag.ts），缺的是**权威回归验收**。本 task 照 SPEC §9 T-W1 行：四面回归 + role 驱动菜单核对 + 契约对拍，产出可复跑的联调证据。

### 完成态

1. S1/S4/S6/S7 四场景本地双跑实操通过，证据落 invoke（命令输出/截图/Network 摘要）。
2. role 驱动菜单核对：maintainer 面入口按 `/auth/me` role 显隐，普通用户零探测面。
3. 契约对拍结论落档：snake_case 原始体照登；threads envelope 例外照登。
4. Vitest 全量 225 条全绿（本批原则上零 src/ 改动；若核对暴露缺口 → 另立 task，不在本批夹带）。

---

## 现状锚点（只读）

| 主题 | 路径 | 备注 |
|------|------|------|
| 认证会话 | `src/api/auth.ts:16-40` · `src/router/index.ts:88-100`（ensureMe 守卫） | 401 全局跳登录已在案 |
| 会话历史 | `src/api/chatHistory.ts:20/:101/:113` · `src/stores/chat.ts:22`（sessions/latest） | threads + history 回放 |
| 仪表盘 | `src/api/overview.ts:62` · `issues.ts:47` · `pulls.ts:40` · `graph.ts:26` | 四端点只读 |
| lc-evidence / invoke | `src/api/lcEvidence.ts:9/:153` · `src/api/lgRag.ts:9/:151` | 同步 envelope |
| vite proxy | `vite.config.ts:90-99` | `/api → http://127.0.0.1:8000` 钉死（注释在案） |

---

## 范围

- [x] **W1 · S1 认证回归**：冷启动登录 → `GET /auth/me` → 刷新会话存续 → logout 清空 → 401 跳登录
- [x] **W2 · S4 会话历史回归**：多轮对话后刷新 → 历史完整回放 → 切换 thread 内容正确
- [x] **W3 · S6 仪表盘回归**：overview/graph/issues/pulls 四端点渲染 + 筛选交互
- [x] **W4 · S7 同步调用回归**：lc-evidence invoke / lg-rag invoke 成功态 + 失败态渲染
- [x] **W5 · role 驱动菜单核对**：maintainer 面入口按 `/auth/me` role 隐藏；普通用户菜单零探测面（核对为主，暴露缺口另立 task）
- [x] **W6 · 契约对拍**：响应体 snake_case 原始体照登（禁前端臆改驼峰）；`/chat/threads` 系 envelope（{items,count} 外形）例外照登；字段级真值以 `/openapi.json` + 端点实际行为为准
  - NIT-3 回填：`/chat/stream` 410 Gone 钉——核 `tests/chat-stream-deprecation.spec.ts`（在 225 闸内）保持绿
- [x] **W7 · 联调环境钉死**：见「联调环境与坑位」节，坑位全部写进 invoke 留档

### 非范围

- **后端零改动**（SPEC §3 签收时锁死）：联调暴露的后端缺口一律报回 ops-desk-api 另立 task；**FP-1 禁前端迁就错误记忆**
- **admin 面出范围**（Q3 裁定 m00026）：sync/memory purge · Bearer 机读端点不做 web 页面，后续单独 task
- F8 B 面全量展示 / F10 models·WS 取舍：待 D4/D5 裁定（T-W4 另立）
- F9 Obs 页：fixture-only 无后端面，不在联调范围（照登防误列）
- SSE/HITL 增强（T-W2 面：帧清单补全 / resume_mode UI / done{resumed} 核对）
- Capability 目录页（T-W3 面）
- 改 SSE freeze / 事件解析表；ios

---

## 联调环境与坑位（验收便签口径 · 全部钉死）

| 坑位 | 钉死 |
|------|------|
| vite proxy | 必须 `http://127.0.0.1:8000`（`vite.config.ts:90-99` 注释在案）：**macOS localhost 走 IPv6 会打到 Docker 旧镜像 → 404** |
| 登录 | api `scripts/create_initial_user.py` **邀请码制**（每次新铸一次性邀请码） |
| httpx 环境 | `NO_PROXY` 含 `[::1]` 会炸 httpx → **须剥除**再跑 api 侧脚本 |
| SSE 联调 | 关代理缓冲（FP-3）：vite proxy / 反代不得缓冲 SSE；本批 S4 虽非帧实时面，环境一节统一钉死防 T-W2 踩坑 |
| D1 基线 | **倾向 A 本地双跑**：web `pnpm dev` + api `uvicorn`；compose 留持久化专项复验 |
| CORS | web vite dev 默认 :5173 直连免配；自定义端口须设后端 env `CORS_ORIGINS`（SPEC §2.7） |

---

## failure_paths

| 触发 | 期望 |
|------|------|
| 闸 pending 即 30（HG-AUDIT-R1） | **拒开工** |
| web 既有实现与 SPEC 契约冲突（FP-1） | **以端点实际行为为准**回填修订；禁前端迁就错误记忆；冲突面落 invoke 并回报 00 |
| 联调暴露后端缺口 | 报回 ops-desk-api 另立 task；本批不夹带后端 diff（SPEC §3） |
| 与 specwave-3.1.0 并行链撞文件（FP-4） | 隔离面钉死：specwave 触 harness 配置 + graph 面；本批触 tests/invoke 文档面 + 只读核对 src，拆分时不越面 |
| 未登录 / 会话过期 | 既有 401 → 登录流（S1 验收项） |
| api 未就绪（uvicorn 未起 / 邀请码失效） | 联调失败 → 阻塞 merge，不假 CLOSE |
| role 菜单核对暴露权限缺口 | 另立 task；不在本批夹带修复 |

---

## 验收标准

- [x] `HG-AUDIT-R1` approved（20-task-audit R1 **PASS-WITH-NIT** 零阻塞 · 2026-10-11 维护者授权 00 代录 m00230）
- [x] S1 冷启动登录 → me → 刷新存续 → logout → 401 跳登录：全步通过，证据落 invoke
- [x] S4 多轮后刷新 → 历史完整回放 → 切 thread 正确
- [x] S6 四端点渲染 + 筛选交互通过
- [x] S7 同步调用成功 / 失败态渲染通过
- [x] role 驱动菜单核对结论落档（maintainer 入口显隐正确 · 普通用户零探测面）
- [x] 契约对拍结论落档（snake_case 照登 · threads envelope 例外照登）
- [x] `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm lint` / `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test`（225 条全绿）/ `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm build` 绿
  - NIT-1 注：仓 `packageManager` 钉 `pnpm@10.32.1`，PATH 前置的 pnpm 11 会拒跑——本批 verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（维护者本机 v24.15.0 pnpm 10）
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_integration_regression.md` PASS

---

## 依赖

| 依赖 | 说明 |
|------|------|
| SPEC | `docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · §4 F1/F4/F6/F7 · §9 T-W1） |
| 验收基线 | api `docs/acceptance/20261010_hitl-consumption-loop_local_acceptance.md`（本地双跑口径） |
| 后端起法 | api `scripts/create_initial_user.py` 邀请码 · uvicorn |
| 既有联调清单 | `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（可扩） |
| 无阻塞依赖 | 本批可先行（SPEC §9） |

---

## 给执行帽的必读列表

1. `AGENTS.md`
2. 本 task
3. `docs/spec/web-integration/SPEC-web-integration_v0.md` §2/§3/§4/§5/§8
4. `vite.config.ts:90-99`（proxy 钉死）
5. `src/api/auth.ts` / `chatHistory.ts` / `overview.ts` / `lcEvidence.ts` / `lgRag.ts`（对拍面）
6. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | T-W1 = 四面已接通回归 + role 菜单核对 + 契约对拍 | no | — | none |
| R1 | 验收令 S1/S4/S6/S7 照 SPEC §4 行；D1 倾向 A 本地双跑 | no | — | none |
| R2 | 环境坑四枚（proxy 127.0.0.1 / 邀请码 / NO_PROXY [::1] / SSE 缓冲）全钉进 task | yes | 范围/验收/环境面已钉；回归批零 src 改动预期 | role 核对暴露缺口时须另立 task，本批 CLOSE 不含修复 |
| R3 | （未开） | — | early_stop at R2 | — |
| R4 | （未开） | — | early_stop at R2 | — |
| R5 | （未开） | — | early_stop at R2 | — |

**actual_last_round**：R2 · **early_stop**：yes · **residual_risks**：见 R2

### R0 · 问题框定

四面已接通但无权威回归验收；联调需求清单（SPEC §4）要求逐面 S 场景可复跑。

### R1 · 验收令与环境

S1/S4/S6/S7 直接取自 SPEC §4 行；D1 倾向 A（vite proxy 已就绪 · 验收便签全链为本地口径）。

### R2 · 坑位收敛 + 零改动边界

四枚环境坑全部钉死进 task；回归批原则上零 src 改动，暴露缺口一律另立 task（FP-1 · SPEC §3）。

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
| `npx spec-wave task lint --file docs/tasks/active/task_web_integration_regression.md` | **PASS**（2026-10-11 起草稿实跑） |
| 结论 | **HG-AUDIT-R1 approved（2026-10-11 · 维护者授权 00 代录 m00230 · R1 PASS-WITH-NIT）· GO 30** |

### 最终验收实录（CLOSE · 2026-10-12）

| 检查 | 结果 |
|------|------|
| 联调实操 | S1/S4/S6/S7 四场景本地双跑全过（2026-10-11 · 证据 `docs/harness/invokes/by-task/web-integration-regression/` · curl 链 + Playwright 截图 + 原始响应体 attachments） |
| role 菜单核对 / 契约对拍 | 结论落档（maintainer 入口按 `/auth/me` role 显隐 · 普通用户零探测面；snake_case 原始体照登 · threads envelope 例外照登） |
| 实现审查 | R2 PASS-WITH-NIT → R2.1 复核 PASS（`docs/harness/reviews/task_web-integration_impl_R2_20261011.md` · ad9f5c1 · 合审 T-W1/T-W2/T-W3） |
| main verify（origin/main @95c758c · 2026-10-12 11:09） | **PASS**：`pnpm lint` exit 0 · Vitest **31 文件 252/252** · `pnpm build` 2.33s |
| 合并 | PR #59 MERGED 2026-10-12（栈式合入 drafts）· 落账归位 main PR #62 MERGED 2026-10-12 |

### KPI

Task_KPI%: 100（PR #59 MERGED 2026-10-12 · 落账归位 PR #62 · 关账归档 done/）

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-11 | 10 起草（00 代录 · 维护者令联调链执行）· SPEC §9 T-W1 行落地 |
| 2026-10-11 | HG-AUDIT-R1 签认代录（00 · 维护者授权 m00230 · R1 PASS-WITH-NIT 审查文 58bf8de）· NIT-1/NIT-3 回填 |
| 2026-10-12 | CLOSE：S1/S4/S6/S7 全过 · R2/R2.1 审查 PASS · main verify（lint exit 0 · Vitest 31 文件 252/252 · build 2.33s · 11:09）· PR #59 MERGED · 归位 #62 · 归档 done/ |
