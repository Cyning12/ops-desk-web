# invoke · task_web_hitl_resume_expired_mapping 30 执行（2026-11-02 · 30 帽 · 实现）

| 项 | 内容 |
|----|------|
| **时间** | 2026-11-02 |
| **性质** | 红测先行实现（onResume catch 过期映射增量） |
| **分支** | `task/web-hitl-resume-expired-mapping`（PR #85 随动） |
| **委派** | 00 派工（web 仓镜像薄壳 · 真值=api 仓 task_api_w_join_gap_fix W-fix-1-web 条） |

## GATE_VERIFY（首输出闸扫描 · verify 零豁免 PASS）

| human_gate_id | task表status | blocks_30 | 30可开工？ |
|---------------|--------------|-----------|------------|
| HG-TASK-DRAFT | approved（镜像 · 00 代录） | Y | ✅ |
| HG-AUDIT-R1 | approved（镜像 · 00 代录 · api 侧 R2 PASS-WITH-MINOR） | Y | ✅ |
| HG-GRAPH-MODULES | approved（镜像 · 00 代录） | 条件触发 | ✅ |
| HG-W-FIX-DESIGN | approved（镜像 · 00 代录 · 四决策） | Y | ✅ |

- reviews：R1 审查文存在（镜像指针 `docs/harness/reviews/task_web_hitl_resume_expired_mapping_audit_R1_20261102.md`）
- pre-30 invoke：required ∩ {10,20,00} = {10,20} → `invoke_20261102_10_shell_draft.md` / `invoke_20261102_20_audit.md` 齐全
- `npx spec-wave verify --target . --task docs/tasks/active/task_web_hitl_resume_expired_mapping.md` → **VERIFY: PASS（exit 0 · 零豁免 flag · 图谱锚点 checked=2 hits=2）**

## 实现（W-web-1 · src/views/HitlApprovalView.vue）

- 新增 `resumeErrorText(error: ApiError): string`（与 `decideErrorText` 同机制）：`/过期|expired/i` → 「审批已过期，请刷新列表」（文案与 decide :111 同）· 404/409 → `续跑失败：${message}` 透传 · 兜底「续跑失败（网络/服务异常），可重试」
- `onResume` catch 改走 `row.error = resumeErrorText(apiError)` + 过期/404/409 联动 refresh（与 onDecide catch 同构）
- 顺序前提：过期正则先于 status 分支（api 侧过期出口=409+detail 含「过期」，先判文案后判状态）

## 测试（红测先行 · tests/hitl-approval-page.spec.ts TC8）

| 用例 | 红（实现前） | 绿（实现后） |
|------|--------------|--------------|
| ①resume 错误含「审批已过期」→ 行级「审批已过期，请刷新列表」 | ❌ 透传「续跑失败：审批已过期（approval_expired）」 | ✅ |
| ②resume 409 写窗 "Resume is writing new events" → 不命中映射 · 维持透传 | ✅（回归锁） | ✅ |
| ③resume 网络错误 → 泛化文案不变 | ✅（回归锁） | ✅ |

## 质量门（npx -y pnpm@10.32.1 前缀）

- `pnpm lint` → PASS（exit 0）
- `pnpm test` → PASS（34 files · 337 passed | 1 skipped）
- `pnpm build` → PASS（vue-tsc --noEmit + vite build ✓ 2.02s）

## 红线复核

- decide 路径零 diff：`decideErrorText` / `onDecide` 无一字改动（diff 仅注释引用其名）
- freeze hitl-browser-decide-v1 渲染语义只在 onResume 增量；模板零改动（行级错误仍走既有 `[data-test="hitl-row-error"]`）
- 图谱 / wiki：**零 diff**（薄改在既有组件内 · 无新增模块/路由/组件 · graph_delta 预计零 diff 成立）
- 未改其他组件 / 路由 / store / api 层
