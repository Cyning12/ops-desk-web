#!/bin/bash
# 40 联调复验 curl 矩阵（web-tenant-context-chat 跨租户负样本）
# api: 127.0.0.1:8050 (uvicorn, OPS_CHAT_TRACER=off, proxy vars stripped)
set -u
B=http://127.0.0.1:8050
J=/tmp/t40.jar
A=/Users/cyning/Desktop/Ops-desk/ops-desk-web/docs/harness/invokes/by-task/web-tenant-context-chat/attachments
unset http_proxy https_proxy all_proxy HTTP_PROXY HTTPS_PROXY ALL_PROXY NO_PROXY no_proxy

echo "=== S0: /me (session tenant) ==="
curl -s -b $J $B/api/ops/auth/me | tee $A/s0_me.json; echo

echo "=== P1: stream tenant A (header=A, session=A) -> expect 200 ==="
curl -sN -m 120 -D $A/p1_stream_A.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: ops-desk-pilot" \
  -d '{"query":"用一句话说明你现在能做什么","mode":"basic"}' -o $A/p1_stream_A.sse -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/|content-type' $A/p1_stream_A.hdr
head -c 400 $A/p1_stream_A.sse; echo

echo "=== SWITCH to B ==="
curl -s -b $J -X POST $B/api/ops/auth/tenant -H "Content-Type: application/json" \
  -d '{"tenant_id":"ops-desk-pilot-b"}' | tee $A/switch_to_B.json; echo
curl -s -b $J $B/api/ops/auth/me | tee $A/s0b_me_after_switch.json; echo

echo "=== P2: stream tenant B (header=B, session=B) -> expect 200 ==="
curl -sN -m 120 -D $A/p2_stream_B.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: ops-desk-pilot-b" \
  -d '{"query":"用一句话说明你现在能做什么","mode":"basic"}' -o $A/p2_stream_B.sse -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/|content-type' $A/p2_stream_B.hdr
head -c 400 $A/p2_stream_B.sse; echo

echo "=== N1a: header=A but session=B -> expect 403 tenant_header_mismatch ==="
curl -s -D $A/n1a_mismatch.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: ops-desk-pilot" \
  -d '{"query":"hi","mode":"basic"}' -o $A/n1a_mismatch.body -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/' $A/n1a_mismatch.hdr; cat $A/n1a_mismatch.body; echo

echo "=== N1b: header=B but session=A (switch back first) -> expect 403 ==="
curl -s -b $J -X POST $B/api/ops/auth/tenant -H "Content-Type: application/json" -d '{"tenant_id":"ops-desk-pilot"}' > $A/switch_back_A.json
curl -s -D $A/n1b_mismatch.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: ops-desk-pilot-b" \
  -d '{"query":"hi","mode":"basic"}' -o $A/n1b_mismatch.body -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/' $A/n1b_mismatch.hdr; cat $A/n1b_mismatch.body; echo

echo "=== N2: unknown tenant header -> expect 422 unknown_tenant ==="
curl -s -D $A/n2_unknown.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: evil-tenant" \
  -d '{"query":"hi","mode":"basic"}' -o $A/n2_unknown.body -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/' $A/n2_unknown.hdr; cat $A/n2_unknown.body; echo

echo "=== N3: NO tenant header, session=A -> expect 200 (F1=C header optional, session fallback) ==="
curl -sN -m 120 -D $A/n3_noheader.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" \
  -d '{"query":"ok","mode":"basic"}' -o $A/n3_noheader.sse -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/' $A/n3_noheader.hdr

echo "=== N4: cross-tenant resource: session=B asks A-owned issue #16 -> expect fail-closed (no title leak) ==="
curl -s -b $J -X POST $B/api/ops/auth/tenant -H "Content-Type: application/json" -d '{"tenant_id":"ops-desk-pilot-b"}' > $A/switch_to_B_again.json
curl -sN -m 300 -D $A/n4_xtenant.hdr -b $J -X POST $B/api/ops/lg-rag/stream \
  -H "Content-Type: application/json" -H "X-Ops-Tenant-Id: ops-desk-pilot-b" \
  -d '{"query":"请用工具查询 issue #16 的标题和状态，原样返回","mode":"supervisor"}' -o $A/n4_xtenant.sse -w "HTTP=%{http_code}\n"
grep -iE 'HTTP/' $A/n4_xtenant.hdr
echo "--- leak check (title fragment must NOT appear) ---"
grep -c "杨总" $A/n4_xtenant.sse || echo "NO_LEAK"
grep -o "issue_not_found\|tenant_scope\|not_found\|找不到\|未找到" $A/n4_xtenant.sse | sort | uniq -c || true

echo "=== restore session to A ==="
curl -s -b $J -X POST $B/api/ops/auth/tenant -H "Content-Type: application/json" -d '{"tenant_id":"ops-desk-pilot"}'
echo
echo "ALL DONE"
