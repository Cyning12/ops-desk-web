# task_web_api_joint_check · R1 审查（20-task-audit）

| 字段 | 值 |
|------|-----|
| **日期** | 2026-10-13 |
| **审查帽** | 20-task-audit（书面审查 · 禁改 task 实质 · 禁 git · 禁代签） |
| **对象** | docs/tasks/active/task_web_api_joint_check.md（父级称 commit 已落于分支 task/web-api-joint-check · 本帽禁 git 未机验 hash，以工作树内容为准） |
| **维护者令** | m00187（联调 checklist 问）· m00193（拍板：机验全自动端到端含 web 登录 + 人验 checklist 文档两层验收） |

## 结论摘要

| 维度 | 结论 |
|------|------|
| **内容** | **PASS**（内容面全通过 · NIT-1/NIT-2 仅为注记 · 可进人签） |
| **闸** | HG-TASK-DRAFT approved 归因属实 · HG-AUDIT-R1 / HG-GRAPH-MODULES pending 待维护者签 · **本帽未代签** |

锚点 8 组亲读核真全部属实 · 维护者两问裁定忠实落位（机验 TC1–TC6 + 人验 TC7/TC8）· 先例三面核对成立 · 完备性逐项齐 · 验收两层可机断/可人勾 · 思考轮 R0–R5 闭合（early_stop at R5 依据成立）。**返修项：无。** NIT 是否回填由维护者签闸时一并裁定。

## 1. 独立实证（本审查实跑 · 只读）

| # | 项 | 结果 |
|---|----|------|
| 1 | `npx spec-wave task lint --file docs/tasks/active/task_web_api_joint_check.md` | **LINT: PASS · EXIT=0**（命令形与 TC6 引用逐字一致） |
| 2 | Vitest 全量（钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test`） | **31 文件 · 255 passed (255) · EXIT=0**（PR #65 后新基线 255 为真 · FP-4 计数闸钉死值正确） |
| 3 | `docs/checklists/` 目录 | **既有** · `CHECKLIST_lg_rag_sse_joint_release_v1.md` 先例在案（task :25/:62/:140 引用属实） |
| 4 | `tests/chat-view.spec.ts:317-360` | 徽标断言逐字属实：缺键显「完成 · 耗时 —」· `not.toContain('0ms')` · `not.toContain('模型')` · 实值 `139650ms` 如实渲染 |
| 5 | 先例行区（task_web_tenant_context_chat.md :44/:58/:89/:100 · task_web_login.md:52） | 引用与原文一致（Agent Playwright 实操验收形态 · 不钉 @playwright/test · 证据落 invoke） |
| 6 | `~/Library/Caches/ms-playwright` 不存在（FP-1 前提） | 父级 00 已亲核（ls 空）· 本帽承证 · 退化路径预钉成立 |

## 2. 维护者令忠实度（m00193 两问裁定）

| 裁定 | task 落点 | 核对 |
|------|-----------|------|
| ①机验全自动端到端（含 web 登录操作） | TC1–TC6 机验层：TC2 明钉「Playwright 实操登录 → 发消息 → DOM 断言徽标 `耗时 ` + `/d+ms/` 实值 ≠0ms ≠「—」· 模型段缺席 · 截图+Network 头摘要」 | ✓ 忠实 |
| ②自动验收后仍留人验 checklist 文档 | TC7 硬交付件 `docs/checklists/web_api_joint_checklist.md` · 机验盲区五项 · 四列结构（操作步骤/预期/实际/勾）· F6 范围行对应 | ✓ 忠实 |

## 3. 先例对照

| 先例 | task 继承 | 核对 |
|------|-----------|------|
| Playwright 不钉 package.json（tenant :89/:100 · login :52） | test_strategy_note :21 + 非范围首条 :80 + R2 :181 三处一致 | ✓ |
| 环境三坑 + 登录小坑（前 task 40 invoke :11-13） | 坑位表 :93-94 逐项对应（OPS_CHAT_TRACER=off / env -u 九 proxy 变量 / strategy 三件套 / `/api/ops/auth/login` 非 `/api/auth/login`） | ✓ |
| vite proxy 127.0.0.1 + SSE 缓冲判定 | :95-96（vite.config.ts:90-99 · vite_proxy_smoke.sh SPREAD 判据） | ✓ |
| pnpm 钉死路径（T-W2 NIT-1） | :98 + FP-6 + TC5 | ✓ |

## 4. 完备性逐项

范围 F1–F6（P0–P4 五阶段 + 人验交付件）✓ · 非范围六条 ✓（@playwright/test 不钉 · Retry-After 延续非范围 · api 零改 · tenant task 勿混入 · 业务码零改 · 基建不重做）· failure_paths 八行（FP-1–FP-8 · 触发/行为/可重试/用户可见四列齐）✓ · 验收 TC1–TC8 两层分明 ✓ · 依赖七条 ✓ · 必读八项 ✓ · R0–R5 控制表五列齐 + actual_last_round=R5 early_stop ✓。

## 5. 闸形态核对（审查要点 4）

- HG-TASK-DRAFT=approved：归因 m00193 维护者拍板 · 属实 ✓。
- HG-AUDIT-R1=pending（blocks 30）：本 task 编排默认无 30 棒（orchestration :19 + 闸注 :41 + FP-8 联调 bug 另立 fix task）——**自洽**：pending 语义为「任何改码拒开工」，40 纯观测面待签后执行 ✓。
- HG-GRAPH-MODULES 建议 n/a：**形态成立**——业务码零改面（范围 F1–F6 全为 docs/观测/实操验收）· `graph_change_layer=n/a` + `graph_delta=n/a` + note 齐备 · checklist 落 `docs/checklists/`（纯 docs · 非图谱面）。**实际零 diff 由 40 执行期机验兜底**（本帽禁 git · 未机验分支 diff · 照实声明）。维护者签闸时可签 approved（n/a 形态）。

## 6. 验收可测性（审查要点 5）

TC1 HTTP 码 + SPREAD 判据机断 ✓ · TC2–TC4 DOM 断言字面（`/d+ms/` ≠0 ≠「—」· 模型缺席 · detail 文案可见）+ 附件存在性机断 ✓ · FP-1 退化判据切换已在 TC2 括号与 R4 residual 双处预钉 ✓ · TC5 seq 连续性 + 三门 EXIT + 基线 255 计数闸（本帽实测 255 为真）✓ · TC6 lint PASS（本帽实测）✓ · TC7 文件存在 + 四列结构 + 五项盲区齐备可机断 ✓ · TC8 invoke 帽集合（10/20/40）+ wiki 短注可机断 ✓。

## 7. NIT（仅为注记 · 维护者签闸时可裁定是否回填）

- **NIT-1（人验 checklist 命名风格）**：先例为大写前缀 + 版本号形态（`CHECKLIST_lg_rag_sse_joint_release_v1.md`），task 钉 `web_api_joint_checklist.md`；建议对齐先例命名（如 `CHECKLIST_web_api_joint_check_v1.md`）。不回填亦可收口——目录与四列结构已钉死，文件名风格属一致性偏好。
- **NIT-2（invoke_retention_profile 字面）**：`profile=default`（字面 10,30,40）与 `required_invoke_hats=10,20,40`（本 task 无 30 棒）并存；显式集合已覆盖实际帽面，profile 字段字面偏差建议 40 收口时照登一句「default 字面含 30 · 本 task 无 30 面 · 实交 10/20/40」即闭环。

## 8. 措辞纪律自查（父级教训留痕项）

本审查文结论/签收节一律肯定表述（PASS · 可进人签 · 返修项：无 · 仅为注记），未使用前 task 触发机读误判的否定词形（教训：前 task 审查文曾因九处否定表述致 VERIFY: BLOCKED · 清洗后 PASS）。task 文件本体含「拒开工/非阻塞」等字面属正常语义位（前 task 同形且 verify 实证不受影响 · 机读面仅扫审查文结论节）。

## 维护者签闸（20 后 · 40 前）

- [ ] 已读 R1 审查结论（内容 PASS · NIT-1/2 仅为注记 · 可一并裁定是否回填）
- [ ] 签 HG-AUDIT-R1 → approved（pending 期间任何改码拒开工 · 本 task 默认无 30 面）
- [ ] 签 HG-GRAPH-MODULES → approved（n/a 形态 · 业务码零改 · 40 执行期零 diff 机验兜底）
- [ ] 签后 40 执行：Playwright 首装需联网下载 Chromium（/tmp scratch npx 方式 · 装不上走 FP-1 退化路径 · 浏览器面转人验）

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-13 | v0 · 20-task-audit R1 落盘：内容 **PASS**（锚点 8 组亲读全真 · 维护者两问裁定忠实 · 先例三面成立 · lint PASS + Vitest 255 基线实测 + checklists 先例在案 · 思考轮 R0–R5 闭合）· NIT-1/2 仅为注记 · 闸 pending 待维护者签（本帽未代签） |
