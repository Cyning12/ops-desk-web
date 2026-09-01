# Task Audit R1：web-lg-rag-sse-t5

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_t5.md`（task lint **PASS** · W4 无思考轮合法豁免，task 已自注「对齐 T3/T4 先例」，实测）  
> **SPEC**：api 契约 freeze `lg-rag-sse-v1`（T5 answer 帧 payload 扩展 delta/final · 不新开 freeze · 不新增 event_type）；本仓 `SPEC-web-lg-rag-sse-t2_v1.md`（契约不变）  
> **SPEC 审查**：不在本审查范围  
> **api 联调真值**：`ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md` §4.2（T5 冻结补充：客户端规则「见 delta 追加 / 见 content 全量替换 / done 后停止追加 / 禁止终帧 append 到 delta 结果」）· §10.4（已核 · 跨仓只读 · 2026-08-31 已回写实现句）  
> **上游**：api T5 `task_lg_rag_sse_token_stream` completed 已归档 `done/`（PR #105 MERGED，已核文件头）；web T4 `task_web_lg_rag_sse_t4` done/ CLOSE（PR #26 MERGED，已核文件头）；就绪闸 `WAVE_READINESS_lg_rag_sse_v0.md` §1 web-00 回填行「**可开工 web T5**」（api PR #107，已核原文）  
> **日期**：2026-08-31  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-sse-t5`（已核当前分支一致）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-t5` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type · answer 帧 payload 扩展 delta/final，逐字对齐 api §4.2 T5 冻结补充，已核） |
| test_strategy | `required`（Vitest mock 帧序：delta 拼接==终帧 · content 替换不 append · done 停追加 · 并存不串台 · 降级整段 · replay delta；lint/test/build · graph-compile） |
| required_invoke_hats | `10,00,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| graph_change_layer | `G-L1`（`10_flow_chat` 备注 update；不新增一级模块，`01_modules.md` 零 diff） |
| code_quality_bar | `L2_frontend` |
| 思考轮 | 无 R 节（W4 豁免：思考由 api 05 §10.4 + api 00 Prompt 与本 task 00 定夺承载；task lint PASS 实测） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / G-L1 / test_strategy=required / 人工闸表四行齐 / wiki_delta=volatile.md（对齐仓内定制「新 task 勿默认 n/a」，文件已核存在）· close_pr_policy=required 与「勿 auto-merge」自洽。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（web 00 · 2026-08-31） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（同 T2/T3/T4 R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（web 00 预签 · 授权代签文档闸） | **30** | graph_delta=update 且仅限 `10_flow_chat` 备注、不新增一级模块；授权链已在闸表说明，不阻塞（对齐 T3/T4 先例） |
| **HG-AUDIT-R1** | pending | **30** | **保持 pending**；本帽不签发；task 表已注明「待 20-task-audit R1 pass 后 web 00 代签」 |
| **HG-JOINT-DEBUG** | pending | **merge** | 不属本审；40 脚本化联调记录 **或** 维护者亲签；task 三处明示 web PR 勿 auto-merge（元信息 related_pr · 00 定夺合入行 · 文末合入/联调策略） |

blocks_hats 方向正确。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽可验收；分支规则（delta 增 / content 替换 / 禁止终帧叠加）与 api §4.2 T5 冻结补充 + §10.4 + api 00 Prompt 三处逐字一致、无歧义；failure_paths 七行覆盖审查要点全类（降级/乱序/终帧兜底/断网 mid-delta/replay 再断/401/占位帧）；验收标准十一条逐项可勾选可断言；scope 与代码现状吻合（已核 `chat.ts` / `useLgRagSse.ts` / `ChatView.vue`，见核对项）；00 定夺十行内部无矛盾 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 5 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 api §10.4 + 代码现状已核）

| 项 | task | 审查 |
|---|---|---|
| `src/stores/chat.ts`：processFrame/handleEvent answer 分支（delta 追加 · content 替换 · final 语义）· 流结束不再追加 | 在 T4 态上增量 | 现状已核：`processFrame`（L282–300）已提取为 live/replay 统一帧入口，seq 去重（`seq <= lastAppliedSeq` 忽略）已落；answer 分支现为 `case 'answer': assistant.content = payloadString(event,'content')`（L324–327 · 注释自注「T2 整段 answer（非 delta）」），正是 T5 分支改造点；payload 为 `Record<string, unknown>` 透传整帧 JSON，delta 键无需改类型即可消费；T2/T3/T4 行为不回退由「content 键 → 替换模式」分支天然保证 |
| `src/views/ChatView.vue`：打字机视觉（可选最小光标态 · 不破 T2/T3/T4 UI） | 最小 UI 增量 | 现状已核：assistant 气泡 `message.content` 非空即渲染文本、空且 streaming 显「处理中…」（L142–143）——delta 追加使 content 增长后占位文案自然消失，无破坏风险；光标态可选、范围措辞允许零 UI diff 兜底，合理 |
| `src/composables/useLgRagSse.ts`：原则零 diff | 零 diff 声明 | 现状已核：事件已全量经 `onEvent` 上抛（`postLgRagSse` L219 parser emit 整帧）；`LgRagSseEvent.payload` 为 `Record<string, unknown>`（L26），delta/final 键无需改接口；live/replay 共用管线（L152），replay 含 delta 自动继承——零 diff 成立 |
| tests：chat store spec 扩展（delta 拼接==终帧 · 替换不 append · done 停追加 · 并存不串台 · 降级整段 · replay delta） | 扩展现有 spec | 现状已核：`tests/chat-store.spec.ts`（35 例）已 `vi.mock` `useLgRagSse` 模块（L11）并以 `mockImplementation` 捕获 callbacks 手工喂帧（L45 模式），delta 帧序可同构注入；replay 路径同模块 mock，复用无障碍；`tests/chat-stream-deprecation.spec.ts` 静态守卫已核存在（验收第 8 条对应） |
| G-L1 | `10_flow_chat` 备注 + graph-compile 绿 | `10_flow_chat.graph.yaml` 已核存在（现 description 含 T2/T3/T4 备注串）；须改 yaml 再 compile，不得手改 .md（同 T2–T4 先例；CI `.github/workflows/tech-graph.yml` → `./scripts/graph-compile.sh` 已在 T4 R1 核） |
| wiki_delta | `volatile.md` 短注 + 真值指针 | 文件已核存在；与 wiki_delta_note 一致（短注不长文） |

### 非范围（对照审查要点七项 · 逐项核对）

| 审查要点要求 | task 非范围条目 | 审查 |
|---|---|---|
| api 改码 | 「api 实现 / 改 `ops-desk-api` 任何代码（契约异议回 api 00 串行轨）」 | ✓ 在列；异议回路明确 |
| T6 死代码 | 「**T6** 删 `useOpsChatSse` 死代码 / chat stream 常量」 | ✓ 在列；验收第 8 条静态守卫绿对应 |
| C0–C4 | 「**C0–C4** Host 沟通轨 · iOS」 | ✓ 在列 |
| progress token 化 | 「`node.progress`/`subtask.progress` token 化（仅终答 answer delta）」 | ✓ 在列；与 api §10.4「token 归属仅 aggregator/direct_answer 终答 LLM」对齐 |
| replay 协议 | 「改 replay 协议 / 重开 T3/T4 语义（thread_id · cursor 语义不动）」 | ✓ 在列；与 00 定夺 SoT 行/replay 行一致 |
| /lg-rag 页 | 「改 `/lg-rag` invoke 页（零 diff）」 | ✓ 在列；验收第 8 条呼应 |
| markdown 渲染 | 「markdown 渲染 / 代码高亮（纯文本现状保留）」 | ✓ 在列；`ChatMessage.content` 注释「纯文本（markdown 不渲染）」（chat.ts L100）吻合 |

**无漏项。**

### failure_paths（对照 api §4.2/§10.4 · 审查要点全覆盖）

| 触发 | task 期望 | 审查 |
|---|---|---|
| 流式不可用（api 降级整段） | 仅整段 content 帧 → T2 行为 | 逐字对齐 api §4.2 T5 冻结补充「流式不可用/异常 → 降级整段（T2 行为）」；web 侧「content 键 → 替换」分支天然兼容，00 定夺「不做特判」成立 |
| delta 帧乱序/重复 | T4 seq 去重挡重复（seq<=lastAppliedSeq 忽略）；失序仅记 warn | 对齐 api §10.4「全部帧共享单调 seq（单 emit 循环）」——单调由 api 保证，web 失序仅 warn 不阻断，分工正确；去重管线已核在 processFrame L288–289 |
| 终帧 content 与 delta 拼接不一致 | 以终帧 content 为准（替换语义天然兜底） | 对齐 api §4.2 客户端规则「见 content 全量替换」+「禁止把 content 帧 append 到 delta 结果」（§10.4 常见坑）；task 00 定夺分支规则行逐字同义，无歧义 |
| 断网 mid-delta | 沿用 T4：active-run 保留 → 「续看」replay 补 delta；不假造帧 | 与 T4 failure_paths/00 定夺一致；active-run 随帧推进已核（processFrame L291–297），replay 复用 processFrame 同一管线（chat.ts L483）——delta 帧重放自动走 T5 新分支 |
| replay 含 delta 再断 | lastSeq 已推进；接力续看拼接完整 | ✓ 在列；T4 已交付接力语义，delta 帧不改该机制 |
| 未登录 401 | 沿用 T3/T4：清 thread_id + active-run + 跳登录 | 现网链路已核（live 401 L385–390 · replay 401 L487–492 均清双键 + clearSession；ChatView watcher 跳登录 L25–32），T5 零增量，条目正确 |
| 占位帧（no_aggregator） | T2 现行为（空 content 覆盖）· 无 final 不做终态标记 | 逐字对齐 api 00 Prompt 占位帧行（`{"content":"","note":"no_aggregator"}` 无 final）；占位场景（basic/router 无 aggregator）契约保证无 delta 帧，与替换分支不冲突（见 N4） |

**完整，无遗漏。**

### 契约一致性（task 00 定夺 ↔ api §4.2/§10.4 ↔ api 00 Prompt）

| 钉死项 | task | api 契约 / Prompt | 审查 |
|---|---|---|---|
| 分支规则 | 含 `delta` 键 → 增模式追加；含 `content` 键 → 替换模式全量覆盖；**禁止**终帧 content append 到 delta 结果后 | §4.2 T5 冻结补充「见 delta 追加、见 content 全量替换、done 后停止追加；禁止把 content 帧 append 到 delta 结果」；Prompt 帧表同 | 三处逐字同义；**无歧义**（两键不共帧由 api 帧表保证，见 N2） |
| done 语义 | done/error/abort 后停止追加；流结束未再见 answer 帧则保持已拼接文本 | §4.2「done 后停止追加」；T4「不假造帧」先例 | 一致；现状 done/error/abort 三路径均置 streaming=false + clearActiveRun（L328–348 · L412–416），「停止追加」在分支实现后由同一终态语义承载 |
| 降级 | 无 delta 帧 → 仅整段 content 帧 → 自然退化 T2，不做特判 | §10.4「流式不支持/异常 → 降级整段（T2 行为）+ 日志」 | 一致；替换分支即 T2 行为本身，零特判成立 |
| 占位帧 | content 空串 + note:no_aggregator 按 T2 现行为，不新增 UI 分支 | Prompt 占位帧行「无 final 标记；按 T2 现行为处理」 | 逐字一致 |
| 并存 | node.progress/subtask.progress 照常进 thinking 块；delta 只碰 assistant.content；按 seq 单调（T4 去重沿用） | §10.4「delta 与 node.progress/subtask.progress 不串台（共享单调 seq）」 | 一致；thinking 与 content 为 message 上两个独立字段（chat.ts L97–104），不串台有结构保证 |
| replay | 重放含 delta 帧复用 T4 同一 processFrame 管线；不改 replay 协议/语义 | §10.4「replay 逐帧重放含 delta、形状同 live」；Prompt「复用 T4 cursor 逻辑即可，无需新协议」 | 逐字一致；`resumeFromCursor` 喂帧入 processFrame（L483）已核 |
| SoT / freeze / 模块 / 合入 | 会话=thread_id · 续看=run_id+seq/cursor 不改；freeze 沿用不新增 event_type；不新增一级模块；勿 auto-merge | §4.2 T5 冻结补充「同 freeze_id · 不新增 event_type」 | 全部一致；合入纪律三处钉死（同 T4） |

### 00 定夺内部一致性（专项）

- 「分支规则」行（content → 替换）×「占位帧」行（content 空串覆盖为空）：占位帧走同一替换分支，**语义同构无冲突**；占位场景契约保证无 delta 帧，不会出现「delta 已拼接又被占位清空」（见 N4 防御注记）。
- 「done 语义」行 × failure_paths「断网 mid-delta」行：断网非终态帧路径（onError 传输层），active-run 保留可续看；「停止追加」针对终态帧/abort 后的迟到 answer 帧（验收第 4 条「done 后迟到帧被忽略」承载断言）。两者作用域不同，**无矛盾**。
- 「replay」行 ×「SoT」行：replay 复用管线且不碰 thread_id/cursor 语义，与 T4 钉死正交，**无矛盾**。

### test_strategy 与仓 CI 一致性

| 项 | task | CI 真值 | 审查 |
|---|---|---|---|
| lint/test/build | `pnpm lint && pnpm test && pnpm build` | `.github/workflows/ci.yml` 三步同名同序（已核 L29–38） | 一致 |
| graph-compile | `./scripts/graph-compile.sh` | `.github/workflows/tech-graph.yml`（T4 R1 已核） | 一致 |
| verify | `npx dsh-coding-kit verify --task ...` | harness 约定 | 一致 |
| task lint | — | 本审查实测 `task lint --file` **PASS**（W4 豁免 warn 1 条，task 已自注合法） | 通过 |

### 依赖与联调策略可执行性

- api T5 #105 MERGED：`../ops-desk-api/docs/tasks/done/task_lg_rag_sse_token_stream.md` 文件头已核（completed · PR #105）；§10.4「api 提供（2026-08-31 已实现）」与 task 背景逐句吻合（delta 多帧按 seq 有序 · 终帧 content+final · 32_000 截断 · 降级整段 · 占位帧不变 · delta 落盘且 replay 含 delta）。
- 就绪闸：`WAVE_READINESS_lg_rag_sse_v0.md` §1 已核 web-00 回填行「**可开工 web T5（打字机）**」（行 1–5 全勾 · api PR #107），与 task 头部第 9 行一致；checklist `CHECKLIST_lg_rag_sse_joint_release_v1.md` §4 已核存在且回填同结论（task 头部第 11 行引用一致）。
- 联调入口「api master 或本地 `uvicorn` + web dev proxy（本地 master 已含 #103/#104/#105）」与就绪闸行 5 实测记录一致，与现网 Vite `/api` proxy（useLgRagSse.ts L100 注释）吻合，**可执行**；联调用例四条与 api §10.4 联调项逐条对应（④ 断连 replay 为 T4 遗留项的 T5 扩展，合理）。
- HG-JOINT-DEBUG（blocks merge）pending 且「40 脚本化联调记录 **或** 维护者亲签」双通道明确；web PR 勿 auto-merge 三处钉死。**未过前不可 merge 的约束可执行、无歧义。**

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | 分支规则「含 delta 键 → 增 / 含 content 键 → 替换」未钉**两键同帧**的优先级；api 帧表保证二者不共帧（delta 帧 `{"delta"}` · 终帧 `{"content","final"}`），属防御性空隙而非歧义 | 30 内决判断顺序即可（建议 content 替换优先——终帧兜底语义天然安全），补一条「同帧防御」Vitest 断言或注释说明即可，不改条文 |
| N2 | 断网 mid-delta 后续看的**视觉割裂**边界：`resumeFromCursor` 渲染进**新建**空 assistant 消息（T4 R1-N5 钉死），replay 仅补 `seq > after_seq` 的帧——已收 delta 头段留在原气泡、尾段进新气泡；终帧到达则全量替换自愈，但若终帧不落盘（T4 联调实证：api 断开即取消 generator，断开后帧含 done 可能不再产生，已入 invoke_40 遗留），新旧两气泡各剩半段 | 不改条文（T4 语义沿用）；建议 30 在 resumeHint/注释中认知该边界，40 联调记录注明；终帧到达即自愈的事实使影响限于「无终帧」边角，产品语义可接受 |
| N3 | 占位帧（content 空串 + note:no_aggregator）走替换分支：契约保证 basic/router 占位场景无 delta 帧，不会清空已拼文本；但条文未防御「异常 api 实现下同 run 混出占位帧」 | 30 内决：替换分支照常覆盖即可（与 00 定夺「按 T2 现行为」一致），无需为假想异常加分支；可在测试注释中注明该前提 |
| N4 | 打字机光标态为「可选最小」：ChatView 现状 `message.content` 非空即渲染、空且 streaming 显「处理中…」（L142–143），delta 到达后占位自然消失——零 UI diff 也满足验收 | 30 内决是否加 streaming 光标态；若加，限 CSS/条件类名，不得动消息结构（验收第 8 条 /lg-rag 零 diff 不受影响） |
| N5 | 联调「delta 上屏无乱码」依赖本地 api master（含 #105）+ dev proxy；就绪闸行 5 自注「生产部署状态未核」 | 40 脚本化联调记录须注明环境（本地 master commit 或部署版本），避免 HG-JOINT-DEBUG 证据环境不可复现（同 T4 invoke_40 格式） |

---

## 回填清单

无（零阻塞，无需回填 task）。

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
| 2026-08-31 | R1 初版：pass-with-notes（0 阻塞 · 5 非阻塞）；内容签收；流程闸待 00 依 task 表授权代签 |
