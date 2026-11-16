# R1 审查 · task_web_p3_t9_admin_memory（20-task-audit）

> **审查对象**：docs/tasks/active/task_web_p3_t9_admin_memory.md（初稿 2026-11-16）  
> **审查基准**：14-p3-schedule-taskcard-design.md §4 D-D · 15-p3-contracts.md §5 · api 实装 ops-desk-api app/ops/admin/memory.py:257-456 · 仓内先例（CapabilityCatalogView 零探测面 / T5b 过闸体例）  
> **审查帽**：20（书面审查 · 不改 task 实质内容）

---

## 一、范围核对

- task 范围 7 条 ↔ 14 §4 D-D：facts 分页浏览（limit 50/200 上限对齐上游 limit 200 封顶）· status/kind 过滤词表（active/superseded/revoked/expired · fact/preference · 逐字对齐 15 §5）· 十二字段投影（id/tenant_id/user_id/key/value/kind/source_run_id/source_turn/status/expires_at/created_at/updated_at · 无 embedding）· revoke（POST /facts/{key}/revoke · body {tenant_id, user_id?} · 幂等 200 affected=0/N 正常态 · 14 §4「否 409」裁定照登）· episodes 只读（十一字段无 updated_at · status active/revoked · outcome success/failure/partial）。**逐字核对一致**。
- 可达性：14 §4「web 新增 /admin/memory 页 · maintainer 可达 · 非租户管理员」→ task 采用最小形态（独立路由 + 页内 maintainer 判定 + 菜单条件渲染），R1 小节已举证仓内无 role 守卫先例（router guard 仅 ensureMe），未臆造新守卫机制。**合规**。
- {ok,data} 包裹壳例外已在范围第 1 条与 R1 小节双处明示（http.ts docstring「无包装」惯例的 admin 端点例外 · client 内解包），消歧到位。

## 二、非范围核对

ChatView/任务面板（T8 并行 · 文件面正交）· 三开关放量 · propose→confirm（14 §4 明示本波不做）· api 改动 · registry.yaml（api 仓专属波次审计闸机制 · web 仓无此簿 · 偏差已登记「图谱登记+invoke 承继」）。**五条均有设计真源或机制出处，无自创裁剪**。

## 三、验收标准核对

六条验收 - [ ] 项：路由+菜单+非 maintainer 零请求 · facts 表（字段/必填/过滤/limit/翻页）· revoke（双确认/正常态/重拉）· episodes 只读 · 403 两路态 · 机断组合（Vitest/vue-tsc/eslint/task lint/graph-compile）。均可机断或半机断，与失败路径表六行一一对应（探测面/403 漂移/幂等误读/tenant 空/无总数/并行撞车）。**覆盖完备**。

## 四、failure_paths 与 R0–R5 核对

- failure_paths 六行均有缓解落点（页内判定 / normalizeError 照登 / ElMessage 正常态 / 前端必填闸 / cursor 栈 / rebase 铁律）。
- R0–R5 槽位齐备 + 控制表（early_stop/reason/residual_risks 三列）· R5 early_stop=true 附 reason；residual_risks 如实登记 issue #23 模板残留（新建 #106 替代）。
- 人工闸三行齐备（HG-TASK-DRAFT / HG-AUDIT-R1 / HG-WAVE-IMPL · P3 夜间波维护者预授权 · T5b 先例闸表形态）。

## 五、结论

**审查结论：通过（PASS · 零内容阻塞）**。本审查对 task_web_p3_t9_admin_memory 的范围、非范围、验收标准、failure_paths 与 R0–R5 思考轮逐项复核，核对基准为 14 §4 D-D 与 15 §5 契约逐字及 api 实装锚点；task 文件结构合 T5b 过闸体例，人工闸表齐备（HG-AUDIT-R1 由 P3 夜间波维护者预授权代录），可交 30 开工。唯一留痕：派单所指 issue #23 为已 MERGED 旧单（模板残留），已新建 issue #106 替代并将在 PR body 引用。
