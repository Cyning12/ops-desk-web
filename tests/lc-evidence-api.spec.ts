import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '../src/api/http'
import {
  invokeLcEvidence,
  LC_EVIDENCE_INVOKE_PATH,
  LC_EVIDENCE_TIMEOUT_MS,
  LC_EVIDENCE_UNAVAILABLE_MESSAGE,
} from '../src/api/lcEvidence'
import type { LcEvidenceResult } from '../src/api/lcEvidence'

function successData(overrides: Partial<LcEvidenceResult> = {}): LcEvidenceResult {
  return {
    query: '示例问法',
    evidence: [
      {
        id: 1,
        source_type: 'issue',
        source_id: '2720',
        chunk_index: 4,
        anchor: '2720#4',
        title: '示例标题',
        url: null,
        snippet: '证据片段必须存在',
        grade: { evidence_id: 1, relevance: 'exact', reason: '命中关键句' },
      },
    ],
    answer: '基于证据的回答',
    meta: {
      hit_count: 5,
      graded: true,
      grade_count: 5,
      kept_count: 1,
      gate_action: 'answer',
      best_relevance: 'exact',
    },
    ...overrides,
  }
}

describe('api/lcEvidence', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POST /ops/lc-evidence/invoke，timeout ≥ 120000，拆 {ok,data} 且含 snippet', async () => {
    const data = successData()
    const post = vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLcEvidence('示例问法')

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body, config] = post.mock.calls[0]
    expect(url).toBe('/ops/lc-evidence/invoke')
    expect(url).toBe(LC_EVIDENCE_INVOKE_PATH)
    expect(url).not.toContain('/ops/chat/stream')
    expect(body).toEqual({ query: '示例问法' })
    expect(config).toEqual(
      expect.objectContaining({
        timeout: expect.any(Number),
      }),
    )
    expect(Number(config?.timeout)).toBeGreaterThanOrEqual(120000)
    expect(Number(config?.timeout)).toBe(LC_EVIDENCE_TIMEOUT_MS)
    expect(result.evidence[0].snippet).toBe('证据片段必须存在')
    expect(result.meta.gate_action).toBe('answer')
  })

  it('未改 http 全局 timeout（仍为 30s）', () => {
    expect(http.defaults.timeout).toBe(30_000)
  })

  it('ok:false 走错误路径', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: false, error: { code: 'LLM_FAIL', message: '上游失败' } },
    })

    await expect(invokeLcEvidence('示例问法')).rejects.toMatchObject({
      message: '上游失败',
    })
  })

  it('网络错误走错误路径', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({
      status: null,
      message: 'Network Error',
      raw: null,
    })

    await expect(invokeLcEvidence('示例问法')).rejects.toMatchObject({
      status: null,
      message: 'Network Error',
    })
  })

  it('404 / 502 文案为「旁路 API 不可用」', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({
      status: 404,
      message: 'Not Found',
      raw: null,
    })

    await expect(invokeLcEvidence('示例问法')).rejects.toMatchObject({
      status: 404,
      message: LC_EVIDENCE_UNAVAILABLE_MESSAGE,
    })

    vi.spyOn(http, 'post').mockRejectedValue({
      status: 502,
      message: 'Bad Gateway',
      raw: null,
    })

    await expect(invokeLcEvidence('示例问法')).rejects.toMatchObject({
      status: 502,
      message: LC_EVIDENCE_UNAVAILABLE_MESSAGE,
    })
  })

  it('源码不 import useOpsChatSse，也不请求 /ops/chat/stream', () => {
    const files = [
      'src/api/lcEvidence.ts',
      'src/stores/lcEvidence.ts',
      'src/views/LcEvidenceView.vue',
    ]
    for (const rel of files) {
      const src = readFileSync(resolve(rel), 'utf8')
      expect(src, rel).not.toContain('useOpsChatSse')
      expect(src, rel).not.toContain('/ops/chat/stream')
    }
  })
})
