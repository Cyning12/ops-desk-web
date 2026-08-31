# Invoke：10-task · web-lg-rag-sse-t4

> **用途**：task 需求审入口；00 起草并签 HG-TASK-DRAFT 后执行（web 00 线 · 维护者授权）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t4` |
| git_branch | `task/web-lg-rag-sse-t4` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t4.md` |
| spec_path | 上游承载：api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.3（W4 豁免） |

---

## 10 核对项

- [x] 范围 = 存 run cursor · 断网/刷新 replay 续看 · 同 seq 去重  
- [x] 非范围 = api 改码 · T5 token delta · T6 死代码 · C0–C4 · /lg-rag 页 · 自动 replay  
- [x] freeze_id = `lg-rag-sse-v1`（cursor 为帧内可选顶层字段 · 不新增 event_type）  
- [x] SoT 双层钉死：会话=thread_id（T3）· 续看=run_id+seq/cursor  
- [x] failure_paths：replay 404/422/401/网络错/再断/done 补发/降级全覆盖  
- [x] test_strategy：Vitest mock + lint/test/build + graph-compile  
- [x] 合入：勿 auto-merge · HG-JOINT-DEBUG（40 脚本化联调或维护者亲签）  
- [x] `### 自检结论` 占位 · `task lint` PASS（W4 豁免）  

---

## 输出

- task 可执行、可验收；与 api T4（#103 MERGED）契约 §10.3 逐条对齐  
- 00 定夺钉死：手动「续看」触发 · replay 首选 `{run_id, after_seq}` · 终态即清 active-run  
- → 交 20 R1 task-audit
