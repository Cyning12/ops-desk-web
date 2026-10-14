# Invoke：web-lg-rag-sse-continue-reply · 30-implement（2026-10-14）

| 字段 | 值 |
|------|-----|
| **hat_id** | 30 |
| **task** | `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` |
| **分支 / HEAD** | `task/web-lg-rag-sse-continue-reply` · base `aef91f3`（本棒**未 commit**） |
| **闸核验** | 见下 GATE_VERIFY · `npx --yes spec-wave@3.3.0 verify --task …` → **VERIFY: PASS** |
| **实现范围** | F1–F5：History 半截 + `terminal_status` CTA 矩阵 + `continue_from_run_id` 传输层 + Vitest + wiki_delta；图谱 flow **n/a**（无新路由/一级模块） |
| **质量门** | 钉死 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（packageManager pnpm@10.32.1） |
| **禁区** | **未改** api 仓 · **未写**联调 joint-check · **未 commit** |

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | approved | Y | Y | ✅ |
| HG-AUDIT-R1 | approved | approved | Y | Y | ✅ |
| HG-GRAPH-MODULES | approved | approved（预判 n/a） | Y | Y | ✅ |

reviews：`task_web_lg_rag_sse_continue_reply_audit_R1_20261014.md` 存在且 R1 PASS？ **是**

pre-30 invoke：10/20/00 齐全？ **是**（本目录 `invoke_*_10_*` / `*_20_*` / `*_00_*`）

结论：**可进入读码/改码**

机械：`VERIFY: PASS · task_web_lg_rag_sse_continue_reply.md`

---

## RED → GREEN

### 红测先行（实现前）

新增/扩断言：

| 文件 | 覆盖 |
|------|------|
| `tests/lg-rag-sse.spec.ts` | TC-W3 传输：`continueFromRunId` → body `continue_from_run_id`；缺省不出现 |
| `tests/chat-store-hitl.spec.ts` | TC-W1–W4 CTA 矩阵 · 零 HITL resume · 零假 replay |
| `tests/chat-view.spec.ts` | 视图：running「生成中」无「继续回复」；error 按钮文案分词 ≠「续看」 |

RED 签名（实现前）：7 failed（`runTerminalStatus`/`allowContinueReply`/`continue_from_run_id`/`data-test` 均 undefined/false）。

### GREEN 实现

| 文件 | 改动 |
|------|------|
| `src/composables/useLgRagSse.ts` | `StreamLgRagInput.continueFromRunId` → body `continue_from_run_id` |
| `src/stores/chat.ts` | `ChatMessage` CTA 字段；`CONTINUE_REPLY_QUERY='请继续完成回答。'`；History 映射矩阵；live `error` 挂 CTA；`continueReply()` 新 stream（禁 resume/replay） |
| `src/views/ChatView.vue` | 半截 + running/failed 徽标 +「继续回复」按钮（`data-test`） |
| `docs/coding_wiki/volatile.md` | wiki_delta 短注 |
| 图谱 | **n/a**（chat 面内 CTA · 无新一级模块/路由；未改 `10_flow_*.graph.yaml`） |

**30 裁定字面**：continue 新 stream 的 `query` = `请继续完成回答。`（Vitest 钉死）；有 `continueFromRunId` 则透传，无则仍可新 stream（FP-4）。

**分词**：`续看` = T4 `resumeFromCursor`→replay；`继续回复` = `continueReply`→新 `/stream`。waiting_approval HITL **零 diff**。

---

## 质量门（TC-W5）

| 门 | 命令 | 结果 |
|----|------|------|
| lint | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm lint` | **EXIT=0** |
| test | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` | **EXIT=0 · Test Files 31 · Tests 263** |
| build | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm build` | **EXIT=0** |

**基线计数**：约 255 it（fobs 关账后）→ **263 it**（+8：lg-rag-sse +1 · chat-store-hitl +6 · chat-view +1）· 零既有红。

---

## 自检 · TC 勾选

| TC | 结果 | 证据 |
|----|------|------|
| TC-W1 History 半截 | ✅ | `chat-store-hitl` + `chat-view` · running/error answer 保留 |
| TC-W2 running 勿假续算 | ✅ | 无 `allowContinueReply` · 零 resume/replay/stream · UI 无「继续回复」 |
| TC-W3 继续回复=新 stream | ✅ | body `thread_id`+`continue_from_run_id` · 零 `resumeHitlRequest` |
| TC-W4 live worker_failed | ✅ | error 帧挂 CTA · continueReply 同 W3 |
| TC-W5 lint/test/build | ✅ | 上表 EXIT=0 · 263 绿 |
| TC-W6 过程 | ✅ 本 invoke + wiki_delta；**缺 40**（交下一帽） |
| TC-W7 非联调边界 | ✅ | 本棒无跨仓 live；关账不依赖联调 |

范围 F1–F5：✅ 全勾（图谱备注实判 **n/a**）

---

## 建议下一帽

**须派 40**：机断复跑 lint/test/build + 勾 TC-W5/W6 过程闭环；可选本机冒烟另记且失败不挡。本棒未 commit。
