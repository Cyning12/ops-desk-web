# invoke · web_api_joint_check · 40-verify · 2026-10-13

> **任务**：[`task_web_api_joint_check`](../../../tasks/active/task_web_api_joint_check.md) 端到端联调机验（TC1–TC6）  
> **角色**：40-verify（纯观测 · 零业务码改动）  
> **环境**：web `main`（PR #65 合并后）vite `127.0.0.1:5173` → 代理 → uvicorn `127.0.0.1:8050`（api master `9ee928c`）· Playwright 1.64.0 + Chromium 156（`~/.agent-tools/pw` · 不入 package.json）  
> **附件**：[`attachments/`](./attachments/)

---

## 0. 会话与偏差说明

- 登录会话：`OPS_DESK_INVITE` 注入令牌本环境不可得，复用 `/tmp/web_fobs.jar` cookie 会话（auth/me 200 实测 · 截止 2026-10-20），与 fobs 先例同法；浏览器层经 `context.addCookies` 注入。浏览器「登录表单提交」环节因此未走表单（偏差 · 不影响 TC2 的 cookie 鉴权/路由守卫/SSE 链路结论）。
- 机验盲区五项（观感/文案可读性/审批手感/断网体感/孤儿人眼）依 task 划分不在 40 机验范围，人验 checklist 已交付：[`CHECKLIST_web_api_joint_check_v1.md`](../../../checklists/CHECKLIST_web_api_joint_check_v1.md)。

---

## 1. TC1 · P0 环境面（✅ 通过）

- `GET /api/ops/auth/me` 经 5173 代理 → **200**（cookie 鉴权通过 vite proxy 无误）。
- SSE 经代理逐帧无缓冲：`attachments/jc_p0_proxy_sse.sse` 22 帧 seq1–22 连续，`jc_p0_proxy_ts.log` 逐帧时间戳证明流式到达（**SPREAD 判据通过**：帧随时间分散，done{completed, latency_ms:137062} 于 137s 到达，非尾部批量冲刷）。
- 坑位留痕：vite7 默认仅绑 IPv6 `::1`，须 `--host 127.0.0.1`；`vite.config.ts:95` proxy 默认 target `127.0.0.1:8000`，经 `VITE_API_PROXY=http://127.0.0.1:8050` env 覆盖（零配置改动）。

## 2. TC2 · P1 登录→发消息→徽标（✅ 通过）

- 链路：`/chat` 直达（cookie 会话）→ textarea 发消息 → `POST /api/ops/lg-rag/stream` 200（SSE）→ 徽标渲染。
- 徽标 DOM 断言：`完成 · 耗时 138410ms` —— **实值 ≠ 0ms ≠ 「—」**；**「· 模型」段缺席**（模型键未提供时不渲染）。
- `pageerror/console.error = 0`。
- 证据：`jc_tc2_login_chat.png` · `jc_tc2_send_reply.png` · `jc_tc2_network.json`。

## 3. TC3 · P2 HITL approve→resume→resumed 徽标（✅ 通过 · 含联调发现 JC-F1）

### 3.1 链路实证（run `b3b2da4057f648109799a87250b22452`）

1. 提问触发 write 类工具 → `hitl.waiting` 卡片渲染（`jc_tc3v3_hitl_card.png`）。
2. 点「批准」→ `POST /api/ops/hitl/requests/hitl_973a380c77dd44dcb675/decide` **200** → 卡片转「已批准 · 点击续看推进」。
3. 后端 resume 链服务端执行完成：`HITL 已批准，解锁…重跑 run=b3b2da40` → 多轮 LLM → 沉降。
4. 回放实证：`POST /api/ops/lg-rag/replay after_seq=0` → **18 帧 seq1–18 连续 · 终帧 `done{resumed, latency_ms:306187}`**（`jc_tc3v3_replay.sse`）。
5. 浏览器徽标面（种子 active-run 等价刷新恢复路径 → resumeNotice「上次回答未完成」→ 点「续看」→ replay after_seq=7 续帧渲染）：徽标 `完成 · 耗时 306187ms` —— **与后端终帧 latency_ms 逐位一致**，模型缺席（`jc_tc3v3b_resumed_badge.png` · `jc_tc3v3b_network.json`）。
6. 同链另一实证：run `04417a5b` done{resumed, 124348}（`jc_tc3_replay.sse`）。

### 3.2 ⚠️ 联调发现 JC-F1（另立 fix task · 不在本 task 修）

- **现象**：`src/api/http.ts:50` axios 全局 `timeout: 30_000`（30s）掐断 HITL resume 请求——resume 服务端执行实测 130–310s。
- **实证**：decide 200 后 30.1s，resume 请求 `net::ERR_ABORTED`（`jc_tc3v2_network.json`）；前端 `decideHitl` catch 分支把卡片退回「待审批」态；**后端审批与续跑已生效并跑完**（hitl.router「HITL 恢复完成 replay=run:18」），前端却不知情。
- **影响**：approve→resume 直连链的用户体验断裂（卡片回待审批 · 易误导重复审批）；服务端无损。刷新恢复/续看路径不受影响（本 TC 经此路径完成徽标实证）。
- **处置**：R3 约定「联调发现的 bug 另立 fix task」，本 task 不修复；人验 checklist §2.3 已标注该已知行为供维护者核验「不误导」性。

## 4. TC4 · P3 在飞 409 + 孤儿观察项（✅ 通过）

### 4.1 孤儿 run `4740a8a0`（断线掐断 · 非阻塞观察项）

- 经 5173 代理 `POST /api/ops/lg-rag/replay`：恒 **409**，响应头 `retry-after: 2`，body detail = `Run is still in flight; retry after it settles.` 原文逐字一致（`jc_tc4_orphan_409.hdr` · `jc_tc4_orphan_409.body`）。
- 与 fobs 40 观察项再确认：在飞标记不沉降（≥13min 实测）→ replay 恒 409；**非阻塞**，已报回 api 侧留痕。

### 4.2 浏览器在飞 409 错误条（✅ TC4v1/v2 双次实证）

- 链路：发消息（流式在飞）→ 刷新页面 → resumeNotice「上次回答未完成」→ 点「续看」→ replay **409** → 错误条渲染。
- 错误条 DOM 断言逐字命中：`[http] Run is still in flight; retry after it settles.` + 「连接中断，已收到的内容不会丢失」+ 「续看」按钮（`jc_tc4_inflight_409.png` · `jc_tc4v2_inflight_409.png` · `jc_tc4_network.json` / `jc_tc4v2_network.json`）。

### 4.3 ⚠️ 联调发现 JC-F2：刷新掐断 stream 驱动 run → 服务端孤儿化（观察项确定性复现）

- **现象**：TC4v2 在飞刷新瞬间，后端日志捕获 `asyncio ERROR Task was destroyed but it is pending! ... Queue.get()`（18:14:13，与 reload 时刻对齐）；此后 run `1289023d30b14e2dba5d60caea98de88` **永不沉降**——replay 恒 409 持续 640s+ 轮询无终帧。
- **对照**：TC3 run `b3b2da40` 的续跑由 HITL resume 端点驱动（与 SSE 客户端解耦），浏览器关闭后服务端照常跑完并沉降（done{resumed}）——孤儿化**仅**发生在 `/lg-rag/stream` 请求生命周期驱动的 run 被客户端断开掐断时。
- **定性**：与 fobs 40 孤儿观察项（`4740a8a0` 断线掐断不沉降）同形态，本次为**确定性复现 + 服务端日志捕获孤儿化瞬间**。前端行为正确（409 错误条如实传达）；孤儿化为后端 run 生命周期遗留问题，**已报回 api 侧**，非本 task 修复范围。

### 4.4 沉降后续看恢复与 active-run 生命周期（✅ 双向实证）

- **正向恢复**（✅ 由 TC3 §3.1-5 实证）：active-run 指向「客户端未消费期间已沉降」的 run（resume 驱动型）→ 刷新/重进 → resumeNotice → 续看 → replay 200 续帧零丢失渲染 → 徽标实值与后端终帧逐位一致。
- **反向清理**（✅ TC4v3 实证 · `jc_tc4v3_network.json`）：run 在页内流式完成（徽标 `完成 · 耗时 261547ms` · 262s）后，`active-run` 被正确清除（`localStorage=null`）→ 刷新后**无残留续看提示**——已完成 run 不误报「上次回答未完成」。
- 综上：续看恢复能力覆盖「沉降未消费」与「在飞 409」两态；「在飞被掐断」态进入 JC-F2 孤儿观察项（后端生命周期问题 · 已报回 api）。

## 5. TC5/TC6 · 质量门与基线（✅ 通过）

- `pnpm lint` → **0** · `pnpm test` → **31 files / 255 tests 全过（基线 255 一致）** · `pnpm build` → **0**。
- seq 连续性：TC3 replay 18 帧 `seq1..18` 严格连续（SEQS_CONTINUOUS=True）；TC1 22 帧连续；前端 seq 去重由 Vitest 既有断言覆盖。
- 本 invoke 全程零 `src/` 业务码改动（工作树 diff 仅 docs/checklists + docs/harness 面）。

## 6. 结论

- **TC1–TC6 机验全过**；P0–P3 契约面在浏览器真机环境逐字核验（409 detail 原文 · retry-after: 2 · latency_ms 实值且后端-前端逐位一致 · 模型键缺席不渲染）。
- **联调发现 2 项**：JC-F1 axios 30s 全局超时掐断长 resume（另立 fix task）；JC-F2 刷新掐断 stream 驱动 run → 服务端 `Task was destroyed but it is pending!` → 孤儿化确定性复现（后端生命周期 · 已报回 api · 与孤儿 4740a8a0 同形态）。
- **非阻塞观察项 1 项**：孤儿 run 4740a8a0/1289023d 在飞不沉降（已报回 api）。
- **人验层**：机验盲区五项交付 [`CHECKLIST_web_api_joint_check_v1.md`](../../../checklists/CHECKLIST_web_api_joint_check_v1.md)，待维护者人验签核。
