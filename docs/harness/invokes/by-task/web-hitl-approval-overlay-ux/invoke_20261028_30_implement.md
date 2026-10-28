# Invoke：30 实现 — web-hitl-approval-overlay-ux（2026-10-28）

> **task**：`docs/tasks/active/task_web_hitl_approval_overlay_ux.md`（v0.4 · D1–D14 · 验收 1–10）
> **分支**：`task/web-hitl-approval-overlay-ux`（基于 task/web-hitl-resume-chase-ux 合并态 dd537d7）
> **帽**：30 实现（红测先行 · 全程本地 · 禁 push/PR）

---

## 一、范围② replay 无数据实证调查（D8 调查先行 · 结论先于耦合修复定稿）

### 数据链钉案（replay 五段 + history 三段 · 实证日 2026-10-28 · 本地 PG `opsdesk` 只读）

**replay 链五段**：

| 段 | 实证对象 | 结论 |
|---|---|---|
| ① 游标来源 | `ops-desk-api/app/ops/hitl/router.py:506` `_best_effort_replay_cursor` | resume 200 携 replay.cursor = make_cursor(run_id, last_seq)，取值于**受理时刻**（恢复段后台执行前）= 首段末帧 seq。游标语义正确（指向恢复段之前，不漏帧） |
| ② 请求 | `sse_replay.py` resolve_replay_target/replay_events | seq > after_seq 过滤，前后端同口径；cursor 与 {run_id, after_seq} 双形态等价 |
| ③ 服务端持久化帧 | PG `ops_lg_rag_run_events` 实证 run `38cb1138…`（hitl_825e · 2026-10-28 07:28 批准） | **seq 1–19 连续无洞**（全库 max(seq)=count(*) 零反例）；恢复段完整落盘：hitl.resumed@10 → node/subtask.progress@11–16 → answer{final:true}@17 → critic@18 → done{status:resumed, latency_ms:289607}@19。第二数据点 run `1039c1a9…` 同构（恢复段 68s） |
| ④ 前端去重基线 | `src/stores/chat.ts` lastAppliedSeq（seq<=lastAppliedSeq 忽略） | 无吞帧：chase 每帧 Math.max(lastSeq, seq) 推进；DB seq 无洞 ⇒ 去重基线不越帧 |
| ⑤ 渲染 | chase/resumeFromCursor 复用 processFrame 管线 | 部分帧正常落墨；终帧 answer@17 只在恢复段完成后可达 |

**history 恢复链三段**：恢复路径 = `restoreThreadHistory`（onMounted · 已存 thread_id）/ `openHistoryThread`（历史 tab 选中）→ 请求参数 = `fetchAllThreadRuns` 循环 {limit:100, cursor} 至 next_cursor=null → 截断点 = 服务端默认首页 20 runs（`src/api/chatHistory.ts:15` 契约注释「服务端默认 20 · 上限 100 · 超限 422」）。修复前 openHistoryThread 无参调用**静默只吃首页 20**（维护者「前后内容被截断」观感的第二来源）；本地库无 >15 runs 的 thread，截断边界以 mock 双页钉覆盖（chat-store.spec.ts D11 钉 · calls[1]=['t-stored',{limit:100,cursor:'cur-2'}]）。

### 根因定性

**「没数据返回 / 返回空」= 时序窗口，非丢数据（后端面 · 按 D8 只出报告上抛，本 task 不改 ops-desk-api）**：

1. 恢复段**异步后台执行**（`router.py:481` 注释自承「同步执行实测 130–310s，超前端 30s 超时」）；实测恢复段时长 **68s（1039c1a）/ 289s（38cb）**。
2. 前端 chase 预算 = 10 次递增退避（2/3/4.5/6.75/8s…）≈ **56s 墙钟** < 恢复段时长 → chase 必然在恢复段写完前耗尽，落到「恢复仍在进行，可稍后手动续看」（chat-store-hitl.spec.ts TC7 钉面存续）。
3. 恢复段在写窗口内调 replay：`load_events_after(refuse_in_flight=True)` 的 409 判定看 `run_stream_closed`——首段 done{waiting_approval} 已存在 ⇒ **不拦 409，合法返回 200 零帧** ⇒ 修复前渲染空气泡，即维护者实测「点击续看推进返回空」。
4. 「前后内容被截断」观感双来源：(a) chase 只见恢复段部分 progress 帧、终帧 answer 未到；(b) 历史加载首页 20 截断（前端面，本 task D11 已修）。

**修复面归属**：让 replay 在恢复段在写期可区分（409/Retry-After 或终帧信号）属后端改动 → 上抛 ops-desk-api（禁改姐妹仓）。**前端防御处置已随本 task 落地**：空 200 零内容帧不产气泡（D1）+ resumeHint「暂无新进度」兜底存续（验收 5）。

---

## 二、形态定稿记录（D1 / D11 / D13）

- **D1 空泡形态 = 终态回收**（定稿）：resumeFromCursor 先建泡存续（进度帧落墨体验不退化），onDone 时 sawInk===false（CONTENT_INK_EVENT_TYPES = answer/node.progress/subtask.progress/hitl.waiting/error）→ 按 assistant.id findIndex+splice 回收。选「终态回收」弃「延迟建泡」：后者要把 5 类帧的首帧落墨全部改道、回归面大。chat-store.spec.ts:657 预裁定双分支按 D1 定稿改写为回收语义（改钉与改码同 commit 可见）。R1-N1 补钉：done 仅元信息（无内容帧）同回收；有内容帧保留。onError 路径不回收（错误条落点不吞）。
- **D11 全量形态 = 自动翻页循环**（定稿 · 非降级显式分页）：fetchAllThreadRuns 循环 limit=100（契约上限内合规）至 cursor null + 同 cursor 回环防御；本地实证 thread 规模 ≤15 runs 远低于阈值，性能降级路径不实装（无实证依据）。D12 边界：无 id 零加载 / 404→「会话不存在或已过期」/ 其余非 401→「历史服务暂不可用」/ 加载后 messages 非空放弃覆盖（D14 不双轨）。
- **D13 入口形态 = 「对话 | 历史」双 tab · history-toggle 废止**（定稿）：Chat 页内自绘双 tab（chat-tab-conversation/chat-tab-history · 水墨风克制下划线）承载复用 ChatHistoryPanel，零新增路由；F-B 侧栏+toggle 形态废止（旧钉 chat-view.spec.ts:311 处置见下节）；选中历史条目 → openHistoryThread + 自动回对话 tab（验收 9 闭环钉）。

## 三、旧钉处置清单（改钉与改码同 commit 可见 · 零静默）

| 旧钉 | 处置 | 理由 |
|---|---|---|
| `tests/chat-store.spec.ts:419` T3「不回显历史消息」 | **改写**为 restoreThreadHistory 全量回显钉 | task §六明示「必动须声明」；D11 语义反转 |
| `tests/chat-store.spec.ts:657` 空流钉双分支 | **扩展**：0 帧 onDone → 回收断言（3→2）+ resumeHint 存续；部分帧 → 保留 | D1 预裁定双分支，定稿终态回收 |
| `tests/chat-store-hitl.spec.ts:546` AC2 无参钉 | **适配** toHaveBeenCalledWith('t-9',{limit:100})+times(1) | openHistoryThread 改走 fetchAllThreadRuns；task §六明示必适配 |
| `tests/chat-view.spec.ts:311` history-toggle | **废止**：F-B 改钉双 tab（无 sidebar/history-toggle 断言 + chat-tab-history 呈现） | D13 定稿 tab 形态；task 授权「去留 30 定稿但须声明」 |
| `tests/chat-view.spec.ts` AC7 六钉（:101-296 消息流内联卡） | **适配**：hitl-card 存在性移入 [data-test=hitl-overlay] 浮层落点 + 消息流内无卡 + inline-note 无按钮 + composer 上方 DOM 序钉 | D2–D7 浮层化；选择器 data-test=hitl-card 存续（卡片零改名零拆） |
| guards `TC13(b)` useLgRagSse diff 口径 | **未触**：范围②根因在后端，useLgRagSse 零改动 | 预裁定「绕开解析段修法」自然满足，无需停并回报 |
| `tests/chat-history-panel.spec.ts` / `chat-history-api.spec.ts:112` cursor 透传钉 / `hitl-approval-page.spec.ts` | **存续零改** | D13 复用面板 / limit 传参与 cursor 透传不冲突 / /hitl 页 D7 存续 |

## 四、R3 NIT 随签勘误

task failure_paths 引 `src/stores/httpErrorI18n.ts` 504 映射行号「:7」勘误：:7 为注释行，504 映射实在 **:22**（'History aggregation timeout' → '历史记录加载超时，请稍后重试'）。

## 五、验证实录（三门 + 图谱 · 全钉版 `npx pnpm@10.32.1`）

| 门 | 结果 |
|---|---|
| 红测先行 | 五范围钉先红（store/view 双文件新钉在未实现时失败）→ 实现后三 spec 145/145 绿 |
| `lint` | EXIT=0 |
| `test` | EXIT=0 · **334 passed / 1 skipped / 34 files**（guards TC3/TC12/TC13(a)(b) · hitl-approval-page 全绿） |
| `build` | EXIT=0（首跑 vue-tsc 卡新增测试 deferred-promise 类型窄化 TS2322/TS2349 → resolvers 数组写法修复后绿） |
| `./scripts/graph-compile.sh` | EXIT=0（10_flow_chat + 10_flow_hitl 增量编译绿 · **未新增一级模块**，HG-GRAPH-MODULES 回签路径不触发） |

图谱增量：10_flow_chat.graph.yaml（description 追加 approval-overlay 段 + restoreThreadHistory/fetchAllThreadRuns/fetchThreadHistory/HitlApprovalOverlay/ChatHistoryPanel 五节点七边 + version 2026-10-28）· 10_flow_hitl.graph.yaml（description 追加 Chat 页浮层化旁注 + /hitl 存续声明）· 01_modules.md components/pinia 行内备注（仿 2026-10-04/10-23 先例）。

## 六、遗留风险

1. **恢复段在写窗口的 replay 合法空 200**（后端面）：本 task 前端防御（无气泡+resumeHint）已落地，但「恢复段在写 ⇒ replay 409/Retry-After」语义化需 ops-desk-api 改动，报告上抛待维护者排期。
2. **chase 预算 56s < 恢复段 68–289s 实测**：chase 耗尽后依赖用户手动续看推进；预算扩容属策略面调整，非本 task 范围。
3. **大会话性能**：D11 全量循环在 >1000 帧级 thread 的渲染成本未实证（本地无大数据量样本）；当前单 run 视图全量返回为常态，风险低。
4. R1-N1 钉的 seedBrokenLive 追加语义：后续维护者扩展该钉族时注意 baseline 断言写法（本钉已用 chat.messages.length 动态基线）。
