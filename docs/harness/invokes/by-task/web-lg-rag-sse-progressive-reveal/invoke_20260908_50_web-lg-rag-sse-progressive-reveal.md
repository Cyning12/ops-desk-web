# invoke · 50 · web-lg-rag-sse-progressive-reveal

> **hat**：50（独立复检 · 00 统筹代行）  
> **日期**：2026-09-08  
> **分支**：`task/web-lg-rag-sse-progressive-reveal`

## 输入

- 40 结论：验收 10/10 pass · invoke_40 已落盘 · 建议交 50
- 30 交付：`useRevealQueue` + chat store / ChatView / tests / graph / wiki

## 复检动作

| 项 | 结果 |
|---|---|
| `pnpm lint` | exit 0 |
| `pnpm test` | exit 0 · 165 passed |
| `verify --task` | VERIFY: PASS · 闸全 approved |
| 代码抽查 | `enqueue`/`replace`/`flush` · step 分流 · replay×4 · done 刷齐 —— 与定夺一致 |
| 单测抽查 | progressive-reveal describe 含不瞬满 / output 渐显 / abort 刷齐 / replay×4 |

## 结论

**PASS** · 可开 PR（勿 auto-merge 若维护者另有联调闸；本 task 无 HG-JOINT-DEBUG）

## 已知未测（不挡 PR）

- 浏览器实流观感
- 真实 api `step` payload 键全集

## 下一棒

00：commit → push → `gh pr create`
