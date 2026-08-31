# Invoke：40-self-check · web-lg-rag-sse-t4

> **用途**：40 自检留痕；web PR 前的最后自动闸 + **HG-JOINT-DEBUG 脚本化联调证据**。  
> **下一步（人工）**：维护者核本文件 §联调证据 → 亲签 HG-JOINT-DEBUG → 方可 merge web PR（**勿 auto-merge**）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-t4` |
| git_branch | `task/web-lg-rag-sse-t4` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31 · 同上下文执行）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ |
| test | `pnpm test` | 0 | ✅ 23 files / **155** tests passed（T4 新增 18 例：chat-store +13 · lg-rag-sse +4 · auth-store +1；既有 137 例全绿） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t4.md` | 0 | ✅ VERIFY: PASS |

## 验收勾选口径

- 10 项验收全勾：机检项 9 条由 Vitest/五闸承载（详见 task 验收节）；联调项由本文件 §联调证据（脚本化记录通道）承载。
- HG-JOINT-DEBUG 闸表仍 **pending**：脚本化记录已留，按闸表「40 脚本化联调记录 **或** 维护者亲签」双通道，请维护者核证据后在 task 表签 approved。

## 联调证据（HG-JOINT-DEBUG 承载 · 2026-08-31 脚本化实测）

**环境**：本地 api（`../ops-desk-api` master · #103+#104 · 127.0.0.1:8000 已在跑）+ curl；web 侧无需起 dev（契约断言在传输层）。  
**前置修复（本机 dev DB，一次性）**：api T4 迁移未跑导致 replay 500 → 执行 `alembic upgrade head`（`20260831_lg_rag_threads → 20260831_lg_rag_run_events`，落 `ops_lg_rag_run_events` 表）后全通；另用 `scripts/create_initial_user.py` 增发一枚 dev invite token 登录（additive，不影响既有 token）。

| # | 用例（命令要点） | 结果 |
|---|---|---|
| A | live `POST /api/ops/lg-rag/stream`（basic） | 每帧带顶层 `cursor="{run_id}:{seq}"` ✓（契约 §4.2 实测） |
| B | run2 收到 seq=1 run.start 即 `kill` curl（模拟 DevTools offline mid-stream） | 客户端仅见 seq1；服务端续跑 |
| C（=G） | run2 `POST /api/ops/lg-rag/replay` body `{run_id, after_seq:1}` | 补发 seq=[2,3]（node.progress/answer）· 全 >1 · 无重复 · **客户端漏收帧不丢** ✓ |
| D | run2 轮询 replay 至 100s+ | 无 done（见遗留 1：断开即取消 generator）；web 侧此场景走 N4「仍在生成中」提示，行为自洽 |
| E | run3（完整跑完）replay `after_seq:0` | seq=[1,2,3,4] 含 `done` · 严格递增无重复 · cursor 形状齐 · **replay 至 done** ✓ |
| F | run3 replay `after_seq:2` | seq=[3,4] · 只重放 `seq>after_seq` ✓ |
| J | run3 replay `after_seq:4`（末 seq） | HTTP 200 · 0 帧干净空流（N4 边界实测）✓ |
| H | replay 未知 `run_id` | `{"detail":"Run not found"}` HTTP **404** ✓ |
| I | replay 未登录 | `{"detail":"Not authenticated"}` HTTP **401** ✓ |
| K | replay `after_seq:"abc"`（非法 body） | FastAPI 校验 HTTP **422** ✓ |
| — | answer 不重复 append / 刷新接力 | web Vitest 断言承载（seq 去重 · resumeFromCursor 新消息渲染；chat-store T4 13 例） |

证据文件（本机 /tmp，未入仓）：`t4_live.sse` / `t4_live2.sse` / `t4_live3.sse` / `t4_replay_*.sse` / `t4_joint_cookies.txt`。

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31 |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸） |
| HG-AUDIT-R1 | approved | web 00 代签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| **HG-JOINT-DEBUG** | **pending** | **脚本化联调记录已留（本文件 §联调证据 · A–K 全过）→ 待维护者核签 task 表 |

## 遗留（非阻塞）

1. **api 侧发现（联调实证）**：客户端断开即取消 SSE generator——已 yield 帧在 emit 内先于 yield 落盘，但断开后 generator 被 CancelledError 终止，**后续帧（含 done）不再产生/落盘**。故「断连期间服务端跑完 → replay 至 done」仅当服务端先于断开跑完时成立（本机 basic 快路径可复现）；web 侧对该场景行为自洽（replay 补发已存帧 · 无 done 时保留 active-run + N4 提示）。建议 api 侧后续 task 评估（不属本 web task 范围，未改 api 码）。
2. R1-N6 语义（停止=终态不可续看）联调未单独验证 UI 文案；维持 00 定夺，维护者核签时可确认产品认知。
3. 多 tab 并发写 localStorage 为同键覆盖（failure_paths 已声明允许，沿用 T3 先例）。
