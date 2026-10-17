# SPEC：Web · HITL 审批决策面（pending 消费 · decide/resume · resume 后追帧 · 409 重试纪律）（web-hitl-decision-surface）（v0 · draft）

> **层级**：前端专项 SPEC（承 ops-desk-api RUNBOOK §6「F1/F2 交接锚点」· 上游 SPEC Q4 裁定「前端 agent 专项落盘」的**决策面专项**；与本仓已签 SPEC-web-chat-history-hitl-ux v0 为承接+增量关系，不替代）  
> **状态**：`signed`（HG-SPEC-SIGNOFF=**approved** · 2026-10-17 维护者人签 · 00 代录 · **含 D-A 定夺：认可 S1 事件驱动零定时器**）  
> **上游（只读 · 唯一契约真值 · 禁改 api 仓）**：
> - `ops-desk-api/docs/guides/RUNBOOK_hitl_ops_v1_zh.md`（2026-10-17 · PR #264 MERGED squash `dd6e02d` · §1 全链菜谱 · §2 409+Retry-After 纪律 · §5 FP-1 钉案 · §6 前端交接锚点五件）
> - `ops-desk-api/docs/tasks/close/close_hitl_resume_replay_contract_20261017.md`（replay 契约 freeze：resume 200 携 `replay.cursor` → SSE 追帧 → 终帧 `done{status:resumed, latency_ms:int≥0, 无 model 键}` · FP-1 model 不补钉案 · 在飞 replay 409+Retry-After:2）
> - `ops-desk-api/docs/tasks/close/close_hitl_ops_runbook_20261017.md`（FP-4/FP-5 live 实证：retry-after:2 · resume 在飞 409 中文 detail · §1.5 追帧 nuance）
> - `ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（signed · B2 端点契约 §2 · Q2 两步钉死 · Q4 移交裁定）
> **后端契约状态**：**freeze 并 live 实证**（2026-10-17 现行 master compose 全链复走 TC-1..9 全 PASS）  
> **本仓前序交付（done · 本 SPEC 的存量基线）**：`task_web_chat_history_hitl_ux`（F1/F2 审批卡片）· `task_web_sse_hitl_enhance`（PR #61）· `task_web_hitl_fobs_receipt`（PR #65 · FP-1 兜底三裁定）· `task_web_hitl_resume_async_reverify`（JC-F1 复验 · 零改码闭环）  
> **Open Folder（实现）**：`ops-desk-web/`（本仓）；**禁止**改 `ops-desk-api` 任何文件。  
> **分支**：`task/web-hitl-decision-surface`（建议 · **本帽零 git 操作未建** · 00 立 task 时建）。

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **spec_slug** | `web-hitl-decision-surface` |
| **invoke_slug** | `web-hitl-decision-surface`（task 阶段） |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：B2 client mock（字段族与 §2 逐键对齐 · 不自造字段）+ chat store 单测（decide→resume→追帧调用顺序 · 追帧循环 fake timers · 409 分流 · 终帧分支）+ 组件渲染断言（卡片分态 / pending 降级文案 / 徽标 latency/model）；verify 真值 `pnpm lint` → `pnpm test` → `pnpm build`（pnpm 钉死路径口径承 T-W2 NIT-1） |
| **Open Folder（实现）** | `ops-desk-web/` |
| **默认分支** | `task/web-hitl-decision-surface`（建议） |
| **graph_change_layer（建议）** | `G-L1`（`docs/_tech_graph/l1/01_modules.md` api/pinia/components 行增量备注 · 必要时 `10_flow_chat.md` 补注追帧链 · `HG-GRAPH-MODULES` 随交付签录；30 实判若无新模块可降 `none` 留痕） |
| **freeze_id** | 无新增（**承接** `lg-rag-sse-v1` freeze：SSE 零新事件类型 · `hitl.waiting`/`done{status}` 均在 freeze 内 · 前端仅消费渲染） |
| **跨仓依赖** | `ops-desk-api` 契约已 freeze + live 实证（PR #248/#250/#252/#264 全 MERGED）——**无 blocked_by**，可直接 30 |

### 人工闸（SPEC 阶段 · 全 pending · 严禁代签）

| human_gate_id | status | 说明 |
|---|---|---|
| **HG-SPEC-SIGNOFF** | **approved** | 2026-10-17 维护者人签（00 代录 · 维护者会话授权）；20-spec-audit R1 书面审 **pass**（docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md）；签收含 **D-A 定夺：认可 S1 事件驱动零定时器**，轮询偏差闭合 |

---

## 1. 背景与目标

### 背景

上游 HITL 后端三连架构变更（PR #250 RunWorker 解耦 · #248 replay 409+latency_ms · #252 resume 异步化）已全量 MERGED 并 2026-10-17 compose 全链复走实证（PR #264 · TC-1..9 全 PASS）。契约面相对本仓既有 F2 交付发生了**三处实质性演进**：

1. **resume 异步化**（PR #252）：`POST /requests/{id}/resume` 秒回 200 携 `replay.cursor`（投递时刻游标）——「批准之后跑完的那段」须前端拿 cursor 追帧取得，resume 响应本身不再携带执行结果。
2. **在飞 replay 语义化**（PR #248）：run 在飞时 replay 由瞬返 500 改为 `409 + Retry-After: 2`；挂起 run（`done{waiting_approval}` 已收尾）replay 合法 200。恢复段执行期间 replay **返 200 携部分帧而非 409**（RUNBOOK §1.5 nuance）——客户端须以末帧 `event_type` 判终帧，未到则携末帧 cursor 约 2s 间隔继续追，直到 `done{resumed}`。
3. **resume 在飞并发守卫**（PR #252）：同申请重复 resume → `409` + 中文 detail「该申请的恢复正在执行中，待沉降后再试」——与 decide 重复 409 语义**完全不同**，处理纪律分开钉。

本仓既有 F2 交付（审批卡片 decide→resume 两步链）在旧契约下正确，但**未消费新契约的追帧面**：resume 响应的 `replay.cursor` 被丢弃，恢复段结果要靠用户手动「续看推进」盲拉；且 decideHitl 的 409 分支不区分 decide/resume 来源，撞 resume 在飞 409 会误呈「已被处理」假相。上游 RUNBOOK §6 已将决策面五件契约锚点正式移交本仓——本 SPEC 即该移交的专项落盘。

### 现状实证（本帽真读 · file:line 锚点 · base 当前工作树）

| 缺口 | 真态（本仓实测） |
|---|---|
| `replay.cursor` 已建模未消费 | `src/api/hitl.ts:64-79` `HitlResumeReplay{cursor}`/`HitlResumeResponse` 类型在仓；`src/stores/chat.ts:1085` `await resumeHitlRequest(requestId)` **返回值直接丢弃**，卡片转 `decided` + 文案「已批准 · 点击续看推进」（:1118-1120）——恢复段结果靠手动盲拉 |
| 追帧无循环 · 无 409 退避 | `resumeFromCursor`（`chat.ts:958-1033`）单发 replay：`onDone` 未见终帧仅提示「暂无新进度，稍后再点『续看』」（:1020-1029）；409 落通用 http 错误分支（:1004-1011）弹错误条，**不读 `Retry-After` 头、不退避重试** |
| `Retry-After` 头未达消费层 | `useLgRagSse.ts:231-242` 非 2xx 仅解析 JSON body detail；`LgRagSseTransportError`（:34-40）无 retryAfter 字段——响应头在传输层可见但未外抛 |
| decide/resume 409 混淆（**现状 UX 假相**） | `decideHitl` catch 分支（`chat.ts:1089-1095`）**任何** 409 一律 `resolved` +「该申请已被处理」——撞 resume 在飞 409「该申请的恢复正在执行中」时呈假相（真实语义=等沉降+追帧，RUNBOOK §2.2） |
| pending 仅快照 · 无进入即拉 | `refreshHitlPending`（`chat.ts:1040-1053`）仅两消费点：decideHitl 动作后（:1121）与 openHistoryThread 进入 waiting thread（:1197 注释钉 AC16②）；**进入 Chat 页不拉、无手动刷新 UI**；`hitlPending` 快照无列表渲染面，`ChatView.vue:286-287` 只渲染 `hitlPendingError` 降级文案 |
| SSE 传输/帧面完备可复用 | `useLgRagSse.ts` 帧解析按 `event_type` 透传（:81-101）· `replayLgRag`（:156-161）在仓 · store `processFrame` 同一管线渲染 live/replay/历史三入口——追帧对接零新机制 |
| FP-1 兜底已在仓（存续钉死） | `ChatDoneInfo{latency_ms:number|null, model:string}`（`chat.ts:183-188`）· done 分支缺键存 null/''（:744-751）· `ChatView.vue:290-294` 缺键显「—」、模型段 `v-if` 不渲染——与上游 FP-1 钉案一致，本 SPEC 只**钉存续** |

### 一句话目标

把已 freeze 的 HITL 决策面契约在浏览器侧**消费完整**：resume 200 的 `replay.cursor` → 自动追帧接入现有 chat 流（复用 `replayLgRag`/`processFrame` 管线 · 终帧 `done{resumed}` 收尾）+ 409 两类语义分流（decide 已决 / resume 在飞 / replay 在飞 `Retry-After` 退避）+ pending 列表刷新纪律补齐——**SSE 传输/解析零改动、零新事件类型、api 仓零触碰**。

### 设计纪律（签收时锁死）

1. **freeze 零动**：不新增/不改 SSE 事件类型与帧语义；`LgRagSseFrameParser` 解析行为零改动（错误回调面扩展属客户端内部面，见裁定 D-C）。
2. **api 仓零触碰**：端点/状态码/`Retry-After` 值/帧字段均为只读契约承接。
3. **两步钉死存续**：decide 不自动 resume（manual 默认）；前端链式两调用；`resume_mode=immediate`（响应 `resume.required=false`）跳过第二步的既有例外存续。
4. **追帧不新造**：恢复段追帧一律复用 `replayLgRag` + `processFrame` 同一渲染管线；不新开 SSE 端点/不改 replay 契约形态。
5. **归属语义不泄露**：404 一律中性文案，不区分「越权」与「不存在」。
6. **FP-1 禁伪造**：`done{resumed}` 无 model 键是契约行为——前端**永不**伪造 model 值；缺键不渲染模型段（存续裁定 B）。运维见「耗时 — / 无模型」**不是 bug**。
7. **不自造字段**：mock/类型与 §2 字段族逐键对齐；契约外宽松键只读容忍、不依赖。

---

## 2. 契约冻结面（照抄上游 · 只承接禁改）

### REST（cookie maintainer 鉴权 · 前端 baseURL `/api`）

| 端点 | 契约钉死面 |
|---|---|
| `GET /api/ops/hitl/pending` | `{items:[{id, run_id, thread_id, reason, blocked_by, created_at}], count}` · **仅本人 owner**（归属经 run_id 反查 · 解析不到即排除不泄露）· 未登录 401 `{"detail":"Not authenticated"}` · 非 maintainer 403 |
| `POST /api/ops/hitl/requests/{id}/decide` | body `{decision: "approved"\|"rejected"}` · 可选 `note` · 可选 `resume_mode ∈ {inherit, immediate, manual}`（未知值 **400** 非 422）· 200 `{ok, request:{status:...}, resume:{required:true, endpoint}}`；`immediate` 时 `resume.required=false` + `auto_triggered=true`（后端进程内已自动续跑）· **两步钉死：默认只置已决不自动 resume** · 重复/已决 409 · 未知/跨用户 404 · 非法 decision 422 |
| `POST /api/ops/hitl/requests/{id}/resume` | **异步受理秒回 200**：`{ok, request, resume:{status:"accepted",...}, replay:{run_id, cursor:"<run_id>:<seq>"}}` · `replay.cursor` = 投递时刻游标（恢复段事件都排在它后面 · **best-effort：取不到为空串，不阻塞受理**）· 非已决 409 · **在飞重复提交 409「该申请的恢复正在执行中，待沉降后再试」**（并发守卫 · 等沉降非重试）· checkpoint 未配置 503 · `stranded_checkpoint` 409（提示人重开 · **不是重试面**）· **驳回也必须能 resume**（收工出结论） |
| `POST /api/ops/lg-rag/replay` | body 收 `{cursor}` **或** `{run_id, after_seq}` · SSE 帧形状同 live · run 在飞（无 done/error 收尾帧）→ **409 + `Retry-After: 2`** + `{"detail":"Run is still in flight; retry after it settles."}` · 沉降后同请求 200 **零 diff** · 挂起 run（`done{waiting_approval}` 已收尾）replay 合法 200 · 非法 body 422 · 未知/跨用户 run 404 · 未识别异常仍 500（fail-closed · 非重试面） |

### SSE（零新事件 · `lg-rag-sse-v1` freeze 内）

- `hitl.waiting`（reason + requests[] · 含 `unpersisted` 标记 · 消费存续）
- `done{status:"waiting_approval"}`（终态 ≠ 完成 · 存续）
- **恢复段终帧**：`done{status:"resumed", latency_ms:int≥0, 无 model 键}`（FP-1 钉案：model 后端永不提供 · 禁伪造）
- 恢复段帧序预期：`hitl.resumed` → tool_exec / 进度帧 → … → `done{resumed}`（逐帧经事件流落盘 · 前端 replay 追帧可见）

### 追帧纪律（RUNBOOK §1.5/§2 钉文照抄）

1. resume 200 → 拿 `replay.cursor` 追帧；cursor 空串 → 回退既有手动「续看」路径（best-effort 契约）。
2. 恢复段执行期间 replay 返 **200 携部分帧**（非 409）——客户端以**末帧 `event_type`** 判是否到终帧；未到则携末帧 cursor 约 **2s 间隔**继续追，直到 `done{status:"resumed"}`。
3. replay 撞 409（在飞）→ 按响应头 `Retry-After` 秒数退避重试；**禁止**轮询轰炸或换 run 重开；沉降后同请求零 diff。
4. resume 撞 409（在飞重复提交）→ 上一次恢复还在跑——**等沉降 + 追帧确认终帧**，不并发重提；分钟级仍 409 属 api 侧排查面（执行失败只落 api 日志，结果经事件流可见）。

---

## 3. 范围（钉死）

### D1 · pending 列表消费与刷新纪律

| # | 件 | 落点（建议 · 30 可按实微调不改语义） | 动作 |
|---|---|---|---|
| D1-1 | 进入即拉 | `ChatView.vue` mounted / store 初始化 | 进入 Chat 页一次性 `fetchHitlPending` 核对（承 AC16 两消费点补第三点） |
| D1-2 | 动作后刷新 | `chat.ts decideHitl`（既有 :1121） | 存续：decide/resume 动作链完成后刷新 pending 快照 |
| D1-3 | 手动刷新入口 | Chat 页审批区/提示条（最小 UI） | pending 快照可见化最小呈现（条数徽标或单行提示）+ 手动刷新钮；**非**全局面板 |
| D1-4 | 降级纪律 | `refreshHitlPending`（既有 :1040-1053） | 存续钉死：403「无审批权限」· 404/501/网络错「审批服务暂不可用」· 401 走 `http.ts` 拦截器全局跳登录 · 一律不炸屏、不阻塞 Chat 主路径 |
| D1-5 | 刷新触发边界 | 全仓 | **不引入固定间隔轮询定时器**（承 signed SPEC-web-chat-history-hitl-ux 非范围 · 见裁定 D-A 留痕）；可选增量=页面 `visibilitychange` 回前台一次性核对（R2 裁定项） |

### D2 · 审批动作链接管 resume 追帧（核心增量）

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| D2-1 | `replay.cursor` 消费 | `chat.ts decideHitl`（:1084-1086 改造） | resume 200 → 解析 `replay.cursor`（`"<run_id>:<seq>"`）→ 自动起追帧（D3）；cursor 空串/缺失 → 回退既有「已批准 · 点击续看推进」手动路径（FP-H1） |
| D2-2 | immediate 例外存续 | `decideHitl` | `resume.required=false`（immediate 后端已自动续跑）→ 不调 resume，直接以 active-run 游标起追帧 |
| D2-3 | 追帧渲染接入现有 chat 流 | `processFrame` 同一管线 | 追帧帧流渲染进当前 assistant 消息（刷新后消息流为空则新建承接条 · 承 resumeFromCursor R1-N5 先例）；`hitl.resumed` 帧按未知事件容忍（default 忽略 · 不崩） |
| D2-4 | 终帧收尾 | `chat.ts done` 分支（:732-754 语义存续） | `done{status:"resumed", latency_ms}` → `streaming=false` · 清 active-run · `lastDone.latency_ms` 实值徽标 · **无 model 键 → 模型段不渲染**（FP-1 存续） |

### D3 · 追帧循环与 409 退避纪律

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| D3-1 | 追帧循环 | store 新增私有追帧器（建议 `chaseResumedRun`） | replay 流干净结束未见终帧 → 携末帧 cursor（`extractFrameCursor` 既有 · :476-495 先例）约 2s 间隔再追；**有界**：上限次数/墙钟（建议 ≤10 次或 ≤120s · 30 定稿写 task），超限降级提示「恢复仍在进行，可稍后手动续看」+ 保留 active-run |
| D3-2 | replay 409 退避 | `useLgRagSse.ts` 错误面 + store | 409 + `Retry-After` → 按头秒数退避自动重试（缺头默认 2s）· **不弹错误条 · 不计失败**；连续 409 并入 D3-1 同一上限 |
| D3-3 | 手动停止/会话切换清理 | `stopStreaming`/`startNewSession` | 追帧中 abort → 清理退避定时器与 controller（不泄漏 · 不残留 streaming 假态） |
| D3-4 | resume 在飞 409 分流 | `decideHitl` catch（:1089-1095 改造） | 区分来源：**decide 409** → 「已被处理」（存续）；**resume 409**「恢复正在执行中」→ 卡片转「恢复进行中」并等沉降后起追帧（或退避重试一次 resume）——**修现状一律「已被处理」假相** |

### D4 · FP-1 model 兜底存续钉死

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| D4-1 | model 缺键不渲染 | `ChatView.vue:290-294`（既有） | `v-if="chat.lastDone.model"` 存续；新增 Vitest 断言钉死：`done{resumed}`（无 model 键）→ 模型段 DOM 不存在 |
| D4-2 | latency 缺键显「—」 | `chat.ts:744-751`（既有裁定 A） | 存续；断言缺键 → `latency_ms=null` → 徽标显「—」（pre-fix 历史帧 replay 面） |

---

## 4. 非范围（钉死 · 越任一条即停）

- ❌ 改 `ops-desk-api` 仓任何文件（契约 freeze · 只读承接）
- ❌ 新 SSE 事件类型 / 改 `hitl.waiting`/`done`/`hitl.resumed` 帧语义 / 改 `LgRagSseFrameParser` 解析行为（错误回调面扩展除外 · 裁定 D-C）
- ❌ 后端端点语义改动（分页/归属/状态码/`Retry-After` 值/409 文案均承上游）
- ❌ 实现审批权限模型后端 / 改 OA HMAC 签名面（`GET /hitl/requests` · `GET /hitl/runtime` · `POST /hitl/callback`）任何触碰
- ❌ 审批实时推送（WS/SSE 推送通道）；**固定间隔轮询定时器**（承 signed SPEC 非范围 · 裁定 D-A）
- ❌ 全局审批面板 / 新路由独立审批页（承裁定 F-A 内联卡片形态；pending 面板仍留后续增强另立）
- ❌ decide 合并 resume 为单端点调用（两步钉死存续）
- ❌ `OPS_HITL_AUTO_RESUME=auto` 运维化 / HMAC 对接面（上游 CLOSE 后续建议在册 · 各另立）
- ❌ B1 历史面改动（threads/history 契约与渲染存续）
- ❌ 伪造 model 值 / 伪造任何契约外终帧字段（FP-1 禁伪造钉死）

---

## 5. 方案对比（R2 · ≥2 案）

### 裁定 D-A · pending 刷新纪律

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · 事件驱动刷新**（进入即拉 + 动作后刷新 + 手动刷新 + `visibilitychange` 回前台一次性核对） | 零定时器 · 与 signed SPEC 非范围零冲突 | **推荐（本帽裁定）**：审批动作本就由本端发起（动作后刷新已闭环）；他人/其他端并发决议的可见性延迟由「进入+回前台+手动」三点覆盖，代价为零常驻开销 |
| S2 · 低频轮询定时器（如 15–30s） | pending 近实时 | 弃选（v1）：signed SPEC-web-chat-history-hitl-ux 非范围明文排除轮询定时器；引入即契约外偏移须维护者另行裁定——**如实照登：上游委派 brief 提及「pending 轮询/刷新纪律」，本帽按 signed 非范围裁 S1，若维护者要轮询须在签收时显式推翻此条** |

### 裁定 D-B · resume 后追帧触发形态

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · resume 200 后自动追帧**（消费 `replay.cursor` · 失败/空 cursor 回退手动） | decide→resume→追帧三链一气 · 恢复结果就地流入消息流 | **推荐（本帽裁定）**：契约专门给 `replay.cursor` 即为此用途（RUNBOOK §6 锚点明示「前端拿它追帧」）；异步 resume 实测 130–310s 执行窗内用户无反馈是 JC-F1 同源体验缺口 |
| S2 · 维持手动「续看推进」 | 卡片按钮触发既有 resumeFromCursor | 弃选（降级面保留）：契约演进后手动盲拉不知终帧何时到，用户可能反复点；但作为 cursor 空串/追帧超限的**降级路径存续**（FP-H1/H2） |

### 裁定 D-C · `Retry-After` 消费面

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · 解析响应头退避**（`LgRagSseTransportError` 增可选 `retryAfterSeconds` 字段 · 缺头默认 2s） | 退避时长以服务端钉值为准 | **推荐（本帽裁定）**：纪律原文「按 `Retry-After` 秒数退避重试」；错误回调面增可选键是**客户端内部面扩展**（不触帧解析/不触契约 · 既有消费方零 diff） |
| S2 · 固定 2s 硬编 | 不读头 · 与现值一致 | 弃选：头值是契约化运维旋钮（上游未来可调），硬编即失真 |

### 裁定 D-D · 追帧渲染目标

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · 复用 `processFrame` 渲染进现有消息流**（当前 assistant · 空流新建承接条） | live/replay/历史/追帧四入口同一管线 | **推荐（本帽裁定）**：与续看/历史同构 · 零渲染分叉（承裁定 F-A/F-C 纪律） |
| S2 · 独立「恢复进度」视图 | 单独进度组件呈现恢复段 | 弃选：渲染分叉 · 恢复结果终归是消息流内容 |

---

## 6. failure_paths

| # | 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|---|
| FP-H1 | resume 200 但 `replay.cursor` 空串/缺失（best-effort 契约） | 回退既有手动路径：卡片「已批准/已驳回 · 点击续看推进」+ active-run 保留 | 是 | 卡片提示（存续文案） |
| FP-H2 | 追帧中 replay 409 + `Retry-After: 2`（run 在飞） | 按头秒数退避自动重试（缺头默认 2s）· 不弹错误条；并入追帧上限，超限 → 降级「恢复仍在进行，可稍后手动续看」+ active-run 保留 | 是（自动退避） | 无打扰 / 超限后降级提示 |
| FP-H3 | replay 200 干净结束但末帧非终帧（恢复段在写 · RUNBOOK §1.5 nuance） | 携末帧 cursor 约 2s 间隔再追（seq 去重基线存续）· 同上限兜底 | 是（自动） | 无打扰（帧增量就地渲染） |
| FP-H4 | **resume 409 在飞**「该申请的恢复正在执行中，待沉降后再试」（并发守卫） | 卡片转「恢复进行中」· **不并发重提** · 等沉降起追帧（active-run/已收 cursor）；**禁**呈「已被处理」（修现状 `chat.ts:1089-1095` 混淆） | 否（等沉降） | 卡片「恢复进行中」 |
| FP-H5 | decide 409 重复/已决 | 卡片「该申请已被处理」· 不弹错误条 · 刷新 pending（存续） | 否 | 卡片状态文案 |
| FP-H6 | 追帧/replay 404 · 422 | 清 active-run + 中性提示「对话记录不存在或已过期」/「续看请求校验未通过」（既有 :993-1003 语义沿用）· 不区分越权与不存在 | 否 | 中性提示 |
| FP-H7 | 401（pending/decide/resume/replay 任一面） | REST 走 `http.ts` 拦截器跳登录；replay 401 清 thread_id+active-run+auth（既有 :987-992 语义沿用） | 是 | 登录页 |
| FP-H8 | 403 非 maintainer | pending/审批动作降级「无审批权限」· 不炸屏（存续） | 否 | 降级文案 |
| FP-H9 | `done{resumed}` 无 model 键（FP-1 钉案契约行为） | 模型段不渲染 · `latency_ms` 实值徽标；缺 latency →「—」；**永不伪造** | n/a | 徽标「耗时 Xms」/「—」（非 bug 不报缺） |
| FP-H10 | 追帧中用户手动停止 / 发起新会话 / 切换 thread | abort controller + 清退避定时器 · streaming 复位（与 live abort 同语义） | 是（手动续看） | 中断提示（既有形态） |
| FP-H11 | 恢复执行失败（api 侧只落日志 · 终帧永不到达） | 追帧上限兜底：降级提示 + active-run 保留可手动续看；分钟级异常属 api 排查面（RUNBOOK §2.2 · 前端不背） | 是 | 降级提示 |
| FP-H12 | resume 503（checkpoint 未配置）/ `stranded_checkpoint` 409 | 中性错误条「恢复服务暂不可用/请重开会话」· **不当可重试面自动重试**（stranded 提示人重开 · RUNBOOK §1.4） | 否 | 错误条 |
| FP-H13 | 30 未签 `HG-AUDIT-R1` 即改码 | **拒开工**（task 阶段核验） | 是 | 须先 20 + 人签 |

---

## 7. 验收标准（全部可机断 · Vitest mock B2/replay 契约）

### D1 · pending 消费

- [ ] AC1：挂载 Chat 页 → `GET /api/ops/hitl/pending` 调用恰 1 次；mock `{items, count}` → pending 快照更新；403 → 「无审批权限」降级文案；404/501/网络错 → 「审批服务暂不可用」；均**不**阻塞发送/流式主路径
- [ ] AC2：decide/resume 动作链完成后 pending 再刷新 1 次（存续断言）；手动刷新入口点击 → 再拉 1 次
- [ ] AC3：全仓 grep 断言**无** `setInterval` 轮询 pending（裁定 D-A 钉死；`visibilitychange` 核对若落则单独断言一次性语义）

### D2/D3 · 动作链与追帧

- [ ] AC4：mock decide 200（`resume.required=true`）→ resume 200 携 `replay:{run_id, cursor:"<run_id>:<seq>"}` → 断言调用顺序 decide→resume→`replayLgRag`；replay 起点游标 = cursor 解析值
- [ ] AC5：mock `resume.required=false`（immediate）→ **不**调 resume · 以 active-run 游标直接起追帧（存续例外回归断言）
- [ ] AC6：追帧帧流（`hitl.resumed` → 进度帧 → `answer` → `done{status:'resumed', latency_ms:435584}`）→ 断言经 `processFrame` 渲染进消息流（内容/subtasks 增量可见）· `hitl.resumed` 帧不崩不误渲 · 终帧后 `streaming=false` · active-run 清除 · 徽标显 `435584ms` · **模型段 DOM 不存在**（FP-1）
- [ ] AC7：replay 干净结束未见终帧（fake timers）→ ≥1 次携末帧 cursor 再追 · 间隔 ≥2s；达上限 → 降级提示「恢复仍在进行」· active-run 保留 · `canResume` 为真
- [ ] AC8：replay 409 + `Retry-After: 2`（fake timers）→ 按 ≥2s 退避自动重试 · 全程**无**错误条；缺 `Retry-After` 头 → 默认 2s；连续 409 计入同一上限
- [ ] AC9：resume 409（detail「该申请的恢复正在执行中」）→ 卡片「恢复进行中」· **不**出现「已被处理」文案（现状假相回归钉死）· 无并发第二次 resume；decide 409 → 「已被处理」（存续 · 两分支分流断言）
- [ ] AC10：resume 503 / stranded 409 → 中性错误条 · 无自动重试
- [ ] AC11：追帧中 `stopStreaming`/`startNewSession` → 退避定时器清除（fake timers 断言无残留触发）· streaming 复位

### 契约 / 通用 / 质量门

- [ ] AC12：FP-1 存续钉死：`done{resumed}`（无 model 键）→ `lastDone.model===''` 且模型段不渲染；缺 `latency_ms` → `null` →「—」；全仓 grep 无伪造 model 赋值字面
- [ ] AC13：SSE 契约零动：grep 断言无新 `event_type` 构造；`LgRagSseFrameParser` 解析行为 diff 为空（`retryAfterSeconds` 仅错误面可选增键 · 既有回调签名兼容）
- [ ] AC14：mock 字段族与 §2 逐键对齐（不自造字段 · 未知额外键容忍不依赖）
- [ ] AC15：`pnpm lint` → `pnpm test` → `pnpm build` 全绿（既有 chat-store/hitl 测试零回归）
- [ ] AC16：G-L1 `docs/_tech_graph/l1/01_modules.md` 增量备注按实落盘（或 30 判 `none` 留痕）· `./scripts/graph-compile.sh` exit 0 · `HG-GRAPH-MODULES` 随交付签录

---

## 8. 思考轮回填（R0–R5）

### R0 · 读人聊 / 目标

上游四件全真读：RUNBOOK_hitl_ops_v1_zh（§1 全链菜谱 · §2 两类 409 纪律 · §5 FP-1 钉案 · §6 交接锚点五件）· SPEC-chat-history-hitl-ux_v0（Q2 两步 · Q4 移交）· close_hitl_resume_replay_contract_20261017（replay 契约 freeze · FP-1 溯源 · TC5 live 实证 `latency_ms:135574`）· close_hitl_ops_runbook_20261017（FP-4/FP-5 live 实证 · §1.5 追帧 nuance「200 携部分帧非 409」）。本仓存量基线真读：`src/api/hitl.ts` 全文 · `src/stores/chat.ts`（:183-188/:723-754/:958-1033/:1040-1122）· `src/composables/useLgRagSse.ts` 全文 · `HitlApprovalCard.vue` 全文 · `ChatView.vue`（:286-294）· 已签 SPEC-web-chat-history-hitl-ux v0 全文（承接边界裁定）· done task 四件头部（PR #61/#65 · JC-F1 复验）。

### R1 · 范围 / 非范围 / 角色与场景

范围 D1（pending 消费纪律）/D2（resume 追帧接管）/D3（追帧循环+409 退避）/D4（FP-1 存续）钉死；非范围十条锁死（api 仓 / SSE freeze / 权限模型后端 / OA 面 / WS 推送 / 轮询定时器 / 全局面板 / 单端点合并 / auto 运维化 / B1 面 / 禁伪造）。角色：maintainer（审批者）/ 非 maintainer 登录用户（403 降级）/ 未登录（401 跳登录）。场景：live 审批→批准→自动追帧看到恢复结果 · 驳回→resume 收工出结论 · 在飞撞 409 退避 · 刷新/切换后手动续看兜底 · 端点异常降级。

### R2 · 方案对比

裁定 D-A（事件驱动刷新 vs 轮询 · 荐 S1 · **与委派 brief「轮询」字面偏差如实照登待人裁**）· D-B（自动追帧 vs 手动续看 · 荐 S1 自动 · 手动留降级面）· D-C（解析 `Retry-After` 头 vs 硬编 2s · 荐 S1）· D-D（复用 processFrame vs 独立恢复视图 · 荐 S1）——荐案依据统一为「契约钉文照抄 + 复用既有管线 + signed 非范围零冲突」。

### R3 · 边界 / 失败路径 / 安全与依赖

FP-H1~FP-H13；最锋利边界 = FP-H4（resume 在飞 409 误呈「已被处理」· **现状假相必修**）与 FP-H2/H3（两类「未完成」信号——409 在飞 vs 200 部分帧——纪律不同不可混）；安全面 = 401/403/404 归属不泄露存续；依赖 = 上游契约已 freeze + live 实证（**无 blocked_by** · 与 F1/F2 时代「mock 先行等端点」不同，本波可直接对 live 联调）。

### R4 · 验收 / 可测性

AC1–AC16 全部可 Vitest 机断：调用顺序断言（decide→resume→replay）· fake timers 退避/循环/清理断言 · store 分态断言（已被处理 vs 恢复进行中分流）· DOM 断言（徽标/模型段不存在/降级文案）· grep/diff 契约断言（SSE 零动 · 无轮询定时器 · 无伪造 model）；verify `pnpm lint → pnpm test → pnpm build`。

### R5 · SPEC 签收就绪 · 下一棒

开放裁定：**D-A 已闭合**——2026-10-17 维护者定夺认可 S1 事件驱动零定时器（00 代录），委派 brief「轮询」字面偏差以维护者裁定为准、非范围⑤存续（其余 D-B/C/D 已裁）。路径已完成：20-spec-audit R1 pass → HG-SPEC-SIGNOFF approved → 下一棒 00 起草 web task（无 blocked_by · 可含 40 live 联调棒）。

### 思考轮控制

| 轮 | 状态 | 说明 |
|---|---|---|
| R0 | done | 上游 RUNBOOK/SPEC/双 CLOSE + 本仓码面锚点与四件 done task 全真读 |
| R1 | done | 范围 D1–D4 钉死 · 非范围十条 · 角色三态 |
| R2 | done | 裁定 D-A/D-B/D-C/D-D（各 ≥2 案 · D-A 偏差照登） |
| R3 | done | FP-H1~FP-H13 · 最锋利边界=FP-H4 修假相 + FP-H2/H3 双信号分流 |
| R4 | done | AC1–AC16 全可机断 · test_strategy=required |
| R5 | done | 20-spec-audit R1 pass（nit×3 转 task）→ HG-SPEC-SIGNOFF approved（2026-10-17 · 含 D-A 定夺 S1） |
| early_stop | no | — |

---

## 9. 关联

- 上游契约真值：`ops-desk-api/docs/guides/RUNBOOK_hitl_ops_v1_zh.md` · `docs/tasks/close/close_hitl_resume_replay_contract_20261017.md` · `docs/tasks/close/close_hitl_ops_runbook_20261017.md` · `docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（signed）
- 本仓承接 SPEC：`docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed 2026-10-04 · F1/F2 · 裁定 F-A/F-B/F-C 存续）
- 本仓 done task 基线：`docs/tasks/done/task_web_chat_history_hitl_ux.md` · `task_web_sse_hitl_enhance.md`（PR #61）· `task_web_hitl_fobs_receipt.md`（PR #65 · FP-1 三裁定）· `task_web_hitl_resume_async_reverify.md`（JC-F1 闭环）
- 本仓锚点：`src/api/hitl.ts:64-114` · `src/stores/chat.ts:183-188/723-754/958-1033/1040-1122` · `src/composables/useLgRagSse.ts:34-40/104-161/231-242` · `src/components/chat/HitlApprovalCard.vue` · `src/views/ChatView.vue:286-294`

---

## 10. 下一棒（可复制 Prompt）

> 你是 Harness 帽 **20-spec-audit**。对本仓 `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（draft · HG-SPEC-SIGNOFF=pending）做 R1 书面审：核对范围 D1–D4、非范围十条、契约冻结面（照抄上游 RUNBOOK §1/§2/§5/§6 与 close 双档逐字一致性）、验收 AC1–AC16 可机断性、failure_paths FP-H1~FP-H13、思考轮 R0–R5 控制；实证抽查本仓锚点（`src/stores/chat.ts` decideHitl 409 分支与 resumeFromCursor · `src/composables/useLgRagSse.ts` 错误面 · `src/api/hitl.ts` 类型面）与上游契约（`ops-desk-api/docs/guides/RUNBOOK_hitl_ops_v1_zh.md` + 两件 close 档）。重点核：裁定 D-A 与 signed SPEC-web-chat-history-hitl-ux 非范围「轮询定时器」的一致性留痕是否成立。结论落盘 `docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_<日期>.md`。**不改 SPEC 实质内容 · 不代签 HG-SPEC-SIGNOFF**。

---

## 修订记录

| 日期 | 版本 | 内容 |
|---|---|---|
| 2026-10-17 | v0 | 10-spec 初稿：承上游 RUNBOOK §6 交接锚点 + replay 契约 freeze（2026-10-17 PR #264 live 实证）专项落盘；本仓缺口实证锚点（`replay.cursor` 丢弃 · 追帧无循环无退避 · decide/resume 409 混淆 · pending 无进入即拉）；裁定 D-A/D-B/D-C/D-D；FP-H1~FP-H13；AC1–AC16；R0–R5 回填；HG-SPEC-SIGNOFF=pending 待人签 |
