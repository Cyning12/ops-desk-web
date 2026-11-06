# 审查 · 20-task-audit R1 · task_web_hitl_overlay_reconcile_race（2026-11-06）

| 字段 | 值 |
|------|-----|
| **审查帽** | 20-task-audit（R1 书面审查棒） |
| **审查对象** | `docs/tasks/active/task_web_hitl_overlay_reconcile_race.md`（状态 draft→pending · HG-TASK-DRAFT approved） |
| **审查日期** | 2026-11-06 |
| **对照锚** | issue #95（现象/根因 bot 诊断/修复线索/复现）· 维护者 trigger（2026-11-06 13:40 受理授权 · 四项要求）· done 同族 `docs/tasks/done/task_web_ux_state_sync.md`（D2 对账裁定存续）· freeze `hitl-browser-decide-v1` |
| **审查方式** | 书面审查 + 码面只读抽查（合并后 main `692f268` 基线 · 未改 src/ · 未签任何 human_gate） |

---

## 结论摘要

**审查结论：PASS-WITH-MINOR（审查通过 · 零内容阻塞项 · NIT×3 非阻塞）** —— 对照维护者 trigger 四项要求、issue #95 缺陷链与 done 族 D2 裁定逐条核对，闸指涉 HG-AUDIT-R1 / HG-DESIGN-FORM / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE 可提交 lead 随档人签（设计闸裁决预告=DP-1 形态 A，与 trigger 预告一致）。

### 内容结论：**PASS-WITH-MINOR**（NIT ×3 · 零内容阻塞项）

| 核对项 | 结果 | 说明 |
|--------|------|------|
| 维护者要求①（task 档六要素 + 设计闸决策点） | ✅ 全落 | 范围/非范围/验收 TC1–TC6/failure_paths FP-1~FP-11/人工闸表/思考轮齐备；设计闸 DP-1 三形态（A 键口径统一 / B 对账时机 / C 其他）+ DP-2 SSE 流改动边界（默认最小面，事件管线默认不动）独立成节，10 未定夺实现、留人签——边界守得住 |
| 维护者要求②（红测先行入 test_strategy · 负样本按所选形态定） | ✅ 落 | test_strategy=required；TC1 负样本先红（快照先于 hitl.waiting 帧时序 → 保持可动作）；维护者建议形态（早期渲染实体键滞后不再显示死态）逐字入档；正样本零回归由 TC2 + FP-8 双锁 |
| 维护者要求③（红线入 failure_paths） | ✅ 三锁全落 | SSE 事件表零 diff=FP-2（越红线形态作废）· 改码面收敛=FP-3（超圈定面停签）· lint PASS=FP-4（质量门非 0 拒交付）；另补 FP-5 图谱回签 / FP-8 防「永不转只读」退化 / FP-10 刷新风暴 |
| 维护者要求④（lint PASS 后出 PR） | ✅ 已兑现 | PR #96 merge `692f268`；task lint / lint-wiki-delta（73）/ pnpm lint 三机断全绿（TC6 闭环） |
| 验收 TC1–TC6 可机断性 | ✅ | TC1 时序构造可机断（store 态直接编排，无需真 SSE）；TC2/TC3 既有断言零放宽；TC4 按形态分支落断言；TC5 命令退出码 + diff 审查；TC6 已闭环 |
| failure_paths 覆盖 | ✅ 无空洞 | 闸拒（FP-1）/红线（FP-2/3/4）/图谱（FP-5）/降级两态（FP-6/7）/退化防退（FP-8）/重放（FP-9）/风暴（FP-10）/红测失败（FP-11）——与 done 族 FP 语义对齐不冲突 |
| 思考轮 R0–R5 | ✅ 充分 | 六轮齐填；R1 竞态链路亲读属实；R2 不定夺实现的理由成立（10 无授权 + 两形态各有实证约束）；R3 反例清单钉死越界面；R5 early_stop 理由与 residual_risks 如实（#93 截图未亲读已明示）；`task lint` E8–E10 结构机断 PASS |
| 闸表格式 | ✅ | 4 列 · id 单元格无内嵌粗体 · 五闸 blocks 30 均为真；task lint PASS 佐证机读 |
| 设计闸预告一致性 | ✅ | lead 预告 DP-1 形态 A（键口径统一·对账纪元不晚于快照）与 task DP-1 A 描述同向；与 done 族 D2 零轮询裁定兼容（形态 A 不引入轮询）——见 NIT-2 签闸措辞建议 |

**码面抽查记录（只读 · 2026-11-06 本棒亲验 · 合并后 main `692f268` 基线）：**

- `src/views/ChatView.vue:55-61` onMounted fire-and-forget `refreshHitlPending()`（:58）——竞态触发点①锚属实。
- `src/stores/chat.ts:454-459` `hitlPendingFetched` 布尔位无时点/代际信息——根因面①属实。
- `src/stores/chat.ts:1289-1303` `refreshHitlPending` 成功才置位；`:1313-1318` `isHitlRequestReconciled` = `fetched ∧ id∉pending`，无纪元/首见判据——根因面②属实。
- `src/stores/chat.ts:738-751` `hitl.waiting` case 消费后无 pending 刷新联动；`:747` 已动作守卫在位（FP-7/FP-9 协同面）。
- `src/components/chat/HitlApprovalCard.vue:22-32` `reconciledAway` 消费判据；`:98` `hitl-card-reconciled` 只读 note——误转死态渲染面属实。
- `src/views/ChatView.vue:41` 条带「人工审批 · 待审批（在下方浮层处理）」——同屏矛盾观测面属实。
- `tests/hitl-card-reconcile.spec.ts` 5 用例在位（在列可点 / 不在列转只读 / FP-4 403 / FP-5 网络错 / 本地已动作）——负样本（滞后时序）缺失属实，TC1 红测入口成立；既有用例 fixture 时序与形态 A 口径的相容性见 NIT-1。
- `src/api/hitl.ts` 冻结契约头注释在位——freeze 面与 task 描述一致。
- 结构机断：`npx spec-wave task lint --file docs/tasks/active/task_web_hitl_overlay_reconcile_race.md` → **PASS**（本棒亲跑）。
- 图谱文件在位：`docs/_tech_graph/l1/01_struct.md` · `01_modules.md` · `10_flow_hitl.graph.yaml`（graph_delta 可落）。

### 流程闸结论（与内容分列）

| human_gate | task 表现状 | 20 R1 意见 |
|------------|-------------|------------|
| HG-TASK-DRAFT | approved（lead 签认 · PR #96 review · 窗口授权 2026-11-06 13:40 · 依据 #95 受理评论 · merge `692f268`） | 与本棒收到的审查委托一致 ✓ |
| HG-AUDIT-R1 | pending | 内容零阻塞 → 可提交 lead 人签（本棒不代签） |
| HG-DESIGN-FORM | pending | lead 预告=DP-1 形态 A；与 D2 零轮询裁定同向，本棒复核一致 → 可随档正式签（措辞建议见 NIT-2） |
| HG-GRAPH-MODULES | pending | 10 评估零新增一级模块/路由/事件管线，亲验合理；30 实扫回签 |
| HG-CONTRACT-FREEZE | pending | 红线三锁（FP-2/3/4 + TC5）佐证链完整；diff 审查在 30 交付执行 → 可随档签，30 佐证闭环 |

---

## 阻塞项（内容）

无。

## 非阻塞项 · NIT 清单（均不阻塞 lead 随档签余下四闸）

1. **K7 清单提醒 · 旧测 grep 影响面未单列**：本 task 属行为变更类（对账判据语义变更）。按 20-task-audit K7 checklist（提醒级 · 非机械闸），建议补一行机断项：**30 开工首步 grep `tests/hitl-card-reconcile.spec.ts` 5 用例 fixture 时序与形态 A 口径的一致性**——特别注意正样本「id 不在列 → 转只读」（:77）：其 fixture 中消息/帧先于 fetch 成功存在，按形态 A「首见早于快照 → 参账」口径仍应转只读（保持绿）；若 30 把纪元口径实现成「仅快照集合内 id 参账」的字面版，该用例可能翻红——须以真值对齐断言，**零放宽**。实质覆盖面已存在（TC2 + FP-8），故仅 NIT。
2. **HG-DESIGN-FORM 签闸措辞建议（给 lead）**：形态 A 的「首见口径」存在两种读法——①帧首见（本端经 hitl.waiting 首次见到 id 的时点）②申请创建时点（帧内 created_at 字段，后端未必提供）。建议签闸时锁死为①帧首见（不依赖后端新字段，与 SSE 事件表零 diff 红线自洽），消除 30 选型自由度。
3. **TC4 断言锚定回签书**：TC4 形态分支断言依赖 HG-DESIGN-FORM 回签措辞，建议回签书直接引用 task DP-1 A 原文（含 NIT-2 锁死的口径），避免 30 两读。

---

## 回填清单（交 10-task / lead · 可选 · 均 NIT 级）

- [ ] task 验收标准节补「旧测 grep 影响面」行（NIT-1 措辞可直接取用；照 done 族 20-R1 NIT-1 模式，30 开工首步执行并回填结果）。
- [ ] lead 签 HG-DESIGN-FORM 时锁「帧首见」口径（NIT-2），回签书引用 DP-1 A 原文（NIT-3）。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（PASS-WITH-MINOR · NIT×3）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 / HG-DESIGN-FORM / HG-GRAPH-MODULES / HG-CONTRACT-FREEZE 改为 approved（lead · 日期 · 设计闸签时锁 NIT-2 口径）
- [ ] commit task 文档或确认已签
- [ ] 下发 Harness 30 Prompt（task 表 approved 为前提；pending 时 30 拒开工，见 TEMPLATE_30_gate_stop）

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-06 | 20-task-audit R1：PASS-WITH-MINOR（NIT×3 · 零内容阻塞）· 码面抽查合并后 `692f268` 基线全锚属实 · task lint 亲跑 PASS · 闸意见：五闸均可提交 lead 随档人签（本棒不代签） |
