# task_web-integration 三 task 审查（R1 · 20-task-audit）

> **审查对象**：
> - `docs/tasks/active/task_web_integration_regression.md`（T-W1 回归批 · F1/F4/F6/F7 · S1/S4/S6/S7）
> - `docs/tasks/active/task_web_sse_hitl_enhance.md`（T-W2 SSE/HITL 增强批 · F2/F3 · S2/S3）
> - `docs/tasks/active/task_web_capability_catalog.md`（T-W3 Capability 目录页 · F5 · S5）
>
> **审查帽**：20-task-audit（R1 · 书面审查 · 不改 task 实质 · 不代签 human_gate）
> **日期**：2026-10-11 · **仓**：ops-desk-web · **分支**：`task/web-integration-task-drafts`（commit 8f76d5f/2df9f8e/9c0f7aa · PR #58 → main）
> **对照 SPEC**：`../ops-desk-api/docs/spec/web-integration/SPEC-web-integration_v0.md`（188 行全文正本 · signed · R2 PASS · Q1-Q4 已裁 m00026）——**本审查日 web 仓迁移 PR #57 未合并，api 仓文件非指针 stub，直接以 api 仓正本为对照真值**
> **审查性质**：常规 R1（10 草稿完成 · 30 未开工 · 无闸序倒置）

---

## 结论摘要

| task | 内容结论 | 流程闸 |
|------|----------|--------|
| **T-W1** | **PASS-WITH-NIT**（零内容阻塞 · NIT-1/NIT-2/NIT-3） | HG-AUDIT-R1 **pending**（维持 · 待人签） |
| **T-W2** | **PASS-WITH-NIT**（零内容阻塞 · NIT-1/NIT-2/NIT-4） | HG-AUDIT-R1 **pending**（维持 · 待人签） |
| **T-W3** | **PASS-WITH-NIT**（零内容阻塞 · NIT-1/NIT-2/NIT-5） | HG-AUDIT-R1 + HG-GRAPH-MODULES **双 pending**（维持 · 待人签） |

三 task 内容面（范围/非范围/验收/failure_paths/思考轮）对照 SPEC §4/§8/§9 **全部一致，零内容阻塞**；关键代码事实经本审查只读实证（§1）。NIT 均为非阻塞注记，可由维护者签闸时一并裁定是否回填，**不构成退回 10-task**。

---

## 1. 独立重跑闸与代码事实实证（本审查实跑 · 只读）

| 核对项 | 命令/方式 | 实测 | 与 task 声明一致？ |
|--------|-----------|------|--------------------|
| T-W1 task lint | `npx spec-wave task lint --file task_web_integration_regression.md` | LINT: PASS | ✓（task :199 自检一致） |
| T-W2 task lint | `npx spec-wave task lint --file task_web_sse_hitl_enhance.md` | LINT: PASS | ✓（task :202 自检一致） |
| T-W3 task lint | `npx spec-wave task lint --file task_web_capability_catalog.md` | LINT: PASS | ✓（task :213 自检一致） |
| Vitest 基线计数 | `grep -cE "^\s*(it|test)\("` | **28 个 spec 文件 · 全量 225 条 it · chat-store.spec.ts 65 条 it** | ✓（T-W2 FP-5 闸 225/65 钉死值为真） |
| 缺口②（T-W2） | 读 `src/composables/useLgRagSse.ts:28` | 帧型 doc comment 实 **6 型**：`run.start · node.progress · subtask.progress · answer · done · error`，未收 `hitl.waiting`；`:42` onEvent 注释同为 6 型 | ✓（task :47/:63 声明为真 · 纯文档级成立） |
| hitl.waiting 运行时已交付 | `grep -n "hitl.waiting" src/stores/chat.ts` | `chat.ts:709 case 'hitl.waiting'` 在案 · :396 钉案 · :435-436 pending 无轮询 | ✓（task :64 声明为真） |
| 缺口③（T-W2） | 读 `src/api/hitl.ts:78-87` + 全仓 grep `resume_mode` | `decideHitlRequest(requestId, decision)` 载荷仅 `{ decision }`；`src/` 零 `resume_mode` 引用 | ✓（task :65 声明为真） |
| 缺口④（T-W2） | 全仓 grep `resumed` + 读 `chat.ts:718-737` done 分支 | `src/` 零 `resumed` 引用；done 分支按 `payload.status==='waiting_approval'` 特判保态、其余走完清除语义，**不依赖 `completed` 字面**——现状方向正确，`done{resumed}` 会走完终态路径（与 SPEC §3.5 唯一终态语义相容） | ✓（task 定性为「核对 · 缺则补」准确） |
| vite proxy 钉死（三 task 共用坑位） | 读 `vite.config.ts:90-99` | `target: process.env.VITE_API_PROXY || 'http://127.0.0.1:8000'` · IPv6 坑注释在案 | ✓ |
| T-W1 现状锚点 | 抽读 | auth.ts:16-40（login/me/tenant/logout）· router ensureMe :88-100 · chatHistory.ts:20/:101/:113 · overview.ts:62 · issues.ts:47 · pulls.ts:40 · graph.ts:26 · lcEvidence.ts:9/:153 · lgRag.ts:9/:151 | ✓ 全真 |
| cookie/租户头契约钉 | 读 `src/api/http.ts` | `:49 withCredentials: true` · 租户头经 `src/tenant.ts` TENANT_HEADER | ✓（SPEC §3.4 口径在案） |
| decide 调用面（T-W2 影响面） | grep `decideHitlRequest` | 唯一调用点 `chat.ts:988`；UI 组件 `src/components/chat/HitlApprovalCard.vue`（挂于 ChatView.vue）；旧测断言 `tests/chat-store-hitl.spec.ts:253 toHaveBeenCalledWith('req-1','approved')` | 见 NIT-4 |
| 闸表诚实性 | 读三 task 人工闸表 | HG-AUDIT-R1 全 pending · 未伪造 pre-approval；T-W3 HG-GRAPH-MODULES pending 且 blocks 30 | ✓ |

---

## 2. T-W1 · task_web_integration_regression.md —— PASS-WITH-NIT

### 对照 SPEC

| 核对项 | 结果 |
|--------|------|
| 范围 = SPEC §9 T-W1 行（F1/F4/F6/F7 回归 + role 菜单核对 + 契约对拍） | ✓ task :72-78 W1-W7 逐项对应，无扩面 |
| S1/S4/S6/S7 验收令 | ✓ task :122-125 四场景入验收 + test_strategy_note（:21）D1 倾向 A 本地双跑 |
| 非范围 | ✓ task :82-88：后端零改动（SPEC §3）· admin 面出范围（Q3）· F8/F10 待 D4/D5 · F9 照登防误列 · T-W2/T-W3 互斥 · 不改 freeze |
| 契约钉（SPEC §3） | ✓ snake_case 原始体照登 + threads envelope 例外照登（:77）；410 Gone 未显式列但由 chat-stream-deprecation.spec.ts 在 225 闸内回归覆盖（见 NIT-3） |
| 环境坑 | ✓ :94-101 四坑全钉（proxy 127.0.0.1 / 邀请码 / NO_PROXY [::1] / SSE 关缓冲）+ D1 + CORS |
| failure_paths | ✓ :109-115：拒开工 / FP-1 / 后端缺口报回 / FP-4 specwave 隔离 / 401 / api 未就绪阻塞 merge / role 缺口另立 task |
| 思考轮 | ✓ R0-R2 实开 + R2 early_stop（reason + residual_risks 齐 · :162/:167） |
| 闸表 | ✓ HG-AUDIT-R1 pending blocks 30；HG-GRAPH-MODULES approved（00 代录 · 理由：graph_change_layer=n/a · 回归批零图谱改动）与元信息自洽 |
| 「原则上零 src 改动」边界 | ✓ :54/:84 钉死；回归批性质与 225 基线闸匹配 |

### NIT（非阻塞）

- **NIT-1（三 task 共用 · pnpm 环境钉）**：验收 verify 命令写裸 `pnpm lint/test/build`（task :128），与仓 `packageManager: pnpm@10.32.1` 存在执行面冲突——系统 PATH 前置的 pnpm 11 会拒跑，须用 `/Users/cyning/.nvm/versions/node/v24.15.0/bin/pnpm`（或 corepack）。建议 30 执行注记或维护者签闸时裁定是否回填 task。
- **NIT-2（三 task 共用 · SPEC 路径过渡期）**：上游/必读引 `docs/spec/web-integration/SPEC-web-integration_v0.md`（task :6/:137/:149），该路径在本分支**尚不存在**（迁移 PR #57 待合并 · 当前正本在 api 仓）。建议补一句过渡指针「PR #57 合并前以 `../ops-desk-api/docs/spec/web-integration/SPEC-web-integration_v0.md` 为正本」，防 30 按空路径开工。
- **NIT-3（T-W1 · 契约对拍颗粒度）**：W6（:77）列 snake_case + envelope 例外两枚，SPEC §3 的 `/chat/stream` 410 Gone 走 /lg-rag/stream 未入对拍清单。该钉已有 `tests/chat-stream-deprecation.spec.ts` 在 225 闸内覆盖，不构成缺口；若求对拍完备可在 W6 加一行照登。

---

## 3. T-W2 · task_web_sse_hitl_enhance.md —— PASS-WITH-NIT

### 对照 SPEC

| 核对项 | 结果 |
|--------|------|
| 范围 = SPEC §9 T-W2 行（7 型帧 doc comment · resume_mode UI · done{resumed} 核对） | ✓ task :74-79 W1-W6 逐项对应；三缺口定性（②纯文档级 / ③可选键默认 inherit / ④核对）与 SPEC §1.1 + R1 B1 修正一致，经 §1 实证全真 |
| S2/S3 验收令 | ✓ :127-128：S2 断网 replay 补齐零丢失 + 未知帧容错实证（SPEC §3.3）；S3 六 env 组全链 + auto_resume=immediate 自适应 |
| FP-5 回退闸 | ✓ :114/:129 量化钉死 225 全量 / 65 chat-store，本审查实测计数为真（§1） |
| 非范围 | ✓ :83-89：后端零改动 · admin 出范围 · D2/D3 留裁 · T-W1/T-W3 互斥 · 不改 freeze/视觉 |
| 契约钉 | ✓ 7 型帧契约（W1）· 未知帧容错（W4）· done{resumed} 唯一终态 + 禁等 completed（:76/:116 failure_path 拒收）· 后端白名单 400 不本地臆造第四值（:75） |
| failure_paths | ✓ :110-117：拒开工 / FP-1 / FP-3 缓冲 / FP-4 specwave 隔离（本批面钉死 useLgRagSse/chat store/decide UI）/ FP-5 / 非法 resume_mode / 等 completed 拒收 / replay 丢帧阻塞 |
| 思考轮 | ✓ R0-R2 实开 + R2 early_stop（reason + residual：decide 组件锚点待 30 实扫 · done{resumed} 若有缺口补渲染仍在 F3 面内 · :165/:170）——residual 诚实且在范围内 |
| 闸表 | ✓ HG-AUDIT-R1 pending blocks 30；HG-GRAPH-MODULES approved（无新页面/路由 · flow 备注为可选 G-L1）与 graph_change_layer=n/a 自洽 |

### NIT（非阻塞）

- **NIT-1 / NIT-2**：同 §2（pnpm 钉 :129 · SPEC 路径 :138/:151）。
- **NIT-4（行为变更 checklist 提醒 · K7）**：W2 增 decide `resume_mode` 可选键，验收标准未列「旧测 grep 影响面」项。实证影响面：唯一调用点 `src/stores/chat.ts:988`；旧测 `tests/chat-store-hitl.spec.ts:253 expect(decideHitlRequest).toHaveBeenCalledWith('req-1','approved')` 为**精确实参断言**——若 30 选「默认 inherit 显式送」写法（task :75 允许「不送或送 inherit」两可），该断言即红。FP-5 225 全绿闸可兜住回归，不构成阻塞；建议 10-task 补一行验收项「grep decideHitlRequest 调用点 + chat-store-hitl/hitl-api 用例影响面照登」，并在 :75 把「不送 or 送 inherit」收敛为单选以消除断言摇摆。

---

## 4. T-W3 · task_web_capability_catalog.md —— PASS-WITH-NIT

### 对照 SPEC

| 核对项 | 结果 |
|--------|------|
| 范围 = SPEC §9 T-W3 行（F5 新路由+页面 · /capability/mine 九键投影 · maintainer manifest_errors 展示） | ✓ task :86-93 W1-W8 逐项对应；10 钉死契约节（:74-80）与 SPEC §2.5/§3 一致（九键白名单排除 adapter/args_schema · {items,count} · summary 两键 · cookie+role 驱动 · admin 操作面出范围 Q3） |
| S5 验收令 | ✓ :138：普通用户零探测面（菜单/路由/请求三级核对）· maintainer 见 manifest_errors/manifest_error_details · 空集/故障态渲染；六态（空集/故障/加载/401/两角色）R3 收敛入验收 |
| 依赖解除 | ✓ :8/:151：B1/B2 已合入 api master #231/#234（Q2 裁定 m00026 · FP-2 消除）声明与 SPEC v0.2 修订记录一致 |
| graph delta（HG-GRAPH-MODULES） | ✓ **双 pending 闸表正确**：新页面/路由 → HG-GRAPH-MODULES 列闸且 blocks 30（:41 · D4-a）；graph_delta 钉 `01_modules.md` + 新增 `10_flow_capability.graph.yaml` + graph-compile 绿（:23-25/:92）；验收 :136 把闸签收列为验收项 |
| FP-4 同域隔离 | ✓ :125：graph-l1 与 specwave-3.1.0 同域，按模块行/flow 文件粒度钉隔离 + 撞车即停报 00 |
| failure_paths | ✓ :122-129：双闸拒开工 / FP-1 / 零探测面泄漏阻塞 merge / 九键多吐字段报回 api 不静默吞 / summary 键缺失报回 / api 未就绪阻塞 |
| 思考轮 | ✓ R0-R3 实开 + R3 early_stop（reason + residual：路由命名留 30 实判 · manifest 故障态构造依赖 api env 配合 · :176-181） |
| role 显隐口径 | ✓ :89/:139 钉「/auth/me role 驱动 · 非前端硬编码账号」，先例锚点（auth.ts · ensureMe :88-100）经 §1 实证为真 |

### NIT（非阻塞）

- **NIT-1 / NIT-2**：同 §2（pnpm 钉 :140 · SPEC 路径 :149/:162）。
- **NIT-5（FP-4 隔离面颗粒度）**：:125 只钉了与 specwave-3.1.0 的同域隔离；T-W2↔T-W3 文件面互斥仅靠两 task 非范围互列（:100 ↔ T-W2 :86）隐式保证。本审查实测两面**不重叠**（T-W2：useLgRagSse.ts / src/stores/chat* / HitlApprovalCard.vue；T-W3：router / views / api/capability.ts / graph-l1），不构成阻塞；建议 failure_paths 显式补一行「T-W2/T-W3 文件面互不重叠 · 撞面即停报 00」钉死。

---

## 5. 缺口 / 差异清单（汇总）

| ID | 级别 | 适用 task | 内容 |
|----|------|-----------|------|
| NIT-1 | 非阻塞注记 | 三 task | verify 命令裸 `pnpm` 与 `packageManager pnpm@10.32.1` 执行面冲突（pnpm 11 拒跑）；须 `/Users/cyning/.nvm/versions/node/v24.15.0/bin/pnpm` 或 corepack |
| NIT-2 | 非阻塞注记 | 三 task | 引用 web 仓 SPEC 路径在 PR #57 合并前不存在；建议补过渡指针（api 仓正本） |
| NIT-3 | 非阻塞注记 | T-W1 | 契约对拍清单可补 `/chat/stream` 410 Gone 钉（已有 deprecation 测在 225 闸内，非缺口） |
| NIT-4 | 非阻塞注记 | T-W2 | decide 可选键缺「旧测 grep 影响面」验收行；`chat-store-hitl.spec.ts:253` 精确实参断言对「送 inherit」写法敏感，建议收敛「不送/送」两可 |
| NIT-5 | 非阻塞注记 | T-W3 | FP-4 可显式补 T-W2↔T-W3 文件面互斥一行（实测不重叠） |

**零内容阻塞 · 零 FAIL · 零退回 10-task。**

---

## 6. 签闸记录

| task | 闸 | 状态 | 记录 |
|------|----|------|------|
| T-W1/T-W2/T-W3 | HG-TASK-DRAFT | approved | 2026-10-11 维护者令联调链执行 · 00 代录 · 维持 |
| T-W1/T-W2 | HG-GRAPH-MODULES | approved | 00 代录 · 理由与 graph_change_layer=n/a 自洽（T-W1 回归零图谱改动 · T-W2 无新页面/路由）· 维持 |
| T-W3 | HG-GRAPH-MODULES | **pending** | **正确列闸**（新页面/路由 · D4-a）；30 前须图谱先行 + 维护者签认 |
| T-W1/T-W2/T-W3 | HG-AUDIT-R1 | **pending** | 本 R1 内容零阻塞（PASS-WITH-NIT）；**20 无权代签 · 待维护者人签** |

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（本文 · 三 task 全 PASS-WITH-NIT · NIT-1~5 可签闸时一并裁定回填与否）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期；T-W3 另须 HG-GRAPH-MODULES 图谱先行后签认）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
