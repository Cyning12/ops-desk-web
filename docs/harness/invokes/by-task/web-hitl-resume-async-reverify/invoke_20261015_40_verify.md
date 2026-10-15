# invoke · web-hitl-resume-async-reverify · 40-verify live 复验 · 2026-10-15

> **任务**：[`task_web_hitl_resume_async_reverify`](../../../tasks/active/task_web_hitl_resume_async_reverify.md)（闸全 approved · 40 解锁）
> **角色**：40-verify（纯观测 · 零实现码改动 · 实证须改码即停——未触发）
> **启动令**：[`invoke_20261015_00_dispatch_web_reverify.md`](../hitl-resume-async-handoff/invoke_20261015_00_dispatch_web_reverify.md)（验收六项 1:1 = TC1–TC6）
> **契约真值**：api 30 回执 [`invoke_20261014_30_api_receipt.md`](../hitl-resume-async-handoff/invoke_20261014_30_api_receipt.md)
> **结论**：**TC1–TC7 全 PASS · JC-F1 跨仓闭环 · web 侧零改码成立**

---

## 0. 环境留痕（照 failure_paths 三坑 + 实录新坑）

| 项 | 实录 |
|---|---|
| api | `../ops-desk-api` checkout master=`2a5878c`（uv.lock 留脏不提交不回滚）· `env -u` 剥九 proxy + `OPS_CHAT_TRACER=off` + 六 env 组（enforce / EXTRA_MANIFESTS=oa.readonly+testing 绝对路径 / ALLOW_WRITE=1 / ALLOW_WRITE_TAGS=testing / EXTRA_CANDIDATE=testing.write.echo / HITL_PERSISTENCE=db）· uvicorn 127.0.0.1:8050 |
| vite | `VITE_API_PROXY=http://127.0.0.1:8050` + 钉死 `$HOME/.nvm/versions/node/v24.15.0/bin/pnpm dev --host 127.0.0.1`（5173）· 坑：`pnpm dev -- --host` 双横线吞参致绑 ::1，须单横线直传 |
| 登录 | `/tmp/web_fobs.jar` 已失 → api `scripts/create_initial_user.py` 邀请码 → POST /api/ops/auth/login 重取 jar → 浏览器 `context.addCookies` 注入（先例同法） |
| **新坑（failure_paths 未载）** | postgresql@18 未运行 → `brew services start` 起后被「smart shutdown request」杀掉 → 改 `pg_ctl -D /opt/homebrew/var/postgresql@18 -l /tmp/pg18.log start` 稳定；症状=api auth/me 500（asyncpg 5432 拒连）· 须重启 api 清毒化连接池 |
| Playwright | `~/.agent-tools/pw` 1.64.0 在案但浏览器缓存空 → `npx playwright install chromium-headless-shell`（1248 · Chromium 156） |

## 1. 验收逐项（TC1–TC7 全 PASS）

### TC1 resume<1s 零 ERR_ABORTED —— **PASS**

主链（echo 场景提问 → 卡片 → 批准）：REQUEST_ID=`hitl_0ab88307dfd348c2be87` · RUN_ID=`573c04e619b3415f8e9a9b87484c7746` · THREAD_ID=`571ce220161d430484de2ebeb485b81d`。

- decide **17.93ms** 200 · resume **34.77ms** 200（<1s 判据 · 对照旧证据 jc_tc3v2_network.json **30.1s 掐断**——三个数量级根除）
- Network 全窗 `failedReqs=[]` · **ERR_ABORTED=0**
- 证据：`attachments/rv_tc3v4_main.log` · `attachments/rv_tc3v4_network.json`

### TC2 卡片全程零误回「待审批」 —— **PASS**

- decide 后 **253ms** 卡片转 `hitl-card--decided`「已批准 · 点击续看推进」
- 其后 **45s 采样窗（180 样本 · 覆盖旧 30.1s 掐断时刻）RETURN_TO_WAITING=false**——JC-F1 假相（chat.ts:1113-1116 其他错误→waiting）全程未触发
- pageerror=0 · console.error=0
- 证据：`attachments/rv_tc3v4_hitl_card.png`（待审批态）· `attachments/rv_tc3v4_card_after_resume.png`（decided 态）· `attachments/rv_tc3v4_main.log`

### TC3 replay seq 连续 + 终帧逐键 + 徽标实值 —— **PASS**

沉降后 replay 200 全量（`attachments/rv_tc3v4_replay_full.sse` · 机断 `rv_tc3v4_settle.log`）：

- **18 帧 seq1-18 严格连续**（SEQ_CONTIGUOUS=True）· SETTLED_AFTER_POLL=20
- `hitl.resumed` **恰 1 枚**（seq8）
- 帧序：run.start(1) → node.progress×4(2-5) → hitl.waiting(6) → done{waiting_approval}(7) → hitl.resumed(8) → progress 群 → answer(16) → **done{resumed}(18)**
- 终帧逐键对拍全中：`done{status:"resumed", latency_ms:152757 TYPE=int, keys=[events_persisted,latency_ms,run_id,status,thread_id], 无 model 键}`
- 徽标（刷新 →「上次回答未完成」→ 续看）：`.chat-page__hint` 实渲 **「完成 · 耗时 152757ms」** 与后端终帧**逐位一致**（BADGE_MATCH=true）· 模型段正确缺席 · pageerror/console=0
- 证据：`attachments/rv_tc3v4b_badge.log` · `attachments/rv_tc3v4b_resume_notice.png` · `attachments/rv_tc3v4b_resumed_badge.png`

### TC4 在飞窗两形态 —— **PASS（命中裁定 a：200 部分帧）**

- resume 秒回后 replay 立即打 → **200 部分帧**（9 帧 seq1-9 · lastType=node.progress 无终帧 · `retryAfter=null`）——挂起 run 持 done{waiting_approval} 收尾帧，属维护者裁定 a 既有语义
- 前端零异常展示/零报错；409+Retry-After:2 形态本轮未命中（两形态判据内均合规，防假红照 task 口径）
- 证据：`attachments/rv_tc3v4_main.log`（IN_FLIGHT_REPLAY 段）· `attachments/rv_tc3v4_network.json`

### TC5 弱消费复查 —— **PASS（静态 + live 双闭环）**

- live 响应面顶层键**恰** `{ok,request,resume,replay,ts}` · `resume.status="accepted"`（键={status,thread_id,approved,rejected,decided_by}）· `replay={run_id,cursor:"…:7",events_persisted:0,events_failed:0,persisted:true,re_interrupted:false}`——与 api 回执逐字一致
- 静态：`src/api/hitl.ts:76` `resume: unknown` 零改动 · grep `persisted` 全 src 仅 hitl.ts:67/:69 两字面**无消费分支** · `src/stores/chat.ts:1084-1086` 响应体不消费（仅等成功/抛错）
- 证据：`attachments/rv_tc3v4_main.log`（RESUME_RESP 原文）

### TC6 驳回 + immediate 回归 —— **PASS（双链）**

**驳回 resume 收工链**（`attachments/rv_tc6_reject.log` · `rv_tc6_reject_replay.sse`）：

- REQUEST=`hitl_1f1af47209254d02a313` · RUN=`bac80672f6914abc9ac1acc639eac806`
- decide **7.76ms** 200（status=rejected · resume.required=true）→ resume **24.71ms** 200 `accepted{rejected:[…:1]}` replay.persisted=true
- 卡片 `hitl-card--decided`「**已驳回 · 点击续看推进**」· pageerror/console/failedReqs 全零
- 沉降：15 帧连续 · hitl.resumed 恰 1 · 终帧 `done{waiting_approval, latency_ms:136850 int, 无 model}`——驳回后 supervisor 重规划再 interrupt 收工（api r7 同形态 · task:90 收工口径）

**immediate resume_mode 链**（`attachments/rv_tc6_immediate.log` · `rv_tc6_imm_replay.sse`）：

- REQUEST=`hitl_846859212d044f39a234` · RUN=`a43adf59cb2a4ffe8c8ee3d2caa6e85e`
- 卡片选「批准即续跑」→ decide **6.55ms** 200 `resume.required=false + auto_triggered=true` → **RESUME_CALLED=false**（前端不链第二步 · chat.ts:1084 既有钉案 live 实证）
- 卡片「已批准 · 点击续看推进」· 零错误
- 沉降：18 帧连续 · hitl.resumed 恰 1 · 终帧 `done{resumed, latency_ms:249579 int, 无 model}`

### TC7 质量门 + 回执落盘 —— **PASS**

- `pnpm lint` EXIT=0 · `pnpm test` **31 文件 263 全过零失败**（基线 255 为 2026-10-13 旧值 · f1d88fe/b992e4a 后已增至 263 · 零改动零漂移）· `pnpm build` EXIT=0（钉死 pnpm 路径）
- 10/20/40 invoke 齐（本目录）· 复验结论回执落 `hitl-resume-async-handoff/invoke_20261015_40_web_reverify_receipt.md` · volatile.md 短注 · task 验收回填 · `npx spec-wave task lint` PASS

## 2. JC-F1 闭环判词

旧断链三环——api resume 同步 130–310s → axios 30s 掐断（http.ts:50）→ catch 其他错误→waiting「待审批」假相（chat.ts:1113-1116）——第一环已被 api #252 异步化根除（实测 34.77ms · p95 余量三个数量级），第二环触发前提消失（全窗零 ERR_ABORTED），第三环全程未触发（45s 窗零误回）。**web 前端在 api 异步化后不再误回「待审批」实证成立，零改码预判成立。**

## 3. 附件索引（`attachments/`）

| 文件 | 内容 |
|---|---|
| rv_tc3v4_main.log / rv_tc3v4_network.json | TC1/TC2/TC4/TC5 主链（计时 · ERR_ABORTED 计数 · 响应面原文 · 45s 采样） |
| rv_tc3v4_hitl_card.png / rv_tc3v4_card_after_resume.png / rv_tc3v4_landed.png | TC2 卡片逐态截图 |
| rv_tc3v4_replay_full.sse / rv_tc3v4_settle.log | TC3 沉降全量 18 帧 + seq 连续性/终帧机断 |
| rv_tc3v4b_badge.log / rv_tc3v4b_resume_notice.png / rv_tc3v4b_resumed_badge.png | TC3 徽标「完成 · 耗时 152757ms」逐位对拍 |
| rv_tc6_reject.log / rv_tc6_reject_replay.sse / rv_tc6_reject_settle.log / rv_tc6_reject_card.png / rv_tc6_reject_after.png | TC6 驳回链 |
| rv_tc6_immediate.log / rv_tc6_imm_replay.sse / rv_tc6_imm_settle.log / rv_tc6_immediate_card.png / rv_tc6_immediate_after.png | TC6 immediate 链 |

> 复跑脚本因 ESLint 扫 docs/ 一律放 `/tmp/rv_pw/`（scripts_rv_tc3v4_main.cjs · rv_tc3v4_settle.sh · rv_tc3v4_badge.cjs · rv_tc6.cjs），属一次性验证道具不入仓。
