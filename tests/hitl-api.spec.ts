import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  decideHitlRequest,
  fetchHitlPending,
  HITL_PENDING_PATH,
  HITL_REQUESTS_PATH,
  resumeHitlRequest,
} from '../src/api/hitl'
import { http } from '../src/api/http'

/**
 * B2 client 契约测试（web-chat-history-hitl-ux F2-2 / AC12）：
 * 字段族与上游 task_hitl_browser_decide 逐键对齐（pending item：id/run_id/thread_id/reason/
 * blocked_by/created_at · 返回 {items,count}）· decide 两步不自动 resume（client 层只封装两调用）。
 * OA 签名面零触碰：本 client 只打 pending/decide/resume 三路径。
 */

const PENDING_ITEM = {
  id: 'req-1',
  run_id: 'r-1',
  thread_id: 't-1',
  reason: '高危操作需审批',
  blocked_by: ['deploy'],
  created_at: '2026-10-04T01:00:00',
}

describe('api/hitl（B2 · 契约字段族逐键对齐）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/hitl/pending：{items,count} 透传，字段族齐', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { items: [PENDING_ITEM], count: 1 },
    })

    const resp = await fetchHitlPending()

    expect(get).toHaveBeenCalledTimes(1)
    expect(get.mock.calls[0][0]).toBe(HITL_PENDING_PATH)
    expect(get.mock.calls[0][0]).toBe('/ops/hitl/pending')
    expect(resp.count).toBe(1)
    expect(resp.items).toHaveLength(1)
    // AC12：字段族逐键对齐上游 _PENDING_FIELDS
    expect(Object.keys(resp.items[0]).sort()).toEqual(
      ['blocked_by', 'created_at', 'id', 'reason', 'run_id', 'thread_id'].sort(),
    )
  })

  it('pending 缺 count → 以 items 长度兜底；items 非数组 → 空列表不崩', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { items: [PENDING_ITEM] } })
    const resp = await fetchHitlPending()
    expect(resp.count).toBe(1)

    vi.spyOn(http, 'get').mockResolvedValue({ data: {} })
    const empty = await fetchHitlPending()
    expect(empty).toEqual({ items: [], count: 0 })
  })

  it('POST /ops/hitl/requests/{id}/decide：body {decision:approved}；路径转义', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: {
        ok: true,
        request: { id: 'req-1', status: 'approved' },
        resume: {
          required: true,
          method: 'POST',
          endpoint: '/api/ops/hitl/requests/req-1/resume',
        },
      },
    })

    const resp = await decideHitlRequest('req-1', 'approved')

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body] = post.mock.calls[0]
    expect(url).toBe(`${HITL_REQUESTS_PATH}/req-1/decide`)
    expect(url).toBe('/ops/hitl/requests/req-1/decide')
    // 契约钉死：body 仅 decision（decide 不自动 resume）
    expect(body).toEqual({ decision: 'approved' })
    expect(resp.ok).toBe(true)
    expect(resp.resume.required).toBe(true)
  })

  it('decide rejected：body {decision:rejected}', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: { ok: true, request: {}, resume: { required: true, method: 'POST', endpoint: '' } },
    })

    await decideHitlRequest('req/9', 'rejected')

    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/ops/hitl/requests/req%2F9/decide')
    expect(body).toEqual({ decision: 'rejected' })
  })

  it('POST /ops/hitl/requests/{id}/resume：复用既有端点（只封装 · 无 body）', async () => {
    const post = vi.spyOn(http, 'post').mockResolvedValue({
      data: {
        ok: true,
        request: { id: 'req-1', status: 'approved', run_id: 'r-1', thread_id: 't-1' },
        resume: { status: 'completed' },
        replay: {
          run_id: 'r-1',
          cursor: 'r-1:9',
          events_persisted: 3,
          events_failed: 0,
          persisted: true,
          re_interrupted: false,
        },
        ts: 1,
      },
    })

    const resp = await resumeHitlRequest('req-1')

    expect(post).toHaveBeenCalledTimes(1)
    const [url, body] = post.mock.calls[0]
    expect(url).toBe('/ops/hitl/requests/req-1/resume')
    expect(body).toBeUndefined()
    expect(resp.replay.run_id).toBe('r-1')
    expect(resp.replay.persisted).toBe(true)
  })

  it('OA 签名面零触碰：client 不打 /requests 列表 /runtime /callback', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({ data: { items: [], count: 0 } })
    const post = vi.spyOn(http, 'post').mockResolvedValue({ data: {} })

    await fetchHitlPending()
    await decideHitlRequest('req-1', 'approved')
    await resumeHitlRequest('req-1')

    const urls = [...get.mock.calls, ...post.mock.calls].map((call) => String(call[0]))
    for (const url of urls) {
      expect(url).not.toMatch(/\/ops\/hitl\/runtime/)
      expect(url).not.toMatch(/\/ops\/hitl\/callback/)
      expect(url).not.toBe(HITL_REQUESTS_PATH) // OA GET /hitl/requests 签名面
    }
  })
})
