# 20-task-audit R1 审查：task_web_hitl_decision_surface（web-hitl-decision-surface）

> **hat**：20-task-audit（task 书面审 · 不实现 · 不改 task 实质内容 · 不代签人工闸）
> **审查对象**：`docs/tasks/active/task_web_hitl_decision_surface.md`（276 行 · draft · TC1–TC16+TC-L1~L5+TC17 · FP-H1~H13+FP-T1~T5 · 人工闸全 pending）
> **日期**：2026-10-17 · **轮次**：R1
> **对照真值（全部本帽亲读抽验）**：
> - 已签 SPEC：`docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（300 行 · HG-SPEC-SIGNOFF=approved · 含 D-A 定夺 S1）
> - 20-spec-audit 审查文：`docs/harness/reviews/spec_web_hitl_decision_surface_audit_R1_20261017.md`（pass · nit N1/N2/N3）
> - 本仓码面：`src/stores/chat.ts:560-609`（N1 真址复核）· signed `docs/spec/web-chat-history-hitl-ux/SPEC-web-chat-history-hitl-ux_v0.md` §7 全文（AC 编号对照）· `docs/tasks/done/task_web_chat_history_hitl_ux.md`（AC16 溯源 + R1 fail 先例）· `docs/tasks/done/task_web_hitl_resume_async_reverify.md`（基线 263 实录）· `tests/chat-store.spec.ts` / `tests/chat-store-hitl.spec.ts`（409 旧测面真读）
> - 上游（ops-desk-api 只读）：`docs/guides/RUNBOOK_hitl_ops_v1_zh.md` §6（:228-242）· `docs/tasks/close/close_hitl_ops_runbook_20261017.md`（FP-4 :52 · FP-5 :53 · TC-4 :43）

## 判定：**退回 10-task**（内容阻塞 2 条 · 流程闸维持全 pending 未代签 · 禁止附 30 Prompt）

---

## 一、核对表（通过项）

### 1. TC↔AC 一一映射（对 signed SPEC AC1–AC16）

✅ **16/16 全映射无缺漏**：TC1↔AC1 · TC2↔AC2 · TC3↔AC3 · TC4↔AC4 · TC5↔AC5 · TC6↔AC6 · TC7↔AC7 · TC8↔AC8 · TC9↔AC9 · TC10↔AC10 · TC11↔AC11 · TC12↔AC12 · TC13↔AC13 · TC14↔AC14 · TC15↔AC15 · TC16↔AC16（逐条与 SPEC §7 :216-237 对拍 · 判定语义/D 锚点/FP 归属一致）。不合并归类的裁定（R2：消歧成本 > 归类收益）与 N2 教训自洽。TC-L1~L5 为 40 live 预留棒位 · TC17 收口，不计 AC 映射面。

### 2. 非范围零越界

✅ SPEC §4 十条全承（task :97-106 逐条对拍：api 仓 / SSE freeze+D-C 例外互锁 / 端点语义 / OA HMAC 三面明列 / WS 推送+轮询定时器 / 全局面板 / 单端点合并 / auto 运维化 / B1 历史面 / 禁伪造）。task 增补两条：:107 追帧上限参数扩张锁（与本 task 定稿权自洽 · 防 30 擅自放大）· :108 零 git 存续（流程注记 · 无害）。对照 signed SPEC-web-chat-history-hitl-ux 轮询排除条款无冲突。

### 3. 追帧上限定稿与 SPEC 照登一致性

✅ SPEC D3-1 照登「建议 ≤10 次或 ≤120s · 30 定稿写 task」→ task 定稿「连续追帧 ≤10 次 且 墙钟 ≤120s（先到为准）」（F3 :89 · FP-H2 · 非范围 :107 · R2/R3 留痕）。「且…先到为准」= 任一界先触即停，与 SPEC「或」语义等价（双界取紧），非偏差。与上游 130–310s 沉降窗的落差以 FP-T5 预钉（超限降级属预期正确行为 · 40 照登不误判），轮询轰炸禁令优先的取舍理由在 R2 留痕，成立。

### 4. nit×3 体内闭合核验（20-spec-audit R1 转出）

| nit | task 消化落点 | 本帽复核 | 结果 |
|-----|--------------|---------|------|
| N1 行号漂移 | :58/:75/:89 锚点一律真址 `src/stores/chat.ts:569-597` · FP-T3 grep 定位纪律 | 本帽亲读 `chat.ts:560-609`：`FrameCursor` 接口 :569-572 · `extractFrameCursor` 定义 :578 · cursor 兜底合成 :581-591 —— 逐行属实 | ✅ 闭合 |
| N2 AC 同号歧义 | :59/:71/:73/:87 一律写「承 signed SPEC AC16①/②」· 自有 AC16=G-L1 消歧 | 消歧**功能**达成（同号两义已分开）；但**归因失真**——见阻塞 B2 | ⚠️ 半闭合 → B2 |
| N3 grep/diff 断言形态 | 「grep/diff 断言形态钉死」专节（:112-118）：AC3/AC13/AC12 三条各钉搜索面/排除面/通过判据三件套 · FP-T2 口径漂移判 FAIL 链 | 三件套齐备 · 排除面含注释行/tests/** · 基线计数钉 0 · 承 N2 先例形态 | ✅ 闭合 |

### 5. 40 live 棒位与上游契约一致性（TC-L1~L5）

✅ 逐条对拍：TC-L1 终帧三要素 `done{status:resumed, latency_ms:int≥0, 无 model 键}` 与 close TC-4（:43 · 实测 `latency_ms:435584`）/RUNBOOK §6 终帧渲染纪律（:242）一致；TC-L2 在飞窗两形态（200 部分帧续追 / 409+Retry-After:2）与 RUNBOOK §1.5 nuance + FP-4 live 实证（close :52 · detail "Run is still in flight; retry after it settles." 逐字）一致，「均属正确」预钉防假红；TC-L3 resume 在飞 409 与 FP-5 live 实证（close :53 · 「该申请的恢复正在执行中，待沉降后再试」逐字）一致；TC-L4 驳回/immediate 双链承 reverify 先例；TC-L5 未命中判 n/a 不假造触发。RUNBOOK §6 交接锚点五件（pending/decide/resume/replay/SSE freeze · :234-240）在 SPEC §2 与 task 范围全覆盖。AC6/TC6 徽标值 435584 与上游实测同源，非杜撰。

### 6. 人工闸与流程纪律

✅ 人工闸表（:40-44）HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 pending · 未代签**，自检结论（:266）与表一致。FP-H13 拒开工闸在案（:155）。本帽亦未代签任何闸。

### 7. 思考轮控制表

✅ R0–R5 齐备（:224-231）：各轮结论/early_stop/reason/residual_risks 四列全填；early_stop at R5 理由（SPEC 已签需求面零开放 · nit 全消化 · 再轮无新增信息）成立；`actual_last_round=R5` 与表一致。R2 追帧上限定稿、R3 FP-T1~T5 增补、R4 可测性论证均有实质内容非空转。

### 8. lint PASS 留痕真实性

✅ 本帽实跑复验：`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_decision_surface.md` → `LINT: PASS · task_web_hitl_decision_surface.md` · EXIT=0（2026-10-17）。自检结论（:265）首跑 E3 改粗体行后复跑 PASS 的留痕可信。spec-wave 3.3.0 在 devDependencies（package.json:32）属实。

### 9. 基线 263 可溯

✅ test_strategy_note/TC15/FP-T4 引用的回归基线 263 与 done task `task_web_hitl_resume_async_reverify.md:219` 实录（Vitest 31 文件 263/263 · 2026-10-15 复验）一致，非杜撰。

### 10. 现状锚点抽验

✅ 抽验 8 项全中：`chat.ts:1121` AC16① 注释在案 · :1194/:1229 AC16② 注释在案 · :449/:1036 F2/AC16 消费点注释在案 · `tests/chat-store-hitl.spec.ts:615` AC16② 降级断言在案 · :475-482 decide 409→「已被处理」旧测在案 · `tests/chat-store.spec.ts:745` replay 409 错误条锁存旧测在案（裁定 C 现状锁存）。既有锚点真值面与 task「现状锚点」表自述一致。

---

## 二、阻塞项（内容 · 退回 10-task 回填）

### B1 · 行为变更类 task 缺「旧测 grep 影响面」验收项（checklist 提醒 · 有本仓 R1 fail 先例）

本 task 改 409 fallback 语义（D3-4 分流修假相 · :1089-1095 改造）并在 done 分支/追帧链接入新行为（D2-4/F3），属 **行为变更类 task**；验收标准 TC1–TC17 中**无「旧测 grep 影响面」枚举项**。TC15（基线 263 零回归）与 FP-T4（回退闸）是结果闸，不等于枚举「哪些旧测钉着旧行为、改动后必须仍绿或逐条留痕」。

先例：`docs/tasks/done/task_web_chat_history_hitl_ux.md` 20-task-audit R1 即因同类缺口判 **fail**，回填 AC17（:273 修订记录「新增 AC17 旧测 grep 影响面验收项 · 10 处真读枚举 · 改旧测须逐条 30 invoke 留痕」）。口径须一致。

本帽已代查影响面（供 10-task 回填照录，**非**代写验收项）：

| 旧测 | 钉住的旧行为 | 本 task 设计下的预期 |
|------|-------------|---------------------|
| `tests/chat-store.spec.ts:745-752`（replay 409 · F-OBS-2） | 手动 `resumeFromCursor` 409 落 else 分支 **retryable 错误条** + detail 透传（裁定 C 现状锁存） | **存续不动**：退避重试纪律只适用自动追帧器，30 勿把手动路径一并「修」掉 |
| `tests/chat-store-hitl.spec.ts:475-482`（AC9 decide 409） | decide 409 →「该申请已被处理」+ 不弹错误条 + 刷新审批态 | 存续（TC9 分流断言的 decide 支）· 仍绿 |
| `tests/chat-store-hitl.spec.ts:354 / :589 / :615-629`（AC16①/② 消费点 + 降级） | 两消费点调用次数 + 403/404 降级文案 | F1 新增第三消费点（进入即拉）不得破坏既有计数断言口径 |
| done 分支旧测族（`tests/chat-store.spec.ts` done 帧断言） | done{completed/failed/无 status} 清 active-run · waiting_approval 保留 | D2-4 新增 resumed 支不得扰动既有分支（承 AC17 先例枚举法） |

回填要求：在验收节增一条「旧测 grep 影响面」项（编号建议 TC18 或并入 TC15 注），逐枚上述面 + 断言「零改动全绿；须改旧测逐条 30 invoke 留痕」（承 AC17 句式）。

### B2 · AC16①/② 归因失真（N2 消歧半闭合 · 引用真值错误）

task 多处（:59 nit 表 · :71 · :73 · :87 F1 · :81 测试面行）写「承 **signed SPEC-web-chat-history-hitl-ux** AC16①/②」。本帽亲读该 signed SPEC §7 全文（:181-205）：其验收仅 **AC1–AC15**，**无 AC16**。AC16①/② 真址为 done task `docs/tasks/done/task_web_chat_history_hitl_ux.md:147`（N1 回填新增的 task 级验收项：① decide/resume 动作链完成后 `fetchHitlPending()` ② 进入 waiting thread 一次性核对不轮询），码面注释（`chat.ts:449/:1036/:1121/:1194/:1229`）与测试（`chat-store-hitl.spec.ts:354/:589/:615`）均承该 task 级 AC16。

溯源：20-spec-audit nit N2 原文建议措辞即「承 signed SPEC AC16①/②」，task 照抄了 nit 的归因——n 2 的**消歧目的**（自有 AC16=G-L1 vs 被引 AC16①/② 两消费点）已达成，但引用对象失真。30 若按字面去 signed SPEC 找 AC16 将落空。

回填要求：相关行更正为「承 done task `task_web_chat_history_hitl_ux` AC16①/②（N1 回填 · signed SPEC-web-chat-history-hitl-ux 本体 AC1–AC15 无 AC16）」；或等效准确表述。同时建议 10-task 在修订记录补一笔更正留痕。

---

## 三、非阻塞 nit（不阻签收 · 随回填顺手更）

- **nit a**：FP-T4（:159）「chat-store 65 it」—— 本帽实测 `tests/chat-store.spec.ts` `it(` 计数 **66**（grep 复核两轮一致）。微差 1 · 不影响基线 263 口径（基线是全量 263/263 非单文件计数），回填时顺手更正或改钉「以实跑为准」。

---

## 四、结论与下一棒

**退回 10-task**：回填 B1（旧测 grep 影响面验收项 · 本帽已代查四行照录）+ B2（AC16①/② 归因更正），顺手更 nit a。回填后下一棒 **20-task-audit R2** 复审。

**流程闸状态**：HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES **全 pending**（本帽未代签 · 30 拒开工存续 · FP-H13 在案）。退回期间**禁止**附 30 Prompt；人签在 20 R2 签收后进行。

## 维护者签闸（20 签收后 · 30 前 · 本轮退回暂存待 R2）

- [ ] 已读 R2 审查结论（须先经 10-task 回填 + 20 R2 签收）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 20-task-audit R1：**退回**（内容阻塞 B1 缺旧测 grep 影响面验收项 · 承 task_web_chat_history_hitl_ux R1 fail 同口径先例；B2 AC16①/② 归因失真 · 真址 done task :147 非 signed SPEC）· nit a（chat-store it 计数 65→实测 66）· 通过面：TC↔AC 16/16 映射 · 非范围零越界 · 追帧上限与 SPEC 照登一致 · N1/N3 闭合 · TC-L 与上游 FP-4/FP-5/RUNBOOK §6 一致 · lint PASS 实跑 EXIT=0 复验 · 基线 263 可溯 · 闸全 pending 未代签 · R0–R5 闭合 · 零 git 操作 |
