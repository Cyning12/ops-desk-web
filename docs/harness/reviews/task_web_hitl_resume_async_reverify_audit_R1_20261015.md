# 审查文 · task_web_hitl_resume_async_reverify · 20-task-audit R1 · 2026-10-15

> **审查对象**：[`docs/tasks/active/task_web_hitl_resume_async_reverify.md`](../tasks/active/task_web_hitl_resume_async_reverify.md)（draft · v0 · 10 落稿 2026-10-15）
> **审查帽**：20-task-audit R1（书面审查 · 不改 task 实质内容 · 不代签 human_gate）
> **对照真值**：api 00 启动令 `invoke_20261015_00_dispatch_web_reverify.md` §三 六项 · api 30 回执 `invoke_20261014_30_api_receipt.md` 原文 · 本仓源码锚点 · api 仓 git 事实（全部亲读/亲跑核真，非转述）

---

## 一、结论摘要

| 维度 | 结论 |
|------|------|
| **内容审查** | **PASS** · 零内容阻塞 |
| **流程闸** | HG-TASK-DRAFT=approved（api 00 启动令链 · 在案）· HG-AUDIT-R1=**pending** · HG-GRAPH-MODULES=**pending**（blocks 30 · 本 task 无 30 棒 · 预判 n/a 成立）→ **40 拒开工**，待维护者签认 |
| **总评** | **PASS**（零阻塞 · nits 四条均非阻塞） |

---

## 二、审查重点逐项核对（亲读/亲跑留痕）

### 1. 验收 TC1–TC7 ↔ 启动令 §三 六项 —— 逐项对应 · 可机断 ✅

| 启动令 | task 验收 | 对应 | 机断判据核对 |
|--------|-----------|------|--------------|
| #1 resume<1s · 零 ERR_ABORTED | TC1 | 1:1 | network.json 计时 + ERR_ABORTED 计数 · 对照组 jc_tc3v2_network.json 亲证在档（git a30d705 attachments） |
| #2 卡片零误回「待审批」 | TC2 | 1:1（措辞增补「已批准」前缀 · 与 chat.ts:1120 既有文案一致） | 逐态截图 + pageerror/console.error=0 |
| #3 replay seq 连续 + 终帧逐键 | TC3 | 1:1 + 徽标实值项（溯源归档 TC3 §3 菜谱 · 非臆增 · 见 NIT-2） | seq 连续性脚本 + 终帧三键逐字对拍 + .sse 附件 |
| #4 在飞窗两形态均正确 | TC4 | 1:1 | 实测命中形态照登 · 两可均 PASS（防假红预钉与回执行为面第 2 点逐字一致） |
| #5 弱消费复查 | TC5 | 1:1 | live 键形照登 + grep 结论照登（本审查已复核 grep 为真） |
| #6 驳回/immediate 回归 | TC6 | 1:1（web 入口面裁剪与启动令「web 有入口的部分」口径一致） | 双链实证 |
| —（流程收口） | TC7 | 六项外流程必需项（质量门 + invoke 齐备 + 回执落盘 + task lint）· 已明标不属六项映射 | EXIT 码 + 文件存在机断 |

### 2. failure_paths 十行覆盖实操坑 ✅

亲证覆盖：FP-3 环境三坑（langfuse 引号/NO_PROXY 裸 ::1/strategy 候选 · 解法逐字钉死）· FP-5 登录 jar 已失（**本审查亲证 `/tmp/web_fobs.jar` 不存在** · 重取路径已钉 `create_initial_user.py`+addCookies 先例）· FP-8 api 仓分支脏（**亲证 api 仓在 `task/hitl-resume-async [gone]` + `uv.lock` 脏** · checkout master 钉法正确）· FP-6 在飞窗两形态误判防假红（与回执逐字一致）· FP-9 沉降等待（100–310s 预算与 api 40 实测 180804ms 一致）。另有 FP-1 闸纪律 / FP-2 破零改码预案 / FP-4 SSE 缓冲 / FP-7 在飞重复 resume 409 / FP-10 后台崩溃幂等 —— 五行点名坑全覆盖且有余。

### 3. 「无 30 棒 · 零改码」裁定 —— 成立 ✅（静态证据全部亲核）

| 证据 | 亲核结果 |
|------|----------|
| `src/api/hitl.ts:76` `resume: unknown` 弱消费 | ✅ 原文属实（:73-79 HitlResumeResponse 五键形与回执顶层键一一对应） |
| `replay.persisted` 无消费分支 | ✅ `grep persisted src/` 全量仅 `hitl.ts:67`（events_persisted）/`:69`（persisted）两字面 · 无任何展示/告警/分支消费 |
| `src/stores/chat.ts:1085` 响应不消费 | ✅ `await resumeHitlRequest(requestId)` 裸等成功/抛错 · :1084 required 分流条件亲读属实 |
| `src/api/http.ts:50` 零触达 | ✅ `timeout: 30_000` 现状 · 本 task 非范围明列 |
| api master 含 #252 | ✅ 亲跑 `git merge-base --is-ancestor 0e5f6b1 master` 成立 · master=`2a5878c` |
| 回执契约 | ✅ 亲读原文：200 保持 · `{ok,request,resume,replay,ts}` 不删不改 · `resume.status="accepted"` · `persisted=bool(run_id)` 恒 true · p95=46.6ms |

触发前提根除论证（130–310s 服务端同步 > 30s axios 超时 → p95 毫秒级）成立；catch「其他→waiting」分支（chat.ts:1113-1116 亲读属实）保留属正确防御 · 非本 task 面。

### 4. R0–R5 思考轮 —— 充分 · early_stop 成立 ✅

六轮齐（框定/证据/裁定/反例/可测性/收口）· 控制表五行结论+residual_risks 齐 · 正文五节回填闭合 · `actual_last_round: R5`。early_stop 理由「纯观测机理单一 · 锚点全亲读核真 · 契约回执钉死 · 再轮无新增信息」成立：纯观测复验无设计权衡空间，R3 反例面（旧链根除/catch 保留/immediate 钉案/409 文案差）已把残余风险逐项落入 failure_paths。残留两条（在飞窗命中形态 · 闸签认）均如实标注不藏。

### 5. 非范围边界 —— 守住 ✅

axios 30s 不动（http.ts:50 亲证现状未动）· freeze lg-rag-sse-v1 只消费（与其他 active task freeze_id 口径一致）· 勿混入 `task_web_tenant_context_chat`/`task_web_lg_rag_sse_continue_reply`（亲证两档在 active/ 列名 · 本 task 边界明列）· 后端零改动 · Retry-After 退避不做（fobs 裁定 C 存续）。

---

## 三、环境与工程细节抽验（附加亲核 · 全真）

- 分支 `task/web-hitl-resume-async-reverify` 正确 · base `028ed29` + handoff 2 commit（`8f55d9f`/`906f8e2`）+ 10 落稿 commit 在案 ✅
- `npx spec-wave task lint` **本审查复跑 PASS · EXIT=0** ✅
- 归档菜谱 `git show a30d705:...invoke_20261013_40_verify.md` §3 可读 · JC-F1 旧证据 `jc_tc3v2_network.json` 在档 ✅
- 在仓脚本 9 枚齐（task 列 7 枚为子集）· Playwright `~/.agent-tools/pw` 在案 ✅
- `packageManager pnpm@10.32.1` ✅ · `vite.config.ts:90-99` proxy 默认 8000 经 `VITE_API_PROXY` 覆盖 ✅
- 测试基线 255 有据（fobs TC4 记录 2026-10-13 实测 255/255）✅ · `docs/coding_wiki/volatile.md` 存在 ✅
- api 侧两 40 菜谱 invoke（hitl-resume-async / hitl-resume-replay-contract）在档 ✅

---

## 四、非阻塞观察（nits · 不阻塞签闸 · 可 40 期顺带照登）

- **NIT-1**：`required_invoke_hats=10,20,40` 含 20 → 按 v2.12 规则 20 invoke 快照须落盘。本审查已顺带落 `docs/harness/invokes/by-task/web-hitl-resume-async-reverify/invoke_20261015_20_task_audit.md`（纯新增 · 未触任何既有文件）。
- **NIT-2**：TC3 徽标 `latency_ms` 实值项超启动令 #3 字面，溯源归档 TC3 §3 菜谱「徽标实值与后端终帧逐位一致」既有判据 · 属复原 TC3 链完整性而非臆增，机断可行 · 记录即可。
- **NIT-3**：非范围称两相邻 task 为「CLOSE 面」，实测两档仍列 `docs/tasks/active/`（未归档）—— 口径微差，无碍边界语义。
- **NIT-4**：锚点行号表述微差（现状锚点表 `chat.ts:1084-1086` vs R1 正文 `chat.ts:1085`）—— 实际 :1084 为 if 条件、:1085 为 await，两表述均真。

---

## 五、阻塞项

**无内容阻塞 · 无流程阻塞**（闸 pending 为流程正常态 · 待人签）。

## 六、回填清单

无（零阻塞 · 无需退回 10-task）。

## 签收

20-task-audit R1 审查通过：**PASS**。task 内容可执行 · 验收可机断 · 无 30 棒裁定成立 · 思考轮闭合。本轮为 R1 即终轮（零阻塞）。

---

## 维护者签闸（20 后 · 40 前）

- [ ] 已读 R1 审查结论（本文）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] 一并确认 HG-GRAPH-MODULES n/a 预判（零改码 · `01_modules.md` 零触达）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 40 Prompt（纯观测 live 复验 · 无 30 棒 · task 表 approved 才是真值）

40 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md · 本 task 40 开工同适用）。
