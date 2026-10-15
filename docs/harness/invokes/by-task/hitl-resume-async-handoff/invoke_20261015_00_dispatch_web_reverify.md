# 启动令 — web 仓 hitl-resume-async 复验（JC-F1 B 方案 · api 已并 master · 复验+联合 CLOSE 前置）

> 发方：ops-desk-api 00（2026-10-15 · api PR #252 MERGED · squash 0e5f6b1 · CI 4/4 绿）
> 收方：ops-desk-web 00（请走全帽链：10 起草 → 20 R1 → 维护者签闸 → 40 复验；预期零改码，30 大概率空帽）

## 一、背景与前提（api 侧已落地）

- **api PR #252 已合并 master**（squash `0e5f6b1` · 当前 master `2a5878c`）：`POST /api/ops/hitl/requests/{id}/resume` 秒回 200，恢复执行异步进行，事件照常落盘；
- **api 40 live 机验 8 PASS**：resume **p95=46.6ms**（对照旧时代 130–310s）· 沉降后 18 帧 seq 连续 · 终帧逐键对拍 `done{resumed, latency_ms:int≥0, 无 model}` · TC5/S3 回归 · 驳回收工 · 白名单 400 · immediate 异步调度全绿；
- **回执真值**（契约决策点 §5 回执，已在你仓）：`docs/harness/invokes/by-task/hitl-resume-async-handoff/invoke_20261014_30_api_receipt.md`——**web 零改动预判成立**：状态码保持 200 · 顶层键 `{ok,request,resume,replay,ts}` 不删不改 · `resume={status:"accepted",...}` 已受理形。

## 二、目标（复验，非改码）

重跑 JC-F1 原始断链场景（联调 TC3 链，菜谱在 `docs/harness/invokes/by-task/web-api-joint-check/`），实证 **web 前端在 api 异步化后不再误回「待审批」**，JC-F1 跨仓闭环。

## 三、验收（可机断）

| # | 项 | 判据 |
|---|---|---|
| 1 | resume 不再被掐断 | decide(approved) → resume 客户端实测 **<1s 返回 200** · Network 面板零 `ERR_ABORTED`（对照旧证据 jc_tc3v2_network.json 30.1s 掐断） |
| 2 | 卡片状态正确流转 | decide 后 → resume 后卡片进入「恢复中/已完成」态 · **全程零误回「待审批」**（JC-F1 假相消除实证，截图留证） |
| 3 | replay 追帧 | 帧 seq 连续 · 终帧 `done{status:'resumed', latency_ms:int≥0, 无 model 键}` 逐键对拍 |
| 4 | 在飞窗时序复核 | resume 秒回后 replay 立即打：可能 **200 部分帧**（既有语义 · api 维护者裁定 a）或 409+Retry-After:2（仅限无收尾帧 live run）——**两种形态均属正确**，前端均不得异常展示/报错 |
| 5 | 弱消费复查 | `HitlResumeResponse.resume` 为 `unknown` 弱消费确认零改动；`replay.persisted` 恒 `true` 后确认 web 无依赖此键的展示/告警分支 |
| 6 | 回归 | 驳回 resume 收工链 · immediate `resume_mode` 链（web 有入口的部分） |

## 四、环境（api 起服三坑 · 直接照抄菜谱）

- api 仓 `docs/harness/invokes/by-task/hitl-resume-async/invoke_20261014_40_verify.md`（本 task 40 亲跑菜谱）与 `hitl-resume-replay-contract/invoke_20261013_40_verify.md`：**`OPS_CHAT_TRACER=off` · `env -u` 剥九个 proxy 变量 · strategy echo 六 env 组**；
- api 侧跑 **master `2a5878c`**（含 #252）即可；web 侧用当前联调分支或 master（响应面零改动，按你仓纪律定）。

## 五、纪律与边界

- **预期零改码**：若实证必须改码 → 先停，走 10-task 起草 + 闸链；若触及响应面契约（状态码/键名）→ 同步回执 api 00；
- 证据落 `docs/harness/invokes/by-task/<task_slug>/`（建议沿用 `web-api-joint-check` 补 TC3v4 轮次，或新 task slug 自便）；
- 完成后在 `docs/harness/invokes/by-task/hitl-resume-async-handoff/` 落复验结论回执（PASS/FAIL + 证据指针）——**api `task_hitl_resume_async` 的 50-CLOSE 等本复验结果，双方联合 CLOSE**。
