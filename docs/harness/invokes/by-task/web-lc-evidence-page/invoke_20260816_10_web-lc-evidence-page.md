# Invoke：10-task · web-lc-evidence-page

> **用途**：10-task 开局指令快照（把已签收 SPEC 写成可执行 task）。  
> **非** 10-spec：同目录 `invoke_20260816_10_spec_web-lc-evidence-page.md` 是 SPEC 帽。

---

## 元信息表（必填）

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-lc-evidence-page` |
| freeze_id | `lc-evidence-http-v1` |
| task_paths | `docs/tasks/active/task_web_lc_evidence_page.md` |
| related_review_or_none | `docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md` |
| git_branch | `task/web-lc-evidence-page` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-16 |
| notes | 不实现代码；不签发 HG-AUDIT-R1；HG-TASK-DRAFT 保持 pending；GRAPH 00 代签 approved |

---

## 可复制 Prompt 快照

````text
你是 ops-desk-web 仓的 10-task Agent。Open Folder = 本仓根。分支必须保持 task/web-lc-evidence-page。

身份与禁止
- 把已签收 SPEC 写成可执行、可验收的 task。
- 不实现代码、不改 Vue/CI、不改 SPEC 实质条款。
- 不签发 HG-AUDIT-R1（保持 pending）。
- 不写绝对本机路径（task lint E6）。

必读
1. docs/spec/SPEC-web-lc-evidence-page_v1.md（00 签收注记是实现冻结点）
2. docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md（判定 pass）
3. docs/harness/prompts/10-task-requirements.md
4. 对照样例：docs/tasks/done/task_web_obs_status_consumer.md
5. docs/_tech_graph/l1/01_modules.md
6. 现网：src/router/index.ts、src/layouts/AppLayout.vue、src/api/http.ts、src/api/chat.ts、tests/chat-store.spec.ts、tests/http.spec.ts

必须产出 A · Task 文件
路径：docs/tasks/active/task_web_lc_evidence_page.md
- task_slug = web-lc-evidence-page
- git_branch = task/web-lc-evidence-page
- test_strategy = required
- test_strategy_note = Vitest：api client mock（含 {ok,data} 拆包 + snippet）+ store；断言不调用 /ops/chat/stream；pnpm lint / pnpm test / pnpm build；./scripts/graph-compile.sh
- code_quality_bar = L2_frontend（本仓无 docs/standards/CODING_*_L2，跟现网 Vue/TS 风格）
- graph_change_layer = G-L1
- graph_delta = docs/_tech_graph/l1/01_modules.md
- graph_delta_note = pages 备注加 LC Evidence；新增路由 /lc-evidence；不新增一级模块
- wiki_delta = docs/_tech_graph/l1/01_modules.md
- wiki_delta_note = G-L1 模块表增量；真值在 tech_graph
- invoke_retention_profile = default
- required_invoke_hats = 10,30,40
- experience_capture = recommended
- thinking_profile = shortest（仍须预置 R0+R1–R5 与思考轮控制表）

人工闸（10 起草时）
- HG-GRAPH-MODULES = approved（00 代签 2026-08-16：G-L1 pages/api/pinia 增量，不新增一级模块）
- HG-TASK-DRAFT = pending（留给 00 签）
- HG-AUDIT-R1 = pending（20-task-audit 后再由 00 签；禁止写成 approved）

范围
- src/views/LcEvidenceView.vue
- src/api/lcEvidence.ts（axios + withCredentials；本文件 timeout≥120000；拆 {ok,data}；禁止改 src/api/http.ts 全局 timeout/外壳约定）
- src/stores/lcEvidence.ts
- 可选 src/components/lc-evidence/*
- src/router/index.ts 增 /lc-evidence（需登录，不要 meta.public）
- src/layouts/AppLayout.vue 侧栏入口
- tests/：client + store（或视图）mock；禁止本页走 Chat SSE
- docs/_tech_graph/l1/01_modules.md pages 行备注加 LC Evidence

P0 UI：多行 query；提交中禁用；Meta 条 gate_action/best_relevance/kept_count；refuse 强调无可用证据；evidence 卡片 relevance 色标；answer 纯文本+换行；空态/加载/错误三分态。

非范围
- 不改 ChatView / useOpsChatSse / chat store 默认行为
- 不接 /ops/chat/stream
- 不实现 SSE 流式、多轮 session、Ingest、金样评测 UI
- 不改 ops-desk-api（HTTP 另仓）；本波 mock 契约先行，联调冒烟非本波硬验收（可选/blocked_by api）
- 不匿名公开

00 冻结（必须抄进「给 30 必读」）
- 响应 {ok,data} 仅 lcEvidence.ts 拆包
- mock 与类型必须含 snippet
- 本接口 timeout ≥ 120s
- 401 既有跳登录；422 表单；网络/超时 Alert+可重试；500 兼容 detail 与 {ok:false,error}
- 禁止 import useOpsChatSse

failure_paths 对齐 SPEC §5：401 / 网络超时 / gate_action=refuse（200） / API 404「旁路 API 不可用」 / 误接 Chat SSE（验收打回）。

思考轮：须有「思考轮控制」表 + ### R0 … ### R5（不要只写 SPEC 已想过）。actual_last_round=R5；early_stop=no；residual_risks=后端 HTTP 未合入则仅 mock。

必须产出 B · 10 invoke
路径：docs/harness/invokes/by-task/web-lc-evidence-page/invoke_20260816_10_web-lc-evidence-page.md
hat_id=10-task。用 docs/harness/invokes/TEMPLATE_invoke.md 结构。不要内嵌同长度围栏套围栏。

验证（必须真跑）

    npx @cyning/harness@2.24.0 task lint --file docs/tasks/active/task_web_lc_evidence_page.md

须 LINT: PASS。失败则修到绿。不要 --allow 豁免。

Git：task + invoke lint 绿后单独 commit（不要 add .codex/，不要 git add -A）：

    docs(task): draft task_web_lc_evidence_page (10-task)

不要 push。不要切分支。不要把 HG-AUDIT-R1 写成 approved。
````

---

## 交付摘要（本帽结束时填）

- **验证命令**：`npx @cyning/harness@2.24.0 task lint --file docs/tasks/active/task_web_lc_evidence_page.md` → 退出码 **0** · `LINT: PASS`
- **变更路径**：
  - `docs/tasks/active/task_web_lc_evidence_page.md`
  - `docs/harness/invokes/by-task/web-lc-evidence-page/invoke_20260816_10_web-lc-evidence-page.md`
- **下一棒**：交还 00 签 `HG-TASK-DRAFT` → 20-task-audit → 00 签 `HG-AUDIT-R1`（本帽不附 30 Prompt）

---

## 纪律

| 规则 | 说明 |
|------|------|
| 同帽追问 | **不** 新增 invoke；沿用本节路径 |
| 打回重开 | 新文件或 `_r2` 后缀 |
| 与 reviews 分工 | reviews = 结论；invoke = **当时指令** |
| close 机械闸 | `harness task close` 按 task 元信息 `required_invoke_hats` / `invoke_retention_profile` 校验帽集合覆盖（v2.12+；缺省 `10,30,40`；文件名含 `30_40` 可双计；`--allow-invoke-gap` 豁免） |
| 命名 | `invoke_YYYYMMDD_<hat>[_<hat>...]_<slug>.md`（hat token **仅**在日期后、slug 前连续段；slug 勿夹 `10`/`40` 等白名单段 · v2.12.1） |
| commit | 落盘 + task 回填后再 commit（见 HANDOFF） |

---

## 完整库 POINTER

Ink 工作区：`docs/harness/invokes/README.md` · 各 `TEMPLATE-*-invoke.md` §3

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-16 | 10-task 首稿落盘（与 10-spec invoke 分文件） |
