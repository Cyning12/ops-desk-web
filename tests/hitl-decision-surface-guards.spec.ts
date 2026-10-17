import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * web-hitl-decision-surface · N3 专节钉形态机断（grep/diff 断言 · task :112-118 照做）：
 * - TC3：src/ 无 pending/追帧相关 setInterval（退避一律 setTimeout 单次链）
 * - TC12：无伪造 lastDone.model 赋值字面（model 仅取自 payload 或空串兜底）
 * - TC13：无新 event_type 构造 + useLgRagSse 解析段 diff 为空（增量仅限 retryAfterSeconds 错误面）
 */

// vitest 从仓根启动：process.cwd() 即仓根（jsdom 环境下 import.meta.url 非 file scheme · 不可用）
const REPO_ROOT = process.cwd()
const SRC_DIR = join(REPO_ROOT, 'src')

/** 递归收集 src/** 下 .ts/.vue 源文件 */
function collectSources(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectSources(full))
    else if (/\.(ts|vue)$/.test(entry.name)) out.push(full)
  }
  return out
}

/** N3 排除面：注释行（// / * 开头 · 含块注释续行）不参与命中判定 */
function isCommentLine(trimmed: string): boolean {
  return trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')
}

function grepLines(
  files: string[],
  needle: RegExp,
): { file: string; line: number; text: string }[] {
  const hits: { file: string; line: number; text: string }[] = []
  for (const file of files) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((text, i) => {
        if (isCommentLine(text.trim())) return
        if (needle.test(text)) hits.push({ file, line: i + 1, text: text.trim() })
      })
  }
  return hits
}

/**
 * CI 鲁棒的 diff 基线解析（30 存续棒 · CI run 39017191873 浅克隆无本地 main ref 修复）：
 * 回退链 本地 main → GITHUB_BASE_REF 系（origin/<base> · <base>）→ origin/main → origin/HEAD → origin/master；
 * 全不可达且 CI 环境 → 返回 null（diff 例 skip 留痕 · 以本地实证为准）；非 CI 全不可达 → 抛错拒绿。
 */
function resolveDiffBase(): string | null {
  const baseRef = process.env.GITHUB_BASE_REF
  const candidates = [
    'main',
    ...(baseRef ? ['origin/' + baseRef, baseRef] : []),
    'origin/main',
    'origin/HEAD',
    'origin/master',
  ]
  for (const ref of candidates) {
    try {
      execFileSync('git', ['rev-parse', '--verify', '--quiet', ref + '^{commit}'], {
        cwd: REPO_ROOT,
        stdio: ['ignore', 'pipe', 'ignore'],
      })
      return ref
    } catch {
      // ref 不可达：试下一候选
    }
  }
  return null
}

/**
 * TC13(b) diff 判定纯函数（web-fix-tc13b-guard F1 · git 环境解耦可单测）：
 * - empty：diff 为空（非 decision-surface 上下文 · main / 不动该文件的分支）→ guard skip/pass 留痕不恒红
 * - retry-after-seconds-added：增行实含 retryAfterSeconds（decision-surface 上下文）→ 硬断言路径成立
 * - other-nonempty：非空 diff 但无 retryAfterSeconds 增行（他支动文件上下文）→ 删行/增行口径存续 · 不恒红（FP-5）
 */
type Tc13bVerdict = 'empty' | 'retry-after-seconds-added' | 'other-nonempty'

function evaluateTc13bDiff(diffText: string): { verdict: Tc13bVerdict; removed: string[]; added: string[] } {
  const removed = diffText.split('\n').filter((l) => l.startsWith('-') && !l.startsWith('---'))
  const added = diffText.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'))
  if (removed.length === 0 && added.length === 0) return { verdict: 'empty', removed, added }
  if (added.some((l) => l.includes('retryAfterSeconds'))) {
    return { verdict: 'retry-after-seconds-added', removed, added }
  }
  return { verdict: 'other-nonempty', removed, added }
}

describe('web-hitl-decision-surface · N3 grep/diff 钉形态（TC3 / TC12 / TC13）', () => {
  it('TC3：src/ 无 pending/追帧相关 setInterval（基线 2 文件白名单外零命中）', () => {
    const hits = grepLines(collectSources(SRC_DIR), /setInterval/)
    // N3 基线白名单：reveal 队列打字机 + lgRag 旧面板轮询（均与 pending/追帧无关 · task :170 基线 0 口径）
    for (const hit of hits) {
      const rel = hit.file.split(/\/?src\/?/)[1] ?? hit.file
      expect(
        rel.includes('composables/useRevealQueue.ts') || rel.includes('stores/lgRag.ts'),
        `setInterval 命中出白名单：${hit.file}:${hit.line} ${hit.text}`,
      ).toBe(true)
    }
    // 本 task 触碰面显式零命中钉死
    const touched = ['stores/chat.ts', 'views/ChatView.vue', 'composables/useLgRagSse.ts']
    for (const rel of touched) {
      expect(hits.some((h) => h.file.includes(rel)), `${rel} 禁引入 setInterval`).toBe(false)
    }
  })

  it('TC12：无伪造 model 赋值字面（lastDone.model 仅 payload 透传或空串兜底 · N3 钉形态）', () => {
    const files = [join(SRC_DIR, 'stores/chat.ts'), join(SRC_DIR, 'views/ChatView.vue')]
    const hits = grepLines(files, /model/)
    for (const hit of hits) {
      // v-if 渲染条件/v-model 表单绑定行排除（N3 排除面 · (?<!-) 钉死 v-model 误命中）；
      // 禁 model: '<非空字面量>' / model = '<非空字面量>' 伪造赋值
      if (hit.text.startsWith('v-if') || hit.text.includes('v-if=')) continue
      expect(
        /(?<!-)model\s*[:=]\s*['\"][^'\"]+['\"]/.test(hit.text),
        `伪造 model 赋值字面：${hit.file}:${hit.line} ${hit.text}`,
      ).toBe(false)
    }
  })

  it('TC13(a)：无新 event_type 构造（hitl.resumed 零字面 · grep 面全环境可跑）', () => {
    // 未知帧 hitl.resumed 走 default 透传忽略 · src/ 零 case 构造/零字面消费
    const chatHits = grepLines(
      [join(SRC_DIR, 'stores/chat.ts'), join(SRC_DIR, 'composables/useLgRagSse.ts')],
      /hitl\.resumed|case\s+'hitl\.(?!waiting')/,
    )
    expect(
      chatHits,
      `新 event_type 构造/消费字面：${chatHits.map((h) => `${h.file}:${h.line} ${h.text}`).join(' ; ')}`,
    ).toEqual([])
  })

  it('TC13(b)：useLgRagSse 解析段 diff 为空（CI 鲁棒基线链 · 不可达则 CI skip 留痕）', (ctx) => {
    const base = resolveDiffBase()
    if (base === null) {
      if (process.env.CI) {
        // CI 浅克隆无任何基线 ref：skip 并留痕 · 以本地实证为准（30 invoke 照登 · N3 判据语义不放松）
        console.warn('[TC13(b)] CI 环境 diff 基线不可达（浅克隆无 main/origin ref）· 本例 skip · 本地实证为准')
        ctx.skip()
        return
      }
      throw new Error('TC13(b) diff 基线不可达且非 CI 环境：请确认本地 main ref 存在（拒绿）')
    }
    // useLgRagSse diff（工作区含未提交 · 较基线更强口径）：删行仅限错误面改写 · 增行仅限 retryAfterSeconds
    const diff = execFileSync(
      'git',
      ['diff', base, '--', 'src/composables/useLgRagSse.ts'],
      { cwd: REPO_ROOT, encoding: 'utf8' },
    )
    const { verdict, removed, added } = evaluateTc13bDiff(diff)
    // diff 为空 = 非 decision-surface 上下文（main / 不动该文件的分支）：skip 留痕不恒红（web-fix-tc13b-guard F1）
    if (verdict === 'empty') {
      console.warn('[TC13(b)] useLgRagSse.ts diff 为空（非 decision-surface 上下文）· 本例 skip 留痕 · 硬断言路径由双场景 fixture 锁存')
      ctx.skip()
      return
    }
    // 删行仅限被改写的那行 onError 错误面调用（穿 retryAfterSeconds）；解析段零删改
    for (const line of removed) {
      expect(line, `删行越出 retryAfterSeconds 错误面：${line}`).toMatch(/onError/)
    }
    // 增行绝不含解析构造（event_type/payload/Parser/feed/帧解析件）→ 解析段 diff 为空
    for (const line of added) {
      expect(
        /event_type|payload|FrameParser|\.feed\(|TextDecoder|ReadableStream/.test(line),
        `diff 增行触碰解析段：${line}`,
      ).toBe(false)
    }
    // hunk 仅限 retryAfterSeconds 错误面：仅 decision-surface 上下文（增行实含 retryAfterSeconds）硬断言成立；
    // other-nonempty 边界（他支动文件上下文）不恒红 · 删行/增行口径存续拦截（FP-5 · F2 边界例留痕）
    if (verdict === 'retry-after-seconds-added') {
      expect(added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)
    }
  })
})

/**
 * web-fix-tc13b-guard F2 · evaluateTc13bDiff 双场景 Vitest 锁存（红测先行 · 本块先于实现提交）：
 * 空 diff → skip/pass 路径；含 retryAfterSeconds 增行 diff fixture → 硬断言路径成立；
 * 边界（非空 diff 无 retryAfterSeconds 增行）→ 不恒红且 :138-150 口径存续（FP-5 留痕）。
 */
describe('web-fix-tc13b-guard · evaluateTc13bDiff 判定锁存（空 diff / PR #73 fixture / 边界）', () => {
  it('场景一：空 diff → empty 判定（非 decision-surface 上下文 · guard 走 skip/pass 留痕不恒红）', () => {
    expect(evaluateTc13bDiff('').verdict).toBe('empty')
    expect(evaluateTc13bDiff('\n').verdict).toBe('empty')
  })

  it('场景二：含 retryAfterSeconds 增行 diff fixture → 硬断言路径成立（fixture 取自 PR #73 squash e07e4ac 真实 diff 形态）', () => {
    // fixture 来源留痕：git show e07e4ac -- src/composables/useLgRagSse.ts（PR #73 · task_web_hitl_decision_surface · 裁定 D-C）
    const PR73_FIXTURE = [
      'diff --git a/src/composables/useLgRagSse.ts b/src/composables/useLgRagSse.ts',
      'index 47373ad..e2c317f 100644',
      '--- a/src/composables/useLgRagSse.ts',
      '+++ b/src/composables/useLgRagSse.ts',
      '@@ -37,6 +37,11 @@ export interface LgRagSseTransportError {',
      '   /** HTTP 状态码；网络层失败/超时为 null */',
      '   status: number | null',
      '   message: string',
      '+  /**',
      '+   * 裁定 D-C 错误面可选增键：响应 Retry-After 头秒数（如 HITL 在飞 replay 409 + Retry-After: 2）。',
      '+   * 缺头/非法值时为 undefined（消费方默认 2s）；既有消费方零改动兼容（可选键）。',
      '+   */',
      '+  retryAfterSeconds?: number',
      ' }',
      '@@ -237,7 +242,17 @@ function postLgRagSse(',
      '       } catch {',
      '         // 无 JSON 错误体：保留默认 message',
      '       }',
      "-      callbacks.onError?.({ kind: 'http', status: response.status, message })",
      "+      // 裁定 D-C：Retry-After 头外抛（HITL 在飞 replay 409 退避凭据）；缺头/非法值/无 headers 面不挂键",
      "+      const retryAfterRaw = response.headers?.get?.('Retry-After') ?? null",
      '+      const retryAfterSeconds = retryAfterRaw === null ? NaN : Number(retryAfterRaw)',
      '+      callbacks.onError?.({',
      "+        kind: 'http',",
      '+        status: response.status,',
      '+        message,',
      '+        ...(Number.isFinite(retryAfterSeconds) && retryAfterSeconds >= 0',
      '+          ? { retryAfterSeconds }',
      '+          : {}),',
      '+      })',
      '       return',
      '     }',
    ].join('\n')
    const result = evaluateTc13bDiff(PR73_FIXTURE)
    expect(result.verdict).toBe('retry-after-seconds-added')
    // 硬断言路径锁存：增行实含 retryAfterSeconds（若判定被误松为 skip/pass 或断言缺失 · 本例即红 · FP-2）
    expect(result.added.some((l) => l.includes('retryAfterSeconds'))).toBe(true)
  })

  it('边界留痕：非空 diff 但无 retryAfterSeconds 增行 → other-nonempty（他支动文件上下文 · :152 不恒红 · :138-150 口径存续 · FP-5）', () => {
    const OTHER_DIFF = [
      'diff --git a/src/composables/useLgRagSse.ts b/src/composables/useLgRagSse.ts',
      '--- a/src/composables/useLgRagSse.ts',
      '+++ b/src/composables/useLgRagSse.ts',
      '@@ -1,1 +1,1 @@',
      "-      callbacks.onError?.({ kind: 'http', status: response.status, message })",
      "+      callbacks.onError?.({ kind: 'http', status: response.status, message: message.trim() })",
    ].join('\n')
    const result = evaluateTc13bDiff(OTHER_DIFF)
    expect(result.verdict).toBe('other-nonempty')
    expect(result.added.some((l) => l.includes('retryAfterSeconds'))).toBe(false)
  })
})
