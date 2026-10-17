# 审查文 · 20-task-audit R1 · web-http-error-i18n（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 20-task-audit（R1 书面审查 · web 00 委派） |
| **task_slug** | `web-http-error-i18n` |
| **审查对象** | 分支 `task/web-http-error-i18n-draft`（commit `d247325` · 已 push origin）`docs/tasks/active/task_web_http_error_i18n.md` + `invoke_20261017_10_draft.md` + `docs/tasks/active/README.md` 改动 |
| **审查方式** | 只读（工作树留 main · `git show` 读草稿 · 禁切分支/禁改 task 实质） |
| **结论** | **PASS-with-NIT**（内容零阻塞 · NIT 两条见 §4 · 流程闸 HG-AUDIT-R1 / HG-GRAPH-MODULES 仍 **pending** 待人签 · 30 拒开工） |

---

## 1. 结论摘要

| 维度 | 结论 |
|------|------|
| task **内容**可执行 | **零内容阻塞**：范围/非范围/failure_paths 八行/验收六条/依赖四条/必读七项齐备；三裁定留痕透明；R0–R5 思考轮闭合（early_stop at R5 理由成立：fix-lite 机理单一 · 锚点与枚举全亲读） |
| **流程闸** | HG-TASK-DRAFT=approved（维护者令 00 代录）；HG-AUDIT-R1 / HG-GRAPH-MODULES **pending**（本审查不代签 · 30 拒开工 · 签闸清单见 §5） |
| 草稿分支形态 | docs-only（`git diff --stat main`：3 文件 +254/-2 · task + invoke + README · **零 src/ 改码**）· README 行已同步（活跃任务 1 件 · 待人签） |
| 行为变更类 checklist | **满足**：task「现状锚点」表已列既有断言面三 spec 行号（chat-store.spec.ts:311/474-520/693-765 · chat-store-hitl.spec.ts:1050-1051/1138 · lg-rag-sse.spec.ts:241/447/463）+ F3 断言改写范围 = 旧测 grep 影响面项 |
| lint 复核 | 本帽从草稿分支提取文件复跑 `npx spec-wave task lint` → **PASS · EXIT=0**（与 10 落稿记录一致） |

## 2. 10 帽提请重点核对项 · 逐条结论

### 2.1 裁定 C（stage 前缀 `[http]` 渲染层中文化）是否越出观察项原始范围 —— **越字面、不越理，NIT-1 提请签认点名**

- 亲读观察项源 `invoke_20261017_40_cross_tenant_verify.md`：§5 观察项原文「UI 403 错误条直显后端 detail 原文 `tenant_header_mismatch`（英文机器串），可考虑后续本地化文案；不挡验收」——**字面仅提 detail**。
- 但 §4 N-UI 实录的红条整串为 `[http] tenant_header_mismatch · 可重试：请重新发送消息`（截图 5），`[http]` 与 detail 是**同一条实录瑕疵文案的两段**；task R2 裁定 C 理由（同一瑕疵本体 · 渲染层映射 · store `stage` 字面不动断言零回归 · 成本一行级）成立且留痕透明。
- 落点核实：`ChatView.vue:279` `:title="`[${chat.error.stage}] ${chat.error.message}`"` 确为唯一渲染拼接点；store 侧 stage 写入面（chat.ts:818/824/834 等）断言 `stage:'http'/'auth'/'session'/'resume'` 均不受影响。
- stage 映射表覆盖面对账：`useLgRagSse.ts:36` kind 枚举 = `'http' | 'network' | 'timeout'` + store 字面 `auth/session/resume/validation`——裁定 C 列出的七键 + 未知透传**全覆盖无遗漏**。
- **结论**：属观察项字面外的**同波扩展裁定**，非暗扩范围（已在三裁定节显式留痕待人签生效）；内容上不阻塞，列 **NIT-1** 请维护者签闸时点名确认。

### 2.2 裁定 B 判据零污边界 —— **核实成立**

- 亲读 `src/stores/chat.ts:1310-1359`：`:1314` `apiError.status === 409 && apiError.message.includes('正在执行中')` 判据命中即 `return`（:1315-1319），映射落点 `:1354-1358`（`message: apiError.message || '恢复失败，请稍后重试'`）在其**之后**的 else 尾支——映射改写 `error.value` 不可能回流污染 :1314 判据输入。✓
- `useLgRagSse.ts:236-256` 非 2xx 分类亲读：`message = body.detail` 原文透传 + Retry-After 外抛（裁定 D-C 存续）——task 非范围钉死「零触达」，与 freeze lg-rag-sse-v1 一致。✓
- `tests/lg-rag-sse.spec.ts:241/447/463` 亲读：断言 detail 原文（'Invalid or expired session' / 'err-404' 等）直达 onError——本 task 不改该 spec（验收 TC2 明示零改动绿），断言面零触达。✓
- axios 面核实：`src/api/http.ts:33-38` ApiError.message = `detail` 优先 → :1356 映射面有效命中后端枚举；无 detail 时兜底 axios 原生串 → helper 未命中走 FP-3 原文兜底（不劣化）。✓
- **结论**：判据零污边界表述准确、可执行、有 hitl spec 全绿闸兜底，无阻塞。

### 2.3 FP-5 / FP-7 表述 —— **核实成立（含实跑复证）**

- FP-5：映射仅作用 `error.value` 呈现面、`transportError.message`/`apiError.message` 原文不改——与 2.2 亲读一致，表述准确。✓
- FP-7：`tests/hitl-decision-surface-guards.spec.ts` 存在且行为如述——亲读 `:121-153`：TC13(b) 断言 useLgRagSse 对基线 diff **增行必含 `retryAfterSeconds`**（`:152` `expect(added.some(...)).toBe(true)`），main 及不动该文件的分支 diff 为空 → 恒红；`:124-128` 基线不可达且 CI → `ctx.skip()` 留痕（浅克隆路径），非 CI 抛错拒绿。✓
- **实跑复证**（本帽 main 工作树 · 钉死 pnpm 路径）：`Tests 1 failed | 282 passed (283)`，唯一红 = TC13(b) 失败于 `:152` —— 与 test_strategy_note「283 = 282 绿 + 1 既有红」口径**逐字吻合**。✓

### 2.4 TC1 / TC2 可测性 —— **成立**

- TC1：helper 为导出纯函数 `localizeHttpErrorDetail(detail: string): string`，四组断言（七枚举逐条命中 / `unknown_tenant:evil-tenant` 前缀命中且 id 不回显 / 未知串原文兜底 / 空串进空出）全部为字面机断，无 DOM/时序依赖；RED（helper 不存在）→ GREEN 时序要求 git 可查。✓
- TC2：锁存面亲读 `chat-store.spec.ts:745-765`——现状 `expect(chat.error).toEqual({stage:'http', message:'Run is still in flight;…', retryable:true})` 整对象断言 + active-run/canResume/不自动重试断言；改写仅动 message 字面，stage/retryable/active-run/canResume/`toHaveBeenCalledTimes(1)` 零松动可机械核对。✓
- TC3 附注：`tests/chat-view.spec.ts`（556 行）grep 确认**现无** `chat.error`/el-alert 错误条断言面（仅 history-error 与 hitl-pending-error 面）——task R4 已自述「TC3 为新增断言 · 红测先行同适用」，属实。✓

## 3. 其他抽核（全吻合）

| 项 | 结果 |
|----|------|
| 前端锚点行号 | chat.ts:823-838 live 分支 / :1048-1085 chase（:1049-1056 409 退避不弹条 FP-H2 ✓）/ :1155-1173 resume replay / :1352-1358 decideHitl resume else——全亲读吻合（else 起于 :831，task 写 833-837 指 `error.value` 赋值段，无碍） |
| 后端七枚举 | api 仓 master HEAD `d3fd056` 亲读：tenant_context.py:40/51/53 · router.py:205/403/419/425 · history_router.py:41/122/151 行号与字面全吻合（`History aggregation timeout` 为 **504** · 映射表已含） |
| 图谱闸预判 | `docs/_tech_graph/l1/01_modules.md:18` pinia glob = `src/stores/**` → helper 落点 `src/stores/httpErrorI18n.ts` 在既有 glob 内 · graph_change_layer=n/a 预判成立 |
| 基线口径 | 见 2.3 实跑复证 |

## 4. NIT 清单（非阻塞）

- **NIT-1（裁定 C 签认点名）**：裁定 C 越出观察项 §5 字面范围（观察项仅提 detail 机器串）。本帽判定属同一实录瑕疵串的合理同波扩展、渲染层零回归，**内容不阻塞**；但请维护者签 HG-AUDIT-R1 时**点名确认裁定 C**（签认即生效，无需退回 10）。
- **NIT-2（axios 面无 detail 兜底提示）**：`http.ts:33-38` 当后端错误体无 `detail` 时 ApiError.message 兜底为 axios 原生英文串（如 `Request failed with status code 403`），helper 必未命中 → 原文兜底。FP-3 已覆盖该面不劣化；仅提示 30 定稿映射表与撰写 TC1 断言时知悉，无需改 task。

## 5. 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（本文 · PASS-with-NIT）
- [ ] 点名确认裁定 C（stage 前缀渲染层中文化 · NIT-1）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] 同波签认 HG-GRAPH-MODULES（预判 n/a 成立 · §3 图谱行已核）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | R1 · 20-task-audit：四重点项逐条核结（裁定 C 越字面不越理 NIT-1 / 裁定 B 零污成立 / FP-5·FP-7 含基线实跑复证 283=282 绿+TC13(b) / TC1·TC2 可测）· lint 复跑 PASS · 结论 PASS-with-NIT · 双闸 pending 待人签 |
