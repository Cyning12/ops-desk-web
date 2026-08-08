# Harness 30 Prompt · archive-completed-tasks（web）

> 用法：Open Folder = `ops-desk-web` 根；新会话整段粘贴下方复制区。  
> 00 统筹棒 B · 可与 api 棒 A 并行。

## Harness 元信息

| 字段 | 值 |
|---|---|
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | prompt 归档文 · 非 task 关账对象；存量 n/a |

---

`````text
你是 Harness 30（含 40 自检）。Open Folder = ops-desk-web 仓根。

读：
- docs/tasks/active/task_archive_completed_tasks.md
- docs/harness/reviews/task_archive_completed_tasks_audit_R1_20260728.md
- docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md
- 00 统筹：../ops-desk-workspace/docs/05-plan/03-post-go-live-hygiene-orchestration.md（棒 B）

纪律：
1. 首输出 GATE_VERIFY；闸已 approved 才改文件。声称与 task 表冲突 → STOP。
2. 禁止在 main 直推。从最新 origin/main 建 task/archive-completed-tasks。
3. 按 task 表将下列文件移出 active/ 到 done/（或 task 允许的 prompts 归档目录）：
   - TASK_epic_web_frontend_v1.md
   - task_glayer_phase_gamma_web.md
   - task_harness_upgrade_2_16_1.md
   - task_web_github_ci.md
   - task_web_obs_status_consumer.md
   - task_web_obs_nav_label_en.md（确认正文状态为 completed；若仍 ready-for-merge 先改 completed 再搬）
   - PROMPT_epic_web_frontend_kickoff.md
   - PROMPT_web_prod_e2e.md
4. 表外若发现其它已 completed（扫描时常见：task_web_gha_deploy_frontend.md），一并归档并记入自检；未完成项禁止误搬，停手报告。
5. 可把本 task 与 PROMPT/R1 一并提交；合入前可标 completed 并移入 done/（同 PR 或 follow-up）。
6. invoke_retention_profile=minimal：落盘 30 invoke。
7. 跑 npx @cyning/harness verify --target . --task docs/tasks/active/task_archive_completed_tasks.md（或合入前等价检查）。
8. commit → push -u → gh pr create。不 force push。不改 src/、CI 业务逻辑、图谱正文（除 task 元数据外）。

完成后：回填自检表；汇报 PR URL 与 docs/tasks/active/ 最终清单。
`````
