import { ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchGraph } from '../api/graph'
import type { GraphResponse } from '../api/graph'
import type { ApiError } from '../api/http'

/**
 * Graph 页状态：加载 / 错误 / 数据三态。
 *
 * - `load()` 幂等防重入：进行中的请求未结束时重复调用直接返回；
 *   失败后可通过再次调用（或页面「重试」按钮）重新拉取，成功后清除旧 error。
 * - 全 null 响应（当前后端实际状态）是正常数据态，不视为错误。
 */
export const useGraphStore = defineStore('graph', () => {
  const data = ref<GraphResponse | null>(null)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)
  /** 是否已成功加载过至少一次 */
  const loaded = ref(false)

  async function load(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      data.value = await fetchGraph()
      loaded.value = true
    } catch (e) {
      // http 拦截器已将错误规范化为 ApiError
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  function reset(): void {
    data.value = null
    loading.value = false
    error.value = null
    loaded.value = false
  }

  return { data, loading, error, loaded, load, reset }
})
