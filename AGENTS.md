# ops-desk-web · Agent 导航

> **角色**：Ops Desk Kimi Code 的 Vue3 + TypeScript Web 前端。  
> **范围**：页面、组件、路由、状态管理、API 客户端、SSE 消费。  
> **边界**：不实现后端逻辑、数据库、LLM 调用。

---

## 必读（按顺序）

1. **`README.md`** — 本仓说明
2. **`../ops-desk-workspace/docs/01-scope/00-project-brief.md`** — 项目范围与决策
3. **`../ops-desk-workspace/docs/03-frontend-analysis/00-current-state.md`** — 前端现状与重构方向
4. **`../ops-desk-workspace/docs/02-backend-analysis/01-sse-chat-design.md`** — SSE 事件格式与前端示例
5. **`../ops-desk-workspace/docs/05-plan/00-migration-roadmap.md`** — 阶段计划

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
- Chat SSE：使用 `@microsoft/fetch-event-source`
- 样式：水墨风（背景 `#F9F9F7`，文字 `#2C2C2C`）
- 每次新增页面/接口必须同步更新 `docs/_tech_graph/`
