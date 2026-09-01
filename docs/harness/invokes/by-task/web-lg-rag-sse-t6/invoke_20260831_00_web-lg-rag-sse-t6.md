# Invoke：00-orchestrator · web-lg-rag-sse-t6

> **用途**：00 编排留档；维护者令「api-T6已完成」→ 起草 web T6 task · 闸 · 派 30。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-lg-rag-sse-t6` |
| git_branch | `task/web-lg-rag-sse-t6` |
| 上游 | api T6 `lg-rag-deprecate-chat-stream`（PR #108 MERGED · /ops/chat/stream → 410 Gone） |

## 00 动作流水（2026-08-31）

1. 核事实（禁臆造）：api T6 PR #108 MERGED · task 归档 done/ · 05 §10.5 已回写（410 + Deprecation/Link 头 · 保留 models/sessions.latest/ws）· api 00 Prompt `PROMPT_web_00_t6_remove_chat_sse` 已落盘  
2. WAVE_READINESS §2 行 1 已勾（api+web T5 CLOSE · 前波已回填）；行 2 维护者窗口 = api T6 合入即视为放行  
3. 起草 `task_web_lg_rag_sse_t6.md`：闸表 · 00 定夺（删/留清单钉死 · 守卫改写口径）· 验收 · failure_paths · 联调策略  
4. `task lint` PASS · 签 HG-TASK-DRAFT / HG-GRAPH-MODULES  
5. 派 20 R1 → 后代签 HG-AUDIT-R1 → verify → 派 30（明令勿 auto-merge / 勿改 api / 勿误删存活端点）

## 纪律声明

- 本窗 00 **未改实现码**；删除/改写全部派 30 子 Agent  
- merge 闸 HG-JOINT-DEBUG 不空签：须 40 脚本化记录（dist grep 无 chat stream）或维护者亲签
