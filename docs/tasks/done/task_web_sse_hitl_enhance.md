# Task：Web · 联调 T-W2 · SSE/HITL 增强批（F2/F3）

> **状态**：`done`（2026-10-12 验收通过 · S2/S3 全过 · main verify 252/252 绿 · R2/R2.1 审查 PASS · PR #61 MERGED · 归位 #62）  
> **类型**：feature-lite / 联调增强（文档级补全 + decide UI 可选键 + 终态渲染核对）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：`docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · Q1-Q4 已裁 2026-10-11 维护者 m00026）§4 F2/F3 · §9 拆 task 规划 · 缺口②③④  
> **分支**：`task/web-sse-hitl-enhance`（建议；base：`main`）  
> **00 注**：2026-10-11 · 维护者令联调链执行 · 00 代录起草

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-sse-hitl-enhance` |
| **git_branch** | `task/web-sse-hitl-enhance` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | SPEC signed → 本 task（10）→ 20-task-audit R1 → 维护者人签 HG-AUDIT-R1 → web 30 → 联调验收 S2/S3 |
| **test_strategy** | `required` |
| **test_strategy_note** | **FP-5 回退闸**：Vitest 全量 **225 条全绿**（`tests/chat-store.spec.ts` **65 条 it** 在案）；动 useLgRagSse 管线须零回归。联调实操 S2/S3 照验收 20261010 口径（六 env 组本地双跑） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（无新页面/路由；decide UI 为既有 chat 面内组件改动；若 30 判 chat flow 需备注则按 G-L1 备注一句） |
| **graph_delta** | `n/a`（可选：`docs/_tech_graph/l1/10_flow_chat.graph.yaml` 备注 decide 载荷增 `resume_mode` 可选键） |
| **graph_delta_note** | 不新增一级模块；flow 备注由 30 实判 |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 联调坑位（SSE 缓冲 / 六 env 组）随 invoke 留档 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表 · 仅 doc comment 清单补全） |
| **related_pr** | `#61`（MERGED 2026-10-12 · 栈式合入 drafts）· 落账归位 main PR `#62`（MERGED 2026-10-12） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-11 维护者令联调链执行 · 00 代录 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-11 · 维护者授权 00 代录（m00230「授权00签收后续文档」）；20-task-audit R1 **PASS-WITH-NIT** 零内容阻塞（审查文 `docs/harness/reviews/task_web-integration_audit_R1_20261011.md` · 58bf8de）· NIT-1 已随签回填 · NIT-2 留 web#57 合并后自然消解 · NIT-4 语义裁定留维护者（FP-5 闸兜底）· 30 可开工 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-11 · 00 代录 · 理由：无新页面/路由/模块，`docs/_tech_graph/l1/01_modules.md` 零改动；chat flow 备注为可选 G-L1 备注，不阻塞 |

---

## 背景与目标

SPEC §1.1 盘点核真三枚真残留（缺口②③④）：② `src/composables/useLgRagSse.ts:28` 帧型 doc comment 仅 6 型（`run.start · node.progress · subtask.progress · answer · done · error`），**未收 `hitl.waiting`**——运行时 `event_type: string` 已全透传（chat.ts:709 `case 'hitl.waiting'` 在案），属纯文档级清单补全；③ decide 未传 `resume_mode` 可选键；④ `done{resumed}` 终态语义前端处理待核。本 task 照 SPEC §9 T-W2 行收敛三缺口，并复跑 S2/S3 验收令。

### 完成态

1. `useLgRagSse.ts:28` doc comment 6 型 → **7 型**（增 `hitl.waiting`；纯注释级，零运行时变更）。
2. decide 卡片增 `resume_mode` 可选键 UI：`inherit / immediate / manual` 三选，**默认 inherit**，不破坏「decide 不自动 resume」两步钉死现状。
3. `done{resumed}` 终态渲染核对：含 HITL resume 流唯一终态 = `done{resumed}`，前端**禁等 `completed`**（SPEC §3.5 钉死：`completed` 字面结构性不可达）。
4. S2/S3 联调复跑通过，证据落 invoke。
5. **FP-5 闸**：Vitest 全量 225 条全绿（chat-store.spec.ts 65 条 it）。

---

## 现状锚点（只读）

| 主题 | 路径 | 缺口 |
|------|------|------|
| 帧型 doc comment | `src/composables/useLgRagSse.ts:28`（`LgRagSseEvent.event_type` 注释行） | 6 型未收 `hitl.waiting` |
| hitl.waiting 消费 | `src/stores/chat.ts:709` `case 'hitl.waiting'` · :396 钉案 · :435 pending 无轮询 | 已交付 · 无码缺口 |
| decide API | `src/api/hitl.ts:20-91`（pending/decide/resume） | decide 载荷未含 `resume_mode` 可选键 |
| decide 卡片 UI | ChatView / decide 组件（30 实扫钉组件锚点） | 无 `resume_mode` 三选控件 |
| done 帧渲染 | `src/stores/chat.ts` done 分支（30 实扫核 `payload.resumed` 处理） | `done{resumed}` 渲染待核 · 禁等 `completed` |
| 后端契约 | api `hitl/router.py:184`（decide `resume_mode∈{inherit,immediate,manual}` 白名单未知值 400）· `resume.py:131` · `event_store.py:99-107`（done{resumed}） | 只消费 · 零后端改动 |

---

## 范围

- [x] **W1 · 帧型清单补全（文档级）**：`useLgRagSse.ts:28` 注释补 `hitl.waiting` 为 7 型；核 `LgRagSseCallbacks.onEvent` 注释（:42 附近）同步补全；**零运行时改动**
- [x] **W2 · decide `resume_mode` UI**：decide 卡片增可选键三选（inherit/immediate/manual · 默认 inherit 不送或送 inherit）；未知值由后端白名单 400，前端展示 400 错误态不本地臆造第四个值
- [x] **W3 · `done{resumed}` 终态核对**：前端终态判定以 `done` 帧为准（`payload.resumed` 为信息键）；核渲染不依赖 `completed` 字面；缺则补、有则对拍留证
- [x] **W4 · S2 断线补齐回归**：提问 → 帧序渲染 → 中途断网 → replay（`seq > after_seq`）补齐**零丢失** → 帧计数一致；未知帧型容错跳过实证（SPEC §3.3）
- [x] **W5 · S3 HITL 全链复跑**：六 env 组（验收 20261010 口径）：挂起 → 审批 → decide → resume → `done{resumed}` 渲染；`auto_resume=immediate` 时 UI 自适应展示自动续跑
- [x] **W6 · FP-5 回退闸**：Vitest 全量 225 条全绿（chat-store.spec.ts 65 条 it）；useLgRagSse 管线零回归

### 非范围

- **后端零改动**（SPEC §3）：联调暴露后端缺口报回 ops-desk-api 另立 task；FP-1 禁前端迁就
- **admin 面出范围**（Q3 裁定 m00026）
- F8/F10 待 D4/D5（T-W4 另立）；F9 Obs 页不在联调范围
- T-W1 回归批面（F1/F4/F6/F7）；T-W3 Capability 目录页（F5）
- D2 SSE 断线策略细化（重连触发条件/退避钉多细 · 开放裁定 · 本批只验 replay 补齐现状）
- D3 多端一致性（倾向 A 不管 · 留维护者裁定）
- 改 SSE freeze 事件表 / 重做 Chat 视觉；ios

---

## 联调环境与坑位

| 坑位 | 钉死 |
|------|------|
| vite proxy | 必须 `http://127.0.0.1:8000`（`vite.config.ts:90-99`）：macOS localhost IPv6 打 Docker 旧镜像 404 |
| 登录 | api `scripts/create_initial_user.py` 邀请码制 |
| httpx 环境 | `NO_PROXY` 含 `[::1]` 炸 httpx 须剥 |
| **SSE 代理缓冲（FP-3）** | 联调环境钉死直连或关缓冲配置；vite proxy / 反代不得缓冲 SSE，否则帧不实时、S2 假败 |
| 六 env 组（S3） | `LG_RAG_DELEGATION_TOKEN_MODE=enforce` · `OPS_CAPABILITY_EXTRA_MANIFESTS` · `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing` · `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS` · `OPS_HITL_PERSISTENCE=db` · `OPS_CAPABILITY_ALLOW_WRITE=1`（SPEC §5） |
| 后端起法 | logging 须自带 basicConfig 启动器 · env 启动瞬间生效 · curl 全 URL+Content-Type（验收便签坑位 1-4） |

---

## failure_paths

| 触发 | 期望 |
|------|------|
| 闸 pending 即 30（HG-AUDIT-R1） | **拒开工** |
| web 既有实现与契约冲突（FP-1） | 以端点实际行为为准回填修订；禁前端迁就；冲突落 invoke 回报 00 |
| SSE 代理缓冲致帧不实时（FP-3） | 联调环境钉死直连/关缓冲；S2 复跑前核环境 |
| 与 specwave-3.1.0 并行链撞文件（FP-4） | 隔离面钉死：specwave 触 harness 配置 + graph 面；**本批触 `useLgRagSse.ts` / chat store / decide UI**，拆分时不越面 |
| **动 useLgRagSse 管线致帧处理回归（FP-5）** | Vitest 全量 **225 条全绿**（chat-store.spec.ts **65 条 it**）为回退闸；红即回退 |
| decide 送非法 resume_mode | 后端白名单 400；前端展示错误态，不重试死循环 |
| 前端等 `completed` 终态 | 审查/测拒收（`completed` 结构性不可达 · SPEC §3.5） |
| 断网后 replay 丢帧 | S2 不通过 → 阻塞 merge，不假 CLOSE |

---

## 验收标准

- [x] `HG-AUDIT-R1` approved（20-task-audit R1 **PASS-WITH-NIT** 零阻塞 · 2026-10-11 维护者授权 00 代录 m00230）
- [x] `useLgRagSse.ts` 帧型 doc comment 7 型齐（含 `hitl.waiting`）；diff 纯注释级
- [x] decide 卡片 `resume_mode` 三选 UI 交付：默认 inherit · 两步钉死不破 · 400 错误态可见
- [x] `done{resumed}` 终态渲染核对结论落档（禁等 `completed` 实证）
- [x] S2：断网 → replay 补齐零丢失 → 帧计数一致；未知帧容错实证
- [x] S3：六 env 组全链 挂起→审批→decide→resume→`done{resumed}` 渲染；`auto_resume=immediate` 自适应展示
- [x] **FP-5 闸**：`$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` 全量 225 条全绿（chat-store.spec.ts 65 条 it）· `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm lint` / `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm build` 绿
  - NIT-1 注：仓 `packageManager` 钉 `pnpm@10.32.1`，PATH 前置的 pnpm 11 会拒跑——本批 verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（维护者本机 v24.15.0 pnpm 10）
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_sse_hitl_enhance.md` PASS

---

## 依赖

| 依赖 | 说明 |
|------|------|
| SPEC | `docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · §4 F2/F3 · §9 T-W2） |
| SSE 契约 | `docs/spec/web-lg-rag-sse-t2/`（freeze lg-rag-sse-v1 · 只消费） |
| 验收基线 | api `docs/acceptance/20261010_hitl-consumption-loop_local_acceptance.md`（六 env 组口径） |
| HITL 前端先例 | `docs/spec/web-chat-history-hitl-ux/`（decide 两步钉死在案） |
| SSE 设计真值 | `../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md` |
| 后端契约锚点 | api `hitl/router.py:184` · `resume.py:131` · `event_store.py:99-107`（只读消费） |

---

## 给执行帽的必读列表

1. `AGENTS.md`
2. 本 task
3. `docs/spec/web-integration/SPEC-web-integration_v0.md` §2.2/§2.3/§3/§4/§5/§8
4. `src/composables/useLgRagSse.ts`（:28 帧型注释 · 管线）
5. `src/stores/chat.ts`（:709 hitl.waiting · done 分支）
6. `src/api/hitl.ts`（decide 载荷）
7. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | T-W2 = 三缺口收敛（7 型注释 / resume_mode UI / done{resumed} 核对）+ S2/S3 | no | — | none |
| R1 | 缺口②纯文档级（运行时已透传）；缺口③默认 inherit 不破坏两步钉死 | no | — | none |
| R2 | FP-5 闸钉死 225/65 计数；FP-3 环境钉死；FP-4 隔离面钉死 | yes | 范围/验收/闸/隔离面全钉 | decide UI 组件锚点待 30 实扫；done{resumed} 若实测有渲染缺口，补渲染仍在 F3 面内 |
| R3 | （未开） | — | early_stop at R2 | — |
| R4 | （未开） | — | early_stop at R2 | — |
| R5 | （未开） | — | early_stop at R2 | — |

**actual_last_round**：R2 · **early_stop**：yes · **residual_risks**：见 R2

### R0 · 问题框定

F2/F3 已接通但有三枚真残留（SPEC §1.1 缺口②③④）+ 两条验收令（S2/S3）未复跑。

### R1 · 缺口性质分级

②纯文档级（`event_type: string` 运行时已全透传 · R1 B1 修正在案）；③为可选键 UI（默认 inherit 兼容现状）；④为核对（禁等 completed 钉死）。

### R2 · 闸与隔离

FP-5 回退闸量化钉死（225 全量 / 65 chat-store）；FP-3 环境缓冲钉死；FP-4 与 specwave-3.1.0 隔离面钉死（本批触 useLgRagSse/chat store/decide UI）。

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
| `npx spec-wave task lint --file docs/tasks/active/task_web_sse_hitl_enhance.md` | **PASS**（2026-10-11 起草稿实跑） |
| 结论 | **HG-AUDIT-R1 approved（2026-10-11 · 维护者授权 00 代录 m00230 · R1 PASS-WITH-NIT）· GO 30** |

### 最终验收实录（CLOSE · 2026-10-12）

| 检查 | 结果 |
|------|------|
| 联调实操 | S2 断网 replay 补齐零丢失 + S3 六 env 组 HITL 全链（挂起→审批→decide→resume→`done{resumed}`）全过（2026-10-11 17:17–17:40 真跑 · 证据 `docs/harness/invokes/by-task/web-sse-hitl-enhance/`） |
| 三缺口收敛 | 帧型注释 7 型（`useLgRagSse.ts:28`）· `resume_mode` 三选 UI（`HitlApprovalCard.vue` · 默认 inherit 载荷字面不变）· `done{resumed}` 终态钉（禁等 `completed` 实证） |
| 实现审查 | R2 PASS-WITH-NIT（B-R2-1 补证棒解阻塞）→ R2.1 复核 PASS（`docs/harness/reviews/task_web-integration_impl_R2_20261011.md` · ad9f5c1）· NIT-R2-4 补尾棒已落（已失证据 7 行承证替代 · src/tests 零触碰） |
| main verify（origin/main @95c758c · 2026-10-12 11:09） | **PASS**：`pnpm lint` exit 0 · Vitest **31 文件 252/252** · `pnpm build` 2.33s |
| 合并 | PR #61 MERGED 2026-10-12（栈式合入 drafts）· 落账归位 main PR #62 MERGED 2026-10-12 |

### KPI

Task_KPI%: 100（PR #61 MERGED 2026-10-12 · 落账归位 PR #62 · 关账归档 done/）

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-11 | 10 起草（00 代录 · 维护者令联调链执行）· SPEC §9 T-W2 行落地 |
| 2026-10-11 | HG-AUDIT-R1 签认代录（00 · 维护者授权 m00230 · R1 PASS-WITH-NIT 审查文 58bf8de）· NIT-1 回填（NIT-4 留维护者裁定） |
| 2026-10-12 | CLOSE：S2/S3 全过 · R2/R2.1 审查 PASS（NIT-R2-4 补尾已落）· main verify（lint exit 0 · Vitest 31 文件 252/252 · build 2.33s · 11:09）· PR #61 MERGED · 归位 #62 · 归档 done/ |
