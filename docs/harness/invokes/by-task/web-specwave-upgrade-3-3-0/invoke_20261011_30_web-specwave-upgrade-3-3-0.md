# Invoke：30 · web-specwave-upgrade-3-3-0

| 字段 | 值 |
|------|-----|
| hat | 30 |
| task_slug | `web-specwave-upgrade-3-3-0` |
| related_review | —（R1 待 20 审 · HG-AUDIT-R1 pending） |
| git_branch | `task/web-specwave-3-3-0` |
| started_at | 2026-10-11 |

## GATE_VERIFY

| human_gate_id | status | evidence |
|---------------|--------|----------|
| HG-GRAPH-MODULES | approved | task 表（不改模块边界 · `l1/01_modules.md` 零 diff） |
| HG-TASK-DRAFT | approved | 00 本窗「更新spec-wave到3.3.0，并根据新的规则来固定tech_graph格式」 |
| HG-AUDIT-R1 | **pending** | 待 00 签收（00 直接指令先行 · 同 3.0.2 G-1 闸序留痕惯例） |

结论：**HG-AUDIT-R1 pending · 30 本窗由 00 直接指令先行**，签收前不 CLOSE；`verify --task` 实测 BLOCKED 留痕。

## 30 落地面（实际执行）

| 项 | 结果 |
|----|------|
| 钉版 | `package.json` + `pnpm-lock.yaml` → `spec-wave@3.3.0`（corepack 钉 10.32.1 · 经 `~/.cache/node/corepack` 直调） |
| upgrade | `3.0.2 → 3.3.0` · manifest `from_version=3.0.2` · `.cyning-harness/` 为 legacy 只读 |
| sync prompts | dry-run：10 skip · 0 add · 2 conflict（仅本地 `HG-GRAPH-MODULES` 行 diff · **保留** · 未 `--force`） |
| **tech_graph 格式固定** | 9 图 `implementedBy` 数组形 → 对象形 `{path, symbol?}` ×73 节点；obs 双 fixture 节点副实现入注释；lg_rag `use_thread_id→lg_rag_store` 非调用边折叠进 inbound label |
| drift 配置 | 新增 `.spec-wave/graph-drift.yaml`（`struct_rel: l1/01_modules.md`） |
| KIT_CLI | `scripts/graph-compile.sh` 钉 `spec-wave@3.3.0` · compile/check 全绿（10 graphs · 112 nodes · 119 edges） |
| 图谱四闸 | `yaml check --all` 10/10 OK · `drift` PASS（protocol · drifts=0）· `ib check` PASS（73/0）· `ast check` PASS（45/0 · cross_path=25 inform） |
| 钉版字面 | `docs/coding_wiki/README.md` · `docs/coding_wiki/topics/wikilinks_export.md` · RUNBOOK §3 与历史行 |
| hooks | 未物化 · 维持不入库 |

**业务源码改动：零**（`src/` / `tests/` 未触碰 · ast 闸问题以图谱边语义修正闭合 · F-6）。
