# 图谱版本时间线

| 日期 | 版本 | 事件 |
|---|---|---|
| 2026-07-16 | v0.1.0 | 初始版本，基于 README 和前端现状分析生成基础模块表与顶层图 |
| 2026-07-24 | v0.2.0 | W1 web-skeleton 落地：`src/` 骨架按一级模块表实现；确认不引 Tailwind |
| 2026-07-25 | v1.0.0 | Epic W0–W8 完成：6 页面落地并联调通过；构建就绪 |
| 2026-07-27 | v1.1.0 | **Phase γ**：物理分层 `l0/l1/l2/shared`；模块真值 → `l1/01_modules.md`；chat G-L2 试点；递归 `graph-compile.sh`；`shared/graph.json`（C1） |

## 机器轨

- schema: `inform_graph.v3`
- source yaml: `docs/_tech_graph/**/*.graph.yaml`（递归）
- compiled md: 与 yaml 同目录 `*.md`
- graph.json 真值: `docs/_tech_graph/shared/graph.json`（根 `graph.json` 为过渡双写）
- compile script: `scripts/graph-compile.sh`
