# Task Audit R1：web-lg-rag-sse-t4

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_t4.md`（task lint **PASS** · W4 无思考轮合法豁免，task 已自注「对齐 T3 先例」，实测）  
> **SPEC**：api 契约 freeze `lg-rag-sse-v1`（T4 顶层可选 cursor 扩展 · 不新开 freeze）；本仓 `SPEC-web-lg-rag-sse-t2_v1.md`（契约不变，已核存在）  
> **SPEC 审查**：不在本审查范围  
> **api 联调真值**：`ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md` §4.2（T4 顶层 cursor 段 + T4 冻结补充）/ §10.3（已核 · 跨仓只读）  
> **上游**：api T4 `task_lg_rag_sse_resume` completed 已归档 `done/`（PR #103 MERGED，已核文件头）；web T3 `task_web_lg_rag_sse_t3` done/ completed CLOSE（PR #25 MERGED，已核文件头）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-sse-t4`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-t4` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type · cursor 为帧内可选顶层字段，逐字对齐 api §4.2 T4 冻结补充，已核） |
| test_strategy | `required`（Vitest mock SSE 帧序含顶层 cursor · replay body 断言 · 去重断言 · 404/422 清态 · lint/test/build · graph-compile） |
| required_invoke_hats | `10,00,30,40`（20 以 reviews 落盘为硬闸，无需 invoke_20） |
| graph_change_layer | `G-L1`（`10_flow_chat` 备注 update；不新增一级模块，`01_modules.md` 零 diff） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：思考由 api 05 §10.3 与本 task 00 定夺承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / G-L1 / test_strategy=required / 人工闸表四行齐 / wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」）· close_pr_policy=required 与「勿 auto-merge」自洽。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（同 T3/T2 R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 授权代签文档闸） | **30** | graph_delta=update 且仅限 `10_flow_chat` 备注、不新增一级模块；授权链已在闸表说明，不阻塞（对齐 T3 先例） |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「待 20-task-audit R1 pass 后 web 00 代签」 |
| **HG-JOINT-DEBUG** | pending | **merge** | 不属本审；40 脚本化联调记录 **或** 维护者亲签；task 三处明示 web PR 勿 auto-merge（元信息 related_pr · 00 定夺合入行 · 文末合入/联调策略） |

blocks_hats 方向正确。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽可验收；契约与 api §4.2/§10.3 逐条一致；failure_paths 九行覆盖审查要点全类；验收标准十条逐项可勾选可断言；scope 与代码现状吻合（已核 `chat.ts` / `useLgRagSse.ts` / `ChatView.vue`，见核对项）；00 定夺「终态清除 active-run」与「断连期间 done 的 replay 补发」并存逻辑自洽（见契约一致性节专项核对） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 6 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 api §10.3 + 代码现状已核）

| 项 | task | 审查 |
|---|---|---|
| `src/stores/chat.ts` run_id/seq/cursor 捕获 · active-run 持久化/终态清除 · `resumeFromCursor()` · seq 去重 · replay 404/422/401 | 在 T3 态上增量 | 现状已核：`handleEvent` `case 'run.start'` 仅捕获 thread_id，注释明示「seq/cursor 消费属 T4」（L173），run_id/seq 确未消费；localStorage 读写降级模式（`readStoredThreadId` 等 try/catch 静默降级）已存在，active-run 持久化可同构复用；401/404/422 传输错误分支（L249–272）已存在，replay 错误处理可镜像该结构，最小 diff 成立 |
| `src/composables/useLgRagSse.ts` 新增 `replayLgRag({run_id, after_seq})` 复用 parser · live 零破坏 | 新增导出函数 | 现状已核：`LgRagSseFrameParser` 为导出纯类（L59）、`LgRagSseEvent` 含可选 `run_id`/`seq`（L18–19）且 parser 透传整帧 JSON，replay 帧（形状同 live）可直接复用；`streamLgRag` 的 fetch/超时/abort/错误分类结构可复制为 replay 版，live 侧零 diff 可行 |
| `src/views/ChatView.vue` 断连「续看」条 + 刷新「上次回答未完成·续看」条 | 最小 UI 增量 | 现状已核：T3 恢复提示条（`restoredNotice` el-alert，L78–85）与错误条（L129–137）模式已存在，续看条同构挂载即可；Element Plus + 水墨风变量沿用 |
| tests 扩展 | replay spec（mock 帧序含 cursor · 去重 · after_seq body · 404/422）+ 既有例不破 | 现状已核：`tests/chat-store.spec.ts` 已 `vi.mock` `streamLgRag` 并捕获 callbacks 手工喂帧（L38–43 模式），replay spec 可同构 mock `replayLgRag`；`tests/lg-rag-sse.spec.ts` parser 单测 11 例不受影响 |
| G-L1 | `10_flow_chat` 备注 + graph-compile 绿 | tech-graph CI job 已核（`.github/workflows/tech-graph.yml` → `./scripts/graph-compile.sh`）；须改 yaml 再 compile，不得手改 .md（同 T3/T2 先例） |
| wiki_delta | `volatile.md` 短注 + 真值指针 | `docs/coding_wiki/volatile.md` 已核存在；与 wiki_delta_note 一致（短注不长文） |

### 非范围（对照审查要点六项 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| api 改码 | 「api 实现 / 改 `ops-desk-api` 任何代码」 | ✓ 在列 |
| T5 token | 「**T5** token 打字机（answer delta 多帧）」 | ✓ 在列 |
| T6 死代码 | 「**T6** 删 `useOpsChatSse` 死代码 / chat stream 常量」 | ✓ 在列；验收第 7 条静态守卫绿对应 `tests/chat-stream-deprecation.spec.ts`（文件已核存在，2 例） |
| C0–C4 | 「**C0–C4** Host 沟通轨」 | ✓ 在列 |
| /lg-rag 页 | 「改 `/lg-rag` invoke 页（非流式 invoke 无 replay 语义，保持零 diff）」 | ✓ 在列；验收第 7 条「`/lg-rag` 零 diff」呼应 |
| 自动 replay | 「自动 replay（本波手动「续看」触发）」 | ✓ 在列；与 00 定夺「手动触发，不自动 replay」「不自动静默重试」一致 |
| （附加） | 多 run 并行 · replay 时间轴 UI · 服务端 cancel | ✓ 在列；cancel 排除对齐 api §10.3「断连仍跑完（无 cancel）」 |

**无漏项。**

### failure_paths（对照 api §4.3/§10.3 · 审查要点全覆盖）

| 触发 | task 期望 | 审查 |
|---|---|---|
| live 断网/超时 mid-stream | 错误条 + 「续看」按钮；不假 replay | 对齐 api §4.3「T4 起支持按 cursor replay」；`onError kind=network/timeout` 在现有 composable 已分类（L30），按钮挂载点明确 |
| replay 404（未知/跨用户 run） | 清 active-run；不自动重试 | 逐字对齐 api §10.3「未知/跨用户 `run_id` → 404」 |
| replay 422（非法 cursor，防御） | 同上 · 校验错误提示 | 对齐 api §10.3「非法 cursor → 422」；web 首选 `{run_id, after_seq}` body 时 422 为防御性条目，标注正确 |
| replay 401 | 清 active-run + 跳登录 | 对齐 api §10.3「须登录」+ §10.2「未登录 → 401」；现网 401 跳登录链路（store 清 auth + ChatView watcher）已存在，扩展点明确 |
| replay 网络错 | 保留 active-run；可再点续看 | ✓ 在列；与「不自动重试」不矛盾（手动再点为允许路径） |
| replay 流再断 | lastSeq 已推进；接力续看 | ✓ 在列；验收第 6 条直接对应，可断言 |
| 断连期间 run 已 done | replay 补发含 done → 正常收尾 | 对齐 api §10.3「断连服务端仍尽量跑完」；与终态清除并存逻辑自洽（见下节专项） |
| localStorage 不可用 | 内存态；刷新即失 active-run；静默降级 | ✓ 在列；与 00 定夺持久化行一致，复用 T3 同构降级模式 |
| 半帧/坏 JSON 行 | 沿用 T2 解析器：缓冲/跳过不 crash | ✓ 在列；`LgRagSseFrameParser` 现状即此语义，replay 复用自动继承 |

**完整，无遗漏。**

### 契约一致性（task 00 定夺 ↔ api §4.2/§10.3）

| 钉死项 | task | api 契约 | 审查 |
|---|---|---|---|
| SoT 分层 | 会话 SoT=thread_id（T3）· 续看 SoT=run_id+seq/cursor（run 级正交） | §10.2 SoT=thread_id · §10.3 replay 以 run_id/after_seq 为键 | 一致；两 SoT 正交声明消除串用风险 |
| cursor 捕获 | 每帧读可选顶层 `cursor`；缺失时以帧自带 `run_id`+`seq` 合成 | §4.2「每帧可选顶层 `cursor="{run_id}:{seq}"`（与 run_id/seq 并列）」 | 一致；合成兜底合理（`LgRagSseEvent` 已带 run_id/seq 可选字段） |
| active-run 持久化 | localStorage `ops.lg-rag.active-run` = `{run_id, last_seq, thread_id, updated_at}`；终态即清除 | —（web 侧策略，api 不约束） | 键名与 T3 `ops.lg-rag.thread-id` 同前缀风格，无冲突 |
| replay 请求 | `POST /api/ops/lg-rag/replay` · body `{run_id, after_seq}` 首选（`{cursor}` 等价备选）· `credentials:'include'` | §10.3「body `{run_id, after_seq}` 或 `{cursor}` → 重放 `seq > after_seq`（形状同 live）」 | 逐字一致；首选/备选标注清晰 |
| 去重 | per run_id `lastAppliedSeq`；`seq <= lastAppliedSeq` 忽略；answer 不重复 append | §10.3 联调项「重复 `seq` 不重复渲染」· 常见坑「前端重复 append 同一 answer」 | 一致；answer 整段覆盖语义（chat.ts L193 现状）叠加 seq 去重双保险 |
| freeze | `lg-rag-sse-v1` 沿用 · 不新增 event_type · 不改帧序 | §4.2 T4 冻结补充「同 freeze_id · 不 silent 扩必选 event_type」 | 一致 |
| **终态清除 × replay 补发 done 并存** | 终态（done/error/abort）即清 active-run；断连期间 done → replay 补发含 done 正常收尾 | §10.3 断连跑完 + replay 至 `done` | **专项核对：无矛盾**——live 断连时客户端未见 done，active-run 保留（终态清除由「管线收到终态帧」触发而非「服务端已 done」）；replay 复用同一管线，补发的 done 帧到达即触发同一清除逻辑，收尾闭环。00 定夺「复用同一帧解析/渲染管线」一句是该并存成立的枢纽，表述充分 |
| 联调项 | offline→续看不丢不重复 · 断连跑完 replay 至 done · answer 不重复 · 刷新接力 | §10.3 联调项 + 通过标准「模拟 DevTools offline」 | 一致；④ 为 web 侧增量，合理 |

### test_strategy 与仓 CI 一致性

| 项 | task | CI 真值 | 审查 |
|---|---|---|---|
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | `.github/workflows/ci.yml` 三步同名同序（已核） | 一致 |
| graph-compile | `./scripts/graph-compile.sh` | `.github/workflows/tech-graph.yml`（已核） | 一致 |
| verify | `npx dsh-coding-kit verify --task ...` | harness 约定 | 一致 |
| task lint | — | 本审查实测 `task lint --file` **PASS**（W4 豁免 warn 1 条，task 已自注合法） | 通过 |

### 依赖与联调策略可执行性

- api T4 #103 MERGED：`../ops-desk-api/docs/tasks/done/task_lg_rag_sse_resume.md` 文件头已核（completed · PR #103）；§10.3「api 提供（2026-08-31 已实现）」与 task 背景逐句吻合（cursor / replay 端点 / 404·422·401 / 断连跑完 / 落盘失败不阻断）。联调入口「api master 或本地 uvicorn + web dev proxy」与现网 Vite `/api` proxy（useLgRagSse.ts L98 注释）吻合，可执行。
- checklist `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` §3（T4 段）已核存在（断网行为符合契约 · replay 不重复渲染同 seq · T4 CLOSE 后回填 WAVE_READINESS §1），与 task 头部引用一致。
- HG-JOINT-DEBUG（blocks merge）为 pending 且「40 脚本化联调记录 **或** 维护者亲签」双通道明确；web PR 勿 auto-merge 三处钉死，merge 闸方向正确。**未过前不可 merge 的约束可执行、无 auto-merge 歧义。**

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | task 头部第 7 行上游 api task 指针为 `../ops-desk-api/docs/tasks/active/task_lg_rag_sse_resume.md`，实际该 task 已随 PR #103 MERGED 归档至 `docs/tasks/done/`（已核：active/ 无此文件，done/ 文件头 completed） | 事实（MERGED）无误，仅路径 stale；30 或 00 顺手改指针为 done/，不算内容回填 |
| N2 | 范围 tests 行「chat store 既有 137 例不破」：实测 `tests/chat-store.spec.ts` 为 **22 例**；137 为全套口径（T3 自检回填：23 files / 137 tests passed） | 按「全套既有测试绿」口径理解即可（T3 同口径先例）；30 自检回填时建议沿用「N files / M tests」格式，勿写作 chat-store 137 例 |
| N3 | live 流 401 路径（T3 已清 thread_id + auth 会话）未钉「同步清 active-run」：若残留，刷新后出「续看」条但 replay 必再 401，用户多绕一步 | 30 在 live 401 分支同步清 `ops.lg-rag.active-run` 并补一条 Vitest 断言（对齐 T3 R1-N1 登出清除先例） |
| N4 | replay **空流**边界未定义：`after_seq` 已 ≥ 已落盘末 seq 且 run 未 done 时，replay 返回 0 帧直接 onDone——续看条是否保留、提示文案、active-run 去留均无条文 | 建议 30 内决：保留 active-run + 提示「暂无新进度，稍后再试」（与「断连仍跑完」语义自洽）；failure_paths 不强制补行，40 自检注明即可 |
| N5 | 刷新后 `resumeFromCursor()` 的渲染目标：T3 钉死历史消息不回显，messages 为空，replay 帧须渲染进**新建** assistant 消息；现 `handleEvent(event, assistant)` 绑定既有 message 引用，需 30 提取复用 | 实现上将 handleEvent 主体提取为可对新 message 调用的函数即可（纯重构，live 零破坏）；建议补「刷新后续看渲染进新消息」Vitest 断言 |
| N6 | 手动「停止」（abort）亦列入终态清 active-run——服务端仍在跑完，其结果将不可续看；此为 00 定夺明文钉死的产品语义，非矛盾，但用户可能预期「停止≠丢弃」 | 不改条文；建议联调（HG-JOINT-DEBUG）时维护者确认该语义认知一致，或 UI 在停止后 hint 一句「停止后不可续看」（30 内决，文案可后补） |

---

## 回填清单

无（零阻塞，无需回填 task；N1 路径修正可在 30 顺带提交，不属内容变更）。

---

## 维护者签闸清单（20 后 · 30 前）

> 依 task 人工闸表 `HG-AUDIT-R1` 行：「待 20-task-audit R1 pass 后 **web 00 代签**」。  
> **HG-JOINT-DEBUG（merge 闸）不在代签范围**：40 脚本化联调记录或维护者亲签，未过前 web PR 勿 auto-merge。

- [ ] 已读 R1 审查结论（本文件）
- [ ] task 人工闸表 `HG-AUDIT-R1` → approved（00 代签 · 2026-08-31）
- [ ] commit task 文档 + 本审查文
- [ ] 下发 Harness 30（invoke_30）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 6 非阻塞）；内容签收；流程闸待 00 依 task 表授权代签 |
