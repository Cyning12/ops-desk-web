# task_web_hitl_approval_overlay_ux 审查（R3 · 20-task-audit · v0.3 增量复审）

> **审查对象**：`docs/tasks/active/task_web_hitl_approval_overlay_ux.md`（draft · bugfix+前端交互重构 · **v0.3** · 226 行 · 维护者 R2 后追加两需求 m00231 回填版）
> **审查帽**：20-task-audit（书面审查 · **未改 task 任何内容** · **未改 src/** · **未代签**任何闸 · 未切分支 · 未 commit）
> **日期**：2026-10-28 · **仓态**：cwd=`ops-desk-web` · 分支仍 `task/web-hitl-resume-chase-ux`（git 亲核 · src/ 零改动 · task 文与 R1/R2 审查文 ?? 未 commit · 符合「30 开工才切」纪律）
> **审查基准**：R2 审查文 `docs/harness/reviews/task_web_hitl_approval_overlay_ux_audit_R2_20261028.md`（结论：通过）→ 本轮仅审 **v0.3 增量**（§一第 4 条 · §二新增三行钉案 + 旧测扩扫 · 范围④⑤ · 非范围补三项 · D11–D14 · 验收 8–10 · failure_paths 补两行 · R4/R5 思考轮 · graph_delta 重评估 · 修订记录 v0.3），**不重开 v0.2 已通过项**
> **本审查动作**：落盘本审查文；`required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制，不落；**HG-AUDIT-R1 仍 pending → 禁止附 30 Prompt**；本帽**不代签**

---

## 结论摘要

**结论：通过 + NIT×1**（v0.3 增量七项复审要点全数亲读/亲跑实证落位属实 · 零内容阻塞 · NIT 为锚点行号精度 · 非阻塞）。

| 维度 | 结论 |
|------|------|
| ① 新实证钉案抽验（恢复路径零加载 / 截断点 / 会话列表 API 在仓） | ✅ 三行钉案全部逐字属实（核对项 1） |
| ② D11–D14 封闭度 | ✅ 四定夺封闭、可验收、正交性声明齐备（核对项 2） |
| ③ 旧测影响面 v0.3 扩扫复核（独立重读 tests/） | ✅ 清单无遗漏 · 命中/存续预判与实测一致（核对项 3） |
| ④ failure_paths 新两行 × D11/D14 对应性 + httpErrorI18n 映射面 | ✅ 对应齐备；映射在仓（锚点精度见 NIT-1） |
| ⑤ 思考轮记法（R3 时点标注 · R4/R5 启用 · actual_last_round=R5 · 修订升序） | ✅ 合规（核对项 5） |
| ⑥ graph_delta 重评估（01_modules.md:16 chat-history 在册 · 零新增） | ✅ 属实（核对项 6） |
| ⑦ 机械闸复跑 | `npx spec-wave task lint` → **LINT: PASS · EXIT=0**（W3 占位符 draft 期合法）；`npx spec-wave verify` → **VERIFY: BLOCKED · EXIT=2**（HG-AUDIT-R1/HG-GRAPH-MODULES pending · **符合预期** · 闸态未被动过）（核对项 7） |
| 流程闸 | HG-TASK-DRAFT=approved ✅；HG-AUDIT-R1=**pending**（v0.3 注记「须增量复审后再签」→ 本轮复审通过，待维护者亲签 · 本帽不代签）；HG-GRAPH-MODULES=pending（v0.3 重评估结论存续 · 见核对项 6） |
| 下一棒 | **维护者签 HG-AUDIT-R1 → 30**（签闸清单见文末；30 以 task 表为真值） |

---

## 核对项（v0.3 增量 · 全部亲读/亲跑实证 · 2026-10-28）

### 1. 新实证钉案抽验 ✅（§二新增三行 · task:73-75 逐锚亲读）

| task 钉案 | 亲读结果 |
|---|---|
| 恢复路径零历史加载：`ChatView.vue:21-25` onMounted → `chat.ts:541-553` loadLatestSession → `api/chat.ts:20-23` fetchLatestSession | ✅ `ChatView.vue:21-25` onMounted 仅 `loadLatestSession()` + `refreshHitlPending()`；`chat.ts:541-553` 函数体仅 `fetchLatestSession()` 写 session/sessionError，**零历史加载**；`api/chat.ts:20-23` = GET `/ops/chat/sessions/latest` 元数据端点。T3 `chat.ts:424-429` 注释逐字 = 「仅恢复后端上下文，不回显历史消息」（:424），仅恢复 thread_id/activeRun 指针 + restoredNotice，messages 空起步 ✅ |
| 截断点：`chat.ts:1497-1544` openHistoryThread → :1502 `fetchThreadHistory(tid)` 无参 → `chatHistory.ts:15` 服务端默认 20/上限 100 → :1505 next_cursor 丢弃 | ✅ `chat.ts:1502` = `fetchThreadHistory(tid)` 无 limit/cursor（钉测 `chat-store-hitl.spec.ts:546` `toHaveBeenCalledWith('t-9')` 亲读锁死）；`chatHistory.ts:15` 头注逐字「服务端默认 20 · 上限 100 · 超限 422」；`chat.ts:1505` 仅取 `page.runs`，**next_cursor 确被丢弃、无翻页循环**。「自动路径 0 条 · 手动路径 ≤ 默认首页 20 runs 静默截断」钉案成立 ✅ |
| 会话列表 API 在仓：`chatHistory.ts` fetchChatThreads + `ChatHistoryPanel.vue`（:12,:38,:54-58）+ `ChatView.vue:19/:105-113` history-toggle + router 零 el-tabs 先例 | ✅ `ChatHistoryPanel.vue:12` import fetchChatThreads、:37-38 loadFirst 消费、:54-58 按 thread_id 去重追加、:96 空态 `data-test="chat-history-empty"`；`ChatView.vue:19` `historyOpen=ref(false)` 默认收起 + F-B 裁定注（:18）、:105-113 `data-test="history-toggle"`；`src/router/index.ts:56-91` AppLayout 平铺 children、/hitl 先例 :84-91；`grep "el-tabs|ElTabs" src/` **零命中**（本帽独立复跑）✅ |

§一第 4 条原话（task:58）与委托锚 m00231 逐字一致：「1、修改展示，恢复上次会话加载所有历史消息 2、增加对话历史选择tab」✅

### 2. D11–D14 封闭度 ✅

- **D11（恢复加载完备性形态 · task:114）**：双形态可验收——默认全量翻页循环（cursor 至 next_cursor=null · limit≤100 · 与 chatHistory.ts:15 上限自洽）/ 降级显式分页「加载更早」+ 可见指示，**两形态都必须消除静默截断**为硬判据；红测先行写明（「多页 mock 截断钉测先于改码」）；`chat-store-hitl.spec.ts:546` 无参钉处置声明（随形态适配 · 同 PR 可见 · 禁静默）齐备；「复用 openHistoryThread 数据链抽取共用实现 · 不复制第二份映射逻辑」防双源 ✅
- **D12（恢复边界 · task:115）与 chase/active-run 正交性**：仅已存 thread_id 触发；loadLatestSession/restoredNotice 存续；「历史加载 ≠ 续看追帧」显式切割，active-run「不自动 replay」语义存续，waiting_approval 挂起沿用 openHistoryThread 既有闭环（亲读 chat.ts:1515-1532 waiting_approval → activeRun last_seq=0 挂起 · 手动续看触发 replay）——与 chase 机制（§二 :70「本 task 不动数值与机制」）零交集 ✅
- **D13（tab 入口 · task:116）**：双 tab + data-test 落点可验收；组件形态授权 30 定稿（el-tabs 或自绘 · 仓内零先例已实证）；复用 ChatHistoryPanel（FP-F8/F10 文案零重写）；**不新增平铺路由**与 /hitl 存续（D7 沿用）均有旧钉处置声明——history-toggle 去留留 30 定稿且「旧钉 tests/chat-view.spec.ts:311 随形态适配 · 同 PR 可见」✅
- **D14（交叉状态 · task:117）**：stopStreaming 中断语义锚 `chat.ts:1503` 亲读属实（openHistoryThread 内 `stopStreaming()`，chase 定时器清理由 stopStreaming 内联承载 · R2 已核 `chat.ts:1020` 注释 FP-H10 清理链）；「自动加载与在途流不并存」（刷新后 streaming 必 false）与 D12 互洽；浮层随 messages 随迁「不残留上一会话审批面」与 D3 单一数据源自洽 ✅

### 3. 旧测影响面 v0.3 扩扫复核 ✅（本帽独立重读 · 非转述）

| task 清单（task:76 扩扫段） | 亲读结果 |
|---|---|
| `chat-store.spec.ts:419` T3「不回显历史消息」**必动** | ✅ :419 标题逐字「刷新/重进：已存 id 恢复 + 提示条；发送带该 id；不回显历史消息」，:424 `expect(chat.messages).toHaveLength(0)`——需求①落地后必命中，「改钉同 PR 可见 · 禁静默」处置声明在案 |
| `chat-store.spec.ts:63-78` loadLatestSession 钉 · 存续预期 | ✅ :61-64 beforeEach 调 loadLatestSession、:66-81 成功/失败分态钉——D12 存续语义下预期零改动 |
| `chat-store.spec.ts:851-871` 仅 thread_id 无 active-run T3 提示钉 · 随 D12 重核 | ✅ :851-861 钉 restoredNotice=true + 无续看条——restoredNotice 存续（D12）则存续，文案调整面已预声明 |
| `chat-store-hitl.spec.ts:521-780` openHistoryThread 全套 · **:546 必适配** | ✅ :521 describe 起点、:546 无参调用钉（D11 携 cursor 后必适配 · 已声明）；waiting_approval 挂起 / 404·500·501 降级 / 竞态防重 :669-687（:672 mock + :682 `toHaveBeenCalledTimes(1)`）预期存续——与本 task 分页改造正交 |
| `chat-view.spec.ts:263-380` + history-toggle :311 · D13 必适配 | ✅ :300-319 F-B 侧栏测（:310 默认收起断言 + :311 toggle 点击展开）——tab 形态落地必适配入口断言，已声明 |
| `chat-history-panel.spec.ts` · 复用则存续 | ✅ 文件在仓（glob 亲核）；D13 复用组件零重写 → 存续预判合理 |
| `chat-history-api.spec.ts:112` cursor 分页参数钉 · 存续 | ✅ :112 `fetchThreadHistory('t/9', { cursor: 'c2' })` 透传钉——D11 翻页正依赖该参数面，存续且成为新钉基础 |

**无遗漏**：扩扫段六处 + 「router 零新增（D13）故无路由测试新增面」预判，与本帽独立 grep/亲读结果一致；v0.2 旧测面（浮层/空泡系）R2 已核，本轮未重开。

### 4. failure_paths 新两行 × D11/D14 + httpErrorI18n 映射面 ✅

- task:156（全量加载性能/大会话 → D11 降级路径 + history 504 降级）与 task:157（tab×streaming/chase 交叉 → D14 中断/清理/浮层随迁/失败不阻塞发新问）逐条与 D11/D14 对应，无第二口径 ✅
- `httpErrorI18n.ts` 亲读：'History aggregation timeout' → 「历史记录加载超时，请稍后重试」映射**在仓**（EXACT_DETAIL_MAP :22 · 头注 :7 引后端 history_router.py:122/151 出处）——「映射面已有」属实 ✅（锚点行号精度见 NIT-1）

### 5. 思考轮记法合规性 ✅

- 控制表 R3 行（task:176）：early_stop 标注「yes（**v0.2 时点** · v0.3 新需求 m00231 重开 R4/R5 · 追加轮次非伪造）」、reason 同步标注「v0.2 时点结论 · v0.3 被新需求证伪重开」——时点归属诚实，非篡改既有 early_stop ✅
- R4（task:177 · 实证轮 · early_stop="-"）/ R5（task:178 · 形态封闭轮 · early_stop=yes + reason/residual_risks 齐备）真正启用；**actual_last_round=R5**（task:180）与控制表一致 ✅
- R4/R5 正文（task:200-217）与控制表结论列互指一致；修订记录 v0→v0.1→v0.2→v0.3 升序（task:223-226），v0.3 行与本次回填逐项吻合（§一第 4 条 · §二三行钉案 + 扩扫 · 范围④⑤ · 非范围三项 · D11–D14 · 验收 8–10 · failure_paths 两行 · R4/R5 · graph_delta 重评估 · 闸态不动 · 未改 src/未切分支/未 commit——本帽 git 亲核末三条属实）✅

### 6. graph_delta 重评估抽验 ✅

- `01_modules.md:16` components 行亲读：「2026-10-04 新增 `chat-history/ChatHistoryPanel.vue`（F1 历史侧栏 · 裁定 F-B）」——chat-history 条目**在册**属实 ✅
- `api` 行（:17）含 chatHistory.ts B1 契约条目；tab = ChatView 页内形态（pages 既有面）+ 组件复用（components 既有面）+ router 零新增（D13 · 亲读 router 全文无历史相关新路由需求）→ 「不新增一级模块」结论存续成立；HG-GRAPH-MODULES 回签路径（实证需新增则停并回签）不变 ✅

### 7. 机械闸复跑 ✅

- `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_approval_overlay_ux.md` → **LINT: PASS · EXIT=0**（W3 自检结论占位符 · draft 期合法 · close 前须回填）
- `npx spec-wave verify --target . --task docs/tasks/active/task_web_hitl_approval_overlay_ux.md` → **VERIFY: BLOCKED · EXIT=2**（HG-TASK-DRAFT=approved；HG-AUDIT-R1=pending ❌拒30；HG-GRAPH-MODULES=pending ❌拒30）——闸态未被 v0.3 回填动过，BLOCKED 为预期真值 ✅

---

## 阻塞项

**零内容阻塞。**

## 非阻塞 NIT

- **NIT-1（锚点行号精度 · 非阻塞）**：failure_paths task:156 引 `src/stores/httpErrorI18n.ts:7` 指「History aggregation timeout 504 映射面已有」——:7 为头注枚举后端出处行，实际映射条目在 `EXACT_DETAIL_MAP` :22（:16-23 块）。映射在仓属实、不影响验收；若 10-task 后续修订顺手，可将锚点精化为 `:22`（或 `:16-23`）。同类微小宽标：`chat-store.spec.ts:851-871` 实际跨两测（T3 钉 :851-861 + startNewSession :863-871）、`chat-store-hitl.spec.ts:521-780` describe 实际延至 :790+——均为范围指示性引用，内容核对无偏差，不阻塞签闸。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R3 审查结论（v0.3 增量复审：通过 + NIT×1）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
