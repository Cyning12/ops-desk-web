# Invoke · 10 · web-lg-rag-sse-subtask-message

- **hat**：10-task
- **task_slug**：`web-lg-rag-sse-subtask-message`
- **日期**：2026-09-08
- **结论**：据 api `lg-rag-sse-subtask-message`（方案 B）生成 web 下游草稿：有非空 `payload.message` 则过程区优先原样消费；本地 step 拼装降级 fallback；done 有 `output` 仍走 progressive-reveal 渐显，短 `message` 不覆盖长 output；闸 pending 待人签。
- **产物**：`docs/tasks/active/task_web_lg_rag_sse_subtask_message.md`
- **必读**：api 05 §10.7 · api task · `task_web_lg_rag_sse_progressive_reveal` · `src/stores/chat.ts`
