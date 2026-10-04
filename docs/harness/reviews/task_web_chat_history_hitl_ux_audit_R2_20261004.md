# 20-task-audit R2 审查：task_web_chat_history_hitl_ux（web-chat-history-hitl-ux）

> **hat**：20-task-audit（task 书面审 · 不实现 · 不改 task 实质内容 · 不代签 human_gate）
> **审查对象**：`docs/tasks/active/task_web_chat_history_hitl_ux.md`（active · draft · 四闸 pending）
> **承接**：R1 审查文 `docs/harness/reviews/task_web_chat_history_hitl_ux_audit_R1_20261004.md`（**fail** · 2 阻塞 + nit a）· 10-task 回填 invoke `docs/harness/invokes/by-task/web-chat-history-hitl-ux/invoke_20261004_10_r1-backfill_web-chat-history-hitl-ux.md`
> **日期**：2026-10-04 · **轮次**：R2（复审 · 全真读复核，不只信回填自述）
> **分支实测**：`task/chat-history-hitl-ux`（本帽未切分支 · 未改 src/ · 未改 task）
> **本帽实测命令**：`grep -rln/-rn`（src/）· 真读 `tests/chat-store.spec.ts`（1390 行 · 十处断言点逐段对拍）· `npx spec-wave task lint`（PASS 实跑）· `ls docs/coding_wiki/volatile.md` / `docs/_tech_graph/l1/01_modules.md`（存在）

## 判定：**pass**（零内容阻塞 · R1 两阻塞全真读闭合 · nit a 已统一 · 无回退）

## 结论

**pass**（机器可读结论节 · 与「判定」节同一结论）：R2 复审零内容阻塞，建议签录 HG-AUDIT-R1（本帽不代签）。详见「判定」节与 §四。

- **内容**：B1（AC17 旧测 grep 影响面）与 B2（AC3 断言形态）均真读复核成立；nit a 口径统一；R1 已通过的其余维度抽核无回退。
- **流程闸**：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-JOINT-DEBUG 均 **pending**（本帽未代签 · 维持 pending，待维护者/获授权 00 签录）。

---

## 一、R1 阻塞闭合复核（全真读 · 逐点）

### B1 · AC17「旧测 grep 影响面」——✅ 闭合（10/10 断言点真读一致）

本帽独立真读 `tests/chat-store.spec.ts`，对拍 AC17 枚举的 10 处 done 帧断言点：

| AC17 声明 | 本帽真读 | 结果 |
|---|---|---|
| `:112-119` live done → `streaming=false` · `lastDone` · `error=null` | :112-116 注入（payload `{latency_ms:1234, model}`）· :117-119 三断言 | ✅ |
| `:386` done 后续问 `threadId` 幂等沿用 | :386 注入 · :387-392 续问 body 带 `t-abc` | ✅ |
| `:440-449` done 后 `startNewSession` 清场 | :440 注入 · :443-449 清场断言（含 `lastDone=null`） | ✅ |
| `:589-593` live done → `activeRun` 与 localStorage 清除 | :588-591 注入 · :592-593 双 null 断言 | ✅ |
| `:647-654` replay done → `activeRun` 清除 · `streaming=false` · `resumeHint=null` | :647 注入 · :651-654 断言 | ✅ |
| `:803-806` replay done → `activeRun` 清除 | :803 注入 · :805-806 双 null | ✅ |
| `:890-891` 终帧替换后 done → `streaming=false` | :890 `seqFrame(6,'done',…)` · :891 断言 | ✅ |
| `:928-931` done 后迟到 answer 帧忽略 | :928 注入 · :930-931 迟到帧忽略断言 | ✅ |
| `:977-978` 降级整段后 done → `streaming=false` | :977 注入 · :978 断言 | ✅ |
| `:1003-1008` replay done → `activeRun` 清除 · `streaming=false` | :1003 注入 · :1007-1008 断言 | ✅ |

**机械清点交叉验证**：`grep -n "event_type: 'done'"` 命中 6 处直接注入（:113/:386/:440/:589/:647/:803）+ `seqFrame(…,'done',…)` 间接注入 4 处（:890/:928/:977/:1003），合计恰 10 处，无遗漏无多报；`:176/:183`（及 :1083/:1090/:1112/:1294 等）为 subtask.progress `payload.status:'done'`（子任务状态 · 非 done 事件帧），invoke 排除说明属实。

**「注入 done 帧 payload 均无 `payload.status`」结论复核**：6 处直接注入 payload 均为 `{latency_ms, model}`；4 处 `seqFrame` 注入 payload 同为 `{latency_ms: 1, model: 'm'}`，且 `seqFrame` 定义（:847-856 · 第二处 :1013）原样透传 payload、不添键——**结论成立**。与 AC10「无 status 旧帧 → 维持现行（clearActiveRun）」相容 · subset 安全 · 预期零回归。

**断言形态可执行性**：①「现有 done 相关用例零改动全绿」——`pnpm test` 即可机断，可执行；②「30 改旧测须逐条 30 invoke 留痕理由」——流程性断言，供 40/20 回归对拍，可执行。✅

### B2 · AC3 新断言形态——✅ 闭合（基线全部实测成立）

| 断言 | 本帽实测 | 结果 |
|---|---|---|
| `grep -rln "replayLgRag" src/ \| wc -l` = 2 | 命中 `src/composables/useLgRagSse.ts` + `src/stores/chat.ts`，计数 = **2** | ✅ |
| `grep -rn "import.*replayLgRag" src/ \| wc -l` = 1 | 唯一命中 `src/stores/chat.ts:7`（`import { replayLgRag, streamLgRag } …`），计数 = **1** | ✅ |
| `chat.ts:764` 注释基线注记 | 真读 :764：`* T4 续看：从 active-run 游标调 replay（POST /api/ops/lg-rag/replay · body {run_id, after_seq:last_seq}）`——既有 T4 文档注释含 `lg-rag/replay` 字面，注记**如实** | ✅ |

旧形态（`grep "lg-rag/replay" | grep -v useLgRagSse`）现状即为 1 会假红的问题确认存在；新形态（文件计数 2 + import 计数 1 + 注释基线显式排除）基线成立、实现后可机断（新增第二封装/第二 import 点即红）。✅

### nit a · AC16 ② 与 FP-F4 口径——✅ 已统一

- AC16 ②（task :147）：「403/404 **不炸屏 · 降级呈现**——与 FP-F4 同口径」
- FP-F4（task :115）：「动作隐藏或降级呈现「无审批权限」提示（**不炸屏 · 与 AC16 ② 同口径**）」

两处统一为「不炸屏 · 降级呈现」且互注「同口径」，R1 指出「静默 vs 提示」出入已消除。✅

---

## 二、无回退抽核（R1 已通过维度）

| 维度 | 抽核结果 |
|---|---|
| 范围 F1/F2 | ✅ F1-1~F1-4 / F2-1~F2-4 与 R1 核对表一致，未见改动 |
| 非范围 | ✅ 十条全列（`❌` 计数实测 = 10），含 WS/轮询定时器、全局面板弃选项，未见删改 |
| AC 映射 | ✅ AC1–AC15 未动；AC16 仅 ② 措辞统一（回填点名项）；AC17 为纯新增；闸/lint 两条尾项在 |
| failure_paths | ✅ FP-F1~FP-F12 十二行齐；仅 FP-F4 措辞按回填统一，语义未变 |
| 闸表 | ✅ 四闸均 pending（本帽真读 task :42-47），说明行与 R1 一致，无代签 |
| wiki_delta | ✅ `docs/coding_wiki/volatile.md`（非 n/a · 文件实测存在） |
| 思考轮 | ✅ R0–R5 控制表 + 逐轮回填闭合 · early_stop=no · R4 描述已按回填同步（AC3 形态更正有回声），残余风险如实 |
| 依赖时序 | ✅ SPEC signed / R1 pass / 上游 B1/B2 ready / mock 先行不阻塞 30 / 联调 blocked_by api——与 R1 一致 |
| test_strategy_note | ✅ 已顺带登记旧测影响面一句（AC17 清点 10 处 · 预期零回归） |
| task lint | ✅ `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` → **LINT: PASS**（本帽实跑 2026-10-04） |
| 修订记录 | ✅ 2026-10-04 增行如实记录 B1/B2/nit a 回填，四闸维持 pending 明写 |

回填 invoke 自述「仅改被点名条目，范围/非范围/FP 语义/闸表/依赖/30 要点未动」与本帽抽核一致。

---

## 三、阻塞 / 非阻塞清单

- **阻塞**：**无**。
- **非阻塞 nit**：
  - **nit b（R1 遗留 · 维持）**：闸表 pending 期间 task 头部「维护者已授权」字样以下游闸表真值为准——签录时以人工闸表为准即可，无需改文。
  - **nit c（本轮新增 · 提示非阻塞）**：AC17 行号以 2026-10-04 版 `tests/chat-store.spec.ts` 为基线；30 实现期若新增测试插行导致行号漂移，以「done 帧注入点计数 + payload 无 status」语义对拍为准，行号仅作锚点。

---

## 四、HG-AUDIT-R1 建议

**建议签录**（本帽不代签）：R1 两阻塞全真读闭合、nit a 已统一、无回退、lint PASS，task 内容已达可执行状态。请维护者（或获授权的 00，SPEC 人工闸表 2026-10-04 授权在案）在 task 人工闸表签录：

- `HG-TASK-DRAFT` → `approved`（blocks 20-R1, 30 · R2 已通过）
- `HG-AUDIT-R1` → `approved`（blocks **30** · 签前 30 拒开工 FP-F12）
- `HG-GRAPH-MODULES` 维持 pending（随 30 交付 G-L1 增量落盘后签录）
- `HG-JOINT-DEBUG` 维持 pending（blocked_by api B1/B2 端点上线 · 未联调不假 CLOSE）

## 五、下一棒

**维护者签闸**（HG-AUDIT-R1 仍 pending · 按纪律不附 30 Prompt）：

```text
## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R2 审查结论（B1/B2 闭合 · pass）
- [ ] 在 task 人工闸表将 HG-TASK-DRAFT / HG-AUDIT-R1 改为 approved（维护者或获授权 00 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt（HG-GRAPH-MODULES 随 30 交付签录 · HG-JOINT-DEBUG 待 api 端点上线联调）

30 Agent 将以 task 表为准；pending 时必须拒开工（FP-F12 · TEMPLATE_30_gate_stop.md）。
```

签录完成后下一棒 = **web 30**（mock 契约先行不阻塞 · 必读列表见 task §给执行帽的必读列表）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-10-04 | 20-task-audit R2：**pass**（零阻塞）。B1 真读复核 AC17 十处 done 帧断言点 10/10 一致 + 注入帧均无 `payload.status` 结论成立 + 断言形态可执行；B2 实测 replayLgRag 文件计数=2 / import 计数=1 / `chat.ts:764` 注释基线注记如实；nit a（AC16 ② ↔ FP-F4「不炸屏 · 降级呈现」）已统一；R1 已通过维度（范围/非范围/AC 映射/FP/闸表/wiki_delta/思考轮/依赖时序）抽核无回退；`task lint` PASS 实跑；四闸维持 pending 未代签；建议维护者签 HG-TASK-DRAFT + HG-AUDIT-R1 → 下一棒 web 30 |
