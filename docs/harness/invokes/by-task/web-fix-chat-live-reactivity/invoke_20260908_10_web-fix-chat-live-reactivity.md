# Invoke · 10 · web-fix-chat-live-reactivity

- **hat**：10-task
- **task_slug**：`web-fix-chat-live-reactivity`
- **日期**：2026-09-08
- **结论**：实流缺陷（逐帧到达 UI 不变）根因 = `pushMessage` 返回 raw 对象致 Vue 响应式被绕过（00 已用临时 spec 实证）；修法钉死为返回响应式代理；零契约/图谱变更。
- **产物**：`docs/tasks/active/task_web_fix_chat_live_reactivity.md`
