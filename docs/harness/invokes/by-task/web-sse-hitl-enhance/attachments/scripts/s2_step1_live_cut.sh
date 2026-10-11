#!/bin/bash
unset NO_PROXY no_proxy
J=/tmp/tw2_8050.jar
B=http://127.0.0.1:8050

echo "=== plain run, cut at ~10s ==="
curl -sN -m 10 -b $J -X POST $B/api/ops/lg-rag/stream -H "Content-Type: application/json" \
  -d '{"query":"你好，请用一句话回复：T-W2 S2 断线续看验收 smoke。","mode":"supervisor"}' \
  > /tmp/tw2_s2_partial.sse 2>/dev/null
python3 - <<'PYEOF'
import json
frames=[json.loads(l[5:]) for l in open('/tmp/tw2_s2_partial.sse') if l.startswith('data:')]
print('PARTIAL_FRAMES=',len(frames))
for f in frames: print(' seq=',f.get('seq'),'type=',f.get('event_type'))
if frames:
    print('RUN3='+frames[0].get('run_id',''))
    print('LASTSEQ='+str(frames[-1].get('seq')))
PYEOF
