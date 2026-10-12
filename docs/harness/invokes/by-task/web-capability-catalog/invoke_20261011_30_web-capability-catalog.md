# Invoke：30 · web-capability-catalog

| 字段 | 值 |
|------|-----|
| hat | 30 |
| task_slug | `web-capability-catalog` |
| related_review | HG-AUDIT-R1 approved（合审 task_web-integration_audit_R1_20261011.md · PASS-WITH-NIT · 维护者授权 m00230 代录） |
| git_branch | `task/web-capability-catalog`（base `task/web-integration-task-drafts` @0a2b5a3） |
| started_at | 2026-10-11 |

## GATE_VERIFY

| human_gate_id | status | evidence |
|---------------|--------|----------|
| HG-TASK-DRAFT | approved | task 闸表 |
| HG-AUDIT-R1 | approved | 闸表 + m00230 授权代录 |
| HG-GRAPH-MODULES | approved | 图谱先行 commit 0a2b5a3（10_flow_capability.graph.yaml · 9 节点 9 边） |

结论：人工闸表为真值可 30。机检偏差照登：`npx spec-wave verify --task` 尾行报 "VERIFY: BLOCKED · missing R<n> review"——spec-wave 3.3.0 按 task basename 找审查文，实体为合审命名，已知偏差非阻断。

## 30 落地面（实际执行）

| 项 | 结果 |
|----|------|
| api 封装 | `src/api/capability.ts`：`fetchCapabilityMine()`（`/ops/capability/mine` · {items,count} 照登+兜底）、`fetchAdminCapabilityCatalog()`（`/ops/admin/capability/catalog` · 只取顶层两键 manifest_errors/manifest_error_details · 缺键 null/[] 不臆造）；CapabilityItem 九键（id,kind,description,when_to_use,tags,risk_level,side_effect,enabled,status），无 adapter/args_schema |
| store | `src/stores/capability.ts`：items/count/loading/error/isEmpty + manifest 三态；load() 先 mine，再按 `useAuthStore().user?.role==='maintainer'` 才 loadManifest()（viewer 零探测 · manifest 恒 null）；admin 面失败不影响可见集表 |
| 页面 | `src/views/CapabilityCatalogView.vue`：九键 el-table（tags join、enabled 是/否、空值 —）、count 照登、el-empty 空集、el-alert+重试 故障、el-skeleton 加载；maintainer 区 v-if=isMaintainer（manifest-errors-tag / manifest-ok / manifest-missing-keys 契约不符警示 / manifest-details-table path+error） |
| 路由 | `src/router/index.ts` 新增 path 'capability'（name capability · ensureMe 守卫复用） |
| 菜单 | `src/layouts/AppLayout.vue` 增 `/capability` 菜单项（全登录用户可见 · 菜单层零 maintainer 探测面 · 最小单点改动，T-W1 预警 role 显隐要求） |
| 测试 | tests/capability-{api,store,view}.spec.ts 共 22 条：路径钉死 / 九键逐键对齐+无 adapter,args_schema / 空集 / {items,count} 兜底 / catalog 只取两键 / 缺键 null / viewer 不请求 admin / user=null 不请求 / admin 失败隔离 / 态覆盖 |
| 图谱 W7 | 10_flow_capability.graph.yaml 摘「30 未开工」+ 端点全形 /api/ops/capability/mine、/api/ops/admin/capability/catalog；01_modules.md capability 行→「30 已落地 · 命名与图谱先行一致」；graph-compile.sh 全绿（10 flow OK） |

**后端改动：零**（契约不符未发现 · 无 FP-1 报回）。

## 三闸

| 闸 | 结果 |
|----|------|
| pnpm lint | PASS |
| pnpm test | 247/247 PASS（225 基线 + 22 新增 · 31 文件） |
| pnpm build | PASS（vue-tsc + vite · CapabilityCatalogView chunk 6.10kB） |
| npx spec-wave task lint | LINT: PASS |

## S5 双角色联调（vite :5175 → 127.0.0.1:8000 · 邀请码一次性）

| 角色 | 证据 |
|------|------|
| viewer（tester） | login 200 · /auth/me role=viewer · mine 200（8 items 九键齐 · 无 adapter/args_schema · count=8）· admin catalog **403** "Maintainer role required"（零探测面后端闸门实证） |
| maintainer（cyning） | login 200 · mine 200 · catalog 200 · 顶层两键齐：manifest_errors=0 · manifest_error_details=[]（零故障态照登） |
| maintainer 故障态 | 独立 api :8001（OPS_CAPABILITY_EXTRA_MANIFESTS=/tmp/tw3-bad-manifest.yaml 注入坏清单 · 未动共享 :8000）+ vite :5176（VITE_API_PROXY→8001）：catalog manifest_errors=1 · details=[{path:/tmp/tw3-bad-manifest.yaml, error:"capabilities[0] 非法 id…BAD.ID!!"}] |
| 空集 | Vitest 渲染覆盖（el-empty）；后端空集 200 契约由 api 侧 capability_mine.py 保证（本地库可见集非空无法实操空集，照登） |

## 缺口 / 偏差

- 无 FP-1 后端缺口：mine 九键、catalog 顶层两键与勘察真值一致。
- 图谱先行 yaml 端点 shorthand（/api/capability/mine）已按真值改全形（/api/ops/...），W7 同步完成，无需父 Agent 补图谱。
- 邀请码一次性：S5 共生成 3 枚（viewer×1 · maintainer×2），均未落盘仓内文件。
- vite dev 期数次 502 瞬态（代理 warmup · 重试即恢复），非交付代码问题。
