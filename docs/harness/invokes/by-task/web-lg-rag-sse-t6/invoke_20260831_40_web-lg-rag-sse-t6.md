# Invoke：40-self-check · web-lg-rag-sse-t6

> **用途**：40 自检留痕；web PR 前的最后自动闸 + **HG-JOINT-DEBUG 脚本化联调证据**。  
> **下一步（人工）**：维护者核本文件 §联调证据 → 亲签 HG-JOINT-DEBUG → 方可 merge web PR（**勿 auto-merge**）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-t6` |
| git_branch | `task/web-lg-rag-sse-t6` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31 · 同上下文执行）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ eslint 全仓无告警 |
| test | `pnpm test` | 0 | ✅ 22 files / **153** tests passed（删 chat-sse.spec 9 例：162→153；守卫改写 3 例绿；chat store T3–T5 既有例全绿 → `fetchLatestSession` 保留行为不变） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff · graph.json 再生成） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t6.md` | 0 | ✅ VERIFY: PASS |

## 验收勾选口径

- 7 项验收全勾：机检项 6 条由 Vitest/六闸承载；联调项由本文件 §联调证据（脚本化记录通道）承载。
- HG-JOINT-DEBUG 闸表仍 **pending**：脚本化记录已留，按闸表「40 脚本化联调记录 **或** 维护者亲签」双通道，请维护者核证据后在 task 表签 approved。

## 联调证据（HG-JOINT-DEBUG 承载 · 2026-08-31 脚本化实测）

**口径**：本 task 为死代码清除，联调 = 构建产物级 + 源码级「无 chat stream 字符串/符号」断言（代码侧无发起方即满足「全站无 chat stream 请求 · 无 410 洪流」）；既有功能回归由 lint/test/build 三闸承载。

**命令（留证可复跑）**：

```bash
pnpm build                                        # exit 0（先重建 dist）
grep -rn '/ops/chat/stream' dist/                 # exit 1（零命中 = 通过，含压缩产物）
grep -rn 'chat/stream' dist/                      # exit 1（子串亦零命中）
grep -rn 'streamOpsChat' dist/                    # exit 1（符号零命中）
grep -rn '/ops/chat/stream' src/                  # exit 1（src 全树字面量缺席 · 守卫同口径）
grep -rn 'useOpsChatSse\|streamOpsChat' src/     # exit 1（src 全树符号缺席）
```

| # | 用例（对齐 task 联调用例三条） | 结果 |
|---|---|---|
| A | ① 构建产物 grep 无 `/ops/chat/stream` | dist 全产物（含 minify 后 js/css/html）零命中 ✓；子串 `chat/stream`、符号 `streamOpsChat` 同零命中 ✓ |
| B | ② 全站无 chat stream 请求 | src 全树无 `/ops/chat/stream` 字面量、无 `useOpsChatSse`/`streamOpsChat` 引用 → **代码侧无任何发起方**；守卫 `tests/chat-stream-deprecation.spec.ts` 3 例（文件缺席 + 全树缺席 + lg-rag 主线正向断言）CI 常驻防回退 ✓ |
| C | ③ 既有功能回归 | lint/test/build 全绿（test 153 例：T3/T4/T5 chat store 用例全绿 → `fetchLatestSession` 门控行为不变；lg-rag 页/其余页面 spec 全绿）✓ |

**api 侧佐证**：api T6 PR #108 MERGED（`POST /api/ops/chat/stream` → 410 Gone）；web 侧自本 task 起无该端点请求发起方，api 410 不会被前端触发（若出现 = 回归 bug，对齐 failure_paths 第 4 行）。

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31 |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸） |
| HG-AUDIT-R1 | approved | web 00 代签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| **HG-JOINT-DEBUG** | **pending** | 脚本化联调记录已留（本文件 §联调证据 · A–C 全过）→ 待维护者核签 task 表 |

## 遗留（非阻塞）

1. HG-JOINT-DEBUG 未签前 web PR **勿 auto-merge / 勿 merge**；维护者核 §联调证据后签 task 表。
2. `docs/_tech_graph/l0/00_main.graph.yaml` L111 边标签 `POST /api/ops/chat/stream` 自 T2 起脱节（本 task graph_delta 钉死仅 `10_flow_chat` 故不动）；归 00 后续图谱清扫 task。
3. README L47 `api-auth-chat.md` 指针保留（auth/session 元数据仍有效 · 已注 chat stream 章节弃用）；其 chat stream 章节本体属 api 仓文档，是否改写归 api 侧决定（本仓不越界）。
