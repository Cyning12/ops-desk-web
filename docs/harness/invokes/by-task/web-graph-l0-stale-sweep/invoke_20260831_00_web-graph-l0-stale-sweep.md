# Invoke：00-orchestrator · web-graph-l0-stale-sweep

> 维护者令：「签收spec · 补全图谱前增加更新coding-kit · 提前签收task · 00 开始统筹」。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-graph-l0-stale-sweep` |
| git_branch | `task/web-graph-l0-stale-sweep` |
| 上游 | SPEC-web-tech-graph-incremental-completion_v1（HG-SPEC-SIGNOFF approved · web PR #30 MERGED） |

## 00 动作流水（2026-08-31）

1. 签收 SPEC：HG-SPEC-SIGNOFF approved（维护者令「签收spec」）→ PR #30 MERGED  
2. **coding-kit 核查（禁臆造）**：npm latest = 1.10.0 · 仓内 package.json 已 pin 1.10.0（task_coding_kit_upgrade_1_10_0 今日已 CLOSE）→ **升级波免除**（无新版可升 · 已短报维护者）  
3. 起草 P0 task `web-graph-l0-stale-sweep`（SPEC §3 P0 最小波）：闸表（HG-JOINT-DEBUG=n/a 纯图谱波）· 00 定夺（边修正/节点补齐/version/compile）· 全机检验收  
4. `task lint` PASS · 签 HG-TASK-DRAFT / HG-GRAPH-MODULES（提前签收授权）  
5. 派 20 R1 → 即签 HG-AUDIT-R1 → verify → 派 30（图谱 yaml 编辑 · src 零 diff 断言）

## 纪律声明

- 本窗 00 **未改图谱文件本体**；yaml 编辑派 30 子 Agent  
- P0 CLOSE 后按 SPEC §3 开 P1（10_flow_lg_rag 优先）
