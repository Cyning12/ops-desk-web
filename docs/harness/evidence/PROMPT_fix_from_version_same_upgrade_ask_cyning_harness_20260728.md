# PROMPT · 修复 from_version 同版 re-upgrade 清空（交 cyning-harness Agent）

> **日期**：2026-07-28  
> **来源**：ops-desk-web dogfood · FEEDBACK [`FEEDBACK_harness_2_22_1_from_ops_desk_web_20260728.md`](./FEEDBACK_harness_2_22_1_from_ops_desk_web_20260728.md)  
> **产品复查**：Agent [harness 复查](cf78c592-6209-40c9-a0d2-ee0373d5664f) · 严重级 **P1**  
> **用法**：Open Folder = **`cyning-harness` 产品仓根**；新会话整段粘贴下方复制区。

---

`````text
你是 cyning-harness 产品仓 Agent。Open Folder = cyning-harness 仓根（勿改 ops-desk-web / ops-desk-api 业务码）。

## 任务

修复 P1：同钉版二次 `upgrade` 把 `manifest.from_version` 写成 `null`。

真值对照：
- docs/harness/evidence 来源（消费者）：ops-desk-web
  FEEDBACK_harness_2_22_1_from_ops_desk_web_20260728.md（若本机有兄弟仓路径则打开；否则以本 Prompt 为准）
- wizard/lib/manifest.sh → write_manifest_upgrade（约 L112–144）
- schema/manifest.v1.schema.json（from_version：init 时为 null）
- test/cli.integration.test.js（现有断言只钉跨版）
- docs/RUNBOOK_upgrade_wiki_delta_v1_zh.md §1.2.1（建议二次同版 upgrade 验 overlay）

## 根因（已定位）

write_manifest_upgrade 默认 from_ver=null；仅当 old_ver != version 才写入旧版字符串。
同版 re-upgrade 时条件失败 → 整文件重写 from_version: null。
这与「null 仅 init」语义冲突，且与 §1.2.1 二次 upgrade 叠加必现。
audit/check/close 当前不读该字段 → 非 P0，但是簿记/未来三路合并 base 污染 → P1。

## 期望行为

1. 跨版 upgrade：from_version = 升级前 version（字符串）
2. 同版 re-upgrade：保留既有 from_version（不得变 null）
3. init / 无旧 manifest：from_version = null

## 必做

1. 先扫产品仓 active task；无则按仓内 harness 纪律起草 task（基础设施 · 00 可代签双闸）+ R1 + invoke。
2. 改 write_manifest_upgrade；补集成测：同版二次 upgrade 后 from_version 不变。
3. CHANGELOG 记 2.22.2（或当前约定下一 patch）· Notes 写明来源 web FEEDBACK U1。
4. 跑相关 test；勿削弱 S2/S5 / close / wiki_delta / pre-30。
5. 非范围：不改业务仓；不借机大改 local.json 策略（U2 仍 P3）；不改 FRAGMENT packages/** 默认（U4b 边界）。

## 验收

- 同版二次 upgrade 后 from_version 仍为非 null 历史值
- 跨版仍正确写入 from_version
- 新测失败能复现旧行为（先红后绿或等价钉死）
- 回报：PR URL · 补丁摘要 · 是否建议消费者再跑 §1.2.1 二次 upgrade

完成后：按产品仓流程 commit / PR（勿 force push main）。
`````

---

## 维护者备注（勿粘贴进 Agent）

- 消费者 web 已手修 `from_version: "2.19.0"`；产品 patch 前勿再同版 upgrade 验收。
- 修复发布后：web 再钉 `@2.22.2`（或实际版）并按 §1.2.1 二次 upgrade 确认。
