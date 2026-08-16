/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return
          // 框架 vendor：vue 全家桶独立成 chunk（缓存稳定）
          if (/[\\/]node_modules[\\/](vue|vue-router|pinia|@vue)[\\/]/.test(id)) {
            return 'vendor-vue'
          }
          if (id.includes('@element-plus/icons-vue')) return 'vendor-ep-icons'
          // element-plus 桶文件（re-export 全部组件）显式归入独立 chunk，
          // 避免被 Rollup 自动并入某个组件 chunk 造成循环依赖
          if (/element-plus[\\/]es[\\/](index|component|defaults|plugins|make-installer|plugin)\.mjs$/.test(id)) {
            return 'vendor-ep-entry'
          }
          if (/element-plus[\\/]es[\\/]components[\\/]index\.mjs$/.test(id)) {
            return 'vendor-ep-entry'
          }
          // element-plus 全量引入约 900kB，按组件名拆分 vendor，
          // 使单个 chunk 均低于 500kB 警告线。
          // 分组须构成依赖 DAG（重型/叶子组件单独成 chunk，基础组件一个 chunk），
          // 否则 Rollup 会因 chunk 间循环依赖告警并合并
          const comp = id.match(/element-plus[\\/]es[\\/]components[\\/]([^\\/]+)/)
          if (comp) {
            const name = comp[1] // 目录名不含 el- 前缀，如 table / date-picker
            // 分组基于 element-plus 组件依赖图（es/components 内部互引分析），
            // 必须构成依赖 DAG，否则 Rollup 报 Circular chunk 并合并：
            //   leaves → heavy → base，picker → base
            // 重型组件 chunk（table/tree/select 族；select 被 select-v2 复用须同组）
            if (
              name === 'table' ||
              name === 'table-v2' ||
              name === 'select' ||
              name === 'select-v2' ||
              name === 'tree' ||
              name === 'tree-v2' ||
              name === 'tree-select'
            ) {
              return 'vendor-ep-heavy'
            }
            // 日期/时间选择器族互相依赖，且会反向依赖基础组件，单独成 chunk
            // （calendar 复用 date-picker 的 date-table，date-picker-panel 与
            //   date-picker 互引，一并归入避免 chunk 间循环依赖）
            if (
              name === 'date-picker' ||
              name === 'date-picker-panel' ||
              name === 'time-picker' ||
              name === 'time-select' ||
              name === 'calendar'
            ) {
              return 'vendor-ep-picker'
            }
            // 叶子组件（无其它组件反向依赖；pagination 依赖 select，不能留在 base）
            if (
              name === 'slider' ||
              name === 'menu' ||
              name === 'upload' ||
              name === 'cascader' ||
              name === 'pagination' ||
              name === 'tour' ||
              name === 'tabs'
            ) {
              return 'vendor-ep-leaves'
            }
            return 'vendor-ep-base'
          }
          // element-plus 共享模块（hooks / directives / constants / utils / locale）
          // 统一归入 core chunk：它们被多个组件 chunk 引用，若交给 Rollup 自动
          // 并入某个组件 chunk，而其它组件 chunk 也引用它们，就会形成 chunk 环。
          // 依赖方向：entry → leaves/picker → heavy → base → core（单向无环）
          if (id.includes('element-plus/es/')) return 'vendor-ep-core'
        },
      },
    },
  },
  server: {
    proxy: {
      // 开发环境将 /api 转发到本地后端（ops-desk-api）
      '/api': {
        // 必须用 127.0.0.1：macOS 上 localhost 常走 IPv6，会打到 Docker 映射的 [::]:8000（旧镜像无此路由 → 404），而不是本机 make dev 的 127.0.0.1:8000
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.spec.ts'],
  },
})
