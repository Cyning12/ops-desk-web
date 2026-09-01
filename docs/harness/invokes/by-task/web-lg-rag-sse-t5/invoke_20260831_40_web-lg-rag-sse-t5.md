# Invoke：40-self-check · web-lg-rag-sse-t5

> **用途**：40 自检留痕；web PR 前的最后自动闸 + **HG-JOINT-DEBUG 脚本化联调证据**。  
> **下一步（人工）**：维护者核本文件 §联调证据 → 亲签 HG-JOINT-DEBUG → 方可 merge web PR（**勿 auto-merge**）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-t5` |
| git_branch | `task/web-lg-rag-sse-t5` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31 · 同上下文执行）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ |
| test | `pnpm test` | 0 | ✅ 23 files / **162** tests passed（T5 新增 7 例全在 chat-store spec；既有 155 例全绿 · chat-stream-deprecation 静态守卫 3 例绿） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t5.md` | 0 | ✅ VERIFY: PASS |

测试纪律：`test_strategy=required` → T5 七例先行（5 failed 红）→ 实现后 42/42（chat-store spec）全绿。

## 验收勾选口径

- 11 项验收全勾：机检项 10 条由 Vitest/五闸承载（详见 task 验收节）；联调项由本文件 §联调证据（脚本化记录通道）承载。
- HG-JOINT-DEBUG 闸表仍 **pending**：脚本化记录已留，按闸表「40 脚本化联调记录 **或** 维护者亲签」双通道，请维护者核证据后在 task 表签 approved。

## 联调证据（HG-JOINT-DEBUG 承载 · 2026-08-31 脚本化实测）

**环境（R1-N5 注明版本）**：本地 api（`../ops-desk-api` master **`99ea8c5`** · `27cf7af`(PR #105 squash) 已 `git merge-base --is-ancestor` 核为 HEAD 祖先 · 127.0.0.1:8000 在跑 · 生产部署状态未核）+ curl（复用 T4 dev cookie `/tmp/t4_joint_cookies.txt`，latest-session 200 有效）；web 侧无需起 dev（契约断言在传输层 + Vitest 承载渲染语义）。

**命令（留证可复跑）**：

```bash
# live supervisor 实流
curl -sN -b /tmp/t4_joint_cookies.txt -H 'Content-Type: application/json' -H 'Accept: text/event-stream' \
  -d '{"query":"用一句话介绍 Kimi Code","mode":"supervisor"}' \
  http://127.0.0.1:8000/api/ops/lg-rag/stream > /tmp/t5_live.sse
# replay 同 run 从头重放
curl -sN -b /tmp/t4_joint_cookies.txt -H 'Content-Type: application/json' -H 'Accept: text/event-stream' \
  -d '{"run_id":"7d68605319ab4fbaa4995e7ddffc3220","after_seq":0}' \
  http://127.0.0.1:8000/api/ops/lg-rag/replay > /tmp/t5_replay.sse
# 断言：python3 解析 data: 帧（delta 拼接 / 终帧 / seq 单调 / done 后无帧 / live↔replay 逐帧比对）
```

| # | 用例（对齐 task 联调用例四条） | 结果 |
|---|---|---|
| A | ① supervisor 实流 run `7d686053…`：answer 帧多帧 `{"delta":…}` 逐帧到达 | **357 帧 · 344 delta 帧 + 2 终帧 `{"content":…,"final":true}`**；delta 为 UTF-8 中文 chunk 逐帧干净解码（无乱码）✓ |
| B | ① 拼接==终帧：逐轮 delta 拼接 vs 终帧 content | 本轮含 critic rebinding → **两轮** delta+终帧；逐轮 `concat.lstrip('\n') == 终帧 content` ✓（api 终帧对拼接做前导 `\n\n` 修剪 · 差 2 字符；web 终帧**替换**语义天然兜底，对齐 failure_paths「以终帧 content 为准」） |
| C | ② done 后停止追加 | `done`（seq 357）之后 **0 帧**（无任何 answer 帧）✓；web 侧 `answerTerminal` 闸 + seq 去重双保险（Vitest 断言迟到帧忽略） |
| D | ③ 与 node.progress 并存不串台 | 9 个 node/subtask.progress 帧（seq 2–5 · 163–166 · 356）与 delta 帧共享**严格单调 seq 1–357**；thinking（progress）与 content（answer）字段分离不串台 ✓（web 侧 Vitest 并存例断言） |
| E | ④ replay 含 delta 序列完整 | replay `after_seq:0`：**357 帧 seq 与 live 逐帧一致 · answer payload 全等（live==replay）· 344 delta 序列完整 · 含 done** ✓ |
| — | 占位帧 / 降级整段 / 两键同帧 / abort·error 迟到帧 | web Vitest 专例承载（chat-store T5 7 例）；本轮 supervisor 实流未触发占位帧（basic 路径 · 契约保证不变） |

证据文件（本机 /tmp，未入仓）：`t5_live.sse`（357 帧）/ `t5_replay.sse`（357 帧）/ `t5_live.err` · `t5_replay.err`（curl 均 exit 0）。

## 实测观察（非阻塞 · 产品/契约认知）

1. **critic rebinding 两轮 answer**：本轮 run 触发 rebinding → 两轮「delta 序列 + 终帧」。web 行为：round-2 delta 会暂时 append 在 round-1 终帧文本之后（transient），round-2 终帧到达即**全量替换自愈**——终态正确，符合 00 定夺分支规则；瞬态拼接段属可接受边角（rebinding 为少数路径），维护者核签时可确认认知。
2. **api 终帧 lstrip('\n')**：delta 拼接比终帧 content 多前导 `\n\n`（两轮均差 2 字符）；替换语义兜底无用户可见差异。若维护者希望契约钉死「终帧==逐字拼接」，属 api 侧变更请求（本 task 不改 api 码）。
3. 断连 mid-delta 视觉割裂边界（R1-N2 内决）：终帧到达即自愈；无终帧边角（api 断开即取消 generator · T4 invoke_40 遗留 1 沿用）两气泡各剩半段，产品语义可接受。

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31 |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸） |
| HG-AUDIT-R1 | approved | web 00 代签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| **HG-JOINT-DEBUG** | **pending** | 脚本化联调记录已留（本文件 §联调证据 · A–E 全过）→ 待维护者核签 task 表 |

## 遗留（非阻塞）

1. HG-JOINT-DEBUG 未签前 web PR **勿 auto-merge / 勿 merge**；维护者核 §联调证据后签 task 表。
2. 上屏观感（打字机动效/光标态）未人工目检——传输层契约断言 + Vitest 渲染语义已承载，建议维护者核签时 dev 页快速目测一轮（`pnpm dev` + supervisor 提问）。
3. 实测观察 1/2（rebinding 瞬态 · lstrip 修剪）供维护者认知；如须契约化回 api 00 串行轨。
