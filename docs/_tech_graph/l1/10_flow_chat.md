---
graph_id: 10_flow_chat
version: 2026-09-08
generated_at: sha256-6dae2c2b9be04674
source: 10_flow_chat.graph.yaml
---

# Chat 流式对话流程（前端）

用户在 Chat 页发送消息：ChatView → chat store → useLgRagSse → POST /api/ops/lg-rag/stream（freeze lg-rag-sse-v1 · 2026-08-31 起主 Chat 切 lg-rag SSE，废弃 chat stream 主路径）；会话元数据走 axios fetchLatestSession（T2 保留门控，非 lg-rag SoT）。T3（2026-08-31）thread_id 会话连续性：客户端不自生成；首轮留空 → api 生成 → run.start payload 捕获；localStorage 持久化（key ops.lg-rag.thread-id，不可用则内存态降级）；刷新/重进恢复后端上下文（不回显历史消息，顶部提示条）；401/登出清除；已存 id 遇 404/422 清本地 id + 提示、不自动重发；startNewSession() 开新会话。T4（2026-08-31）断联/replay 续看：每帧捕获可选顶层 cursor（缺失以 run_id+seq 合成）；active-run 持久化（key ops.lg-rag.active-run，终态 done/error/abort 即清除）；断网/超时 mid-stream → 错误条 + 手动「续看」→ replayLgRag POST /api/ops/lg-rag/replay body {run_id, after_seq}（SSE 形状同 live，复用同一 LgRagSseFrameParser 与渲染管线，渲染进新建 assistant 消息）；per run_id 记 lastAppliedSeq，seq<=lastAppliedSeq 帧忽略（answer 不重复 append · thinking 不重复）；replay 404/422 清 active-run + 提示不重试；401（live/replay）清 thread_id + 清 active-run + 跳登录；replay 流再断 lastSeq 已推进可接力；刷新有未完成 run →「上次回答未完成·续看」条（不自动 replay）。T5（2026-08-31）answer delta 打字机：payload 含 delta 键 → 追加到当前 assistant.content；含 content 键 → 全量替换（终帧 final:true 同此 · 严禁终帧叠加到 delta 拼接后）；两键同帧 content 优先 + warn（R1-N1）；done/error/abort/传输层终断后停止追加（迟到帧忽略）；无 delta 帧自然降级 T2 整段行为；占位帧（content 空串 + note:no_aggregator）按 T2 现行为；replay 含 delta 复用同一 processFrame 管线；ChatView streaming 中最新 assistant 气泡光标态（最小 UI 增量）。T6（2026-08-31）chat SSE 死代码已清除：旧 chat SSE 封装与对照单测删除（api chat stream 已 410 Gone），静态守卫升级为「文件缺席 + src 全树无 chat stream 字面量」；保留 fetchLatestSession 会话元数据门控（api 端点未下线）。progressive-reveal（2026-09-08）：客户端 reveal 队列（useRevealQueue · 60 字/秒）——answer delta 先入网络缓冲再匀速出队到 content（同 tick 突发不瞬满）；content/final 取消队列并以终稿替换；done/error/abort 刷齐已收；subtask step 即时可读行；done 解析 subtask_result.output 打字机渐显；replay 默认 ≥4× 加速；双缓冲改写现有 content/subtasks[].content（少动 ChatView 绑定）。

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
    replay_sse["replayLgRag"]
    resume_from_cursor["resumeFromCursor"]
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
    chat_view -->|"续看 click（手动触发）"| resume_from_cursor
    resume_from_cursor -->|"starts（after_seq=lastSeq）"| replay_sse
    replay_sse -->|"parses frames（同 live 管线）"| sse_parser
    replay_sse -->|"POST /api/ops/lg-rag/replay"| ops_api
    ops_api -->|"后端展开"| api_chat_flow

    classDef phase fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef doc fill:#fff8e1,stroke:#ff6f00,stroke-width:1px
    classDef infra fill:#e8f5e9,stroke:#2e7d32,stroke-width:1px
    class chat_view,chat_store,load_session,send_message,fetch_session_api,stream_sse,replay_sse,resume_from_cursor phase
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
| replay_sse | replayLgRag | flow |
| resume_from_cursor | resumeFromCursor | flow |
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
| chat_view | resume_from_cursor | -> | depends_on | 续看 click（手动触发） |  |
| resume_from_cursor | replay_sse | -> | depends_on | starts（after_seq=lastSeq） |  |
| replay_sse | sse_parser | -> | depends_on | parses frames（同 live 管线） |  |
| replay_sse | ops_api | -> | depends_on | POST /api/ops/lg-rag/replay |  |
| ops_api | api_chat_flow | -> | depends_on | 后端展开 |  |
