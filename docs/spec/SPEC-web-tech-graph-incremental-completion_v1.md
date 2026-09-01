# SPEC：Web · 技术图谱逐步补全（G-L0 脱节清扫 → G-L1 flow 补全 → G-L2 扩展 → CI 强化）

> **状态**：draft（2026-08-31 · web 00 起草 · **HG-SPEC-SIGNOFF pending** 待维护者签收）  
> **类型**：文档/图谱基建（无业务代码变更面 · 各阶段独立 task 派生）  
> **上游真值**：[`docs/_tech_graph/README.md`](../_tech_graph/README.md)（读序）· [`LAYER_README.md`](../_tech_graph/LAYER_README.md)（G-L 分层约定）· [`docs/skills/`](../skills/)（S-L0/S-L1 规程）  
> **触发**：lg-rag SSE T2–T6 闭环遗留图谱债务（l0 chat stream 边脱节 · R1-N4 l2 indexes 脱节史）+ Phase γ 分层落地后未系统补全

---

## 0. 签收注记（待维护者）

> **HG-SPEC-SIGNOFF**：pending · 维护者签收后 §1–§5 冻结为各阶段 task 起草真值；freeze 点：schema `inform_graph.v3` 不变 · G-L 目录约定不变。

---

## 1. 背景与现状缺口（实证清单 · 2026-08-31 核）

Phase γ 分层已落地（l0/l1/l2/shared + `graph-compile.sh` + CI `tech-graph.yml`），但图谱内容自 2026-07-27 起未系统跟进业务演进（Chat 三波重构 · lg-rag/lc-evidence/obs 新页 · T6 死代码删除）：

| # | 缺口 | 证据 |
|---|---|---|
| G1 | G-L0 边脱节：`sse_client → ops_api` label 仍 `POST /api/ops/chat/stream`（api T6 后 410 Gone；T2 切流起脱节） | `l0/00_main.graph.yaml` L109–111（T6 R1 遗留 ②） |
| G2 | G-L0 节点面旧：无 lg-rag / lc-evidence / obs 页节点；`version: 2026-07-27` | `l0/00_main.graph.yaml` 全文 |
| G3 | G-L1 flow 覆盖不足：仅 `10_flow_chat`；`01_modules.md` pages 行列 8 页（Login/Overview/Issues/Pulls/Graph/Chat/LC Evidence/LG RAG）均无独立 flow | `l1/` 目录实测 |
| G4 | G-L2 仅 chat 试点；其余模块无 by_path/by_symbol；且历史上发生过脱节（T6 R1-N4：l2 自 T2 起未跟 l1，CI 不校验） | `l2/README.md`（试点域=chat）· `.github/workflows/tech-graph.yml`（仅 compile） |
| G5 | 过渡双写未收尾：根 `graph.json` 与 `shared/graph.json`（C1）双写；根 `01_struct.md` stub「保留 ≥1 Epic」 | `docs/_tech_graph/README.md` 过渡节 |
| G6 | CI 校验浅：`tech-graph.yml` 只跑 `graph-compile.sh`；无「l0 边 label vs src 端点」「l2 indexes vs l1 flow implementedBy」一致性检查 | `.github/workflows/tech-graph.yml` L32–33 |

## 2. 目标

图谱回到「随业务演进的活文档」：先清脱节（P0），再按页补齐 G-L1 flow（P1），按域扩展 G-L2（P2），最后收敛过渡双写 + CI 强化防回退（P3）。**每阶段独立 task、独立闸、独立 CLOSE**，任何阶段可单独叫停而不影响已闭环阶段。

## 3. 分阶段范围（逐步补全 · 每阶段 = 一个 task）

### P0 · G-L0 脱节清扫（先行 · 最小波）

- 修 `l0/00_main.graph.yaml`：`sse_client → ops_api` 边 label 改 `POST /api/ops/lg-rag/stream`；补 lg-rag / lc-evidence / obs 页节点与边；`version` 日期刷新；`graph-compile` 再生成 `00_main.md` + graph.json
- 验收：l0 全文无 `chat/stream` 字样 · compile 绿 · CI 绿

### P1 · G-L1 flow 补全（按页 · 可再拆子 task）

- 新增 `10_flow_lg_rag`（lg-rag invoke 页 · 优先：T2–T6 主线真值所在）→ 其后按需 `10_flow_overview` / `10_flow_issues` / `10_flow_pulls` / `10_flow_lc_evidence` / `10_flow_obs` / `10_flow_login`
- 每 flow：`.graph.yaml` + compile 生成 `.md` · 挂 `01_modules.md` 关联节 · HG-GRAPH-MODULES 按「不新增一级模块（页面已在 pages 行）」预签口径
- 验收：每 flow compile 绿 · modules 关联更新 · 顺序与优先级在 task 内钉

### P2 · G-L2 indexes 扩展

- chat 试点外扩展：优先 `lg_rag` 域（`useLgRagSse` / `streamLgRag` / replay 符号）→ 其余模块按「有 flow 才配 indexes」原则跟进
- 同步规则钉死：改 flow 同 task 必改 indexes（对齐 api 仓 05 §9 同款义务）
- 验收：indexes 与 l1 flow `implementedBy` 一一对应（人工抽检 + P3 机检）

### P3 · 过渡收尾 + CI 强化

- 根 `graph.json` 双写收敛（保留或删除由维护者拍板 · README 过渡节更新）；`01_struct.md` stub 去留（≥1 Epic 约束到期评估）
- CI 强化（`tech-graph.yml`）：① l0 边 label 关键端字面值 vs `src/` 存活端点 grep ② l2 indexes vs l1 flow 符号一致性脚本（可复用/扩 `scripts/graph-compile.sh` 或新增校验脚本）
- 验收：CI 新增检查红绿可演示（故意埋脱节 → CI 红 → 修复 → 绿）

## 4. 非范围

- 业务代码（`src/**`）任何行为变更（本 SPEC 全系列纯文档/图谱/CI）
- api 仓图谱（ops-desk-api 自理 · Phase α 已完成）· iOS 仓（Phase δ 后置）
- 图谱 schema 升级（`inform_graph.v3` 冻结；升级另 SPEC）
- AST 自动生成 indexes（W5 可选项 · 本 SPEC 手工维护）
- G-L0 拓扑重构（只修脱节/补缺失节点 · 不重排架构分层）

## 5. 验收标准（SPEC 级 · 各阶段 CLOSE 汇总判定）

- [ ] P0：l0 无 chat/stream 脱节 · 新页节点齐 · compile/CI 绿
- [ ] P1：`10_flow_lg_rag` 至少落地（其余页可按优先级分期）· 每 flow compile 绿 + modules 关联
- [ ] P2：lg_rag 域 indexes 落地 · 与 flow 符号一致
- [ ] P3：双写收敛结论执行 · CI 至少新增 1 项一致性检查并可演示红绿
- [ ] 全程：HG-GRAPH-MODULES 人签记录回写 `01_modules.md` 人签表 · 每阶段 task 走完整 10/20/30/40 链

## 6. failure_paths

| 触发 | 行为 | 可重试 | 用户可见 |
|---|---|---|---|
| flow 与代码现状不符（补全时发现新脱节） | 记录进该阶段 task 验收 · 先修脱节再补新 flow | 是 | — |
| compile 红（yaml 语法/schema） | 不合入 · 30 修复至绿 | 是 | CI 红 |
| P3 CI 新检查误伤既有合法状态 | 检查脚本先「warn-only」跑一波再转强制（task 内钉） | 是 | CI 告警 |
| 双写收敛误删被引文件 | grep 引用点先行（对齐 T6「唯一活 importer」实证法） | 是 | — |
| 维护者不叫停但优先级变化 | 阶段间天然断点 · 停在任一 CLOSE 后 | — | — |

## 7. 依赖

| 依赖 | 说明 |
|---|---|
| 现状真值 | `src/views/` 页面清单 · `01_modules.md` pages 行 · l0/l1/l2 现存文件（本 SPEC §1 已实证） |
| 工具 | `scripts/graph-compile.sh` · `.github/workflows/tech-graph.yml` |
| 先例 | T2–T6 graph_delta 备注口径（不新增一级模块 · flow 备注随 task）· T6 l2 对齐手法 |
| 闸 | HG-SPEC-SIGNOFF（本 SPEC）→ 各阶段 task 的 HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 |

## 8. 思考轮（R0–R5 回填）

| 轮 | 主题 | 结论 |
|----|------|------|
| R0 | 读人聊 | 维护者令「起草图谱逐步补全的 spec」；触发 = T2–T6 遗留图谱债务（l0 L111 · R1-N4）+ Phase γ 未系统补全 |
| R1 | 范围/非范围 | 纯文档/图谱/CI；src 零行为变更；四阶段 P0–P3（§3）；非范围 §4 |
| R2 | 方案对比 | A. 一波全补（弃：单 task 过大 · 闸粒度粗 · 难叫停）· **B. 分阶段独立 task（采：每阶段可 CLOSE/可叫停 · 对齐 T2–T6 波次节奏）** · C. 只修 l0 脱节不补全（弃：flow/l2 缺口仍在） |
| R3 | 边界/失败 | 补全中发现新脱节 → 先修再补；CI 新检查 warn-only 过渡；双写收敛先 grep 引用点 |
| R4 | 验收/可测 | 全部机检可断言（compile 绿 · grep 缺席 · CI 红绿演示）；test_strategy = `graph-compile.sh` + CI 工作流 |
| R5 | 签收就绪 | 待维护者 HG-SPEC-SIGNOFF → 00 起草 P0 task（最小波先行） |

### 思考轮控制

| 项 | 值 |
|---|---|
| early_stop | no（R0–R5 全轮） |
| residual_risks | P1 页面 flow 优先级主观（task 内再钉顺序）· P3 双写收敛方向待维护者拍板 |

## 9. 下一棒

1. 维护者签收 HG-SPEC-SIGNOFF（或 20-spec-audit 书面审）
2. 00 起草 P0 task（slug 建议 `web-graph-l0-stale-sweep` · graph_change_layer=G-L0 · review_hat=20）
3. P0 CLOSE 后按 §3 顺序逐阶段推进；任一阶段 CLOSE 都是合法停点

## 修订记录

| 日期 | 摘要 |
|---|---|
| 2026-08-31 | **00** 初版：§1 实证缺口清单（G1–G6）· 四阶段 P0–P3 · R0–R5 全轮回填 · HG-SPEC-SIGNOFF pending |