# Invoke：10-task · web-graph-l0-stale-sweep

> 00 起草并签 HG-TASK-DRAFT 后执行（维护者令「提前签收task」授权）。

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10 |
| task_slug | `web-graph-l0-stale-sweep` |
| git_branch | `task/web-graph-l0-stale-sweep` |
| task_path | `docs/tasks/active/task_web_graph_l0_stale_sweep.md` |
| spec_path | `docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P0（HG-SPEC-SIGNOFF approved） |

## 10 核对项

- [x] 范围 = l0 边 label 修正 · 7 新页节点 · version 刷新 · compile 再生成  
- [x] 非范围 = src / G-L1 flow（P1）/ l2（P2）/ 双写收敛+CI（P3）/ 拓扑重构 / schema 升级  
- [x] 验收全机检（grep 缺席 · 节点齐 · compile 绿 · src 零 diff 断言）  
- [x] failure_paths 四行（compile 红 / 页清单实证 / 双写不手改 / 误改 l1l2 拦截）  
- [x] `task lint` PASS（W4 豁免 · 思考轮 SPEC 承载）  
