#!/bin/bash
unset NO_PROXY no_proxy
J=/tmp/tw2_8050.jar
B=http://127.0.0.1:8050
RUN3=640d68970a564fbb8459d8d40cb1c5f6
sleep 20
curl -sN -m 60 -b $J -X POST $B/api/ops/lg-rag/replay -H "Content-Type: application/json" \
  -d "{\"run_id\":\"$RUN3\",\"after_seq\":6}" > /tmp/tw2_s2_gap.sse
curl -sN -m 60 -b $J -X POST $B/api/ops/lg-rag/replay -H "Content-Type: application/json" \
  -d "{\"run_id\":\"$RUN3\",\"after_seq\":0}" > /tmp/tw2_s2_full.sse
python3 - <<'PYEOF'
import json
def parse(p):
    return [json.loads(l[5:]) for l in open(p) if l.startswith('data:')]
partial=parse('/tmp/tw2_s2_partial.sse')
gap=parse('/tmp/tw2_s2_gap.sse')
full=parse('/tmp/tw2_s2_full.sse')
print('GAP_FRAMES=',len(gap),'seqs=',[f.get('seq') for f in gap])
print('FULL_FRAMES=',len(full),'seqs=',[f.get('seq') for f in full])
seqs=[f.get('seq') for f in full]
print('FULL_CONTIGUOUS=',seqs==list(range(1,len(full)+1)))
print('PARTIAL_EQ_FULL_PREFIX=',[f.get('seq') for f in partial]==seqs[:len(partial)] and all(json.dumps(a.get('payload'),sort_keys=True)==json.dumps(b.get('payload'),sort_keys=True) for a,b in zip(partial,full)))
print('GAP_EQ_FULL_TAIL=',[f.get('seq') for f in gap]==[s for s in seqs if s>6])
for f in full:
    if f.get('event_type')=='done':
        p=f.get('payload') or {}
        print('TERMINAL done seq=',f.get('seq'),'status=',repr(p.get('status')),'latency_ms=',repr(p.get('latency_ms')),'model=',repr(p.get('model')))
PYEOF
