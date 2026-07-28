# ops-desk-web · Agent 导航

> **角色**：Ops Desk Kimi Code 的 Vue3 + TypeScript Web 前端。  
> **范围**：页面、组件、路由、状态管理、API 客户端、SSE 消费。  
> **边界**：不实现后端逻辑、数据库、LLM 调用。

## Open Folder 说明

在 Claude Code / Cursor 中，**应将本目录 `ops-desk-web/` 作为 Open Folder 根目录**。  
跨仓文档与统筹见 `../ops-desk-workspace/docs/`。

---

## 新会话启动纪律（自动加载 harness 流程）

每次新窗口/新会话启动时，**必须先完成以下步骤，再改业务代码**：

1. **扫描 active task**
   ```bash
   ls docs/tasks/active/
   ```
   - 有 `task_*.md`：读取其范围、验收标准、`failure_paths`、人工闸表。
   - 无 active task：停止改码，先走 `10-task` 创建 task。

2. **核验人工闸**
   | 闸 | 阻塞 | 真值位置 |
   |---|---|---|
   | `HG-GRAPH-MODULES` | 30 改码 | `docs/_tech_graph/l1/01_modules.md` |
   | `HG-AUDIT-R1` | 30 开工 | `docs/tasks/active/task_*.md` 人工闸表 |

3. **确认分支正确**
   - 当前分支应为 `task/<short-description>` 或 `fix/<description>`。
   - 若在 `main`/`master`，禁止直接改码；先切任务分支。

4. **首输出闸扫描**
   - 30 改码前必须输出 GATE_VERIFY 表（见 `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`）。
   - 任一 blocks 30 的闸为 `pending` → **拒开工**。

5. **无 task 不改码**
   - 文档/图谱维护类改动也须先有 task 或变更请求。
   - 紧急修复走 `fix/` 分支，但仍需补 task 与 invoke。

---

## 必读（按顺序）

1. **`README.md`** — 本仓说明
2. **`docs/_tech_graph/README.md`** — 技术图谱读序（G-L 分层 · Phase γ）
3. **`docs/skills/`** — S-L0 / S-L1 操作规程真值
4. **`../ops-desk-workspace/docs/01-scope/00-project-brief.md`** — 项目范围与决策
5. **`../ops-desk-workspace/docs/03-frontend-analysis/00-current-state.md`** — 前端现状与重构方向
6. **`../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md`** — SSE 事件格式与前端示例
7. **`../ops-desk-workspace/docs/05-plan/00-migration-roadmap.md`** — 阶段计划

---

## 关键入口

| 路径 | 说明 |
|---|---|
| `src/main.ts` | 应用入口 |
| `src/App.vue` | 根组件 |
| `src/router/` | Vue Router |
| `src/stores/` | Pinia |
| `src/views/` | 页面 |
| `src/components/` | 业务组件 |
| `src/composables/useOpsChatSse.ts` | Chat SSE 封装 |
| `src/api/` | axios 封装 + 后端接口 |

---

## 开发命令

```bash
pnpm install
pnpm dev          # 本地开发
pnpm lint         # ESLint
pnpm test         # Vitest
pnpm build        # 生产构建
```

---

## 关键约束

- UI 库：**Element Plus**
- 状态管理：**Pinia**
- Chat SSE：原生 `fetch` + `ReadableStream`（不依赖 fetch-event-source）
- 样式：水墨风（背景 `#F9F9F7`，文字 `#2C2C2C`）
- 每次新增页面/接口必须同步更新 `docs/_tech_graph/`（模块表：`l1/01_modules.md`；flow：`l1/10_flow_*.graph.yaml`；compile：`./scripts/graph-compile.sh`）

---

<!-- cyning-harness:begin -->
# Harness Starter（业务仓 · 通用 Agent）

> **单源真值**：`docs/coding_wiki/` 读序 + `docs/standards/` + 本文件其余业务约定。  
> **本片段**：摘要 + **POINTER**；Harness 条文真值在 `docs/harness/prompts/`。

## 执行 task 前

1. Open Folder = **本仓根**
2. 读 `docs/tasks/active/task_*.md`：`test_strategy` · `failure_paths` · **人工闸**表
3. **30 改码前** GATE_VERIFY（真值在 task **人工闸表**，**非**聊天 / invoke 字面 `approved`）：
   - 运行 `npx @cyning/harness verify --target . --task docs/tasks/active/task_*.md`
   - 首输出闸扫描表 · 见 `docs/harness/prompts/FRAGMENT_30_gate_verify_v1_zh.md`
   - **`HG-AUDIT-R1` pending** → **30 拒改码**（须维护者签 task 表 `approved`）
   - **`HG-GRAPH-MODULES` pending** → **30 拒改码**（D4-a）
   - 用户声称与 task 表冲突 → **STOP** · 以 task 表为准
4. 过程 invoke：`docs/harness/invokes/by-task/<task_slug>/`

## Verify（合并前）

| 栈 | 命令（与 `.github/workflows/` 一致） |
|----|--------------------------------------|
| 前端 | `pnpm lint` → `pnpm test` → `pnpm build` |
| 后端 | `pytest tests`（按仓 marker 裁剪） |
| iOS | `xcodebuild`（见 task `test_strategy_note`） |

## 关键词

`Harness`、`task`、`invoke`、`HG-AUDIT-R1`、`HG-GRAPH-MODULES`、`human_gate`、`拒开工`

## 完整库 POINTER

工作区：`docs/harness/prompts/`（22/30/TEMPLATE_30_gate_stop 等）
<!-- cyning-harness:end -->

<!-- cyning-harness-local:begin -->
## Ops-desk-web · Harness 仓内定制（upgrade 不改写本块）

- 质量门：`pnpm lint` → `pnpm test` → `pnpm build`
- 图谱闸路径：`HG-GRAPH-MODULES` → `docs/_tech_graph/l1/01_modules.md`（profile `graph_modules_path`）
- 改码目录：业务源码在 `src/**`（FRAGMENT 默认 `packages/**` 以本仓为准）
- WikiTrack：Obsidian vault 只开 `docs/coding_wiki/`；新 task 勿默认 `wiki_delta=n/a`
<!-- cyning-harness-local:end -->
