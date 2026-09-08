# PROMPT · 下一棒 40 · web-lg-rag-sse-progressive-reveal

> 00 落盘：2026-09-08 · 30 已交付 · VERIFY/lint/test/build 父会话复测绿  
> 30 Agent：[30 progressive-reveal](d2dee5da-ade7-46b2-88e5-a211de1bff5d)

复制区（整段粘贴）：

````text
你是 40-self-check（Harness）。Open Folder = ops-desk-web 仓根。
分支须为 task/web-lg-rag-sse-progressive-reveal。

必读：
- docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md
- docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_20260908_30_*.md
- docs/harness/prompts/40-self-check.md（若存在）
- src/composables/useRevealQueue.ts · src/stores/chat.ts 相关分支

自检：
1. 对照验收标准逐项勾选（含：同 tick 多 delta 不瞬满、subtask output 渐显、终帧/abort 刷齐、step 可读、replay 4×）
2. 复跑：pnpm lint && pnpm test && pnpm build && ./scripts/graph-compile.sh
3. npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md
4. 抽查 R1-N1～N5 是否落地（速率 60、终止刷齐、replay×4、SoT 前缀≤已收）
5. 可选：若本地有 api 实流，点验观感；无则记「脚本化/单测通道」

落盘：docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_20260908_40_*.md
回填 task「自检结论」节。

禁止：扩 scope 大改实现；勿 commit/push（除非维护者另令）。

交付短报：验收勾选结果 · 命令绿/红 · 阻塞清单 · 是否建议开 PR。
````
