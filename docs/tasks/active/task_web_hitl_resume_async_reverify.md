# Task：Web · hitl-resume-async 复验（JC-F1 B 方案 · api 异步化后联调 TC3 链重跑 · 零改码预判）

> **状态**：draft（10 落稿 · 闸 pending · 40 拒开工）  
> **类型**：跨仓联调复验（纯观测 · 预期零改码 · 无 30 棒）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：ops-desk-api `task_hitl_resume_async`（api PR #252 MERGED · squash `0e5f6b1` · api master `2a5878c` 已核 ancestor）· 本仓 JC-F1 发现源 `task_web_api_joint_check`（CLOSED · 归档 commit `a30d705` · PR #66）  
> **分支**：`task/web-hitl-resume-async-reverify`（base：`main` 028ed29 + docs/hitl-resume-async-handoff 留痕 2 commit）  
> **00 注**：2026-10-15 · api 00 启动令 `invoke_20261015_00_dispatch_web_reverify.md`（维护者 m00383 B 方案裁定链下游）· 本窗 10 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-resume-async-reverify` |
| **git_branch** | `task/web-hitl-resume-async-reverify` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 40 live 复验（纯观测 · **无 30 棒** · 预期零改码；实证必须改码即停走新 task 链 · 触响应面契约同步回执 api 00）→ 复验结论回执落 `hitl-resume-async-handoff/` → 联合 CLOSE（api `task_hitl_resume_async` 50-CLOSE 等本复验结果） |
| **test_strategy** | `required` |
| **test_strategy_note** | 纯观测复验：三质量门基线照跑（lint/test/build · 基线 255 · 零改动应零漂移）+ live 实证为主体。verify 命令一律钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径）。40 live 照 api 起服三坑 + 六 env 组菜谱 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（零改码 · 无新页面/路由/模块 · `docs/_tech_graph/l1/01_modules.md` 零改动预判；实证破预判即停走新 task） |
| **graph_delta** | `n/a` |
| **graph_delta_note** | 不新增一级模块；图谱面零触达 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（JC-F1 复验结论 → 40 invoke · api 回执 → hitl-resume-async-handoff/）；文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,40`（**无 30 棒** · 预期零改码；profile 字面不另改 · 同 fobs NIT-2 口径预登闭环） |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表 · 不新 event_type） |
| **related_pr** | 待开（docs-only · 勿 auto-merge） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 40 | 2026-10-15 api 00 启动令 `invoke_20261015_00_dispatch_web_reverify.md`（维护者 m00383「B方案…生成api的启动Prompt,交由api agent的00来统筹」裁定链下游 · 复验归 web agent 见回执 §联调）· 本窗 10 落稿 |
| HG-AUDIT-R1 | **approved** | **40** | 2026-10-15 维护者签认（会话 m00111：「/harness-00-delegate-only 签收，授权00签收后续文档」· 授权 00 代笔落表 · fobs 先例同法）→ **40 解锁**（纯观测 · 无 30 棒） |
| HG-GRAPH-MODULES | **approved**（n/a 确认） | 30（无 30 棒） | 2026-10-15 维护者随 HG-AUDIT-R1 一并签认（同 m00111 授权链）：零改码 · 01_modules.md 零改动预判成立；实证破预判即停走新 task |

---

## 背景与目标

**JC-F1 真值**（本仓联调 `task_web_api_joint_check` 40 机验发现 · PR #66）：api 旧时代 resume 端点请求内同步跑完整个图恢复（130–310s），本仓 `src/api/http.ts:50` axios 全局 30s 超时在 decide 200 后 **30.1s** 客户端掐断 resume（`net::ERR_ABORTED`）→ `src/stores/chat.ts:1113-1116` catch 其他错误分支把卡片退回 **「待审批」**（hitl.status='waiting'）——**后端实际已跑完，前端状态假相**。

**B 方案已落地**（api 单边异步化 · 维护者 m00383 裁定）：api PR #252（squash `0e5f6b1` · 已核为 master `2a5878c` ancestor）——resume **秒回 200**（受理即返 · p95=46.6ms），恢复执行后台进行，事件照常落盘，前端经 replay 追帧。**api 30 回执**（`invoke_20261014_30_api_receipt.md`）：状态码保持 200 · 顶层键 `{ok,request,resume,replay,ts}` 不删不改 · `resume={status:"accepted",...}` 已受理形 → **web 零改动预判成立**（`HitlResumeResponse.resume: unknown` 弱消费）。

**目标**：重跑 JC-F1 原始断链场景（联调 TC3 链 · 轮次 TC3v4），实证 **web 前端在 api 异步化后不再误回「待审批」**，JC-F1 跨仓闭环；结论回执落 `hitl-resume-async-handoff/`，api `task_hitl_resume_async` 50-CLOSE 等本复验结果双方联合 CLOSE。

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| axios 全局超时 | `src/api/http.ts:50` | `timeout: 30_000`（**不动** · B 方案裁定秒回后自然无害 · A 方案不单独做） |
| resume 响应类型 | `src/api/hitl.ts:73-79` | `HitlResumeResponse{ok, request: Record<string,unknown>, resume: unknown, replay: HitlResumeReplay, ts}` · **resume 弱消费成立** |
| replay 提示类型 | `src/api/hitl.ts:64-71` | `HitlResumeReplay{run_id,cursor,events_persisted,events_failed,persisted: boolean,re_interrupted}` · `persisted` 全 src 仅此两字面（:67/:69）· **无任何消费/展示/告警分支**（grep 核真） |
| resume 调用落点 | `src/stores/chat.ts:1084-1086` | `decideResp.resume?.required !== false` → `await resumeHitlRequest(requestId)` · **响应体不消费**（仅等成功/抛错） |
| JC-F1 假相落点 | `src/stores/chat.ts:1087-1117` | catch 分态：409→resolved「该申请已被处理」· 404→resolved · 403→forbidden · 401→waiting · **其他（网络/超时）→ waiting「待审批」+ note**（复验须实证不再触发） |
| 成功路径 | `src/stores/chat.ts:1118-1119` | `hitl.status='decided'` + decision 落卡片 |
| immediate 自动续跑分流 | `src/stores/chat.ts:1081-1084` | 响应 `resume.required=false`（auto_triggered）→ 不链第二步 resume（避免撞 409 误呈）· T-W2 S3 钉案 |
| 联调菜谱（在仓） | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/` | s2_step1_live_cut / s2_step2_replay_compare / s3_imm_step1_wait / s3_imm_step2_decide_replay / s3_imm_step3_double_resume_409 / serve_8050.py / vite_proxy_smoke.sh |
| TC3 链原始菜谱（归档） | git `a30d705:docs/harness/invokes/by-task/web-api-joint-check/invoke_20261013_40_verify.md` §3 | 提问触发 write 工具 → hitl.waiting 卡片 → 批准 → decide 200 → resume → replay after_seq=0 → 18 帧 seq 连续 · 终帧 `done{resumed, latency_ms}` · 徽标实值；JC-F1 旧证据 `jc_tc3v2_network.json`（30.1s 掐断）同目录 attachments |
| 后端契约真值 | api master `2a5878c` + 本仓 `hitl-resume-async-handoff/invoke_20261014_30_api_receipt.md` | 秒回 200 `resume.status="accepted"` · replay.cursor best-effort（异常降级空串）· `events_persisted/failed` 受理时刻恒 0 · `persisted=bool(run_id)` 恒 true · `re_interrupted` 恒 false · 在飞 replay=200 部分帧（裁定 a · 挂起 run 已持收尾帧）· 在飞重复 resume=409「恢复正在执行中」· 终帧 `done{resumed, latency_ms:int≥0, 无 model}` |
| 环境三坑解法 | api `hitl-resume-async/invoke_20261014_40_verify.md` + `hitl-resume-replay-contract/invoke_20261013_40_verify.md` | `OPS_CHAT_TRACER=off` · `env -u` 剥九个 proxy 变量 · strategy echo 六 env 组 |

---

## 范围

- [x] **F1（40 · TC3v4 断链场景重跑）**：api master `2a5878c` 六 env 组起服 + web dev（vite `--host 127.0.0.1` · `VITE_API_PROXY=http://127.0.0.1:8050`）→ 浏览器（Playwright `~/.agent-tools/pw`）提问触发 write 工具 → 点「批准」→ decide 200 → resume 客户端实测 **<1s 返回 200** · Network 面板 **零 `ERR_ABORTED`**（对照旧证据 jc_tc3v2_network.json 30.1s 掐断 · network.json 附件落盘）。
- [x] **F2（40 · 卡片状态流转实证）**：decide 后 → resume 后卡片进入「已批准/恢复中/已完成」流转态 · **全程零误回「待审批」**（JC-F1 假相消除实证 · 逐态截图留证 · pageerror/console.error=0）。
- [x] **F3（40 · replay 追帧 + 徽标）**：沉降后 replay 200 全量 · 帧 seq 连续 · 终帧 `done{status:'resumed', latency_ms:int≥0, 无 model 键}` 逐键对拍（.sse 附件 + seq 连续性脚本机断）；徽标渲染 latency_ms 实值（刷新/续看恢复路径 · 与后端终帧逐位一致）。
- [x] **F4（40 · 在飞窗时序复核）**：resume 秒回后 replay 立即打——**200 部分帧（裁定 a · 既有语义）或 409+Retry-After:2（仅限无收尾帧 live run）两形态均属正确**，前端均不得异常展示/报错（错误条文案如实透传 · 照登实测命中形态）。
- [x] **F5（40 · 弱消费复查照登）**：`HitlResumeResponse.resume: unknown` 零改动确认（已静态核真 · live 响应体照登键形）；`replay.persisted` 恒 true 后 web 无依赖此键的展示/告警分支（已 grep 核真 · 照登结论）。
- [x] **F6（40 · 回归）**：驳回 resume 收工链（rejected 也可 resume 出结论）；immediate `resume_mode` 链（web 有入口的部分：decide 携 `resume_mode=immediate` → 响应 required=false → 前端不链第二步 · 后台沉降后 replay 追帧）。
- [x] **F7（回执落盘）**：10/20/40 invoke 齐（`docs/harness/invokes/by-task/web-hitl-resume-async-reverify/`）· **复验结论回执（PASS/FAIL + 证据指针）落 `docs/harness/invokes/by-task/hitl-resume-async-handoff/`** · volatile.md 短注 · task 验收回填。

## 非范围

- **任何 `src/` 业务码改动**（预期零改码；实证必须改码 → **先停** · 走 10-task 起草新 task + 闸链；触及响应面契约状态码/键名 → 同步回执 api 00）。
- **后端零改动**（api master `2a5878c` 只读消费；联调暴露新后端缺口报回 api 另立 task · 禁前端迁就）。
- **axios 全局 30s 超时任何调整**（B 方案裁定：秒回后自然无害 · A 方案不单独做 · `http.ts:50` 零触达）。
- **Retry-After 自动退避 / 倒计时 / 响应头透传签名**（fobs 裁定 C 口径存续 · 增强另立 task 口）。
- **useLgRagSse 管线 / SSE 事件表改动**（freeze lg-rag-sse-v1 只消费）。
- 其他 active task 面（`task_web_tenant_context_chat` / `task_web_lg_rag_sse_continue_reply` CLOSE 面 · **勿混入**）；admin 面；iOS。

---

## 联调环境与坑位

| 坑位 | 钉死 |
|------|------|
| 环境三坑（api 40 留痕 · **起后端必读**） | ① langfuse 引号炸 port → `OPS_CHAT_TRACER=off`；② `NO_PROXY` 裸 `::1` 炸 httpx → `env -u` 剥九个 proxy 变量；③ strategy 候选缺写能力 → `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` + `OPS_CAPABILITY_ALLOW_WRITE=1` + `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing`（否则 HITL 永不触发） |
| 六 env 组（S3） | `LG_RAG_DELEGATION_TOKEN_MODE=enforce` · `OPS_CAPABILITY_EXTRA_MANIFESTS` · `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing` · `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS` · `OPS_HITL_PERSISTENCE=db` · `OPS_CAPABILITY_ALLOW_WRITE=1` |
| **api 仓分支状态**（2026-10-15 核真） | api 仓当前在 `task/hitl-resume-async` [gone] 分支 + `uv.lock` 脏 → **起服前 `git checkout master`（`2a5878c`）** · `uv.lock` 不提交不回滚（留脏观察 · 若起服冲突照 api 侧纪律处置） |
| vite proxy | 必须 `http://127.0.0.1:<port>`（禁 localhost · vite7 默认仅绑 IPv6 ::1 须 `--host 127.0.0.1` · `vite.config.ts:90-99` 默认 target 8000 经 `VITE_API_PROXY` env 覆盖零配置改动） |
| SSE 代理缓冲（T-W2 FP-3） | `vite_proxy_smoke.sh` 逐帧时间戳判缓冲（一次性齐到=缓冲 → 假败） |
| **登录会话** | `/tmp/web_fobs.jar` 已失（2026-10-15 核真不存在）→ 40 须重取：api `scripts/create_initial_user.py` 邀请码制登录得 cookie jar · 浏览器层 `context.addCookies` 注入（fobs/joint-check 先例同法） |
| Playwright | `~/.agent-tools/pw`（1.64.0 + Chromium 156 · 不入 package.json · joint-check 先例） |
| pnpm 钉死 | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（T-W2 NIT-1 口径） |
| 沉降耐心 | echo 场景后台执行 ~100–310s（api 40 实测 18 帧 latency 180804ms）· resume 秒回≠执行完 · replay 追帧须等沉降 |

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 HG-AUDIT-R1 pending 即 40 开工 | 执行 Agent **拒开工**（GATE_VERIFY 首输出 · task 人工闸表为真值） | 是（签后重来） | 无 |
| FP-2 实证发现必须改码 / 契约冲突 | **先停** · 走 10-task 起草新 task + 闸链；触响应面状态码/键名 → 同步回执 api 00（`hitl-resume-async-handoff/`） | 是 | 无 |
| FP-3 联调环境三坑（langfuse 引号 / NO_PROXY 裸 ::1 / strategy 候选缺 `testing.write.echo`） | 照 api 40 invoke 启动命令留痕执行（`env -u` 九 proxy + `OPS_CHAT_TRACER=off` + 六 env 组） | 是 | run 0.5s 即 error 帧沉降 / HITL 永不触发 |
| FP-4 vite/反代缓冲 SSE | `vite_proxy_smoke.sh` 逐帧时间戳判缓冲 · 一次性齐到即假败重钉 | 是 | 帧不实时 |
| FP-5 登录会话失效（jar 已失） | `create_initial_user.py` 邀请码重取 cookie · 浏览器 `context.addCookies` 注入 | 是 | 401 跳登录 |
| FP-6 在飞窗 replay 两形态误判 | 200 部分帧（裁定 a）或 409+Retry-After:2（无收尾帧 live run）**均属正确** · 误把 409 判 FAIL 即假红 — 对照回执行为面第 2 点 | 是 | 409 时错误条 detail 原文「Run is still in flight; retry after it settles.」 |
| FP-7 在飞期重复 resume | 409「该申请的恢复正在执行中，待沉降后再试」**属正确行为** · 不误判 · 沉降后可重调（幂等重投递） | 是 | 卡片 409 分态「该申请已被处理」（既有语义 · 实测照登） |
| FP-8 api 仓分支/脏文件 | 起服前 checkout master `2a5878c` · `uv.lock` 脏不提交不回滚 · 冲突照 api 纪律 | 是 | 无 |
| FP-9 沉降等待不足误捕 | echo 场景后台 ~100–310s · resume 秒回后立即 replay 得部分帧属正确 · 终帧判定须等沉降（轮询间隔 ≥ Retry-After） | 是 | 无 |
| FP-10 后台执行崩溃 | 可重调 resume 幂等重投递（preflight not_interrupted 防重跑已完成者）· 不永久悬 409 · 照登实测若命中 | 是 | 无 |

---

## 验收标准

- [x] **TC1（40 · resume 不再被掐断）**：decide(approved) → resume 客户端实测 **<1s 返回 200**（network.json 计时实证）· Network 面板零 `ERR_ABORTED`（对照旧证据 jc_tc3v2_network.json 30.1s 掐断）。
- [x] **TC2（40 · 卡片零误回待审批）**：decide → resume 后卡片进入「已批准/恢复中/已完成」流转 · **全程零误回「待审批」**（逐态截图 · pageerror/console.error=0）。
- [x] **TC3（40 · replay 追帧 + 徽标）**：沉降后 replay 200 · 帧 seq 严格连续（脚本机断）· 终帧 `done{status:'resumed', latency_ms:int≥0, 无 model 键}` 逐键对拍（.sse 附件）· 徽标渲染 latency_ms 实值与后端终帧逐位一致（截图）。
- [x] **TC4（40 · 在飞窗两形态）**：resume 秒回后 replay 立即打 → 实测命中形态照登（200 部分帧 或 409+Retry-After:2+detail 原文）· 前端无异常展示/报错。
- [x] **TC5（40 · 弱消费复查）**：live 响应面键形 `{ok,request,resume,replay,ts}` 照登 · `resume.status="accepted"` · `replay.persisted=true` 且确认 web 无依赖此键分支（grep 核真结论照登 · `resume: unknown` 零改动）。
- [x] **TC6（40 · 回归）**：驳回 resume 收工链通过；immediate `resume_mode` 链（web 入口面）通过（decide 秒回 · required=false 不链第二步 · 沉降后 replay 终帧 resumed）。
- [x] **TC7（质量门 + 回执落盘）**：`pnpm lint`/`test`（基线 255 零漂移）/`build` 三门绿（钉死 pnpm 路径）；10/20/40 invoke 齐；**复验结论回执落 `hitl-resume-async-handoff/`（PASS/FAIL + 证据指针）**；volatile.md 短注；`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_resume_async_reverify.md` PASS。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 后端真值 | api master `2a5878c`（#252 squash `0e5f6b1` 已核 ancestor · 只读消费）· api `docs/harness/invokes/by-task/hitl-resume-async/invoke_20261014_40_verify.md`（起服菜谱 + 三坑） |
| api 30 回执 | 本仓 `docs/harness/invokes/by-task/hitl-resume-async-handoff/invoke_20261014_30_api_receipt.md`（最终响应面 + 行为面四时机） |
| 启动令 | 本仓 `docs/harness/invokes/by-task/hitl-resume-async-handoff/invoke_20261015_00_dispatch_web_reverify.md`（验收六项原文） |
| TC3 链菜谱 | git `a30d705` 归档 `web-api-joint-check/invoke_20261013_40_verify.md` §3 + attachments（jc_tc3v2/v3 旧证据对照组 · `git show` 可读） |
| 在仓脚本 | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（s2/s3 全组 · serve_8050.py · vite_proxy_smoke.sh） |
| T-W2 真值 | `docs/tasks/done/task_web_sse_hitl_enhance.md` + `docs/tasks/active/task_web_hitl_fobs_receipt.md`（409 落点 · immediate 分流 · 六 env 组） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（联调坑位表 · failure_paths 十行）
2. api 00 启动令 `invoke_20261015_00_dispatch_web_reverify.md`（验收六项原文）+ api 30 回执 `invoke_20261014_30_api_receipt.md`（响应面 + 行为面 · **禁信转述**）
3. `src/api/hitl.ts:63-114`（HitlResumeResponse/HitlResumeReplay 类型 · resumeHitlRequest 封装）
4. `src/stores/chat.ts:1060-1125`（decideHitl 分态 · JC-F1 假相落点 :1113-1116 · immediate 分流 :1081-1084）
5. `src/api/http.ts:50`（axios 30s 全局超时 · 只读确认零改动）
6. api `invoke_20261014_40_verify.md` 环境三坑节（起后端必读）+ 六 env 组
7. 归档 TC3 菜谱：`git show a30d705:docs/harness/invokes/by-task/web-api-joint-check/invoke_20261013_40_verify.md` §3
8. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（GATE_VERIFY 口径 · 本 task 40 开工同适用）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：JC-F1 跨仓复验 = 纯观测重跑 TC3 链（api 异步化已并 master · 响应面零改动回执在案）→ 实证「不再误回待审批」+ 六项验收 + 回执联合 CLOSE；无新开发、无 30 棒 | false | — | none |
| R1 | 证据收集：web 锚点全亲读（hitl.ts:73-79 弱消费 · :64-71 persisted 无消费分支 · chat.ts:1084-1086 响应不消费 · :1087-1117 分态与假相落点 · http.ts:50 超时面）；api 侧核真（master `2a5878c` 含 `0e5f6b1` · 回执响应面键形 · 行为面四时机 · p95=46.6ms） | false | — | 登录 jar 已失（FP-5 已钉解法）· api 仓分支脏（FP-8 已钉解法） |
| R2 | 裁定生成：纯观测无 30 棒（回执零改动预判 + 静态核真双重成立）；验收照启动令六项原文映射 TC1–TC6 不增删；在飞窗两形态均属正确预钉（FP-6 防假红） | false | — | 在飞窗实测命中哪形态不可预知（两可 · 均已钉判据） |
| R3 | 反例与边界：旧时代 30.1s 掐断链已根除（p95 毫秒级 vs 30s 超时 · 三个数量级余量）；catch「其他错误→waiting」分支仍在但触发前提（超时/断网）消失；immediate 分流既有钉案（required=false 不链第二步）回归入 TC6；卡片 409 分态「已被处理」与在飞重复 resume 409 文案差照登不误判（FP-7） | false | — | echo 场景沉降时长 100–310s · 复验耗时预算（FP-9 已钉） |
| R4 | 验收可测性：TC1 network.json 计时机断 · TC2 截图+console 计数 · TC3 .sse 附件 seq 连续性脚本+终帧逐键对拍 · TC4 实测形态照登 · TC5 grep 结论+live 键形 · TC6 双链实证 · TC7 三门+invoke 齐备机断 | false | — | 浏览器实录依赖 Playwright 环境（在案核真） |
| R5 | 收口：范围 F1–F7 · 非范围六条 · failure_paths 十行 · 验收七条 · 依赖六条 · 必读八项齐备；HG-TASK-DRAFT approved（api 00 启动令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签 | true | 纯观测复验机理单一 · 锚点全亲读核真 · 契约真值 api 回执钉死 · 再轮无新增信息 | 裁定生效待闸 · 在飞窗命中形态实判 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

api B 方案已并 master（#252 · resume 秒回 200 · 后台执行），响应面零删改（回执在案），web 零改动预判经静态核真成立。本 task 唯一使命 = live 实证 JC-F1 假相消除 + 启动令六项验收 + 回执联合 CLOSE。纯观测 · 无 30 棒。

### R1 · 证据收集

web 亲读：`hitl.ts:76` `resume: unknown` 弱消费；`hitl.ts:69` `persisted: boolean` 全 src 无消费分支（grep `persisted` 仅 :67/:69 两字面）；`chat.ts:1085` `await resumeHitlRequest(requestId)` 响应体不消费；`chat.ts:1113-1116` 其他错误→waiting 即 JC-F1 假相落点（触发前提=axios 30s 掐断，已随异步化根除）；`http.ts:50` 超时面零触达。api 核真：`git merge-base --is-ancestor 0e5f6b1 master` 成立 · master=`2a5878c`；回执响应面 `resume.status="accepted"` · `replay.persisted=bool(run_id)` 恒 true · 在飞 replay=200 部分帧（裁定 a）。

### R2 · 裁定生成

无 30 棒：回执零改动预判 + 静态核真双重成立，改码即破约定须停走新 task（FP-2）。验收映射启动令六项原文（1→TC1 · 2→TC2 · 3→TC3 · 4→TC4 · 5→TC5 · 6→TC6）+ 质量门/回执 TC7，不增删。在飞窗两形态预钉均属正确（FP-6）防假红。

### R3 · 反例与边界

旧链「decide 200 → 30.1s ERR_ABORTED → catch 其他错误 → waiting 假相」的触发前提（服务端 130–310s > axios 30s）已根除（p95=46.6ms · 余量三个数量级）。catch 分支代码仍在属正确防御（真断网仍回 waiting 可重试 · 非本 task 面）。immediate 分流既有钉案（T-W2 S3 · required=false 不链第二步防 409 误呈）入 TC6 回归。在飞重复 resume 409「恢复正在执行中」与 decide 重复 409「已被处理」文案不同 · 照登不误判。

### R4 · 验收可测性

TC1：Playwright network.json 请求计时（resume duration <1s）+ 零 ERR_ABORTED 计数机断。TC2：逐态截图 + pageerror/console.error 计数。TC3：.sse 附件 + seq 连续性脚本（菜谱 PYEOF 口径）+ 终帧三键逐字对拍。TC4：实测形态照登（两可均 PASS）。TC5：grep 结论 + live 键形照登。TC6：双链实证。TC7：三门 EXIT 码 + invoke 帽集合 + 回执文件存在机断。

### R5 · 收口

范围/非范围/failure_paths/验收/依赖/必读齐备；无 30 棒裁定待 20 R1 核对 + 维护者签认生效；early_stop at R5。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_resume_async_reverify.md` | **PASS**（2026-10-15 落稿实跑 · EXIT=0 · 零 warning） |
| 结论 | HG-AUDIT-R1 / HG-GRAPH-MODULES **approved**（2026-10-15 维护者 m00111 签认 · 00 代笔落表）→ **40 解锁** |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-15 | v0 · 10 落稿：api 00 启动令（JC-F1 B 方案复验 · api #252 已并 master `2a5878c`）· 零改码预判双重核真（回执 + 静态 grep：resume 弱消费 · persisted 无消费分支 · chat.ts:1085 响应不消费）· 验收照启动令六项映射 TC1–TC6 + TC7 · R0–R5 思考轮（early_stop at R5）· HG-TASK-DRAFT approved · HG-AUDIT-R1/HG-GRAPH-MODULES pending 待人签 |
| 2026-10-15 | v1 · 维护者签闸（会话 m00111：20 R1 PASS 后签认 HG-AUDIT-R1 + HG-GRAPH-MODULES n/a 确认 · 授权 00 代笔落表并签收后续过程文档）→ 40 live 复验解锁 |
| 2026-10-15 | v2 · 40 live 复验 **TC1–TC7 全 PASS · JC-F1 跨仓闭环 · web 零改码实证**（resume 34.77ms vs 旧 30.1s 掐断 · 45s 窗零误回待审批 · 18 帧 seq 连续 · 终帧 done{resumed,152757} · 徽标逐位一致 · 驳回/immediate 双链绿 · lint/test263/build 三门绿）→ 40 invoke + handoff 回执 + volatile 短注落盘 · 验收 F1–F7/TC1–TC7 全勾 |
