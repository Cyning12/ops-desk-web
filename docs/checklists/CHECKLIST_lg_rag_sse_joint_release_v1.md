# Checklist：lg-rag SSE 跨仓联调与发版（维护者 · v1）

> **用途**：T2 联合发版 **人工闸门**；维护者打印或复制勾选。  
> **真值索引**：api [`05_lg_rag_transport_and_session_plan_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §10–§11  
> **关 task**：web [`task_web_lg_rag_sse_t2`](../tasks/active/task_web_lg_rag_sse_t2.md) · api [`task_lg_rag_sse_stream_updates`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_stream_updates.md)

---

## 0. 元信息（填写）

| 字段 | 值 |
|---|---|
| 日期 | 2026-08-31 |
| 环境 | 本地（docker db/qdrant + T2 分支 uvicorn + web 5173） |
| api 分支/SHA | `task/lg-rag-sse-stream-updates` |
| web 分支/SHA | `task/web-lg-rag-sse-t2` |
| 维护者 | cyning |

---

## 1. T2 联调（发版必勾）

### 1.1 api

- [x] `POST /api/ops/lg-rag/stream` 返回 `text/event-stream`  
- [x] 帧序含 `run.start` → 进度 → `answer` → `done`（supervisor 模式）  
- [x] `run.start` payload 含 `thread_id` / `mode`  
- [x] 未登录 401  
- [x] 非法 body 422  
- [x] api pytest 相关用例绿（维护者或 CI）  

### 1.2 web

- [x] 主 Chat 发送后 **仅**请求 `/ops/lg-rag/stream`（DevTools Network **无** `/ops/chat/stream`）  
- [x] 进度 UI 可见（`node.progress` / `subtask.progress` 至少一种）  
- [x] 终答展示 `answer` 内容  
- [x] `done` 后 loading 结束、可再次发送  
- [x] 401 引导登录  
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿  

### 1.3 跨仓

- [x] cookie 鉴权同域或 proxy 正确  
- [x] supervisor 长问（>60s）未误杀（**历史**：timeout ≥300s 墙钟；**现行 §10.6**：client **idle 120s**，有字节/keepalive 即重置，非整轮墙钟）  
- [x] `/lg-rag` invoke 页仍可用（非流式；invoke 仍为 axios 墙钟 300s，与 SSE idle **正交**）  

### 1.4 签核

- [x] **维护者签：T2 联调通过**（2026-08-31）  
- [x] api PR：**允许 merge**（此前 **勿 auto-merge**）  
- [x] web PR：**允许 merge**  

---

## 2. T3 Session（后续发版 · 不阻塞 T2  unless 维护者另定）

- [ ] 同 `thread_id` 多轮上下文正确  
- [ ] 新 thread 隔离  
- [ ] 刷新后会话行为符合 api T3 文档  

---

## 3. T4 断联 / replay（后续）

- [x] 断网后行为符合 T4 契约（2026-08-31 · invoke_40 脚本化证据 A–K：offline mid-stream → replay 补发不丢不重复 · 404/401/422 ✓）  
- [x] replay 不重复渲染同一 `seq`（Vitest seq 去重断言 + 联调证据 C/E/F）  
- [x] **T4 CLOSE 后**：已打开 api [`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §1 并回填「能否开 T5」结论（2026-08-31 · web-00 回填 · api PR #107 MERGED · 结论 = **可开工 web T5**：api T5 #105 已合 · §10.4 契约已回写）  

---

## 4. T5 Token 流（后续）

> 开工前必读就绪入口：[`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §1。  
> **2026-08-31 · web-00 判定（更新）**：§1 行 1–5 全勾（api T5 #105 MERGED · §10.4 已回写 delta/final 协议）→ **可开工 web T5**；task_web_lg_rag_sse_t5 起草中。

- [x] 终答打字机与 `done` 衔接（2026-08-31 · invoke_40 证据 C：done 后 0 帧 · answerTerminal 终态闸）  
- [x] 与 T2 整段 `answer` 分支正确（delta 增 / content 替换显式分支 · 降级整段零特判 · Vitest 7 例 + 实流 357 帧实证）  

---

## 5. T6 弃 chat（后续）

- [x] api chat stream 下线或 410（api PR #108 MERGED · 410 Gone + Deprecation/Link 头）  
- [x] web 删除 `useOpsChatSse` 死代码（web PR #29 · 守卫改「文件缺席 + 字面量缺席」CI 常驻）  
- [x] 全站监控无 chat stream 404 洪流（代码侧无发起方：dist/src 全树零命中 · invoke_40 证据 A–C）  

---

## 5.1 Idle / keepalive + 子任务分区（§10.6 · 2026-09-07）

- [ ] api：长节点静默期 EventStream 可见 `: keepalive`（不落盘）  
- [ ] web：client **idle 120s**（有字节重置），非整轮墙钟 300s  
- [ ] Chat：「编排进度」与「子任务过程」分区可见  
- [ ] 总时长 >5min 且间隔有帧/keepalive → **不** timeout  
- [ ] **§10.7 旁注**：`subtask.progress` `status=running` 起步帧立即上屏；同 id `done` 合并单行（web `task/web-lg-rag-sse-subtask-live`）  

---

## 5.2 租户切换（阶段 T · web-tenant-context-chat · 2026-09-18）

> 契约：workspace `api-v1-tenant-readonly-context-draft.md` · F1=C / F2 `X-Ops-Tenant-Id` / F5 A=`ops-desk-pilot` B=`ops-desk-pilot-b` / F6 切换 UI。

### 5.2.1 web（本仓可勾）

- [x] 顶栏常驻可见当前租户（`data-testid=current-tenant`）  
- [x] A/B 切换 UI（`el-select` · `ops-desk-pilot` ↔ `ops-desk-pilot-b`）  
- [x] 切换调用 `POST /ops/auth/tenant`（session 真源 · F1=C）  
- [x] axios / lg-rag `fetch` 请求挂 `X-Ops-Tenant-Id`（= 本地 session 镜像）  
- [x] `credentials:'include'` 保留（lg-rag SSE）  
- [x] Vitest：auth-store / router-guard MeResult 对齐；lg-rag 默认头 `ops-desk-pilot`  
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿  

### 5.2.2 联调（依赖 api T 已部署 `POST /ops/auth/tenant`）

- [x] 登录成功后 UI 显示当前租户（2026-09-18 · Playwright · admin + `data-testid=current-tenant`）  
- [x] 切换 A↔B 后下一问 Network：`X-Ops-Tenant-Id` 与 UI 一致（2026-09-18 retry：sessions/latest A/B **200**；lg-rag/stream A/B **200** 且头与 UI 一致）  
- [ ] 头与 session 不一致 → api 403，UI 明确错误（不静默重试死循环）  
- [x] A/B 各至少一问 Chat（2026-09-18 retry · Playwright · 证据见 `invoke_20260918_30_retry_*`）  

### 5.2.3 签核

- [ ] **维护者签：租户切换联调通过**（待 Playwright / 人工）  

---

## 6. 发版步骤（T2 通过后）

1. Merge **api** PR → 部署 api  
2. Merge **web** PR → 部署 web  
3. 生产冒烟：登录 → Chat 一问一答 → Network 确认 lg-rag stream  
4. task CLOSE · invoke 归档 · 本 checklist 勾选记录附 40 invoke  

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | 初版：T2–T6 分段 · 维护者发版闸门 |
| 2026-08-31 | §3/§4：链 api `WAVE_READINESS_lg_rag_sse_v0.md`（web T4 后查 T5） |
| 2026-08-31 | §3 T4 两项勾（invoke_40 证据）· §4 注明 T5 阻塞—待 api 契约（web-00 判定） |
| 2026-08-31 | §3 末项勾（§1 回填 · api #107）· §4 T5 两项勾（invoke_40 证据 · web #28 MERGED） |
| 2026-08-31 | §5 T6 三项勾（api #108 · web #29 · dist/src 零命中）· **T2–T6 全段闭环** |
| 2026-09-07 | §1.3 超时条改 idle 语义；增 §5.1 idle/keepalive + 子任务分区（api 05 §10.6） |
| 2026-09-07 | §5.1 增 §10.7 running 起步帧联调旁注（web-lg-rag-sse-subtask-live） |
| 2026-09-18 | §5.2 租户切换节（web 骨架可勾 · 联调待 Playwright） |
| 2026-09-18 | §5.2.2 retry：sessions 不再 500；A/B 各一问 stream PASS |
