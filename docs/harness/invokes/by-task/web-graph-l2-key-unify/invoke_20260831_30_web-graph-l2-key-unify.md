# Invoke：30-execute · web-graph-l2-key-unify

> **用途**：30 实现留痕（l2 by_symbol 18 裸键 → `path#symbol` 复合键统一 · 纯键形态迁移 · 值零变更 · 无业务码变更）。
> **前置闸**：HG-TASK-DRAFT / HG-GRAPH-MODULES / HG-AUDIT-R1 全 approved（task 表真值 · verify PASS · 2026-08-31）；HG-JOINT-DEBUG n/a（纯图谱波无联调闸）。

---

## 元信息表

| 字段 | 值 |
|------|-----|
| hat_id | 30 |
| task_slug | `web-graph-l2-key-unify` |
| freeze_id | n/a（图谱文档 · schema `inform_graph.v3` 冻结不变） |
| git_branch | `task/web-graph-l2-key-unify` |
| created_utc_or_local | 2026-08-31 |
| review | `docs/harness/reviews/task_web_graph_l2_key_unify_audit_R1_20260831.md`（pass-with-notes · 0 阻塞 · 4 note · N1 http 命中 7 校正 / N4 README 双形态句已收入本波） |

---

## GATE_VERIFY（首输出摘要）

| human_gate_id | task 表 | blocks_30 | 结论 |
|---|---|---|---|
| HG-TASK-DRAFT | approved | N（blocks 22-R1） | — |
| HG-AUDIT-R1 | approved | Y | ✅ 可 30 |
| HG-GRAPH-MODULES | approved | Y | ✅（不新增一级模块 · 01_modules 仅人签记录追加） |
| HG-JOINT-DEBUG | n/a | N | 纯图谱波 |

reviews：R1 审查文存在且 pass-with-notes ✅；pre-30 invoke：`invoke_20260831_10_*` / `invoke_20260831_00_*` 齐全 ✅（required{10,00,30,40} ∩ {10,20,00} = {10,00}）。
`npx dsh-coding-kit verify --target . --task docs/tasks/active/task_web_graph_l2_key_unify.md` → **VERIFY: PASS**（exit 0 · 改码前实测；改码后复跑同 PASS）。

## 30 产出（变更清单 · 严格按 00 定夺表）

| 文件 | 动作 | 说明 |
|---|---|---|
| `docs/_tech_graph/l2/indexes/by_symbol.yaml` | 改 | 18 裸键 → `path#symbol` 复合键（chat 9 键 + lg_rag 9 键 · 含 `http` → `src/api/http.ts#http`）；**值（path/node_id/kind）一律不变**；条目 69=18+51 不变；头注双形态决策段改写为「2026-08-31 P2 统一复合键」+ 历史决策一句留痕 + R1-N1 计数校正（http 命中 flow=**7** 非 9 · chat flow 无 http_client 节点 · obs fixture 驱动无 http 段） |
| `docs/_tech_graph/l2/indexes/by_path.yaml` | 改（仅头注） | 键不动；头注与 by_symbol 对齐（键形态约定句）+ http 计数口径同步校正（「全部 9 个 flow」→「7 个 flow」） |
| `docs/_tech_graph/l2/README.md` | 改 | 键形态约定更新（R1-N4：L5 双形态句改写为复合键单形态） |
| `docs/_tech_graph/l1/01_modules.md` | 改 | 人签记录追加本 task 行（HG-GRAPH-MODULES approved · web 00 预签 · 维护者授权代签文档闸 · 不新增一级模块） |
| `docs/_tech_graph/graph.json` · `shared/graph.json` | compile 再生成 | 双写现状维持（10 graphs / 112 nodes / 120 edges · 时间戳 diff 容忍）· 产物不手改 |
| `docs/coding_wiki/volatile.md` | 改 | 本 task 短注（键统一决策 + 真值指针 SPEC §3 P2） |

## 迁移映射（18 键 · 值全等）

chat 域（10_flow_chat）：`ChatView` → `src/views/ChatView.vue#ChatView`；`useChatStore`/`loadLatestSession`/`sendMessage`/`resumeFromCursor` → `src/stores/chat.ts#<sym>`；`fetchLatestSession` → `src/api/chat.ts#fetchLatestSession`；`streamLgRag`/`replayLgRag`/`LgRagSseFrameParser` → `src/composables/useLgRagSse.ts#<sym>`。
lg_rag 域（10_flow_lg_rag）：`LgRagView` → `src/views/LgRagView.vue#LgRagView`；`useLgRagStore`/`invoke`/`abort`/`useThreadId`/`elapsedSeconds` → `src/stores/lgRag.ts#<sym>`；`invokeLgRag`/`LG_RAG_INVOKE_PATH` → `src/api/lgRag.ts#<sym>`；`http` → `src/api/http.ts#http`（例外条复合键化 · 单条全域命中不重复）。

迁移方式：python3 正则逐键替换（`^  <key>:$` 唯一性断言 n==1 · 18/18 命中 · 无 partial match）。

## 机检断言（R1-N2：命令与输出贴此供 40 复跑）

迁移前 snapshot：`/tmp/premig_values.json`（69 条值 JSON 排序数组）。

```bash
python3 - <<'EOF'
import yaml, json, glob, sys
fail = 0
d = yaml.safe_load(open('docs/_tech_graph/l2/indexes/by_symbol.yaml'))
bs = d['by_symbol']
# ① 零裸键 · 总数 69
bare = [k for k in bs if '#' not in k]
print(f"[CHECK1] total={len(bs)} bare={len(bare)}", "PASS" if (len(bs)==69 and not bare) else "FAIL")
if bare or len(bs)!=69: fail=1
# ② 值集合迁移前后全等
pre = json.load(open('/tmp/premig_values.json'))
post = sorted(json.dumps(v, sort_keys=True) for v in bs.values())
eq = pre == post
print(f"[CHECK2] value-set equal pre==post: {eq}", "PASS" if eq else "FAIL")
if not eq: fail=1
# ③ 撞键=0（键级重复）
keys = list(bs.keys())
dup = len(keys) != len(set(keys))
print(f"[CHECK3] dup-keys={dup} -> key collision=0", "PASS" if not dup else "FAIL")
if dup: fail=1
# ④ indexes ↔ 9 flow implementedBy 唯一 (path,symbol) 对完全相等
flow_pairs = set()
for f in sorted(glob.glob('docs/_tech_graph/l1/10_flow_*.graph.yaml')):
    g = yaml.safe_load(open(f))
    for n in g.get('nodes', []):
        for ib in (n.get('implementedBy') or []):
            flow_pairs.add((ib['path'], ib['symbol']))
idx_pairs = set(tuple(k.split('#', 1)) for k in bs)
only_flow = flow_pairs - idx_pairs
only_idx = idx_pairs - flow_pairs
ok = (not only_flow and not only_idx and len(flow_pairs)==69 and len(idx_pairs)==69)
print(f"[CHECK4] flow_unique={len(flow_pairs)} idx_unique={len(idx_pairs)} only_in_flow={sorted(only_flow)} only_in_index={sorted(only_idx)}", "PASS" if ok else "FAIL")
if not ok: fail=1
sys.exit(fail)
EOF
```

实测输出（exit 0）：

```
[CHECK1] total=69 bare=0 PASS
[CHECK2] value-set equal pre==post: True PASS
[CHECK3] dup-keys=False -> key collision=0 PASS
[CHECK4] flow_unique=69 idx_unique=69 only_in_flow=[] only_in_index=[] PASS
machine-checks exit: 0
```

③注：同名 symbol（load×5 · invoke/abort · setPage/setPageSize · login/logout · default×4）由 `path#` 前缀区分，键级撞键=0（新旧合并全集无重复键）。④与 R1 预演吻合：75 条 implementedBy 去重=69（http 7 flow 复用同节点去重 6 条）。

## 非范围遵守

- `src/**` 零变更（`git diff --stat -- src/` 空输出）；l0 / l1 flow yaml 零内容变更（implementedBy 不动 · .md 为确定性再生成）；`scripts/` 与 CI 未动；双写收敛/CI 强化（P3）未动；api/iOS 仓图谱未动；schema 未动；`.codex/` 未跟踪杂物未 add。
- compile 产物不手改；条目值零变更（CHECK2 全等断言兜底）· 条目零增删（69 不变）。

## Verify（30 改码后 · 全绿）

| 命令 | 退出码 |
|---|---|
| `./scripts/graph-compile.sh` | 0 |
| `pnpm lint` | 0 |
| `pnpm test` | 0（22 files · 153 tests passed） |
| `pnpm build` | 0 |
| `npx dsh-coding-kit verify --target . --task …` | 0（VERIFY: PASS） |
| python3 迁移机检四断言 | 0（CHECK1–4 ALL PASS） |

> 40 自检结论见同目录 `invoke_20260831_40_*` 与 task `### 自检结论` 回填表。
