# Task：Web · Chat http 错误条后端 detail 机器串中文化（fix-lite · UX 文案）

> **状态**：active（10 落稿 · **待 HG-AUDIT-R1 / HG-GRAPH-MODULES 人签 · 30 拒开工**）  
> **类型**：fix-lite / UX 文案（错误条面 · 小面改码 + Vitest 锁存）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游（观察项报回）**：`docs/harness/invokes/by-task/web-tenant-context-chat/invoke_20261017_40_cross_tenant_verify.md` §5 观察项（UI 403 错误条直显后端 detail 原文 `tenant_header_mismatch` 英文机器串 · 不挡验收 · 报回后续本地化）· PR #77 备录  
> **分支**：`task/web-http-error-i18n`（实施 · base：`main`）；本草稿经 `task/web-http-error-i18n-draft` 提交评审  
> **00 注**：2026-10-17 · 维护者令「继续下一个task」· 本窗 10 落稿

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-http-error-i18n` |
| **git_branch** | `task/web-http-error-i18n` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · 映射表 + 断言改写）→ PR+CI 绿 → CLOSE；fix-lite 无 40 必需（Vitest 断言面即验收 · UI 目验可选并入 30 invoke 照登） |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 断言 detail 机器串→中文映射（逐枚举 + 前缀 + 未知串兜底原文）；既有 401/404/422/409 分态行为锁存（stage/retryable/active-run 断言零松动 · 仅 message 字面随映射改写）。verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（仓 packageManager pnpm@10.32.1 · PATH 前置 pnpm 11 拒跑 · T-W2 NIT-1 口径）。**基线 283 = 282 绿 + 1 既有红**：`tests/hitl-decision-surface-guards.spec.ts` TC13(b) 在 main 及不动 `useLgRagSse.ts` 的分支上恒红（guard 断言该文件对 main 的 diff 必含 `retryAfterSeconds` 增行 · 仅 decision-surface 本支成立 · CI 浅克隆走 skip 留痕路径故 CI 绿）——既有红照登 · **本 task 禁修**（FP-7） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `n/a`（无新页面/路由/一级模块；映射 helper 落 `src/stores/**` 属 pinia 模块既有 glob 内 · `docs/_tech_graph/l1/01_modules.md` 零改动预判；若 30 改判落点（如新建 src/utils/）则回填本字段与图谱闸） |
| **graph_delta** | `n/a`（可选：pinia 行备注一句「chat 错误条 detail 中文化映射 helper」） |
| **graph_delta_note** | 不新增一级模块；flow 图无涉（纯文案映射 · 帧管线零触） |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 短注 + 真值指针（观察项源 → tenant-context-chat 40 invoke §5 · 三裁定 → 本 task）；对齐仓内定制「新 task 勿默认 n/a」，文件已核存在 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30`（20 审查文落 `docs/harness/reviews/` · fix-lite 无 40 必需） |
| **invoke_retention_profile** | `minimal` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；不改 event 表 · 不动 SSE 管线/解析段 · detail 原文透传语义不变） |
| **related_pr** | 待开（勿 auto-merge） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-17 维护者令「继续下一个task」· 00 代录 |
| HG-AUDIT-R1 | **pending** | **30** | 待 20-task-audit R1 审查文 PASS 后维护者签认（**禁代签**） |
| HG-GRAPH-MODULES | **pending** | **30** | 待维护者签认（**禁代签**）；预判 n/a 成立（helper 落 src/stores/** pinia glob 内 · 无新一级模块） |

---

## 背景与目标

2026-10-17 web_tenant_context_chat hat 40 跨租户联调复验（PASS · PR #77 备录）§5 观察项报回：Web UI 的 http 错误条**直显后端 detail 英文机器串**——Playwright 实录 N-UI 负样本（localStorage 篡改租户头 → api 403）红条文案为 `[http] tenant_header_mismatch · 可重试：请重新发送消息`（附件 `20261017_40_ui_5.png`）。后端 detail 是机器可读枚举串（`tenant_header_mismatch` / `unknown_tenant:<id>` / `Run is still in flight; retry after it settles.` 等），对终端用户不可读。

**目标**：Chat 错误条面的后端 detail 机器串 → **中文用户文案映射表**；未命中映射 → **保留原文兜底**（禁吞错）；映射仅作用于**呈现文案**，不改任何判据输入与传输管线；409 retryable/退避等既有语义零改动（Vitest 锁存）。

### 三裁定（10 起草裁定 · 20 R1 核对 · 维护者签认后生效）

- **裁定 A · detail 映射表落地（新 helper）**：新建导出纯函数 `localizeHttpErrorDetail(detail: string): string`（建议落点 `src/stores/httpErrorI18n.ts` · pinia 模块 glob `src/stores/**` 内 → 零图谱改动 · 导出供 Vitest 直测）。映射键枚举**亲读 api 仓核真**（ops-desk-api master HEAD d3fd056）：`tenant_header_mismatch`（403 · `app/ops/tenant_context.py:53`）· `unknown_tenant:<id>`（422 前缀匹配 · `tenant_context.py:40/51`）· `Run is still in flight; retry after it settles.`（409 · `app/ops/lg_rag/router.py:419`）· `Thread not found`（404 · `router.py:205` / `history_router.py:88`）· `Run not found`（404 · `router.py:425`）· `invalid cursor`（422 · `router.py:403` / `history_router.py:41`）· `History aggregation timeout`（`history_router.py:122/151`）。**未命中 → 原文兜底返回**（禁吞错 · 禁空串 · 禁抛错）；空串进空出（保 `chat.ts:1356` `apiError.message || '恢复失败…'` 短路语义）。中文字面建议（30 定稿 · Vitest 钉字面）：mismatch→「租户状态已变化，请重新选择租户后再发送」· unknown_tenant→「所选租户不可用，请重新选择租户」（**id 不回显** · FP-8 脱敏）· in flight→「回答仍在生成中，请稍后点「续看」接力」· Thread not found→「会话不存在或已失效，请重新提问」· Run not found→「对话记录不存在或已过期，请重新提问」· invalid cursor→「续看位置已失效，请重新提问」· History timeout→「历史记录加载超时，请稍后重试」。
- **裁定 B · 应用面 = 错误条呈现文案，判据输入零触达**：映射仅在写 `error.value` 时应用——`chat.ts:833-837`（live else 分支）· `chat.ts:1080-1084`（chase replay else）· `chat.ts:1168-1172`（resume replay else）· `chat.ts:828` / `chat.ts:1075` / `chat.ts:1163` 三处 422 拼接的 detail 段 · `chat.ts:1356`（decideHitl resume else · axios ApiError 面）。**禁**改 `useLgRagSse.ts:236-256` 非 2xx 分类（detail 原文须原样到 store：`chat.ts:1314` `apiError.message.includes('正在执行中')` 子串判据与既有测试 mock 面依赖原文 · freeze lg-rag-sse-v1 只消费）。
- **裁定 C · stage 前缀 `[http]` 同波中文化（渲染层）**：`ChatView.vue:279` `:title="`[${chat.error.stage}] ${chat.error.message}`"` 的 stage 段经渲染层映射（http→请求失败 · network→网络异常 · timeout→超时 · session→会话 · auth→登录 · validation→校验 · resume→续看 · 未知→原值透传）。**store state 的 `stage` 字面不动**（chat-store 断言 `stage:'http'` 零回归）。**理由**：观察项红条 `[http] tenant_header_mismatch` 中 `[http]` 与 detail 同属机器串直面用户，是同一瑕疵本体的两段；渲染层映射零 store 回归，成本一行级。

---

## 现状锚点（只读 · 已亲读核真）

| 主题 | 路径 | 现状 |
|------|------|------|
| 非 2xx 分类 | `src/composables/useLgRagSse.ts:236-256` | `message = body.detail`（原文）→ `onError{kind:'http', status, message}`（Retry-After 头外抛裁定 D-C 存续 · **本 task 零触达**） |
| live 错误条 else 分支 | `src/stores/chat.ts:831-838` | `error.value = { stage: transportError.kind, message: transportError.message /* detail 原文 */, retryable: true }`（401/404+422 已分态中文化） |
| live 422 拼接 | `src/stores/chat.ts:823-830` | `'会话校验未通过，请重新发送（' + transportError.message + '）'`（detail 原文裸嵌） |
| chase replay else 分支 | `src/stores/chat.ts:1078-1085` | 同 live else（detail 原文 · retryable）；`:1049-1056` 409 走 Retry-After 退避**不弹错误条**（FP-H2 · 本 task 零触达） |
| resume replay else 分支 | `src/stores/chat.ts:1166-1173` | 同上（`resumeFromCursor` 路径 · 409 落此 else → retryable 错误条 + detail 原文） |
| decideHitl resume else | `src/stores/chat.ts:1352-1358` | `message: apiError.message || '恢复失败，请稍后重试'`（axios 面 detail 原文） |
| 子串判据依赖原文 | `src/stores/chat.ts:1314` | `apiError.status === 409 && apiError.message.includes('正在执行中')`（**禁污染判据输入**） |
| 错误条渲染 | `src/views/ChatView.vue:273-291` | `el-alert` title `[${stage}] ${message}` + body 可重试文案（canResume→「连接中断…」· retryable→「可重试：请重新发送消息」· else「不可重试，请联系管理员」） |
| 后端 detail 枚举 | api `app/ops/tenant_context.py:40/51/53` · `app/ops/lg_rag/router.py:205/403/419/425` · `history_router.py:41/88/122/151` | 七枚举亲读（见裁定 A） |
| 既有断言面 | `tests/chat-store.spec.ts:311/474-520/693-765` · `tests/chat-store-hitl.spec.ts:1050-1051/1138` · `tests/lg-rag-sse.spec.ts:241/447/463` | 409 现状锁存 `chat-store.spec.ts:745-765`（message='Run is still in flight…' 透传 · stage/retryable/active-run 断言）· lg-rag-sse spec 断言 detail 原文到 onError（**本 task 不改 · 零松动**） |
| 观察项源 | `docs/harness/invokes/by-task/web-tenant-context-chat/invoke_20261017_40_cross_tenant_verify.md` §4/§5 | N-UI 实录 `[http] tenant_header_mismatch · 可重试：请重新发送消息`（截图 5）· §5 观察项报回 |
| Vitest 基线 | 2026-10-17 main 实跑 | 283 例 = 282 绿 + 1 既有红 TC13(b)（`tests/hitl-decision-surface-guards.spec.ts:152` · 分支语义 guard · 见 test_strategy_note 与 FP-7） |

---

## 范围

- [ ] **F1（30 · 裁定 A/B 落地 · 红测先行）**：新建 `localizeHttpErrorDetail` helper + 七枚举映射表（中文字面 30 定稿）→ chat.ts 六落点接入（三 else 分支 + 三拼接/短路面 · 见裁定 B）；新 spec（建议 `tests/chat-http-error-i18n.spec.ts`）直测 helper：逐枚举命中 · `unknown_tenant:evil-tenant` 前缀命中且 id 不回显 · 未知串 `brand_new_machine_string` → 原文兜底 · 空串进空出。
- [ ] **F2（30 · 裁定 C 落地）**：`ChatView.vue:279` stage 前缀渲染层中文化映射（store state 不动）；chat-view.spec.ts 断言标题不含 `[http]` 字面 · 含中文标签。
- [ ] **F3（30 · 现状锁存断言改写）**：`chat-store.spec.ts` http else 分支用例（403 mismatch / 409 in-flight 等）message 断言改中文字面；**stage/retryable/active-run/canResume/不自动重试断言零改动**；`chat-store-hitl.spec.ts:1050-1051`（chase 409 退避不弹错误条）与 `tests/lg-rag-sse.spec.ts`（detail 原文到 onError）零改动绿。
- [ ] **F4（回执落盘）**：10/30 invoke 齐（`docs/harness/invokes/by-task/web-http-error-i18n/`）· 三裁定留痕（本 task 体）· `docs/coding_wiki/volatile.md` 短注。

## 非范围

- **后端零改动**（api detail 字面/状态码/枚举只读消费；暴露新机器串报回登记映射表 · 不改后端迁就）。
- **`useLgRagSse.ts` 零改动**（非 2xx 分类/Retry-After 外抛/解析段 · freeze lg-rag-sse-v1 只消费 · detail 原文透传语义不变）。
- **409 retryable / Retry-After 退避 / chase 追帧语义零改动**（FP-H2 现状锁存 · 对齐 fobs 裁定 C 口径）。
- **全仓 i18n 框架引入**（vue-i18n 等 · 本波仅错误条面硬编码中文映射表；框架化另立 task 口）。
- **`chat.ts:1314` '正在执行中' 子串判据、HITL note/卡片文案、sessionError、其他页面/toast 面**（各有既有语义 · 零触达）。
- **TC13(b) guard 修复**（`hitl-decision-surface-guards.spec.ts` 既有红 · 本 task 仅照登 · 修复另立 task 报回 00）。
- `task_web_tenant_context_chat` 面（已 CLOSE 迁 done/ · **勿混入**）；admin 面；iOS。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 HG-AUDIT-R1 pending 即 30 改码 | 执行 Agent **拒开工**（GATE_VERIFY 首输出 · task 人工闸表为真值） | 是（签后重来） | 无 |
| FP-2 HG-GRAPH-MODULES pending 即 30 改码 | **拒开工**（D4-a · 同上） | 是（签后重来） | 无 |
| FP-3 映射表漏键（后端上线新机器串 / 枚举未覆盖） | helper 未命中 → **原文兜底返回**（禁吞错 · 禁空串 · 禁抛错）；观察项报回登记映射表下一棒补录 | 是 | 错误条显英文原文（同现状 · 不劣化） |
| FP-4 误改 409 retryable / Retry-After 退避语义 | Vitest 锁存现状：`chat-store.spec.ts:745-765`（resume replay 409 → retryable 错误条 + active-run 保留 + 不自动重试）· `chat-store-hitl.spec.ts:1050-1051`（chase 409 退避不弹错误条）——红即回退 | 是 | 无 |
| FP-5 映射污染判据输入（`chat.ts:1314` '正在执行中' 子串 / axios ApiError 面） | 裁定 B 钉死：映射仅作用于写 `error.value` 的呈现文案；`transportError.message` / `apiError.message` 原文不改 · useLgRagSse 分类不改；hitl spec 全绿闸 | 是 | 无（判据失效则 resume 在飞 409 误呈「恢复失败」） |
| FP-6 既有断言字面与映射冲突（message 原文断言红） | 红测先行：先改断言为中文映射字面见 RED（helper 未接）→ 接入见 GREEN · 时序 git 可查；**禁**为绿而放松 stage/retryable 断言 | 是 | 无 |
| FP-7 误把 TC13(b) 既有红当本 task 引入 / 顺手修 guard | 基线照登：283 = 282 绿 + 1 既有红（guard 分支语义 · CI skip 路径）；验收口径 = **零新增红**；修复另立 task | 是 | 无 |
| FP-8 动态片段回显（`unknown_tenant:<id>` 的 id 拼进中文文案） | 前缀匹配命中后文案**不含 id**（脱敏 · 租户名非用户可读信息且防注入呈现）；Vitest 断言 id 不出现在输出 | 是 | 无 |

---

## 验收标准

- [ ] **TC1（30 · helper 单测 · 红测先行）**：新 spec 直测 `localizeHttpErrorDetail`——七枚举逐条命中中文字面（与映射表同源断言）· `unknown_tenant:evil-tenant` 前缀命中且输出不含 `evil-tenant` · 未知串 `brand_new_machine_string` → 原文兜底返回 · 空串进空出；RED（helper 不存在/未接）→ GREEN 时序 git 可查。
- [ ] **TC2（30 · store 集成断言改写绿）**：`chat-store.spec.ts` http else 分支用例（403 `tenant_header_mismatch` · 409 `Run is still in flight;…`）message 断言 = 中文字面；stage（`'http'`）/retryable（`true`）/active-run 保留/canResume/不自动重试断言**零改动**；`chat-store-hitl.spec.ts` 与 `lg-rag-sse.spec.ts` 零改动绿。
- [ ] **TC3（30 · 裁定 C）**：chat-view.spec.ts 断言 error{stage:'http'} 渲染标题**不含 `[http]` 字面** · 含中文 stage 标签；未知 stage 透传原值断言。
- [ ] **TC4（30 · 回归闸）**：钉死 pnpm 路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`：`lint` EXIT=0 · `test` **零新增红**（基线 283 = 282 绿 + TC13(b) 既有红 1 例照登 · FP-7）· `build` EXIT=0。
- [ ] **TC5（回执落盘）**：invoke 10/30 齐备（30 含 RED→GREEN 时序与三门实证）· 三裁定留痕 · `docs/coding_wiki/volatile.md` 短注落盘。
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_http_error_i18n.md` PASS。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 观察项源（真值） | `docs/harness/invokes/by-task/web-tenant-context-chat/invoke_20261017_40_cross_tenant_verify.md` §4 N-UI 实录 + §5 观察项（PR #77 备录 · tenant-context-chat 已 CLOSE） |
| 后端 detail 枚举真值 | ops-desk-api master HEAD d3fd056：`../ops-desk-api/app/ops/tenant_context.py:40/51/53` · `../ops-desk-api/app/ops/lg_rag/router.py:205/403/419/425` · `../ops-desk-api/app/ops/lg_rag/history_router.py:41/88/122/151`（10 亲读核真 · 30 开工复读防漂移） |
| 409 现状语义 | `docs/tasks/done/task_web_hitl_fobs_receipt.md` 裁定 C + `docs/tasks/done/task_web_hitl_decision_surface.md` FP-H2（Retry-After 退避）· `tests/chat-store.spec.ts:745-765` · `tests/chat-store-hitl.spec.ts:1050-1051` |
| 格式锚 | `docs/tasks/done/task_web_hitl_fobs_receipt.md`（三裁定节 / failure_paths 表 / 思考轮写法） |

---

## 给执行帽的必读列表

1. `AGENTS.md` + 本 task（三裁定 · failure_paths · 基线 283 口径）
2. `src/stores/chat.ts`（:809-838 live onError · :1048-1085 chase · :1145-1173 resume replay · :1310-1360 decideHitl resume · :1314 子串判据禁污）
3. `src/composables/useLgRagSse.ts:236-256`（非 2xx 分类 · **零触达**）
4. `src/views/ChatView.vue:273-291`（错误条渲染 · 裁定 C 落点）
5. `tests/chat-store.spec.ts:300-320,470-520,690-765` · `tests/chat-store-hitl.spec.ts:1040-1060,1130-1145` · `tests/lg-rag-sse.spec.ts:235-250,440-470`（锁存面）
6. api 枚举亲读路径（依赖表行 2 · 禁信转述）
7. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 问题框定：观察项 = Chat 错误条面后端 detail 机器串直显；修面 = 映射表（helper）+ 呈现面接入 + stage 前缀渲染层中文化；契约面（后端 detail / SSE 管线 / 409 语义）全零触 | false | — | none |
| R1 | 证据收集：前端锚点全亲读（chat.ts 三 else + 三拼接/短路 + :1314 判据 · useLgRagSse.ts:236-256 · ChatView.vue:273-291 · 既有断言面三 spec）；后端七枚举亲读 api 仓行号钉死；基线实跑 283=282 绿+TC13(b) 既有红 | false | — | 后端后续新增枚举串 → FP-3 兜底 + 报回补录 |
| R2 | 裁定生成：A 映射表+helper（src/stores/ 内零图谱改动 · 未命中原文兜底）· B 仅呈现面接入（判据输入零触达 · :1314 子串与 freeze 存续）· C stage 前缀渲染层中文化（store stage 字面不动 · 同一瑕疵本体两段同修 · 零 store 回归） | false | — | 中文字面 30 定稿若与断言不同步 → FP-6 红测先行兜住 |
| R3 | 反例与边界：漏键→原文兜底（FP-3）；判据污染→裁定 B+hitl spec 闸（FP-5）；动态 id 脱敏（FP-8）；chase 409 退避不弹条面零触达（FP-H2 存续）；空串进空出保 :1356 短路；TC13(b) 既有红不误修（FP-7） | false | — | TC13(b) 本地红在 PR 前 review 易误读 → 30 invoke 须照登基线口径 |
| R4 | 验收可测性：TC1 helper 单测字面机断 · TC2/TC3 断言字面机断 + RED→GREEN 时序 git 可查 · TC4 计数闸（零新增红）· TC5 invoke/短注齐备机断 | false | — | chat-view.spec.ts 现无错误条断言面 · TC3 为新增断言（红测先行同适用） |
| R5 | 收口：范围 F1–F4 · 非范围七条 · failure_paths 八行 · 验收六条 · 依赖四条 · 必读七项齐备；HG-TASK-DRAFT approved（维护者令）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 不代签 | true | 机理单一（纯文案映射）· 锚点与枚举全亲读核真 · 修面/非范围边界清晰 · 再轮无新增信息 | 三裁定生效待闸 · 中文字面定稿归 30 |

**actual_last_round**：R5（early_stop）

### R0 · 问题框定

观察项报回（tenant-context-chat 40 invoke §5）：UI 403 错误条直显 `tenant_header_mismatch` 机器串。问题面 = Chat 错误条文案生成链（SSE 非 2xx detail 原文 → store else 分支透传 → el-alert title 直显）+ stage 前缀 `[http]`。修面小、契约面全钉死，无新开发，fix-lite。

### R1 · 证据收集

前端亲读核真：`useLgRagSse.ts:236-256` detail 原文进 `onError{kind:'http'}`（Retry-After 外抛存续）；`chat.ts` 三 else 分支（:833-837 / :1080-1084 / :1168-1172）+ live 422 拼接（:828）+ resume 422 拼接（:1075/:1163）+ decideHitl resume else（:1356）共七处呈现面直用 detail 原文；`chat.ts:1314` '正在执行中' 子串判据依赖原文（映射禁污输入）；`ChatView.vue:279` title 拼接 `[stage] message`。后端枚举亲读 api master d3fd056 七条（行号见裁定 A）。既有断言面三 spec 亲读（409 锁存 :745-765 · chase 退避 :1050-1051 · lg-rag-sse 原文断言）。基线实跑：283 例 282 绿 + TC13(b) 分支语义 guard 既有红（main 及不动 useLgRagSse 的分支恒红 · CI 浅克隆 skip）。

### R2 · 裁定生成

- **A · 映射表 + helper**：机器串→中文为纯查表，helper 独立文件导出供直测；落 src/stores/** 保持 pinia glob 内零图谱改动；未命中原文兜底（禁吞错优先于美观）。
- **B · 仅呈现面接入**：映射在写 error.value 一刻应用，transportError/apiError 原文与 useLgRagSse 分类不改——:1314 判据、freeze、lg-rag-sse spec 三面因此零回归。
- **C · stage 前缀同波修**：观察项红条两段机器串（`[http]` + detail）属同一瑕疵本体；渲染层映射使 store state 断言（stage:'http'）零回归，成本一行级。

### R3 · 反例与边界

- 后端新增枚举串：helper 未命中 → 原文兜底（不劣化于现状）· 报回补录（FP-3）。
- `unknown_tenant:<id>` 动态片段：前缀匹配 · id 不回显（FP-8 脱敏）。
- chase 追帧 409：走 Retry-After 退避不弹错误条（FP-H2）——本 task 面外，零触达。
- `chat.ts:1356` 空串短路：helper 空进空出保 `|| '恢复失败…'` 语义。
- TC13(b) 既有红：基线照登 · 禁顺手修（FP-7）· 30 invoke 明示口径防 review 误读。

### R4 · 验收可测性

TC1 helper 纯函数直测（命中/前缀/兜底/空串四组字面断言）全机断。TC2/TC3 断言字面机断 + RED→GREEN 时序 git 可查（现断言 message=英文原文即 RED 签名）。TC4 三门 EXIT 码 + 计数闸（零新增红 · 基线 283 口径）。TC5 invoke 帽集合 + volatile 短注字面机断。

### R5 · 收口

范围/非范围/failure_paths/验收/依赖/必读齐备；三裁定留痕待 20 R1 + 维护者签认生效；fix-lite 无 40 必需。early_stop at R5。

---

### 自检结论（起草者）

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_http_error_i18n.md` | **PASS**（2026-10-17 落稿实跑 · EXIT=0） |
| 结论 | HG-AUDIT-R1 / HG-GRAPH-MODULES **pending** → **30 拒开工**（待人签 · 禁代签） |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | v0 · 10 落稿：维护者令「继续下一个task」（00 代录 HG-TASK-DRAFT）· 观察项源 tenant-context-chat 40 invoke §5（PR #77）· 三裁定（A 映射表 helper / B 仅呈现面接入判据零污 / C stage 前缀渲染层中文化）· 锚点与后端七枚举全亲读核真（chat.ts 七落点 · useLgRagSse.ts:236-256 · ChatView.vue:273-291 · api tenant_context.py/router.py/history_router.py 行号钉死）· 基线实跑 283=282 绿+TC13(b) 既有红照登 · R0–R5 思考轮（early_stop at R5）· HG-AUDIT-R1/HG-GRAPH-MODULES pending 待人签 |
