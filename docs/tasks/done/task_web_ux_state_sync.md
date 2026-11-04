# Task：web · UX 状态同步族（已决单可见性 + chat 卡片联动 + 时区本地化 · F1/F10/F14/F15/F8-web）

> **状态**：`done`（2026-11-04 · 维护者关账 · 30 D1–D4 + 40 验收 approved-with-comments 全绿 · PR #86 merge `36d42e1` · 合入后双栈 main 冒烟 200）  
> **类型**：fix / 前端 UX（api-only-consume · 冻结契约零分叉）  
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api 任何文件；**禁止**改 `src/api/hitl.ts` 请求面；**禁止**改 SSE event_type  
> **分支**：`task/web-ux-state-sync`（30 开工时才切 · 本棒不切分支、不改 `src/`、不 commit）  
> **10 注**：阶段 W 联调遗留 B10/B11 合并立案（workspace backlog 处置建议）· 证据真值 = workspace 联调 invoke §2（F1–F13 / F14/F15）· **30 在 HG-AUDIT-R1=pending 时拒开工**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-ux-state-sync` |
| **git_branch** | `task/web-ux-state-sync`（30 开工时才切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 维护者签 HG-TASK-DRAFT → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE → 30（红测先行 · 切分支）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 组件级 / store 级红测先行（已决区回灌、卡片对账、本地化、写窗文案），再改 `src/`。质量门在仓根按序 `pnpm lint` → `pnpm test` → `pnpm build`（`packageManager` 钉 `pnpm@10.32.1`，与 corepack 冲突时用 `npx -y pnpm@10.32.1 <cmd>`）。图谱改动后加跑 `./scripts/graph-compile.sh`。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `hitl-browser-decide-v1`（`src/api/hitl.ts` 冻结契约 · 只消费禁改 · 本 task 只动**展示与状态同步**，不动协议） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,20,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md`（hitl 行备注或零 diff · 30 实扫）+ `docs/_tech_graph/l1/10_flow_hitl.graph.yaml`（若 flow 语义变化 · 30 实扫） |
| **graph_delta_note** | 10 评估（2026-11-03 亲读）：全部改动落在既有 `HitlApprovalView.vue` / `HitlApprovalCard.vue` / `src/stores/chat.ts` / `src/stores/httpErrorI18n.ts` 既有模块内，**预计不新增一级模块、不新增路由**。30 交付时：`01_modules.md` hitl 行一句备注（或零 diff 留痕）；若浮层对账构成 flow 语义变化则同步 `10_flow_hitl.graph.yaml` 并跑 `./scripts/graph-compile.sh` 使产物一致。若 30 实证需新增一级模块：停并回签 HG-GRAPH-MODULES（FP-10）。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：已决单 = 会话内（sessionStorage）best-effort 保留，真源仍是 api pending 面；chat 卡片与 `hitlPending` 对账转只读机制；decide/resume 契约零分叉。真值指针 = 本 task。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 20-task-audit R1, 30 | 2026-11-03 · 10 落稿 · 维护者签收（m00085 · 00 代录） |
| HG-AUDIT-R1 | approved | 30 | 2026-11-03 · 20-task-audit R1 PASS-WITH-MINOR（`docs/harness/reviews/task_web_ux_state_sync_audit_R1_20261103.md` · NIT×4 非阻塞）· 维护者签收（m00105 · 00 代录） |
| HG-GRAPH-MODULES | approved | 30 | 2026-11-03 · 10 评估零新增一级模块/路由 · 20-R1 亲验合理 · 30 交付实扫双核对 `01_modules.md`↔`01_struct.md`（NIT-2）· 维护者签收（m00105 · 00 代录） |
| HG-CONTRACT-FREEZE | approved | 30 | 2026-11-03 · 零分叉三处锁（范围/非范围/TC8）+ 佐证链完整 · 20-R1 亲验 · 维护者签收（m00105 · 00 代录） |

---

## 背景与目标

阶段 W 双轨联调（workspace `task_stage_w_e2e_join_acceptance`）实证 web 侧四处 UX 状态同步缺口（live 证据锚齐全）：

| 编号 | 现象 | 实证 |
|---|---|---|
| F1 | /hitl 审批页只列 pending；decide 后行仅存组件本地态（`HitlApprovalView.vue:61-85` 刷新合并逻辑），**整页刷新后已决单消失 → 全 UI 无「已批准待续跑」单据的续跑入口** | C3 实证 · 联调 invoke §2 |
| F10 | chat 浮层卡片聚合已驳回旧单仍显示「待审批」且可点（点击得 409 幂等拒绝） | C4 实证 · run `03d500d2` |
| F14 | 审批页批准后，chat 页浮层卡片仍显示「待审批」不联动（卡片渲染历史 `hitl.waiting` 帧快照，不随外部 decide 同步） | run `af3fcf63832c4d6dae4a1ecc5065a4e3` |
| F15 | 审批卡片「创建时间」显示 UTC 原文（`2026-11-03T06:51:59+00:00`），未本地化用户时区 | A5 截图 `a5-expired-row-prompt.jpg` |
| F8-web | /hitl 页 resume 遇 replay 写窗 409，行级透传英文原文「Resume is writing new events; retry after it settles.」（应中性化） | 联调 invoke §2 F8 · `HitlApprovalView.vue:164` |

完成态：① /hitl 页已决单**会话内保留**（刷新后仍有续跑入口，F1）；② chat 浮层卡片与单据真源对账联动，已 rejected/expired/已决单不可再点（F10/F14）；③ 时间按浏览器时区本地化（F15）；④ 写窗 409 中性化（F8-web）。全程 freeze `hitl-browser-decide-v1` 零分叉。

### 00/10 定夺

维护者可后改。30 不得推翻，只补可机断措辞。

| id | 定夺 |
|----|------|
| D1 | **已决单可见性 = 会话内保留（sessionStorage）**。理由：红线不改 api 仓，api pending 面无已决出口，「已决单视图」需新端点 = 越红线。方案：decide/resume 成功后把行快照（id + `HitlPendingItem` 六键 + 决策 + 两步链态 + replay 摘要）写 sessionStorage（键 `ops.hitl.decided.v1`，版本字段随键）；`HitlApprovalView` mount 时回灌为列表下方**已决区分组**渲染，approved-待续跑 行保留显式「续跑」入口。FIFO 上限 20 条；写失败静默降级为仅内存（等同现状）。**跨浏览器/跨设备不可见 = best-effort 展示**，真源仍是 api pending 面，UI 文案不声称持久。 |
| D2 | **chat 卡片对账（零新端点 · 零轮询）**：渲染 waiting 卡时，若 store `hitlPending` **已成功取回**（非 403/非网络错）且该 request id 不在其中 → 卡片转只读「已被处理或已失效」（不渲染批准/驳回/三选）。本地已动作集 `hitlActedRequestIds` 与 fetch 未成功时**不做对账**（FP-4/5/6）。对账数据复用既有 `refreshHitlPending` 刷新点（进 waiting_approval thread · 动作链后 · ChatView onMounted），不新增轮询/WebSocket/通知中心。/hitl 页 decide 后进入 chat 即触发既有进页核对（AC16②），F14 由此闭环。 |
| D3 | **时间本地化**：`created_at` 用 `Intl.DateTimeFormat` 按浏览器本地时区渲染（含日期+时间+时区偏移感知），`title` 属性保留 UTC 原文供对照；不可解析 → 回退原文（FP-9）。落点：`HitlApprovalView.vue` 行 meta（F15 实证面）；浮层卡 `HitlApprovalCard` 当前不渲染 created_at，不强加。 |
| D4 | **F8-web 纳入本 task**：`HitlApprovalView.vue` `resumeErrorText` 409 分支增加「写窗」detail 子串判据（`writing new events` / `settles`，consume-only，同 `resumeConflictMessage` 先例）→ 中性文案「恢复写入中，请稍后重试」；未命中子串的 409 维持既有透传（FP-8）。chat store 侧 chase 追帧已有 FP-H2 退避重试不弹错误条，不在本 task 重动。 |
| D5 | **两步链零分叉存续**：已决区「续跑」仍走显式 `resumeHitlRequest`；不合并 decide+resume、不自动 resume、不新增 resume_mode 值；decide 成功 ≠ 已续跑的语义在已决区同样成立。 |
| D6 | **F6（两入口 decide 链式不一致）非范围**：不统一浮层链式与 /hitl 两步行为，仅登记待 freeze 评议（既有裁定存续）。 |
| D7 | **图谱**：不新增一级模块/路由；30 交付 `01_modules.md` hitl 行一句备注（或零 diff 留痕）+ 若 flow 语义变化同步 `10_flow_hitl.graph.yaml` + graph-compile 绿（graph_delta_note）。 |
| D8 | **wiki**：`docs/coding_wiki/volatile.md` 短注（wiki_delta_note），禁无理由 `n/a`。 |

---

## 现状锚点（只读 · 10 亲读 2026-11-03）

| 主题 | 锚点 | 现状 |
|------|------|------|
| F1 缺口面 | `src/views/HitlApprovalView.vue:61-85` | 刷新合并只保留**内存**已决行（`kept = rows.filter(status !== 'pending')`），重挂载即全丢 |
| F15 缺口面 | `src/views/HitlApprovalView.vue:297` | `创建时间 {{ row.item.created_at }}` 直出 UTC 原文 |
| F8-web 缺口面 | `src/views/HitlApprovalView.vue:162-166` | `resumeErrorText` 409 透传 `续跑失败：{message}`（英文原文可达） |
| 过期 mapping（参照） | `src/views/HitlApprovalView.vue:110-116,161-166` | decide/resume 双路径 `/过期|expired/i` →「审批已过期，请刷新列表」（镜像薄壳 task 已落 · 本 task 不改语义） |
| 冻结契约 | `src/api/hitl.ts` | `fetchHitlPending` / `decideHitlRequest` / `resumeHitlRequest` 三函数；decide 409=重复/已决 · 404=未知/跨用户 · 422 · 400；resume 409 面含写窗（`writing new events`）/在飞/过期三族 |
| chat 卡片状态机 | `src/stores/chat.ts:123-148` | `ChatHitlCardStatus`：waiting/acting/decided/resolved/forbidden/unavailable；`hitlActedRequestIds` 本地已动作集（:1317-1320） |
| 对账数据源 | `src/stores/chat.ts:1283-1296` | `refreshHitlPending` 一次性核对（不轮询）；`hitlPending` / `hitlPendingError` store 态；403 → `hitlPendingError='无审批权限'` |
| 卡片渲染 | `src/components/chat/HitlApprovalCard.vue:43-97` | badge/三选/双按钮仅 `status==='waiting'` 渲染；其余态只读 note |
| 浮层数据源 | `src/components/chat/HitlApprovalOverlay.vue:1-21` | 单一数据源 = 当前最新 `message.hitl`（D3 数据层零改裁定存续） |
| 错误 i18n 先例 | `src/stores/httpErrorI18n.ts` · `src/stores/chat.ts:1018-1023` | `localizeHttpErrorDetail`（精确枚举）与 `resumeConflictMessage`（detail 子串 consume-only）既有先例 |
| 既有测试 | `tests/hitl-approval-page.spec.ts`（17 用例）· `tests/chat-store-hitl.spec.ts` | 本 task 扩充既有 spec，不放宽既有断言 |
| 图谱 | `docs/_tech_graph/l1/01_modules.md` · `10_flow_hitl.graph.yaml` | hitl flow 已存在（web-hitl-approval-page 交付） |
| 兄弟 active task | `docs/tasks/active/task_web_hitl_resume_expired_mapping.md` | 过期映射镜像薄壳（GO 30 · 其 diff 已在本仓 main 面可见 `resumeErrorText`）——本 task 基线含其改动，**不重复其范围** |
| 证据真值（workspace 仓 · 禁改） | `../ops-desk-workspace/docs/harness/invokes/by-task/stage-w-e2e-join-acceptance/invoke_20261102_10_c8_evidence_archive.md` §2 / `invoke_20261103_10_final_acceptance.md` §2 / `../ops-desk-workspace/docs/tasks/backlog/backlog_20261030_post_stage_w.md` B10/B11 | F1/F10/F14/F15/F8 实证锚 |

---

## 范围

- [ ] **已决区（D1）**：`HitlApprovalView.vue` 新增已决区分组（pending 列表下方）；decide/resume 成功行快照写 sessionStorage（键 `ops.hitl.decided.v1` · 版本字段 · FIFO 20 条）；mount 时校验回灌（损坏/版本不符丢弃 · FP-3）；approved-待续跑 行保留显式「续跑」按钮（走 `resumeHitlRequest` · D5）；写失败静默降级内存态（FP-2）。
- [ ] **时间本地化（D3）**：行 meta `created_at` 本地化渲染 + title 保留 UTC 原文 + 非法串回退（FP-9）。
- [ ] **写窗 409 中性化（D4）**：`resumeErrorText` 增补写窗子串判据 → 「恢复写入中，请稍后重试」；未命中维持既有（FP-8）。
- [ ] **chat 卡片对账（D2）**：waiting 卡渲染与 `hitlPending` 对账——已成功取回且 id 不在列 → 转只读「已被处理或已失效」（动作区不渲染）；403/网络错/本地已动作不做对账（FP-4/5/6）；零轮询零新端点。
- [ ] **Vitest 红测先行**：`tests/hitl-approval-page.spec.ts` 扩充（已决区回灌/落盘/重挂载续跑入口 F1/本地化/写窗文案）；`tests/chat-store-hitl.spec.ts`（或新建对账 spec）扩充（对账转只读/在列保持可点/403·网络·已动作不误判）。
- [ ] **D7 图谱 + D8 wiki 短注 + task lint PASS**（验收 TC8）。

## 非范围

- 改 api 仓任何文件；改 SSE event_type；动 freeze `hitl-browser-decide-v1` 增补条款（TTL/approval_expired 语义保持）。
- decide/resume 请求面任何变更（方法/路径/载荷/错误码语义）；新增后端调用或新端点。
- 轮询 / WebSocket / 全局通知中心（沿用既有刷新点；另立 task 才议）。
- 已决单跨浏览器/跨设备/跨账号可见（D1 best-effort 口径；真源仍是 api pending 面）。
- F6 两入口 decide 链式/两步统一（D6 · freeze 评议另议）；Chat thread 深链参数（另立 task）。
- api 侧 defect/gap：F3/F7/F9/F11/F12/N-R2-1（api fix task 族）；F5 环境噪声。
- 重构 `decideHitl` 两步链 / `chaseResumedRun` 追帧管线（既有裁定存续）。
- 镜像薄壳 task（`task_web_hitl_resume_expired_mapping`）已圈范围（过期 mapping）不重复。
- 不改 CI workflow 文件。

---

## failure_paths

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|----------|----------|--------|----------|
| FP-1 `HG-AUDIT-R1`（或 HG-GRAPH-MODULES / HG-CONTRACT-FREEZE）仍为 pending 即 30 改码 | GATE_VERIFY 拒开工 | 是（人签后） | 无 |
| FP-2 sessionStorage 不可用（隐私模式 / 配额满 / 序列化异常） | 已决区降级为仅内存态（刷新即丢 = 现状行为）；不抛错不炸屏 | 是（环境恢复后） | 无（隐性降级） |
| FP-3 sessionStorage 内容损坏 / 版本字段不符 | 丢弃该键全部内容，按空已决区处理 | 是 | 无 |
| FP-4 pending 拉取 403（非 maintainer） | 不做对账；卡片维持现状（可点，后端 403/409 兜底） | 换有权限账号 | 既有「无审批权限」降级呈现 |
| FP-5 pending 拉取网络错 / 401 | 401 走 http.ts 全局跳登录；网络错不做对账，卡片维持现状 | 是 | 既有错误条 |
| FP-6 对账误判防线 | 本地已动作集 `hitlActedRequestIds` 优先于对账结果（acting/decided 不被对账打回）；fetch 未成功（含 403/网络）不做任何对账判定 | — | 无 |
| FP-7 已决区行续跑撞 409 `approval_expired` | 行级「审批已过期，请刷新列表」（既有 mapping）；该行转 expired 不再可点 | 否（该项） | 行级过期提示 |
| FP-8 写窗 409 子串未命中（其他 409） | 维持既有 `续跑失败：{message}` 透传 | 视具体 | 行级失败提示 |
| FP-9 created_at 不可解析 | 回退 UTC 原文渲染 | — | 无 |
| FP-10 30 实证需新增一级模块/路由 | 停并回签 HG-GRAPH-MODULES（D7 · 评估预计不发生） | 人签后继续 | 无 |
| FP-11 已决区行与 pending 重复（同 id 又入 pending，如 supervisor 重规划新单 id 不同不受影响；同 id 再现） | 回灌过滤：已决区含该 id 时 pending 行正常展示（新单）但已决区不重复追加；同 id 再 pending 属 api 语义异常，以对账与 409 兜底 | 是 | 无 |
| FP-12 已决区满 20 条再落盘 | FIFO 淘汰最旧 | — | 最旧行不再回灌 |

---

## 验收标准

- [ ] **TC1（已决区回灌 · F1）**：预置 sessionStorage `ops.hitl.decided.v1` 一条 approved-待续跑快照 → remount `HitlApprovalView` → 已决区分组渲染该行且「续跑」按钮可见；点续跑 → `resumeHitlRequest` 恰好调用一次。
- [ ] **TC2（落盘 + 重挂载存续 · F1 红线）**：mock decide 成功（resume.required=true）→ sessionStorage 含该行快照；组件 unmount 后重挂载 → 已决区仍渲染且续跑入口在（**刷新不丢**）。
- [ ] **TC3（降级两态）**：sessionStorage.setItem 抛错（mock）→ 页面正常渲染无异常（FP-2）；预置非法 JSON / 版本不符 → 按空已决区处理不崩（FP-3）；落盘超 20 条 FIFO 截断（FP-12）。
- [ ] **TC4（时间本地化 · F15）**：`created_at='2026-11-03T06:51:59+00:00'` → 行内渲染本地时区串（断言不含 `+00:00` 原文直出 · 含本地化日期时间）；`title` 保留 UTC 原文；非法串回退原文（FP-9）。
- [ ] **TC5（写窗 409 中性化 · F8-web）**：`resumeHitlRequest` reject 409、detail「Resume is writing new events; retry after it settles.」→ 行级文案「恢复写入中，请稍后重试」且**不含英文原文**；其他 409 detail → 维持既有透传（FP-8）。
- [ ] **TC6（卡片对账转只读 · F10/F14）**：store `hitlPending` 成功取回且不含该 request id → waiting 卡渲染「已被处理或已失效」只读态，批准/驳回/resume_mode 三选不渲染；id 在列 → 保持可点。两向断言。
- [ ] **TC7（对账不误判）**：`hitlPendingError`='无审批权限'（403）→ 卡片态不被对账改动；网络错同理；本地已动作（`hitlActedRequestIds` 含 id 且卡片 acting/decided）→ 不被对账打回 waiting。三向断言。
- [ ] **TC8（质量门 + 过程 + 冻结零分叉）**：仓根 `pnpm lint` / `pnpm test` / `pnpm build` 退出码均 0；`./scripts/graph-compile.sh` 退出码 0；`01_modules.md` hitl 行备注（或零 diff 留痕）与 `10_flow_hitl.graph.yaml`（若变化）已同步；`docs/coding_wiki/volatile.md` 短注已落；`npx spec-wave task lint --file docs/tasks/active/task_web_ux_state_sync.md` PASS；diff 审查证明 decide/resume 请求面零变更（HG-CONTRACT-FREEZE 佐证）。
- [ ] **旧测影响面 grep（20-R1 NIT-1 · 40 NIT-2 CLOSE 回填）**：红测前 grep 旧测影响面 2 处既有断言随 D3/D4 必改——① TC1 原断言 UTC 直出与 D3 冲突 → `title` 保原文 + 正文不含 ISO；② TC8 镜像用例 409 透传与 D4 冲突 → 写窗中性化文案——另全量回归暴露 chat-view 3 用例 fixture 与 D2 语义冲突 → 补真值修复、断言零放宽（30 invoke §2 留痕 · 40 逐行核对 = 语义对齐非放宽）。

---

## 依赖

| 依赖 | 说明 |
|------|------|
| 派工锚 | `../ops-desk-workspace/docs/tmp/web-ux-state-sync-baton-prompt_v0_zh.md`（v0 · 2026-11-03 · 00 编排落盘 · 含背景/范围/红线/质量门） |
| 证据真值（禁改） | `../ops-desk-workspace/docs/harness/invokes/by-task/stage-w-e2e-join-acceptance/invoke_20261102_10_c8_evidence_archive.md` §2（F1/F8/F10）· `invoke_20261103_10_final_acceptance.md` §2（F14/F15） |
| 登记 | `../ops-desk-workspace/docs/tasks/backlog/backlog_20261030_post_stage_w.md` B10/B11（合并立案建议） |
| 冻结契约 | `src/api/hitl.ts`（freeze `hitl-browser-decide-v1` · 只消费禁改） |
| 兄弟 task | `docs/tasks/active/task_web_hitl_resume_expired_mapping.md`（过期映射薄壳 · 本 task 基线含其改动不重复其范围）· `docs/tasks/done/task_web_hitl_approval_page.md`（审批页 D1–D9 裁定 · 两步钉死/不轮询/零分叉 precedent） |
| 图谱 | `docs/_tech_graph/l1/01_modules.md` · `docs/_tech_graph/l1/10_flow_hitl.graph.yaml` |
| 后端锚点（禁改只读） | `../ops-desk-api/app/ops/hitl/router.py`（pending/decide/resume · 409 三族 detail 文案） |

## 给执行帽的必读列表

1. 本 task（D1–D8、failure_paths、TC1–TC8）。`HG-AUDIT-R1` 为 pending 时 30 拒开工。
2. `AGENTS.md` 仓内定制：质量门 `pnpm lint` → `pnpm test` → `pnpm build`；`wiki_delta` 勿默认 `n/a`。
3. 派工锚 `../ops-desk-workspace/docs/tmp/web-ux-state-sync-baton-prompt_v0_zh.md` 与证据 invoke §2（F1/F8/F10/F14/F15 实证）。
4. `src/api/hitl.ts`（冻结契约逐字段 · 错误码面 · resume 409 三族 detail）。
5. `src/views/HitlApprovalView.vue`（现状锚点全表）与 `docs/tasks/done/task_web_hitl_approval_page.md`（D5 两步钉死 · D7 不轮询裁定——本 task 不推翻）。
6. `src/stores/chat.ts:123-148,1283-1337`（卡片状态机 · `hitlActedRequestIds` · `refreshHitlPending`）与 `src/components/chat/HitlApprovalCard.vue` / `HitlApprovalOverlay.vue`。
7. `src/stores/httpErrorI18n.ts` 与 `src/stores/chat.ts:1018-1023`（detail 子串 consume-only 先例 · D4 同形态）。
8. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`（30 首输出 GATE_VERIFY）。
9. 既有测试 `tests/hitl-approval-page.spec.ts` · `tests/chat-store-hitl.spec.ts`（扩充不放宽）。
10. 本仓无 `docs/standards/CODING_*_L2`，以 `AGENTS.md` 约束为准。

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 框定：web-only UX 状态同步族（F1/F10/F14/F15/F8-web），freeze 零分叉，合并立一个 task（backlog B10/B11 建议） | false | — | 闸未签，30 拒开工 |
| R1 | 证据：HitlApprovalView 已决行仅存内存（:61-85）；chat store 有 `hitlPending` 对账数据源与 `hitlActedRequestIds` 防线；F15 直出 UTC（:297）；F8-web 409 透传（:164）；过期 mapping 已由镜像薄壳落（不重复） | false | — | 已决单真源缺 api 出口 → 只能 best-effort 会话内保留（D1 明示） |
| R2 | 方案：D1 sessionStorage 会话内保留（FIFO 20 · 版本键 · 静默降级）；D2 复用既有 `refreshHitlPending` 刷新点对账（零轮询零新端点 · 进 chat 触发 F14 闭环）；D3 Intl 本地化 + title 保原文；D4 写窗子串中性化（consume-only）；D6 F6 非范围 | false | — | sessionStorage 对账时窗外（/hitl 页 decide 后未进 chat）卡片仍滞后——以进页核对收口，接受 |
| R3 | 反例：勿改 api 补已决端点（红线）；勿轮询/WebSocket（D7 裁定）；勿合并 decide+resume 或自动 resume（D5 · 两步钉死）；勿动 `chaseResumedRun` 管线；勿让对账打回本地已动作卡（FP-6）；F6 不顺手统一（D6） | false | — | 30 可能想把已决区做 cross-tab 同步（storage 事件）——超 D1 口径，需回签 |
| R4 | 验收：TC1–TC7 Vitest 可机断（remount 存续 F1 红线 · 对账双向往返 · 降级三态）；TC8 命令退出码 + diff 审查锁冻结零分叉；F8 经核对部分已由 chase-ux 吸收，本 task 只收 /hitl 页残留面 | false | — | 手测（双入口联动实机）未列 TC——依赖 40/维护者联调复测，照 sibling 先例 TC9 模式留待 40 定夺 |
| R5 | 收口：范围/非范围/failure_paths/TC 齐备可交 20；本窗不改 `src/`、不切分支、不 commit、不签闸 | true | 代码锚点/证据/契约已亲读，baton 范围四项逐条落入，再轮无新证据 | HG-AUDIT-R1 仍 pending；跨 tab 同步未覆盖（明示接受） |

**actual_last_round**：R5（early_stop）

### R0

问题：阶段 W 联调实证 web 侧四处状态同步缺口（F1 已决单刷新即丢无续跑入口 / F10+F14 chat 卡片陈旧可点不联动 / F15 时间 UTC / F8-web 写窗 409 英文透传）。完成态：刷新后会话内仍有续跑入口、卡片与真源对账转只读、时间本地化、写窗中性化；freeze `hitl-browser-decide-v1` 零分叉。无上游 SPEC（baton 即锚），R0–R5 不能省。

### R1

亲读核实：`HitlApprovalView.vue:61-85` 刷新合并仅保留内存已决行（F1 码面锚）；`chat.ts:1283-1296` `refreshHitlPending` 一次性核对 + `hitlPending`/`hitlPendingError` 现成 store 态（D2 数据源在位）；`:1317-1320` `hitlActedRequestIds` 本地已动作集（FP-6 防线在位）；`HitlApprovalCard.vue:43-97` 动作区仅 waiting 渲染（对账转只读只需改 waiting 判据）；`HitlApprovalView.vue:297` UTC 直出（F15）；`:164` 409 透传（F8-web）；过期 mapping 双路径已落（镜像薄壳，本 task 不重复）。api 侧 `hitl.ts` 头注释钉死 resume 409 三族 detail 面（写窗/在飞/过期）。

### R2

方案落成 D1–D8。关键取舍：已决单可见性**不**走 api 新端点（红线），走 sessionStorage 会话内保留（FIFO 20 · 版本键 `ops.hitl.decided.v1` · 写失败静默降级）——baton 范围 1 明示「已决单视图**或**会话内保留」，取后者。卡片对账复用既有刷新点（进 waiting_approval thread · 动作链后 · ChatView onMounted），/hitl 页 decide 后用户进 chat 即触发核对（AC16②），F14 闭环无需新机制。F8 核对结论：chat store chase 面已由 web-hitl-resume-chase-ux 吸收（FP-H2 退避不弹错），残留面 = /hitl 页 409 透传 → 纳入 D4。

### R3

反例清单：改 api 补已决/决策历史端点（红线 · 且 freeze 增补条款禁动）；对已决可见性引入轮询（违反 D7 不轮询裁定）；decide 后自动 resume 或一键 decide+resume（违反两步钉死 · D5）；对账把本地已动作卡打回 waiting（FP-6 · 实测 14>10 根因同族）；顺手统一 F6 两入口链式差异（超范围 · D6）；已决区做 cross-tab storage 事件同步（超 D1 best-effort 口径）。

### R4

TC1–TC3 锁已决区三态（回灌/重挂载存续/降级 · F1 红线 = TC2）；TC4 锁本地化双向（渲染非原文 + title 保原文 + 回退）；TC5 锁写窗文案（含未命中不回归）；TC6–TC7 锁对账双向往返 + 三向不误判；TC8 用命令退出码 + diff 审查锁过程与冻结零分叉（HG-CONTRACT-FREEZE 佐证材料）。手测双入口实机联动未入 TC（依赖 40/联调复测 · sibling TC9 先例）。

### R5

草稿可交 20-task-audit。baton 范围四项 → D1–D4 + 范围 checklist；红线三条 → 非范围前三条 + HG-CONTRACT-FREEZE 闸；failure_paths 从证据反推补齐（降级/损坏/403/网络/误判/过期/FIFO）。`HG-AUDIT-R1` 保持 pending。本窗不改 `src/`、不改 `tests/`、不切分支、不 commit、不签闸。

---

## 实现备忘（子 Agent 回填）

| 项 | 状态 | 备注 |
|----|------|------|
| 已决区 + 本地化 + 写窗 | ⏳ | |
| chat 卡片对账 | ⏳ | |
| 测试扩充 + 图谱 + wiki | ⏳ | |

---

## 测试策略（Harness）

**test_strategy**: `required`

- 先写会失败的 Vitest 测试（TC1–TC7），再改 `src/`。
- TC8 与仓内质量门一致：仓根 `pnpm lint`，然后 `pnpm test`，然后 `pnpm build`。
- 图谱改动后加跑 `./scripts/graph-compile.sh`。
- 环境提示：dev server `http://localhost:5173`（vite 绑 IPv6 · `127.0.0.1` 不通）；`npx -y pnpm@10.32.1 <cmd>` 绕 corepack 冲突。

### 自检结论（执行者）

（30/40 回填）

---

### KPI（00）

（`kpi_aggregator: CLOSE` · 关账回溯填写 · 至少一种可解析分数：`Task_KPI%: N` / D1–D5 表 / 四维 1–5）

---

### 经验总结

（`experience_capture: recommended` 时关账必填 · ≥80 字或 ≥3 条列表）
（`wiki_delta=path` 时须含 wiki 指针：`coding_wiki` 路径 / `wiki_promoted:` / `Wiki:`）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-03 | 10 帽起草棒：派工锚 v0 落稿（D1–D8 · FP-1~FP-12 · TC1–TC8 · R0–R5 early_stop）· 证据锚 workspace 联调 invoke §2 + backlog B10/B11 · 四闸 pending 起 |
| 2026-11-03 | 维护者签收 HG-TASK-DRAFT（m00085）· 00 代录 · 状态 draft→pending · 转派 20-task-audit R1 |
| 2026-11-03 | 20-R1 PASS-WITH-MINOR（NIT×4）· 维护者签收 HG-AUDIT-R1/HG-GRAPH-MODULES/HG-CONTRACT-FREEZE（m00105）· 00 代录 · 状态 pending→active · GO 30 |
| 2026-11-03 | 30 棒 D1–D4 落码（`51d1201`）+ 30 invoke（`e3c41b7`）· 40 验收 approved-with-comments（TC1–TC8 全 PASS · 五门全 0 · freeze 零分叉独立证实）· 40 NIT-2 回填：验收标准补「旧测影响面 grep」行（40 核对 = 语义对齐非放宽）· 40 审查文 + invoke 落盘待入库 |
| 2026-11-04 | **维护者关账**（auth311 令「验收并开始下一个任务」）· 40 棒落盘入库（`ea49791`：审查文 + invoke + graph-compile 产物 + NIT-2 回填）· **PR #86 merge `36d42e1`**（CI check/frontend 绿）· 合入后 web main 重启 vite 冒烟 200 · 状态 active→done · 档迁 `docs/tasks/done/` · 40 NIT-1（已决区窄竞态 · resuming/error 迁按 id Map 建议）登记下波处置 · workspace backlog B10/B11 同步关账 |
