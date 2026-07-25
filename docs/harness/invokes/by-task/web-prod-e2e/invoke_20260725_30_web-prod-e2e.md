# Harness invoke 快照：web-prod-e2e

| 字段 | 值 |
|------|-----|
| hat_id | 10 / 22 / 30 / 40（00 统筹同会话顺次） |
| task_slug | `web-prod-e2e` |
| task_paths | `docs/tasks/active/task_web_prod_e2e.md` |
| related_review_or_none | `docs/harness/reviews/task_web_prod_e2e_audit_R1_20260725.md` |
| git_branch | `task/web-prod-e2e` |
| created_utc_or_local | 2026-07-25 |
| notes | 生产联调；443 直连被安全策略 RST，经 SSH 隧道 localhost:8443 + --resolve 完成 |

## 交付摘要
- **结论**：14 项全执行，13 pass + 1 partial（B7 后端 module_matrix 空列）；验收文档 `docs/acceptance/prod-e2e-2026-07-25.md`
- **关键证据**：issues 599 / pulls 1440 / cycle_time sample 955 / trend 30d / SSE 全序列含 tool_result（#2041 ok:true 命中）/ 登出 401 / ws 404
- **后端缺陷移交**：F1 module_matrix 空列；F2 done.model 空串（详见验收文档）
- **观察**：token 一次性（首枚被部署冒烟消耗）、fail2ban 疑似误伤、ci_status 数据多为 null、index.html 缺 no-cache、无头环境视觉层建议人工抽查
- **下一棒**：交还 00 → CLOSE
