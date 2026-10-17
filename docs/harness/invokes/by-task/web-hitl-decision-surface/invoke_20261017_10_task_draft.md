# invoke · 10-task · web-hitl-decision-surface

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-17 |
| hat | `10-task` |
| task_slug | `web-hitl-decision-surface` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（SPEC 已签 · HG-SPEC-SIGNOFF=approved 2026-10-17 含 D-A 定夺 S1 · 20-spec-audit R1 pass → 起草 web task） |
| 需求真值 | `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（signed · 300 行 · D1–D4 · AC1–AC16 · FP-H1~H13） |
| 审查对照 | `docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md`（pass · nit N1/N2/N3 转 task 消化） |
| 交付物 | `docs/tasks/active/task_web_hitl_decision_surface.md`（276 行 · draft · 人工闸全 pending） |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 pending**（未代签任何人闸） |
| git 操作 | 零（不 commit · 不建分支 · 未推送） |

## Prompt 快照（委派要点）

> 你是 10-task 帽。SPEC 已签（含 D-A 定夺 S1 事件驱动零定时器 · R1 pass），据此起草 docs/tasks/active/task_web_hitl_decision_surface.md。必读 SPEC 全文 + 20 审查文（nit×3 体内消化：N1 extractFrameCursor 真址 src/stores/chat.ts:569-597 · N2 AC16 编号消歧 · N3 grep/diff 断言形态钉死）+ done/ 先例体例 + harness 约定。status: draft · 人工闸全 pending 严禁代签 · graph_change_layer 承 SPEC 建议 G-L1 可降 none · TC 从 AC1–AC16 映射全覆盖可机断 · 预留 40 live 联调棒位 · failure_paths 承 FP-H1~H13 并补 task 层风险（40 环境不可达降级口径）· R0–R5 槽位+控制表 · 零 git · 只新增 task 档与本 invoke（命名 invoke_20261017_10_task_draft.md）· 跑 task lint 确认 PASS · 回报行数/TC/FP 数/闸态/lint/照登点。

## 交付摘要

### 产出文件

| 文件 | 行数 | 说明 |
|---|---|---|
| `docs/tasks/active/task_web_hitl_decision_surface.md` | 276 | v0 draft · 全章节齐备（Harness 元信息 + 人工闸表 + 背景/锚点/范围 F1–F7/非范围 12 条/grep-diff 断言专节/联调坑位/failure_paths 18 行/验收 22 条/依赖/必读/R0–R5/自检/修订记录） |
| `docs/harness/invokes/by-task/web-hitl-decision-surface/invoke_20261017_10_task_draft.md` | 本件 | 10-task invoke（同目录已有 10-spec/20-spec-audit 两 invoke） |

### TC / FP 盘点

- **验收 22 条**：TC1–TC16（AC1–AC16 **一一映射不合并** · 消歧零风险 · 全 Vitest 可机断：调用顺序/fake timers 退避清理/分态分流/DOM 断言/grep-diff 钉形态/三门+graph-compile）+ **TC-L1–L5 预留 40 live 联调棒位**（ops-desk-api compose 环境 · 契约已 freeze+live 实证 · 无 blocked_by：全链追帧/在飞窗两形态/409 分流 live 实证/驳回+immediate 回归/降级面照登）+ TC17 收口（invoke 齐/wiki/lint PASS）
- **failure_paths 18 行**：FP-H1~H13 全承 SPEC + task 层增补 **FP-T1**（40 联调环境不可达降级口径 = 不假绿不落「live PASS」字面 · 阻塞登记回报 00 · mock 面 TC1–TC16 可先行 · CLOSE 前补跑或维护者显式裁定降级）· FP-T2（N3 口径漂移）· FP-T3（行号漂移 grep 定位纪律）· FP-T4（回退闸基线 263）· FP-T5（沉降窗 100–310s > 追帧墙钟 120s 时超限降级属预期 · 40 照登不误判 FAIL）

### nit×3 消化落点（体内闭合）

1. **N1 行号漂移**：`extractFrameCursor` 真址 `src/stores/chat.ts:569-597`（接口 :569-572 · 定义 :578 · cursor 合成 :581-591）——本帽真读 `chat.ts:560-609` 复核属实；task 锚点一律用真址，SPEC 引 `:476-495` 为漂移旧值已标注「30 勿按失真行号动刀」。
2. **N2 AC16 消歧**：task 内凡涉 pending 两消费点一律写「承 signed SPEC-web-chat-history-hitl-ux AC16①/②」；本 task/SPEC 自有 AC16=G-L1 图谱条目，消歧注落范围 F1 与 nit 消化表。
3. **N3 grep/diff 断言形态**：task 设专节钉死三件套——AC3（`grep -rn "setInterval" src/` · 排除注释/tests · 基线 0 · 退避一律 setTimeout 单次链）· AC13（无新 event_type 字面 + `git diff` 限 `useLgRagSse.ts` 错误面 hunk · 解析段 diff 为空）· AC12（无伪造 model 赋值字面）。

### task 层定稿项（SPEC 照登参数落地）

- **追帧上限定稿 ≤10 次 且 ≤120s 墙钟（先到为准）**——SPEC「建议 ≤10 次或 ≤120s · 30 定稿写 task」本 task 钉死；与上游实证沉降窗 130–310s 的落差以 FP-T5 降级面承接（不盲目放大墙钟 · 轮询轰炸禁令优先）；扩张须回 10-task 修订链（非范围第 11 条）。
- **graph_change_layer=G-L1** 承 SPEC 建议（01_modules.md api/pinia/components 行增量备注 · 必要时 10_flow_chat 补注追帧链）；30 实判若无新模块可降 `none` 留痕（HG-GRAPH-MODULES 随交付签录）。

## lint 结果

| 命令 | 结果 |
|---|---|
| `pnpm exec spec-wave task lint --file docs/tasks/active/task_web_hitl_decision_surface.md`（pnpm 钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`） | **PASS · EXIT=0**（2026-10-17 实跑）。**照登**：首跑 FAIL [E3]「## 验收标准 节内无任何勾选项」——验收节内 `###` 子标题阻断 lint 勾选项扫描；将两个 `###` 子标题改为粗体行后复跑 PASS（先例 fobs/reverify 验收节均无 `###` 子标题 · 体例对齐确认） |

## 不确定照登点

1. **人工闸全 pending 待人签**：HG-TASK-DRAFT（启动确认）/ HG-AUDIT-R1（须 20-task-audit R1 书面审 PASS 后维护者签）/ HG-GRAPH-MODULES（G-L1 预判 · 随交付签录）——本帽零代签，pending 期间 30 拒改码（FP-H13/FP-T 链已钉）。
2. **40 环境实判**：compose 环境可达性未在本帽实起验证（10 帽不起服）；不可达降级口径已钉 FP-T1，可达性由 40 棒实判。
3. **Vitest 基线 263** 引 reverify CLOSE 2026-10-16 实录值；30 起草红测前实测复核填报（若漂移照登 invoke）。
4. **分支未建**：`task/web-hitl-decision-surface` 建议分支由 00 立 task 时建（本帽零 git）。

## 纪律核验

- ✅ 人工闸全 pending：三闸未签 · 未代签任何人闸
- ✅ 零 git 操作：仅新增两件文件 · 未 commit/未建分支/未推送
- ✅ api 仓零触碰：仅承接 SPEC 已核契约面 · 未读改 api 任何文件
- ✅ 体例对齐 done/ 先例：`task_web_hitl_resume_async_reverify.md`（元信息/闸表/坑位/R0–R5 控制表）· `task_web_hitl_fobs_receipt.md`（验收节无 `###` 子标题 · close_pr_policy）
- ✅ nit×3 体内消化闭合（N1 真址本帽真读复核 · N2 消歧 · N3 断言形态专节）
- ✅ R0–R5 思考轮真实回填 + 控制表 + actual_last_round=R5（early_stop）
- ✅ task lint 实跑 PASS（首跑 E3 修复过程照登）
