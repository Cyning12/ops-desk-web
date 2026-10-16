# invoke · web-hitl-resume-async-reverify · 10-task 落稿 · 2026-10-15

> **任务**：[`task_web_hitl_resume_async_reverify`](../../../tasks/active/task_web_hitl_resume_async_reverify.md)（draft · 闸 pending）  
> **角色**：10-task（需求分析 · 零实现码）  
> **启动令**：[`invoke_20261015_00_dispatch_web_reverify.md`](../hitl-resume-async-handoff/invoke_20261015_00_dispatch_web_reverify.md)（api 00 · 维护者 m00383 B 方案裁定链下游）

---

## 1. 落稿要点

- **task_slug**：`web-hitl-resume-async-reverify` · 分支 `task/web-hitl-resume-async-reverify`（base main `028ed29` + handoff 留痕 2 commit `8f55d9f`/`906f8e2`）。
- **性质**：跨仓联调复验 · 纯观测 · **无 30 棒**（预期零改码；实证必须改码即停走新 task 链 · FP-2）。
- **验收映射**：启动令 §三 六项 → TC1–TC6 逐项不增删（1 resume<1s 零 ERR_ABORTED · 2 卡片零误回待审批 · 3 replay seq 连续+终帧逐键+徽标实值 · 4 在飞窗两形态均正确 · 5 弱消费复查 · 6 驳回/immediate 回归）+ TC7 质量门与回执落盘。
- **思考轮**：R0–R5 · early_stop at R5（纯观测机理单一 · 锚点全亲读核真 · 契约真值 api 回执钉死）。

## 2. 核真留痕（10 亲读 · 非转述）

| 锚点 | 核真结论 |
|------|----------|
| api master 含 #252 | `git merge-base --is-ancestor 0e5f6b1 master` 成立 · master=`2a5878c` |
| `src/api/hitl.ts:73-79` | `HitlResumeResponse{ok, request: Record<string,unknown>, resume: unknown, replay, ts}` · resume 弱消费成立 |
| `src/api/hitl.ts:64-71` + grep `persisted` | 全 src 仅 :67/:69 两字面 · **无消费/展示/告警分支**（回执 §「web 侧唯一须复查的一点」静态闭环） |
| `src/stores/chat.ts:1084-1086` | `await resumeHitlRequest(requestId)` 响应体不消费（仅等成功/抛错） |
| `src/stores/chat.ts:1113-1116` | JC-F1 假相落点（其他错误→waiting「待审批」）· 触发前提=axios 30s 掐断已随异步化根除（p95=46.6ms） |
| 联调环境 | api 仓在 `task/hitl-resume-async` [gone] + `uv.lock` 脏（FP-8）· `/tmp/web_fobs.jar` 已失（FP-5）· Playwright `~/.agent-tools/pw` 在案 · S3 菜谱脚本在仓 |
| TC3 原始菜谱 | 已随 joint-check CLOSE 归档删除 · git `a30d705` 可读（`git show a30d705:...invoke_20261013_40_verify.md` §3）· 旧证据 jc_tc3v2_network.json（30.1s 掐断）同 commit attachments |

## 3. 闸与下一步

- HG-TASK-DRAFT **approved**（api 00 启动令 + 维护者 m00383 裁定链）· HG-AUDIT-R1 / HG-GRAPH-MODULES **pending 不代签** → **40 拒开工**。
- 下一棒：20-task-audit R1（对照启动令验收六项 + api 回执响应面核 task）→ 审查文落 `docs/harness/reviews/` → 维护者签闸 → 40 live 复验。
- `npx spec-wave task lint` PASS（EXIT=0 · 零 warning · 落稿实跑）。
