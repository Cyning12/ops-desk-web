# Invoke：10-task · web-lg-rag-sse-t2

> **用途**：task 需求审入口；00 签 HG-TASK-DRAFT 后执行。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t2` |
| git_branch | `task/web-lg-rag-sse-t2` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t2.md`（10 审改名对齐 slug · E7） |
| spec_path | `docs/spec/SPEC-web-lg-rag-sse-t2_v1.md` |

---

## 10 核对项

- [x] 范围 = 主 Chat lg-rag SSE · 废弃 chat stream 主路径  
- [x] 非范围 = api 改码 · T3–T6 · `/lg-rag` SSE  
- [x] freeze_id = `lg-rag-sse-v1`  
- [x] failure_paths 与 api §4.3 一致（web 视角子集；api 侧 Generation I/O 失败条目不属本仓）  
- [x] test_strategy：Vitest + 断言主 Chat **不**调 `/ops/chat/stream`  
- [x] 发版：checklist + 勿 auto-merge + 与 api 同日  

---

## 输出

- task 结构修复（10 审 · 2026-08-31 · web 00 线执行）：
  - **E7**：文件改名 `task_web_lg_rag_sse_t2_joint.md` → `task_web_lg_rag_sse_t2.md`（对齐 task_slug）；本仓 4 处链接已同步；**api 仓 2 处旧链接待 api 侧顺手修**（`05_lg_rag_transport_and_session_plan_v0.md` §10 指针 · `task_lg_rag_sse_stream_updates.md` 依赖表）
  - **E3**：补 `## 验收标准` 节（原「完成态（草案）」内容并入）
  - **E5**：补 `### 自检结论` 节（待 40 填写）
  - `npx dsh-coding-kit task lint`：**PASS**（W4 豁免：思考轮由 SPEC 承载）
- 实质条款无修订；HG-TASK-DRAFT / HG-SPEC-SIGNOFF 签收不变
- 10 审结论：task 可执行、可验收 → **交 20 R1 task-audit**
