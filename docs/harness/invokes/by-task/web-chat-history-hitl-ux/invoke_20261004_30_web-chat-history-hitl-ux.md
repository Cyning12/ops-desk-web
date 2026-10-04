# Invoke：30 执行编码（+40 自检闭环）· web-chat-history-hitl-ux

> **帽**：30（实现）+ 40（自检 · 同上下文闭环）· **日期**：2026-10-04
> **task**：`docs/tasks/active/task_web_chat_history_hitl_ux.md`（F1+F2 · mock 契约先行）
> **SPEC**：`docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed）
> **分支**：`task/chat-history-hitl-ux`（未动 main · 未 push）

---

## GATE_VERIFY（开工首输出 · 实跑留痕）

命令：`npx spec-wave verify --target . --task docs/tasks/active/task_web_chat_history_hitl_ux.md`

```text
| gate | status | blocks_30 | 30 影响 |
| HG-TASK-DRAFT | approved | 20-R1, 30 | — |
| HG-AUDIT-R1 | approved | 30 | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | — | ✅ |
VERIFY: PASS · task_web_chat_history_hitl_ux.md
```

结论：三闸 approved → 可 30。pre-30 invoke（10/20）在册（本目录 `invoke_20261004_10_*` / `invoke_20261004_20_*`）。

---

## 实现决策（30 内决留痕）

1. **组件落点（F1-2 备选内决）**：新建 `src/components/chat-history/ChatHistoryPanel.vue`（历史侧栏 · 裁定 F-B）与 `src/components/chat/HitlApprovalCard.vue`（消息流内联审批卡片 · 裁定 F-A）；仓内原无 `src/components/` → 图谱 components 行已补注（AC15）。侧栏内嵌 ChatView 左栏、可折叠、默认收起（单列 860px 主列不变 · 最小增量）。
2. **契约壳形真读上游实现（只读 · 未改 api 仓）**：B1 返回 `{ok:true,data:{threads|runs,next_cursor}}`（`history_router.py` · 与 http.ts「无包装」注释不同 → client 内自拆外壳，同 lgRag.ts 先例）；B2 pending 返回 `{items,count}` 裸形；decide/resume 返回形逐键对齐 `router.py`。类型字段族零自造（AC12 键集合断言钉死）。
3. **`hitl.waiting` → `ChatMessage.hitl` 卡片态**（裁定 F-A/F-C）：状态机 `waiting/acting/decided/resolved/forbidden/unavailable`；live 帧 / replay / 历史 `terminal_status=waiting_approval` 三入口同一渲染形态零分叉。历史 run 的 `hitl` 为 requests 列表（上游 `collect_hitl_requests` 透传 · 无独立 reason 键）→ reason 取首条申请自带 `reason` 字段。
4. **F2-4 done 分支语义细化**：`waiting_approval` 除「不清场（不调 `clearActiveRun`）」外**亦不记 `lastDone`**——否则 ChatView「完成 · 耗时」hint 会呈现「假完成」，与 FP-F1「不再假完成」冲突；`completed`/`failed`/无 status（旧帧）维持现行（lastDone + clearActiveRun）。旧测 10 处 done 帧均无 status → 走现行分支零回归（AC17）。
5. **F1-4 续看游标**：history run 视图契约**不含 last_seq** → `activeRun.last_seq=0`（续看 replay 从头重放进新建 assistant 气泡 · 与 resumeFromCursor 既有语义一致）。不新造机制/端点（replayLgRag 仍唯一定义+单点 import · AC3 grep 实测 2/1）。
6. **AC16 两消费点**：`refreshHitlPending()`（不轮询 · 非全局面板）——① decide/resume 动作链完成后（含 409 路径 · FP-F2）② `openHistoryThread` 遇 `waiting_approval` 最新 run 一次性核对；403 → `hitlPendingError='无审批权限'`、404/501/网络错 → `'审批服务暂不可用'`（降级呈现不炸屏 · FP-F4/F8）；401 交 http.ts 拦截器全局跳登录。
7. **分页**：threads 列表「加载更多」cursor 拼接按 `thread_id` 去重（FP-F9 不重不漏）；history run 分页 client 已支持 cursor 参数但 UI v1 只拉首页（遗留风险 · 见末节）。
8. **T4 注释同步更正（SPEC 建议②）**：`chat.ts` 存储键 doc / store doc / activeRun 注释 / done 分支行内注释四处改写为「done 按 status 分支：waiting_approval 保留 active-run 供审批后接力」。

## 旧测改动留痕（AC17）

**零改动**。`tests/chat-store.spec.ts` 等 23 份旧测文件未触碰；全量 225 用例（含旧 179 条）全绿。F2-4 行为变更对旧 done 帧（均无 `payload.status`）走「无 status → 维持现行」分支，subset 安全实测成立。

## 变更文件清单

**新增**
- `src/api/chatHistory.ts`（B1 threads/history client）
- `src/api/hitl.ts`（B2 pending/decide/resume client）
- `src/components/chat-history/ChatHistoryPanel.vue`（历史侧栏 · F-B）
- `src/components/chat/HitlApprovalCard.vue`（内联审批卡片 · F-A）
- `tests/chat-history-api.spec.ts` / `tests/hitl-api.spec.ts` / `tests/chat-store-hitl.spec.ts` / `tests/chat-history-panel.spec.ts` / `tests/chat-view.spec.ts`（新增 46 用例）

**修改**
- `src/stores/chat.ts`（hitl.waiting 分支 · done 按 status 分支 · T4 注释更正 · openHistoryThread/decideHitl/refreshHitlPending · ChatMessage.hitl/truncated）
- `src/views/ChatView.vue`（侧栏内嵌 · 卡片/截断标记渲染 · historyError/hitlPendingError 降级呈现）
- `docs/_tech_graph/l1/01_modules.md`（api/pinia/components 行增量 + 人签记录 · AC15）· `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（描述补注 + version → 2026-10-04）· 编译产物 `10_flow_chat.md` / `graph.json×2`
- `docs/coding_wiki/volatile.md`（短注：waiting_approval ≠ 完成态 + decide→resume 两步链 + 真值指针）
- `docs/tasks/active/task_web_chat_history_hitl_ux.md`（AC1–AC17 勾选 + 30/40 自检结论回填）

**零触碰**：`../ops-desk-api` 全仓 · `src/composables/useLgRagSse.ts`（AC11 diff 空实测）· SSE 事件类型零新增。

## 三绿输出摘要（实跑）

| 门 | 结果 |
|---|---|
| `pnpm lint` | **exit 0**（eslint 全仓零告警） |
| `pnpm test` | **28 文件 · 225 用例全过**（新增 46 · 旧 179 零回归） |
| `pnpm build` | **exit 0**（vue-tsc --noEmit + vite build ✓ built in 1.91s） |
| `./scripts/graph-compile.sh` | **exit 0**（10 graphs · 112 nodes · 120 edges · check 全 OK） |
| `npx spec-wave task lint --file <task>` | **LINT: PASS**（勾选后复跑） |

## AC 勾选对照（AC1–AC17 · 机断证据）

| AC | 证据（测试/命令） |
|---|---|
| AC1 徽标 | `chat-history-panel.spec.ts`：waiting_approval 条目唯一渲染 `[data-test=chat-history-badge]`「待审批」· 其余三状态不渲染 |
| AC2 历史映射渲染 | `chat-store-hitl.spec.ts`（run 序映射/threadId 切入）+ `chat-view.spec.ts`（user/assistant 气泡 · 子任务列 · waiting_approval 非完成态） |
| AC3 续看复用 | store spec：waiting thread → activeRun 挂起 → `resumeFromCursor` 断言 `replayLgRag({run_id,after_seq:0})`；grep 实测 文件=2 / import=1 |
| AC4 空态/降级标题 | panel spec（threads 空 → 暂无历史会话 · title 空 → run_id 前缀+时间）+ store spec（query 空兜底 · runs 空不崩） |
| AC5 分页不重不漏 | panel spec：两页 mock（含重叠条目）→ 并集 3 条无重复 · cursor 透传断言 |
| AC6 截断标记 | store spec（`truncated` 映射）+ view spec（`[data-test=answer-truncated]`「内容过长已截断」） |
| AC7 审批卡片 | store spec（hitl.waiting → hitl 态入列 · FP-F11 降级）+ view spec（卡片 reason + 申请 id + 批准/驳回双按钮 DOM 断言） |
| AC8 两步链 | store spec：decide→resume `invocationCallOrder` 顺序断言 · approved/rejected 两路 · acting 禁重复点击 · decide 失败不裸调 resume |
| AC9 分态 | store spec：409→已被处理不弹错误条+刷新 · 404→中性 · 403→forbidden 降级 · 401→回 waiting（全局跳登录交拦截器） |
| AC10 done 分支 | store spec 四分支逐条：waiting_approval 保留 activeRun+卡片 · completed/failed/无 status 清除 |
| AC11 SSE 零动 | `git diff $(git merge-base main HEAD)...HEAD -- src/composables/useLgRagSse.ts` = 空 · `grep -n "hitl" useLgRagSse.ts` 无命中（实跑） |
| AC12 字段族对齐 | api specs：threads/history/pending 键集合逐键断言（`Object.keys` 对拍上游字段族）· 不自造字段 · 未知键容忍 |
| AC13 未上线降级 | panel spec（404/501/网络错 → 历史服务暂不可用 · 401 不呈现）+ store spec（history 404 中性/500/501 降级 · error 条不炸）+ view spec（主路径 composer 不受影响） |
| AC14 三绿 | 见上表（实跑） |
| AC15 图谱 | `01_modules.md` api/pinia/components 行增量 + 人签记录 · `10_flow_chat.graph.yaml` 补注 · `graph-compile.sh` exit 0（实跑）· HG-GRAPH-MODULES 随交付签录（00 代录在案） |
| AC16 pending 两消费点 | store spec：动作链后/409 后 fetchHitlPending 调用断言 + 进入 waiting thread 一次性调用断言 + 403/404 降级断言；hitl 面无 `setInterval` 新增（grep 实测） |
| AC17 旧测清点 | 旧测 23 份**零改动**（git diff 名称为证）· 注入 done 帧均无 status 走现行分支 · 全量 225 绿 |

**未勾项**：闸行「HG-JOINT-DEBUG approved 后才 merge/CLOSE」——joint-debug 仍 pending（blocked_by api B1/B2 端点联调）· mock 先行不假 CLOSE。

## 遗留风险（短）

1. **history run 分页 UI 未接**：client 已支持 cursor，v1 仅拉首页（大 thread 看更早 run 待增强 · 不违 AC）。
2. **waiting_approval thread 续看 last_seq=0**：契约不含游标 → replay 从头重放进新气泡（内容与历史视图有重复 · 语义正确性不受影响；若上游后续在 run 视图补 last_seq 可无缝升级）。
3. **联调未做**：B1/B2 端点已在上游实现（本帽只读对拍壳形），真机联调待 HG-JOINT-DEBUG（blocked_by api 上线节奏）。
4. **hitl.resume 响应 replay.cursor 未消费**：上游 resume 返回 replay 游标（批准后段落直取），v1 沿用既有 resumeFromCursor 路径；可作后续优化（非范围不扩）。
