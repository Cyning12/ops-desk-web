# Invoke · 10 帽 · task 起草（web-ux-state-sync）

| 字段 | 值 |
|------|-----|
| **帽** | `10`（task 起草棒 · 纯文档轨零业务码） |
| **时间** | 2026-11-03（Asia/Shanghai） |
| **task** | `docs/tasks/active/task_web_ux_state_sync.md`（draft · 四闸 pending 起） |
| **派工锚** | `../ops-desk-workspace/docs/tmp/web-ux-state-sync-baton-prompt_v0_zh.md` v0 |
| **机断** | `npx spec-wave task lint --file` PASS · `lint-wiki-delta --target .` PASS（scanned 71 · missing 0） |

---

## §1 · 起草依据（证据亲读）

- **F1/F8/F10 实证**：workspace `docs/harness/invokes/by-task/stage-w-e2e-join-acceptance/invoke_20261102_10_c8_evidence_archive.md` §2
- **F14/F15 实证**：workspace 同目录 `invoke_20261103_10_final_acceptance.md` §2（run `af3fcf63832c4d6dae4a1ecc5065a4e3` · 截图 `a5-expired-row-prompt.jpg`）
- **登记**：workspace `docs/tasks/backlog/backlog_20261030_post_stage_w.md` B10/B11（合并立案建议）
- **码面亲读**：`src/views/HitlApprovalView.vue`（:61-85 内存已决行 · :297 UTC 直出 · :162-166 409 透传 · 过期 mapping 已由镜像薄壳落）· `src/stores/chat.ts`（:123-148 卡片状态机 · :1283-1296 refreshHitlPending · :1317-1320 hitlActedRequestIds · :1018-1023 resumeConflictMessage）· `src/components/chat/HitlApprovalCard.vue` / `HitlApprovalOverlay.vue` · `src/stores/httpErrorI18n.ts` · `src/api/hitl.ts`（freeze）

## §2 · 关键定夺（D1-D8 摘要）

- **D1 已决单 = 会话内保留**（sessionStorage · FIFO 20 · 版本键 `ops.hitl.decided.v1` · 静默降级）：api 红线无已决出口，baton 范围 1 明示「视图或会话内保留」取后者。
- **D2 卡片对账零新机制**：复用既有 `refreshHitlPending` 刷新点 + `hitlPending` store 态；403/网络/本地已动作不做对账（FP-4/5/6）；/hitl decide 后进 chat 触发进页核对闭环 F14。
- **D3 时间本地化**：Intl 本地时区渲染 + title 保 UTC 原文 + 非法回退。
- **D4 F8-web 纳入**：/hitl 页 `resumeErrorText` 写窗子串中性化（consume-only 先例同形）；chat chase 面已由 web-hitl-resume-chase-ux 吸收，不重动。
- **D6 F6 非范围**（两入口链式差异 · freeze 评议另议）。
- **F8 核对结论**：部分已修（chase FP-H2），残留面 = /hitl 页 409 透传，本 task 收录。

## §3 · 闸态

| 闸 | 状态 | 说明 |
|----|------|------|
| HG-TASK-DRAFT | pending | 待维护者初稿人扫 |
| HG-AUDIT-R1 | pending | 待 20-task-audit R1 + 人签 |
| HG-GRAPH-MODULES | pending | 10 评估：零新增一级模块/路由（30 实扫回签） |
| HG-CONTRACT-FREEZE | pending | freeze `hitl-browser-decide-v1` 零分叉（只动展示与状态同步） |

## §4 · 交接

- 交维护者签 HG-TASK-DRAFT，然后 20-task-audit R1，然后人签 HG-AUDIT-R1 / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE，然后派 30（红测先行 · 分支 `task/web-ux-state-sync`）。
- 本棒：不改 `src/`、不改 `tests/`、不切分支、不 commit、不签闸。

---

### 修订

| 日期 | 说明 |
|------|------|
| 2026-11-03 | 10 帽起草棒：task draft 落盘（D1-D8 · FP-1至FP-12 · TC1-TC8 · R0-R5 early_stop）· task lint PASS · lint-wiki-delta PASS · invoke 落档 |
