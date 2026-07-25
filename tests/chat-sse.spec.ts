import { afterEach, describe, expect, it, vi } from 'vitest'

import { SseFrameParser, streamOpsChat } from '../src/composables/useOpsChatSse'
import type { ChatSseEvent } from '../src/composables/useOpsChatSse'

function frame(event: Record<string, unknown>): string {
  return `data: ${JSON.stringify(event)}\n\n`
}

const RUN_START = { run_id: 'r-1', seq: 1, agent_role: 'system', event_type: 'run.start', payload: { run_id: 'r-1' } }
const THINKING = { run_id: 'r-1', seq: 2, agent_role: 'intent', event_type: 'thinking', payload: { content: '先理解意图' } }
const ANSWER = { run_id: 'r-1', seq: 3, agent_role: 'answer', event_type: 'answer', payload: { content: '回答片段' } }
const DONE = { run_id: 'r-1', seq: 4, agent_role: 'system', event_type: 'done', payload: { latency_ms: 1234, model: 'deepseek-v4-pro' } }
const ERROR_EVENT = { run_id: 'r-1', seq: 5, agent_role: 'system', event_type: 'error', payload: { stage: 'llm', message: 'model unavailable', retryable: false } }

describe('SseFrameParser', () => {
  it('完整帧序列：按序解析全部事件', () => {
    const events: ChatSseEvent[] = []
    const parser = new SseFrameParser((e) => events.push(e))

    parser.push(frame(RUN_START) + frame(THINKING) + frame(ANSWER) + frame(DONE))

    expect(events.map((e) => e.event_type)).toEqual(['run.start', 'thinking', 'answer', 'done'])
    expect(events[3].payload).toEqual({ latency_ms: 1234, model: 'deepseek-v4-pro' })
  })

  it('跨 chunk 半帧：缓冲拼接后再触发', () => {
    const events: ChatSseEvent[] = []
    const parser = new SseFrameParser((e) => events.push(e))
    const full = frame(THINKING)
    const mid = Math.floor(full.length / 2)

    parser.push(full.slice(0, mid))
    expect(events).toHaveLength(0)

    parser.push(full.slice(mid))
    expect(events).toHaveLength(1)
    expect(events[0].payload?.content).toBe('先理解意图')
  })

  it('一帧跨多 data 行与非 data 行：只消费 data 行', () => {
    const events: ChatSseEvent[] = []
    const parser = new SseFrameParser((e) => events.push(e))

    parser.push(`event: thinking\n${frame(THINKING).trimEnd()}\n\n`)

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('thinking')
  })

  it('坏 JSON 行：跳过不崩溃，后续帧正常', () => {
    const events: ChatSseEvent[] = []
    const parser = new SseFrameParser((e) => events.push(e))

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

describe('streamOpsChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('完整流：fetch 参数正确，事件按序回调，结束触发 onDone', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      sseResponse([frame(RUN_START) + frame(THINKING), frame(ANSWER) + frame(DONE)]),
    )
    vi.stubGlobal('fetch', fetchMock)

    const events: ChatSseEvent[] = []
    const onDone = vi.fn()
    const controller = streamOpsChat(
      { message: '你好', sessionId: 's-1' },
      { onEvent: (e) => events.push(e), onDone },
    )
    await controller.done

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('/api/ops/chat/stream')
    expect(init.method).toBe('POST')
    expect(init.credentials).toBe('include')
    expect(JSON.parse(init.body as string)).toEqual({
      message: '你好',
      session_id: 's-1',
      model: null,
    })

    expect(events.map((e) => e.event_type)).toEqual(['run.start', 'thinking', 'answer', 'done'])
    expect(onDone).toHaveBeenCalledTimes(1)
  })

  it('error 事件作为普通事件帧回调（不触发传输层 onError）', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(sseResponse([frame(ERROR_EVENT)])))

    const events: ChatSseEvent[] = []
    const onError = vi.fn()
    const controller = streamOpsChat(
      { message: 'x', sessionId: 's-1' },
      { onEvent: (e) => events.push(e), onError },
    )
    await controller.done

    expect(events).toHaveLength(1)
    expect(events[0].event_type).toBe('error')
    expect(events[0].payload).toEqual({ stage: 'llm', message: 'model unavailable', retryable: false })
    expect(onError).not.toHaveBeenCalled()
  })

  it('HTTP 非 2xx（如 401）：onError kind=http 带状态码与 detail', async () => {
    const response = {
      ok: false,
      status: 401,
      body: null,
      json: () => Promise.resolve({ detail: 'Invalid or expired session' }),
    } as unknown as Response
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))

    const onError = vi.fn()
    const controller = streamOpsChat({ message: 'x', sessionId: 's-1' }, { onError })
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
    const controller = streamOpsChat({ message: 'x', sessionId: 's-1' }, { onError })
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
    const controller = streamOpsChat(
      { message: 'x', sessionId: 's-1' },
      { onAborted, onError, onDone },
    )

    controller.abort()
    await controller.done

    expect(onAborted).toHaveBeenCalledTimes(1)
    expect(onError).not.toHaveBeenCalled()
    expect(onDone).not.toHaveBeenCalled()
  })
})
