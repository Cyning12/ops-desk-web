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
- [x] supervisor 长问（>60s）未误杀（timeout ≥300s）  
- [x] `/lg-rag` invoke 页仍可用（非流式）  

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
- [ ] **T4 CLOSE 后**：已打开 api [`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §1 并回填「能否开 T5」结论（**web-00 已判定 = T5 阻塞—待 api 契约**；回填 api 仓因跨仓写权限挂起 · patch 备妥见收口报告）  

---

## 4. T5 Token 流（后续）

> 开工前必读就绪入口：[`WAVE_READINESS_lg_rag_sse_v0.md`](../../../ops-desk-api/docs/spec/agent-infra/WAVE_READINESS_lg_rag_sse_v0.md) §1。  
> **2026-08-31 · web-00 判定**：§1 行 1/2/3/5 满足、行 4 未勾（api T5 契约/freeze 未立 · 无 active/done task）→ **T5 阻塞—待 api 00 钉契约**；web 不派 30、不扩 scope。

- [ ] 终答打字机与 `done` 衔接  
- [ ] 与 T2 整段 `answer` 分支正确  

---

## 5. T6 弃 chat（后续）

- [ ] api chat stream 下线或 410  
- [ ] web 删除 `useOpsChatSse` 死代码  
- [ ] 全站监控无 chat stream 404 洪流  

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
