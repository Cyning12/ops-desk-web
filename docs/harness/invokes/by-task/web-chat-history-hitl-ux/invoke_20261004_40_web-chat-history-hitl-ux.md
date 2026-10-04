# Invoke · 40 自检 · web-chat-history-hitl-ux

> **hat**：40（合并前自检 · 不新写功能码）
> **日期**：2026-10-04 · **分支**：`task/chat-history-hitl-ux`
> **说明**：本棒由 30 子 Agent 同会话闭环执行（30+40 连体 · 00 派单已含自检要求），本 invoke 由 00 拆录留痕，证据全文见 `invoke_20261004_30_web-chat-history-hitl-ux.md`（AC 对照表与三绿输出摘要）。

## Verify 三绿（真跑 · 与 `.github/workflows/ci.yml` 对齐）

| 项 | 结果 |
|---|---|
| `pnpm lint` | exit 0 |
| `pnpm test` | **28 文件 225 全过**（新增 46 · 旧 179 零回归） |
| `pnpm build` | exit 0 |
| `./scripts/graph-compile.sh` | exit 0（图谱增量后复跑） |
| `npx spec-wave task lint --file docs/tasks/active/task_web_chat_history_hitl_ux.md` | PASS |
| `npx spec-wave verify --target . --task ...` | PASS（三闸 approved） |

## 验收对照

- AC1–AC17 **全勾**（task 文 `- [x]` 已回填 · 机断证据逐条见 30 invoke 对照表）
- 旧测零改动（AC17：branch diff 仅 5 份新测文件 · 旧 23 份零触碰）
- 冻结面：`useLgRagSse.ts` 对 merge-base diff 为空 + 无 `hitl` 字面（AC11）· 零新 SSE 事件 · api 仓零触碰
- 图谱 G-L1 增量落盘（`01_modules.md` api/pinia/components 行 + `10_flow_chat` 补注 · HG-GRAPH-MODULES 随交付勾验）

## 未勾 / 遗留

- 闸行 **HG-JOINT-DEBUG 维持 pending**（`blocked_by api` B1/B2 端点上线 · 未联调不假 CLOSE · blocks merge）
- 遗留风险 4 条见 30 invoke（history 分页 UI 首页 / waiting 续看从头 replay / 联调待闸 / replay.cursor 未消费——均非范围或后续优化）

## 结论

自检通过 · 可开 PR + CI；**merge 须待 HG-JOINT-DEBUG**（api B1/B2 端点上线联调后签录）。
