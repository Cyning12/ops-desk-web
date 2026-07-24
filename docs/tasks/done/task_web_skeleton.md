# Task：Web 前端骨架（Epic W1 · web-skeleton）

> **状态**：completed  
> **类型**：功能实现（脚手架）  
> **关联**：`docs/tasks/active/TASK_epic_web_frontend_v1.md` W1 · `docs/_tech_graph/01_struct.md`

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-skeleton` |
| **test_strategy** | `required` |
| **test_strategy_note** | Vitest 冒烟测试（App 挂载 / axios 封装单测）；本 task 只要求套件可跑且 ≥1 测试通过 |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task |
| **git_branch** | `task/web-skeleton` |
| **experience_capture** | `recommended` |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：src 一级模块边界沿用 `01_struct.md` 既有模块表（entry/router/pages/components/api/pinia/styles），无新增一级模块；W1 落全部路由占位，W2–W7 在各自槽位替换实现 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签（用户授权）：技术选型 Vue3+TS+Vite+Element Plus+Pinia+Router；SSE 决策为原生 fetch+ReadableStream（AGENTS.md 中 fetch-event-source 旧表述本 task 同步更正）；不引 Tailwind，水墨风用 CSS 变量 |

---

## 背景与目标

本仓仅有文档骨架，无 `src/`。本 task 建立可运行前端基线，为 W2–W7 提供槽位。

**关键决策（00 已拍板）**：

1. **SSE 方式**：原生 `fetch` + `ReadableStream`（Epic 母单与 Kickoff 2026-07-24 决策，晚于 AGENTS.md 旧表述）。本 task 不安装 `@microsoft/fetch-event-source`，并更正 AGENTS.md 关键约束行。
2. **不引 Tailwind**：`01_struct.md` styles 行含 `tailwind.config.*` glob 但非强制；v1 用 Element Plus + CSS 变量实现水墨风（`#F9F9F7` 背景 / `#2C2C2C` 文字）。
3. **路由槽位前置**：W1 声明全部 v1 路由（login/overview/issues/pulls/graph/chat）+ AppLayout 导航 + 占位视图，W2–W7 各自替换一个视图、加各自 store/api，避免并行改 router 冲突。
4. **axios 封装**：`withCredentials: true`，baseURL `/api`，dev 环境经 Vite proxy → `http://localhost:8000`；401 拦截器预留（W2 实现跳转逻辑）。

**完成态**：

- [x] `package.json` + `pnpm install` 可跑（vue@3 / vue-router@4 / pinia / element-plus / axios / vite / typescript / vitest / eslint+prettier）
- [x] `vite.config.ts`：vue 插件 + dev proxy `/api` → `http://localhost:8000`
- [x] `src/main.ts` / `src/App.vue` / `index.html`
- [x] `src/router/`：6 条路由 + 占位视图 + AppLayout（侧边导航：Overview/Issues/Pulls/Graph/Chat + 登录页无布局）
- [x] `src/api/`：axios 实例（withCredentials、baseURL、snake_case 直传不包外壳）+ 错误规范化
- [x] `src/stores/`：Pinia 注册（具体 store 留 W2+）
- [x] `src/styles/`：水墨风 CSS 变量 + 全局样式
- [x] ESLint + Prettier 配置；`pnpm lint` 通过
- [x] Vitest 配置 + ≥1 冒烟测试；`pnpm test` 通过
- [x] `pnpm build` 通过；`pnpm dev` 可访问空白骨架页
- [x] `docs/_tech_graph/` 同步（02_version.md / graph 如有结构变化）
- [x] AGENTS.md 关键约束 SSE 行更正为 fetch + ReadableStream
- [x] invoke 落盘 + `harness task close` 归档 + 合并 master

**不做**：任何业务页面实现（W2+）；登录逻辑（W2）；真实接口对接（W3+）；E2E（W8）。

---

## 范围

- [x] `package.json` / `pnpm-lock.yaml` / `tsconfig*.json` / `vite.config.ts` / `index.html`
- [x] `src/**`（main / App / router / views 占位 / layouts / api / stores / styles / env.d.ts）
- [x] `.eslintrc` / `eslint.config.*` / `.prettierrc*` / `.gitignore` 增补
- [x] `vitest` 配置 + `tests/` 或 `src/**/*.spec.ts`
- [x] `AGENTS.md`（SSE 约束行更正）
- [x] `docs/_tech_graph/`（同步）

## 非范围

- 后端改动
- 业务页面逻辑、真实 API 联调
- CI workflows

---

## 失败路径

| 触发条件 | 系统行为 | 可重试 | 用户可见 |
|---|---|---|---|
| 依赖安装失败 | pnpm 报错，换 registry 重试 | 是 | 终端报错 |
| dev 启动但后端未起 | 页面可开，API 调用失败（预期，W2+ 才联调） | — | 网络错误 |
| build 类型错误 | tsc 报错阻断 | 是 | 终端报错 |

---

## 验收标准

- [x] `pnpm lint` exit 0
- [x] `pnpm test` exit 0（≥1 测试）
- [x] `pnpm build` exit 0，产物在 `dist/`
- [x] `pnpm dev` 启动后 `/login` `/overview` 等 6 路由均可访问（占位内容）
- [x] axios 实例 `withCredentials: true` 且 baseURL `/api`
- [x] `./scripts/graph-compile.sh` 通过
- [x] `npx @cyning/harness verify --target . --task <本task>` PASS

---

## 给执行帽的必读列表

1. `AGENTS.md`（含 Harness Starter）
2. `docs/tasks/active/task_web_skeleton.md`（本文件）
3. `docs/_tech_graph/01_struct.md`（模块边界）
4. `README.md`
5. `../ops-desk-workspace/docs/03-frontend-analysis/00-current-state.md`（重构方向，可选）

---

### 自检结论（00 复检）

- 30 子 agent 交付后 00 复检：`pnpm lint` exit 0、`pnpm test` 4 passed、`pnpm build` exit 0（dist/ 产出）、`./scripts/graph-compile.sh` OK、`harness verify` PASS。
- 00 修订 `01_struct.md` styles 行：去 `tailwind.config.*` glob（Epic W1 拍板），人签记录补登。
- 遗留：Element Plus 全量引入致 chunk>500kB 警告，按需引入优化留 W8；harness 产品包 2.3.0 已发布，本 Epic 锁定 2.2.1 不追，留后续升级 task。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-24 | 00统筹起草；双闸代签 approved；SSE/Tailwind/路由槽位三决策拍板 |
| 2026-07-24 | 30 子 agent 执行 + 00 复检全绿；01_struct.md styles 行修订；invoke 落盘 |
