# Task Audit R1：web-lg-rag-sse-subtask-message

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_subtask_message.md`（task lint **PASS** · 1 warn · 本审查实测）  
> **SPEC**：api 契约 freeze `lg-rag-sse-v1`（不新开 freeze · 不新增 event_type · 仅消费可选 `payload.message`）；本仓展示层消费优先级，不改协议  
> **SPEC 审查**：不在本审查范围（api 05 §10.7 `message` 行为「拟增补」，由 api task 负责）  
> **上游**：web progressive_reveal CLOSE（#39）· subtask_live CLOSE（#38）；api 并行轨 `lg-rag-sse-subtask-message`（active · HG-AUDIT-R1 pending · 未合不阻塞本草稿）  
> **日期**：2026-09-08  
> **审查人**：20-task-audit（R1）  
> **git_branch（task 表）**：`task/web-lg-rag-sse-subtask-message`（工作区当前分支已核一致）  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**不**改 `src/`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-subtask-message` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 零新 event_type · 消费可选键） |
| test_strategy | `required`（Vitest：running/step/done±output 五行 mock 帧断言 · lint/test/build · graph-compile · wiki-delta） |
| required_invoke_hats | `10,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| invoke_retention_profile | `default` |
| graph_delta | `10_flow_chat` 备注 update；不新增一级模块（`01_modules.md` 零 diff） |
| wiki_delta | `docs/coding_wiki/volatile.md`（短注 + 真值指针） |
| code_quality_bar | `strict` |
| 思考轮 | R0/R1 done · early_stop（理由/residual 闭合） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / implement_repo / orchestration / freeze_id / required_invoke_hats / graph_delta / wiki_delta / test_strategy=required / code_quality_bar=strict / 人工闸表三行齐 / close_pr_policy=required · related_pr「待开」自洽。**通过。**

### task lint（本审查实测）

```
warn: [W3] 自检结论为占位符（draft 期合法 · close 前须回填）
LINT: PASS · task_web_lg_rag_sse_subtask_message.md
```

**PASS**（exit 0 · 唯一 warn 为 draft 期合法占位，CLOSE 前 30/40 回填即可）。

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（00 代签 · 2026-09-08 · 维护者授权签收后续文档） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（同 progressive-reveal R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（00 代签） | **—** | graph_delta 仅 `10_flow_chat` 备注、不新增一级模块；已预签，不阻塞 30 |
| **HG-AUDIT-R1** | **pending** | **30** | **保持 pending**；本帽不签发；task 修订记录已注明「待 20 R1 落盘后 **00 代签**」 |

blocks_hats 方向正确（AUDIT 挡 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽；00 定夺五行决策表（running/step/done±output/本地词典）可执行可断言；failure_paths 合理；思考轮闭合；与 api 上游正交（只消费可选键，mock 可先行） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 5 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照代码现状已核）

| 项 | task | 审查 |
|---|---|---|
| `src/stores/chat.ts`：subtask.progress 三态对 `message` 的优先消费与 done/output 边界 | 改造点 | 现状已核：`PROGRESS_DIRECT_KEYS = ['summary','content','message']`（L141）**含 message 属实**；`formatRunningSubtaskContent` 直出键命中时强制包 `执行中 · ` 前缀（L190–193）——**前缀问题属实**；`formatStepSubtaskContent` 直出键命中时**已原样返回**无前缀（L203–206）；`extractSubtaskDoneText` 先解析 `subtask_result.output`（L240–258，fromOutput=true → reveal），无 output 时**已回退 PROGRESS_DIRECT_KEYS（含 message）作摘要**（L260–264，fromOutput=false → 即时展示）。改造点真实落在：running 前缀、message 显式优先级、测试锁定（见 N1/N2） |
| Vitest：有/无 message · done±output · 同 id 合并 · 与 answer 不串台 | 扩展现有 | 现状已核：`tests/chat-store.spec.ts` 已有手工喂帧 / fake-timers reveal / 「step 不串台」（L1146–1148）等模式；尚无 subtask 帧带 `message` 的用例——验收可落地为新增用例 |
| G-L1 | `10_flow_chat.*` 备注 + graph-compile | yaml/md 已核存在；须改 yaml 再 compile，不得手改 .md |
| wiki_delta | `volatile.md` 短注 | 文件已核存在 |
| 上游可读 | api task + 05 §10.7 | api `task_lg_rag_sse_subtask_message.md` 已核存在（active · 00 代签 · HG-AUDIT-R1 pending）；§10.7 已核存在（L478 起），`message` 行尚未落（task 已标「拟增补」，自洽）；§10.7「web」行与本 task 三态消费同向 |
| 前置 CLOSE | progressive_reveal #39 · subtask_live #38 | 两文件已核在 `done/`，头注 PR #39 / #38 MERGED，与 task 声明一致 |

### 非范围

| 非范围条目 | 审查 |
|---|---|
| 改 api / 代写 api 文案词典 | ✓；与 api 并行轨职责切分清晰（api 生成 · web 消费） |
| 新 SSE event_type / 重开 freeze | ✓；freeze 钉死 `lg-rag-sse-v1` |
| 改 reveal 速率 / SoT 双缓冲机制 | ✓；沿用 progressive-reveal（`useRevealQueue.ts` 已核：REVEAL_* 常量 + RevealQueue） |
| markdown / invoke 页 / idle·keepalive | ✓ |
| web 侧再造完整 step→中文映射表 | ✓；与定夺「本地词典降级 fallback only」闭合 |

**无漏项。**

### 00 定夺（五行决策表）内部一致性

| 钉死项 | 与范围/验收/failure | 审查 |
|---|---|---|
| 字段：可选 string · 空串视缺省 | 与 api 定夺「禁止空串冒充有内容」对齐 | 一致；可断言 |
| running：非空 message 原样 · 禁止叠「执行中 ·」成句 | 验收条「content 等于 message（或钉死的极轻前缀规则，且测锁定）」 | 方向一致；前缀去留带条件、为 R1 residual —— 30 必须二选一钉死（见 N3） |
| step：非空 message 原样即时 · 同 id 合并沿用 #38 | 验收「替换不堆行」 | 一致；现状已无前缀直出，本条主要是测试锁定（见 N4） |
| done + 有 output：仍 reveal output · message 不得覆盖 | 验收「渐显文本来自 output · 终态 ≠ 仅短 message」 | 一致；现码已如此（output 优先于 DIRECT_KEYS），本条为回归锁定 |
| done + 无 output：message 优先 · 再降级 · 禁 JSON dump | 验收「展示该 message」 | 定夺本身可执行；但背景痛点#3「完全忽略」与现状不符（现码已经 DIRECT_KEYS 兜底消费 message），真实增量是**显式优先级 + 测锁定**（见 N1） |
| 本地词典 fallback only · 不删光 | 验收「有 message 时不走仅键名拼装」 | 一致；可断言 |
| 兼容：无 message 不回归 | failure_paths 首行 | 一致 |
| freeze / 模块 | 零新 event_type · `01_modules` 零 diff | 一致 |

### failure_paths

| 触发 | task 期望 | 审查 |
|---|---|---|
| 帧无 message 或空串 | 走现有本地兜底 · 不抛 | 与现码同构；可断言 |
| message 超长 | 原样或 UI 截断（30 内决 · 须可测）· 不崩 | 合理延迟决策；api 侧 ≤200 字截断已有上游约束 |
| done 同有 message 与长 output | 只对 output 渐显 | 与现码/定夺一致 |
| done 无 output 有 message | 即时展示为完成摘要 | 与现码兜底同向（见 N1） |
| api 未合入仅 mock | Vitest 合成帧验收 · 联调后置 | 与 orchestration「api 合入不阻塞本草稿」自洽 |
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 流程自检行 · 正确 |

**完整，无遗漏。**

### 思考轮审查

| 轮 | 状态 | 审查 |
|---|---|---|
| R0 | done | 「有 message 优先原样上屏 · 本地逻辑降级 fallback」闭合 |
| R1 | done | 「done.message 不替代 output 打字机 · 仅作无 output 摘要」闭合 |
| early_stop | yes | 理由（api 方案 B 已钉 · web 仅消费优先级与边界）充分；residual（前缀叠句 / done.message 期望混淆 / 仅靠 mock）已如实列出 |

**思考轮通过**（不退回 10）。

### test_strategy 与仓 CI

| 项 | task | 审查 |
|---|---|---|
| `pnpm lint` → `pnpm test` → `pnpm build` | 与仓门禁同序 | 一致 |
| `./scripts/graph-compile.sh` | tech-graph 工作流 | 一致 |
| `task lint-wiki-delta --target .` | harness | 一致 |
| task lint | 本审查实测 **PASS**（W3 warn 合法） | 通过 |

### 与代码现状可执行性（摘要）

- **running**：`formatRunningSubtaskContent` L190–193 的 `执行中 · ` 前缀是唯一确凿行为差；抽/改一处纯函数即可，测试可锁「等于 message」或「钉死前缀规则」。
- **step**：现状已原样直出 message；增量 = 用例锁定 + 同 id 替换不堆行回归。
- **done+output**：现状 output 优先渐显、message 被忽略 —— 已是目标态；增量 = 回归用例。
- **done−output**：现状 DIRECT_KEYS 兜底已可能消费 message；增量 = message 显式优先级（对 summary/content）与用例锁定（见 N1/N2）。
- **前置/环境**：工作区当前分支已核 = `task/web-lg-rag-sse-subtask-message`（与 task 表一致，无切分支遗留风险）。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 / 00 收入定夺 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | 背景痛点#3「done 完全忽略短 message · 无 output 时错过摘要」**与源码现状不符**：`extractSubtaskDoneText` L260–264 已经 `PROGRESS_DIRECT_KEYS`（含 message）兜底，done 无 output 且帧只带 message 时**今天就会**展示该 message；对应验收条在现码下即可通过，不证明增量 | 00 收入定夺：把本 task 的 done−output 增量重新表述为「message **显式优先**于 summary/content + 测试锁定」；30 用例须含「message 与 summary/content 同帧时 message 胜出」之类的区分性断言，否则该验收条形同空转 |
| N2 | `PROGRESS_DIRECT_KEYS` 顺序为 `summary → content → message`（L141）：running/step/done−output 帧若同带 summary/content 与 message，**message 不会上屏**，与「有非空 message 原样上屏」存在优先级张力 | 30 内决：对 subtask.progress 三态将 message 提为直出首键（或新增 message 特判），并写进测试断言；注意勿影响 `node.progress` 的 `summarizeProgress` 既有行为（验收「不串台」） |
| N3 | running 定夺措辞带条件（「禁止再强制包一层『执行中 ·』**若会与成句重复**」），验收条亦留活口（「等于 message **或**钉死的极轻前缀规则」）——前缀去留未定，恰是 R1 residual | 30 开工时**必须二选一钉死**（推荐：message 非空时零前缀原样），写入验收断言；不允许实现完再回头补措辞 |
| N4 | step（现码已无前缀直出）与 done+output（现码已 output 优先）两条验收本质是**现状回归锁定**，无代码增量 | 合理保留，但 30/40 勿把「用例一次通过」误判为遗漏实现；在用例命名/注释中标注 lock-in 意图 |
| N5 | 前置（L6）与必读列表（L131）两处相对链接 `./task_web_lg_rag_sse_progressive_reveal.md` 已失效（该文件已归档 `done/`；L132 的 subtask_live 链接已正确用 `../done/`） | 文档级瑕疵，不改实质条款；00/30 落盘 wiki·图谱时可顺手修为 `../done/...` |

---

## 回填清单

无（零阻塞，无需回填 task；N1 表述修正由 00 定夺时收入即可，不强制改文）。

---

## 维护者签闸（20 后 · 30 前）

> 依 task 修订记录：「HG-AUDIT-R1 待 20 R1 落盘后 **00 代签**」（维护者授权签收后续文档）。  
> **本审查不附 30 Prompt**（`HG-AUDIT-R1` 仍为 pending）。

- [ ] 已读 R1 审查结论（本文件 · 含 N1–N5）
- [ ] （可选）就 N1/N3 收入 00 定夺：done−output 增量重述 + running 前缀钉死
- [ ] 在 task 人工闸表将 `HG-AUDIT-R1` 改为 approved（00 代签 · 日期）
- [ ] commit task 文档或确认已签（含本审查文）
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | R1 初版：pass-with-notes（0 阻塞 · 5 非阻塞 N1–N5）；lint PASS（1 合法 warn）；内容签收；流程闸待 00 依授权代签；未附 30 Prompt |
