# invoke · web 00 · H α 合入后冒烟

| 项 | 内容 |
|----|------|
| **时间** | 2026-09-17 |
| **帽** | web / workspace 00 |
| **上游** | api PR [#138](https://github.com/Cyning12/ops-desk-api/pull/138) MERGED · deploy-api success |
| **结论** | **PASS**（含生产登录态 Chat） |

## 环境

| 项 | 结果 |
|----|------|
| 本机 `127.0.0.1:8000` | **已启动** · `GET /health` → 200 `{"status":"ok"}` · `POST /api/ops/lg-rag/stream` → 401（鉴权门，非 404） |
| 公网 | `https://www.cynaya.cn` |
| 生产登录态 Chat | **维护者手测无问题**（2026-09-17 · 00 签收） |

## 证据（分层）

| # | 检查 | 结果 |
|---|------|------|
| 1 | 源码主路径常量 | `LG_RAG_STREAM_PATH = '/api/ops/lg-rag/stream'` |
| 2 | Vitest | **179 passed**（含 stream 路径断言） |
| 3 | 生产 API 存活 | `POST /api/ops/lg-rag/stream` → 401（未登录探针） |
| 4 | H α 已部署 | GHA deploy-api run 35213144703 **success** |
| 5 | 生产 Chat 实流 | **维护者执行一次 · 无问题** |
| 6 | 本机 API | health 200 · lg-rag 端点可达 |
| 7 | 业务码 | 冒烟零改 `src/` |

## 判定

**PASS** · 残差已清（生产 Chat）。可继续 H β 实现链。

## 签注

2026-09-17 · 00 代签 · 维护者令开启  
修订：同日 · 维护者确认生产 Chat 无问题 + 本机 API 已启 · 00 回写本 invoke
