# Invoke：HG-JOINT-DEBUG 联调证据采集（web-chat-history-hitl-ux）

> **帽**：联调棒（非 30 · 零代码改动 · 发现 web 侧问题只记录不修复）
> **日期**：2026-10-04 · **执行**：web 仓联调棒（00 派出）
> **对拍对象**：web PR #52（分支 `task/chat-history-hitl-ux`）× api master（PR #204 已 merge · B1/B2 上线）
> **纪律自查**：两仓 `git status` 零代码 diff（仅本 invoke 落盘）· `.env` 未改（临时变量只进进程环境）· 服务全部起后台进程、联调完已全杀（见 §7）· 本地 dev 库已清理自建审批数据

---

## 环境真值（先真读验证后用）

| 项 | 真值 | 出处 |
|---|---|---|
| api 启动 | `.venv/bin/python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`（等价 `make dev` 的 uvicorn 部分） | `ops-desk-api/Makefile:5-7` |
| web 启动 | `pnpm dev`（vite v7.3.6 · **本机绑 `localhost:5173`（IPv6 ::1）· `127.0.0.1:5173` 拒连**） | `vite.config.ts:91-100` |
| 代理 | `/api` → `http://127.0.0.1:8000`（`changeOrigin`） | `vite.config.ts:96-99` |
| `.env` 关键键 | `OPS_DESK_AUTH_MODE=db` · `OPS_HITL_PERSISTENCE=db` · `LG_RAG_HTTP_CHECKPOINTER=postgres` · `LG_RAG_DELEGATION_TOKEN_MODE=observe` · `DATABASE_URL=postgresql+asyncpg://ops:***@localhost:5432/opsdesk` | `ops-desk-api/.env`（值不进本文件） |
| 本地 PG | Homebrew PG 在 `127.0.0.1:5432` · `make migrate`（alembic upgrade head）已跑 | 实测 |
| 认证 | 邀请 token 铸库（`generate_invite_token` + `hash_token` 存 `ops_invite_tokens`）→ `POST /api/ops/auth/login {username, invite_token}` → `ops_session` cookie | `ops-desk-api/scripts/acceptance/agent_nl_smoke.py:79-103` · `app/ops/auth.py:58-110` |
| 联调账号 | `jd-maint`（maintainer）· `jd-viewer`（viewer）· 均经真实 login 端点创建 | 本 invoke §1 |
| 进程环境临时变量（**未写 .env**） | `OPS_CAPABILITY_EXTRA_MANIFESTS=<仓内 oa.readonly>,/tmp/jointdebug/demo.write.v1.yaml` · `DEMO_WRITE_BASE` · `OPS_CAP_CRED_DEMO_WRITE_CRED` · 第 3-5 次 HITL 尝试加 `LG_RAG_REACT_SATISFACTION=1` | 本 invoke §4.0 |

**环境排障留痕（起服务阶段 · 如实记录）**：首次 `POST /lg-rag/stream` 挂死零帧 300s。根因 = 本库首次使用 PG checkpointer，`saver.setup()` 的 `CREATE INDEX CONCURRENTLY` 被本流自己的 auth 会话（streaming 期间 `idle in transaction`）快照阻塞（`pg_stat_activity` 实证 pid 14231 wait=virtualxid · pid 13813 idle-in-xact 403s）。处置：杀 api → 独立进程跑 `AsyncPostgresSaver.setup()`（exit 0）→ 重启 api → SSE 正常。**api 侧运维注记**：首个流内嵌 setup 与长事务会话存在首跑死锁面（非 web 问题 · 不修复 · 转 00 知悉）。

---

## 证据 1 · B1 threads —— **通过**

### E1a/E1b 空态（无 run 时 200）

```bash
curl -b maint5173.jar http://localhost:5173/api/ops/chat/threads   # 经 vite 代理
curl -b viewer5173.jar http://localhost:5173/api/ops/chat/threads
```

```
{"ok":true,"data":{"threads":[],"next_cursor":null}}   HTTP=200   # maint × viewer 同形
```

### E1c 字段族（造 run 后）

```
{"ok":true,"data":{"threads":[{"thread_id":"16a7515f11c94d6ba9de9e1a5747b344",
 "title":"现在几点了？","last_activity_at":"2026-10-03T20:05:19.295213+00:00",
 "run_count":1,"latest_run_status":"completed"}],"next_cursor":null}}   HTTP=200
```

字段族 `thread_id/title/last_activity_at/run_count/latest_run_status` + `next_cursor` 逐键齐，与 `src/api/chatHistory.ts:26-38`（`ChatThreadItem`/`ChatThreadsPage`）对拍一致；壳形 `{ok:true,data}` 与 client `unwrapData`（`chatHistory.ts:83-88`）一致。

### E1d 多 thread 终态列表（7 thread · 含 running 徽标样本与降级标题样本）

```
43668e21f201 | '请按两步执行：…'        | runs=1 | completed
3667719d6075 | '请按三步执行：…'        | runs=1 | completed
00dbc645aeab | '请严格按两步执行：…'     | runs=1 | completed
d5f61e9b6f64 | 'ac52b6d1 2026-10-03T20:19:25.641326+00:…' | runs=1 | completed   ← FP-4 降级标题（真触发 · 见 §6-O2）
56a061680862 | '请严格按两步执行：…'     | runs=1 | running     ← 客户端掐断的流（无 done 帧 · 如实呈现 running）
a881339e8c64 | '请调用工具 demo.write.note…' | runs=1 | completed
16a7515f11c9 | '现在几点了？'           | runs=1 | completed
```

**结论**：通过（空态 200 + 字段族齐 + 降级标题/running 态均真实出现，web 侧 AC1/AC4 的渲染分支有真数据可对拍）。

---

## 证据 2 · B1 history —— **通过**

### E2a 消息视图（run1 · maint · 经代理）

```bash
curl -b maint5173.jar http://localhost:5173/api/ops/chat/threads/16a7515f11c94d6ba9de9e1a5747b344/history
```

```
HTTP=200 · data.thread_id=16a7515f11c94d6ba9de9e1a5747b344 · next_cursor=null · runs=1
run keys = [answer, answer_truncated, hitl, query, run_id, started_at, subtasks, terminal_status]
  query='现在几点了？' · answer='### 1. 工具查询当前时间…' · answer_truncated=False
  terminal_status='completed' · subtasks=2（tool_exec running→done）· hitl=[]
```

与 `src/api/chatHistory.ts:50-68`（`ChatHistoryRun`）逐键对拍一致。

### E2b/E2c 404 面

```bash
curl -b viewer5173.jar …/threads/16a7515f…/history   # {"detail":"Thread not found"} HTTP=404（跨用户 · 非 403 · 不泄露存在性）
curl -b maint5173.jar  …/threads/deadbeef…/history   # {"detail":"Thread not found"} HTTP=404（不存在）
```

### E2d 含 blocked 子任务的 run 历史（attempt5 · 真实 replan 数据）

`terminal_status=completed · answer_truncated=False · hitl=[]`；subtasks 序列含 `tool_exec running/done`（mock_get_issue_status 成功 + get_issue_by_number `issue_not_found` 失败重试 ×3 轮）+ `rag_subtask running/step`——真实多轮 ReAct 过程帧，web 历史映射（AC2）可对拍。

**结论**：通过（消息视图字段族齐 · 跨用户/不存在均 404 中性不泄露）。

---

## 证据 3 · HITL 全链 —— **部分通过（核心 SSE 挂起链未能在本环境复现 · 如实记录）**

### 3.0 真挂起触发尝试（5 次真实 LLM run · 全部未触发 · 命令与结果留痕）

真读确认 NL 入口仅有的两条 HITL 触发路径：

| 路径 | 代码锚点 | 本环境可达性 |
|---|---|---|
| ① 委派签发闸（非只读 capability → `delegation_issue_hitl_required`） | `app/ops/lg_rag/multi/nodes.py:710-728` + `capability/delegation.py:auto_approve_ok` | **不可达**：`capability/baseline.py:33-40` `deny_write=True`（第一期只读 · 写能力在裁剪阶段不进模型视野）——联调构造的 `demo.write.note`（side_effect=write · `/tmp` manifest 不进仓）被 `supervisor plan 含非法 tool id，fallback 单 rag` 拦下（api 日志实证），非挂起 |
| ② 步骤契约 `prefix_touch_required`（重规划消费前缀未产出字段） | `multi/step_contract.py:58/81` · `multi/nodes.py:1595-1599` | **LLM 随机**：重规划 suffix prompt 明示「吃它没产出的字段 = 被拦下交人工确认」（`prompts/assets/lg_rag.supervisor.suffix.system.md:18`），模型 consistently 规避 |

5 次尝试（真实 `POST /api/ops/lg-rag/stream` · supervisor · 真 LLM）：

| # | 手法 | 结果 |
|---|---|---|
| A1 | 两步：mock_get_issue_status → 消费不存在字段「负责人手机号」 | round1 `contract_missing_field` 触发重规划 ✅；round2 模型规避 → done 完成（280s 客户端超时掐断 · 留 running 样本） |
| A2 | A1 +「无论代价必须拿到该字段」 | 同上 · 342s done 完成 |
| A3 | 开 `LG_RAG_REACT_SATISFACTION=1`（进程环境）+「该字段一定在产出里」 | 562s · 仍规避 |
| A4 | 「声明消费它走人工审批正是我们想要的升级流程」（反向利用 suffix prompt 警告） | 403s · 仍规避 |
| A5 | 三步：加 `get_issue_by_number(88888888)`（`issue_not_found` 硬失败 · 无关失败触发重规划）+ 字段必消费 | replan 机制完整跑 3 轮（`issue_not_found` ×6）· 仍规避 · 473s done 完成 |

**诚实结论**：本环境（deepseek 模型 + 现 suffix prompt）下，真 `interrupt()` 挂起**不可按需在合理次数内复现**；2026-09-29 RUNBOOK 实证的那次属自然流量偶发。以下 B2 HTTP 语义以「绑真实 run 的管理端构造申请」完成（申请持久化真 db store · owner 反查真事件表），resume 的 409 负路径如实记录。

### 3.1 B2 pending —— **通过**

```bash
# 造申请①（admin Bearer · 绑真实 run 8f649822… owner=jd-maint · 等价编排层落库）
curl -H "Authorization: Bearer $OPS_ADMIN_SYNC_TOKEN" -d '{"run_id":"8f6498…","thread_id":"366771…",
  "subtask_id":"8f6498…:2","unlock_subtask_id":"8f6498…:1","blocked_by":"prefix_touch_required",
  "reason":"满足本步需要重跑已执行步骤（联调构造）"}' http://127.0.0.1:8000/api/ops/hitl/requests
# → {"ok":true,"request":{"id":"hitl_cb1f11c522a748e1b260",…,"status":"pending","persisted":true}} HTTP=200

curl -b maint5173.jar http://localhost:5173/api/ops/hitl/pending    # 经代理
```

```
{"items":[{"id":"hitl_cb1f11c522a748e1b260","run_id":"8f64982264bf44d48d4b749ecce25403",
 "thread_id":"3667719d6075412bb3d00b21b8cfae53","reason":"满足本步需要重跑已执行步骤（联调构造）",
 "blocked_by":"prefix_touch_required","created_at":"2026-10-04T04:53:32.730902+00:00"}],"count":1}  HTTP=200
```

字段族恰 6 键（`id/run_id/thread_id/reason/blocked_by/created_at`）+ `{items,count}` 壳，与 `src/api/hitl.ts:24-36` 逐键对拍一致。**owner 过滤实证**：另造绑不存在 run 的申请②（owner 解析不到）→ pending 复查 `count` 仍=1（被排除 · 不 500）。

### 3.2 B2 decide（approved 路径）—— **通过**

```bash
curl -b maint5173.jar -d '{"decision":"approved"}' …/hitl/requests/hitl_cb1f…/decide   # 经代理
```

```
HTTP=200 {"ok":true,"request":{…"status":"approved","decision_by":"jd-maint",
 "decided_at":"2026-10-04T04:54:23.440544+00:00",…},
 "resume":{"required":true,"method":"POST","endpoint":"/api/ops/hitl/requests/hitl_cb1f…/resume"}}
```

与 `src/api/hitl.ts:41-49`（`HitlDecideResponse` · resume 第二步提示块）逐键一致；**decide 不自动 resume** 两步钉死属实。

### 3.3 decide 失败面 —— **全通过**

| 场景 | 结果 |
|---|---|
| 重复 decide（已 approved） | `{"detail":"申请已是 approved，不接受重复决定"}` **HTTP=409** ✅（web FP-F2 卡片「已被处理」态分支的真状态码） |
| 未知 id decide | `{"detail":"申请不存在"}` **HTTP=404** ✅ |
| 非法 decision `"maybe"` | Pydantic literal_error **HTTP=422** ✅ |
| viewer decide（非 maintainer） | `{"detail":"Maintainer role required"}` **HTTP=403** ✅（FP-F4 降级分支真值） |

### 3.4 B2 rejected 路径 —— **通过（decide 语义）**

申请③（绑真实 run ba6d7fb2…）→ `decide {"decision":"rejected"}` → `HTTP=200 {"ok":true,"request":{…"status":"rejected",…},"resume":{"required":true,…}}`。

### 3.5 B2 resume —— **负路径如实记录（正路径未能复现）**

```bash
curl -b maint5173.jar -X POST …/hitl/requests/hitl_cb1f…/resume    # 已批准 · 但 run 从未真挂起
# {"detail":"thread 3667719d… 没有挂起的 interrupt —— 要么这轮已经跑完，
#  要么 checkpointer 与挂起时不是同一个"} HTTP=409
curl -b maint5173.jar -X POST …/hitl/requests/hitl_fb5b…/resume    # rejected 后 · 同上 HTTP=409
```

**409 not_interrupted 是正确行为**（与 `scripts/acceptance/hitl_approval_loop.py:185-192` 预期一致：无真挂起时恢复必须显式拒，不许假装成功）。`resume → run 推进至 done{completed}` 正路径**需要真 interrupt 挂起**，本环境复现失败（§3.0）。

### 3.6 未复现项的已有覆盖（供 00 签闸权衡）

| 未联调面 | 既有覆盖真值 |
|---|---|
| SSE `hitl.waiting`（reason+requests[]）+ `done{status:"waiting_approval"}` 帧形 | api pytest `tests/test_lg_rag_sse_hitl.py`（`__interrupt__` → hitl.waiting 帧翻译）· web Vitest AC7/AC10（store 注入帧断言卡片态 + activeRun 保留） |
| decide→resume 全链（approved→replan 解锁 / rejected→settle 收工） | api pytest `tests/test_hitl_pending_decide.py`（全链图替身 + `OPS_HITL_PERSISTENCE=db` decide→重建 store→resume 真 PG 链 · 20 用例 · invoke `ops-desk-api/docs/harness/invokes/by-task/hitl-browser-decide/invoke_20260930_30_40_hitl-browser-decide.md`） |
| web resume 响应型 `HitlResumeResponse`（`replay.events_persisted` 等） | **仅类型对拍 · 活响应未验证**（resume 正路径未复现的连带缺口） |

**结论**：B2 全部端点 HTTP 语义（pending/decide/409/404/422/403/owner 过滤/两步钉死）**通过**；SSE 挂起帧链 + resume 正推进**未能在本环境复现**（非失败 · 触发条件 LLM 随机 · 已有 pytest/Vitest 双侧覆盖）。

---

## 证据 4 · web dev 面 —— **通过**

```bash
curl http://localhost:5173/          # HTTP=200 · <title>Ops Desk</title>
curl http://localhost:5173/chat      # HTTP=200（SPA fallback）
# 代理转发对照：同一 cookie 会话（同 host 形态）经代理 vs 直连同响应
A=$(curl -b maint5173.jar http://localhost:5173/api/ops/chat/threads)
B=$(curl -b maint.jar     http://127.0.0.1:8000/api/ops/chat/threads)
[ "$A" = "$B" ] && echo PROXY_MATCH=YES   # → PROXY_MATCH=YES
```

代理链路另由证据 1/2/3 全程实证（login/auth.me/threads/history/pending/decide/resume 均经 `localhost:5173` 转发成功）。**环境注记**：本机 vite 绑 IPv6 `::1`，`127.0.0.1:5173` 拒连；cookie 按 host 形态分域，浏览器登录态与 curl 直测须用同一 host 形态（非 bug）。无头 UI 点击未做（按棒令非硬性 · 组件态 Vitest 225 用例已在仓覆盖）。

---

## 证据 5 · 失败面抽查 —— **通过**

| 场景 | 命令（经代理） | 结果 |
|---|---|---|
| 未登录 GET threads | `curl …/api/ops/chat/threads` | `{"detail":"Not authenticated"}` **401** ✅ |
| 未登录 GET history | `curl …/threads/{id}/history` | **401** ✅ |
| 未登录 GET pending | `curl …/api/ops/hitl/pending` | **401** ✅ |
| viewer（非 maintainer）GET pending | `curl -b viewer5173.jar …/pending` | `{"detail":"Maintainer role required"}` **403** ✅ |
| viewer decide | `curl -b viewer5173.jar -d '{"decision":"approved"}' …/decide` | **403** ✅ |

与 web 失败路径设计（FP-F3 401 跳登录 · FP-F4 403 降级）真值一致。

---

## 6 · 发现的 web 侧问题 —— **零**（另有 3 条非 web 观察转 00）

- **O1（环境/api 运维）**：本库首跑 PG checkpointer `setup()` 与流内长事务会话死锁（见环境排障留痕）——非 web 问题 · 已绕行 · api 侧可考虑启动期一次性 setup。
- **O2（api 侧异常 · 如实上报）**：attempt2（run `ac52b6d1…`）事件表**恰好丢 seq=1 `run.start` 一行**（其余 865 行连续完整 · `ops_lg_rag_run_events` 实证 seq[2..866]）→ B1 标题走 FP-4 降级（`ac52b6d1 2026-10-03T20:19:25`）。**降级链端到端工作正常（web 渲染降级标题正是 AC4 设计）**，但 fire-and-forget 落盘（`sse_stream.py` T5.1）丢首帧且无告警进我的视野（当次 api 日志已被重启覆盖，异常原文不可考）——建议 api 侧另棒核查 `persist_run_event` 首帧失败面。**非 web bug · 未修**。
- **O3（契约实况注记）**：completed run 的 `done` 帧 **不带 `status` 键**（`{run_id,thread_id,latency_ms}` · 5 次完成 run 一致）；仅 `waiting_approval` 带。与 web AC10「无 status 旧帧 → 现行完成分支」处理相容 · 与 SPEC「done.status 缺省 completed」一致 · 非问题。
- **web 侧契约对拍**：B1/B2 全部活响应与 `src/api/chatHistory.ts` / `src/api/hitl.ts` 字段族、壳形、拆包方式逐键一致，**零漂移 · 零集成 bug**。

---

## 7 · 收尾（无孤儿 · 已实证）

| 项 | 处置 |
|---|---|
| api（后台 job bash-308/334 · port 8000） | 已 kill · `lsof -iTCP:8000` 空 |
| web vite（后台 job bash-281 · port 5173） | 已 kill · `lsof -iTCP:5173` 空 |
| 探针进程（saver setup 挂起探针 bash-300 等） | 已 kill · `pgrep -fl 'uvicorn app.main\|vite'` 空 |
| 自建审批数据 | `DELETE FROM ops_hitl_requests WHERE id=ANY(3 条联调构造)` 已删 · pending 复查 `{items:[],count:0}` |
| 联调账号/会话/邀请（jd-maint · jd-viewer） | 留存本地 dev 库（会话自然过期 · 真实 run 历史留作 web 侧手工 UI 复查数据） |
| `/tmp/jointdebug/`（manifest/cookie jar/SSE 捕获） | 留存 /tmp 不入仓 |
| 两仓 git | web 仅本 invoke 新增 · api 零触碰（`.env` 未改 · 临时变量只进进程环境） |

---

## 8 · 证据结论汇总与 HG-JOINT-DEBUG 建议

| # | 证据 | 结论 |
|---|---|---|
| 1 | B1 threads（字段族 · 空态 200 · 降级标题 · running 态） | **通过** |
| 2 | B1 history（消息视图 8 键 · 跨用户/不存在 404） | **通过** |
| 3 | HITL 全链 | **部分通过**：B2 pending/decide/409/404/422/403/owner 过滤/两步钉死/rejected 路径全过；SSE `hitl.waiting`+`done{waiting_approval}` 挂起帧链与 resume→`done{completed}` 正推进**本环境未能复现**（NL 触发 LLM 随机 · 5 次尝试留痕 · 委派写闸按设计不可达）· 该面已有 api pytest + web Vitest 双侧覆盖 |
| 4 | web dev 面（首页/Chat 200 · 代理转发对照 MATCH） | **通过** |
| 5 | 失败面（401×3 · 403×2） | **通过** |

**联调棒建议（签署权在 00）**：B1/B2 REST 契约与 web client **活对拍零漂移**，HITL 决策面（浏览器可操作的全部端点语义）实证通过；未复现的仅剩「SSE 挂起帧 → 审批 → resume 正推进」的活链路一段，其帧形与状态机两侧均有测试覆盖，且 web 对 `hitl.waiting`/`done{waiting_approval}` 只是**消费渲染既有帧**（传输层零改动 · AC11 diff 空断言在案）。**建议：可由 00 裁定签 HG-JOINT-DEBUG**——若签，建议附带知悉 O1/O2 两条 api 侧观察；若维护者要求活链路实证方可签，则需 api 侧提供确定性的挂起构造手段（如仓内验收驱动或观察期自然流量），本环境已证 5 次按需触发不现实。
