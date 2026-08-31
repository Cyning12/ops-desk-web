# Invoke：30-execute · web-lg-rag-sse-t4

> **用途**：30 实现留痕（断联 / replay 续看 · cursor 捕获 · seq 去重）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG pending（blocks merge · 40 脚本化联调记录见 invoke_40，待维护者核签）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-lg-rag-sse-t4` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type · 不改帧序 · cursor 为帧内可选顶层字段） |
| git_branch | `task/web-lg-rag-sse-t4` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_lg_rag_sse_t4_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 6 note · N1–N3 已入 task · N4–N6 本帽内决） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（`01_modules.md` 零 diff · 仅 `10_flow_chat` 备注） |
| HG-JOINT-DEBUG | pending | N（blocks merge） | web PR 勿 auto-merge |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t4.md` → **VERIFY: PASS**（exit 0）。

## 30 产出（改码清单）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/composables/useLgRagSse.ts` | 改 | `LgRagSseEvent` 增可选顶层 `cursor`；新增 `LG_RAG_REPLAY_PATH='/api/ops/lg-rag/replay'` 与 `replayLgRag({run_id, after_seq}, callbacks)`；live/replay 共用提取的 `postLgRagSse(path, body, callbacks)`（fetch + client 超时 + `LgRagSseFrameParser` + 错误分类）——live 侧行为零变化 |
| `src/stores/chat.ts` | 改 | `LG_RAG_ACTIVE_RUN_STORAGE_KEY='ops.lg-rag.active-run'` + try/catch 读写清 helper（含坏 JSON/键不齐防御 · localStorage 不可用内存态降级）；`extractFrameCursor()`（顶层 run_id/seq 优先 · cursor 兜底合成 · run.start payload.run_id 兜底）；`processFrame()` 统一帧入口（per run_id `lastAppliedSeq` 去重 · 每推进 seq 即持久化 active-run）；done/error/abort 终态 `clearActiveRun()`；live 401 同步清 thread_id+active-run（R1-N3）；`resumeFromCursor()`（手动 · replay body `{run_id, after_seq:last_seq}` · 渲染进新建 assistant · replay 404/422 清态提示不重试 · 401 清+跳登录 · 网络错保留可接力 · 空流/未完 N4 提示）；`activeRun/resumeNotice/resumeHint/canResume/dismissResumeNotice` 导出；`startNewSession()` 同步清 active-run |
| `src/stores/auth.ts` | 改 | `clearSession()` 同步 removeItem `ops.lg-rag.active-run`（对齐 T3 R1-N1 防换账号串号；直写键名避免循环 import） |
| `src/views/ChatView.vue` | 改 | 刷新「上次回答未完成」warning 条（续看按钮 · 可关闭 · 不自动 replay）；错误条内嵌「续看」按钮（`canResume` 时出现 · 文案「连接中断，已收到的内容不会丢失」）；`resumeHint` 提示行；Element Plus + 水墨风变量沿用 |
| `tests/chat-store.spec.ts` | 扩 | T4 describe 13 例：cursor/seq 捕获持久化+done 清除 · 合成兜底（缺 cursor / 仅 cursor）· error/abort 终态清除（N6）· 断网保留+续看 replay body 断言+新消息渲染 · seq 去重（answer/thinking 不重复 · 跨 run 重置）· live 401 双清（N3）· replay 404/422 清态不重试 · replay 401 三清 · replay 网络错保留+接力 after_seq 推进 · 空流/未完 N4 提示 · 刷新续看条+N5 新消息+终态后不出现 · 仅 thread_id 无 active-run 走 T3 提示 · startNewSession 清 active-run |
| `tests/lg-rag-sse.spec.ts` | 扩 | replayLgRag describe 4 例：POST 路径/body `{run_id, after_seq}`/credentials/Accept/帧序回调（含 cursor 透传）· 404·422 · 401 · 网络错误 |
| `tests/auth-store.spec.ts` | 扩 | 1 例：clearSession/logout 同步清 active-run 键 |
| `docs/_tech_graph/l1/10_flow_chat.graph.yaml` | 改 | description 备注 T4 replay 路径+seq 去重；新增 `replayLgRag`/`resumeFromCursor` 节点与 4 条边；compile 再生成 .md/graph.json（`01_modules.md` 零 diff） |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（cursor 续看/去重策略一句话 + 真值指针 task 00 定夺 + api 05 §4.2/§10.3） |

## R1 非阻塞 note 落决

| # | 决策 |
|---|---|
| N1 | task 头部 api 指针已随 00 签修改为 done/（task 现状已核），无需再动 |
| N2 | 自检回填沿用「23 files / 155 tests」全套口径（chat-store 34 例），未写作 chat-store 137 例 |
| N3 | **采纳**：live 401 分支同步 `clearActiveRun()` + Vitest 断言（localStorage 双键均清） |
| N4 | **内决采纳建议**：replay 空流（0 帧 onDone 未见终态）→ 保留 active-run + `resumeHint`「暂无新进度，稍后再点『续看』」；有部分新帧无终态 → 「回答仍在生成中，可稍后再次『续看』接力」。与「断连仍跑完」语义自洽，联调实测空流 HTTP 200 / 0 帧（invoke_40-J） |
| N5 | **采纳**：`handleEvent` 主体不变、外层提取 `processFrame(event, assistant)` 复用；`resumeFromCursor()` 一律 `pushMessage('assistant')` 新建渲染目标（刷新后 messages 为空 · 断连续看亦新条承接，原消息不动）；Vitest 断言渲染进新消息 |
| N6 | **维持 00 定夺**：abort（手动停止）= run 终态即清 active-run，停止后不可续看；不改条文、UI 暂不加 hint（联调已请维护者关注该语义认知，见 invoke_40 遗留） |

## 非范围遵守

- 未改 ops-desk-api 任何代码（联调仅跑迁移/调端点）；未做 T5 token delta；未做 T6 删 `useOpsChatSse`；未碰 C0–C4
- `LgRagView.vue` / `src/api/lgRag.ts` **零 diff**；`useOpsChatSse` 静态守卫绿（chat-stream-deprecation 3 例过）
- 无自动 replay（双条均手动触发）；无多 run 管理 / 时间轴 UI / 历史列表；freeze 沿用未新增 event_type
- T3 行为不回退：thread_id 持久化/恢复提示/startNewSession 既有 22+ 例全绿
