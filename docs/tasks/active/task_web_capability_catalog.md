# Task：Web · 联调 T-W3 · Capability 目录页（F5）

> **状态**：`active` · **GO 30**（`HG-AUDIT-R1` + `HG-GRAPH-MODULES` 双 approved · 2026-10-11 · 维护者授权 00 代录 m00230）  
> **类型**：feature / 新页面（既有后端功能面首次接通）  
> **统筹**：**web 00**；**禁止** api Agent 改本仓 Vue/TS  
> **上游**：`docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · Q1-Q4 已裁 2026-10-11 维护者 m00026）§4 F5 · §9 拆 task 规划 · A 面 `../ops-desk-api/docs/spec/tool-catalog-page/SPEC-tool-catalog-page_v0.md`  
> **分支**：`task/web-capability-catalog`（建议；base：`main`）  
> **00 注**：2026-10-11 · 维护者令联调链执行 · 00 代录起草；**依赖已解除**（Q2 裁定 m00026：B1/B2 已合入 api master #231/#234 · FP-2 阻塞消除）

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-capability-catalog` |
| **git_branch** | `task/web-capability-catalog` |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | SPEC signed → 本 task（10）→ 20-task-audit R1 → 维护者人签 HG-AUDIT-R1 + HG-GRAPH-MODULES（图谱先行）→ web 30 → 联调验收 S5 |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest：api 封装 + store + 页面渲染（可见集九键投影 / 空集 / 故障态 / role 显隐）+ 本地双跑 S5 实操（普通用户 vs maintainer 两角色），证据落 invoke |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（**新页面/路由** → 必须更新 `docs/_tech_graph/l1/01_modules.md` + flow graph，跑 `./scripts/graph-compile.sh`） |
| **graph_delta** | `docs/_tech_graph/l1/01_modules.md` + `docs/_tech_graph/l1/10_flow_capability.graph.yaml`（新增 capability flow） |
| **graph_delta_note** | 新增一级模块/页面：Capability 目录页（路由 + view + api + store） |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | 契约真值在 SPEC + A 面 SPEC；本仓 checklist 可增一节（可选） |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；本 task 不涉 SSE 面） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-10-11 维护者令联调链执行 · 00 代录 |
| HG-AUDIT-R1 | **approved** | **30** | 2026-10-11 · 维护者授权 00 代录（m00230「授权00签收后续文档」）；20-task-audit R1 **PASS-WITH-NIT** 零内容阻塞（审查文 `docs/harness/reviews/task_web-integration_audit_R1_20261011.md` · 58bf8de）· NIT-1/NIT-5 已随签回填 · NIT-2 留 web#57 合并后自然消解 |
| HG-GRAPH-MODULES | **approved** | **30** | approved · 2026-10-11 · **图谱先行已落**（本 commit · G-L1：`01_modules.md` 增 `capability` 模块行 + 新增 `10_flow_capability.graph.yaml` · `./scripts/graph-compile.sh` 编译+check 全绿）· 维护者授权 00 代录（m00230）· 30 可开工 |

---

## 背景与目标

SPEC §4 F5 行：Capability 目录为 web 仓**唯一未接通**的功能面（无路由/页面）。后端 B1/B2 已合入 api master（#231/#234）：`GET /capability/mine` 返回当前用户可见集（**九键白名单投影** · 排除 `adapter`/`args_schema` · {items,count} 外形）；`GET /admin/capability/catalog` B2 后 summary 增 `manifest_errors`/`manifest_error_details`（admin/capability.py:217-218 · maintainer 面）。本 task 新建目录页并按 `/auth/me` role 驱动 maintainer 故障详情显隐。

### 完成态

1. 新路由 + 页面：`/capability`（或 30 实判命名）· `GET /capability/mine` 可见集表，**九键投影**渲染（排除 `adapter`/`args_schema`），{items,count} 外形照登。
2. maintainer 角色：展示 `manifest_errors` / `manifest_error_details`（取自 `GET /admin/capability/catalog` summary 键）；普通用户**零探测面**（菜单/路由均不可见 maintainer 信息，`/auth/me` role 驱动）。
3. 空集 / 故障态渲染（S5 验收令）。
4. G-L1 图谱同步：`01_modules.md` 增模块行 + 新增 flow graph + `./scripts/graph-compile.sh` 绿。
5. Vitest 全量绿（基线 225 条 + 本 task 新增用例）。

---

## 现状锚点（只读）

| 主题 | 路径 | 缺口 |
|------|------|------|
| web 路由 | `src/router/index.ts` | 无 capability 路由 |
| web api 封装 | `src/api/` | 无 capability 封装 |
| web 页面 | `src/views/` | 无目录页 |
| role 驱动先例 | `src/api/auth.ts:16-40`（me · role 单值）· 路由守卫 `router/index.ts:88-100` | maintainer 显隐先例在案（F1 核对面） |
| 后端契约 | api `app/ops/admin/capability.py:163/:217-218`（catalog summary 增 manifest_errors/manifest_error_details）· `:79`（runtime meta 两键） | 只消费 · 零后端改动 |
| {items,count} 先例 | `GET /hitl/pending`（hitl/router.py:160） | envelope 外形先例 |

---

## 10 钉死契约（随 SPEC §2.5 / §3）

| 项 | 钉死 |
|----|------|
| **可见集端点** | `GET /capability/mine` · 九键白名单投影（**排除 `adapter`/`args_schema`**）· {items,count} 外形 |
| **maintainer 故障详情** | `GET /admin/capability/catalog` summary 键 `manifest_errors` / `manifest_error_details`（B2 后生效 · 已合入 #234） |
| **权限口径** | cookie 会话 + CORS credentials；maintainer 面入口/数据按 `/auth/me` role 驱动显隐（SPEC §3.4）；普通用户零探测面 |
| **原始体照登** | 响应体 snake_case 原始体照登；字段级真值以 `/openapi.json` + 端点实际行为为准（FP-1） |
| **admin 面边界** | 本 task 只消费 `/admin/capability/catalog` summary 两键做展示；**Q3 裁定 admin 操作面（sync/memory purge · Bearer 机读）不在本期范围** |

---

## 范围

- [x] **W1 · api 封装**：`src/api/capability.ts`：`capability/mine` + `admin/capability/catalog`（只取 summary 两键所需字段 · 类型钉九键投影）
- [x] **W2 · store**：Pinia store（加载态/空集/错误态 · role 缓存读 `/auth/me`）
- [x] **W3 · 页面 + 路由**：目录页视图 + `src/router/index.ts` 新路由（守卫复用 ensureMe）；可见集九键投影表
- [x] **W4 · maintainer 故障详情**：role=maintainer 时展示 `manifest_errors`/`manifest_error_details` 区；普通用户不渲染不请求（零探测面）
- [x] **W5 · 态覆盖**：空集（items=[]）/ 故障态（manifest_errors 非空）/ 加载态 / 401 跳登录复用既有
- [x] **W6 · S5 联调验收**：本地双跑两角色实操（普通用户只见可见集 · maintainer 见故障详情 · 空集/故障态渲染），证据落 invoke
- [x] **W7 · 图谱 G-L1**：`docs/_tech_graph/l1/01_modules.md` 增模块行 + 新增 `10_flow_capability.graph.yaml` + `./scripts/graph-compile.sh` 绿
- [x] **W8 · Vitest**：api/store/view/role 显隐用例；全量绿

### 非范围

- **后端零改动**（SPEC §3）：联调暴露后端缺口（如九键字段语义 / summary 键缺失）报回 ops-desk-api 另立 task；FP-1 禁前端迁就
- **admin 操作面出范围**（Q3 裁定 m00026）：sync / memory purge / Bearer 机读端点不做 web 页面；`/admin/capability/runtime`·`/metrics`·`/receipts`·`/idempotency` 本批不消费（A 面后续 task）
- F8/F10 待 D4/D5（T-W4 另立）；F9 Obs 页不在联调范围
- T-W1 回归批（F1/F4/F6/F7）；T-W2 SSE/HITL 增强（F2/F3）
- Capability 写操作 / 工具执行 UI（A 面既有裁决 · 只读目录页）
- 改 SSE freeze；ios

---

## 联调环境与坑位

| 坑位 | 钉死 |
|------|------|
| vite proxy | 必须 `http://127.0.0.1:8000`（`vite.config.ts:90-99`）：macOS localhost IPv6 打 Docker 旧镜像 404 |
| 登录 | api `scripts/create_initial_user.py` 邀请码制；**S5 须备普通用户 + maintainer 两角色账号** |
| httpx 环境 | `NO_PROXY` 含 `[::1]` 炸 httpx 须剥 |
| manifest 故障态构造 | 按 api 侧 `OPS_CAPABILITY_EXTRA_MANIFESTS` 注入坏 manifest 复现 `manifest_errors`（六 env 组先例 · SPEC §5） |
| D1 基线 | 倾向 A 本地双跑（web `pnpm dev` + api `uvicorn`） |

---

## failure_paths

| 触发 | 期望 |
|------|------|
| 闸 pending 即 30（HG-AUDIT-R1 / HG-GRAPH-MODULES） | **拒开工**（HG-GRAPH-MODULES：图谱 modules 未更新 + 未签认前拒改码 · D4-a） |
| web 既有实现/理解 与契约冲突（FP-1） | 以端点实际行为为准回填修订；禁前端迁就；冲突落 invoke 回报 00 |
| SSE 代理缓冲（FP-3） | 本页非 SSE 面；照登防联调环境误配（环境节统一钉死） |
| 与 specwave-3.1.0 并行链撞文件（FP-4） | 隔离面钉死：specwave 触 harness 配置 + graph 面；**本批触 `src/router` / `src/views` / `src/api` / `docs/_tech_graph/l1`**——graph-l1 与 specwave graph 面**同域**，拆分时按模块行/flow 文件粒度钉隔离，撞车即停并报 00 |
| 与 T-W2 并行链撞文件（FP-4 扩展 · NIT-5 回填） | T-W2↔T-W3 文件面互斥钉死：T-W2 触 `src/composables/useLgRagSse.ts` / `src/stores/chat*` / decide 卡片 UI（`HitlApprovalCard.vue` 等）；本批（T-W3）触 `src/router` / `src/views`（capability 页）/ `src/api`（capability）/ `docs/_tech_graph/l1`；两面互不重叠，撞面即停并报 00 |
| 普通用户探测到 maintainer 面（菜单/路由/请求任一泄漏） | S5 不通过 → 阻塞 merge |
| 后端九键投影多吐 `adapter`/`args_schema` | FP-1：以端点实际行为为准；若与 B1 契约不符 → 报回 api 另立 task，前端不静默吞字段也不臆删渲染 |
| maintainer 故障详情键缺失（summary 无 manifest_errors） | 渲染空态 + invoke 记录；与 B2 契约不符 → 报回 api |
| api 未就绪 / 角色账号不齐 | 联调失败 → 阻塞 merge，不假 CLOSE |

---

## 验收标准

- [x] `HG-AUDIT-R1` approved（20-task-audit R1 **PASS-WITH-NIT** 零阻塞 · 2026-10-11 维护者授权 00 代录 m00230）
- [x] `HG-GRAPH-MODULES` approved（`01_modules.md` 已增 capability 模块行 · `10_flow_capability.graph.yaml` 已建 · `./scripts/graph-compile.sh` 绿 · 2026-10-11 维护者授权 00 代录 m00230）
- [ ] 新路由 + 页面上线：`GET /capability/mine` 可见集九键投影表（排除 `adapter`/`args_schema` · {items,count} 照登）
- [ ] S5：普通用户只见可见集（零探测面 · 菜单/路由/请求三级核对）；maintainer 见 `manifest_errors`/`manifest_error_details`；空集 / 故障态渲染通过
- [ ] role 显隐由 `/auth/me` role 驱动（非前端硬编码账号）
- [ ] `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm lint` / `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm test`（全量绿 · 含新增用例）/ `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm build` 绿
  - NIT-1 注：仓 `packageManager` 钉 `pnpm@10.32.1`，PATH 前置的 pnpm 11 会拒跑——本批 verify 命令一律用钉死路径 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm`（维护者本机 v24.15.0 pnpm 10）
- [ ] `npx spec-wave task lint --file docs/tasks/active/task_web_capability_catalog.md` PASS

---

## 依赖

| 依赖 | 说明 |
|------|------|
| SPEC | `docs/spec/web-integration/SPEC-web-integration_v0.md`（signed · §2.5/§4 F5 · §9 T-W3） |
| A 面 SPEC | `../ops-desk-api/docs/spec/tool-catalog-page/SPEC-tool-catalog-page_v0.md`（signed · 九键投影/契约真值） |
| 后端合入 | api master #231（B1 · `/capability/mine`）/ #234（B2 · catalog summary 增 manifest_errors 系）· **已合入 · 零阻塞** |
| role 驱动先例 | `src/api/auth.ts` · `src/router/index.ts:88-100`（ensureMe） |
| 图谱规程 | `docs/_tech_graph/README.md` · `docs/_tech_graph/l1/01_modules.md` · `scripts/graph-compile.sh` |
| UI 库 | Element Plus 2.10 · 水墨风（背景 `#F9F9F7` · 文字 `#2C2C2C`） |

---

## 给执行帽的必读列表

1. `AGENTS.md`（图谱同步义务 · 闸纪律）
2. 本 task
3. `docs/spec/web-integration/SPEC-web-integration_v0.md` §2.5/§3/§4 F5/§5/§8
4. `../ops-desk-api/docs/spec/tool-catalog-page/SPEC-tool-catalog-page_v0.md`（九键投影契约）
5. `src/router/index.ts` · `src/api/auth.ts`（role 驱动先例）
6. `docs/_tech_graph/l1/01_modules.md` + `10_flow_overview.graph.yaml`（新 flow 范式参照）
7. `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`

---

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | T-W3 = F5 唯一未接通面 · 新路由+页面+role 显隐 | no | — | none |
| R1 | 依赖已解除（B1/B2 #231/#234 合入 · FP-2 消除）；契约钉九键投影 + {items,count} + maintainer summary 两键 | no | — | none |
| R2 | 闸钉死：HG-GRAPH-MODULES 必须列且 blocks 30（新页面/路由）；FP-4 graph-l1 与 specwave 同域须粒度隔离 | no | — | 路由命名（`/capability` vs 别名）留 30 实判，不锁死 |
| R3 | 态覆盖收敛：空集/故障/加载/401/两角色 六态齐全 | yes | 范围/契约/闸/态面全钉 | manifest 故障态构造依赖 api env 注入，联调日需 api 侧配合 |
| R4 | （未开） | — | early_stop at R3 | — |
| R5 | （未开） | — | early_stop at R3 | — |

**actual_last_round**：R3 · **early_stop**：yes · **residual_risks**：见 R2/R3

### R0 · 问题框定

F5 是 SPEC §4 唯一 ❌ 未接通面：web 无路由/页面，后端 B1/B2 已就绪——新建目录页是唯一解。

### R1 · 契约钉死

九键白名单投影（排除 adapter/args_schema）· {items,count} · maintainer 面只消费 catalog summary 两键；权限按 /auth/me role 驱动。

### R2 · 闸与隔离

新页面/路由 → HG-GRAPH-MODULES 必须列且 blocks 30（图谱先行）；FP-4：graph-l1 与 specwave-3.1.0 并行链同域，按模块行/flow 文件粒度隔离。

### R3 · 态覆盖

空集 / 故障态（manifest_errors）/ 加载 / 401 / 普通用户 / maintainer 六态全列进验收，S5 一令覆盖。

### R4 ·（未开 · early_stop）

本轮不展开。

### R5 ·（未开 · early_stop）

本轮不展开。

---

### 自检结论

| 检查 | 结果 |
|------|------|
| `npx spec-wave task lint --file docs/tasks/active/task_web_capability_catalog.md` | **PASS**（2026-10-11 起草稿实跑） |
| 结论 | **HG-AUDIT-R1 + HG-GRAPH-MODULES 双 approved（2026-10-11 · 维护者授权 00 代录 m00230 · R1 PASS-WITH-NIT · 图谱先行已落 compile 绿）· GO 30** |

---

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-11 | 10 起草（00 代录 · 维护者令联调链执行）· SPEC §9 T-W3 行落地 · B1/B2 依赖解除（Q2 m00026） |
| 2026-10-11 | HG-AUDIT-R1 签认代录（00 · 维护者授权 m00230 · R1 PASS-WITH-NIT 审查文 58bf8de）· NIT-1/NIT-5 回填 |
| 2026-10-11 | HG-GRAPH-MODULES 签认代录（00 · 维护者授权 m00230）：图谱先行落盘——`01_modules.md` capability 模块行 + `10_flow_capability.graph.yaml` · graph-compile 绿 |
