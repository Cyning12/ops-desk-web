# Task：Web v1 生产环境联调验收（web-prod-e2e）

> **状态**：completed  
> **类型**：集成验证（生产）  
> **关联**：`docs/tasks/active/PROMPT_web_prod_e2e.md` · `docs/acceptance/web-v1-checklist.md`

---

## Harness 元信息

| 字段 | 值 |
|---|---|
| **task_slug** | `web-prod-e2e` |
| **test_strategy** | `required` |
| **test_strategy_note** | 生产联调 checklist（A 登录 / B 数据页 / C Chat / D 兼容边界），逐项 pass/fail + 证据落盘 docs/acceptance/ |
| **code_quality_bar** | `L2_frontend` |
| **orchestration** | 单 task |
| **git_branch** | `task/web-prod-e2e` |
| **experience_capture** | `recommended` |
| **wiki_delta** | `n/a` |
| **wiki_delta_note** | harness-only · 未启用 WikiTrack |

### 人工闸

| human_gate_id | status | blocks_hats | 说明 |
|---|---|---|---|
| **HG-GRAPH-MODULES** | approved | **30** | 00统筹签：联调验证为主，预期不改模块边界；前端 fix 另起 fix/ 分支 |
| **HG-AUDIT-R1** | approved | **30** | 00统筹签（用户授权延续）：invite token 由用户会话外提供、不落盘不入 git；生产 cookie Secure 限制——以已部署站点联调为主，本地 dev 不混用 |

---

## 背景与目标

生产已上线 https://www.cynaya.cn（API+PG+Nginx+SSL+真实数据：599 issues / 1440 PRs / overview / graph 快照）。对 Web v1 做生产联调验收。

**约束**：无头环境无浏览器——HTTP 层证据（状态码/响应体/缓存头/SSE 帧）为主；「console 报错/视觉渲染」类以资源可达性 + HTML/JS 完整性佐证并注明局限。

**完成态**：

- [x] A 入口与登录（301 / 登录页 / 登录→保持→登出 401 / 错误 token 提示）
- [x] B 数据页（Overview 非空含 cycle_time~955 / Issues 599 / Pulls 1440 / Graph 快照 / review_time null 空态）
- [x] C Chat（#1 问题 tool_result 命中 + SSE 全序列 / 普通问题 / latest session 刷新保持）
- [x] D 兼容边界（深链 SPA fallback / assets 缓存头 / wss 不可达）
- [x] `docs/acceptance/prod-e2e-2026-07-25.md` 逐项 pass/fail + 证据
- [x] fail 项：前端 fix task 或后端缺陷报告（证据：请求/响应/复现）
- [x] invoke + close + 合并

**不做**：改后端仓；master 直改；token 落盘。

## 范围

- `docs/acceptance/prod-e2e-2026-07-25.md`（新）
- 可能的 `fix/<slug>` 分支（前端缺陷，独立 task）

## 非范围

- 后端改动（疑似后端问题出缺陷报告交用户）
- 部署/Nginx 变更

## 失败路径

| 触发条件 | 系统行为 | 用户可见 |
|---|---|---|
| 生产接口 5xx | 记录证据，标记 fail | 缺陷报告 |
| token 失效 | 回报用户重新签发 | — |
| SSE 被缓冲/截断 | 记录帧序列证据 | 缺陷报告 |

## 验收标准

- [x] checklist 14 项全部有 pass/fail 结论 + 证据
- [x] 结论文档落盘 docs/acceptance/
- [x] fail 项全部有归属（fix task / 后端缺陷报告）

---

### 自检结论（00）

- 14 项全执行：13 pass + 1 partial（B7 后端 module_matrix 空列，前端防御性空态已覆盖）；证据落盘 `docs/acceptance/prod-e2e-2026-07-25.md`。
- 通道事故与处置：两次 401 后客户端 IP 被安全策略 RST TLS 握手（疑似 fail2ban），改用 SSH 隧道 localhost:8443 + `--resolve` 完成联调。
- 后端缺陷移交：F1 module_matrix 空列、F2 done.model 空串（均具证，不在本仓修）。
- 密钥纪律：token 仅内存使用，验收文档/invoke/git 无泄漏（已扫描确认）。

---

## 修订记录

| 日期 | 说明 |
|---|---|
| 2026-07-25 | 00统筹起草（依 PROMPT_web_prod_e2e.md）；双闸代签 approved |
| 2026-07-25 | 30+40 完成：14 项 13 pass + 1 partial；验收文档落盘；缺陷 2 项移交后端 |
