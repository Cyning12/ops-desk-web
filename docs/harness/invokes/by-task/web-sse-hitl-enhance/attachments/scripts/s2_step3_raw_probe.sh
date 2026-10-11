#!/bin/bash
unset NO_PROXY no_proxy
echo "=== raw gap replay ==="; head -c 500 /tmp/tw2_s2_gap.sse; echo
echo "=== raw full replay ==="; head -c 500 /tmp/tw2_s2_full.sse; echo
echo "=== replay with -i (status line) ==="
curl -sN -i -m 30 -b /tmp/tw2_8050.jar -X POST http://127.0.0.1:8050/api/ops/lg-rag/replay -H "Content-Type: application/json" -d '{"run_id":"640d68970a564fbb8459d8d40cb1c5f6","after_seq":0}' | head -c 600
echo
echo "=== threads list: run status ==="
curl -s -b /tmp/tw2_8050.jar "http://127.0.0.1:8050/api/ops/chat/threads?limit=5" | python3 -m json.tool | head -40
