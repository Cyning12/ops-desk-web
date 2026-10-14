# invoke · 00 跨仓移交:hitl-resume-async(B 方案 · JC-F1 修复立项)

| 项 | 值 |
|---|---|
| task_slug | hitl-resume-async-handoff(**本仓无 task · 纯留痕档 · 零改码**) |
| hat | 00(统筹 · 委派令起草) |
| 日期 | 2026-10-14 |
| 维护者裁定 | m00383:「B方案,web生成留痕,待api完成后再对接或api agent一起完成;生成api的启动Prompt,交由api agent的00来统筹此task」 |
| 关联 | JC-F1(本仓联调 task_web_api_joint_check 40 机验发现 · PR #66)· api PR #250(RunWorker 机制已备)|

## 1. 决策留痕

- **JC-F1 根因**(00 亲读 api master `56e4a9f`):`app/ops/hitl/router.py:466-529` resume 端点请求内同步 `await _execute_decided_resume(row)`(router.py:494)· 服务端 130–310s · 本仓 `src/api/http.ts:50` axios 全局 30s 超时客户端掐断 → 卡片误回「待审批」而后端已跑完。
- **路线裁定**:B 方案(api 单边异步化 · 复用 RunWorker)为主体;A 方案(web 单边 resume per-request timeout)**不单独做**——B 落地后 resume 秒回,30s 全局超时自然不再是问题。
- **本仓跟随条件**(维持 00 预判,待 api 回执终裁):api 若仅将 `resume` 键 outcome 变「已受理」形态 → 本仓 `HitlResumeResponse.resume: unknown` 弱消费 · **预判零改动**;若动状态码(202)/删改键名 → 触发本仓跟随 task(走 10 起草全链)。
- **对接窗口**:api 完成并回执响应面后,本仓复验 = 联调 TC3 链重跑(approve→resume 秒回 → replay 追帧 → 徽标 latency_ms 实值 · runbook 现存 `../web-api-joint-check/`)。

## 2. 移交 api 00 的启动 Prompt(逐字)

> 以下块为移交原文,已同步交付维护者粘贴至 api 仓 00 窗口:

```markdown
# 启动令 — api 仓 task/hitl-resume-async(B 方案 · 移交 api 00 统筹)

> 发方:ops-desk-web 00(2026-10-14 · 维护者 m00383 裁定 B 方案)
> 收方:ops-desk-api 00(请走全帽链:10 起草 → 20 R1 → 维护者签闸 → 30 → 40)

## 一、背景与问题真值(JC-F1 · web 联调机验发现)

web 仓联调 task(`task_web_api_joint_check` · PR #66)40 机验实证:

- **HITL resume 端点同步执行整个图恢复**,服务端耗时 **130–310s**(echo 工具场景实测);
- web 侧 axios 全局 30s 超时(`ops-desk-web/src/api/http.ts:50`)在 decide 200 后 **30.1s** 将 resume 请求客户端掐断(`net::ERR_ABORTED`);
- 结果:**后端实际已跑完,前端卡片误回「待审批」**——状态假相,用户以为没批上。

证据(只读):`../ops-desk-web/docs/harness/invokes/by-task/web-api-joint-check/` 的 `invoke_20261013_40_verify.md` + attachments `jc_tc3v3*.png` / `jc_tc3v3_network.json`。

## 二、根因锚点(api master `56e4a9f` 亲读)

- `app/ops/hitl/router.py:466-529` `resume_request`:请求内 `await _execute_decided_resume(row)`(router.py:494)——**同步跑完才返回**,这是 130–310s 的来源;
- 执行体:`app/ops/hitl/resume.py:288` `resume_hitl_run`;
- 落盘链:`ResumeEventSink`(router.py:362-396 · 归属反查 `run_owner` 不可省 · 缺归属事件不落盘前端 replay 不到);`_persist_resumed_turns`(router.py:399-415 · 补落本轮 user/assistant turn 不可丢);
- **现成新机制**:PR #250(`56e4a9f`)`app/ops/lg_rag/run_worker.py` RunWorker 与 SSE 订阅解耦 + 孤儿补偿扫描——resume 异步化应**复用同一机制**,不另造轮子。

## 三、目标(修复后形态)

1. `POST /api/ops/hitl/requests/{id}/resume` **秒回 200**(投递异步执行后即返回),携既有 replay cursor;
2. 恢复执行异步进行,事件照常落盘,前端经 replay 追帧;

## 四、契约钉死(逐项不可回归)

| 契约 | 现状真值 | 要求 |
|---|---|---|
| decide/resume 两步 | decide 默认不自动 resume | 不变 |
| `resume_mode` 白名单 | inherit/immediate/manual · 未知值 400(router.py:116-120) | 不变;immediate=立即**调度**(异步),非同步跑完 |
| 驳回 resume | rejected 也可调 resume 收工出结论(router.py:478-480) | 照常 |
| 终帧 | `done{status:'resumed', latency_ms:int≥0, 无 model 键}`(T-W2 FP-1 裁定) | 逐键不变 |
| replay 在飞 | 409 + Retry-After: 2 + detail 原文(F-OBS-2) | 不变;resume 投递后 replay 在飞窗打 409 属**正确行为** |
| 响应错误形态 | ResumeError→409/503/502 映射表(router.py:496-509) | 不变 |

## 五、契约决策点(须回执 web · 决定 web 是否需跟随 task)

resume 响应中 `resume` 键(currently=跑完的 outcome)将变「已受理」形态。**web 侧 `HitlResumeResponse.resume` 为 `unknown` 弱消费,预判零改动**;但若你方选择**动状态码(如 202)或删/改键名**,即触发 web 跟随 task——请将最终响应面回执:`../ops-desk-web/docs/harness/invokes/by-task/hitl-resume-async-handoff/`(或在 api task 文档留指针,web 00 会来取)。

## 六、建议验收(可机断)

- resume p95 < 1s(echo 场景,live 实证);
- resume 秒回后:replay 立即打=409 在飞 → 沉降后 200 · 帧 seq 连续 · 终帧 `done{resumed, latency_ms 实值}`;
- 回归:T-W2 S3 链 + TC5 二次 resume 409(`docs/harness/invokes/by-task/hitl-resume-replay-contract/` 菜谱可复用);
- `pytest` HITL/auto-resume 相关面 + 新增异步 resume 单测;
- web 侧复验由 web agent 承担(联调 TC3 链重跑),不在本 task 范围。

## 七、纪律与环境

- 先 10-task 起草(验收可机断 · failure_paths · R0–R5)· `HG-AUDIT-R1` approved 前 30 拒改码 · 分支 `task/hitl-resume-async` · 禁直接改 master · 证据落 `docs/harness/invokes/by-task/hitl-resume-async/`;
- 起服三坑(`OPS_CHAT_TRACER=off` · `env -u` 剥九个 proxy 变量 · strategy echo 六 env 组)解法见 `docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`;
- web 侧上下文全档:`../ops-desk-web/docs/harness/invokes/by-task/web-api-joint-check/`(38 件附件)+ `../ops-desk-web/docs/harness/invokes/by-task/web-hitl-fobs-receipt/`。
```

## 3. 状态

- [x] 留痕落盘(本 invoke + volatile 短注)
- [x] 启动 Prompt 交付维护者(m00383 窗口回复)
- [ ] **api 00 接棒**:10 起草 `task/hitl-resume-async`(权属 api 仓维护者签闸)
- [ ] api 完成 + 响应面回执 → 本仓裁定「零改动收口」或「开跟随 task」→ 联调 TC3 链复验
