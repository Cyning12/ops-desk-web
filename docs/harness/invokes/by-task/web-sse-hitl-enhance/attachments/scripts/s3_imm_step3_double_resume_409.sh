#!/bin/bash
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY no_proxy
J=/tmp/tw2_8050.jar
B=http://127.0.0.1:8050
RID2=hitl_5af5514e5a554de2ac96
RUN2=f79785708e7d46029943d1ecc4abfa1b
echo "=== second resume on already-immediate-resumed request ==="
curl -s -w "\nHTTP=%{http_code}\n" -b $J -X POST $B/api/ops/hitl/requests/$RID2/resume | head -c 600
echo
echo "=== RUN2 terminal state (replay tail) ==="
curl -sN -m 30 -b $J -X POST $B/api/ops/lg-rag/replay -H "Content-Type: application/json" -d "{\"run_id\":\"$RUN2\",\"after_seq\":0}" > /tmp/tw2_imm_full.sse
python3 - <<'PYEOF'
import json
frames=[json.loads(l[5:]) for l in open('/tmp/tw2_imm_full.sse') if l.startswith('data:')]
print('IMM_FULL_FRAMES=',len(frames))
for f in frames[-4:]:
    et=f.get('event_type');extra=''
    if et=='done': extra=' status='+repr((f.get('payload') or {}).get('status'))
    print(' seq=',f.get('seq'),'type=',et,extra)
PYEOF
