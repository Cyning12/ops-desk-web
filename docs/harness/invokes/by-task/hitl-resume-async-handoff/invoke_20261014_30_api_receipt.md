# invoke_20261014_30_api_receipt — hitl-resume-async · api 30 响应面回执（致 web 00）

> 发方：ops-desk-api 30（2026-10-14 · 分支 task/hitl-resume-async · base master 56e4a9f）
> 收方：ops-desk-web 00（移交令 §5 契约决策点回执）
> 详档：api 仓 docs/harness/invokes/by-task/hitl-resume-async/invoke_20261014_30_implement.md

## 结论：web 零改动预判成立

**状态码保持 200 · 顶层键 {ok, request, resume, replay, ts} 不删不改**——未触发 web 跟随 task 条件（未动状态码 · 未删改键名）。

## 最终响应面（POST /api/ops/hitl/requests/{id}/resume · 受理即返）

```jsonc
{
  "ok": true,
  "request": { "id": "...", "status": "approved", "run_id": "r1", "thread_id": "t-api" },
  "resume": {                       // ← 键不变 · 值从「跑完的 outcome」变「已受理」
    "status": "accepted",
    "thread_id": "t-api",
    "approved": ["..."],
    "rejected": ["..."],
    "decided_by": "张三"
  },
  "replay": {                       // ← 键名不动 · 受理时刻语义
    "run_id": "r1",
    "cursor": "r1:6",               // best-effort（last_seq+make_cursor · 异常降级空串）
    "events_persisted": 0,          // 受理时刻恒 0（执行在后台）
    "events_failed": 0,             // 同上
    "persisted": true,              // = bool(run_id) · 受理时刻无法预知归属解析结果
    "re_interrupted": false         // 受理时刻恒 false
  },
  "ts": "..."
}
```

## web 侧唯一须复查的一点（语义迁移）

`run_owner` 归属反查失败的「明说」从响应面（旧 `replay.persisted == false`）迁移到后台执行：受理响应 `persisted` 恒为 `bool(run_id)`，失败信号改由 api 侧 error 日志 + 事件流缺席承担。**若 web 有依赖 `replay.persisted == false` 做用户提示的逻辑，请复查**；`HitlResumeResponse.resume` 为 unknown 弱消费则确认零改动。

## 行为面（前端可见时序）

1. resume 秒回 200（受理）→ 恢复执行在后台进行，事件照常落盘；
2. 秒回后 replay 立即打 = **200 部分帧（既有语义 · 非 409）**：replay 在飞 409（Retry-After: 2 · detail 原文不变）仅限**无收尾帧的 live run**；HITL 挂起 run 已持 `done{waiting_approval}` 收尾帧，`run_stream_closed` 判已收尾 → resume 在飞窗内 replay 返回 200 部分帧追帧（同步旧时代同窗口同路径同为 200 · 契约零回归 · 维护者 2026-10-14 裁定 (a) 确认）→ 沉降后 replay 200 全量 · 帧 seq 连续 · 终帧 `done{status:"resumed", latency_ms:int≥0, 无 model 键}`（逐键不变）；
3. 在飞期间重复 resume = 409「该申请的恢复正在执行中，待沉降后再试」；
4. 后台执行崩溃：可重调 resume 幂等重投递（preflight not_interrupted 防重跑已完成者）——不永久悬 409。

## api 40 live 机验结论（2026-10-14 · 实证回填）

TC8 全项 PASS（api 仓 invoke_20261014_40_verify.md + attachments 全量证据）：**resume p95=46.6ms**（8 样本 37.9–46.6ms · 对照同步旧时代 130–310s）· 沉降后 18 帧 seq 连续 · 终帧逐键对拍 `done{resumed, latency_ms:180804 int, 无 model}` · TC5 二次 resume 409（在飞「执行中」/ 沉降后「没有挂起的 interrupt」）· 驳回收工链 · resume_mode 白名单 400 · immediate 异步调度（decide 17.7ms 秒回 · 后台 ~102s 后 done{resumed}）全过。

## 联调

TC3 链重跑（JC-F1 复验）归 web agent。对齐时序观察点：**秒回 200 accepted → replay 200 部分帧追帧（在飞窗非 409 · 见上第 2 点）→ 沉降后终帧 resumed**。axios 30s 掐断问题已由异步化根治（p95 毫秒级），JC-F1 前端误回「待审批」假相应消失。
