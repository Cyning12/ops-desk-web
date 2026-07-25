# Ops Desk Web v1 · Epic 验收 Checklist（W0–W8 全量）

> **生成**：2026-07-25 · 00 统筹  
> **范围**：Epic「Web 前端 v1」全部子任务验收汇总。全部 ✅ 项均有命令/状态码证据，见各 task 自检结论与 `docs/harness/invokes/by-task/`。

---

## 一、工程基线

| # | 验收项 | 结果 | 证据 |
|---|---|---|---|
| 1 | harness 2.2.1 接入，`verify` PASS | ✅ | manifest version 2.2.1（preset harness-only）；`npx @cyning/harness verify --target .` PASS |
| 2 | `task close` / `task lint-done` 可用 | ✅ | CLI v2.2.1 子命令正常输出；W0–W8 全部经 `task close` 归档 |
| 3 | AGENTS.md 含「新会话启动纪律」+ Harness Starter 片段 | ✅ | `cyning-harness:begin` 块在，Verify 表为 pnpm 三件套；CLAUDE.md 经 `@AGENTS.md` 继承 |
| 4 | 模块边界真值维护 | ✅ | `docs/_tech_graph/01_struct.md` styles 行去 tailwind（00 签）；`graph-compile.sh` 全量通过 |
| 5 | 分支纪律 | ✅ | 全程 `task/<slug>` / `fix/` / `chore/` 分支 + `--no-ff` 合并；master 无直推改码 |

## 二、构建与质量门（master HEAD）

| # | 验收项 | 结果 | 证据 |
|---|---|---|---|
| 6 | `pnpm lint` exit 0 | ✅ | ESLint 9 flat config，0 警告 |
| 7 | `pnpm test` exit 0 | ✅ | 14 文件 69 用例全过（http/auth/router-guard/overview/issues/pulls/graph/chat-sse/chat-store/app） |
| 8 | `pnpm build` exit 0 且无 >500kB 警告 | ✅ | manualChunks vendor 拆分：单 chunk 1064kB → 最大 372.79kB |
| 9 | `pnpm dev` 可跑 | ✅ | Vite dev + `/api` proxy → localhost:8000 |

## 三、功能页面（后端 docker 在线真实联调）

| # | 验收项 | 结果 | 证据 |
|---|---|---|---|
| 10 | 登录：username + invite token → cookie → 跳 /overview | ✅ | 直连 :8000 与经代理双链路 200 + Set-Cookie HttpOnly |
| 11 | 刷新会话保持（/me 200） | ✅ | 守卫 ensureMe 幂等缓存；冒烟 200 |
| 12 | 登出 → /me 401 → 跳 /login | ✅ | logout 200 → /me 401 |
| 13 | 未登录访问业务页 → 重定向 /login?redirect= | ✅ | 守卫单测 + 联调 401 |
| 14 | 错误 token → 表单错误提示不跳转 | ✅ | 401 "Invalid or expired invite token" |
| 15 | Overview：指标卡片 + sync/scan + trend SVG + as_of | ✅ | 空数据（当前库实际态）完整渲染无 NaN/undefined；全 0 trend 正常 |
| 16 | Issues：state/label/module/scan_status 筛选 + 分页 + 空态 | ✅ | 筛选 page 重置 1；参数拼装单测；空列表 el-empty |
| 17 | Pulls：state/ci_status 筛选 + [Draft] 前缀 + 分页 + 空态 | ✅ | ci_status null 显示「—」 |
| 18 | Graph：snapshot 元信息 + module_matrix 防御性表格 | ✅ | 全 null 空态 + 数组/对象 fixture 渲染单测 |
| 19 | Chat：latest session 获取 + SSE 流式渲染 | ✅ | SSE 26 帧完整序列（run.start→thinking→answer×22→done，DeepSeek-V4-Pro，3409ms）；解析器半帧/坏行/abort/error 单测覆盖 |
| 20 | 6 条路由全可访问 | ✅ | /login /overview /issues /pulls /graph /chat 全 200 |

## 四、联调与构建产物（W8）

| # | 验收项 | 结果 | 证据 |
|---|---|---|---|
| 21 | dev proxy 全端点带 cookie 200 | ✅ | me/overview/issues/pulls/graph/sessions latest |
| 22 | dist 产物静态服务可用 | ✅ | `/` + 22 assets 全 200；深链 404 为预期（SPA fallback） |
| 23 | Nginx 托管说明（部署 task 输入） | ✅ | `docs/deployment/nginx-static-hosting.md`：SPA fallback + /api 反代 + SSE（buffering off/timeout/HTTP1.1）+ gzip/缓存 |

## 五、过程资产

| # | 验收项 | 结果 |
|---|---|---|
| 24 | 每任务 task 文件（范围/失败路径/验收/自检结论） | ✅ `docs/tasks/done/` 8 份（W0–W8） |
| 25 | invoke 落盘 | ✅ `docs/harness/invokes/by-task/` 8 个 slug 全 |
| 26 | R1 审查文 | ✅ `docs/harness/reviews/` W3–W8 6 份 |
| 27 | 双闸（HG-AUDIT-R1 / HG-GRAPH-MODULES）记录 | ✅ 各 task 人工闸表 approved（00 代签，用户 2026-07-24 授权） |
| 28 | tech graph 同步至 v1.0.0 | ✅ `02_version.md` v0.2.0（skeleton）→ v1.0.0（Epic 完成） |

## 六、联调中发现并修复的缺陷

| # | 项 | 处置 |
|---|---|---|
| 29 | **后端** `/chat/stream` 带 session_id 恒 404（str vs UUID 比较） | ✅ ops-desk-api `fix/chat-stream-session-id`：回归测试先红后绿、85 passed、容器重建实测 SSE 200，已合入后端 master 并 task close |

## 七、遗留项（不阻塞 v1，建议后续 task）

| # | 项 | 建议归属 |
|---|---|---|
| L1 | dev 库业务数据为空（issues/pulls/overview 空态为实测主线）；真实数据需重跑 `import_from_supabase.py`（需 SUPABASE_DATABASE_URL，00 未触碰凭证） | 维护者手动执行后抽查非空渲染 |
| L2 | 后端 WS transport 是否同款 str/UUID 比较缺陷未排查 | ops-desk-api 排查 task |
| L3 | harness 产品包已至 2.4.0（本 Epic 锁定 2.2.1） | 后续升级 task（双仓） |
| L4 | Chat：多 session 列表、markdown 渲染、历史消息加载 | 后续迭代 Epic |
| L5 | Element Plus 按需引入可进一步减重（当前 vendor 拆分已消警告） | 可选优化 |
| L6 | 联调在 chat session `f1569dfd…` 留有 1 条测试消息 | 无害，可忽略 |
| L7 | 契约对齐（camelCase / `{ok,data}` 外壳统一） | 后续契约对齐 task（前后端协调） |

---

## 结论

**Epic「Web 前端 v1」验收通过**：W0–W8 全部完成、归档、合入 master（HEAD `f83ddbf`）；质量门全绿；真实后端联调全链路走通。**部署轨（Epic 8：API+PG+Web+Nginx+SSL）正式解锁**，Nginx 输入文档已就位。
