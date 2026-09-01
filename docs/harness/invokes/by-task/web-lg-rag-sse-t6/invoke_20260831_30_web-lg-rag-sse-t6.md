# Invoke：30-execute · web-lg-rag-sse-t6

> **用途**：30 实现留痕（删 chat SSE 死代码 · 弃用 chat stream 清扫）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG pending（blocks merge · 40 脚本化联调记录见 invoke_40，待维护者核签）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-lg-rag-sse-t6` |
| freeze_id | `lg-rag-sse-v1`（web 侧不改契约 · 不动） |
| git_branch | `task/web-lg-rag-sse-t6` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_lg_rag_sse_t6_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 6 note · N1–N3 随签收入 task · N4/N6 本帽落决 · N5 归 00 CLOSE） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（`01_modules.md` 零 diff · 仅 `10_flow_chat` 备注） |
| HG-JOINT-DEBUG | pending | N（blocks merge） | web PR 勿 auto-merge |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t6.md` → **VERIFY: PASS**（exit 0）。

## 30 产出（改码清单 · 严格按 00 定夺删/留清单）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/composables/useOpsChatSse.ts` | **删** | 死代码（`git rm`）；`/ops/chat/stream` 唯一代码字面量（L109 fetch · R1-N1）随删即清 |
| `tests/chat-sse.spec.ts` | **删** | 其专属对照单测（唯一活 importer）；随删减少 9 例（162→153） |
| `tests/chat-stream-deprecation.spec.ts` | 改写 | 守卫升级 R1-N2 口径：① `useOpsChatSse.ts` + `chat-sse.spec.ts` 文件缺席（existsSync）② src 全树递归扫描断言无 `/ops/chat/stream` 字面量 + 无 `useOpsChatSse`/`streamOpsChat` 符号（含注释 · 与 dist grep 同口径零误伤 · 不钉文件清单）③ 正向断言 chat store 走 `useLgRagSse`/`streamLgRag(`（防回退） |
| `src/api/chat.ts` | 改（仅头注释） | L7-8 指向将删文件的注释引导 → 历史注记（api 410 Gone · 主线 lg-rag SSE · 指向 done task t2）；`ChatSession`/`fetchLatestSession` **钉死保留 · 行为零 diff** |
| `src/composables/useLgRagSse.ts` | 改（仅头注释） | L12-13「对照/禁止 import」→ 历史注记（旧封装已随 T6 删除 · 指向 `docs/tasks/done/task_web_lg_rag_sse_t2.md`）；实现零 diff |
| `src/stores/chat.ts` | 改（仅头注释） | L183「旧封装仅留文件/单测对照」→「旧 chat stream 已弃用 · api 410 Gone · web 封装随 T6 删除」；实现零 diff |
| `AGENTS.md` | 改 | 关键入口表 L67（R1-N3）`useOpsChatSse.ts` 行改写为 `useLgRagSse.ts`（lg-rag SSE 封装 · 主 Chat 传输主线） |
| `README.md` | 改 | 技术栈/职责「Chat SSE」→ lg-rag SSE 主线 + chat stream 标弃用（api 410）；L25/L47 内决见下表 |
| `docs/_tech_graph/l1/10_flow_chat.graph.yaml` | 改 | description 追加 T6 备注（死代码已清除 · 守卫升级 · 保留 fetchLatestSession 门控）；flow 无 chat stream 符号残留（implementedBy 自 T2 起已是 lg-rag 符号 · 边标签仅 `/ops/chat/sessions/latest` 存活端点 + lg-rag 两端点）；compile 再生成 .md / graph.json；`01_modules.md` 零 diff |
| `docs/_tech_graph/l2/indexes/by_symbol.yaml` · `by_path.yaml` | 顺手清 | 本 task 删除使 `useOpsChatSse.ts` 条目**新悬空** → 按两文件自述「源：l1 implementedBy」对齐真值：`streamOpsChat`→`streamLgRag`、`SseFrameParser`→`LgRagSseFrameParser`，并补齐 T4 起缺的 `replayLgRag`/`resumeFromCursor`（兼清 R1-N4 脱节 · version→2026-08-31；CI 不校验 l2，graph-compile 不受影响） |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（清除清单 + 真值指针：本 task + api 05 §10.5） |

## R1 非阻塞 note 落决

| # | 决策 |
|---|---|
| N1 | **照做**：无命名常量（CHAT_STREAM 类符号全仓零命中），唯一字面量随删文件即清；无需额外常量移除 |
| N2 | **照做**：守卫取最简一致口径——src 全树（含注释）无 `/ops/chat/stream` 字面量；故 src 注释历史注记一律不带路径字面量（与 dist grep 同口径，零误伤） |
| N3 | **照做**：AGENTS.md L67 改写为 `useLgRagSse.ts` 行（不整行删，保留 composables 导航价值） |
| N4 | **顺手清**：本 task 删除致 l2 indexes `useOpsChatSse.ts` 条目新悬空 → 两 index 对齐 l1 implementedBy 真值（兼清 T2 起脱节）；**遗留**：`docs/_tech_graph/l0/00_main.graph.yaml` L111 边标签 `POST /api/ops/chat/stream` 自 T2 起脱节，但本 task graph_delta 钉死仅 `10_flow_chat` → 不动，归 00 后续图谱 task |
| N5 | 非本帽：§2 行 2 由 00 在 CLOSE 回填 |
| N6 | **内决**：README L25 旧 SSE 设计文档指针 → 替换为 api `05_lg_rag_transport_and_session_plan_v0.md`（现行主线契约）并注旧文档弃用存档；L47 `api-auth-chat.md` **保留**（auth / chat session 元数据端点仍有效）+ 标注其 chat stream 章节已弃用（api 410） |

## 非范围遵守

- 未改 ops-desk-api 任何代码；未删/改 `fetchLatestSession` · `ChatSession` · `/chat/models` · `/chat/sessions/latest` 相关封装；未碰 C0–C4 / iOS；未改 lg-rag SSE 行为（T2–T5 语义不动）；`LgRagView.vue` 零 diff
- `src/stores/chat.ts` / `src/composables/useLgRagSse.ts` / `src/api/chat.ts` 实现**零 diff**（仅注释）；`docs/_tech_graph/l1/01_modules.md` 零 diff；freeze `lg-rag-sse-v1` 不动
- 测试纪律：守卫改写后即跑 `pnpm test` 全绿（22 files / 153 tests）；历史 done/review/invoke/档案文档中的 chat stream 提及按 failure_paths「仓内历史档案不追」不动
