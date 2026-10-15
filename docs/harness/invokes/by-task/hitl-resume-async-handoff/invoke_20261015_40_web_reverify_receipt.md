# invoke · hitl-resume-async-handoff · web 40 复验结论回执 · 2026-10-15

> **上游**：api 30 回执 [`invoke_20261014_30_api_receipt.md`](./invoke_20261014_30_api_receipt.md)（契约真值 · 响应面零改动声明）· api 00 启动令 [`invoke_20261015_00_dispatch_web_reverify.md`](./invoke_20261015_00_dispatch_web_reverify.md)
> **本件**：web 侧 JC-F1 B 方案 live 复验结论（api `task_hitl_resume_async` 50-CLOSE 等本回执 · 双方联合 CLOSE）
> **详证**：web 仓 [`invoke_20261015_40_verify.md`](../web-hitl-resume-async-reverify/invoke_20261015_40_verify.md) + 同目录 `attachments/`（19 件：截图/HAR 计时/.sse 全量帧/机断日志）

## 结论：**PASS · JC-F1 跨仓闭环 · web 侧零改码成立**

| 验收（启动令六项 + TC7） | 结论 | 关键数值 |
|---|---|---|
| TC1 resume<1s 零 ERR_ABORTED | **PASS** | decide 17.93ms · **resume 34.77ms 200** · ERR_ABORTED=0（对照旧 30.1s 掐断） |
| TC2 卡片零误回「待审批」 | **PASS** | 253ms 转 decided · 45s 采样窗 RETURN_TO_WAITING=false · pageerror/console=0 |
| TC3 replay seq 连续+终帧逐键+徽标 | **PASS** | 18 帧 seq1-18 连续 · hitl.resumed 恰 1（seq8）· 终帧 done{resumed, **latency_ms=152757 int**, 无 model} · 徽标「完成 · 耗时 152757ms」**逐位一致** |
| TC4 在飞窗两形态 | **PASS** | 命中裁定 a：replay 200 部分帧（9 帧 seq1-9 · retryAfter=null）· 前端零异常 |
| TC5 弱消费复查 | **PASS** | 顶层键恰 {ok,request,resume,replay,ts} · resume.status=accepted · replay.persisted=true · events_persisted/failed=0 · re_interrupted=false · hitl.ts:76 `resume: unknown` 零改动 · persisted 无消费分支 |
| TC6 驳回+immediate 回归 | **PASS** | 驳回：decide 7.76ms → resume 24.71ms accepted → 沉降终帧 done{waiting_approval, 136850}（收工口径）；immediate：required=false+auto_triggered → **前端不链第二步（RESUME_CALLED=false）** → 终帧 done{resumed, 249579 int} |
| TC7 质量门+回执 | **PASS** | lint EXIT=0 · test 263/263 零失败 · build EXIT=0 · 10/20/40 invoke 齐 |

## 对 api 侧的回执确认

- 契约真值**逐项 live 复核一致**：秒回 200 · 顶层键不删不改 · resume={status:"accepted",…} · replay.persisted 恒 true · 受理时刻 events_persisted/failed=0 · re_interrupted 恒 false · 在飞 replay=200 部分帧（裁定 a）· 终帧 done{resumed, latency_ms:int≥0, 无 model}——**无一偏差**。
- 响应面契约同步：**无需**——web 全程弱消费（resume: unknown · persisted 无消费分支 · chat.ts:1084 响应体不消费），B 方案对 web 完全透明，零改码预判实证成立。
- JC-F1 断链三环：api 同步 130–310s（已根除 · 实测毫秒级）→ axios 30s 掐断（触发前提消失 · 全窗零 ERR_ABORTED）→ catch→waiting 假相（45s 窗全程未触发）——**闭环**。
- 环境新坑留痕（api 侧复跑须知）：postgresql@18 须 `pg_ctl -D /opt/homebrew/var/postgresql@18 start`（brew services 会被 smart shutdown 杀）· api auth/me 500=连接池毒化须重启 api。

## 联合 CLOSE 建议

web 侧复验 PASS 已足证 api `task_hitl_resume_async` 验收——建议 api 50-CLOSE 推进，双方联合 CLOSE。
