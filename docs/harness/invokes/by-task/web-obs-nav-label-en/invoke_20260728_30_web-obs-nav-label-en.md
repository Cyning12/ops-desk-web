# invoke · 30 · web-obs-nav-label-en

| 项 | 值 |
|---|---|
| **hat** | 30 |
| **日期** | 2026-07-28 |
| **GATE_VERIFY** | HG-GRAPH-MODULES / HG-AUDIT-R1 = approved（见 task 表） |

## 改动

- `src/layouts/AppLayout.vue`：侧栏 `过程观测` → `Observability`
- `src/router/index.ts`：`meta.title` 同步

## 验证

`pnpm lint` · `pnpm test` · `pnpm build`
