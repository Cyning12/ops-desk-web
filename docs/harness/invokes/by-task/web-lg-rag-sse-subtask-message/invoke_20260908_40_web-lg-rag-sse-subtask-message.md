# invoke · 40-self-check · web-lg-rag-sse-subtask-message

> **hat**：40  
> **日期**：2026-09-08  
> **分支**：`task/web-lg-rag-sse-subtask-message`  
> **task**：`docs/tasks/active/task_web_lg_rag_sse_subtask_message.md`

---

## 质量门（真跑 · 退出码实录）

| 命令 | exit | 结果 |
|---|---|---|
| `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_subtask_message.md` | 0 | VERIFY: PASS |
| `pnpm lint` | 0 | eslint 零告警 |
| `pnpm test` | 0 | 22 files · **177 tests** 全过（chat-store.spec 65 条 · 含新增 12 条 message 用例） |
| `pnpm build` | 0 | vite build ✓ |
| `./scripts/graph-compile.sh` | 0 | 10_flow_chat OK · 全图 done |
| `npx --yes dsh-coding-kit task lint-wiki-delta --target .` | 0 | LINT-WIKI-DELTA: PASS（missing: 0 · issues: 0） |

---

## 验收标准逐条对照（9 条）

| # | 验收 | 结论 | 证据 |
|---|---|---|---|
| 1 | running + 非空 message → content == message（零前缀，测锁定） | ✅ | 用例「running + 非空 message → 原样零前缀（R1-N3 lock-in）」：`content` 全等于 message 且 `not.toContain("执行中")` |
| 2 | step + 非空 message → 即时上屏；同 subtask_id 替换不堆行 | ✅ | 用例「step + 非空 message → 原样即时上屏；同 subtask_id 后续帧替换不堆行」：subtasks 长度恒 1、content 被第二帧 message 替换 |
| 3 | 无 message 的 step/running → 本地兜底非空、不回归 progressive-reveal / #38 | ✅ | N4 lock-in 用例×3：running 兜底仍含「执行中 · rag · st-1」；空串 message 视为缺省；step 兜底仍 `retrieve · start`；既有 §10.7/progressive-reveal 用例全绿 |
| 4 | done + 长 output + 短 message → 渐显来自 output，终态 ≠ 短 message | ✅ | 用例「done + 长 output + 短 message」：block 初始 content 空 + revealing，120s 后 `content === output` 且 `!== message` |
| 5 | done + 无 output + 非空 message → 展示 message | ✅ | 用例「done + 无 output + 非空 message」：content 即时 == message，非 reveal，tick 后不被改写 |
| 6 | 与 node.progress / answer reveal 不串台 | ✅ | 用例「message 帧与 answer / node.progress 不串台」：thinking 走 summarizeProgress（summary 优先，证明 node 路径顺序未变）· subtasks 单行 message · answer delta 正常渐显 |
| 7 | pnpm lint / test / build 绿；graph-compile 绿 | ✅ | 上表 exit 全 0 |
| 8 | lint-wiki-delta 绿 | ✅ | exit 0 · PASS |
| 9 | 10_flow_chat 备注 + volatile.md 短注落盘 | ✅ | yaml description 追加 subtask-message 备注（compile 再生成 .md）；volatile.md 新增「subtask.message」小节 |

**结论：9/9 通过。**

---

## 补充区分性断言（R1-N1/N2）

- running / step / done 无 output 三态各有一条「message 与 summary（/content）同帧时 message 胜出」用例，防止 DIRECT_KEYS 顺序回退。
- node.progress 同帧 message+summary 断言 thinking 取 summary：证明 subtask 特判未污染 node 路径。

---

## 残余风险

- api 侧 message 合入前仅靠合成帧验收；实流联调后置（task 失败路径表已允许）。
- 「无 status 旧完成帧」路径仍走 `summarizeProgress`（summary→content→message），00 定夺仅钉三态，未动该路径（不回归优先）。