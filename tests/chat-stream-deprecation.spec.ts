import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * 主路径废弃守卫（task web-lg-rag-sse-t2 · SPEC §0）：
 * 主 Chat（store + view）禁止 import 旧 chat SSE 封装、禁止请求 /ops/chat/stream。
 * 旧封装文件本体与 tests/chat-sse.spec.ts 对照单测保留（T6 再删死代码）。
 */
const GUARDED_SOURCES = ['src/stores/chat.ts', 'src/views/ChatView.vue']

function readSource(rel: string): string {
  return readFileSync(resolve(process.cwd(), rel), 'utf-8')
}

describe('chat stream 主路径废弃守卫', () => {
  for (const rel of GUARDED_SOURCES) {
    it(`${rel}：不 import 旧 chat SSE 封装、不打 /ops/chat/stream`, () => {
      const source = readSource(rel)
      expect(source).not.toContain("from '../composables/useOpsChatSse'")
      expect(source).not.toContain('streamOpsChat(')
      expect(source).not.toContain('/ops/chat/stream')
    })
  }

  it('src/stores/chat.ts：走 lg-rag SSE 封装', () => {
    const source = readSource('src/stores/chat.ts')
    expect(source).toContain("from '../composables/useLgRagSse'")
    expect(source).toContain('streamLgRag(')
  })
})
