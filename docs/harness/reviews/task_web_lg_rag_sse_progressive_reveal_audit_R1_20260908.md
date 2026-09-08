# Task Audit R1：web-lg-rag-sse-progressive-reveal

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md`（task lint **PASS** · 本审查实测）  
> **SPEC**：api 契约 freeze `lg-rag-sse-v1`（不新开 freeze · 不新增 event_type）；本仓展示层 reveal 队列，不改协议  
> **SPEC 审查**：不在本审查范围  
> **上游**：web subtask_live CLOSE（#38）· T5 answer delta（#28）· idle 分区（#36）；api 并行轨 `lg-rag-sse-subtask-steps`（只读 · 明文无关 web 假打字机）  
> **日期**：2026-09-08  
> **审查人**：20-task-audit（R1）  
> **git_branch（task 表）**：`task/web-lg-rag-sse-progressive-reveal`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**不**改 `src/`

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-sse-progressive-reveal` |
| freeze_id | `lg-rag-sse-v1`（沿用 · 零新 event_type） |
| test_strategy | `required`（Vitest：subtask output 渐显 · 同 tick 多 delta 不瞬满 · 终帧/abort 刷齐 · step 不串台 · replay 加速/齐刷；lint/test/build · graph-compile · wiki-delta） |
| required_invoke_hats | `10,30,40`（不含 20 → 无需 invoke_20；本审查以 reviews 落盘为硬闸） |
| invoke_retention_profile | `default`（与 10 invoke 一致） |
| graph_delta | `10_flow_chat` 备注 update；不新增一级模块（`01_modules.md` 零 diff） |
| wiki_delta | `docs/coding_wiki/volatile.md`（短注 + 真值指针） |
| code_quality_bar | `strict` |
| 思考轮 | R0/R1 done · R2–R5 early_stop（理由/residual 闭合） |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats / graph_delta / wiki_delta / test_strategy=required / 人工闸表三行齐 / close_pr_policy=required · related_pr「待开 · 勿 auto-merge」自洽。**通过。**

10 已审订：`docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_20260908_10_web-lg-rag-sse-progressive-reveal.md`（核对项全勾 · lint PASS · 未改定夺表 · 未签 HG-AUDIT-R1）。

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-TASK-DRAFT** | **approved**（00 代签 · 2026-09-08） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（同 T5 R1 先例） |
| **HG-GRAPH-MODULES** | **approved**（00 预签 · 授权代签文档闸） | **—** | graph_delta 仅 `10_flow_chat` 备注、不新增一级模块；已预签，不阻塞 30（见 N5） |
| **HG-AUDIT-R1** | **pending** | **30** | **保持 pending**；本帽不签发；task 表已注明「待 20-task-audit R1 pass 后 **00 代签**」 |

blocks_hats 方向正确（AUDIT 挡 30）。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围/非范围自洽；00 定夺与验收/failure_paths 可勾选可断言；思考轮闭合；与代码现状可执行（痛点属实 · 改造点明确）；与 api「无关假打字机」不冲突（只揭示已收缓冲） |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。30 **不可**开工，直至 00 在 task 表签 `approved`。本审查**不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 5 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 00 签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照代码现状已核）

| 项 | task | 审查 |
|---|---|---|
| `src/stores/chat.ts`（或抽出 `useRevealQueue.ts`）：answer / subtask-output reveal 队列；终帧刷齐；终止刷齐 | 改造点 | 现状已核：`answer` 分支对 `delta` **同步** `assistant.content +=`（约 L410–411）；同 tick 多帧入 store 后 Vue 批绘 → 「一块块蹦出」痛点属实。`subtask.progress` 非 `running` 一律 `summarizeProgress`（约 L376–379）；`subtask_result` 走 DETAIL 键 → `JSON.stringify` + **80 字截断**（约 L161）→ done 大包体验差属实。无 reveal 队列 / SoT 分离 —— 正是本 task 增量点；抽出 composable 与否由范围措辞允许 |
| `subtask.progress`：`step` 可读即时摘要；`done` 解析 `output` 并渐显 | 增量 | 现状：仅 `running` 特判 `formatRunningSubtaskContent`；`step`/`done` 未分支 —— 可执行缺口清晰。合并键 `extractSubtaskBlockId`（#38）可沿用 |
| `ChatView.vue`：streaming / 子任务渐显光标态（最小增量 · 沿用 T5） | 最小 UI | 现状已核：T5 光标态 `.chat-message__text--streaming::after` 已落；subtasks 区渲染 `block.content` —— 展示态进 content/subtasks 字段后 UI 自然跟上；光标可复用或轻扩至 subtask 行 |
| `tests/chat-store.spec.ts`：突发 delta、subtask output、终帧、abort、replay | 扩展现有 | 现状已核：T5 describe 已手工喂帧 / replay mock；**尚无** fake timers /「同 tick ≥5 delta 不瞬满」断言 —— 验收可落地为新增用例 |
| G-L1 | `10_flow_chat.*` 备注 + graph-compile | yaml/md 已核存在（T2–T5 备注串）；须改 yaml 再 compile，不得手改 .md |
| wiki_delta | `volatile.md` 短注 | 文件已核存在 |

### 非范围

| 非范围条目 | 审查 |
|---|---|
| 改 api / 要求 api 为 subtask 发 token delta | ✓；与并行上游「无关 web 假打字机」正交 |
| 新 SSE event_type / 重开 freeze | ✓；freeze 钉死 `lg-rag-sse-v1` |
| markdown / 代码高亮 | ✓；`ChatMessage.content` 纯文本现状保留 |
| `/lg-rag` invoke 页 | ✓ |
| 改 idle / keepalive 数值 | ✓（前置 idle task 已 CLOSE） |
| 伪造尚未到达的内容 | ✓；与 SoT / 验收「禁止发明未达文本」闭合 |

**无漏项。**

### failure_paths

| 触发 | task 期望 | 审查 |
|---|---|---|
| `subtask_result` 非 JSON / 无 `output` | 降级可读摘要；禁止 JSON dump 当终态 | 可断言；对齐痛点与定夺 |
| 同 tick / 同 `ts_ms` 数十条 answer delta | 入队 · 匀速出队 · 不丢字 · 不瞬满展示态 | 可 Vitest + fake timers/rAF mock |
| 出队追上缓冲（入队暂空） | 停前缀 · 等后续入队 · 禁止补造 | 与 SoT 一致 |
| 终帧 content ≠ delta 拼接 | 以终帧为准刷齐（T5 替换优先） | 与现状 T5 content 替换同构；reveal 层须清队列 |
| 流中断 mid-reveal | 停定时器 · 刷齐已收 + T4 续看不变 | 可执行；与定夺「推荐刷齐」同向（见 N2） |
| replay 长序列 | 加速或齐刷；只揭示已回放缓冲 | 定夺允许二选一（默认加速） |
| HG-AUDIT-R1 pending 即 30 | 拒开工 | 流程自检行 · 正确 |

**完整，无遗漏。**

### 00 定夺内部一致性

| 钉死项 | 与范围/验收/failure | 审查 |
|---|---|---|
| 客户端 reveal 队列（非新 SSE） | 范围/非范围/freeze | 一致 |
| answer 入队匀速出队；同 tick 亦逐步 | 验收「≥5 delta 不瞬满」 | 一致 |
| 终帧 content → 取消队列 + 终稿替换 | T5 替换优先 · 禁止 append | 一致 |
| subtask done 只渐显 `output` | 禁止 JSON dump / 80 字截断当终态 | 一致；正打现状 `summarizeProgress` |
| step 即时可读 · 无打字机 | 与 answer/done 渐显分流 | 一致 |
| running 不变 | #38 行为保留 | 一致 |
| 速率可测常量 · 30 可微调 | test_strategy_note | 一致（见 N1） |
| replay 加速或齐刷 | failure/验收 | 一致（见 N3） |
| 终止停队列 · 推荐刷齐 | failure 写「刷齐」 | 同向（见 N2） |
| SoT：网络态 ≠ 展示态 | 验收前缀 ≤ 缓冲 | 一致；与 api「假打字机」不冲突 |
| freeze / 模块 | 零新 event_type · `01_modules` 零 diff | 一致 |

### 思考轮审查

| 轮 | 状态 | 审查 |
|---|---|---|
| R0 | done | 实流归因展示层 · 闭合 |
| R1 | done | 钉死 reveal · step/done 分流 · residual=速率 30 微调 · 可接受 |
| R2–R5 | early_stop | 理由（契约不改 · 范围清晰 · 10 已收紧）充分；residual 已释「假打字机」歧义 |

**思考轮通过**（不退回 10）。

### test_strategy 与仓 CI

| 项 | task | 审查 |
|---|---|---|
| `pnpm lint && pnpm test && pnpm build` | 与仓门禁同序 | 一致 |
| `./scripts/graph-compile.sh` | tech-graph 工作流 | 一致 |
| `dsh-coding-kit verify --task …` | harness | 一致 |
| task lint | 本审查实测 **PASS** | 通过 |

### 与代码现状可执行性（摘要）

- **Answer**：T5 已交付网络态 delta 追加；缺展示态队列 → 本 task 在 `processFrame` 入站与 UI 绑定之间插入缓冲/出队即可，不必改 SSE 封装。  
- **Subtask**：合并键与 running 文案已有；补 `step` 格式化 + `done` 解析 `subtask_result.output` + 对该串入 reveal。  
- **ChatView**：T5 光标可复用；subtask 行随 `block.content` 更新即可。  
- **Tests**：现有 mock 帧注入模式可扩展；须加 fake timers / 单调长度断言。  
- **前置 task**：`task_web_lg_rag_sse_t5.md` / `task_web_lg_rag_sse_subtask_live.md` 已在 `done/`（文件头已核）。

---

## 阻塞 / 非阻塞

### 阻塞 issue

**无（0）。**

### 非阻塞 note（30 内决 · 不退回 10）

| # | note | 建议 |
|---|---|---|
| N1 | 速率钉「~40–80 字/秒或 rAF 每帧 ≤N 字」——区间未锁单一常量 | 30 选一可测常量并写入测试断言；微调不改条文 |
| N2 | 定夺终止写「可选刷齐（推荐）」；failure_paths / 验收偏「刷齐已收」 | 30 按 failure/验收做 **abort/error/done → 刷齐已收缓冲 + 清定时器**；与推荐一致 |
| N3 | replay「加速（≥4×）或齐刷可配置」——默认加速未落代码常量名 | 30 内决默认加速路径 + 至少一条 Vitest；齐刷作可切换即可 |
| N4 | SoT 分离的落点（独立 display 字段 vs 双缓冲改写 `content`/`subtasks[].content`）未钉 | 30 内决；须保证任意时刻展示前缀 ≤ 已收，且终帧/刷齐后相等；优先少动 ChatView 绑定 |
| N5 | 审查时工作区当前分支为 `main`，task 表目标为 `task/web-lg-rag-sse-progressive-reveal` | **30 改码前必须切到 task 分支**（AGENTS 纪律）；本 note 不挡内容签收 |

---

## 回填清单

无（零阻塞，无需回填 task）。

---

## 维护者签闸（20 后 · 30 前）

> 依 task 人工闸表 `HG-AUDIT-R1` 行：「待 20-task-audit R1 pass 后 **00 代签**」（维护者授权后续文档签收）。  
> **本审查不附 30 Prompt**（`HG-AUDIT-R1` 仍为 pending）。

- [ ] 已读 R1 审查结论（本文件）
- [ ] 在 task 人工闸表将 `HG-AUDIT-R1` 改为 approved（00 代签 · 日期）
- [ ] commit task 文档或确认已签（含本审查文）
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | R1 初版：pass-with-notes（0 阻塞 · 5 非阻塞）；内容签收；流程闸待 00 依授权代签；未附 30 Prompt |
