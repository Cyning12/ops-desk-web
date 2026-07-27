---
graph_id: 00_main
version: 2026-07-27
generated_at: 2026-07-27T14:32:53Z
source: 00_main.graph.yaml
---

# ops-desk-web 顶层流程总图

Ops Desk Web 前端架构总图：页面路由、Pinia Store、API Client、SSE Chat 消费与后端 API 的关系。

## Mermaid

```mermaid
flowchart TB
    user[用户]
    browser[浏览器]
    app[Vue 3 App]
    router[Vue Router]
    pinia[Pinia Store]
    api_client[API Client]
    sse_client[SSE Client]
    pages[页面组件]
    chat_page[Chat 页面]
    obs_page[过程观测页]
    chat_flow[>../l1/10_flow_chat.md]
    modules_doc[>../l1/01_modules.md]
    ops_api[ops-desk-api]
    api_doc[>../../../ops-desk-api/docs/_tech_graph/l0/00_main.md]

    user --"interacts"--> browser
    browser --"loads"--> app
    app --"mounts"--> router
    app --"uses"--> pinia
    router --"routes"--> pages
    pages --"calls"--> api_client
    pages --"includes"--> chat_page
    pages --"includes"--> obs_page
    chat_page --"streams"--> sse_client
    chat_page --"展开"--> chat_flow
    sse_client --"POST /api/ops/chat/stream"--> ops_api
    api_client --"HTTP /api/ops/*"--> ops_api
    ops_api --"加载"--> api_doc
    app --"模块边界"--> modules_doc

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
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
| sse_client | SSE Client | flow |
| pages | 页面组件 | flow |
| chat_page | Chat 页面 | flow |
| obs_page | 过程观测页 | flow |
| chat_flow | >../l1/10_flow_chat.md | external |
| modules_doc | >../l1/01_modules.md | external |
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
| chat_page | sse_client | -> | depends_on | streams |  |
| chat_page | chat_flow | -> | depends_on | 展开 |  |
| sse_client | ops_api | -> | depends_on | POST /api/ops/chat/stream |  |
| api_client | ops_api | -> | depends_on | HTTP /api/ops/* |  |
| ops_api | api_doc | -> | depends_on | 加载 |  |
| app | modules_doc | -> | depends_on | 模块边界 |  |

## Sub-graph Links

- `Struct`: [`01_struct.md`](01_struct.md)（手写 · 无 `.graph.yaml`）
- `Version`: [`02_version.md`](02_version.md)（手写 · 无 `.graph.yaml`）
- 子图编辑源见 `docs/_tech_graph/*.graph.yaml`

