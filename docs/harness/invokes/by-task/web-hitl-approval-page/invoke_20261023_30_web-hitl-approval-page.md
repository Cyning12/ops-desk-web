# Harness invoke 快照：web-hitl-approval-page

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（实现帽 · 00 委派子 Agent 执行） |
| task_slug | `web-hitl-approval-page` |
| task_paths | `docs/tasks/active/task_web_hitl_approval_page.md` |
| related_review_or_none | `docs/harness/reviews/task_web_hitl_approval_page_audit_R1_20261023.md` |
| git_branch | `task/web-hitl-approval-page`（自 `task/web-lg-rag-sse-tab-hide-resume` 脏树随行切出 · 外来任务线文件不碰不 commit 不还原） |
| created_utc_or_local | 2026-10-23（Asia/Shanghai） |
| notes | 三闸（HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES）均 approved · `npx spec-wave verify` PASS · 红测先行后实现 |

---

## 可复制 Prompt 快照

```text
实现「web 独立 HITL 审批页」（第四审批入口）：新增路由 /hitl（name=hitl ·
AppLayout children · 复用 ensureMe 登录守卫）+ 主导航入口 + 新视图
src/views/HitlApprovalView.vue。只消费冻结契约 src/api/hitl.ts 三函数
（fetchHitlPending / decideHitlRequest / resumeHitlRequest · 禁改）；
resume_mode 三选文案与 HitlApprovalCard.vue 零分叉（inherit 不送键）；
decide 成功 ≠ 自动 resume（required=true 且非 auto_triggered → 显式
「续跑」按钮 · TC4 锁「未自动调 resume」）；「回到会话查看」仅跳
{ name: 'chat' } 不携参（D6）；visibilitychange hidden→visible 边沿
单次刷新、卸载移除监听、不轮询（D7）。存量零触碰（api/hitl.ts ·
HitlApprovalCard.vue · ChatView.vue · chat store · 后端）。图谱 pages 行
增量备注 + 新增 10_flow_hitl.graph.yaml + graph-compile 绿。
```

---

## 交付摘要

### 变更路径（本任务自有 · 均随本帽 commit）

- `src/views/HitlApprovalView.vue`（新增 · 审批页视图 · RowVm 本地行状态机 pending/await_resume/auto_resumed/resumed/rejected/done · data-test 钩子族）
- `src/router/index.ts`（新增 `/hitl` 路由 · capability 之后 · 守卫零改动复用）
- `src/layouts/AppLayout.vue`（主导航新增「审批」菜单项 · Capability 之后）
- `tests/hitl-approval-page.spec.ts`（新增 · 17 用例 · 红测先行）
- `docs/_tech_graph/l1/10_flow_hitl.graph.yaml`（新增 · inform_graph.v3 · 8 节点 10 边）+ 编译产物 `10_flow_hitl.md`
- `docs/_tech_graph/l1/01_modules.md`（pages 行增量备注 + 人签记录本任务行 + 关联节补 `10_flow_hitl.md` 链接 · 未新增一级模块）
- 本 invoke 文件

### 与 HitlApprovalCard 语义对照要点（零分叉核验）

| 语义点 | HitlApprovalCard.vue | HitlApprovalView.vue | 一致性 |
|--------|----------------------|----------------------|--------|
| resume_mode 三选文案 | :57-59 续跑默认 / 批准即续跑 / 手动续跑 | 同文案同序 | ✅ |
| inherit 不送键 | api 层 `hitl.ts:99-100` 统一实现 | 视图传 `undefined`（非字符串 'inherit'） | ✅ |
| 二次确认 | ElMessageBox.confirm | 同 | ✅ |
| 防重 | 决策中按钮 disabled | 进 onDecide 即置 `deciding=true`（confirm 前置 · 消除点击窗口） | ✅（更强） |
| 两步链 | decide 成功 ≠ 自动 resume | required=true 且非 auto_triggered 才显示「续跑」；测试锁「decide 后 resumeHitlRequest 调用 0 次」 | ✅ |
| immediate + auto_triggered | 提示已自动续跑 | 「已批准并自动续跑」提示 + 无续跑按钮 + 回会话入口 | ✅ |

### NIT 留痕（20 审查发现 · 不改注释）

- task 文件 failure_paths FP-8 注「后端 `router.py:184` 白名单」——实际白名单在 `ops-desk-api/app/ops/hitl/router.py:203-208`（行号漂移 · 语义属实 · 后端文件禁改只读，仅在此留痕）。

### 决策记录

1. **视图命名 `HitlApprovalView.vue`**：采纳 task 建议名，与既有 `XxxView.vue` 族一致。
2. **本地已决行保留合并策略**：decide/resume 后服务端 pending 可能仍短暂返回该项；refresh() 以「服务端 pending 行更新 + 本地非 pending 行保留 + keptIds 去重」合并，防重复 key 与行状态被打断（FP-13「决策中不被刷新打断行内状态」）。
3. **防重提前到 confirm 之前**：进 onDecide 即 `deciding=true`，避免「先 await confirm 后置标志」留下的连点窗口（对照卡片语义且更严）。
4. **错误文案优先级**：/过期|expired/i → 409 已被处理 → 404 不存在或无权 → 400 resume_mode 非法 → 兜底；expired 前置避免与 400 兜底串扰（FP-5/6/7/8）。
5. **D9 volatile.md 短注欠账**：该文件当前被另一任务线（web-lg-rag-sse-tab-hide-resume）脏改，按 00 裁决本帽不写入不追加，列为遗留问题待其落账后补写（00 向维护者呈报）。
6. **graph.json / shared/graph.json**：graph-compile 照跑验证（EXIT=0）但二者为外来脏树，不 commit。

### 测试排坑教训（沉淀）

- jsdom 对 `el-radio-button` 的 label/input 点击激活不可靠：须 `(input.element as HTMLInputElement).checked = true` + `trigger('change')`。
- decide 成功后行离开 pending 态导致 radio group 卸载，旧 DOMWrapper 失效（Cannot call trigger on an empty DOMWrapper）→ immediate/manual 拆独立 it 各自新 mount。
- document 级 visibilitychange 监听跨用例泄漏：afterEach 必须卸载全部 wrapper（否则 D7 计数爆涨）。

---

## 验收逐项（TC1–TC9）

| TC | 状态 | 证据 |
|----|------|------|
| TC1 列表渲染三态 | ✅ | spec：2 行字段族断言（reason/blocked_by JSON/created_at+已等待/thread·run 截断）· 空态「暂无待审批的请求」· loading 态 |
| TC2 决策确认+防重 | ✅ | spec：二次确认出现 · decide 恰 1 次 decision='approved' · 决策中按钮 disabled · 连点无第二请求 |
| TC3 resume_mode 零分叉 | ✅ | spec：inherit→第三参 undefined（不送键）· immediate/manual→对应值 · 三文案断言 · 无第四选项 |
| TC4 两步链 | ✅ | spec：required=true → 「续跑」按钮出现且 resumeHitlRequest 未调 · 点续跑调 1 次 · 「回到会话查看」RouterLinkStub to toEqual({name:'chat'}) 无 query（D6） |
| TC5 immediate 分支 | ✅ | spec：auto_triggered=true → 无续跑按钮 · 「已批准并自动续跑」提示 + 回会话入口 |
| TC6 错误态 | ✅ | spec：403 权限态 · 网络失败错误条+重试 · decide 过期行级提示 · 409 已被处理行级提示 |
| TC7 驳回路径 | ✅ | spec：驳回二次确认 · decision='rejected' · 成功后刷新且无续跑按钮 |
| TC8 质量门+过程 | ⚠️ 部分 | `corepack pnpm lint` EXIT=0 · `corepack pnpm test` 35 文件 324 passed 1 skipped EXIT=0 · `corepack pnpm build` EXIT=0 · graph-compile EXIT=0 · pages 行备注+flow yaml+未新增一级模块 ✅ · task lint PASS；**例外：volatile.md 短注未落（D9 欠账 · 00 裁决暂缓 · 见遗留问题）** |
| TC9 手测+PR 材料 | ⏸ 待 40/PR 阶段 | 本帽不开 PR（40 审查后另行）；手测需本地 ops-desk-api + 挂起 run，留待 PR 阶段补四态截图 |

---

## 遗留问题

1. **D9 欠账**：`docs/coding_wiki/volatile.md` 本 task 短注未写（该文件被外来任务线脏改 · 00 裁决暂缓 · 待其落账后补写）。
2. **TC9 手测与 PR 材料**（四态截图 / 语义对照表 / 闸表截图）待 40 审查通过后 PR 阶段完成。
3. **graph.json / shared/graph.json** 编译产物含本 flow 节点但属外来脏树未 commit —— 待另一任务线落账后由后续提交自然带入（或 40 阶段裁定）。

## 下一棒

交还 00 → 40 审查（建议焦点：D6 无参跳转断言、D7 不轮询、TC4 两步链锁、错误文案优先级、脏树隔离纪律）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-10-23 | 30 实现完成：红测 17 用例 → 视图/路由/菜单/图谱 → 三门全绿（lint/test/build）+ task lint PASS → invoke 落盘 |
