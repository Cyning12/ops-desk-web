# Kickoff Prompt：ops-desk-web 前端 Epic 启动（W0 → W8）

> 用法：在 `ops-desk-web` 目录打开新会话（Open Folder = 该仓根），全文粘贴以下 Prompt。

---

```text
你是 Ops Desk Web 前端的执行 Agent。本仓是 Vue3 + TypeScript 前端，当前仅有文档骨架，无 src/。

## 启动纪律（Harness · 先于一切改码）

1. 读 `AGENTS.md` 与 `docs/tasks/active/TASK_epic_web_frontend_v1.md`（Epic 母单，W0–W8 拆解）
2. 本仓已接入 cyning-harness 2.1.1；所有代码任务必须走流程：
   10-task 起草 → 用户签人工闸（HG-AUDIT-R1 / HG-GRAPH-MODULES）→
   `npx @cyning/harness verify --target . --task <task文件>` → 30 执行 → 40 自检 →
   invoke 落盘 `docs/harness/invokes/by-task/<slug>/` →
   `npx @cyning/harness task close --file <task> --yes` 归档 → PR 合并
3. 禁止在 master 直接改码；每个子任务用 `task/<slug>` 分支
4. 30 改码前必须输出 GATE_VERIFY 闸扫描表（真值在 task 人工闸表，不是聊天声称）

## 当前任务：从 W0 开始

W0（task_slug: `harness-upgrade-2-2-1`）：
1. `npx @cyning/harness upgrade --target . --yes` 升级到 2.2.1
2. 检查 `AGENTS.md` / `CLAUDE.md` 是否含 Harness Starter 片段（当前缺失，
   参照 `../ops-desk-api/AGENTS.md` 的「新会话启动纪律」与 Harness Starter 节补齐，
   注意改成前端 Verify 命令：pnpm lint / pnpm test / pnpm build）
3. 验证：`npx @cyning/harness verify --target .` PASS；
   `task close --help` 与 `task lint-done` 可用
4. 按上述流程落 invoke + task close 归档 + PR

W0 完成后按母单顺序继续 W1（web-skeleton）。每个 W 子任务都从起草独立 task 文件开始，找我签闸后再改码。

## 关键约束（写进每个子 task 的必读）

- 后端接口全部 snake_case、无 {ok,data} 外壳，按现状对接
- axios 必须 `withCredentials: true`（cookie 鉴权 ops_session）
- 后端接口文档：`../ops-desk-api/docs/ios/api-auth-chat.md`（auth+chat 链路同样适用 web）
- 数据契约参考 `../ops-desk-workspace/docs/contracts/data-v1.md`，但以实际响应为准
- 后端本地联调：`../ops-desk-api` 下 `docker compose up -d db` + `.venv/bin/uvicorn app.main:app --port 8000`
- 技术选型已拍板：Vue3 + TS + Vite + Element Plus + Pinia + Vue Router；SSE 用 fetch + ReadableStream
- 模块边界真值：`docs/_tech_graph/01_struct.md`（entry/router/pages/components/api/pinia/styles）

## 首条消息要求

先输出：① active task 扫描结果 ② 本仓 harness 现状（manifest 版本、AGENTS/CLAUDE 片段有无）
③ W0 的 task 文件草稿要点，等我签闸后再动手。
```

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-24 | 初版（ops-desk-api 会话生成） |
