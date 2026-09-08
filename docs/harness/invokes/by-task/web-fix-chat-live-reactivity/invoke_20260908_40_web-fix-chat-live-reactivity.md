# invoke · 40-self-check · web-fix-chat-live-reactivity

> **hat**：40  
> **日期**：2026-09-08  
> **分支**：`fix/web-chat-live-reactivity`  
> **task**：`docs/tasks/active/task_web_fix_chat_live_reactivity.md`

---

## 质量门（真跑 · 退出码实录）

| 命令 | exit | 结果 |
|---|---|---|
| `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_fix_chat_live_reactivity.md` | 0 | VERIFY: PASS（HG-AUDIT-R1 approved · 可 30） |
| `pnpm vitest run tests/chat-live-reactivity.spec.ts`（**修复前**，git stash src 复跑实录） | **1** | 2 failed / 2 · 失败断言与根因预测逐字一致（`expected 1 to be >= 4` / `expected 1 to be > 2`） |
| `pnpm vitest run tests/chat-live-reactivity.spec.ts`（修复后） | 0 | 2 passed / 2 |
| `pnpm lint` | 0 | eslint 零告警（首轮 spec mock 2 个 no-unused-vars 已修后复跑 0） |
| `pnpm test` | 0 | 23 files · **179 tests** 全过（177 既有 + 2 新增响应式回归） |
| `pnpm build` | 0 | vite build ✓（1.91s） |
| `npx --yes dsh-coding-kit task lint-wiki-delta --target .` | 0 | LINT-WIKI-DELTA: PASS（scanned 49 · missing 0 · issues 0） |
| verify（收口复跑） | 0 | VERIFY: PASS |

---

## 验收标准逐条对照（5 条）

| # | 验收 | 结论 | 证据 |
|---|---|---|---|
| 1 | 新增响应式回归测：effect 监听末条 thinking/subtasks/content，喂 mock subtask.progress（running+step+done）与 answer delta 帧后 effect 重跑且读到新值（修复前必失败） | ✅ | `tests/chat-live-reactivity.spec.ts` 用例 1：node.progress+running+step+answer delta 驱动；断言 `seen.length ≥ 4`、各阶段快照（thinking=1 / subtasks=1 / step 替换 / answer tick 后 content=「一二三」）均被 effect 观测。修复前实测 `expected 1 to be >= 4`（零重跑） |
| 2 | R1-N1 回归：done 帧带 subtask_result.output → fake timers 推进中 effect 观测 subtask block content 逐 tick 增长（修复前必失败） | ✅ | 用例 2：done 帧 `subtask_result=JSON.stringify({id,output,hits})` → REVEAL_TICK_MS 逐 tick 推进；断言 lengths 单调非降、存在严格中间态、终态 content == output 且 revealing=false。修复前实测 `expected 1 to be > 2`（lengths 恒 `[0]`） |
| 3 | 既有 pnpm test 177 全绿不回归；pnpm lint / pnpm build 绿 | ✅ | pnpm test exit 0（23 files · 179 = 177+2）；lint exit 0；build exit 0 |
| 4 | `npx --yes dsh-coding-kit task lint-wiki-delta --target .` 绿 | ✅ | exit 0 · LINT-WIKI-DELTA: PASS |
| 5 | volatile.md 短注落盘 | ✅ | `docs/coding_wiki/volatile.md` 末尾新增小节「chat 实流响应式（web-fix-chat-live-reactivity · 2026-09-08）」：根因 + 修法 + 教训 + 真值指针 |

**结论：5/5 通过。**

---

## 修复 diff 摘要（最小 · 两处处）

1. `pushMessage`：`return message` → `return messages.value[messages.value.length - 1]`（+3 行注释）。sendMessage/replay/422 预检三调用点零改动、同受惠。
2. handleEvent done 分支：`upsertSubtaskBlock(assistant, block)` 收 idx，`startSubtaskOutputReveal(assistant, assistant.subtasks[idx], text)`（+2 行注释）。upsert 整体替换语义不变。

图谱零 diff（graph_delta=无，未触碰 `docs/_tech_graph/`）。SSE 契约 / freeze `lg-rag-sse-v1` / reveal 速率常量零改动。

---

## 残余风险

- 修复为 store 层单点回流代理；若未来新增「绕过 pushMessage 自建消息对象」的写路径会重新引入同类逃逸——volatile 短注已留「store 内建对象一律经代理回流给突变方」教训。
- 实流联调（真后端 SSE 逐帧 + 浏览器渲染观测）未在本 task 内执行，以 effect 级回归替代；维护者实流点验后置。
- `ensureAnswerReveal` 闭包持有的 `assistant` 依赖调用方传入代理——修复后 live/replay 两入口均已满足（pushMessage 返回代理），无第三入口。
