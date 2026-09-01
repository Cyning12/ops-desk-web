# Task：Web · lg-rag SSE T5 · Token 打字机（answer delta 追加 · final 替换）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：传输 / SSE token 流（跨仓联调收尾）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现 · **禁止 ops-desk-api Agent 改本仓 Vue/TS**  
> **上游 Spec**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §4.2 · §10.4（T5 已回写实现句）  
> **上游 api task**：[`task_lg_rag_sse_token_stream`](../../../ops-desk-api/docs/tasks/done/task_lg_rag_sse_token_stream.md) · api PR [#105](https://github.com/Cyning12/ops-desk-api/pull/105) **MERGED**（api-only 先合已执行）  
> **上游 Prompt**：api 00 [`PROMPT_web_00_lg_rag_t5_typewriter`](../../../ops-desk-api/docs/harness/invokes/by-task/_prompts/PROMPT_web_00_lg_rag_t5_typewriter.md)  
> **就绪闸**：api [`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §1 · 2026-08-31 web-00 回填「可开工 web T5」（api PR #107）  
> **前置**：web T4 CLOSE · [`task_web_lg_rag_sse_t4`](../done/task_web_lg_rag_sse_t4.md) · web PR [#26](https://github.com/Cyning12/ops-desk-web/pull/26) MERGED  
> **人工 checklist**：[`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md) §4（T5 段）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-t5` |
| **git_branch** | `task/web-lg-rag-sse-t5` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 20 R1 审 → 30 实现 → 40 自检；api 仓只读契约，**不改 api 码** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest mock 帧序：delta 多帧拼接==终帧 content · content 帧全量替换（不 append）· done 后停止追加 · 与 node.progress 并存不串台 · 无 delta 帧降级 T2 整段 · replay 含 delta 复用 T4 管线；`pnpm lint/test/build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | `10_flow_chat` 备注：answer delta 打字机（delta 追加 / final 替换）；不新增一级模块 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：delta/final 分支规则一句话 + 真值指针（本 task + api 05 §10.4）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**不**新开 freeze · **不**新增 SSE event_type · answer 帧 payload 扩展 delta/final） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者令「T5已完成」放行 + 既定授权签收过程文档 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· graph_delta=update 限 `10_flow_chat` 备注 · 不新增一级模块 |
| **HG-AUDIT-R1** | pending | **30** | 待 20-task-audit R1 pass 后 web 00 代签 · review 落盘 `docs/harness/reviews/task_web_lg_rag_sse_t5_audit_R1_20260831.md` |
| **HG-JOINT-DEBUG** | pending | **merge** | T5 联调：增量拼接无乱码 · done 后停止追加 · 与 node.progress 并存不串台 · replay 含 delta（40 脚本化联调记录 **或** 维护者亲签）· 未过前 web PR **勿 auto-merge** |

---

## 背景与目标

api T5（PR #105 已 MERGED）把终答 `answer` 从整段单帧（T2）扩展为 **多帧 delta + 终帧**：aggregator 与 router `direct_answer` 的终答 LLM 逐 chunk 发 `{"delta": "<chunk>"}`（按 `seq` 有序）；节点 updates 到后发终帧 `{"content": "<full>", "final": true}`（32_000 截断沿用 · T2 兼容）；流式不可用 → 降级整段 answer（T2 行为）；basic 占位空 answer 帧（`note: no_aggregator`）不变；delta/终帧照常落盘，`/lg-rag/replay` 逐帧重放含 delta。freeze 仍 `lg-rag-sse-v1`，**不**新增 `event_type`。

web 现状（T4 后）：answer 整段覆盖渲染（`assistant.content = payloadString(event, 'content')`）。本 task 让主 Chat **打字机**：delta 追加渲染 · final 全量替换为最终态，且与 T2 整段渲染显式分支。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| 分支规则 | payload 含 `delta` 键 → **增模式**（追加到当前 assistant.content）；含 `content` 键 → **替换模式**（全量覆盖）。**禁止**把终帧 content append 到 delta 拼接结果之后（§10.4 常见坑） |
| done 语义 | `done` / `error` / abort 后**停止追加**；流结束未再见 answer 帧则保持已拼接文本 |
| 降级 | 无 delta 帧（provider 不支持流式）→ 仅收整段 content 帧 → UI 自然退化为 T2 行为，**不做**特判 |
| 占位帧 | `content` 空串 + `note: no_aggregator` 按 T2 现行为（覆盖为空 · 无 final 不做终态标记），不新增 UI 分支 |
| 并存 | `node.progress`/`subtask.progress` 照常进 thinking 块；delta 只碰 assistant.content；全程按 seq 单调处理（T4 去重沿用） |
| replay | 重放含 delta 帧，复用 T4 同一 processFrame 管线；**不改** replay 协议/语义 |
| SoT | 会话=thread_id（T3）· 续看=run_id+seq/cursor（T4）· 本波**不改** |
| freeze | 沿用 `lg-rag-sse-v1`；不新增 `event_type`（含 `answer.delta` 之类新类型） |
| 模块 | 不新增一级模块；`01_modules.md` 零 diff；仅 `10_flow_chat` 备注 |
| 合入 | web PR **勿 auto-merge**；HG-JOINT-DEBUG 过后方可 merge |

---

## 范围

- `src/stores/chat.ts`：handleEvent/processFrame 的 answer 分支（delta 追加 · content 替换 · final 语义）；流结束不再追加
- `src/views/ChatView.vue`：打字机视觉（可选最小：streaming 中答案气泡光标态；不得破坏 T2/T3/T4 既有 UI）
- `src/composables/useLgRagSse.ts`：原则 **零 diff**（事件已全量经 onEvent 上抛）
- `tests/`：chat store spec 扩展（delta 拼接==终帧 · 替换不 append · done 停追加 · 并存不串台 · 降级整段 · replay delta）
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md）备注 + `graph-compile` 绿
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- api 实现 / 改 `ops-desk-api` 任何代码（契约异议回 api 00 串行轨）
- **T6** 删 `useOpsChatSse` 死代码 / chat stream 常量
- **C0–C4** Host 沟通轨 · iOS
- `node.progress`/`subtask.progress` token 化（仅终答 answer delta）
- 改 replay 协议 / 重开 T3/T4 语义（thread_id · cursor 语义不动）
- 改 `/lg-rag` invoke 页（零 diff）
- markdown 渲染 / 代码高亮（纯文本现状保留）

---

## 验收标准

> 完成态（30 交付时逐项勾选；联调项由 HG-JOINT-DEBUG 承载）：

- [ ] answer 帧含 `delta` → 追加渲染；多帧按 seq 有序拼接（Vitest 断言中间态与最终态）
- [ ] 终帧 `content`+`final:true` → **全量替换**（断言替换后 == 终帧 content · 非 delta 拼接 + content 叠加）
- [ ] delta 拼接结果 == 终帧 content（mock 帧序端到端断言）
- [ ] `done` / `error` / abort 后不再追加（断言 done 后迟到帧被忽略）
- [ ] 无 delta 帧（仅整段 content）→ T2 行为不变（既有测试不破 + 专例）
- [ ] delta 与 `node.progress`/`subtask.progress` 并存：thinking 块与 answer 各归各位 · 不串台（断言）
- [ ] replay 续看含 delta 帧序列完整（复用 T4 管线 · Vitest 断言拼接完整）
- [ ] `useOpsChatSse` 静态守卫绿 · `/lg-rag` invoke 页 **零 diff**
- [ ] `pnpm lint` / `pnpm test` / `pnpm build` 绿；`./scripts/graph-compile.sh` 绿；`verify` PASS
- [ ] `10_flow_chat` 备注更新；`volatile.md` 短注落盘
- [ ] 联调（40 脚本化记录或维护者签）：supervisor 实流 delta 上屏无乱码 · done 后停止追加 · 与 node.progress 并存不串台 · 断连 replay 后 delta 序列完整

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 流式不可用（api 降级整段） | 仅整段 content 帧 → T2 行为 | — | 无（正常完答） |
| delta 帧乱序/重复 | T4 seq 去重挡住重复（seq<=lastAppliedSeq 忽略）；seq 单调由 api 保证，失序仅记 warn | — | 无 |
| 终帧 content 与 delta 拼接不一致 | 以终帧 content 为准（替换语义天然兜底） | — | 无 |
| 断网 mid-delta | 沿用 T4：active-run 保留 → 「续看」replay 补 delta；不假造帧 | 手动续看 | 连接中断提示 |
| replay 含 delta 再断 | lastSeq 已推进；接力续看拼接完整 | 是 | 连接中断提示 |
| 未登录 401 | 沿用 T3/T4：清 thread_id + active-run + 跳登录 | 重登后新问 | 登录过期提示 |
| 占位帧（no_aggregator） | T2 现行为（空 content 覆盖）· 无 final 不做终态标记 | — | 无 |

---

## 依赖与联调

| 依赖 | 说明 |
|---|---|
| api T5 | PR [#105](https://github.com/Cyning12/ops-desk-api/pull/105) **MERGED**；联调对 api master 或本地 `uvicorn` + web dev proxy（本地 master 已含 #103/#104/#105） |
| web T4 | PR [#26](https://github.com/Cyning12/ops-desk-web/pull/26) MERGED（cursor/replay/seq 去重管线） |
| 契约 | `lg-rag-sse-v1`；answer 帧：`delta` 追加 / `content`+`final` 替换 / 占位 note=no_aggregator；`done` 后停止追加 |
| 联调用例 | ① supervisor 实流 delta 逐帧上屏无乱码 ② done 后停止追加 ③ 与 node.progress 并存不串台 ④ 断连 replay 后 delta 序列完整 |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t5.md
```

---

### 自检结论

> 30/40 交付时回填：lint / test / build / graph-compile / verify 退出码与结论表（对齐 T4 格式）。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `src/stores/chat.ts`（T4 后现状：processFrame 已提取 · seq 去重已落 · answer 整段覆盖在 content 分支）· `src/composables/useLgRagSse.ts`
3. api `05_lg_rag_transport_and_session_plan_v0.md` §4.2 · §10.4（只读契约）· api `PROMPT_web_00_lg_rag_t5_typewriter`（分支规则表）
4. `docs/tasks/done/task_web_lg_rag_sse_t4.md`（T4 00 定夺 · 勿回退）
5. `tests/chat-store.spec.ts` · `tests/chat-stream-deprecation.spec.ts`（静态守卫保持绿）

> 思考轮：由上游 SPEC（api `05` §10.4 + api 00 Prompt）与本 task 00 定夺承载；不预置 R0–R5（lint W4 合法，对齐 T3/T4 先例）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者令「T5已完成」放行 · WAVE_READINESS §1 已回填（api #107 · 可开工 web T5）· HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · api T5 #105 MERGED 为背景 |

## 合入 / 联调策略

- web PR：**勿 auto-merge**（close_pr_policy=required）
- api 已 api-only 先合（#105 MERGED）；web 合入前须 HG-JOINT-DEBUG 过（40 脚本化联调记录或维护者亲签）
- 联调通过标准：delta 上屏无乱码 · done 后停止追加 · 与 node.progress 并存不串台 · replay 含 delta 序列完整（对齐 api `05` §10.4）
