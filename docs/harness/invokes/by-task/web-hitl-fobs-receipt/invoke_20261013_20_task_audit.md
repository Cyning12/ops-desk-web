# Invoke：web-hitl-fobs-receipt · 20-task-audit R1（2026-10-13）

| 字段 | 值 |
|------|-----|
| **hat_id** | 20-task-audit |
| **task** | docs/tasks/active/task_web_hitl_fobs_receipt.md |
| **分支** | task/web-hitl-fobs-receipt（纪律：全程零 git 命令 · 零 src/tests 改动 · 不代签 human_gate） |
| **审查范围** | 验收 TC1–TC5 可机断性 · failure_paths FP-1–FP-8 兜底真实性 · 范围/非范围边界 · 三裁定（A 裁 latency_ms 假值 / B 留 model 零改动 / C 409 现状已足 · Retry-After 增强非范围）· 思考轮 R0–R5 与 early_stop · 锚点 8 组字面核对（chat.ts:171-174/:727-729/:730-735/:898-926 · ChatView.vue:260-264 · useLgRagSse.ts:225-235 · chat-store-hitl.spec.ts:182-199）· T-W2 链闭环与菜谱可复用性 · 后端契约真值对照（api task + 40 invoke 亲读） |
| **落盘** | 审查文 `docs/harness/reviews/task_web_hitl_fobs_receipt_audit_R1_20261013.md`（required_invoke_hats 含 20 · 本 invoke 与之配对） |

## 独立实证（只读 · 本帽实跑）

- `npx spec-wave task lint` 独立重跑：**LINT: PASS · EXIT=0**
- Vitest 基线 grep 实测：**252 条 it / 31 spec 文件 / chat-store.spec.ts 65 条**（FP-5 闸钉死值为真）
- 旧测 grep 影响面（K7）：缺键兜底断言唯一落点 = chat-store-hitl.spec.ts:199（task 圈定完备 · 无漏网）
- 锚点 8 组逐字亲读：**全部属实**（行号与字面零偏差；Retry-After 响应头全文零读取实证 · `postLgRagSse` 函数 :158 在案）
- 后端真值亲读：api task TC1–TC5 全勾 · 135574ms · 409+Retry-After:2+detail 文案 · 无 model 键（FP-1 钉案）· 环境三坑表逐字一致

## 结论指针

**内容 PASS（零阻塞）· NIT-1/2/3 非阻塞 · HG-AUDIT-R1 / HG-GRAPH-MODULES 维持 pending 待人签（本帽不代签 · 未附 30 Prompt）**——逐条核对与签闸清单真值见审查文 `docs/harness/reviews/task_web_hitl_fobs_receipt_audit_R1_20261013.md`。

### NIT 摘要（非阻塞）

- NIT-1：api 40 invoke（14:28）记 origin/master=`acac5e6`+PR #248，本 task 记 `9ee928c`+#248/#249——时序可解释（#249 后并入）但禁 git 无法机验；契约行为已由附件钉死不受影响，请维护者签闸时确认。
- NIT-2：建议 30 在 tests/chat-view.spec.ts 组件层补缺键显「—」断言（或 40 live 实录替证）。
- NIT-3：菜谱脚本携 T-W2 历史 run id，40 复用须换新 run 实测值。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-13 | 20 R1 落盘：内容 PASS 零阻塞 · 审查文 + 本 invoke 齐备（required_invoke_hats=10,20,30,40 中 10/20 已落 · 30/40 待闸后/并行推进） |
