# invoke · 50 CLOSE · web-hitl-decision-surface（2026-10-17）

> **帽**：50 CLOSE（00 兼做 · delegate-only 允许 50+CLOSE）
> **授权**：维护者 m00749「合并」（含走 50 CLOSE · 承 m00238「授权00签收后续文档」）
> **对象**：PR #73 MERGED squash `e07e4ac`（2026-10-17 · CI 2/2 绿）

## 一、关账对象与交付核验

| 项 | 实证 |
|---|---|
| PR #73 | feat(web-hitl-decision-surface) · squash `e07e4ac` · base main · 5 commits（10/20 归档 + 30 实现 + 30 invoke + CI 修复 + 40 实证 + TC18 收口） |
| CI | check pass 20s · frontend pass 1m9s（run 39021124386/39021124424 · 合并前最终态） |
| 30 Vitest | 32 files / 283 passed（基线 263 净增 19+TC13 拆分 1 · 零回归）· lint/build 绿 |
| 40 live | TC-L1~L5 全 PASS 零假绿（invoke_20261017_40_live.md + 24 件附件 · api master d3fd056 compose 六 env 组） |
| TC18 收口 | invoke 齐 7 件 · volatile 短注落盘 · 验收回填 · task lint PASS |

## 二、关键结论摘登

- 终帧契约 live 实证：`done{status:resumed, latency_ms:int, 无 model 键}` 逐键对拍（147017ms 徽标逐位 match · 模型段不渲染 · FP-1 钉案存续）
- 409 分流核心修复 live 实证：resume 在飞 409→卡片「恢复进行中」（零「已被处理」假相）· decide 重复 409→「已被处理」
- 沉降窗 147s > 追帧墙钟 120s 超限降级「恢复仍在进行，可稍后手动续看」属 FP-T5 **预期正确行为**（轮询轰炸禁令优先不放大墙钟）
- 追帧上限定稿 ≤10 次/≤120s（双界先到为准）· 追帧=帧管线第四入口零新机制
- TC13(b) diff 面 CI 浅克隆走 skip 留痕路径（本地真跑 · 双绿闭合）

## 三、关账动作

- git mv `docs/tasks/active/task_web_hitl_decision_surface.md` → `docs/tasks/done/`
- 状态行 → done CLOSED（PR #73 / squash e07e4ac / 双轨验收）
- 修订记录追加 v4 CLOSED 行
- `docs/tasks/done/README.md` 登记表 + 归档日志各一行
- 本 invoke 落盘（第 8 件 · 10×2/20×3/30/40/50 全齐）

## 四、质量钉

- `npx spec-wave task lint --file docs/tasks/done/task_web_hitl_decision_surface.md` → PASS
- 本 PR 纯 docs（CLOSE 关账）· 零实现码

## 五、移交与遗留

- **无遗留开账项**：本任务 TC-L2 形态 B（409+Retry-After）live 未命中判 n/a 照登（Vitest TC8 面为准）· 沉降超限降级属预期正确非缺陷
- web 仓 active 残留两件与本任务无关，不在本波范围：`task_web_lg_rag_sse_continue_reply`（PR #67 已并 · 待 CLOSE/迁 done）· `task_web_tenant_context_chat`（NO-GO 30 等数据闸）——维护者未授权顺带关，原样保留
- volatile.md 本任务条目存续（关账后可晋升 context/stable 由维护者定夺）

## 六、交付移交

关账 PR 合并后：本地/远程分支清零 · main 同步 · 本任务全链闭合。
