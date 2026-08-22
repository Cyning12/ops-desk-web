import axios from 'axios'

import { http, normalizeError, type ApiError } from './http'

/** 本接口单次超时（supervisor 复合 query 实测 100–250s）；禁止改 http 全局 30s */
export const LG_RAG_TIMEOUT_MS = 300_000

/** 相对 http.baseURL=/api，实际路径 POST /api/ops/lg-rag/invoke */
export const LG_RAG_INVOKE_PATH = '/ops/lg-rag/invoke'

export const LG_RAG_UNAVAILABLE_MESSAGE = '旁路 API 不可用'

export type LgRagMode = 'router' | 'basic' | 'supervisor'
export type LgRagRoute = 'rag' | 'direct' | 'refuse' | ''

export interface LgRagChainMeta {
  gate_action: string
  hit_count: number
  kept_count: number
  best_relevance: string
  grade_count: number
}

export interface LgRagSubtaskResult {
  // supervisor 子任务结果；字段以后端 freeze 为准，v1 先宽松为 Record<string, unknown>
  [key: string]: unknown
}

export interface LgRagResult {
  answer: string
  mode: LgRagMode
  thread_id: string
  route: LgRagRoute
  retry_count: number
  chain_meta: LgRagChainMeta
  subtasks: unknown[]
  subtask_results: LgRagSubtaskResult[]
}

export interface LgRagInvokeRequest {
  query: string
  mode?: LgRagMode
  thread_id?: string
}

interface LgRagErrorBody {
  code?: string
  message: string
}

interface LgRagOkEnvelope {
  ok: true
  data: LgRagResult
}

interface LgRagFailEnvelope {
  ok: false
  error?: LgRagErrorBody
}

type LgRagEnvelope = LgRagOkEnvelope | LgRagFailEnvelope

export interface InvokeLgRagOptions {
  signal?: AbortSignal
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiError(error: unknown): error is ApiError {
  return isRecord(error) && 'status' in error && 'message' in error && 'raw' in error
}

function failMessageFromEnvelope(envelope: unknown): string | undefined {
  if (!isRecord(envelope)) return undefined
  const err = envelope.error
  if (isRecord(err) && typeof err.message === 'string' && err.message) {
    return err.message
  }
  return undefined
}

/** 识别 axios / AbortController 取消，供 store 不写入 error */
export function isCanceledError(error: unknown): boolean {
  if (axios.isCancel(error)) return true
  if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') return true
  if (error instanceof DOMException && error.name === 'AbortError') return true
  if (isApiError(error) && (error.message === 'canceled' || error.message === 'AbortError')) {
    return true
  }
  return false
}

function asApiError(error: unknown): ApiError {
  if (isApiError(error)) return error
  return normalizeError(error)
}

function envelopeMessageFromRejected(error: ApiError): string | undefined {
  if (!axios.isAxiosError(error.raw)) return undefined
  return failMessageFromEnvelope(error.raw.response?.data)
}

/** 404/502 统一文案；500 兼容 FastAPI detail 与 {ok:false,error} */
export function mapLgRagError(error: unknown): ApiError {
  const apiError = asApiError(error)
  if (apiError.status === 404 || apiError.status === 502) {
    return { ...apiError, message: LG_RAG_UNAVAILABLE_MESSAGE }
  }
  const fromEnvelope = envelopeMessageFromRejected(apiError)
  if (fromEnvelope) {
    return { ...apiError, message: fromEnvelope }
  }
  return apiError
}

function isLgRagResult(value: unknown): value is LgRagResult {
  if (!isRecord(value)) return false
  if (typeof value.answer !== 'string') return false
  if (typeof value.mode !== 'string') return false
  if (typeof value.thread_id !== 'string') return false
  if (typeof value.route !== 'string') return false
  if (typeof value.retry_count !== 'number') return false
  if (!isRecord(value.chain_meta)) return false
  return Array.isArray(value.subtasks) && Array.isArray(value.subtask_results)
}

function unwrapEnvelope(envelope: unknown): LgRagResult {
  if (isRecord(envelope) && envelope.ok === true && isLgRagResult(envelope.data)) {
    return envelope.data
  }
  const message = failMessageFromEnvelope(envelope) ?? '调用失败'
  const err: ApiError = { status: 200, message, raw: envelope }
  throw err
}

/**
 * 调用 lg_rag 旁路 invoke（freeze lg-rag-http-v1，非流式）。仅本文件拆 {ok,data}。
 * 超时落在单次请求 config，不改 http 全局 timeout。
 * refuse（route / gate_action）是 200 成功态，由调用方写入 result。
 */
export async function invokeLgRag(
  request: LgRagInvokeRequest,
  options: InvokeLgRagOptions = {},
): Promise<LgRagResult> {
  const body: LgRagInvokeRequest = { query: request.query }
  if (request.mode) body.mode = request.mode
  if (request.thread_id) body.thread_id = request.thread_id
  try {
    const { data: envelope } = await http.post<LgRagEnvelope>(LG_RAG_INVOKE_PATH, body, {
      timeout: LG_RAG_TIMEOUT_MS,
      signal: options.signal,
    })
    return unwrapEnvelope(envelope)
  } catch (error) {
    if (isCanceledError(error)) throw error
    throw mapLgRagError(error)
  }
}
