# Invoke：10-task · web-lg-rag-page

> **用途**：10-task 开局指令快照（把已签收 SPEC 写成可执行 task）。
> **说明**：SPEC 与 task 草稿由 00 线同一波产出（2026-08-21）；本 invoke 为过程留痕快照。

---

## 元信息表（必填）

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-lg-rag-page` |
| freeze_id | `lg-rag-http-v1` |
| task_paths | `docs/tasks/active/task_web_lg_rag_page.md` |
| related_review_or_none | `docs/harness/reviews/task_web_lg_rag_page_audit_R1_20260821.md`（20 审进行中，产出后回填存在性） |
| git_branch | `task/web-lg-rag-page` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-21 |
| notes | 照搬 task_web_lc_evidence_page 已闭环「web 切片 + mock 契约先行」模式；增量 = mode 三档 / thread_id 续写 / ≥300s 超时；不实现代码；不签发 HG-AUDIT-R1 |

---

## 可复制 Prompt 快照

````text
你是 ops-desk-web 仓的 10-task Agent。Open Folder = 本仓根。分支 task/web-lg-rag-page。

身份与禁止
- 把已签收 SPEC-web-lg-rag-page_v1 写成可执行、可验收的 task。
- 不实现代码、不改 Vue/CI、不改 SPEC 实质条款；不签发 HG-AUDIT-R1。

必读
1. docs/spec/SPEC-web-lg-rag-page_v1.md（00 签收注记=实现冻结点）
2. docs/harness/prompts/10-task-requirements.md
3. 对照样例：docs/tasks/done/task_web_lc_evidence_page.md
4. docs/_tech_graph/l1/01_modules.md
5. 现网：src/router/index.ts、src/layouts/AppLayout.vue、src/api/http.ts、src/api/lcEvidence.ts、tests/http.spec.ts

必须产出：docs/tasks/active/task_web_lg_rag_page.md
- task_slug=web-lg-rag-page · freeze_id=lg-rag-http-v1 · test_strategy=required
- code_quality_bar=L2_frontend · graph_change_layer=G-L1（只改 01_modules.md pages 备注，不新增一级模块）
- required_invoke_hats=10,30,40 · thinking_profile=shortest（预置 R0+R1–R3 与思考轮控制表）
- 人工闸：HG-GRAPH-MODULES / HG-TASK-DRAFT / HG-AUDIT-R1 起草时全 pending 待人审
- 完成态（未勾）：路由 /lg-rag 需登录、api/lgRag.ts（timeout≥300000、仅本文件拆 {ok,data}）、stores/lgRag.ts、views/LgRagView.vue、Vitest mock 绿、lint/test/build 绿、G-L1 备注 + graph-compile 绿
````
