# SPEC：Web · LangChain Evidence 旁路使用页（v1）

> **状态**：`signed`（**HG-SPEC-SIGNOFF=approved** · 00 2026-08-16）  
> **track**：`frontend` / `rag-debug`  
> **上游**：后端旁路已关账 · `ops-desk-api` `app/ops/lc_evidence_chain/` · SPEC `SPEC-langchain-evidence-chain_v1.md` · 规划 `ops-desk-api/docs/deployment/rag-frontend-api-plan.md`（路线 B 变体）  
> **下游**：人签本 SPEC → 00 起草 **web task** +（建议同步）**api task** 挂 HTTP → 20 审 → 30  
> **Open Folder（实现）**：`ops-desk-web/`（页面）；配套 API 在 `ops-desk-api/`  
> **Bounded Context**：本页**单独调用** LCEL 旁路，**不**替换现网 Chat（LangGraph SSE）；**不**改 Chat 默认路径。

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **spec_slug** | `web-lc-evidence-page` |
| **invoke_slug** | `web-lc-evidence-page` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：API client mock + store/组件；联调冒烟依赖后端新路由 |
| **Open Folder（实现）** | `ops-desk-web/` |
| **默认分支** | `task/web-lc-evidence-page` |
| **graph_change_layer（建议）** | `G-L1`（pages / api / pinia 增量） |
| **跨仓依赖** | `ops-desk-api` 须新增 HTTP 入口（见 §3 契约）；页面 30 **blocked_by** API 可用或 mock 契约先行 |

### 人工闸（SPEC 阶段）

| human_gate_id | status | 说明 |
|---|---|---|
| **HG-SPEC-SIGNOFF** | approved | 00 签收 v1（2026-08-16）；签约注记见下「00 签收注记」 |

---

## 1. 背景与目标

### 背景

后端已交付 **LangChain LCEL 旁路**（库级 + CLI），路径：`retrieve → grade/decide → answer`，与 Chat 的 LangGraph **并行、默认不挂 graph**。  
前端现仅有 **Chat SSE**（LangGraph）；**没有**独立页面/API 去「单独点一下跑 LCEL」。  
维护者需要调试台式页面：对比 Chat 路径、观察 evidence / gate / answer，便于 RAG 排查与演示。

### 目标（可验收）

1. Web 新增路由页（建议 `/lc-evidence`），侧栏可进；**登录后**可用（同 cookie 鉴权）。  
2. 用户输入 `query` → 调用**旁路专用 HTTP API**（非 `/chat/stream`）→ 展示：  
   - `meta`（含 `gate_action` / `best_relevance` / `kept_count` 等）  
   - `evidence[]` 卡片（anchor / title / snippet / relevance / reason）  
   - `answer` 全文  
3. 明确与 Chat 的边界文案：本页 = LangChain 旁路实验；Chat = 生产 LangGraph。  
4. 前端类型与 API 契约对齐后端 `ChainResult` / `EvidenceItem` / `GateDecision` 字段子集。

### 非目标

- 替换或改写 `ChatView` / `useOpsChatSse` 默认行为  
- 流式 SSE（P0 用同步 JSON 即可）  
- 多轮会话 / session 历史  
- Ingest、金样评测 UI、独立「只检索不答」高级开关（可作为 P1）  
- 匿名公开访问  

---

## 2. 方案对比（R2）

| 方案 | 描述 | 结论 |
|---|---|---|
| A · 新页 + 新同步 API `POST /api/ops/lc-evidence/invoke` | 前端薄客户端；后端薄包装 `ainvoke_evidence_answer` | **采用** |
| B · 前端打 Chat SSE，靠 Flag 切链 | 仍绑 graph/SSE；违背「单独调用 LangChain」 | **否决** |
| C · 仅前端 mock、无后端路由 | 无法联调真实语料 | **否决**（可作前端单测夹具，不能当产品路径） |

**推荐 A**：页面在 web 仓；API 在 api 仓另开（或同 Epic 双 task）。契约 freeze 见下节。

---

## 3. 架构与契约

### 3.1 前端结构（建议）

```text
/lc-evidence（需登录）
  AppLayout 侧栏：「LC Evidence」（或「RAG · LCEL」实验标签）
  src/views/LcEvidenceView.vue
  src/api/lcEvidence.ts          # axios + credentials
  src/stores/lcEvidence.ts       # query / loading / result / error
  （可选）src/components/lc-evidence/*
```

### 3.2 HTTP 契约（freeze 草案 · `freeze_id`: `lc-evidence-http-v1`）

> **实现仓**：`ops-desk-api`。Web 30 以本契约为准；后端变更须升 freeze_id。

**请求**

```http
POST /api/ops/lc-evidence/invoke
Cookie: ops_session=…
Content-Type: application/json

{ "query": "string" }
```

**响应 200**

```json
{
  "ok": true,
  "data": {
    "query": "string",
    "evidence": [
      {
        "id": 1,
        "source_type": "issue",
        "source_id": "2720",
        "chunk_index": 4,
        "anchor": "2720#4",
        "title": "string | null",
        "url": "string | null",
        "snippet": "string",
        "grade": {
          "evidence_id": 1,
          "relevance": "exact",
          "reason": "string"
        }
      }
    ],
    "answer": "string",
    "meta": {
      "hit_count": 5,
      "graded": true,
      "grade_count": 5,
      "kept_count": 1,
      "gate_action": "answer",
      "best_relevance": "exact"
    }
  }
}
```

**错误**

| HTTP | 含义 | 前端 |
|---|---|---|
| 401 | 未登录 | 既有跳转登录 |
| 422 | query 空/过长 | 表单校验提示 |
| 500 / 上游 LLM 失败 | 结构化 `{ok:false, error:{code,message}}`（后端定稿） | Alert + 可重试 |

**鉴权**：与 Chat 相同 session cookie；`credentials: 'include'`。  
**超时**：建议前端 AbortController ≥ 120s（嵌入+CE+两次 LLM）。

### 3.3 UI 行为（P0）

| 区域 | 行为 |
|---|---|
| 输入 | 多行 query；提交中禁用；可 Abort（若 axios cancel） |
| Meta 条 | 展示 `gate_action` / `best_relevance` / `kept_count`；`refuse` 时强调「无可用证据」 |
| Evidence | 列表卡片；`relevance` 色标；展开 reason / snippet |
| Answer | 纯文本+换行（P0 可不做 Markdown）；`answer_partial` 时若正文未含「仅部分证据」仍以 meta 提示条补显 |
| 空态 | 未请求 / 加载中 / 错误 三分态 |

---

## 4. 验收标准（SPEC 级）

1. 路由 `/lc-evidence` 可进；侧栏有入口；未登录跳登录。  
2. Mock 或真 API：提交后 UI 渲染 `evidence` + `answer` + `meta.gate_action`。  
3. **禁止**本页默认走 `POST /api/ops/chat/stream`。  
4. Vitest：client/store（或组件）在 mock 响应下绿；`pnpm lint` / `pnpm test` / `pnpm build` 相关范围绿。  
5. 联调：后端 `lc-evidence-http-v1` 可用时，本机 1 问冒烟（可与 Chat 同语料问法对照）。  
6. G-L1：`docs/_tech_graph/l1/01_modules.md`（web）登记页面/api 增量说明。

---

## 5. failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 401 | 跳登录 | Y | 登录页 |
| 网络/超时 | 停止 loading | Y | Alert |
| `gate_action=refuse` | 正常 200，evidence 可能空 | Y（换问法） | Meta 提示 + answer 拒答文案 |
| API 未部署 | 502/404 | N（等后端） | 「旁路 API 不可用」 |
| 误接 Chat SSE | 验收打回 | N | PR 拒绝 |

---

## 思考轮

### 思考轮控制

| 字段 | 值 |
|---|---|
| **actual_last_round** | R5 |
| **early_stop** | no |
| **residual_risks** | 后端 HTTP 未合入则前端只能 mock；CE/LLM 延迟影响 UX |

### R0
要一个**单独调用 LangChain 旁路**的前端使用页，不混在 Chat。

### R1
范围=新页+client+store+契约；非范围=改 Chat、流式、匿名。

### R2
采用「新页 + 同步 invoke API」；否决绑 Chat SSE。

### R3
鉴权/超时/refuse/API 缺失路径；契约 freeze `lc-evidence-http-v1`。

### R4
Vitest mock + lint/test/build；联调 1 问；G-L1 一行。

### R5
SPEC 可交人签；签后 00 拆 **web task** + **api HTTP task**（可并行，web 先 mock 契约）。

---

## 00 签收注记（2026-08-16）

本仓 Open Folder = `ops-desk-web/`。本波 **只开 web task**（mock 契约先行）；api HTTP task 在 `ops-desk-api` 另开，不阻塞 web 30。

| 项 | 00 裁定 |
|---|---|
| 响应外壳 | 保持 freeze `{ok, data}`；**仅** `lcEvidence.ts` 拆包。禁止改全局 `http.ts` 约定 |
| `snippet` | 前端类型与 mock **必须含** `snippet`。后端 `EvidenceItem.snippet` 现为 `@property`，api HTTP 须显式序列化（跨仓，本波 web mock 自给） |
| 超时 | 本接口 axios timeout ≥ 120000；不改全局 30s |
| 错误 | 401 走既有跳登录；422 表单；网络/超时 Alert+可重试；500 兼容 FastAPI `detail` 与 `{ok:false,error}` |
| Chat 边界 | **禁止** import `useOpsChatSse` / 打 `/ops/chat/stream` |
| 图谱 | G-L1：`l1/01_modules.md` pages 备注加 LC Evidence；可选 `10_flow_lc_evidence.graph.yaml` |

---

## 下一棒

1. ~~维护者 HG-SPEC-SIGNOFF=approved~~（00 已签 · 2026-08-16）  
2. 00：本仓出 `task_web_lc_evidence_page.md`（mock 先行）；`ops-desk-api` 的 `task_lc_evidence_http.md` **另仓另 task**  
3. 20 审 → 闸齐 → 30  

---

## 修订

| 日期 | 说明 |
|---|---|
| 2026-08-16 | 首稿：Web 旁路使用页 + HTTP 契约草案 |
| 2026-08-16 | 00 签收 HG-SPEC-SIGNOFF；外壳/snippet/超时/mock 先行裁定 |
