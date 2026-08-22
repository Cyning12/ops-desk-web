# Invoke：40-verify · web-lg-rag-page

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-page` |
| git_branch | `task/web-lg-rag-page` |
| created_utc_or_local | 2026-08-21 |
| notes | 30 同上下文自检 + 00 独立复验 |

---

## 验证记录（00 独立复验 · 非仅信 30 汇报）

| 命令 | 30 自检 | 00 复验 |
|------|---------|---------|
| `pnpm lint` | exit 0 | exit 0 |
| `pnpm test` | exit 0（107/107 · 21 文件 · lg-rag 新增 17 例） | exit 0（107/107 复跑一致） |
| `pnpm build` | exit 0（vue-tsc --noEmit 过 · LgRagView chunk 10.26 kB） | exit 0（✓ built in 1.85s） |
| `./scripts/graph-compile.sh` | exit 0（compile + check OK） | exit 0 |

- 实现提交：commit `64db791`（显式列文件 · 12 files, +925 · 未含 .codex/）
- 联调冒烟：按 task 验收豁免（optional · blocked_by api `lg-rag-http`——该 api task 已 CLOSE，豁免仍按 task 文本执行，补冒烟留 P1）
