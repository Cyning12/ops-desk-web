# Invoke · hat 40 · web-tenant-context-chat

> **hat**：40（复检 / 审查）  
> **task_slug**：`web-tenant-context-chat`  
> **分支**：`task/web-tenant-context-chat`  
> **时刻**：2026-09-18 ~17:30 CST  
> **禁区**：不改 api/ios；不 commit / push / PR；本棒零 `src/**` 改码  
> **结论等级**：**PASS_WITH_NOTES**

---

## 元信息

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-tenant-context-chat` |
| git_branch | `task/web-tenant-context-chat` |
| task_path | `docs/tasks/active/task_web_tenant_context_chat.md` |
| 上游 30 | `invoke_20260918_30_web-tenant-context-chat.md` + `invoke_20260918_30_retry_web-tenant-context-chat.md` |
| 契约 | workspace `api-v1-tenant-readonly-context-draft.md` · F1=C · F2 · F6 |

---

## 1. 闸表与验收勾选复检

### 人工闸（task 表真值）

| human_gate_id | status | 40 核对 |
|---------------|--------|---------|
| HG-TASK-DRAFT | approved | ✅ |
| HG-AUDIT-R1 | approved | ✅ |
| HG-GRAPH-MODULES | approved | ✅ |
| HG-STAGE-T-DATA | approved | ✅ |
| HG-CONTRACT-FREEZE | approved | ✅ |
| HG-D5-UI-SCOPE | approved | ✅ |

### W1–W6 / 验收

| 项 | task 勾选 | 40 判定 |
|----|-----------|---------|
| W1 注入 | [x] | ✅ 代码 + Vitest |
| W2 守卫 | [x] | ✅ |
| W3 切换 UI | [x] | ✅ AppLayout + switchTenant |
| W4 Playwright | [x] | ✅ 30 + retry 证据 |
| W5 checklist | [x] | ✅ §5.2 |
| W6 图谱 | [x] | ✅ chat flow 备注租户句 |
| A/B 各至少一问 Chat | [x] | ✅ retry · stream 200 |
| 跨租户负样本与 api 联调 | [ ] | **note · 非阻塞**（见 §5） |

---

## 2. 抽查（源码 · 对照契约）

| 抽查点 | 证据 | 结果 |
|--------|------|------|
| 头名 F2=`X-Ops-Tenant-Id` | `src/tenant.ts` `TENANT_HEADER`；`http` interceptor；`useLgRagSse` fetch headers | ✅ |
| credentials include | `useLgRagSse` `credentials:'include'`；axios `withCredentials: true` | ✅ |
| 切换走 switchTenant | `AppLayout.onTenantChange` → `auth.switchTenant` → `POST /ops/auth/tenant` → `setStoredTenant` | ✅ |
| 未改 SSE event 解析表 | `useLgRagSse` diff 仅 +import +头；parser / `event_type` 分支零改 | ✅ |
| F1=C 语义 | 先写 session（switch API）再带头（getStoredTenant 镜像） | ✅ |
| F6 切换 UI | 顶栏 `data-testid=current-tenant` + `tenant-switch` · A/B 试点 | ✅ |
| Vitest 头断言 | `tests/lg-rag-sse.spec.ts` 默认 `ops-desk-pilot` | ✅ |

Playwright Network（retry 摘要，已存在）：

- `POST /api/ops/lg-rag/stream` A/B → **200** · `x-ops-tenant-id` 与 UI 一致  
- 证据：`attachments/20260918_1718_retry_network_headers_summary.txt` + 三张 retry 截图  

---

## 3. 质量门（40 本机复跑 · 2026-09-18 ~17:30）

| 命令 | 退出码 | 摘要 |
|------|--------|------|
| `pnpm lint` | 0 | eslint 全仓无告警 |
| `pnpm test` | 0 | 23 files / **179** tests passed |
| `pnpm build` | 0 | vue-tsc + vite build 成功 |

（与 30 invoke 声称一致；本棒短跑复验绿。）

---

## 4. Commit 路径建议（给 00 · 本棒不 commit）

### INCLUDE（本波竖切）

```text
src/tenant.ts
src/api/auth.ts
src/api/http.ts
src/stores/auth.ts
src/composables/useLgRagSse.ts
src/layouts/AppLayout.vue
tests/auth-store.spec.ts
tests/router-guard.spec.ts
tests/lg-rag-sse.spec.ts
vite.config.ts
docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md
docs/_tech_graph/l1/10_flow_chat.graph.yaml
docs/_tech_graph/l1/10_flow_chat.md
docs/_tech_graph/graph.json
docs/_tech_graph/shared/graph.json
docs/tasks/active/task_web_tenant_context_chat.md
docs/tasks/active/README.md
docs/harness/reviews/task_web_tenant_context_chat_audit_R1_20260918.md
docs/harness/invokes/by-task/web-tenant-context-chat/
```

### EXCLUDE（勿入本波）

```text
.codex/
docs/harness/invokes/by-task/post-h-alpha-smoke/
```

---

## 5. Notes（非阻塞 · 不挡本波 web CLOSE 竖切）

1. **跨租户负样本**（task 验收未勾 · checklist §5.2.2「头与 session 不一致 → 403」）：依赖 api 联调；**不**认定为必须挡 web CLOSE 的阻塞项（对齐用户 40 清单口径）。  
2. **checklist §5.2.3** 维护者签核仍空：属人工签，非代码缺陷。  
3. **30 retry 观察**：A/B `sessions/latest` 曾同 session id → api 数据面隔离观察项；web 头/切换/发问竖切已过。  
4. 联调须代理 `:8001`（含 `/auth/tenant`）；勿误连旧 Docker `:8000`（30 已钉）。

**无 FAIL 阻塞项。**

---

## 6. 结论

| 项 | 值 |
|----|-----|
| **等级** | **PASS_WITH_NOTES** |
| 阻塞 | 无 |
| 改码 | 本棒 **零** |
| 下一步 | 00 按 §4 include/exclude 统一 commit；CLOSE 前可择机补跨租户负样本联调勾选 |

---

## 回报摘要（给 00）

1. 结论：**PASS_WITH_NOTES**  
2. notes：负样本未勾；§5.2.3 人签空；sessions 同 id 属 api 观察  
3. 质量门：lint/test/build **全绿**（179 tests）  
4. commit 路径：见 §4  
5. 本 invoke：`docs/harness/invokes/by-task/web-tenant-context-chat/invoke_20260918_40_web-tenant-context-chat.md`
