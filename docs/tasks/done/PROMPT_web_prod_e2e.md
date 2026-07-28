# Kickoff Prompt：Web 前端生产环境联调（prod E2E）

> 用法：在 `ops-desk-web` 目录打开新会话（Open Folder = 该仓根），全文粘贴以下 Prompt，并将 `<INVITE_TOKEN>` 替换为生产邀请密钥（见会话消息，勿写入任何文件）。

---

```text
你是 Ops Desk Web 前端的联调执行 Agent。生产环境已上线：https://www.cynaya.cn（API + PG + Nginx + SSL + 真实数据：599 issues / 1440 PRs / overview 指标 / graph 快照）。本任务是对已部署的 Web v1 做生产环境联调验收。

## 纪律

1. 读 `AGENTS.md` 与 `docs/tasks/active/`（当前应有本联调 task 草稿；若无，先按 10-task 起草 `web-prod-e2e` 并找我签闸）
2. 联调发现的任何问题：**不在 master 直改**。前端问题走 `fix/<slug>` 分支 + task/invoke/close 流程；疑似后端问题先记录证据（请求/响应/复现步骤）报告给我，不要直接改后端仓
3. 联调结论落盘 `docs/acceptance/prod-e2e-<date>.md`，每个检查项附证据（截图路径/响应摘要）

## 联调对象与凭证

- 站点：https://www.cynaya.cn（HTTP 应 301 跳 HTTPS）
- 登录：username `admin` + invite token `<INVITE_TOKEN>`（我会单独给你，勿写入文件/git）
- ⚠️ 注意：生产 cookie `Secure` —— 本地 `pnpm dev`（http://localhost:5173）无法持有生产 cookie，**联调以已部署站点为主**；本地 dev 只连本地后端（`ops-desk-api` 的 uvicorn :8000），不要混用

## 检查清单（逐项过，标记 pass/fail + 证据）

### A. 入口与登录
1. `http://www.cynaya.cn/` 301 → `https://www.cynaya.cn/` 登录页渲染正常（无 console 报错、无资源 404）
2. 邀请密钥登录成功 → 跳转主页；刷新后会话保持；登出 → 回登录页且接口 401
3. 错误 token 登录有可见错误提示（非白屏/非无响应）

### B. 数据页（真实数据）
4. Overview：cycle_time（sample ~955）/ throughput / trend 图 / sync / scan 渲染非空且数值合理
5. Issues：total=599，列表渲染、state/label 筛选、分页翻页正常
6. Pulls：total=1440，列表渲染、筛选、分页正常
7. Graph：快照与 module_matrix 渲染正常
8. review_time 当前为 null（源数据全 NULL，已知项）—— 页面应有空态展示而非报错

### C. Chat
9. Chat 页发送「#1 是什么问题？」→ 观察 tool_result 命中 issue 上下文 + answer 流式渲染完整（run.start→thinking→tool_result→answer→done）
10. 发送普通问题（如「1+1等于几」）流式回答正常
11. 刷新页面后 latest session 仍在，历史消息区行为符合 v1 约定

### D. 兼容与边界
12. 直接访问深层路由（如 /issues）刷新不 404（SPA fallback）
13. 静态资源缓存头合理（/assets/ 长缓存）
14. wss://www.cynaya.cn/api/ops/chat/ws 不可达（生产已禁用，属预期）

## 产出

- `docs/acceptance/prod-e2e-<date>.md`：逐项 pass/fail + 证据
- fail 项：各自起 fix task（前端）或缺陷报告（后端，给我）
- 全过后：task close 归档 + 终报

## 首条消息要求

输出：① active task 扫描 ② 联调 task 草稿要点（或已有 task 的执行计划）③ 等我从会话外提供 invite token 后开始。
```

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-25 | 初版（ops-desk-api 会话生成，生产上线后） |
