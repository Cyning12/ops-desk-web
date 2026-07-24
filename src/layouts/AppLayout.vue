<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const activePath = computed(() => route.path)
</script>

<template>
  <el-container class="app-layout">
    <el-aside width="200px" class="app-layout__aside">
      <div class="app-layout__brand">Ops Desk</div>
      <el-menu :default-active="activePath" router class="app-layout__menu">
        <el-menu-item index="/overview">Overview</el-menu-item>
        <el-menu-item index="/issues">Issues</el-menu-item>
        <el-menu-item index="/pulls">Pulls</el-menu-item>
        <el-menu-item index="/graph">Graph</el-menu-item>
        <el-menu-item index="/chat">Chat</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="app-layout__header" height="56px">
        <span class="app-layout__title">{{ route.meta.title ?? 'Ops Desk' }}</span>
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
  border-bottom: 1px solid var(--ops-border);
  background: var(--ops-bg);
}

.app-layout__title {
  font-size: 16px;
  font-weight: 600;
}

.app-layout__main {
  padding: 24px;
}
</style>
