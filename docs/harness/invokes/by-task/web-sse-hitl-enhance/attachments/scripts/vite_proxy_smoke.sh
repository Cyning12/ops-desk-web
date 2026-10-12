#!/bin/bash
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY no_proxy
cd /Users/cyning/Desktop/Ops-desk/ops-desk-api
TOKEN=$(.venv/bin/python scripts/create_initial_user.py 2>/dev/null | python3 -c "import sys,json;print(json.load(sys.stdin).get('invite_token',''))")
curl -s -c /tmp/tw2_5174.jar -X POST http://127.0.0.1:5174/api/ops/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"invite_token\":\"$TOKEN\"}" | head -c 120; echo
echo "=== SSE via vite proxy with per-line timestamps (12s window) ==="
curl -sN -m 12 -b /tmp/tw2_5174.jar -X POST http://127.0.0.1:5174/api/ops/lg-rag/stream -H "Content-Type: application/json" \
  -d '{"query":"你好，请用一句话回复：T-W2 vite 代理不缓冲验证。","mode":"supervisor"}' 2>/dev/null \
  | while IFS= read -r line; do
      case "$line" in data:*) echo "$(python3 -c 'import time;print(f"{time.time():.3f}")') $line";; esac
    done | head -8 > /tmp/tw2_proxy_ts.log
python3 - <<'PYEOF'
import json
rows=[]
for l in open('/tmp/tw2_proxy_ts.log'):
    ts,_,rest=l.partition(' ')
    if rest.startswith('data:'):
        try:
            f=json.loads(rest[5:])
            rows.append((float(ts),f.get('seq'),f.get('event_type')))
        except Exception: pass
print('PROXIED_FRAMES_IN_12S=',len(rows))
for ts,seq,et in rows: print(f' t={ts:.3f} seq={seq} type={et}')
if len(rows)>=2:
    print('SPREAD_S=%.2f'%(rows[-1][0]-rows[0][0]),'(逐帧到达=不缓冲；一次性齐到=缓冲)')
PYEOF
