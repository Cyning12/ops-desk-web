# coding_wiki · volatile

> **层**：volatile · **当前 active task** 专属；关账后清空或归档要点

## 相关页

- 稳定层：[[stable]]
- 项目层：[[context]]

## 本波 active

<!-- 真源 = docs/tasks/active/ 目录本身（README + 本任务自身 task_web_doc_health_sweep）。 -->
<!-- 2026-11-04 web-doc-health-sweep 30 清空：原 ≥12 个已关账条目（web-ux-state-sync ~ lg-rag-sse-t4 等）全量移除，其定夺要点均有 done/ 档承载（逐条核验过 12 个 done 文件在位）；下方五个按任务分节（subtask.message / decision-surface / chat-live-reactivity / resume-chase / overlay-ux）同清，断链指针清零。开新单时由 10 棒按 active 实况重填。 -->

### web-hitl-overlay-reconcile-race（active · 2026-11-06）

- 浮层对账竞态（issue #95）修复 = DP-1 形态 A 键口径统一：`isHitlRequestReconciled` 纪元化——`hitlSnapshotStamp` 每次成功 `refreshHitlPending` +1；`hitlFirstSeenStamps` 登记 request id 经 `hitl.waiting` 帧/历史/replay 首见的纪元（`stampHitlFirstSeen` 三入口统一 · 仅首写幂等）。仅「首见纪元 < 当前快照纪元」的 id 参账；快照后首见（SSE 新到 · 实体键滞后）不参账，待下一次成功刷新确证（TC1 负样本红测）。零轮询 · 不依赖后端 created_at（SSE 事件表零 diff 自洽）。真值 = `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`

## 执行帽速链

- Active tasks：`../tasks/active/`
- WikiTrack RUNBOOK：[`../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md)
- 升级 Checklist：[`../runbooks/RUNBOOK_harness_upgrade_v1_zh.md`](../runbooks/RUNBOOK_harness_upgrade_v1_zh.md)

## 关账后

- 可复用条目 → 晋升 [[context]] / [[stable]]（仍只写指针，不双份正文）
- 本表清空，避免下一 task 读到 stale volatile
