# 20-spec-audit R1 审查：SPEC-web-hitl-decision-surface_v0（web-hitl-decision-surface）

> **hat**：20-spec-audit（SPEC 书面审 · 不实现 · 不改 SPEC 实质内容 · 不代签）
> **审查对象**：`docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（300 行 · draft · HG-SPEC-SIGNOFF=pending）
> **日期**：2026-10-17 · **轮次**：R1（轻量路径：10-spec 思考轮 R0–R5 已充分回填，单轮）
> **对照真值（全部本帽真读）**：
> - 上游（ops-desk-api 只读）：`docs/guides/RUNBOOK_hitl_ops_v1_zh.md`（§1 全链菜谱 · §1.5 追帧 nuance · §2 两类 409 纪律 · §5 FP-1 钉案 · §6 交接锚点五件）· `docs/spec/chat-history-hitl-ux/SPEC-chat-history-hitl-ux_v0.md`（§3 非范围 · §4 Q4 裁定原文）· `docs/tasks/close/close_hitl_resume_replay_contract_20261017.md`（PR #248 squash `acac5e6` · TC5 `latency_ms:135574`）· `docs/tasks/close/close_hitl_ops_runbook_20261017.md`（PR #264 squash `dd6e02d` · TC-4 `latency_ms:435584` · FP-4/FP-5 live 实证）
> - 本仓：`src/api/hitl.ts`（114 行全文）· `src/stores/chat.ts`（1277 行 · 锚点区段真读）· `src/composables/useLgRagSse.ts`（292 行全文锚点区段）· `src/views/ChatView.vue:275-305` · signed `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（非范围轮询条款）· 10 invoke `docs/harness/invokes/by-task/web-hitl-decision-surface/invoke_20261017_10_web-hitl-decision-surface.md`

## 判定：**pass**（零阻塞 · nit 3 条转 task 阶段 · 不代签 HG-SPEC-SIGNOFF · D-A 定夺留人签）

---

## 一、核对表

### 1. 契约冻结面（SPEC §2 照抄上游 · 逐键/逐字一致性）

| 冻结面 | 核对结果 |
|---|---|
| `GET /api/ops/hitl/pending` 字段族 `{items:[{id,run_id,thread_id,reason,blocked_by,created_at}],count}` · 仅本人 owner · 401 `{"detail":"Not authenticated"}` | ✅ 与 RUNBOOK §1.2（:74-82）逐字一致；403 非 maintainer 承 signed SPEC B2 口径 |
| decide：`{decision:approved\|rejected}` · 可选 note · `resume_mode∈{inherit,immediate,manual}` 未知值 **400 非 422** · `resume.required/endpoint` · immediate `auto_triggered=true` · 重复 409 / 404 / 422 | ✅ 与 RUNBOOK §1.3（:84-95）逐字一致；`auto_triggered` 键与本仓 `src/api/hitl.ts:58-59` T-W2 实证键一致 |
| resume：异步秒回 200 `{ok,request,resume:{status:"accepted"},replay:{run_id,cursor:"<run_id>:<seq>"}}` · cursor best-effort 空串 · 非已决 409 · 在飞 409「该申请的恢复正在执行中，待沉降后再试」· 503 / stranded_checkpoint 409 · 驳回也必须能 resume | ✅ 与 RUNBOOK §1.4（:97-107）+ §2.2（:150-153）逐字一致（中文 detail 原文逐字命中）；FP-5 live 实证（close_hitl_ops_runbook :53）同源 |
| replay：body `{cursor}` 或 `{run_id,after_seq}` · 在飞 **409 + Retry-After: 2** + 「Run is still in flight; retry after it settles.」· 沉降后零 diff · 挂起 run 合法 200 · 422/404 · 500 fail-closed 非重试面 | ✅ 与 RUNBOOK §1.5（:117）+ §2.1（:143-148）逐字一致（英文 detail 原文逐字命中）；FP-4 live 实证（close_hitl_ops_runbook :52）同源 |
| SSE 零新事件：hitl.waiting（reason+requests[] 含 unpersisted）· done{waiting_approval} · 终帧 `done{status:"resumed", latency_ms:int≥0, 无 model 键}` · 帧序 hitl.resumed → … → done{resumed} | ✅ 与 RUNBOOK §1.1（:68）/ §1.5（:118-125）/ §5（:216-224）一致；终帧三要素与 close 双档 TC5/TC-4 live 实证同形 |
| 追帧纪律四条（cursor 空串回退手动 · 200 部分帧末帧判终帧约 2s 再追 · 409 按 Retry-After 退避 · resume 409 等沉降不并发重提） | ✅ 与 RUNBOOK §1.4/§1.5/§2.1/§2.2 钉文逐条对拍一致，无自造 |
| PR 编号与哈希：#248 `acac5e6` · #250 `56e4a9f` · #252 `0e5f6b1` · #264 `dd6e02d` | ✅ 与 close 双档签录表逐字一致 |
| live 实证值引用：R0 `latency_ms:135574`（TC5）· AC6 `latency_ms:435584`（TC-4） | ✅ 与 close_hitl_resume_replay_contract :43 / close_hitl_ops_runbook :43 真实测值一致（非杜撰） |
| Q4 移交裁定引用「先在后端落盘合并的spec，实际spec后续交给前端agent再专项落盘」 | ✅ 与上游 SPEC :131 用户裁定原文逐字一致 |

**无自造字段**：§2 冻结面全部键名可溯上游；本仓既有 `HitlResumeReplay` 多出的 `events_persisted/events_failed/persisted/re_interrupted`（`src/api/hitl.ts:67-70`）属 T-W2 实证存量宽松键，SPEC 设计纪律 7「契约外宽松键只读容忍、不依赖」口径覆盖，不算越界。

### 2. 范围 D1–D4（覆盖 + 无越界）

| 委派/上游要求 | SPEC 承接 | 结果 |
|---|---|---|
| pending 消费与刷新纪律（RUNBOOK §6 锚点①） | D1-1 进入即拉 + D1-2 动作后刷新存续 + D1-3 手动刷新最小 UI + D1-4 降级纪律 + D1-5 零轮询边界 | ✅ |
| decide/resume 决策面（锚点②③） | D2-1 cursor 消费 + D2-2 immediate 例外存续 + D3-4 两类 409 分流 | ✅ |
| resume 后追帧（锚点④ · replay.cursor 用途） | D2-1/D2-3/D2-4 + D3-1 追帧循环 + D3-2 409 退避 + D3-3 清理 | ✅ |
| SSE freeze 零动（锚点⑤） | 设计纪律 1 + 非范围② + AC13 grep/diff 钉死 | ✅ |
| FP-1 禁伪造 | D4-1/D4-2 + FP-H9 + AC12 + 设计纪律 6 | ✅ |
| 越界扫描 | 全局面板/新路由显式非范围⑥；WS/轮询非范围⑤；api 仓零触碰非范围①；D3-2 触 `useLgRagSse.ts` 仅错误回调面（非范围②明文例外「裁定 D-C」） | ✅ 无越界 |

### 3. 非范围（十条 · 钉死）

✅ 十条全列且与上游/本仓 signed SPEC 零冲突：api 仓 · SSE freeze（错误面例外留痕）· 端点语义 · OA HMAC 面（requests/runtime/callback 明列）· WS 推送+轮询定时器 · 全局面板 · 单端点合并 · auto 运维化/HMAC 对接（承上游 CLOSE 后续建议在册）· B1 历史面 · 禁伪造。对照 signed SPEC-web-chat-history-hitl-ux :130 非范围「审批实时推送（WS / 轮询定时器）」——本 SPEC 非范围⑤的「承」引用准确成立。

### 4. 验收可机断性（AC1–AC16）

✅ 全部可机断：调用次数/顺序断言（AC1/AC2/AC4 decide→resume→replayLgRag）· fake timers 退避/循环/清理（AC7/AC8/AC11）· store 分态分流（AC9 「恢复进行中」vs「已被处理」· 现状假相回归钉死）· DOM 断言（AC6 徽标 435584ms + 模型段不存在 · AC12「—」）· grep/diff 契约断言（AC3 无 setInterval · AC13 SSE 零动 · AC12 无伪造 model）· 质量门三门 + G-L1（AC15/AC16）。mock 字段族全部落在 §2 冻结面内（AC14 钉「逐键对齐 · 不自造」）。

### 5. failure_paths（FP-H1~FP-H13）

✅ 覆盖度齐备：契约面全失败码（cursor 空串 H1 · replay 409 退避 H2 · 200 部分帧 H3 · resume 在飞 409 H4 · decide 409 H5 · 404/422 H6 · 401 H7 · 403 H8 · 503/stranded H12）· FP-1 契约行为 H9 · 手动停止/会话切换清理 H10 · 执行失败终帧不到达兜底 H11 · 流程闸 H13。最锋利边界（H4 修现状假相 + H2/H3 两类「未完成」信号纪律不可混）已在 R3 显式识别。FP-H6/H7 引用的既有语义锚点 :993-1003/:987-992 本帽抽验属实。

### 6. 思考轮闭合（R0–R5）

✅ R0–R5 全 done · 控制表在案 · early_stop=no。R2 四裁定（D-A/D-B/D-C/D-D）各 ≥2 案且荐案依据统一（契约钉文照抄 + 复用既有管线 + signed 非范围零冲突）。R5 开放裁定仅 D-A 一条待人裁——如实，未藏。

### 7. file:line 锚点真实性抽查（本帽真读复核 · 15 项）

| SPEC 声明 | 实测 | 结果 |
|---|---|---|
| `hitl.ts:64-79` HitlResumeReplay{cursor}/HitlResumeResponse | :64-71 / :73-79 逐行一致 | ✅ |
| `chat.ts:1085` `await resumeHitlRequest(requestId)` 返回值丢弃（D2-1 落点 :1084-1086） | :1084-1086 逐行一致（required!==false 才调 · 返回值未接） | ✅ |
| `chat.ts:1089-1095` 任何 409 一律 resolved+「该申请已被处理」 | :1089-1095 逐行一致（现状假相实证成立） | ✅ |
| `chat.ts:1118-1120` 卡片 decided+「已批准 · 点击续看推进」 | 逐行一致 | ✅ |
| `chat.ts:1121` 动作后 refreshHitlPending | 逐行一致（AC16① 注释在案） | ✅ |
| `chat.ts:1040-1053` refreshHitlPending 降级分态 | 逐行一致（403/非401 分支如述） | ✅ |
| openHistoryThread :1197 注释钉 AC16② | 函数定义 :1197 · docstring :1190-1196 内含「AC16② · 不轮询」(:1194) | ✅ |
| `chat.ts:958-1033` resumeFromCursor 单发 replay · :1020-1029 onDone 未见终帧提示 · :1004-1011 409 落通用错误分支 | 逐行一致（409 实落 else 分支 :1004-1011 · 不读 Retry-After） | ✅ |
| FP-H6 :993-1003 / FP-H7 :987-992 既有语义 | 逐行一致 | ✅ |
| `chat.ts:183-188` ChatDoneInfo · :744-751 缺键存 null/'' · :732-754 done 分支 | 逐行一致（waiting_approval 早退 :741-743 亦在） | ✅ |
| `useLgRagSse.ts:34-40` LgRagSseTransportError 无 retryAfter · :231-242 非 2xx 仅解析 JSON body | 逐行一致 | ✅ |
| 帧解析透传 :81-101 · replayLgRag :156-161 · REPLAY_PATH :107 | 逐行一致 | ✅ |
| `ChatView.vue:286-287` 仅渲染 hitlPendingError · :290-294 缺键显「—」+ model v-if | 逐行一致 | ✅ |
| D3-1 引用「`extractFrameCursor` 既有 · **:476-495** 先例」 | 函数真实存在且行为如述（cursor 合成 :581-591），但**实际位于 `chat.ts:569-597`**（FrameCursor 接口 :569-572 · 定义 :578）；:476-495 现为 reveal 队列函数区（resetRevealQueues :471 等） | ⚠️ **行号漂移 → nit N1** |

锚点抽查 14/15 全中 · 1 项行号漂移（语义引用正确 · 函数真实）→ 非阻塞。

### 8. 三条照登点裁处留痕（专项核）

| 照登点 | SPEC 留痕位置 | 结果 |
|---|---|---|
| **D-A 轮询偏差**：委派 brief 提及「pending 轮询/刷新纪律」· 本帽按 signed 非范围裁 S1 事件驱动 | §5 D-A S2 裁决列原文照登「如实照登……若维护者要轮询须在签收时显式推翻此条」· 非范围⑤ · D1-5 · R2/R5 开放裁定 · 10 invoke 照登点 #1 | ✅ 如实留痕；对照 signed SPEC :130 非范围排除轮询定时器成立（注：上游 api SPEC :99 口径「轮询/进入即拉取即可」未禁轮询，禁用口径来自**本仓** signed SPEC——SPEC 引用对象准确） |
| **D-C 错误面扩展**：`LgRagSseTransportError` 增可选 `retryAfterSeconds` 属客户端内部面 | 设计纪律 1 括注 · 非范围②「错误回调面扩展除外 · 裁定 D-C」· §5 D-C（弃选 S2 硬编留档）· AC13「仅错误面可选增键 · 既有回调签名兼容」· 10 invoke 照登点 #2 | ✅ 边界声明与例外条款互锁，无暗扩 |
| **追帧上限**：建议 ≤10 次或 ≤120s · 30 定稿写 task | D3-1 括注 · AC7 只钉「有界」语义（≥1 次再追 · 间隔 ≥2s · 达上限降级）· FP-H2/H11 同一上限 · 10 invoke 照登点 #3 | ✅ 参数待定如实照登，验收语义不悬空 |

### 9. 结构与人闸纪律

✅ 骨架与先例（SPEC-web-chat-history-hitl-ux v0）一致：blockquote 头部/元信息/人闸表/§1–§10/修订记录齐备，「契约冻结面」专节为跨仓承接合理增量。HG-SPEC-SIGNOFF=pending 状态行与人闸表一致 · 未代签 · 10 invoke 在案且纪律核验六项全勾 · 零 git 操作声明与本帽核真一致（工作树未见分支/提交动作）。

---

## 二、阻塞项

**无。**

## 三、非阻塞 nit（转 task 阶段处理 · 不退回 10-spec）

- **nit N1（行号漂移）**：D3-1 引用 `extractFrameCursor` 锚点 `chat.ts:476-495` 失真，真址 `src/stores/chat.ts:569-597`（接口 :569-572 · 定义 :578 · cursor 合成 :581-591）。函数真实存在、行为与引用语义一致，仅行号漂移。建议 10-task 起草时顺手更正引用（或在 SPEC 修订记录补一笔），30 勿按失真行号动刀。
- **nit N2（AC 同号歧义）**：D1-1「承 AC16 两消费点补第三点」的 AC16 指 signed SPEC-web-chat-history-hitl-ux 的 AC16（①②消费点），而本 SPEC 自有 AC16 是 G-L1 图谱条目——同号不同义。建议 task 阶段引用时写「承 signed SPEC AC16①/②」消歧，防 30 误读本 SPEC AC16。
- **nit N3（grep/diff 断言形态）**：AC3（无 setInterval 轮询）/AC13（无新 event_type 构造 · 解析 diff 为空）/AC12（无伪造 model 字面）属 grep/diff 类断言，建议 task 阶段钉具体断言形态（搜索面/排除注释与测试文件/基线计数），承前审查 nit N2 先例防口径漂移。

---

## 四、HG-SPEC-SIGNOFF 建议

**建议维护者签收 approved（含 D-A 定夺）。** 理由：契约冻结面与上游 RUNBOOK/双 close 档/signed SPEC 逐键逐字对拍零漂移（PR 哈希、409 双 detail 原文、Retry-After:2、终帧三要素、live 实测值 135574/435584 全部可溯）；D1–D4 覆盖 RUNBOOK §6 交接五件且无越界；非范围十条与 signed SPEC 零冲突；AC1–AC16 全可 Vitest/grep 机断；FP-H1~H13 覆盖契约全失败码 + 现状假相修复；R0–R5 闭合；三条照登点（D-A 偏差 / D-C 边界 / 追帧上限）如实留痕；锚点抽查 14/15 全中（1 项行号漂移转 nit）。

**签收时须一并定夺 D-A**：委派 brief「轮询」字面与 signed 非范围「零定时器」的偏差已照登——维护者签收即默认认可 S1 事件驱动；若要固定间隔轮询须显式推翻并修订非范围⑤。

**本帽不代签**——SPEC 人工闸表维持 `HG-SPEC-SIGNOFF=pending`，待维护者签录。

## 五、下一棒

维护者签 `HG-SPEC-SIGNOFF=approved`（含 D-A 定夺）后 → **00 起草 web task**（`invoke_slug=web-hitl-decision-surface` · 分支 `task/web-hitl-decision-surface`）：无 blocked_by（上游契约已 freeze + live 实证，可直接对 live 联调 · 可含 40 棒）；nit N1/N2/N3 随 task 阶段回填闭合；追帧上限参数（≤10 次或 ≤120s）task 定稿。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-17 | 20-spec-audit R1：**pass**（零阻塞 · nit N1 行号漂移 / N2 AC 同号歧义 / N3 grep 断言形态 · 转 task 阶段）· 契约面逐字对拍 + 锚点 15 项抽查 + 三条照登点专项核 · 未代签 HG-SPEC-SIGNOFF（D-A 定夺留人签）· 未改 SPEC 与 src/ 任何文件 · 零 git 操作 |
