# Invoke：web-hitl-fobs-receipt · 30-implement 裁定 A 落地（2026-10-13 · 红测先行）

| 字段 | 值 |
|------|-----|
| **hat_id** | 30-implement |
| **task** | docs/tasks/active/task_web_hitl_fobs_receipt.md |
| **分支 / HEAD** | task/web-hitl-fobs-receipt（本棒提交见文末 commit） |
| **闸核验** | HG-TASK-DRAFT / HG-AUDIT-R1 / HG-GRAPH-MODULES 全 **approved**（task 人工闸表 :40-42 真值 · 2026-10-13 维护者签认）→ 30 开工合法 |
| **实现范围** | **F3 单面**：裁定 A 落地（裁 latency_ms 假值兜底）+ 409 分支 Vitest 锁存（TC3）+ R1-NIT-2 组件层断言；裁定 B/C 零改动照钉 |
| **质量门** | 钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（T-W2 NIT-1：PATH 上 pnpm11 拒跑 · packageManager pnpm@10.32.1） |

## RED → GREEN 时序（TC3 红测先行 · git 可查）

### 第 1 步 · 先改测试（实现未动）

1. `tests/chat-store-hitl.spec.ts:182-200` 兜底断言改写：原 `toEqual({ latency_ms: 0, model: '' })` → `toEqual({ latency_ms: null, model: '' })`（裁定 A 新契约 · model 断言 `''` 不动 = 裁定 B）；**另补** done{status:'resumed', latency_ms:139650}（F-OBS-1 live 实证值 · fobs_s3_full.sse seq18）原样透传断言。
2. `tests/chat-view.spec.ts` 补 R1-NIT-2 组件层断言：缺 latency_ms → 徽标显「完成 · 耗时 —」且不含「0ms」；携 139650 →「完成 · 耗时 139650ms」（mount ChatView 基建在案 · 实做非替证）。
3. `tests/chat-store.spec.ts` 补 TC3 409 锁存（放 T4 replay describe · 与 401/404/422 分态对照同面 · seedBrokenLive/replayCaptured 基建在案）。

### 第 2 步 · 跑红（RED 证据原文摘录）

```
$ pnpm exec vitest run tests/chat-store-hitl.spec.ts
× done{status:'resumed'} 缺 latency_ms（裁定 A · pre-fix 历史旧帧残留面）→ 终态清除 + lastDone.latency_ms===null
  → AssertionError: expected { latency_ms: +0, model: '' } to deeply equal { latency_ms: null, model: '' }
    - "latency_ms": null,
    + "latency_ms": 0,
  ❯ tests/chat-store-hitl.spec.ts:199:29
Test Files  1 failed (1) · Tests  1 failed | 24 passed (25)

$ pnpm exec vitest run tests/chat-view.spec.ts
× R1-NIT-2 / TC3 徽标（裁定 A）：done 缺 latency_ms → 耗时段显「—」（非 0ms）
  → AssertionError: expected '…完成 · 耗时 0ms 发送' to contain '完成 · 耗时 —'
  ❯ tests/chat-view.spec.ts:338:28
Test Files  1 failed (1) · Tests  1 failed | 7 passed (8)
```

RED 签名与 task TC3/R1 预判逐字一致：现行 `latency_ms: 0` 假值兜底与裁定 A 冲突即红。（同日新增之 139650 透传断言与 409 锁存断言在旧码下即绿——透传旧码本为 number 直通，409 锁存钉的是现状行为，二者属「防回归钉」非 RED 面。）

### 第 3 步 · 实现（GREEN）

| 文件 | 改动 | 裁定 |
|------|------|------|
| `src/stores/chat.ts:171-176` | `ChatDoneInfo.latency_ms: number` → `number \| null`（model: string 不动 · 裁定 B） | A |
| `src/stores/chat.ts:735-738` | done 分支 `latency_ms: typeof latency === 'number' ? latency : 0` → `: null`（裁假值）；model 兜底行一字不动 | A |
| `src/views/ChatView.vue:261` | 徽标耗时位：latency_ms === null 显「—」· 非 null 显 `{{ latency_ms }}ms` 实值；模型段 v-if 不动（裁定 B） | A |

**禁触面核验**：`chat.ts:727-729` waiting_approval 提前 break 分支零改动 ✓；`chat.ts:898-926` replay onError 401/404/422/else 分态逻辑零改动（409 锁存钉现状）✓；`useLgRagSse.ts` 零改动（Retry-After 非范围 · 裁定 C）✓；model 兜底/展示零改动 ✓。

**类型连带**：grep 全仓 `latency_ms` → src/ 消费点唯 `ChatView.vue:261` 展示位（已处置「—」语义）与 `chat.ts` 自身；无其他 TS 消费点，`vue-tsc --noEmit`（build 前置）绿。tests/ 旧用例全送显式值（1234/1/12/500）不受影响（与 20 R1 审查文 :46 影响面清点一致 · 无漏网）。

## 质量门三件套（TC4 · FP-5 闸）

| 门 | 命令 | 结果 |
|----|------|------|
| lint | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm lint` | **EXIT=0**（eslint . · 零告警输出） |
| test | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test` | **EXIT=0 · Test Files 31 passed (31) · Tests 255 passed (255)** |
| build | `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm build` | **EXIT=0**（vue-tsc --noEmit ✓ + vite build ✓ 2.08s） |

**计数前后对照（FP-5 回退闸）**：基线 252 it → **255 it**（+3 全部为本次新增 · 零既有 it 变红 · 零删减）：

| spec | 前 | 后 | 增量 |
|------|----|----|------|
| chat-store-hitl.spec.ts | 24 | 25 | +1（139650 实值透传 · 原兜底断言改写非新增） |
| chat-store.spec.ts | 65 | 66 | +1（TC3 replay 409 锁存） |
| chat-view.spec.ts | 7 | 8 | +1（R1-NIT-2 徽标「—」） |

## 409 分支 Vitest 锁存（TC3 · 裁定 C 现状钉死）

`tests/chat-store.spec.ts` T4 describe 新增 it「replay 409（F-OBS-2 · run 在飞）：else 分支 retryable 错误条 + detail 文案透传 + active-run 保留」：

- 注入 `replayCaptured.onError({ kind:'http', status:409, message:'Run is still in flight; retry after it settles.' })`（40 invoke attachments/fobs_s3_409.hdr/.body live 实证字面）。
- 断言：`error === { stage:'http', message: detail 原文, retryable:true }` · `activeRun` 保留 {run_id:'r-1', last_seq:3} · `canResume===true`（手动「续看」即恢复 · api FP-3 缓解成立）· `replayLgRag` 仅 1 次（不自动重试）。
- 对照分态不变：401 → auth 清场跳登录 · 404/422 → 清 active-run 不可重试（既有 it 全绿 · 零改动）。

## R1-NIT-2 组件层断言（实做 · 非替证声明）

`tests/chat-view.spec.ts` 新增 it「R1-NIT-2 / TC3 徽标（裁定 A）」：mount ChatView 基建在案（成本可承担 · 未走「store 层 + live 实录替证」降级路）。断言缺键显「完成 · 耗时 —」且全文不含「0ms」· 模型段不渲染（裁定 B v-if 零改动佐证）· 携 139650 显「完成 · 耗时 139650ms」。徽标渲染实值面组件层钉死（与 40 live 帧附件 fobs_s3_full.sse seq18 latency_ms=139650 互证 TC1 徽标面）。

## 图谱面（HG-GRAPH-MODULES 预判 n/a 核验）

- `docs/_tech_graph/l1/01_modules.md` **零改动**（git status 实证 · 无新页面/路由/模块）。
- `10_flow_chat.graph.yaml` 备注（graph_delta 可选项）：**实判不动**——徽标耗时段「—」为既有 chat 面内渲染分支微调，flow 既有 done 语义描述不因此产生结构变化；裁定 A/B/C 留痕载体 = 本 task 体 + 本 invoke + volatile.md 短注，已足。

## 改动清单（本棒全量）

| 文件 | 性质 |
|------|------|
| src/stores/chat.ts | 实现（ChatDoneInfo 类型 + done 分支裁假值） |
| src/views/ChatView.vue | 实现（徽标耗时段 null→「—」） |
| tests/chat-store-hitl.spec.ts | 测试（裁定 A 断言改写 + 139650 透传） |
| tests/chat-store.spec.ts | 测试（TC3 409 锁存） |
| tests/chat-view.spec.ts | 测试（R1-NIT-2 徽标「—」） |
| docs/harness/invokes/by-task/web-hitl-fobs-receipt/invoke_20261013_30_implement.md | 本 invoke |

（`.codex/` untracked 为会话工具残留 · 不入本棒提交。）

## Commit

- `b992e4a` test(hitl-fobs)：裁定A/TC3 断言先行（**RED** · 仅测试 3 文件）
- 本 commit（HEAD · `git log --oneline -1` 取 hash）fix(chat)：裁定A 裁 latency_ms 假值兜底 + 30 invoke（**GREEN** · 实现 2 文件 + 本 invoke；invoke 自指 hash 不内嵌防 amend 漂移）

（RED→GREEN 时序 git 可查：b992e4a 树跑 `vitest run tests/chat-store-hitl.spec.ts` 必红 · HEAD 树全绿。未 push · 禁切分支纪律照守。）
