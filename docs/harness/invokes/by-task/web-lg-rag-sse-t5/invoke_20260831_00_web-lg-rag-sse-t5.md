# Invoke：00-orchestrator · web-lg-rag-sse-t5

> **用途**：00 编排留档；维护者令「T5已完成」→ 跑 WAVE_READINESS §1 闸 → 起草 web T5 task · 闸 · 派 30。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-lg-rag-sse-t5` |
| git_branch | `task/web-lg-rag-sse-t5` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t5.md` |
| 上游 | api T5 `lg-rag-sse-token-stream`（PR #105 MERGED · §10.4 已回写） |

---

## 00 动作流水（2026-08-31）

1. 核事实（禁臆造）：api T5 PR #105 MERGED · task 已归档 done/ · 05 §10.4 已回写 delta/final 协议  
2. **WAVE_READINESS §1 web-00 回填**：行 1–5 全勾 → **可开工 web T5**（api PR #107 MERGED；附 api 侧「断开即取消 generator」遗留备注）  
3. web checklist §3 末项勾选 + §4 判定行更新（本分支同提交）  
4. 起草 `task_web_lg_rag_sse_t5.md`：闸表 · 00 定夺（delta/final 分支 · done 停追加 · 降级 · replay 复用 T4）· 验收 · failure_paths · 联调策略  
5. `task lint` PASS（W4 豁免）· 签 HG-TASK-DRAFT / HG-GRAPH-MODULES  
6. 派 20 R1 → 后代签 HG-AUDIT-R1 → verify → 派 30（明令勿 auto-merge / 勿改 api）

## 纪律声明

- 本窗 00 **未改实现码**；Vue/TS 实现全部派 30 子 Agent  
- merge 闸 HG-JOINT-DEBUG 不空签：须 40 脚本化联调记录（delta 无乱码 / done 停追加 / 不串台 / replay 完整）或维护者亲签  
- T5 CLOSE 后若推进 T6（web 死代码清扫），api 00 已出 Prompt（api 仓 T6 起草中）——另波再议
