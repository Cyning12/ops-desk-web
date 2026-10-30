# Invoke · web-hitl-resume-chase-ux · 40（验收）

- **hat**: 40-verify
- **at**: 2026-10-28
- **branch**: task/web-hitl-resume-chase-ux（核验：git branch --show-current = task/web-hitl-resume-chase-ux ✓）
- **对象**: 本地两 commit —— 584db64 fix(chat)（src/stores/chat.ts + tests/chat-store-hitl.spec.ts · +244/-21）· d93b5d7 docs(harness)（30 invoke + task 自检回填 + volatile.md + R1/R2 审查文入库）
- **授权**: 维护者 2026-10-28「授权00签收后续内容，停留在本地可直接验收，验收通过后再CLOSE」——全程本地，未 push、未开 PR
- **真值**: docs/tasks/active/task_web_hitl_resume_chase_ux.md（v0.4）+ invoke_20261028_30_implement.md

## 三门实跑（40 独立实跑 · 不引用 30 数字）

> 环境注记：本机裸 `pnpm` shim 指向 deepseek-harness node_modules（v11.28.5），与 packageManager 钉的 10.32.1 不符，corepack 拒切换 → 裸 `pnpm lint` EXIT=1（**环境问题非仓问题**）。按 packageManager 钉版 `npx pnpm@10.32.1` 实跑：

| 门 | 命令 | 实跑结果 |
|----|------|----------|
| lint | `npx pnpm@10.32.1 lint` | **EXIT=0**（eslint . 零警零错） |
| test | `npx pnpm@10.32.1 test` | **EXIT=0 · Test Files 33 passed (33) · Tests 304 passed | 1 skipped (305)** |
| build | `npx pnpm@10.32.1 build` | **EXIT=0**（✓ built in 2.29s） |
| 单文件补跑 | `npx pnpm@10.32.1 vitest run tests/chat-store-hitl.spec.ts` | **51 passed (51)**（TC6/TC7/TC-U1/TC-P1/TC-I1a/TC-I1b/TC-D1 全绿） |

与 30 声称（lint EXIT=0 · 304 passed/1 skipped · build EXIT=0）一致。1 skipped 为 guards TC13(b) 既有 CI skip 留痕项，非本 task 引入。

## 验收 1–7 逐项独立核对

1. **chase 唯一性与上限 ✅** —— 实现：`activeChaseRunId` run 级活链（chat.ts:1027-1029 入口同 run 在飞直返；degrade/终帧/stopStreaming 三处释放 chat.ts:1037-1039/1049/1155/939）；退避阶梯 `CHASE_INTERVAL_MS=2_000 ×1.5 封顶 CHASE_MAX_DELAY_MS=8_000`（chat.ts:983-987 · 推进仅干净结束未见终帧 chat.ts:1161-1163，FP-H2 Retry-After 优先不动阶梯）。钉测：TC7 阶梯逐档钉（ladder [2000,3000,4500,6750,8000] 每档 wait-1 不触发/+1 触发 · 8000×4 至 10 次 · 第 11 次降级零请求）+ TC-U1（总 replay ≤10）。单链计数器完好性由 TC7 存续实证，与 30 根因报告一致。
2. **终帧零轮询 ✅** —— sawTerminal 分支（chat.ts:1148-1156）终帧即停：streaming=false · note 回 settledNote · resumeHint=null · 活链释放。钉测：TC-P1 done{resumed} 后 120s 假时钟推进 replay 恰 2 次零续追；TC6 存续。
3. **进度可见双落点 ✅** —— showProgress（chat.ts:1041-1045）退避等待期 hitl.note + resumeHint 同文案常驻「{已批准} · 恢复中 · 正在获取进展（第 n 次）…」；终帧即消（note=「已批准」· hint=null）。钉测：TC-P1 断言等待期双落点含「恢复中」、终帧后消失。
4. **decide/resume 幂等 ✅** —— `hitlActedRequestIds` 受理标记（chat.ts:464）：decideHitl 入口拦截（已受理直返）；decide 401/网络错与 resume 401 回 waiting 时 delete 解除保合法重试；processFrame hitl.waiting 重放守卫（chat.ts:739-743 含已受理 id 跳过卡片重建）。钉测：TC-I1a（decide 在飞连点 decide/resume 恰一次）· TC-I1b（网络错解除标记重试成功 decide=2 次 resume=1 次）· TC-U1（卡片态被外部打回 waiting 再入仍恰一次）。**双层钉各自有测**：唯一性层（activeChaseRunId）由 TC-U1 总 replay ≤10 钉；再入守卫层（hitlActedRequestIds + 重放守卫）由 TC-U1 状态断言 + TC-I1a/I1b 钉。
5. **409 detail 四类映射 ✅** —— resumeConflictMessage（chat.ts:1003-1008）子串分类：「没有 thread_id」→缺会话定位 ·「没有 interrupt 元数据」→旧版残留作废重开 ·「拿不到待解锁的步骤」→无可解锁步骤 · 未识别→「该会话已无法恢复，请重新开会话」（存续默认）。钉测：TC-D1 it.each×4 逐条断言 error={stage:'resume', message:expected, retryable:false} 且不自动 replay。TC10 裸 code 默认面存续（51/51 绿证）。
6. **三门 ✅** —— 见上节实跑记录（40 独立实跑）。graph yaml 未动（diff 无 10_flow_chat.graph.yaml），graph-compile 不适用。
7. **旧钉处置 ✅** —— `git show 584db64` 实证：TC7（固定 2s → 阶梯逐档）与 TC6（终帧 note「已批准 · 恢复进行中」→「已批准」）改钉与改码同 commit 可见，注释点名改钉理由，非静默。`git diff f0c9700..HEAD -- tests/chat-store.spec.ts tests/hitl-decision-surface-guards.spec.ts` = 空：chat-store.spec.ts 六处 advanceTimersByTime(120_000)（:896/:1136/:1209/:1340/:1360/:1422 与 task 验收 7 清单逐一相符）零改动；guards TC3 setInterval 白名单守卫零改动（退避仍 setTimeout 单链 · 全量套件绿证）。无静默改钉、无回退范围 3。

## 冻结核查

- `git diff f0c9700..HEAD -- src/api/hitl.ts src/composables/useLgRagSse.ts` = **空**（hitl-browser-decide-v1 / lg-rag-sse-v1 双冻结契约只消费零改动）✓
- HitlApprovalCard.vue `f0c9700..HEAD` diff = **空**（进度态复用既有 note/resumeHint 渲染位）✓
- 全量 diff 范围：仅 src/stores/chat.ts + tests/chat-store-hitl.spec.ts + docs 6 文件，无越界 ✓

## failure_paths 五条语义对照（亲读实现 · 未动）

| failure_path | 实现锚 | 核对 |
|---|---|---|
| replay 网络错/超时保留 active-run 可手动续看 | chat.ts:1125-1131 | ✓ 未动 |
| resume 200 cursor 缺失/非法 → FP-H1 回退手动 | parseReplayCursor chat.ts:990-996 | ✓ 未动 |
| 超 120s 降级「恢复仍在进行，可稍后手动续看」 | degrade chat.ts:1047-1055（原文案原样 · 仅前置 releaseChase） | ✓ 未动 |
| replay 401 清 thread_id/active-run/auth 跳登录 | chat.ts:1108-1113 | ✓ 未动 |
| stopStreaming 清退避定时器+代际戳（FP-H10） | chat.ts:932-946（清 timer · chaseGeneration+=1 · 新增 activeChaseRunId=null 活链释放，语义增强不违 FP-H10） | ✓ 未动 |

## 根因复核（独立判断）

30 的「多链并发破上限」解释与修复**自洽**：(a) 单链计数器作用域完好由 TC7 存续钉实证（单链恰 10 顶）；(b) 全仓 replayLgRag 仅 2 调用点（grep 实证：chat.ts:1088 chase 器 · chat.ts:1193 resumeFromCursor 手动续看）排除第三路径；(c) 重放 hitl.waiting 无条件 buildHitlState（修复前）确可重置 decideHitl 的 status!=='waiting' 守卫 → 已决单再入起第二链，两链共享 chaseTimer 交替（~5s=FP-H2 Retry-After 5s 合法退避与 2s 混排）与钉案 14 次/~5s 吻合。修复双层（run 级活链唯一性截断多链 + 受理幂等/重放守卫堵再入洞）各自独立钉测（TC-U1 双层 + TC-I1a/I1b 幂等层），与 invoke 备注「现实触发点无法从净树唯一还原故双管齐下」的保守工程判断一致，可接受。

## 结论

**PASS** —— 验收 1–7 逐项独立核对全过；三门 40 独立实跑全绿（lint EXIT=0 · test 304 passed/1 skipped · build EXIT=0）；冻结契约/HitlApprovalCard/failure_paths 五条零违例；旧钉处置合规（改钉同 commit 可见 · 余旧钉零改动实证）；根因解释与双层修复自洽且各自有测。

**NIT（不阻塞 · 环境面非交付面）**：本机 pnpm shim 版本（11.28.5）与 packageManager 钉（10.32.1）不符致裸 `pnpm` 命令被 corepack 拒跑；仓面无需处置，建议维护者本机对齐 corepack。

按授权留在本地：40 invoke + task 自检回填为本地 docs commit，未 push、未开 PR；CLOSE 留维护者裁决。
