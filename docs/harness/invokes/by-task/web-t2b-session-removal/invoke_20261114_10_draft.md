# invoke 10 · web-t2b-session-removal 立项

- 时间：2026-11-14 · 触发：维护者 m01326「继续」（goal-24fc4112 消化 T2b/ta2 衍生卡）
- 母卡：ops-desk-api draft_task_p0prime_t2b_chat_concept_cleanup.md · R4 裁定 A3 拆分 W1/W2
- 范围钉死：web 摘除 session 门控（store refs/gates + ChatView 4 处 + composer 2 处 disabled + api/chat.ts 删除 + 4 测试文件改编）
- 前置核实：iOS 无活跃消费（仅图谱 TODO 引用）；session 不参与 lg-rag 数据链（SoT=thread_id 自 T3）
