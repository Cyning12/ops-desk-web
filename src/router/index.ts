import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'

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
    meta: { title: '登录' },
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
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${String(title)} · Ops Desk` : 'Ops Desk'
})

export default router
