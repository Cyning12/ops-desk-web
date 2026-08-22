# Invoke：CLOSE · web-lg-rag-page

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | CLOSE（00 统筹） |
| task_slug | `web-lg-rag-page` |
| git_branch | `task/web-lg-rag-page` |
| created_utc_or_local | 2026-08-21 |

---

## CLOSE 流水账

1. **HG-SPEC-SIGNOFF** approved（00 代签）· SPEC draft→signed · §0 签收注记冻结 `/lg-rag` + 侧栏「LG RAG」+ mock 先行
2. **HG-TASK-DRAFT** approved（00 代签）· task draft→active
3. **HG-GRAPH-MODULES** approved（00 预签 · 对齐 lc-evidence 先例 · 40 graph-compile 验证通过）
4. 20 审：`spec_web-lg-rag-page_audit_R1_20260821.md`（**pass**）+ `task_web_lg_rag_page_audit_R1_20260821.md`（**pass-with-notes** · 0 阻塞 · N1–N3 已修 · N4/N5 不挡）
5. **HG-AUDIT-R1** approved（00 代签 · 依 task R1）→ GATE_VERIFY → **VERIFY: PASS**
6. 30 实现（子 Agent `7a695abe`）：新页 `/lg-rag` + `api/lgRag.ts`（timeout 300s · 仅本文件拆 {ok,data}）+ store + 接线 + Vitest 17 例；commit `64db791`
7. 40：四项 exit 0（00 独立复验 107/107）
8. task → `docs/tasks/done/task_web_lg_rag_page.md` · 完成态与验收全勾 · 修订记录追加 CLOSE 行

## 经验捕获（experience_capture=recommended）

- **子 Agent 长任务需「分段落盘」纪律**：首轮 20 审与 30 均出现「长时在途零落盘」观测；nudge「每文件立即写盘」有效。后续派发大帽时直接在 Prompt 内置该节奏。
- **观测校准**：30 的「零落盘」部分为观测误差（find -newermt 窗口与写盘时间错位）；核验进度应 git status + find 双轨。
- mock 契约先行模式第二次闭环成功（lc-evidence → lg-rag），增量三件套（mode/thread_id/≥300s 超时）全部落入验收与 failure_paths。
