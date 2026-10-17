# invoke · 20-task-audit R2 · web-hitl-decision-surface

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-17 |
| hat | `20-task-audit`（R2 · 终轮 · R1 退回回填核验） |
| task_slug | `web-hitl-decision-surface` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（R1 退回→10-task 回填 v1 278 行 → R2 复审派单） |
| 审查对象 | `docs/tasks/active/task_web_hitl_decision_surface.md`（v1 · TC1–TC18+TC-L1~L5 共 23 条 · FP-H1~H13+FP-T1~T5） |
| 交付物 | `docs/harness/reviews/task_web_hitl_decision_surface_audit_R2_20261017.md`（本审查文） |
| 人工闸 | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 全 **pending**（未代签） |
| git 操作 | 零（不 commit · 不建分支 · 未推送） |

## Prompt 快照（委派要点）

> 按 R1 审查文回填清单逐条核验 R2 收口（含锚点真址抽验）：B1 新增 TC17 旧测 grep 影响面（四锚点照录 · 判据=枚举落 invoke · 零回归或改写留痕 · 面外改动即 FAIL）· B2 AC16①/② 归因更正七处 · nit a 66 it。结论落 reviews/ R2 件 + 本 invoke；签收/退回；严禁代签；零 git。

## 交付摘要

### 判定：**签收**（R2 终轮 · 零阻塞 · 零新 nit · 未代签 · 未附 30 Prompt）

### R1 回填清单核验

| 项 | 结果 |
|---|---|
| B1 TC17 旧测 grep 影响面 | ✅ 闭合：编号插位正确（TC17 新增 · 收口改 TC18 · 23 条）· 判据三件套承 AC17 先例 · 四锚点本帽真读复核全中——`chat-store-hitl.spec.ts:182-199`（缺 latency_ms 裁定 A · lastDone={null,''}）· `:202-213`（F-OBS-1 实值 139650 透传）· `:256-298`（hitl.resumed 穿插不崩）· `chat-view.spec.ts:390-428`（R1-NIT-2 徽标「—」）· ①②③ R1 已核无漂移 |
| B2 AC16①/② 归因更正 | ✅ 闭合七处：:59/:71/:73/:81/:87 + 依赖表 :204/:205 全改「承 done task task_web_chat_history_hitl_ux AC16①/②（:147）」并注 signed SPEC §7 仅 AC1–AC15 |
| nit a FP-T4 it 计数 | ✅ 闭合：65→66（与本帽 R1 实测一致）· 基线 263 口径不动 |

### R2 复核（防回填新伤）

- ✅ TC 编号链完整无丢无重（TC1–TC16 映射不动 · TC-L1~L5 原位）
- ✅ 思考轮控制表 R2/R4/R5 行同步（23 条口径一致）
- ✅ lint 本帽实跑复验 PASS · EXIT=0（v1 复跑声明属实）
- ✅ 人工闸全 pending（回填未动闸）
- ✅ R1 通过面零回退（v0→v1 仅 B1/B2/nit a 相关行增量）

### 流程闸交接

内容面签收；**HG-AUDIT-R1 仍 pending** → 审查文文末留维护者签闸清单（读 R2 结论 → 签 task 表 approved → commit/确认 → 再下发 30 Prompt）。本帽未代签 · 未附 30 Prompt。

## 纪律核验

- ✅ 未代签任何人闸（三闸 pending 维持）
- ✅ 未改 task/src/tests 任何文件（仅 read/grep/lint 取证据）
- ✅ 零 git 操作
- ✅ TC17 新增锚点全部本帽真读抽验（非抄 10-task 自述）· lint 实跑复验
- ✅ R2 为终轮 · 签收结论落盘 reviews/ + 本 invoke
