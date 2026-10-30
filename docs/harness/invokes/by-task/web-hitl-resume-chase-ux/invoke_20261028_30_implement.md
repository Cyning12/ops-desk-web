# Invoke · web-hitl-resume-chase-ux · 30（实现）

- **hat**: 30-implement
- **at**: 2026-10-28
- **branch**: task/web-hitl-resume-chase-ux（基于 f0c9700=main）
- **双闸**: HG-TASK-DRAFT / HG-AUDIT-R1 均 approved（task 人工闸表 · verify PASS EXIT=0）
- **流程偏差授权**（维护者 2026-10-28 原话：「授权00签收后续内容，停留在本地可直接验收，验收通过后再CLOSE」）：本 task 全程本地——允许本地 commit（实现与 docs 分开），**禁止 push、禁止 PR**；close_pr_policy=required 的偏差已获授权，40 验收与 CLOSE 由 00 后续委派/代签。

## 根因实证（先于改码 · 验收 1 交付说明）

实测钉案：run 1039c1a956f5463596ea29b9dd4e126c 批准 → resume 200 → 恢复段 68s → 前端 replay **14 次** > CHASE_MAX_ATTEMPTS=10，间隔 ~5s。

排查排除两项（证据）：
1. **计数器作用域完好**：attempts 为 chaseResumedRun 单调用局部 let，单链硬顶 10——TC7（存续钉）实证单链恰 10 次到顶降级，作用域失效假设不成立。
2. **无第三 replay 路径**：全仓 replayLgRag 仅 2 调用点（chat.ts chase 器 / resumeFromCursor 手动续看不循环）；visibilitychange 无自动 replay（tab-hide WIP 2785300 亦不加）；HitlApprovalView（approval-page 分支）replay 仅摘要不起 chase。

**根因 = 多链并发破上限**：replay 携陈旧游标重放 hitl.waiting 帧 → processFrame 无条件 buildHitlState 重建卡片回 waiting → decideHitl 的 status 守卫被重置 → 已决单再入 → 第二 chase 链启动。两链共享 chaseTimer 无缝交替（间隔混排 ~5s 即 FP-H2 Retry-After 合法退避与 2s 间隔交织，R1 提示不误判方向成立）。代际戳只停旧链调度、不阻新链启动、总数无全局上限。
一次性实证 tests/repro-chase-overflow.spec.ts（用后删除）：链 A 4 次 + 重放 waiting 再入链 B 10 次 = **replay 总 14 次**，与钉案完全一致。永久回归钉 = TC-U1。

## 红测清单（先行 · 假时钟 Vitest）

tests/chat-store-hitl.spec.ts：先红 7 项（TC7 改钉 + TC-U1/TC-P1/TC-I1/TC-D1×3）后全绿 51/51：
- TC7（原地改钉）：递增退避阶梯逐档钉（每档 wait-1 不触发/+1 触发 · 2000/3000/4500/6750/8000 → 8000×4 至 10 次 → 再 8000 降级零请求）。
- TC-U1（新增）：同 run 重放 waiting 不打回已决卡片 + 手动打回再入 decide/resume 恰一次 + 总 replay ≤10（14>10 根因钉）。
- TC-P1（新增）：退避等待期 hitl.note + resumeHint 双落点含「恢复中」；done{resumed} 后 hint=null、note 回「已批准」、120s 零续追。
- TC-I1a/TC-I1b（新增）：decide 在飞连点 → decide/resume 恰一次；decide 网络错回 waiting → 受理标记解除同 id 重试成功（不误伤合法重试）。
- TC-D1（新增 it.each×4）：409 detail 分类映射（no_thread_id/stranded_checkpoint/no_unlock/未识别默认）。

## 改动清单

- src/stores/chat.ts（+82/-21 行级 · 实现 commit 584db64）：
  1. chase 唯一性：activeChaseRunId run 级活链（chaseResumedRun 入口同 run 在飞直返；degrade/终帧/stopStreaming 释放）。
  2. 进度可见：退避等待期 showProgress 双落点（hitl.note + resumeHint =「{已批准} · 恢复中 · 正在获取进展（第 n 次）…」）；终帧即消（note 回 settledNote · resumeHint=null · 活链释放）。
  3. 递增退避：CHASE_INTERVAL_MS 2s 起始钉死 ×CHASE_BACKOFF_FACTOR 1.5 封顶 CHASE_MAX_DELAY_MS 8s；仅干净结束未见终帧推进阶梯，FP-H2 409 Retry-After 优先且不动阶梯。
  4. 批准幂等：hitlActedRequestIds 受理标记（decideHitl 入口拦截；decide 401/网络错与 resume 401 回 waiting 时 delete 保合法重试）+ processFrame hitl.waiting 重放守卫（requests 含已受理 id 则跳过重建）。
  5. resumeConflictMessage：409 detail 子串分类（「没有 thread_id」/「没有 interrupt 元数据」/「拿不到待解锁的步骤」→ 差异化文案；未识别落「该会话已无法恢复，请重新开会话」存续默认）。
  - chaseResumedRun 加第三参 settledNote（三调用点传 decidedNote）。
- tests/chat-store-hitl.spec.ts：TC7 改钉 + TC6 终帧 note 钉「已批准 · 恢复进行中」→「已批准」（终帧即消语义 · 同 commit 可见）+ 新增 TC-U1/TC-P1/TC-I1a/TC-I1b/TC-D1。
- 冻结双契约（lg-rag-sse-v1 帧形状 · hitl-browser-decide-v1 src/api/hitl.ts）只消费零改动；failure_paths 五条语义不动；graph_delta=n/a（10_flow_chat.graph.yaml 未动）；HitlApprovalCard.vue 零改动（进度态复用既有 note/resumeHint 渲染位）。

## 验收 1–7 逐项

1. ✅ chase 唯一性+上限：TC-U1（同 run 单链 · 总 ≤10）+ TC7（阶梯单调 · 10 次到顶降级）；根因实证见上节。
2. ✅ 终止钉：TC-P1/TC6 终帧即停 · 120s 推进零 replay。
3. ✅ 进度可见：TC-P1 等待期双落点出现 · 终帧消失（store 断言）。
4. ✅ 幂等：TC-I1a 连点恰一次 · TC-I1b 网络错重试不误伤 · TC-U1 重放再入恰一次。
5. ✅ detail 分类：TC-D1 it.each×4 映射表单测；TC10 裸 code 默认面存续。
6. ✅ 三门：pnpm lint EXIT=0 · pnpm test 33 文件 304 passed | 1 skipped（既有跳项）· pnpm build EXIT=0（graph yaml 未动 · graph-compile 不适用）。
7. ✅ 旧测影响面处置：TC7（固定 2s 节奏）与 TC6（终帧 note）改钉与本 commit 同 PR 可见；tests/chat-store.spec.ts 六处 advanceTimersByTime(120_000) 与 tests/hitl-decision-surface-guards.spec.ts TC3 setInterval 白名单守卫——逐一核对：120s 推进六处不消费 chase 固定节奏（全量套件绿证）；退避仍 setTimeout 单链无 setInterval，TC3 守卫绿证零改动。无静默改钉、无回退范围 3。

## 备注

- 退避定稿：起始 2s（task :66 钉死）· 倍率 1.5 · 上限 8s（30 定稿项）——10 次墙钟 56.25s 远低于 120s 双界，次数先到为准。
- 事故第二链的现实触发点无法从净树唯一还原（chase 期间按钮被 streaming 禁用 · decide 409 不起 chase），故修复双管齐下：run 级活链唯一性截断多链 + 受理幂等/重放守卫堵再入洞，两层各自独立钉测。
- 实现 commit：584db64（src+tests）；docs 随后一 commit（本 invoke + task 自检回填 + volatile 注 + R1/R2 审查文入库）。
