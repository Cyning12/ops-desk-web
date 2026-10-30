# Invoke：10-task · web-hitl-approval-page

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-hitl-approval-page` |
| task_paths | `docs/tasks/active/task_web_hitl_approval_page.md` |
| related_review_or_none | —（待 20-task-audit R1） |
| git_branch | （尚未开工；30 开工时切 `task/web-hitl-approval-page`） |
| created_utc_or_local | 2026-10-23 |
| notes | 需求真值 `../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`；HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 均 pending |

---

## 可复制 Prompt 快照

```text
为「web 独立 HITL 审批页」起草 Harness task 文件。只写 task 文档，禁止改 src/ 任何实现码，禁止 git commit / 切分支。需求真值：ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md（任务一句话、冻结契约 src/api/hitl.ts、功能需求 7 条、非范围、验收标准 5 条）。
```

---

## 交付摘要

- 起草 `docs/tasks/active/task_web_hitl_approval_page.md`：独立 HITL 审批页（`/hitl` · 第四审批入口 · 冻结契约 `src/api/hitl.ts` 零分叉）
- 00 定夺 D1–D9；范围/非范围/failure_paths（FP-1–FP-14）/验收 TC1–TC9；R0–R5 思考轮（R5 early_stop）
- 亲读核实结论：Chat 页**不支持** thread 定位参数（`/chat` 无 path/query 参数定义，`ChatView.vue` 全文无 `route.query`/`route.params` 消费）→「回到会话查看」链接 = 仅跳 `{ name: 'chat' }` 不携参（D6）
- visibilitychange 取舍：**采纳**（hidden→visible 边沿刷新一次 · 事件驱动非轮询 · TTL 3600s 陈旧列表价值低）（D7）
- HG-GRAPH-MODULES 评估：不新增一级模块；30 交付时 pages 行增量备注 + 新增 `10_flow_hitl.graph.yaml` + `./scripts/graph-compile.sh`（D8）
- 更新 `docs/tasks/active/README.md` 活跃任务表（draft · 待 20-task-audit）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-23 | 10-task 首稿（需求 Prompt v1 逐条落入） |
