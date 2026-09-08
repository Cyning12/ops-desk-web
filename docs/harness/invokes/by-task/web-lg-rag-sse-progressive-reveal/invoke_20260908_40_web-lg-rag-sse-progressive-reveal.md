# invoke · 40-self-check · web-lg-rag-sse-progressive-reveal

> **hat**：40  
> **日期**：2026-09-08  
> **分支**：`task/web-lg-rag-sse-progressive-reveal`（`git branch --show-current` 已核）  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md`  
> **上游 30**：`invoke_20260908_30_web-lg-rag-sse-progressive-reveal.md`

---

## 元信息

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-progressive-reveal` |
| git_branch | `task/web-lg-rag-sse-progressive-reveal` |
| created | 2026-09-08 |

---

## 命令真跑（cwd = 仓根）

| 命令 | 退出码 | 摘要 |
|---|---|---|
| `pnpm lint` | 0 | eslint . PASS |
| `pnpm test` | 0 | 22 files / **165** tests passed（含 progressive-reveal 专例） |
| `pnpm build` | 0 | vue-tsc --noEmit + vite build |
| `./scripts/graph-compile.sh` | 0 | OK `10_flow_chat` 等；`01_modules.md` 无本 task 一级模块 diff |
| `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_progressive_reveal.md` | 0 | VERIFY: PASS · HG-AUDIT-R1=approved |
| `npx --yes dsh-coding-kit task lint-wiki-delta --target .` | 0 | LINT-WIKI-DELTA: PASS · missing 0 |

---

## 验收标准（逐条 · 须证据）

| # | 验收项 | pass/fail | 证据 |
|---|---|---|---|
| 1 | subtask done → `output` 渐进露出；终态 == output；禁 JSON dump | **pass** | `tests/chat-store.spec.ts`「subtask done 解析 output 渐显」：中间态长度小于终长 → 终态 == output；「无 output 降级」不 dump JSON |
| 2 | ≥5 条 answer delta 同 tick 不瞬满，后单调增至全文 | **pass** | 「同 tick ≥5 条 answer delta」：入队后 content.length=0；fake timers 单调非降至 full |
| 3 | SoT：展示前缀 ≤ 已收；禁发明未达文本 | **pass** | `useRevealQueue.ts`：`shownLen = min(received.length, …)`；sink 仅 `received.slice(0, shownLen)` |
| 4 | `content`+`final:true` → 立即 == 终稿；队列清空 | **pass** | 「终帧 content+final 立即 == 终稿」+ 后续 tick 不追加；`RevealQueue.replace` |
| 5 | done/error/abort 无残留定时器；刷齐已收 | **pass** | abort 用例刷齐后 120s 不变；`flushRevealQueues` 于 done/error/abort/传输终断 |
| 6 | step 即时可读；同 id 合并；与 answer 不串台 | **pass** | 「status=step…」：`retrieve · start` → `grade · kept=2`；subtasks.length=1；answer 未出队时 content 空 |
| 7 | replay 同管线且 ≥4× | **pass** | resume 设 `REVEAL_REPLAY_SPEED_MULTIPLIER`；「replay 默认 ≥4×」1 tick → 12 字 |
| 8 | lint → test → build；graph-compile | **pass** | 上表退出码全 0 |
| 9 | lint-wiki-delta | **pass** | 退出码 0 |
| 10 | `10_flow_chat` 备注 + `volatile.md` 短注 | **pass** | yaml/md 含 `progressive-reveal…useRevealQueue · 60 字/秒`；volatile 本 task 短注 |

**结论：验收 10/10 pass**

---

## R1-N1～N5 抽查

| note | 期望 | 结果 | 证据 |
|---|---|---|---|
| N1 | `REVEAL_CHARS_PER_SECOND=60` | **pass** | `useRevealQueue.ts` L7–16；测「速率常量锁死」 |
| N2 | 终止刷齐已收 | **pass** | `flush()` + store `flushRevealQueues` |
| N3 | replay ≥4× | **pass** | `REVEAL_REPLAY_SPEED_MULTIPLIER=4`；`resumeFromCursor` 设速 |
| N4 | 展示前缀 ≤ 已收 | **pass** | 双缓冲 `received` / `shownLen`；测 SoT 断言 |
| N5 | 分支名正确 | **pass** | `task/web-lg-rag-sse-progressive-reveal` |

---

## 代码落点（抽查）

- `src/composables/useRevealQueue.ts` — 队列常量 + enqueue/replace/flush
- `src/stores/chat.ts` — answer 入队；subtask step/done 分流；终帧/终止刷齐；replay ×4
- `src/views/ChatView.vue` — `revealing` 光标态（最小增量）
- `tests/chat-store.spec.ts` — `describe('progressive-reveal · …')`
- `docs/_tech_graph/l1/10_flow_chat.*` · `docs/coding_wiki/volatile.md`

---

## 已知未测项

1. **浏览器实流观感**（突发 delta 批绘是否仍「一块块」；subtask output 60 字/秒体感）— 本帽未起 dev + 实流点验  
2. **真实 api `status=step` payload 键**是否与 `formatStepSubtaskContent`（`step`/`action`/`kept` 等）完全一致 — 仅 Vitest 合成帧  
3. 未改人工闸表；未 commit/push；未扩 scope 改码

---

## 交接建议

| 项 | 结论 |
|---|---|
| 可交 50？ | **是** — 命令全绿 · 验收全 pass |
| 需回 30？ | **否** |
| 建议下一棒 | 50 复检 → CLOSE/开 PR（`close_pr_policy=required` · 勿 auto-merge）；实流观感可由维护者点验（非阻塞） |

---

## task 回填

- [x] `### 自检结论（执行者）` 已由本帽回填（命令+退出码+验收摘要+未测项）
- [x] 验收标准勾选已与证据对齐（10/10）
