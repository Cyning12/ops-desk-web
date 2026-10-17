# Active tasks

| task | 说明 |
|------|------|
| [`task_web_tenant_context_chat.md`](./task_web_tenant_context_chat.md) | 阶段 T · Chat 请求租户上下文（注入 + 切换 UI）· **五闸全 approved · W1–W6 已勾 · 验收仅剩「跨租户负样本 × api 联调」一项 · 联调后即可 CLOSE** |

## 整理结论（2026-10-17）

- **active 仅剩 1 个**：`web_tenant_context_chat`（30 已交付 · 唯一未勾项 = 跨租户负样本 × api 联调，依赖 api 阶段 T 就绪）。
- **2026-10-17 CLOSE 迁 done/**：`web_hitl_fobs_receipt`（PR #65 已并 `aef91f3`）、`web_lg_rag_sse_continue_reply`（PR #67 已并 `028ed29`）。
- 当前分支 `main` · 与 origin/main 同步；按仓规改码须先切 `task/` 或 `fix/` 分支。
