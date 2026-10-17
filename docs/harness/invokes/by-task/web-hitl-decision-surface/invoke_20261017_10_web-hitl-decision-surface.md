# invoke · 10-spec · web-hitl-decision-surface

## 元信息

| 字段 | 值 |
|---|---|
| invoke 日期 | 2026-10-17 |
| hat | `10-spec` |
| task_slug | `web-hitl-decision-surface` |
| 工作目录 | `ops-desk-web/`（本仓根） |
| 委派来源 | 父 session 00 帽（HITL 审批决策面 SPEC 专项落盘 · 承 ops-desk-api Q4 移交裁定） |
| 上游契约 | ops-desk-api `docs/guides/RUNBOOK_hitl_ops_v1_zh.md` + `close_hitl_resume_replay_contract_20261017.md` + `close_hitl_ops_runbook_20261017.md` + `SPEC-chat-history-hitl-ux_v0.md`（freeze + live 实证 2026-10-17 · PR #264） |
| 交付物 | `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md`（v0 draft · 300 行） |
| 人工闸 | HG-SPEC-SIGNOFF=**pending**（未代签 · 待人签） |
| git 操作 | 零（不 commit · 不建分支 · 未推送） |

## Prompt 快照（委派要点）

> 起草「HITL 审批决策面」专项 SPEC 草稿，落入 docs/spec/<slug>/SPEC-<slug>_v0.md 惯例。结构按先例：背景/目标/范围/非范围/验收/failure_paths/R0–R5。核心范围：pending 消费纪律、decide 卡片、resume 后 SSE 追帧、409+Retry-After 重试 UX、FP-1 model 兜底。非范围：不动后端契约、不实现权限模型后端。人工闸全 pending、严禁代签、零 git。落盘本 invoke。完成报父：文件清单+行数+范围/非范围要点+验收条目数+不确定照登点。

## 交付摘要

### 产出文件

| 文件 | 行数 | 说明 |
|---|---|---|
| `docs/spec/web-hitl-decision-surface/SPEC-web-hitl-decision-surface_v0.md` | 300 | v0 draft · 全章节齐备（§1–§10 + Harness 元信息 + 人工闸表 + 修订记录） |

### 范围要点（D1–D4 钉死）

- **D1 pending 消费纪律**：进入即拉 + 动作后刷新存续 + 手动刷新最小 UI + 403/404/501/401 降级纪律钉死 + **无固定间隔轮询**（事件驱动 · `visibilitychange` 可选增量）
- **D2 动作链接管 resume 追帧**（核心增量）：resume 200 消费 `replay.cursor` 自动起追帧 · immediate 例外存续 · 复用 `processFrame` 同一管线 · 终帧 `done{resumed}` 收尾
- **D3 追帧循环 + 409 退避**：末帧非终帧 → 携末帧 cursor 约 2s 再追（有界上限）· replay 409 按 `Retry-After` 退避不弹错误条 · **decide/resume 409 分流修现状假相**（resume 在飞 409 →「恢复进行中」非「已被处理」）
- **D4 FP-1 存续钉死**：`done{resumed}` 无 model 键 → 模型段 v-if 不渲染 · latency 缺键显「—」· 禁伪造

### 非范围要点（十条 ❌）

api 仓零触碰 · SSE freeze 零新事件（帧解析零改 · 错误面可选增键除外）· 端点语义不改 · 权限模型/OA HMAC 面不碰 · WS 推送/轮询定时器排除 · 全局面板/新路由不做 · decide+resume 单端点合并不做 · auto resume 运维化不做 · B1 历史面不动 · 禁伪造 model

### 验收条目

**AC1–AC16 共 16 条**，全部 Vitest 可机断：pending 消费（AC1–3）· 动作链+追帧（AC4–11 · 调用顺序/fake timers 退避/分态分流/清理断言）· 契约与质量门（AC12–16 · FP-1 钉死/SSE 零动 grep/字段族对齐/pnpm 三门/G-L1 图谱）

### failure_paths

FP-H1–FP-H13（cursor 空串回退 · 追帧 409 退避 · 200 部分帧再追 · **resume 在飞 409 修假相** · decide 409 存续 · 404/422/401/403 存续 · FP-1 非 bug · 手动停止清理 · 执行失败兜底 · 503/stranded 不重试 · 未签闸拒开工）

### 不确定照登点（待人裁）

1. **裁定 D-A 偏差照登**：委派 brief 提及「pending 轮询/刷新纪律」，本 SPEC 按已签 SPEC-web-chat-history-hitl-ux 非范围「审批实时推送（WS / 轮询定时器）」裁 S1 事件驱动刷新（零定时器）；若维护者要固定间隔轮询，须在 HG-SPEC-SIGNOFF 签收时显式推翻此条（SPEC §5 D-A 表内已留痕）。
2. **错误面扩展边界**：D-C 裁定 `LgRagSseTransportError` 增可选 `retryAfterSeconds` 字段属「客户端内部面扩展」（不触帧解析/不触契约），30 实现时若评审认为触 freeze 面可降级为固定 2s 硬编（S2 弃选案已留）。
3. **追帧上限参数**：建议 ≤10 次或 ≤120s，具体值留 30 在 task 阶段定稿（SPEC AC7 只钉「有界」语义）。

## 纪律核验

- ✅ 人工闸全 pending：HG-SPEC-SIGNOFF 未签 · 未代签任何人闸
- ✅ 零 git 操作：仅 `git status` 只读核真（未 commit/未建分支/未推送）
- ✅ api 仓只读：仅 `read`/`grep` 取证据 · 零写入
- ✅ 结构按先例：对照 SPEC-web-chat-history-hitl-ux v0 全章节（blockquote 头部/元信息/人闸/§1–§10/修订记录）
- ✅ 现状实证 file:line 锚点全部本帽真读核真（非抄委派 brief）
- ✅ R0–R5 思考轮真实回填 + 控制表 done 状态 + early_stop=no
- ✅ 下一棒 Prompt（20-spec-audit）已内嵌 SPEC §10
