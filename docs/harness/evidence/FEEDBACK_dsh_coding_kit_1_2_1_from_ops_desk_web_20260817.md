# FEEDBACK · dsh-coding-kit 1.2.1 · from ops-desk-web（@cyning/harness 迁移实证）

> **日期**：2026-08-17  
> **业务仓**：`ops-desk-web`（Vue3 · preset `harness-only` · WikiTrack 已启用 · pnpm 10.32.1）  
> **git root**：`/Users/cyning/Desktop/Ops-desk/ops-desk-web`  
> **起点**：`@cyning/harness@2.24.0`（纯 npx 用法，无 devDependency）→ 目标钉 `dsh-coding-kit@1.2.1`  
> **执行环境**：DeepSeek Harness（DSH）agent 会话 · 文件沙箱 workspace-write  
> **对照**：产品 `README.md` 迁移节 · `SPEC.md`（1.2.0 freeze）· `package.json` peerDependencies  
> **迁移 task**：`docs/tasks/active/task_migrate_dsh_coding_kit.md`（分支 `task/migrate-dsh-coding-kit`）  
> **执行留痕**：`docs/harness/invokes/by-task/migrate-dsh-coding-kit/invoke_20260817_30_migrate-dsh-coding-kit.md`

---

## 1. 总判

**迁移路径整体成立，一把过；有 1 个 P1 安装缺陷（D1）+ 1 个 P2 文档资产滞后（D2）。**

- `upgrade --yes` 正确读旧 `.cyning-harness/manifest.json` 并钉 `version=1.2.1` / `from_version=2.24.0`；S2 过程域（tasks/reviews/invokes）零触碰 ✅
- `check` / `verify --task` / `gate 表` / `graph yaml compile|check` / `task lint` 等 CLI 语义与 2.24.0 对齐，全部 exit 0 ✅
- `docs/harness/prompts/` 与包内 `assets/harness/prompts/` 逐字一致（唯一 diff = 本仓 overlay `l1/01_modules`，预期）✅
- **但**：pnpm 默认配置下 `pnpm add dsh-coding-kit` **直接失败**（D1）；普通业务仓按 README「换 devDependency」操作会当场卡住。

---

## 2. 缺陷与摩擦

| ID | 现象 | severity | 产品缺陷? | 说明 |
|----|------|----------|-----------|------|
| **D1** | pnpm 默认 `auto-install-peers=true` 时，`pnpm add -D dsh-coding-kit@1.2.1` 报 `@deepseek-ai/dsh-type-meta is not in the npm registry`，安装中止 | **P1** | **是** | 见 §3 根因链。CLI 纯用法根本不需要 peer（只有作为 DSH 插件被宿主加载时才需要，而宿主自带） |
| **D2** | 包内 `assets/ide/adapters/*.example`（AGENTS/CLAUDE/cursor mdc）内文仍写 `npx @cyning/harness verify ...` | **P2** | **是**（迁仓遗漏） | 业务仓指令块只能手改命令字面；`upgrade` 不刷 begin/end 块，无 sync 代劳，旧包名会长期残留在所有迁入仓的指令块里 |
| **D3** | README 迁移节写「钉 `dsh-coding-kit@1.2.0`」，registry latest 已是 `1.2.1` | P3 | 文档漂移 | minor；建议迁移节改用 `@latest` 或随发版刷新 |
| **D4** | 本机 `~/.npm` 属主损坏 → `npx` EACCES；DSH 文件沙箱下 pnpm 回退仓内 `.pnpm-store` | info | **否**（环境） | 与产品无关；记录备查：沙箱内装依赖后，仓外首次 `pnpm install` 会提示一次 store relink |

---

## 3. D1 根因链（产品侧可复现）

```bash
# 任一 pnpm 10 业务仓（默认 auto-install-peers=true）：
pnpm add -D dsh-coding-kit@1.2.1
# → ERR: @deepseek-ai/dsh-type-meta is not in the npm registry
```

依赖链实证（`npm view` · registry.npmjs.org · 2026-08-17）：

```text
dsh-coding-kit@1.2.1
└─ peerDependencies: @deepseek-ai/dsh-tools >=0.0.1-rc.1 <0.2.0
   → pnpm 解析到 dsh-tools@0.1.0-rc.6（区间内最高）
     └─ peerDependencies（9 个）: dsh-agent / dsh-code-runtime / dsh-invariants /
        dsh-llm / dsh-session / dsh-system-prompt / dsh-user-approval /
        dsh-scope 全部 ^0.1.0-rc.6 + cordis ^4.0.1
        → pnpm 递归 auto-install 整棵 DSH 宿主运行时树
        → 树内某环依赖 @deepseek-ai/dsh-type-meta（公开 registry 未发布 / 无权限）→ 安装中止
```

补充观测：`@deepseek-ai/dsh-tools` 公开版本仅 `0.0.1-rc.1/2/3/5` 与 `0.1.0-rc.2/3/6`；其 peer 要求的 `dsh-agent@^0.1.0-rc.6` 等 `0.1.0-rc.x` 系列在公开 registry 上查询不到完整对应面——即 **DSH 宿主运行时树只部分公开发布**，任何把宿主包引进 consumer 依赖图的路径都会踩雷。

### 消费者侧变通（本仓已落地，验证有效）

```bash
pnpm add -D -E dsh-coding-kit@1.2.1 --config.auto-install-peers=false
```

并在仓根落 `.npmrc` 固定（否则 lockfile 记录的 `settings.autoInstallPeers=false` 与后续默认 `pnpm install` 冲突，`--frozen-lockfile` 会拒绝）：

```ini
auto-install-peers=false
```

代价：仓级关闭 peer 自动安装（本仓全部 peer 本就由直接依赖满足，无实际损失；但属全局性设置，非每个仓都能无痛接受）。

---

## 4. 建议回填（产品）

| 优先级 | 动作 |
|--------|------|
| **P1** | `package.json` 增 `peerDependenciesMeta`：`@deepseek-ai/cordis` 与 `@deepseek-ai/dsh-tools` 标 `"optional": true`。这两个 peer 是「DSH 宿主运行时提供」的插件契约，CLI 消费者永远不需要；标 optional 后 pnpm/npm/yarn 默认安装路径全通 |
| **P1** | 集成测试补一例：干净仓 `pnpm add dsh-coding-kit`（默认配置）应成功——当前 README 迁移路径在 pnpm 下必失败 |
| **P2** | 刷新 `assets/ide/adapters/*.example` 内文：`npx @cyning/harness` → `npx dsh-coding-kit`（三个文件同改）；理想情况下 `upgrade` 提供 begin/end 块内容刷新（marker 不变，块内命令字面换代） |
| **P3** | README 迁移节钉版字面随发版刷新（1.2.0 → 1.2.1），或改 `@latest` 表述 |
| P3 | 兜底文档：README 增「pnpm 用户若遇 peer 链安装失败：`auto-install-peers=false`」FAQ（即使 P1 修复也值得留，覆盖 npm@≤6 之外的边角解析器） |

---

## 5. 迁移实证摘要（合规路径确认 ✅）

| 项 | 结果 |
|----|------|
| `upgrade --yes` | `2.24.0 → 1.2.1`；manifest 五字段 schema 保持；`from_version` 正确记旧号 |
| S2 过程域 | `docs/tasks/` / `reviews/` / `invokes/by-task/` **零改动** |
| IDE 块 | `cyning-harness:begin/end` marker 与 `local` 块均未被子程序改写（命令字面为人工刷新，见 D2） |
| `check` | exit 0 ·「已是最新」 |
| `verify --task` | PASS（闸表三 approved 正确识别） |
| `graph yaml compile/check` | 经 `scripts/graph-compile.sh` 全绿；与 2.24.0 输出一致（仅时间戳噪声） |
| 业务三件套 | `pnpm lint` / `test`（90 通过）/ `build` 全绿 |
| `--frozen-lockfile` 复装 | 绿（配 `.npmrc` 后） |
| 鲜活 `npx @cyning/harness` 引用 | 迁移后 grep = 0（残余仅历史 S2 与一次性记录，刻意保留） |

---

## 6. 给消费者（本仓）

| 项 | 动作 |
|----|------|
| `.npmrc` `auto-install-peers=false` | 保留；产品 P1 修复（peer 标 optional）发布后可评估移除并重解 lockfile |
| DSH 插件入口（`dsh plugin add`） | 未启用；CLI 面已满足全部仓级需求，插件为个人 profile 可选增强 |
| 历史文档旧包名 | 不清洗（S2 留痕纪律） |
