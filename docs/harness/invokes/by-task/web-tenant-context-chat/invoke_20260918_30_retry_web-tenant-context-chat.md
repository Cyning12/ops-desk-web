# Invoke · hat 30 · retry · web-tenant-context-chat

> **hat**：30（实现 · **联调重试**）  
> **task_slug**：`web-tenant-context-chat`  
> **分支**：`task/web-tenant-context-chat`  
> **时刻**：2026-09-18 ~17:10–17:18  
> **禁区**：不改 api/ios；不 commit / push / PR；不改 SSE 解析表；不重写功能  
> **本棒**：未 commit

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 联调重试 | Y | Y | Y |
| HG-AUDIT-R1 | approved | 联调重试 | Y | Y | Y |
| HG-GRAPH-MODULES | approved | — | Y | Y | Y |
| HG-STAGE-T-DATA | approved | — | Y | Y | Y |
| HG-CONTRACT-FREEZE | approved | — | Y | Y | Y |
| HG-D5-UI-SCOPE | approved | — | Y | 范围闸 | Y |

reviews：`docs/harness/reviews/task_web_tenant_context_chat_audit_R1_20260918.md` 存在  
pre-30 invoke：00/10/20 已齐  

结论：**可联调重试**（本棒零功能改码）

---

## 代理钉死

| 项 | 值 |
|----|-----|
| vite 进程 | 既有 PID（`VITE_API_PROXY=http://127.0.0.1:8001 pnpm dev --host 127.0.0.1 --port 5173`） |
| 代理目标 | **:8001**（已确认，未重启） |
| Docker :8000 | LISTEN · **未连** |

---

## Playwright 结论：**PASS**

| 步骤 | 结果 |
|------|------|
| 登录 / 会话 | PASS（admin · Overview/Chat） |
| `data-testid=current-tenant` | PASS（A/B 切换可见） |
| `POST /api/ops/auth/tenant` A↔B | PASS · **200** |
| `GET .../sessions/latest` **A** | **200** · `X-Ops-Tenant-Id=ops-desk-pilot` |
| `GET .../sessions/latest` **B** | **200** · `X-Ops-Tenant-Id=ops-desk-pilot-b`（上次 500 已消） |
| Chat 一问 **A** · lg-rag/stream | PASS · **200** · 头=`ops-desk-pilot` · `accept: text/event-stream` |
| Chat 一问 **B** · lg-rag/stream | PASS · **200** · 头=`ops-desk-pilot-b` · UI 出答 |
| credentials | PASS（鉴权链路 200；代码 `credentials:'include'` / withCredentials） |

**非 BLOCKED**（sessions 不再 500）。

---

## 证据路径

- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_1716_retry_chat_tenant_a.png`
- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_1716_retry_chat_tenant_b.png`
- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_1717_retry_chat_stream_b.png`
- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_1718_retry_network_headers_summary.txt`

未覆盖旧证据（`20260918_overview_tenant_a.png` / `20260918_network_headers_summary.txt` 保留）。

---

## task / checklist 勾选

- task 验收：「A/B 各至少一问 Chat」→ **已勾**（本 retry）
- 「跨租户负样本」→ **仍未勾**
- checklist §5.2.2：更新「A/B 各至少一问」与切换 Network 条（见 diff）
- **未 commit**

---

## 给 00 / api 备注（非阻塞）

A/B `sessions/latest` 曾返回同一 session id；数据面是否按租户隔离属 api 观察项。web 竖切（头 + 切换 + 发问）本棒已过。

---

## 改码

本棒 **零** `src/**` diff（仅 docs/harness invoke + task/checklist 勾选）。
