# Invoke：40 独立验收 — web-hitl-approval-overlay-ux（2026-10-28）

> **task**：`docs/tasks/active/task_web_hitl_approval_overlay_ux.md`（v0.4 · D1–D14 · 验收 1–10）
> **分支**：`task/web-hitl-approval-overlay-ux`（基于 dd537d7 · 30 声称 6223007 feat + 2cbd3b3 docs+graph）
> **帽**：40 独立验收（只验不改 · 本 invoke 落盘为唯一允许写）

## 结论

**退回（单项补齐）**：30 交付代码面/测试面/图谱面/调查面/纪律面全部验收通过，唯 **D9/wiki_delta 硬条件缺 `docs/coding_wiki/volatile.md` 短注**（task §三 D9：「30 交付时两份 flow yaml 增量 + graph-compile 绿 + volatile 短注」· wiki_delta「禁止无理由 n/a」；实测 grep 浮层|空气泡|overlay 0 命中）。补齐 volatile 短注（docs 类单 commit）后可直接关账，代码面无需重验。

## 一、逐项验收表（task §六 验收 1–10）

| # | 验收项 | 结论 | 证据 |
|---|---|---|---|
| 1 | replay 干净结束零新帧不产空气泡 + resumeHint 存续 | ✅ | chat.ts onEvent 包装层 sawInk（CONTENT_INK_EVENT_TYPES 五型 answer/node.progress/subtask.progress/hitl.waiting/error）+ onDone !sawInk → findIndex+splice 回收；resumeHint「暂无新进度，稍后再点续看」存续；钉 tests/chat-store.spec.ts 空流钉扩展（3→2 回收断言 + resumeHint 断言）+ R1-N1 done 仅元信息同回收钉 |
| 2 | 范围②实证报告（根因归属 + 证据 + 报告入 invoke · src 零对应改动） | ✅ | invoke_20261028_30_implement.md §一：replay 五段链钉案 + PG 实证（run 38cb1138 seq 1–19 连续无洞 · 恢复段 68s/289s）+ history 三段链；根因=后端时序窗口（恢复段在写 replay 合法 200 零帧）；报告上抛 ops-desk-api；前端零对应改动（useLgRagSse diff 空） |
| 3 | Chat 页 hitl 消息不渲染审批动作面 · 仅一行只读标记（无按钮） | ✅ | ChatView.vue 消息流内 HitlApprovalCard 移除 → hitlInlineText 只读标记（data-test=hitl-inline-note · waiting/acting/unavailable/decided 四态文案 · 无按钮）；钉 chat-view.spec.ts:120-124 |
| 4 | 审批动作面浮层于 composer 上方 · 卡片内完成 · 进度区承接 hitl.note（零改数据层） | ✅ | HitlApprovalOverlay.vue 包装 HitlApprovalCard（零分叉 · 头注声明）· data-test=hitl-overlay；hitl.note 渲染仍在 card 模板（showProgress 未触）；钉 chat-view.spec.ts D5/D6 浮层承接「恢复中（第 2 次）」 |
| 5 | 批准→chase 进度落点随迁浮层 · chase 超限降级文案存续 | ✅ | chase 常量/机制零改（chat.ts diff 未触 979-986 区）；超限降级「恢复仍在进行」钉面存续（chat-store-hitl.spec.ts 52 绿）；视图钉 D5/D6 resumeHint 条带与浮层共存 |
| 6 | 历史 tab /hitl 页审批后返回 Chat 页动作面同浮层承接 · `npx spec-wave task lint` PASS | ✅ | hitlOverlayMessage 取最新 waiting/acting/decided（三入口同形态）；/hitl 页存续零改；spec-wave task lint PASS（W3 自检结论占位符 warn · draft 期合法 · close 前回填） |
| 7 | decide/resume 请求体/响应消费与 hitl-browser-decide-v1 零偏差 | ✅ | src/api/hitl.ts diff dd537d7..HEAD = 0 行；HitlApprovalCard.vue 仅头注 5 行（动作语义零改）；decide 精确 2 参/3 参钉存续（chat-view.spec.ts:184-185/229） |
| 8 | 审批后 done{completed} 浮层同帧消失 · 卡片不残留 | ✅ | hitlOverlayMessage 不含 completed（hitl 分支 continue 后无 hitl 字段）；D14 视图钉：切完成态历史会话 → 浮层与只读标记均不残留（chat-view.spec.ts:481-525） |
| 9 | 双 tab 复用 ChatHistoryPanel · 零新增路由 · 选中→openHistoryThread 闭环 | ✅ | 自绘双 tab（data-test=chat-tabs/chat-tab-conversation/chat-tab-history · activeTab 本地态）；router/index.ts diff = 0 行；选中回对话 tab 钉 chat-view.spec.ts:391-437 |
| 10 | 刷新重进自动加载历史 · 加载完成前 composer 门控 · 不双轨渲染 | ✅ | onMounted → restoreThreadHistory（无 id 零加载 · 复进幂等）；composer textarea/发送钮 :disabled 增 historyLoading；加载后 messages 非空放弃覆盖；钉 chat-store.spec.ts D14 + chat-view.spec.ts:527-543 |

## 二、三门实测（钉版 `npx pnpm@10.32.1` · 2026-10-28 本机复跑）

| 门 | EXIT | 统计 |
|---|---|---|
| lint | 0 | eslint . 零错 |
| test | 0 | **334 passed / 1 skipped / 34 files**（与 30 回报一致；skip = guards TC13(b) diff 为空 skip 留痕，预期行为） |
| build | 0 | vue-tsc + vite 绿 |
| graph-compile | 0 | 复跑绿；再生成 graph.json 与提交版仅 generated_at 时间戳差（已还原，工作树净） |

## 三、冻结面核验

- `git diff dd537d7..HEAD -- src/api/hitl.ts src/composables/useLgRagSse.ts` = **0 行** ✅
- HitlApprovalCard.vue 仅头注级 5 行（唯一包装落点声明 · 动作语义零改）✅
- /hitl 页与 tests/hitl-approval-page.spec.ts（17 钉）存续零改 ✅
- 非范围面：chase 上限/退避/预算、hitl.note 数据源与 showProgress、ChatHistoryPanel 内部、T4 游标精度、router、后端均零改 ✅
- TC3 setInterval 白名单：src 仅既有 useRevealQueue/lgRag 两处 · HitlApprovalOverlay 零引入 ✅

## 四、旧钉处置清单复核（零静默）

| 旧钉 | 处置 | 核验 |
|---|---|---|
| chat-store.spec.ts:419 T3「不回显历史消息」 | 改写为 restoreThreadHistory 全量回显钉 | ✅ 6223007 同 commit · 注释「D11/D12 改钉 · 原语义废止」 |
| chat-store.spec.ts:657 空流钉双分支 | 扩展回收断言 + resumeHint 存续 | ✅ 注释「:657 同钉 · 立即建泡承接语义存续」 |
| chat-store-hitl.spec.ts:546 AC2 无参钉 | 适配 {limit:100} + times(1) | ✅ 注释「D11 改钉 · 影响面清单声明项」 |
| chat-view.spec.ts:311 history-toggle | 废止 → D13 双 tab 钉 | ✅ 注释「F-B 改钉 · 侧栏形态废止」 |
| chat-view.spec.ts AC7 六钉（:91-296 消息流内联卡） | 适配浮层落点 + 消息流无卡 + DOM 序钉 | ✅ 每钉带 D2/D4 理由注释；data-test=hitl-card 存续未改名 |
| 清单外静默改钉 | 独立核 diff：tests/ 仅 3 文件改动 · 全部 hunk 带理由注释 | ✅ 零清单外改动；guards/chat-history-panel/hitl-approval-page 等 spec 零触 |

## 五、调查②结论自洽性

- 报告结构完整：replay 五段链钉案（游标来源/请求/持久化帧/去重基线/渲染）+ history 三段链 + PG 双数据点（38cb1138 seq 1-19 无洞 · 1039c1a9 同构）+ 根因定性（恢复段 68–289s > chase 预算 ≈56s · 在写窗口 replay 合法 200 零帧）+ 修复面归属上抛。
- 后端引用抽查（只读 · 零改）：router.py:481「同步执行实测 130–310s，超前端 30s 超时」✅、router.py:506 `_best_effort_replay_cursor` ✅、sse_replay.py `resolve_replay_target`/`replay_events`（seq>after_seq · cursor 双形态等价）✅、event_store.py:129/230-240 `run_stream_closed`+`refuse_in_flight` 409 闸 ✅。小注：报告段②将 409 机制笼统归于「sse_replay.py」，实际 `load_events_after(refuse_in_flight)` 在 event_store.py——引用精度瑕疵，实质结论成立。
- 前端防御（D1 无气泡 + resumeHint 兜底）与报告「修复面归属=后端 · 前端防御处置」一致 ✅。

## 六、图谱核验

- 10_flow_chat.graph.yaml：description 追加 approval-overlay 段 + 5 节点（restore_thread_history/fetch_all_thread_runs/thread_history_api/hitl_overlay/chat_history_panel）+ 7 边 + version 2026-10-28 ✅（落在 2cbd3b3）
- 10_flow_hitl.graph.yaml：description 追加 Chat 页浮层化旁注 + /hitl 存续声明 ✅
- 01_modules.md：components/pinia 两行**行内备注**追加 · 零新行零新模块 ✅（HG-GRAPH-MODULES 回签路径不触发成立）
- graph-compile 复跑绿 ✅

## 七、纪律核验

- refs/remotes 无该分支（无 remote-tracking ref）⇒ 零 push ✅；分支基于 dd537d7 拓扑正确 ✅
- 提交序列 b375ab4 → 82b19c6 → 6223007（feat 7 files +759/-62）→ 2cbd3b3（docs+graph 8 files）与 30 回报一致 ✅
- 全量改动面 23 files：src 3 + tests 3 + docs/graph/invoke/audit 17 · 无清单外文件 ✅

## 八、遗留项

1. **【退回项】D9/wiki_delta 缺 volatile.md 短注**（见结论 · grep 浮层|空气泡|overlay 于 volatile.md 0 命中）。
2. 恢复段在写窗口 replay 合法空 200（后端面 · 报告已上抛 ops-desk-api 待排期）——前端防御已落地，本 task 范围内无可为。
3. chase 预算 56s < 恢复段 68–289s 实测 · 依赖手动续看接力（策略面 · 非本 task 范围）。
4. 大会话（>1000 帧级 thread）全量翻页渲染成本未实证（本地无样本 · 低风险）。
5. task 自检结论仍为占位符（spec-wave W3 · draft 期合法 · close 前回填）。
