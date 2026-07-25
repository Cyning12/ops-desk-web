# Nginx 静态托管说明（ops-desk-web dist）

> **适用对象**：Epic 8 部署轨  
> **输入产物**：`pnpm build` 输出的 `dist/` 目录  
> **更新日期**：2026-07-25

本文给出一个可直接改用的 Nginx server 块示例，覆盖三个要点：

1. **SPA fallback**：`location /` 指向前端 `dist/`，`try_files $uri /index.html`，保证深链路由（如直接访问 `/issues`）返回应用入口而非 404
2. **`/api/` 反向代理**：转发到后端 `ops-desk-api`（默认 `127.0.0.1:8000`），含 SSE 流式所需的特殊配置
3. **静态资源缓存策略**：带 hash 的 `/assets/` 长缓存，`index.html` no-cache

---

## 完整 server 块示例

```nginx
server {
    listen 80;
    server_name ops-desk.example.com;

    # 前端构建产物（pnpm build 输出）
    root /var/www/ops-desk-web/dist;
    index index.html;

    # gzip：文本类资源压缩（SSE 流不受 gzip 影响，见下方说明）
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1k;

    # 带内容 hash 的构建产物：长缓存 + immutable
    # （文件名形如 assets/index-DKs_DziC.js，内容变则文件名变）
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback：深链路由一律回退到 index.html
    # index.html 必须 no-cache，否则发版后浏览器可能继续用旧入口
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # /api/ 反向代理到后端 ops-desk-api
    location /api/ {
        proxy_pass http://127.0.0.1:8000;

        # HTTP/1.1 + 关闭 buffering：SSE（POST /api/ops/chat/stream）必需，
        # 否则 Nginx 会缓冲整个响应，前端无法逐帧收到流式事件
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_cache off;

        # SSE 长连接读超时（秒）。默认 60s 会导致长回答中途断流，
        # 设为 300s 覆盖绝大多数 chat 会话
        proxy_read_timeout 300s;
        proxy_send_timeout 60s;

        # 透传 Host 与真实客户端 IP
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cookie 说明：浏览器请求默认携带 Cookie，Nginx 默认原样转发，
        # 无需显式 proxy_set_header Cookie。
        # 后端的 ops_session 为 HttpOnly cookie，鉴权依赖「前端页面与 /api
        # 同源」这一前提——即 Nginx 必须在同一 server_name 下同时托管
        # 前端静态资源与 /api/ 反代（本配置即如此）。若前后端拆到不同域名，
        # 需要后端调整 cookie 的 SameSite/Secure 策略并处理 CORS，v1 不推荐。
    }
}
```

---

## 要点说明

### 1. SPA fallback

- 纯静态服务器（如 `python3 -m http.server`）不提供 fallback，直接访问深链（`/issues`、`/pulls`、`/graph`、`/chat`、`/overview`、`/login`）会返回 **404**（已在 dist 产物验证中实测）。这是预期现象，由 Nginx `try_files $uri $uri/ /index.html` 解决。
- `/login` 等路由由 Vue Router（history 模式）在客户端接管。

### 2. `/api/` 反代与 SSE

| 配置 | 原因 |
|---|---|
| `proxy_http_version 1.1` | SSE 流式响应要求 HTTP/1.1；Nginx 默认对上游用 HTTP/1.0 |
| `proxy_buffering off` | 禁用响应缓冲，SSE 事件逐帧直达浏览器；否则 `run.start → thinking → answer → done` 序列会整段卡住直到响应结束 |
| `proxy_read_timeout 300s` | 长回答 / 慢 LLM 场景下避免 60s 默认超时切断流 |
| Cookie 透传 | 默认行为；`ops_session`（HttpOnly）依赖同源部署 |

- 已验证的后端 SSE 端点：`POST /api/ops/chat/stream`（`text/event-stream`）。
- gzip 不影响 SSE：`text/event-stream` 未列入 `gzip_types`，且 `proxy_buffering off` 下 Nginx 不会缓冲压缩。

### 3. 缓存策略

| 资源 | 策略 | 原因 |
|---|---|---|
| `/assets/*`（带 hash 的 JS/CSS） | `expires 1y` + `immutable` | 内容变则文件名变，可安全长缓存 |
| `index.html` | `no-cache` | 入口 HTML 引用具体 hash 文件名，必须每次校验，否则发版不生效 |
| `dist/` 根下其它文件 | 继承 `location /` 的 `no-cache` | 保守默认 |

### 4. 与 `ops_session` cookie 的关系

- 后端登录接口 `POST /api/ops/auth/login` 通过 `Set-Cookie` 下发 `ops_session`（HttpOnly，本地开发 `Secure=false`）。
- 本配置保证页面与 `/api/` 同源，cookie 随每次 API 请求自动携带，无需任何 `proxy_set_header Cookie` 手动透传。
- 生产 HTTPS 部署时，需后端将 cookie `Secure` 置为 `true`（后端配置项，非 Nginx 职责）。

---

## 部署步骤速查

```bash
# 1. 构建
pnpm build                      # 输出 dist/

# 2. 拷贝产物
rsync -av --delete dist/ /var/www/ops-desk-web/dist/

# 3. 放置 Nginx 配置并 reload
sudo nginx -t && sudo systemctl reload nginx
```

## 非范围

- 真实 Nginx 部署、HTTPS 证书、CD 均属于 Epic 8 部署轨，本文仅为配置说明。
