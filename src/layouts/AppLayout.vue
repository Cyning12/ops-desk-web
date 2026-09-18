<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/http'
import { PILOT_TENANTS } from '../tenant'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activePath = computed(() => route.path)

async function onLogout(): Promise<void> {
  await auth.logout()
  await router.push('/login')
}

async function onTenantChange(value: string): Promise<void> {
  try {
    await auth.switchTenant(value)
  } catch (error) {
    const apiError = error as ApiError
    const message =
      apiError.status === null
        ? '租户切换失败：服务不可达'
        : apiError.message || `租户切换失败（HTTP ${apiError.status ?? '?'}）`
    ElMessage.error(message)
  }
}
</script>

<template>
  <el-container class="app-layout">
    <el-aside width="200px" class="app-layout__aside">
      <div class="app-layout__brand">Ops Desk</div>
      <el-menu :default-active="activePath" router class="app-layout__menu">
        <el-menu-item index="/overview">Overview</el-menu-item>
        <el-menu-item index="/obs">Observability</el-menu-item>
        <el-menu-item index="/issues">Issues</el-menu-item>
        <el-menu-item index="/pulls">Pulls</el-menu-item>
        <el-menu-item index="/graph">Graph</el-menu-item>
        <el-menu-item index="/chat">Chat</el-menu-item>
        <el-menu-item index="/lc-evidence">LC Evidence</el-menu-item>
        <el-menu-item index="/lg-rag">LG RAG</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-layout__header" height="56px">
        <span class="app-layout__title">{{ route.meta.title ?? 'Ops Desk' }}</span>
        <div class="app-layout__user">
          <span class="app-layout__tenant-label" data-testid="current-tenant">{{ auth.tenantId }}</span>
          <el-select
            :model-value="auth.tenantId"
            size="small"
            class="app-layout__tenant"
            data-testid="tenant-switch"
            @change="onTenantChange"
          >
            <el-option v-for="id in PILOT_TENANTS" :key="id" :label="id" :value="id" />
          </el-select>
          <span class="app-layout__username">{{ auth.user?.username ?? '' }}</span>
          <el-button size="small" @click="onLogout">登出</el-button>
        </div>
      </el-header>
      <el-main class="app-layout__main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-layout {
  height: 100vh;
  background: var(--ops-bg);
  color: var(--ops-text);
}

.app-layout__aside {
  border-right: 1px solid var(--ops-border);
  background: var(--ops-bg-paper);
  display: flex;
  flex-direction: column;
}

.app-layout__brand {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-weight: 600;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--ops-border);
}

.app-layout__menu {
  border-right: none;
  background: transparent;
}

.app-layout__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--ops-border);
  background: var(--ops-bg);
}

.app-layout__title {
  font-size: 16px;
  font-weight: 600;
}

.app-layout__user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.app-layout__username {
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.app-layout__tenant {
  width: 200px;
}

.app-layout__tenant-label {
  font-size: 12px;
  color: var(--ops-text-secondary);
}

.app-layout__main {
  padding: 24px;
}
</style>
