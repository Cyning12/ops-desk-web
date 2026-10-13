# Invoke：web-api-joint-check · 10-task 起草（2026-10-13）

| 字段 | 值 |
|------|-----|
| **hat_id** | 10-task |
| **task** | docs/tasks/active/task_web_api_joint_check.md |
| **分支 / HEAD** | task/web-api-joint-check（起草时 HEAD 6e1e8cd · base main `aef91f3` 含 PR #65） |
| **来源** | 维护者令（m00187 问「是否需要阶段性前后端联调 checklist」· m00193 拍板：「新建 task · 机验全自动端到端（含 web 登录操作）+ 自动验收后仍留人验 checklist 文档」）· 00 委派子 Agent 10 落稿 |

## 委派令工作项 → task 映射

| 维护者拍板 | task 落点 |
|------------|-----------|
| 机验全自动端到端（含 web 登录操作） | 验收机验层 TC1–TC6（curl/SSE 脚本 + **Agent Playwright 实操**：登录 → 发消息 → 审批 → resume → DOM 断言 + 截图 + Network 头摘要）· 范围 F1–F5 |
| 自动验收后仍留人验 checklist 文档 | 验收人验层 TC7：`docs/checklists/web_api_joint_checklist.md` 硬交付件（机验盲区五项 · 「操作步骤/预期/实际/勾」四列）· 范围 F6 |
| 阶段性前后端联调 checklist（P0–P4） | 范围 F1/P0 环境就位 · F2/P1 冒烟基线 · F3/P2 HITL 主链（F-OBS-1 浏览器实证）· F4/P3 在飞 409 面（F-OBS-2 浏览器实证）· F5/P4 断线恢复 + 回归 |

## 裁定留痕（10 起草判定 · 待 20 R1 核对）

- **业务码零改面**：本 task 默认无 30 棒；联调暴露 bug → 另立 fix task 走自身闸（FP-8 · 禁顺手改码）。
- **Playwright 不钉 package.json**：对齐 tenant 先例（`task_web_tenant_context_chat.md:100` 非范围「不强制入库 CI 套件」）· /tmp scratch 目录 npx 临时装 · E2E 框架入库为 W8 后置评估项。
- **FP-1 退化路径预钉**：`~/Library/Caches/ms-playwright/` 目录不存在（2026-10-13 ls 亲核）→ 装不上则 curl 层全机验照旧 + 浏览器面整列转人验 checklist · 不阻塞 task 收口。
- **HG-GRAPH-MODULES 建议 n/a**：纯 docs + invoke + checklist 件 · `docs/_tech_graph/l1/01_modules.md` 不动 · 由 20 审确认形态。
- **Vitest 新基线 255**（PR #65 后 · 前 task 40 post-30 独立复验实测）：三门绿为回归证明（非改码闸）。
- **Retry-After 自动退避延续非范围**（前 task 裁定 C 口 · 本 task 不 reopen）。
- **孤儿 run 观察项延续照登**（api 侧遗留 `22b65ce2`/`4740a8a0` 同形态 · FP-2 非阻塞 · 人眼确认入人验层）。

## 亲读核真锚点（10 已读 · 禁信转述）

- 模板：`docs/tasks/done/task_web_hitl_fobs_receipt.md`（完备形态对齐源）
- Playwright 先例：`docs/tasks/active/task_web_tenant_context_chat.md` :44/:58/:89/:100 · `docs/tasks/done/task_web_login.md:52`
- checklist 先例：`docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（目录既有件）
- 环境真值：`docs/harness/invokes/by-task/web-hitl-fobs-receipt/invoke_20261013_40_verify.md` :11-13（三坑 + 登录路由 `/api/ops/auth/login` 小坑）
- 徽标单元断言面：`tests/chat-view.spec.ts:317-360`（浏览器实证的对照基线）
- 后端契约：api master `9ee928c` · `../ops-desk-api/docs/harness/invokes/by-task/hitl-resume-replay-contract/invoke_20261013_40_verify.md`（只读）

## 闸状态（起草时）

- HG-TASK-DRAFT：**approved**（维护者 m00193 令 · 00 委派代录）
- HG-AUDIT-R1：**pending**（须 20-task-audit R1 + 维护者签 · 不代签）
- HG-GRAPH-MODULES：**pending**（建议 n/a · 20 审确认形态后维护者签 · 不代签）

## 机检

- 委派令命令形 `npx spec-wave lint --task` **不存在**（stderr「未知命令: lint」）；仓真值形 `npx spec-wave task lint --file <task>`（task TC6 与自检节已钉真值形）。
- 首跑 LINT: FAIL EXIT=2 · **[E3] ## 验收标准 节内无任何勾选项** —— 根因：TC 条目嵌在 `### 机验层`/`### 人验层` 子节下，lint 只认 `## 验收标准` 直层 `- [ ]` 项 → 拍平子节、层级标签内联进 TC 行后 **LINT: PASS · EXIT=0**（回填后复跑仍 PASS）。
- 教训留痕：验收清单禁嵌套子节（对齐 receipt 模板直层形态）。

## 纪律自检

零实现码改动 · 零 git 操作（add/commit/push 均未做 · 留 00 统一提交）· 零闸代签 · 仅新增两文件（task + 本 invoke）。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-13 | 10 落稿：task v0（两层验收 TC1–TC8 · P0–P4 五阶段 · failure_paths 八行 · R0–R5 early_stop at R5）· lint E3 首败修复后 PASS · invoke 落盘 |
