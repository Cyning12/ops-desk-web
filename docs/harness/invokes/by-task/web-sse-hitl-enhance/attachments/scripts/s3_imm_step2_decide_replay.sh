#!/bin/bash
unset NO_PROXY no_proxy
J=/tmp/tw2_8050.jar
B=http://127.0.0.1:8050
RID2=hitl_5af5514e5a554de2ac96
RUN2=f79785708e7d46029943d1ecc4abfa1b

echo "=== decide resume_mode=immediate ==="
curl -s -w "\nHTTP=%{http_code}" -b $J -X POST $B/api/ops/hitl/requests/$RID2/decide \
  -H "Content-Type: application/json" \
  -d '{"decision":"approved","resume_mode":"immediate","note":"tw2 s3 immediate"}' > /tmp/tw2_imm_decide.json
python3 - <<'PYEOF'
raw=open('/tmp/tw2_imm_decide.json').read()
body,code=raw.rsplit('HTTP=',1)
import json
d=json.loads(body)
print('HTTP=',code.strip())
print('ok=',d.get('ok'))
print('request.status=',(d.get('request') or {}).get('status'))
print('resume=',json.dumps(d.get('resume'),ensure_ascii=False)[:500])
PYEOF

echo
echo "=== wait for auto-continue then replay RUN2 ==="
sleep 25
curl -sN -m 60 -b $J -X POST $B/api/ops/lg-rag/replay -H "Content-Type: application/json" \
  -d "{\"run_id\":\"$RUN2\",\"after_seq\":0}" > /tmp/tw2_s3_imm_replay.sse
python3 - <<'PYEOF'
import json
frames=[json.loads(l[5:]) for l in open('/tmp/tw2_s3_imm_replay.sse') if l.startswith('data:')]
print('IMM_REPLAY_FRAMES=',len(frames))
for f in frames:
    et=f.get('event_type'); seq=f.get('seq'); extra=''
    if et=='done':
        p=f.get('payload') or {}
        extra=' status='+repr(p.get('status'))
    if et in ('hitl.waiting','hitl.resumed'):
        extra=' <<<'
    print(' seq=',seq,'type=',et,extra)
PYEOF
