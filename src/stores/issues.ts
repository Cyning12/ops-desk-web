import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchIssues } from '../api/issues'
import type { FetchIssuesParams, IssueItem } from '../api/issues'
import type { ApiError } from '../api/http'

/** Issues 筛选条件（空字符串表示不筛选，不拼进 query） */
export interface IssueFilters {
  state: string
  label: string
  module: string
  scan_status: string
}

export function emptyIssueFilters(): IssueFilters {
  return { state: '', label: '', module: '', scan_status: '' }
}

/** 由筛选 + 分页状态拼装请求参数（纯函数，便于单测） */
export function buildIssueParams(
  filters: IssueFilters,
  page: number,
  pageSize: number,
): FetchIssuesParams {
  const params: FetchIssuesParams = { page, page_size: pageSize }
  if (filters.state) params.state = filters.state
  if (filters.label) params.label = filters.label
  if (filters.module) params.module = filters.module
  if (filters.scan_status) params.scan_status = filters.scan_status
  return params
}

/**
 * Issues 列表状态：筛选 + 分页 + 加载/错误态。
 *
 * - `applyFilters()`：应用筛选并将 page 重置为 1 后重新请求
 * - `setPage()` / `setPageSize()`：分页切换重新请求（pageSize 变更同样重置 page=1）
 * - 请求失败不抛异常，写入 `error` 供页面展示 el-alert + 重试
 */
export const useIssuesStore = defineStore('issues', () => {
  const items = ref<IssueItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(20)
  const filters = reactive<IssueFilters>(emptyIssueFilters())
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await fetchIssues(buildIssueParams(filters, page.value, pageSize.value))
      items.value = data.items
      total.value = data.total
      page.value = data.page
      pageSize.value = data.page_size
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  /** 应用筛选（部分更新），page 重置为 1 并重新请求 */
  async function applyFilters(patch: Partial<IssueFilters>): Promise<void> {
    Object.assign(filters, patch)
    page.value = 1
    await load()
  }

  /** 重置全部筛选并重新请求 */
  async function resetFilters(): Promise<void> {
    Object.assign(filters, emptyIssueFilters())
    page.value = 1
    await load()
  }

  /** 切换页码并重新请求 */
  async function setPage(nextPage: number): Promise<void> {
    page.value = nextPage
    await load()
  }

  /** 切换每页条数，page 重置为 1 并重新请求 */
  async function setPageSize(nextSize: number): Promise<void> {
    pageSize.value = nextSize
    page.value = 1
    await load()
  }

  return {
    items,
    total,
    page,
    pageSize,
    filters,
    loading,
    error,
    load,
    applyFilters,
    resetFilters,
    setPage,
    setPageSize,
  }
})
