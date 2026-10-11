# task_web_specwave_upgrade_3_3_0 审查（R1 · 20-task-audit）

> **审查对象**：`docs/tasks/active/task_web_specwave_upgrade_3_3_0.md`  
> **审查帽**：20-task-audit（R1）  
> **日期**：2026-10-11 · **仓**：ops-desk-web · **分支**：`task/web-specwave-3-3-0`（base：`main`）  
> **前置**：3.0.2 wave CLOSE（PR #50）  
> **对照**：`docs/tasks/done/task_web_specwave_upgrade_3_0_2.md` · 其 R1 审查文范式  
> **审查性质**：**事后（post-hoc）R1**——实现先于本审查存在于未提交工作树（00 直接指令先行 · 同 3.0.2 G-1 形态）

---

## 结论

本审查 **PASS-with-conditions（内容通过 · 流程闸有条件放行）**。

**内容维度**：task 结构 / 元信息 / 验收口径与 3.0.0 / 3.0.2 先例同构；本波核心差异——**graph_delta 非 none**（tech_graph schema 迁移）——经独立复核**全部声明为真**（§2）：73 节点 IB 对象形迁移、obs 双实现节点主从处置、lg_rag 非调用边折叠、`.spec-wave/graph-drift.yaml` 落盘、四图谱闸全绿、`src/`+`tests/` 零改动。**内容零阻塞**。

**流程维度（条件所在）**：30 先于 20-R1 执行（00 本窗直接指令「更新spec-wave到3.3.0，并根据新的规则来固定tech_graph格式」· m00002 等价指令）。本 R1 为事后审计，**不追认**既成实现的 30 授权；`HG-AUDIT-R1` 由维护者于 2026-10-11 本窗签收（「签收」），与本审查文互为留痕。

**图谱语义保真特别说明**：本波唯一拓扑变动（删 `use_thread_id→lg_rag_store` 边）经源码实证（`src/stores/lgRag.ts:42-44` `useThreadId` 为 store 内部态写，未引用 `useLgRagStore`），ast 闸 `missing_bounded_call` 为**真阳性**；修正方向为「修图不修码」，语义以 inbound 边 label 承载，无信息丢失（叙述节 ③ 亦载）。判：修正成立。

---

## 1. 独立重跑闸（本审查实跑 · 真实输出）

| 命令 | 实跑结果 | 与 task 自检一致？ |
|------|----------|--------------------|
| `spec-wave --version` | `3.3.0` | ✓ |
| `check --target .` | 包 3.3.0 · manifest 3.3.0 · 已是最新 | ✓ |
| `task lint --file …3_3_0.md` | LINT: PASS · W4（合法豁免） | ✓ |
| `graph yaml check --all` | OK ×10 | ✓ |
| `graph drift` | PASS · struct_layout=protocol · drifts=0 | ✓ |
| `graph ib check` | PASS · checked_ib=73 · issues=0 | ✓ |
| `graph ast check` | PASS · checked=45 · issues=0 · cross_path=25 | ✓ |
| `git status --short -- src tests` | 空（业务源码零改动） | ✓ |
| `grep HG-GRAPH-MODULES`（FRAGMENT + TEMPLATE） | 各 1 命中（sync conflict 保留本地行） | ✓ |

> `pnpm lint/test/build` 采信 30 自检记录（exit 0 · 后台 job bash-1832 留痕）；本审查未重跑。

---

## 2. 关键声明逐项核对

### 2.1 IB 迁移完整性

| 核对项 | 证据 | 结果 |
|--------|------|------|
| 9 图 implementedBy 全对象形 | `graph yaml check --all` 10/10 OK（数组形会报「须为 object」） | ✓ |
| ib 闸路径全真 | checked_ib=73 · issues=0（含 obs 主实现路径） | ✓ |
| 副实现信息未丢 | obs yaml 两节点含 `# 另有实现:` 注释 · md 叙述节载四 fixture 全路径 | ✓ |
| graph_delta_note 四事项 | 与实改一一对应 | ✓ |

### 2.2 钉版一致性（四钉）

| 钉点 | 实测值 |
|------|--------|
| `package.json#devDependencies.spec-wave` | `3.3.0` ✓ |
| `pnpm-lock.yaml` | spec-wave@3.3.0 ✓ |
| `.coding-kit/manifest.json` | version=3.3.0 · from_version=3.0.2 ✓ |
| `scripts/graph-compile.sh#KIT_CLI` | `spec-wave@3.3.0` ✓ |

### 2.3 闸序与诚实性

- task 人工闸表 HG-AUDIT-R1 初为 `pending` 并注明「待 00 签收」——诚实自陈，未伪造 pre-approval。✓
- `verify --task` 在签收前实跑 BLOCKED 并留痕于自检结论表。✓
- KPI=80 未虚报 100。✓

---

## 3. 缺口 / 差异清单

| ID | 级别 | 内容 |
|----|------|------|
| **G-1** | **流程（material）** | **闸序倒置**（同 3.0.2 G-1 形态）：30 先于 R1 完成。已由 00 于 2026-10-11 签收「签收」闭合；留痕于本审查文与 task 闸表。 |
| **G-2** | 非阻塞注记 | `graph ast check` 为 opt-in 闸、不进默认 verify；本波将其纳入自检但未入 CI 硬门禁（符合上游「勿作硬 CI 闸」指引）。 |
| **G-3** | 非阻塞注记 | `graph indexes check` 未启用（需另配 `.spec-wave/graph-indexes.yaml`）——task 非范围已声明「另议」，合法。 |
| **N-1** | 非阻塞注记 | `task lint` W4（无思考轮节）：过程轨合法豁免，与先例一致。 |

---

## 4. 签闸记录

| 闸 | 状态 | 记录 |
|----|------|------|
| `HG-GRAPH-MODULES` | approved | 不新增/不改一级模块（`l1/01_modules.md` 零 diff）· 维持 |
| `HG-TASK-DRAFT` | approved | 00 本窗授权（m00002 等价）· 维持 |
| `HG-AUDIT-R1` | **approved** | 维护者 2026-10-11 本窗签收「签收」；本 R1 内容零阻塞 · G-1 闸序倒置留痕认可 |

**本审查为 R1 终轮 · 关闭**。30 落地已实证收敛；关账（`task close`）待 PR 合并后执行。
