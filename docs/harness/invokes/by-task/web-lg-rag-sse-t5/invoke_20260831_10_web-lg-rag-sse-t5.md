# Invoke：10-task · web-lg-rag-sse-t5

> **用途**：task 需求审入口；00 起草并签 HG-TASK-DRAFT 后执行（web 00 线 · 维护者令「T5已完成」放行）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-lg-rag-sse-t5` |
| git_branch | `task/web-lg-rag-sse-t5` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t5.md` |
| spec_path | 上游承载：api `05_lg_rag_transport_and_session_plan_v0.md` §4.2/§10.4 + api 00 `PROMPT_web_00_lg_rag_t5_typewriter`（W4 豁免） |
| 就绪闸 | api `WAVE_READINESS_lg_rag_sse_v0.md` §1 · web-00 2026-08-31 回填「可开工 web T5」（api PR #107） |

---

## 10 核对项

- [x] 范围 = answer delta 打字机（delta 追加 / final 替换 / done 停追加 / 降级整段）  
- [x] 非范围 = api 改码 · T6 死代码 · C0–C4 · progress token 化 · replay 协议 · /lg-rag 页 · markdown 渲染  
- [x] freeze_id = `lg-rag-sse-v1`（不新增 event_type · answer payload 扩展 delta/final）  
- [x] 分支规则钉死：含 delta 键=增模式 · 含 content 键=替换模式 · 禁止终帧 append 叠加  
- [x] failure_paths：降级/乱序/终帧兜底/断网 mid-delta/replay 再断/401/占位帧全覆盖  
- [x] test_strategy：Vitest mock 帧序 + lint/test/build + graph-compile  
- [x] 合入：勿 auto-merge · HG-JOINT-DEBUG（40 脚本化联调或维护者亲签）  
- [x] `### 自检结论` 占位 · `task lint` PASS（W4 豁免）  

---

## 输出

- task 可执行、可验收；与 api T5（#105 MERGED）契约 §10.4 + api 00 Prompt 逐条对齐  
- → 交 20 R1 task-audit
