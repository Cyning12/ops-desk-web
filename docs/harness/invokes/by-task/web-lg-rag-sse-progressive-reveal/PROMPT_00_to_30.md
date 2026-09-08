# PROMPT · 下一棒 30 · web-lg-rag-sse-progressive-reveal

> 00 落盘：2026-09-08 · **task 表 HG-AUDIT-R1=approved**（非计划签）  
> R1：`docs/harness/reviews/task_web_lg_rag_sse_progressive_reveal_audit_R1_20260908.md` · pass-with-notes

复制区（整段粘贴）：

````text
你是 30-execute-code（Harness）。Open Folder = ops-desk-web 仓根。

开工前强制：
1. 切分支 task/web-lg-rag-sse-progressive-reveal（若不存在则从 main 创建；禁在 main 改码 · R1-N5）
2. 首输出 GATE_VERIFY 表（docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md）
3. 运行：npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md
   任一 blocks_30 闸 pending → 拒改码（TEMPLATE_30_gate_stop）

必读：
- docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md（00 定夺 · 含 R1-N1～N5）
- docs/harness/reviews/task_web_lg_rag_sse_progressive_reveal_audit_R1_20260908.md
- docs/tasks/done/task_web_lg_rag_sse_t5.md · task_web_lg_rag_sse_subtask_live.md
- src/stores/chat.ts · src/views/ChatView.vue · tests/chat-store.spec.ts

实现范围（仅 task 范围）：
- 客户端 reveal 队列：answer delta 入队匀速出队（同 tick 多帧不瞬满）
- subtask done：解析 subtask_result.output 打字机；step 即时可读；running 不变
- 终帧 content/final、done/error/abort → 刷齐已收 + 清定时器
- replay 默认 ≥4× 加速
- Vitest + ChatView 最小光标态 + 10_flow_chat 备注 + volatile 短注
- pnpm lint → test → build；./scripts/graph-compile.sh

R1 内决：N1 锁单一速率常量；N2 终止必刷齐；N3 replay 默认加速；N4 SoT 优先少动 View 绑定。

禁止：改 api、新 event_type、markdown、invoke 页、idle 数值、发明未到达文本。

落盘：docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_*_30_*.md
完成后交 40 自检或回报 verify + 测试绿。
````
