# R1 审查 · web-t2b-session-removal

- 审查面：范围与母卡 T2b 拆分一致性；门控摘除的行为等价性；测试改编不削弱 HITL/历史断言面
- 结论：**GO**。session 不参与 lg-rag 数据链（SoT=thread_id），摘除无功能替代需求；测试改编仅删 mock 与「无 session 忽略发送」用例，HITL/历史/续看断言全保留
- 风险记录：W2（api 410 化）须待本卡合并发布后执行——否则活跃 web 客户端 composer 被 410 卡死
