# invoke · 20-task-audit · web-hitl-decision-surface

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-17 |
| hat | `20-task-audit`（R1 · task 书面审） |
| task_slug | `web-hitl-decision-surface` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（task v0 draft R1 书面审 · 承同目录 10/20-spec-audit invoke） |
| 审查对象 | `docs/tasks/active/task_web_hitl_decision_surface.md`（276 行 · draft · TC1–TC16+TC-L1~L5+TC17 · FP-H1~H13+FP-T1~T5） |
| 交付物 | `docs/harness/reviews/task_web_hitl_decision_surface_audit_R1_20261017.md`（审查文） |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 全 **pending**（未代签） |
| git 操作 | 零（不 commit · 不建分支 · 未推送） |

## Prompt 快照（委派要点）

> 对 task draft 做 R1 书面审，对照面全部亲读抽验：signed SPEC（TC↔AC1–AC16 一一映射 · 非范围零越界 · 追帧上限 ≤10次/≤120s 定稿与照登一致）· 20-spec-audit 审查文 nit×3 体内闭合（N1 真址 chat.ts:569-597 亲读 · N2 AC16①/② 消歧 · N3 grep/diff 断言形态专节）· SPEC-web-chat-history-hitl-ux AC16 原文对照 · 40 棒位与上游契约一致（RUNBOOK §6 · close FP-4/FP-5 live 实证）· 人工闸全 pending · 思考轮控制表 · lint PASS 留痕真实性。结论落盘 reviews/ + 本 invoke；签收或退回（列回填清单）；严禁代签任何闸；零 git。

## 交付摘要

### 判定：**退回 10-task**（内容阻塞 2 条 · nit 1 条 · 零代签 · 未附 30 Prompt）

### 核对面与结果

| 核对面 | 结果 |
|---|---|
| TC↔AC 一一映射（对 signed SPEC AC1–AC16） | ✅ 16/16 全映射无缺漏（TC1–TC16 逐条对拍 SPEC §7）· TC-L1~L5 为 40 预留 · TC17 收口 |
| 非范围零越界 | ✅ SPEC 十条全承 + task 增补两条（上限参数扩张锁 · 零 git 注记）· 与 signed SPEC 轮询排除零冲突 |
| 追帧上限定稿 ≤10次/≤120s | ✅ 与 SPEC 照登「≤10 次或 ≤120s」语义等价（任一界先触即停）· FP-T5 沉降窗落差预钉成立 |
| nit×3 体内闭合 | N1 ✅（亲读 chat.ts:560-609：接口 :569-572 · 定义 :578 · cursor 合成 :581-591 逐行属实）· N3 ✅（搜索面/排除面/判据三件套专节在案）· **N2 半闭合 → B2**（消歧功能达成 · 归因失真） |
| 40 棒位上游一致性 | ✅ TC-L1 终帧三要素对 close TC-4（latency_ms:435584）· TC-L2 两形态对 FP-4（409+retry-after:2 逐字）· TC-L3 对 FP-5（「该申请的恢复正在执行中」逐字）· RUNBOOK §6 五锚点全覆盖 |
| 人工闸 | ✅ 全 pending 未代签（表与自检一致 · FP-H13 拒开工在案） |
| 思考轮控制表 | ✅ R0–R5 四列全填 · early_stop at R5 理由成立 |
| lint PASS 留痕 | ✅ 本帽实跑复验 `npx spec-wave task lint` → PASS · EXIT=0（2026-10-17） |
| 基线 263 | ✅ 与 reverify done task :219 实录（Vitest 31 文件 263/263）一致 |

### 阻塞（退回回填清单）

1. **B1 缺「旧测 grep 影响面」验收项**：本 task 改 409 fallback 语义 + done/追帧链接入新行为，属行为变更类；验收无旧测影响面枚举（承 task_web_chat_history_hitl_ux R1 fail → AC17 回填先例同口径）。本帽已代查四行影响面（chat-store.spec.ts:745 replay 409 错误条锁存存续 · chat-store-hitl.spec.ts:475-482 decide 409 存续 · :354/:589/:615 AC16①/② 计数口径 · done 分支旧测族），10-task 照录补列。
2. **B2 AC16①/② 归因失真**：signed SPEC-web-chat-history-hitl-ux §7 仅 AC1–AC15 无 AC16；AC16①/② 真址 done task `task_web_chat_history_hitl_ux.md:147`（N1 回填）。task :59/:71/:73/:87/:81「承 signed SPEC AC16①/②」须更正（nit N2 原文措辞为此失真之源 · 本 R1 更正记录）。

### nit（非阻塞）

- nit a：FP-T4「chat-store 65 it」实测 66（`it(` 计数两轮复核）· 微差不影响基线 263 口径。

### 下一棒

10-task 回填 B1/B2（+nit a）→ 20-task-audit R2 复审 → 签收后维护者签 HG-AUDIT-R1 → 方可 30。

## 纪律核验

- ✅ 未代签任何人闸：三闸维持 pending（退回期 30 拒开工存续）
- ✅ 未改 task 实质内容 · 未改 src/ 与 tests/ 任何文件（仅 read/grep/lint 取证据）
- ✅ api 仓只读：RUNBOOK §6 + close_hitl_ops_runbook 亲读 · 零写入
- ✅ 零 git 操作
- ✅ 对照面全部本帽亲读抽验（SPEC 全文 · 20 审查文 · chat.ts N1 区段 · signed SPEC §7 全文 · done task AC16 溯源 · 旧测 409 面 · 上游 §6/FP-4/FP-5）· lint 实跑非抄自述
- ✅ 退回不落 30 Prompt · 审查文文末仅留维护者签闸清单（暂存待 R2）
