# Invoke：10-task · web-dsh-kit-upgrade-probe-1-6-1

> **用途**：10-task 开局快照（把已签收 SPEC §6.1 探查切成可执行 T1 task）。  
> **说明**：只写文档；不实现 upgrade；不签发人工闸。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-dsh-kit-upgrade-probe-1-6-1` |
| task_paths | `docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md` |
| related_review_or_none | none（draft 待闸；20 可代签） |
| git_branch | `task/web-dsh-coding-kit-1-6-1` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-25 |
| notes | 00 切分 T1=probe；禁改 package/lock/manifest/graph-compile/业务码；产出 GO/STOP 供 T2 |

---

## 帽 10 做了什么

1. 按序读 SPEC（HG-SPEC-SIGNOFF=approved · §0/§6.1）、10-task 要求、本仓/api 升级与 probe 样例、api FEEDBACK。
2. 起草 active task：`docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md`
   - `graph_change_layer=none` · `wiki_delta=n/a` · `required_invoke_hats=10,30` · `test_strategy=required`
   - 人工闸 HG-GRAPH-MODULES / HG-TASK-DRAFT / HG-AUDIT-R1 全 **pending**（交 00 代签）
   - 范围锁定 D-JUMP CLI 探查 + D-BASELINE；失败路径对齐 SPEC §8 探查子集
3. 落盘本 10 invoke（本文件）。

## 产出路径

| 产出 | 路径 |
|---|---|
| task | `docs/tasks/active/task_web_dsh_kit_upgrade_probe_1_6_1.md` |
| 10 invoke | `docs/harness/invokes/by-task/web-dsh-kit-upgrade-probe-1-6-1/invoke_20260825_10_web-dsh-kit-upgrade-probe-1-6-1.md` |
| 30 invoke | （待 00 签闸后由 30 落盘） |

## 下一步 · 交 00

1. 代签本 task 三闸（建议 ID：`HG-GRAPH-MODULES` · `HG-TASK-DRAFT` · `HG-AUDIT-R1`）。
2. 签后交 30 执行探查（help diff + `pnpm test` 基线 + GO/STOP）；**禁止** upgrade。
3. T1 **GO** 后方可开 T2 `web-dsh-coding-kit-upgrade-1-6-1` 的 30；STOP 则 T2 不执行。
