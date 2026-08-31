# Invoke：40-self-check · web-lg-rag-sse-t3

> **用途**：40 自检留痕；web PR 前的最后自动闸。  
> **下一步（人工）**：维护者走 `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` T3 联调（task「依赖与联调」四用例）→ 亲签 HG-JOINT-DEBUG → 方可 merge web PR（**勿 auto-merge**）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-t3` |
| git_branch | `task/web-lg-rag-sse-t3` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31 · 同上下文执行）

| 闸 | 命令 | 退出码 | 结果 |
|---|---|---|---|
| lint | `pnpm lint` | 0 | ✅ |
| test | `pnpm test` | 0 | ✅ 23 files / 137 tests passed（T3 新增 11 例：chat-store +10 · auth-store +1） |
| build | `pnpm build` | 0 | ✅ vue-tsc + vite build |
| graph | `./scripts/graph-compile.sh` | 0 | ✅ OK 00_main / 10_flow_chat（`01_modules.md` 零 diff） |
| verify | `npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_lg_rag_sse_t3.md` | 0 | ✅ VERIFY: PASS |

## 验收勾选口径

- 12 项验收勾 11：机检项全绿（同 id 续问 / run.start 捕获落存 / 刷新恢复提示条 / 新会话清态 / 404·422 清 id 不重发 / 401 清 id 跳登录 / 短码展示（可选项已做）/ 静态守卫 / invoke 页零 diff / lint·test·build·graph 绿 / 图谱+wiki 落盘）。
- 未勾 1 项：**联调（维护者签）**——同 thread 续问有上下文 · 新 thread 隔离 · 超长历史压缩后 SSE 仍 done · 刷新恢复续问；由 HG-JOINT-DEBUG 维护者亲签承载。

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31 |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸） |
| HG-AUDIT-R1 | approved | web 00 代签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| **HG-JOINT-DEBUG** | **pending** | **维护者亲签**（T3 联调四用例）· 未签前 web PR **勿 auto-merge** |

## 联调待办（维护者 · task「依赖与联调」）

1. 起 api（master，#100 已 MERGED；或本地 uvicorn）+ web dev proxy
2. 登录 → Chat 发问 → 追问指代可解（同 thread 有上下文）；DevTools 仅见 `/ops/lg-rag/stream`
3. 新会话按钮 → 新 thread 隔离（不串历史）
4. 刷新/重进 → 提示条「已恢复上次会话上下文」+ 续问带同 thread_id
5. 超长历史压缩后 SSE 仍 `done`
6. 全勾 → 亲签 HG-JOINT-DEBUG → merge web PR → 生产冒烟

## 遗留（非阻塞）

- 历史消息回显无 api GET history 端点（api 另 task）；恢复仅恢复后端上下文（00 定夺）。
- 多 tab 并发写 localStorage 为同值覆盖（failure_paths 已声明允许）。
