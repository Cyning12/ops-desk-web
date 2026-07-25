/**
 * Chat SSE 消费封装（契约：ops-desk-api docs/ios/api-auth-chat.md §4）。
 *
 * 原生 fetch + ReadableStream（不依赖 fetch-event-source）：
 * - POST /api/ops/chat/stream，body {message, session_id, model: null}
 * - cookie 鉴权：credentials: 'include'
 * - SSE 帧以 `\n\n` 分割，去 `data: ` 前缀后 JSON 解析
 * - 跨 chunk 半帧缓冲拼接；坏 JSON 行跳过不崩溃
 * - AbortController 中断；HTTP 非 2xx / 网络错误走 onError 回调
 */

/** 后端 SSE 事件帧（data JSON 解码后） */
export interface ChatSseEvent {
  run_id?: string
  seq?: number
  ts_ms?: number
  agent_role?: string
  event_type: string
  payload?: Record<string, unknown>
}

/** SSE 传输层错误（区别于事件流内的 error 事件） */
export interface ChatSseTransportError {
  /** 'http' = 响应非 2xx；'network' = fetch 失败/连接中断 */
  kind: 'http' | 'network'
  /** HTTP 状态码；网络层失败为 null */
  status: number | null
  message: string
}

export interface ChatSseCallbacks {
  /** 每个合法事件帧回调一次（含 run.start/thinking/answer/done/error） */
  onEvent?: (event: ChatSseEvent) => void
  /** HTTP 非 2xx（如 401）或网络错误 */
  onError?: (error: ChatSseTransportError) => void
  /** 流正常读完（最后一次事件之后） */
  onDone?: () => void
  /** 被 abort() 中断（不再触发 onError/onDone） */
  onAborted?: () => void
}

export interface ChatSseController {
  abort: () => void
  /** 流生命周期 promise（结束/出错/中断均 resolve，不 reject） */
  done: Promise<void>
}

/**
 * SSE 帧解析器（纯函数式，可单测）：
 * - push() 喂入任意大小的文本 chunk，内部缓冲半帧
 * - 每帧内取所有 `data:` 行，去前缀后 JSON.parse；坏行跳过
 * - 流末尾无 `\n\n` 收尾的残留半帧按约定丢弃
 */
export class SseFrameParser {
  private buffer = ''

  constructor(private readonly emit: (event: ChatSseEvent) => void) {}

  push(chunk: string): void {
    this.buffer += chunk
    let idx = this.buffer.indexOf('\n\n')
    while (idx !== -1) {
      const frame = this.buffer.slice(0, idx)
      this.buffer = this.buffer.slice(idx + 2)
      this.handleFrame(frame)
      idx = this.buffer.indexOf('\n\n')
    }
  }

  private handleFrame(frame: string): void {
    for (const line of frame.split('\n')) {
      if (!line.startsWith('data:')) continue
      const json = line.slice('data:'.length).trimStart()
      if (!json) continue
      let parsed: unknown
      try {
        parsed = JSON.parse(json)
      } catch {
        // 坏 JSON 行：跳过不崩溃
        continue
      }
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        typeof (parsed as { event_type?: unknown }).event_type === 'string'
      ) {
        this.emit(parsed as ChatSseEvent)
      }
    }
  }
}

export interface StreamChatInput {
  message: string
  sessionId: string
  model?: string | null
}

/** 发起 SSE 流式对话；返回控制器（abort 中断） */
export function streamOpsChat(
  input: StreamChatInput,
  callbacks: ChatSseCallbacks = {},
): ChatSseController {
  const abortController = new AbortController()

  const done = (async () => {
    let response: Response
    try {
      response = await fetch('/api/ops/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify({
          message: input.message,
          session_id: input.sessionId,
          model: input.model ?? null,
        }),
        signal: abortController.signal,
      })
    } catch (error) {
      if (abortController.signal.aborted) {
        callbacks.onAborted?.()
        return
      }
      callbacks.onError?.({
        kind: 'network',
        status: null,
        message: error instanceof Error ? error.message : '网络请求失败',
      })
      return
    }

    if (!response.ok) {
      let message = `请求失败（HTTP ${response.status}）`
      try {
        const data = (await response.json()) as { detail?: unknown; message?: string }
        if (typeof data.detail === 'string' && data.detail) message = data.detail
        else if (typeof data.message === 'string' && data.message) message = data.message
      } catch {
        // 无 JSON 错误体：保留默认 message
      }
      callbacks.onError?.({ kind: 'http', status: response.status, message })
      return
    }

    if (!response.body) {
      callbacks.onError?.({ kind: 'network', status: null, message: '响应不包含数据流' })
      return
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    const parser = new SseFrameParser((event) => callbacks.onEvent?.(event))
    try {
      for (;;) {
        const { value, done: streamDone } = await reader.read()
        if (streamDone) break
        parser.push(decoder.decode(value, { stream: true }))
      }
      // 冲刷 decoder 尾部多字节字符
      parser.push(decoder.decode())
      callbacks.onDone?.()
    } catch (error) {
      if (abortController.signal.aborted) {
        callbacks.onAborted?.()
        return
      }
      callbacks.onError?.({
        kind: 'network',
        status: null,
        message: error instanceof Error ? error.message : '连接中断',
      })
    } finally {
      reader.releaseLock()
    }
  })()

  return {
    abort: () => abortController.abort(),
    done,
  }
}
