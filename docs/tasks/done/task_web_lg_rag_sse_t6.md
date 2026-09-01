# Task：Web · lg-rag SSE T6 · 删 chat SSE 死代码（弃用 chat stream 清扫）

> **状态**：completed（2026-08-31 CLOSE · PR [#29](https://github.com/Cyning12/ops-desk-web/pull/29) MERGED · HG-JOINT-DEBUG 凭 40 脚本化联调证据过 · 00 统筹归档）  
> **类型**：清扫 / 死代码移除（跨仓收尾）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现 · **禁止 ops-desk-api Agent 改本仓 Vue/TS**  
> **上游 Spec**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §10.5（T6 已回写实现句）  
> **上游 api task**：[`task_lg_rag_deprecate_chat_stream`](../../../ops-desk-api/docs/tasks/done/task_lg_rag_deprecate_chat_stream.md) · api PR [#108](https://github.com/Cyning12/ops-desk-api/pull/108) **MERGED**（`/api/ops/chat/stream` → 410 Gone）  
> **上游 Prompt**：api 00 [`PROMPT_web_00_t6_remove_chat_sse`](../../../ops-desk-api/docs/harness/invokes/by-task/_prompts/PROMPT_web_00_t6_remove_chat_sse.md)  
> **就绪闸**：api [`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §2 · 行 1 已勾（api+web T5 CLOSE）· 行 2 维护者下线窗口 = api T6 合入即放行（本 task 依维护者令「api-T6已完成」开工）  
> **前置**：web T5 CLOSE · [`task_web_lg_rag_sse_t5`](../done/task_web_lg_rag_sse_t5.md) · web PR [#28](https://github.com/Cyning12/ops-desk-web/pull/28) MERGED  
> **人工 checklist**：[`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md) §5（T6 段）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-t6` |
| **git_branch** | `task/web-lg-rag-sse-t6` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 20 R1 审 → 30 实现 → 40 自检；api 仓只读契约，**不改 api 码** |
| **test_strategy** | `required` |
| **test_strategy_note** | 静态守卫改写（文件缺席 + 无 `/ops/chat/stream` 活引用断言）；既有全套不破；`pnpm lint/test/build`；`./scripts/graph-compile.sh`；联调 = grep + dist bundle 无 chat stream 路径 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | `10_flow_chat` 备注：chat SSE 死代码已清除（T6）；不新增一级模块；若 flow 残留 chat stream 引用同步删 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：死代码清除清单 + 真值指针（本 task + api 05 §10.5）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（web 侧不改契约；api 410 契约已 freeze 于 api T6） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者令「api-T6已完成」放行 + 既定授权签收过程文档 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· graph_delta=update 限 `10_flow_chat` 备注 · 不新增一级模块 |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 代签（维护者授权）· R1 审 [reviews/task_web_lg_rag_sse_t6_audit_R1_20260831.md](../../harness/reviews/task_web_lg_rag_sse_t6_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 6 非阻塞 note（N1–N3 已随签收入 task · N4 l2 indexes 脱节入遗留 · N5 §2 行 2 由 00 在 CLOSE 回填 · N6 由 30 内决） |
| **HG-JOINT-DEBUG** | approved | **merge** | 2026-08-31 · web 00 凭 [invoke_40](../../harness/invokes/by-task/web-lg-rag-sse-t6/invoke_20260831_40_web-lg-rag-sse-t6.md) 脚本化证据签收（双通道之脚本化通道）：dist 全产物 `/ops/chat/stream` · `chat/stream` · `streamOpsChat` 零命中 · src 全树零命中（守卫 CI 常驻） |

---

## 背景与目标

api T6（PR #108 已 MERGED）：`POST /api/ops/chat/stream` → **410 Gone**（JSON 迁移指针 + `Deprecation: true` + `Link` successor-version 头）；**保留** `GET /chat/models` · `GET /chat/sessions/latest` · WS `/chat/ws` 行为不变；api 侧不删 chat 代码/图/表。

web 自 T2 起主 Chat 走 lg-rag SSE，`useOpsChatSse` 已成死代码（仅文件 + 单测对照 + 静态守卫保留）。本 task **删除死代码**、移除 chat stream API 常量、更新 README，并把静态守卫从「禁止 import」升级为「文件缺席 + 无活引用」。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| 删除 | `src/composables/useOpsChatSse.ts` · `tests/chat-sse.spec.ts`（其专属对照测试） |
| 保留 | `src/api/chat.ts` 的 `fetchLatestSession` / `ChatSession`（api `GET /chat/sessions/latest` **未下线**，T3 元数据门控仍依赖）；`/chat/models` 若有引用同样保留 |
| 常量 | `/ops/chat/stream` 无命名常量、实为字面量（`useOpsChatSse.ts` L109 fetch · R1-N1）——随删即清；`src/stores/chat.ts` L7-8 等注释引导同步改写 |
| 静态守卫 | `tests/chat-stream-deprecation.spec.ts` 改写为（R1-N2 口径）：① `useOpsChatSse.ts` 文件缺席 ② src 全树 `/ops/chat/stream` **字面量缺席**（与 dist grep 一致 · 零误伤 · 注释提及亦须改写指向 lg-rag 主线） |
| 引用清理 | `useLgRagSse.ts` 等注释中对 `useOpsChatSse` 的「对照」提及改为历史注记（指向 done task/PR） |
| README | 传输主线钉为 lg-rag SSE；chat stream 标为已弃用（api 410） |
| freeze | web 侧不改契约；freeze `lg-rag-sse-v1` 不动 |
| 模块 | 不新增一级模块；`01_modules.md` 零 diff；`10_flow_chat` 仅备注（若 flow 残留 chat stream 符号引用则同步删） |
| 合入 | web PR **勿 auto-merge**；HG-JOINT-DEBUG 过后方可 merge |

---

## 范围

- 删 `src/composables/useOpsChatSse.ts` · `tests/chat-sse.spec.ts`
- `src/api/chat.ts`：移除 chat stream 常量（保留 `fetchLatestSession` 等存活端点封装）
- `tests/chat-stream-deprecation.spec.ts`：守卫改写（文件缺席 + 无活引用）
- 注释/文档引导清扫：`useLgRagSse.ts` · `src/stores/chat.ts` 等对旧 chat SSE 的对照提及改历史注记
- `AGENTS.md` 关键入口表（L67 `useOpsChatSse` 行 · R1-N3）：删后悬空须同步移除/改写
- `README.md`：传输主线 = lg-rag SSE
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md）备注 + `graph-compile` 绿
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- api 实现 / 改 `ops-desk-api` 任何代码（410 契约已 freeze）
- 删/改 `fetchLatestSession` · `/chat/models` · `/chat/sessions/latest` 相关封装（api 侧未下线）
- **C0–C4** Host 沟通轨 · iOS（若仍用 chat 须另仓 task）
- 改 lg-rag SSE 行为（T2–T5 已交付语义不动）
- 改 `/lg-rag` invoke 页（零 diff）
- 生产监控告警配置（联调项「无 404 洪流」以代码侧无请求发起来承载）

---

## 验收标准

> 完成态（30 交付时逐项勾选；联调项由 HG-JOINT-DEBUG 承载）：

- [x] `useOpsChatSse.ts` 与 `tests/chat-sse.spec.ts` 已删除（`git rm` · 守卫断言文件缺席 ✅）
- [x] src 全树 grep 无 `/ops/chat/stream` 活引用（守卫 R1-N2 全树字面量缺席口径断言 ✅；注释引导已改指 lg-rag 主线/T2 历史注记）
- [x] `fetchLatestSession` / `ChatSession` 保留且行为不变（`src/api/chat.ts` 仅头注释改写 · chat store T3/T4/T5 既有测试全绿）
- [x] README 传输主线更新为 lg-rag SSE · chat stream 标弃用（api 410）
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿；`./scripts/graph-compile.sh` 绿；`verify` PASS
- [x] `10_flow_chat` 备注更新；`volatile.md` 短注落盘
- [x] 联调（40 脚本化记录）：dist bundle grep 无 `/ops/chat/stream` 字符串（含 `chat/stream` 子串与 `streamOpsChat` 符号零命中）· 全站无 chat stream 请求由「src 全树无字面量 → 代码侧无发起方」承载（见 invoke_40 §联调证据）

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 误删存活端点封装 | CI 测试红（chat store 用例依赖 fetchLatestSession）→ 不得合入 | 修复 | — |
| 守卫误伤注释提及 | 守卫只断言活引用/文件缺席；注释须改指 lg-rag 主线避免误导 | — | — |
| 第三方书签/旧文档指向 chat stream | 本仓文档清扫；仓外不追 | — | — |
| api 410 被前端触发 | 本 task 后前端无 chat stream 请求；若出现=回归 bug | — | — |

---

## 依赖与联调

| 依赖 | 说明 |
|---|---|
| api T6 | PR [#108](https://github.com/Cyning12/ops-desk-api/pull/108) **MERGED**（410 Gone + Deprecation 头） |
| web T2–T5 | 主 Chat 全走 lg-rag SSE；chat SSE 已无运行时使用方 |
| 联调用例 | ① 构建产物 grep 无 `/ops/chat/stream` ② 全站（Chat/lg-rag/其余页面）无 chat stream 请求 ③ 既有功能回归（lint/test/build 绿） |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t6.md
# 联调（40）：grep -rn '/ops/chat/stream' dist/ 应为空
```

---

### 自检结论

> 30/40 同上下文执行（2026-08-31 · 对齐 T5 格式）：

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ eslint 全仓无告警 |
| test | `pnpm test` | 0 | ✅ 22 files / **153** tests passed（删 chat-sse.spec 9 例：162→153；守卫改写 3 例绿；chat store T3–T5 既有例全绿 → fetchLatestSession 保留行为不变） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build（chunk 体积结构不变） |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff；graph.json 再生成） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t6.md` | 0 | ✅ VERIFY: PASS |
| 联调（40） | `grep -rn '/ops/chat/stream' dist/` | 1（零命中 = 通过） | ✅ dist bundle（含压缩产物）无 chat stream 字符串；`grep -rn 'chat/stream' dist/`、`grep -rn 'streamOpsChat' dist/` 同零命中；`grep -rn '/ops/chat/stream' src/`、`grep -rn 'useOpsChatSse\\|streamOpsChat' src/` 零命中 |

验收勾选口径：机检项 6 条由 Vitest/六闸承载；联调项由 40 脚本化记录承载（`invoke_20260831_40_web-lg-rag-sse-t6.md` §联调证据）。HG-JOINT-DEBUG：**approved**（2026-08-31 · web 00 凭 40 脚本化证据签收）。遗留（非阻塞）：l0 `00_main.graph.yaml` L111 chat stream 边标签自 T2 脱节（归后续图谱 task）；`api-auth-chat.md` chat 章节本体在 api 仓不越界。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `src/composables/useOpsChatSse.ts`（删除对象）· `src/api/chat.ts`（保留 fetchLatestSession）· `tests/chat-stream-deprecation.spec.ts`（守卫改写）
3. api `05_lg_rag_transport_and_session_plan_v0.md` §10.5（只读契约 · 410 语义与保留端点清单）
4. api 00 `PROMPT_web_00_t6_remove_chat_sse`（范围建议）
5. `docs/tasks/done/task_web_lg_rag_sse_t2.md`（T2 切流决策史 · 注释引导改写依据）

> 思考轮：由上游 SPEC（api `05` §10.5 + api 00 Prompt）与本 task 00 定夺承载；不预置 R0–R5（lint W4 合法，对齐 T3–T5 先例）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者令「api-T6已完成」放行 · WAVE_READINESS §2 行 1 已勾（api+web T5 CLOSE）· api T6 #108 MERGED（410 Gone）· HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 |
| 2026-08-31 | **20** R1 pass-with-notes（0 阻塞 / 6 note）→ **00** 代签 HG-AUDIT-R1 · N1 字面量随删即清 · N2 守卫取全树字面量缺席口径 · N3 AGENTS.md 入口表纳入范围 · 闸全开可派 30 |
| 2026-08-31 | **00 CLOSE**：HG-JOINT-DEBUG 凭 invoke_40 证据签收 → PR #29 MERGED → 验收 7/7 · KPI 100 · 归档 done/ · checklist §5 勾选 · WAVE_READINESS §2 行 2 回填 |
| 2026-08-31 | **30/40** 交付：删 `useOpsChatSse.ts` + `chat-sse.spec.ts`；守卫改写（文件缺席 + src 全树字面量缺席 · N2 口径）；注释历史注记化（api/chat.ts · useLgRagSse.ts · stores/chat.ts）；AGENTS.md L67 改写（N3）；README 主线钉 lg-rag SSE（N6 内决：L25 换 lg-rag 契约指针 · L47 保留并注弃用章节）；`10_flow_chat` 备注 + l2 indexes 顺手对齐 l1 真值（兼清 N4 脱节：本 task 删除致 `useOpsChatSse.ts` 条目新悬空 → 重指 useLgRagSse 符号）；六闸全绿 + dist grep 零命中（联调脚本化留证）· invoke_30/40 落盘 |

## 合入 / 联调策略

- web PR：**勿 auto-merge**（close_pr_policy=required）
- api 已先合（#108 MERGED · 410 已生效）；web 合入前须 HG-JOINT-DEBUG 过（40 脚本化记录：dist grep 无 chat stream · 或维护者亲签）
- 联调通过标准：全站无 chat stream 请求 · 无 404/410 洪流（代码侧无发起方即满足 · 对齐 api `05` §10.5）

---

### KPI

Task_KPI%: 100

| 维 | 分 |
|---|---|
| D1 完成度 | 5 |
| D2 可验证 | 5 |
| D3 范围纪律 | 5 |
| D4 摩擦记录 | 5 |
| D5 文档对齐 | 5 |

---

### 经验沉淀（recommended）

- 死代码清除波先落「静态守卫（禁止 import）」隔波再删（T2 守卫 → T6 删除），两波间任何误引都被 CI 当场拦截——两阶段退役模式可复用。
- 守卫终态口径取「文件缺席 + 全树字面量缺席」（R1-N2）：与 dist grep 同口径、零误伤、CI 常驻。
- 删除类 task 的引用点排查先做「唯一活 importer」实测（本波 = 其专属 spec），可把清扫范围收敛到最小集。
- Wiki: `docs/coding_wiki/volatile.md`（见 wiki_delta_note）。

---

## CLOSE

| 项 | 值 |
|---|---|
| 日期 | 2026-08-31 |
| web PR | [#29](https://github.com/Cyning12/ops-desk-web/pull/29) MERGED |
| 联调 | HG-JOINT-DEBUG approved · web 00 凭 invoke_40 脚本化证据签收（dist/src 零命中 A–C） |
| 交付 | 删 `useOpsChatSse.ts` + `chat-sse.spec.ts` · 守卫改写（缺席断言）· 注释历史注记化 · AGENTS.md/README 更新 · l2 indexes 对齐 |
| 归档 | `docs/tasks/done/task_web_lg_rag_sse_t6.md` |
| 系列终态 | **lg-rag SSE T2–T6 全波 CLOSE**（web #23/#25/#26/#28/#29 · api #97/#100/#103/#105/#108）· freeze `lg-rag-sse-v1` 全程未变 |
| 下一棒 | 图谱债务：l0 `00_main.graph.yaml` L111 chat stream 边标签脱节（另 task）· C0–C4 Host 轨属 api/工作区（web 不涉及） |
