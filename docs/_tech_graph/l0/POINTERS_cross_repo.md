# 跨仓 POINTER（G-L0 · 不复制对端图谱）

> **一句话**：本仓与配对仓的契约入口指针。  
> **禁止**：粘贴对端 `graph.json` / 整份 flow Mermaid。

| 对端 | 路径 / 契约 | 本仓状态 | 备注 |
|------|-------------|----------|------|
| `ops-desk-api` | 提供 `/api/ops/*` · SSE chat · cookie session | 契约提供方 | G-L0：`../ops-desk-api/docs/_tech_graph/l0/00_main.md` |
| `ops-desk-ios` | 共享后端契约；UI 独立 | **未分层** | Phase δ 后置 |
| `ops-desk-workspace` | docker-compose · 总文档 · 编排 task | 编排 / 人闸 | 不在 workspace 伪造本仓图谱正文 |
| 规格包 | `Projects/docs/harness/spec/graph_skill_layering_v1/` | 方法论真值 | 短约定见本仓 `LAYER_README.md` |

## 关键跨仓 flow id（本仓）

| flow / 契约 | 本仓资产 |
|-------------|---------|
| Chat SSE | `l1/10_flow_chat.*` + `l2/indexes` |
| Auth cookie session | （后续 `10_flow_auth`；本棒未建） |
