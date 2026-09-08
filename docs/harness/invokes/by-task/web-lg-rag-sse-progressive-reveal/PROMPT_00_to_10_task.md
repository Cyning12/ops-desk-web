# PROMPT · 下一棒 10-task · web-lg-rag-sse-progressive-reveal

> 00 落盘：2026-09-08 · 供新会话 / Task 子代理整段粘贴  
> 目标：审订并补全 `docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md` · `task lint` PASS · **不改 `src/`**

复制区（整段粘贴）：

````text
你是 10-task（Harness）。Open Folder = ops-desk-web 仓根。

必读：
1. docs/harness/prompts/10-task-requirements.md
2. docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md（00 初稿 · 含实流分析与定夺表）
3. docs/tasks/done/task_web_lg_rag_sse_t5.md（answer delta/final）
4. docs/tasks/done/task_web_lg_rag_sse_subtask_live.md（running/done 合并）
5. src/stores/chat.ts 中 subtask.progress / answer 分支（只读，理解现状）

任务：
- 审 00 定夺是否可验收；补齐/收紧验收标准与 failure_paths 措辞
- 确认与 api「无关 web 假打字机」不冲突：本仓做的是客户端 reveal 队列（只揭示已收缓冲）
- 选定 invoke_retention_profile / required_invoke_hats（可沿用 default=10,30,40）
- 落盘本帽 invoke：docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_*_10_*.md
- 运行：npx dsh-coding-kit task lint --file docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md
  须 PASS（修 E*；W* 可记 note）
- 状态可保持 draft；勿签 HG-AUDIT-R1；勿改 src/

禁止：实现代码、改 CI、代签人工闸 approved。

交付短报（≤10 行）：lint 结果 · 对定夺的修改要点 · 下一棒建议（20-task-audit）。
````
