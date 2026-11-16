# R1 审查 · web-p3-t8-task-panel（20-task-audit）

- 日期：2026-11-16 · 审查帽：20（exec-p3-t8 夜间自动执行 · 维护者预授权代录 · 承 t5b/t2b 先例）
- 审查面：范围/非范围与 14-p3-schedule-taskcard-design §2/§3/§10 T8 行一致性；契约 15 §1/§3 端点 schema 逐字核对；failure_paths 覆盖；R0–R5 思考轮；图谱增量边界（无新一级模块）

## 核对记录

1. **范围一致性（核对通过）**：task 范围七项逐项映射设计稿——任务面板（§2.2 el-collapse 内嵌 ChatView · 否第四槽/侧栏/独立路由）、六态映射（§2.3 表逐词）、SSE 零新帧（§2.4 · freeze lg-rag-sse-v1 只消费）、回放 drawer（§3 · REST events 否 replay SSE）、定时子区（R2 双确认 · ElMessageBox 承 HitlApprovalView.vue:277 先例）。
2. **契约核对（通过）**：runs keyset（limit 默认 20 上限 50 · 超限 422）· events 白名单 8 值（run.start/answer/subtask.progress/node.progress/hitl.waiting/done/error/hitl.resumed · 500 截断 truncated+next_after_seq）· schedules 列表/PATCH（cancelled 终态不可逆 422）· {ok,data} 拆壳采 chatHistory unwrapData 先例 · 422 detail 逐字透传不二次包装 · humanized_display 词表与 §1.8 一致。
3. **非范围（通过）**：admin memory 页（T9 并行 · 同仓隔离 worktree）· HITL 卡片逻辑 · iOS · SSE 新帧 · 跨会话全局管理页 · 新建表单 · api 改动——六项钉死。
4. **failure_paths（通过）**：404 降级（FP-F8 同口径）· SSE/REST 竞争幂等 upsert（终态不回退）· 既有 spec 污染补 mock · 双确认取消无副作用 · cancelled 422 detail 逐字 · T9 并行隔离——六行可机检。
5. **归因纪律（通过）**：唯一真源=schedule_attribution 字段（R12）· 前缀文案仅展示。
6. **图谱（通过）**：无新一级模块/路由 · components/api/pinia 行增量备注 + 签收行（承 HG-GRAPH-MODULES 既有 approved 链）。

## 结论

**PASS · 零内容阻塞**。本审查按 20-task-audit 规程对 task 文件七项范围、六项非范围、六行 failure_paths、十条验收标准与 R0–R5 思考轮逐条核对/评审，未发现阻塞项；维护者预授权夜间自动执行，HG-AUDIT-R1 由 exec-p3-t8 代录 approved（授权锚=lead 派单「用户已预授权，不中途问问题」）。非阻塞观察：既有 chat spec 补 mock 的具体文件清单由 30 开工首步 grep 实证（NIT-1 · 不阻塞）。
