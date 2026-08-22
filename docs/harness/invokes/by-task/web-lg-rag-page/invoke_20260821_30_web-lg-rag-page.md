# Invoke：30（含 40 自检）· web-lg-rag-page

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40 自检） |
| task_slug | `web-lg-rag-page` |
| freeze_id | `lg-rag-http-v1` |
| task_paths | `docs/tasks/active/task_web_lg_rag_page.md` |
| related_review_or_none | `docs/harness/reviews/task_web_lg_rag_page_audit_R1_20260821.md`（pass-with-notes）· `docs/harness/reviews/spec_web-lg-rag-page_audit_R1_20260821.md`（pass） |
| git_branch | `task/web-lg-rag-page` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-21 |
| notes | 00 已签三闸；VERIFY: PASS；禁止 CLOSE / push / git add -A / 提交 .codex/ |

---

## 人工闸扫描（GATE_VERIFY · 首输出）

机械：`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_page.md` → **VERIFY: PASS**（exit 0 · 2026-08-21）

| human_gate_id | task表status | blocks_30 | 30可开工？ |
|---------------|--------------|-----------|------------|
| HG-TASK-DRAFT | approved（00） | 22-R1 | Y |
| HG-AUDIT-R1 | approved（00 · 依 R1 pass-with-notes） | Y | Y |
| HG-GRAPH-MODULES | approved（00 代签预签） | — | Y |

reviews：SPEC R1（pass）+ task R1（pass-with-notes）存在且通过。pre-30 invoke：10 + 00 齐。

结论：**可进入读码/改码**。

---

## 可复制 Prompt 快照

见派发子 Agent 的 30 Prompt（本仓根 · 分支 task/web-lg-rag-page）：范围=新页 /lg-rag + api/lgRag.ts + stores/lgRag.ts + 接线 + Vitest mock + G-L1 备注；禁 Chat SSE；本 client timeout≥300000；40 自检 lint/test/build/graph-compile。
