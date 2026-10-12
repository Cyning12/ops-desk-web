import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  fetchAdminCapabilityCatalog,
  fetchCapabilityMine,
  type CapabilityItem,
  type CapabilityManifestSummary,
} from '../api/capability'
import type { ApiError } from '../api/http'
import { useAuthStore } from './auth'

/**
 * Capability 目录页 store（task_web_capability_catalog · F5）。
 *
 * - load()：拉 GET /capability/mine 可见集（九键投影 · {items,count} 照登）；
 *   失败写 error（ApiError），不抛未捕获异常；401 由 http 拦截器跳登录（复用既有）。
 * - maintainer 面：/auth/me role 驱动——role === 'maintainer' 才请求
 *   GET /admin/capability/catalog（只取 summary 两键）；普通用户**零探测面**
 *   （不渲染不请求 · manifest 恒 null）。
 * - manifest 故障与可见集故障分列：admin 面失败不影响可见集表渲染。
 */
export const useCapabilityStore = defineStore('capability', () => {
  const items = ref<CapabilityItem[]>([])
  const count = ref(0)
  const loading = ref(false)
  const error = ref<ApiError | null>(null)

  /** maintainer 故障详情（普通用户恒 null · 零探测面） */
  const manifest = ref<CapabilityManifestSummary | null>(null)
  const manifestLoading = ref(false)
  const manifestError = ref<ApiError | null>(null)

  /** 空集态（items=[] · 非加载 · 非故障） */
  const isEmpty = computed(
    () => !loading.value && error.value === null && items.value.length === 0,
  )

  async function load(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const mine = await fetchCapabilityMine()
      items.value = mine.items
      count.value = mine.count
    } catch (e) {
      error.value = e as ApiError
      items.value = []
      count.value = 0
    } finally {
      loading.value = false
    }

    // maintainer 故障详情：/auth/me role 驱动显隐（非前端硬编码账号）；
    // 普通用户零探测面——不请求 admin 端点，manifest 态恒 null
    const auth = useAuthStore()
    if (auth.user?.role === 'maintainer') {
      await loadManifest()
    } else {
      manifest.value = null
      manifestError.value = null
    }
  }

  async function loadManifest(): Promise<void> {
    if (manifestLoading.value) return
    manifestLoading.value = true
    manifestError.value = null
    try {
      manifest.value = await fetchAdminCapabilityCatalog()
    } catch (e) {
      manifestError.value = e as ApiError
      manifest.value = null
    } finally {
      manifestLoading.value = false
    }
  }

  return {
    items,
    count,
    loading,
    error,
    isEmpty,
    manifest,
    manifestLoading,
    manifestError,
    load,
    loadManifest,
  }
})
