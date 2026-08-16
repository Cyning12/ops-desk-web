import axios from 'axios'

import { http, normalizeError, type ApiError } from './http'

/** 本接口单次超时（嵌入 + CE + 两次 LLM）；禁止改 http 全局 30s */
export const LC_EVIDENCE_TIMEOUT_MS = 120_000

/** 相对 http.baseURL=/api，实际路径 POST /api/ops/lc-evidence/invoke */
export const LC_EVIDENCE_INVOKE_PATH = '/ops/lc-evidence/invoke'

export const LC_EVIDENCE_UNAVAILABLE_MESSAGE = '旁路 API 不可用'

export interface EvidenceGrade {
  evidence_id: number
  relevance: string
  reason: string
}

export interface EvidenceItem {
  id: number
  source_type: string
  source_id: string
  chunk_index: number
  anchor: string
  title: string | null
  url: string | null
  /** 必含：与 freeze lc-evidence-http-v1 对齐 */
  snippet: string
  grade: EvidenceGrade
}

export interface LcEvidenceMeta {
  hit_count: number
  graded: boolean
  grade_count: number
  kept_count: number
  gate_action: string
  best_relevance: string
}

export interface LcEvidenceResult {
  query: string
  evidence: EvidenceItem[]
  answer: string
  meta: LcEvidenceMeta
}

export interface LcEvidenceErrorBody {
  code?: string
  message: string
}

interface LcEvidenceOkEnvelope {
  ok: true
  data: LcEvidenceResult
}

interface LcEvidenceFailEnvelope {
  ok: false
  error?: LcEvidenceErrorBody
}

type LcEvidenceEnvelope = LcEvidenceOkEnvelope | LcEvidenceFailEnvelope

export interface InvokeLcEvidenceOptions {
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
export function mapLcEvidenceError(error: unknown): ApiError {
  const apiError = asApiError(error)
  if (apiError.status === 404 || apiError.status === 502) {
    return { ...apiError, message: LC_EVIDENCE_UNAVAILABLE_MESSAGE }
  }
  const fromEnvelope = envelopeMessageFromRejected(apiError)
  if (fromEnvelope) {
    return { ...apiError, message: fromEnvelope }
  }
  return apiError
}

function isLcEvidenceResult(value: unknown): value is LcEvidenceResult {
  if (!isRecord(value)) return false
  if (typeof value.query !== 'string' || typeof value.answer !== 'string') return false
  if (!Array.isArray(value.evidence) || !isRecord(value.meta)) return false
  const hasSnippets = value.evidence.every(
    (item) => isRecord(item) && typeof item.snippet === 'string',
  )
  return (
    hasSnippets &&
    typeof value.meta.gate_action === 'string' &&
    typeof value.meta.best_relevance === 'string' &&
    typeof value.meta.kept_count === 'number'
  )
}

function unwrapEnvelope(envelope: unknown): LcEvidenceResult {
  if (isRecord(envelope) && envelope.ok === true && isLcEvidenceResult(envelope.data)) {
    return envelope.data
  }
  const message = failMessageFromEnvelope(envelope) ?? '调用失败'
  const err: ApiError = { status: 200, message, raw: envelope }
  throw err
}

/**
 * 调用 LangChain 旁路 invoke。仅本文件拆 {ok,data}。
 * 超时落在单次请求 config，不改 http 全局 timeout。
 */
export async function invokeLcEvidence(
  query: string,
  options: InvokeLcEvidenceOptions = {},
): Promise<LcEvidenceResult> {
  try {
    const { data: envelope } = await http.post<LcEvidenceEnvelope>(
      LC_EVIDENCE_INVOKE_PATH,
      { query },
      { timeout: LC_EVIDENCE_TIMEOUT_MS, signal: options.signal },
    )
    return unwrapEnvelope(envelope)
  } catch (error) {
    if (isCanceledError(error)) throw error
    throw mapLcEvidenceError(error)
  }
}
