# Invoke：10-task · web-chat-history-hitl-ux（R1 回填留档）

> **用途**：承接 20-task-audit R1（**fail** · 内容阻塞 2 条）的小回填留档 · 只改被点名条目，不动范围/非范围/FP 实质内容。  
> **性质**：`task-revision`（R1 回填）· **非** 首稿。  
> **hat**：10-task · **本棒未改** `src/`

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-chat-history-hitl-ux` |
| invoke_slug | `web-chat-history-hitl-ux` |
| git_branch | `task/chat-history-hitl-ux`（未切换 · 实测） |
| task_path | `docs/tasks/active/task_web_chat_history_hitl_ux.md` |
| audit_R1 | `docs/harness/reviews/task_web_chat_history_hitl_ux_audit_R1_20261004.md`（fail · B1/B2 + nit a） |

## 回填条目（对照 R1 审查文第四节回填清单）

### B1 · 补「旧测 grep 影响面」验收项 → 新增 **AC17**

- **真读** `tests/chat-store.spec.ts`（1390 行），枚举 done 帧断言点 **10 处**（行号以本棒真读为准）：
  - `:112-119` live done → `streaming=false` · `lastDone` · `error=null`
  - `:386` done 后续问 `threadId` 幂等沿用
  - `:440-449` done 后 `startNewSession` 清场
  - `:589-593` live done → `activeRun` 与 localStorage 清除
  - `:647-654` replay done → `activeRun` 清除 · `streaming=false` · `resumeHint=null`
  - `:803-806` replay done → `activeRun` 清除
  - `:890-891` 终帧替换后 done → `streaming=false`
  - `:928-931` done 后迟到 answer 帧忽略
  - `:977-978` 降级整段后 done → `streaming=false`
  - `:1003-1008` replay done → `activeRun` 清除 · `streaming=false`
- 机械清点：`grep -n "event_type: 'done'" tests/chat-store.spec.ts` 命中 6 处直接注入（:113/:386/:440/:589/:647/:803）+ `seqFrame(..., 'done', ...)` 间接注入 4 处（:890/:928/:977/:1003）；另 `:176/:183/:1083/...` 为 subtask.progress `payload.status:'done'`（子任务状态 · **非** done 事件帧，不在面内）。
- **全部注入 done 帧 payload 仅 `{latency_ms, model}`，均无 `payload.status`** → 与 AC10「无 status 旧帧 → 维持现行（clearActiveRun）」相容 · subset 安全 · 预期零回归（与 R1 审查文实测一致）。
- AC17 断言形态：**现有 done 相关用例零改动全绿**；若 30 确需改任一旧测，须逐条在 30 invoke 留痕理由。
- `test_strategy_note` 顺带登记旧测影响面一句。

### B2 · 修 AC3 第二条 grep 断言形态

- **实测基线**：`grep -rn "lg-rag/replay" src/ | grep -v useLgRagSse | wc -l` = **1**（`src/stores/chat.ts:764` 既有 T4 文档注释「POST /api/ops/lg-rag/replay」· 真读 :763-767 确认）——原形态验收必假红，属实。
- 改钉为可靠形态（本棒真读全部成立）：
  - `grep -rln "replayLgRag" src/ | wc -l` = **2**（`useLgRagSse.ts` 定义 + `chat.ts` 消费 · 原第一条保留）
  - `grep -rn "import.*replayLgRag" src/ | wc -l` = **1**（仅 `chat.ts` 单点 import）
  - 显式注记 `chat.ts:764` 注释为既有基线不计 · 不采用 `lg-rag/replay` 字面计数形态
- R4 思考轮中 AC3 形态描述同步更正（被点名条目的回声 · 其余思考轮不动）。

### nit a（顺手 · 非阻塞）

- AC16 ②「403/404 静默降级」与 FP-F4「降级提示」统一为「**不炸屏 · 降级呈现**」（采审查文建议口径）· 两处互注「同口径」。
- nit b：按审查文，无需改。

## 自检

| 检查 | 结果 |
|---|---|
| `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` | **PASS**（2026-10-04 本棒实跑 · `LINT: PASS`） |
| 改动面 | 仅 task 验收节（AC3 形态 / AC16 ② 措辞 / 新增 AC17）+ FP-F4 措辞 + test_strategy_note + R4 描述 + 修订记录增行；范围/非范围/FP 语义/闸表/依赖/30 要点 **未动** |

## 人工闸表状态（task 真值 · 本棒未代签）

| human_gate_id | status | 说明 |
|---|---|---|
| HG-TASK-DRAFT | **pending** | 维持 pending · 待 R2 通过后维护者（或获授权 00）签录 |
| HG-AUDIT-R1 | **pending** | 维持 pending · **30 拒开工**（FP-F12） |
| HG-GRAPH-MODULES | **pending** | 维持 pending · 随 30 交付签录 |
| HG-JOINT-DEBUG | **pending** | 维持 pending · blocked_by api 端点上线 |

## 输出

- task 已回填：`docs/tasks/active/task_web_chat_history_hitl_ux.md`（修订记录增行）
- 下一棒：**20-task-audit R2**（复核 B1/B2 闭合 · nit a 一致性）

## 禁区留痕

- 本棒 **未**改 `src/` 实现码 · **未**改 api 仓 · **未**代签任何 human_gate · 分支 `task/chat-history-hitl-ux` 未切换
