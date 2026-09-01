# Invoke：10-task · web-lg-rag-sse-t6

> **用途**：task 需求审入口；00 起草并签 HG-TASK-DRAFT 后执行（web 00 线 · 维护者令「api-T6已完成」放行）。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t6` |
| git_branch | `task/web-lg-rag-sse-t6` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t6.md` |
| spec_path | 上游承载：api `05` §10.5 + api 00 `PROMPT_web_00_t6_remove_chat_sse`（W4 豁免） |

## 10 核对项

- [x] 范围 = 删 useOpsChatSse + chat-sse.spec · 移除 chat stream 常量 · 守卫改写 · README · 图谱备注  
- [x] 保留钉死：fetchLatestSession / /chat/models / /chat/sessions/latest（api 未下线）  
- [x] 非范围 = api 改码 · 存活端点 · C0–C4 · iOS · lg-rag 行为 · /lg-rag 页  
- [x] failure_paths：误删存活封装 CI 拦截 · 守卫口径 · 410 触发=回归  
- [x] 联调：dist grep 无 /ops/chat/stream · 全站无 chat stream 请求  
- [x] `task lint` PASS（W4 豁免）· 自检结论占位已置  
