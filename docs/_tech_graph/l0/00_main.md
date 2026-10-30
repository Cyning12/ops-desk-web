---
graph_id: 00_main
version: 2026-08-31
generated_at: sha256-5d5be4fc876979f4
source: 00_main.graph.yaml
---

# ops-desk-web 顶层流程总图

Ops Desk Web 前端架构总图：页面路由、Pinia Store、API Client、lg-rag SSE 主线消费与后端 API 的关系。

## Mermaid

```mermaid
flowchart TB
    user["用户"]
    browser["浏览器"]
    app["Vue 3 App"]
    router["Vue Router"]
    pinia["Pinia Store"]
    api_client["API Client"]
    sse_client["SSE Client（lg-rag SSE 主线）"]
    pages["页面组件"]
    chat_page["Chat 页面"]
    obs_page["过程观测页"]
    login_page["登录页"]
    overview_page["概览页"]
    issues_page["Issue 页"]
    pulls_page["PR 页"]
    graph_page["图谱页"]
    lc_evidence_page["LC 证据页"]
    lg_rag_page["LG RAG 页"]
    chat_flow[">../l1/10_flow_chat.md"]
    modules_doc[">../l1/01_struct.md"]
    ops_api["ops-desk-api"]
    api_doc[">../../../ops-desk-api/docs/_tech_graph/l0/00_main.md"]

    user -->|"interacts"| browser
    browser -->|"loads"| app
    app -->|"mounts"| router
    app -->|"uses"| pinia
    router -->|"routes"| pages
    pages -->|"calls"| api_client
    pages -->|"includes"| chat_page
    pages -->|"includes"| obs_page
    pages -->|"includes"| login_page
    pages -->|"includes"| overview_page
    pages -->|"includes"| issues_page
    pages -->|"includes"| pulls_page
    pages -->|"includes"| graph_page
    pages -->|"includes"| lc_evidence_page
    pages -->|"includes"| lg_rag_page
    lg_rag_page -->|"calls（invoke · POST /api/ops/lg-rag/invoke）"| api_client
    chat_page -->|"streams"| sse_client
    chat_page -->|"展开"| chat_flow
    sse_client -->|"POST /api/ops/lg-rag/stream"| ops_api
    api_client -->|"HTTP /api/ops/*"| ops_api
    ops_api -->|"加载"| api_doc
    app -->|"模块边界"| modules_doc

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class api_client,sse_client,pages,chat_page,obs_page,login_page,overview_page,issues_page,pulls_page,graph_page,lc_evidence_page,lg_rag_page phase
    class app,router,pinia doc
    class user,browser,chat_flow,modules_doc,ops_api,api_doc infra
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| user | 用户 | external |
| browser | 浏览器 | external |
| app | Vue 3 App | struct |
| router | Vue Router | struct |
| pinia | Pinia Store | struct |
| api_client | API Client | flow |
| sse_client | SSE Client（lg-rag SSE 主线） | flow |
| pages | 页面组件 | flow |
| chat_page | Chat 页面 | flow |
| obs_page | 过程观测页 | flow |
| login_page | 登录页 | flow |
| overview_page | 概览页 | flow |
| issues_page | Issue 页 | flow |
| pulls_page | PR 页 | flow |
| graph_page | 图谱页 | flow |
| lc_evidence_page | LC 证据页 | flow |
| lg_rag_page | LG RAG 页 | flow |
| chat_flow | >../l1/10_flow_chat.md | external |
| modules_doc | >../l1/01_struct.md | external |
| ops_api | ops-desk-api | external |
| api_doc | >../../../ops-desk-api/docs/_tech_graph/l0/00_main.md | external |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| user | browser | -> | depends_on | interacts |  |
| browser | app | -> | depends_on | loads |  |
| app | router | -> | depends_on | mounts |  |
| app | pinia | -> | depends_on | uses |  |
| router | pages | -> | depends_on | routes |  |
| pages | api_client | -> | depends_on | calls |  |
| pages | chat_page | -> | depends_on | includes |  |
| pages | obs_page | -> | depends_on | includes |  |
| pages | login_page | -> | depends_on | includes |  |
| pages | overview_page | -> | depends_on | includes |  |
| pages | issues_page | -> | depends_on | includes |  |
| pages | pulls_page | -> | depends_on | includes |  |
| pages | graph_page | -> | depends_on | includes |  |
| pages | lc_evidence_page | -> | depends_on | includes |  |
| pages | lg_rag_page | -> | depends_on | includes |  |
| lg_rag_page | api_client | -> | depends_on | calls（invoke · POST /api/ops/lg-rag/invoke） |  |
| chat_page | sse_client | -> | depends_on | streams |  |
| chat_page | chat_flow | -> | depends_on | 展开 |  |
| sse_client | ops_api | -> | depends_on | POST /api/ops/lg-rag/stream |  |
| api_client | ops_api | -> | depends_on | HTTP /api/ops/* |  |
| ops_api | api_doc | -> | depends_on | 加载 |  |
| app | modules_doc | -> | depends_on | 模块边界 |  |

## Sub-graph Links

- `Struct`: [`01_struct.md`](01_struct.md)（手写 · 无 `.graph.yaml`）
- `Version`: [`02_version.md`](02_version.md)（手写 · 无 `.graph.yaml`）
- 子图编辑源见 `docs/_tech_graph/*.graph.yaml`

