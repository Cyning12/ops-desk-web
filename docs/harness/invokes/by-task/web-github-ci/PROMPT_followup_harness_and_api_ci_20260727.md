# Prompt 复制区 · cyning-harness + ops-desk-api（web 踩坑回灌）

> 顺序：**先**打开 `cyning-harness` 仓跑 Prompt A → 发版/本地可 `npx` 到新版后 → **再**打开 `ops-desk-api` 跑 Prompt B。  
> 来源摩擦：ops-desk-web PR#3 · `tech-graph` job 因 `setup-node` 默认读 `packageManager=pnpm` 失败。

---

## A · cyning-harness（产品仓 · 先跑）

Open Folder：`cyning-harness` 仓根（非 Ops-desk 业务仓）。

`````text
你是 30 执行 Agent（cyning-harness 产品仓 · CI 样例回灌）。

【目标】
- Open Folder = cyning-harness 仓根
- 动机：ops-desk-web 落地 tech-graph GitHub Actions 时踩坑——setup-node@v5 默认 package-manager-cache 会按 package.json 的 packageManager（pnpm）找可执行文件；仅用 npx/@cyning/harness + graph-compile 的 job 未装 pnpm → CI 红。需在产品侧 ci/samples 写明金样，防止兄弟仓再抄错。
- 本棒只做：ci/samples 增补 + README 摩擦说明 +（可选）修 hgm-ingest 同构坑；不改业务 Ops-desk 仓；不强制改 wizard install 默认拷贝清单除非你判断应一并挂上 tech-graph 样例 POINTER。

【开帽 · 缺一 STOP】
- cwd = cyning-harness 仓根
- git status 尽量干净；脏文件先列给人
- 建议分支：task/ci-sample-tech-graph-pnpm-cache 或 fix/ci-samples-tech-graph
- 禁止：改 ops-desk-web / ops-desk-api；在业务仓跑本 Prompt
- 禁止：把强制 pre-commit 写成默认必装

【读序（只读）】
1. ci/samples/README.md · quality.yml.example · hgm-ingest.yml.example · pytest.yml.example
2. wizard/guides/GUIDE_new_project_bootstrap_v1_zh.md 中提及 tech-graph.yml 的段落（若有）
3. CHANGELOG.md 现行版本与样例修订惯例

【交付】
1. 新增 ci/samples/tech-graph.yml.example，要点：
   - name: tech-graph；on: pull_request + push(main 或注释说明按仓裁剪)
   - setup-node@v5：node-version 24（或与现样例一致）
   - 必须写明：package-manager-cache: false
   - 注释块：本 job 只用 npm/npx 跑 harness；若 package.json 声明 packageManager=pnpm，切勿开启 setup-node 的 packageManager 缓存，否则会报 Unable to locate executable file: pnpm
   - setup-python + pip install pyyaml（或与现 graph_yaml_to_json 依赖一致）
   - run: ./scripts/graph-compile.sh（注释：业务仓须自备该脚本；递归分层仓写 shared/graph.json）
2. 修复 ci/samples/hgm-ingest.yml.example：同样加 package-manager-cache: false（它也是 setup-node + npx only）
3. 更新 ci/samples/README.md：
   - 表中登记 tech-graph.yml.example（适用：已接入 docs/_tech_graph + graph-compile.sh）
   - 专节「摩擦 / 坑」：setup-node × packageManager(pnpm) × npx-only job → 必须 package-manager-cache: false；对照 quality.yml（先 pnpm/action-setup 再 cache: pnpm）
   - 嵌入步骤增加 cp … tech-graph.yml 示例（无代码围栏也可用缩进命令）
4. CHANGELOG：记一条（未发版可写 Unreleased）：增 tech-graph CI 样例；修 hgm-ingest pnpm 缓存坑
5. 若仓内有 dogfood checklist / friction 本：按既有格式追加本条（有则写，无则跳过）

【验收】
- tech-graph.yml.example 存在且含 package-manager-cache: false
- hgm-ingest.yml.example 已修
- README 明示摩擦与质量样例对比
- 纪律层 commit；message 建议：
  docs(ci): add tech-graph sample and document pnpm cache pitfall
- 不要 push / 不要发 npm，除非维护者明示；终报写清 from 版本与建议下一发版号

【明确不做】
- 不发 @cyning/harness 正式版（等人审后再 release）
- 不改 Ops-desk 业务仓
- 不把 tech-graph 强绑进 init 默认拷贝（除非现有设计已要求；默认仅 samples + README）
`````

---

## B · ops-desk-api（业务仓 · harness 样例就绪后跑）

Open Folder：`ops-desk-api` 仓根。  
前置：Prompt A 已合入产品仓；若尚未 npm 发版，可用本地 path / 已合入的 `ci/samples/tech-graph.yml.example` 对照抄写。

`````text
你是 30 执行 Agent（业务仓 · ops-desk-api · 补 tech-graph CI）。

【目标】
- Open Folder = /…/ops-desk-api（仓根）
- 动机：web 已补 .github/workflows/ci.yml + tech-graph.yml；api 仅有 pytest.yml，缺图谱门禁。AGENTS 要求 PR 前 ./scripts/graph-compile.sh 绿，须 CI 对齐。
- 对照金样：cyning-harness ci/samples/tech-graph.yml.example（若已合入）；或 ops-desk-web .github/workflows/tech-graph.yml（已修 pnpm 坑）。
- 本棒：补 tech-graph workflow + 核对 pytest 触发分支；可选轻量 upgrade 到与 web 同窗 @cyning/harness（若 manifest 已是 2.16.1 则只做 CI，不强制再 upgrade）。

【开帽 · 缺一 STOP】
- cwd = ops-desk-api 仓根
- git status 尽量干净
- 建议分支：task/api-tech-graph-ci
- 禁止：--ide（避 F1b）；改 web/ios；改 cyning-harness 产品仓（本棒只消费样例）
- 禁止：顺手大改业务 Python / 强装 pre-commit

【读序（只读）】
1. .cyning-harness/manifest.json（确认版本，期望已与 web 对齐 2.16.1）
2. .github/workflows/pytest.yml（触发分支是 master 还是 main？与远程默认分支对齐）
3. scripts/graph-compile.sh · docs/_tech_graph/LAYER_README.md（已 α 分层）
4. 金样：cyning-harness/ci/samples/tech-graph.yml.example 或 ../ops-desk-web/.github/workflows/tech-graph.yml

【A · 核对 / 可选 upgrade】
1. git status -sb && git branch --show-current
2. cat .cyning-harness/manifest.json
3. 若 version < 已发版最新且维护者要求对齐：按本仓 RUNBOOK
   npx @cyning/harness@<目标版> upgrade --target . --yes
   （不要 --ide；只收纪律层）
4. 若已是 2.16.1（或目标版）：跳过 upgrade，只做 CI

【B · 补 CI】
1. 新增 .github/workflows/tech-graph.yml：
   - 与金样一致：setup-node + package-manager-cache: false
   - setup-python + pip install pyyaml
   - ./scripts/graph-compile.sh
   - on: pull_request + push 到本仓默认分支（main 或 master，与真实默认分支一致）
2. 核对 pytest.yml：
   - 若远程默认分支是 main 而 workflow 只写 master：改为与默认分支一致（或 main+master 双写），避免 CI 从不跑
3. 建/回填 task：docs/tasks/active/task_api_tech_graph_ci.md（基础设施；双闸 00 代签）
4. R1：docs/harness/reviews/task_api_tech_graph_ci_audit_R1_<日期>.md（文件名对齐 task stem）
5. invoke：docs/harness/invokes/by-task/api-tech-graph-ci/

【C · 冒烟】
1. ./scripts/graph-compile.sh → exit 0
2. 本地不强制跑全量 pytest（环境缺依赖只报告）；若能跑则记录
3. npx @cyning/harness status --target . --task <task> --check（有 R1 后期望 exit 0）

【D · 落盘】
- git add 仅 workflow + task/invoke/review（+ upgrade 纪律层若发生）
- commit 建议：
  ci: add tech-graph GitHub Actions workflow
- push + 开 PR（本棒默认开 PR，除非人说不要）
- 终报：是否 upgrade · tech-graph 路径 · pytest 分支是否修正 · PR URL

【明确不做】
- 不改 ops-desk-web（已绿）
- 不回灌产品仓（应已由 Prompt A 完成）
- 不做 P3b 看板接线
`````

---

## 使用顺序（维护者）

1. Cursor Open Folder → `cyning-harness` → 粘贴 **Prompt A** → 审 diff →（可选）发 npm 小版本  
2. Cursor Open Folder → `ops-desk-api` → 粘贴 **Prompt B** → 审 CI → 合 PR  
3. web PR#3 可与 api CI PR 并行审；产品样例合入后，web 也可改注释 POINTER 到金样（非必须）
