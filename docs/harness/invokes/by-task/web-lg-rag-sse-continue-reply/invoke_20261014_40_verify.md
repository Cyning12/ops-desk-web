# Invoke：web-lg-rag-sse-continue-reply · 40-verify（2026-10-14）

| 字段 | 值 |
|------|-----|
| **hat_id** | 40 |
| **task** | `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` |
| **分支 / HEAD** | `task/web-lg-rag-sse-continue-reply` · base `aef91f3`（**未 commit** · 与 30 同工作树） |
| **上游 30** | `invoke_20261014_30_implement.md`（F1–F5 · History CTA + `continue_from_run_id`） |
| **禁区** | **未改** api · **未做**跨仓 live · **未 commit** · **零**实现码改动（本帽仅自检+落盘） |

## 人工闸扫描（GATE_VERIFY · 亲读 task 表）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 备注 |
|---------------|--------------|-----------------|--------|-----------|------|
| HG-TASK-DRAFT | approved | approved | Y | Y | 00 代录 |
| HG-AUDIT-R1 | approved | approved | Y | Y | R1 PASS · 审查文在册 |
| HG-GRAPH-MODULES | approved | approved（n/a） | Y | — | 30 实判 flow 备注 n/a |

reviews：`task_web_lg_rag_sse_continue_reply_audit_R1_20261014.md` 存在？ **是**

pre-30 invoke：10/20/00 齐全？ **是** · 本棒补齐 **40**

结论：闸态与 30 一致 · **自检可跑**

---

## 命令真跑（cwd = ops-desk-web 仓根 · 钉死路径）

钉死：`$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` → **pnpm@10.32.1** · node **v24.15.0**

| 命令 | 退出码 | 摘要 |
|------|--------|------|
| `pnpm lint` | **0** | eslint . PASS |
| `pnpm test` | **0** | Test Files **31** · Tests **263** passed（与 30 基线一致 · 零既有红） |
| `pnpm build` | **0** | vue-tsc --noEmit + vite build PASS |
| `npx --yes spec-wave@3.3.0 verify --target . --task docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` | **0** | **VERIFY: PASS** · 三闸 approved |
| `npx --yes spec-wave@3.3.0 task lint --file docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` | **0** | **LINT: PASS**（W1 状态 token warn 非阻塞） |

---

## 验收标准（逐条 · 40 独立核对）

| TC | pass/fail | 证据 |
|----|-----------|------|
| TC-W1 History 半截 | **pass** | `tests/chat-store-hitl.spec.ts`「TC-W1：running\|error 半截」+ `chat-view` 视图 it · answer 保留 |
| TC-W2 running 勿假续算 | **pass** | `allowContinueReply` falsy · 零 resume/replay/stream · UI 无「继续回复」· 徽标「生成中」 |
| TC-W3 继续回复=新 stream | **pass** | body `thread_id`+`continue_from_run_id` · query=`请继续完成回答。` · 零 `resumeHitlRequest` · `lg-rag-sse` 传输层 it |
| TC-W4 live worker_failed | **pass** | live `error.stage=lg_rag.worker_failed` 挂 CTA · continueReply 同 W3 |
| TC-W5 lint/test/build | **pass** | 上表 EXIT=0 · **263** it |
| TC-W6 过程 | **pass** | invoke 10/20/30/**40** 齐全 · `wiki_delta` 短注已落 · task lint PASS（本棒勾） |
| TC-W7 非联调边界 | **pass** | task/30/本 invoke 明示关账不依赖跨仓 live · 本棒未做 live |

**分词抽查**：`续看`=`resumeFromCursor`→replay（ChatView 既有按钮）≠ `继续回复`=`continueReply`→新 `/stream`（`data-test` / `allowContinueReply`）≠ HITL resume。`CONTINUE_REPLY_QUERY='请继续完成回答。'` 字面与 Vitest 钉死一致。

**范围 F1–F5**：与 30 交付一致 · 图谱 flow **n/a** 维持。

---

## 已知未测项

1. 跨仓 live 冒烟（task 钉非硬关账 · 可选另记）
2. 浏览器实点 History CTA 体感（机断 Vitest 已过）

---

## 自检结论

| 项 | 结果 |
|----|------|
| verdict | **PASS** |
| 阻塞 | **无** |
| 下一棒 | 00/维护者：commit → PR+CI → CLOSE（本帽未 commit） |

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-14 | 40 独立复跑 lint/test/build + verify PASS · TC-W1–W7 全 pass · 勾 TC-W6 · 未改 src · 未 commit |
