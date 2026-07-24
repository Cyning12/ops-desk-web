# Task：Issues 页（Epic W4 · web-issues）

> **状态**：in_progress  
> **类型**：功能实现  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W4

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-issues` |
| **test_strategy** | `required` |
| **test_strategy_note** | store 单测（筛选参数拼装 + 分页）+ 列表渲染冒烟（空列表） |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 并行子任务（W3–W7 同发，各自 worktree 分支） |
| **git_branch** | `task/web-issues` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：pages/pinia/api 既有模块内实现 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签：契约以实际响应为准——`{items,total,page,page_size}`；item 字段 `{id,number,title,state,labels[],module_tag,updated_at}`；筛选参数 state/label/scan_status/module |

---

## 背景与目标

Issues 页：列表 + state/label/module 筛选 + 分页。后端 `GET /api/ops/issues` 已在线（00 实测 200）。

**真实契约**：

- 响应：`{"items": [], "total": 0, "page": 1, "page_size": 20}`
- item：`{id, number, title, state, labels: string[], module_tag: string|null, updated_at}`
- query：`state` / `label` / `scan_status` / `module` / `page`(≥1) / `page_size`(1–100，默认 20)
- 排序：后端按 updated_at desc（前端不排序）
- 当前 dev 库为空 → 空列表态是实测主线，但需按字段契约完整渲染列

**完成态**：

- [ ] `src/api/issues.ts`：`fetchIssues(params)`（参数为 undefined 时不拼 query）
- [ ] `src/stores/issues.ts`：filters 状态 + 分页状态 + 加载/错误态
- [ ] `src/views/IssuesView.vue`（替换占位）：
  - 筛选栏：state（open/closed 下拉）、label（文本输入）、module（文本输入）、scan_status（下拉，选项留可配置常量）
  - el-table 列：number、title、state（tag）、labels（多 tag）、module_tag、updated_at（本地化格式）
  - el-pagination：page/page_size/total 联动，切页重新请求
  - 空列表 el-empty 态
- [ ] 单测：store 参数拼装（筛选+分页组合）+ 空列表渲染；`pnpm lint` / `pnpm test` / `pnpm build` 全绿
- [ ] 联调冒烟：curl 带筛选参数 200

**不做**：详情页/抽屉；批量操作；列排序（后端固定 updated_at desc）。

## 范围

- `src/api/issues.ts`、`src/stores/issues.ts`、`src/views/IssuesView.vue`、`tests/issues*.spec.ts`
- **禁止**改 `docs/_tech_graph/`、`docs/tasks/`、`docs/harness/`、`pnpm-lock.yaml`、`src/styles/index.css`

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| 筛选无结果 | items 空 | el-empty |
| 接口错误 | store error | el-alert + 重试 |
| 页码超出 | 后端返回空 items | 空态 + 可回页 |

## 验收标准

- [ ] pnpm 三件套 exit 0
- [ ] 筛选变更 → 重新请求且 page 重置 1
- [ ] 分页切换 → 请求带正确 page/page_size
- [ ] 空列表渲染正常（当前后端实际状态）

## 给执行帽的必读列表

1. `AGENTS.md` 2. 本 task 3. `src/api/http.ts`、`src/stores/auth.ts`、`src/views/LoginView.vue`

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；实测契约附入 |
