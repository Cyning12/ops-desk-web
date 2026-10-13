# Task：Web × API · 阶段性前后端联调 checklist（web-api-joint-check）

> **状态**：active（HG-TASK-DRAFT approved · HG-AUDIT-R1 pending（20 R1 后维护者签）· HG-GRAPH-MODULES pending（建议 n/a）· **业务码零改面 · 默认无 30 棒**）  
> **类型**：阶段性前后端联调 checklist 执行（docs/观测/实操验收 · 业务码零改面）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：web PR #65（已合并 main `aef91f3` · 裁定 A 裁 latency_ms 假值兜底）× api master `9ee928c`（409+Retry-After 新契约）· 前 task `docs/tasks/done/task_web_hitl_fobs_receipt.md`（TC1–TC5 全勾 · 帧面已实证）  
> **分支**：`task/web-api-joint-check`（base：`main` `aef91f3`）  
> **00 注**：2026-10-13 · 维护者令（m00187 问联调 checklist · m00193 拍板：「新建 task · 机验全自动端到端（含 web 登录操作）+ 自动验收后仍留人验 checklist 文档」）· 本窗 10 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-api-joint-check` |
| **git_branch** | `task/web-api-joint-check` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 → 40（机验全自动端到端 + 人验 checklist 交付 · 纯观测零业务码）→ PR+CI 绿 → CLOSE；**本 task 默认无 30 棒**（联调暴露 bug → 另立 fix task） |
| **test_strategy** | `required` |
| **test_strategy_note** | **回退闸**：Vitest 全量绿（PR #65 后新基线 **255** · 零既有红）——本 task 零业务码，三门绿为回归证明而非改码闸。verify 命令一律钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径）。机验端到端用 **Agent Playwright 实操**（先例：`task_web_tenant_context_chat.md` W4/:89 · `task_web_login.md:52`）；本机临时装 Playwright/Chromium（**~/Library/Caches/ms-playwright 目录不存在已核** · 建议 /tmp scratch 目录 npx 方式 · **不钉 package.json** · E2E 框架入库为 W8 后置评估项） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（业务码零改 · 纯 docs + invoke + checklist 件 · `docs/_tech_graph/l1/01_modules.md` 不动） |
| **graph_delta** | `n/a` |
| **graph_delta_note** | checklist 文档落 `docs/checklists/`（既有目录 · `CHECKLIST_lg_rag_sse_joint_release_v1.md` 先例）· 不触图谱闸 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（联调五阶段结果 → 本 task 40 invoke）；对齐仓内定制「新 task 勿默认 n/a」，文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表 · 不新 event_type） |
| **related_pr** | 待开（勿 auto-merge） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-13 维护者令（m00193 拍板新建 task · 机验全自动端到端 + 人验 checklist 文档）· 本窗 10 落稿 |
| HG-AUDIT-R1 | **pending** | **30** | 须 20-task-audit R1 落盘 PASS + 维护者签；本 task 默认无 30 面——若联调暴露 bug 须改码，**另立 fix task 走自身闸**；pending 期间任何改码拒开工（40 纯观测不阻塞） |
| HG-GRAPH-MODULES | **pending** | **30** | 建议 **n/a** 形态（业务码零改 · `01_modules.md` 不动）· 由 20 审确认形态后维护者签 |

---

## 背景与目标

web PR #65（裁定 A 裁 `latency_ms` 假值兜底 · 徽标缺键显「—」）× api master `9ee928c`（在飞 replay 409+Retry-After 新契约）**首次在 main 汇合**。前 task（`task_web_hitl_fobs_receipt`）已实证 **帧面** 双闭环（S3 终帧 `done{resumed, latency_ms:139650}` · 在飞 409 两形态 · S2 零丢失 210 帧），但 **浏览器 × 真后端 × 真 SSE 端到端面未实证**（徽标此前仅 Vitest mount 断言 `chat-view.spec.ts:317-360`）。孤儿 run 观察项（断线后在飞标记 ≥13min 不沉降 · replay 恒 409 · api 40 孤儿 `22b65ce2` 与本仓 `4740a8a0` 同形态）已报回 api，联调时照登确认不阻塞用户路径。

**目标**：对 main 汇合态跑一次**阶段性前后端联调 checklist**（P0–P4 五阶段），验收分两层（维护者 m00193 裁定）：**机验层全自动**（curl/SSE 脚本 + Agent Playwright 实操，含 web 登录操作）· **人验层硬交付件**（`docs/checklists/web_api_joint_checklist.md` 可复用 checklist，机验盲区逐项留「操作步骤/预期/实际/勾」四列）。证据照登 invoke attachments（截图 + Network 头摘要 + DOM 断言 + .sse/.hdr/.body）。

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| 帧面双闭环证据 | `docs/harness/invokes/by-task/web-hitl-fobs-receipt/`（40 invoke + 14 件附件） | F-OBS-1/F-OBS-2 curl 层已实证 · 浏览器面空白 |
| 徽标渲染断言（单元层） | `tests/chat-view.spec.ts:317-360` | 缺键「—」+ 实值 139650ms mount 断言已锁存 |
| 环境三坑 + 登录小坑 | `docs/harness/invokes/by-task/web-hitl-fobs-receipt/invoke_20261013_40_verify.md:11-13` | ①`OPS_CHAT_TRACER=off` ②`env -u` 九 proxy 变量 ③`OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` 三件套 · 登录路由 `/api/ops/auth/login`（非 `/api/auth/login`） |
| 联调菜谱 | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/` | s2/s3 全组 + serve_8050.py + vite_proxy_smoke.sh（SSE 缓冲判定口径） |
| checklist 先例 | `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` | 仓内既有联调 checklist 目录与形态先例 |
| Playwright 先例 | `docs/tasks/active/task_web_tenant_context_chat.md:44,58,89,100`（Agent Playwright 实操验收 W4 已勾 · 不强制钉 `@playwright/test`）· `docs/tasks/done/task_web_login.md:52` | 本机 Playwright/MCP 实操 + invoke 落证据为已建立形态 |
| Playwright 本机现状 | `~/Library/Caches/ms-playwright/` | **目录不存在**（2026-10-13 已核 · FP-1 退化路径前提成立） |
| 后端契约真值 | api master `9ee928c` · `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md` | 只读引用 · 环境三坑原始留痕 |

---

## 范围（P0–P4 五阶段 · 40 执行面）

- [ ] **F1 / P0 环境就位**：api=master 含 `9ee928c` · web=main 含 `aef91f3`（PR #65 merge commit）；后端 8050 起服（环境三坑解法 + 登录路由 `/api/ops/auth/login` 小坑 + 六 env 组，真值引用前 task 40 invoke）；web dev server + vite proxy 钉 `127.0.0.1`（IPv6 localhost 404 坑）；`/api/ops/auth/me` 200 机断。
- [ ] **F2 / P1 冒烟基线**：登录（含 web 登录操作 · Playwright 实操）→ 发消息 → SSE 逐帧无缓冲（`vite_proxy_smoke.sh` 逐帧时间戳口径机断）→ done 帧徽标 `latency_ms` 实值（**非 `0ms` 非「—」** · DOM 断言）· model 段不渲染（DOM 缺席断言）。
- [ ] **F3 / P2 HITL 主链（F-OBS-1 浏览器实证）**：`testing.write.echo` 触发 waiting_approval → UI 审批条可见 → approve → resume → 终帧 `done{resumed, latency_ms 实值}` → 徽标实值渲染（截图 + DOM 断言）；**刷新页面** replay 恢复会话历史帧齐（帧计数一致）。
- [ ] **F4 / P3 在飞 409 面（F-OBS-2 浏览器实证）**：在飞窗刷新触发 replay → 前端 retryable 错误条 + detail 文案（「Run is still in flight; retry after it settles.」）可见（DOM 断言 + 截图）→ 沉降后手动「续看」恢复零丢失；**孤儿 run 观察项照登**（非阻塞 · 报回 api 留痕）。
- [ ] **F5 / P4 断线恢复 + 回归**：断网/掐断重连 gap replay seq 连续零丢失（机断）；`pnpm lint` / `test`（**新基线 255**）/ `build` 三门绿（回归证明）。
- [ ] **F6 · 人验 checklist 硬交付件**：`docs/checklists/web_api_joint_checklist.md`（纯 docs · 不触图谱闸 · 可复用件）——机验盲区逐项：水墨风观感 · 错误条文案可读性 · 审批交互手感 · 断网重连体感 · 孤儿 run 人眼确认；每项「操作步骤/预期/实际/勾」四列。

## 非范围

- **`@playwright/test` 钉进 `package.json`**（E2E 框架入库为 W8 后置评估项 · 本波 /tmp scratch npx 不污染仓）。
- **Retry-After 自动退避 / 倒计时 / `postLgRagSse` 响应头透传**（前 task 裁定 C 非范围延续 · 另立 task 口）。
- **api 侧任何改动**（契约已收口 · 只读消费；联调暴露后端缺口报回 api 另立 task · 禁前端迁就）。
- **`task_web_tenant_context_chat.md` 内容混入**（active 无关 task · 其 Playwright 先例仅作引用）。
- **业务码改动**（联调发现 bug → 另立 fix task · 本 task 观测面零改码）。
- 后端环境三坑之外的基建重做（PG/uv/.env 沿用前 task 实证形态）。

---

## 联调环境与坑位

| 坑位 | 钉死 |
|------|------|
| 环境三坑（起后端必读） | ① langfuse 引号炸 port → `OPS_CHAT_TRACER=off`；② `NO_PROXY` 裸 `::1` 炸 httpx → `env -u` 剥九个 proxy 变量；③ strategy 候选缺写能力 → `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` + `OPS_CAPABILITY_ALLOW_WRITE=1` + `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing`（否则永不触发 HITL · FP-7）。真值：前 task 40 invoke :11-13 |
| 登录路由小坑 | `/api/ops/auth/login`（**非** `/api/auth/login` · 首打 404 自查 `app/ops/router.py:20` prefix）；`uv run python scripts/create_initial_user.py` 邀请码 → ops_session cookie |
| vite proxy | 必须 `http://127.0.0.1:<port>`（禁 localhost · macOS IPv6 404 · `vite.config.ts:90-99`） |
| SSE 代理缓冲（T-W2 FP-3） | `vite_proxy_smoke.sh` 逐帧时间戳判缓冲（一次性齐到=缓冲 → 假败） |
| Playwright 本机 | `~/Library/Caches/ms-playwright/` 不存在 → 首跑需装 Chromium（/tmp scratch npx 方式）· 装不上走 FP-1 退化路径 |
| pnpm 钉死路径 | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（PATH pnpm 11 拒跑 · T-W2 NIT-1） |

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 Playwright 主机未装/网络不可装 Chromium（`~/Library/Caches/ms-playwright` 不存在已核） | 退化路径：curl/SSE 层全机验照旧 + **浏览器面整列转人验 checklist**（F2/F3/F4 的 DOM/截图项改人验勾）· 照登 invoke · **不阻塞 task 收口** | 是（网络恢复后补机验） | 无 |
| FP-2 孤儿 run 在飞标记不沉降（replay 恒 409 · api 侧遗留 `22b65ce2`/`4740a8a0` 同形态） | 照登为非阻塞观察项 · 人眼确认「续看」对该 run 恒 409 的体感 · 报回 api 留痕 | 是（沉降 run 不受影响） | 错误条文案如实传达 |
| FP-3 Element Plus DOM 选择器脆弱（组件类名/结构漂移） | 40 按实调选择器 + 截图佐证 · 选择器不收敛则该项转人验 | 是 | 无 |
| FP-4 Vitest 基线漂移（PR #65 后新基线 **255**） | 三门绿为回归证明；基线数变动须如实回填本 task 与 invoke（不假绿） | 是 | 无 |
| FP-5 vite proxy IPv6/localhost 404 + SSE 缓冲坑 | 钉 `127.0.0.1` · `vite_proxy_smoke.sh` 判缓冲 · 坑位表照用 | 是 | 帧不实时/404 |
| FP-6 pnpm 版本拒跑（PATH 前置 pnpm 11 vs packageManager pnpm@10.32.1） | 一律钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` | 是 | 无 |
| FP-7 HITL 不触发（缺 `OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` 三件套） | 照环境三坑表逐项核对起服命令 ·  supervisor plan 空集 fallback 单 rag 即为此坑症状 | 是（重起后端） | run 直通无审批条 |
| FP-8 联调暴露真实 bug（前/后端） | **本 task 不修**：照登 invoke + 报回 00 另立 fix task（web）或 api task（后端）· 禁顺手改码 | 是 | 视 bug 面 |

---

## 验收标准（两层 · 维护者 m00193 裁定 · 机验层 TC1–TC6 全自动 / 人验层 TC7–TC8 硬交付件）

- [ ] **TC1（机验 · P0 环境）**：`/api/ops/auth/me` 200（cookie 会话）· vite proxy 可达 · SSE 逐帧无缓冲判定（`vite_proxy_smoke.sh` SPREAD 判据）。
- [ ] **TC2（机验 · P1 冒烟）**：Playwright 实操登录 → 发消息 → done 帧后 DOM 断言：徽标文本含 `耗时 ` + `/\d+ms/` 实值且 **≠ 0ms ≠ 「—」** · 「模型」段 DOM 缺席；截图 + Network 头摘要落 attachments。（FP-1 退化时：curl 层 .sse 附件机断 latency_ms 实值 · 徽标 DOM 项转人验）
- [ ] **TC3（机验 · P2 HITL 主链）**：浏览器面 approve→resume 全链走通 · replay 终帧 `done{status:'resumed', latency_ms: int ≥ 0 实值}`（.sse 附件）· 徽标实值 DOM 断言 + 截图 · 刷新后 replay 恢复历史帧计数一致。
- [ ] **TC4（机验 · P3 在飞 409）**：在飞窗 replay → HTTP **409 + `retry-after: 2`**（.hdr/.body 附件）· 前端错误条 DOM 断言（retryable 文案 + detail 可见）· 沉降后手动续看恢复 · 孤儿观察项照登。
- [ ] **TC5（机验 · P4 断线恢复 + 回归）**：gap replay seq 连续零丢失（脚本机断）· `lint`/`test`（基线 255 零既有红）/`build` 三门 EXIT=0。
- [ ] **TC6（机验 · 机检）**：`npx spec-wave task lint --file docs/tasks/active/task_web_api_joint_check.md` PASS（仓 lint 命令真值形 · 首跑实跑回填）。

- [ ] **TC7（人验 · checklist 硬交付件）**：`docs/checklists/web_api_joint_checklist.md` 落盘——机验盲区五项（水墨风观感 · 错误条文案可读性 · 审批交互手感 · 断网重连体感 · 孤儿 run 人眼确认）逐项「操作步骤/预期/实际/勾」四列 · 机验层结果摘要引用 invoke 指针。
- [ ] **TC8（人验 · 回执落盘）**：10/20/40 invoke 齐备（40 含截图/Network 摘要/.sse/.hdr/.body 附件）· wiki 短注落 `docs/coding_wiki/volatile.md` · 观察项（若有）报回归属仓。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 前端汇合态 | web main 含 `aef91f3`（PR #65 合并 commit · 裁定 A 落地） |
| 后端契约真值 | api master 含 `9ee928c`（409+Retry-After · resume 终帧 latency_ms · 只读引用） |
| 环境真值 | `docs/harness/invokes/by-task/web-hitl-fobs-receipt/invoke_20261013_40_verify.md`（三坑+登录小坑）· `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`（只读 · 原始三坑表） |
| 联调菜谱 | `docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`（s2/s3 全组 · serve_8050.py · vite_proxy_smoke.sh） |
| Playwright 先例 | `docs/tasks/active/task_web_tenant_context_chat.md`（:44/:58/:89/:100 · Agent Playwright 实操验收形态）· `docs/tasks/done/task_web_login.md:52` |
| checklist 先例 | `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` |
| 前 task 全档 | `docs/tasks/done/task_web_hitl_fobs_receipt.md`（三裁定 · 帧面证据指针） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（两层验收 · 坑位表 · failure_paths）
2. `docs/tasks/done/task_web_hitl_fobs_receipt.md`（三裁定 · 验收实证形态）
3. `docs/harness/invokes/by-task/web-hitl-fobs-receipt/invoke_20261013_40_verify.md`（环境真值 · 起后端必读 · 禁信转述）
4. `docs/tasks/active/task_web_tenant_context_chat.md`（Playwright 先例 · 仅读 :8/:21/:44/:58/:89/:100/:119/:121/:173 行区）
5. `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`（只读 · 原始三坑表 + 启动命令）
6. `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（checklist 形态先例）
7. 菜谱脚本全组（`docs/harness/invokes/by-task/web-sse-hitl-enhance/attachments/scripts/`）
8. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（闸纪律 · 本 task 若派生 fix 改码须 GATE_VERIFY）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：main 汇合态（web PR #65 × api 9ee928c）首次联调 · 帧面已实证 · 浏览器端到端面空白 → 阶段性联调 checklist（P0–P4）· 业务码零改面 | false | — | none |
| R1 | 证据收集（正反检索）：先例三面钉死（tenant W4/:89 Agent Playwright 实操已勾 · login :52 · checklists/ 目录既有件）· 环境真值前 task 40 invoke 全留痕 · `~/Library/Caches/ms-playwright` 不存在亲核（FP-1 前提成立） | false | — | Playwright 首装依赖网络（FP-1 退化路径已钉） |
| R2 | 方案生成：两层验收（维护者 m00193 裁定）——机验层 curl/SSE + Agent Playwright 全自动（含登录）· 人验层 checklist 硬交付件（机验盲区五项四列）；/tmp scratch npx 不钉 package.json（W8 后置） | false | — | DOM 选择器脆面（FP-3 · 40 按实调） |
| R3 | 反例与边界：Playwright 不可装 → 退化不阻塞（浏览器面转人验）；孤儿 run 照登非阻塞（api 侧遗留）；联调发现 bug 不修（另立 fix task）；tenant task 勿混入 | false | — | 在飞窗捕捉时序敏感（照菜谱节奏 · Retry-After: 2s） |
| R4 | 验收可测性：TC1–TC6 机断逐项（DOM 断言字面/.hdr/.body/.sse 附件/seq 连续性/三门 EXIT/基线计数 255/lint PASS）· TC7/TC8 交付件存在性 + 四列结构机断 | false | — | FP-1 退化时 TC2–TC4 判据切换需 invoke 照登声明 |
| R5 | 收口：范围 F1–F6 · 非范围六条 · failure_paths 八行 · 验收两层八条 · 依赖七条 · 必读八项齐备；HG-TASK-DRAFT approved（维护者 m00193 令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签 | true | 形态全为先例组合（Playwright 实操 + curl 菜谱 + checklist 件）· 无新技术面 · 再轮无新增信息 | 闸待人签 · Playwright 网络安装不确定（FP-1 已钉退化） |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

web PR #65 × api `9ee928c` 在 main 首次汇合。帧面双闭环已由前 task 实证（curl 层），但浏览器 × 真后端 × 真 SSE 端到端面空白（徽标仅 Vitest mount 断言）。维护者拍板：机验全自动端到端（含 web 登录操作）+ 自动验收后仍留人验 checklist 文档。本 task = 五阶段联调执行 + 两层验收交付 · 业务码零改。

### R1 · 证据收集（正反检索）

先例三面亲读核真：①`task_web_tenant_context_chat.md` :44（HG-D5 含 Playwright agent 实操验收）/:58（完成态 5 · 截图+Network 头证据形态）/:89（W4 已勾 · 不强制钉 `@playwright/test`）/:100（非范围：不强制入库 CI 套件）；②`task_web_login.md:52`（curl 或 playwright 式手动验证先例）；③`docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（目录与形态既有）。环境真值：前 task 40 invoke :11-13（三坑+登录小坑全留痕）。反向核查：`~/Library/Caches/ms-playwright/` 目录不存在（ls 实证）→ FP-1 退化路径必须预钉。

### R2 · 方案生成

两层验收（维护者 m00193 裁定为核心约束）：机验层 = curl/SSE 脚本（已实证形态直接复用）+ Agent Playwright 实操（含登录 · DOM 断言 · 截图 · Network 头摘要）；人验层 = `docs/checklists/web_api_joint_checklist.md` 硬交付件（机验盲区五项 · 四列结构 · 可复用）。Playwright 用 /tmp scratch 目录 npx 临时装，不钉 `package.json`（对齐 tenant 非范围 :100 · E2E 框架入库留 W8 评估）。

### R3 · 反例与边界

- Playwright 装不上：退化 curl 全机验 + 浏览器面整列转人验，不阻塞（FP-1 · 判据切换须 invoke 声明）。
- 孤儿 run：api 侧遗留（`22b65ce2`/`4740a8a0` 同形态），照登非阻塞（FP-2 · 禁前端迁就）。
- 联调发现 bug：本 task 不修，另立 fix task（FP-8 · 禁顺手改码）。
- 在飞窗时序：`Retry-After: 2` 短窗，照菜谱节奏（在飞窗内打 replay/刷新）。

### R4 · 验收可测性

TC1：HTTP 码 + SPREAD 判据机断。TC2–TC4：DOM 断言字面（`/\d+ms/` ≠0 ≠「—」· 「模型」缺席 · detail 文案可见）+ 附件存在性机断；FP-1 退化判据预写括号内。TC5：seq 连续性脚本 + 三门 EXIT + 基线 255 计数闸。TC6：lint PASS。TC7：文件存在 + 四列结构 + 五项盲区齐备机断。TC8：invoke 帽集合 + wiki 短注机断。

### R5 · 收口

范围/非范围/failure_paths/两层验收/依赖/必读齐备；形态全为先例组合无新技术面；HG-TASK-DRAFT approved（维护者 m00193 令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签（后者建议 n/a · 20 审确认形态）。early_stop at R5。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_api_joint_check.md` | **PASS**（2026-10-13 落稿实跑 · EXIT=0 · 首跑 E3 验收节嵌套子节不识别 → 拍平直层清单后过） |
| 结论 | **HG-AUDIT-R1 pending → 任何改码拒开工**（本 task 默认无 30 面）；40 纯观测（机验+人验交付）待人签后执行 |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-13 | v0 · 10 落稿：维护者令（m00187 问联调 checklist · m00193 拍板新建 task · 机验全自动端到端含 web 登录 + 人验 checklist 文档两层验收）· P0–P4 五阶段范围 · failure_paths 八行（FP-1 Playwright 退化已核 `~/Library/Caches/ms-playwright` 不存在）· R0–R5 思考轮（early_stop at R5）· HG-TASK-DRAFT approved · HG-AUDIT-R1/HG-GRAPH-MODULES pending 待人签 |
