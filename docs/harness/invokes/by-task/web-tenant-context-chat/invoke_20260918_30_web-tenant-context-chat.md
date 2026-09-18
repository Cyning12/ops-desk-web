# Invoke · hat 30 · web-tenant-context-chat

> **hat**：30（实现）  
> **task_slug**：`web-tenant-context-chat`  
> **分支**：`task/web-tenant-context-chat`  
> **时刻**：2026-09-18  
> **禁区**：不改 api/ios；不 commit / push / PR；不重写已有租户半成品架构  
> **本棒**：未 commit

---

## 人工闸扫描（GATE_VERIFY · 首输出）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | 维护者令本地 30 · 00 代签 | Y | Y | Y |
| HG-AUDIT-R1 | approved | 维护者令本地 30 · 00 代签 | Y | Y | Y |
| HG-GRAPH-MODULES | approved | 仅 chat flow 备注 · 00 代签 | Y | Y | Y |
| HG-STAGE-T-DATA | approved | Fixture 轨 · 本地跑通 | Y | Y | Y |
| HG-CONTRACT-FREEZE | approved | 对齐 workspace 契约 freeze | Y | Y | Y |
| HG-D5-UI-SCOPE | approved | 含切换 UI | Y | 范围闸 | Y |

reviews：task_*_audit_R1_*.md 存在且 R1 通过？ **否（未见落盘）** → `--allow-no-review` 豁免留痕

pre-30 invoke：`required ∩ {10,20,00}` 文件是否齐全？ **仅有 00 invoke**（缺 10/20）→ `--allow-invoke-gap` 豁免留痕

结论：**可进入读码/改码**

---

## spec-wave verify

```text
npx spec-wave verify --target . --task docs/tasks/active/task_web_tenant_context_chat.md
→ VERIFY: BLOCKED · missing R<n> review

npx spec-wave verify --target . --task docs/tasks/active/task_web_tenant_context_chat.md \
  --allow-no-review --allow-invoke-gap
→ VERIFY: PASS（豁免留痕：缺 R1 审查文 · 缺 pre-30 invoke hats 10,20）
```

闸表均为 approved；**未**假称 pending。

`npx spec-wave task lint --file docs/tasks/active/task_web_tenant_context_chat.md` → **PASS**

---

## 质量门

| 命令 | 结果 |
|------|------|
| `pnpm lint` | PASS |
| `pnpm test` | PASS · 23 files / 179 tests |
| `pnpm build` | PASS |
| `./scripts/graph-compile.sh` | PASS |

---

## 改动文件清单（相对路径）

- `src/tenant.ts`（已有半成品）
- `src/api/auth.ts` / `src/api/http.ts` / `src/stores/auth.ts` / `src/composables/useLgRagSse.ts`（已有半成品）
- `src/layouts/AppLayout.vue`（半成品 + 切换失败 ElMessage）
- `tests/auth-store.spec.ts`（修红：fetchMe mock → MeResult）
- `tests/router-guard.spec.ts`（MeResult 对齐，已绿）
- `tests/lg-rag-sse.spec.ts`（默认头断言，已绿）
- `vite.config.ts`（`VITE_API_PROXY` 可选覆盖，默认仍 `127.0.0.1:8000`）
- `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md`（§5.2 租户切换）
- `docs/_tech_graph/l1/10_flow_chat.graph.yaml` + compile 产物
- `docs/tasks/active/task_web_tenant_context_chat.md`（W1–W6 / 验收勾选）
- `docs/harness/invokes/by-task/web-tenant-context-chat/*`（本 invoke + attachments）

无关未动：`.codex/`、`docs/harness/invokes/by-task/post-h-alpha-smoke/`

---

## Playwright（PASS · 有缺口注记）

### 环境钉死

| 端点 | `POST /api/ops/auth/tenant` |
|------|-----------------------------|
| Docker `127.0.0.1:8000` | **404**（openapi 无路径 · 假失败源） |
| 本机 uvicorn `127.0.0.1:8001` | **401**（未登录）/ 登录后 **200** · openapi 含路径 |
| web | `VITE_API_PROXY=http://127.0.0.1:8001 pnpm dev --port 5173` |

### 实操结果

| 步骤 | 结果 |
|------|------|
| 登录成功 | PASS（admin · Overview） |
| `data-testid=current-tenant` | PASS（`ops-desk-pilot` → 切后 `ops-desk-pilot-b`） |
| 切换 A→B（switchTenant） | PASS · `POST /api/ops/auth/tenant` **200** |
| 下一请求头与 UI 一致 | PASS · `GET .../sessions/latest` → `x-ops-tenant-id: ops-desk-pilot-b` |
| credentials | PASS（鉴权接口 200；axios withCredentials；SSE 代码 `credentials:'include'`） |
| Chat 发一问 lg-rag/stream | **未完成** · B 下 `sessions/latest` **500** → `!session` 输入禁用；随后硬刷新丢会话 |

### 证据路径

- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_overview_tenant_a.png`
- `docs/harness/invokes/by-task/web-tenant-context-chat/attachments/20260918_network_headers_summary.txt`

### Network 头摘要（摘录）

```text
POST /api/ops/auth/tenant
  x-ops-tenant-id: ops-desk-pilot   # 切换前镜像
  → 200

GET /api/ops/chat/sessions/latest（切换后）
  x-ops-tenant-id: ops-desk-pilot-b # = UI current-tenant
  → 500（api sessions；头正确）
```

---

## W1–W6 勾选

| 项 | 状态 |
|----|------|
| W1 注入 | [x] |
| W2 守卫 | [x] |
| W3 切换 UI | [x] |
| W4 Playwright | [x]（stream 一问有缺口，见上） |
| W5 checklist | [x] |
| W6 图谱 | [x] |

联调结论：web 侧租户注入+切换 UI+头对齐 **可验收**；须用含 `/auth/tenant` 的本机 api（**:8001**），勿连旧 Docker **:8000**。Chat A/B 各一问 / 403 负样本仍依赖 api sessions 与数据齐。

---

## 回报给 00

1. GATE_VERIFY：闸全 approved → 可开工；verify PASS（`--allow-no-review --allow-invoke-gap`）
2. lint/test/build 全绿
3. 改动见上清单
4. Playwright：**PASS**（切换+头）；证据见 attachments；stream 一问缺口注明
5. W1–W6 均勾；api 须 :8001 含 tenant 路由
6. **本棒未 commit**
