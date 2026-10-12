#!/bin/bash
unset NO_PROXY no_proxy
J=/tmp/tw2_8050.jar
B=http://127.0.0.1:8050

echo "=== ledger (resume chain) ==="
grep -aE "approval_consumed|token_issued|token_verified|hitl_persist_guard" /tmp/tw2_api.log | tail -8
echo

echo "=== new run for immediate ==="
curl -sN -m 90 -b $J -X POST $B/api/ops/lg-rag/stream -H "Content-Type: application/json" \
  -d '{"query":"这是一个需要调用工具的任务（就像查询 issue 状态一样）：请调用工具 testing.write.echo 回显一条备注 note=tw2-s3-immediate","mode":"supervisor"}' \
  > /tmp/tw2_s3_imm.sse 2>/dev/null &
CPID=$!
for i in $(seq 1 40); do grep -q "hitl.waiting" /tmp/tw2_s3_imm.sse 2>/dev/null && break; sleep 2; done
kill $CPID 2>/dev/null; wait $CPID 2>/dev/null

python3 - <<'PYEOF'
import json
frames=[json.loads(l[5:]) for l in open('/tmp/tw2_s3_imm.sse') if l.startswith('data:')]
w=[f for f in frames if f.get('event_type')=='hitl.waiting']
if w:
    r=w[-1]['payload']['requests'][0]
    print('RID2='+r['id'])
    print('RUN2='+frames[0].get('run_id',''))
else:
    print('RID2=')
    print('types=',[f.get('event_type') for f in frames])
PYEOF
