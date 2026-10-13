# Task：Web · T-W2 回执 · F-OBS-1/F-OBS-2 闭环复验与前端兜底自裁

> **状态**：active（HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 approved**（2026-10-13 维护者签认）· **30 可开工**（红测先行）· 40 帧面 live 复验已先行完成）  
> **类型**：联调回执 / 契约收口验收 + 前端兜底自裁（docs/观测先行 · 小面改码）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：ops-desk-api `task_hitl_resume_replay_contract`（TC1–TC5 全勾 · PR #248/#249 squash · origin/master=`9ee928c`）· 本仓 T-W2 `docs/tasks/done/task_web_sse_hitl_enhance.md`（FP-1 报回源）  
> **分支**：`task/web-hitl-fobs-receipt`（base：`main`）  
> **00 注**：2026-10-13 · 维护者启动令（T-W2 回执与 F-OBS 闭环验证 · 后端契约已收口）· 本窗 10 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-fobs-receipt` |
| **git_branch** | `task/web-hitl-fobs-receipt` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · 兜底断言改写）→ 40 live 复验回执 → PR+CI 绿 → CLOSE；**40 live 复验为纯观测面，可先行于 30（不改码 · 维护者令 docs-only 先行不阻塞）** |
| **test_strategy** | `required` |
| **test_strategy_note** | **FP-5 回退闸**：Vitest 全量绿（T-W2 归位基线 252 · chat-store.spec.ts 65 it + chat-store-hitl.spec.ts 在案 · 30 实测填报）；动 chat.ts done 分支须零回归。verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（仓 packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径）。40 live 复验照 T-W2 菜谱 + api 环境三坑留痕 |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（无新页面/路由/模块；徽标渲染分支微调为既有 chat 面内改动 · `docs/_tech_graph/l1/01_modules.md` 零改动预判；若 30 判 chat flow 需备注则按 G-L1 备注一句） |
| **graph_delta** | `n/a`（可选：`docs/_tech_graph/l1/10_flow_chat.graph.yaml` 备注 done 徽标 latency_ms 缺键显「—」） |
| **graph_delta_note** | 不新增一级模块；flow 备注由 30 实判 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（联调环境三坑指针 → api 40 invoke · 兜底三裁定 → 本 task）；对齐仓内定制「新 task 勿默认 n/a」，文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表 · 不新 event_type） |
| **related_pr** | 待开（勿 auto-merge） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-13 维护者启动令（T-W2 回执与 F-OBS 闭环验证委派）· 本窗 10 落稿 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-13 维护者签认（当前消息指令「授权签收后续过程文档」· 20 R1 审查文 PASS 在案 docs/harness/reviews/task_web_hitl_fobs_receipt_audit_R1_20261013.md）· 00 代笔落表 · 30 可开工 |
| HG-GRAPH-MODULES | **approved** | **30** | 2026-10-13 维护者签认（同上指令）· 预判 n/a 成立（无新页面/路由/模块 · 01_modules.md 零改动 · 30 若动模块表须回填）· 00 代笔落表 |

---

## 背景与目标

后端 ops-desk-api `hitl_resume_replay_contract` task 已全棒收口（TC1–TC5 全勾 · PR #248 码 + PR #249 live 实证 squash 合并 · origin/master=`9ee928c`），T-W2 按 FP-1 报回的两个观察项均已闭环，现需 **web 侧回执验收**：

1. **F-OBS-1 闭环**：HITL resume 终帧 `done{status:'resumed'}` 现携 `latency_ms` 实值（api live 实证 135574ms · int ≥ 0）；**`model` 键不提供**（api FP-1 裁定禁伪造 · resume 全链无来源 · 后端对照测试钉死）。
2. **F-OBS-2 闭环**：run 在飞时 `POST /lg-rag/replay` 由瞬返 500 改为 **409 Conflict + `Retry-After: 2` + body `{"detail":"Run is still in flight; retry after it settles."}`**；挂起（waiting_approval）与沉降后 replay 零 diff 仍 200。
3. 观测口径：resume 端点应答为 JSON 面（非 SSE），终帧经事后 replay 观测——既有形态，非回归。

**目标**：(1) 对后端 master（`9ee928c`）复跑 T-W2 同形态联调（S2/S3），实证徽标渲染 `latency_ms` 实值（不再「耗时 0ms」）与在飞 replay 409 语义到达前端；(2) 前端兜底三裁定落地/留痕（裁定 A/B/C · 见下）；(3) 回执照登 invoke，闭环 T-W2 链（F-OBS-1/F-OBS-2 双闭环证据）。

### 三裁定（10 起草裁定 · 20 R1 核对 · 维护者签认后生效）

- **裁定 A · latency_ms 兜底 → 裁撤**：`src/stores/chat.ts:733` `latency_ms: typeof latency === 'number' ? latency : 0` 的 `: 0` 假值兜底裁去——缺键存 null（`ChatDoneInfo.latency_ms` 改 `number | null`），徽标耗时段缺键显「—」。**理由**：「耗时 0ms」假值即 F-OBS-1 显示瑕疵本体；后端契约已钉 resume 终帧 `latency_ms` int ≥ 0 必在（live 实证 135574），残留缺键面仅 pre-fix 历史持久化旧帧 replay，显「—」如实不误导。
- **裁定 B · model 兜底 → 保留 · 零改动**：`src/stores/chat.ts:734` `: ''` 兜底与 `src/views/ChatView.vue:261-263` `v-if="chat.lastDone.model"` **维持现状**——即裁定**裁掉该字段展示**（缺 model 时模型段不渲染），**不显「—」**。**理由**：后端 FP-1 钉案 `model` 键永不提供（sse_stream.py 全文零 model 引用 · 对照测试钉死禁伪造），恒缺键下「—」为恒噪；v-if 已是最如实形态；字段保留，未来后端若提供即自动显示。
- **裁定 C · 409 处理 → 现状已足 · Retry-After 退避增强入非范围**：replay 409 现经 `useLgRagSse.ts:225-235` → `onError{kind:'http', status:409, message=detail}` → `chat.ts:919-925` else 分支 → **retryable 错误条 + 后端语义文案用户可见 · active-run 保留 · 手动「续看」即恢复**（api FP-3 缓解成立）。**范围内仅 live 实证照登 + Vitest 锁存现状**；Retry-After 自动退避/倒计时提示入**非范围**（在飞窗短 `Retry-After: 2` · 手动恢复已成立 · 自动退避需动 `postLgRagSse` 响应头透传签名 → FP-5 回归面大于收益 · 增强项另立 task 口）。

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| done 徽标数据结构 | `src/stores/chat.ts:171-174` | `ChatDoneInfo { latency_ms: number; model: string }` |
| latency_ms/model 兜底 | `src/stores/chat.ts:730-735` | done 分支：缺 latency_ms → `0`（假值 · 裁定 A 裁）· 缺 model → `''`（裁定 B 留） |
| waiting_approval 分支 | `src/stores/chat.ts:727-729` | 提前 break 不记 lastDone（**本 task 零触达**） |
| 徽标渲染 | `src/views/ChatView.vue:260-264` | `完成 · 耗时 {{ latency_ms }}ms` + `v-if="model"` 模型段 |
| 非 2xx 分类 | `src/composables/useLgRagSse.ts:225-235` | `onError{kind:'http', status, message=body.detail}`（**Retry-After 头未透传** · 裁定 C 不动） |
| replay 409 落点 | `src/stores/chat.ts:898-926` | 401→auth · 404/422→清 active-run 不可重试 · **else（含 409）→ retryable 错误条 + detail 文案** |
| T-W2 兜底断言 | `tests/chat-store-hitl.spec.ts:182-199` | `done{status:'resumed'}` 缺键 → `toEqual({ latency_ms: 0, model: '' })`（裁定 A 须改写） |
| 联调菜谱 | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/` | s2_step1_live_cut / s2_step2_replay_compare / s3_imm_step1_wait / s3_imm_step2_decide_replay / s3_imm_step3_double_resume_409 / serve_8050.py / vite_proxy_smoke.sh |
| 后端契约真值 | api `docs/tasks/active/task_hitl_resume_replay_contract.md` + `docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md` | TC1–TC5 全勾 · 135574ms · 409+Retry-After:2 · 无 model 键 · 环境三坑解法 |

---

## 范围

- [ ] **F1（40 · S3 live 复验 · 可先行）**：后端 master（`9ee928c`）六 env 组起服 → S3 同形态（挂起 → decide approved → resume → replay 观测终帧）→ 实证 `done{status:'resumed', latency_ms: int ≥ 0 实值}` 与**前端徽标渲染实值**（不再「耗时 0ms」）；`model` 键缺失与模型段不渲染照登。
- [ ] **F2（40 · S2 live 复验 · 可先行）**：S2 同形态（提问 → 中途断 → replay）→ 实证 **run 在飞 replay 409 + Retry-After: 2 + detail 文案**到达前端管线（retryable 错误条 · 手动续看恢复）；沉降后 replay 200 补齐**零丢失**（帧计数一致 · 全量 seq 连续）。
- [ ] **F3（30 · 裁定 A 落地 · 红测先行）**：`chat.ts:730-735` 裁 `: 0` 假值兜底（缺键存 null）· `ChatDoneInfo` 类型跟进 · `ChatView.vue:260-264` 缺键显「—」；`chat-store-hitl.spec.ts:182-199` T-W2 兜底断言按裁定改写（缺键 → null/「—」· 非 `0`）+ 实值字面（如 135574）断言如实透传；replay 409 分支 Vitest 锁存（else 分支 retryable + detail 文案透传 · 现状行为防回归）。
- [ ] **F4（回执落盘）**：10/30/40 invoke 齐（`docs/harness/invokes/by-task/web-hitl-fobs-receipt/`）· 裁定 A/B/C 留痕（本 task 体）· 40 invoke 回执闭环 T-W2 链（F-OBS-1/F-OBS-2 双闭环证据照登）· wiki_delta 短注落 `docs/coding_wiki/volatile.md`。

## 非范围

- **后端零改动**（契约已收口 · origin/master=`9ee928c` 只读消费；联调暴露新后端缺口报回 api 另立 task · FP-1 禁前端迁就）。
- **model 字段展示/兜底任何改动**（裁定 B · 零改动）。
- **Retry-After 自动退避 / 倒计时提示 / `postLgRagSse` 响应头透传签名**（裁定 C · 增强项另立 task 口）。
- **useLgRagSse 管线 / SSE 事件表改动**（freeze lg-rag-sse-v1 只消费）。
- `task_web_tenant_context_chat.md` 面（active 无关 task · **勿混入**）；T-W1/T-W3 面；admin 面；iOS；徽标视觉重做。
- waiting_approval done 分支（`chat.ts:727-729` · 既有语义零 diff）。

---

## 联调环境与坑位

| 坑位 | 钉死 |
|------|------|
| 环境三坑（api 40 留痕 · **起后端必读**） | ① langfuse 引号炸 port → `OPS_CHAT_TRACER=off`；② `NO_PROXY` 裸 `::1` 同炸 httpx → 启动命令 `env -u` 剥离九个 proxy 变量；③ strategy 候选缺写能力 → `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` + `OPS_CAPABILITY_ALLOW_WRITE=1` + `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing`（否则永不触发 HITL）。全量启动脚本：api `invoke_20261013_40_verify.md` attachments/tc5_s3_step1.sh |
| vite proxy | 必须 `http://127.0.0.1:<port>`（禁 localhost · macOS IPv6 打 Docker 旧镜像 404 · `vite.config.ts:90-99`） |
| SSE 代理缓冲（T-W2 FP-3） | 联调钉直连或关缓冲；`vite_proxy_smoke.sh` 逐帧时间戳判缓冲（一次性齐到=缓冲 → S2 假败） |
| 登录 | api `scripts/create_initial_user.py` 邀请码制 · cookie 会话（菜谱 `$J` jar 口径） |
| 六 env 组（S3） | `LG_RAG_DELEGATION_TOKEN_MODE=enforce` · `OPS_CAPABILITY_EXTRA_MANIFESTS` · `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing` · `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS` · `OPS_HITL_PERSISTENCE=db` · `OPS_CAPABILITY_ALLOW_WRITE=1`（SPEC §5） |
| httpx 环境 | `NO_PROXY` 含 `[::1]` 炸 httpx 须剥（菜谱脚本首行 `unset` 口径存续） |

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 HG-AUDIT-R1 pending 即 30 改码 | 执行 Agent **拒开工**（GATE_VERIFY 首输出 · task 人工闸表为真值） | 是（签后重来） | 无 |
| FP-2 pre-fix 历史持久化旧帧 replay 缺 `latency_ms` | 徽标耗时段显「—」（裁定 A · 不显假 0ms）· Vitest 钉死 | 是 | 「—」如实 |
| FP-3 在飞 replay 409 被当致命错误 | else 分支 retryable 错误条 + 后端 detail 文案 · active-run 保留 · 手动「续看」恢复（现状 · 40 实证照登） | 是（手动续看） | 错误条文案「Run is still in flight; retry after it settles.」 |
| FP-4 动 done 分支/徽标致帧处理回归 | **FP-5 闸**：Vitest 全量绿（基线 252 · chat-store 65 it）· 红即回退 | 是 | 无 |
| FP-5 联调环境三坑（langfuse 引号 / NO_PROXY 裸 ::1 / strategy 候选缺 `testing.write.echo`） | 照 api 40 invoke 启动命令留痕执行（`env -u` 九 proxy 变量 + `OPS_CHAT_TRACER=off` + 候选 env 追加口） | 是 | run 0.5s 即 error 帧沉降（在飞窗捕不到）/ HITL 永不触发 |
| FP-6 vite/反代缓冲 SSE（T-W2 FP-3 坑位） | 联调钉直连或关缓冲 · `vite_proxy_smoke.sh` 逐帧时间戳判缓冲 | 是 | 帧不实时 · S2 假败 |
| FP-7 40 先行与 30 并行撞面 | 40 纯观测零改码 · 30 触 chat.ts/ChatView/tests 三面 · invoke 按帽分文件（`invoke_*_<hat>_*.md`） | 是 | 无 |
| FP-8 与契约冲突（后端行为与钉案不符） | 以端点实际行为为准回填修订；禁前端迁就；冲突落 invoke 回报 00 | 是 | 无 |

---

## 验收标准

- [ ] **TC1（40 · F-OBS-1 live 复验）**：S3 同形态复跑 → replay 终帧 `done{status:'resumed', latency_ms: int ≥ 0 实值}`（.sse 附件落盘）；**前端徽标渲染实值非「0ms」**（证据：live 帧附件 + store 字面回放/浏览器实录照登）；`model` 键缺失照登（与后端钉案一致）。
- [ ] **TC2（40 · F-OBS-2 live 复验）**：run 在飞 `POST /lg-rag/replay` → HTTP **409 + `retry-after: 2` + detail 文案**（.hdr/.body 附件）；前端管线收到 409 → retryable 错误条 + 文案可见 · 手动续看恢复照登；沉降后 replay 200 补齐**零丢失**（全量 seq 连续 · 帧计数一致）。
- [ ] **TC3（30 · 裁定 A · 红测先行）**：done 帧缺 `latency_ms` → `lastDone.latency_ms === null` 且徽标显「—」（**非** `0ms`）；含实值 → 如实渲染；`chat-store-hitl.spec.ts:182-199` 断言按裁定改写；RED（现兜底断言与裁定冲突）→ GREEN 时序 git 可查。
- [ ] **TC4（30 · FP-5 闸）**：`$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` 全量绿（零新增红 · 基线 252 在案）· `lint` · `build` 绿。
- [ ] **TC5（回执落盘）**：10/30/40 invoke 齐备（40 含附件）· 裁定 A/B/C 留痕 · 40 invoke 回执闭环 T-W2 链（F-OBS-1/F-OBS-2 双闭环证据）· `docs/coding_wiki/volatile.md` 短注落盘。
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_fobs_receipt.md` PASS。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 后端契约真值 | api origin/master=`9ee928c`（PR #248 码 + #249 live · 只读引用）· `../ops-desk-api/docs/tasks/active/task_hitl_resume_replay_contract.md`（TC1–TC5 全勾） |
| 环境三坑解法 | `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`（启动命令 + 三坑表 + attachments/tc5_s3_step1.sh） |
| 联调菜谱 | 本仓 `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（S2/S3 全组 · serve_8050.py · vite_proxy_smoke.sh） |
| T-W2 真值 | `docs/tasks/done/task_web_sse_hitl_enhance.md`（FP-1/FP-3 · 兜底断言字面 · 六 env 组） |
| SPEC | `docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · §3/§5） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（三裁定 · 联调坑位表）
2. `src/stores/chat.ts`（:171-174 ChatDoneInfo · :718-738 done 分支 · :869-945 resumeFromCursor/replay onError）
3. `src/views/ChatView.vue:255-264`（徽标渲染）
4. `src/composables/useLgRagSse.ts:104-156,222-236`（replay 路径 · 非 2xx 分类）
5. `tests/chat-store-hitl.spec.ts:140-235`（T-W2 兜底断言 · 裁定 A 改写面）
6. 菜谱脚本全组（`docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`）
7. api `invoke_20261013_40_verify.md` 环境三坑节（起后端必读 · 禁信转述）
8. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：T-W2 回执 = 双闭环 live 复验（40）+ 前端兜底三裁定（A 裁 latency_ms / B 留 model / C 409 非范围增强）+ 回执落盘；契约真值后端已钉死，web 侧为「验收 + 自裁 + 照登」面 | false | — | none |
| R1 | 证据收集：前端锚点全亲读（chat.ts:730-735 兜底字面 · ChatView.vue:261 v-if · useLgRagSse.ts:225-235 非 2xx 分类 · chat.ts:898-926 else 分支为 409 落点 · tests/chat-store-hitl.spec.ts:182-199 T-W2 兜底断言）；后端证据核真（api 40 invoke 六条 · 135574 · 409+Retry-After:2 · 无 model 键） | false | — | 徽标渲染 live 取证形态（浏览器实录 vs 字面回放）留 40 实判 |
| R2 | 裁定生成：A 裁假值（缺键 null/「—」· 0ms 假值即瑕疵本体）· B 留 model 零改动（后端永不提供 · v-if 已最如实 · 「—」恒噪）· C 现状已足（else 分支 retryable + detail 文案 · 自动退避回归面大于收益） | false | — | 裁定 B/C 待 20 R1 核对 + 维护者签认 |
| R3 | 反例与边界：pre-fix 旧帧缺键面显「—」（FP-2）；waiting_approval 分支 :727-729 零触达；40 先行纯观测与 30 隔离（FP-7）；环境三坑/缓冲坑全钉（FP-5/FP-6） | false | — | 在飞窗捕捉时序敏感（Retry-After: 2s · 照 api 菜谱节奏） |
| R4 | 验收可测性：TC1/TC2 帧字面 + .hdr/.body/.sse 附件机断 · TC3 断言字面机断（RED→GREEN 时序）· TC4 计数闸 · TC5 invoke 齐备机断 | false | — | TC1 徽标实证若走浏览器需 dev server + 登录（菜谱 vite_proxy_smoke 口径在案） |
| R5 | 收口：范围 F1–F4 · 非范围六条 · failure_paths 八行 · 验收六条 · 依赖五条 · 必读八项齐备；HG-TASK-DRAFT approved（维护者启动令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签 | true | 三裁定机理单一明确 · 锚点全亲读核真 · 后端契约真值钉死 · 再轮无新增信息 | 裁定生效待闸 · 40 取证形态实判 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

后端 `hitl_resume_replay_contract` 全棒收口（master `9ee928c`），T-W2 FP-1 报回两观察项双闭环。本 task 为 web 侧回执：S2/S3 同形态 live 复验（40 纯观测 · 可先行）+ 前端兜底三裁定（唯一改码面 = 裁定 A 的 `: 0` 假值兜底）+ 回执照登闭环。面小、契约真值钉死、无新开发。

### R1 · 证据收集

前端亲读核真：`chat.ts:733` `: 0` 假值兜底（F-OBS-1 显示瑕疵直接来源）· `chat.ts:734` `: ''` + `ChatView.vue:261` v-if（model 缺键已不渲染）· `useLgRagSse.ts:225-235` 非 2xx 统一 `onError{kind:'http', status, message=detail}`（Retry-After 头未透传）· `chat.ts:919-925` else 分支 = replay 409 现落点（retryable + detail 文案）· `tests/chat-store-hitl.spec.ts:182-199` T-W2 兜底断言字面（`toEqual({ latency_ms: 0, model: '' })`）。后端核真：api 40 invoke 六条全实证（seq18 `done{resumed, latency_ms:135574, 无 model 键}` · 在飞 409 两 run 三打 · 挂起/沉降零 diff）。

### R2 · 裁定生成

- **A · 裁**：0ms 假值即瑕疵本体，根因已修（latency_ms int ≥ 0 契约钉死）；缺键仅存于 pre-fix 历史旧帧 replay，null/「—」如实。类型面 `ChatDoneInfo.latency_ms: number | null`。
- **B · 留**：model 后端永不提供（FP-1 钉案禁伪造），v-if 缺省不渲染 = 「裁掉该字段展示」已成立；显「—」为恒噪；零改动。
- **C · 现状已足**：409 → else 分支 retryable + 后端文案可见 + 手动续看恢复（FP-3 缓解成立）；Retry-After 自动退避需动管线签名透传响应头，回归面大于收益，入非范围另立口。

### R3 · 反例与边界

- pre-fix 旧帧：裁兜底后徽标显「—」（FP-2 钉死 · 禁回退显 0）。
- waiting_approval done（`chat.ts:727-729` 提前 break 不记 lastDone）：本 task 零触达，裁定 A 不误伤。
- 40 先行与 30 并行：40 纯观测零改码（FP-7 隔离面钉死）。
- 在飞窗时序：`Retry-After: 2` 短窗，照 api 菜谱节奏（在飞窗内打 replay）。

### R4 · 验收可测性

TC1/TC2：live 帧 + .hdr/.body/.sse 附件 + seq 连续性脚本判定（菜谱 PYEOF 口径）全机断。TC3：断言字面机断 + RED→GREEN 时序 git 可查（红测先行：现 `toEqual({latency_ms: 0, ...})` 与裁定 A 冲突即 RED 签名）。TC4：计数闸（基线 252 零新增红）。TC5：invoke 帽集合 + 裁定留痕字面机断。

### R5 · 收口

范围/非范围/failure_paths/验收/依赖/必读齐备；三裁定留痕待 20 R1 + 维护者签认生效；40 纯观测可先行（维护者令 docs-only 先行不阻塞）。early_stop at R5。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_fobs_receipt.md` | **PASS**（2026-10-13 落稿实跑 · EXIT=0） |
| 结论 | ~~HG-AUDIT-R1 / HG-GRAPH-MODULES pending → 30 拒开工~~ **2026-10-13 维护者签认 · 双闸 approved → 30 可开工（红测先行）**；40 live 复验（纯观测）已先行完成 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-13 | v1 · 维护者签闸：HG-AUDIT-R1 / HG-GRAPH-MODULES → approved（维护者当前消息指令授权签收 · 20 R1 PASS 在案 · 00 代笔落表 · 30 解锁） |
| 2026-10-13 | v0 · 10 落稿：维护者启动令（T-W2 回执与 F-OBS 闭环验证 · 后端 master `9ee928c` 已收口）· 三裁定（A 裁 latency_ms 假值兜底 / B 留 model 零改动 / C 409 现状已足 · Retry-After 增强非范围）· 锚点全亲读核真（chat.ts:171-174/:727-735/:898-926 · ChatView.vue:260-264 · useLgRagSse.ts:225-235 · chat-store-hitl.spec.ts:182-199）· R0–R5 思考轮（early_stop at R5）· HG-TASK-DRAFT approved · HG-AUDIT-R1/HG-GRAPH-MODULES pending 待人签 |
