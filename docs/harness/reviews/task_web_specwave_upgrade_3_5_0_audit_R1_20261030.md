# task_web_specwave_upgrade_3_5_0 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_specwave_upgrade_3_5_0.md`  
> **审查帽**：20-task-audit（R1）  
> **日期**：2026-10-30 · **仓**：ops-desk-web · **分支**：`task/specwave-upgrade-3-5-0`（base：`main`）  
> **前置**：3.3.0 wave CLOSE（PR #55 MERGED）  
> **对照**：`docs/tasks/done/task_web_specwave_upgrade_3_3_0.md` · 其 R1 审查文范式  
> **审查性质**：本波双闸（HG-TASK-DRAFT / HG-AUDIT-R1）由 00 **代录 approved**，授权锚 **m00236**（维护者长期授权「授权00签收后续文档」）；升级类 task 走 RUNBOOK §0 精简形态（`invoke_retention_profile: minimal` · `required_invoke_hats: 30`）

---

## 结论

本审查 **PASS**。

**内容维度**：task 结构 / 元信息 / 验收口径与 3.0.2 / 3.3.0 升级先例同构；范围限定过程轨（钉位对齐 + upgrade + 验证 + 文档落盘），非范围明示业务源码零改动、全程本地零 push/PR。内容零阻塞。

**流程维度**：维护者 2026-10-30 指令「更新specwave」直接授权执行；双闸代录已在 task 人工闸表注明授权锚 m00236，本审查文互为留痕。

---

## 1. 独立重跑闸（本审查实跑 · 真实输出）

| 命令 | 实跑结果 | 与预期一致？ |
|------|----------|--------------------|
| `./node_modules/.bin/spec-wave --version` | `3.5.0` | ✓ |
| `npx spec-wave@3.5.0 check --target .` | 包 3.5.0 · manifest 3.5.0 · 已是最新 · exit 0 | ✓ |
| `npx spec-wave@3.5.0 task lint --file …3_5_0.md` | LINT: PASS · W3/W4（draft 期合法豁免） | ✓ |
| `npx spec-wave@3.5.0 verify --task …3_5_0.md`（R1 落盘前） | BLOCKED · missing R<n> review（exit 2）· 预期机检行为 | ✓ |
| `git status --short -- src tests` | 空（业务源码零改动） | ✓ |

## 2. 关键声明逐项核对

### 2.1 钉版一致性（三钉 + lock）

| 钉点 | 实测值 |
|------|--------|
| `package.json#devDependencies.spec-wave` | `3.5.0` ✓ |
| `pnpm-lock.yaml` | `spec-wave@3.5.0`（L1564/3308）✓ |
| `.coding-kit/manifest.json` | version=3.5.0 · from_version=3.3.0 · 五字段 schema ✓ |
| `scripts/graph-compile.sh#KIT_CLI` | `spec-wave@3.5.0`（L15-16 注释同步）✓ |

### 2.2 上游变更核对（MIGRATION.md 真读）

| 版本 | 变更 | 强制动作 | 核对 |
|------|------|----------|------|
| 3.4.0 | review-gates 址B 双址扫描（`findLatestReview` 扩第三址 `docs/audits/task-review/` + `YYYYMMDD_<slug>_r<n>.md` 命名口径）· additive · 址A 逐字不变 | 无 | ✓（本仓审查文均在址A `docs/harness/reviews/` · 零挪零改） |
| 3.5.0 | 图谱先读纪律（条件触发）：profile 声明**可达** `graph_modules_path` 后 `verify --task` 增图谱锚点引用检查 | 无 | ✓（见 §3 G-1：本仓闸实际 dormant · 实证照登） |

### 2.3 upgrade / sync prompts 行为实证

- `npx spec-wave@3.5.0 upgrade --target . --yes`：一把过 · 仅 `.coding-kit/manifest.json` 三行 diff（version / from_version / upgraded_at）· prompts 未自动同步（hint 提示补跑 sync）。
- `sync prompts --target . --yes`：skip 3 · **add 1**（`FRAGMENT_graph_first_read_v1_zh.md` 新图谱先读片段）· conflict 9（全部「本地已改 · 未覆盖」· 含 `FRAGMENT_30_gate_verify_v1_zh.md` 的 `HG-GRAPH-MODULES` 本地行 · grep 复核实测 1 命中保留）· 零 `--force`。
- 包内无 CHANGELOG.md（files 白名单未含）· MIGRATION.md 载两 minor 均「无强制动作项」。

---

## 3. 缺口 / 差异清单

| ID | 级别 | 内容 |
|----|------|------|
| **G-1** | 非阻塞观察 | **3.5.0 图谱锚点闸对本仓 dormant**：profile `graph_modules_path: "l1/01_modules"` 自仓根不可达为目录（实为 `docs/_tech_graph/l1/01_modules.md` 文件 · Phase γ 布局）→ `probeGraphAnchor` 判 `graph_path_unreachable` → 检查步跳过不挡。闸语义符合上游「声明不可达 → inform 跳过」契约；是否调整 profile 使闸生效（需同时处理词表源 `01_struct.md` 为 stub 的问题）属 profile 结构变更 · 本 task 非范围 · 另议。 |
| **N-1** | 非阻塞注记 | `task lint` W3/W4（自检占位 / 无思考轮节）：过程轨 draft 期合法豁免，与先例一致。 |
| **N-2** | 非阻塞注记 | `graph indexes check` 未启用（opt-in · 需另配 `graph-indexes.yaml`）——沿用 3.3.0 裁定「另议」。 |

---

## 4. 签闸记录

| 闸 | 状态 | 记录 |
|----|------|------|
| `HG-TASK-DRAFT` | approved | 00 代录（授权锚 m00236 · 维护者 2026-10-30 指令「更新specwave」） |
| `HG-AUDIT-R1` | approved | 00 代录（授权锚 m00236 · 本审查文互为留痕） |

**R1 结论：PASS**（内容零阻塞 · G-1/N-1/N-2 均非阻塞 · 照登留痕）
