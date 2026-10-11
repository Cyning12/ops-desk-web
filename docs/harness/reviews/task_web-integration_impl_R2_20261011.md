# R2 实现审查：web-integration 栈式三 PR（#59 回归批 / #60 Capability 目录页 / #61 SSE·HITL 增强）

- 审查帽：harness-20-task-audit（书面审查 · 零 src/ 改动 · 无权代签任何闸）
- 审查日期：2026-10-11 · 审查轮次：R2（实现审 · R1 为 task 草稿审）
- base：`task/web-integration-task-drafts` @ 0a2b5a3（HG-AUDIT-R1 签认代录 commit）
- 对象：
  | PR | head sha | task | 性质 |
  |---|---|---|---|
  | #59 | 060bbd6 | task_web_integration_regression（T-W1） | 零代码改动 · invoke 验收留痕（S1/S4/S6/S7） |
  | #60 | 8f8844c | task_web_capability_catalog（T-W3） | 新增页面 + 22 测试 + invoke（S5） |
  | #61 | 8efe8f2 | task_web_sse_hitl_enhance（T-W2） | 4 src + 2 测试（+5 钉）· **无 invoke** |
- 对照真值：docs/tasks/active/ 三 task（HG-AUDIT-R1 approved 版）· SPEC-web-integration_v0.md（origin/task/spec-web-integration-migrate 正本 · R1 NIT-2 过渡路径在案）· docs/harness/reviews/task_web-integration_audit_R1_20261011.md
- 方法：gh pr diff 全量读 + PR head 树 git show 行号级复核 + 契约钉子本地 grep 实证。未实跑 Vitest/实操（审查帽不代跑验收 · 只核对留痕与代码一致性）。

---

## 总结论

| PR | 结论 | 一句话 |
|---|---|---|
| #59 T-W1 | **PASS-WITH-NIT** | 零 src 改动属实 · S1/S4/S6/S7/W5/W6 留痕齐全 · NIT-R2-1 四起证据引用未随仓落盘 |
| #60 T-W3 | **PASS-WITH-NIT** | 验收逐项达标 · role 三级零探测钉死 · 菜单 +1 裁定合理（见 §3.4） · 测试锁行为质量高 |
| #61 T-W2 | **FAIL（证据面）· 代码面 PASS-WITH-NIT** | 代码增量正确且 NIT-4 落地精准，但 task W4/W5 要求的 S2/S3 invoke 留痕 **零文件**——PR body 实证锚全指向 /tmp 易失路径，验收证据未随仓持久化 |

流程闸（分列 · 不代签）：HG-AUDIT-R1 三 task 均 approved（R1 在案）· 本审查不产生新签认 · #61 证据补齐后建议维护者复核本项。

---

## 1. PR #59 T-W1 回归批 — PASS-WITH-NIT

### 逐项核对
| 验收项 | 结论 | 证据 |
|---|---|---|
| 零代码改动预期 | PASS | diff 34 文件全部位于 docs/harness/invokes/by-task/web-integration-regression/，src/ tests/ 零触碰 |
| S1 认证链 | PASS | invoke §S1 + shots s1_01–s1_05 五步（冷启跳登录/登录/刷新保持/登出/守卫回跳） |
| S4 聊天历史+SSE 恢复 | PASS | run.mjs（191 行 playwright）两轮 SSE + 刷新恢复条 + 历史回放 user=2/assistant=2 + 切 thread（s4_01/s4_04–s4_06） |
| S6 四观测页 | PASS | s6_01–s6_06 四页 + 筛选态 Network 断言 |
| S7 lg-rag/lc-evidence 成功+失败态 | PASS | s7_01–s7_03（后端断连 500 + 重试钮 · run3.mjs 28 行专项） |
| W5 role 菜单核对 | PASS | w5_01/w5_02 双角色菜单同为 8 项「平凡成立」（AppLayout.vue:38-47 无 role 条件渲染照登）· 预警「capability 页落地须引 role 驱动」已被 #60 正确承接（见 §3.4） |
| W6 契约对拍 | PASS | raw/*.json 9 枚零 diff · snake_case 照登 + threads envelope 例外照登 · /chat/stream 410 钉由 chat-stream-deprecation.spec.ts 覆盖（R1 NIT-3 回填一致） |
| verify 闸 | PASS | Vitest 225/225 · lint/build 绿（留痕数值与基线一致） |

### NIT-R2-1（留痕完备性 · 非行为阻塞）
invoke 正文引用 attachments/s1_auth_curl.log 与 ui_flow.log；run.mjs 引用 shots/s4_02_reload_replay.png 与 s4_03_switch_thread.png——PR head 树（060bbd6）实证此 **4 文件均未随仓落盘**（git ls-tree 核对：shots 仅 s4_01/s4_04/s4_05/s4_06，无 logs 目录）。引而未存，留痕链断点。建议补交或修正引用。
另照登：invoke 已如实记录 spec-wave 3.3.0 verify 机检 BLOCKED（合审命名 task_web-integration_audit_R1 不匹配 per-task basename）——裁定维持 R1 口径：命名口径非阻断。

## 2. PR #60 T-W3 Capability 目录页 — PASS-WITH-NIT

### 逐项核对（行号 = head 8f8844c）
| 验收项 | 结论 | 证据 |
|---|---|---|
| 新路由 /capability | PASS | src/router/index.ts:73-79（children 内 · ensureMe 守卫复用 · 未登录跳登录） |
| mine 九键投影排除 adapter/args_schema | PASS | src/api/capability.ts:30-39 CapabilityItem 恰九键（id/kind/description/when_to_use/tags/risk_level/side_effect/enabled/status）· capability-api.spec.ts 逐键 sort 对齐 + not.toHaveProperty('adapter'/'args_schema') 双钉 |
| {items,count} 外形 + 缺键兜底 | PASS | capability.ts:64-69（count 缺 → items.length 兜底 · items 非数组 → 空） |
| maintainer 见 catalog 顶层两键 | PASS | capability.ts:75-82 只取 manifest_errors/manifest_error_details · 缺键照登 null/[] 不臆造 · 返回形两键测试钉死 |
| 普通用户三级零探测 | PASS | 菜单层（AppLayout.vue:47-49 全登录用户可见 · 零 maintainer 条件）· 路由层（无 role guard · 页内显隐）· 请求层（src/stores/capability.ts:58-59 仅 role==='maintainer' 才 loadManifest · viewer/user=null 不请求 admin · store/view 双侧测试钉 not.toHaveBeenCalled） |
| role 驱动显隐 | PASS | stores/capability.ts:58 + views/CapabilityCatalogView.vue:11 isMaintainer=computed(auth.user?.role==='maintainer') · :96 v-if 唯一判据 · /auth/me role 非硬编码账号 |
| S5 双角色实操 | PASS | invoke_20261011_30_web-capability-catalog.md：viewer mine 200 八 items 九键齐 count=8 · viewer admin 403 "Maintainer role required" · maintainer catalog 200 两键齐 · 故障态独立 api :8001 坏 manifest 注入实证 manifest_errors=1 + details[{path,error}] · 空集仅 Vitest 覆盖如实照登 |
| G-L1 图谱 | PASS | 10_flow_capability.graph.yaml + 01_modules.md 措辞更新「30 已落地」· 端点全形 /api/ops/... · graph-compile 绿（generated_at/sha 更新在 diff 内） |
| Vitest 基线+新增 | PASS | 247/247（225+22 · 22 = api 6 + store 8 + view 8 清点一致）· 测试锁路径/键集/调用次数/渲染存在性等真行为，非实现细节 |
| 三态/失败面 | PASS | el-empty 空态 · el-alert+重试错误态 · el-skeleton 加载态 · manifest 失败隔离不影响可见集（store.ts:66-77 + 双测试钉） · manifest_errors 缺键警示态（manifest-missing-keys） |
| NIT-5 文件面互斥 | PASS | 与 #61 文件清单零交集（#60: capability.*+router+AppLayout+图谱 · #61: hitl/chat/SSE/卡片） |

### §3.4 菜单 +1 项裁定（30 自报「超委派字面四目录的最小单点改动」）
**裁定：PASS（合理的最小改动）**。理由链：① task W3 字面写「页面+路由」，但无菜单项则页面不可发现，验收 S5「双角色实操」事实上要求可导航；② mine 端点契约口径为任意登录用户可见（SPEC Q3 CurrentUser），菜单全用户可见与契约一致、无越权暴露面；③ T-W1 invoke W5 预警「capability 页落地时须引入 role 驱动隐藏并复核」——其指向是 maintainer 详情面，#60 已将该显隐正确落在页内（菜单本身非 maintainer 专属，无需 role 门控）；④ 改动确为最小单点（AppLayout.vue +3 行含注释）。不构成范围外扩张。

### NIT-R2-2（轻微）
invoke 自述空集态「仅 Vitest 覆盖照登」——S5 实操未含空集注入（需清库 · 成本不对等），照登合规；若维护者要求 S5 全字面，可后续补空集实操。不阻塞。

## 3. PR #61 T-W2 SSE/HITL 增强 — FAIL（证据面）· 代码面 PASS-WITH-NIT

### 代码面逐项（行号 = head 8efe8f2）
| 验收项 | 结论 | 证据 |
|---|---|---|
| W1 帧注释 6→7 型纯文档级 | PASS | src/composables/useLgRagSse.ts:28（七型枚举补 hitl.waiting）· :42 onEvent 注释同步 · 运行时零改动 |
| W2 resume_mode 三选 UI 默认 inherit | PASS | src/components/chat/HitlApprovalCard.vue:19 默认 inherit · :49-60 el-radio-group data-test=hitl-resume-mode 三选（续跑默认/批准即续跑/手动续跑）· :22 透传第 4 参 |
| NIT-4 落地（默认不送键保旧断言） | PASS | src/api/hitl.ts:99-100 仅 resumeMode 非空且 !=='inherit' 才送 body.resume_mode → inherit 载荷 {decision} 字面不变；src/stores/chat.ts:992-995 inherit 走精确 2 参调用。旧断言 tests/chat-store-hitl.spec.ts:325 toHaveBeenCalledWith('req-1','approved') **原样保留**（R1 所记 :253 因上方新增测试顺延至 :325 · 断言语义零改动）· 新增 :356 三参钉锁 immediate 路径 |
| 响应驱动续链（required=false 跳第二步） | PASS（与 task/SPEC 无冲突） | chat.ts:999-1000 if (decideResp.resume?.required !== false) await resumeHitlRequest(requestId)。裁定：SPEC 冻结面为「decide 不自动 resume · 恢复是客户端第二个显式动作」——其钉的是** inherit/manual 口径下前端必须显式续链**；immediate 口径下后端 decide 即进程内续跑（resume.required=false · auto_triggered=true），此时再链 resume 必撞 409 误呈「已被处理」。按响应键裁量跳步是契约内行为而非臆断：hitl.ts:54-59 响应类型钉 required/auto_triggered · 不送键时默认路径两步钉死不变。与 task W2「不送或送 inherit 两可」收敛为单选「不送」亦一致 |
| W3 done{resumed} 终态（禁等 completed） | PASS（AC10 钉适度） | chat.ts:718-738 done 分支仅 waiting_approval 特判保留续看，resumed/completed/failed/无 status 一律走通用终态（lastDone + clearActiveRun）——天然满足「禁依赖 completed 字面」。新钉 done{status:'resumed', latency_ms/model 缺省} → 终态清除 + lastDone 兜底 {latency_ms:0, model:''}：钉的是真契约行为（F-OBS-1 后端终帧缺键的前端兜底），非实现细节，不过度 |
| 未知帧容错 | PASS | chat.ts default 分支忽略未展示帧型（注释在案）· 新测试 hitl.resumed/tool_call/x.future.v2 三枚前瞻帧不崩不改态 |
| FP-5 闸数值 | PASS（账面一致） | PR body 报 Vitest 230/230 = 225+5 新钉 · 文件清单 +5 钉清点一致（chat-store-hitl +3 · chat-view +2） |

### 证据面 FAIL（阻塞项 · B-R2-1）
task T-W2 W4/W5 验收要求 S2（断网 replay 零丢失 + 未知帧容错实证）与 S3（六 env 组 HITL 全链）**实操证据落 docs/harness/invokes**——PR head 树（8efe8f2）git ls-tree 实证：**web-sse-hitl 相关 invoke 文件零枚**，diff 文件清单仅 6 文件（4 src + 2 tests）。PR body 虽详述 S2/S3 执行（PARTIAL_EQ_FULL_PREFIX · GAP_EQ_FULL_TAIL seq8–18 · 六 env 组 :8050 · 三 run id），但全部实证锚指向 /tmp/tw2_* 易失路径，未随仓持久化；代码注释（hitl.ts:58 · chat.ts:996-998）两处引用「T-W2 S3 实证」亦无仓内佐证可溯。对比 #59/#60 均带 invoke + attachments 的交付形态，#61 证据链断裂。**裁定：验收证据项 FAIL——需补交 invoke_20261011_30_web-sse-hitl-enhance.md（+ SSE 样本/日志 attachments）后复核；代码面无需返工。**

### NIT-R2-3（轻微）
chat-view.spec.ts 新增 UI 钉以 mock.calls[0] 长度 2 断言 inherit 精确 2 参——与 chat-store-hitl.spec.ts:325 语义重复（双钉同一契约点），可接受（store/UI 两层各自独立价值），仅记录。

## 4. 契约钉子复核（跨 PR）
| 钉子 | 结论 | 锚点 |
|---|---|---|
| withCredentials | PASS（零改动保持） | src/api/http.ts:49 withCredentials: true（base 实证 · 三 PR 均未触碰） |
| X-Ops-Tenant-Id | PASS（零改动保持） | src/tenant.ts:5 TENANT_HEADER 常量（未触碰） |
| done{resumed} 唯一终态 | PASS | chat.ts:718-738（见 §3 W3） |
| 未知帧容错 | PASS | chat.ts default 分支 + #61 新测试三帧钉 |
| snake_case 照登 | PASS | capability.ts 九键/manifest 两键原样 · #59 W6 对拍零 diff |
| 401 全局跳登录 | PASS | 复用 http.ts 拦截器（capability.ts/hitl.ts 注释在案 · 未自造） |

## 5. NIT 清单（R2 新增 · 不阻塞）
- NIT-R2-1（#59）：四起证据文件引而未随仓落盘（s1_auth_curl.log · ui_flow.log · s4_02_reload_replay.png · s4_03_switch_thread.png）。
- NIT-R2-2（#60）：S5 空集态仅 Vitest 覆盖（照登合规 · 可选补实操）。
- NIT-R2-3（#61）：inherit 2 参契约点 store/UI 双钉语义重复（可接受 · 仅记录）。

## 6. 阻塞项
- **B-R2-1（#61 · 唯一阻塞）**：S2/S3 invoke 留痕缺失（task W4/W5 验收项）——补交 docs/harness/invokes/by-task/web-sse-hitl-enhance/ 后复核，代码面无返工需求。

## 7. 后端观察项转呈（#61 PR body 自报 · 非本仓裁定面）
- F-OBS-1：done{resumed} 帧 latency_ms/model 缺省（前端兜底 0/'' 已钉）——后端是否补齐请维护者裁。
- F-OBS-2：run 在飞时 replay 瞬返 500（沉降后恢复 200）——是否 409/Retry-After 语义化请裁。

## 8. 实证锚点
- gh pr diff 59/60/61 全量（+419 / +966-25 / +260-11）· gh pr view 61 --json files（6 文件零 invoke）
- git ls-tree 实证：060bbd6（#59 invoke+raw 9+shots 20+run*.mjs 3）· 8f8844c（invoke_20261011_30_web-capability-catalog.md 在树）· 8efe8f2（无 web-sse-hitl invoke）
- git show 行号级：hitl.ts:48/54-59/94-106 · chat.ts:718-738/978-1006 · useLgRagSse.ts:28/42 · HitlApprovalCard.vue:19/22/49-60 · capability.ts:23-24/30-39/64-69/75-82 · capability store:58-59 · CapabilityCatalogView.vue:11/96 · router/index.ts:73-79 · AppLayout.vue:47-49 · chat-store-hitl.spec.ts:325/356
- 契约钉：src/api/http.ts:49 · src/tenant.ts:5（base 本地 grep）

---
审查人：20-task-audit 子 Agent（00 委派）· 本文不代签任何 human_gate · HG 栏位留白待维护者。
