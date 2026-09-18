# task_web_specwave_upgrade_2_4_2 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_specwave_upgrade_2_4_2.md`  
> **审查帽**：20-task-audit  
> **日期**：2026-09-18 · **仓**：ops-desk-web · **分支**：`task/web-specwave-2-4-2`  
> **对照**：ops-desk-api `task_specwave_upgrade_2_4_2`（done）+ SpecWave `MIGRATION.md`

---

## 结论

本审查 **PASS**：task 范围与非范围闭合，验收条目均可机验，failure_paths 覆盖 install / upgrade 布局 / sync 定制冲掉 / refresh local 块 / 结论机读闸五类风险。过程轨升级不改 Vue 业务模块边界；裸 SPEC 同波迁夹已写入范围，避免 check WARN 遗留。维护者已以「Implement the plan」授权本波执行，内容审查通过后可签 HG-AUDIT-R1 开工。

实质说明：web 表面小于 api（无 harness_cli 向量、无 pytest kit mock），将 api 三波经验合成单 task 合理；目标钉 2.4.2 对齐 api 当前态，3.0.0 明确划入非范围（Wave B），风险分层清晰。

---

## 审查核对

### 1. 起点与目标实证

| 项 | 结果 |
|----|------|
| `package.json` `"dsh-coding-kit": "1.10.0"` | ✓ |
| `.cyning-harness/manifest.json` version=1.10.0 · from_version=1.6.1 | ✓（仍 legacy 根；upgrade 应写 `.coding-kit/`） |
| 目标 `spec-wave@2.4.2` 与 api 对齐 | ✓ |
| 安装终点禁再钉 dsh-coding-kit | ✓ 与上游 MIGRATION 一致 |

### 2. 范围完备性

| 块 | 评价 |
|----|------|
| A 依赖+upgrade | ✓ 顺序正确；不删 legacy |
| B refresh/sync | ✓ 含 local 块零改写、HG-GRAPH-MODULES 手合、README 手合先例 |
| C D-PIN + 活字面 | ✓ graph-compile / AGENTS / CLAUDE / mdc / runbook / coding_wiki / template |
| D host/skills | ✓ 推荐步 |
| E 裸 SPEC 同波迁夹 | ✓ 消除 api cleanup 类债 |
| 非范围 Wave B / 历史档 | ✓ |

### 3. 验收可机验性

验收 12 条均可用 `grep` / `--version` / exit code 断言；无「全仓清零 dsh-coding-kit」过宽表述（仅锚定活面路径），避免 B-1 类不可达成。

### 4. 闸与 2.4.x 口径

本审查文以「结论」起首节承载通过词与实质说明（远超 N=20 内容量），无「不…通过」否定共现，可作为本 task 自验的合规样本。

### 5. 非阻塞注记

- N-1：执行前须先 commit task+R1，再跑 `refresh-ide-blocks --yes`（脏树 preflight）。
- N-2：`sync prompts` 后务必 diff `FRAGMENT_30` / `TEMPLATE_30` / `30-execute-code` 保留 HG-GRAPH-MODULES。
- N-3：Wave B（3.0.0）另开 task；本波验收不以 3.0.0 为完成态。

---

## 签闸建议

| 闸 | 建议 |
|----|------|
| HG-TASK-DRAFT | approved（维护者 Implement 授权） |
| HG-AUDIT-R1 | approved（本 R1 PASS） |
| HG-GRAPH-MODULES | approved（过程轨 · 不改模块边界） |
