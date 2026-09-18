import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchMe, login as apiLogin, logout as apiLogout, switchTenant as apiSwitchTenant } from '../api/auth'
import type { AuthUser } from '../api/auth'
import type { ApiError } from '../api/http'
import { getStoredTenant, setStoredTenant, TENANT_STORAGE_KEY } from '../tenant'

/**
 * 会话状态（HttpOnly cookie 会话，前端不接触 token）。
 *
 * - `ensureMe()` 幂等：首次调用拉 /me 并缓存结果；并发调用共享同一请求；
 *   401 视为"未登录"（user=null，不抛异常）；网络错误不缓存，下次导航重试。
 * - 401 拦截器可调用 `clearSession()` 同步失效本地状态。
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const tenantId = ref(getStoredTenant())
  /** 首次会话探测是否已有确定结果（200 或 401） */
  const ready = ref(false)
  let inflight: Promise<AuthUser | null> | null = null

  const isLoggedIn = computed(() => user.value !== null)

  async function ensureMe(): Promise<AuthUser | null> {
    if (ready.value) return user.value
    inflight ??= (async () => {
      try {
        const me = await fetchMe()
        user.value = me.user
        tenantId.value = me.tenantId
        ready.value = true
      } catch (error) {
        const apiError = error as ApiError
        // 401 = 未登录/会话过期：确定的"未登录"结论，缓存之
        // 其他错误（如服务不可达）：不缓存，留待下次导航重试
        if (apiError.status === 401) ready.value = true
        user.value = null
      } finally {
        inflight = null
      }
      return user.value
    })()
    return inflight
  }

  async function login(username: string, inviteToken: string): Promise<void> {
    user.value = await apiLogin(username, inviteToken)
    tenantId.value = getStoredTenant()
    ready.value = true
  }

  async function switchTenant(next: string): Promise<void> {
    tenantId.value = await apiSwitchTenant(next)
  }

  async function logout(): Promise<void> {
    try {
      await apiLogout()
    } catch {
      // 忽略登出请求失败（如 session 已过期）：本地登出语义永远成立
    } finally {
      clearSession()
    }
  }

  /** 清空本地会话状态（供 401 拦截器 / logout 使用） */
  function clearSession(): void {
    user.value = null
    tenantId.value = getStoredTenant()
    ready.value = true
    // T3（R1-N1）：登出/401 同步清 lg-rag thread_id 本地持久化，避免同浏览器换账号串号。
    // 键名与 stores/chat.ts LG_RAG_THREAD_ID_STORAGE_KEY 保持一致（避免 auth→chat 循环 import，此处直写）
    // T4：active-run 续看游标同清（键名对齐 chat.ts LG_RAG_ACTIVE_RUN_STORAGE_KEY）——换账号后 replay 必 404/401，残留只会误导
    try {
      window.localStorage.removeItem('ops.lg-rag.thread-id')
      window.localStorage.removeItem('ops.lg-rag.active-run')
      window.localStorage.removeItem(TENANT_STORAGE_KEY)
    } catch {
      // localStorage 不可用：静默降级
    }
    setStoredTenant('ops-desk-pilot')
    tenantId.value = 'ops-desk-pilot'
  }

  return { user, tenantId, ready, isLoggedIn, ensureMe, login, logout, clearSession, switchTenant }
})
