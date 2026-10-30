# invoke · 20-task-audit · web-hitl-approval-page

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-23 |
| hat | `20-task-audit`（R1 · task 书面审 · 只审不改） |
| task_slug | `web-hitl-approval-page` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（task draft R1 书面审 · 承同目录 10 invoke） |
| 审查对象 | `docs/tasks/active/task_web_hitl_approval_page.md`（242 行 · draft · D1–D9 · TC1–TC9 · FP-1–FP-14 · R0–R5） |
| 需求真值 | `../ops-desk-workspace/docs/tmp/web-hitl-approval-page-prompt_v1_zh.md`（自包含 Prompt v1 · 7 条功能需求 / 4 条非范围 / 5 条验收 · 无上游 SPEC） |
| 交付物 | `docs/harness/reviews/task_web_hitl_approval_page_audit_R1_20261023.md`（审查文 · approved-with-comments） |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 全 **pending**（未代签） |
| git 操作 | 零（不 commit · 不切分支 · 未推送） |
| 备注 | task `required_invoke_hats=10,30,40` 不含 20；本 invoke 按 00 委派指令留档（规程默认集合外增量） |

## Prompt 快照（委派要点）

> 对 task draft 做 R1 书面审：① 对照 Prompt 逐条核对范围 10 / 非范围 7 / TC1–TC9 对功能需求 7 条与验收 5 条的完备覆盖；② FP-1–FP-14 对点名失效语义（TTL 3600s / 403 / resume_mode 白名单 / 两步链 / 防重）的覆盖；③ 亲读 `src/api/hitl.ts` 核冻结契约断言（fetchHitlPending / decideHitlRequest inherit 不送键 / resumeHitlRequest / HitlPendingItem 六键）；④ 抽核现状断言（router 无审批页路由 · ChatView 不消费 route.query/params · :43,101 不轮询与 D7 visibilitychange 取舍）；⑤ 三闸 blocks 关系与图谱增量声明；⑥ R0–R5 与 test_strategy 合规 + lint/verify 可重跑。结论落盘 reviews/ + 本 invoke；严禁代签任何闸；零 git；不改 src。

## 交付摘要

### 判定：**approved-with-comments**（内容零阻塞 · 签收 · NIT ×3 非阻塞 · 零代签 · 未附 30 Prompt）

### 核对面与结果

| 核对面 | 结果 |
|---|---|
| 范围 10 条 ↔ Prompt 功能需求 7 条 | ✅ 7/7 全映射无漏项；D6「仅跳 { name: 'chat' } 不携 thread_id」是 Prompt §3.5 明文允许的条件分支（先核实现状），忠实执行非漏项 |
| 非范围 7 条 ↔ Prompt 4 条 | ✅ 4 条逐字全承；扩 3 条（chat store 零触碰 / thread 深链另立 task / 不消费 replay 补帧 + 不改 CI）均为合理收紧非越界 |
| TC1–TC9 ↔ Prompt 验收 5 条 | ✅ 5/5 全映射（四态 → TC1+TC6 · 手测链路+PR 材料 → TC9 · 驳回/immediate → TC7/TC5 · 三门 → TC8） |
| FP-1–FP-14 ↔ 点名失效语义 | ✅ 五类全覆盖：FP-5 TTL（后端 nodes.py:296 默认 3600 实证）· FP-2 403 · FP-8 白名单 400 · FP-9/FP-12 两步链 · FP-10/FP-6 防重；另补 401/网络/404/resume 失败/visibility/流程闸 |
| 冻结契约断言（亲读 src/api/hitl.ts） | ✅ 全部属实：HitlPendingItem 六键 :26-33 · decideHitlRequest inherit 不送键 :99-100（行号精确）· 错误码面 409/404/422/400 :14-16 · resume/decide 响应形状 :51-79 · 无臆造 |
| 现状断言抽核 | ✅ 全部属实：router/index.ts:13-86 无审批页路由 · 守卫 :99-111 · 401 拦截 :118-125 · /chat :56-62 无参数 · ChatView grep 全文仅 :65 `route.fullPath`（无 route.query/params）· :43-44 一次性核对 + :101-104 手动刷新（不轮询）· :23-58 visibility 仅游标分流（D7 零冲突成立）· ChatHistoryPanel :16,77 emit select · HitlApprovalCard :49-60 三选文案 / :19 默认 inherit · AppLayout :38-51 el-menu router |
| 三闸 blocks 关系 | ✅ HG-TASK-DRAFT blocks 22-R1+30 · HG-AUDIT-R1 blocks 30 · HG-GRAPH-MODULES blocks 30；verify 实跑 VERIFY: BLOCKED 与表一致 |
| 图谱增量声明 | ✅ pages 行增量备注 + 新增 10_flow_hitl.graph.yaml + graph-compile.sh 绿，与 01_modules.md:36-39 四条「不新增一级模块 + 行增量备注」先例一致；FP-14 回签兜底合理 |
| R0–R5 + test_strategy | ✅ 控制表五列齐全 · early_stop 仅 R5 理由成立 · residual_risks 诚实（过期 decide 错误码未实证按泛化处理）· 红测先行 + 三门 + graph-compile 与 AGENTS.md 一致 · K7 行为变更类提醒不适用（纯新增页面存量零触碰） |
| lint / verify 复跑 | ✅ `npx spec-wave task lint` → PASS · EXIT=0（W3 占位警告 draft 期合法）；`npx spec-wave verify` → BLOCKED · EXIT=2（三闸 pending · draft 期预期）（均 2026-10-23 本帽实跑非抄自述） |

### NIT（非阻塞 · 详情见审查文）

1. **N1 行号漂移**：task 与 hitl.ts 冻结注释引 `router.py:184` 白名单，实际校验在 `router.py:203-208`（:204 白名单 → 400）。语义属实仅行号漂移，建议 30 invoke 留痕。
2. **N2 旧编号**：HG-TASK-DRAFT blocks 写「22-R1」（20-task-audit 旧编号），与仓内参照 task 同惯例，建议后续统一 20-R1。
3. **N3 泛化口径**：TC6「审批已过期类提示」未钉后端具体错误体（R1 residual 已标注），Vitest 子串断言仍可机断，接受。

### 下一棒

**维护者签闸**（HG-TASK-DRAFT + HG-AUDIT-R1 + HG-GRAPH-MODULES → approved · 清单见审查文文末）→ 再下发 30（红测先行 · 切 `task/web-hitl-approval-page` 分支）。本审查文**不附** 30 可复制 Prompt。无内容阻塞，**无需退回 10-task**。

## 纪律核验

- ✅ 未代签任何人闸：三闸维持 pending（30 拒开工存续）
- ✅ 未改 task 实质内容 · 未改 `src/` 与 `tests/` 任何文件（仅 read/grep/lint/verify 取证据）
- ✅ api 仓只读（router.py / auto_resume.py / store.py / nodes.py 亲读取证 · 零写入）
- ✅ 零 git 操作（未 commit · 未切分支）
- ✅ 对照面全部本帽亲读抽验：Prompt v1 全文 · hitl.ts 全文 · router/index.ts 全文 · ChatView.vue（1-130 + grep 全文）· HitlApprovalCard.vue 全文 · AppLayout.vue 菜单段 · 01_modules.md · ChatHistoryPanel emit · package.json · 后端 router.py:170-209 / nodes.py TTL 默认 · 引用文件存在性逐一 glob
