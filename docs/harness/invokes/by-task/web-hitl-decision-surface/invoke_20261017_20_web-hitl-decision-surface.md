# invoke · 20-spec-audit · web-hitl-decision-surface

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-17 |
| hat | `20-spec-audit` |
| task_slug | `web-hitl-decision-surface` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（SPEC v0 draft R1 书面审 · 承 10 invoke 同目录） |
| 审查对象 | `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（300 行 · AC1–AC16 · FP-H1–H13 · D1–D4 · 非范围十条） |
| 交付物 | `docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md`（本审查文） |
| 人工闸 | HG-SPEC-SIGNOFF=**pending**（未代签 · D-A 定夺留人签） |
| git 操作 | 零（不 commit · 不建分支 · 未推送） |

## Prompt 快照（委派要点）

> 对 SPEC v0 draft 做书面审查 R1，结论落盘 docs/harness/reviews/ + 本 invoke。核对：范围/非范围越界或漏面 · AC 可机断且与 freeze lg-rag-sse-v1 契约逐键一致（禁自造字段）· failure_paths 覆盖度 · R0–R5 思考轮控制 · 三条照登点（D-A 轮询偏差 / D-C 错误面扩展 / 追帧上限）裁处如实留痕。对照上游四件（RUNBOOK / signed SPEC Q4 / 双 close 档 · api 仓只读）与本仓 src 锚点抽验真伪。结论签收或退回；严禁代签 HG-SPEC-SIGNOFF；零 git。

## 交付摘要

### 判定：**pass**（零阻塞 · nit 3 条转 task 阶段 · 不代签）

### 核对面与结果

| 核对面 | 结果 |
|---|---|
| 契约冻结面逐字一致性（§2 对 RUNBOOK §1/§1.5/§2/§5/§6 + 双 close 档） | ✅ 8/8 面通过：字段族/状态码/409 双 detail 原文/Retry-After:2/终帧三要素/PR 哈希 #248 acac5e6·#250 56e4a9f·#252 0e5f6b1·#264 dd6e02d/live 实测值 135574·435584/Q4 裁定原文——全部可溯，零自造字段 |
| 范围 D1–D4 覆盖 + 越界扫描 | ✅ 覆盖 RUNBOOK §6 交接五件；全局面板/轮询/api 仓等越界面均显式非范围；D3-2 触 useLgRagSse 仅错误面（非范围②例外互锁） |
| 非范围十条 | ✅ 与 signed SPEC-web-chat-history-hitl-ux（:130 轮询定时器排除）零冲突 |
| AC1–AC16 可机断 | ✅ 调用顺序/fake timers/分态分流/DOM/grep/diff/pnpm 三门全覆盖 |
| FP-H1~H13 覆盖度 | ✅ 契约全失败码 + 现状假相（FP-H4）+ 双「未完成」信号分流（H2/H3）+ 流程闸（H13） |
| R0–R5 思考轮 | ✅ 全 done · early_stop=no · 开放裁定仅 D-A 一条如实待人裁 |
| file:line 锚点抽查（15 项本帽真读） | 14/15 全中；**1 项漂移**：D3-1 引 `extractFrameCursor` `chat.ts:476-495` → 真址 `src/stores/chat.ts:569-597`（函数真实 · 语义正确 · 仅行号漂移）→ nit N1 |
| 三条照登点 | ✅ D-A（§5 D-A 偏差照登 + 非范围⑤ + R5 开放裁定）· D-C（纪律 1 + 非范围②例外 + S2 弃选留档）· 追帧上限（D3-1 建议值 + AC7 只钉有界）——全部如实留痕 |

### nit（非阻塞 · 转 task 阶段）

1. **N1**：D3-1 `extractFrameCursor` 行号漂移 :476-495 → 真址 `chat.ts:569-597`（task 起草时更正引用）
2. **N2**：D1-1「承 AC16」指 signed SPEC 的 AC16①/②，与本 SPEC 自有 AC16（图谱条目）同号歧义，task 阶段消歧
3. **N3**：AC3/AC12/AC13 grep/diff 类断言形态建议 task 阶段钉死（搜索面/排除项/基线计数）

### HG-SPEC-SIGNOFF 建议

建议维护者签收 **approved（含 D-A 定夺）**——签收即默认认可 D-A S1 事件驱动刷新；若要轮询须显式推翻并修订非范围⑤。**本帽未代签**，SPEC 人闸表维持 pending。

## 纪律核验

- ✅ 未代签任何人闸：HG-SPEC-SIGNOFF 维持 pending（人签含 D-A 定夺）
- ✅ 未改 SPEC 实质内容 · 未改 src/ 任何文件（仅 read/grep 取证据）
- ✅ api 仓只读：RUNBOOK/signed SPEC/双 close 档全真读 · 零写入
- ✅ 零 git 操作
- ✅ 锚点抽验全部本帽真读复核（非抄 SPEC 自述 · 15 项清单见审查文 §一.7）
- ✅ 下一棒已钉：人签后 00 起草 web task（无 blocked_by · nit N1/N2/N3 随 task 闭合）
