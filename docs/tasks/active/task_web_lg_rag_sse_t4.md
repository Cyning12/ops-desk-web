# Task：Web · lg-rag SSE T4 · 断联 / replay（cursor 续看 · seq 去重）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：传输 / SSE resume（跨仓联调）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现 · **禁止 ops-desk-api Agent 改本仓 Vue/TS**  
> **上游 Spec**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §4.2 · §10.3（T4 已回写实现句）  
> **上游 api task**：[`task_lg_rag_sse_resume`](../../../ops-desk-api/docs/tasks/done/task_lg_rag_sse_resume.md)（已归档 done/ · R1-N1 修正）· api PR [#103](https://github.com/Cyning12/ops-desk-api/pull/103) **MERGED**（api-only 先合已执行）  
> **前置**：web T3 CLOSE · [`task_web_lg_rag_sse_t3`](../done/task_web_lg_rag_sse_t3.md) · web PR [#25](https://github.com/Cyning12/ops-desk-web/pull/25) MERGED（稳定 thread_id 已可用）  
> **人工 checklist**：[`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md) §3（T4 段）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-t4` |
| **git_branch** | `task/web-lg-rag-sse-t4` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 10 task 审 → 20 R1 审 → 30 实现 → 40 自检；api 仓只读契约，**不改 api 码** |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest mock SSE 帧序（含顶层 cursor）；断言 active-run 持久化/终态清除 · replay body `{run_id, after_seq}` · 同 run_id+seq 去重不重复 append（尤其 answer）· 404/422 清态；`pnpm lint/test/build`；`./scripts/graph-compile.sh` |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1` |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | `10_flow_chat` 备注：断连续看 replay 路径 + seq 去重；不新增一级模块 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：cursor 续看/去重策略一句话 + 真值指针（本 task + api 05 §10.3）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**不**新开 freeze · **不**新增 SSE event_type · cursor 为帧内可选顶层字段） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者 Prompt 授权（阶段 A · 起草 web T4 task · 闸 · 派 30） |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· graph_delta=update 限 `10_flow_chat` 备注 · 不新增一级模块 |
| **HG-AUDIT-R1** | approved | **30** | 2026-08-31 · web 00 代签（维护者授权）· R1 审 [reviews/task_web_lg_rag_sse_t4_audit_R1_20260831.md](../../harness/reviews/task_web_lg_rag_sse_t4_audit_R1_20260831.md) pass-with-notes · 0 阻塞 · 6 非阻塞 note（N1–N3 已随签收入 task · N4–N6 由 30 内决） |
| **HG-JOINT-DEBUG** | pending | **merge** | T4 联调：DevTools offline → 恢复后帧不丢不重复（40 脚本化联调记录 **或** 维护者亲签）· 未过前 web PR **勿 auto-merge** |

---

## 背景与目标

api T4（PR #103 已 MERGED）交付断联/replay：live `POST /lg-rag/stream` 每帧带可选顶层 `cursor="{run_id}:{seq}"`；事件尽量落盘 `ops_lg_rag_run_events`；新 `POST /api/ops/lg-rag/replay`（body `{run_id, after_seq}` 或 `{cursor}`）SSE 重放该 run `seq > after_seq` 的已存帧（形状同 live）；断连服务端仍尽量跑完；未知/跨用户 run_id → 404 · 非法 cursor → 422 · 未登录 → 401。

web 现状（T3 后）：主 Chat 走 lg-rag SSE · 稳定 thread_id · run.start 捕获 thread_id；run_id/seq 仅日志价值未消费。本 task 让主 Chat **存最近 run 的 cursor、断网/刷新后可从 cursor 调 replay 续看、重复 seq 不重复渲染**。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| SoT | 会话 SoT 仍 **thread_id**（T3）；续看 SoT = **run_id + seq / cursor**（run 级，与 thread 正交） |
| cursor 捕获 | 每帧读可选顶层 `cursor`；缺失时以帧自带 `run_id`+`seq` 合成；per run 记 `lastSeq` |
| active-run 持久化 | `localStorage` key `ops.lg-rag.active-run` = `{run_id, last_seq, thread_id, updated_at}`；run 终态（done/error/abort）**即清除**；localStorage 不可用退化内存态 |
| 断网 mid-stream | onError(kind=network/timeout) 且已有 run_id+seq → 错误条 + **「续看」按钮** → replay 续渲染；不自动静默重试 |
| 刷新/重进 | 有未完成 active-run → 提示条「上次回答未完成」+「续看」按钮（**手动触发**，不自动 replay）；无则沿用 T3 恢复提示 |
| replay 请求 | `POST /api/ops/lg-rag/replay` · body **`{run_id, after_seq}`**（首选；`{cursor}` 为等价备选）· `credentials:'include'` · SSE 帧形状同 live → **复用同一帧解析/渲染管线** |
| 去重 | per run_id 记 `lastAppliedSeq`；`seq <= lastAppliedSeq` 的帧忽略；**answer 不重复 append**（整段覆盖语义幂等但仍按 seq 去重）；thinking 块同帧不重复入列 |
| replay 失败 | 404（未知/跨用户 run）→ 清 active-run + 提示「已无法续看」；422 → 同上；401 → 清 + 跳登录；replay 网络错 → 保留 active-run 可再点「续看」 |
| live 401 | 同步清 thread_id（T3）**且清 active-run**（R1-N3 钉死）· 跳登录 |
| freeze | 沿用 `lg-rag-sse-v1`；不新增 `event_type`；不改帧序 |
| 模块 | 不新增一级模块；`01_modules.md` 零 diff；仅 `10_flow_chat` 备注 |
| 合入 | web PR **勿 auto-merge**；HG-JOINT-DEBUG 过后方可 merge |

---

## 范围

- `src/stores/chat.ts`：run_id/seq/cursor 捕获（含 run.start 起记 run）· active-run 持久化/终态清除 · `resumeFromCursor()`（replay 续看）· seq 去重 · replay 404/422/401 处理
- `src/composables/useLgRagSse.ts`：新增 `replayLgRag({run_id, after_seq})`（或等价；**复用** `LgRagSseFrameParser` 与回调形状）；live 侧零破坏
- `src/views/ChatView.vue`：断连「续看」条 + 刷新「上次回答未完成·续看」条（Element Plus · 水墨风）
- `tests/`：replay spec（mock 帧序含 cursor · 去重 · after_seq body · 404/422）+ 既有测试全套不破（137 例 · 其中 chat-store 22 例，R1-N2 口径修正）
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md）备注 + `graph-compile` 绿
- `docs/coding_wiki/volatile.md`：本 task 短注

## 非范围

- api 实现 / 改 `ops-desk-api` 任何代码
- **T5** token 打字机（answer delta 多帧）
- **T6** 删 `useOpsChatSse` 死代码 / chat stream 常量
- **C0–C4** Host 沟通轨
- 改 `/lg-rag` invoke 页（非流式 invoke 无 replay 语义，保持零 diff）
- 多 run 并行管理 / replay 时间轴 UI / 历史列表
- 服务端 cancel（api 钉死：断连仍跑完）
- 自动 replay（本波手动「续看」触发）

---

## 验收标准

> 完成态（30 交付时逐项勾选；联调项由 HG-JOINT-DEBUG 承载）：

- [x] live 帧 `cursor`（或 run_id+seq 合成）捕获并持久化 active-run；run 终态（done/error/abort）即清除（Vitest 断言）
- [x] 断网/超时 mid-stream → 错误条 + 「续看」按钮；点击后 replay body = `{run_id, after_seq: lastSeq}`（Vitest 断言 fetch 入参）
- [x] replay 帧复用同一渲染管线；**同 run_id+seq 去重不重复 append**（answer 不重复 · thinking 不重复；断言）
- [x] 刷新/重进：有未完成 active-run → 「上次回答未完成·续看」条；无则 T3 恢复提示；终态后不再出现
- [x] replay 404/422 → 清 active-run + 用户可见提示；不自动重试；401 → 清 + 跳登录
- [x] replay 流中途再断 → lastSeq 已推进 · 可再点「续看」接力
- [x] `useOpsChatSse` 静态守卫绿 · `/lg-rag` invoke 页 **零 diff**
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿；`./scripts/graph-compile.sh` 绿；`verify` PASS
- [x] `10_flow_chat` 备注更新；`volatile.md` 短注落盘
- [x] 联调（40 脚本化记录 · 证据见 invoke_40 §联调证据）：mid-stream 断连 → replay 补发漏收帧（不丢不重复、严格递增）；完整 run 可 replay 至 `done`；404/401/422/空流边界实测。**api 侧发现**：客户端断开即取消 SSE generator，已 yield 帧落盘但后续帧（含 done）不再产生——「断连期间跑完 replay 至 done」仅在服务端先于断开跑完时成立（见 invoke_40 遗留）

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| live 断网/超时 mid-stream | 错误条 + 「续看」按钮；不假 replay | 手动续看 | 连接中断提示 |
| replay 404（未知/跨用户 run） | 清 active-run；不自动重试 | 否 | 「已无法续看」 |
| replay 422（非法 cursor，防御） | 同上 | 否 | 校验错误提示 |
| replay 401 | 清 active-run + 跳登录 | 重登后新问 | 登录过期提示 |
| replay 网络错 | 保留 active-run；可再点续看 | 是 | 网络错误提示 |
| replay 流再断 | lastSeq 已推进；接力续看 | 是 | 连接中断提示 |
| 断连期间 run 已 done | replay 补发含 done → 正常收尾 | — | 无（正常完答） |
| localStorage 不可用 | 内存态；刷新即失 active-run | — | 无（静默降级） |
| 半帧/坏 JSON 行 | 沿用 T2 解析器：缓冲/跳过不 crash | — | 无 |

---

## 依赖与联调

| 依赖 | 说明 |
|---|---|
| api T4 | PR [#103](https://github.com/Cyning12/ops-desk-api/pull/103) **MERGED**；联调对 api master 或本地 `uvicorn` + web dev proxy |
| web T3 | PR [#25](https://github.com/Cyning12/ops-desk-web/pull/25) MERGED（稳定 thread_id；replay 为 run 级与其正交） |
| 契约 | `lg-rag-sse-v1`；live 帧可选顶层 `cursor`；replay 形状同 live；404/422/401 语义 |
| 联调用例 | ① DevTools offline mid-stream → online → 续看：帧不丢不重复 ② 断连期间服务端跑完 → replay 至 `done` ③ answer 不重复 append ④ 刷新后「续看」接力 |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t4.md
```

---

### 自检结论

> 30/40 交付（2026-08-31 · 同上下文执行）：

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ |
| test | `pnpm test` | 0 | ✅ 23 files / **155** tests passed（T4 新增 18 例：chat-store +13 · lg-rag-sse replay +4 · auth-store +1；既有 137 例全绿） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t4.md` | 0 | ✅ VERIFY: PASS |

联调（HG-JOINT-DEBUG 承载 · 40 脚本化留证，详见 invoke_40）：本地 api（master · #103+#104 · 补跑 `alembic upgrade head` 落 `ops_lg_rag_run_events`）+ curl 实测 A–K 11 项全过：live 帧顶层 cursor ✓ · mid-stream kill 后 replay after_seq=1 补发 seq2,3（不丢不重复）✓ · 完整 run replay 至 done ✓ · after_seq 只重放 seq>N ✓ · 空流 0 帧 HTTP 200 ✓ · 未知 run_id 404 ✓ · 未登录 401 ✓ · 非法 body 422 ✓。web PR 仍 **勿 auto-merge**（闸表 HG-JOINT-DEBUG 待维护者核证据后签）。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `src/stores/chat.ts` · `src/composables/useLgRagSse.ts`（T3 后现状：thread_id 已稳定；run_id/seq 未消费）
3. api `05_lg_rag_transport_and_session_plan_v0.md` §4.2 · §10.3（只读契约）
4. `docs/tasks/done/task_web_lg_rag_sse_t3.md`（T3 00 定夺与恢复策略，勿回退）
5. `tests/chat-store.spec.ts` · `tests/chat-stream-deprecation.spec.ts`（静态守卫保持绿）

> 思考轮：由上游 SPEC（api `05` §10.3）与本 task 00 定夺承载；不预置 R0–R5（lint W4 合法，对齐 T3 先例）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者 Prompt 阶段 A 授权 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · api T4 #103 已 MERGED 为背景 |
| 2026-08-31 | **20** R1 pass-with-notes（0 阻塞 / 6 note）→ **00** 代签 HG-AUDIT-R1 · N1 api 指针改 done/ · N2 测试口径修正 · N3 live 401 钉清 active-run · 闸全开可派 30 |
| 2026-08-31 | **30/40** 交付：active-run 持久化/终态清除 · seq 去重 · resumeFromCursor（replay 复用同管线）· 续看双条 UI · 18 新测例（155 全绿）· 五闸全绿；R1-N4 空流保留 active-run + 提示 · N5 渲染进新建 assistant（processFrame 提取复用）· N6 abort 即终态清除（产品语义维持 00 定夺）；40 脚本化联调 11 项全过（api 侧 generator 取消发现入 invoke_40 遗留） |

## 合入 / 联调策略

- web PR：**勿 auto-merge**（close_pr_policy=required）
- api 已 api-only 先合（#103 MERGED）；web 合入前须 HG-JOINT-DEBUG 过（40 脚本化联调记录或维护者亲签）
- 联调通过标准：offline → 恢复后帧不丢不重复 · 断连跑完可 replay 至 `done` · answer 不重复 append（对齐 api `05` §10.3）
