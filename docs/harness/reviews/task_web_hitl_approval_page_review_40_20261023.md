# task_web_hitl_approval_page 审查（40 · 合并前审查）

> **审查对象**：分支 `task/web-hitl-approval-page` 交付区间 `f90a371..c271761`（4 commits：a34c626 实现 · 1ae686e 图谱 · fd51949 30 留档 · c271761 10/20 留档补入库）
> **审查帽**：40（只审不改 · 未改 src/tests/docs 实质内容 · 未 commit · 未开 PR）
> **日期**：2026-10-23 · **仓态**：cwd=`ops-desk-web`（分支 task/web-hitl-approval-page · 工作树含外来任务线 web-lg-rag-sse-tab-hide-resume 脏改，审查全程不碰不还原）
> **真值**：`docs/tasks/active/task_web_hitl_approval_page.md`（D1–D9 / FP-1–FP-14 / TC1–TC9）· R1 审查 `docs/harness/reviews/task_web_hitl_approval_page_audit_R1_20261023.md` · 30 留档 `docs/harness/invokes/by-task/web-hitl-approval-page/invoke_20261023_30_web-hitl-approval-page.md`
> **冻结契约**：`src/api/hitl.ts`（只读核对）· 语义对照：`src/components/chat/HitlApprovalCard.vue`

---

## 结论摘要

**结论：approved-with-comments**（零阻塞 · 可进 PR 阶段 · 非阻塞 NIT ×3 + 既定遗留项 3 条带入 PR 阶段清单）

| 维度 | 结论 |
|------|------|
| 11 项审查焦点 | 全部通过（逐项见下） |
| 三门复跑（本帽实跑） | `corepack pnpm lint` EXIT=0 · `corepack pnpm test` 35 文件 324 passed 1 skipped EXIT=0 · `corepack pnpm build` EXIT=0 |
| 图谱门 | `./scripts/graph-compile.sh` EXIT=0（10_flow_hitl OK · 重跑产物与已提交 `10_flow_hitl.md` 字节一致）· 未新增一级模块 |
| 过程门 | `npx spec-wave task lint` PASS EXIT=0（W3 自检结论占位符为在途合法警告 · close 前须回填） |
| 存量零触碰 | `git diff f90a371..c271761 -- src/api/hitl.ts src/components/chat/HitlApprovalCard.vue src/views/ChatView.vue src/stores/chat.ts` 为空 ✅ |
| 脏树隔离 | 区间 4 commits 仅触 10 个本任务线文件；无 chat-tab-hide-resume.spec.ts / volatile.md / graph.json / 10_flow_chat.* ✅ |

---

## 逐项核对（30 自报建议焦点 + 00 补充 · 全部亲读实证）

### 1. D6 无参跳转 ✅

`HitlApprovalView.vue` 三处「回到会话查看」均为 `:to="{ name: 'chat' }"`（auto_resumed :352 · resumed :362 · done 兜底 :373），无 query/params 臆造。测试锁死：TC4 `tests/hitl-approval-page.spec.ts:323` 与 TC5 :350 均断言 `back.props('to')).toEqual({ name: 'chat' })`（toEqual 全等 → 任何额外键都会红）。与 R1 §4 亲读结论「Chat 页不支持 thread 定位参数」一致。

### 2. D7 不轮询 ✅

- grep `setInterval|setTimeout|requestAnimationFrame` 于 HitlApprovalView.vue：**零命中**。
- visibilitychange 边沿刷新 `:95-98`（`document.hidden` 为 true 直接 return，hidden→visible 单次 refresh）；`onMounted` 挂 `:101`、`onBeforeUnmount` 移除 `:105-107`，监听函数为组件自有引用，与 ChatView 既有 visibility 监听（SSE 游标分流职责）互不影响。
- D7 用例（spec :466-492）三段断言：visible→hidden 不刷（计数停 1）→ hidden→visible 刷一次（计数 2）→ 卸载后再切不刷（计数停 2）。真断言非空转。

### 3. TC4 两步链锁 ✅

视图 `:141-147`：`auto_triggered` → auto_resumed；`required` → await_resume；否则 done——三分支均无 resumeHitlRequest 调用。反向断言在 spec :305（decide 成功后 `expect(resumeHitlRequest).not.toHaveBeenCalled()`），点续跑后 :316 断言恰好 1 次且参数 `'req-a1'`。两步链防塌到位。

### 4. resume_mode 零分叉 ✅

- 视图 `:136-137`：inherit → 传 `undefined`（非字符串 `'inherit'`），契约层 `src/api/hitl.ts:99-100`（`if (resumeMode && resumeMode !== 'inherit') body.resume_mode = resumeMode`）兜底不送键——双层一致。
- 三选文案 `:307-309`（续跑默认 / 批准即续跑 / 手动续跑）与 `HitlApprovalCard.vue:57-59` 逐字一致、同序。
- spec :243 断言 `options.toHaveLength(3)`——不存在第四选项；:249-284 三用例分别锁 undefined/immediate/manual。

### 5. 错误文案优先级 ✅

`decideErrorText` `:110-116` 顺序：`/过期|expired/i` → 409 已被处理 → 404 不存在或无权 → 400 resume_mode 非法 → 泛化兜底。expired 前置为刻意决策（30 invoke 决策记录 4：避免过期 409 被「已被处理」截胡），spec :389-405（409+expired → 过期文案）与 :407-423（409+already decided → 已被处理）双向锁死。列表级 403 `:233-239` 单列权限文案、网络失败 `status===null` `:241-247` 单列网络文案，immediate auto_triggered 分支 `:350-355` 呈现正确。FP-2/4/5/6/7/8/12 全闭合。

### 6. 防重 ✅（confirm 前置实现合理）

`onDecide` `:119-120` 进函数即 `deciding=true`（**在 await confirm 之前**），消除「确认框弹出期间连点产生多个 confirm/请求」窗口——比卡片（决策中 disabled）更强且语义不悖；取消路径 `:128-131` 正确复位。批准/驳回/radio 均 `:disabled="row.deciding || row.resuming"`。`onResume` `:162-163` 同构防重。409 兜底（FP-6）触发列表刷新 `:153-155`。UX 评估：确认框打开期间按钮禁用可预期、取消即恢复，无可用性回退。TC2 spec :204-209 锁「决策中 disabled + 连点无第二次请求」。

### 7. 存量零触碰 ✅

`git diff f90a371..c271761 -- src/api/hitl.ts src/components/chat/HitlApprovalCard.vue src/views/ChatView.vue src/stores/chat.ts` **输出为空**。当前工作树中 ChatView.vue / chat.ts 的修改为外来任务线（web-lg-rag-sse-tab-hide-resume）未 commit 脏改，审查前已存在，非本区间引入。

### 8. 脏树隔离 ✅

`git diff --stat f90a371..c271761` 全量 10 文件：HitlApprovalView.vue / router/index.ts / AppLayout.vue / hitl-approval-page.spec.ts / 01_modules.md / 10_flow_hitl.graph.yaml / 10_flow_hitl.md / invoke×3（10/20/30）——全为本任务线。无 chat-tab-hide-resume.spec.ts、volatile.md、graph.json、10_flow_chat.* 混入。30 对外来脏树「不碰不 commit 不还原」纪律执行到位（invoke 决策记录 5/6 与实证一致）。

### 9. 测试质量 ✅

- 17 用例（TC1×3 / TC2×2 / TC3×4 / TC4×1 / TC5×1 / TC6×4 / TC7×1 / D7×1）单跑 `17 passed` EXIT=0，全部含行为断言（精确调用次数、参数全等、disabled 属性、反向 not 断言、截断负断言 `not.toContain` 完整 id），无空转。
- visibilitychange 跨用例泄漏处理可靠：`mountedWrappers` 注册表 + `afterEach` 全量卸载（spec :73-78），D7 计数断言精确到次数，全量 324 用例同跑无串扰。
- jsdom 排坑（radio input 直置 checked + change；immediate/manual 拆独立 it 避免卸载后 DOMWrapper 失效）已在 30 invoke 沉淀，实现与注释一致。

### 10. 图谱一致性 ✅

`10_flow_hitl.graph.yaml`（inform_graph.v3 · 8 节点 9 边）与编译产物 `10_flow_hitl.md` 一致；本帽重跑 `./scripts/graph-compile.sh` EXIT=0，重生成 `10_flow_hitl.md` 与已提交版本字节一致（git diff 为空）。`01_modules.md` pages 行增量备注 + 人签记录本任务行 + 关联节补链接三处齐备；**未新增一级模块**，与 HG-GRAPH-MODULES 签授口径一致。（30 invoke 称「10 边」实为 9 边，属留档笔误，图谱本身正确——见 NIT N3。）

### 11. 三门复跑 ✅

| 门 | 命令 | 结果（本帽 2026-10-23 实跑） |
|----|------|------|
| lint | `corepack pnpm lint` | EXIT=0 |
| test | `corepack pnpm test` | EXIT=0 · 35 文件 324 passed 1 skipped（与 30 自报一致；hitl spec 单跑 17/17） |
| build | `corepack pnpm build` | EXIT=0（HitlApprovalView 独立 chunk 8.15 kB） |
| graph | `./scripts/graph-compile.sh` | EXIT=0 |
| task lint | `npx spec-wave task lint` | PASS EXIT=0（W3 占位符警告为在途合法 · close 前回填） |

---

## 阻塞

**无。**

---

## 非阻塞（NIT ×3）

| # | NIT | 处置 |
|---|-----|------|
| N1 | `decideErrorText` 将 `/过期|expired/i` 正则置于状态码判断之前：若后端 400/404 错误 message 恰好含 "expired" 字样会优先呈现过期文案。鉴于后端过期 decide 错误体未实证（R1 N3 residual 已诚实标注），该顺序是刻意的保守选择（30 invoke 决策 4），且 409+expired 场景已被测试锁对 | 接受现状；待 TC9 手测实证后端错误体后，可在后续 task 收紧为「409 且 message 命中」复合条件。不阻塞 |
| N2 | D7 用例内手动 `wrapper.unmount()` 后，afterEach 注册表会对同一 wrapper 二次 unmount（无害但不优雅） | 后续可在手动卸载后将 wrapper 移出注册表。不阻塞 |
| N3 | 30 invoke 交付摘要称 10_flow_hitl.graph.yaml「8 节点 10 边」，实际为 8 节点 **9 边**（yaml :68-103 可数）。图谱文件本身正确，仅留档数字笔误 | 已在本文钉正；无需改码。不阻塞 |

---

## 既定遗留项（30 自报 · 本帽确认属实 · 带入 PR 阶段清单）

1. **D9 欠账**：`docs/coding_wiki/volatile.md` 本 task 短注未写——该文件被外来任务线脏改，00 裁决暂缓，待其落账后补写。TC8 对应子项当前为 ⚠️ 部分。
2. **TC9 手测 + PR 材料**：四态截图 / 语义对照表 / 闸表截图，按 task 编排属 PR 阶段工作（需本地 ops-desk-api 构造挂起 run）。
3. **graph.json / shared/graph.json** 编译产物属外来脏树未 commit，待另一任务线落账后自然带入（或由维护者在 PR 阶段裁定）。

---

## 复核结论

30 交付对 task D1–D9 / FP-1–FP-14 / TC1–TC8 的实现与留档自报一致，11 项审查焦点全部实证通过，三门 + 图谱门 + task lint 全绿，存量零触碰与脏树隔离纪律执行到位。**可进 PR 阶段**；PR 阶段须关闭上述 3 条既定遗留项（D9 短注 / TC9 手测材料 / graph.json 产物归属）并回填 task 自检结论（W3）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-23 | 40 合并前审查：**approved-with-comments**（零阻塞 · NIT ×3：expired 正则优先级 / D7 二次 unmount / invoke 边数笔误 · 既定遗留 3 条带入 PR 阶段）· 11 焦点逐项亲读实证 · lint/test/build/graph-compile/task lint 复跑全绿 · 存量四文件区间零 diff · 只审不改零 git |
