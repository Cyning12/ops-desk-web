# Invoke：10-task · web-lg-rag-sse-progressive-reveal

> **用途**：审订 00 草稿验收/failure_paths；确认客户端 reveal 与 api「无关假打字机」不冲突；`task lint` PASS。  
> **约束**：不改 `src/` · 不签 `HG-AUDIT-R1` · 不推翻 00 定夺表。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-progressive-reveal` |
| git_branch | `task/web-lg-rag-sse-progressive-reveal` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md` |
| invoke_retention_profile | `default` |
| required_invoke_hats | `10,30,40` |
| 上游只读 | T5 `#28` · subtask_live `#38` · api `lg-rag-sse-subtask-steps`（明文无关 web 假打字机） |

---

## 10 核对项

- [x] 00 定夺可验收：reveal 队列 · answer 匀速出队 · subtask done 只渐显 `output` · step 即时 · 终帧/终止刷齐 · freeze 不变  
- [x] 与 api「无关假打字机」不冲突：本仓仅揭示**已收缓冲**；非协议假流 / 非 api token 化 subtask  
- [x] 验收/failure_paths 小幅收紧：SoT 分离断言 · 入队空则停前缀 · done 解析措辞对齐定夺  
- [x] 定夺表正文未改；`HG-AUDIT-R1` 保持 pending  
- [x] `invoke_retention_profile=default` · `required_invoke_hats=10,30,40`（沿用）  
- [x] 只读确认现状：`chat.ts` answer 同步 `+=`；subtask 非 running 走 `summarizeProgress`（80 字截断痛点属实）  
- [x] `task lint` PASS  

---

## 输出

- task 可交 20-task-audit R1  
- 本窗未改 `src/`
