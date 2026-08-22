# Task Audit R1：web-lg-rag-page

> **hat_id**：20-task-audit  
> **task**：`docs/tasks/active/task_web_lg_rag_page.md`  
> **SPEC**：`docs/spec/SPEC-web-lg-rag-page_v1.md`（signed · HG-SPEC-SIGNOFF=approved · 00 2026-08-21 · §0 签收注记=实现冻结点）  
> **SPEC 审查**：未在本审查必读范围内；SPEC 状态以文件头（signed / approved）与 §0 签收注记为准  
> **10 invoke**：`required_invoke_hats=10,30,40`；invoke 留档核验不在本审查授权读取范围，未核（见非阻塞表）  
> **日期**：2026-08-21  
> **审查人**：20-task-audit（R1）  
> **git_branch**：`task/web-lg-rag-page`  
> **Open Folder**：`ops-desk-web/`  
> **本审查动作**：书面审查落盘；**不**改 task 实质条款；**不**改人工闸表；**不**签发 `HG-AUDIT-R1`；**不**附 30 Prompt

---

## 元信息

| 字段 | 值 |
|---|---|
| task_slug | `web-lg-rag-page` |
| freeze_id | `lg-rag-http-v1` |
| test_strategy | `required` |
| thinking_profile | `shortest`（正文 R0–R3，early_stop=yes） |
| invoke_retention_profile | `default`（`required_invoke_hats=10,30,40`） |
| graph_change_layer | `G-L1`（`l1/01_modules.md` pages 备注增量，不新增一级模块） |
| code_quality_bar | `L2_frontend`（本仓无 CODING_*_L2，跟现网风格） |
| 本波策略 | **只开 web**；**mock 契约先行**；api HTTP 另仓 task `lg-rag-http`（active）不阻塞本仓 30 |
| 本审查动作 | 书面审查；不改码；不代签 `HG-AUDIT-R1` |

元信息齐备：slug / branch / freeze_id / required_invoke_hats=10,30,40 / G-L1 / test_strategy=required / 人工闸表三行齐。**通过。**

### 人工闸对照（task 表真值 · 本审查不改）

| human_gate_id | task 表 | blocks_hats | 本审查 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | **approved**（00 · 2026-08-21） | **30** | 一致；graph_delta 限 `l1/01_modules.md` pages 备注、不新增一级模块，对齐 lc-evidence 先例预签 |
| **HG-TASK-DRAFT** | **approved**（00 · 2026-08-21） | 22-R1 | 一致；blocks 值 `22-R1` 为旧帽名（现 20-task-audit R1），语义等价于「本审轮」，不阻塞（见非阻塞表 N4） |
| **HG-AUDIT-R1** | **pending** | **30** | **保持 pending**；本帽不签发、不改表；待 00 依本审查结论签 |

blocks_hats 方向正确：GRAPH-MODULES 与 AUDIT-R1 均 blocks **30**；TASK-DRAFT blocks 审轮且已满足。**通过。**

---

## 结论摘要

| 维度 | 结论 |
|---|---|
| **内容** | **零内容阻塞**：范围 / 非范围自洽可验收；契约表与 SPEC §3.2 逐条一致；test_strategy 可执行（Vitest mock + 断言不打 `/ops/chat/stream` + 禁 import `useOpsChatSse`）；failure_paths 覆盖 401/403、网络/超时（≥300s）、422、refuse=200、500、404/502、InMemory 续写、误接 Chat SSE 打回；验收与 SPEC §4 对齐、无越界（联调豁免有 SPEC §0 签收注记背书）；思考轮 R0–R3 闭合、early_stop 理由与 residual 合法 |
| **流程闸** | **HG-AUDIT-R1 = pending**（正确）。`HG-GRAPH-MODULES=approved`、`HG-TASK-DRAFT=approved` 与表一致。30 **不可**开工，直至维护者在 task 表签 `HG-AUDIT-R1=approved`。本审查 **不附 30 Prompt** |

**总结论：pass-with-notes**（0 阻塞 issue · 4 非阻塞 note，见「阻塞 / 非阻塞」节）  
**内容判定**：**签收**（零内容阻塞 · 不退回 10-task）  
**流程判定**：闸未齐 · 维护者（00）签 `HG-AUDIT-R1` 后方可下发 30

---

## 核对项

### 范围（对照 SPEC §3.1 / §3.2 + §0 冻结 · 现网对照已核）

| 项 | task | 审查 |
|---|---|---|
| 新页 + client + store | `LgRagView.vue` / `api/lgRag.ts` / `stores/lgRag.ts`；可选 `components/lg-rag/*` | 对齐 SPEC §3.1；现网 `router/index.ts` 无 `lg-rag` 槽（已核，仅 overview/obs/issues/pulls/graph/chat/lc-evidence），属增量 |
| 路由需登录 | 不要 `meta.public`；复用 `beforeEach` | 对齐现网守卫（非 public → `/login?redirect=`，已核 `router/index.ts` L82–94）；SPEC §0 已冻结路径 `/lg-rag` |
| AppLayout 侧栏入口 | 范围内；SPEC §0 冻结入口名「LG RAG」 | 现网无此菜单，属增量 |
| 同步 `POST /ops/lg-rag/invoke` | freeze `lg-rag-http-v1`；`baseURL=/api` 时写相对路径 | 对齐 SPEC §3.2；现网 `http.ts` `baseURL=/api` 已核；不绑 Chat（方案 A） |
| 外壳拆包 | **仅** `lgRag.ts` 拆 `{ok,data}`；禁止改 `http.ts` 外壳约定 | 对齐现网 `http.ts` 注释「无 `{ ok, data }` 包装外壳——不做任何包装/转换」（已核 L10–11）；先例 `lcEvidence.ts` `unwrapEnvelope` 同模式 |
| timeout | **本文件** ≥ 300000；禁止改全局 30s | 对齐 SPEC §3.2（supervisor 实测 100–250s）；现网 `http.ts` 全局 `timeout: 30_000` 已核；先例 `LC_EVIDENCE_TIMEOUT_MS=120_000` 落单次请求 config，本任务增量仅数值 |
| 类型 | 对齐 freeze；`subtasks` 元素宽松（`unknown[]` / `Record<string, unknown>`） | 对齐 SPEC §3.3 建议类型与「后端细化后升 freeze」注记 |
| G-L1 | `01_modules.md` pages 备注加 LG RAG；可选 flow yaml（非必须） | 不新增一级模块；与 GRAPH 闸说明一致 |

### 非范围（对照 SPEC 非目标 + 否决方案 B）

| 项 | task | 审查 |
|---|---|---|
| 不改 `ChatView` / `useOpsChatSse` / chat store 默认行为 | 明确 | 与 SPEC 非目标一致 |
| **禁止** import `useOpsChatSse` / 打 `/ops/chat/stream` | 非范围 + 验收 #4 + 失败路径「验收打回」三处闭合 | **方案 B 否决已闭合** |
| 不实现 SSE 流式、thread 历史列表 / 会话管理、supervisor 实时进度（P1+） | 明确 | 与 SPEC 非目标一致（非流式 v1，SSE 另议） |
| 不改 `ops-desk-api` | mock 先行；联调 optional / `blocked_by api` | 对齐 SPEC §0 签收注记「只开 web · mock 契约先行」 |
| 不匿名公开 | 不要 `meta.public` | 明确 |
| 不改 `src/api/http.ts` 全局 timeout（30s）/ 外壳约定 | 范围与非范围双写 | 对齐 SPEC §3.2 超时条 |
| 不新增 G-L1 一级模块 | 明确 | 与 GRAPH 闸说明一致 |

### 契约表（task §HTTP 契约 vs SPEC §3.2 freeze `lg-rag-http-v1`）

| 契约点 | task | SPEC §3.2 | 审查 |
|---|---|---|---|
| 方法/路径 | `POST /api/ops/lg-rag/invoke`（client 写 `/ops/lg-rag/invoke`） | 同 | 一致 |
| 鉴权 | session cookie；`withCredentials: true` | 同（复用现网 `http.ts`） | 一致；现网 `http.ts` 已核 |
| 请求体 | `query: string(1..8000)`、`mode?: router\|basic\|supervisor（缺省 router）`、`thread_id?: string(≤255)` | 同 | 一致 |
| 200 外壳 | `{ok:true, data:{answer, mode, thread_id, route, retry_count, chain_meta, subtasks, subtask_results}}` | 同 | 一致（chain_meta 五字段 task 未逐项列举但指 SPEC §3.2，且验收 #2 要求渲染五字段，闭合） |
| 字段语义 | `subtasks`/`subtask_results` 仅 supervisor 非空；`chain_meta` 仅 rag 路径非空；basic `route=""` 正常值 | 同 | 一致 |
| 错误 | 500 `{ok:false,error:{code:"lg_rag_failed",message:"旁路调用失败"}}`；422 参数非法；401/403 未登录 | 同（SPEC 另含 404/502「API 未部署」） | 一致；404/502 在 task failure_paths 覆盖，闭合 |
| 流式 | 非流式 v1；SSE 另议 | 同 | 一致 |

### 验收（对照 SPEC §4 · 无越界）

| # | task 条款 | SPEC §4 对应 | 可执行？ |
|---|---|---|---|
| 1 | 路由可进；侧栏入口；未登录跳 `/login?redirect=`（复用 `beforeEach`，无 `meta.public`） | §4.1 | 是 · 现网守卫已核 |
| 2 | Mock 三 mode 渲染 `answer` + 状态条；supervisor 样例渲染 `subtasks`/`subtask_results`；rag 样例渲染 `chain_meta` 五字段；`refuse` 强调「无可用证据」 | §4.2 | 是 · 本波 mock 先行 |
| 3 | `thread_id` 回显可复制；「用此 thread_id 继续」回填；续写带同 thread_id | §4.3 | 是 |
| 4 | **禁止**默认走 `/ops/chat/stream`；单测断言不调用；源码禁止 import `useOpsChatSse` | §4.4 | 是 · 可 Vitest 断言 / PR 打回 |
| 5 | `lgRag.ts` 仅本文件拆 `{ok,data}`；timeout ≥ 300000；未改 `http.ts` 全局 | §4.5 | 是 |
| 6 | P0 UI：mode 三档（router 默认、supervisor 标慢）；query 1..8000 本地校验；等待计时 + 长等待文案；可 Abort；三分态；边界文案 | §3.4（SPEC §4 未列，属表内细化非越界） | 是 · 与 SPEC §3.4 同表 |
| 7 | Vitest：client mock（拆包 + 三 mode + refuse）+ store（或视图）绿 | §4.6 | 是 · `test_strategy=required` |
| 8 | `pnpm lint` / `pnpm test` / `pnpm build` exit 0 | §4.6 | 是 · 与本仓质量门一致 |
| 9 | `01_modules.md` pages 备注含 LG RAG；不新增一级模块；`graph-compile.sh` exit 0 | §4.8 | 是 |
| 10 | 联调冒烟（router 必跑，supervisor 可选）：**本波豁免**（optional / `blocked_by api`） | §4.7 字面为「router 必跑」，但 **SPEC §0 签收注记（实现冻结点）确认联调 optional / 非本波硬验收** | 是 · 以冻结点为准，无越界 |

### failure_paths（对照 SPEC §5 · 覆盖点名项）

| 触发 | task 行为 | 审查 |
|---|---|---|
| 401 / 403 | 既有 `setUnauthorizedHandler` 跳登录；本页不另写跳转 | 现网已核：`http.ts` 401 拦截器 + `router/index.ts` 注册 handler，可直接复用 |
| 网络/超时 | 停 loading；Alert + 可重试；**本请求 timeout ≥ 300000** | 避免误用全局 30s；**≥300s 点名项已覆盖** |
| 422（query 空/超 8000、mode 非法、thread_id 超 255） | 本地预检不发或拦截后表单校验 | **422 点名项已覆盖** |
| `route=refuse` / `gate_action=refuse` | **正常 200**，写入 result，**不是** error 态 | 与 SPEC §3.2 字段语义一致；**refuse 点名项已覆盖** |
| 500 `lg_rag_failed` | 兼容 FastAPI `detail` 与 `{ok:false,error}`；Alert + 可重试 | **500 点名项已覆盖**；先例 `mapLcEvidenceError` 同模式 |
| API 未部署（404 / 502） | 停 loading；「旁路 API 不可用」；mock 先行不挡 30 | **404 点名项已覆盖**；residual 非本波硬验收 |
| 后端进程重启后旧 thread_id 续写 | InMemory 历史丢，按新对话回答；文案注明「续写进程内有效」 | **InMemory 点名项已覆盖**；对齐 SPEC §3.2 续写注意条 |
| 误接 Chat SSE / import `useOpsChatSse` / 打 `/ops/chat/stream` | **验收打回** | 与否决方案 B 闭合 |

八行全与 SPEC §5 对齐（顺序略异，无缺漏）。

### test_strategy

| 项 | 值 | 审查 |
|---|---|---|
| `test_strategy` | `required` | 与 SPEC 元信息一致 |
| `test_strategy_note` | Vitest：api client mock（`{ok,data}` 拆包 + 三 mode 样例 + refuse 样例）+ store；断言 **不**调用 `/ops/chat/stream`；`pnpm lint` / `pnpm test` / `pnpm build`；`./scripts/graph-compile.sh` | 可执行；**mock 对象、断言目标、质量门均明确** |
| 禁 import `useOpsChatSse` | 完成态勾选 + 验收 #4 + 失败路径打回三处闭合 | 可由源码扫描 + PR 打回执行 |
| 联调 | optional / `blocked_by api` | 正确降级；不阻塞 web 30（SPEC §0 背书） |
| 单测对照 | `tests/http.spec.ts`、`tests/chat-store.spec.ts`；本页 **不要** mock `useOpsChatSse` | 给 30 必读已写 |

### invoke 留档

| 项 | 值 | 审查 |
|---|---|---|
| `invoke_retention_profile` | `default` | 对应 `10,30,40` |
| `required_invoke_hats` | `10,30,40` | 与 default 一致；**点名项齐** |
| 10 invoke | 未核（不在本审查授权读取范围） | 见非阻塞表 N5；不影响本审结论 |
| 30 / 40 invoke | **待后帽** | 正确；本审查不要求预写 |
| 20 invoke | 不要求 | default 集合不含 20；审查结论落 `reviews/`（本文件） |

### 思考轮控制表与 R0–R3 闭合

| 控制字段 | 值 | 审查 |
|---|---|---|
| thinking_profile | `shortest` | 合法 |
| actual_last_round | `R3` | 与 `### R0` … `### R3` 四槽一致 |
| early_stop | `yes`（理由：契约与实现模式完全沿用 lc-evidence 先例，增量仅 mode/thread_id/长超时） | 理由成立：先例 completed、契约 freeze 已在 api 仓落定 |
| residual_risks | 后端 HTTP 未合入则仅 mock；`subtasks` 元素结构后端未细化（宽松渲染）；supervisor 长延迟 UX | 已记录；与 SPEC residual 一致，且均有缓解条款（mock 先行 / 宽松类型 / ≥300s + 计时 + Abort） |

| 轮 | task 要点 | 闭合 |
|---|---|---|
| R0 | 契约 freeze 已在；照搬 lc-evidence「web 可执行切片 + mock 契约先行」；把 mode/thread_id/长超时写成 30 不可绕过的验收与失败路径 | 是 · 不再论证「要不要单独页」 |
| R1 | 范围=新 view/client/store（可选 components）+ router/侧栏接线 + G-L1 pages 备注；Chat 全非范围；不新增一级模块 | 是 · 对照现网无 `lg-rag` 槽（已核） |
| R2 | 增量可执行化：timeout ≥300000 落 `lgRag.ts` 单次请求 config、不改全局；拆包仅本 client；thread_id 续写 + InMemory 文案；`subtasks` 宽松类型 + JSON 折叠 | 是 · 对照 `lcEvidence.ts` 先例（已核） |
| R3 | 失败路径可执行化与交接：401 复用、422 本地预检、refuse=200、404/502 不挡 30、误接 Chat SSE 打回；三闸待人审；不附 30 Prompt | 是 |

**思考轮审查通过**（控制表完整 · 回填闭合 · `early_stop=yes` 理由与 residual 合法）。**不退回 10-task。**

---

## 阻塞 / 非阻塞

### 阻塞（内容）

**none**

### 非阻塞 / residual（issue 清单 · 按严重度：全部 = note）

| # | 严重度 | 项 | 说明 | 处置建议 |
|---|---|---|---|---|
| N1 | note | task 头与依赖节称 SPEC「**draft** · HG-SPEC-SIGNOFF=pending」 | SPEC 实为 `signed` / approved（00 · 2026-08-21，§0 签收注记）。task 头 L3「SPEC 已签收」表述正确，L5 与依赖节 L101 为起草时残留 | 不改 task（真值以 SPEC 文件为准）；00 签闸时知悉即可 |
| N2 | note | 「给 30 必读」末段（L155）与修订记录（L191）称「三闸全 pending」 | 起草时态残留；GRAPH-MODULES 与 TASK-DRAFT 现已 approved。与 lc-evidence 先例同款，真值以人工闸表为准 | 不改 task；30 以表为准 |
| N3 | note | 范围（L70–71）与验收 #1（L128）仍写「路径/入口名维护者定」 | SPEC §0 签收注记已冻结 `/lg-rag` 与「LG RAG」；task 完成态（L54）与 HG-TASK-DRAFT 签收注记（L41）已按冻结写。措辞不一致但冻结点优先，不影响可执行 | 30 以 SPEC §0 为准（`/lg-rag` + 「LG RAG」）；可在 30 落地时顺手对齐措辞 |
| N4 | note | HG-TASK-DRAFT 的 blocks_hats 写 `22-R1` | 旧帽名（V2 改名后现为 20-task-audit R1）；语义等价于「本审轮」，且该闸已 approved，无实际阻塞 | 不改 task；后续 task 模板建议统一写 `20-R1` |
| N5 | note | 10 invoke 留档未核验 | `required_invoke_hats=10,30,40` 元信息正确；invoke 文件存在性不在本审查授权读取范围 | 00 签闸前可顺手确认 `docs/harness/invokes/by-task/web-lg-rag-page/` 下 10 invoke 已落 |

---

## 签收

**内容：签收（pass-with-notes）。** 范围 / 非范围自洽可验收；契约表与 SPEC §3.2 freeze `lg-rag-http-v1` 逐条一致；test_strategy 可执行（Vitest mock + 断言不打 `/ops/chat/stream` + 禁 import `useOpsChatSse`）；failure_paths 覆盖全部点名项（401/422/500/404/refuse/InMemory/≥300s）；验收与 SPEC §4 对齐无越界（联调豁免有 §0 签收注记背书）；思考轮 R0–R3 闭合。方案 B（Chat SSE）已否决并三处闭合（非范围 / 验收 / 失败路径打回）。N1–N5 均为起草时态 / 措辞残留类 note，**不构成内容阻塞，不退回 10-task**。

**流程闸：未签收 30 授权。** `HG-AUDIT-R1` **仍为 pending**（本审查刻意不改 task 表）。pending 时 `verify` 显示不可 30 是 **正确** 行为。

**00 是否可签 `HG-AUDIT-R1`：可签。** 建议 00 阅读本审查 N1–N5 后，在 task 人工闸表将 `HG-AUDIT-R1` 改为 `approved`（00 · 日期）；签署后 30 方可开工（mock 契约先行，联调 `blocked_by api`）。

本审查 **禁止** 附 30 可复制 Prompt。下一动作见文末维护者签闸清单。

---

## 维护者签闸（20 后 · 30 前）

- [ ] 已读 R1 审查结论（含 N1–N5 note）
- [ ] 在 task 人工闸表将 HG-AUDIT-R1 改为 approved（维护者 · 日期）
- [ ] commit task 文档或确认已签
- [ ] 再下发 Harness 30 Prompt

30 Agent 将以 task 表为准；pending 时必须拒开工（见 TEMPLATE_30_gate_stop.md）。
