# Task：Web · HITL 审批决策面（pending 消费 · decide/resume · resume 后追帧 · 409 重试纪律）（web-hitl-decision-surface）

> **状态**：`draft`（2026-10-17 本窗 10-task 落稿 · 人工闸全 pending · **严禁代签** · 待人签解锁 30）  
> **类型**：SPEC 承接实现（30 改码 + 40 live 联调 · 红测先行）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS；**禁止**本 task 改 `ops-desk-api` 任何文件  
> **SPEC（signed · 唯一需求真值）**：`docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（HG-SPEC-SIGNOFF=**approved** · 2026-10-17 维护者人签 · **含 D-A 定夺：认可 S1 事件驱动零定时器** · 20-spec-audit R1 **pass**：`docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md`）  
> **上游契约（只读 · freeze + live 实证 2026-10-17 PR #264）**：ops-desk-api `docs/guides/RUNBOOK_hitl_ops_v1_zh.md` + `docs/tasks/close/close_hitl_resume_replay_contract_20261017.md` + `docs/tasks/close/close_hitl_ops_runbook_20261017.md` + signed `SPEC-chat-history-hitl-ux_v0.md`  
> **分支**：`task/web-hitl-decision-surface`（建议 · **本帽零 git 操作未建** · 00 立 task 时建）  
> **10 注**：2026-10-17 · 父 session 00 帽委派（SPEC 已签 → 起草本 task）· 本窗 10 落稿 · nit N1/N2/N3 已在本 task 体内消化闭合

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-decision-surface` |
| **git_branch** | `task/web-hitl-decision-surface` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿（本棒）→ 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · D1–D4 落地）→ 40 live 联调（ops-desk-api compose 环境 · 契约已 freeze+live 实证 · **无 blocked_by 可直接对 live**）→ PR+CI 绿 → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：B2 client mock（字段族与 SPEC §2 逐键对齐 · 不自造字段）+ chat store 单测（decide→resume→追帧调用顺序 · 追帧循环 fake timers · 409 分流 · 终帧分支）+ 组件渲染断言（卡片分态 / pending 降级文案 / 徽标 latency/model）。回归基线 **263**（2026-10-16 reverify CLOSE 实录 · 30 起草时实测复核填报，既有 chat-store/hitl 测试零回归）。verify 真值 `pnpm lint` → `pnpm test` → `pnpm build`，pnpm 一律钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径）。40 live 照 api 起服三坑 + 六 env 组菜谱 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（承 SPEC 建议：`docs/_tech_graph/l1/01_modules.md` api/pinia/components 行增量备注 · 必要时 `10_flow_chat` 补注追帧链；**30 实判若无新模块可降 `none` 留痕** · HG-GRAPH-MODULES 随交付签录） |
| **graph_delta** | `pending`（预判 G-L1 增量备注 · 30 实判后回填 `none` 或具体增量） |
| **graph_delta_note** | 不新增一级模块预判；30 实判为准并留痕 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（追帧上限定稿 · 40 live 结论 → 本 task/invoke）；对齐仓内定制「新 task 勿默认 n/a」，文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**承接 · 只消费**：SSE 零新事件类型 · `hitl.waiting`/`done{status}`/`hitl.resumed` 均在 freeze 内 · `LgRagSseFrameParser` 解析行为零改动，错误回调面可选增键除外 · 裁定 D-C） |
| **related_pr** | 待开（勿 auto-merge） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30, 40 | 2026-10-17 维护者签（00 代录 · 维护者会话授权 · SPEC HG-SPEC-SIGNOFF=approved 已在案） |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-17 维护者签（00 代录）；20-task-audit R1 退回→回填→R2 复审**签收**（docs/harness/reviews/task_web_hitl_decision_surface_audit_R2_20261017.md） |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-17 维护者签（00 代录）；graph_change_layer 预判 `G-L1`（承 SPEC 建议 · 30 实判若无新模块可降 `none` 留痕）· 随交付签录 |

---

## 背景与目标

SPEC §1 已钉：上游 HITL 后端三连变更（PR #250/#248/#252 · 全 MERGED · 2026-10-17 PR #264 compose 全链 TC-1..9 全 PASS）使契约面发生三处实质演进——**resume 异步化秒回 200 携 `replay.cursor`** · **在飞 replay 语义化 409+Retry-After:2**（恢复段执行期间 replay 返 200 携部分帧而非 409 · RUNBOOK §1.5 nuance）· **resume 在飞并发守卫 409「该申请的恢复正在执行中，待沉降后再试」**。本仓既有 F2 交付在旧契约下正确，但 `replay.cursor` 被丢弃（`src/stores/chat.ts:1085` 返回值不接）、追帧无循环无退避、decide/resume 409 混淆（`chat.ts:1089-1095` 任何 409 一律「已被处理」**现状假相**）、pending 无进入即拉。

**目标**：把已 freeze 的 HITL 决策面契约在浏览器侧消费完整——resume 200 的 `replay.cursor` → 自动追帧接入现有 chat 流（复用 `replayLgRag`/`processFrame` 同一管线 · 终帧 `done{resumed}` 收尾）+ 409 两类语义分流 + pending 列表刷新纪律补齐（**S1 事件驱动零定时器 · D-A 已定夺**）——**SSE 传输/解析零改动、零新事件类型、api 仓零触碰**。

### nit 消化（20-spec-audit R1 三条 · 本 task 内闭合）

| nit | 消化落点 |
|-----|---------|
| **N1 行号漂移** | `extractFrameCursor` 真址 **`src/stores/chat.ts:569-597`**（`FrameCursor` 接口 :569-572 · 定义 :578 · cursor 合成 :581-591 · 本帽 2026-10-17 真读复核属实）；SPEC D3-1 引 `:476-495` 为漂移旧值，**本 task 锚点一律用真址**，30 勿按失真行号动刀；行号再漂移时以 grep 函数名定位为准 |
| **N2 AC 同号歧义** | 凡涉「pending 两消费点（①decide 动作后 :1121 · ②openHistoryThread 进入 waiting thread :1197）」一律写 **承 done task `task_web_chat_history_hitl_ux` AC16①/②**（task 级验收项 · 真址 `docs/tasks/done/task_web_chat_history_hitl_ux.md:147`）；本 task/SPEC 自有 AC16 = G-L1 图谱条目，同号不同义已消歧（见范围 F1 注）。**R1-B2 归因更正**：signed SPEC-web-chat-history-hitl-ux §7 仅 AC1–AC15 无 AC16 |
| **N3 grep/diff 断言形态** | 见「grep/diff 断言形态钉死」专节（搜索面/排除面/基线计数逐条钉死，防 30 口径漂移） |

---

## 现状锚点（只读 · 20 审查抽验 14/15 全中 + N1 真址本帽复核）

| 主题 | 路径 | 现状 |
|------|------|------|
| resume 返回值丢弃 | `src/stores/chat.ts:1084-1086` | `decideResp.resume?.required !== false` → `await resumeHitlRequest(requestId)` · **响应体不消费**（`replay.cursor` 丢弃 · D2-1 落点） |
| 409 混淆假相 | `src/stores/chat.ts:1089-1095` | catch 任何 409 一律 `resolved` +「该申请已被处理」（撞 resume 在飞 409 呈假相 · D3-4 落点 · FP-H4 必修） |
| 卡片 decided 文案 | `src/stores/chat.ts:1118-1120` | 「已批准 · 点击续看推进」手动盲拉（cursor 空串时回退此路径存续 · FP-H1） |
| 动作后刷新 pending | `src/stores/chat.ts:1121` | `refreshHitlPending`（承 done task `task_web_chat_history_hitl_ux` AC16① 存续） |
| pending 降级分态 | `src/stores/chat.ts:1040-1053` | 403「无审批权限」· 非 401「审批服务暂不可用」· 401 走 `http.ts` 拦截器（D1-4 存续钉死） |
| 进入 waiting thread 核对 | `src/stores/chat.ts:1197`（docstring :1190-1196） | openHistoryThread 消费点（承 done task `task_web_chat_history_hitl_ux` AC16② · 「不轮询」注释在案） |
| resumeFromCursor 单发 | `src/stores/chat.ts:958-1033` | 单发 replay · onDone 未见终帧仅提示「暂无新进度」（:1020-1029）· 409 落通用 else 错误分支（:1004-1011 · 不读 Retry-After）· FP-H6 :993-1003 · FP-H7 :987-992 语义沿用 |
| **extractFrameCursor（N1 真址）** | **`src/stores/chat.ts:569-597`** | 接口 :569-572 · 定义 :578 · 顶层 cursor `"<run_id>:<seq>"` 兜底合成 :581-591 —— 追帧循环末帧 cursor 提取先例 |
| done 分支 / ChatDoneInfo | `src/stores/chat.ts:183-188` · :732-754 | `{latency_ms:number|null, model:string}` · 缺键存 null/''（:744-751 · 裁定 A/B 存续）· waiting_approval 早退 :741-743 |
| Retry-After 未外抛 | `src/composables/useLgRagSse.ts:34-40` · :231-242 | `LgRagSseTransportError` 无 retryAfter 字段 · 非 2xx 仅解析 JSON body detail（D3-2 错误面可选增键 `retryAfterSeconds` · 裁定 D-C） |
| 帧管线可复用 | `src/composables/useLgRagSse.ts:81-101` · :156-161 | 帧解析按 `event_type` 透传 · `replayLgRag` 在仓 · store `processFrame` 同一管线（live/replay/历史三入口 · 追帧第四入口零新机制） |
| 徽标 / pending 渲染面 | `src/views/ChatView.vue:286-294` | :286-287 仅渲染 `hitlPendingError` 降级文案（D1-3 最小 UI 落点）· :290-294 缺键显「—」+ model `v-if`（D4 存续） |
| 类型面 | `src/api/hitl.ts:64-79` | `HitlResumeReplay{cursor}`/`HitlResumeResponse` 在仓 · `resume: unknown` 弱消费存续 |
| 既有测试面 | `tests/chat-store-hitl.spec.ts` · `tests/chat-store.spec.ts` · `tests/chat-view.spec.ts` · `tests/hitl-api.spec.ts` · `tests/lg-rag-sse.spec.ts` | 承 done task `task_web_chat_history_hitl_ux` AC16② 降级断言在案（chat-store-hitl.spec.ts:615-629）· resumeFromCursor/续看用例在案 —— 新增用例就近落同族文件 |

---

## 范围

- [ ] **F1（30 · D1 pending 消费与刷新纪律 · AC1–AC3）**：进入 Chat 页一次性 `fetchHitlPending` 核对（`ChatView.vue` mounted / store 初始化 · **承 done task `task_web_chat_history_hitl_ux` AC16①/② 两消费点补第三点**（真址 done task :147 · task 级验收项 · R1-B2 归因更正）· N2 消歧）；动作后刷新存续（:1121）；手动刷新最小 UI（条数徽标或单行提示 + 刷新钮 · **非全局面板**）；403/404/501/网络错降级纪律存续不炸屏；**零固定间隔轮询定时器**（D-A 定夺 S1 · 可选增量 `visibilitychange` 回前台一次性核对）。
- [ ] **F2（30 · D2 动作链接管 resume 追帧 · AC4–AC6）**：`decideHitl`（:1084-1086 改造）resume 200 → 解析 `replay.cursor`（`"<run_id>:<seq>"`）→ 自动起追帧（F3）；cursor 空串/缺失 → 回退既有手动路径（FP-H1）；immediate `resume.required=false` 例外存续（不调 resume · 以 active-run 游标直接起追帧）；追帧渲染复用 `processFrame` 同一管线进当前 assistant 消息（空流新建承接条 · 承 resumeFromCursor R1-N5 先例）；`hitl.resumed` 帧按未知事件容忍（default 忽略不崩）；终帧 `done{resumed, latency_ms}` → `streaming=false` · 清 active-run · 徽标实值 · **无 model 键模型段不渲染**。
- [ ] **F3（30 · D3 追帧循环与 409 退避 · AC7–AC11）**：store 新增私有追帧器（建议 `chaseResumedRun`）：replay 流干净结束未见终帧 → 携末帧 cursor（`extractFrameCursor` 既有 · **真址 `chat.ts:569-597`** · N1）约 2s 间隔再追；**有界上限定稿：连续追帧 ≤10 次 且 墙钟 ≤120s（先到为准）**——SPEC 照登参数本 task 定稿钉死，超限降级提示「恢复仍在进行，可稍后手动续看」+ 保留 active-run；replay 409 + `Retry-After` → 按头秒数退避自动重试（缺头默认 2s · `LgRagSseTransportError` 增可选 `retryAfterSeconds` · 裁定 D-C）· 不弹错误条不计失败 · 连续 409 并入同一上限；`stopStreaming`/`startNewSession`/切 thread → abort + 清退避定时器不泄漏；**resume 在飞 409 分流**（:1089-1095 改造）：decide 409 →「已被处理」（存续）· resume 409「恢复正在执行中」→ 卡片「恢复进行中」等沉降起追帧 · **不并发重提 · 修现状假相**（FP-H4 核心）。
- [ ] **F4（30 · D4 FP-1 存续钉死 · AC12）**：`ChatView.vue:290-294` `v-if="chat.lastDone.model"` 存续；新增 Vitest 断言钉死 `done{resumed}`（无 model 键）→ 模型段 DOM 不存在 · `lastDone.model===''`；缺 `latency_ms` → `null` → 徽标「—」（pre-fix 历史帧 replay 面）；**永不伪造 model**。
- [ ] **F5（30 · 契约 / 质量门 / 图谱 · AC13–AC16）**：SSE 契约零动（grep/diff 断言形态钉死见专节）；mock 字段族与 SPEC §2 逐键对齐（不自造 · 契约外宽松键只读容忍不依赖）；`pnpm lint` → `pnpm test` → `pnpm build` 三门绿（基线 263 零回归 · 新增用例随增）；G-L1 `docs/_tech_graph/l1/01_modules.md` 增量备注按实落盘（或 30 判 `none` 留痕）· `./scripts/graph-compile.sh` exit 0 · HG-GRAPH-MODULES 随交付签录。
- [ ] **F6（40 · live 联调棒位 · TC-L1–L5）**：对 ops-desk-api compose 环境（契约已 freeze + 2026-10-17 live 实证 · **无 blocked_by**）实证 D1–D4 live 面：全链批准→resume 200 携 `replay.cursor`→自动追帧→终帧徽标实值；在飞窗两形态（200 部分帧续追 / 409+Retry-After:2 退避）照登；resume 在飞 409「恢复进行中」非「已被处理」live 实证；驳回 resume 收工链 + immediate 链回归（承 reverify 先例）。
- [ ] **F7（落盘）**：10（本件）/20/30/40 invoke 齐（`docs/harness/invokes/by-task/web-hitl-decision-surface/`）· wiki_delta 短注落 `docs/coding_wiki/volatile.md` · 验收回填。

## 非范围

- ❌ 改 `ops-desk-api` 仓任何文件（契约 freeze · 只读承接）
- ❌ 新 SSE 事件类型 / 改 `hitl.waiting`/`done`/`hitl.resumed` 帧语义 / 改 `LgRagSseFrameParser` 解析行为（错误回调面可选增键 `retryAfterSeconds` 除外 · 裁定 D-C）
- ❌ 后端端点语义改动（分页/归属/状态码/`Retry-After` 值/409 文案均承上游）
- ❌ 实现审批权限模型后端 / 改 OA HMAC 签名面（`GET /hitl/requests` · `GET /hitl/runtime` · `POST /hitl/callback`）任何触碰
- ❌ 审批实时推送（WS/SSE 推送通道）；**固定间隔轮询定时器**（D-A 定夺 S1 已签 · 承 signed SPEC 非范围）
- ❌ 全局审批面板 / 新路由独立审批页（承裁定 F-A 内联卡片形态；pending 面板后续增强另立）
- ❌ decide 合并 resume 为单端点调用（两步钉死存续）
- ❌ `OPS_HITL_AUTO_RESUME=auto` 运维化 / HMAC 对接面（上游 CLOSE 后续建议在册 · 各另立）
- ❌ B1 历史面改动（threads/history 契约与渲染存续）
- ❌ 伪造 model 值 / 伪造任何契约外终帧字段（FP-1 禁伪造钉死）
- ❌ 追帧上限超出 ≤10 次/≤120s 的参数扩张（本 task 定稿值；须扩张回 10-task 修订链）
- ❌ 零 git 操作以外任何提交动作属后续帽面；本帽（10）零 git 存续

---

## grep/diff 断言形态钉死（N3 消化 · 30 照此落地防口径漂移）

| 断言 | 搜索面 | 排除面 | 通过判据 |
|------|--------|--------|---------|
| AC3 无 setInterval 轮询 pending | `grep -rn "setInterval" src/` | 注释行 · `tests/**` · 文档 | 与 pending/追帧相关的 `setInterval` **零命中**（追帧退避一律 `setTimeout` 单次链 · 基线计数 0）；`visibilitychange` 若落 → 断言一次性语义（handler 内无 `setInterval`/递归定时） |
| AC13 SSE 零动 | `grep -rn "event_type" src/composables/ src/stores/` 新构造字面扫描 + `git diff main...HEAD -- src/composables/useLgRagSse.ts` | 注释行 · `tests/**` | 无新 `event_type` 构造字面（消费侧 `switch`/透传存续）；`LgRagSseFrameParser` 解析段 diff 为空 · `useLgRagSse.ts` diff hunk 仅限错误面可选增键 `retryAfterSeconds`（既有回调签名兼容 · 既有消费方零 diff） |
| AC12 无伪造 model | `grep -rn "model" src/stores/chat.ts src/views/ChatView.vue` 赋值字面扫描 | 注释行 · `tests/**` · `v-if` 读取面 | 无任何对 `lastDone.model` 的伪造赋值字面（缺键存 `''` 存续 · 增量赋值零新增） |

---

## 联调环境与坑位（40 live · 承 reverify/fobs 先例）

| 坑位 | 钉死 |
|------|------|
| 环境三坑（api 40 留痕 · **起后端必读**） | ① langfuse 引号炸 port → `OPS_CHAT_TRACER=off`；② `NO_PROXY` 裸 `::1` 炸 httpx → `env -u` 剥九个 proxy 变量；③ strategy 候选缺写能力 → `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` + `OPS_CAPABILITY_ALLOW_WRITE=1` + `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing`（否则 HITL 永不触发） |
| 六 env 组（S3） | `LG_RAG_DELEGATION_TOKEN_MODE=enforce` · `OPS_CAPABILITY_EXTRA_MANIFESTS` · `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing` · `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS` · `OPS_HITL_PERSISTENCE=db` · `OPS_CAPABILITY_ALLOW_WRITE=1` |
| api 仓分支 | 起服前核 api 在 `master`（2026-10-17 PR #264 后 · 起服菜谱照 api `hitl-ops-runbook`/`hitl-resume-replay-contract` 40 invoke）· api 仓**只读** |
| vite proxy | 必须 `http://127.0.0.1:<port>`（禁 localhost · vite7 默认仅绑 IPv6 ::1 须 `--host 127.0.0.1` · `pnpm dev -- --host` 双横线吞参坑已留痕） |
| SSE 代理缓冲（T-W2 FP-3） | `vite_proxy_smoke.sh` 逐帧时间戳判缓冲（一次性齐到=缓冲 → 假败） |
| 登录会话 | api `scripts/create_initial_user.py` 邀请码制登录得 cookie jar · 浏览器层 `context.addCookies` 注入（fobs/joint-check 先例同法） |
| Playwright | `~/.agent-tools/pw`（1.64.0 + Chromium 156 · 不入 package.json · 先例同法） |
| pnpm 钉死 | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（T-W2 NIT-1 口径） |
| 沉降耐心 | echo 场景后台执行 ~100–310s · resume 秒回≠执行完 · 追帧须等沉降（追帧上限 120s 墙钟 < 最长沉降窗 · live 若超限降级提示属**预期正确行为**照登不误判 · FP-T5） |
| 联调菜谱（在仓） | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（s2/s3 全组 · serve_8050.py · vite_proxy_smoke.sh） |

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-H1 resume 200 但 `replay.cursor` 空串/缺失（best-effort 契约） | 回退既有手动路径：卡片「已批准/已驳回 · 点击续看推进」+ active-run 保留 | 是 | 卡片提示（存续文案） |
| FP-H2 追帧中 replay 409 + `Retry-After: 2`（run 在飞） | 按头秒数退避自动重试（缺头默认 2s）· 不弹错误条；并入追帧上限（≤10 次/≤120s），超限 → 降级「恢复仍在进行，可稍后手动续看」+ active-run 保留 | 是（自动退避） | 无打扰 / 超限后降级提示 |
| FP-H3 replay 200 干净结束但末帧非终帧（恢复段在写 · RUNBOOK §1.5 nuance） | 携末帧 cursor 约 2s 间隔再追（seq 去重基线存续）· 同上限兜底 | 是（自动） | 无打扰（帧增量就地渲染） |
| FP-H4 **resume 409 在飞**「该申请的恢复正在执行中，待沉降后再试」（并发守卫） | 卡片转「恢复进行中」· **不并发重提** · 等沉降起追帧；**禁**呈「已被处理」（修现状 `chat.ts:1089-1095` 混淆假相） | 否（等沉降） | 卡片「恢复进行中」 |
| FP-H5 decide 409 重复/已决 | 卡片「该申请已被处理」· 不弹错误条 · 刷新 pending（存续） | 否 | 卡片状态文案 |
| FP-H6 追帧/replay 404 · 422 | 清 active-run + 中性提示「对话记录不存在或已过期」/「续看请求校验未通过」（既有 :993-1003 语义沿用）· 不区分越权与不存在 | 否 | 中性提示 |
| FP-H7 401（pending/decide/resume/replay 任一面） | REST 走 `http.ts` 拦截器跳登录；replay 401 清 thread_id+active-run+auth（既有 :987-992 语义沿用） | 是 | 登录页 |
| FP-H8 403 非 maintainer | pending/审批动作降级「无审批权限」· 不炸屏（存续） | 否 | 降级文案 |
| FP-H9 `done{resumed}` 无 model 键（FP-1 钉案契约行为） | 模型段不渲染 · `latency_ms` 实值徽标；缺 latency →「—」；**永不伪造** | n/a | 徽标「耗时 Xms」/「—」（非 bug 不报缺） |
| FP-H10 追帧中用户手动停止 / 发起新会话 / 切换 thread | abort controller + 清退避定时器 · streaming 复位（与 live abort 同语义） | 是（手动续看） | 中断提示（既有形态） |
| FP-H11 恢复执行失败（api 侧只落日志 · 终帧永不到达） | 追帧上限兜底：降级提示 + active-run 保留可手动续看；分钟级异常属 api 排查面（RUNBOOK §2.2 · 前端不背） | 是 | 降级提示 |
| FP-H12 resume 503（checkpoint 未配置）/ `stranded_checkpoint` 409 | 中性错误条「恢复服务暂不可用/请重开会话」· **不当可重试面自动重试** | 否 | 错误条 |
| FP-H13 30 未签 `HG-AUDIT-R1` 即改码 | **拒开工**（GATE_VERIFY 首输出 · task 人工闸表为真值） | 是（签后重来） | 须先 20 + 人签 |
| FP-T1 **40 联调环境不可达**（Docker compose / api master 起服失败 / 依赖服务缺席） | **不假绿 · 不落「live PASS」字面**：40 棒阻塞登记 invoke 照登具体不可达原因 → 回报 00；30 的 Vitest 契约 mock 面（TC1–TC16）不受阻可先行验收；CLOSE 前补跑 40 或由维护者裁定降级验收口径（引用上游 PR #264 TC-1..9 实证 + mock 面 · 须显式签录） | 是（环境恢复后补跑） | 无 |
| FP-T2 grep/diff 断言口径漂移（N3） | 按「grep/diff 断言形态钉死」专节执行（搜索面/排除面/基线计数）；30 口径与专节不符 → 20/40 判 FAIL 退回 | 是 | 无 |
| FP-T3 file:line 行号漂移（N1 教训） | 锚点以函数名 grep 定位复核为准（`extractFrameCursor` 真址 `chat.ts:569-597` 已钉）；30 动刀前对将改的每个锚点重新真读核真，漂移照登 invoke | 是 | 无 |
| FP-T4 动 done 分支/追帧链致既有帧处理回归 | **回退闸**：Vitest 全量绿（基线 263 · chat-store 66 it（R1-nit-a 更正 · `it(` 计数两轮复核）+ chat-store-hitl 在案）· 红即回退 | 是 | 无 |
| FP-T5 live 沉降窗（100–310s）> 追帧墙钟 120s | 超限降级提示「恢复仍在进行，可稍后手动续看」属**预期正确行为** · 40 照登不误判 FAIL · 手动续看兜底实证 | 是 | 降级提示 |

---

## 验收标准

**30 · Vitest 机断（AC1–AC16 全覆盖映射）：**

- [ ] **TC1（30 · AC1 · D1-1/D1-4）**：挂载 Chat 页 → `GET /api/ops/hitl/pending` 调用恰 1 次；mock `{items, count}` → pending 快照更新；403 →「无审批权限」；404/501/网络错 →「审批服务暂不可用」；均**不**阻塞发送/流式主路径。
- [ ] **TC2（30 · AC2 · D1-2/D1-3）**：decide/resume 动作链完成后 pending 再刷新 1 次（存续断言）；手动刷新入口点击 → 再拉 1 次。
- [ ] **TC3（30 · AC3 · D1-5 · grep 钉形态）**：按钉死形态断言 `src/` 无 pending/追帧相关 `setInterval`（基线 0）；`visibilitychange` 核对若落则单独断言一次性语义。
- [ ] **TC4（30 · AC4 · D2-1）**：mock decide 200（`resume.required=true`）→ resume 200 携 `replay:{run_id, cursor:"<run_id>:<seq>"}` → 断言调用顺序 decide→resume→`replayLgRag`；replay 起点游标 = cursor 解析值。
- [ ] **TC5（30 · AC5 · D2-2）**：mock `resume.required=false`（immediate）→ **不**调 resume · 以 active-run 游标直接起追帧（存续例外回归断言）。
- [ ] **TC6（30 · AC6 · D2-3/D2-4）**：追帧帧流（`hitl.resumed` → 进度帧 → `answer` → `done{status:'resumed', latency_ms:435584}`）→ 断言经 `processFrame` 渲染进消息流（内容/subtasks 增量可见）· `hitl.resumed` 帧不崩不误渲 · 终帧后 `streaming=false` · active-run 清除 · 徽标显 `435584ms` · **模型段 DOM 不存在**（FP-1）。
- [ ] **TC7（30 · AC7 · D3-1）**：replay 干净结束未见终帧（fake timers）→ ≥1 次携末帧 cursor 再追 · 间隔 ≥2s；达上限（≤10 次/≤120s）→ 降级提示「恢复仍在进行」· active-run 保留 · `canResume` 为真。
- [ ] **TC8（30 · AC8 · D3-2）**：replay 409 + `Retry-After: 2`（fake timers）→ 按 ≥2s 退避自动重试 · 全程**无**错误条；缺 `Retry-After` 头 → 默认 2s；连续 409 计入同一上限。
- [ ] **TC9（30 · AC9 · D3-4）**：resume 409（detail「该申请的恢复正在执行中」）→ 卡片「恢复进行中」· **不**出现「已被处理」文案（现状假相回归钉死）· 无并发第二次 resume；decide 409 →「已被处理」（存续 · 两分支分流断言）。
- [ ] **TC10（30 · AC10 · FP-H12）**：resume 503 / stranded 409 → 中性错误条 · 无自动重试。
- [ ] **TC11（30 · AC11 · D3-3）**：追帧中 `stopStreaming`/`startNewSession` → 退避定时器清除（fake timers 断言无残留触发）· streaming 复位。
- [ ] **TC12（30 · AC12 · D4 · grep 钉形态）**：`done{resumed}`（无 model 键）→ `lastDone.model===''` 且模型段不渲染；缺 `latency_ms` → `null` →「—」；按钉死形态 grep 无伪造 model 赋值字面。
- [ ] **TC13（30 · AC13 · freeze · grep/diff 钉形态）**：按钉死形态断言无新 `event_type` 构造；`LgRagSseFrameParser` 解析行为 diff 为空（`retryAfterSeconds` 仅错误面可选增键 · 既有回调签名兼容）。
- [ ] **TC14（30 · AC14 · 不自造字段）**：mock 字段族与 SPEC §2 逐键对齐（未知额外键容忍不依赖）。
- [ ] **TC15（30 · AC15 · 质量门）**：`pnpm lint` → `pnpm test` → `pnpm build` 全绿（基线 263 零回归 · 新增用例随增 · 钉死 pnpm 路径）。
- [ ] **TC16（30 · AC16 · G-L1）**：`docs/_tech_graph/l1/01_modules.md` 增量备注按实落盘（或 30 判 `none` 留痕）· `./scripts/graph-compile.sh` exit 0 · HG-GRAPH-MODULES 随交付签录。
- [ ] **TC17（30 · R1-B1 回填 · 旧测 grep 影响面清点 · 行为变更类）**：本 task 改 resume 409 fallback 语义 + done/追帧链新行为属行为变更——30 开工前先枚举既有旧测影响面落 invoke，交付时该族**零回归**或按新语义改写并**逐条留痕**（改写限枚举面内 · 面外旧测改动即 FAIL）。影响面锚点（20 帽 R1 代查 · 本帽 2026-10-17 真读复核）：① `tests/chat-store.spec.ts:745-752` replay 409（F-OBS-2 run 在飞）else 分支 retryable 错误条 + detail 透传 + active-run 保留锁存——`resumeFromCursor` 手动路径存续**勿误改**（追帧器为 decide 链新增不触此支）；② `tests/chat-store-hitl.spec.ts:475-482` decide 409「已被处理」存续仍绿（D3-4 分流仅动 resume 409 支）；③ `tests/chat-store-hitl.spec.ts:354` / `:589` / `:615-629` done task AC16①/② 消费点计数口径（`fetchHitlPending` 调用断言 · F1 第三消费点不得破坏既有计数——若调用次数按新语义变化须改写并逐条留痕）；④ done 帧断言族 `tests/chat-store-hitl.spec.ts:182-199`（缺 latency_ms 裁定 A）/ `:202-213`（携实值 F-OBS-1）/ `:256-298`（hitl.resumed 穿插不崩）+ `tests/chat-view.spec.ts:390-428`（徽标 R1-NIT-2）——D2-4 resumed 新支不得扰动既有断言（新语义另起新用例）。先例口径：done task `task_web_chat_history_hitl_ux` R1 同类缺口回填 AC17。

**40 · live 联调棒位（预留 · 对 ops-desk-api compose 环境 · 契约 freeze + live 实证）：**

- [ ] **TC-L1（40 · 全链追帧）**：api compose 六 env 组起服 → 提问触发 write 工具 → `hitl.waiting` 卡片 → 批准 → resume 秒回 200 携 `replay.cursor` → 前端**自动追帧**（零手动点击）→ 终帧 `done{status:'resumed', latency_ms:int≥0, 无 model 键}` 逐键对拍（.sse/network 附件落盘）· 徽标实值 · 模型段不渲染 · `streaming=false`。
- [ ] **TC-L2（40 · 在飞窗两形态）**：resume 秒回后追帧进行中 replay 立即打 → 实测命中形态照登（200 部分帧续追 或 409+Retry-After:2 退避 · **均属正确**）· 前端零错误条轰炸 · 退避间隔 ≥ 头秒数。
- [ ] **TC-L3（40 · 409 分流 live 实证）**：在飞期重复 resume → 409「该申请的恢复正在执行中」→ 卡片「恢复进行中」· **零「已被处理」假相**；decide 重复提交 409 →「已被处理」。
- [ ] **TC-L4（40 · 回归双链）**：驳回 resume 收工链通过（rejected 也可 resume 出结论）；immediate `resume_mode` 链（required=false 前端不链第二步 · 沉降后追帧终帧 resumed）。
- [ ] **TC-L5（40 · 降级面照登）**：cursor 空串回退手动续看 / 追帧超限降级提示 / 手动停止清理——live 命中即照登，未命中以 Vitest 面为准判 n/a（不假造触发）。
- [ ] **TC18（收口 · F7）**：10/20/30/40 invoke 齐 · wiki_delta 短注 · 本 task 验收回填 · `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_decision_surface.md` PASS。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| SPEC（signed） | `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（HG-SPEC-SIGNOFF=approved 2026-10-17 · 含 D-A 定夺 S1）——范围/非范围/AC/FP 唯一需求真值 |
| 20 审查文 | `docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md`（pass · nit N1/N2/N3 本 task 已消化） |
| 上游契约（只读） | ops-desk-api `docs/guides/RUNBOOK_hitl_ops_v1_zh.md`（§1 全链菜谱 · §1.5 追帧 nuance · §2 两类 409 纪律 · §5 FP-1 钉案 · §6 交接锚点五件）· `close_hitl_resume_replay_contract_20261017.md`（replay freeze · TC5 `latency_ms:135574`）· `close_hitl_ops_runbook_20261017.md`（FP-4/FP-5 live 实证 · TC-4 `latency_ms:435584`） |
| 本仓承接 SPEC | `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed · F1/F2 · 裁定 F-A/F-B/F-C 存续 · 非范围轮询条款 · §7 仅 AC1–AC15 无 AC16 · R1-B2 钉） |
| done task 基线 | `docs/tasks/done/task_web_chat_history_hitl_ux.md`（**AC16①/② 消费点真址 :147 · task 级验收项**）· `task_web_sse_hitl_enhance.md`（PR #61）· `task_web_hitl_fobs_receipt.md`（PR #65 · FP-1 三裁定）· `task_web_hitl_resume_async_reverify.md`（JC-F1 闭环 · 联调坑位表同源） |
| 联调菜谱 | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（s2/s3 全组 · serve_8050.py · vite_proxy_smoke.sh）+ api 40 invoke 起服菜谱（三坑 + 六 env 组） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（联调坑位表 · failure_paths FP-H1~H13+FP-T1~T5 · grep/diff 断言形态钉死）
2. SPEC 全文（`docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md` · §2 契约冻结面照抄上游 · §5 裁定 D-A~D-D）+ 20 审查文（nit N1/N2/N3 消化落点）
3. `src/stores/chat.ts` 锚点区段：:183-188（ChatDoneInfo）· :569-597（`extractFrameCursor` **N1 真址**）· :732-754（done 分支）· :958-1033（resumeFromCursor）· :1040-1122（refreshHitlPending/decideHitl）
4. `src/composables/useLgRagSse.ts`（:34-40 错误面 · :81-101 帧解析 · :156-161 replayLgRag · :231-242 非 2xx 面）
5. `src/api/hitl.ts:64-114`（HitlResumeReplay/HitlResumeResponse 类型 · decide/resume/pending 封装）
6. `src/views/ChatView.vue:286-294`（pending 降级文案面 · 徽标/model v-if）· `src/components/chat/HitlApprovalCard.vue`
7. 既有测试族 `tests/chat-store-hitl.spec.ts` / `chat-store.spec.ts` / `chat-view.spec.ts` / `hitl-api.spec.ts` / `lg-rag-sse.spec.ts`（新用例就近落 · 基线 263 零回归）
8. 40 棒加读：api `RUNBOOK_hitl_ops_v1_zh.md` §1/§2 + 起服三坑/六 env 组（本 task 坑位表）· `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（GATE_VERIFY 口径）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：SPEC 已签（HG-SPEC-SIGNOFF=approved · 含 D-A 定夺）→ 本 task = D1–D4 实现拆解 + AC→TC 映射 + 40 live 棒位预留；需求真值唯一（SPEC），本帽零新增需求 | false | — | none |
| R1 | 证据收集：SPEC 全文 + 20 审查文全真读；锚点复核 N1 真址（`chat.ts:569-597` 本帽真读 :560-609 属实）；先例体例双档真读（reverify 238 行 / fobs 头部 130 行）；工具面核真（spec-wave 3.3.0 在 devDependencies · volatile.md 存在 · active/ 空） | false | — | 其余行号随 30 动刀可能再漂移（FP-T3 已钉 grep 定位纪律） |
| R2 | 裁定生成：TC 映射 = AC1–AC16 一一对应不合并（TC1–TC16 · 消歧零风险）+ 40 预留 TC-L1–L5 + R1-B1 回填 TC17 + 收口 TC18；追帧上限**定稿 ≤10 次 且 ≤120s**（SPEC 照登参数本 task 钉死 · 承接上游实证 130–310s 沉降窗 > 墙钟的降级面 FP-T5 预钉属预期正确）；graph_change_layer 承 SPEC 建议 G-L1（30 可降 none） | false | — | 上限值若 live 实证不足须回 10-task 修订（非范围已钉） |
| R3 | 反例与边界：最锋利 = FP-H4 修假相（两 409 文案分流）与 FP-H2/H3 双信号纪律不可混；task 层增补 FP-T1（40 环境不可达降级口径 · 不假绿）/FP-T2（N3 口径漂移）/FP-T3（行号漂移）/FP-T4（回退闸基线 263）/FP-T5（沉降窗 > 墙钟照登）；nit×3 全消化（N1 真址 · N2 消歧 · N3 断言形态专节） | false | — | 40 环境依赖 compose 可用性（FP-T1 已钉降级链） |
| R4 | 验收可测性：TC1–TC16 全 Vitest 机断（调用顺序/fake timers/DOM/分流/grep-diff 形态钉死）· TC-L1–L5 live 判据预钉（两可形态均 PASS 防假红 · TC-L5 n/a 合法）· TC17 旧测影响面清点（R1-B1）· TC18 收口机断；test_strategy=required · 基线 263 | false | — | fake timers 与 SSE 流 mock 的时序真实度由 30 实判 |
| R5 | 收口：范围 F1–F7 · 非范围 12 条 · failure_paths 18 行（FP-H1~H13 + FP-T1~T5）· 验收 23 条 · 依赖 6 条 · 必读 8 项齐备；人工闸全 pending 未代签；nit×3 闭合；task lint 实跑见自检结论 | true | SPEC 已签需求面零开放（D-A 已定夺 · 上限参数本 task 定稿）· nit 全消化 · 再轮无新增信息 | 闸生效待人签 · 40 环境实判 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

承 00 委派：SPEC signed（D-A 定夺 S1 事件驱动零定时器）→ 10-task 落稿。需求零新增，使命 = 把 SPEC D1–D4/AC1–AC16/FP-H1~H13 转成可执行 task（TC 映射 + 棒序 + 闸表 + 坑位 + nit 消化）。

### R1 · 证据收集

全真读：SPEC 300 行 · 20 审查文 124 行（nit 原文）· reverify/fobs 双先例体例 · `chat.ts:560-609`（N1 真址复核：接口 :569-572 · 定义 :578 · cursor 合成 :581-591）· `package.json`（spec-wave 3.3.0 · pnpm@10.32.1）· `tests/` 族谱（hitl 断言在案）· `docs/coding_wiki/volatile.md` 存在核真 · active/ 空（无冲突 task 面）。

### R2 · 裁定生成

TC 一一映射 AC1–AC16（不合并归类：消歧成本 > 归类收益 · N2 教训同号歧义）+ TC-L1–L5 预留 40 棒 + TC17（R1-B1 回填 · 旧测影响面清点）+ TC18 收口，共 23 条。追帧上限定稿 **≤10 次 且 ≤120s**（SPEC 建议区间上限钉死 · 双界先到为准 · 与上游 130–310s 沉降窗的落差以 FP-T5 降级面承接，不盲目放大墙钟——轮询轰炸禁令优先）。graph_change_layer 预判 G-L1 承 SPEC，降 none 权留 30 实判留痕。

### R3 · 反例与边界

SPEC 层 FP-H1~H13 全承；task 层补五条：FP-T1（40 环境不可达 = 不假绿 + 阻塞登记 + 维护者裁定降级口径 · 防「mock 绿当 live 绿」假收）、FP-T2（N3 断言形态专节钉死防 30 口径漂移）、FP-T3（N1 教训 → 锚点 grep 定位纪律）、FP-T4（动 done/追帧链回退闸 = 基线 263 零回归）、FP-T5（沉降窗 > 120s 墙钟时超限降级属预期 · 40 照登不误判 FAIL）。

### R4 · 验收可测性

TC1–TC16 全机断：调用次数/顺序（TC1/TC2/TC4）· fake timers 退避/循环/清理（TC7/TC8/TC11）· 分态分流（TC9）· DOM（TC6 徽标 435584ms + 模型段不存在 · TC12「—」）· grep/diff 钉形态（TC3/TC12/TC13 搜索面+排除面+基线计数三件套）· 三门 + graph-compile（TC15/TC16）。TC-L1–L5 live 判据预钉两可形态防假红（承 reverify FP-6 先例）。

### R5 · 收口

范围/非范围/failure_paths/验收/依赖/必读齐备；人工闸全 pending（HG-TASK-DRAFT/HG-AUDIT-R1/HG-GRAPH-MODULES · 本帽零代签）；nit×3 体内闭合；SPEC 照登点全落地（D-A 已签 · D-C 错误面边界入非范围② · 追帧上限已定稿）；early_stop at R5。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_decision_surface.md` | **PASS**（2026-10-17 落稿实跑 EXIT=0 · 首跑 E3 命中——验收节子标题 `###` 阻断勾选项扫描，改粗体行后复跑 PASS · 照登；**v1 R1 退回回填后复跑 PASS · EXIT=0**） |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 pending**（未代签 · 待人签/20 审） |
| git 操作 | **零**（不 commit · 不建分支 · 未推送 · 仅新增本 task 档 + 10 invoke） |
| nit 消化 | N1 真址 `chat.ts:569-597` 已钉（本帽真读复核）· N2 AC 同号歧义消歧已落（R1-B2 归因更正：承 done task `task_web_chat_history_hitl_ux:147` · signed SPEC §7 仅 AC1–AC15 无 AC16） · N3 grep/diff 断言形态专节已钉 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | v0 · 10-task 落稿（draft）：承 signed SPEC-web-hitl-decision-surface v0（HG-SPEC-SIGNOFF=approved · 含 D-A 定夺 S1）+ 20-spec-audit R1 pass；范围 F1–F7（D1–D4 + 40 live 棒位 + 落盘）· 非范围 12 条 · TC1–TC16（AC 一一映射）+ TC-L1–L5（40 预留）+ TC17 收口共 22 条 · failure_paths FP-H1~H13 全承 + FP-T1~T5 task 层增补共 18 行 · 追帧上限定稿 ≤10 次/≤120s · nit N1（真址 `chat.ts:569-597`）/N2（AC16 消歧）/N3（grep/diff 断言形态钉死）体内闭合 · R0–R5 思考轮（early_stop at R5）· 人工闸全 pending 未代签 · 零 git 操作 |
| 2026-10-17 | v1 · 20-task-audit R1 退回回填（B1/B2 + nit a · 以审查文 docs/harness/reviews/task_web_hitl_decision_surface_audit_R1_20261017.md 为准）：**B1** 新增 TC17（30 · 旧测 grep 影响面清点 · 行为变更类）——影响面四锚点经本帽真读复核（chat-store.spec.ts:745-752 · chat-store-hitl.spec.ts:475-482/:354/:589/:615-629 · done 帧断言族 :182-199/:202-213/:256-298 + chat-view.spec.ts:390-428）· 收口改 TC18 · 验收共 23 条（先例：done task R1 回填 AC17）；**B2** AC16①/② 归因更正五处+依赖表（signed SPEC-web-chat-history-hitl-ux §7 仅 AC1–AC15 无 AC16 · 真址 done task task_web_chat_history_hitl_ux.md:147 task 级验收项）；**nit a** FP-T4 chat-store it 数 65→66（`it(` 计数两轮复核 · 基线 263 口径不变）· 闸态不动全 pending · 零 git |
