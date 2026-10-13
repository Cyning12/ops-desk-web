# task_web_hitl_fobs_receipt · R1 审查（20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_hitl_fobs_receipt.md`（web-hitl-fobs-receipt · T-W2 回执 · F-OBS-1/F-OBS-2 闭环复验 + 前端兜底三裁定）
> **审查帽**：20-task-audit（R1 · 书面审查 · 不改 task 实质 · 不代签 human_gate · 全程零 git 命令 · 零 src/tests 改动）
> **日期**：2026-10-13 · **仓**：ops-desk-web · **分支**：`task/web-hitl-fobs-receipt`
> **后端对照真值**：`../ops-desk-api/docs/tasks/active/task_hitl_resume_replay_contract.md`（TC1–TC5 全勾）+ `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`（六条 live 实证 · 附件 16 件）——均亲读原文核真，未信转述
> **链上对照**：`docs/tasks/done/task_web_sse_hitl_enhance.md`（T-W2 · done · FP-1 报回纪律 :84/:112 在案）· `docs/harness/reviews/task_web-integration_audit_R1_20261011.md` §3（T-W2 R1 格式先例）
> **审查性质**：常规 R1（10 落稿完成 · lint PASS · 30 未开工 · 无闸序倒置）
> **审查限制声明**：本帽纪律禁一切 git 命令 → 父级所称落稿 commit `a38f285` 与后端 origin/master=`9ee928c` 哈希**无法独立机验**，以文件面证据为准（见 NIT-1）

---

## 结论摘要

| 维度 | 结论 |
|------|------|
| **内容** | **PASS**（零内容阻塞 · NIT-1/NIT-2/NIT-3 非阻塞注记） |
| **流程闸 HG-AUDIT-R1** | **pending**（维持 · 待人签） |
| **流程闸 HG-GRAPH-MODULES** | **pending**（维持 · 待人签 · 与 graph_change_layer=`n/a` 自洽） |

锚点 8 组全部亲读核真、三裁定逐条核对成立、验收 TC1–TC5 可机断、failure_paths 八行兜底真实、思考轮 R0–R5 闭合（early_stop at R5 依据成立）、与后端契约真值及 T-W2 链闭环一致。**不构成退回 10-task**。维护者签闸时一并裁定 NIT 是否回填。

---

## 1. 独立实证（本审查实跑 · 只读）

| 核对项 | 命令/方式 | 实测 | 与 task 声明一致？ |
|--------|-----------|------|--------------------|
| task lint 独立重跑 | `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_fobs_receipt.md` | **LINT: PASS · EXIT=0** | ✓（task :210 自检一致） |
| Vitest 基线计数 | `grep -cE "^\\s*(it|test)\\(" tests/` 逐文件 | **全量 252 条 it · 31 个 spec 文件 · chat-store.spec.ts 65 条 · chat-store-hitl.spec.ts 24 条** | ✓（FP-5 闸 252/65 钉死值为真 · 与 T-W2 CLOSE main verify 252/252 口径一致） |
| ChatDoneInfo 类型 | 读 `src/stores/chat.ts:171-174` | `{ latency_ms: number; model: string }` 字面 | ✓ |
| done 分支兜底字面 | 读 `src/stores/chat.ts:730-735` | `:733` `typeof latency === 'number' ? latency : 0` · `:734` `typeof model === 'string' ? model : ''` | ✓（裁定 A 裁 `:733` 的 `: 0` · 裁定 B 留 `:734` · 行号精确） |
| waiting_approval 分支 | 读 `src/stores/chat.ts:727-729` | `payloadString(event,'status')==='waiting_approval'` 提前 break · 不记 lastDone | ✓（非范围零触达成立） |
| replay onError 落点 | 读 `src/stores/chat.ts:898-926` | 401→auth 清场 · 404/422→清 active-run 不可重试 · **else（:919-925 · 含 409）→ retryable 错误条 + `transportError.message` 透传** | ✓（裁定 C 现状描述属实） |
| 非 2xx 分类 / Retry-After | 读 `src/composables/useLgRagSse.ts:225-235` + 全文 grep `Retry-After|retry-after|headers` | `!response.ok` → 解析 body `detail` → `onError{kind:'http', status, message}`；**响应头全文零读取**（仅 :192 请求头）· Retry-After 确未透传 | ✓（裁定 C 技术成本判断属实：自动退避须动 `postLgRagSse` 签名） |
| `postLgRagSse` 存在性 | grep + 读 `useLgRagSse.ts:158-162` | 内部函数 `postLgRagSse(path, body, callbacks)` 在案 · `streamLgRag`(:136)/`replayLgRag`(:154) 双委托 | ✓（裁定 C 引用函数名为真） |
| 徽标渲染 | 读 `src/views/ChatView.vue:260-264` | `完成 · 耗时 {{ chat.lastDone.latency_ms }}ms` + `:261` `<template v-if="chat.lastDone.model">` 模型段 | ✓（裁定 B「v-if 缺省不渲染」属实） |
| T-W2 兜底断言字面 | 读 `tests/chat-store-hitl.spec.ts:182-199` | it 起于 :182 · `:199` `expect(chat.lastDone).toEqual({ latency_ms: 0, model: '' })` | ✓（裁定 A 改写面精确 · 现行断言与裁定冲突 = RED 签名成立） |
| vite proxy 坑位 | 读 `vite.config.ts:90-99` | `target: ... || 'http://127.0.0.1:8000'` · IPv6 坑注释在案 | ✓ |
| 联调菜谱 | glob `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/*` | **9 件全在**：task 点名 7 件（s2_step1/s2_step2/s3_imm_step1-3/serve_8050.py/vite_proxy_smoke.sh）+ 额外 s2_step3_raw_probe / s2_step4_replay_compare_final；脚本头亲读（s2_step2 含 PYEOF seq 连续性机判 · s3_imm_step3 含 409 复打形态） | ✓（S2/S3 可复用 · 见 NIT-3） |
| 后端契约真值 | 亲读 api task 全文 + 40 invoke 全文 | TC1–TC5 全 `[x]` 勾选 · seq18 `done{status:'resumed', latency_ms:135574}` **无 model 键**（payload 键集 = {events_persisted, latency_ms, run_id, status, thread_id}）· 在飞 replay **409 + retry-after: 2 + body {"detail":"Run is still in flight; retry after it settles."}**（两 run 三打 · 500 消失）· 挂起/沉降 replay 200 零 diff · model 不补 = FP-1 钉案（sse_stream.py 全文零 model 引用 · 禁伪造） | ✓（task 背景三观察项与后端真值逐字一致） |
| 环境三坑 | 对照 api 40 invoke :15-19 | ① langfuse 引号炸 port → `OPS_CHAT_TRACER=off` ② `NO_PROXY` 裸 `::1` 炸 httpx → `env -u` 九变量 ③ strategy 候选缺 `testing.write.echo` → env 追加口 | ✓（task :102 坑位表逐字一致） |
| 六 env 组 | 对照 `docs/spec/web-integration/SPEC-web-integration_v0.md:134`（§5） | 六枚 env 名逐字一致（`LG_RAG_DELEGATION_TOKEN_MODE=enforce` 等） | ✓ |
| T-W2 链闭环 | 读 `docs/tasks/done/task_web_sse_hitl_enhance.md` | :84/:112 FP-1 报回纪律在案（后端缺口报回 api 另立 task · 禁前端迁就）· :3 CLOSE 状态（252/252 · PR #61 MERGED） | ✓（F-OBS-1/F-OBS-2 确为 T-W2 FP-1 报回源） |
| 闸表诚实性 | 读 task 人工闸表 :38-42 | HG-TASK-DRAFT approved（维护者启动令）· HG-AUDIT-R1 / HG-GRAPH-MODULES **pending 未伪造** | ✓ |
| 旧测 grep 影响面（K7 行为变更类核查） | grep `lastDone|latency_ms` tests/ 全量 | 唯一直言缺键兜底者 = `chat-store-hitl.spec.ts:199`（task 已点名）；chat-store.spec.ts 全部 `latency_ms` 用例均送显式值（1234/1/12）· 不受裁定 A 影响 | ✓（task 影响面圈定完备 · 无漏网旧测） |

---

## 2. 三裁定核对（重点项）

| 裁定 | 核对 | 结论 |
|------|------|------|
| **A · 裁 `: 0` 假值兜底** | ① 守住后端契约：api 契约钉 resume 终帧 `latency_ms` int ≥ 0 必在（TC1 红测先行 + TC5 live 135574 实证）→ 裁撤假值不制造新缺键面；残留缺键面仅 pre-fix 历史持久化旧帧 replay，null/「—」如实不误导 ✓ ② task 权限内自裁：api task 非范围 :76 明钉「前端兜底逻辑去除——去留由 web 仓自裁」，api 40 invoke :48「去兜底由 web 仓自裁」→ **授权链完备** ✓ ③ 红测先行成立：现行 `toEqual({latency_ms: 0, model: ''})` 与裁定冲突即 RED 签名，改写断言先行 → 改码 GREEN，时序 git 可查 ✓ ④ 类型跟进 `ChatDoneInfo.latency_ms: number | null` 与徽标「—」渲染列入 F3 同面，无漏项 ✓ | **成立** |
| **B · model 兜底保留零改动** | ① 守住后端契约：api FP-1 钉案 `model` 键永不提供（resume 全链无来源 · 对照测试钉死禁伪造 · TC5 live 键集实证无 model）→ 恒缺键下 v-if 缺省不渲染 = 最如实形态，「—」恒噪判断正确 ✓ ② 零改动 = 最小回归面 ✓ ③ 字段保留未来兼容 ✓ | **成立** |
| **C · 409 现状已足 · Retry-After 增强非范围** | ① 现状链亲读实证：`useLgRagSse.ts:225-235`（detail 提取 → onError http/409）→ `chat.ts:919-925` else 分支（retryable + detail 文案 · active-run 保留 · 手动续看恢复）——api FP-3 缓解「旧客户端按 Retry-After 退避重试即可」在 web 侧等价成立 ✓ ② 非范围边界技术依据属实：Retry-After 响应头全文零读取（§1 实证），透传须动 `postLgRagSse`(:158) 签名 → 双委托方（stream/replay）+ 回调面回归，FP-5 面大于收益判断合理 ✓ ③ 另立 task 口 = 不丢需求 ✓ | **成立** |

---

## 3. 验收标准可机断性（TC1–TC5 + lint）

| TC | 判据 | 可机断性 | 回退信号 |
|----|------|----------|----------|
| TC1（40 · F-OBS-1） | replay 终帧 `done{status:'resumed', latency_ms: int ≥ 0}` + .sse 附件 + 徽标实值非 0ms + model 缺键照登 | ✓ 帧字面机断（菜谱 PYEOF 口径在案）；徽标取证形态（浏览器实录 vs store 字面回放）留 40 实判——R1/R4 residual 已诚实标注 | 帧缺键/假 0ms → F-OBS-1 未闭环，不假勾 |
| TC2（40 · F-OBS-2） | .hdr/.body 附件（409 + retry-after: 2 + detail 文案）+ 前端 retryable 错误条 + 沉降后 replay 200 seq 连续 | ✓ 全机断（s2_step2 PYEOF 打印 FULL_CONTIGUOUS 等判据） | 500 复现 / seq 断档 → 阻塞 |
| TC3（30 · 裁定 A） | 缺键 → `lastDone.latency_ms === null` + 徽标「—」· 实值如实透传 · :182-199 断言改写 · RED→GREEN 时序 git 可查 | ✓ 断言字面机断；RED 签名明确（现断言 0/'' 与裁定冲突） | 现行断言不改 = 恒 RED 拦截 |
| TC4（30 · FP-5 闸） | 钉死路径 pnpm 全量绿（基线 252 零新增红）· lint · build | ✓ 计数闸（本审查实测 252/65 为真） | 任一红即回退 |
| TC5（回执落盘） | 10/30/40 invoke 齐 · 裁定 A/B/C 留痕 · 40 闭环 T-W2 链证据 · volatile.md 短注 | ✓ 文件齐备机断 | 缺件不 CLOSE |
| lint | `npx spec-wave task lint` PASS | ✓ 本审查独立重跑 PASS EXIT=0 | — |

---

## 4. failure_paths FP-1–FP-8 覆盖与兜底真实性

| FP | 核对 | 结论 |
|----|------|------|
| FP-1 闸 pending 即 30 | GATE_VERIFY 以 task 人工闸表为真值 · 与仓 AGENTS.md 纪律一致 | ✓ |
| FP-2 pre-fix 旧帧缺键 → 徽标「—」 | 与裁定 A 自洽 · Vitest 钉死（TC3） | ✓ |
| FP-3 409 被当致命错误 | else 分支 retryable + detail 文案亲读属实（chat.ts:919-925 · useLgRagSse.ts:229 detail 提取）；用户可见文案与 api 40 invoke body 逐字一致 | ✓ |
| FP-4 动 done 分支致回归 → FP-5 闸 | 基线 252/65 本审查实测为真 · 红即回退 | ✓ |
| FP-5 环境三坑 | 与 api 40 invoke 三坑表逐字一致 · 解法指针 `attachments/tc5_s3_step1.sh` 在案 | ✓ |
| FP-6 SSE 缓冲 | `vite_proxy_smoke.sh` 在案 · 承 T-W2 FP-3 口径 | ✓ |
| FP-7 40 先行与 30 并行撞面 | 40 纯观测零改码 · 30 触 chat.ts/ChatView/tests 三面 · invoke 按帽分文件——隔离面成立 | ✓ |
| FP-8 与契约冲突 | 以端点实际行为为准 · 禁前端迁就 · 落 invoke 报 00——与 T-W2 FP-1 纪律同构 | ✓ |

---

## 5. 范围 / 非范围边界

- **零改后端**：非范围首条钉死（api master 只读消费 · 新缺口报回另立 task · FP-1 禁迁就）✓
- **docs/观测先行**：40 纯观测可先行于 30（维护者令）与 HG-AUDIT-R1 pending 不冲突——40 不改码，闸仅 blocks 30 ✓（FP-7 隔离面配套）
- **Retry-After 增强另立 task 口**：非范围明列（自动退避/倒计时/签名透传）· 技术成本判断经 §1 实证 ✓
- **model 任何改动出范围**（裁定 B 零改动）· **useLgRagSse 管线/SSE 事件表出范围**（freeze lg-rag-sse-v1 只消费）· `task_web_tenant_context_chat.md` 互斥声明在案（该 task 确在 active/）· waiting_approval 分支零触达（chat.ts:727-729 亲读）✓
- **graph_change_layer=`n/a` 自洽**：无新页面/路由/模块 · 徽标渲染分支微调为既有 chat 面内改动；HG-GRAPH-MODULES 仍列 pending 待人签 = 保守诚实（T-W2 先例为 00 代录 approved，本 task 不代录更稳）✓

---

## 6. 思考轮审查（R0–R5）

| 轮 | 质量核对 |
|----|----------|
| R0 问题框定 | 回执 = 双闭环 live 复验 + 三裁定 + 落盘，定性准确（验收+自裁+照登面 · 无新开发） |
| R1 证据收集 | 锚点亲读主张经本审查逐字复核**全真**（§1）；后端证据核真与 api 40 invoke 一致；residual（徽标取证形态留 40）诚实 |
| R2 裁定生成 | A 裁 / B 留 / C 现状——三裁定机理与契约真值、源码现状双向印证（§2） |
| R3 反例与边界 | pre-fix 旧帧面（FP-2）· waiting_approval 零触达 · 40/30 隔离 · 在飞窗时序——四枚反例均落到实处 |
| R4 验收可测性 | TC1–TC5 机断路径逐条成立（§3）；RED 签名识别正确 |
| R5 收口 | 数量自报复核：范围 F1–F4 ✓ · 非范围六条 ✓ · failure_paths 八行 ✓ · 验收六条 ✓ · 依赖五条 ✓ · 必读八项 ✓——全符 |

**early_stop at R5 依据成立**：「三裁定机理单一明确 · 锚点全亲读核真 · 后端契约真值钉死 · 再轮无新增信息」——本审查独立复核后确认无未决内容问题；residual_risks（裁定生效待闸 · 40 取证形态实判）均为流程/执行面而非内容缺口。**思考轮审查通过**。

---

## 7. NIT（非阻塞注记 · 维护者签闸时可裁定是否回填）

- **NIT-1（后端 master 哈希口径差）**：api 40 invoke :7（2026-10-13 14:28 落稿时）记 `origin/master=acac5e6` 且仅提 PR #248；本 task 记 `origin/master=9ee928c` + PR #248/#249。时序上可解释为 PR #249（live 实证文档面）于 14:28 后 squash 并入推进 master，但本帽纪律禁 git 命令无法独立机验。契约行为本身已由 40 invoke 附件 16 件钉死，web 侧只读消费不受哈希差影响——**不构成阻塞**；建议维护者签闸时一眼确认 api master 现值。
- **NIT-2（TC3 徽标「—」视图层断言建议）**：`tests/chat-view.spec.ts` 组件测试基建在案（mount ChatView · :39/:63）；建议 30 除 store 层 `null` 断言外，于组件层补一枚缺键显「—」断言钉死视图面（或 40 live 实录替证亦可 · task R4 residual 已留此口）。不补亦不阻塞——store null + F3 视图改动 + TC1 live 实录三层已可收口。
- **NIT-3（菜谱脚本 run id 硬编码）**：s2/s3 脚本携 T-W2 历史 run id（`RUN3=640d…` · `RID2=hitl_5af5…`），40 复用须换新 run 实测值替换；另目录内 s2_step3_raw_probe / s2_step4_replay_compare_final 两件超出 task 点名 7 件（无害 · 更全）。属菜谱复用常识，不阻塞。

---

## 8. 流程闸（与内容分列）

| 闸 | 现状 | 本帽处置 |
|----|------|----------|
| HG-TASK-DRAFT | approved（维护者启动令 2026-10-13 · 10 invoke 在案） | 照登 |
| HG-AUDIT-R1 | **pending**（blocks 30） | 本审查文落盘 = 20 R1 前置条件达成；**签 approved 权属维护者 · 本帽不代签** |
| HG-GRAPH-MODULES | **pending**（blocks 30 · 预判 n/a 自洽） | 待人签 · 本帽不代签 |

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（内容 PASS · NIT-1/2/3 非阻塞 · 可一并裁定是否回填）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] 在 task 人工闸表将 HG-GRAPH-MODULES 改为 approved（维护者 · 日期 · 预判 n/a 与 graph_change_layer 自洽）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt（红测先行 · 裁定 A 断言改写先行于改码）

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。40 live 复验（纯观测 · 维护者令 docs-only 先行）不受闸阻塞，可并行推进。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-13 | v0 · 20-task-audit R1 落盘：结论 **内容 PASS 零阻塞**（锚点 8 组亲读全真 · 三裁定核对成立 · lint 独立重跑 PASS · Vitest 基线 252/65 实测为真 · 思考轮 R0–R5 闭合 early_stop 成立）· NIT-1/2/3 非阻塞 · HG-AUDIT-R1/HG-GRAPH-MODULES 维持 pending 待人签（不代签 · 不附 30 Prompt） |
