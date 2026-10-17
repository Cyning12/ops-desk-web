# 20-task-audit R2 审查：task_web_hitl_decision_surface（web-hitl-decision-surface）

> **hat**：20-task-audit（task 书面审 · 不实现 · 不改 task 实质内容 · 不代签人工闸）
> **审查对象**：`docs/tasks/active/task_web_hitl_decision_surface.md`（v1 · 278 行 · R1 退回回填后 · draft · 人工闸全 pending）
> **日期**：2026-10-17 · **轮次**：R2（R1 退回 B1/B2+nit a 回填核验 · 终轮）
> **前序**：R1 审查文 `docs/harness/reviews/task_web_hitl_decision_surface_audit_R1_20261017.md`（退回 · 阻塞 B1 缺旧测 grep 影响面验收项 · B2 AC16①/② 归因失真 · nit a it 计数微差）
> **对照真值（全部本帽亲读抽验）**：task v1 全文 278 行 · `tests/chat-store-hitl.spec.ts:182-199/:202-213/:256-267` + `tests/chat-view.spec.ts:390-409`（TC17 新增锚点真址复核）· signed `SPEC-web-chat-history-hitl-ux_v0.md` §7（AC1–AC15 · R1 已核）· done task `task_web_chat_history_hitl_ux.md:147`（AC16①/② 真址 · R1 已核）· task lint 本帽实跑复跑

## 判定：**签收**（R1 阻塞 B1/B2 全闭合 · nit a 已更 · 零新阻塞 · 人工闸维持全 pending 未代签 · 本轮为终轮）

---

## 一、R1 回填清单逐条核验

### B1 · 旧测 grep 影响面验收项 → **闭合** ✅

新增 **TC17**（:184 · 插于 TC16 后 · 原收口 TC17 改 TC18 · 验收 22→23 条）：

| 核验点 | 结果 |
|--------|------|
| 行为变更定性照录（改 resume 409 fallback 语义 + done/追帧链新行为） | ✅ :184 首句 |
| 判据三件套（30 开工前枚举落 invoke · 交付零回归或改写逐条留痕 · 面外旧测改动即 FAIL） | ✅ 承 done task AC17 先例口径（修订记录 :278 注明先例） |
| 锚点① `chat-store.spec.ts:745-752` replay 409 错误条锁存 · 手动路径勿误改 | ✅ R1 已真读（F-OBS-2 · else 分支 retryable 错误条 + detail 透传 + active-run 保留）· R2 复核无漂移 |
| 锚点② `chat-store-hitl.spec.ts:475-482` decide 409「已被处理」存续 | ✅ R1 已真读 · R2 复核无漂移 |
| 锚点③ `chat-store-hitl.spec.ts:354/:589/:615-629` AC16①/② 消费点计数口径 | ✅ R1 已真读（:354/:589/:615 注释与 it 题名逐行在案）· R2 复核无漂移 |
| 锚点④ done 帧断言族 | ✅ **本帽 R2 真读复核**：`chat-store-hitl.spec.ts:182-199` = done{resumed} 缺 latency_ms 裁定 A（lastDone={null,''}）· `:202-213` = 携实值 F-OBS-1（139650 透传）· `:256-298` = hitl.resumed 穿插 default 忽略不崩 · `chat-view.spec.ts:390-428` = R1-NIT-2 徽标「—」/实值渲染——四段与 TC17 描述逐段相符 |

TC17 明确「新语义另起新用例 · resumed 新支不得扰动既有断言」，与 R1 代查建议一致；10-task 声明四锚点已逐处真读，本帽抽验全部属实。

### B2 · AC16①/② 归因更正 → **闭合** ✅

逐处核验（R1 点名 :59/:71/:73/:81/:87 + 依赖表）：

| 位置 | v1 现状 | 结果 |
|------|---------|------|
| :59 nit N2 行 | 「承 done task `task_web_chat_history_hitl_ux` AC16①/②（task 级验收项 · 真址 :147）」+ 注「signed SPEC §7 仅 AC1–AC15 无 AC16」 | ✅ |
| :71 现状锚点表 | 「承 done task … AC16① 存续」 | ✅ |
| :73 | 「承 done task … AC16②」 | ✅ |
| :81 测试面行 | 「承 done task … AC16② 降级断言在案（chat-store-hitl.spec.ts:615-629）」 | ✅ |
| :87 F1 | 「承 done task … AC16①/② 两消费点补第三点（真址 done task :147 · R1-B2 归因更正）」 | ✅ |
| :204 依赖表 SPEC 行 | 注「§7 仅 AC1–AC15 无 AC16 · R1-B2 钉」 | ✅ |
| :205 依赖表 done task 行 | 「AC16①/② 消费点真址 :147 · task 级验收项」 | ✅ |

修订记录 :278 v1 行如实载明更正缘由；自检结论 :269 同步。消歧功能（自有 AC16=G-L1 vs done task AC16①/②）与归因真值双闭合。

### nit a · FP-T4 it 计数 → **闭合** ✅

:159 改「chat-store 66 it（R1-nit-a 更正 · `it(` 计数两轮复核）」，与本帽 R1 实测 66 一致；基线 263 口径不动。

---

## 二、R2 复核项（防回填引入新伤）

| 复核项 | 结果 |
|--------|------|
| TC 编号链完整性：TC1–TC16（AC 映射不动）+ TC17（新增）+ TC-L1~L5（40 预留原位）+ TC18（收口 · 原 TC17 内容逐字未变仅改号） | ✅ :168-193 通读 · 无丢条无重号 |
| 思考轮控制表同步：R2 行「+ R1-B1 回填 TC17 + 收口 TC18」· R4 行「TC17 旧测影响面清点（R1-B1）· TC18 收口」· R5 行「验收 23 条」 | ✅ :229/:231/:232 同步无矛盾 |
| lint PASS 留痕（v1 复跑声明 :266） | ✅ 本帽实跑复验：`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_decision_surface.md` → `LINT: PASS` · EXIT=0（2026-10-17 R2 复跑） |
| 人工闸表 | ✅ HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 全 **pending**（:42-44 · 回填未动闸 · 未代签） |
| R1 通过面无回退：TC↔AC 16/16 映射 · 非范围 12 条 · 追帧上限定稿 · N1/N3 闭合 · TC-L 棒位 · 坑位表 · FP 18 行 | ✅ 通读 v1 全文 · 仅 B1/B2/nit a 相关行有增量，其余逐行同 v0 |

---

## 三、阻塞项

**无。**（R1 两条全闭合 · R2 未发现新阻塞）

## 四、非阻塞 nit

**无新增。**（R1 nit a 已闭合）

---

## 五、结论与流程闸

**签收（R2 终轮 · 书面审 PASS）**：task v1 内容可执行性零阻塞——TC↔AC 映射完备 · 非范围零越界 · 追帧上限定稿与 SPEC 照登一致 · nit×3+R1-B1/B2 全闭合 · 锚点真值抽验全中 · lint 实跑 PASS。

**流程闸状态（内容 / 流程分列）**：内容面本帽签收；**流程闸 HG-AUDIT-R1 仍 pending**——本帽不签发 30 授权，真值以 task 人工闸表为准。

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R2 审查结论（R1 退回→回填→R2 签收史照登）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 20-task-audit R2：**签收**（终轮）——R1 阻塞 B1（TC17 旧测 grep 影响面 · 四锚点本帽真读复核全中 · 承 AC17 先例口径）/B2（AC16①/② 归因更正七处全落 · 真址 done task :147）/nit a（66 it）全闭合；TC 编号链 23 条无丢无重 · 思考轮表同步 · lint 复跑 PASS EXIT=0 · 闸全 pending 未代签 · 零 git 操作 · 未改 task/src/tests 任何文件 |
