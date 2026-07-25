import { http } from './http'

/**
 * Issues 接口封装（契约：ops-desk-api GET /api/ops/issues，实测 200）。
 * 响应直取，无包装外壳：{ items, total, page, page_size }。
 * 后端按 updated_at desc 固定排序，前端不做排序。
 */

export interface IssueItem {
  id: string
  number: number
  title: string
  /** open / closed（后端自由字符串） */
  state: string
  labels: string[]
  module_tag: string | null
  /** ISO 时间字符串；后端个别行可能为 null */
  updated_at: string | null
}

export interface IssuesListResponse {
  items: IssueItem[]
  total: number
  page: number
  page_size: number
}

export interface FetchIssuesParams {
  state?: string
  label?: string
  module?: string
  scan_status?: string
  page?: number
  page_size?: number
}

/** 查询 issues 列表；值为 undefined 或空字符串的参数不拼进 query */
export async function fetchIssues(params: FetchIssuesParams = {}): Promise<IssuesListResponse> {
  const query: Record<string, string | number> = {}
  const { state, label, module, scan_status, page, page_size } = params
  if (state) query.state = state
  if (label) query.label = label
  if (module) query.module = module
  if (scan_status) query.scan_status = scan_status
  if (page !== undefined) query.page = page
  if (page_size !== undefined) query.page_size = page_size
  const { data } = await http.get<IssuesListResponse>('/ops/issues', { params: query })
  return data
}
