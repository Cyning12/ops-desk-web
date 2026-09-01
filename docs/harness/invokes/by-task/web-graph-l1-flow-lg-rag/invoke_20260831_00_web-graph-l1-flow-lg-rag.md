# Invoke：00-orchestrator · web-graph-l1-flow-lg-rag

> P0 CLOSE（PR #31）后续开 SPEC §3 P1 首切片。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-graph-l1-flow-lg-rag` |
| git_branch | `task/web-graph-l1-flow-lg-rag` |
| 上游 | SPEC P1 · P0 done（task_web_graph_l0_stale_sweep · #31） |

## 00 动作流水（2026-08-31）

1. P0 CLOSE：CI 绿 + 00 抽查（8/8 · src 零 diff · l0 无 chat/stream）→ PR #31 MERGED · 归档 + Hub（#32）· main compile 冒烟绿  
2. 起草 P1a task `web-graph-l1-flow-lg-rag`：flow 建模只画实证链（view→store→api→http→invoke）· implementedBy 全符号真实存在断言 · **l2 indexes lg_rag 域同波同步**（防脱节）· modules 补 Obs（P0 R1-N3 欠账）  
3. `task lint` PASS · 签 HG-TASK-DRAFT / HG-GRAPH-MODULES  
4. 派 20 R1 → 即签 HG-AUDIT-R1 → verify → 派 30（yaml + indexes · src 零 diff）

## 纪律声明

- 本窗 00 **未改图谱文件本体**；派 30 子 Agent  
- P1a CLOSE 后：其余页 flow 优先级请维护者定（或默认 overview→issues→pulls→lc_evidence→obs→login 顺序续开）
