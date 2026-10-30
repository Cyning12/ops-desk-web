---
name: ops-desk-tech-graph
description: Ops Desk 子项目接入 cyning-harness、生成/维护技术图谱、并在代码变更后检查图谱完整性的标准流程。
triggers:
  - 新增子项目需要接入 harness
  - 新增路由、表、事件类型、LangGraph 节点
  - 修改 chat / auth / sync / issues / pulls / overview 模块
  - 需要检查图谱是否与代码同步
  - 用户提到 "图谱"、"tech graph"、"harness"、"01_struct"、"graph.yaml"
---

# Ops Desk 技术图谱维护流程

## 适用范围

Ops Desk 四仓库：

- `ops-desk-workspace`（总图）
- `ops-desk-api`（后端）
- `ops-desk-web`（前端）
- `ops-desk-ios`（iOS）

## 1. 新子项目首次接入

### 1.1 初始化 harness 骨架

在子项目根目录执行：

```bash
npx @cyning/harness init --preset harness-only --ide cursor,claude,agents --yes
```

### 1.2 创建项目级 settings.json 放开 npx 权限

`.claude/settings.json`：

```json
{
  "permissions": {
    "allow": [
      "Bash(npx @cyning/harness *)"
    ]
  }
}
```

### 1.3 创建/恢复真实图谱内容

物理分层（G-L0/G-L1/G-L2 · Phase γ）须存在：

- `docs/_tech_graph/l0/00_main.graph.yaml` — 顶层总图
- `docs/_tech_graph/l1/01_struct.md` — 模块边界表（**HG-GRAPH-MODULES** 人签真值 · 2026-10-30 词表源归位）
- `docs/_tech_graph/l1/10_flow_*.graph.yaml` — 至少一条主 flow（web 试点：chat）
- `docs/_tech_graph/l2/indexes/` — path/symbol 倒排（chat 试点）
- `docs/_tech_graph/shared/` — `02_version.md` · `99_mermaid_protocol.md` · **`graph.json`（C1）**
- 根 `01_struct.md` 为过渡 stub → 指向 `l1/01_struct.md`；`l1/01_modules.md` 为过渡 stub → 同指
- 操作规程真值：`docs/skills/`（S-L0 / S-L1）

读序见 `docs/_tech_graph/README.md` · `LAYER_README.md`。

### 1.4 配置编译脚本

`scripts/graph-compile.sh`：递归 compile/check 各层 `*.graph.yaml`，并生成 `shared/graph.json`（根目录过渡双写）。

### 1.5 首次编译并校验

```bash
./scripts/graph-compile.sh
```

输出应包含 `OK: 00_main` / `OK: 10_flow_xxx`，且 `freeze_id` 含 `OPS_DESK_WEB`。

### 1.6 人签 HG-GRAPH-MODULES

在 `docs/_tech_graph/l1/01_struct.md` 中填写一级模块表，维护者签核后将 `HG-GRAPH-MODULES` 状态改为 `approved`。

---

## 2. 代码变更后维护图谱

### 2.1 必须同步更新图谱的场景

每次新增/修改以下任意一项，都必须先改 `docs/_tech_graph/**/*.graph.yaml`，再改代码：

- 页面 / 路由 / Pinia store 边界
- REST Endpoint（路径、方法、请求/响应字段）
- SSE 事件类型或 payload（前端消费）
- 模块间调用关系
- 跨仓契约指针（G-L0 POINTERS）

### 2.2 增量维护步骤

1. 改对应层 `.graph.yaml`（唯一人工编辑源）；chat 符号变更同步 `l2/indexes`。
2. 运行 `./scripts/graph-compile.sh` 生成 `.md` + `shared/graph.json`。
3. 确认 check 通过。
4. 提交 yaml + md + graph.json（含根双写副本）。

### 2.3 禁止事项

- ❌ 直接手写生成的 `.md` 文件。
- ❌ 改代码后忘记改图谱。
- ❌ 只改 `.claude/skills` 副本而不回写 `docs/skills/`。
- ❌ 正文用裸「L0/L1/L2」作架构义（须写 G-L\* / S-L\*）。

---

## 3. 图谱完整性检查

### 3.1 手动检查

```bash
./scripts/graph-compile.sh
```

### 3.2 CI 检查（推荐）

`.github/workflows/tech-graph.yml`（本仓若尚未落地 CI，见另棒）：

```yaml
name: tech-graph

on:
  pull_request:
  push:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: actions/setup-node@v5
        with:
          node-version: "24"
      - name: Check tech graph
        run: |
          npm install -g pyaml
          ./scripts/graph-compile.sh
```

### 3.3 自动 Hook 检查（可选）

`.claude/settings.json` 中添加 PostToolUse hook，在 Write/Edit 涉及代码或图谱后自动校验：

```json
{
  "permissions": {
    "allow": ["Bash(npx @cyning/harness *)"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "jq -r '.tool_response.filePath // .tool_input.file_path' | { read -r f; case \"$f\" in app/*|docs/_tech_graph/*|scripts/*) ./scripts/graph-compile.sh ;; esac; } 2>/dev/null || true",
            "timeout": 60
          }
        ]
      }
    ]
  }
}
```

---

## 4. 子项目图谱职责

| 子项目 | 图谱重点 |
|---|---|
| `ops-desk-api` | FastAPI 路由、LangGraph、DB 表、SSE 事件契约 |
| `ops-desk-web` | 页面路由、组件、Pinia store、API client、SSE 事件处理 |
| `ops-desk-ios` | SwiftUI 页面、网络层、SSE 解析 |
| `ops-desk-workspace` | 四仓库关系、数据流、部署拓扑、跨端契约 |

---

## 5. 快速检查清单

在关账每个 task 前确认：

- [ ] 代码改动是否涉及路由/表/事件/节点？
- [ ] 对应的 `.graph.yaml` 是否已更新？
- [ ] `./scripts/graph-compile.sh` 是否通过？
- [ ] `01_struct.md` 模块边界是否需要调整？
- [ ] 是否生成了 invoke 落盘？
