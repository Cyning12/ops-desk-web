import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * chat stream 死代码守卫（task web-lg-rag-sse-t6 · R1-N2 口径）：
 * ① 旧 chat SSE 封装 `useOpsChatSse.ts` 与其对照单测 `chat-sse.spec.ts` 文件缺席（T6 已删死代码）；
 * ② src 全树（含注释）无 chat stream 端点字面量、无旧封装符号引用——历史注记一律不带路径字面量，
 *    与联调断言 `grep -rn 端点字面量 dist/` 同口径（零误伤）；
 * ③ 主 Chat 传输主线 = lg-rag SSE（正向断言，防回退）。
 * 背景：api 侧 chat stream 已 410 Gone（api T6 · PR #108）；切流史见 docs/tasks/done/task_web_lg_rag_sse_t2.md。
 */
const CHAT_STREAM_LITERAL = '/ops/chat/stream'
const SRC_ROOT = resolve(process.cwd(), 'src')

/** 递归收集 src 全树文件（守卫须覆盖未来新增文件，不钉文件清单） */
function listSourceFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...listSourceFiles(full))
    else out.push(full)
  }
  return out
}

describe('chat stream 死代码守卫（T6 · 文件缺席 + 全树字面量缺席）', () => {
  it('旧 chat SSE 封装与对照单测文件缺席', () => {
    expect(existsSync(resolve(process.cwd(), 'src/composables/useOpsChatSse.ts'))).toBe(false)
    expect(existsSync(resolve(process.cwd(), 'tests/chat-sse.spec.ts'))).toBe(false)
  })

  it('src 全树无 chat stream 字面量 / 旧封装符号引用', () => {
    const files = listSourceFiles(SRC_ROOT)
    expect(files.length).toBeGreaterThan(0)
    for (const file of files) {
      const rel = relative(process.cwd(), file)
      const source = readFileSync(file, 'utf-8')
      expect(source, rel).not.toContain(CHAT_STREAM_LITERAL)
      expect(source, rel).not.toContain('useOpsChatSse')
      expect(source, rel).not.toContain('streamOpsChat')
    }
  })

  it('src/stores/chat.ts：主 Chat 走 lg-rag SSE 封装（传输主线防回退）', () => {
    const source = readFileSync(resolve(SRC_ROOT, 'stores/chat.ts'), 'utf-8')
    expect(source).toContain("from '../composables/useLgRagSse'")
    expect(source).toContain('streamLgRag(')
  })
})
