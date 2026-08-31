# Invoke：00-orchestrator · web-lg-rag-sse-t4

> **用途**：00 编排留档；维护者 Prompt「阶段 A · 交付 web T4」授权（起草 task · 闸 · 派 30 · 勿 auto-merge）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-lg-rag-sse-t4` |
| git_branch | `task/web-lg-rag-sse-t4` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t4.md` |
| 上游 | api T4 `lg-rag-sse-resume`（PR #103 MERGED · api-only 先合已执行） |
| 就绪入口 | api `WAVE_READINESS_lg_rag_sse_v0.md` §1（T4 CLOSE 后强制回填） |

---

## 00 动作流水（2026-08-31）

1. 核契约：api T4 PR #103 **MERGED** · 05 §10.3 已回写 · WAVE_READINESS 入口存在  
2. 落盘 api 00 handoff 的 checklist §3/§4 增补（dde5e0a · 先前未提交）  
3. 起草 `task_web_lg_rag_sse_t4.md`：闸表 · 00 定夺（cursor 捕获/active-run/续看/去重/合入）· 验收 · failure_paths · 联调策略  
4. `task lint` **PASS**（W4 豁免）  
5. 签 HG-TASK-DRAFT · HG-GRAPH-MODULES（授权代签文档闸）  
6. 派 20 R1 → 后代签 HG-AUDIT-R1 → verify → 派 30（明令勿 auto-merge / 勿改 api）

## 纪律声明

- 本窗 00 **未改实现码**；Vue/TS 实现全部派 30 子 Agent  
- merge 闸 HG-JOINT-DEBUG 不空签：须 40 脚本化联调记录（offline/replay 不丢不重）或维护者亲签  
- T4 CLOSE 后**强制**执行 WAVE_READINESS §1 勾选 + 回填结论行（禁跳过开 T5）
