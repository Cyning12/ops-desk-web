# Invoke：00-orchestrator · web-lg-rag-sse-t3

> **用途**：00 编排留档；维护者 Prompt 授权「起草 web T3 task · 闸 · 派 30 · 授权签收所有过程文档」。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-lg-rag-sse-t3` |
| git_branch | `task/web-lg-rag-sse-t3` |
| task_path | `docs/tasks/active/task_web_lg_rag_sse_t3.md` |
| 上游 | api T3 `task_lg_rag_session_continuity`（PR #100 MERGED · api-only 先合已执行） |

---

## 00 动作流水（2026-08-31）

1. 修正 done T2 过时指针：`task_web_lg_rag_sse_t2.md` 两处 api task 链接 `active/` → `done/`（api T2/T3 均已归档）  
2. 起草 `task_web_lg_rag_sse_t3.md`：闸表 · 00 定夺（SoT/持久化/刷新恢复/新会话/404 处理/合入）· 验收 · failure_paths · 联调策略  
3. `task lint`：E5 补自检结论占位后 **PASS**（W4 豁免）  
4. 签 HG-TASK-DRAFT · HG-GRAPH-MODULES（维护者授权代签文档闸）  
5. 派 20-task-audit R1 → **pass-with-notes**（0 阻塞 / 5 非阻塞 note · 30 内决）→ 代签 HG-AUDIT-R1  
6. verify 闸扫描 → 派 30 实现（背景子 Agent；明令 **勿 auto-merge / 勿 push --force / 不改 api**）

## 闸快照（派 30 前）

| 闸 | 状态 |
|---|---|
| HG-TASK-DRAFT | approved（00 签） |
| HG-GRAPH-MODULES | approved（00 预签 · 不新增一级模块） |
| HG-AUDIT-R1 | approved（00 代签 · R1 pass-with-notes） |
| HG-JOINT-DEBUG | **pending**（blocks merge · 维护者亲签） |

## 纪律声明

- 本窗 00 **未改实现码**（src/** 零 diff）；Vue/TS 实现全部派 30 子 Agent  
- 过程文档签收在维护者授权范围内；merge 闸（HG-JOINT-DEBUG）**不代签**，留维护者联调亲签
