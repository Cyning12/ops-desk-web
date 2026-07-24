import { http } from './http'

/**
 * Pull Requests 接口封装（契约：GET /api/ops/pulls，00 实测 200）。
 * 响应直取，无包装外壳：{ items, total, page, page_size }
 */

export interface PullItem {
  id: string
  number: number
  title: string
  state: string
  draft: boolean
  ci_status: string | null
  updated_at: string
}

export interface PullsListResponse {
  items: PullItem[]
  total: number
  page: number
  page_size: number
}

export interface FetchPullsParams {
  state?: string
  ci_status?: string
  page?: number
  page_size?: number
}

/** PR state 筛选项（可配置常量） */
export const PULL_STATE_OPTIONS = ['open', 'closed', 'merged'] as const

/** CI 状态筛选项（可配置常量） */
export const PULL_CI_STATUS_OPTIONS = ['success', 'failure', 'pending'] as const

/** 拉取 PR 列表；空值筛选参数由调用方剔除 */
export async function fetchPulls(params: FetchPullsParams = {}): Promise<PullsListResponse> {
  const { data } = await http.get<PullsListResponse>('/ops/pulls', { params })
  return data
}
