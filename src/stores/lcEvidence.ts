import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ApiError } from '../api/http'
import { invokeLcEvidence, isCanceledError, type LcEvidenceResult } from '../api/lcEvidence'

/**
 * LC Evidence 旁路页状态：query / loading / result / error。
 * gate_action=refuse 是 200 成功态，写入 result，不是 error。
 */
export const useLcEvidenceStore = defineStore('lcEvidence', () => {
  const query = ref('')
  const loading = ref(false)
  const result = ref<LcEvidenceResult | null>(null)
  const error = ref<ApiError | null>(null)

  let abortController: AbortController | null = null

  function abort(): void {
    abortController?.abort()
  }

  async function invoke(nextQuery: string): Promise<void> {
    abort()
    abortController = new AbortController()
    const signal = abortController.signal

    query.value = nextQuery
    loading.value = true
    error.value = null
    result.value = null

    try {
      result.value = await invokeLcEvidence(nextQuery, { signal })
    } catch (e) {
      if (isCanceledError(e) || signal.aborted) {
        return
      }
      error.value = e as ApiError
    } finally {
      loading.value = false
    }
  }

  return {
    query,
    loading,
    result,
    error,
    invoke,
    abort,
  }
})
