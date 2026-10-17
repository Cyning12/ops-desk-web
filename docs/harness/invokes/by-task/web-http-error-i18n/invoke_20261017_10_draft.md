# Invoke · hat 10 · web-http-error-i18n · task 落稿（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10（task 起草 · web 00 委派） |
| **task_slug** | `web-http-error-i18n` |
| **分支** | `task/web-http-error-i18n-draft`（草稿评审用 · base main · 零 src/ 改码） |
| **启动令** | 维护者令「继续下一个task」（00 代录 HG-TASK-DRAFT） |
| **需求源** | `docs/harness/invokes/by-task/web-tenant-context-chat/invoke_20261017_40_cross_tenant_verify.md` §5 观察项（UI 403 错误条直显 `tenant_header_mismatch` 机器串 · PR #77 备录） |
| **结论** | **落稿完成** —— task lint PASS · 双闸 pending 待人签 · 30 拒开工 |

---

## 1. 真值亲读清单（禁信转述）

- `AGENTS.md`（仓纪律 · Harness 元信息字段 · 人工闸表格式）
- 格式锚 `docs/tasks/done/task_web_hitl_fobs_receipt.md`（三裁定节 / failure_paths 表 / 验收 / R0–R5 写法）
- 前端锚点：`src/stores/chat.ts`（:831-838 live else · :823-830 live 422 拼接 · :1049-1085 chase（409 退避 FP-H2）· :1155-1173 resume replay · :1310-1360 decideHitl resume · :1314 子串判据）· `src/composables/useLgRagSse.ts:236-256`（非 2xx 分类 detail 原文透传）· `src/views/ChatView.vue:273-291`（el-alert title `[stage] message`）
- 后端 detail 枚举亲读（api master HEAD d3fd056）：`tenant_context.py:40/51/53`（unknown_tenant:<id> · tenant_header_mismatch）· `lg_rag/router.py:205/403/419/425`（Thread not found · invalid cursor · Run is still in flight;… · Run not found）· `history_router.py:41/88/122/151`（invalid cursor · Thread not found · History aggregation timeout）
- 既有断言面：`tests/chat-store.spec.ts:311/474-520/693-765` · `tests/chat-store-hitl.spec.ts:1050-1051/1138` · `tests/lg-rag-sse.spec.ts:241/447/463`
- Vitest 基线实跑（main）：283 例 = 282 绿 + 1 既有红 `hitl-decision-surface-guards.spec.ts` TC13(b)（guard 断言 useLgRagSse 对 main diff 必含 retryAfterSeconds 增行 · 仅 decision-surface 本支成立 · CI 浅克隆 skip 留痕）——已写入 test_strategy_note 与 FP-7（**本 task 禁修 · 修复另立 task 报回 00**）

## 2. 三裁定（20 R1 核对 · 维护者签认后生效）

- **A · detail 映射表 + helper**：`localizeHttpErrorDetail` 落 `src/stores/httpErrorI18n.ts`（pinia glob 内零图谱改动）· 七枚举映射 · 未命中原文兜底（禁吞错）· 空串进空出
- **B · 仅呈现面接入**：映射仅在写 `error.value` 时应用（chat.ts 七落点）· 判据输入零触达（:1314 子串 / useLgRagSse 分类 / freeze lg-rag-sse-v1 全不动）
- **C · stage 前缀渲染层中文化**：ChatView.vue:279 `[http]` → 中文标签 · store state stage 字面不动（断言零回归）

## 3. 质量门与闸态

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_http_error_i18n.md` | **PASS**（EXIT=0 · 落稿实跑） |
| `docs/tasks/active/README.md` | 已加行（状态：10 落稿 · 待 HG-AUDIT-R1 人签） |
| HG-TASK-DRAFT | **approved**（维护者令「继续下一个task」· 00 代录） |
| HG-AUDIT-R1 / HG-GRAPH-MODULES | **pending**（禁代签 · 待人签 · 30 拒开工） |
| git | `task/web-http-error-i18n-draft` 提交 task + README + 本 invoke · push · 不开 PR 不合并 · 零 src/ 改码 |

## 4. 下一棒建议

20-task-audit R1：重点核对三裁定（尤其裁定 C stage 前缀是否越出观察项范围 · 裁定 B 判据零污边界）· failure_paths FP-5/FP-7 · 验收可测性（TC1 helper 直测四组 · TC2 锁存断言零松动）。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 10 落稿：锚点全亲读 · R0–R5（early_stop at R5）· lint PASS · 双闸 pending |
