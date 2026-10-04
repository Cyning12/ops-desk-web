# Invoke：10-task · web-chat-history-hitl-ux（拆解留档）

> **用途**：10-task 拆解本棒留档 · 对齐 signed SPEC 与 SPEC R1 审查（pass · nit N1/N2 已回填）。  
> **性质**：`task-draft`（首稿）· **非** retro-snapshot。  
> **hat**：10-task · **本棒未改** `src/`

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-chat-history-hitl-ux` |
| invoke_slug | `web-chat-history-hitl-ux` |
| git_branch | `task/chat-history-hitl-ux` |
| task_path | `docs/tasks/active/task_web_chat_history_hitl_ux.md` |
| spec | `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md`（signed 2026-10-04） |
| spec_audit | `docs/harness/reviews/spec_web_chat_history_hitl_ux_audit_R1_20261004.md`（pass · nit N1/N2 → 本棒回填） |
| upstream（只读） | `../ops-desk-api/docs/tasks/active/task_chat_history_api.md`（B1 · ready）· `task_hitl_browser_decide.md`（B2 · ready） |

## 10 核对项（对照已落 task）

- [x] 一个 task 覆盖 F1+F2（同一 store/页面爆炸半径 · 内部按 F1/F2 分 scope 小节）
- [x] 范围 = F1-1~F1-4（B1 client / 侧栏 / 历史渲染 / 续看复用 T4）+ F2-1~F2-4（hitl.waiting 分支 / B2 client / decide→resume 链 / done 按 status 修 bug）
- [x] 非范围 = SPEC §4 九条 + 全局 pending 面板弃选（裁定 F-A S2）共十条
- [x] 验收映射 SPEC AC1–AC15 + **AC16（N1：fetchHitlPending 消费点=动作后刷新 + 进入核对 · 不轮询）**；**N2 回填**：AC3=replayLgRag import 文件计数仍 2 · AC11=useLgRagSse.ts diff 空断言 + 无 `hitl` 字面
- [x] failure_paths FP-F1~FP-F12 全量映射实现层处置
- [x] `test_strategy=required` · verify 真值 `pnpm lint` → `pnpm test` → `pnpm build` · `freeze_id=lg-rag-sse-v1`（只消费）
- [x] `wiki_delta=docs/coding_wiki/volatile.md`（非 n/a · WikiTrack 约定 · 短注+真值指针）
- [x] 图谱义务：G-L1 `01_modules.md` api/pinia/components 行增量 · `HG-GRAPH-MODULES` 随交付签录
- [x] 30 实现要点提示 10 条（含 `chat.ts:308/:631` T4 注释同步更正 · SPEC 建议②）
- [x] 思考轮 R0–R5 全 done · early_stop=no · residual=api 端点未上线联调阻塞 merge
- [x] `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` **PASS**（2026-10-04 实跑 · 首轮 E3 验收节 ### 子标题截断勾选项 → 改粗体行后复跑 PASS）

## 人工闸表状态（task 真值）

| human_gate_id | status | 说明 |
|---|---|---|
| HG-TASK-DRAFT | **pending** | 待 20-task-audit R1；维护者已授权 00 签收（SPEC 人工闸表在案）· 走流程 |
| HG-AUDIT-R1 | **pending** | **30 拒开工**（FP-F12） |
| HG-GRAPH-MODULES | **pending** | G-L1 增量随 30 交付签录 |
| HG-JOINT-DEBUG | **pending** | blocked_by api B1/B2 端点上线 · 未联调不假 CLOSE |

## 输出

- task 已落 active：`docs/tasks/active/task_web_chat_history_hitl_ux.md`
- 下一棒：20-task-audit R1（prompt 已内嵌 task 文末）

## 禁区留痕

- 本棒 **未**改 `src/` 实现码 · **未**改 api 仓 · **未**代签任何 human_gate · 分支 `task/chat-history-hitl-ux` 未切换
