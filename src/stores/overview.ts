import { ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchOverview } from '../api/overview'
import type { Overview } from '../api/overview'
import type { ApiError } from '../api/http'

/**
 * Overview 页数据状态：加载态 / 错误态 / 数据态三态。
 *
 * - `load()` 幂等保护：进行中的请求未完成前重复调用直接返回（不并发打接口）。
 * - 失败不污染已有数据：保留上一次成功的 data，error 供页面展示重试。
 */
export const useOverviewStore = defineStore('overview', () => {
  const data = ref<Overview | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  async function load(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      data.value = await fetchOverview()
    } catch (e) {
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
})
