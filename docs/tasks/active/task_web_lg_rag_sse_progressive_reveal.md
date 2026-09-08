# Task：Web · Chat 渐进揭示（subtask 输出打字机 + answer 突发帧匀速）

> **状态**：active（2026-09-08 · 维护者签收草稿 · 00 统筹 · **授权后续文档签收**）  
> **类型**：Chat UI / SSE 消费体验  
> **上游**：api `05` §4.2 / §10.4 / §10.6 / §10.7 · 实流样本（run `281b9960…` · 含 `status=step` + `subtask_result` + answer delta 突发）  
> **前置**：[`task_web_lg_rag_sse_subtask_live`](../done/task_web_lg_rag_sse_subtask_live.md) CLOSE（#38）· T5 answer delta（#28）· idle 分区（#36）  
> **并行上游（只读）**：api [`lg-rag-sse-subtask-steps`](../../../ops-desk-api/docs/tasks/active/task_lg_rag_sse_subtask_steps.md)（api 明文 **无关 web 假打字机** · 本 task 为 web 客户端渐显）  
> **分支**：`task/web-lg-rag-sse-progressive-reveal`  
> **帽子**：00 → 10 → 20 → 30+40  
> **授权**：维护者令「签收当前 task 草稿 · 00 统筹 · **授权后续文档签收**」（含 R1 审查后 `HG-AUDIT-R1` / 过程 invoke·reviews 代签；**不含**未明示的 00 亲自 30 改码）  
> **无关**：改 api · 新 event_type · markdown 渲染 · invoke 页 · 改 idle/keepalive 数值

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-lg-rag-sse-progressive-reveal` |
| **git_branch** | `task/web-lg-rag-sse-progressive-reveal` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | Cursor Task 链 · 00 统筹 |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：subtask done 解析 `output` 渐显；answer 同 tick 多 delta 仍按队列逐步露出；`content`+`final` 刷齐队列；done/abort 停队列；step 可读标签不串台；replay 加速/齐刷策略断言；`pnpm lint` → `pnpm test` → `pnpm build` |
| **code_quality_bar** | `strict` |
| **freeze_id** | `lg-rag-sse-v1`（不新 freeze · 不新 event_type） |
| **graph_delta** | `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md 备注） |
| **graph_delta_note** | 不新增一级模块；备注「客户端 reveal 队列 · subtask output 打字机」 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：reveal 队列规则 + 真值指针（本 task） |
| **wiki_promotion** | `volatile` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **close_pr_policy** | `required` |
| **related_pr** | （待开 · 勿 auto-merge） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | 22-R1 | 2026-09-08 · **00 代签** · 维护者令「签收当前 task 草稿」 |
| HG-AUDIT-R1 | approved | 30 | 2026-09-08 · **00 代签** · R1 [pass-with-notes](../../harness/reviews/task_web_lg_rag_sse_progressive_reveal_audit_R1_20260908.md) · 维护者授权后续文档签收 · N1–N5 收入定夺/30 内决 |
| HG-GRAPH-MODULES | approved | — | 00 预签：不新增一级模块 · 仅 `10_flow_chat` 备注（授权代签文档闸） |

---

## 00 实流分析（样本 run `281b9960…`）

| 阶段 | 帧 | 现状痛点 |
|---|---|---|
| 编排 | `node.progress` intent → strategy → supervisor `subtasks` | 可接受 · 本 task 不改 |
| 子任务起步 | `subtask.progress` `status=running` | #38 已立即上屏 |
| 子任务里程碑 | 多帧 `status=step`（router/retrieve/grade/answer/rewrite/evaluate · 含 retry） | 同 id 替换时摘要弱（易落成键名列表）；**短状态即时更新即可**，不必打字机 |
| 子任务完成 | `status=done` + `subtask_result`（JSON 字符串 · 含长 `output`） | **整段一次替换**；`summarizeProgress` 还可能把长串截到 80 字 · 体验差 |
| 终答 | 数百帧 `answer` `delta`（部分 **同 `ts_ms` 突发**，如 seq57–61） | store 同步 `+=`，Vue 同 tick 批绘 → **看起来仍是一块块蹦出** |
| 终帧 | `content` + `final:true` | T5 替换语义保留；须与 reveal 队列对齐（刷齐/对齐终稿） |
| 收尾 | critic + `done` | 须停止一切渐显定时器 |

**结论**：协议已有逐步 `delta` 与 subtask 过程帧；缺口在 **web 展示层**——对「同 tick 突发」与「done 一次性大包」做 **客户端 reveal 队列**，而不是再造假 SSE。

---

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| **机制名** | 客户端 **reveal 队列**（非新 SSE 事件；非 api token 化 subtask） |
| **answer** | 入站 delta **先入队**，UI 按恒定速率出队渐显；**同 tick / 同 `ts_ms` 多帧**也必须逐步露出，禁止一次刷完缓冲 |
| **answer 终帧** | `content`（含 `final:true`）→ **取消未出完队列并以终稿替换**（T5 替换语义优先；禁止终稿再 append） |
| **subtask done** | 解析 `subtask_result`（字符串 JSON）取 **`output`**（失败则降级可读摘要）→ 对该文本打字机渐显；**禁止**整段 JSON dump / 80 字截断当最终展示 |
| **subtask step** | `status=step` → **即时**可读行（如 `retrieve · start` / `grade · kept=2`）；**不做**打字机；同 `subtask_id` 更新同一行（#38 合并键沿用） |
| **subtask running** | 行为不变（立即「执行中」） |
| **速率** | **单一可测常量**（R1-N1 · 30 内决锁死数值，建议默认 60 字/秒或 rAF 每帧 ≤4 字）；须可被测断言「多帧入队后可见长度单调增且未瞬满」 |
| **replay** | **默认加速 ≥4× live**（R1-N3）；齐刷可切换；语义仍复用 `processFrame` |
| **终止** | `done` / `error` / abort → **停队列并刷齐已收缓冲**（R1-N2 · 与 failure/验收一致；非可选） |
| **SoT** | 网络态与展示态分离（R1-N4 · 30 内决落点：优先双缓冲改写现有 `content`/`subtasks[].content`，少动 ChatView）；任意时刻展示前缀 ≤ 已收；终帧/刷齐后相等 |
| **freeze** | `lg-rag-sse-v1`；零新 `event_type` |
| **模块** | 不新增一级模块；`01_modules.md` 零 diff |
| **分支** | 30 改码前须在 `task/web-lg-rag-sse-progressive-reveal`（R1-N5 · 禁 main 直改） |

---

## 背景与目标

主 Chat 在长 RAG 子任务与 aggregator 终答阶段，用户感知仍是「卡很久 → 突然一大段」。本 task 让：

1. **子任务结果**（`done.output`）打字机输出；  
2. **终答**即使 SSE 突发多条 delta，也按队列逐步露出；  
3. 终帧与流结束时展示态与契约终稿一致。

---

## 范围

- [x] `src/stores/chat.ts`（或抽出 `composables/useRevealQueue.ts`）：answer / subtask-output reveal 队列；终帧刷齐；终止刷齐
- [x] `subtask.progress`：`step` 可读摘要；`done` 解析 `output` 并渐显
- [x] `ChatView.vue`：streaming / 子任务渐显光标态（最小增量 · 沿用 T5 光标思路）
- [x] `tests/chat-store.spec.ts`（或新 spec）：突发 delta、subtask output、终帧、abort、replay 加速
- [x] `docs/_tech_graph/l1/10_flow_chat.*` 备注 + `graph-compile`
- [x] `docs/coding_wiki/volatile.md` 本 task 短注

## 非范围

- 改 `ops-desk-api` / 要求 api 为 subtask 发 token delta
- 新 SSE `event_type` / 重开 freeze
- markdown / 代码高亮
- `/lg-rag` invoke 页
- 改 idle / keepalive 数值
- 伪造尚未到达的内容（队列只能揭示 **已接收** 缓冲）

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| `subtask_result` 非 JSON / 无 `output` | 降级可读摘要（类型/status/截断预览），不抛崩；**禁止** JSON dump 当最终文案 | — | 仍有一行完成摘要 |
| 同 tick / 同 `ts_ms` 数十条 answer delta | 全部入**网络缓冲队** · UI 匀速出队 · 不丢字 · **不**一次刷满展示态 | — | 打字机感 |
| 出队追上已收缓冲（入队暂空） | 停在当前展示前缀，等下一帧入队后再续；**禁止**补造未到达字符 | — | 短暂停顿后继续 |
| 终帧 content ≠ 已收 delta 拼接 | 以终帧为准刷齐（T5 替换优先） | — | 终稿纠正 |
| 流中断 mid-reveal | abort/error → 停定时器 · 刷齐**已收**缓冲 + T4 续看语义不变 | 手动续看 | 中断提示 |
| replay 长 delta 序列 | 加速出队或齐刷（按定夺）；仍只揭示 replay 已回放缓冲 | — | 续看可完成 |
| HG-AUDIT-R1 pending 即 30 | **拒开工** | 是 | 须先 20 + 人签 |

---

## 验收标准

- [x] `status=done` 且解析 `subtask_result`（字符串 JSON）得 `output` → UI 对该 output **渐进露出**（测：中间态长度 < 终长，最终 == output；禁止整段 JSON / 80 字截断当终态）
- [x] 同一次 `processFrame` 循环连续喂 ≥5 条 answer `delta` → 展示长度 **不瞬满**；随后在 fake timers / rAF mock 下单调增至拼接全文
- [x] **SoT 分离**：任意时刻展示前缀长度 ≤ 已收缓冲长度；**禁止**发明未到达文本（客户端 reveal ≠ api/协议假流 · 与 api「无关 web 假打字机」不冲突）
- [x] `content`+`final:true` → 展示态立即 == 终稿；队列清空（T5 替换语义；禁止终稿再 append）
- [x] `done`/`error`/abort 后无残留定时器追加；推荐刷齐已收文本
- [x] `status=step` 显示可读步骤文案（即时、无打字机）；同 id 不堆重复行；与 answer 不串台
- [x] replay 路径复用同一管线且符合加速/齐刷定夺
- [x] `pnpm lint` → `pnpm test` → `pnpm build` 绿；`./scripts/graph-compile.sh` 绿
- [x] `npx --yes dsh-coding-kit task lint-wiki-delta --target .` 绿
- [x] `10_flow_chat` 备注 + `volatile.md` 短注落盘

---

## 给执行帽的必读列表

1. `AGENTS.md` · 本 task 00 定夺表  
2. [`task_web_lg_rag_sse_t5.md`](../done/task_web_lg_rag_sse_t5.md)（delta/final 分支）  
3. [`task_web_lg_rag_sse_subtask_live.md`](../done/task_web_lg_rag_sse_subtask_live.md)（running/done 合并键）  
4. `src/stores/chat.ts` · `src/views/ChatView.vue` · `tests/chat-store.spec.ts`  
5. `docs/standards/` 前端 L2（若有）· `docs/_tech_graph/l1/10_flow_chat.md`

---

## 思考轮控制

| 轮 | 状态 | reason | residual_risks |
|---|---|---|---|
| R0 | done | 实流拆解 + 痛点归因为展示层突发批绘 / done 大包 | none |
| R1 | done | 钉死 reveal 队列 · subtask 只渐显 output · step 即时 · 终帧刷齐 | 速率常量需 30 实测微调 |
| R2–R5 | early_stop | 契约不改 · 范围清晰 · 10 已收紧 failure/验收（含「只揭示已收缓冲」） | none（api「无关假打字机」= 不造协议假流；本仓客户端 reveal 已钉死） |

### R0

实流证明 api 已发 step/delta；web 同步写入导致突发批绘与 done 整包刷新。

### R1

采用接收缓冲 + 展示前缀分离；禁止发明未到达文本。

---

## 实现备忘（子 Agent 回填）

| 项 | 状态 | 备注 |
|---|---|---|
| reveal 队列 | ✅ | `useRevealQueue` · 60 字/秒 · 双缓冲改写 content |
| subtask output 解析 | ✅ | done→output 渐显；step 即时；失败降级可读摘要 |
| Vitest fake timers | ✅ | 突发不瞬满 · output 渐显 · 终帧/abort 刷齐 · step · replay 4× |
| graph / wiki | ✅ | `10_flow_chat` 备注 + volatile 短注 |

---

## test_strategy

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md
```

---

### 自检结论（执行者）

> **帽**：40-self-check · **日期**：2026-09-08 · **分支**：`task/web-lg-rag-sse-progressive-reveal`（已核）  
> **invoke**：`docs/harness/invokes/by-task/web-lg-rag-sse-progressive-reveal/invoke_20260908_40_web-lg-rag-sse-progressive-reveal.md`

#### 命令（cwd = 仓根 · 真跑）

| 命令 | 退出码 |
|---|---|
| `pnpm lint` | 0 |
| `pnpm test` | 0（22 files / **165** tests） |
| `pnpm build` | 0（vue-tsc + vite） |
| `./scripts/graph-compile.sh` | 0（OK `10_flow_chat` 等） |
| `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md` | 0（VERIFY: PASS） |
| `npx --yes dsh-coding-kit task lint-wiki-delta --target .` | 0（LINT-WIKI-DELTA: PASS） |

#### 验收摘要（10/10 pass）

| # | 验收项 | 结果 | 证据 |
|---|---|---|---|
| 1 | subtask done → output 渐显 | pass | `tests/chat-store.spec.ts`「subtask done 解析 output 渐显」· `extractSubtaskDoneText` |
| 2 | ≥5 delta 同 tick 不瞬满后单调增 | pass | 「同 tick ≥5 条 answer delta」fake timers |
| 3 | SoT：展示前缀 ≤ 已收 | pass | `RevealQueue` `shownLen ≤ received.length` · 测断言 |
| 4 | content+final 立即 == 终稿 | pass | 「终帧 content+final 立即 == 终稿」 |
| 5 | done/error/abort 刷齐无残留定时器 | pass | abort 用例 + `flushRevealQueues()` 于 done/error/abort/传输终断 |
| 6 | step 即时可读 · 同 id 合并 · 不串台 | pass | 「status=step 即时可读…」 |
| 7 | replay 同管线 · ≥4× | pass | 「replay 默认 ≥4× live」· `REVEAL_REPLAY_SPEED_MULTIPLIER=4` |
| 8 | lint/test/build/graph-compile | pass | 上表退出码全 0 |
| 9 | lint-wiki-delta | pass | 退出码 0 |
| 10 | `10_flow_chat` 备注 + `volatile.md` | pass | progressive-reveal 备注 / volatile 短注已落盘 |

#### R1-N1～N5 抽查

| note | 结果 | 证据 |
|---|---|---|
| N1 速率 60 | pass | `REVEAL_CHARS_PER_SECOND=60` · tick 50ms · 3 字/tick |
| N2 终止刷齐 | pass | `flush()` / `flushRevealQueues()` |
| N3 replay ×4 | pass | `REVEAL_REPLAY_SPEED_MULTIPLIER=4` · resume 设速 |
| N4 前缀≤已收 | pass | 双缓冲 `received` vs sink 展示 |
| N5 分支名 | pass | `git branch --show-current` → `task/web-lg-rag-sse-progressive-reveal` |

#### 已知未测项

- **未做**：浏览器实流观感（突发 delta / subtask output 打字机节奏）
- **未做**：对照真实 api step payload 键名是否与 `formatStepSubtaskContent` 假设完全一致（Vitest 用合成 payload）
- 未改 api / 新 event_type / markdown / idle；**未 commit/push**
- **建议**：可交 50 复检 / 开 PR；实流观感留给维护者点验（非阻塞）
---

### KPI（00）

（`kpi_aggregator: CLOSE` · 关账回溯填写）

---

### 经验总结

（关账时按 `experience_capture: recommended` 回填）

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-09-08 | 00 起草（实流 `281b9960…` · 归档 stale `subtask_live` active） |
| 2026-09-08 | 维护者签收草稿 · 00 统筹 · 授权后续文档签收 · HG-TASK-DRAFT=approved |
| 2026-09-08 | 10 审订措辞 · 20 R1 pass-with-notes · **00 代签 HG-AUDIT-R1** · N1–N5 收入定夺 |
| 2026-09-08 | 10-task：收紧验收/failure_paths（SoT 分离 · 禁止发明未达文本 · 入队空则停前缀）；确认 `invoke_retention_profile=default` / `required_invoke_hats=10,30,40`；定夺表未改 |
