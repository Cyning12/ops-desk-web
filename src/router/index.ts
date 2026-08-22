import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import { setUnauthorizedHandler } from '../api/http'
import { useAuthStore } from '../stores/auth'

/**
 * v1 路由槽位（W1 一次性声明，避免 W2–W7 并行改 router 冲突）。
 * 登录页不带 AppLayout；其余页面挂在 AppLayout 侧边导航下。
 * 各占位视图将在 W2–W7 替换为真实实现。
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: '登录', public: true },
  },
  {
    path: '/',
    component: AppLayout,
    redirect: '/overview',
    children: [
      {
        path: 'overview',
        name: 'overview',
        component: () => import('../views/OverviewView.vue'),
        meta: { title: 'Overview' },
      },
      {
        path: 'obs',
        name: 'obs',
        component: () => import('../views/ObsView.vue'),
        meta: { title: 'Observability' },
      },
      {
        path: 'issues',
        name: 'issues',
        component: () => import('../views/IssuesView.vue'),
        meta: { title: 'Issues' },
      },
      {
        path: 'pulls',
        name: 'pulls',
        component: () => import('../views/PullsView.vue'),
        meta: { title: 'Pulls' },
      },
      {
        path: 'graph',
        name: 'graph',
        component: () => import('../views/GraphView.vue'),
        meta: { title: 'Graph' },
      },
      {
        path: 'chat',
        name: 'chat',
        component: () => import('../views/ChatView.vue'),
        meta: { title: 'Chat' },
      },
      {
        path: 'lc-evidence',
        name: 'lc-evidence',
        component: () => import('../views/LcEvidenceView.vue'),
        meta: { title: 'LC Evidence' },
      },
      {
        path: 'lg-rag',
        name: 'lg-rag',
        component: () => import('../views/LgRagView.vue'),
        meta: { title: 'LG RAG' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

/**
 * 认证守卫：
 * - 首次导航等待 ensureMe 会话探测完成后再放行（刷新页面恢复会话）
 * - 非 public 路由未登录 → /login?redirect=<原路径>
 * - 已登录访问 /login → /overview
 */
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.ensureMe()

  if (to.meta.public) {
    if (to.name === 'login' && auth.isLoggedIn) return { path: '/overview' }
    return true
  }
  if (!auth.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
  return true
})

/**
 * 401 拦截落地：会话失效时清空本地状态并跳 /login。
 * 首次导航期间（currentRoute 尚未匹配任何记录）不主动跳转，交给守卫重定向，
 * 避免与守卫的双重重定向；/login 页内不跳转（避免循环）。
 */
setUnauthorizedHandler(() => {
  const auth = useAuthStore()
  auth.clearSession()
  const current = router.currentRoute.value
  if (current.matched.length > 0 && !current.meta.public) {
    void router.push({ path: '/login', query: { redirect: current.fullPath } })
  }
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${String(title)} · Ops Desk` : 'Ops Desk'
})

export default router
