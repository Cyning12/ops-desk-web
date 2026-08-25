# Invoke：10-task · web-dsh-coding-kit-upgrade-1-6-1

> **用途**：10-task 开局快照（把已签收 SPEC §4.1/§6.2–6.3/§7 写成可执行 T2 upgrade task）。  
> **说明**：只写文档；不跑 upgrade；不签发人工闸；执行依赖 T1 GO。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 10-task |
| task_slug | `web-dsh-coding-kit-upgrade-1-6-1` |
| task_paths | `docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md` |
| related_review_or_none | none（draft 待闸；20 可代签） |
| git_branch | `task/web-dsh-coding-kit-1-6-1` |
| worktree_root | `.` |
| created_utc_or_local | 2026-08-25 |
| notes | 00 切分 T2=upgrade；依赖 T1 GO；graph-compile 推荐 KIT_CLI@1.6.1 + npx --yes；wiki_delta=RUNBOOK + coding_wiki |

---

## 帽 10 做了什么

1. 按序读 SPEC（§0 冻结 · §4.1/§4.2 · §6.2–6.4 · §7 · §8）、10-task 要求、本仓 `task_coding_kit_upgrade_1_2_2`、api `task_dsh_coding_kit_upgrade_1_6_1` + FEEDBACK。
2. 起草 active task：`docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md`
   - `required_invoke_hats=10,30` · `test_strategy=required` · `graph_change_layer=none`
   - `wiki_delta=docs/runbooks/RUNBOOK_harness_upgrade_v1_zh.md`（+ coding_wiki 钉版）
   - 人工闸三行全 **pending**；硬依赖 T1 GO
   - 范围/非范围/序列/V-\* 对齐 SPEC；推荐 D-PIN 策略写入范围节
3. 落盘本 10 invoke（本文件）。

## 产出路径

| 产出 | 路径 |
|---|---|
| task | `docs/tasks/active/task_web_dsh_coding_kit_upgrade_1_6_1.md` |
| 10 invoke | `docs/harness/invokes/by-task/web-dsh-coding-kit-upgrade-1-6-1/invoke_20260825_10_web-dsh-coding-kit-upgrade-1-6-1.md` |
| 30 invoke | （待 T1 GO + 00 签闸后由 30 落盘） |
| FEEDBACK（有出入时） | `docs/harness/evidence/FEEDBACK_dsh_coding_kit_1_6_1_from_ops_desk_web_<date>.md` |

## 下一步 · 交 00

1. 代签本 task 三闸（建议 ID：`HG-GRAPH-MODULES` · `HG-TASK-DRAFT` · `HG-AUDIT-R1`）；签 AUDIT 前确认 T1 已 **GO**。
2. 签后交 30：按 SPEC §6.2–6.3 钉版 + upgrade 序列 + §7 V-\*；graph-compile 钉版策略写死 30 invoke。
3. 关账 / commit / PR → main + CI automerge 仍由 00/维护者授权另令（本 10 不执行）。
