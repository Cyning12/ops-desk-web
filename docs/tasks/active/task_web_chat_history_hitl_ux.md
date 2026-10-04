# Task：Web · 会话历史 + 中断续看 + HITL 审批面（web-chat-history-hitl-ux）

> **状态**：`active` · **GO merge**（四闸全 **approved** · 2026-10-04 · **00 代录**（维护者令原话授权：「签收，后续文档授权00签收」）· 30+40 交付三绿 · PR #52 CI 绿 · HG-JOINT-DEBUG 联调证据在案）  
> **类型**：feature / 前端观测闭环（渲染既有 SSE 帧 + 承接 B1/B2 REST 契约）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS；**禁止**改 `ops-desk-api` 任何文件  
> **依据 SPEC（signed 2026-10-04）**：[`docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`](../../spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md)（范围 F1/F2 · 契约冻结面 · AC1–AC15 · FP-F1~FP-F12 · 裁定 F-A/F-B/F-C）  
> **审查承接**：[`docs/harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_20261004.md`](../../harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_20261004.md)（**pass** · 零阻塞 · nit N1/N2 **已随本 task 回填闭合**，见验收 AC3/AC11/AC16）  
> **一个 task 覆盖 F1+F2**（同一 store / 页面爆炸半径内 · 内部按 F1/F2 分 scope 小节）  
> **分支**：`task/chat-history-hitl-ux`（已建好 · 勿动 main · 勿切分支）  
> **10 帽**：2026-10-04 · 10-task 拆解（不实现代码 · 不签 HG-AUDIT-R1）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-chat-history-hitl-ux` |
| **invoke_slug** | `web-chat-history-hitl-ux` |
| **git_branch** | `task/chat-history-hitl-ux` |
| **implement_repo** | `ops-desk-web` |
| **spec** | `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed） |
| **orchestration** | 10 拆解 → 20-task-audit R1 → 闸签录 → web 30（**mock 契约先行** 不阻塞）→ 40 自检 → PR + CI 三绿 → 联调（**blocked_by api** B1/B2 端点上线）→ merge → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：B1/B2 API client mock（字段族与上游 task 逐键对齐 · 不自造字段）+ chat store 单测（`done` 按 status 分支 / `hitl.waiting` 卡片态 / 续看复用断言）+ 组件渲染断言（徽标 / 审批卡片 / 空态 / 降级标题 / 截断标记）；端点未上线时按契约 mock + 运行时降级（FP-F8），不阻塞 30；旧测影响面：`tests/chat-store.spec.ts` 现有 done 相关用例注入帧均无 `payload.status`（AC17 清点 10 处 · 预期零回归）；verify 真值 `pnpm lint` → `pnpm test` → `pnpm build` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md`（api / pinia / components 行增量备注）· 必要时 `docs/_tech_graph/l1/10_flow_chat.md` 补注 |
| **graph_delta_note** | `api` 行备注新增 `chatHistory`/`hitl` client；`pinia` 行备注 chat store 扩展（hitl.waiting 分支 / done 按 status / 历史加载）；`components` 行若新建 `src/components/chat-history/` 则补路径（现状 `src/components/` 不存在 · 侧栏可内嵌 `ChatView.vue`）；不新增一级模块；`HG-GRAPH-MODULES` 随 30 交付签录 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：`waiting_approval ≠ 完成态`（done 按 status 分支）+ decide→resume 两步链 + 真值指针（SPEC §2/§6/§7）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**：SSE 零新事件类型 · `hitl.waiting`/`done{status}`/`run.start`+可选 `query` 均在 freeze 内 · 传输/解析层零改动） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-04 · 00 代录（维护者令原话授权：「签收，后续文档授权00签收」· SPEC 人工闸表 2026-10-04 在案）；R1 fail→10 回填→R2 pass 后签录 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-04 · 00 代录（同上授权）；20-task-audit R2 **pass** 零阻塞（审查文 `docs/harness/reviews/task_web_chat_history_hitl_ux_audit_R2_20261004.md`；R1 阻塞 B1/B2 已闭合：AC17 旧测影响面 + AC3 断言形态）· 30 可开工 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-04 · 00 代录（维护者授权同 HG-TASK-DRAFT）；图谱真值 `docs/_tech_graph/l1/01_modules.md` 在仓 · G-L1 增量（api/pinia/components 行）随 30 交付落盘并由 AC15 勾验（增量未落盘则 AC15 不勾 · 不勾验即不交付） |
| HG-JOINT-DEBUG | **approved** | **merge** | 2026-10-04 · 00 代录（维护者授权同 HG-TASK-DRAFT）；api B1/B2 已 merge（ops-desk-api PR #204）· 联调证据链落盘 `docs/harness/invokes/by-task/web-chat-history-hitl-ux/invoke_20261004_jointdebug_web-chat-history-hitl-ux.md`：B1/B2 活端点与 web client 逐键对拍零漂移 · 401/403/404/409/422 失败面全过 · vite 代理逐字节 MATCH；留痕：SSE 挂起帧→resume 正推进活链未复现（LLM 触发不确定 · api pytest + web Vitest 两侧覆盖在案）· 观察 O1/O2/O3 移交 api 仓另棒 |

---

## 背景与目标

D2 观察期本地冒烟（run `09b639f7`）暴露：用户 run 挂 `waiting_approval`，前端「没有最终回答」也零待审批表现；刷新后中断对话消失；无历史会话可看。上游 signed SPEC 已裁定：历史真源=事件表、恢复复用 resume、**SSE 零新事件仅前端渲染既有帧**、前端 F1/F2 专项 SPEC 另立——本 task 即该专项 SPEC 的实现拆解。

### 现状实证（10 帽真读 · file:line 锚点 · 与 SPEC/审查文对拍一致）

| 缺口 | 真态（本仓实测） |
|---|---|
| `hitl.waiting` 帧被吞 | `src/stores/chat.ts:523-651` `handleEvent` switch 仅六分支（run.start:525 / node.progress:537 / subtask.progress:544 / answer:604 / done:621 / error:634），**无 `hitl.waiting` 分支** → 落 `default`(:647-650) 静默忽略 |
| `waiting_approval` 误当完成态（**现状 bug**） | `case 'done'`（`chat.ts:621-633`）**不看 `payload.status`**：无条件 `streaming=false`(:628) + `clearActiveRun()`(:631) 清场 → 挂起 run 呈现「已完成」且续看游标被清 |
| T4 注释与新语义冲突（SPEC 建议②） | `chat.ts:308`「run 终态（done/error/abort）即清除」与 `chat.ts:631` 行内注释「T4：run 终态即清除 active-run」——done 改按 status 分支后 **waiting_approval 不再清除**，两处注释须同步更正 |
| 续看机制已在仓（可复用 · 不新造） | `processFrame` 每帧持久化游标（`chat.ts:503-521`）· `clearActiveRun`（:461-465）· `resumeFromCursor`（:768-843 · `replayLgRag` `useLgRagSse.ts:150-155` · `LG_RAG_REPLAY_PATH` :107）· `extractFrameCursor`（:476-495） |
| SSE 传输层零改动即可过帧 | `LgRagSseEvent.event_type: string`（`useLgRagSse.ts:21-31`）· 帧解析器按 `event_type` 透传（:81-101） |
| 无 B1/B2 client | `src/api/` 现有十 client；axios 封装 `http.ts:47-51`（baseURL `/api` · `withCredentials`）+ 401 拦截 `setUnauthorizedHandler`（:62-78） |
| Chat 页单列布局 · 无 `src/components/` | `src/views/ChatView.vue` 单列消息流（max-width 860px）+ 提示条/错误条/续看按钮（:88-213）；仓内**尚无** `src/components/` 目录，侧栏落点见 F1-2 注 |

### 一句话目标

渲染既有 SSE 帧（`hitl.waiting` → 醒目审批卡片；`done` 按 `status` 分支修 `waiting_approval` 误当完成态 bug）+ 承接 B1/B2 REST 契约（历史侧栏 + 浏览器审批决策面），续看复用既有 T4 active-run/replay 机制——**SSE 传输/解析零改动、零新事件类型、api 仓零触碰**。

---

## 范围（钉死 · 照 SPEC §3 F1/F2）

### F1 · 历史侧栏与续看

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| F1-1 | B1 client | `src/api/chatHistory.ts`（**新增**） | `fetchChatThreads({cursor?, limit?})` / `fetchThreadHistory(threadId, {cursor?, limit?})`；复用 `http.ts`（cookie · 401 拦截）；类型与 SPEC §2 字段族逐键对齐（thread_id/title/last_activity_at/run_count/latest_run_status + cursor；history 消息视图 query/answer/subtasks/terminal_status/hitl + answer_truncated） |
| F1-2 | 历史侧栏 UI | `ChatView.vue` 内嵌左栏/抽屉（裁定 F-B · 不新开路由）；组件可内嵌 ChatView 或新建 `src/components/chat-history/`（仓内现无该目录 · 新建则图谱 components 行补注） | 会话列表：标题 · 末活动时间 · run 数；`latest_run_status=waiting_approval` 醒目徽标；`cursor` 分页「加载更多」；空态文案；title 空 → run_id 前缀+时间兜底 |
| F1-3 | 历史加载渲染 | chat store 扩展 | 点击 thread → B1 history → 按 run 序映射进既有 `ChatMessage` 结构（裁定 F-C：query→user 气泡 · answer→assistant 气泡 · subtasks→子任务过程 · terminal_status/hitl→run 末态/审批卡片）；`answer_truncated` 显示截断标记 |
| F1-4 | 等待审批 run 续看 | 复用 T4 | 进入 `waiting_approval` thread：该 run 以 active-run 语义挂起展示，手动「续看」走既有 `resumeFromCursor`/`replayLgRag`（`{run_id, after_seq}`）——**不新造续看机制/端点** |

### F2 · HITL 审批形态

| # | 件 | 落点 | 动作 |
|---|---|---|---|
| F2-1 | `hitl.waiting` 分支 | `chat.ts handleEvent` 新增 case | 帧 → store 审批态（reason + requests[] 提取申请 id）→ 消息流内**醒目审批卡片**（裁定 F-A）：reason · 申请 id · 批准/驳回按钮 |
| F2-2 | B2 client | `src/api/hitl.ts`（**新增**） | `fetchHitlPending()` / `decideHitlRequest(id, decision)` / `resumeHitlRequest(id)`（复用既有 resume 端点 · 只新增 client 封装）；字段族与 SPEC §2 对齐 |
| F2-3 | 审批动作链 | chat store | 批准 → `POST decide {decision:'approved'}` → 成功 → `POST resume`（两步链式 · 契约钉 decide 不自动 resume）；驳回 → decide rejected → resume；动作中按钮 loading 禁重复点击 |
| F2-4 | `done` 按 status 分支（**修现状 bug**） | `chat.ts:621-633` 改造 | `status==='waiting_approval'` → `streaming=false` + flush + **保留待审批视觉** + **不调 `clearActiveRun()`**（续看游标保留 · 审批后接力）；`completed`/`failed`/无 status（旧帧）→ 维持现行（clearActiveRun + 完成/失败呈现）；**同步更正 `chat.ts:308` / `:631` 周边 T4 注释**（SPEC 建议②） |

### 非范围（照 SPEC §4 钉死 · 越任一条即停）

- ❌ 改 `ops-desk-api` 仓任何文件（B1/B2 只读契约承接）
- ❌ 新 SSE 事件类型 / 改 `hitl.waiting`/`done`/`answer`/`subtask.progress`/`run.start` 帧语义 / 改 `useLgRagSse.ts` 传输与解析层行为
- ❌ OA 签名面（`GET /hitl/requests` · `GET /hitl/runtime` · `POST /hitl/callback`）任何触碰
- ❌ 后端端点语义改动（分页/截断/归属/状态码均承上游）
- ❌ 历史删除 / 编辑 / 重命名（只读面）
- ❌ 审批实时推送（WS / 轮询定时器 · 进入即拉取 + 动作后刷新即可）
- ❌ 新造续看机制/端点（一律复用 T4 active-run + `replayLgRag`）
- ❌ chat legacy 面（`POST /api/ops/chat/stream` 410 亡端点）/ 替换 Chat 主路径传输
- ❌ decide 合并 resume 为单端点调用（契约两步 · 前端链式两调用）
- ❌ 全局 pending 面板（SPEC 裁定 F-A S2 弃选 · 留作后续增强另立 task）

---

## failure_paths（映射 SPEC §6 FP-F1~FP-F12 → 实现层处置）

| # | 触发 | 实现层处置（落点） | 可重试 | 用户可见 |
|---|---|---|---|---|
| FP-F1 | `waiting_approval` 误当完成态（现状 bug · `chat.ts:621-633`） | `done` 按 status 分支（F2-4）：waiting_approval → 保留待审批视觉 + 保留 active-run；其余维持现行 | n/a | 待审批卡片持续可见 · 不再「假完成」 |
| FP-F2 | decide 重复 / 申请已决（409） | store 动作链捕 409 → 卡片转「该申请已被处理」态 · **不**弹错误条 · 调 `fetchHitlPending()` 刷新审批态（N1 消费点①） | 否 | 卡片状态文案 |
| FP-F3 | 401 未登录（SSE live/replay · B1/B2 REST） | SSE 沿用既有（`chat.ts:687-692/797-802`）；REST 走 `http.ts` 401 拦截器跳登录 | 是 | 登录页 |
| FP-F4 | 403 非 maintainer（B2 面） | 审批卡片动作/`fetchHitlPending` 403 → 动作隐藏或降级呈现「无审批权限」提示（不炸屏 · 与 AC16 ② 同口径）；**不**以 403 炸错误屏；B1 历史面不受影响 | 否 | 降级文案 |
| FP-F5 | replay 中断（网络/idle 超时/404/422） | 沿用既有 `resumeFromCursor` 语义（`chat.ts:793-822`）：网络错/超时 → 错误条 + 「续看」手动接力；404/422 → 清 active-run + 中性提示 | 是（404/422 否） | 错误条 / 中性提示 |
| FP-F6 | history 空态 / 老 run 缺 query 标题降级 | threads 空 → 「暂无历史会话」；history 空 → 空态文案；title 空 → run_id 前缀+时间兜底不崩 | 是 | 空态 / 降级标题 |
| FP-F7 | decide 成功后未 resume / resume 前离开 | 卡片保持「已批准 · 点击续看推进」可再触发（两步语义）；active-run 保留供接力 | 是 | 卡片提示 |
| FP-F8 | B1/B2 端点未上线（404/501/网络错） | 历史侧栏 / 审批面降级「历史（审批）服务暂不可用」· **不阻塞 Chat 主路径**；实现期按契约 mock 先行 | 是 | 降级文案 |
| FP-F9 | 大 thread / answer 截断 | `cursor` 分页「加载更多」拼接不重不漏；`answer_truncated=true` 显示「内容过长已截断」标记 | 是 | 分页 / 截断标记 |
| FP-F10 | 跨用户 / 未知 thread、申请 id（404） | 中性文案「会话不存在或已过期」「申请不存在或已处理」——不区分越权与不存在（归属不泄露） | 否 | 中性提示 |
| FP-F11 | `hitl.waiting` 帧缺 requests / 空 requests[] | 卡片降级为仅 reason 展示 + 「审批详情不可用」；不崩、不当完成态 | n/a | 降级卡片 |
| FP-F12 | 30 未签 `HG-AUDIT-R1` 即改码 | **拒开工**（GATE_VERIFY 以本表真值为准） | 是 | 须先 20 + 人签 |

---

## 验收标准

> 映射 SPEC §7 AC1–AC15 · nit N1/N2 回填钉死 · 全可机断

**F1 · 历史侧栏与续看**

- [x] AC1：mock `GET /api/ops/chat/threads`（契约字段族）→ 侧栏渲染列表；`latest_run_status='waiting_approval'` 条目渲染可识别徽标（断言 DOM 徽标 class/文案存在，其余状态不渲染该徽标）
- [x] AC2：点击条目 → 调 `GET .../{thread_id}/history` → 消息流按 run 序渲染：query→user 气泡 · answer→assistant 气泡 · subtasks→子任务过程列 · `terminal_status='waiting_approval'` 的 run 渲染待审批形态（**非**完成态）
- [x] AC3（**N2 回填 · 断言形态钉死 · 20-task-audit R1 B2 已修形态**）：进入含 `waiting_approval` run 的 thread → 续看走既有 `resumeFromCursor`/`replayLgRag`（`{run_id, after_seq}`）路径（mock 断言调用）；**无**新增续看端点/机制——grep/计数断言：`grep -rln "replayLgRag" src/ | wc -l` 仍为 `2`（仅 `useLgRagSse.ts` 定义 + `chat.ts` 消费）· `grep -rn "import.*replayLgRag" src/ | wc -l` = `1`（仅 `chat.ts` 单点 import · replay 封装仍唯一 `useLgRagSse.ts` · 无第二封装/第二消费点）；**基线注记**：`src/stores/chat.ts:764` 既有 T4 文档注释含 `lg-rag/replay` 字面（实现期不增删 · 10-task 真读确认），属既有基线、不计入封装清点——故不采用 `grep "lg-rag/replay"` 字面计数形态（现状即为 1 · 会假红）
- [x] AC4：threads 空数组 → 空态文案；history 空 → 空态文案；`title` 为空串 → 降级标题（run_id 前缀+时间）渲染不崩
- [x] AC5：`cursor` 分页两页 mock → 「加载更多」拼接不重不漏（断言 thread_id 序列并集、无重复）
- [x] AC6：`answer_truncated=true` 的 run → 渲染截断标记

**F2 · HITL 审批形态**

- [x] AC7：store 注入 `hitl.waiting` 帧（payload `{reason, requests:[{id,...}]}`）→ 渲染审批卡片：reason 文本 + 申请 id + 批准/驳回双按钮（现状 default 忽略 → 改后断言卡片存在；store 态断言审批请求入列）
- [x] AC8：点「批准」→ `POST .../decide` body `{decision:'approved'}` → 成功后 `POST .../resume`（断言调用顺序 decide 先于 resume · 两次调用）；点「驳回」→ `{decision:'rejected'}` → resume；动作中按钮 loading 且禁重复点击
- [x] AC9：decide 409 → 卡片转「已被处理」态且**不**弹错误条；decide 404 → 中性提示「申请不存在或已处理」；401 → 走全局跳登录处理器；403 → 审批动作隐藏/降级提示
- [x] AC10：**`done` 按 status 分支（修 bug 钉死）**：`done{status:'waiting_approval'}` → `streaming=false` 且 `activeRun` **保留**（不调 `clearActiveRun`）且待审批视觉在；`done{status:'completed'}` / `{status:'failed'}` / 无 status 旧帧 → `activeRun` 清除、维持现行完成/失败呈现（store 单测逐一分支断言）
- [x] AC11（**N2 回填 · 断言形态钉死**）：SSE 契约零动——diff 空断言：`git diff $(git merge-base main HEAD)...HEAD -- src/composables/useLgRagSse.ts` 输出为空；grep 断言：`grep -n "hitl" src/composables/useLgRagSse.ts` 无命中（事件分支仅落 store 层 · 前端只消费既有 `hitl.waiting`/`done{status}` 帧）
- [x] AC16（**N1 回填 · `fetchHitlPending()` 消费点钉死**）：① decide/resume 动作链完成后调 `fetchHitlPending()` 刷新审批态（FP-F2）；② 进入含 `waiting_approval` run 的 thread 时一次性拉取核对（**不轮询** · 403/404 不炸屏 · 降级呈现——与 FP-F4 同口径）；Vitest 断言两消费点调用；grep 断言 hitl 面无 `setInterval` 新增（非范围：轮询定时器 / 全局面板）
- [x] AC17（**20-task-audit R1 B1 回填 · 旧测 grep 影响面清点**）：F2-4 改 `done` 终态语义属行为变更，验收显式清点既有 done 帧断言面（`tests/chat-store.spec.ts` · 10-task 真读枚举 10 处）：`:112-119`（live done → `streaming=false` · `lastDone` · `error=null`）· `:386`（done 后续问 `threadId` 幂等沿用）· `:440-449`（done 后 `startNewSession` 清场）· `:589-593`（live done → `activeRun` 与 localStorage 清除）· `:647-654`（replay done → `activeRun` 清除 · `streaming=false` · `resumeHint=null`）· `:803-806`（replay done → `activeRun` 清除）· `:890-891`（终帧替换后 done → `streaming=false`）· `:928-931`（done 后迟到 answer 帧忽略）· `:977-978`（降级整段后 done → `streaming=false`）· `:1003-1008`（replay done → `activeRun` 清除 · `streaming=false`）——**上述注入 done 帧均无 `payload.status`**，与 AC10「无 status 旧帧 → 维持现行（clearActiveRun）」相容 · subset 安全；断言：**现有 done 相关用例零改动全绿**（注入帧无 status 走现行分支）；若 30 确需改任一旧测，须逐条在 30 invoke 留痕理由（供 40/20 回归对拍）

**通用 / 图谱 / 质量门**

- [x] AC12：mock 字段族与上游 B1/B2 task 逐键对齐（类型定义对照 SPEC §2 表 · 不自造字段；未知额外键容忍不依赖）
- [x] AC13：B1/B2 404（端点未上线）→ 历史/审批面降级文案，Chat 主路径（发送/流式）不受影响
- [x] AC14：`pnpm lint` → `pnpm test` → `pnpm build` 全绿
- [x] AC15：G-L1 `docs/_tech_graph/l1/01_modules.md` 增量备注（api/pinia/components 行）落盘 · `./scripts/graph-compile.sh` exit 0 · `HG-GRAPH-MODULES` 随交付签录
- [x] 闸：`HG-TASK-DRAFT` · `HG-AUDIT-R1` approved 后 30 才开工；`HG-JOINT-DEBUG`（api 端点上线后联调）approved 后才 merge/CLOSE（四闸全 approved 2026-10-04 · 00 代录）
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` PASS

---

## 依赖

| 依赖 | 说明 |
|---|---|
| SPEC（signed） | `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（HG-SPEC-SIGNOFF=approved 2026-10-04） |
| SPEC R1 审查 | `docs/harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_20261004.md`（pass · nit N1/N2 本 task 已回填） |
| 上游契约（只读 · 禁改） | `../ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（signed）· ERRATA A1（`run.start` 可选 `query` 键 · 前端容忍缺失） |
| 上游 task（只读 · ready · 30 进行中） | `../ops-desk-api/docs/tasks/active/task_chat_history_api.md`（B1：threads/history 字段族 · 分页默认 20 上限 100 超限 422 · `latest_run_status` 四词表 · answer 截断 32000 + `answer_truncated` · 降级标题）· `../ops-desk-api/docs/tasks/active/task_hitl_browser_decide.md`（B2：pending `{items,count}` 仅本人 owner · decide 两步不自动 resume · 重复 409 · 跨用户 404 · 非 maintainer 403） |
| 本仓锚点 | `src/stores/chat.ts:308/461-465/476-495/503-521/523-651/621-633/687-692/768-843` · `src/composables/useLgRagSse.ts:21-31/81-101/107/150-155` · `src/api/http.ts:47-78` · `src/views/ChatView.vue:88-213` |
| 联调 | 后端 B1/B2 **ready**（三闸 approved 2026-09-30）· 端点实现进行中 → web 30 **mock 契约先行**不阻塞；联调 **blocked_by api** 端点上线（FP-F8 运行时降级兜底 · 未联调不假 CLOSE） |
| 标准 | `docs/standards/CODING_FRONTEND_L2_v1_zh.md`（L2_frontend）· `docs/_tech_graph/l1/01_modules.md` |

---

## 30 实现要点提示（供下一棒 · 建议非钉死 · 语义以范围表为准）

1. **`hitl.waiting` 新分支**：`chat.ts handleEvent` 增 `case 'hitl.waiting'` → 提取 `payload.reason` + `requests[]`（申请 id）→ store 审批态 → 消息流内联审批卡片（reason + 申请 id + 批准/驳回 → decide → resume）；replay/历史视图复用同一渲染管线天然重现（裁定 F-A/F-C）。
2. **`done` 按 `payload.status` 分支**：`waiting_approval` → 不清场（不调 `clearActiveRun`）· 保持待审批视觉 · `streaming=false`；`completed`/`failed`/无 status → 维持现行。
3. **同步更正注释（SPEC 建议②）**：`chat.ts:308`（「run 终态（done/error/abort）即清除」）与 `:631` 行内注释（「T4：run 终态即清除 active-run」）随 F2-4 改造改写为「done 按 status 分支：waiting_approval 保留 active-run 供审批后接力」。
4. **B1 client**：`src/api/chatHistory.ts` 新增 `fetchChatThreads`/`fetchThreadHistory`，复用 `http.ts`（cookie · 401 拦截 · normalizeError）。
5. **B2 client**：`src/api/hitl.ts` 新增 `fetchHitlPending`/`decideHitlRequest`/`resumeHitlRequest`（resume 端点既有 · 只封装）。
6. **历史侧栏内嵌 ChatView（裁定 F-B）**：左栏/抽屉可折叠，单列 860px 布局最小增量；仓内现无 `src/components/`——组件内嵌 `ChatView.vue` 或新建 `src/components/chat-history/`（新建须图谱 components 行补注）。
7. **动作链防重**：decide→resume 链式两调用；动作中按钮 loading 禁重复点击；decide 成功后卡片保持「已批准 · 点击续看推进」（FP-F7）。
8. **分态处理**：409 卡片态不弹错误条 · 404 中性文案 · 401 全局跳登录 · 403 动作隐藏/降级 · B1/B2 404/501 → FP-F8 降级不阻塞主路径。
9. **测试落点（建议）**：`tests/chat-history-api.spec.ts` · `tests/hitl-api.spec.ts` · `tests/chat-store.spec.ts` 扩展（done 分支 / hitl.waiting / 续看复用）· ChatView 组件断言（徽标/卡片/空态/截断标记）。
10. **图谱**：`01_modules.md` api/pinia/components 行增量 + `./scripts/graph-compile.sh` 绿 + `HG-GRAPH-MODULES` 签录。

---

## 给执行帽的必读列表

1. `AGENTS.md`（新会话启动纪律 · GATE_VERIFY）
2. 本 task（含人工闸表 · failure_paths · N1/N2 回填）
3. SPEC `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（§2 契约冻结面 · §4 非范围 · §5 裁定 · §6 FP · §7 AC）
4. 上游只读契约：`../ops-desk-api/docs/tasks/active/task_chat_history_api.md` · `task_hitl_browser_decide.md`（字段族逐键对齐）
5. 本仓锚点：`src/stores/chat.ts` · `src/composables/useLgRagSse.ts` · `src/api/http.ts` · `src/views/ChatView.vue`
6. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | SPEC signed + R1 审查（pass · N1/N2）+ 上游 B1/B2 task + 本仓锚点全真读 | no | — | none |
| R1 | 一个 task 覆盖 F1+F2（同一 store/页面爆炸半径）· 非范围十条钉死 | no | — | none |
| R2 | 沿用 SPEC 裁定 F-A/F-B/F-C 不重开；N1 消费点裁定=动作后刷新 + 进入核对（不轮询） | no | — | none |
| R3 | FP-F1~FP-F12 映射实现层处置；最锋利=FP-F1 修 bug + FP-F10 不泄露 + FP-F8 降级 | no | — | none |
| R4 | AC1–AC16 全可 Vitest 机断；N2 grep/diff 断言形态钉死（import 计数 / diff 空断言） | no | — | none |
| R5 | 可交 20-task-audit R1；闸先置 pending 走流程（维护者已授权 00 签收） | no | — | api 端点未上线时联调阻塞 merge（mock 先行不阻塞 30 · HG-JOINT-DEBUG 兜底不假 CLOSE） |

**actual_last_round**：R5 · **early_stop**：no · **residual_risks**：见 R5

### R0 · 读人聊 / 真读

维护者令（SPEC 头部：「签收，后续文档授权00签收，若spec内容未完成继续进行新task」）+ 00 委派 10-task；SPEC signed 全文、R1 审查文（pass · nit N1/N2）、上游 B1/B2 task（三闸 approved · ready）全真读；本仓缺口锚点真读对拍（`chat.ts:308/461/476-495/503-521/523-651/621-633/687-692/768-843` · `useLgRagSse.ts:21-31/81-101/107/150-155` · `http.ts:47-78` · `ChatView.vue:88-213`），并实测 `src/components/` 目录不存在（F1-2 落点备选已注）。

### R1 · 范围 / 非范围

维护者明令一个 task 覆盖 F1+F2（同一 store/页面爆炸半径内 · 内部按 F1/F2 分 scope 小节）；非范围照 SPEC §4 九条 + 全局面板弃选（裁定 F-A S2）共十条钉死。

### R2 · 方案与 N1 裁定

SPEC 已裁 F-A（内联卡片）/F-B（内嵌侧栏）/F-C（映射既有结构），10-task 不重开方案对比、直接承接。N1 回填裁定：`fetchHitlPending()` 消费点 = ① decide/resume 动作后刷新审批态（FP-F2）② 进入 waiting_approval thread 一次性核对——不轮询、非全局面板，落在契约冻结面内。

### R3 · 失败路径

FP-F1~FP-F12 全量映射实现层处置（见表）；最锋利边界 = FP-F1（现状 bug 必修）+ FP-F10（404 中性不泄露）+ FP-F8（端点未上线降级不阻塞主路径）。

### R4 · 验收可测性

AC1–AC15 照 SPEC 映射 + AC16（N1）+ AC17（R1-B1 旧测 grep 影响面清点）；N2 回填钉死 AC3/AC11 断言形态：AC3 = replayLgRag 文件计数仍 2 + `import.*replayLgRag` 计数=1（`chat.ts:764` 注释为既有基线不计 · R1-B2 修形态）；AC11 = `useLgRagSse.ts` 对 merge-base diff 空断言 + 文件内无 `hitl` 字面。verify 真值 `pnpm lint` → `pnpm test` → `pnpm build`。

### R5 · 交付判定

范围/非范围/验收/FP/依赖/图谱/wiki/闸表/思考轮齐备，可交 20-task-audit R1。闸先置 pending 走流程（维护者已授权 00 签收，SPEC 人工闸表在案）；残余风险 = api B1/B2 端点未上线 → 联调阻塞 merge，mock 先行 + FP-F8 + HG-JOINT-DEBUG 兜底。

### 自检结论

| 检查 | 结果 |
|---|---|
| `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` | **PASS**（2026-10-04 本帽实跑） |
| 结论 | **10 拆解完成 · F1+F2 单 task · N1/N2 已回填 · NO-GO 30（闸 pending 走流程）** |

### 自检结论（执行者 · 30/40 · 2026-10-04）

| 检查 | 结果 |
|---|---|
| GATE_VERIFY（`npx spec-wave verify --target . --task <本 task>`） | **PASS**（HG-TASK-DRAFT/HG-AUDIT-R1/HG-GRAPH-MODULES 均 approved · 开工前实跑） |
| `pnpm lint` | **绿**（exit 0 · 实跑） |
| `pnpm test` | **绿**（28 文件 · **225** 用例全过 · 新增 46 条 · 旧测零改动 · AC17） |
| `pnpm build` | **绿**（vue-tsc --noEmit + vite build · 实跑） |
| AC3 grep 断言 | `grep -rln "replayLgRag" src/` = **2** · `grep -rn "import.*replayLgRag" src/` = **1**（实跑） |
| AC11 diff/grep 断言 | `git diff $(git merge-base main HEAD)...HEAD -- src/composables/useLgRagSse.ts` = **空** · `grep -n "hitl" src/composables/useLgRagSse.ts` = **无命中**（实跑） |
| AC16 grep 断言 | hitl 面（api/hitl.ts · api/chatHistory.ts · stores/chat.ts · components/）**无 `setInterval` 新增**（实跑） |
| `./scripts/graph-compile.sh` | **exit 0**（01_modules.md api/pinia/components 行增量 + 10_flow_chat.graph.yaml 补注 · AC15） |
| 验收勾选 | AC1–AC17 全勾（机断证据见 invoke `docs/harness/invokes/by-task/web-chat-history-hitl-ux/invoke_20261004_30_web-chat-history-hitl-ux.md`）；闸行 HG-JOINT-DEBUG 半句未勾（blocked_by api · mock 先行不假 CLOSE） |
| 结论 | **30 实现完成 · F1/F2 交付 · 三绿 · 40 自检同上下文闭环通过** |

---

## 下一棒（可复制 Prompt）

> 你是 Harness 帽 **20-task-audit**。对本仓 `docs/tasks/active/task_web_chat_history_hitl_ux.md`（draft · 闸 pending）做 R1 书面审：对照 signed SPEC `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md` 核对范围 F1/F2、非范围、验收 AC1–AC16（含 N1/N2 回填断言形态）、failure_paths FP-F1~FP-F12、依赖与思考轮 R0–R5；实证抽查本仓锚点（`src/stores/chat.ts` · `src/composables/useLgRagSse.ts` · `src/api/http.ts` · `src/views/ChatView.vue`）。结论落盘 `docs/harness/reviews/task_web_chat_history_hitl_ux_audit_R1_<日期>.md`。**不改 task 实质内容 · 不代签人工闸**。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-04 | 10-task 拆解：一个 task 覆盖 F1+F2；验收映射 SPEC AC1–AC15 + N1（AC16 · fetchHitlPending 消费点钉死）+ N2（AC3/AC11 grep/diff 断言形态钉死）回填；FP-F1~FP-F12 映射实现层处置；wiki_delta=`docs/coding_wiki/volatile.md`；图谱 G-L1 增量义务；闸表 HG-TASK-DRAFT/HG-AUDIT-R1/HG-GRAPH-MODULES=pending（维护者已授权 00 签收 · 走流程）；30 实现要点提示 10 条；`task lint` PASS |
| 2026-10-04 | 10-task 修订回填（承接 20-task-audit R1 **fail** · 2 阻塞闭合）：**B1** 新增 AC17「旧测 grep 影响面」验收项（`tests/chat-store.spec.ts` done 帧断言 10 处真读枚举 · 注入帧均无 `payload.status` 与 AC10 无 status 分支相容 · 零改动全绿断言 · 改旧测须逐条 30 invoke 留痕）；**B2** 修 AC3 第二条 grep 断言形态（改钉 `grep -rn "import.*replayLgRag" src/ \| wc -l` = 1 · 注明 `chat.ts:764` 既有注释为基线不计 · 原字面计数形态现状即 1 会假红）；**nit a** 统一 AC16 ② 与 FP-F4 降级口径（不炸屏 · 降级呈现）；test_strategy_note / R4 描述同步；`task lint` PASS；人工闸表四闸维持 pending（未代签）· 下一棒 20-task-audit R2 |
