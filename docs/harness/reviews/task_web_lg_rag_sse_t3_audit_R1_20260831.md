# Task Audit R1：web-lg-rag-sse-t3

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_t3.md`（task lint **PASS** · W4 无思考轮合法豁免，task 已对齐 api T3 先例明示）  
> **SPEC**：`docs/spec/SPEC-web-lg-rag-sse-t2_v1.md`（契约不变 · T3 不新开 freeze）  
> **SPEC 审查**：不在本审查范围  
> **api 联调真值**：`ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md` §4.2 / §10.2（已核 · 跨仓只读）  
> **上游**：api T3 `task_lg_rag_session_continuity` done/ 已归档（PR #100 MERGED，已核文件存在）；web T2 `task_web_lg_rag_sse_t2` done/ completed CLOSE（PR #23 MERGED，已核文件头）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-sse-t3`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-t3` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type，对齐 api §10.2 末句，已核） |
| test_strategy | `required`（Vitest mock SSE 帧序 run.start 带 thread_id · localStorage mock · lint/test/build · graph-compile） |
| required_invoke_hats | `10,00,30,40`（20 以 reviews 落盘为硬闸，无需 invoke_20） |
| graph_change_layer | `G-L1`（`10_flow_chat` 备注 update；不新增一级模块，`01_modules.md` 零 diff） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：思考由 api 05 §10.2 + session ROADMAP 与本 task 00 定夺承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / G-L1 / test_strategy=required / 人工闸表四行齐 / wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」）。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（同 T2 R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 维护者授权代签文档闸） | **30** | graph_delta=update 且仅限 `10_flow_chat` 备注、不新增一级模块；对齐 T2 先例，授权链已在闸表说明，不阻塞 |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；待 00 依本审查结论签（维护者 2026-08-31 授权 00 代签文档闸） |
| **HG-JOINT-DEBUG** | pending | **merge** | 不属本审；**维护者亲签**（须真实联调），00 代签授权不覆盖此闸；task 三处明示 web PR 勿 auto-merge（元信息 related_pr · 00 定夺合入行 · 文末合入/联调策略） |

blocks_hats 方向正确。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽可验收；契约与 api §4.2/§10.2 逐条一致；failure_paths 覆盖 404/422/401/断网/localStorage 降级/半包外全部要点；验收标准逐项可勾选可断言（Vitest mock + 静态守卫 + lint/test/build + graph-compile）；scope 与代码现状吻合（已核 `chat.ts` / `useLgRagSse.ts`，见核对项） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 5 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 api §10.2 + 代码现状已核）

| 项 | task | 审查 |
|---|---|---|
| `src/stores/chat.ts` thread_id 状态 + run.start 捕获 | 新增 ref + localStorage 持久化/恢复 + `startNewSession()` + 404/422 清 id | 现状已核：`handleEvent` `case 'run.start'` 留占位注释「run_id / thread_id 仅日志价值（T2）」（T2 通路已开），`sendMessage` 注释明示「T2：thread_id 留空由 api 生成（run.start 返回）；多轮续写属 T3」；401 传输错误路径（清 auth 会话 + error 提示）已存在，T3 在其上扩清 thread_id 即可，最小 diff 成立 |
| `src/composables/useLgRagSse.ts` 原则上零 diff | 仅当确需暴露响应头时最小扩展 | 现状已核：`StreamLgRagInput.threadId?` 入参已存在，`if (input.threadId) body.thread_id = input.threadId` 已通；onEvent 回调透传全部事件含 run.start；零 diff 声明与代码事实吻合。响应头 `X-Ops-Lg-Rag-Thread-Id` 当前不暴露（备选校验，见 N3） |
| `src/views/ChatView.vue` 提示条 + 新会话按钮 +（可选）短码 | 最小 UI 增量 | 现状已核：`onMounted loadLatestSession()` + auth watcher 跳登录已存在；恢复提示条/新会话按钮挂 header 区即可，最小 diff 成立 |
| tests 扩展 | chat store spec mock SSE 帧序含 run.start thread_id · localStorage mock | 现状已核：`tests/chat-store.spec.ts` 已 `vi.mock` `streamLgRag` 并断言调用入参（L68–70 断言 T2 无 threadId），T3 验收第 1/2 条可直接复用该 mock 模式改造；`tests/lg-rag-sse.spec.ts` parser 单测不受影响 |
| G-L1 | `10_flow_chat` 备注 + graph-compile 绿 | tech-graph CI job 已核（`./scripts/graph-compile.sh`）；须改 yaml 再 compile，不得手改 .md（同 T2 R1 先例） |
| wiki_delta | `volatile.md` 短注 + 真值指针 | 与 wiki_delta_note 一致（短注不长文），符合仓内定制 |

### 非范围（对照审查要点七项 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| T4 replay UI | 「**T4** replay UI / seq cursor 消费 / 断线 resume」 | ✓ 在列 |
| T5 token 打字机 | 「**T5** token 打字机（answer delta）」 | ✓ 在列 |
| 切回 `/ops/chat/stream` | 「再切回 `/ops/chat/stream`；删 `useOpsChatSse` 文件（静态守卫保留）」 | ✓ 在列；验收第 8 条静态守卫绿对应 `tests/chat-stream-deprecation.spec.ts`（文件已核存在） |
| C0–C4 | 「**C0–C4** Host 沟通轨」 | ✓ 在列 |
| 改 api | 「改 `ops-desk-api` 任何代码 / 新增 GET 历史 REST（等 api 另 task）」 | ✓ 在列 |
| 历史消息回显 | 「历史消息回显（无 api 端点；恢复仅恢复**后端上下文**）」 | ✓ 在列；与 00 定夺刷新策略行（提示条文案）自洽 |
| （附加） | 改 `/lg-rag` invoke 页 · 多 tab 同步 · 多会话列表 · 重命名 | ✓ 在列；验收第 9 条 `/lg-rag` 零 diff 呼应 |

**无漏项。**

### failure_paths（对照 api §4.3/§10.2 · 审查要点五类全覆盖）

| 触发 | task 期望 | 审查 |
|---|---|---|
| 已存 id 404（跨用户/失效） | 清本地 id · 不自动重发 · 用户可见提示 | 对齐 api §10.2「跨用户 `thread_id` → 404（不注入他用户历史）」；与 00 定夺行一致 |
| 已存 id 422（非法/超长） | 同上 · 校验错误提示 | 对齐 api §10.2「超长 → 422」；防御性条目，标注正确 |
| 未登录 401 | 清本地 id + 跳登录 | 对齐 api §10.2「未登录 → 401」；现网 401 传输路径已存在（store 清 auth + ChatView watcher 跳登录），扩展点明确 |
| 断网 mid-stream | 沿用 T2 提示/timeout · 不假 replay | 对齐 api §4.3「T2=跑完不收齐」；禁止伪造 cursor/replay 语义由非范围 T4 条目兜底 |
| localStorage 不可用/被清 | 退化内存态 · 刷新即新会话 · 静默 | ✓ 在列；不 crash 与 00 定夺持久化行一致 |
| run.start 缺 `thread_id` | warn · 本轮无续写 · 不阻断 | ✓ 在列；与 id 获取钉死「捕获失败仅记 warn」一致 |
| 多 tab 并发 / api 侧压缩失败 | 允许 / web 无额外处理 | ✓ 在列；api 降级语义对齐 §10.2 |

**完整，无遗漏。**

### 契约一致性（task 00 定夺 ↔ api §4.2/§10.2）

| 钉死项 | task | api 契约 | 审查 |
|---|---|---|---|
| SoT = `thread_id` | 禁止当 chat `session_id` 用；`fetchLatestSession` 仅 T2 元数据门控 | §10.2「SoT = thread_id（**不**以 chat session_id / GET /chat/sessions/latest 为 SoT）」 | 逐字一致；§10.2 常见坑「仍依赖 chat session_id 字段语义」已被 task 钉死规避 |
| id 获取 | 客户端不自生成；首轮留空 → api 生成 → run.start payload 捕获（响应头备选） | §4.2 `run.start` 带 `run_id`/`thread_id`；§10.2 缺省生成 + `X-Ops-Lg-Rag-Thread-Id` 响应头 | 一致；§10.2 常见坑「每问新 uuid 导致无法多轮」被验收第 1 条直接断言拦截 |
| 窗口压缩参数 | 背景述 `max_full_turns=6` / `group_size=2` | §10.2 同值 | 一致（仅背景引用，非 web 实现项） |
| freeze | `lg-rag-sse-v1` 沿用 · 不新增 event_type · 不改帧序 | §10.2 末句同 | 一致 |
| 联调项 | 同 thread 续问 · 新 thread 隔离 · 超长压缩后仍 `done` · 刷新恢复 | §10.2 联调项 + §11 T3 通过标准 | 一致；第 ④ 项刷新恢复为 web 侧增量，合理 |

### test_strategy 与仓 CI 一致性

| 项 | task | CI 真值 | 审查 |
|---|---|---|---|
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | `.github/workflows/ci.yml` 三步同名同序（已核） | 一致 |
| graph-compile | `./scripts/graph-compile.sh` | `.github/workflows/tech-graph.yml`（已核） | 一致 |
| verify | `npx dsh-coding-kit verify --task ...` | harness 约定 | 一致 |
| task lint | — | 本审查实测 `task lint --file` **PASS**（W4 豁免 warn 1 条，task 已自注合法） | 通过 |

### 依赖与联调策略可执行性

- api T3 #100 MERGED：`../ops-desk-api/docs/tasks/done/task_lg_rag_session_continuity.md` 已核存在；web T2 done 文件头交叉引用 #100 一致。联调入口「api master 或本地 uvicorn + web dev proxy」与现网 `/api` Vite proxy 注释（useLgRagSse.ts）吻合，可执行。
- checklist `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` 已核存在；HG-JOINT-DEBUG 维护者亲签、web PR 勿 auto-merge 在 task 三处重复钉死，merge 闸方向正确。
- `close_pr_policy=required` 与「勿 auto-merge」自洽。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | 00 定夺写「登出 / 401 清除」本地 id，但验收仅覆盖 401 路径；auth store 登出动作（非 401 触发）的清除未列入验收与 test_strategy_note | 30 在 auth 登出路径（或登出 watcher）同步清 `ops.lg-rag.thread-id`，避免同浏览器换账号串号；建议补一条 Vitest 断言，30 内决 |
| N2 | run.start 捕获的幂等性：既有本地 id 时 api 不新生成、run.start 回显同 id；覆盖写同值无害，但 30 需保证捕获逻辑不区分「首帧/续帧」而重复触发副作用 | 捕获实现写成幂等赋值即可；测试可断言续问轮 run.start 后 localStorage 值不变 |
| N3 | 响应头 `X-Ops-Lg-Rag-Thread-Id` 备选校验当前不可达（composable 不暴露 response.headers）；若 30 决定启用需对 `useLgRagSse.ts` 最小扩展 | 建议 T3 **不做** header 校验（run.start payload 为唯一捕获点），保持 composable 零 diff，与 failure_paths「run.start 缺 id → warn 不阻断」自洽；如确需，扩展限回调增参，不破坏现有签名 |
| N4 | 「新会话」按钮与 chat session 门控的边界：`startNewSession()` 只清 lg-rag 侧状态（thread_id/消息/提示），**不应**触发 `fetchLatestSession` 新建 chat session（避免 SoT 混淆）；streaming 中点新会话的交互未定义 | 建议 streaming 中先 abort 再清，或禁用按钮；30 内决，提示条文案已在 00 定夺钉死不得擅改 |
| N5 | 验收第 7 条 thread_id 短码展示标注「（可选）」；勾选口径（可选项跳过算通过还是必须做）未定义 | 建议 30 默认实现短码展示（成本极低、利联调核对）；若跳过，40 自检时在该项注明「可选项未做」，不算验收缺口 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸清单（20 后 · 30 前）

> 维护者已于 2026-08-31 授权：**「起草 web T3 task · 授权签收所有过程文档」**（web 00 代签文档闸）。  
> 故下列签闸由 **web 00 代签**；**HG-JOINT-DEBUG（merge 闸）不在授权范围**，仍待维护者真实联调后亲签。

- [ ] 已读 R1 审查结论（本文件）
- [ ] task 人工闸表 `HG-AUDIT-R1` → approved（00 代签 · 2026-08-31）
- [ ] commit task 文档 + 本审查文
- [ ] 下发 Harness 30（invoke_30）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 5 非阻塞）；内容签收；流程闸待 00 依维护者授权代签 |
