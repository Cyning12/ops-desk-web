# Invoke：30（含 40）· web-lc-evidence-page

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30（含 40） |
| task_slug | `web-lc-evidence-page` |
| freeze_id | `lc-evidence-http-v1` |
| task_paths | `docs/tasks/active/task_web_lc_evidence_page.md` |
| related_review_or_none | `docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md` |
| git_branch | `task/web-lc-evidence-page` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-16 |
| notes | 00 已签三闸；invoke hats gap 缺 30,40 为 WARN 不挡 30；本帽补齐；禁止 CLOSE / push |

---

## 人工闸扫描（GATE_VERIFY · 首输出）

机械：`npx @cyning/harness@2.24.0 verify --target . --task docs/tasks/active/task_web_lc_evidence_page.md` → **VERIFY: PASS**（exit 0）

| human_gate_id | task表status | 用户/invoke声称 | 一致？ | blocks_30 | 30可开工？ |
|---------------|--------------|-----------------|--------|-----------|------------|
| HG-TASK-DRAFT | approved | approved（00 已签） | Y | N | Y |
| HG-AUDIT-R1 | approved | approved（00 已签） | Y | Y | Y |
| HG-GRAPH-MODULES | approved | approved（00 代签） | Y | Y | Y |

reviews：`docs/harness/reviews/spec_web-lc-evidence-page_audit_R1_20260816.md` 存在且 R1 通过？ **是**

pre-30 invoke：`required ∩ {10,20,00}` = `{10}` 已有 10 invoke。缺 30,40 为 WARN 不挡 `may_start_30`。

结论：**可进入读码/改码**

---

## 可复制 Prompt 快照

````text
你是 ops-desk-web 的 30（含 40 自检）Agent。Open Folder = 本仓根。分支必须保持 task/web-lc-evidence-page。

GATE_VERIFY：读 task 人工闸表；跑 harness verify；首输出 GATE_VERIFY 表。blocks 30 的闸 pending → 零 diff 停。预期三闸 approved。缺 30,40 invoke 是 WARN，本帽必须补齐。

身份：task 边界内实现；40 同上下文自检。禁止 CLOSE。禁止 push。禁止 git add -A。禁止提交 .codex/。

test_strategy=required：先写可失败测试再实现。
- tests/lc-evidence-api.spec.ts：mock http.post；URL /ops/lc-evidence/invoke（不得为 /ops/chat/stream）；timeout ≥120000；{ok:true,data} 拆包含 snippet；ok:false / 网络错误走错误路径
- tests/lc-evidence-store.spec.ts：success 写 result；gate_action=refuse 仍成功态；error 写 error；loading 开合
- 推荐 tests/lc-evidence-view.spec.ts：mount + ElementPlus + Pinia

源码禁止 import useOpsChatSse。不改 ChatView / chat store / useOpsChatSse。不改 http.ts 全局 timeout/外壳。

新文件：src/api/lcEvidence.ts、src/stores/lcEvidence.ts、src/views/LcEvidenceView.vue。
路由 /lc-evidence 无 meta.public；侧栏 LC Evidence。
P0 UI 与 00 冻结点按 task / SPEC 签收注记执行。

图谱只改 l1/01_modules.md pages 行备注；不新增一级模块；graph-compile 后还原时间戳噪声。

40：pnpm lint / test / build 与 graph-compile 必须真跑。回填 task 自检结论。联调 1 问保持未勾（optional / blocked_by api）。

invoke 落盘 invoke_20260816_30_40_web-lc-evidence-page.md（hat_id=30（含 40））。一次或两次 commit。不要 CLOSE，不要 push，不要切分支。
````

---

## 交付摘要

- **GATE_VERIFY**：三闸 approved；VERIFY PASS；invoke gap 30,40 已由本文件补齐
- **验证命令**（40 真跑）：
  - `pnpm lint` → exit **0**
  - `pnpm test` → exit **0**（90 passed）
  - `pnpm build` → exit **0**
  - `./scripts/graph-compile.sh` → exit **0**（`generated_at` / `freeze_id` 时间戳已 `git checkout --` 还原；保留 `01_modules.md` 实质改动）
- **变更路径**：
  - `src/api/lcEvidence.ts`
  - `src/stores/lcEvidence.ts`
  - `src/views/LcEvidenceView.vue`
  - `src/router/index.ts`
  - `src/layouts/AppLayout.vue`
  - `tests/lc-evidence-api.spec.ts`
  - `tests/lc-evidence-store.spec.ts`
  - `tests/lc-evidence-view.spec.ts`
  - `docs/_tech_graph/l1/01_modules.md`
  - `docs/tasks/active/task_web_lc_evidence_page.md`（自检回填；硬验收勾选；联调未勾）
  - `docs/harness/invokes/by-task/web-lc-evidence-page/invoke_20260816_30_40_web-lc-evidence-page.md`
- **未改**：`src/api/http.ts`、`ChatView` / `src/stores/chat.ts` / `src/composables/useOpsChatSse.ts`
- **下一棒**：交还 00；**未执行 task close**

---

## 纪律

| 规则 | 说明 |
|------|------|
| 同帽追问 | **不** 新增 invoke；沿用本节路径 |
| 打回重开 | 新文件或 `_r2` 后缀 |
| 与 reviews 分工 | reviews = 结论；invoke = **当时指令** |
| close 机械闸 | 文件名含 `30_40` 可双计 `required_invoke_hats=10,30,40` |
| 命名 | `invoke_YYYYMMDD_30_40_web-lc-evidence-page.md` |
| commit | 落盘 + task 回填后再 commit；禁止 `git add -A`；禁止 `.codex/` |

---

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-08-16 | 30（含 40）实现 `/lc-evidence` mock 契约页并自检回填 |
