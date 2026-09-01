# Invoke：00-orchestrator · web-graph-l2-key-unify

> 维护者令「P2收尾后再进P3」→ P2 收尾 = by_symbol 键形态统一。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-graph-l2-key-unify` |
| git_branch | `task/web-graph-l2-key-unify` |
| 上游 | SPEC P2 · P1b done（task_web_graph_l1_flow_pages · #34 · 双形态现状） |

## 00 动作流水（2026-08-31）

1. P1b CLOSE：PR #34 MERGED · 归档 + Hub · main compile/test 冒烟绿（10 graphs/112 nodes/120 edges · 153 tests）  
2. 迁移面实证（禁臆造）：by_symbol 头注双形态决策段 + 18 裸键（chat/lg_rag 含 http 例外）+ 51 复合键（P1b）  
3. 起草 P2 收尾 task：纯键形态迁移 · 值全等断言 · 零裸键断言 · 撞键=0（新旧全集）  
4. `task lint` PASS · 签 HG-TASK-DRAFT / HG-GRAPH-MODULES  
5. 派 20 R1 → 即签 HG-AUDIT-R1 → verify → 派 30

## 纪律声明

- 本窗 00 **未改图谱文件本体**；派 30 子 Agent  
- P2 CLOSE 后进 P3：双写去留须维护者拍板（保根 graph.json 还是仅留 shared/）+ CI 强化两项检查
