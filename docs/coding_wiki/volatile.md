# coding_wiki · volatile

> **层**：volatile · **当前 active task** 专属；关账后清空或归档要点

## 相关页

- 稳定层：[[stable]]
- 项目层：[[context]]

## 本波 active

- **`web-lg-rag-sse-t3`**（2026-08-31 · 30/40 交付）：主 Chat thread_id 会话连续性——客户端不自生成 id，首轮留空由 api 生成、`run.start` payload 捕获落 `localStorage`（key `ops.lg-rag.thread-id`，不可用则内存态降级）；刷新恢复仅后端上下文（不回显历史消息）；401/登出清除；已存 id 404/422 清 id + 提示、不自动重发。真值：`docs/tasks/active/task_web_lg_rag_sse_t3.md`（00 定夺表）+ api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.2。

## 执行帽速链

- Active tasks：`../tasks/active/`
- WikiTrack RUNBOOK：[`../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md)
- 升级 Checklist：[`../runbooks/RUNBOOK_harness_upgrade_v1_zh.md`](../runbooks/RUNBOOK_harness_upgrade_v1_zh.md)

## 关账后

- 可复用条目 → 晋升 [[context]] / [[stable]]（仍只写指针，不双份正文）
- 本表清空，避免下一 task 读到 stale volatile
