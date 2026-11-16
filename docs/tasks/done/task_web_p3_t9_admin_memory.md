# Task：web · admin memory 管理页（P3-T9 · issue web#106 · 派单所指 #23 为已 MERGED 旧 T2 单 · 偏差登记）

> **状态**：`done`（2026-11-16 开工 · 2026-11-16 关账 · PR #107 squash c939408）  
> **类型**：feature / 前端轨  
> **统筹**：web 00；**禁止**改姐妹仓任何文件  
> **分支**：`task/web-p3-t9-admin-memory`

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-p3-t9-admin-memory` |
| **git_branch** | `task/web-p3-t9-admin-memory` |
| **implement_repo** | `ops-desk-web` |
| **task_kind** | `feature` |
| wave | P3-T9（14-p3-schedule-taskcard-design §4 D-D · 15-p3-contracts §5 · 治理线） |
| **orchestration** | P3 主线：T5 admin memory 三端点 api 已交付 · T8 任务面板并行（文件面正交：本卡碰 admin 页/路由，T8 碰 ChatView/组件；registry/task 目录撞车按并行铁律 rebase 双侧保留） |
| **test_strategy** | `required` |
| **test_strategy_note** | 新增 tests/admin-memory-{api,store,view}.spec.ts；Vitest 全量 · vue-tsc 0 · eslint 0（CLOSE 回填数字） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L1`（新页面 /admin/memory + 新一级模块行 + 新 flow 档） |
| **graph_delta** | 01_struct.md 新增 `admin-memory` 模块行 + 人签记录行 + 关联节链接；新增 10_flow_admin_memory.graph.yaml；graph-compile.sh 绿 |
| **wiki_delta** | `n/a` |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,20,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `lg-rag-sse-v1`（**只消费**；本页零 SSE） |
| **related_pr** | web#107（squash merge c939408 · CI frontend+check 双绿） |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-TASK-DRAFT | **approved** | 20-R1, 30 | 2026-11-16 P3 夜间波维护者预授权（派单 m00002「夜间自动执行，用户已预授权，不中途问问题」） |
| HG-AUDIT-R1 | **approved** | 30 | 同上，R1 书面审查结论承 wave 预授权（T5b 先例：闸表三行齐备） |
| HG-WAVE-IMPL | **approved** | 30 | 同上，T9 范围=14 §4 D-D + 15 §5 契约既定（facts 分页/revoke/episodes 只读 · maintainer 可达非租户管理员 · propose→confirm 不做） |

---

## 背景与目标

api 侧 T5 已交付 admin memory 三端点（ops-desk-api app/ops/admin/memory.py）：GET /api/ops/admin/memory/facts（keyset 分页 ≤200 · status/kind 过滤 · 十二字段投影无 embedding）· POST /facts/{key}/revoke（幂等 200 affected=0/N）· GET /episodes（只读 · 11 字段）。admin 面=跨租户运维面（14 §4 R7：AdminSyncAuth=Bearer 或 maintainer cookie · maintainer 全局角色无租户绑定）。本卡=web 端管理页 /admin/memory：maintainer 可达的记忆治理面（浏览/过滤/撤销/历程查看），**非租户管理员**（14 §4 明示）。

## 范围

1. `src/api/adminMemory.ts`（新）：fetchMemoryFacts / revokeMemoryFact / fetchMemoryEpisodes 三端点 client。契约照抄上游 15 §5：响应为 `{ok:true, data:{...}}` 包裹壳（**与 http.ts「无包装」惯例不同——admin memory 端点例外，client 内解包取 data 键**）；facts 十二字段投影（id/tenant_id/user_id/key/value/kind/source_run_id/source_turn/status/expires_at/created_at/updated_at）；episodes 十一字段（无 updated_at）；tenant_id 必填；status 词表 active/superseded/revoked/expired（facts）与 active/revoked（episodes）；kind fact/preference；outcome success/failure/partial；limit 默认 50 上限 200；cursor keyset。
2. `src/stores/adminMemory.ts`（新）：facts 列表态（items/nextCursor/cursor 栈支持上一页 · loading/error）+ revoke 动作（成功后重拉当前页）+ episodes 列表态；403 错误态照登。
3. `src/views/AdminMemoryView.vue`（新）：maintainer 判定（auth.user?.role === 'maintainer'，CapabilityCatalogView 先例 · 普通用户零探测面=不渲染不请求）；el-tabs 两区——「记忆 facts」（tenant_id 必填输入 · status/kind 过滤 · limit 50/200 · 十二字段表 · 行级「撤销」按钮 ElMessageBox 双确认 · 200 affected=0/N 正常态 ElMessage 呈现 · keyset 上一页/下一页）与「历程 episodes」（tenant_id 必填 · run_id/status/outcome 过滤 · 十一字段只读表 · 同分页形态）；403 态（页内非 maintainer 不请求渲染权限提示 · 请求 403 渲染错误条）。
4. `src/router/index.ts`：注册 /admin/memory 子路由（AppLayout children · meta title「记忆治理」）；守卫复用 ensureMe（仓内无 role 守卫先例 · 最小形态=独立路由+页内 maintainer 判定 · 深链直达非 maintainer 由页内 403 态承接）。
5. `src/layouts/AppLayout.vue`：菜单项「记忆治理」按 maintainer 条件渲染（首个条件渲染菜单先例 · 普通用户菜单零探测面）。
6. 图谱：01_struct.md 新增 `admin-memory` 模块行 + 人签记录行 + 关联节；10_flow_admin_memory.graph.yaml（G-L1）+ graph-compile.sh 绿。
7. 测试：tests/admin-memory-{api,store,view}.spec.ts（契约形/分页/过滤/revoke 流程/403 态/零探测面）。

## 非范围

ChatView/任务面板（T8 并行 · 文件面正交）· 三开关放量 · propose→confirm（14 §4 明示本波不做）· api 改动 · registry.yaml（api 仓专属波次审计闸机制 · web 仓无此簿，以图谱登记+invoke 承继——偏差登记）。

## 失败路径

| 风险 | 缓解 |
|------|------|
| 非 maintainer 深链直达 | 页内 isMaintainer 判定：不请求任何 admin 端点，渲染权限提示（零探测面） |
| 会话角色与服务端判定漂移（请求 403） | error 态照登 403 消息（normalizeError 既有）渲染错误条，不炸页 |
| revoke 幂等语义误读 | 200 affected=0 为正常态（「无匹配或已撤销」info），非错误（14 §4 D-D：否 409 裁定） |
| tenant_id 空 | 前端必填校验：空不发起请求（上游 strip 空 400 不触达） |
| keyset 无总数 | 上一页/下一页 + cursor 栈（不渲染总页数），next_cursor=null 禁用下一页 |
| T8 并行撞车 | 文件面正交；registry/task 目录撞车按并行铁律 rebase 双侧保留 |

## 验收标准

- [x] /admin/memory 路由注册 · maintainer 菜单条件渲染 · 非 maintainer 零请求渲染权限提示（tests/admin-memory-view.spec.ts 零探测面三件）
- [x] facts 表：十二字段投影 · tenant_id 必填 · status/kind 过滤 · limit 50/200 · keyset 翻页（api spec 键集合 sort 对齐 · store/view 翻页用例）
- [x] revoke：行级按钮 ElMessageBox 双确认 · 200 affected=0/N 正常态呈现 · 成功重拉当前页（view spec 双确认流程四件 + store revoke 三件）
- [x] episodes 只读：十一字段 · tenant_id/run_id/status/outcome 过滤 · 同分页形态（api spec 十一字段无 updated_at · view spec 懒加载渲染）
- [x] 403 态（页内判定与服务端 403 两路）呈现（view spec 权限态 + 403 错误条 · store spec 403 照登不抛）
- [x] Vitest 全绿 + vue-tsc 0 + eslint 0 + task lint PASS + graph-compile.sh 绿（39 files 397 passed/1 skipped · 新 3 spec 31 件）

## 必读列表

- ops-desk-api app/ops/admin/memory.py:257-456（契约真源 · 实装已核实）
- 14-p3-schedule-taskcard-design.md §4 D-D · 15-p3-contracts.md §5
- src/api/capability.ts（client 体例先例）· src/views/CapabilityCatalogView.vue（maintainer 显隐先例）

## 思考轮控制

| 轮 | 结论 | early_stop | reason（early_stop） | residual_risks |
|----|------|------------|----------------------|----------------|
| R0 | 框定：上游契约={ok,data} 包裹壳（admin 端点例外 · client 内解包）；keyset (created_at DESC,id DESC) base64url 不透出；revoke 幂等 200 affected=0/N 正常态 | false | — | 无 |
| R1 | 证据：api 实装亲读（app/ops/admin/memory.py:257-456 词表外 422 · tenant_id 空 400 · 非 maintainer 403）；仓内无 role 守卫先例（router guard 仅 ensureMe）；CapabilityCatalogView 零探测面先例 | false | — | AppLayout 菜单条件渲染为仓内首个先例（无既有模式可照抄 · 判定逻辑同 view） |
| R2 | 方案：可达性最小形态=独立路由+页内 maintainer 判定（深链直达非 maintainer 页内 403 态承接 · router guard 零改动）；分页=cursor 栈上一页/下一页；双确认=ElMessageBox.confirm | false | — | 无 |
| R3 | 反例：勿臆造角色守卫新机制；勿把 affected=0 渲染为错误；勿请求时对非 maintainer 探测 admin 端点；勿臆造第四 status 值；勿碰 ChatView（T8 面） | false | — | T8 并行 registry/task 目录撞车（铁律 rebase 双侧保留） |
| R4 | 验收：6 条验收标准机断（Vitest spec + lint 退出码 + graph-compile 退出码）；回退=revert 单 PR（全新文件+router/menu 局部增量） | false | — | CI 双绿依赖远端（frontend+check） |
| R5 | 收口：范围/非范围/failure_paths/验收齐备；HG 三闸 approved（夜间波预授权 · T5b 先例闸表三行） | true | 契约/守卫/组件/图谱锚点已亲读，R0-R4 无新证据需求，再轮无增量 | 派单指 issue #23 实为已 MERGED 旧 T2 单（模板残留）→ 新建 issue #106 替代并登记偏差 |

**actual_last_round**：R5（early_stop）

### R0

问题：admin memory 治理面缺 web 入口——api T5 已交付三端点（facts 分页/revoke/episodes），web 无消费面。完成态：/admin/memory 页 maintainer 可达（非租户管理员 · 14 §4 明示），facts 浏览/过滤/撤销 + episodes 只读。契约真源 15 §5 逐字 + api 实装 app/ops/admin/memory.py:257-456 亲读核实。

### R1

亲读核实：`src/router/index.ts` 守卫仅 ensureMe+登录校验（无 role 守卫先例——勿臆造新守卫机制）；`src/views/CapabilityCatalogView.vue:11` `isMaintainer = computed(() => auth.user?.role === 'maintainer')` 页内判定先例（普通用户零探测面=不渲染不请求）；`src/layouts/AppLayout.vue` 菜单静态（条件渲染为首个先例 · 判定逻辑与 view 同源）；`src/api/http.ts` docstring「无 {ok,data} 包装」为惯例——admin memory 端点是例外（{ok:true,data:{...}} 包裹 · client 内解包取 data 键 · 在 client 头注明示）；api 侧错误面：词表外 422 · tenant_id strip 空 400 · revoke user_id 显式空白 400 · cookie 非 maintainer 403「Maintainer role required」（normalizeError 既有承接）。

### R2

方案落成：①client 三函数解 {ok,data} 壳（返回 data 键 · 缺键兜底）；②store 管 facts/episodes 两列表态 + cursor 栈翻页（keyset 无总数 · next_cursor=null 禁用下一页）+ revoke 成功重拉当前页；③view el-tabs 两区 · tenant_id 必填输入（默认当前 tenant · 空不发起请求）· status/kind/limit 过滤即改即查 · 行级撤销 ElMessageBox.confirm 双确认 · 200 affected=0/N ElMessage 正常态；④router 注册子路由（guard 零改动）；⑤AppLayout 菜单 v-if isMaintainer；⑥图谱新增 admin-memory 模块行+flow 档（capability 先例）。

### R3

反例清单：臆造 router role 守卫（仓内无先例 · R1 证据）；把 affected=0 渲染为错误态（14 §4 D-D 幂等裁定：200 正常 · 否 409）；非 maintainer 仍请求 admin 端点（违反零探测面 · 页内判定先行）；臆造 status/kind/outcome 词表第四值（上游 422 · 前端 select 固定词表）；el-pagination 总页数形态（keyset 无总数 · 用上一页/下一页+cursor 栈）；触碰 ChatView/组件目录（T8 文件面 · 正交铁律）；臆造 registry.yaml（api 仓专属机制 · web 以图谱+invoke 承继）。

### R4

验收机断面：Vitest 三新 spec（api 契约形/解包/缺键兜底 · store 加载/翻页/revoke/403/零探测 · view 渲染/过滤/双确认/权限态）+ 全量回归；vue-tsc 0 · eslint 0 · spec-wave task lint PASS · graph-compile.sh 绿（退出码机断）。回退=revert 单 squash commit（新文件为主 · router/menu 两处局部增量易剥）。

### R5

草稿可交 30。范围 7 条 → 交付清单；验收 6 条 → 机断组合；非范围 5 条（T8 面/三开关/propose→confirm/api 改动/registry 簿）；failure_paths 六行覆盖探测面/403 漂移/幂等误读/tenant 空/无总数/并行撞车。闸表三行齐备（HG-TASK-DRAFT/HG-AUDIT-R1/HG-WAVE-IMPL · 夜间波预授权代录 · T5b 先例）。

### 自检结论

范围 7 条全交付（api client / store / view / router / 菜单 / 图谱 / 测试），非范围 5 条零触碰（ChatView 面未碰 · 三开关未碰 · propose→confirm 未做 · api 仓未碰 · registry.yaml 未臆造）。验证面全绿：Vitest 全量 39 files 397 passed/1 skipped（新增 admin-memory-{api,store,view}.spec.ts 共 31 件）；vue-tsc 0 · eslint 0；`npx spec-wave@3.5.0 verify` 三闸 approved + `task lint --file` PASS；`./scripts/graph-compile.sh` 绿（10_flow_admin_memory.md 生成）。CI（frontend 54s · check 35s）双绿后 squash merge main（c939408）。偏差三处已登记（issue #23→#106 · registry 簿 api 专属以图谱+invoke 承继 · router 无 role 守卫先例采用页内判定最小形态），均为「最小改动+如实登记」口径。

## 实现备忘

- **{ok,data} 包裹壳**：admin memory 三端点为 http.ts「无包装」惯例之例外——client 内 `OkEnvelope<T>` 解包取 `data` 键，缺键兜底空页/0（api spec 钉死）。
- **可达性最小形态**：router guard 仅 ensureMe 复用零新增（仓内无 role 守卫先例）；页内 `isMaintainer` 判定先行（非 maintainer 渲染 403 权限态零请求）；AppLayout 菜单 `v-if isMaintainer` 为仓内首个条件渲染菜单先例（判定逻辑与 view 同源）。
- **分页**：keyset 无总数——store 管 cursor 栈（首页 null），上一页弹栈/下一页推栈，`next_cursor=null` 禁用下一页；revoke 成功重拉当前页（栈不动）。
- **revoke 幂等**：200 affected=0 为正常态（ElMessage.info「无匹配记忆或已撤销」）非错误；双确认 ElMessageBox.confirm 文案含 key+tenant+用户 scope；revoke 请求失败 ElMessage.error 且不冒泡刷新。
- **episodes**：tab 首切懒加载（之后过滤/翻页驱动 · 不重复拉）；十一字段无 updated_at；tool_sequence 数组 join(' → ') 呈现；只读无操作列。
- **类型坑**：测试 mock `ElMessageBox.confirm` resolved 'confirm' 报 TS2345（非 MessageBoxData）→ `const CONFIRM_YES = 'confirm' as unknown as MessageBoxData`。

## 测试策略

tests/admin-memory-api.spec.ts（路径钉死 · {ok,data} 解包 · 十二/十一字段投影 · 参数序列化 · 缺键兜底）；tests/admin-memory-store.spec.ts（加载/翻页 cursor 栈/过滤/revoke 成功重拉/403 照登/零探测面）；tests/admin-memory-view.spec.ts（渲染/过滤交互/双确认流程/权限态）；全量 Vitest + vue-tsc + eslint。

## 修订记录

| 日期 | 内容 |
|------|------|
| 2026-11-16 | 初稿（P3 夜间波派单 m00002 · issue web#23） |
| 2026-11-16 | 30 交付 + CLOSE：PR #107 squash merge c939408（CI 双绿）· 验收勾选 · 自检结论/实现备忘回填 · issue #106 替代登记 · 迁档 done |