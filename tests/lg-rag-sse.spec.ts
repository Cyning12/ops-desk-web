import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  LG_RAG_REPLAY_PATH,
  LG_RAG_STREAM_PATH,
  LG_RAG_STREAM_TIMEOUT_MS,
  LgRagSseFrameParser,
  replayLgRag,
  streamLgRag,
} from '../src/composables/useLgRagSse'
import type { LgRagSseEvent } from '../src/composables/useLgRagSse'

function frame(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

const RUN_START = {
  run_id: 'r-1',
  seq: 1,
  ts_ms: 1,
  agent_role: 'system',
  event_type: 'run.start',
  payload: { run_id: 'r-1', thread_id: 't-1', mode: 'supervisor' },
}
const NODE_PROGRESS = {
  run_id: 'r-1',
  seq: 2,
  ts_ms: 2,
  agent_role: 'intent',
  event_type: 'node.progress',
  payload: { summary: '意图识别完成' },
}
const SUBTASK_PROGRESS = {
  run_id: 'r-1',
  seq: 3,
  ts_ms: 3,
  agent_role: 'rag_subtask',
  event_type: 'subtask.progress',
  payload: { summary: '子任务检索完成' },
}
const ANSWER = {
  run_id: 'r-1',
  seq: 4,
  ts_ms: 4,
  agent_role: 'aggregator',
  event_type: 'answer',
  payload: { content: '整段终答' },
}
const DONE = { run_id: 'r-1', seq: 5, ts_ms: 5, agent_role: 'system', event_type: 'done', payload: {} }
const ERROR_EVENT = {
  run_id: 'r-1',
  seq: 6,
  ts_ms: 6,
  agent_role: 'system',
  event_type: 'error',
  payload: { stage: 'supervisor', message: 'model unavailable', retryable: false },
}

describe('LgRagSseFrameParser', () => {
  it('T2 帧序：run.start → 进度 → answer → done 按序解析', () => {
    const events: LgRagSseEvent[] = []
    const parser = new LgRagSseFrameParser((e) => events.push(e))

    parser.push(frame(RUN_START) + frame(NODE_PROGRESS) + frame(SUBTASK_PROGRESS) + frame(ANSWER) + frame(DONE))

    expect(events.map((e) => e.event_type)).toEqual([
      'run.start',
      'node.progress',
      'subtask.progress',
      'answer',
      'done',
    ])
    expect(events[0].payload).toEqual({ run_id: 'r-1', thread_id: 't-1', mode: 'supervisor' })
    expect(events[0].seq).toBe(1)
    expect(events[0].ts_ms).toBe(1)
  })

  it('跨 chunk 半帧：缓冲拼接后再触发', () => {
    const events: LgRagSseEvent[] = []
    const parser = new LgRagSseFrameParser((e) => events.push(e))
    const full = frame(NODE_PROGRESS)
    const mid = Math.floor(full.length / 2)

    parser.push(full.slice(0, mid))
    expect(events).toHaveLength(0)

    parser.push(full.slice(mid))
    expect(events).toHaveLength(1)
    expect(events[0].payload?.summary).toBe('意图识别完成')
  })

  it('event: 行不依赖：帧型以 data JSON 的 event_type 为准（api §10.1 常见坑）', () => {
    const events: LgRagSseEvent[] = []
    const parser = new LgRagSseFrameParser((e) => events.push(e))

    parser.push(`event: node.progress\n${frame(NODE_PROGRESS).trimEnd()}\n\n`)

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('node.progress')
  })

  it('坏 JSON 行：跳过不崩溃，后续帧正常', () => {
    const events: LgRagSseEvent[] = []
    const parser = new LgRagSseFrameParser((e) => events.push(e))

    parser.push('data: {not-json\n\n')
    parser.push('data: \n\n')
    parser.push('data: {"no_event_type": true}\n\n')
    parser.push(frame(ANSWER))

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('answer')
  })
})

/** 用真实 ReadableStream 构造 fetch Response */
function sseResponse(chunks: string[], init: { status?: number } = {}): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk))
      controller.close()
    },
  })
  return {
    ok: (init.status ?? 200) >= 200 && (init.status ?? 200) < 300,
    status: init.status ?? 200,
    body: stream,
    json: () => Promise.resolve({}),
  } as unknown as Response
}

describe('streamLgRag', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('完整流：fetch 参数正确（freeze lg-rag-sse-v1），事件按序回调，结束触发 onDone', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([frame(RUN_START) + frame(NODE_PROGRESS), frame(ANSWER) + frame(DONE)]),
    )
    vi.stubGlobal('fetch', fetchMock)

    const events: LgRagSseEvent[] = []
    const onDone = vi.fn()
    const controller = streamLgRag(
      { query: '最近有什么高优 issue？' },
      { onEvent: (e) => events.push(e), onDone },
    )
    await controller.done

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(LG_RAG_STREAM_PATH)
    expect(url).toBe('/api/ops/lg-rag/stream')
    expect(url).not.toContain('/ops/chat/stream')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect((init.headers as Record<string, string>).Accept).toBe('text/event-stream')
    // T2：默认 supervisor · thread_id 留空不出现
    expect(JSON.parse(init.body as string)).toEqual({
      query: '最近有什么高优 issue？',
      mode: 'supervisor',
    })

    expect(events.map((e) => e.event_type)).toEqual(['run.start', 'node.progress', 'answer', 'done'])
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('显式 mode / thread_id：写入 body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([frame(DONE)]))
    vi.stubGlobal('fetch', fetchMock)

    const controller = streamLgRag({ query: 'q', mode: 'basic', threadId: 't-9' })
    await controller.done

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({ query: 'q', mode: 'basic', thread_id: 't-9' })
  })

  it('error 事件作为普通事件帧回调（不触发传输层 onError）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([frame(ERROR_EVENT)])))

    const events: LgRagSseEvent[] = []
    const onError = vi.fn()
    const controller = streamLgRag({ query: 'x' }, { onEvent: (e) => events.push(e), onError })
    await controller.done

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('error')
    expect(events[0].payload).toEqual({ stage: 'supervisor', message: 'model unavailable', retryable: false })
    expect(onError).not.toHaveBeenCalled()
  })

  it('HTTP 非 2xx（如 401/422）：onError kind=http 带状态码与 detail', async () => {
    const response = {
      ok: false,
      status: 401,
      body: null,
      json: () => Promise.resolve({ detail: 'Invalid or expired session' }),
    } as unknown as Response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    const onError = vi.fn()
    const controller = streamLgRag({ query: 'x' }, { onError })
    await controller.done

    expect(onError).toHaveBeenCalledWith({
      kind: 'http',
      status: 401,
      message: 'Invalid or expired session',
    })
  })

  it('网络错误（fetch reject）：onError kind=network', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))

    const onError = vi.fn()
    const controller = streamLgRag({ query: 'x' }, { onError })
    await controller.done

    expect(onError).toHaveBeenCalledWith({
      kind: 'network',
      status: null,
      message: 'Failed to fetch',
    })
  })

  it('abort：读流中断触发 onAborted，不触发 onError/onDone', async () => {
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      const response = {
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: () =>
              new Promise((_, reject) => {
                const abortError = () =>
                  reject(new DOMException('The operation was aborted.', 'AbortError'))
                if (init.signal?.aborted) {
                  abortError()
                  return
                }
                init.signal?.addEventListener('abort', abortError)
              }),
            releaseLock: () => {},
          }),
        },
      } as unknown as Response
      return Promise.resolve(response)
    })
    vi.stubGlobal('fetch', fetchMock)

    const onAborted = vi.fn()
    const onError = vi.fn()
    const onDone = vi.fn()
    const controller = streamLgRag({ query: 'x' }, { onAborted, onError, onDone })

    controller.abort()
    await controller.done

    expect(onAborted).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
  })

  it('client 超时（≥300s）：自动中止并 onError kind=timeout（supervisor 长问保护）', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn((_url: string, init: RequestInit) => {
      const response = {
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: () =>
              new Promise((_, reject) => {
                const abortError = () =>
                  reject(new DOMException('The operation was aborted.', 'AbortError'))
                if (init.signal?.aborted) {
                  abortError()
                  return
                }
                init.signal?.addEventListener('abort', abortError)
              }),
            releaseLock: () => {},
          }),
        },
      } as unknown as Response
      return Promise.resolve(response)
    })
    vi.stubGlobal('fetch', fetchMock)

    const onError = vi.fn()
    const onAborted = vi.fn()
    const controller = streamLgRag({ query: 'x' }, { onError, onAborted })

    await vi.advanceTimersByTimeAsync(LG_RAG_STREAM_TIMEOUT_MS)
    await controller.done

    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError.mock.calls[0][0]).toMatchObject({ kind: 'timeout', status: null })
    expect(onAborted).not.toHaveBeenCalled()
  })
})

describe('replayLgRag（T4 · api §10.3 · 形状同 live · 复用同一解析器）', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('replay 请求：POST /api/ops/lg-rag/replay · body {run_id, after_seq} · credentials include · 帧按序回调（含 cursor 透传）', async () => {
    const replayAnswer = {
      run_id: 'r-1', seq: 4, ts_ms: 4, cursor: 'r-1:4',
      agent_role: 'aggregator', event_type: 'answer', payload: { content: '补发终答' },
    }
    const replayDone = {
      run_id: 'r-1', seq: 5, ts_ms: 5, cursor: 'r-1:5',
      agent_role: 'system', event_type: 'done', payload: {},
    }
    const fetchMock = vi.fn().mockResolvedValue(sseResponse([frame(replayAnswer) + frame(replayDone)]))
    vi.stubGlobal('fetch', fetchMock)

    const events: LgRagSseEvent[] = []
    const onDone = vi.fn()
    const controller = replayLgRag({ run_id: 'r-1', after_seq: 3 }, { onEvent: (e) => events.push(e), onDone })
    await controller.done

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(LG_RAG_REPLAY_PATH)
    expect(url).toBe('/api/ops/lg-rag/replay')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect((init.headers as Record<string, string>).Accept).toBe('text/event-stream')
    expect(JSON.parse(init.body as string)).toEqual({ run_id: 'r-1', after_seq: 3 })

    expect(events.map((e) => e.event_type)).toEqual(['answer', 'done'])
    expect(events[0].cursor).toBe('r-1:4')
    expect(events[0].seq).toBe(4)
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('replay 404（未知/跨用户 run）· 422（非法 cursor 防御）：onError kind=http 带状态码与 detail', async () => {
    for (const status of [404, 422]) {
      const response = {
        ok: false,
        status,
        body: null,
        json: () => Promise.resolve({ detail: 'err-' + String(status) }),
      } as unknown as Response
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

      const onError = vi.fn()
      const controller = replayLgRag({ run_id: 'r-x', after_seq: 1 }, { onError })
      await controller.done
      expect(onError).toHaveBeenCalledWith({ kind: 'http', status, message: 'err-' + String(status) })
    }
  })

  it('replay 401：onError kind=http status=401', async () => {
    const response = {
      ok: false,
      status: 401,
      body: null,
      json: () => Promise.resolve({ detail: 'Invalid or expired session' }),
    } as unknown as Response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    const onError = vi.fn()
    const controller = replayLgRag({ run_id: 'r-1', after_seq: 3 }, { onError })
    await controller.done
    expect(onError).toHaveBeenCalledWith({ kind: 'http', status: 401, message: 'Invalid or expired session' })
  })

  it('replay 网络错误：onError kind=network（active-run 去留由 store 决策）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Failed to fetch')))

    const onError = vi.fn()
    const controller = replayLgRag({ run_id: 'r-1', after_seq: 3 }, { onError })
    await controller.done
    expect(onError).toHaveBeenCalledWith({ kind: 'network', status: null, message: 'Failed to fetch' })
  })
})
