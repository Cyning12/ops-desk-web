# FEEDBACK · harness 2.22.1 · from ops-desk-web（同版 re-upgrade · overlay 复检）

> **日期**：2026-07-28  
> **业务仓**：`ops-desk-web`（Vue3 · preset `harness-only` · WikiTrack **已启用**）  
> **git root**：`/Users/cyning/Desktop/Ops-desk/ops-desk-web`  
> **起点**：manifest `2.19.0` → 目标钉 `@cyning/harness@2.22.1`  
> **对照**：产品 `docs/RUNBOOK_upgrade_wiki_delta_v1_zh.md` §1.2 / §1.2.1 · `wizard/lib/manifest.sh` · CHANGELOG 2.20–2.22.1  
> **产品仓复查 Agent**：[harness 复查](cf78c592-6209-40c9-a0d2-ee0373d5664f)（只读 · 2026-07-28）  
> **本波 PR**：https://github.com/Cyning12/ops-desk-web/pull/15  
> **交产品修复**：见同目录 [`PROMPT_fix_from_version_same_upgrade_ask_cyning_harness_20260728.md`](./PROMPT_fix_from_version_same_upgrade_ask_cyning_harness_20260728.md)

---

## 1. 总判（产品仓 Agent 复查）

**无 P0；有 1 个 P1 产品缺陷（U1）。**  
同版二次 `upgrade` 会把 `manifest.from_version` 清成 `null`——实现疏漏，非「idempotent 设计」。当前 **不**破坏 `audit` / `check` / `close` / `verify`（无一读取该字段），但与 schema 语义（null 仅 init）及 RUNBOOK §1.2.1「建议再跑一次同版 upgrade」直接冲突。

消费者侧：已手修 `from_version: "2.19.0"`；**不必立刻再动**；等产品 patch（建议 2.22.2）后再按 §1.2.1 二次 upgrade。

---

## 2. 升级摩擦

| ID | 现象 | severity | 产品缺陷? | 说明 |
|----|------|----------|-----------|------|
| **U1** | 同钉版二次 `upgrade --yes` 后 `from_version: null`（跨版升级时正确写入旧版） | **P1** | **是** | 根因：`wizard/lib/manifest.sh` `write_manifest_upgrade` 默认 `from_ver=null`，仅当 `old_ver != version` 才写入（约 L118–127）。同版条件失败 → 整文件重写为 null。schema 允许 null，但描述为「**init** 时为 null」。集成测只覆盖跨版（`test/cli.integration.test.js` L84–86）。 |
| **U2** | Cursor Agent sandbox 跑 upgrade 仍写 ephemeral `local.json`（npx 缓存绝对路径） | **P3** | **否**（已知预期） | 本仓 `.gitignore` 已列；收尾改回产品仓根。不阻塞。 |
| **U3** | 按 §1.2.1：先 commit `graph_modules_path` + AGENTS/CLAUDE local，再 upgrade；二次 overlay 相关 diff **空** | info | 合规路径 **否** | 与 2.22.0 U2 声称一致；零手恢复 **PASS**。 |
| **U4a** | 一把 `2.19.0` → `2.22.1` | info | 未文档化破坏：**否** | 跟 RUNBOOK：lint-wiki-delta / 可选 `--strict`；overlay 走 §1.2.1。 |
| **U4b** | FRAGMENT 默认 `packages/**`；本仓业务在 `src/**` | **P3** | **边界** | 记在 AGENTS `cyning-harness-local`；勿改产品 FRAGMENT 期望。 |

---

## 3. U1 复现步骤（产品侧可复用）

```bash
# 业务仓已钉 2.22.1 且 from_version 为非 null 字符串时：
npx --yes @cyning/harness@2.22.1 upgrade --yes --target .
# → manifest.from_version 变为 null（bug）
```

本仓实证：

| 时机 | version | from_version |
|------|---------|--------------|
| 第一次 upgrade（2.19.0→2.22.1） | `2.22.1` | `"2.19.0"` |
| 第二次同版 upgrade（§1.2.1 验收） | `2.22.1` | `null` |
| 消费者手修后 | `2.22.1` | `"2.19.0"` |

---

## 4. overlay / lint 摘要

```text
overlay · FRAGMENT graph_modules_path → l1/01_modules
hint · overlay（v2.22+）… 二次 upgrade 后 overlay 四文件 diff 空

lint-wiki-delta            → PASS · scanned=27 · missing=0
lint-wiki-delta --strict   → PASS · issues=[]
check                      → 已是最新 · 2.22.1
pnpm lint / test / build   → 全绿
```

| 项 | 结果 |
|----|------|
| profile `graph_modules_path` | `l1/01_modules` |
| AGENTS/CLAUDE local 块 | 产品 marker **外**；二次 upgrade 仍在 |
| FRAGMENT | `{l1/01_modules或—}`（非裸 `01_struct`） |
| severity=block（闸） | **无** |

---

## 5. U1 对 audit / check / close

| 消费者 | 是否读 `from_version` | 影响 |
|--------|----------------------|------|
| audit / verify / gate-check / close / lint-wiki-delta | **否** | **无运行时破坏** |
| 人读 / 审计追踪 / 未来三路合并 base | 是（设计意图） | 簿记污染；与 §1.2.1 二次 upgrade 叠加必现 |

结论：同版清空 **不是**「设计成 idempotent 重置」；是「只在版本号变化时记录、同版遗忘保留」的疏漏。

---

## 6. 建议回填（产品）

| 优先级 | 动作 |
|--------|------|
| **P1** | 修 `write_manifest_upgrade`：同版保留既有 `from_version`；跨版设为旧 `version`；仅 init/无历史时 `null` |
| **P1** | `test/cli.integration.test.js` 增同版二次 upgrade 断言（不得变 null） |
| P3 | U2 维持文档 + gitignore；可选 `--no-local-json`（非急） |
| P3 | U4b 可选未来 `profile.code_roots` 占位（非急） |

建议发小 patch：**2.22.2**（或文档+行为同波）。

### 建议 patch 形状（未实施）

`wizard/lib/manifest.sh` `write_manifest_upgrade`：

- `old_ver == version` → 从现有 manifest 解析并 **保留** `from_version`
- `old_ver != version` → `from_version = "$old_ver"`
- 无文件 / init → `null`

---

## 7. 给消费者（本仓）

| 项 | 动作 |
|----|------|
| 立刻再动？ | **否** |
| U1 | 已手修；产品 patch 前 **暂勿**为验收再跑同版 upgrade |
| U2 | 保持 gitignore；勿提交 `local.json` |
| U3 | 合规路径已验证；维持 local + profile |
| 产品 patch 后 | 再按 §1.2.1 二次同版 upgrade，确认 `from_version` 不变且 overlay diff 空 |

---

## 8. 验收清单（本波 web）

- [x] manifest = 2.22.1 · from_version 手修为 `2.19.0`
- [x] profile `graph_modules_path=l1/01_modules`
- [x] AGENTS/CLAUDE 产品块外有 local
- [x] 合规路径二次 upgrade overlay diff 空（验收时曾触发 U1）
- [x] lint / `--strict` / pnpm 三件套 PASS
- [x] 本 FEEDBACK + 产品修复 PROMPT 已落盘
