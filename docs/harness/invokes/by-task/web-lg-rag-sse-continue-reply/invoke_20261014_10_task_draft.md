# Invoke：web_lg_rag_sse_continue_reply · 10-task 起草（2026-10-14）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10-task |
| **task** | `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md` |
| **分支 / HEAD** | `task/web-lg-rag-sse-continue-reply`（已存在 · 本棒落稿 · **未切新分支**） |
| **来源** | api D3：`task_lg_rag_sse_run_worker` 须同步开 web · 方案 `invoke_20261014_00_e3_wave_b_plan.md` · 00 派 web-10 |
| **cwd** | `ops-desk-web`（未改 api） |

## 委派目标 → task 映射

| 目标 | task 落点 |
|------|-----------|
| History 半截可见 | F1 · TC-W1 |
| running 勿假续算 | F2 · TC-W2 |
| error/worker_failed →「继续回复」= 同 thread 新 `/lg-rag/stream` + 可选 `continue_from_run_id` | F3/F4 · TC-W3/W4 |
| 禁 HITL resume | 非范围 + FP-3 + TC-W3 spy |
| 关联 api run_worker（B6/B3/B5 PASS）· 旧 disconnect 只指针 | 依赖表 · 非范围 |
| 闸 pending · R0–R5 · failure_paths · 验收可机断 · 非联调 | 元信息/闸表/思考轮/TC-W7 |

## 亲读核真锚点（10 已读）

- `src/api/chatHistory.ts` — `terminal_status`  
- `src/stores/chat.ts` — `mapHistoryRunsToMessages` / `openHistoryThread` / error 清 activeRun / `resumeFromCursor` / `sendMessage`  
- `src/composables/useLgRagSse.ts` — `streamLgRag` body 无 `continue_from_run_id`  
- `src/views/ChatView.vue` — 「续看」= replay  
- 只读 api：`../ops-desk-api/docs/tasks/active/task_lg_rag_sse_run_worker.md`  
- 只读方案：`../ops-desk-api/docs/harness/invokes/by-task/lg-rag-sse-disconnect-completion/invoke_20261014_00_e3_wave_b_plan.md`

## 闸状态（起草时）

| 闸 | status |
|----|--------|
| HG-TASK-DRAFT | **pending** |
| HG-AUDIT-R1 | **pending**（不代签） |
| HG-GRAPH-MODULES | **pending**（预判 n/a） |

→ **30 拒开工**

## 交付物

- [x] `docs/tasks/active/task_web_lg_rag_sse_continue_reply.md`
- [x] 本 invoke
- [x] `docs/tasks/active/README.md` 行
- [x] `task lint` PASS

## 机检

```text
npx spec-wave task lint --file docs/tasks/active/task_web_lg_rag_sse_continue_reply.md
→ LINT: PASS · EXIT=0（2026-10-14）
```


## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-14 | 10 落稿：task v0 + invoke + README · **未 commit** · **未改 api/src** |
