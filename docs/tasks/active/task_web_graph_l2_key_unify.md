# Task：Web · 图谱 P2 收尾 · by_symbol 键形态统一（裸键 → path#symbol 复合键）

> **状态**：active（2026-08-31 · web 00 起草签收 · 待 30 实现）  
> **类型**：图谱/文档（一致性清扫 · 无业务代码变更）  
> **统筹**：**web 00 Agent** 签收 · 排 30 实现  
> **上游 SPEC**：[`SPEC-web-tech-graph-incremental-completion_v1.md`](../../spec/SPEC-web-tech-graph-incremental-completion_v1.md) §3 P2（l2 indexes 扩展收尾）  
> **前置**：P1b CLOSE · [`task_web_graph_l1_flow_pages`](../done/task_web_graph_l1_flow_pages.md) · PR [#34](https://github.com/Cyning12/ops-desk-web/pull/34) MERGED（51 复合键 + 18 裸键双形态现状）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-graph-l2-key-unify` |
| **git_branch** | `task/web-graph-l2-key-unify` |
| **related_pr** | 待开（**勿 auto-merge**） |
| **implement_repo** | `ops-desk-web` |
| **orchestration** | **00 统筹** → 20 R1 审 → 30 实现 → 40 自检（闸沿用维护者「提前签收」授权 · R1 后即签） |
| **test_strategy** | `required` |
| **test_strategy_note** | 键迁移机检（迁移前后值集合全等断言 · 零裸键断言 · indexes↔flow 一一对应复验）+ `graph-compile.sh` 绿 + `pnpm lint/test/build` 回归绿（src 零变更） |
| **code_quality_bar** | `L2_frontend` |
| **graph_change_layer** | `G-L2` |
| **graph_delta** | `docs/_tech_graph/l2/indexes/by_symbol.yaml`（键形态统一 + 头注更新）· `by_path.yaml`（核对无需迁移 · 头注对齐）· `l2/README.md`（键形态约定更新） |
| **graph_delta_note** | 纯键形态迁移（值不变）；不改 flow / 不新增一级模块 |
| **wiki_delta** | `docs/coding_wiki/volatile.md` |
| **wiki_delta_note** | 本 task 短注：键统一决策 + 真值指针（SPEC §3 P2）；不长文粘贴 |
| **review_hat** | `20` |
| **required_invoke_hats** | `10,00,30,40` |
| **invoke_retention_profile** | `default` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **freeze_id** | `n/a`（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| **close_pr_policy** | `required` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-TASK-DRAFT** | approved | 22-R1 | 2026-08-31 · web 00 签 · 维护者令「P2收尾后再进P3」+ 提前签收授权沿用 |
| **HG-GRAPH-MODULES** | approved | **30** | 2026-08-31 · web 00 预签（授权代签文档闸）· 不新增一级模块 · 仅 l2 indexes 键形态 |
| **HG-AUDIT-R1** | pending | **30** | 20-task-audit R1 pass 后 web 00 即签 · review 落盘 `docs/harness/reviews/task_web_graph_l2_key_unify_audit_R1_20260831.md` |
| **HG-JOINT-DEBUG** | n/a | — | 纯图谱波 · 无跨仓联调 |

---

## 背景与目标

P1b 为防泛名撞键，7 个新域 51 条目采用 `path#symbol` 复合键；既有 chat/lg_rag 两域 18 裸键未迁移 → 当前双形态并存（头注已声明）。P2 收尾把 18 裸键统一为复合键，键形态归一，消「读索引须先知双形态」认知负担。

## 00 定夺（钉死 · 维护者可后改）

| 项 | 钉死 |
|---|---|
| 迁移面 | `by_symbol.yaml` 既有 18 裸键（chat + lg_rag 域 · 含 `http` 例外条）→ 全部改 `path#symbol` 复合键（`http` → `src/api/http.ts#http`）；**值（path/node_id/kind）一律不变** |
| 迁移后断言 | 零裸键（grep/python 断言）· 迁移前后值集合全等（条目数 69=18+51 不变 · 仅键形态变）· indexes↔9 flow implementedBy 一一对应复验 |
| by_path | 键本来就是 path · 无需迁移；头注与 by_symbol 对齐（键形态约定句） |
| 头注/README | `by_symbol.yaml` 头注双形态决策段改写为「2026-08-31 P2 统一复合键（历史决策留痕一句）」；`l2/README.md` 键形态约定同步 |
| compile | `./scripts/graph-compile.sh` 绿 · graph.json 双写再生成（时间戳 diff 容忍） |
| 模块 | 不新增一级模块；`01_modules.md` 人签记录追加本 task 行 |
| 合入 | PR **勿 auto-merge**；CI 绿即合（无联调闸） |

---

## 范围

- `docs/_tech_graph/l2/indexes/by_symbol.yaml`（18 裸键 → 复合键 · 头注更新）
- `docs/_tech_graph/l2/indexes/by_path.yaml`（头注对齐 · 键不动）
- `docs/_tech_graph/l2/README.md`（键形态约定更新）
- `docs/_tech_graph/l1/01_modules.md`（人签记录追加）
- compile 产物（脚本再生成）· `docs/coding_wiki/volatile.md` 短注

## 非范围

- `src/**` 任何变更 · l0 / l1 flow 内容变更（flow 的 implementedBy 不动 · 仅索引键形态变）
- 双写收敛 / CI 强化（SPEC P3）
- api / iOS 仓图谱 · schema 升级
- 任何条目值（path/node_id/kind）变更或条目增删（纯键形态迁移 · 值全等断言兜底）

---

## 验收标准

> 完成态（30 交付时逐项勾选）：

- [ ] `by_symbol.yaml` 零裸键（机检：全部键含 `#`）· 条目总数 69 不变 · 值集合迁移前后全等（30 附 diff 证据进 invoke_30）
- [ ] `http` 例外条已复合键化且 9 flow 命中不重复
- [ ] indexes ↔ 9 flow implementedBy 一一对应复验（机检 exit 0）
- [ ] 头注/README/`01_modules.md` 人签记录更新
- [ ] `./scripts/graph-compile.sh` 绿 · `pnpm lint/test/build` 回归绿 · `git diff main --stat -- src/` 为空
- [ ] `volatile.md` 短注落盘 · `verify` PASS

---

## failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 迁移误改值（path/node_id/kind） | 值全等断言拦截 · 不合入 | 是 | — |
| 复合键与既有 51 键撞键 | 机检撞键=0 断言（含新旧合并后全集） | 是 | — |
| compile 红 | 不合入 · 修至绿 | 是 | CI 红 |
| 误改 flow/l0/src | 范围外 · diff 断言拦截 | — | — |

---

## 依赖

| 依赖 | 说明 |
|---|---|
| 现状真值 | `l2/indexes/by_symbol.yaml`（18 裸键 + 51 复合键 · 头注双形态段）· 9 个 flow yaml |
| 先例决策 | P1a N6 / P1b R1-N1（撞键实证与复合键决策史 · 头注在案） |

---

## test_strategy

```bash
./scripts/graph-compile.sh
pnpm lint && pnpm test && pnpm build   # 回归（src 零变更）
npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l2_key_unify.md
```

---

### 自检结论

> 30/40 交付时回填：compile / lint / test / build / verify + 迁移机检退出码与结论表。

---

## 给执行帽（30）必读列表

1. `AGENTS.md` · 本 task（闸表 / 00 定夺 / failure_paths）
2. `docs/_tech_graph/l2/indexes/by_symbol.yaml`（18 裸键现状 + 头注决策史）· `by_path.yaml` · `l2/README.md`
3. 9 个 `l1/10_flow_*.graph.yaml`（implementedBy · 一一对应复验基准）
4. `docs/spec/SPEC-web-tech-graph-incremental-completion_v1.md` §3 P2

> 思考轮：由 SPEC（R0–R5 全轮已回填）承载；本文件不预置 R0–R5（lint W4 合法）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-08-31 | **00** 起草 · 维护者令「P2收尾后再进P3」· P1b CLOSE（#34）· 闸沿用「提前签收」授权 · HG-TASK-DRAFT / HG-GRAPH-MODULES 签收 · 迁移面实证：18 裸键（chat+lg_rag 含 http 例外）+ 51 复合键 |

## 合入策略

- PR：**勿 auto-merge**（close_pr_policy=required）· 纯图谱波无联调闸 · CI（含 tech-graph）绿 + 00 抽查后 00 收口 merge
- CLOSE 后按维护者令进 **P3**（双写收敛 + CI 强化 · 双写去留待维护者拍板）
