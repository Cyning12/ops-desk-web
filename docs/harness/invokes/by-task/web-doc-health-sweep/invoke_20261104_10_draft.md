# Invoke · 10-task 起草棒 · web-doc-health-sweep（2026-11-04）

## 棒信息

| 字段 | 值 |
|------|-----|
| hat | 10-task |
| task_slug | `web-doc-health-sweep` |
| task 档 | `docs/tasks/active/task_web_doc_health_sweep.md` |
| 触发 | 维护者 invoke 选定 B9 为下一任务（m00538 · ask_user_question） |
| 依据真值 | workspace `docs/tasks/backlog/backlog_20261030_post_stage_w.md` §B9 处置口径（00 已定 2026-10-30） |

## 本棒动作

1. **Wave 1 清账注记**（顺带 · workspace main @ `c31fdbd`）：B1 关账（联调 task 11-03 已归档）· B7 消解（main 同步）· B8 部分覆盖注记。
2. **六条现状锚点亲验**（全部仍 stale）：
   - ① volatile.md「本波 active」≥11 条已 CLOSE 滞留 · 13 处 `active/` 断链指针 · :22「30 实现中」误写；
   - ② done/README Hub 表尾停 2026-10-30 · 缺 6 笔（B9 快照 4 笔 + 今日关账 ux-state-sync / resume-expired-mapping 2 笔）；
   - ③ `_views/done.md:14` `in_progress.md` 断链（文件不存在）；
   - ④ `README.md:17` 页清单缺 5 页（`ls src/views/` 实扫 11 页）；
   - ⑤ `by_path.yaml` 缺 HitlApprovalView.vue / CapabilityCatalogView.vue（grep 空集）；
   - ⑥ CHECKLIST 双指针指 active/（`task_web_lg_rag_sse_t2` 已在 done/ · 双断链）。
3. **task 起草**：范围 ①–⑥ · 非范围 ⑦⑧（随 B8）/ src/ / api 仓 / legacy 33 笔 · AC-1~7 + FP-1~4 · R0–R2 + R3–R5 预留 · early_stop（清单型清理无设计分叉）。
4. **20-R1 审查**（本窗接续）：PASS 零阻塞 + N1（volatile 清空后留空态注记建议）。
5. **PR #90**（#89 因 GitHub 侧 mergeability 卡死关闭重开）：CI 2/2 绿 → squash merge `8d46087`。

## 机跑留痕

- `npx spec-wave task lint --file docs/tasks/active/task_web_doc_health_sweep.md` → **LINT: PASS**（W5 warn-only 过渡）
- `npx spec-wave verify --target . --task …`（签后 30 首跑）→ 逐缺补：R3–R5 槽位点名 → 审查文结论节机读化 + 对象/闸指涉 → VERIFY: PASS

## 交接

三闸 approved（m00649 · 维护者「签收」+「签收，开始」· 00 代录）→ **GO 30**。
