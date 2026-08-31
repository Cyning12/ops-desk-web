# Invoke：00-orchestration · web-lg-rag-sse-t2

> **用途**：**web 00 Agent 统筹入口**（api 仓代起草 · 本 invoke 须 web 00 接续执行）。  
> **禁止**：ops-desk-api Agent 在本仓做 30 改码。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 00 |
| task_slug | `web-lg-rag-sse-t2` |
| git_branch | `task/web-lg-rag-sse-t2` |
| created_utc_or_local | 2026-08-31 |
| orchestration_repo | `ops-desk-web` |

---

## 00 待办（web Agent 执行）

1. **Open Folder** = `ops-desk-web/`  
2. 读 task：[`task_web_lg_rag_sse_t2_joint.md`](../../../../tasks/active/task_web_lg_rag_sse_t2_joint.md)  
3. 读 Spec：[`SPEC-web-lg-rag-sse-t2_v1.md`](../../../../spec/SPEC-web-lg-rag-sse-t2_v1.md)  
4. 读 api 联调：[`05_lg_rag_transport_and_session_plan_v0.md`](../../../../../../ops-desk-api/docs/spec/agent-infra/05_lg_rag_transport_and_session_plan_v0.md) §10–§11  
5. **HG-SPEC-SIGNOFF** → approved（§0 冻结）  
6. **HG-TASK-DRAFT** → approved  
7. 开分支 `task/web-lg-rag-sse-t2`（若尚无）  
8. 排 **10** task 审 → **20 R1** → **30 实现**（`useLgRagSse` · Chat 切流 · 废弃主路径 chat SSE）  
9. 30 完成后维护者走 [`CHECKLIST_lg_rag_sse_joint_release_v1.md`](../../../../checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md)  
10. **HG-JOINT-DEBUG** approved 后方 merge web PR；与 api **同日发版**

---

## 跨仓 PR 纪律

| 仓 | 动作 |
|---|---|
| api | PR 已开 · **勿 auto-merge** · 联调通过后 merge |
| web | 30 完成后开 PR · **勿 auto-merge** · checklist 全勾后 merge |

---

## 签收动作（待 web 00 填写）

| 闸 | status | 日期 | 备注 |
|---|---|---|---|
| HG-SPEC-SIGNOFF | **approved** | 2026-08-31 | web 00 签 · SPEC §0 冻结生效（维护者令「签收」） |
| HG-TASK-DRAFT | **approved** | 2026-08-31 | web 00 签 · task 人工闸表已回写 |
| HG-JOINT-DEBUG | pending | | checklist 附件路径（30 完成后维护者签） |
