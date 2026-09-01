# coding_wiki · volatile

> **层**：volatile · **当前 active task** 专属；关账后清空或归档要点

## 相关页

- 稳定层：[[stable]]
- 项目层：[[context]]

## 本波 active

- **`web-lg-rag-sse-t5`**（2026-08-31 · 30/40 交付）：answer 帧分支规则——payload 含 `delta` 键 → 追加到 assistant.content；含 `content` 键 → 全量替换（终帧 `final:true` 同此，严禁叠加到 delta 拼接后；两键同帧 content 优先 + warn）；done/error/abort 后停止追加。真值：`docs/tasks/active/task_web_lg_rag_sse_t5.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.4。
- **`web-lg-rag-sse-t4`**（2026-08-31 · 30/40 交付）：断联/replay 续看——每帧捕获可选顶层 `cursor`（缺失以 run_id+seq 合成），active-run 落 `localStorage`（key `ops.lg-rag.active-run`，终态 done/error/abort 即清除）；断网/刷新后手动「续看」→ `POST /api/ops/lg-rag/replay` body `{run_id, after_seq}`（帧形状同 live，复用同一解析/渲染管线，渲染进新建 assistant 消息）；per run_id 记 `lastAppliedSeq`，`seq<=lastAppliedSeq` 帧整体忽略（answer 不重复 append · thinking 不重复）；replay 404/422 清 active-run 不重试，401（live/replay）清 thread_id+active-run 跳登录。真值：`docs/tasks/active/task_web_lg_rag_sse_t4.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.3。

## 执行帽速链

- Active tasks：`../tasks/active/`
- WikiTrack RUNBOOK：[`../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md)
- 升级 Checklist：[`../runbooks/RUNBOOK_harness_upgrade_v1_zh.md`](../runbooks/RUNBOOK_harness_upgrade_v1_zh.md)

## 关账后

- 可复用条目 → 晋升 [[context]] / [[stable]]（仍只写指针，不双份正文）
- 本表清空，避免下一 task 读到 stale volatile
