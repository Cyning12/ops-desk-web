# Invoke：40-self-check · web-lg-rag-sse-t2

> **用途**：40 自检留痕；web PR 前的最后自动闸。  
> **下一步（人工）**：维护者走 `docs/checklists/CHECKLIST_lg_rag_sse_joint_release_v1.md` §1 → 签 HG-JOINT-DEBUG → 与 api 同日发版。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 40 |
| task_slug | `web-lg-rag-sse-t2` |
| git_branch | `task/web-lg-rag-sse-t2` |
| created_utc_or_local | 2026-08-31 |

---

## 自检结果（2026-08-31）

| 闸 | 命令 | 结果 |
|---|---|---|
| lint | `pnpm lint` | ✅ exit 0 |
| test | `pnpm test` | ✅ 23 files / 125 tests passed |
| build | `pnpm build` | ✅（vue-tsc + vite build） |
| graph | `./scripts/graph-compile.sh` | ✅ OK 10_flow_chat |

## 人工闸终态

| 闸 | status | 签署 |
|---|---|---|
| HG-SPEC-SIGNOFF | approved | web 00 · 2026-08-31（维护者令「签收」） |
| HG-TASK-DRAFT | approved | web 00 · 2026-08-31 |
| HG-GRAPH-MODULES | approved | web 00 预签 · 2026-08-31（维护者授权代签文档闸） |
| HG-AUDIT-R1 | approved | web 00 代签 · 2026-08-31（R1 pass-with-notes · 0 阻塞） |
| **HG-JOINT-DEBUG** | **pending** | **维护者亲签**（checklist §1.4 · 联调通过后与 api 同日发版）—— **00 代签授权不覆盖此闸，本波到此停** |

## 联调待办（维护者 · checklist §1）

1. 起 api（`task/lg-rag-sse-stream-updates` 分支或合入后 master）+ web dev
2. 登录 → Chat 发问 → DevTools Network **仅**见 `/ops/lg-rag/stream`（无 `/ops/chat/stream`）
3. 进度帧 / 整段 answer / done 收尾 UI 可见；401 / 422 / 500 表现符合 task failure_paths
4. supervisor 长问（>60s）不误杀（client timeout 300s）
5. 全勾 §1.4 → 允许 merge api PR → merge web PR → 生产冒烟（checklist §6）
6. 勾选记录附本 invoke 后归档 task CLOSE

## 遗留（非阻塞）

- api 仓 2 处旧 task 文件名链接（`task_web_lg_rag_sse_t2_joint` → 已改名 `task_web_lg_rag_sse_t2`）：`05_lg_rag_transport_and_session_plan_v0.md` §10 指针 · `task_lg_rag_sse_stream_updates.md` 依赖表 → api 侧顺手修
