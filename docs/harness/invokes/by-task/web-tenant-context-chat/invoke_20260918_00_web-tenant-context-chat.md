# Invoke · 00 · web-tenant-context-chat

| 字段 | 值 |
|------|-----|
| **hat** | `00` |
| **task_slug** | `web-tenant-context-chat` |
| **when** | 2026-09-18 |
| **branch** | `task/web-tenant-context-chat`（base: `main` @ `4924002`） |

## GATE_VERIFY（00 首扫）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | approved | Y | Y | Y |
| HG-AUDIT-R1 | approved | approved | Y | Y | Y |
| HG-GRAPH-MODULES | approved | approved | Y | Y | Y |
| HG-STAGE-T-DATA | approved | approved | Y | Y | Y |
| HG-CONTRACT-FREEZE | approved | approved | Y | Y | Y |
| HG-D5-UI-SCOPE | approved | approved | Y | N（定范围） | Y |

结论：**可进入 30**（本窗只委派，不亲自改 `src/`）。

## 编排动作

1. 自 `docs/close-web-specwave-3-0-0` 检出本波 WIP → 迁至 `task/web-tenant-context-chat`；无关 `.codex/`、`post-h-alpha-smoke/` 勿入本波 commit。
2. 委派 **30** 收口 → 再委派 **30 联调重试**。
3. 未获维护者令：**不 commit / 不 push / 不开 PR**。

## 派发

- **已派**：hat `30`（收口）→ 成功；hat `30`（联调重试）→ **PASS**（~17:18）
- **待派**：`40` 可选；**CLOSE** 可议（web 竖切主项已齐；跨租户负样本仍未勾，可后置）
- **未令**：不 commit / 不 push / 不开 PR

## 签收摘要（00 · 含重试）

| 项 | 结论 |
|----|------|
| lint / test(179) / build / graph-compile | PASS |
| W1–W6 | 已勾 |
| Playwright 切换 + 头 | PASS |
| A/B 各一问 lg-rag/stream | **PASS（重试）** · sessions A/B 200 · stream 200 · 头与 UI 一致 |
| API base | 联调 **须 :8001**；Docker **:8000** 勿连 |

### 回报 api / workspace

1. web 竖切本地 **可验**；证据 `invoke_20260918_30_retry_*` + `attachments/20260918_171*_retry_*`。
2. 首棒 B 下 `sessions/latest` 500 **已消失**。
3. **非阻塞**：A/B 曾返回同一 session id——租户会话隔离请 api 核对。
4. **跨租户负样本**未勾（非 web 竖切主阻塞）。
5. 未提交 diff 仍在；待令再 commit。

### 过程补档

- `invoke_*_10_*` / `invoke_*_20_*` · R1 review · `VERIFY: PASS`
- 重试 invoke：`invoke_20260918_30_retry_web-tenant-context-chat.md`
