# 图谱版本时间线

| 日期 | 版本 | 事件 |
|---|---|---|
| 2026-07-16 | v0.1.0 | 初始版本，基于 README 和前端现状分析生成基础模块表与顶层图 |
| 2026-07-24 | v0.2.0 | W1 web-skeleton 落地：`src/` 骨架按 01_struct.md 一级模块表实现（entry / router 6 路由占位 / layouts / api axios 封装 / pinia / styles 水墨风 CSS 变量）；无新增一级模块，顶层图结构不变（00_main.graph.yaml 未改）；AGENTS.md SSE 约束更正为原生 fetch + ReadableStream；确认不引 Tailwind |
| 2026-07-25 | v1.0.0 | Epic W0–W8 完成：6 页面（Login/Overview/Issues/Pulls/Graph/Chat）全部落地并联调通过（dev proxy 全端点 200、SSE 序列 run.start→thinking→answer→done 实测）；构建就绪（manualChunks 拆 vendor 消除 >500kB 警告，最大 chunk 372.79kB）；新增 docs/deployment/nginx-static-hosting.md 托管说明；无新增一级模块，顶层图结构不变 |

## 机器轨

- schema: `inform_graph.v3`
- source yaml: `docs/_tech_graph/*.graph.yaml`
- compiled md: `docs/_tech_graph/*.md`
- graph.json: `docs/_tech_graph/graph.json`（兼容 harness v2 `graph yaml check`）
- compile script: `scripts/graph-compile.sh`
