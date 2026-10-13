# Invoke：web-hitl-fobs-receipt · 10-task 起草（2026-10-13）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10-task |
| **task** | docs/tasks/active/task_web_hitl_fobs_receipt.md |
| **分支 / HEAD** | task/web-hitl-fobs-receipt（base main @ bd4181c） |
| **来源** | 维护者启动令（2026-10-13 本窗）：T-W2 回执与 F-OBS 闭环验证 · 后端契约已收口（api origin/master=`9ee928c` · PR #248/#249） |

## 委派令工作项 → task 映射

| 启动令工作项 | task 落点 |
|--------------|-----------|
| 1. S2/S3 live 复验（徽标 latency_ms 实值 · 在飞 replay 409 到达前端） | 范围 F1/F2 · 验收 TC1/TC2（40 帽 · 纯观测可先行） |
| 2. 兜底自裁：latency_ms 兜底可裁撤 · model 兜底须保留（徽标 model「—」或裁掉展示 · 裁定留痕） | **裁定 A**（裁 `: 0` 假值 · 缺键 null/「—」）· **裁定 B**（留 model 零改动 · 维持 v-if 缺省不渲染 = 裁掉该字段展示）· 范围 F3 · 验收 TC3 |
| 3. 409 处理自裁（现状重试即可 · Retry-After 退避为增强项定范围/非范围） | **裁定 C**（现状已足 · 增强入非范围另立口）· 验收 TC2 照登面 |
| 4. 回执落盘（invoke 闭环 T-W2 链 · 双闭环证据） | 范围 F4 · 验收 TC5 |

## 亲读核真锚点（10 已读 · 禁信转述）

- `src/stores/chat.ts:171-174` `ChatDoneInfo { latency_ms: number; model: string }`
- `src/stores/chat.ts:730-735` done 分支兜底字面：`latency_ms: typeof latency === 'number' ? latency : 0` · `model: typeof model === 'string' ? model : ''`
- `src/stores/chat.ts:727-729` waiting_approval 提前 break 不记 lastDone（本 task 零触达）
- `src/stores/chat.ts:898-926` replay onError：401→auth · 404/422→清 active-run 不可重试 · **else（含 409）→ retryable 错误条 + detail 文案**（409 现落点）
- `src/views/ChatView.vue:260-264` 徽标：`完成 · 耗时 {{ latency_ms }}ms` + `v-if="chat.lastDone.model"` 模型段
- `src/composables/useLgRagSse.ts:225-235` 非 2xx → `onError{kind:'http', status, message=body.detail}`（**Retry-After 头未透传** · 裁定 C 自动退避的技术成本所在）
- `tests/chat-store-hitl.spec.ts:182-199` T-W2 兜底断言字面 `toEqual({ latency_ms: 0, model: '' })`（裁定 A 改写面 · RED 签名）
- 菜谱全组：`docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（s2_step1/s2_step2/s3_imm_step1-3/serve_8050.py/vite_proxy_smoke.sh 已读）
- 后端真值：api `task_hitl_resume_replay_contract.md`（TC1–TC5 全勾）+ `invoke_20261013_40_verify.md`（135574ms · 409+Retry-After:2 两 run 三打 · 无 model 键 · **环境三坑**：langfuse 引号 / NO_PROXY 裸 ::1 / OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS）

## 三裁定（起草裁定 · 待 20 R1 + 维护者签认）

- **A · latency_ms 兜底裁撤**：0ms 假值即 F-OBS-1 显示瑕疵本体；根因已修（契约钉 int ≥ 0）；缺键存 null · 徽标显「—」（残留面仅 pre-fix 历史旧帧 replay）。
- **B · model 兜底保留 · 零改动**：后端 FP-1 钉案永不提供（禁伪造 · 对照测试钉死）；维持 v-if 缺省不渲染（= 裁掉该字段展示）· 不显「—」（恒噪）。
- **C · 409 现状已足 · Retry-After 增强非范围**：else 分支 retryable + 后端文案 + 手动续看恢复（FP-3 缓解成立）；自动退避需动 `postLgRagSse` 响应头透传签名 → FP-5 回归面大于收益 · 另立 task 口。

## 闸状态（起草时）

- HG-TASK-DRAFT：**approved**（维护者启动令 · 本窗 10 落稿）
- HG-AUDIT-R1 / HG-GRAPH-MODULES：**pending 不代签**（须 20-task-audit R1 + 维护者签）→ **30 拒开工**
- 40 live 复验：纯观测面 · 维护者令 docs-only 先行不阻塞

## 机检

- `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_fobs_receipt.md` → **LINT: PASS · EXIT=0**（2026-10-13 落稿实跑）
- `npx spec-wave verify --target . --task docs/tasks/active/task_web_hitl_fobs_receipt.md` → 结果照登 GATE_VERIFY（R1 审查文缺失 + HG-AUDIT-R1 pending → 30 BLOCKED 为预期形态）

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-13 | 10 落稿：task v0（三裁定 · R0–R5 early_stop at R5）· lint PASS · invoke 落盘 |
