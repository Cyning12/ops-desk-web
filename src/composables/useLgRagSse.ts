/**
 * lg-rag SSE 消费封装（freeze lg-rag-sse-v1 · 契约：api 05_lg_rag_transport_and_session_plan_v0 §4.2）。
 *
 * 原生 fetch + ReadableStream（不依赖 fetch-event-source）：
 * - POST /api/ops/lg-rag/stream，body {query, mode, thread_id?}
 * - cookie 鉴权：credentials: 'include'
 * - SSE 帧以 `\n\n` 分割，取 `data:` 行 JSON 解析（event_type 以 data JSON 为准，不依赖 `event:` 行）
 * - 跨 chunk 半帧缓冲拼接；坏 JSON 行跳过不崩溃
 * - fetch 无原生 timeout：AbortController + 计时器实现 client timeout（≥300s，对齐 supervisor 实测 100–250s）
 * - AbortController 中断；HTTP 非 2xx / 网络错误 / 超时走 onError 回调
 *
 * 与 chat SSE（useOpsChatSse）差异：T2 事件为节点 updates + 整段 answer，
 * 不兼容 chat thinking 全集；主 Chat 一律走本封装，禁止 import useOpsChatSse。
 */

/** lg-rag SSE 事件帧（data JSON 解码后 · api §4.2） */
export interface LgRagSseEvent {
  run_id?: string
  seq?: number
  ts_ms?: number
  agent_role?: string
  /** run.start · node.progress · subtask.progress · answer · done · error */
  event_type: string
  payload?: Record<string, unknown>
}

/** SSE 传输层错误（区别于事件流内的 error 事件） */
export interface LgRagSseTransportError {
  /** 'http' = 响应非 2xx；'network' = fetch 失败/连接中断；'timeout' = client 超时中止 */
  kind: 'http' | 'network' | 'timeout'
  /** HTTP 状态码；网络层失败/超时为 null */
  status: number | null
  message: string
}

export interface LgRagSseCallbacks {
  /** 每个合法事件帧回调一次（含 run.start/node.progress/subtask.progress/answer/done/error） */
  onEvent?: (event: LgRagSseEvent) => void
  /** HTTP 非 2xx（如 401/422）、网络错误或 client 超时 */
  onError?: (error: LgRagSseTransportError) => void
  /** 流正常读完（最后一次事件之后） */
  onDone?: () => void
  /** 被用户 abort() 中断（不再触发 onError/onDone；超时中止走 onError kind='timeout'） */
  onAborted?: () => void
}

export interface LgRagSseController {
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
export class LgRagSseFrameParser {
  private buffer = ''

  constructor(private readonly emit: (event: LgRagSseEvent) => void) {}

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
        this.emit(parsed as LgRagSseEvent)
      }
    }
  }
}

/** 实际请求路径（dev 经 Vite proxy /api → 127.0.0.1:8000） */
export const LG_RAG_STREAM_PATH = '/api/ops/lg-rag/stream'

/** client 超时（对齐 lgRag invoke 页 supervisor 实测 100–250s · SPEC §0 ≥300000ms） */
export const LG_RAG_STREAM_TIMEOUT_MS = 300_000

export type LgRagStreamMode = 'router' | 'basic' | 'supervisor'

export interface StreamLgRagInput {
  /** 1..8000 字（前端预检在调用方/store；本层不截断） */
  query: string
  /** 缺省 supervisor（与 api T2 默认一致） */
  mode?: LgRagStreamMode
  /** T2 留空由 api 生成；多轮语义属 T3 */
  threadId?: string
}

/** 发起 lg-rag SSE 流式请求；返回控制器（abort 中断） */
export function streamLgRag(
  input: StreamLgRagInput,
  callbacks: LgRagSseCallbacks = {},
): LgRagSseController {
  const abortController = new AbortController()
  /** 区分用户主动 abort 与 client 超时中止 */
  let timedOut = false
  const timeoutTimer = setTimeout(() => {
    timedOut = true
    abortController.abort()
  }, LG_RAG_STREAM_TIMEOUT_MS)

  const body: Record<string, unknown> = {
    query: input.query,
    mode: input.mode ?? 'supervisor',
  }
  if (input.threadId) body.thread_id = input.threadId

  const done = (async () => {
    let response: Response
    try {
      response = await fetch(LG_RAG_STREAM_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
        credentials: 'include',
        body: JSON.stringify(body),
        signal: abortController.signal,
      })
    } catch (error) {
      if (abortController.signal.aborted) {
        if (timedOut) {
          callbacks.onError?.({
            kind: 'timeout',
            status: null,
            message: `响应超时（>${LG_RAG_STREAM_TIMEOUT_MS / 1000}s），请稍后重试`,
          })
        } else {
          callbacks.onAborted?.()
        }
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
    const parser = new LgRagSseFrameParser((event) => callbacks.onEvent?.(event))
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
        if (timedOut) {
          callbacks.onError?.({
            kind: 'timeout',
            status: null,
            message: `响应超时（>${LG_RAG_STREAM_TIMEOUT_MS / 1000}s），请稍后重试`,
          })
        } else {
          callbacks.onAborted?.()
        }
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

  void done.finally(() => clearTimeout(timeoutTimer))

  return {
    abort: () => abortController.abort(),
    done,
  }
}
