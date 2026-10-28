# Task：Web · HITL 批准后追帧体验收口（chase 上限实证 + 进度可见 + 幂等）

> **状态**：`draft`  
> **类型**：bugfix / 前端交互（Vitest 假时钟红测先行 · api-only-consume）  
> **统筹**：web 00；**禁止**改姐妹仓 ops-desk-api；**禁止**改 replay/resume 冻结契约帧形状  
> **分支**：`task/web-hitl-resume-chase-ux`（30 开工时才切 · 本棒不切分支、不改 src、不 commit）  
> **00 注**：2026-10-28 · 需求真值 = 本 task 第一节实测钉案 · 无上游 SPEC · R0–R5 写在本 task · **30 在 HG-AUDIT-R1=pending 时拒开工**

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-hitl-resume-chase-ux` |
| **git_branch** | `task/web-hitl-resume-chase-ux`（30 开工时才切） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | 10 落稿 → 20-task-audit R1 → 维护者签 HG-AUDIT-R1 → 30（红测先行 · 切分支）→ 40 → PR+CI → CLOSE |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 假时钟红测先行（chase 调用时刻序列/上限/幂等钉），再改 `src/`。质量门在仓根按序执行 `pnpm lint`、`pnpm test`、`pnpm build`（`packageManager` 为 `pnpm@10.32.1`）。图谱改动后加跑 `./scripts/graph-compile.sh`。 |
| **code_quality_bar** | `strict` |
| **freeze_id** | `lg-rag-sse-v1`（replay 帧形状只消费禁改）· `hitl-browser-decide-v1`（`src/api/hitl.ts` 契约只消费禁改） |
| **semi_auto** | `false` |
| **audit_profile** | `full` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **review_hat** | `20` |
| **graph_delta** | `n/a`（chat store/卡片行为改动，不新增一级模块；若 30 评估需备注则只动 `docs/_tech_graph/l1/10_flow_chat.graph.yaml` 并跑 graph-compile） |
| **graph_delta_note** | 10 评估（2026-10-28 亲读）：改动面在既有 `stores/chat.ts` chase 器与 `HitlApprovalCard.vue`，预计图谱零 diff。 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | volatile 短注：批准后 chase 追帧上限 ≤10 次/≤120s 与退避节奏为前端自定 UX 面（非服务端契约）；恢复段在写期间须常驻「恢复中」可见态。真值指针 = 本 task。禁止无理由 `n/a`。 |
| **wiki_promotion** | `volatile` |
| **close_pr_policy** | `required` |
| **experience_capture** | `recommended` |
| **kpi_rubric** | `KPI_RUBRIC_v1_2` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

> 闸表 4 列。id 单元格不用粗体。真值在本表，不在 invoke 字面。

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | approved | 22-R1, 30 | 维护者 2026-10-28 本窗指令「/harness-00-delegate-only 签收」签草案 · 00 代录 |
| HG-AUDIT-R1 | approved | 30 | 20-task-audit R1（退回·B1）→ v0.2 回填 → R2 通过后，维护者 2026-10-28 本窗指令「签收」亲签 · 00 代录 |

---

## 一、实测钉案（2026-10-28 · 后端事件链+访问日志双证）

run `1039c1a956f5463596ea29b9dd4e126c`（query「#2140 这个 issue 在说什么？调用write本地落盘结论」）：

1. 13:26:13 用户点批准 → decide 200 → **resume 200 秒回携 replay.cursor**（恢复段后台异步跑，承 `task_hitl_resume_async` PR #252 设计）；
2. 恢复段含 t2 testing.write.echo 真实 LLM 执行，耗 **68s**（13:27:22 服务端 `HITL 恢复完成 … replay=…:19`）；
3. 期间前端 `POST /api/ops/lg-rag/replay` **14 次**全 200，间隔约 5s，最后一次取回 `done{resumed}` 后自停（之后零调用——终止条件正确）；
4. **观感缺陷**：68s 内 UI 无「恢复中」进度提示，维护者体感「卡住狂刷 replay」。

### 实测异常点（本 task 第一锚）

`src/stores/chat.ts:1017-1021` 已定上限 `CHASE_MAX_ATTEMPTS=10` / `CHASE_MAX_WALL_MS=120_000` / `CHASE_INTERVAL_MS=2_000`，但实测 **14 次 > 10 次上限**、间隔 ~5s ≠ 设计 2s。疑似：多路并发 chase（`chaseGeneration` 代际戳 :1046 未拦住某入口）、计数器作用域失效、或存在 chaseResumedRun 之外的 replay 发起路径。**30 须先实证定位，再定修复**（不允许不定位直接改数值）。

## 二、范围

1. **chase 上限实证与修复**：定位 14>10 根因并修复；钉测同一 run 只允许一条 chase 链（重复入口被代际戳/计数拦下）。
2. **追帧期间进度可见**：resume 200 受理至终帧到达期间，消息流常驻「恢复执行中…」可见态（复用既有双落点形态：卡片 `assistant.hitl.note` + `resumeHint`，chat.ts:1056-1057 同形态），终帧到达即消。
3. **追帧节奏退避**：固定 2s → 递增退避（起始值钉死 **2s 起步**；倍率/上限数值 30 定稿并在验收断言钉死）；409+Retry-After 头优先语义（FP-H2）不动。
4. **批准动作幂等**：卡片连点/已决单重入只发一次 decide+resume（吸收 api 仓草案 `task_fix_hitl_card_resume_reentry` 验收②）。
5. **resume 失败按 detail 分类提示**：409 detail（no_thread_id / stranded_checkpoint / 已解锁等）映射差异化文案（吸收同草案验收③；detail 面只消费不改契约）。

## 三、非范围

- 不改后端 resume/replay 契约与帧形状（双 freeze 只消费）。
- 不改 FP-H2 409+Retry-After 服务端语义、不动 live 流与 reveal 队列机制。
- `HitlApprovalView`（/hitl 页）replay 仅摘要展示为既有非范围声明（:40），不动。
- api 仓草案 `task_fix_hitl_card_resume_reentry` 原症状「decide 后不发 resume」2026-10-28 实证**未复现**（链路已通）；其剩余验收②③由本 task 范围 4/5 吸收——**该草案归档与否留维护者裁决**，本 task 不动它。
- 既有 120s 超限降级文案（chat.ts:1051-1058）语义不动，仅保进度可见态一致。

## 四、依赖

- `src/stores/chat.ts:1016-1160`（chase 器全段 · FP-H1/H2/H3/H7/H10 既有裁定注释）
- `src/components/chat/HitlApprovalCard.vue`（三入口同一渲染形态 :4）
- `src/api/hitl.ts:63-79`（HitlResumeReplay :64-71 + HitlResumeResponse 头部 :73-77 · 冻结只消费）
- `src/composables/useLgRagSse.ts:158-166`（replayLgRag · LG_RAG_REPLAY_PATH）
- 姊妹仓背景（只读参照，禁改）：api 仓 `docs/tasks/close/close_fix_hitl_observe_node_config_injection_20261028.md`（后端 thread_id 根治已合并，本 task 是其体验面后续）

## 验收标准

- [ ] 1. chase 唯一性与上限钉：模拟恢复段长未终帧（假时钟），replay 调用次数 ≤ CHASE_MAX_ATTEMPTS 且单调退避；定位报告的 14>10 根因在交付说明给出实证。
- [ ] 2. 终止钉：done/error 终帧到达后立即停止，之后零 replay 调用（防回归无限轮询）。
- [ ] 3. 进度可见：resume 200 后「恢复执行中」可见态出现、终帧后消失（store/组件断言）。
- [ ] 4. 幂等钉：连点两次批准/已决单重入 → decide、resume 各恰好一次。
- [ ] 5. detail 分类：409 各 detail 形态映射差异化提示文案（单测断言映射表）。
- [ ] 6. 质量门：`pnpm lint` / `pnpm test` / `pnpm build` 全绿；（若动 yaml）`graph-compile.sh` EXIT=0。
- [ ] 7. 旧测 grep 影响面（行为变更类 · 范围 3 退避授权项 · 20-audit R1 B1 回填）：30 开工前须核对并处置下列受影响旧钉——`tests/chat-store-hitl.spec.ts:1018-1022`（固定 2s 起点钉「1999ms 不追/+1ms 触发第 2 次」）与 `:1026-1038`（`advanceTimersByTimeAsync(2000 * 8)` 钉第 10 次到顶降级、第 11 次不再发）、`tests/chat-store.spec.ts` 六处 `advanceTimersByTime(120_000)` 推进（:896/:1136/:1209/:1340/:1360/:1422 · 须逐一确认是否消费 chase 固定节奏）、`tests/hitl-decision-surface-guards.spec.ts:96-98`（TC3 setInterval 白名单守卫 · 递增退避若仍 setTimeout 单链则不受影响但须核对）。处置规则（可机断）：旧钉要么适配递增退避新节奏（改钉与改码同 PR 可见），要么显式声明废弃并给出理由；**禁止静默改钉，禁止为保旧钉回退范围 3**。

### 自检结论（执行者）

**30 实现（2026-10-28 · commit 584db64 · 全程本地授权不 push 不开 PR）**：

- 根因实证（先于改码）：单链计数器作用域完好（TC7 存续实证单链硬顶 10）、全仓 replay 仅 2 调用点无第三路径；14>10 = **多链并发**——replay 重放 hitl.waiting 帧无条件重建卡片 → decide 守卫重置 → 已决单再入起第二链（两链共享 chaseTimer 交替 · ~5s=Retry-After 合法退避与 2s 混排）。一次性 repro 实证 4+10=14 与钉案一致（用后删除 · 永久钉=TC-U1）。
- 验收 1 ✅ TC-U1+TC7（唯一链/单调退避/10 次到顶）｜2 ✅ TC-P1+TC6（终帧即停零续追）｜3 ✅ TC-P1（等待期双落点常驻 · 终帧即消）｜4 ✅ TC-I1a/TC-I1b/TC-U1（连点与重放再入 decide/resume 恰一次 · 网络错重试不误伤）｜5 ✅ TC-D1 it.each×4（no_thread_id/stranded_checkpoint/no_unlock/默认）。
- 验收 6 ✅ 三门：pnpm lint EXIT=0 · pnpm test 33 文件 304 passed | 1 skipped · pnpm build EXIT=0（graph yaml 未动）。
- 验收 7 ✅ 改钉同 commit 可见：TC7 固定 2s 节奏改阶梯逐档钉 · TC6 终帧 note 改「已批准」（终帧即消）；chat-store.spec.ts 六处 120s 推进与 guards TC3 白名单守卫核对后零改动（全量绿证 · 退避仍 setTimeout 单链）。
- 退避定稿（30 定稿项）：起始 2s 钉死 · ×1.5 · 封顶 8s（10 次墙钟 56.25s<120s · 次数先到）；FP-H2 409 Retry-After 优先不动阶梯。
- 详录：`docs/harness/invokes/by-task/web-hitl-resume-chase-ux/invoke_20261028_30_implement.md`。

**40 验收**：（留空 · 由 00 后续委派/代签）

## failure_paths

- replay 网络错/超时 → 保留 active-run 游标、不弹错误条、可手动续看（承 chat.ts:1213 既有语义，本 task 不改）。
- resume 200 cursor 缺失/非法 → 回退手动续看（FP-H1 · chat.ts:1023-1031 不改）。
- 恢复段超 120s → 超限降级「恢复仍在进行，可稍后手动续看」（chat.ts:1051-1058 不改；进度可见态须与降级文案一致衔接）。
- replay 401 → 清 thread_id/active-run/auth 跳登录（FP-H7 · chat.ts:1111-1115 不改）。
- stopStreaming/startNewSession 中途打断 → 清退避定时器 + 代际戳失效（FP-H10 · chat.ts:1040 既有，钉测不泄漏）。

## 给执行帽（30）必读

- `src/stores/chat.ts:1016-1021`（上限三常量）· `:1023-1031` parseReplayCursor · `:1033-1041` chase 器注释（FP-H 裁定全集）· `:1042-1160` chaseResumedRun 全段 · `:1263/:1337-1342` D2-1 resume 200 自动追帧入口 · `:437-438` resumeHint 注释 · `:435-436` 续看提示条本体。
- 实测异常第一锚：本 task §一.4（14>10 实证先于改码）。
- 红测先行：先写失败钉测（上限/唯一性/幂等），再动 src。
- 旧测影响面：红测先行前先落验收 7 的旧测 grep 影响面清单（`tests/chat-store-hitl.spec.ts:1018-1038` 2s 节奏与 10 次上限直写钉 · `tests/chat-store.spec.ts` 六处 `120_000` 推进 · `tests/hitl-decision-surface-guards.spec.ts:96-98` TC3 守卫）；改钉与改码同 PR 可见，禁静默改钉、禁为保旧钉回退范围 3。

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|-----------|----------------------|----------------|
| R0 | 需求=维护者实测观感「循环调用 replay」+ 后端日志钉案 | - | - | - |
| R1 | 现状梳理：chase 器既有上限/退避/降级齐备，问题在实证异常（14>10）与无进度可见 | - | - | 14>10 根因未定 |
| R2 | 方案定型：先实证定位再修 + 进度可见复用既有双落点 + 吸收 reentry 草案②③ | yes | 改动面收敛于 chase 器+卡片，契约零触碰，风险面小；继续 R3+ 不增新信息 | 退避数值待 30 定稿；reentry 草案归档裁决留维护者 |
| R3 | （未开） | — | early_stop at R2 | — |
| R4 | （未开） | — | early_stop at R2 | — |
| R5 | （未开） | — | early_stop at R2 | — |

**actual_last_round**：R2（early_stop）

### R0

维护者 2026-10-28（m00699/m00729）：「点击批准继续后会循环调用replay接口」「为web新增task，对应性修复」。

### R1

亲读 chat.ts chase 全段：上限/退避/降级/代际戳机制已存在（:1017-1160），故非「缺机制」而是「实证异常 + 缺可见态」。对照后端日志：14 次 > 上限 10 次 → 第一锚成立。

### R2

范围五项定型（§二）；非范围六项切割（§三）；reentry 草案关系裁定点上抛维护者。early_stop：继续 R3+ 不产生新决策。

### R3 ·（未开 · early_stop）

本轮不展开（early_stop at R2，无新增思考内容，不伪造）。

### R4 ·（未开 · early_stop）

本轮不展开（early_stop at R2，无新增思考内容，不伪造）。

### R5 ·（未开 · early_stop）

本轮不展开（early_stop at R2，无新增思考内容，不伪造）。

## NIT 处置（v0.2 · 承接 20-task-audit R1 审查文 N1–N3）

| NIT | 处置 | 说明 |
|-----|------|------|
| N1 依赖锚 `hitl.ts:63-77` 范围微宽 | **采纳** | 已勘误为 `:63-79`（显式包裹 HitlResumeReplay + HitlResumeResponse 头部） |
| N2 必读 `:437` 行号漂移 | **采纳** | 已勘误：`:437-438` 为 resumeHint 注释行，续看提示条本体在 `:435-436` |
| N3 退避起始值未钉 | **采纳** | 范围 3 已钉「起始 2s 起步」（与既有 `CHASE_INTERVAL_MS=2_000` 一致），倍率/上限仍留 30 定稿 |

## 修订记录

| 日期 | 摘要 |
|------|------|
| 2026-10-28 | v0 · 10-task 落稿：实测钉案（68s/14 次/自停正确）+ 异常锚（14>10）+ 范围五项 + 非范围六项 + R0–R2 early_stop · 闸 pending · 未改 src |
| 2026-10-28 | v0.1 · HG-TASK-DRAFT 维护者签收（00 代录）；HG-AUDIT-R1 仍 pending，下一棒 20-task-audit R1 |
| 2026-10-28 | v0.2 · 按 20-task-audit R1 回填清单补验收 7（旧测 grep 影响面 · B1）+ 30 必读一行 + NIT 处置（N1/N2/N3 全采纳）；范围五项实质/非范围/failure_paths/思考轮 R0–R2/人工闸表均未动，HG-AUDIT-R1 保持 pending |
| 2026-10-28 | v0.3 · HG-AUDIT-R1 维护者亲签 approved（R1 退回→v0.2 回填→R2 通过链完整 · 00 代录）；30 解锁 |
| 2026-10-28 | v0.4 · 补思考轮 R3–R5 槽位（点名「未开 · early_stop at R2」，不伪造思考内容 · 控制表/闸表/范围/非范围/验收/failure_paths 均未动）；verify BLOCKED 清零 |
