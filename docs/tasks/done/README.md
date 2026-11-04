# done/ · 已完成任务导航（Hub）

> **用途**：日常浏览 **只打开本文件**；`_views/done.md` 为薄指针。  
> **真值**：各 task 文件头部 `状态` + 本目录（或域子目录）物理位置。  
> **落盘约定**：业务仓 `docs/tasks/done/` · 工作区 Harness `docs/harness/tasks/done/`（路径替换下方 `{tasks_root}`）。

---

## 域目录（domain）

| 域 slug | 目录 | 典型前缀 / 规则 |
|---------|------|-----------------|
| `harness` | `done/harness/` | `task_harness_*`（非产品里程碑） |
| `cyning-harness` | `done/cyning-harness/` | `task_harness_cyning_harness_*` · `task_harness_m2_cyning_*` |
| `engineering` | `done/engineering/` | `task_engineering_*` |
| `governance` | `done/governance/` | `task_governance_*` · `task_gov_*` |
| `chatbi` | `done/chatbi/` | `task_chatbi_*` |
| `standards` | `done/standards/` | `task_standards_*` |
| `epics` | `done/epics/` | Epic / MANIFEST 母单 · CLOSE 卡 |

**推断**：关账时按文件名前缀落入域目录；歧义时 task 元信息填 **`domain`** 字段。

---

## harness

| 关账日 | task | freeze_id / 摘要 |
|--------|------|------------------|
| YYYY-MM-DD | [`harness/task_<slug>_v1.md`](./harness/task_<slug>_v1.md) | … |

---

## cyning-harness（产品里程碑）

| 关账日 | task | tag / 摘要 |
|--------|------|------------|
| YYYY-MM-DD | [`cyning-harness/task_<slug>_v1.md`](./cyning-harness/task_<slug>_v1.md) | … |

---

## engineering

| 关账日 | task | 摘要 |
|--------|------|------|
| YYYY-MM-DD | [`engineering/task_<slug>_v1.md`](./engineering/task_<slug>_v1.md) | … |

---

## web（本仓扁平 done/ · 非域子目录）

| 关账日 | task | freeze_id / 摘要 |
|--------|------|------------------|
| 2026-09-18 | [`task_web_specwave_upgrade_2_4_2.md`](./task_web_specwave_upgrade_2_4_2.md) | `dsh-coding-kit@1.10.0` → `spec-wave@2.4.2`（Wave A）· PR #45 MERGED |
| 2026-09-18 | [`task_web_specwave_upgrade_3_0_0.md`](./task_web_specwave_upgrade_3_0_0.md) | `spec-wave@2.4.2` → `3.0.0`（Wave B major）· PR #47 MERGED · 2026-10-11 滞后关账 |
| 2026-10-11 | [`task_web_specwave_upgrade_3_3_0.md`](./task_web_specwave_upgrade_3_3_0.md) | `spec-wave@3.0.2` → `3.3.0` · tech_graph IB 对象形固定 · 图谱四闸绿 · PR #55 MERGED |
| 2026-10-30 | [`task_web_specwave_upgrade_3_5_0.md`](./task_web_specwave_upgrade_3_5_0.md) | `spec-wave@3.3.0` → `3.5.0`（跨 3.4/3.5 两 minor · 纯钉位）· sync prompts 增图谱先读 FRAGMENT · 四闸绿 · 全程本地零 push/PR（close_pr_policy 偏差授权 · m00236） |
| 2026-10-12 | [`task_web_integration_regression.md`](./task_web_integration_regression.md) | SPEC web-integration T-W1 · 回归批 F1/F4/F6/F7 · S1/S4/S6/S7 全过 · PR #59 MERGED · 归位 #62 |
| 2026-10-12 | [`task_web_sse_hitl_enhance.md`](./task_web_sse_hitl_enhance.md) | T-W2 · SSE/HITL 增强（帧型注释 7 型 · `resume_mode` 三选 · `done{resumed}` 终态钉）· S2/S3 全过 · PR #61 MERGED · 归位 #62 |
| 2026-10-12 | [`task_web_capability_catalog.md`](./task_web_capability_catalog.md) | T-W3 · Capability 目录页（F5 · 九键投影 · role 显隐 · G-L1 图谱）· S5 双角色全过 · PR #60 MERGED · 归位 #62 |
| 2026-10-17 | [`task_web_hitl_decision_surface.md`](./task_web_hitl_decision_surface.md) | HITL 审批决策面（pending 消费 · decide/resume 接管 · resume 后自动追帧 ≤10次/≤120s · 409 分流钉死「恢复进行中」≠「已被处理」）· PR #73 MERGED · TC1–TC18 + TC-L1~L5 全 PASS |
| 2026-10-16 | [`task_web_hitl_resume_async_reverify.md`](./task_web_hitl_resume_async_reverify.md) | JC-F1 B 方案复验 · api resume 异步化 web 侧零改码实证（resume 34.77ms 根除 30.1s 掐断 · TC1–TC7 全 PASS）· api #252/#253 联合 CLOSE · 纯文档档待并 main |
| 2026-10-17 | [`task_web_hitl_fobs_receipt.md`](./task_web_hitl_fobs_receipt.md) | T-W2 回执 · F-OBS-1/F-OBS-2 闭环复验 + 前端兜底三裁定（A 裁 latency_ms 假值 / B 留 model / C 409 现状）· TC1–TC5 全勾 · PR #65 MERGED `aef91f3` |
| 2026-10-17 | [`task_web_lg_rag_sse_continue_reply.md`](./task_web_lg_rag_sse_continue_reply.md) | D3 · History 半截可见 + running 勿假续算 + error「继续回复」新 stream（`continue_from_run_id`）· TC-W1–W7 全勾 · 263 tests · PR #67 MERGED `028ed29` |
| 2026-10-17 | [`task_web_tenant_context_chat.md`](./task_web_tenant_context_chat.md) | 阶段 T · Chat 请求租户上下文（F1=C `X-Ops-Tenant-Id` + A/B 切换 UI）· 五闸全 approved · W1–W6 + 跨租户负样本联调全勾（403/422/fail-closed）· 联调证据 PR #76 MERGED `ffff3ce` |
| 2026-10-17 | [`task_web_http_error_i18n.md`](./task_web_http_error_i18n.md) | http 错误条机器串中文化（`localizeHttpErrorDetail` 七枚举+前缀脱敏+原文兜底 · `[http]` 前缀渲染层中文化 · 判据零污）· TC1–TC6 全勾 · test 294=293 绿+既有红 1 · PR #79 MERGED `5373e5a` |
| 2026-10-17 | [`task_web_fix_tc13b_guard.md`](./task_web_fix_tc13b_guard.md) | TC13(b) guard 空 diff 恒红修复（`evaluateTc13bDiff` 三态 · 空 diff→skip 留痕 · PR #73 真实 diff fixture 锁存 · 纯 tests/ 零 src/）· TC1–TC5 全勾 · main 296 绿+1 skip 零红 · PR #81 MERGED `3e67bf0` |
| 2026-09-08 | [`task_web_fix_chat_live_reactivity.md`](./task_web_fix_chat_live_reactivity.md) | 修复：pushMessage 返回响应式代理（raw 突变绕过 Vue effect 致实流零渲染） · PR #43 MERGED |
| 2026-09-08 | [`task_web_lg_rag_sse_subtask_message.md`](./task_web_lg_rag_sse_subtask_message.md) | `lg-rag-sse-v1` · 消费 api `subtask.progress.message` 上屏（显式优先 · running 零前缀） · PR #41 MERGED |
| 2026-09-08 | [`task_web_lg_rag_sse_progressive_reveal.md`](./task_web_lg_rag_sse_progressive_reveal.md) | `lg-rag-sse-v1` · 客户端 reveal 队列（subtask output 打字机 + answer 突发匀速） · PR #39 MERGED |
| 2026-09-07 | [`task_web_lg_rag_sse_idle_subtask.md`](./task_web_lg_rag_sse_idle_subtask.md) | `lg-rag-sse-v1` · idle 120s + 子任务过程分区 · PR #36 MERGED |
| 2026-08-31 | [`task_web_graph_l2_key_unify.md`](./task_web_graph_l2_key_unify.md) | 图谱 P2 收尾 · by_symbol 复合键统一（69 条目）· PR #35 MERGED · **P2 全清** |
| 2026-08-31 | [`task_web_graph_l1_flow_pages.md`](./task_web_graph_l1_flow_pages.md) | 图谱 P1b · 7 页 flow 补全 + l2 7 域复合键 · PR #34 MERGED · **P1 全清** |
| 2026-08-31 | [`task_web_graph_l1_flow_lg_rag.md`](./task_web_graph_l1_flow_lg_rag.md) | 图谱 P1a · 新建 10_flow_lg_rag + l2 lg_rag 域 indexes · PR #33 MERGED |
| 2026-08-31 | [`task_web_graph_l0_stale_sweep.md`](./task_web_graph_l0_stale_sweep.md) | 图谱 P0 · l0 脱节清扫（边/节点对齐 lg-rag 主线）· PR #31 MERGED |
| 2026-08-31 | [`task_web_lg_rag_sse_t6.md`](./task_web_lg_rag_sse_t6.md) | 删 chat SSE 死代码（api 410）· 守卫缺席断言 · PR #29 MERGED · **T2–T6 闭环** |
| 2026-08-31 | [`task_web_lg_rag_sse_t5.md`](./task_web_lg_rag_sse_t5.md) | `lg-rag-sse-v1` · answer delta 打字机（delta 追加/final 替换）· PR #28 MERGED |
| 2026-08-31 | [`task_web_lg_rag_sse_t4.md`](./task_web_lg_rag_sse_t4.md) | `lg-rag-sse-v1` · 断联/replay 续看 · cursor + seq 去重 · PR #26 MERGED |
| 2026-08-31 | [`task_web_lg_rag_sse_t3.md`](./task_web_lg_rag_sse_t3.md) | `lg-rag-sse-v1` · Chat 稳定 thread_id 会话连续性 · 刷新恢复 · PR #25 MERGED |
| 2026-08-31 | [`task_web_lg_rag_sse_t2.md`](./task_web_lg_rag_sse_t2.md) | `lg-rag-sse-v1` · 主 Chat 切 lg-rag SSE · PR #23 MERGED |
| 2026-08-31 | [`task_coding_kit_upgrade_1_10_0.md`](./task_coding_kit_upgrade_1_10_0.md) | kit 1.10.0 · 补跑 upgrade · D-PIN |

---

## epics（母单 · MANIFEST）

| 关账日 | Epic / CLOSE | 子 task 索引 |
|--------|--------------|--------------|
| YYYY-MM-DD | [`epics/epic_<slug>.md`](./epics/epic_<slug>.md) | 见母单 §编排主表 |

---

## 关账维护（checklist）

1. `git mv {tasks_root}/active/<file>.md {tasks_root}/done/<domain>/`  
2. 头部 `> **状态**：done（YYYY-MM-DD 验收通过）`  
3. **本 Hub** 对应域表 **追加一行**（日期 · 链接 · freeze_id 一行摘要）  
4. **禁止**向 `_views/done.md` 追加长列表（保持 ≤15 行薄指针）  
5. 可选：同步 `_views/done_by_domain.md` 分组表  

---

## 修订记录

| 日期 | 摘要 |
|------|------|
| YYYY-MM-DD | 初版 Hub（cyning-harness 模板嵌入） |
| 2026-08-31 | 增 web 表 · 归档 `task_web_lg_rag_sse_t2.md`（PR #23）· `task_coding_kit_upgrade_1_10_0.md` |
| 2026-08-31 | 归档 `task_web_lg_rag_sse_t3.md`（PR #25 · HG-JOINT-DEBUG 维护者亲签） |
| 2026-08-31 | 归档 `task_web_lg_rag_sse_t4.md`（PR #26 · HG-JOINT-DEBUG 凭 invoke_40 脚本化证据签收） |
| 2026-08-31 | 归档 `task_web_lg_rag_sse_t5.md`（PR #28 · HG-JOINT-DEBUG 凭 invoke_40 脚本化证据签收） |
| 2026-08-31 | 归档 `task_web_lg_rag_sse_t6.md`（PR #29 · HG-JOINT-DEBUG 凭 invoke_40 证据签收）· lg-rag SSE T2–T6 全波闭环 |
| 2026-08-31 | 图谱 SPEC 签收（PR #30）· P0 归档 `task_web_graph_l0_stale_sweep.md`（PR #31） |
| 2026-08-31 | P1a 归档 `task_web_graph_l1_flow_lg_rag.md`（PR #33 · l2 lg_rag 域同步） |
| 2026-08-31 | P1b 归档 `task_web_graph_l1_flow_pages.md`（PR #34 · 7 页 flow · P1 全清） |
| 2026-08-31 | P2 归档 `task_web_graph_l2_key_unify.md`（PR #35 · by_symbol 复合键统一） |
| 2026-09-08 | 归档 `task_web_lg_rag_sse_progressive_reveal.md`（PR #39 · 00 代签 · 维护者授权后续文档签收） |
| 2026-09-08 | 归档 `task_web_lg_rag_sse_subtask_message.md`（PR #41 · 00 代签 · 同授权波次） |
| 2026-09-08 | 归档 `task_web_fix_chat_live_reactivity.md`（PR #43 · 实流缺陷修复 · 修复前测红证据） |
| 2026-09-30 | 归档 `task_web_specwave_upgrade_3_0_2.md`（PR #50 · spec-wave 3.0.0→3.0.2 · 00 代签 · 维护者授权后续过程文档签收） |
| 2026-10-04 | 归档 `task_web_chat_history_hitl_ux.md`（PR #52 · F1 历史+续看 / F2 HITL 审批面 · 修 waiting_approval 假完成 bug · 00 代签 · 同授权波次） |
| 2026-10-11 | 归档 `task_web_specwave_upgrade_3_0_0.md`（PR #47 · spec-wave 2.4.2→3.0.0 Wave B · 滞后关账 · 随 3.3.0 wave 补归档 · 00「一并处理掉」） |
| 2026-10-11 | 归档 `task_web_specwave_upgrade_3_3_0.md`（PR #55 · spec-wave 3.0.2→3.3.0 · tech_graph 格式固定 · HG-AUDIT-R1 00 签收） |
| 2026-10-12 | 归档 `task_web_integration_regression.md`（PR #59 · 落账归位 #62 · T-W1 回归批 S1/S4/S6/S7 全过 · main verify 252/252 · R2/R2.1 PASS） |
| 2026-10-12 | 归档 `task_web_sse_hitl_enhance.md`（PR #61 · 落账归位 #62 · T-W2 SSE/HITL 增强 S2/S3 全过 · FP-5 闸 252/252 · NIT-R2-4 补尾已落） |
| 2026-10-12 | 归档 `task_web_capability_catalog.md`（PR #60 · 落账归位 #62 · T-W3 Capability 目录页 S5 双角色全过 · 图谱先行已落 compile 绿） |
| 2026-10-30 | 归档 `task_web_specwave_upgrade_3_5_0.md`（spec-wave 3.3.0→3.5.0 · 双闸 00 代录授权锚 m00236 · 全程本地零 push/PR · 图谱锚点闸 graph_path_unreachable 实证 dormant） |
| 2026-10-30 | 归档 `task_web_hitl_approval_page.md`（CLOSE 2026-10-30 · 40 approved-with-comments 零阻塞 · TC9 2026-11-02 回填 · 分支完整合入 main） |
| 2026-10-30 | 归档 `task_web_graph_anchor_profile_fix.md`（CLOSE 2026-10-30 · 40 独立验收 PASS 全绿 · 全程本地零 push · 归档随本批补登） |
| 2026-10-30 | 归档 `task_web_hitl_approval_overlay_ux.md`（CLOSE 2026-10-30 波次 · 30/40 交付 · 本地合入 · 归档随本批补登） |
| 2026-10-30 | 归档 `task_web_hitl_resume_chase_ux.md`（2026-10-28 交付 · 40 PASS · 00 代签本地 CLOSE · 归档随本批补登） |
| 2026-11-04 | 归档 `task_web_ux_state_sync.md`（PR #87 关账 · web-ux-state-sync 40 验收全过合入 main 36d42e1 · B10 关账） |
| 2026-11-04 | 归档 `task_web_hitl_resume_expired_mapping.md`（PR #88 关账 · 过期 mapping 修复 40 全过 · B11 关账） |

## 给维护者

`done`、`domain`、`Hub`、`_views`、`freeze_id`、`Epic`
