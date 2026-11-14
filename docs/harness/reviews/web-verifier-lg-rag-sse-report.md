# web-verifier 机器验证报告
## CHECKLIST_lg_rag_sse_joint_release_v1.md（web 侧未勾项）

**检查仓**：`/Users/cyning/Desktop/Ops-desk/ops-desk-web`
**检查人**：web-verifier（子 Agent，仅机器验证，未代签 human_gate，未修改源码）
**检查时间**：2026-11-09
**Checklist 源文件**：`docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`

---

## 1. 执行摘要

| 检查项 | 结果 | 说明 |
|---|---|---|
| 基础 CI（lint / test / build） | **PASS** | 使用 `pnpm --pm-on-fail=ignore` 绕过 corepack 版本检查后全部通过；裸 `pnpm` 因环境 pnpm v11.28.5 与项目要求 v10.32.1 冲突会失败，这不是代码问题。 |
| §2 T3 Session（同 thread 多轮 / 新 thread 隔离 / 刷新后行为） | **MACHINE-ASSIST** | 代码路径完整且单元测试通过，但缺少端到端多轮/隔离/刷新自动化覆盖，需后端联调或人工确认。 |
| §5.1 Idle / keepalive（api/web） | **PASS** | 配置 120s idle、comment 帧重置、实测 SSE 含 `: keepalive`；未跑满 5min（按指令不跑）。 |
| §5.1 子任务分区 / running 立即上屏 / done 合并 | **PASS** | UI 分区可见、代码立即 upsert、同 id 替换合并；Vitest 与实流 SSE 均覆盖。 |
| §5.2.2 403 租户 UX | **PASS** | header 与 session 不一致时后端返回 403 + `tenant_header_mismatch`，前端映射为中文错误条、无自动重试；有联调截图与 curl 矩阵证据。 |
| §5.2.3 维护者签核 | **HUMAN_GATE** | 仅人工可签，机器仅提供辅助证据。 |

**未发现需要修改源码才能修复的问题。**

---

## 2. 逐项证据表

### A. 基础 CI

| 命令 | 退出码 | 关键结果 | 备注 |
|---|---|---|---|
| `pnpm --pm-on-fail=ignore lint` | 0 | `$ eslint .` 无报错 | 裸 `pnpm lint` 因 corepack pnpm 版本检查失败（v11 vs v10.32.1） |
| `pnpm --pm-on-fail=ignore test` | 0 | 35 files / 357 passed / 1 skipped | 全部通过 |
| `pnpm --pm-on-fail=ignore build` | 0 | `vue-tsc --noEmit && vite build` 成功，dist 产出完整 | 仅第三方库 PURE 注释警告，不影响构建 |

相关测试文件单独运行结果：
- `tests/lg-rag-sse.spec.ts`：17 passed（含 idle 120s / keepalive 重置用例）
- `tests/chat-live-reactivity.spec.ts`：2 passed（含 running/step/done 帧渲染）
- `tests/chat-http-error-i18n.spec.ts`：9 passed（含 `tenant_header_mismatch` 映射）
- `tests/chat-store.spec.ts`：74 passed（含 403 分支、subtask reveal）
- `tests/auth-store.spec.ts`：9 passed（含登出清 thread_id）

---

### §2 T3 Session（lines 55-59）

| 子项 | 结果 | 方法 | 关键证据 |
|---|---|---|---|
| 同 thread_id 多轮上下文正确 | MACHINE-ASSIST | 代码审查 + 单元测试 | `src/stores/chat.ts:24` key=`ops.lg-rag.thread-id`；`:27-49` 读写清除 helper；`:425-429` 刷新时恢复 threadId；`:643-651` `run.start` 捕获 `thread_id` 并持久化；`src/composables/useLgRagSse.ts:145` 发送时 body 带 `thread_id`；`tests/auth-store.spec.ts:123` 通过。 |
| 新 thread 隔离 | MACHINE-ASSIST | 代码审查 + 单元测试 | `src/stores/chat.ts:961-972` `startNewSession()` 清 threadId、activeRun、messages；下轮请求不带 thread_id，后端生成新会话；`tests/auth-store.spec.ts` 通过。 |
| 刷新后会话行为符合 api T3 文档 | MACHINE-ASSIST | 代码审查 | 刷新后 `readStoredThreadId()` 恢复 ref（`:425-429`），UI 显示 `restoredNotice`；401/logout 时 `src/stores/auth.ts:72-84` 同步清除 thread-id 与 active-run，防止换账号串号。 |

**说明**：机器可确认代码路径与单元测试均通过，但 checklist 要求的是「端到端行为正确」，需要真实后端多轮对话 / 新会话 / 刷新后恢复联调才能最终签字。本仓无 Playwright/e2e 覆盖此场景。

---

### §5.1 Idle / keepalive + 子任务分区（lines 89-95）

| 子项 | 结果 | 方法 | 关键证据 |
|---|---|---|---|
| api：长节点静默期 EventStream 可见 `: keepalive`（不落盘） | PASS（api 侧由实流附件证明） | 读取联调 SSE 附件 | `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/n4_xtenant.sse` 中可见 `: keepalive` comment 帧（例如 line 28/48/956），后端协议已实现。 |
| web：client idle 120s（有字节重置），非整轮墙钟 300s | PASS | 代码审查 + 单元测试 | `src/composables/useLgRagSse.ts:115` `LG_RAG_STREAM_IDLE_TIMEOUT_MS = 120_000`；`:271-272` 任意非空 chunk（含 `: keepalive`）调用 `resetIdleTimer()`；`tests/lg-rag-sse.spec.ts:299`/`339` 通过。 |
| Chat：「编排进度」与「子任务过程」分区可见 | PASS | 代码审查 + 单元测试 | `src/views/ChatView.vue:234` "编排进度" collapse item 渲染 `message.thinking`；`:244` "子任务过程" collapse item 渲染 `message.subtasks`；`tests/chat-live-reactivity.spec.ts` 通过。 |
| 总时长 >5min 且间隔有帧/keepalive → 不 timeout | PASS（配置支持） | 代码审查 | idle 定时器在每次字节到达时重置（含 keepalive comment），因此只要流未完全静默 120s 就不会触发 client timeout。按指令未实际跑满 5 分钟。 |
| subtask.progress status=running 起步帧立即上屏；同 id done 合并单行 | PASS | 代码审查 + 单元测试 + 实流 | `src/stores/chat.ts:517-527` `upsertSubtaskBlock` 同 id 替换；`:661-677` `status==="running"` 立即 upsert；`:690-709` `status==="done"` 替换并启动 output reveal；`tests/chat-live-reactivity.spec.ts:54-136` 通过；`n4_xtenant.sse` line 17/20 出现同 subtask_id 的 running→done 帧。 |

---

### §5.2.2 403 租户 UX（lines 113-117）

| 子项 | 结果 | 方法 | 关键证据 |
|---|---|---|---|
| 头与 session 不一致 → api 403 | PASS | 读取联调附件 | `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/n1a_mismatch.hdr`：`HTTP/1.1 403 Forbidden`；`n1a_mismatch.body`：`{"detail":"tenant_header_mismatch"}`。curl 矩阵 `20261017_40_curl_matrix.sh` 第 N1a 步复现了 header=A/session=B → 403。 |
| UI 明确错误（不静默重试死循环） | PASS | 代码审查 + 联调截图 | `src/tenant.ts:5` `TENANT_HEADER = "X-Ops-Tenant-Id"`；`src/composables/useLgRagSse.ts:206` SSE 请求带该 header；`src/stores/httpErrorI18n.ts:17` `tenant_header_mismatch` → `租户状态已变化，请重新选择租户后再发送`；`src/stores/chat.ts:825-854` 403 进入 else 分支设置 `error.value`（`retryable: true`），无自动重发；`src/views/ChatView.vue:325-343` 渲染 `el-alert` 显示 `[http] tenant_header_mismatch` / `可重试：请重新发送消息`。联调截图 `20261017_40_ui_5_negative_403.png` 直接展示该错误条。 |

---

### §5.2.3 维护者签核（lines 120-122）

| 子项 | 结果 | 方法 | 关键证据 |
|---|---|---|---|
| 维护者签：租户切换联调通过 | **HUMAN_GATE** | 机器仅整理证据 | 机器不能签字。已收集的证据包括：curl 矩阵覆盖 A↔B 切换、header 与 session 一致时 200、不一致时 403、`tenant_header_mismatch` 中文映射、403 UI 截图。 |

---

## 3. 仅人工可判定的项

| 检查项 | 为什么需要人眼/产品 owner 签字 |
|---|---|
| §2 T3 Session 三项（同 thread 多轮、新 thread 隔离、刷新后行为） | 需要真实后端联调：多轮对话是否继承同一 thread_id、新会话是否生成新 thread_id、刷新后是否按 api T3 文档恢复且不泄露历史。代码与单元测试只能证明机制存在。 |
| §5.1「总时长 >5min 且间隔有帧/keepalive → 不 timeout」 | 代码配置支持，但真实 5 分钟长节点/长思考的端到端验证需要人工或自动化长时测试（按指令未跑）。 |
| §5.2.3 维护者签核「租户切换联调通过」 | 这是 human_gate，必须由维护者/产品 owner 基于 Playwright/联调结果签字；机器只能提供辅助证据。 |

---

## 4. 约束遵守声明

- ✅ 未修改任何源代码、配置文件或 checklist。
- ✅ 未在 checklist 上签字或修改勾选状态。
- ✅ 所有操作均在 `/Users/cyning/Desktop/Ops-desk/ops-desk-web` 内进行。
- ✅ 未发现需要修改源码才能修复的问题。

---

## 5. 附录：关键文件索引

| 文件 | 作用 |
|---|---|
| `src/stores/chat.ts:24-49` | thread_id localStorage 读写清除 |
| `src/stores/chat.ts:425-429` | 刷新恢复 thread_id |
| `src/stores/chat.ts:643-651` | run.start 捕获 thread_id |
| `src/stores/chat.ts:954-972` | clearThreadId / startNewSession |
| `src/stores/chat.ts:517-527` | upsertSubtaskBlock 同 id 替换 |
| `src/stores/chat.ts:661-709` | subtask running/step/done 处理 |
| `src/stores/chat.ts:825-854` | SSE 401/404/422/403 错误分支 |
| `src/composables/useLgRagSse.ts:115` | 120s idle timeout 常量 |
| `src/composables/useLgRagSse.ts:271-272` | 任意字节重置 idle timer |
| `src/composables/useLgRagSse.ts:200-209` | SSE fetch 带 tenant header |
| `src/views/ChatView.vue:234-267` | 编排进度 / 子任务过程 UI 分区 |
| `src/views/ChatView.vue:325-343` | 错误条渲染 |
| `src/stores/httpErrorI18n.ts:16-23` | 后端 detail → 中文文案映射 |
| `src/stores/auth.ts:72-84` | 登出/401 清 thread-id 与 active-run |
| `src/tenant.ts:5` | `X-Ops-Tenant-Id` 常量 |
| `tests/lg-rag-sse.spec.ts` | idle/keepalive/timeout 测试 |
| `tests/chat-live-reactivity.spec.ts` | subtask running/step/done 渲染测试 |
| `tests/chat-http-error-i18n.spec.ts` | 错误码 i18n 测试 |
| `tests/auth-store.spec.ts` | 登出清 thread_id 测试 |
| `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/n1a_mismatch.body` | 403 响应体 |
| `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/n1a_mismatch.hdr` | 403 响应头 |
| `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/n4_xtenant.sse` | 含 keepalive 与 subtask.progress 的实流 |
| `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20261017_40_ui_5_negative_403.png` | 403 UI 截图 |
| `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20261017_40_curl_matrix.sh` | 完整 curl 矩阵脚本 |