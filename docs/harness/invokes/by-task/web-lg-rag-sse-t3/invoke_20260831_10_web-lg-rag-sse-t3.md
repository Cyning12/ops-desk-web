# Invoke：10-task · web-lg-rag-sse-t3

> **用途**：task 需求审入口；00 起草并签 HG-TASK-DRAFT 后执行（web 00 线 · 维护者授权）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t3` |
| git_branch | `task/web-lg-rag-sse-t3` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t3.md` |
| spec_path | 上游承载：api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.2 · 本仓 `SPEC-web-lg-rag-sse-t2_v1.md`（契约不变，W4 豁免） |

---

## 10 核对项

- [x] 范围 = Chat 稳定 thread_id · 刷新/重进恢复 · 可选 session 元数据  
- [x] 非范围 = T4 replay · T5 token · 切回 chat/stream · C0–C4 · api 改码 · 历史回显 · `/lg-rag` 页  
- [x] freeze_id = `lg-rag-sse-v1`（不新开 freeze · 不新增 event_type）  
- [x] SoT = thread_id；禁止当 chat session_id 用（00 定夺钉死）  
- [x] failure_paths：404/422/401/断网/localStorage 降级/run.start 缺 id 全覆盖  
- [x] test_strategy：Vitest mock 帧序 + localStorage mock + lint/test/build + graph-compile  
- [x] 合入：勿 auto-merge · HG-JOINT-DEBUG 维护者亲签  
- [x] E5 `### 自检结论` 占位已补 · `task lint` PASS（W4 豁免）  

---

## 输出

- task 可执行、可验收；与 api T3（#100 MERGED）契约逐条对齐  
- 00 定夺表钉死刷新/恢复策略（恢复 + 不回显历史 + 新会话按钮）  
- → 交 20 R1 task-audit（pass-with-notes · 0 阻塞 / 5 note）→ 00 代签 HG-AUDIT-R1
