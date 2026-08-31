# Invoke：30-execute · web-lg-rag-sse-t3

> **用途**：30 实现留痕（主 Chat thread_id 会话连续性 · 稳定续问 + 刷新恢复）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG pending（blocks merge · 维护者亲签）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-lg-rag-sse-t3` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type · 不改帧序） |
| git_branch | `task/web-lg-rag-sse-t3` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_lg_rag_sse_t3_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 5 note 内决） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（`01_modules.md` 零 diff · 仅 `10_flow_chat` 备注） |
| HG-JOINT-DEBUG | pending | N（blocks merge） | web PR 勿 auto-merge |

`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t3.md` → **VERIFY: PASS**（exit 0 · pre-30 invoke 10/00 齐全 · R1 review 存在）。

## 30 产出（改码清单）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/stores/chat.ts` | 改 | `LG_RAG_THREAD_ID_STORAGE_KEY='ops.lg-rag.thread-id'` + try/catch 读写清 helper（localStorage 不可用→内存态降级）；`threadId` ref 初始读存储（恢复）+ `restoredNotice`；`run.start` 捕获 `payload.thread_id` 幂等落存（缺 id 仅 warn 不阻断）；sendMessage 带稳定 threadId（条件展开，无 id 不带键）；onError 401 清 id+清 auth；已存 id 404/422 清 id + `stage:'session'` 提示、不自动重发；`startNewSession()`（abort→清 id/消息/提示）；`dismissRestoredNotice()` |
| `src/stores/auth.ts` | 改 | `clearSession()` 同步 removeItem 同键（R1-N1 防换账号串号；直写键名避免 auth→chat 循环 import，注释交叉引用） |
| `src/views/ChatView.vue` | 改 | header「新会话」按钮 + `thread <前8位>` 短码（hover 全量）；恢复提示条 el-alert info「已恢复上次会话上下文（历史消息不回显）」可关闭 |
| `src/composables/useLgRagSse.ts` | **零 diff** | threadId 入参与 run.start onEvent 通路 T2 已存在；响应头校验不做（R1-N3） |
| `tests/chat-store.spec.ts` | 扩 | T3 describe 10 例：捕获落存/续问同 id/幂等 · 缺 id warn · 恢复+提示条+发送带 id · startNewSession 清态+下轮无 threadId · streaming 中 abort（N4）· 404/422 清 id 不重发 · 无 id 时 422 走通用错误 · 401 清 id · localStorage 抛错降级 |
| `tests/auth-store.spec.ts` | 扩 | N1 例：clearSession/logout 同步清 thread-id 键 |
| `docs/_tech_graph/l1/10_flow_chat.graph.yaml` | 改 | description 备注 T3 thread_id 持久化/恢复策略；compile 再生成 .md/graph.json |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（策略一句话 + 真值指针 task 00 定夺 + api 05 §4.2/§10.2） |

## R1 非阻塞 note 落决

| # | 决策 |
|---|---|
| N1 | **采纳**：auth `clearSession`（logout/401 共用出口）同步清 `ops.lg-rag.thread-id` + auth-store spec 断言 |
| N2 | **采纳**：run.start 捕获写成幂等赋值；测试断言续问轮回显后 localStorage 值不变 |
| N3 | **采纳建议**：不做响应头 `X-Ops-Lg-Rag-Thread-Id` 校验（run.start payload 唯一捕获点）→ `useLgRagSse.ts` 零 diff |
| N4 | **采纳**：`startNewSession()` 先 `stopStreaming()` abort 再清态；**不**触发 `fetchLatestSession`（避免 SoT 混淆）；提示条文案按 00 定夺原文 |
| N5 | **采纳**：实现 thread_id 短码展示（成本极低 · 利联调核对） |

## 非范围遵守

- 未做 T4 replay / T5 打字机；未切回 `/ops/chat/stream`；`useOpsChatSse` 静态守卫绿
- 未改 ops-desk-api；未改 `/lg-rag` invoke 页（`LgRagView.vue` / `api/lgRag.ts` 零 diff）；无历史消息回显
- `01_modules.md` 零 diff；未新增一级模块；freeze 沿用
