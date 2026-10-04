# Invoke · CLOSE · web-chat-history-hitl-ux

> **hat**：00（CLOSE · kpi_aggregator）
> **日期**：2026-10-04 · **依据授权**：维护者令原话「签收，后续文档授权00签收，若spec内容未完成继续进行新task，把此spec完整完成」

## 交付总账

| 项 | 真值 |
|---|---|
| PR | **#52 MERGED**（merge commit `c000fdf` · CI `check`/`frontend` 双绿） |
| SPEC | `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed · HG-SPEC-SIGNOFF approved 00 代录） |
| task | `docs/tasks/done/task_web_chat_history_hitl_ux.md`（AC1–AC17 全勾 · 四闸全 approved） |
| 审查 | spec R1 pass · task R1 fail（2 阻塞）→回填→ R2 pass（落盘 `docs/harness/reviews/`） |
| invoke | 10 / 10-r1-backfill / 20 / 30 / 40 / jointdebug / CLOSE（本目录齐） |
| Verify | `pnpm lint`/`test`（225 全过 · 旧 179 零回归）/`build` 三绿 · graph-compile 绿 · spec-wave verify PASS |

## 实现面（F1/F2 · PR #52）

- F2：`hitl.waiting` 消息流内联审批卡片（F-A · 六态状态机 · decide→resume 两步链）· **done 按 status 分支修 waiting_approval 假完成 bug**（不清场不记 lastDone · T4 注释四处同步更正）
- F1：B1 threads/history client + 历史侧栏内嵌 ChatView（F-B）· waiting_approval 徽标 · 进入 thread 复用 replayLgRag/T4 续看（F-C 映射既有 ChatMessage）
- 冻结面：SSE 零新事件 · `useLgRagSse.ts` diff 空 · api 仓零触碰 · 契约外字段零自造

## 联调（HG-JOINT-DEBUG 证据 · invoke_20261004_jointdebug）

B1/B2 活端点与 web client 逐键对拍零漂移 · 401/403/404/409/422 失败面全过 · vite 代理逐字节 MATCH。**留痕**：SSE 挂起帧→resume 正推进活链未复现（LLM 触发不确定 · api pytest 20 用例 + web Vitest 双侧覆盖在案）。

## 移交 api 仓的观察（联调棒 O1–O3 · 非 web 面）

- **O1**：本库首跑 PG checkpointer `setup()` 与流内长事务死锁（已绕行 · api 运维面）
- **O2**：attempt2 事件表丢 seq=1 `run.start` 一行（fire-and-forget 落盘静默丢失 · FP-4 降级链因此真实走通 · 建议 api 另棒核查）
- **O3**：completed 的 done 帧不带 status 键（与 SPEC 缺省语义及 web AC10 相容 · 知晓即可）

## 遗留（非范围 · 后续优化）

history run 分页 UI 只拉首页（client 已支持 cursor）· waiting thread 续看 `last_seq=0` 从头 replay（契约无游标）· resume 响应 `replay.cursor` 未消费。

## KPI（kpi_aggregator）

闸轮次：spec R1 一次过 · task R1 fail→R2 过（2 阻塞均为验收可机断性补强）· 30 一次交付三绿 · 联调一轮。旧测零改动。
