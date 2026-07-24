# Task：Overview 页（Epic W3 · web-overview）

> **状态**：in_progress  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W3

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-overview` |
| **test_strategy** | `required` |
| **test_strategy_note** | store 单测（mock http）+ 组件渲染冒烟（空态 + 有数据态） |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 并行子任务（W3–W7 同发，各自 worktree 分支） |
| **git_branch** | `task/web-overview` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：pages/pinia/api 既有模块内实现，无新增一级模块 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：trend 图不引图表库（手绘 SVG，避免并行任务 lockfile 冲突）；空数据为当前后端常态，空态渲染是验收重点 |

---

## 背景与目标

Overview 页：指标卡片 + trend 图 + sync/scan 状态。后端 `GET /api/ops/overview` 已在线。

**真实契约**（00 于 2026-07-24 实测）：

```json
{
  "cycle_time": {"median_days": null, "sample_size": 0},
  "review_time": {"median_days": null, "sample_size": 0},
  "issue_throughput": {"count": 0, "period_days": 30},
  "as_of": "2026-07-24T12:36:48.065313Z",
  "sync_status": "idle",
  "sync_run": null,
  "scan_snapshot": null,
  "trend": [{"date": "2026-06-25", "closed_issues": 0, "merged_prs": 0}, ...]
}
```

**注意**：当前 dev 库数据为空（median 为 null、sync_run/scan_snapshot 为 null、trend 全 0），**空态渲染是验收重点**，不得报错或显示 NaN/undefined。

**完成态**：

- [ ] `src/api/overview.ts`：`fetchOverview()`
- [ ] `src/stores/overview.ts`：加载态/错误态/数据态
- [ ] `src/views/OverviewView.vue`（替换占位）：
  - 指标卡片：cycle_time / review_time（median_days 天数 + sample_size；null 显示「—」）/ issue_throughput（count + period_days）
  - sync/scan 状态区：sync_status、sync_run（null 显示「暂无同步记录」）、scan_snapshot（null 显示「暂无扫描快照」）
  - trend 图：近 30 天 closed_issues / merged_prs 双线，**手绘 SVG**（不引 echarts 等依赖），全 0 时正常渲染空折线
  - `as_of` 显示数据截止时间
- [ ] 加载骨架/错误提示（el-alert + 重试按钮）
- [ ] 单测：store（mock http）+ 空态渲染不报错；`pnpm lint` / `pnpm test` / `pnpm build` 全绿
- [ ] 联调冒烟：dev server 代理下 curl `/api/ops/overview` 200（登录 cookie）

**不做**：图表库引入；自动轮询；时间范围切换。

## 范围

- `src/api/overview.ts`、`src/stores/overview.ts`、`src/views/OverviewView.vue`、`tests/overview*.spec.ts`
- **禁止**改 `docs/_tech_graph/`、`docs/tasks/`、`docs/harness/`、`pnpm-lock.yaml`（不装新依赖）、`src/styles/index.css`（页面样式写在组件 scoped 内）

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| 接口 401 | 全局拦截跳登录 | 登录页 |
| 接口 500/网络错误 | store error 态 | el-alert + 重试 |
| 全指标 null/0 | 正常空态渲染 | 「—」/「暂无」 |

## 验收标准

- [ ] pnpm 三件套 exit 0
- [ ] 空数据下页面完整渲染无报错（当前后端实际状态）
- [ ] trend SVG 在全 0 数据下正常渲染
- [ ] 样式符合水墨风（#F9F9F7/#2C2C2C 变量）

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `src/api/http.ts`、`src/stores/auth.ts`（store 范式）、`src/views/LoginView.vue`（页面范式）、`src/styles/index.css`

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；实测契约附入；空态为验收重点 |
