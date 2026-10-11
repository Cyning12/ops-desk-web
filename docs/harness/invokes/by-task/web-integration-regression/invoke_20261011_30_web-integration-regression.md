# Invoke：30-execute · web-integration-regression

> **用途**：30 实现留痕（T-W1 联调回归批 · F1/F4/F6/F7 四面已接通功能的权威回归验收 + role 菜单核对 + 契约对拍）。  
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · 2026-10-11 · 维护者授权 00 代录 m00230）→ GO 30。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-integration-regression` |
| freeze_id | `web-integration-v0`（契约零 diff · 本批不改码） |
| git_branch | `task/web-integration-regression` |
| created_utc_or_local | 2026-10-11 |
| review | `docs/harness/reviews/task_web-integration_audit_R1_20261011.md`（合审 T-W1/T-W2/T-W3 · PASS-WITH-NIT · 零阻塞 · task 闸表引用 commit 58bf8de） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | — | ✅ |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（本批 graph_delta=n/a） |

**机检口径偏差照登**：`npx spec-wave verify --target . --task docs/tasks/active/task_web_integration_regression.md`（spec-wave 3.3.0）报「VERIFY: BLOCKED · missing R<n> review」——3.3.0 `lib/checks/review-gates.js` `findLatestReview` 按 task 文件 basename 期望 per-task 审查文件名 `task_web_integration_regression_audit_R1_*.md`，而实体审查文为合审命名 `task_web-integration_audit_R1_20261011.md`（覆盖 T-W1/T-W2/T-W3）。裁定：**人工闸表为真值，审查实体存在且零阻塞，仅命名口径不匹配** → 继续开工（已照登 00）。

## 联调环境与坑位（W7 钉死 · 血泪留档）

| 坑 | 钉案 |
|---|---|
| pnpm 版本 | 仓钉 pnpm@10.32.1；PATH 前置的 pnpm 11 拒跑 → 一律 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm` |
| vite proxy | 必须 `127.0.0.1:8000`（macOS localhost 走 IPv6 打到 Docker 旧镜像 404） |
| **NO_PROXY 双剥（新沉淀）** | shell 同时有 `NO_PROXY` 与 `no_proxy=localhost,127.0.0.1,::1,[::1]`；只剥大写无效——httpx 读小写 `no_proxy`，`[::1]` 解析炸 `httpx.InvalidURL: Invalid port: ':1]'`（api `app/ops/rag/embedder.py:92`），lg-rag invoke 500 `{ok:false,error:{code:lg_rag_failed}}`。**起后端必须 `env -u NO_PROXY -u no_proxy` 两枚全剥** |
| SSE 代理（FP-3） | vite dev proxy 转发 `/lg-rag/stream` 无需额外配置即不缓冲（Chat 两轮 supervisor SSE 经 5173 代理全程流畅 · 证据 s4_01） |
| 登录契约 | `POST /ops/auth/login {username,invite_token}` 消耗一次性邀请码；仅新建用户取 invite.role，登既有用户保持原 role（tester=viewer 复用） |
| 后端起法 | `uv run uvicorn app.main:app --port 8000`（api 仓 · 六 env 组为 HITL S3 用 · 本批不需要）；CORS 默认放 5173 免配 |

## 验收实操（D1 倾向 A 本地双跑：uvicorn :8000 + vite dev :5173 · 全链经 vite proxy）

### S1 认证会话（F1）✅ 全步通过
curl 链（`attachments/s1_auth_curl.log`）：未登录 `GET /auth/me`→401 `{detail:Not authenticated}` → login 200 `{ok:true,user{role:maintainer}}` + HttpOnly `ops_session` cookie → me 200（user+tenant_id=ops-desk-pilot）→ 独立请求重放 cookie 200（存续）→ logout 200 → me 401。
UI 五步（Playwright · 截图 `attachments/shots/s1_0*`）：冷启动 `/`→重定向 `/login?redirect=/overview` → 登录成功 → 刷新会话存续 → 登出回登录页 → 未登录访 `/issues` 被守卫弹回 `/login?redirect=/issues`。

### S4 会话历史（F4）✅ 通过
真实 Chat UI 两轮 supervisor SSE 对话（`s4_01_two_turns.png`），thread `11a5dbb52f6b46a3af6b566ed350bb8c`（run_count=2 经 threads 契约核真）。
**设计语义核真**：刷新后消息不自动回显——`restoredNotice` 条「已恢复上次会话上下文（历史消息不回显）」（`s4_04` · store localStorage `ops.lg-rag.thread-id`）；回放走历史面板：点击该 thread → `GET /chat/threads/{id}/history` 200（原始体 `attachments/raw/thread_history.json`）→ 渲染 user=2/assistant=2（`s4_05`）；切另一条 thread 内容正确切换（`s4_06`）。
**已钉行为照登（非缺口）**：`POST /lg-rag/invoke`（非流式）不落 chat threads 历史——走进程内 checkpointer（前端 LgRagView 自述「仅服务进程内有效，重启即丢」），历史只记 `/lg-rag/stream` SSE runs。

### S6 仪表盘（F6）✅ 通过
Overview/Issues/Pulls/Graph 四页真实渲染（`s6_01~s6_06`）；筛选交互 Network 断言：issues 点「open」→ 请求 `/api/ops/issues?state=open&page=1&page_size=20`；pulls → `/api/ops/pulls?page=1&page_size=20&state=open`。
观察（非阻塞）：Graph 页 module_matrix 空（需后端 scan/graph 生成快照 · 既有数据态非缺口）。

### S7 同步调用（F7）✅ 通过
- lg-rag invoke curl：200 `{ok:true,data{answer,meta}}`（`attachments/raw/lg_rag_invoke_r1.json`；refuse「未检索到足够依据」为 200 成功态）
- lg-rag UI 成功态：router/direct · answer 渲染（`s7_01`）；lc-evidence UI 成功态 meta 卡（`s7_02`）
- **失败态**：pkill 后端后提交 → 错误条 `Request failed with status code 500` + 重试按钮（`s7_03`；vite proxy 对断连后端返 500，404/502→「旁路 API 不可用」映射由单测覆盖）

### W5 role 菜单核对 ✅ 平凡成立（结论落档）
maintainer（admin）与 viewer（tester）菜单**同为 8 项**（Overview/Observability/Issues/Pulls/Graph/Chat/LC Evidence/LG RAG · `w5_01/w5_02`）——`src/layouts/AppLayout.vue:38-47` 无 role 条件渲染，现 UI 无 maintainer 专属入口（admin 面 Q3 出范围 · capability 页 T-W3 未建），「maintainer 面入口按角色隐藏」**平凡成立**。**T-W3 注意**：capability 页落地时须引入 role 驱动隐藏并复核本结论。
后端闸门实证：viewer `GET /hitl/pending`→403，maintainer→200。观察（非缺口）：viewer 可读 Overview 数据（SPEC §2.6 只读面无 role 门控 · 权限口径§111 仅要求前端隐藏 maintainer 面入口）。

### W6 契约对拍 ✅ 零 diff（原始体 `attachments/raw/`）
| 面 | 契约 | 对拍 |
|---|---|---|
| overview/issues/pulls/graph | snake_case 原始体无外壳 | ✅ `{"cycle_time":{...}}` 等直取 |
| threads / history | `{ok:true,data:{threads,next_cursor}}` envelope（例外照登） | ✅ |
| lc-evidence/lg-rag invoke | `{ok,data}` envelope | ✅ |

## 30 产出（本批零代码改动 · 纯验收留痕）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/harness/invokes/by-task/web-integration-regression/invoke_20261011_30_web-integration-regression.md` | 新建 | 本留痕 |
| `.../attachments/` | 新建 | 截图 20 枚 + ui_flow.log + s1_auth_curl.log + raw/*.json 契约原始体 + 复跑驱动 run.mjs/run2.mjs/run3.mjs（playwright-core + 本机 Chrome channel · 一次性邀请码已脱敏） |

既有单测覆盖核对：restoredNotice/openHistoryThread（chat-store/chat-store-hitl/chat-view 3 spec）· 路由守卫 401（router-guard）· 认证（auth-store）均在 225 基线内 → 无需新增。

## verify 闸
`pnpm lint` ✅ exit 0 · `pnpm test` ✅ **225/225**（28 文件）· `pnpm build` ✅（vue-tsc + vite）。

## 缺口
**无 FP-1 后端缺口**。SPEC 冲突面零检出（W6 零 diff）。

## 非范围遵守
未改 docs/tasks/、docs/spec/、图谱；未碰 main 与 task/web-integration-task-drafts 本体；api 仓零改动（仅运行）；未合并任何 PR。
