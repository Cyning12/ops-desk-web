# 20-spec-audit R1 审查：SPEC-web-chat-history-hitl-ux_v0（web-chat-history-hitl-ux）

> **hat**：20-spec-audit（SPEC 书面审 · 不实现 · 不改 SPEC 实质内容 · 不代签）
> **审查对象**：`docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（draft · HG-SPEC-SIGNOFF=pending）
> **日期**：2026-10-04 · **轮次**：R1（轻量路径：10-spec 思考轮已充分，单轮）
> **对照真值（全部真读）**：上游 signed SPEC `ops-desk-api/docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md` · ERRATA A1（20260930）· 上游 R1 审查文（PASS-WITH-NITS · 存在性已核）· `task_chat_history_api.md`（B1 · ready · 三闸 approved）· `task_hitl_browser_decide.md`（B2 · ready · 三闸 approved）· 本仓 `src/stores/chat.ts` / `src/composables/useLgRagSse.ts` / `src/api/http.ts` / `src/views/ChatView.vue` / `src/api/` 目录 · 先例 `docs/spec/web-lg-rag-page/SPEC-web-lg-rag-page_v1.md`

## 判定：**pass**（零阻塞 · nit 2 条转 task 阶段 · 不代签 HG-SPEC-SIGNOFF）

---

## 一、核对表

### 1. 契约冻结面（照抄上游 · 逐字一致性）

| 项 | 核对结果 |
|---|---|
| SSE 零新事件 | ✅ SPEC §2 仅列 `hitl.waiting`（reason+requests[]）/ `done{status:"waiting_approval"}` / 复用 answer·subtask.progress·run.start；`run.start` 增可选 `query` 键标注为 ERRATA A1 已批口径、非新事件——与上游 §1 纪律 #1 + ERRATA 逐字一致；无新增/改 SSE 事件类型 |
| REST B1×2 | ✅ `GET /api/ops/chat/threads`（thread_id/title/last_activity_at/run_count/latest_run_status + cursor/limit）· `GET .../{thread_id}/history`（query/answer/subtasks/terminal_status/hitl 消息视图）——与上游 §2 B1 + task H1/H2 字段族逐键一致 |
| REST B2×3 | ✅ `GET /api/ops/hitl/pending`（id/run_id/thread_id/reason/blocked_by/created_at · `{items,count}` · 仅本人 owner）· `POST .../decide`（`{decision: approved\|rejected}` · 不自动 resume）· 复用 `POST .../resume` 零改动——与上游 §2 B2 + task P1/P2 一致 |
| 归属/状态码 | ✅ 跨用户 404（不泄露存在性）· decide 重复 409 · 非 maintainer 403 · 未登录 401——与两 task failure_paths/验收一致 |
| 上游 task 钉细节承接 | ✅ 分页默认 20/上限 100/超限 422（H1）· `latest_run_status` 四词表（H1）· history run 升序 + cursor/limit（H2）· answer 截断 32000 + `answer_truncated`（N3）· 降级标题 run_id 前缀+时间（FP-4）· pending 仅本人 owner（E1）· decide 两步不自动 resume（Q2/P2）· replay `{run_id, after_seq}`（T4）——§2 承接口径表 7 行全部对拍通过 |

### 2. 范围 F1/F2（覆盖 + 无越界）

| 上游 §2 概要 | 本 SPEC 承接 | 结果 |
|---|---|---|
| F1 历史侧栏（threads） | F1-1 B1 client + F1-2 侧栏 UI（标题/末活动/run 数） | ✅ |
| F1 点击加载完整历史（history） | F1-3 按 run 序渲染进既有消息流（query→user · answer→assistant · subtasks · terminal_status/hitl） | ✅ |
| F1 `waiting_approval` 醒目徽标 | F1-2 徽标 + AC1 断言 | ✅ |
| F1 进入续看（T4 replay 已有） | F1-4 复用 `resumeFromCursor`/`replayLgRag` · 非范围钉「不新造续看机制/端点」 | ✅ |
| F2 `hitl.waiting` → 醒目审批卡片（reason+id+双按钮） | F2-1 store 新 case + 消息流内联卡片 | ✅ |
| F2 批准/驳回 → decide → resume | F2-3 两步链式（契约钉 decide 不自动 resume）· 驳回亦 decide→resume（承上游 B2「decide rejected → resume → 收工出结论」） | ✅ |
| F2 `done` 按 status 分支（waiting_approval ≠ 完成态） | F2-4 改造 `chat.ts:621-633` · waiting_approval 保留 active-run + 待审批视觉 · 其余维持现行 | ✅ |
| 越界检查 | 全局 pending 面板在 §5 裁定 F-A 显式弃选（留作后续增强另立 task）；WS/轮询在非范围；无新路由历史页（F-B 弃选） | ✅ 无越界 |

### 3. 非范围（任务要求 6 条全覆盖）

✅ 改 api 仓 · ✅ 新 SSE 事件/改帧语义/改传输解析层 · ✅ OA 签名面（requests/runtime/callback 明列）· ✅ 后端端点语义 · ✅ 历史删改重命名 · ✅ WS 推送/轮询定时器；另加 3 条加固：新造续看 · legacy 面（410 亡端点）· decide 合并 resume。九条全部钉死。

### 4. 验收标准可机断性（AC1–AC15）

✅ 全部 Vitest 可断言：client mock 字段族（AC1/AC12 与 §2 逐键对齐 · 不自造字段）· store 分支断言（AC7/AC10 activeRun 保留/清除逐分支）· DOM 断言（徽标/卡片/空态/降级标题/截断标记）· 调用顺序断言（AC8 decide 先于 resume · 双调用）· grep/diff 契约断言（AC3 无第二条 replay 封装 · AC11 SSE 传输/解析零 diff）· 降级不阻塞主路径（AC13）· 质量门 `pnpm lint → test → build`（AC14）· 图谱 G-L1（AC15）。mock 契约全部落在 §2 冻结字段族内，无自造字段。

### 5. failure_paths（FP-F1~FP-F12）

✅ 必备项全覆盖：FP-F1「waiting_approval 误当完成态」现状 bug（锚点 `chat.ts:621-633` 已实证）· FP-F2 409 · FP-F3 401（live/replay/REST 三面）· FP-F4 403 降级不炸屏 · FP-F5 replay 中断（网络/超时/404/422 分态）· FP-F6 空态/标题降级 · FP-F10 404 中性文案不泄露；另加 FP-F7（decide 后未 resume）· FP-F8（端点未上线降级 + mock 先行）· FP-F9（分页/截断）· FP-F11（requests 空降级）· FP-F12（HG-AUDIT-R1 拒开工）。

### 6. 思考轮闭合

✅ R0–R5 全 done · 思考轮控制表已填 · early_stop=no · R2 三裁定（F-A/F-B/F-C）各 ≥2 案对比且荐案留痕 · R5 无遗留开放裁定。**HG-SPEC-SIGNOFF=pending 未代签**（状态行与人工闸表一致）。

### 7. file:line 锚点真实性抽查（本帽真读复核）

| SPEC 声明 | 实测 | 结果 |
|---|---|---|
| `chat.ts:523-651` switch 六分支（run.start:525/node.progress:537/subtask.progress:544/answer:604/done:621/error:634 · default:647-650 静默忽略） | 逐行对拍一致 | ✅ |
| `case 'done'`（:621-633）不看 status · `streaming=false`:628 · `clearActiveRun()`:631 | 逐行对拍一致（621 case · 628 streaming · 631 clearActiveRun · 633 break） | ✅ |
| `clearActiveRun` :461-465 | :461-465 一致 | ✅ |
| `processFrame` :503-521 · `extractFrameCursor` :476-495 | :503-521 / :476-495 一致 | ✅ |
| `resumeFromCursor` :768-843 · replay onError 401/404/422 :793-822 · live 401 :687-692 | :768-843 / :793-822 / :687-692 一致 | ✅ |
| `useLgRagSse.ts:21-31`（event_type: string）· 解析器透传 :81-101 · `LG_RAG_REPLAY_PATH` :107 · `replayLgRag` :150-155 | 逐行对拍一致（:29 event_type · :81-101 handleFrame · :107 · :150-155） | ✅ |
| `http.ts:47-51`（baseURL `/api` · withCredentials）· 401 拦截 :62-78 | :47-51 一致；:62-78 覆盖 `setUnauthorizedHandler`(:62-65)+响应拦截器(:67-78)，口径可接受 | ✅ |
| `src/api/` 现有十 client（auth/chat/graph/http/issues/lcEvidence/lgRag/obs/overview/pulls） | 目录实测 10 文件全中 | ✅ |
| `ChatView.vue` 单列 max-width 860px :259 · 提示条/错误条/续看按钮 :88-213 | :259 一致；:88-213 覆盖 restoredNotice/resumeNotice/error 条+续看按钮区 | ✅ |

锚点抽查 10/10 通过，无虚构行号。

### 8. 结构惯例（对照先例 web-lg-rag-page_v1）

✅ Harness 元信息 / 人工闸表 / 背景 / 范围 / 非范围 / 方案对比 / failure_paths / 验收 / 思考轮+控制表 / 关联 / 下一棒 / 修订记录——骨架与先例一致，且补了先例没有的「契约冻结面」专节（跨仓承接场景合理增量）。

---

## 二、阻塞项

**无。**

## 三、非阻塞 nit（转 task 阶段处理 · 不退回 10-spec）

- **nit N1**：F2-2 列了 `fetchHitlPending()` client 封装，但范围表内无显式消费它的行（§5 F-A 已把「全局 pending 面板」弃选留作后续）。推断其用途为 FP-F2「动作后刷新审批态」/进入 thread 时核对 pending——契约冻结面内含 B2 pending 端点故不算越界，但建议 10-task 阶段钉明消费点（或标注「备而不用 · 契约内封装」），避免 30 期自由发挥。
- **nit N2**：AC3「grep 断言无第二条 replay 封装」与 AC11「传输/解析层 diff 为空」属 grep/diff 类断言，建议 task 阶段钉具体断言形态（如对 `replayLgRag` import 计数 / `useLgRagSse.ts` git diff 空断言），防止实现期口径漂移。

---

## 四、HG-SPEC-SIGNOFF 建议

**建议维护者签收 approved。** 理由：契约冻结面与上游 signed SPEC/ERRATA/两 ready task 逐字对拍零漂移；F1/F2 全覆盖且无越界；非范围九条钉死；AC1–AC15 全可 Vitest 机断；FP-F1~FP-F12 含现状 bug 与全部归属/状态码路径；R0–R5 闭合并控制表在案；file:line 锚点抽查 10/10 真实。

**本帽不代签**——SPEC 人工闸表维持 `HG-SPEC-SIGNOFF=pending`，待维护者签录。

## 五、下一棒

维护者签 `HG-SPEC-SIGNOFF=approved` 后 → **00 起草 web task**（`invoke_slug=web-chat-history-hitl-ux`）：mock 契约先行不阻塞 30（FP-F8 运行时降级兜底），联调 `blocked_by api` B1/B2 端点上线；nit N1/N2 随 task 阶段回填闭合。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-04 | 20-spec-audit R1：**pass**（零阻塞 · nit N1/N2 转 task 阶段）· 契约面/范围/非范围/验收/FP/思考轮/锚点全核对 · 未代签 HG-SPEC-SIGNOFF · 未改 SPEC 与 src/ 任何文件 |
