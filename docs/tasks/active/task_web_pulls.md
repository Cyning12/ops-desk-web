# Task：PRs 页（Epic W5 · web-pulls）

> **状态**：in_progress  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W5

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-pulls` |
| **test_strategy** | `required` |
| **test_strategy_note** | store 单测（筛选参数拼装 + 分页）+ 列表渲染冒烟（空列表） |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 并行子任务（W3–W7 同发，各自 worktree 分支） |
| **git_branch** | `task/web-pulls` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：pages/pinia/api 既有模块内实现 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：契约——`{items,total,page,page_size}`；item `{id,number,title,state,draft,ci_status,updated_at}`；筛选 state/ci_status |

---

## 背景与目标

PRs 页：列表 + state/ci_status 筛选 + 分页。后端 `GET /api/ops/pulls` 已在线（00 实测 200）。

**真实契约**：

- 响应：`{"items": [], "total": 0, "page": 1, "page_size": 20}`
- item：`{id, number, title, state, draft: bool, ci_status: string|null, updated_at}`
- query：`state` / `ci_status` / `page` / `page_size`（同 issues 约束）
- 当前 dev 库为空 → 空列表态是实测主线

**完成态**：

- [ ] `src/api/pulls.ts`：`fetchPulls(params)`
- [ ] `src/stores/pulls.ts`：filters + 分页 + 加载/错误态
- [ ] `src/views/PullsView.vue`（替换占位）：
  - 筛选栏：state（open/closed/merged 下拉）、ci_status（success/failure/pending 等下拉，选项为可配置常量）
  - el-table 列：number、title（draft 前缀「[Draft]」）、state（tag）、ci_status（tag，null 显示「—」）、updated_at
  - el-pagination 联动
  - 空列表 el-empty 态
- [ ] 单测：store 参数拼装 + 空列表渲染；pnpm 三件套全绿
- [ ] 联调冒烟：curl 带筛选 200

**不做**：PR 详情；review 信息（后端未提供）。

## 范围

- `src/api/pulls.ts`、`src/stores/pulls.ts`、`src/views/PullsView.vue`、`tests/pulls*.spec.ts`
- **禁止**改 `docs/_tech_graph/`、`docs/tasks/`、`docs/harness/`、`pnpm-lock.yaml`、`src/styles/index.css`

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| 筛选无结果 | items 空 | el-empty |
| 接口错误 | store error | el-alert + 重试 |

## 验收标准

- [ ] pnpm 三件套 exit 0
- [ ] 筛选变更 → page 重置 1 重新请求
- [ ] draft PR 显示 [Draft] 前缀；ci_status null 显示「—」
- [ ] 空列表渲染正常

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `src/api/http.ts`、`src/stores/auth.ts`、`src/views/LoginView.vue`

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；实测契约附入 |
