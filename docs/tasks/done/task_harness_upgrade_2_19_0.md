# Task：Harness 升级至 2.19.0（web）+ WikiTrack 启用

> **状态**：completed  
> **类型**：基础设施（过程轨 upgrade + WikiTrack 入口）  
> **关联**：npm `@cyning/harness@2.19.0` · `lint-wiki-delta` · `wiki export` · [`RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`](../../harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md)  
> **上游**：api dogfood · 关账 `harness-upgrade-2-18-migrate`

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `harness-upgrade-2-19-0` |
| **test_strategy** | `recommended` |
| **test_strategy_note** | `upgrade --yes`（不带 `--ide`）；`check` 最新；`task lint-wiki-delta --scope all`；`wiki export --json`；`verify --task`；`pnpm lint` / `test` / `build` |
| **code_quality_bar** | `not_applicable` |
| **orchestration** | 单 task 同波：棒 A 钉版 + 棒 B WikiTrack；00 代签双闸 |
| **git_branch** | `task/harness-upgrade-2-18-migrate`（延伸；目标语义 `task/harness-upgrade-2-19-0`） |
| **graph_change_layer** | `none` |
| **graph_delta** | `none` |
| **graph_delta_note** | 仅过程轨 sync / manifest 升级 + coding_wiki 入口指针；不改 Inform 模块边界或 flow |
| **wiki_delta** | `docs/coding_wiki` |
| **wiki_delta_note** | 启用 WikiTrack 入口（README/stable/context/volatile/_index/topics）；正文真值仍在 skills/_tech_graph/deployment 等原路径 |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `shortest` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `30` |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00 代签：仅过程轨 + coding_wiki 入口；不改业务模块边界 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者下发：一把升 2.19.0 + 同波启用 WikiTrack（对齐 api） |
| **HG-AUDIT-R1** | approved | **30** | 00 代签：基础设施 upgrade + 入口文档；无业务 Vue/API 逻辑 |

---

## 背景与目标

本仓停在 **2.18.0** · preset=`harness-only` · 已做 `wiki_delta` 存量（多为 `n/a`）。按 api dogfood RUNBOOK §0.5：**一把升到 2.19.0**（不必停 2.18.1/2.18.2），并同波启用 WikiTrack。

**完成态**：

- [x] manifest → `2.19.0`；`check` 已是最新
- [x] `upgrade --yes`（无 `--ide`）；恢复 AGENTS / FRAGMENT overlay
- [x] `task lint-wiki-delta --scope all` → missing=0
- [x] 落盘 `docs/coding_wiki/` 入口（两层 + 互链；单份真值相对链）
- [x] 拷贝 RUNBOOK → `docs/harness/RUNBOOK_wikitrack_enable_obsidian_v1_zh.md`
- [x] `wiki export --json`：nodes≥4 · edges>0 · warnings=0
- [x] 对齐升级 RUNBOOK 版本钉；`verify --task` PASS
- [x] `pnpm lint` · `test` · `build` 绿
- [x] invoke + 自检；PR 写明禁默认 `--allow-*-gap`；Obsidian vault=`coding_wiki/`

**不做**：ops-desk-api / cyning-harness 源码；业务 Vue 页面与 API 客户端；Obsidian 插件 / 力导向 Web UI；回刷已 n/a 的 done task

---

## 失败路径

| 触发 | 行为 | 可重试 |
|---|---|---|
| S5 dirty 挡 upgrade | 先 commit task+R1；人判 `--force` | 是 |
| upgrade 冲掉 overlay | diff 后恢复 AGENTS/FRAGMENT | 是 |
| lint-wiki-delta missing>0 | 补 wiki_delta + note | 是 |
| export edges=0 / 未解析边 | 补真实双括号互链；删伪字面 | 是 |
| close 因缺字段 BLOCK | 补字段；勿默认 `--allow-*-gap` | 是 |
| pnpm 三件套红且与 harness 无关 | 只报告，不顺手大改业务 | 人判 |

---

## 验收标准

- [x] manifest 2.19.0 · preset=`harness-only` · ide 三轨未裁
- [x] `lint-wiki-delta --scope all` missing=0 · exit 0
- [x] `wiki export` nodes≥4 · edges>0 · warnings=0
- [x] overlay 已恢复（AGENTS harness 段未冲 · FRAGMENT `l1/01_modules` + `src/**`）
- [x] `verify --task` PASS；`pnpm` 三件套绿
- [x] PR：已启用 WikiTrack；勿默认 `--allow-wiki-gap`

---

### KPI

Task_KPI%: 100

| 维 | 分 |
|---|---|
| D1 完成度 | 5 |
| D2 可验证 | 5 |
| D3 范围纪律 | 5 |
| D4 摩擦记录 | 5 |
| D5 文档对齐 | 5 |

---

### 经验沉淀（recommended）

- 一把 2.18.0→2.19.0 可行；不必停 2.18.1/2.18.2。
- `lint-wiki-delta` 会扫 done 下 PROMPT 归档文；须补元信息表 `wiki_delta`+note。`wiki_delta` 若落在非 Harness 元信息表（如拍板表）会被判 missing。
- Obsidian 只开 `docs/coding_wiki/`；开上级 `docs/` 会刷过程轨孤点。
- Wiki: docs/coding_wiki

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-28 |
| **manifest** | `2.19.0`（from 2.18.0）· 五字段 · ide 三轨未裁 · preset=`harness-only` |
| **check** | 已是最新（钉 2.19.0）· exit 0；registry 已见 2.19.1（本波不追） |
| **lint-wiki-delta** | scanned=26 · missing=0 · PASS |
| **wiki export** | nodes=7 · edges=33 · warnings=[] |
| **verify** | PASS |
| **overlay** | AGENTS/CLAUDE 标记段内容未变；FRAGMENT 施加 `l1/01_modules` + `src/**`；local.json 沙箱路径改回产品仓根 |
| **pnpm 三件套** | lint/test(75)/build 全绿 |
| **摩擦** | local.json → ephemeral npx 缓存（同既有）；lint 曾漏判：glayer 字段在错误表 + 3 PROMPT 无元信息 |
| **R1** | `docs/harness/reviews/task_harness_upgrade_2_19_0_audit_R1_20260728.md` |
| **Wiki** | `docs/coding_wiki` |
