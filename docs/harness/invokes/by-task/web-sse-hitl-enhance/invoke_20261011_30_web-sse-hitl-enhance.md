# Invoke：30-execute · web-sse-hitl-enhance

> **用途**：30 实现留痕（T-W2 SSE/HITL 增强批 · 帧型注释 7 型 + resume_mode 三选 UI + done{resumed} 终态钉 + 未知帧容错，并复跑 S2/S3 验收令）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · 2026-10-11 · 维护者授权 00 代录 m00230）→ GO 30。  
> **本棒性质**：R2 审查 B-R2-1 补证棒——S2/S3 实操已于 2026-10-11 17:17–17:40 真跑（PR #61 body 实证叙述在案），本文将存续证据仓内化；代码面零改动（R2 裁定代码面 PASS-WITH-NIT 无返工）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-sse-hitl-enhance` |
| freeze_id | `web-integration-v0`（契约零 diff · SSE 事件表未改） |
| git_branch | `task/web-sse-hitl-enhance` |
| created_utc_or_local | 2026-10-11 |
| review | `docs/harness/reviews/task_web-integration_audit_R1_20261011.md`（R1 合审 PASS-WITH-NIT）· `docs/harness/reviews/task_web-integration_impl_R2_20261011.md`（R2 实现审 · B-R2-1 由本文解阻塞） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | — | ✅ |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（本批 graph_delta=n/a） |

**机检口径偏差照登**：spec-wave 3.3.0 `verify` 对本 task 报「missing R<n> review」——实体审查为合审命名 `task_web-integration_audit_R1_20261011.md`（覆盖 T-W1/T-W2/T-W3），与 per-task basename 期望不匹配。裁定沿用 R1/T-W1 口径：**人工闸表为真值，审查实体存在且代码面零阻塞，仅命名口径不匹配**。

## 联调环境与坑位（W7 钉死 · 沿用 T-W1 血泪留档并增补）

| 坑 | 钉案 |
|---|---|
| pnpm 版本 | 仓钉 pnpm@10.32.1；PATH 前置的 pnpm 11 拒跑 → 一律 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` |
| NO_PROXY 双剥 | httpx 读小写 `no_proxy`，`[::1]` 解析炸 → 起后端/跑 curl 一律 `env -u NO_PROXY -u no_proxy`（步骤脚本首行均在案 · `attachments/scripts/`） |
| vite proxy | 必须 `127.0.0.1`（macOS localhost 走 IPv6 打到 Docker 旧镜像 404） |
| SSE 代理缓冲（FP-3） | vite dev proxy（:5174→:8050）转发 `/lg-rag/stream` 逐帧到达实证不缓冲——`attachments/logs/vite_proxy_frames_ts.log` 每行带 epoch 时间戳：seq1 t=...046.218 → seq8 t=...055.649，12s 窗内 8 帧跨 ~9.4s 渐进到达（一次性齐到=缓冲，未发生） |
| S3 后端起法 | 独立实例 :8050（不动 T-W3 共用 :8000）：`env -i` 六 env 组 + `python3 serve_8050.py`（`attachments/scripts/serve_8050.py` · logging.basicConfig 启动器 · env 启动瞬间生效） |
| 六 env 组生效实证 | `attachments/logs/api_8050_excerpt.log`：[L4] 能力层持久化：db · [L13] HITL 持久化：db · [L18]/[L86] strategy 候选 env 追加集生效 ids=['testing.write.echo'] · [L75]/[L77] delegation token_issued/token_verified（LG_RAG_DELEGATION_TOKEN_MODE=enforce 才会签发）· echo 写能力被 HITL 闸拦（OPS_CAPABILITY_ALLOW_WRITE=1 + ALLOW_WRITE_TAGS=testing → side_effect=write 强制审批） |

## 30 实施记录（W1–W6 实现锚 · head 8efe8f2）

| W | 实现 | 锚点 |
|---|---|---|
| W1 帧型注释 6→7 型 | `event_type` doc comment 补 `hitl.waiting`（7 型枚举 · 运行时零改动） | `src/composables/useLgRagSse.ts:28` · onEvent 注释 :42 同步 |
| W2 resume_mode 三选 UI | 卡片 `el-radio-group data-test=hitl-resume-mode` 三选（inherit 续跑默认 / immediate 批准即续跑 / manual 手动续跑）· 默认 inherit | `src/components/chat/HitlApprovalCard.vue:19`（默认 inherit）· :22（透传第 4 参）· :49-60（三选组） |
| W2 NIT-4 落地 | `decideHitlRequest` 增可选第三参——**仅 resumeMode 非空且 !=='inherit' 才送 body.resume_mode** → inherit 载荷 `{decision}` 字面不变 | `src/api/hitl.ts:99-100`（`if (resumeMode && resumeMode !== 'inherit') body.resume_mode = resumeMode`）· `src/stores/chat.ts:992-995`（inherit 走精确 2 参调用 · 保 tests/chat-store-hitl.spec.ts:325 旧断言原样） |
| W2 响应驱动续链 | decide 响应 `resume.required !== false` 才链第二步 resume；immediate（required=false · auto_triggered=true）跳过避免 409 误呈「已被处理」 | `src/stores/chat.ts:999-1000`（`if (decideResp.resume?.required !== false) await resumeHitlRequest(requestId)`）· S3 实证见下 |
| W3 done{resumed} 终态 | done 分支仅 `waiting_approval` 特判保留续看；resumed/completed/failed/无 status 一律通用终态（lastDone + clearActiveRun）——禁依赖 completed 字面天然满足；latency_ms/model 缺省兜底 0/'' | `src/stores/chat.ts:718-738` |
| W4 S2 断线 replay | 见「S2 实操证据」节 | — |
| W5 S3 六 env 全链 | 见「S3 实操证据」节 | — |
| 未知帧容错 | default 分支忽略未展示帧型（注释在案）；新测试 hitl.resumed/tool_call/x.future.v2 三枚前瞻帧不崩不改态 | `src/stores/chat.ts` done 分支后 default · tests/chat-store-hitl.spec.ts 新钉 |
| W6 FP-5 闸 | lint ✅ · Vitest 230/230 · build ✅（见「verify 闸」节） | — |

## S2 实操证据（W4 · 断网 replay 零丢失 + 未知帧容错）

run `640d68970a564fbb8459d8d40cb1c5f6`（thread d5a29ad6… · supervisor 模式 · 问题「T-W2 S2 断线续看验收 smoke」）：

1. **live 截断**：`s2_step1_live_cut.sh` curl -m 10 掐断 → `attachments/sse/s2_partial.sse`（6 帧 seq1–6 · 末帧 answer 途中）。
2. **replay 全量**：after_seq=0 → `attachments/sse/s2_full.sse`（6 帧 seq1–6）。
3. **对拍结论**：`PARTIAL_EQ_FULL_PREFIX=True`——partial 6 帧 seq 与 payload 逐键（sort_keys JSON 比对）等于 full 前缀，零丢失零重复零乱序（对拍脚本 `s2_step2/s2_step4_replay_compare*.sh` 内嵌 python 判定式在案）。
4. **GAP_EQ_FULL_TAIL 承证**：本 run 的 gap 捕获（after_seq=6 → /tmp/tw2_s2_gap.sse）撞 F-OBS-2 replay 瞬返 500，落盘为 0 字节——**该口径由 HITL run 的 after_seq=7 缺口重放承证**（见 S3 第 4 条 · `s3_replay_gap_seq8-18.sse` 11 帧 seq8–18 = 全量尾部精确切片）。
5. **未知帧容错实证**：① Vitest 层——chat-store-hitl.spec.ts 新增三枚前瞻帧钉（hitl.resumed / tool_call / x.future.v2 经 store 管线不崩不改态）；② 传输层——`s3_replay_gap_seq8-18.sse` seq8 即 `hitl.resumed` 帧，**该帧型未收编进 useLgRagSse.ts:28 的 7 型清单**，实证后端真会发清单外帧型，前端 default 分支容错路径为必备而非防御性臆造。

## S3 实操证据（W5 · 六 env 组 HITL 全链）

后端 `env -i` 六 env 组自起 :8050（`serve_8050.py` · 生效实证见坑位表末行）。三 run 实录：

### run 88f15a0c8ca94114a732b17ad4ba9dc3（waiting → bogus 400 → decide → resume → replay 18 帧）

1. **挂起**：`attachments/sse/s3_live.sse` 7 帧 seq1–7 · seq6 `hitl.waiting`（requests[0].id=hitl_1f92d67ea6494d7491b4 · reason「委派签发需人工审批（capability testing.write.echo 非只读（side_effect=write））」）· seq7 `done{status:'waiting_approval', latency_ms:23733}`——终帧但非完成态，续看游标保留（W3 分支实证）。
2. **bogus resume_mode → 400 白名单**：decide 送非法 resume_mode → `api_8050_excerpt.log` [L64] `POST .../decide HTTP/1.1" 400 Bad Request`；随即合法 decide [L68] 200 OK（[L67] HITL 浏览器决策 decision=approved by=admin）。**响应体实录未落盘（会话易失已失）**——以 api.log 状态行 + 前端通用错误分支（chat.ts:1002-1006 · 不本地臆造第四值）测试钉为据。
3. **decide（默认 inherit 不送键）→ resume 两步钉死**：[L69] hitl_persist_guard_skip · [L70] 解锁 1 步重跑 · [L73] delegation_approval_consumed · [L75] token_issued · [L77] token_verified · [L80-81] HITL 恢复完成 replay=…:18 + `POST .../resume 200 OK`。
4. **replay 全量 18 帧**：`attachments/sse/s3_replay_full_18frames.sse` **seq1–18 连续无缺**（python 核验 `seqs==list(range(1,19))` = True）· seq8 `hitl.resumed`（approved=[…:1] · decided_by=admin）· **seq18 `done{status:'resumed', latency_ms/model 缺省}`**（F-OBS-1 前端兜底 0/'' 已钉 AC10 测试）。缺口重放 after_seq=7 → `attachments/sse/s3_replay_gap_seq8-18.sse` 11 帧 = 全量尾部精确切片（GAP_EQ_FULL_TAIL=True · 零丢失零重复）。
5. **echo 真执行**：replay 帧内 supervisor 规划 subtasks[{tool:testing.write.echo}] → 工具执行 → answer 收束（帧序 seq9–17 在 `s3_replay_full_18frames.sse` 可溯）。

### run f79785708e7d46029943d1ecc4abfa1b（immediate 链）

1. **挂起**：`attachments/sse/s3_imm_live.sse` 7 帧 · seq6 hitl.waiting（request hitl_5af5514e5a554de2ac96）· seq7 done{waiting_approval}。
2. **decide resume_mode=immediate**：`attachments/logs/s3_imm_decide_response_200.json` 原始 200 响应体——`request.status=approved` · **`resume.required=false · auto_triggered=true`**（此即 chat.ts:999-1000 跳步判据的实证来源；同刻 api.log [L131-133] hitl_auto_resume_triggered/claimed resume_mode=immediate）。
3. **auto 续跑 replay**：`attachments/sse/s3_imm_replay.sse` 12 帧 seq1–12 · seq8 hitl.resumed → 续跑帧在案（UI 自适应 = 无第二步请求 · 不撞 409）。
4. **二次 resume 幂等拒绝**：`s3_imm_step3_double_resume_409.sh` 对已 immediate 续跑的申请再 resume → api.log [L1010] `409 Conflict`（[L1009] WARNING 没有挂起的 interrupt）——实证前端若不跳步必撞此 409 误呈「已被处理」。

### F-OBS-2 传输观察（照登 · 已转呈后端裁）

api_8050_excerpt.log [L340]：run 在飞时 `POST /lg-rag/replay` 瞬返 `500 Internal Server Error`（asyncpg 事务冲突栈 [L341-345]），沉降后恢复 200——S2 gap 捕获 0 字节即此所致。是否 409/Retry-After 语义化请维护者裁。

## verify 闸

`pnpm lint` ✅ exit 0（`attachments/logs/eslint_clean.log`）· `pnpm test` ✅ **230/230**（28 文件 · chat-store.spec.ts 65 it · chat-store-hitl.spec.ts 22 it · chat-view.spec.ts 7 it · +5 新钉 · `attachments/logs/vitest_230of230_tail.log`）· `pnpm build` ✅ vue-tsc + vite 1.88s（`attachments/logs/build_tail.log`）。  
**B-R2-1 补证棒复跑**（纯文档改动后 · 2026-10-11 18:12）：`pnpm lint` ✅ exit 0 · `pnpm test` ✅ 230/230（28 文件 · Duration 2.87s）零回归——纯 docs 零影响实证。

## 已失/不落仓证据照登（FP-1 宁缺勿假）

| 证据 | 状态 | 承证替代 |
|---|---|---|
| /tmp/tw2_s2_gap.sse（S2 gap 捕获） | 0 字节（撞 F-OBS-2 500） | GAP_EQ_FULL_TAIL 由 s3_replay_gap_seq8-18.sse 承证 |
| bogus resume_mode 400 响应体 | 会话易失已失 | api.log [L64] 400 状态行 + [L68] 200 对照 + 前端通用错误分支测试钉 |
| /tmp/tw2_8050.jar / tw2_5174.jar | 含 ops_session 会话令牌 · 不落仓 | 登录链已由 api.log [L10-11] 401→login 200 承证 |
| S2/S3 UI 截图 | 本批验收为 curl+SSE 原始帧口径 · 无截图 | SSE 原始体即帧级真值；前端渲染行为由 230 测试钉覆盖 |

## B-R2-1 解阻塞声明

R2 审查（task_web-integration_impl_R2_20261011.md §3 证据面 FAIL · §6 阻塞项）裁定：「需补交 invoke_20261011_30_web-sse-hitl-enhance.md（+ SSE 样本/日志 attachments）后复核；代码面无需返工」。本棒交付：① 本文落盘 `docs/harness/invokes/by-task/web-sse-hitl-enhance/`；② S2/S3 实证锚点全部仓内化（7 枚 SSE 原始体 + 8 枚步骤脚本 + 6 枚日志/响应实录 · 一律相对路径引用 · 零 /tmp 引用）；③ 已失证据如实标注承证替代。**B-R2-1 解阻塞条件（invoke 落盘 + 锚点仓内化）已满足，请 20 帽复核。**

## 30 产出（本棒纯文档 · src/tests 零触碰）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/harness/invokes/by-task/web-sse-hitl-enhance/invoke_20261011_30_web-sse-hitl-enhance.md` | 新建 | 本留痕 |
| `.../attachments/sse/` | 新建 | 7 枚 SSE 原始体（s2_partial/s2_full/s3_live/s3_replay_full_18frames/s3_replay_gap_seq8-18/s3_imm_live/s3_imm_replay） |
| `.../attachments/scripts/` | 新建 | 8 枚实操步骤脚本（serve_8050.py + s2_step1-4 + s3_imm_step1-3 + vite_proxy_smoke.sh · invite_token 变量化不落真值） |
| `.../attachments/logs/` | 新建 | 7 枚（api_8050_excerpt 关键段带原始行号 · vitest_230of230_tail · eslint_clean · build_tail · vite_proxy_frames_ts · vite_dev_5174 · s3_imm_decide_response_200.json） |

## 缺口

**无 FP-1 前端迁就**。后端观察项照登转呈（R2 §7 已在案）：F-OBS-1 done{resumed} 帧 latency_ms/model 缺省（前端兜底已钉）· F-OBS-2 run 在飞 replay 瞬返 500。

## 非范围遵守

未改 src/**、tests/**、package 配置；未动主 checkout 工作树与其他分支/PR；api 仓零改动（仅运行）；未合并任何 PR。worktree /tmp/ops-desk-web-tw2 保留待主 Agent 统一清理。
