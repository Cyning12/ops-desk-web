import { AxiosError } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { describe, expect, it } from 'vitest'

import { http, normalizeError } from '../src/api/http'

describe('api/http axios 实例', () => {
  it('baseURL 为 /api 且携带 Cookie 凭证', () => {
    expect(http.defaults.baseURL).toBe('/api')
    expect(http.defaults.withCredentials).toBe(true)
    expect(typeof http.defaults.timeout).toBe('number')
  })

  it('normalizeError 提取 FastAPI 风格 detail 与状态码', () => {
    const response = {
      status: 422,
      data: { detail: '参数校验失败' },
      statusText: 'Unprocessable Entity',
      headers: {},
      config: { headers: {} } as InternalAxiosRequestConfig,
    } as AxiosResponse
    const axiosError = new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, response)

    const err = normalizeError(axiosError)
    expect(err.status).toBe(422)
    expect(err.message).toBe('参数校验失败')
    expect(err.detail).toBe('参数校验失败')
  })

  it('normalizeError 对非 axios 错误兜底', () => {
    const err = normalizeError(new Error('boom'))
    expect(err.status).toBeNull()
    expect(err.message).toBe('boom')
  })
})
