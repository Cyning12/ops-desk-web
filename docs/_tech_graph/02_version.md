# 图谱版本时间线

| 日期 | 版本 | 事件 |
|---|---|---|
| 2026-07-16 | v0.1.0 | 初始版本，基于 README 和前端现状分析生成基础模块表与顶层图 |
| 2026-07-24 | v0.2.0 | W1 web-skeleton 落地：`src/` 骨架按 01_struct.md 一级模块表实现（entry / router 6 路由占位 / layouts / api axios 封装 / pinia / styles 水墨风 CSS 变量）；无新增一级模块，顶层图结构不变（00_main.graph.yaml 未改）；AGENTS.md SSE 约束更正为原生 fetch + ReadableStream；确认不引 Tailwind |

## 机器轨

- schema: `inform_graph.v3`
- source yaml: `docs/_tech_graph/*.graph.yaml`
- compiled md: `docs/_tech_graph/*.md`
- graph.json: `docs/_tech_graph/graph.json`（兼容 harness v2 `graph yaml check`）
- compile script: `scripts/graph-compile.sh`
