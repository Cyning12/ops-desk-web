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

## 给维护者

`done`、`domain`、`Hub`、`_views`、`freeze_id`、`Epic`
