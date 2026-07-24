import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchPulls } from '../api/pulls'
import type { FetchPullsParams, PullItem } from '../api/pulls'
import type { ApiError } from '../api/http'

export interface PullsFilters {
  /** '' 表示不筛选 */
  state: string
  ci_status: string
}

const DEFAULT_PAGE_SIZE = 20

/**
 * Pull Requests 列表状态。
 *
 * - 筛选（state / ci_status）变更时 page 重置为 1 并重新请求；
 * - 空值筛选参数在拼装请求时剔除，不发送给后端；
 * - 接口错误写入 `error`（ApiError），页面展示 el-alert + 重试。
 */
export const usePullsStore = defineStore('pulls', () => {
  const items = ref<PullItem[]>([])
  const total = ref(0)
  const page = ref(1)
  const pageSize = ref(DEFAULT_PAGE_SIZE)
  const filters = reactive<PullsFilters>({ state: '', ci_status: '' })
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  /** 拼装请求参数：剔除空筛选，带上分页 */
  function buildParams(): FetchPullsParams {
    const params: FetchPullsParams = { page: page.value, page_size: pageSize.value }
    if (filters.state) params.state = filters.state
    if (filters.ci_status) params.ci_status = filters.ci_status
    return params
  }

  async function load(): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const data = await fetchPulls(buildParams())
      items.value = data.items
      total.value = data.total
      page.value = data.page
      pageSize.value = data.page_size
    } catch (err) {
      error.value = err as ApiError
      items.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  /** 更新筛选并回到第一页重新加载 */
  async function setFilter(key: keyof PullsFilters, value: string): Promise<void> {
    if (filters[key] === value) return
    filters[key] = value
    page.value = 1
    await load()
  }

  async function setPage(value: number): Promise<void> {
    if (page.value === value) return
    page.value = value
    await load()
  }

  async function setPageSize(value: number): Promise<void> {
    if (pageSize.value === value) return
    pageSize.value = value
    page.value = 1
    await load()
  }

  /** 错误态重试：按当前筛选/分页重新请求 */
  async function retry(): Promise<void> {
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
    buildParams,
    load,
    setFilter,
    setPage,
    setPageSize,
    retry,
  }
})
