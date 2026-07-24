import { createPinia } from 'pinia'

/**
 * Pinia 实例（main.ts 挂载）。
 * 具体 store 由 W2+ 各自落地（如 auth / issues / pulls / graph / chat）。
 */
export const pinia = createPinia()
