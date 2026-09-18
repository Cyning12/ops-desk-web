# Invoke：10-task · web-tenant-context-chat（回溯快照）

> **用途**：pre-30 invoke 补档 · **非**本窗重开 10 起草。  
> **性质**：`retro-snapshot` · 对齐已落盘 task 壳与 freeze 契约（2026-09-18 维护者令本地 30）。  
> **hat**：10-task · **本棒未改** `src/`

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-tenant-context-chat` |
| git_branch | `task/web-tenant-context-chat` |
| task_path | `docs/tasks/active/task_web_tenant_context_chat.md` |
| contract | `../ops-desk-workspace/docs/contracts/api-v1-tenant-readonly-context-draft.md`（freeze · F1=C / F2 / F5 / F6） |
| snapshot_note | 00 编排窗补档 · 实质条款以 active task 为准 |

## 10 核对项（对照已签 task）

- [x] 范围 = 租户注入（`X-Ops-Tenant-Id`）+ D5 切换 UI + Vitest + Agent Playwright 证据  
- [x] 非范围 = 改 api / SSE event 表 / ios / 完整租户后台 / 强制钉 `@playwright/test`  
- [x] failure_paths：闸 pending 拒开工 · 401 登录流 · 头不一致 403 明示 · api 未部署 T 阻塞 merge · 误改 SSE 拒收  
- [x] 验收：lint/test/build · W1–W6 · Playwright 切换可见 + 头 · A/B 各一问（数据齐后）  
- [x] `required_invoke_hats` = `10,20,30,40` · `test_strategy=required` · `freeze_id=lg-rag-sse-v1`（只消费）  
- [x] 思考轮 early_stop at R2 · residual = api 未就绪时联调阻塞  

## 输出

- task 已在 active：`task_web_tenant_context_chat.md`  
- `npx spec-wave task lint --file …`：30 棒已记 **PASS**  
- 下一棒历史：20 审查 → 闸表 `HG-AUDIT-R1` 等已 **approved**（维护者令 · 00 代签）→ 30 已执行  

## 禁区留痕

- 本快照 **不**改 task 实质 · **不**代签闸 · **不**改码
