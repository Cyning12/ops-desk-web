---
graph_id: 10_flow_chat
version: 2026-08-31
generated_at: 2026-08-31T02:57:16Z
source: 10_flow_chat.graph.yaml
---

# Chat 流式对话流程（前端）

用户在 Chat 页发送消息：ChatView → chat store → useLgRagSse → POST /api/ops/lg-rag/stream（freeze lg-rag-sse-v1 · 2026-08-31 起主 Chat 切 lg-rag SSE，废弃 chat stream 主路径）；会话元数据走 axios fetchLatestSession（T2 保留）。

## Mermaid

```mermaid
flowchart TB
    user["用户"]
    chat_view["ChatView"]
    chat_store["useChatStore"]
    load_session["loadLatestSession"]
    send_message["sendMessage"]
    fetch_session_api["fetchLatestSession"]
    stream_sse["streamLgRag"]
    sse_parser["LgRagSseFrameParser"]
    ops_api["ops-desk-api"]
    api_chat_flow[">../../../ops-desk-api/docs/_tech_graph/l1/10_flow_chat.md"]

    user -->|"opens /chat"| chat_view
    chat_view -->|"binds"| chat_store
    chat_view -->|"onMounted"| load_session
    load_session -->|"calls"| fetch_session_api
    fetch_session_api -->|"GET /ops/chat/sessions/latest"| ops_api
    user -->|"submit"| send_message
    chat_view -->|"triggers"| send_message
    send_message -->|"starts"| stream_sse
    stream_sse -->|"parses frames"| sse_parser
    stream_sse -->|"POST /api/ops/lg-rag/stream"| ops_api
    ops_api -->|"后端展开"| api_chat_flow

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class chat_view,chat_store,load_session,send_message,fetch_session_api,stream_sse phase
    class sse_parser doc
    class user,ops_api,api_chat_flow infra
```

## Structured Data

### Nodes

| ID | Label | Kind |
|----|-------|------|
| user | 用户 | external |
| chat_view | ChatView | flow |
| chat_store | useChatStore | flow |
| load_session | loadLatestSession | flow |
| send_message | sendMessage | flow |
| fetch_session_api | fetchLatestSession | flow |
| stream_sse | streamLgRag | flow |
| sse_parser | LgRagSseFrameParser | struct |
| ops_api | ops-desk-api | external |
| api_chat_flow | >../../../ops-desk-api/docs/_tech_graph/l1/10_flow_chat.md | external |

### Edges

| From | To | Mark | Type | Label | Anchors |
|------|----|------|------|-------|---------|
| user | chat_view | -> | depends_on | opens /chat |  |
| chat_view | chat_store | -> | depends_on | binds |  |
| chat_view | load_session | -> | depends_on | onMounted |  |
| load_session | fetch_session_api | -> | depends_on | calls |  |
| fetch_session_api | ops_api | -> | depends_on | GET /ops/chat/sessions/latest |  |
| user | send_message | -> | depends_on | submit |  |
| chat_view | send_message | -> | depends_on | triggers |  |
| send_message | stream_sse | -> | depends_on | starts |  |
| stream_sse | sse_parser | -> | depends_on | parses frames |  |
| stream_sse | ops_api | -> | depends_on | POST /api/ops/lg-rag/stream |  |
| ops_api | api_chat_flow | -> | depends_on | 后端展开 |  |
