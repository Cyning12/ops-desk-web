# Task：Ops Desk 过程可观测 · Web UI 只读消费者（P3b · MVP）

> **状态**：draft · **HG-TASK-DRAFT 已签**  
> **类型**：功能实现（只读看板）  
> **关联**：Harness Epic 过程可观测 P3b · `Projects/docs/harness/guides/GUIDANCE_harness_process_observability_shell_boundary_v1_zh.md` §4  
> **帽子**：本文件由 **10-task** 起草；**HG-AUDIT-R1 未签**（待 20）

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-obs-status-consumer` |
| **test_strategy** | `required` |
| **test_strategy_note** | store/组件单测：mock `obs_status.v1` / `obs_timeline.v1` fixture；空态 / 有数据 / timeline WARN 空事件；`pnpm lint` / `pnpm test` / `pnpm build` |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task；依赖产品 CLI 契约已发版（≥2.14/2.15），不依赖 api 新接口 |
| **git_branch** | `task/web-obs-status-consumer` |
| **graph_change_layer** | `G-L1` |
| **review_hat** | `20` |
| **review_hat_reason** | `""` |
| **thinking_profile** | `tripartite` |
| **invoke_retention_profile** | `default` |
| **required_invoke_hats** | `10,30,40` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | pending | **30** | 预期仅 `pages`/`pinia`/`api`（或 `composables`）内扩展；若新增一级模块须先改 `l1/01_modules.md` 再人签 |
| HG-TASK-DRAFT | approved | 22-R1 | 维护者 2026-07-27 签收：接受 fixture MVP 切片；live 另棒 |
| **HG-AUDIT-R1** | pending | **30** | **10 不签发**；须 20 审后维护者签 |

---

## 背景与目标

产品侧 `status` / `timeline` CLI（`obs_status.v1` / `obs_timeline.v1`）已发版；Ops Desk **P3b** 要做只读消费者。  
本切片：**仅 web UI**，用 **fixture（金样 JSON）** 驱动页面，证明「能看见可观察数据」；**不**在本棒接 api 代理、**不**在浏览器里直接跑 `npx`。

### 关键结论（10 已拍板写入验收）

**仅做 web UI，能否有可观察数据？**

| 模式 | 能否「看见」 | 是否 live 仓真值 |
|---|---|---|
| **本棒 MVP：fixture / 静态 JSON** | **能** | 否（展示契约形状与空/满/WARN 态） |
| 浏览器直调 `npx @cyning/harness …` | **不能** | —（浏览器无仓文件系统与 CLI） |
| 后续：Vite 中间件 / api 只读代理 | 能 | 是（服务端执行 CLI 或读落盘） |

本棒验收以 **fixture 渲染正确** 为准；live 接入另开 follow-up task（可标 `depends_on` 本 task CLOSE）。

**完成态（草案）**：

- [ ] 类型：`ObsStatus` / `ObsTimeline`（对齐产品 JSON 主字段；未知字段宽容）
- [ ] fixture：至少 2 套（满闸 `may_start_30=true`；缺 R1 / blockers 非空或 `verify_preview.ok=false`）；timeline 1 套有事件 + 1 套 `event_count=0`
- [ ] 只读页（建议路由 `/obs` 或 Overview 下「过程」区块）：展示闸表、`may_start_30`、blockers、last_invoke、reviews、verify_preview、timeline 事件列表
- [ ] 空态 / 加载失败（fixture 加载失败）有明确 UI，不崩溃
- [ ] 文案标明：**只读投影 · 非签收真值**（对齐 GUIDANCE）
- [ ] 单测 + `pnpm lint/test/build` 绿
- [ ] 图谱：若新路由/页，更新 `l1` flow 或 `00_main` 指针 + `./scripts/graph-compile.sh`

**不做**：

- api 新 endpoint / 服务端执行 harness
- 写入闸表、代签、`verify` 替代、ingest 写盘
- 改 cyning-harness 产品仓
- 强制 hook；P3a 文档重写

---

## 范围

- `src/views/`（新页或 Overview 扩展区块）
- `src/stores/` + `src/api/` 或 `src/composables/`（读 fixture / 静态 import；**禁止**把 CLI 塞进浏览器）
- `tests/**` 对应单测
- `public/` 或 `src/fixtures/obs/` 金样 JSON（二选一，task 内固定路径）
- 必要时：`src/router/index.ts` 增一路由；`docs/_tech_graph/l1/*` 轻量同步

## 非范围

- `ops-desk-api` 改码
- Neo4j / HGM 写入 UI
- 用 Chat SSE 冒充过程真值

## 依赖

- 产品契约：`npx @cyning/harness status --json` / `timeline --json`（本机可对照刷新 fixture）
- GUIDANCE：`Projects/docs/harness/guides/GUIDANCE_harness_process_observability_shell_boundary_v1_zh.md`
- 本仓图谱：`docs/_tech_graph/l1/01_modules.md`

## 失败路径

| 触发 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| fixture 缺失 / JSON 非法 | store error 态，不抛未捕获异常 | 是 | el-alert「无法加载过程投影」 |
| 字段缺失（旧 fixture） | 缺省显示「—」/空列表 | — | 不崩溃 |
| 误把本页当签收 | 页眉固定只读声明 | — | 文案可见 |
| 有人要求本棒接 live CLI | **拒扩 scope**；开 follow-up | 人判 | 指向「需服务端/中间件」 |

## 验收标准

- [ ] 打开观测页：fixture 满闸样例可见闸状态与 `may_start_30`
- [ ] 切换/加载缺审查样例：可见 `verify_preview` 或 reviews.R1=false 类信息
- [ ] timeline 空事件样例：列表空态文案（对齐 CLI WARN 语义的人读说明即可）
- [ ] 页内明示只读、非签收真值
- [ ] `pnpm lint` · `pnpm test` · `pnpm build` exit 0
- [ ] 若改路由/模块边界：`./scripts/graph-compile.sh` exit 0；闸路径仍为 `l1/01_modules.md`

## 给 30 必读

1. 本 task  
2. GUIDANCE §4（P3b POINTER）  
3. 本机跑一遍 `status --json` / `timeline --json` 刷新 fixture（可选但推荐）  
4. `docs/_tech_graph/l1/01_modules.md`

---

## 思考轮控制

| 字段 | 值 |
|---|---|
| **thinking_profile** | `tripartite` |
| **early_stop** | `false` |
| **early_stop_reason** | `""` |
| **actual_last_round** | `R5` |
| **residual_risks** | live 数据需 follow-up；fixture 与产品 schema 漂移 |

### R0 · 问题框定

仅 web UI 时，浏览器不能执行 harness CLI；MVP 用 fixture 证明 UI 可消费契约。

### R1 · 数据面

契约字段以产品 `obs_status.v1` / `obs_timeline.v1` 为准；fixture 由 CLI 实录或手写最小子集。

### R2 · 产品面

独立 `/obs` 路由 vs Overview 区块：默认 **独立路由**（避免 Overview 变杂），导航入口可后补。

### R3 · 边界

只读；禁止 UI 写闸；文案防误用为签收。

### R4 · 测试

mock fixture；不测真实 npx。

### R5 · 后续

`web-obs-status-live`（Vite 中间件或 api 代理）`depends_on` 本 task CLOSE。

---

### 自检结论（执行者）

| 项 | 内容 |
|---|---|
| **日期** | 2026-07-27 |
| **帽** | 10-task |
| **下一棒** | 20 R1 → 签 HG-AUDIT-R1 / HG-GRAPH-MODULES → 30 |
