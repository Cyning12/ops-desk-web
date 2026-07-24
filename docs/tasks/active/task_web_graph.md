# Task：Graph 页（Epic W6 · web-graph）

> **状态**：in_progress  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W6

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-graph` |
| **test_strategy** | `required` |
| **test_strategy_note** | store 单测 + 组件渲染冒烟（全 null 空态 + 构造有数据态） |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 并行子任务（W3–W7 同发，各自 worktree 分支） |
| **git_branch** | `task/web-graph` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：pages/pinia/api 既有模块内实现（页面级 graph 与 docs/_tech_graph 无关） |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：v1 为 module_matrix 表格 + snapshot 元信息，不做可视化图；当前后端返回全 null，空态是实测主线；module_matrix 结构以后端有数据时的实际响应为准，前端做防御性渲染 |

---

## 背景与目标

Graph 页 v1：module_matrix 表格 + snapshot 元信息（非可视化图）。后端 `GET /api/ops/graph` 已在线。

**真实契约**（00 实测，当前为空态）：

```json
{"snapshot": null, "module_matrix": null, "repo_id": null, "created_at": null}
```

module_matrix 有数据时的结构未知（当前无 snapshot），前端须**防御性渲染**：snapshot/module_matrix 为 null 时显示空态；非 null 时按对象/数组通用结构尽量表格化（可参考后端 `app/ops/graph.py` 与 `ops-desk-workspace/docs/contracts/data-v1.md` 推测结构，但以防御为主）。

**完成态**：

- [ ] `src/api/graph.ts`：`fetchGraph()`
- [ ] `src/stores/graph.ts`：加载/错误/数据态
- [ ] `src/views/GraphView.vue`（替换占位）：
  - snapshot 元信息区：repo_id、created_at（null 显示「暂无图谱快照」）
  - module_matrix 表格区：null → el-empty；有数据 → 表格化渲染
  - 空态文案说明「需先在后端执行 scan/graph 生成」
- [ ] 单测：store + 全 null 空态渲染不报错；pnpm 三件套全绿
- [ ] 联调冒烟：curl 200（全 null 响应）

**不做**：图可视化（节点/边画布）；snapshot 历史列表。

## 范围

- `src/api/graph.ts`、`src/stores/graph.ts`、`src/views/GraphView.vue`、`tests/graph*.spec.ts`
- **禁止**改 `docs/_tech_graph/`、`docs/tasks/`、`docs/harness/`、`pnpm-lock.yaml`、`src/styles/index.css`

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| 全 null（当前实际） | 空态渲染 | el-empty + 说明 |
| 接口错误 | store error | el-alert + 重试 |

## 验收标准

- [ ] pnpm 三件套 exit 0
- [ ] 全 null 响应下页面完整渲染无报错（当前后端实际状态）
- [ ] 构造有数据 fixture 时表格渲染（单测覆盖）

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `src/api/http.ts`、`src/stores/auth.ts` 4. `/Users/cyning/Desktop/Ops-desk/ops-desk-api/app/ops/graph.py`（响应结构参考，只读）

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；实测全 null 契约附入 |
