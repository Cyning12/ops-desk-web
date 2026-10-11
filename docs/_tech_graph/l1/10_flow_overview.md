---
graph_id: 10_flow_overview
version: 2026-08-31
generated_at: sha256-b9812fa317dbdeb7
source: 10_flow_overview.graph.yaml
---

# Overview 总览页加载流程（前端）

用户打开总览页（/overview）：OverviewView onMounted → useOverviewStore.load → api/overview.fetchOverview → api/http axios → GET /api/ops/overview → ops_api。旁注：① load() 幂等防重入——进行中的请求未完成前重复调用直接返回（store L20）；② 失败不污染已有数据——保留上一次成功 data，error 供页面 el-alert + 「重试」（store 头注 L11–12 · view L121–129）；③ 后端 dev 库为空属正常返回：median_days=null / sync_run=null / trend 全 0，页面按空态渲染（api 头注 L7–9 · MedianMetric L12–16 / TrendPoint L39–44 类型在案）；④ 401 由 http 全局拦截器处理跳登录（api L60 注 · http.ts L60–71）。

## Mermaid

```mermaid
flowchart TB
    user["用户"]
    overview_view["OverviewView"]
    overview_store["useOverviewStore"]
    load_action["load"]
    fetch_overview_api["fetchOverview"]
    http_client["http（axios · baseURL=/api）"]
    ops_api["ops-desk-api"]

    user -->|"opens /overview"| overview_view
    overview_view -->|"binds"| overview_store
    overview_view -->|"onMounted（L9–10）· 重试 click（L129）"| load_action
    load_action -->|"await（幂等防重入 · L20/L24）"| fetch_overview_api
    fetch_overview_api -->|"http.get('/ops/overview')（L62）"| http_client
    http_client -->|"GET /api/ops/overview"| ops_api

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class overview_view,overview_store,load_action,fetch_overview_api,http_client phase
    class user,ops_api infra
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| user | 用户 | external |
| overview_view | OverviewView | flow |
| overview_store | useOverviewStore | flow |
| load_action | load | flow |
| fetch_overview_api | fetchOverview | flow |
| http_client | http（axios · baseURL=/api） | flow |
| ops_api | ops-desk-api | external |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| user | overview_view | -> | depends_on | opens /overview |  |
| overview_view | overview_store | -> | depends_on | binds |  |
| overview_view | load_action | -> | depends_on | onMounted（L9–10）· 重试 click（L129） |  |
| load_action | fetch_overview_api | -> | depends_on | await（幂等防重入 · L20/L24） |  |
| fetch_overview_api | http_client | -> | depends_on | http.get('/ops/overview')（L62） |  |
| http_client | ops_api | -> | depends_on | GET /api/ops/overview |  |
