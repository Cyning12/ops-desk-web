# task_web_hitl_resume_chase_ux 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_hitl_resume_chase_ux.md`（draft · bugfix/前端交互 · 140 行）
> **审查帽**：20-task-audit（书面审查 · **未改 task 实质** · **未改 src/** · **未代签**任何闸 · 未切分支 · 未 commit）
> **日期**：2026-10-28 · **仓态**：cwd=`ops-desk-web`（当前分支 `task/web-hitl-approval-page`，本帽未动）
> **需求真值（对照基准）**：无上游 SPEC · task §一实测钉案（2026-10-28 后端事件链+访问日志双证 · run `1039c1a956f5463596ea29b9dd4e126c`：批准→resume 200→恢复段 68s→前端 replay 14 次全 200 后自停 · 异常锚 14>10）
> **本审查动作**：落盘本审查文；`required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制（skill v2.12），不落；**禁止**附 30 Prompt；**本轮不代维护者签闸**

---

## 结论摘要

**结论：退回 10-task**（内容阻塞 ×1 · 行为变更类 task 验收标准缺「旧测 grep 影响面」项 · 其余全部核对通过 · 流程闸 HG-AUDIT-R1 保持 pending 不签）

| 维度 | 结论 |
|------|------|
| task **内容**可执行 | **单点阻塞后可达**。范围 5 条 / 非范围 6 条 / 验收 6 条 / failure_paths 5 条 / R0–R2 逐项对照实测钉案与代码亲读核对，无越界扩项、无臆造引用；唯一内容阻塞 = 验收标准缺「旧测 grep 影响面」项（见阻塞 B1，skill K7 明定缺则退回） |
| **流程闸**（审查当时） | 人工闸表：`HG-TASK-DRAFT`=approved（维护者 2026-10-28 签收 · 00 代录 · blocks 22-R1,30）；`HG-AUDIT-R1`=**pending**（blocks 30）。本帽**未代签**；退回期间该闸保持 pending |
| lint 复跑 | `npx spec-wave task lint --file docs/tasks/active/task_web_hitl_resume_chase_ux.md` → **LINT: PASS · EXIT=0**（W3 自检占位符 + W5 缺 R3/R4/R5 槽位均 draft 期合法 warn · 2026-10-28 本帽实跑） |
| verify 复跑 | `npx spec-wave verify --target . --task ...` → **VERIFY: BLOCKED · EXIT=2**，HG-AUDIT-R1 pending 与闸表一致（draft 期预期行为 · 2026-10-28 本帽实跑） |
| 下一棒 | **10-task 补列**（见回填清单）→ 20-task-audit R2 复审 → 维护者签 HG-AUDIT-R1 → 30。**非** 30 直接开工 |

---

## 阻塞项（内容 · 须 10-task 回填）

### B1 · 验收标准缺「旧测 grep 影响面」项（行为变更类 task · skill K7 明定缺则退回）

- **适用性判定**：范围 3「追帧节奏退避：固定 2s → 递增退避」= 改默认值/策略语义，属 K7 行为变更类；验收标准 1–6 无「旧测 grep 影响面」项。
- **影响面实证（本帽亲跑 grep，供 10 回填直接引用）**：
  - `tests/chat-store-hitl.spec.ts:1018-1022`：钉「1999ms 不再追 · +1ms 触发第 2 次」——固定 2s 起点钉，改递增退避后起点/节奏断言必改写；
  - `tests/chat-store-hitl.spec.ts:1026-1038`：`advanceTimersByTimeAsync(2000 * 8)` → 钉第 10 次到顶降级、第 11 次不再发——节奏常数直写钉，必受影响；
  - `tests/chat-store.spec.ts:896,1136,1209,1340,1360,1422`：6 处 `advanceTimersByTime(120_000)` 墙钟相关推进，须逐一确认是否消费 chase 固定节奏；
  - `tests/hitl-decision-surface-guards.spec.ts:96-98`（TC3）：setInterval 白名单守卫，递增退避若仍 setTimeout 单链则不受影响，但须列入核对。
- **为什么算阻塞而非 NIT**：验收 6「pnpm test 全绿」只约束终点绿，不授权 30 改写哪些旧钉；缺影响面清单，30 面临「保 2s 旧钉（掏空范围 3）」或「静默改钉（越权改测试）」两难——影响面项正是授权与列举机制。
- **回填位置**：task「验收标准」节增列第 7 条（旧测 grep 影响面：列上述文件行号 + 声明允许改写范围 + 不许为保旧钉回退范围 3）；「给执行帽（30）必读」节可附一行指向。

---

## 核对项（通过面 · 全部亲读实证）

### 1. 范围 5 条 ↔ 实测钉案 ✅ 全映射无漏项、无越界

| 范围条 | 钉案承载 | 审查 |
|---|---|---|
| 1 chase 上限实证与修复（先定位再修） | §一.4 异常锚 14>10 | ✅ 明令「不允许不定位直接改数值」，与 bugfix 纪律一致；验收 1 要求交付说明给实证根因，闭环 |
| 2 追帧期间进度可见（复用双落点） | §一.4 观感缺陷（68s 无提示） | ✅ 双落点形态 `chat.ts:1056-1057`（`assistant.hitl.note` + `resumeHint`）亲读属实 |
| 3 节奏退避 2s→递增（409+Retry-After 优先不动） | §一.3 间隔 ~5s ≠ 设计 2s | ✅ 数值留 30 定稿但验收 1 以「单调退避」断言钉死方向，可机断 |
| 4 批准幂等（吸收 api 仓草案验收②） | 连点/重入风险 | ✅ `decideHitl` 现状（chat.ts:1269+）acting loading 仅组件态，store 层幂等钉为空缺，立项目成立 |
| 5 resume 失败 detail 分类（吸收草案验收③） | FP-H12 既有分流 | ✅ detail 面只消费不改契约，与 freeze `hitl-browser-decide-v1` 一致 |

### 2. 非范围 6 条 ✅ 切割干净、有据

- 双 freeze（`lg-rag-sse-v1` 帧形状 / `hitl-browser-decide-v1` 契约）只消费禁改，与元信息 `freeze_id` 一致；
- `HitlApprovalView` replay 摘要非范围声明 `src/views/HitlApprovalView.vue:40` 亲读逐字属实（「只展示 run_id/cursor，不消费补帧 · 非范围」）；
- api 仓草案 `task_fix_hitl_card_resume_reentry` 关系裁定（症状未复现 · ②③吸收 · 归档裁决上抛维护者）——切割与上抛均清楚，未越权代决；
- 既有 120s 降级文案语义不动（chat.ts:1051-1058 亲读属实），仅保进度态衔接，收紧合理。

### 3. 验收标准 1–6 ✅（除 B1 外）可机断、与范围互锁

验收 1（上限+单调退避+根因实证）、2（终帧即停零调用）、3（可见态出现/消失）、4（decide/resume 各恰好一次）、5（409 detail 映射表单测断言）、6（三门+graph-compile 条件项）均 Vitest 假时钟或退出码可机断；红测先行次序在「给执行帽必读」明写。

### 4. failure_paths 5 条 ✅ 行号锚全部属实（本帽亲读）

| FP 断言 | 实证 |
|---|---|
| replay 网络错/超时保留 active-run · chat.ts:1213 | ✅ :1212-1218 逐字（`retryable: true` 保留可再点续看） |
| cursor 缺失/非法 → FP-H1 手动续看 · chat.ts:1023-1031 | ✅ `parseReplayCursor` :1023-1031 精确（idx≤0/非有限数 → null） |
| 超 120s 降级 · chat.ts:1051-1058 | ✅ `degrade` :1051-1058 精确（双落点文案 + 保留 active-run） |
| replay 401 清 session 跳登录 · chat.ts:1111-1115 | ✅ FP-H7 :1111-1116 精确 |
| stopStreaming/startNewSession 清定时器+代际戳失效 · chat.ts:1040 | ✅ FP-H10 注释 :1040 + `chaseGeneration` 守卫 :1046/:1061/:1070/:1146 亲读在案 |

### 5. 依赖锚点 5 条 ✅ 全部属实（含父 Agent 指定抽查三项）

| 锚 | 实证 |
|---|---|
| `src/stores/chat.ts:1016-1160` chase 器全段 | ✅ 上限三常量 :1017-1021（`CHASE_MAX_ATTEMPTS=10`/`CHASE_MAX_WALL_MS=120_000`/`CHASE_INTERVAL_MS=2_000` 逐字）· chaseResumedRun :1042-1159 · 代际戳 :1046 |
| `src/components/chat/HitlApprovalCard.vue` 三入口同一渲染形态 :4 | ✅ 第 4 行逐字：「live hitl.waiting 帧 / replay / 历史 waiting_approval run 三入口同一渲染形态零分叉」 |
| `src/api/hitl.ts:63-77` HitlResumeReplay 冻结只消费 | ✅ `HitlResumeReplay` 注释+体 :63-71；:73-77 为 `HitlResumeResponse` 头（含 :77 `replay: HitlResumeReplay`）——范围微宽但语义包裹正确（见 NIT N1） |
| `src/composables/useLgRagSse.ts:158-166` replayLgRag | ✅ 函数 :161-166（LG_RAG_REPLAY_PATH 消费于 :165），doc 注释 :157-160 |
| 姊妹仓 close 文档只读参照 | ✅ 声明禁改，无越界 |

### 6. 思考轮 R0–R2 ✅ early_stop 成立

- R0 需求钉案（维护者实测观感 + 后端日志双证）→ R1 现状梳理（机制齐备 · 异常为实证性）→ R2 方案定型，链条完整无跳轮；
- R2 `early_stop=yes` 理由「改动面收敛于 chase 器+卡片 · 契约零触碰 · R3+ 不增新信息」**成立**：改动面确收敛（依赖节 5 锚全在既有文件），双 freeze 声明零触碰，残余风险（退避数值待 30 定稿 · reentry 草案归档裁决）均如实填入 residual_risks 而非藏尾；
- R1 残余「14>10 根因未定」未在思考轮强行假设，而是转为范围 1/验收 1 的「先实证定位」执行纪律——对需假时钟复现的 bugfix 属合理分工，认可；
- W5 缺 R3/R4/R5 槽位为 lint warn-only 过渡期合法形态，非阻塞。

### 7. 审查附加值（供 30 定位起点 · 非修订要求）

- `chaseResumedRun` 共 **3 处调用点**：chat.ts:1330（immediate auto_triggered 以 active-run 游标起追）、:1346（inherit/manual resume 200 携 cursor 起追）、:1359（resume 在飞 409「正在执行中」分流起追）——task R1「多路并发 chase」疑点有具体落点；
- attempts 计数器为**单次 chaseResumedRun 调用作用域**（:1048 局部 `let attempts = 0`），单链硬上限 10 次；实测 14>10 ⇒ 必为多链并发或计数器作用域失效，与 task 疑点一致；
- 实测间隔 ~5s 与 `CHASE_INTERVAL_MS=2_000` 不符，但 FP-H2 409+Retry-After 头优先退避（:1101）可合法产生非 2s 间隔——**间隔异常未必是缺陷，次数越上限才是硬异常**，30 定位时勿误判方向。

---

## 非阻塞 NIT（不阻塞 · 10-task 补列时可顺手修）

- **N1**：依赖节 `hitl.ts:63-77` 实际包裹 `HitlResumeReplay`(:64-71) 与 `HitlResumeResponse` 头部(:73-77)；若求精确可写 :63-79 或拆两条。语义无误导。
- **N2**：「给执行帽必读」`:437` 续看提示条——:437-438 实为 `resumeHint` 注释行，`resumeNotice` 提示条本体在 :435-436；行号微漂移，语义可辨。
- **N3**：范围 3 退避「起始/倍率/上限数值 30 定稿」——建议 10-task 至少钉死起始值（如 2s 起步），避免 30 定稿时重议既有语义；不强制。

---

## 回填清单（退回 10-task）

| # | task 小节 | 回填动作 |
|---|-----------|----------|
| B1-a | 「验收标准」 | 增列第 7 条「旧测 grep 影响面」：列 `tests/chat-store-hitl.spec.ts:1018-1038`（2s 节奏与 10 次上限直写钉）、`tests/chat-store.spec.ts` 6 处 `120_000` 推进、`tests/hitl-decision-surface-guards.spec.ts:96-98` TC3 守卫；声明授权 30 按新退避节奏改写上述钉、禁止为保旧钉回退范围 3 |
| B1-b | 「给执行帽（30）必读」 | 附一行：红测先行前先落旧测影响面清单（对应验收 7），改钉与改码同 PR 可见 |
| N1–N3 | 依赖节 / 必读 / 范围 3 | 可顺手修，非阻塞 |

回填后修订记录增一行（v0.2 · 20 R1 退回补列），task 实质范围/非范围/思考轮**无需改动**。

---

## 闸状态与交接

- `HG-AUDIT-R1` 保持 **pending**（本帽未代签 · 退回期间维护者**勿签**）；
- 下一棒 = **10-task**（按回填清单补列）→ 20-task-audit R2 复审 → 维护者签闸 → 30；
- 本文**不附** 30 Prompt（闸 pending + 内容退回双重禁止）；
- R2 通过且维护者签 `HG-AUDIT-R1`=approved 后，方可下发 Harness 30 Prompt（前提写明 task 表已 approved）。
