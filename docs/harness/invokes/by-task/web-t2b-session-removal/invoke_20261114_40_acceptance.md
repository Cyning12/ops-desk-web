# invoke 40 · web-t2b-session-removal 验收

- 时间：2026-11-14
- 验收 6 条全过（见 task 单勾选）：api/chat.ts 删除零引用 · 门控单一化 · composer 无 session 依赖 · vitest 356 绿 · eslint/tsc 双绿 · freeze 零 diff
- 全仓复证：grep sessions/latest|chat/models src tests → 仅历史 spec 断言字符串（chat-stream-deprecation 等测试钉的是 /ops/chat/stream 410 语义，非本卡范围）
