import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  CHAT_THREADS_PATH,
  fetchChatThreads,
  fetchThreadHistory,
} from '../src/api/chatHistory'
import { http } from '../src/api/http'

/**
 * B1 client 契约测试（web-chat-history-hitl-ux F1-1 / AC12）：
 * 字段族与上游 task_chat_history_api 逐键对齐（thread_id/title/last_activity_at/run_count/
 * latest_run_status + next_cursor；history run 视图 query/answer/subtasks/terminal_status/hitl +
 * answer_truncated）· 不自造字段 · 未知额外键容忍不依赖。
 */

const THREAD_ITEM = {
  thread_id: 't-1',
  title: '部署失败排查',
  last_activity_at: '2026-10-04T01:00:00',
  run_count: 2,
  latest_run_status: 'waiting_approval',
}

const RUN_VIEW = {
  run_id: 'r-1',
  started_at: '2026-10-04T00:59:00',
  query: '为什么部署失败',
  answer: '因为…',
  answer_truncated: false,
  subtasks: [{ seq: 3, agent_role: 'rag_subtask', status: 'done', message: '检索完成' }],
  terminal_status: 'completed',
  hitl: [],
}

describe('api/chatHistory（B1 · 契约字段族逐键对齐）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/chat/threads：拆 {ok,data} 外壳，字段族齐 + next_cursor 透传', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { threads: [THREAD_ITEM], next_cursor: 'cur-2' } },
    })

    const page = await fetchChatThreads()

    expect(get).toHaveBeenCalledTimes(1)
    const [url, config] = get.mock.calls[0]
    expect(url).toBe(CHAT_THREADS_PATH)
    expect(url).toBe('/ops/chat/threads')
    expect(config).toEqual({ params: {} })
    expect(page.threads).toHaveLength(1)
    const item = page.threads[0]
    // AC12：字段族逐键对齐上游 build_thread_summary
    expect(Object.keys(item).sort()).toEqual(
      ['last_activity_at', 'latest_run_status', 'run_count', 'thread_id', 'title'].sort(),
    )
    expect(item.latest_run_status).toBe('waiting_approval')
    expect(page.next_cursor).toBe('cur-2')
  })

  it('threads 分页参数：cursor/limit 透传；无参不带键', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { threads: [], next_cursor: null } },
    })

    await fetchChatThreads({ cursor: 'cur-2', limit: 50 })

    const [, config] = get.mock.calls[0]
    expect(config).toEqual({ params: { cursor: 'cur-2', limit: 50 } })
  })

  it('GET /ops/chat/threads/{id}/history：run 消息视图字段族齐（query/answer/subtasks/terminal_status/hitl/answer_truncated）', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: {
        ok: true,
        data: { thread_id: 't-1', runs: [RUN_VIEW], next_cursor: null },
      },
    })

    const page = await fetchThreadHistory('t-1')

    const [url, config] = get.mock.calls[0]
    expect(url).toBe('/ops/chat/threads/t-1/history')
    expect(config).toEqual({ params: {} })
    expect(page.thread_id).toBe('t-1')
    expect(page.runs).toHaveLength(1)
    const run = page.runs[0]
    // AC12：字段族逐键对齐上游 build_run_view
    expect(Object.keys(run).sort()).toEqual(
      [
        'answer',
        'answer_truncated',
        'hitl',
        'query',
        'run_id',
        'started_at',
        'subtasks',
        'terminal_status',
      ].sort(),
    )
    expect(run.answer_truncated).toBe(false)
    expect(run.terminal_status).toBe('completed')
  })

  it('history 路径转义 thread_id；cursor 透传', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { thread_id: 't/9', runs: [], next_cursor: 'c3' } },
    })

    const page = await fetchThreadHistory('t/9', { cursor: 'c2' })

    const [url, config] = get.mock.calls[0]
    expect(url).toBe('/ops/chat/threads/t%2F9/history')
    expect(config).toEqual({ params: { cursor: 'c2' } })
    expect(page.next_cursor).toBe('c3')
  })

  it('宽松容忍：无 {ok,data} 外壳的裸形也能解（mock 先行期契约微漂不炸）；未知额外键不依赖', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({
      data: { threads: [{ ...THREAD_ITEM, future_key: 'x' }], next_cursor: null, extra: 1 },
    })

    const page = await fetchChatThreads()

    expect(page.threads).toHaveLength(1)
    expect(page.threads[0].thread_id).toBe('t-1')
    expect(page.next_cursor).toBeNull()
  })

  it('缺键兜底：threads/runs 非数组 → 空列表不崩', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({ data: { ok: true, data: {} } })

    const threadsPage = await fetchChatThreads()
    const historyPage = await fetchThreadHistory('t-1')

    expect(threadsPage.threads).toEqual([])
    expect(threadsPage.next_cursor).toBeNull()
    expect(historyPage.runs).toEqual([])
  })
})
