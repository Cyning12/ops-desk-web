# SPEC：Web · 会话历史 + 中断续看 + HITL 审批面（web-chat-history-hitl-ux）（v0）

> **层级**：前端专项 SPEC（承上游 signed SPEC §2 F1/F2 概要 · 维护者裁定 Q4「前端 agent 专项落盘」）  
> **状态**：`draft`（HG-SPEC-SIGNOFF=**pending** · 本帽不代签 · 等维护者）  
> **上游（只读 · 唯一契约真值 · 禁改 api 仓）**：`ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（signed 2026-09-30 · §2 B1/B2 端点契约 · §2 F1/F2 前端概要=本 SPEC 范围依据 · §3 非范围 · §5 failure_paths · §6 前端验收「以前端专项 SPEC 为准」）  
> **上游勘误**：`ops-desk-api/docs/spec/chat-history-hitl-ux/ERRATA-chat-history-hitl-ux_v0_20260930.md`（`run.start` payload 增可选 `query` 键 · 非新事件 · 裁定 A1）  
> **上游审查**：`ops-desk-api/docs/harness/reviews/spec_chat_history_hitl_ux_audit_R1_20260930.md`（PASS-WITH-NITS · 零阻塞）  
> **时序留痕**：后端 B1 task（`task_chat_history_api.md`）与 B2 task（`task_hitl_browser_decide.md`）三闸维护者已签 **approved 2026-09-30**、状态 **ready**（端点实现进行中）；前端专项 SPEC 现在立（2026-10-04），mock 契约先行不阻塞 30。  
> **Open Folder（实现）**：`ops-desk-web/`（本仓）；**禁止**改 `ops-desk-api` 任何文件。  
> **分支**：`task/chat-history-hitl-ux`（已建好 · 勿动 main）。

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **spec_slug** | `web-chat-history-hitl-ux` |
| **invoke_slug** | `web-chat-history-hitl-ux`（task 阶段） |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：B1/B2 API client mock（字段族与上游 task 逐键对齐 · 不自造字段）+ chat store 单测（`done` 按 status 分支 / `hitl.waiting` 卡片态 / 续看复用断言）+ 组件渲染断言（徽标 / 审批卡片 / 空态 / 降级标题）；端点未上线时按契约 mock + 运行时降级（FP-F8），不阻塞 30；verify 真值 `pnpm lint` → `pnpm test` → `pnpm build` |
| **Open Folder（实现）** | `ops-desk-web/` |
| **默认分支** | `task/chat-history-hitl-ux` |
| **graph_change_layer（建议）** | `G-L1`（`docs/_tech_graph/l1/01_modules.md` api/pinia/components 行增量备注 · 必要时 `10_flow_chat.md` 补注 · `HG-GRAPH-MODULES` 随交付签录） |
| **freeze_id** | 无新增（**承接** 上游 `lg-rag-sse-v1` freeze：SSE 零新事件类型 · `hitl.waiting`/`done{status}`/`run.start`+可选 `query` 均已在 freeze 内 · 前端仅消费渲染，传输/解析层零改动） |
| **跨仓依赖** | `ops-desk-api` B1/B2 端点（task `chat-history-api` / `hitl-browser-decide` · ready · 30 进行中）；web 30 **mock 契约先行**，联调 `blocked_by api` |

### 人工闸（SPEC 阶段）

| human_gate_id | status | 说明 |
|---|---|---|
| **HG-SPEC-SIGNOFF** | **pending** | 待维护者签收（本帽禁止代签）；签收路径建议：20-spec-audit 书面审 → 维护者签录 → 00 起草 web task |

---

## 1. 背景与目标

### 背景

D2 观察期本地冒烟（2026-09-29/30 · run `09b639f7`）实战暴露：用户 run 挂 `waiting_approval`，前端「没有最终回答」也零待审批表现；刷新后中断对话消失；无历史会话可看。上游 signed SPEC 已裁定：历史真源=事件表（Q1）、恢复复用 resume（Q2）、**SSE 零新事件仅前端渲染既有帧**（Q3）、前端 F1/F2 专项 SPEC 另立（Q4）——本 SPEC 即 Q4 的专项落盘。

### 现状实证（本帽真读 · file:line 锚点）

| 缺口 | 真态（本仓实测） |
|---|---|
| `hitl.waiting` 帧被吞 | `src/stores/chat.ts:523-651` `handleEvent` switch 仅 `run.start`(:525)/`node.progress`(:537)/`subtask.progress`(:544)/`answer`(:604)/`done`(:621)/`error`(:634) 六分支，**无 `hitl.waiting` 分支** → 落 `default`(:647-650) 静默忽略 |
| `waiting_approval` 被当完成态（**现状 bug**） | `case 'done'`（`chat.ts:621-633`）**不看 `payload.status`**：无条件 `streaming=false`(:628) + `clearActiveRun()`(:631) 清场 → 挂起 run 呈现为「已完成」且续看游标被清 |
| 续看机制已在仓（可复用 · 不新造） | T4 active-run：`processFrame` 每帧持久化游标（`chat.ts:503-521`）· `clearActiveRun`（:461-465）· `resumeFromCursor` 手动 replay（:768-843 · `replayLgRag` `src/composables/useLgRagSse.ts:150-155` · `LG_RAG_REPLAY_PATH` :107）；cursor 提取 `extractFrameCursor`（`chat.ts:476-495`） |
| SSE 传输层零改动即可过帧 | `LgRagSseEvent.event_type: string`（`useLgRagSse.ts:21-31`）· 帧解析器按 `event_type` 透传（:81-101）——`hitl.waiting`/`done{status}` 天然到达 store，缺的只是渲染分支 |
| 无 B1/B2 client | `src/api/` 现有 auth/chat/graph/http/issues/lcEvidence/lgRag/obs/overview/pulls 十 client；axios 封装 `http.ts:47-51`（baseURL `/api` · `withCredentials`）+ 401 拦截 `setUnauthorizedHandler`（:62-78）——B1 threads/history 与 B2 pending/decide/resume client 新增落点明确 |
| Chat 页为单列布局 | `src/views/ChatView.vue` 单列消息流（max-width 860px · :259）+ 提示条/错误条/续看按钮（:88-213）——历史侧栏与审批卡片须在此结构上最小增量 |

### 一句话目标

在前端补齐观测闭环：**渲染既有 SSE 帧**（`hitl.waiting` → 醒目审批卡片；`done` 按 `status` 分支修 `waiting_approval` 误当完成态 bug）+ **承接 B1/B2 REST 契约**（历史侧栏 + 浏览器审批决策面），续看复用既有 T4 active-run/replay 机制——**SSE 传输/解析零改动、零新事件类型、api 仓零触碰**。

### 设计纪律（签收时锁死）

1. **freeze 零动**：不新增/不改 SSE 事件类型与帧语义；`run.start` 可选 `query` 键为上游 errata（裁定 A1）已批口径，前端容忍其缺失。
2. **api 仓零触碰**：B1/B2 为只读契约；实现期端点未上线按契约 mock + 运行时降级，不改后端。
3. **续看不新造**：历史进入、断连续看、审批后推进一律复用既有 `replayLgRag`/active-run 机制（T4）。
4. **归属语义不泄露**：404 一律按「不存在/已过期」中性文案呈现，不区分「越权」与「不存在」。
5. **不自造字段**：mock/类型与上游 B1/B2 task 字段族逐键对齐；契约外的宽松键只读容忍、不依赖。

---

## 2. 契约冻结面（照抄上游 · 只承接禁改）

### SSE（零新事件 · `lg-rag-sse-v1` freeze 内已有）

- `hitl.waiting`（reason + requests[]）
- `done{status:"waiting_approval"}`（终态 ≠ 完成）
- 复用 answer / subtask.progress / run.start（run.start 增可选 query，非新事件）

### REST（cookie 鉴权）

- B1 `GET /api/ops/chat/threads`（thread_id/title/last_activity_at/run_count/latest_run_status + cursor/limit）
- B1 `GET /api/ops/chat/threads/{thread_id}/history`（服务端聚合消息视图 query/answer/subtasks/terminal_status/hitl）
- B2 `GET /api/ops/hitl/pending`（id/run_id/thread_id/reason/blocked_by/created_at · 仅本人 owner · 返回 `{items, count}`）
- B2 `POST /api/ops/hitl/requests/{id}/decide`（body {decision: approved|rejected} · 不自动 resume）
- B2 复用 `POST /api/ops/hitl/requests/{id}/resume`（既有 · 零改动）

### 归属 / 状态码

- 跨用户 404（不泄露存在性）· decide 重复 409 · 非 maintainer 403 / 未登录 401

### 上游 task 已钉细节（前端承接口径）

| 项 | 口径（出处） |
|---|---|
| threads 分页 | `cursor`/`limit`，默认 20 · 上限 100 · 超限 422（`task_chat_history_api.md` H1） |
| `latest_run_status` 词表 | `running` / `waiting_approval` / `completed` / `error`（同 H1） |
| history 消息视图 | 每 run = `query` + `answer`（聚合）+ `subtasks` + `terminal_status`（done.status）+ `hitl`（hitl.waiting requests）；run 升序；`cursor`/`limit` 分页（H2） |
| answer 截断 | 单 run answer 超 32000 字符截断并标 `answer_truncated=true`（同 task 验收 · N3） |
| 降级标题 | 老 run 缺 query → 服务端降级 run_id 前缀+时间（FP-4）；前端对空 title 再兜底不崩 |
| pending/decide 语义 | pending 仅本人 owner（裁定 E1）；decide 与 callback 同语义、**两步**（decide 后不自动 resume · 裁定 Q2/D1） |
| replay 续看 | 既有 `POST /api/ops/lg-rag/replay` body `{run_id, after_seq}`（T4 freeze · 已在仓消费） |

---

## 3. 范围（F1/F2 · 钉死）

### F1 · 历史侧栏与续看

| # | 件 | 落点（建议 · 30 可按实微调不改语义） | 动作 |
|---|---|---|---|
| F1-1 | B1 client | `src/api/chatHistory.ts`（新增） | `fetchChatThreads({cursor?, limit?})` / `fetchThreadHistory(threadId, {cursor?, limit?})`；复用 `http.ts`（cookie · 401 拦截）；类型与 §2 字段族逐键对齐 |
| F1-2 | 历史侧栏 UI | `ChatView.vue` 内嵌左栏 / 抽屉组件（`src/components/chat-history/*`） | 会话列表渲染：标题 · 末活动时间 · run 数；`latest_run_status=waiting_approval` 醒目徽标；`cursor` 分页「加载更多」 |
| F1-3 | 历史加载渲染 | chat store 扩展 | 点击 thread → B1 history → 按 run 序渲染进既有消息流结构（query→user 气泡 · answer→assistant 气泡 · subtasks→子任务过程 · terminal_status/hitl→run 末态形态）；`answer_truncated` 显示截断标记 |
| F1-4 | 等待审批 run 续看 | 复用 T4 | 进入 `waiting_approval` thread：该 run 以 active-run 语义挂起展示，用户手动点「续看」走既有 `resumeFromCursor`/`replayLgRag` 路径——**不新造续看机制/端点** |

### F2 · HITL 审批形态

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| F2-1 | `hitl.waiting` 分支 | `chat.ts handleEvent` 新增 case | 帧 → store 审批态（reason + requests[] 提取申请 id）→ 消息流内**醒目审批卡片**：reason · 申请 id · 批准/驳回按钮 |
| F2-2 | B2 client | `src/api/hitl.ts`（新增） | `fetchHitlPending()` / `decideHitlRequest(id, decision)` / `resumeHitlRequest(id)`（复用既有 resume 端点 · 只新增 client 封装）；字段族与 §2 对齐 |
| F2-3 | 审批动作链 | chat store | 批准 → `POST decide {decision:'approved'}` → 成功 → `POST resume`（两步链式 · 契约钉 decide 不自动 resume）；驳回 → decide rejected → resume；动作中按钮 loading 禁重复点击 |
| F2-4 | `done` 按 status 分支（**修现状 bug**） | `chat.ts:621-633` 改造 | `status==='waiting_approval'` → `streaming=false` + **保留待审批视觉** + **不调 `clearActiveRun()`**（续看游标保留 · 审批后接力）；`completed`/`failed`/无 status（旧帧）→ 维持现行（clearActiveRun + 完成/失败呈现） |

---

## 4. 非范围（钉死 · 越任一条即停）

- ❌ 改 `ops-desk-api` 仓任何文件（B1/B2 只读契约承接）
- ❌ 新 SSE 事件类型 / 改 `hitl.waiting`/`done`/`answer`/`subtask.progress`/`run.start` 帧语义 / 改 `useLgRagSse.ts` 传输与解析层行为
- ❌ OA 签名面（`GET /hitl/requests` · `GET /hitl/runtime` · `POST /hitl/callback`）任何触碰
- ❌ 后端端点语义改动（分页/截断/归属/状态码均承上游）
- ❌ 历史删除 / 编辑 / 重命名（只读面）
- ❌ 审批实时推送（WS / 轮询定时器 · 进入即拉取 + 动作后刷新即可）
- ❌ 新造续看机制/端点（一律复用 T4 active-run + `replayLgRag`）
- ❌ chat legacy 面（`POST /api/ops/chat/stream` 410 亡端点）/ 替换 Chat 主路径传输
- ❌ decide 合并 resume 为单端点调用（契约两步 · 前端链式两调用）

---

## 5. 方案对比（R2 · ≥2 案）

### 裁定 F-A · 审批卡片形态

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · 消息流内联审批卡片** | `hitl.waiting` 帧到达时在对应 assistant 消息位渲染醒目卡片（reason + 申请 id + 双按钮）；replay/历史视图复用同一渲染管线天然重现 | **推荐（本帽裁定）**：帧锚定 run · 上下文（问的是什么/卡在哪）就地可见 · live/replay/history 三入口同一形态零分叉 · 与既有 thinking/subtasks 渲染分区一致 |
| S2 · 独立审批面板（侧栏/顶栏列表） | 全局 pending 面板轮询 B2 | 弃选（v1）：与消息流语境割裂；推送/轮询属非范围；`hitl.waiting` 帧本就到达消息流，面板是冗余形态。**留作后续增强**（B2 pending 端点已备好，另立 task） |

### 裁定 F-B · 历史侧栏形态

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · Chat 页内嵌侧栏** | `ChatView` 增左栏/抽屉：列表在侧栏、点击即在原消息流加载历史并续看 | **推荐（本帽裁定）**：历史查看与续看/审批在同一 store 与渲染管线下闭环（F1-4/F2 复用 T4 active-run）；无新路由守卫/新 store 分裂成本；单列 860px 布局做最小增量（侧栏可折叠） |
| S2 · 新路由独立历史页（如 `/chat/history`） | 独立 view + 独立渲染 | 弃选：历史页看消息后仍需跳回 Chat 续看/审批，语境割裂；双份消息渲染管线维护成本高；与「续看复用既有机制」纪律相违 |

### 裁定 F-C · 历史消息渲染

| 方案 | 描述 | 裁决 |
|---|---|---|
| **S1 · history 消息视图映射进既有 `ChatMessage` 结构** | query→user · answer→assistant.content · subtasks→subtasks 列 · terminal_status/hitl→消息末态/审批卡片 | **推荐（本帽裁定）**：复用 `ChatView` 现有气泡/collapse 渲染 · 与 live 帧管线同构（服务端已聚合为消息视图 · 上游 Q6） |
| S2 · 独立历史渲染组件 | 为历史另写一套只读渲染 | 弃选：渲染分叉 · 历史里看到审批卡片却不可操作（或另写可操作版）徒增维护面 |

---

## 6. failure_paths

| # | 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|---|
| FP-F1 | **`waiting_approval` 误当完成态**（现状 bug · `chat.ts:621-633` 不看 `payload.status` 直接 `clearActiveRun()` :631） | `done` 按 status 分支：waiting_approval → 保留待审批视觉 + 保留 active-run；completed/failed/无 status → 维持现行 | n/a | 待审批卡片持续可见 · 不再「假完成」 |
| FP-F2 | decide 重复 / 申请已决 | **409** → 卡片转「该申请已被处理」态 · 不弹错误条 · 刷新审批态 | 否 | 卡片状态文案 |
| FP-F3 | 401 未登录（SSE live/replay · B1/B2 REST） | SSE 沿用既有语义（清 thread_id + active-run + auth · `chat.ts:687-692/797-802`）；REST 走 `http.ts` 401 拦截器 `setUnauthorizedHandler` 跳登录 | 是 | 登录页 |
| FP-F4 | 403 非 maintainer（B2 面） | 审批入口/卡片动作隐藏或降级提示「无审批权限」；**不**以 403 炸错误屏；B1 历史面不受 maintainer 限制 | 否 | 降级文案 |
| FP-F5 | replay 中断（网络/idle 超时/404/422） | 沿用既有：网络错/超时 → 错误条 + 「续看」手动接力（不自动重试）；404/422 → 清 active-run + 中性提示「对话记录不存在或已过期」（`chat.ts:793-822` 语义沿用） | 是（404/422 否） | 错误条 / 中性提示 |
| FP-F6 | history 空态 / 老 run 缺 query 标题降级 | threads 空 → 空态文案「暂无历史会话」；history 空 → 空态文案；title 空 → run_id 前缀+时间兜底（承服务端 FP-4 再兜底） | 是 | 空态 / 降级标题 |
| FP-F7 | decide 成功后用户未 resume / resume 前离开 | 卡片保持「已批准 · 点击续看推进」可再触发（两步语义 Q2）；active-run 保留供接力 | 是 | 卡片提示 |
| FP-F8 | B1/B2 端点未上线（404/501/网络错） | 历史侧栏 / 审批面降级为「历史（审批）服务暂不可用」 · **不阻塞 Chat 主路径**；实现期按契约 mock 先行 | 是 | 降级文案 |
| FP-F9 | 大 thread / answer 截断 | `cursor` 分页「加载更多」拼接不重不漏；`answer_truncated=true` 显示「内容过长已截断」标记 | 是 | 分页 / 截断标记 |
| FP-F10 | 跨用户 / 未知 thread、申请 id（404） | 中性文案「会话不存在或已过期」「申请不存在或已处理」——不区分越权与不存在（归属不泄露 · 上游纪律 #3） | 否 | 中性提示 |
| FP-F11 | `hitl.waiting` 帧缺 requests / 空 requests[] | 卡片降级为仅 reason 展示 + 「审批详情不可用」；不崩、不当完成态 | n/a | 降级卡片 |
| FP-F12 | 30 未签 `HG-AUDIT-R1` 即改码 | **拒开工**（task 阶段核验） | 是 | 须先 20 + 人签 |

---

## 7. 验收标准（全部可机断 · Vitest mock B1/B2 契约）

### F1 · 历史侧栏与续看

- [ ] AC1：mock `GET /api/ops/chat/threads`（契约字段族：`thread_id`/`title`/`last_activity_at`/`run_count`/`latest_run_status` + `cursor`）→ 侧栏渲染列表；`latest_run_status='waiting_approval'` 条目渲染可识别徽标（断言 DOM 存在徽标 class/文案，其余状态不渲染该徽标）
- [ ] AC2：点击条目 → 调 `GET .../{thread_id}/history` → 消息流按 run 序渲染：query→user 气泡 · answer→assistant 气泡 · subtasks→子任务过程列 · `terminal_status='waiting_approval'` 的 run 渲染待审批形态（**非**完成态）
- [ ] AC3：进入含 `waiting_approval` run 的 thread → 续看走既有 `resumeFromCursor`/`replayLgRag`（`{run_id, after_seq}`）路径（mock 断言调用）；**无**新增续看端点/机制（grep 断言无第二条 replay 封装）
- [ ] AC4：threads 空数组 → 空态文案；history 空 → 空态文案；`title` 为空串 → 降级标题（run_id 前缀+时间）渲染不崩
- [ ] AC5：`cursor` 分页两页 mock → 「加载更多」拼接不重不漏（断言 thread_id 序列并集、无重复）
- [ ] AC6：`answer_truncated=true` 的 run → 渲染截断标记

### F2 · HITL 审批形态

- [ ] AC7：store 注入 `hitl.waiting` 帧（payload `{reason, requests:[{id,...}]}`）→ 渲染审批卡片：reason 文本 + 申请 id + 批准/驳回双按钮（现状 default 忽略 → 改后断言卡片存在；store 态断言审批请求入列）
- [ ] AC8：点「批准」→ `POST /api/ops/hitl/requests/{id}/decide` body `{decision:'approved'}` → 成功后 `POST .../resume`（断言调用顺序 decide 先于 resume · 两次调用）；点「驳回」→ `{decision:'rejected'}` → resume；动作中按钮 loading 且禁重复点击
- [ ] AC9：decide 409 → 卡片转「已被处理」态且**不**弹错误条；decide 404 → 中性提示「申请不存在或已处理」；401 → 走全局跳登录处理器；403 → 审批动作隐藏/降级提示
- [ ] AC10：**`done` 按 status 分支（修 bug 钉死）**：`done{status:'waiting_approval'}` → `streaming=false` 且 `activeRun` **保留**（不调 `clearActiveRun`）且待审批视觉在；`done{status:'completed'}` / `{status:'failed'}` / 无 status 旧帧 → `activeRun` 清除、维持现行完成/失败呈现（store 单测逐一分支断言）
- [ ] AC11：SSE 契约零动：grep 断言 `useLgRagSse.ts` 无新事件类型构造、传输/解析层 diff 为空；前端仅消费既有 `hitl.waiting`/`done{status}` 帧

### 通用 / 图谱 / 质量门

- [ ] AC12：mock 字段族与上游 B1/B2 task 逐键对齐（类型定义对照 §2 表 · 不自造字段；未知额外键容忍不依赖）
- [ ] AC13：B1/B2 404（端点未上线）→ 历史/审批面降级文案，Chat 主路径（发送/流式）不受影响
- [ ] AC14：`pnpm lint` → `pnpm test` → `pnpm build` 全绿
- [ ] AC15：G-L1 `docs/_tech_graph/l1/01_modules.md` 增量备注（新 api client / chat-history 组件 / store 扩展）落盘 · `./scripts/graph-compile.sh` exit 0 · `HG-GRAPH-MODULES` 随交付签录

---

## 8. 思考轮回填（R0–R5）

### R0 · 读人聊 / 目标

维护者四裁定原话（上游 SPEC 头部立项令）+ Q4「前端 agent 专项落盘」直接委派本 SPEC；上游 signed SPEC §2 F1/F2 概要、ERRATA（A1）、SPEC R1 审查（PASS-WITH-NITS）、B1/B2 task（三闸 approved · ready）全真读；本仓缺口实证锚点真读（`chat.ts:461/503-521/523-651/768-843` · `useLgRagSse.ts:21-31/107/150-155` · `http.ts:47-78` · `ChatView.vue` 布局）。

### R1 · 范围 / 非范围 / 角色与场景

范围 F1（历史侧栏/加载/续看）+ F2（审批卡片/decide→resume/done 分支修 bug）钉死；非范围九条锁死（api 仓/SSE/OA 面/历史写操作/WS 推送/新造续看/legacy 面/单端点合并）。角色：maintainer（审批者 · B2 面）/ 普通登录用户（看自己历史 · B1 面 · B2 403 降级）/ 未登录（401 跳登录）。场景：live 审批 · 刷新后续看审批 · 历史回看 · 端点未上线降级。

### R2 · 方案对比

裁定 F-A（消息流内联卡片 vs 独立面板 · 荐 S1）· F-B（Chat 页内嵌侧栏 vs 新路由历史页 · 荐 S1）· F-C（映射既有消息结构 vs 独立历史渲染 · 荐 S1）——三裁定均以「复用既有管线 / 不新造机制」纪律为裁决依据（§5）。

### R3 · 边界 / 失败路径 / 安全与依赖

FP-F1~FP-F12；最锋利边界 = FP-F1（`waiting_approval` 误当完成态 · 现状 bug 必修钉死）与 FP-F10（404 中性文案不泄露存在性）；安全面 = 401/403/404 语义承上游；依赖 = B1/B2 端点 ready 未上线 → mock 先行 + FP-F8 运行时降级。

### R4 · 验收 / 可测性

AC1–AC15 全部可 Vitest 机断：client mock 字段族断言 · store 分支断言（activeRun 保留/清除 · 审批态入列）· 组件 DOM 断言（徽标/卡片/空态/降级标题/截断标记）· 调用顺序断言（decide→resume）· grep/diff 契约断言（SSE 零动）；verify `pnpm lint → pnpm test → pnpm build`。

### R5 · SPEC 签收就绪 · 下一棒

开放裁定无遗留（F-A/F-B/F-C 已裁 · 上游 Q1–Q6 全部承接）；建议路径：20-spec-audit 书面审 → 维护者签 HG-SPEC-SIGNOFF → 00 起草 web task（mock 契约先行 · 联调 blocked_by api B1/B2）。

### 思考轮控制

| 轮 | 状态 | 说明 |
|---|---|---|
| R0 | done | 上游 SPEC/ERRATA/审查/B1·B2 task + 本仓码面锚点全真读 |
| R1 | done | 范围 F1/F2 钉死 · 非范围九条 · 角色场景三态 |
| R2 | done | 裁定 F-A/F-B/F-C（各 ≥2 案对比 · 荐案留痕） |
| R3 | done | FP-F1~FP-F12 · 最锋利边界=FP-F1 修 bug + FP-F10 不泄露 |
| R4 | done | AC1–AC15 全可机断 · test_strategy=required |
| R5 | done | 签收就绪 → 20-spec-audit → HG-SPEC-SIGNOFF（人签） |
| early_stop | no | — |

---

## 9. 关联

- 上游 SPEC：`ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（signed）· ERRATA A1 · R1 审查文
- 上游 task：`ops-desk-api/docs/tasks/active/task_chat_history_api.md`（B1 · ready）· `task_hitl_browser_decide.md`（B2 · ready）
- 本仓锚点：`src/stores/chat.ts:461-465/503-521/523-651/768-843` · `src/composables/useLgRagSse.ts:21-31/104-110/150-155` · `src/api/http.ts:17-78` · `src/api/chat.ts` / `src/api/lgRag.ts`（client 先例）· `src/views/ChatView.vue`
- 先例 SPEC：`docs/spec/web-lg-rag-page/SPEC-web-lg-rag-page_v1.md`（命名/结构模板）

---

## 10. 下一棒（可复制 Prompt）

> 你是 Harness 帽 **20-spec-audit**。对本仓 `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（draft · HG-SPEC-SIGNOFF=pending）做 R1 书面审：核对范围 F1/F2、非范围、契约冻结面（照抄上游 §2 逐字一致性）、验收 AC1–AC15 可机断性、failure_paths FP-F1~FP-F12、思考轮 R0–R5 控制；实证抽查本仓锚点（`src/stores/chat.ts` SSE switch 与 done 分支 · `src/composables/useLgRagSse.ts` · `src/api/http.ts`）与上游契约（`ops-desk-api/docs/spec/chat-history-hitl-ux/` + 两个 active task）。结论落盘 `docs/harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_<日期>.md`。**不改 SPEC 实质内容 · 不代签 HG-SPEC-SIGNOFF**。

---

## 修订记录

| 日期 | 版本 | 内容 |
|---|---|---|
| 2026-10-04 | v0 | 10-spec 初稿：承上游 signed SPEC §2 F1/F2 + Q4 裁定专项落盘；契约冻结面照抄；本仓缺口实证锚点（`hitl.waiting` 落 default · `done` 不看 status · clearActiveRun 清场）；裁定 F-A/F-B/F-C；FP-F1~FP-F12；AC1–AC15；R0–R5 回填；HG-SPEC-SIGNOFF=pending 待人签 |
