# Invoke：10-task · web-lg-rag-sse-t2

> **用途**：task 需求审入口；00 签 HG-TASK-DRAFT 后执行。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t2` |
| git_branch | `task/web-lg-rag-sse-t2` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t2_joint.md` |
| spec_path | `docs/spec/SPEC-web-lg-rag-sse-t2_v1.md` |

---

## 10 核对项

- [ ] 范围 = 主 Chat lg-rag SSE · 废弃 chat stream 主路径  
- [ ] 非范围 = api 改码 · T3–T6 · `/lg-rag` SSE  
- [ ] freeze_id = `lg-rag-sse-v1`  
- [ ] failure_paths 与 api §4.3 一致  
- [ ] test_strategy：Vitest + 不断言 chat stream  
- [ ] 发版：checklist + 勿 auto-merge + 与 api 同日  

---

## 输出

- 更新 task 状态 / 人工闸（若 10 有修订建议交 00 签）
