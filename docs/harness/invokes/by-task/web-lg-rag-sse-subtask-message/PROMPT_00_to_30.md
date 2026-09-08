# PROMPT · 00 → 30+40 · web-lg-rag-sse-subtask-message

> 本文件为 00 派 30+40 的交接 Prompt 留档；R1 notes（若有）在派发时并入口径。

## 身份与边界

你是 30+40 帽（实现 + 自检）。工作目录 `/Users/cyning/Desktop/Ops-desk/ops-desk-web`，分支必须为 `task/web-lg-rag-sse-subtask-message`（已切好，先 `git branch --show-current` 核对）。

## GATE_VERIFY（首输出 · 真值在 task 人工闸表）

```bash
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_subtask_message.md
```

首输出闸扫描表（FRAGMENT_30_gate_verify）：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 须全 approved；reviews R1 文存在。任一不符 → 停，零 diff 报 00。

## 必读（按序）

1. `AGENTS.md` · 本 task 00 定夺表
2. `docs/tasks/active/task_web_lg_rag_sse_subtask_message.md`（定夺 / 验收 / 失败路径全遵照）
3. api task `../ops-desk-api/docs/tasks/active/task_lg_rag_sse_subtask_message.md` · api 05 §10.7（message 落盘后口径）
4. `docs/tasks/done/task_web_lg_rag_sse_progressive_reveal.md` · `docs/tasks/done/task_web_lg_rag_sse_subtask_live.md`
5. `src/stores/chat.ts`（`formatRunningSubtaskContent` / `formatStepSubtaskContent` / `extractSubtaskDoneText` / `processFrame`）· `tests/chat-store.spec.ts` · `src/composables/useRevealQueue.ts`

## 实现要点（task 00 定夺为准）

- 有非空 `payload.message` → running/step 过程行**原样**即时上屏（不再套「执行中 ·」叠句；step 无打字机 · 同 subtask_id 替换不堆行）
- 无 `message` / 空串 → 现有本地兜底（formatRunning/Step）不回归
- done + 有 `output`：仍 progressive-reveal 渐显 output，短 message **不得**覆盖/截断/替代
- done + 无 output：优先非空 message 作完成摘要，再降级 `extractSubtaskDoneText`；禁止 JSON dump
- 与 `node.progress` / answer reveal 不串台；必要时抽小纯函数便于测

## 交付物

1. `src/stores/chat.ts` 改造 + Vitest（有/无 message、done±output、同 id 合并替换、与 answer 不串台）
2. `docs/_tech_graph/l1/10_flow_chat.graph.yaml`（及 .md）备注「subtask.progress 优先 payload.message」
3. `docs/coding_wiki/volatile.md` 短注
4. invoke：`invoke_20260908_30_web-lg-rag-sse-subtask-message.md`（含 GATE_VERIFY 表）与 `invoke_20260908_40_*.md`（40 自检回填 task「自检结论」节）

## 质量门（全真跑，逐条给退出码）

```bash
pnpm lint && pnpm test && pnpm build
./scripts/graph-compile.sh
npx --yes dsh-coding-kit task lint-wiki-delta --target .
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_subtask_message.md
```

## 收口

commit（conventional，题头 `feat(chat): ...`）→ push origin `task/web-lg-rag-sse-subtask-message`。**不开 PR**（00 收口开）。回报 ≤10 行：改动文件清单 / 测试结果 / 验收勾选情况 / 残余风险。
