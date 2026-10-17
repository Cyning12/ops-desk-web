# Invoke · hat 40 · web-tenant-context-chat · 跨租户负样本 api 联调复验（2026-10-17）

| 字段 | 值 |
|------|-----|
| **hat_id** | 40（live 联调复验 · web 00 委派） |
| **task_slug** | `web-tenant-context-chat` |
| **目标** | 验收标准唯一未勾项「跨租户负样本与 api 联调勾选」 |
| **web 分支** | `task/web-tenant-context-chat-cross-verify`（docs 提交用 · base main） |
| **api 码面** | ops-desk-api `master` HEAD d3fd056（租户竖切 f048c57 已并入 master，`git merge-base --is-ancestor` 实证） |
| **契约** | workspace `api-v1-tenant-readonly-context-draft.md` freeze F1=C · F2=X-Ops-Tenant-Id · F4 对外 404 |
| **结论** | **PASS** —— 负样本全过，task 末项已勾 |

---

## 1. 闸扫描：api 就绪判定

| 检查 | 证据 | 判定 |
|------|------|------|
| api 阶段 T task 已 done | `ops-desk-api/docs/tasks/done/task_tenant_readonly_predicate.md`（2026-09-21 归档 · T0–T5 全勾） | ✅ |
| 租代码已在 master | `app/ops/tenant_context.py`（F1=C `resolve_header_against_session`）· `alembic/versions/20260918_tenant_readonly.py` · f048c57 是 HEAD 祖先 | ✅ |
| HTTP 强制面 | `app/ops/lg_rag/router.py:248-258` `_resolve_request_tenant`：头≠session→403 · 未知租户→422；`app/ops/auth.py:149` POST /auth/tenant 写 session | ✅ |
| DB 就绪 | ops_issues/ops_pull_requests 有 `tenant_id` 列（A=881/1855 行 · B=0 行）；alembic 20260923_memory_episodes（含 20260918_tenant_readonly 链） | ✅ |
| live 起服 | uvicorn 127.0.0.1:8050（`OPS_CHAT_TRACER=off` + env -u 剥九个 proxy 变量，对齐 invoke_20261013_40_verify 环境三坑）· 登录 admin（scripts/create_initial_user.py 邀请码） | ✅ |

**判定：api 已就绪可联调（非阻塞）。**

## 2. 联调环境

- api：`env -u http_proxy -u https_proxy -u all_proxy -u HTTP_PROXY -u HTTPS_PROXY -u ALL_PROXY -u NO_PROXY -u no_proxy -u NODE_USE_ENV_PROXY OPS_CHAT_TRACER=off .venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8050`（.env 六组关键 env：DATABASE_URL · OPS_DESK_AUTH_MODE=db · OPS_HITL_PERSISTENCE=db · LG_RAG_HTTP_CHECKPOINTER=postgres · LG_RAG_DELEGATION_TOKEN_MODE=enforce · capability env）
- web：`VITE_API_PROXY=http://127.0.0.1:8050 pnpm dev --port 5173`（vite proxy 钉 127.0.0.1，禁 localhost；node v24.15.0 钉死路径 pnpm）
- 未误连旧 Docker `:8000`（另有 python 进程在听，已识别隔离）

## 3. curl 矩阵（脚本：attachments/20261017_40_curl_matrix.sh · 原文证据同名前缀文件）

| # | 用例 | 期望（契约） | 实测 | 判定 |
|---|------|--------------|------|------|
| S0 | GET /me | session 租户可见 | `tenant_id=ops-desk-pilot`（s0_me.json） | ✅ |
| P1 | stream 头=A · session=A | 200 SSE | **200** text/event-stream · run eb427345（p1_stream_A.hdr/.sse） | ✅ |
| P2 | 切 B（POST /auth/tenant）后 stream 头=B · session=B | 200 SSE | 切换 200 → /me=B → stream **200** run 6c760c1e（switch_to_B.json · p2_stream_B.hdr/.sse） | ✅ |
| **N1a** | **头=A · session=B** | **403** | **403 `{"detail":"tenant_header_mismatch"}`**（n1a_mismatch.hdr/.body） | ✅ |
| **N1b** | **头=B · session=A** | **403** | **403 `tenant_header_mismatch`**（n1b_mismatch.*） | ✅ |
| **N2** | 头=evil-tenant（未知租户） | 拒 | **422 `unknown_tenant:evil-tenant`**（n2_unknown.*） | ✅ |
| N3 | 无租户头 · session=A | F1=C 头可选 → session 兜底 200 | **200**（n3_noheader.hdr）· 非裸跨租户试探，符合契约 | ✅ |
| **N4** | **跨租户资源**：session=B 发问查 A 所有 issue #16 | F4 fail-closed · 不泄漏 | stream 200 但全程 **无标题泄漏**（grep "杨总"=0 · NO_LEAK）；`issue_not_found`×12 · "未找到"×1（n4_xtenant.sse） | ✅ |

注：N4 的 404 语义在 lg-rag SSE 面内表现为 lookup 工具 fail-closed（`issue_not_found` · 不回传他租户数据），与 freeze F4「跨租户资源 id 对外 404 · 不向客户端暴露他租户是否存在」一致（HTTP 404 面在 lookup 直连路径，SSE 面不透出存在性）。

## 4. Web UI 实操（Playwright 1.64.1 · chromium headless · 脚本 /tmp/pw-tenant/test.mjs）

证据：`attachments/20261017_40_ui_pw_results.json`（机读）+ 截图 5 张（`20261017_40_ui_*.png`）

| 阶段 | 实测 | 判定 |
|------|------|------|
| 登录 → 顶栏当前租户 | `data-testid=current-tenant` = **ops-desk-pilot**（截图 1） | ✅ |
| P-A：发一问 | Network：POST /api/ops/lg-rag/stream 头 `x-ops-tenant-id: ops-desk-pilot` → **200**（截图 2） | ✅ |
| UI 切换 A→B | 顶栏文案变为 **ops-desk-pilot-b**（截图 3 · switchTenant→POST /auth/tenant 200） | ✅ |
| P-B：发一问 | 头 `x-ops-tenant-id: ops-desk-pilot-b` → **200**（截图 4） | ✅ |
| **N-UI 负样本**：localStorage `ops.tenant-id` 篡改为 A（session 仍 B）后发问 | 恰好 **1** 次 stream 请求（16s 观察窗无重试死循环）· 头=A → api **403**；UI 红色错误条 `[http] tenant_header_mismatch · 可重试：请重新发送消息`（截图 5）· 无静默假成功（无伪造 answer · 手动重发语义） | ✅ |

## 5. 结论与回填

- **负样本全过**（N1a/N1b 403 · N2 422 · N4 fail-closed 不泄漏 · UI 明确错误且不重试死循环）。
- task `docs/tasks/active/task_web_tenant_context_chat.md` 末项「跨租户负样本与 api 联调勾选」**已勾**；状态行删去过时「NO-GO 30」表述（闸全 approved · 30 早已完成），注明仅剩 CLOSE；修订记录加行。
- **本棒不 CLOSE · 不迁 done/**（归 00/维护者）；零 `src/**` 改码。
- 观察项（非缺陷 · 仅记录报回）：UI 403 错误条直显后端 detail 原文 `tenant_header_mismatch`（英文机器串），可考虑后续本地化文案；不挡验收。

## 6. 附件清单（attachments/ · 本棒新增）

`20261017_40_curl_matrix.sh`（复现脚本）· s0_me.json · switch_to_B.json / switch_back_A.json / switch_to_B_again.json · s0b_me_after_switch.json · p1_stream_A.hdr/.sse · p2_stream_B.hdr/.sse · n1a_mismatch.hdr/.body · n1b_mismatch.hdr/.body · n2_unknown.hdr/.body · n3_noheader.hdr/.sse · n4_xtenant.hdr/.sse · 20261017_40_ui_pw_results.json · 20261017_40_ui_1..5.png

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-17 | 40 落稿：闸扫描 api 就绪 → curl 矩阵 8 例 + Playwright UI 5 段全过 → task 末项勾选 · PASS |
