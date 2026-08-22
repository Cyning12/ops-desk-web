import { ref } from 'vue'
import { defineStore } from 'pinia'

import type { ApiError } from '../api/http'
import {
  invokeLgRag,
  isCanceledError,
  type LgRagInvokeRequest,
  type LgRagMode,
  type LgRagResult,
} from '../api/lgRag'

/**
 * lg_rag 旁路页状态：query / mode / threadId / loading / result / error / 等待秒数。
 * route=refuse / gate_action=refuse 是 200 成功态，写入 result，不是 error。
 */
export const useLgRagStore = defineStore('lgRag', () => {
  const query = ref('')
  const mode = ref<LgRagMode>('router')
  const threadId = ref('')
  const loading = ref(false)
  const result = ref<LgRagResult | null>(null)
  const error = ref<ApiError | null>(null)
  /** 已等待秒数（loading 期间计时） */
  const elapsedSeconds = ref(0)

  let abortController: AbortController | null = null
  let timer: ReturnType<typeof setInterval> | null = null

  function stopTimer(): void {
    if (timer !== null) {
      clearInterval(timer)
      timer = null
    }
  }

  function abort(): void {
    abortController?.abort()
  }

  /** 「用此 thread_id 继续」：把响应 thread_id 回填到输入框（进程内有效） */
  function useThreadId(): void {
    if (result.value) threadId.value = result.value.thread_id
  }

  async function invoke(nextQuery: string, nextMode: LgRagMode, nextThreadId: string): Promise<void> {
    abort()
    stopTimer()
    abortController = new AbortController()
    const signal = abortController.signal

    query.value = nextQuery
    mode.value = nextMode
    threadId.value = nextThreadId
    loading.value = true
    error.value = null
    result.value = null
    elapsedSeconds.value = 0
    timer = setInterval(() => {
      elapsedSeconds.value += 1
    }, 1000)

    const request: LgRagInvokeRequest = { query: nextQuery, mode: nextMode }
    const tid = nextThreadId.trim()
    if (tid) request.thread_id = tid

    try {
      result.value = await invokeLgRag(request, { signal })
    } catch (e) {
      if (isCanceledError(e) || signal.aborted) {
        return
      }
      error.value = e as ApiError
    } finally {
      stopTimer()
      loading.value = false
    }
  }

  return {
    query,
    mode,
    threadId,
    loading,
    result,
    error,
    elapsedSeconds,
    invoke,
    abort,
    useThreadId,
  }
})
