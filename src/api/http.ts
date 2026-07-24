import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'

/**
 * 统一 API 客户端。
 *
 * 约定（与 ops-desk-api 对齐）：
 * - baseURL 为 `/api`，dev 环境经 Vite proxy 转发到 http://localhost:8000
 * - Cookie 会话认证：`withCredentials: true`
 * - 后端响应为 snake_case、无 `{ ok, data }` 包装外壳 —— 不做任何包装/转换，
 *   调用方直接拿到后端原始响应体
 */

/** 规范化后的错误结构，供页面/组件统一消费 */
export interface ApiError {
  /** HTTP 状态码；网络层失败（无响应）时为 null */
  status: number | null
  /** 面向用户/日志的错误信息 */
  message: string
  /** 后端返回的 detail 字段（FastAPI 风格），原样保留 */
  detail?: unknown
  /** 原始错误对象 */
  raw: unknown
}

/** 将 axios/网络/未知错误规范化为 ApiError */
export function normalizeError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? null
    const data = error.response?.data as { detail?: unknown; message?: string } | undefined
    const message =
      (typeof data?.detail === 'string' && data.detail) ||
      data?.message ||
      error.message ||
      '网络请求失败'
    return { status, message, detail: data?.detail, raw: error }
  }
  return {
    status: null,
    message: error instanceof Error ? error.message : '未知错误',
    raw: error,
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 30_000,
})

http.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: unknown) => {
    const apiError = normalizeError(error)
    if (apiError.status === 401) {
      // TODO(W2 web-login): 登录态失效 —— 在此清空会话并跳转 /login
      // （注意避免在 /login 页面自身触发循环跳转）
    }
    return Promise.reject(apiError)
  },
)

export default http
