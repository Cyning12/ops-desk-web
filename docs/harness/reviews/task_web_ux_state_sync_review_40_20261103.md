# 验收 · 40 · task_web_ux_state_sync（2026-11-03）

| 字段 | 值 |
|------|-----|
| **验收帽** | 40（Harness 独立验收棒 · 独立于 30 判断 · 不复用 30 结论） |
| **验收对象** | 分支 `task/web-ux-state-sync`（base main `c522436` · commit `51d1201` + `e3c41b7` · 本地零 push） |
| **验收日期** | 2026-11-03 |
| **对照锚** | task `docs/tasks/active/task_web_ux_state_sync.md`（四闸 approved · GO 30）· 20-R1 审查文 `docs/harness/reviews/task_web_ux_state_sync_audit_R1_20261103.md`（NIT×4）· 30 invoke `docs/harness/invokes/by-task/web-ux-state-sync/invoke_20261103_30_implement.md`（只作对照不作真值） |
| **验收方式** | 独立复跑质量门 + 单跑 hitl/chat spec + 全量 diff 逐行审查 + D1–D4 语义抽查 + NIT 逐条落账核对（未改任何实现码） |

---

## 结论

**approved-with-comments（验收通过 · 零阻塞必补项 · 40 新发现 NIT×2 + 记录性说明×2）**

TC1–TC8 逐项独立复验全绿；五道质量门独立复跑退出码全 0；freeze `hitl-browser-decide-v1` 零分叉经 diff 审查独立证实；30 自述两处既有断言改写 + chat-view fixture 修复经逐行核对**确属语义对齐 / 真值补全，非放宽断言**；NIT-1/2/3/4 全部落账；图谱/wiki 落盘到位。两个 40 新发现 NIT 均为极窄边界竞态与记录级事项，不阻塞 PR。

### 质量门独立复跑记录（40 亲跑 · 2026-11-03 17:41–17:43）

| 门 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `npx -y pnpm@10.32.1 lint` | **0** | eslint 全过 |
| test | `npx -y pnpm@10.32.1 test` | **0** | 35 files · **357 passed · 1 skipped** |
| build | `npx -y pnpm@10.32.1 build`（vue-tsc + vite） | **0** | built in 2.40s |
| 图谱 | `./scripts/graph-compile.sh` | **0** | 全 flow OK（10 个） |
| task lint | `npx spec-wave task lint --file docs/tasks/active/task_web_ux_state_sync.md` | **0** | LINT: PASS |
| 单跑复核 | `vitest run tests/hitl-approval-page.spec.ts tests/chat-store-hitl.spec.ts tests/hitl-card-reconcile.spec.ts tests/chat-view.spec.ts` | **0** | 4 files · **111 passed** |

### 冻结零分叉独立佐证（diff 审查 · TC8）

- `git diff main -- src/api/hitl.ts` = **0 行**（与 30 invoke 一致，独立复核）。
- 全分支 diff `src/api/` / `src/router/` / `src/views/ChatView.vue` / `src/components/chat/HitlApprovalOverlay.vue` = **0 文件**。
- 请求面调用点比对：main 侧 `HitlApprovalView.vue` 3 个调用点 / `chat.ts` 4 个调用点，分支侧仅**新增** `onDecidedResume` 内 `resumeHitlRequest(row.id)` 一个消费点（冻结契约的既有函数 + 既有单参形态），既有 7 个调用点参数零变化；decide/resume 方法/路径/载荷/错误码语义零变更。
- 分支面：`task/web-ux-state-sync`（base `c522436`）· `git log` = `e3c41b7`（docs）+ `51d1201`（feat）· 工作区仅 `.codex/` untracked（本地工具目录 · 30 invoke 已声明 · 不入库）。

---

## TC1–TC8 逐项独立判定

| TC | 判定 | 独立复验方式与证据 |
|----|------|---------------------|
| **TC1** 已决区回灌 | ✅ PASS | `hitl-approval-page.spec.ts`「TC1 已决区回灌」describe 独立单跑绿：预置 `ops.hitl.decided.v1` v=1 approved·待续跑快照 → mount 后 `hitl-decided` 分组渲染 + `hitl-decided-resume` 在 → 点击 `resumeHitlRequest` 恰好 1 次且参数 `req-s0`；版本字段 v≠1 → 整键丢弃（FP-3）。 |
| **TC2** 落盘 + 重挂载存续（F1 红线） | ✅ PASS | decide 成功（DECIDE_REQUIRED）→ sessionStorage 快照断言全键（v=1/id/approved/await_resume/item 六键逐字段）；`wrapper.unmount()` 后重挂 → 已决区仍在 + 续跑入口在。 |
| **TC3** 降级三态 | ✅ PASS | FP-2：`Storage.prototype.setItem` 抛错 → 页面不炸、已决区内存态渲染、键未写入；FP-3：`{corrupted` 非法 JSON → 整键丢弃 + 空态渲染；FP-12：预置 21 条 → 回灌恰 20 条、最旧 `req-s0` 被挤、`req-s20` 在列。实现侧回灌 `slice(-20)` 与落盘合并 `slice(-20)` 双向 FIFO 亲读属实。 |
| **TC4** 时间本地化 | ✅ PASS | `2026-11-03T06:51:59+00:00` → 正文 = 测试内同参 `Intl.DateTimeFormat(undefined,{dateStyle,timeStyle})` 期望值（不钉 TZ · 环境鲁棒）、`title` 保 UTC 原文、正文不含 ISO；`not-a-date` → 回退原文 + title 同原文（FP-9）。 |
| **TC5** 写窗 409 中性化 | ✅ PASS | 双向锁定：`settles` 子串 → 「恢复写入中，请稍后重试」；`Resume is writing new events` → 同（镜像用例随 D4 改写后断言此文案）；**未命中** `generic conflict` 409 → 维持「续跑失败：generic conflict」透传（FP-8 不回归）；已决区续跑撞写窗 → 同文案（`resumeErrorText` 共享落点）。判据 `/writing new events|settles/i` 置于 expired 映射之后、透传之前，顺序正确。 |
| **TC6** 卡片对账两向 | ✅ PASS | store 层：成功取回且 `req-on-list` 在列 → `isHitlRequestReconciled`=false；`req-gone` 不在列 → true。组件层 `hitl-card-reconcile.spec.ts` 4 用例：在列 → 批准/驳回/resume_mode 三选全渲染、无只读 note；不在列 → 「已被处理或已失效」note 在、三选全不渲染。 |
| **TC7** 对账不误判三向 | ✅ PASS | FP-4：403 → `hitlPendingError='无审批权限'` 且不对账；FP-5：网络错 → `'审批服务暂不可用'` 且不对账；FP-6：本地 decide 成功（acted 集入账）后 pending 已不含该 id → 仍 false 不误判；另有取回前守卫用例（空列表 ≠ 成功取回）。 |
| **TC8** 质量门 + 过程 + 冻结 | ✅ PASS | 五门退出码全 0（见上表 · 40 独立复跑非转录）；`01_struct.md` 三行增量落账、`01_modules.md` 指针 stub 零 diff（TC8 明示「或零 diff 留痕」）；`10_flow_hitl.graph.yaml` 无 flow 语义变化（对账复用既有刷新点 · 不补 flow 合理）；`volatile.md` 短注已落；task lint PASS；冻结零分叉 diff 审查独立证实（见上节）。 |

---

## D1–D4 语义抽查（40 亲读码面）

| 定夺 | 抽查结论 |
|------|----------|
| **D1** 已决区会话内保留 | 键 `ops.hitl.decided.v1` ✓ · 版本字段 v=1 随键校验 ✓ · FIFO 20 落盘合并 + 回灌 `slice(-20)` 双向 ✓ · 写失败 try/catch 静默降级（FP-2）✓ · 坏 JSON/版本不符整键丢弃（FP-3）✓ · approved·待续跑（`await_resume`）显式「续跑」按钮走 `resumeHitlRequest`（两步钉死 D5 存续 · 不合并不自动）✓ · 同 id 去重替换（FP-11）✓ · 标题文案「真源以服务端为准」不声称持久 ✓。 |
| **D2** 卡片对账 | `hitlPendingFetched` 仅成功路径置位、失败（403/网络/401）不置位 ✓ · `isHitlRequestReconciled` 三守卫顺序：空 id → false；本地已动作优先（FP-6）→ false；未成功取回或 error≠null（FP-4/5）→ false；否则按不在列判定 ✓ · 卡片 `reconciledAway`/`actionable` 收敛 waiting 动作区三处 v-if ✓ · 零轮询零新端点（复用 `refreshHitlPending` 既有消费点 · ChatView 未动）✓。 |
| **D3** 时间本地化 | `formatCreatedAt`：`Date.parse` NaN → 原文回退（FP-9）✓ · `Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'medium'})` 本地时区 ✓ · 行 meta `:title` 保 UTC 原文 ✓ · 验收面 = /hitl 行 meta（NIT-3 口径 · 未强加浮层卡）✓。 |
| **D4** 写窗 409 中性化 | 子串判据 `/writing new events|settles/i` consume-only（同 `resumeConflictMessage` 先例形态）✓ · 中性文案精确 ✓ · 未命中维持既有透传（FP-8）✓ · chat store chase 面未重动 ✓。 |

---

## 重点核对：30 自述两处既有断言改写 + chat-view fixture 修复（逐行）

**结论：三处全部确属语义对齐 / 真值补全，零放宽。**

1. **TC1 原 UTC 直出断言**（`tests/hitl-approval-page.spec.ts`）：原 `expect(text).toContain('2026-10-20T01:00:00Z')` → 改为 `[data-test="hitl-created-at"]` 存在 + `title` === UTC 原文 + 正文不含 ISO + 正文含「创建时间」。UTC 可见性经 title 保留且锚点更精确（原断言打在整页 text 上）；与 D3 语义一致，**非放宽**。
2. **TC8 镜像用例写窗透传断言**：原「409 写窗 → 续跑失败：原文透传」→ 随 D4 改「恢复写入中，请稍后重试」。该行为变更是 task 范围 checklist 明文立项（D4/TC5），非测试迁就实现；且 TC5 新增未命中用例（`generic conflict` → 透传维持）锁死 FP-8 不回归，**非放宽**。
3. **chat-view.spec.ts fixture 修复**（AC7 + T-W2×2 三用例）：diff 仅 3 行新增 `vi.mocked(fetchHitlPending).mockResolvedValue({ items: [PENDING_REQ_42], count: 1 })` + 1 个 fixture 常量（含 `target: 'prod'` 键 · 补 vue-tsc 类型）——**断言零删改**，纯补服务端真值使 waiting 卡在对账口径下仍合法可操作。**非放宽**。

**红测先行历史证据**：30 invoke 记录「首跑红 21 failed | 71 passed」。40 无法在不回退代码的前提下独立重演历史红态；但新测试结构（5 个 state-sync describe + 独立对账 spec）与实现 diff 的对应关系逐条吻合，红测先行采信（记录性说明，非阻塞）。

---

## NIT-1/2/3/4 处理落账核对

| NIT | 20-R1 原意 | 40 核对结论 |
|-----|-----------|-------------|
| NIT-1 | 旧测 grep 影响面机断项（K7 提醒） | **实质已处置**：30 红测前 grep 实证 2 处必改断言并在 invoke §2 留痕；本验收重点核对（上节）确认语义对齐。task 文件「验收标准」未补该行（属 20 标注「可选回填」），建议在 CLOSE 时顺手补记，不影响本棒结论。 |
| NIT-2 | 交付双核对 `01_modules.md`↔`01_struct.md` | **已处置**：`01_modules.md` 现为指针 stub（真值迁 `01_struct.md` · web-graph-anchor-profile-fix 落账），本分支零 diff 与 stub 策略一致无漂移；`01_struct.md` pages/components/pinia 三行 2026-11-03 增量落账（task_web_ux_state_sync 标注），两文件口径一致。 |
| NIT-3 | F15 验收面 = /hitl 行 meta，勿拿浮层卡时间验收 | **已处置**：D3 全部断言打在 `HitlApprovalView` 行 `data-test="hitl-created-at"`；浮层卡/卡片无 created_at 断言；实现亦未强加。 |
| NIT-4 | 闸表「22-R1」→「20-task-audit R1」 | **已处置**：task :44 `blocks_hats` = `20-task-audit R1, 30`。 |

## 图谱/wiki 落盘核对

- `docs/_tech_graph/l1/01_struct.md`：pages 行（已决区会话保留 + 本地化 + 写窗中性化）、components 行（卡片对账只读面）、pinia 行（`hitlPendingFetched` + `isHitlRequestReconciled`）三处增量，task 标注齐全 ✓。
- `01_modules.md`：指针 stub 零 diff（TC8「或零 diff 留痕」口径）✓ · `10_flow_hitl.graph.yaml` 无变化（无 flow 语义变化 · 合理）✓。
- `graph.json` / `shared/graph.json`：diff 仅 freeze_id / generated_at 再生成噪声（graph-compile 正常产物）✓。
- `docs/coding_wiki/volatile.md`：「本波 active」顶部短注已落（D1–D4 全要素 + freeze 零分叉红线 + task/invoke 真值指针）✓。
- invoke 链完整：`invoke_20261103_10_task_draft.md` / `invoke_20261103_20_task_audit.md` / `invoke_20261103_30_implement.md` 均入库 ✓。

---

## 必补项（阻塞）

**无。**

## 40 新发现 NIT（非阻塞 · 建议 CLOSE 或下波顺手处置）

1. **已决区并发交互的窄竞态**：`upsertDecidedSnapshot`（`src/views/HitlApprovalView.vue`）以纯快照重建 `decidedRows`（resuming/error 归零）。若行 A 续跑在飞时用户对行 B 完成 decide/resume，在飞的行 A 响应式对象被替换出数组：① `resuming` 守卫失效，续跑按钮提前恢复可点（极端双击可发第二次 `resumeHitlRequest`，后端 409 幂等兜底）；② 在飞请求的错误写在被替换的旧对象上，行级错误不呈现。触发面极窄（需续跑 pending 期间操作另一行），无数据正确性问题。**建议**：后续把 `resuming/error` 迁入按 id 索引的独立 Map，或 upsert 时保留在飞行的交互态。
2. **NIT-1 task 文件可选回填未落**：20-R1 标注「可选」的验收标准 grep 行未补入 task 文件（实质证据已在 30 invoke §2 留痕）。建议 CLOSE 时补记一行，免后续同族 task 重复踩点。

## 记录性说明（非 NIT）

- 30 invoke §2 红测首跑历史（21 failed | 71 passed）属过去时证据，40 独立重演需回退代码故采信 invoke 留痕 + 现有测试结构吻合性旁证。
- `.codex/` untracked 本地工具目录维持不入库（30 invoke 已声明 · 与本仓惯例一致）。

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-11-03 | 40 验收初稿：approved-with-comments（TC1–TC8 全 PASS · 五门退出码全 0 · freeze 零分叉独立证实 · 断言改写核对 = 语义对齐非放宽 · NIT×2 非阻塞） |
