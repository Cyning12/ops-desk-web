# task_web_hitl_resume_chase_ux 审查（R2 · 20-task-audit · v0.2 增量复审）

> **审查对象**：`docs/tasks/active/task_web_hitl_resume_chase_ux.md`（draft · bugfix/前端交互 · v0.2 · 151 行）
> **审查帽**：20-task-audit（书面审查 · **未改 task 任何内容** · **未改 src/** · **未代签**任何闸 · 未切分支 · 未 commit）
> **日期**：2026-10-28 · **仓态**：cwd=`ops-desk-web`（当前分支 `task/web-hitl-approval-page`，本帽未动）
> **复审基准**：R1 审查文 `docs/harness/reviews/task_web_hitl_resume_chase_ux_audit_R1_20261028.md`（结论「退回 10-task · 唯一阻塞 B1 + NIT ×3」）与 v0.2 声称改动（验收 7 新增 :94 · 30 必读附一行 :113 · NIT 处置小节 :137-143 · 修订记录 v0.2 :151）
> **本审查动作**：落盘本审查文；`required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制，不落；**禁止**附 30 Prompt；**本轮不代维护者签闸**（HG-AUDIT-R1 保持 pending）

---

## 结论摘要

**结论：通过**（R1 回填清单逐项落实且全部实证属实 · 未夹带实质改动 · 零内容阻塞 · 零新增阻塞/NIT）。**可呈维护者亲签 `HG-AUDIT-R1`=approved**；维护者签闸后方可下发 30 Prompt。本帽**不代签**。

| 维度 | 结论 |
|------|------|
| B1 回填（验收 7 · :94） | ✅ 落实。引用的三组测试锚点全部亲读/亲跑 grep 实证属实（见核对项 1）；可机断处置规则（适配新节奏 OR 显式声明废弃并给理由；禁静默改钉、禁为保旧钉回退范围 3）完整承接 R1 B1-a 授权语义 |
| B1-b 回填（30 必读 :113） | ✅ 落实。一行指向验收 7 影响面清单 + 「改钉与改码同 PR 可见 · 禁静默改钉 · 禁为保旧钉回退范围 3」，与 R1 回填清单逐字对得上 |
| NIT 处置（:137-143） | ✅ N1/N2/N3 均标「采纳」且实证属实（见核对项 2） |
| 夹带检查 | ✅ 范围五项/非范围六项/failure_paths 五条/思考轮 R0–R2/人工闸表与 R1 审查的 v0.1 语义一致，唯一措辞变化 = 范围 3 增「起始值钉死 2s 起步」（N3 采纳所致 · R1 N3 原话建议 · 非扩项） |
| lint 复跑 | `npx spec-wave task lint` → **LINT: PASS · EXIT=0**（W3 自检占位符 + W5 缺 R3/R4/R5 槽位均 draft 期合法 warn · 2026-10-28 本帽实跑） |
| verify 复跑 | `npx spec-wave verify` → **VERIFY: BLOCKED · EXIT=2**，HG-AUDIT-R1 pending 与闸表一致（v0.2 声明「闸表未动」属实 · draft 期预期行为） |
| 下一棒 | **维护者签 HG-AUDIT-R1**（见文末签闸清单）→ 30（红测先行 · 切分支 `task/web-hitl-resume-chase-ux`） |

---

## 核对项（全部亲读/亲跑实证 · 2026-10-28）

### 1. 验收 7（:94）引用锚点逐条实证 ✅

| 验收 7 引用 | 实证方式 | 结果 |
|---|---|---|
| `tests/chat-store-hitl.spec.ts:1018-1022`（固定 2s 起点钉「1999ms 不追/+1ms 触发第 2 次」） | 亲读 :1018-1022 | ✅ 逐字属实：:1018 注释「≥2s 才再追：1999ms 不触发，+1ms 触发第二次」，:1019 `advanceTimersByTimeAsync(1999)` → 1 次，:1021-1022 `+1ms` → 2 次 |
| `tests/chat-store-hitl.spec.ts:1026-1038`（`advanceTimersByTimeAsync(2000 * 8)` 钉第 10 次到顶降级、第 11 次不再发） | 亲读 :1026-1038 | ✅ 逐字属实：:1027 `2000*8` → 10 次，:1029-1030 第 11 次降级不再发，:1032-1036 降级双落点+保 active-run，:1037-1038 再推 10s 仍 10 次 |
| `tests/chat-store.spec.ts` :896/:1136/:1209/:1340/:1360/:1422 六处 `advanceTimersByTime(120_000)` | 亲跑 grep `advanceTimersByTime(Async)?\(120_000\)` | ✅ 恰六处，行号逐一命中（:896/:1136/:1209/:1340/:1360/:1422），无漏无多 |
| `tests/hitl-decision-surface-guards.spec.ts:96-98`（TC3 setInterval 白名单守卫） | 亲读 :96-98 | ✅ 属实：:96 TC3「src/ 无 pending/追帧相关 setInterval（基线 2 文件白名单外零命中）」，:97-98 grepLines + N3 基线白名单（useRevealQueue / lgRag）——验收 7「递增退避若仍 setTimeout 单链则不受影响但须核对」判定与 R1 B1 一致，正确 |

可机断处置规则核对：「旧钉要么适配递增退避新节奏（改钉与改码同 PR 可见），要么显式声明废弃并给出理由；禁止静默改钉，禁止为保旧钉回退范围 3」——授权边界、废止通道、双禁令齐备，30 执行时可机械判定，B1 关闭。

### 2. NIT 处置逐条实证 ✅

| NIT | v0.2 处置 | 实证 |
|---|---|---|
| N1 依赖锚 `hitl.ts:63-77` 范围微宽 | 采纳，勘误为 `:63-79`（task :82，NIT 表 :141） | ✅ 亲读 `src/api/hitl.ts:63-79`：:63 注释 + `HitlResumeReplay` :64-71 + `HitlResumeResponse` :73-79（:77 `replay: HitlResumeReplay`）——新锚精确包裹两 interface，语义与 R1 N1 建议一致 |
| N2 必读 `:437` 行号漂移 | 采纳，勘误为 `:437-438` resumeHint 注释 / `:435-436` 提示条本体（task :110，NIT 表 :142） | ✅ 亲读 `src/stores/chat.ts:435-438`：:435-436 为 `resumeNotice`（「上次回答未完成·续看」条）注释+本体，:437-438 为 `resumeHint` 注释+本体——勘误后行号逐字命中 |
| N3 退避起始值未钉 | 采纳，范围 3 钉「起始值钉死 2s 起步」（task :66，NIT 表 :143） | ✅ task :66 逐字含「起始值钉死 **2s 起步**；倍率/上限数值 30 定稿并在验收断言钉死」；与既有 `CHASE_INTERVAL_MS=2_000`（chat.ts:1020 锚，R1 已实证）一致；与 R1 N3 原话建议（「至少钉死起始值（如 2s 起步）」）完全对齐 |

### 3. 夹带检查（v0.2 vs R1 审查的 v0.1）✅ 零实质漂移

- **范围五项**（task :64-68）：与 R1 §核对项 1 的五条逐条对应，无增删改；唯一措辞增量 = 范围 3 的「起始值钉死 2s 起步」，系 N3 采纳、R1 明确授权的非阻塞顺手修，**不构成扩项或语义转向**（既有常量即为 2_000ms，方向锁定而非放宽）。
- **非范围六项**（:72-76）：与 R1 §核对项 2 一致（双 freeze 只消费 / FP-H2 不动 / HitlApprovalView 非范围 / reentry 草案归档裁决留维护者 / 120s 降级文案语义不动），逐条在案。
- **failure_paths 五条**（:102-106）：与 R1 §核对项 4 逐字一致，行号锚未动（R1 已逐条亲读实证，本轮未改动 → 不重复实证，承 R1 结论）。
- **思考轮 R0–R2**（:117-135）：控制表与三轮正文与 R1 §核对项 6 一致，`actual_last_round=R2（early_stop）` 未动。
- **人工闸表**（:42-45）：HG-TASK-DRAFT=approved（维护者 2026-10-28 签收 · 00 代录）、HG-AUDIT-R1=**pending**——与 v0.1 一致；verify 复跑 BLOCKED 与闸表互证，**v0.2 未偷签**。
- **修订记录**（:149-151）：v0.2 行自述「范围五项实质/非范围/failure_paths/思考轮/人工闸表均未动，HG-AUDIT-R1 保持 pending」——本轮核对证实该自述属实。
- 行数自洽：v0.1 140 行 → v0.2 151 行，增量 +11 行 ≈ 验收 7（1 长行）+ 必读一行 + NIT 小节 7 行 + 修订记录一行 + 间隔空行，无藏匿空间。

### 4. 流程闸与禁区合规 ✅

- 本帽全程只读 + 落盘本审查文；未改 task、未改 src/、未动闸表、未切分支、未 commit；
- HG-AUDIT-R1 保持 pending，本帽未代签；R1 遗留「退回期间维护者勿签」约束随本结论解除——**现可由维护者亲签**；
- `required_invoke_hats=10,30,40` 不含 20 → invoke 快照非强制，不落。

---

## 阻塞项

**零内容阻塞 · 零新增 NIT**。R1 唯一阻塞 B1 已由验收 7 + 必读一行关闭；N1–N3 全部采纳且勘误属实。

---

## 闸状态与交接

- `HG-TASK-DRAFT`：approved（不动）。
- `HG-AUDIT-R1`：**仍 pending**（本帽 R2 通过 ≠ 签闸；签闸权属维护者）。
- 交接链：本 R2 审查文 → **维护者读 R1+R2 后亲签 HG-AUDIT-R1=approved** → 下发 Harness 30 Prompt（前提写明 task 表已 approved）。

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查文（B1+N1–N3）与 R2 审查文（回填逐项实证通过）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
