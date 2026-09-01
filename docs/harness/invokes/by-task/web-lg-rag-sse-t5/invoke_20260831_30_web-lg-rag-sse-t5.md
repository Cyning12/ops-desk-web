# Invoke：30-execute · web-lg-rag-sse-t5

> **用途**：30 实现留痕（answer delta 打字机 · delta 追加 / final 替换）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG pending（blocks merge · 40 脚本化联调记录见 invoke_40，待维护者核签）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-lg-rag-sse-t5` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 不新增 event_type · answer 帧 payload 扩展 delta/final 消费） |
| git_branch | `task/web-lg-rag-sse-t5` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_lg_rag_sse_t5_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 5 note · N1/N5 已入 task · N2–N4 本帽内决） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（`01_modules.md` 零 diff · 仅 `10_flow_chat` 备注） |
| HG-JOINT-DEBUG | pending | N（blocks merge） | web PR 勿 auto-merge |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t5.md` → **VERIFY: PASS**（exit 0）。

## 30 产出（改码清单）

| 文件 | 动作 | 说明 |
|---|---|---|
| `src/stores/chat.ts` | 改 | answer 分支 T5 化：payload 含 `content` 键 → 全量替换（终帧 `final:true` 同此 · 严禁叠加到 delta 拼接后）；仅含 `delta` 键 → 追加到当前 assistant.content；两键同帧 content 优先 + `console.warn`（R1-N1）；新增 `answerTerminal` 标志——done/error 事件、live/replay onError（传输层终断）、onAborted 置位，sendMessage/resumeFromCursor 开局重置，终态后迟到 answer 帧忽略；无 delta 帧不特判（content 替换即 T2 行为）；占位帧（content 空串 + note:no_aggregator）走同一替换分支（T2 现行为）；delta 挂进既有 `processFrame` 管线（T4 提取点未动），replay 含 delta 自然继承；store 头注释补 T5 行 |
| `src/views/ChatView.vue` | 改（最小） | streaming 中最新 assistant 气泡文本加 `chat-message__text--streaming` 条件类名 → CSS `::after` 闪烁光标（`▍` · 1s steps blink）；纯 CSS/条件类名，不动消息结构；恢复提示条 / 续看条 / thread 短码 / 新会话按钮零 diff |
| `src/composables/useLgRagSse.ts` | **零 diff** | payload 已 `Record<string, unknown>` 透传整帧，delta/final 键无需改接口 |
| `tests/chat-store.spec.ts` | 扩 | T5 describe 7 例：delta 按 seq 追加（中间态断言）+ 终帧替换拼接==终帧 content · 终帧与拼接不一致以终帧为准 · 两键同帧 content 优先 + warn · done/error/abort 后迟到帧（seq 递增去过重）忽略 · 与 node.progress/subtask.progress 并存不串台 · 降级整段 + 占位帧 T2 行为 · replay 含 delta 序列完整（终帧收口 · 原消息不动） |
| `docs/_tech_graph/l1/10_flow_chat.graph.yaml` | 改 | description 备注 T5 answer delta 打字机分支规则；compile 再生成 .md / graph.json（`01_modules.md` 零 diff） |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（delta/final 分支规则一句话 + 真值指针本 task + api 05 §4.2/§10.4） |

## R1 非阻塞 note 落决

| # | 决策 |
|---|---|
| N1 | **已钉死照做**：两键同帧 content 优先替换、忽略 delta 并 `console.warn`；Vitest 专例断言（content 生效 + warn 一次） |
| N2 | **内决认知不改条文**：断连 mid-delta 后续看渲染进新建 assistant 消息（T4 R1-N5 沿用），已收 delta 头段留原气泡、尾段进新气泡；终帧到达即全量替换自愈，无终帧边角（api 断开即取消 generator · T4 invoke_40 遗留 1）两气泡各剩半段可接受；Vitest replay 例注释该边界，联调记录注明 |
| N3 | **内决不加分支**：占位帧走替换分支照常覆盖（与 00 定夺「按 T2 现行为」一致）；契约保证 basic/router 占位场景无 delta 帧同 run 混出，测试注释注明此前提 |
| N4 | **内决采纳最小光标态**：streaming 中最新 assistant 气泡 `::after` 闪烁光标（纯 CSS/条件类名 · 不动消息结构）；delta 到达后「处理中…」占位自然消失（现状行为保留） |
| N5 | **照做**：联调记录注明 api commit 版本（见 invoke_40 §联调证据：master `99ea8c5` · `27cf7af`(#105) 已核为 HEAD 祖先） |

## 非范围遵守

- 未改 ops-desk-api 任何代码；未做 T6 删 `useOpsChatSse` 死代码；未碰 C0–C4；未 token 化 node.progress/subtask.progress；未改 replay 协议 / T3/T4 语义；未改 markdown 渲染
- `src/composables/useLgRagSse.ts` / `LgRagView.vue` / `src/api/lgRag.ts` / `docs/_tech_graph/l1/01_modules.md` **零 diff**；`useOpsChatSse` 静态守卫绿（chat-stream-deprecation 3 例过）
- freeze 沿用 `lg-rag-sse-v1` 未新增 event_type；T3/T4 行为不回退（thread_id · active-run · 续看 · seq 去重既有例全绿）
- 测试先行：T5 七例先红（5 failed · 含复合场景）后实现转绿；既有 155 例 → **162 例**全绿
