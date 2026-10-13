# Invoke：web-hitl-fobs-receipt · 40-verify live 复验（2026-10-13 · docs-only 先行）

| 字段 | 值 |
|------|-----|
| **hat_id** | 40-verify |
| **task** | docs/tasks/active/task_web_hitl_fobs_receipt.md |
| **分支 / HEAD** | task/web-hitl-fobs-receipt @ a38f285（10 落稿）+ 20 R1 审查文（待同 commit） |
| **核验范围** | 委派令工作项 1：S2/S3 live 复验（F-OBS-1 终帧 latency_ms 实值 · F-OBS-2 在飞 replay 409 到达传输面）· 纯观测零改码（30 仍拒 · HG-AUDIT-R1/HG-GRAPH-MODULES pending） |
| **live 环境** | 本机 uvicorn 127.0.0.1:8050（background job）· 本地 PG · api master 码面 · 登录 admin/maintainer（`uv run python scripts/create_initial_user.py` 邀请码 → `POST /api/ops/auth/login` → ops_session cookie jar /tmp/web_fobs.jar） |

## 启动留痕（环境三坑解法全套用 · 复现可读）

api 40 invoke 三坑全中全解：①`OPS_CHAT_TRACER=off`（langfuse 引号炸 port）；②`env -u` 剥九 proxy 变量（NO_PROXY 裸 ::1 炸 httpx）；③`OPS_STRATEGY_EXTRA_CANDIDATE_CAPABILITY_IDS=testing.write.echo` + `OPS_CAPABILITY_ALLOW_WRITE=1` + `OPS_CAPABILITY_ALLOW_WRITE_TAGS=testing` + `OPS_CAPABILITY_EXTRA_MANIFESTS=<abs>oa.readonly.v1.yaml,<abs>testing.v1.yaml`（否则永不触发 HITL）。**新增小坑留痕**：登录路由为 `/api/ops/auth/login`（非 `/api/auth/login` · 首打 404 自查 app/ops/router.py:20 prefix="/api/ops"）。

## F-OBS-2 · 在飞 replay 409（实证 ✅ · TC2 帧面）

S3 run `9967770c52b54fae814805e7f7aef621` 在飞窗（run.start 后 · waiting_approval 前）：

```
HTTP/1.1 409 Conflict
retry-after: 2
{"detail":"Run is still in flight; retry after it settles."}
```

- 挂起（waiting_approval）replay → **200** · 7 帧 · SEQ_CONTIGUOUS=True（挂起=closed 语义零 diff 成立）。
- 孤儿 run `4740a8a06db9467f998fee6c31b32765`（S2 首试 10s 掐断所致 · 见观察项）：replay 持续 **409** ≥13min 数十打 · 在飞 409 行为稳定。
- 证据：attachments/fobs_s3_409.hdr · fobs_s3_409.body · fobs_s3_live.sse · fobs_s3_suspended_replay.sse。

**前端触达面（与 10/20 锚点一致）**：409 落 `src/stores/chat.ts:898-926` replay onError else 分支 → retryable 错误条 + detail 文案 + active-run 保留手动续看 → **裁定 C 成立**（现状已足 · Retry-After 自动退避非范围另立口）。

## F-OBS-1 · approve→resume→终帧 latency_ms 实值（实证 ✅ · TC1 帧面）

RID `hitl_79b98863e5dc4ca19a4e` · RUN `9967770c52b54fae814805e7f7aef621`：

1. decide approved（inherit）→ 200 · request.status=approved · resume.required=true（decide 不自动 resume 契约 ✓）。
2. `POST /hitl/requests/$RID/resume` → **HTTP 200 JSON 应答面（非 SSE · 契约 ✓）**。
3. 全量 replay → 200 · **18 帧 SEQ_CONTIGUOUS=True** · `hitl.resumed` ×1：
   - seq 7 done `{status:'waiting_approval', latency_ms:22244(int), keys:[latency_ms,run_id,status,thread_id]}`
   - **seq 18 done `{status:'resumed', latency_ms:139650(int 实值), keys:[events_persisted,latency_ms,run_id,status,thread_id]} · model 键不存在**（F-OBS-1 双点全中 ✅）
4. 证据：attachments/fobs_s3_decide.json · fobs_s3_resume.out · fobs_s3_full.sse。

**徽标渲染面**：帧面 latency_ms 实值到达传输面已实证；徽标组件渲染实证（store 字面回放 + 可选浏览器实录）归 30 棒（闸后 · TC1/TC3 · R1-NIT-2 建议组件层补「缺键显—」断言）。

## S2 · replay 零丢失（实证 ✅ · 不断线变体）

首试按 T-W2 原谱 10s 掐断 → 孤儿陷阱（见观察项）；改不断线变体（live 全程捕获 → gap/full replay 三方对拍 · 零丢失判据等价）：

run `596f56bf649b40e894e8ef2be1f2aca5` · live 210 帧完整捕获（HTTP 200）：

| 判据 | 结果 |
|------|------|
| full replay（after_seq=0） | 200 · 210 帧 · SEQ_CONTIGUOUS=True |
| gap replay（after_seq=6） | 200 · 204 帧 = tail seqs 7..210 |
| LIVE_EQ_FULL（live 帧 == full replay 逐帧 payload） | **True**（零丢失） |
| GAP_EQ_FULL_TAIL | **True** |
| 终帧 done seq210 | `{latency_ms:147436(int), keys:[latency_ms,run_id,thread_id]}` · 无 status 键 · 无 model 键 |

证据：attachments/fobs_s2b_live.sse · fobs_s2b_gap.sse · fobs_s2b_full.sse（首试孤儿 partial 留档 fobs_s2_partial.sse）。

## 观察项（报回 api · web 侧无动作）

**孤儿 run 在飞标记不沉降**：客户端 10s 掐断后，server 侧续跑片刻（15:08:59–15:09:03 embeddings/chat completions 在日志在案）随后静默 ≥13min，in-flight 标记不清 → replay 恒 409。与 api 40 invoke 孤儿 `22b65ce2` 同形态（该 invoke 已见同款）。契约面行为正确（在飞=409 正是 F-OBS-2），但 run 生命周期「客户端断线→执行体悬挂→标记永不清」属 api 侧观察项，建议挂 hitl_resume_replay_contract 后续或另立 api task。web 侧影响：用户断线后「续看」对该 run 恒得 409 retryable 错误条——裁定 C 的手动续看缓解对**沉降** run 有效，对**孤儿** run 无效（现状文案 detail 已如实传达「retry after it settles」）。

## 三裁定 × live 实证一致性

- **裁定 A（裁 `: 0` 假值兜底）**：三个终帧（22244/139650/147436）latency_ms 全 int 实值必在 · 后端契约钉死 → 假值 0 仅剩 pre-fix 历史旧帧残留面 → 裁撤依据加固 ✅。
- **裁定 B（留 model 兜底零改动）**：resume 终帧 + plain 终帧 model 键全 absent · 后端 FP-1 禁伪造一致 → v-if 缺省不渲染即最如实 ✅。
- **裁定 C（409 现状已足）**：在飞窗/孤儿/挂起三态全观测 · else 分支 retryable+detail 文案触达面属实 · Retry-After 头透传成本（useLgRagSse.ts:225-235 签名改动）维持非范围 ✅。

## R1 NIT 处置

- NIT-1（api master 哈希时序）：本帽机验 api `git -C ../ops-desk-api rev-parse master` = 9ee928c（启动令口径 ✅ · R1 禁 git 未能验 · 此处补验）。
- NIT-2（组件层「缺键显—」断言）：照转 30 棒（已入 task R4 residual 口）。
- NIT-3（菜谱历史 run id 硬编码）：本次复验全用当次实测 RID/RUN（未复用硬编码值）· 已在案。

## 机检与闸态

- 20 R1 审查：**内容 PASS**（零阻塞 · NIT×3 非阻塞 · docs/harness/reviews/task_web_hitl_fobs_receipt_audit_R1_20261013.md）。
- HG-AUDIT-R1 / HG-GRAPH-MODULES：**pending 待维护者签**（签后方可 30 红测先行落地裁定 A）。
- 本 invoke 纯观测 · 零 src/tests 改动 · 零闸代签。

## 修订

| 日期 | 说明 |
|------|------|
| 2026-10-13 | 40 live 复验：F-OBS-1/F-OBS-2 双实证 ✅ · S2 零丢失 ✅ · 孤儿 run 观察项报回 api · 三裁定加固 |
