# Task：spec-wave 升级 3.0.2（web · 3.0.0 → 3.0.2）

> **状态**：`done`  
> **类型**：基础设施 / harness 过程轨 patch  
> **前置**：Wave B done（`spec-wave@3.0.0` · PR #47 MERGED）  
> **分支**：`task/web-specwave-3-0-2`（base：`main`）  
> **执行模式**：Open Folder = **ops-desk-web**；过程轨；不改 Vue / SSE  
> **00 授权**：2026-09-30「更新specwave到最新版本」（范围：web + workspace；api 另波由 api agent 处理）  
> **00 二次授权**：2026-09-30「签收当前task，后续过程文档授权00签收，完成后PR 通过CI后merge，最后CLOSE」

---

## Harness 元信息

| 字段 | 值 |
|------|-----|
| **task_slug** | `web-specwave-upgrade-3-0-2` |
| **git_branch** | `task/web-specwave-3-0-2` |
| **implement_repo** | `ops-desk-web` |
| **test_strategy** | `required` |
| **test_strategy_note** | `pnpm exec spec-wave --version`=3.0.2；`upgrade --yes`；`check`；`verify --task`；`pins check --consumer`；`KIT_CLI=spec-wave@3.0.2` + graph-compile；`host update --yes`（**不入库 hooks**）；`pnpm lint/test/build` |
| **code_quality_bar** | `not_applicable` |
| **code_quality_bar_note** | 过程轨；不改业务 Vue |
| **graph_delta** | `none` |
| **graph_delta_note** | 过程轨 patch；不改 YAML 源；compile 仅 `freeze_id`/`generated_at` 戳 diff（F-4 接受） |
| **wiki_delta** | `docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md` |
| **wiki_delta_note** | RUNBOOK 追加 3.0.2 历史行；同类活文档字面同步：`docs/coding_wiki/README.md` · `docs/coding_wiki/topics/wikilinks_export.md`（钉版字面 → 3.0.2） |
| **experience_capture** | `recommended` |
| **kpi_aggregator** | `CLOSE` |
| **invoke_retention_profile** | `minimal` |
| **required_invoke_hats** | `00,30` |
| **close_pr_policy** | `required` |
| **review_hat** | `20` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---------------|--------|-------------|------|
| HG-GRAPH-MODULES | approved | 30 | 00：过程轨 · 不改业务模块边界 |
| HG-TASK-DRAFT | approved | 20-R1, 30 | 00 本窗授权「更新specwave到最新版本」（web + workspace） |
| HG-AUDIT-R1 | approved | 30 | R1 PASS-with-conditions（内容零阻塞）· 00 于 2026-09-30 签收（授权见上方「00 二次授权」）· 审查文 `docs/harness/reviews/task_web_specwave_upgrade_3_0_2_audit_R1_20260930.md` |

---

## 背景与目标

Wave B 已把本仓钉到 **`spec-wave@3.0.0`**。上游 **`spec-wave@3.0.2`**（2026-09-24 发布）为 patch：`assets/tech-graph-vocab.yaml` 补登记 `branches` / `triggers` 边型清 warning（W1）；新增消费仓钉版保鲜闸 `pins check --consumer`（W2）。`src/` 与渲染零漂移，无 breaking。

**完成态**：`package.json` / lock / manifest / `host-tools#kit_semver` / `KIT_CLI` **五钉 3.0.2**；`check` / `verify --task` / `pins check --consumer` / graph-compile / 三件套绿；FEEDBACK 落盘；**无** `.cursor/hooks.json` / Claude PreToolUse hook-guard。

## 范围

1. 钉 `"spec-wave": "3.0.2"`（exact）+ `pnpm install`
2. `pnpm exec spec-wave upgrade --yes`（manifest `from_version=3.0.0`）
3. `scripts/graph-compile.sh`：`KIT_CLI=spec-wave@3.0.2`；coding_wiki / RUNBOOK 钉版字面
4. `host update --yes` 后：**删除** `.cursor/hooks.json`；**还原** `.claude/settings.json` 的 `PreToolUse` hook-guard 段（保留原生 `PostToolUse`）
5. `sync prompts`：conflict 默认不 `--force`；`TASK_TEMPLATE.md` 手工合并新增注；**保留** `HG-GRAPH-MODULES` 于 FRAGMENT/TEMPLATE
6. `check` / `verify --task` / `pins check --consumer` / graph-compile / `pnpm lint|test|build`
7. FEEDBACK 落盘；`assets verify` 基线留痕（业务仓缺 assets exit 2 **不挡**）
8. **不**启用自定义 schema v2 表；**不**回刷历史档旧字面

## 非范围

- Vue/SSE 业务；历史档（done task / reviews / 旧 FEEDBACK）旧字面；api / workspace 仓改动；hooks 物化入库；`.codex/` 遗留清理（他波产物 · 另议）；`pins-consumer.yaml` 显式声明源（本仓 workflow 无钉面，暂不需要）

## 失败路径

| ID | 触发 | 行为 | 本波实际 |
|----|------|------|----------|
| F-1 | install/upgrade 失败 | STOP | 未触发 |
| F-2 | sync 冲掉 HG-GRAPH-MODULES | 手合恢复 · 拒 `--force` 盲盖 | 未触发（保留） |
| F-3 | hooks 入库导致 pre-commit 裸 verify 红 | 删 hooks · FEEDBACK | **已触发并处置** |
| F-4 | graph-compile 仅戳 diff | 接受入库 | **已触发** · 戳 diff 4 行 |
| F-5 | 闸序倒置（30 先于 20-R1） | R1 不得追认既成实现 · 00 签收时显式留痕 | **已触发** · 见下方「00 签收裁定」 |

## 验收标准

- [x] `"spec-wave": "3.0.2"` · manifest version=3.0.2 · from_version=3.0.0
- [x] `--version`=3.0.2 · `check` 已是最新
- [x] `pins check --consumer` PASS（0/0 落点 · 无字面合法跳过）
- [x] `KIT_CLI=spec-wave@3.0.2` · graph-compile exit 0
- [x] 无 hooks 入库：`.cursor/hooks.json` 不存在；`.claude/settings.json` 无 `PreToolUse`（`.codex/hooks.json` 为他波遗留 · 未纳入本波提交，见 G-4）
- [x] `grep -n "HG-GRAPH-MODULES" docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md` 有命中
- [x] `pnpm lint` / `pnpm test` / `pnpm build` 绿
- [x] FEEDBACK 落盘
- [x] `verify --task` PASS
- [x] invoke 落盘 `docs/harness/invokes/by-task/web-specwave-upgrade-3-0-2/`

### 自检结论

| 命令 | 退出码 | 备注 |
|------|--------|------|
| `spec-wave --version` | 0 | 3.0.2 |
| `check --target .` | 0 | 已是最新 |
| `verify --task` | 0 | PASS（`HG-AUDIT-R1` 00 签收后） |
| `pins check --consumer` | 0 | PASS · 0/0 落点 |
| `./scripts/graph-compile.sh` | 0 | 10 graphs · 112 nodes · 120 edges |
| `pnpm lint/test/build` | 0 | 179 tests |
| hooks 入库 | — | 已删 hooks.json · settings 已还原 |

### KPI

Task_KPI%: 100

---

## 00 签收裁定（2026-09-30）

| 项 | 裁定 |
|----|------|
| R1 结论 | PASS-with-conditions（内容零阻塞 · 流程闸有条件） |
| `HG-AUDIT-R1` | **approved** —— 00 依「后续过程文档授权00签收」签收 |
| G-1 闸序倒置 | **认可并留痕**：30 先于 R1 执行属实，R1 不追认既成实现；本波为过程轨 patch 热修（依赖钉版 + 文档字面 + 图谱戳），`src/`/`tests/` 干净，00 判认既成实现有效并承担签收责任 |
| G-2 invoke 落盘 | **已闭合**：`docs/harness/invokes/by-task/web-specwave-upgrade-3-0-2/`（00 + 30） |
| G-3 自检结论/`test_strategy_note` 补 `verify --task` | **已闭合** |
| G-4 `.codex/hooks.json` | **判据已泛化**（三宿主口径）；该文件为他波遗留（mtime 2026-09-18）· 本波**不提交**、**不删除**（非本波产权）· 另议 |
| G-6 文件权限 | **已闭合**：新文档归 0644 |

---

## 给执行帽（30）必读

1. 本 task 闸表（三闸全 approved）
2. Wave B FEEDBACK：`docs/spec/doc-health/feedback/2026-09-18_3.0.0_web_upgrade.md`
3. 上游 `CHANGELOG.md` `[3.0.2]` / `[3.0.1]` 节（纯 patch · 无 breaking）
4. **禁入库 hooks**（F-3）；**勿** `git add -A`（`.codex/` · `post-h-alpha-smoke/` 为他波遗留）
