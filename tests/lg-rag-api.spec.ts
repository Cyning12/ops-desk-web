import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { http } from '../src/api/http'
import {
  invokeLgRag,
  LG_RAG_INVOKE_PATH,
  LG_RAG_TIMEOUT_MS,
  LG_RAG_UNAVAILABLE_MESSAGE,
} from '../src/api/lgRag'
import type { LgRagResult } from '../src/api/lgRag'

function emptyChainMeta() {
  return { gate_action: '', hit_count: 0, kept_count: 0, best_relevance: '', grade_count: 0 }
}

function ragChainMeta() {
  return { gate_action: 'answer', hit_count: 5, kept_count: 2, best_relevance: 'exact', grade_count: 5 }
}

function successData(overrides: Partial<LgRagResult> = {}): LgRagResult {
  return {
    answer: '旁路回答',
    mode: 'router',
    thread_id: 'thr-1',
    route: 'rag',
    retry_count: 0,
    chain_meta: ragChainMeta(),
    subtasks: [],
    subtask_results: [],
    ...overrides,
  }
}

describe('api/lgRag', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('POST /ops/lg-rag/invoke，timeout ≥ 300000，拆 {ok,data}；不打 /ops/chat/stream', async () => {
    const data = successData()
    const post = vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLgRag({ query: '检索部署失败原因' })

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body, config] = post.mock.calls[0]
    expect(url).toBe('/ops/lg-rag/invoke')
    expect(url).toBe(LG_RAG_INVOKE_PATH)
    expect(url).not.toContain('/ops/chat/stream')
    expect(body).toEqual({ query: '检索部署失败原因' })
    expect(config).toEqual(expect.objectContaining({ timeout: expect.any(Number) }))
    expect(Number(config?.timeout)).toBeGreaterThanOrEqual(300000)
    expect(Number(config?.timeout)).toBe(LG_RAG_TIMEOUT_MS)
    expect(result.answer).toBe('旁路回答')
    expect(result.thread_id).toBe('thr-1')
  })

  it('mode / thread_id 随请求体透传', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: true, data: successData({ thread_id: 'thr-9' }) },
    })

    await invokeLgRag({ query: '继续', mode: 'supervisor', thread_id: 'thr-9' })

    const [, body] = post.mock.calls[0]
    expect(body).toEqual({ query: '继续', mode: 'supervisor', thread_id: 'thr-9' })
  })

  it('basic 样例：route="" 为正常值', async () => {
    const data = successData({ mode: 'basic', route: '', chain_meta: emptyChainMeta() })
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLgRag({ query: '什么是 evidence gate', mode: 'basic' })

    expect(result.mode).toBe('basic')
    expect(result.route).toBe('')
  })

  it('router 样例：rag 路径 chain_meta 五字段', async () => {
    const data = successData({ route: 'rag', retry_count: 1, chain_meta: ragChainMeta() })
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLgRag({ query: '检索并总结', mode: 'router' })

    expect(result.route).toBe('rag')
    expect(result.retry_count).toBe(1)
    expect(result.chain_meta).toEqual(ragChainMeta())
  })

  it('supervisor 样例：subtasks / subtask_results 宽松结构透传', async () => {
    const subtasks = [{ id: 1, task: '对比 A 服务错误率' }, { id: 2, task: '对比 B 服务错误率' }]
    const subtaskResults = [{ subtask_id: 1, output: 'A 错误率 2%' }]
    const data = successData({ mode: 'supervisor', route: '', subtasks, subtask_results: subtaskResults })
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLgRag({ query: '对比 A、B 服务错误率', mode: 'supervisor' })

    expect(result.subtasks).toHaveLength(2)
    expect(result.subtask_results[0]).toEqual({ subtask_id: 1, output: 'A 错误率 2%' })
  })

  it('refuse 样例：route=refuse 仍是 200 成功态，写入 result', async () => {
    const data = successData({
      route: 'refuse',
      answer: '无可用证据，无法作答。',
      chain_meta: { ...emptyChainMeta(), gate_action: 'refuse', hit_count: 2 },
    })
    vi.spyOn(http, 'post').mockResolvedValue({ data: { ok: true, data } })

    const result = await invokeLgRag({ query: '无关问题' })

    expect(result.route).toBe('refuse')
    expect(result.chain_meta.gate_action).toBe('refuse')
  })

  it('ok:false 走错误路径（取外壳 error.message）', async () => {
    vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: false, error: { code: 'lg_rag_failed', message: '旁路调用失败' } },
    })

    await expect(invokeLgRag({ query: '示例' })).rejects.toMatchObject({
      message: '旁路调用失败',
    })
  })

  it('500 网络层拒绝走错误路径', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({ status: 500, message: '服务器错误', raw: null })

    await expect(invokeLgRag({ query: '示例' })).rejects.toMatchObject({
      status: 500,
      message: '服务器错误',
    })
  })

  it('网络错误走错误路径', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({ status: null, message: 'Network Error', raw: null })

    await expect(invokeLgRag({ query: '示例' })).rejects.toMatchObject({
      status: null,
      message: 'Network Error',
    })
  })

  it('404 / 502 文案为「旁路 API 不可用」', async () => {
    vi.spyOn(http, 'post').mockRejectedValue({ status: 404, message: 'Not Found', raw: null })
    await expect(invokeLgRag({ query: '示例' })).rejects.toMatchObject({
      status: 404,
      message: LG_RAG_UNAVAILABLE_MESSAGE,
    })

    vi.spyOn(http, 'post').mockRejectedValue({ status: 502, message: 'Bad Gateway', raw: null })
    await expect(invokeLgRag({ query: '示例' })).rejects.toMatchObject({
      status: 502,
      message: LG_RAG_UNAVAILABLE_MESSAGE,
    })
  })

  it('未改 http 全局 timeout（仍为 30s）', () => {
    expect(http.defaults.timeout).toBe(30_000)
  })

  it('源码不 import useOpsChatSse，也不请求 /ops/chat/stream', () => {
    const files = ['src/api/lgRag.ts', 'src/stores/lgRag.ts', 'src/views/LgRagView.vue']
    for (const rel of files) {
      const src = readFileSync(resolve(rel), 'utf8')
      expect(src, rel).not.toContain('useOpsChatSse')
      expect(src, rel).not.toContain('/ops/chat/stream')
    }
  })
})
