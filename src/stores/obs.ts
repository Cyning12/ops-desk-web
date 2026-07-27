import { ref } from 'vue'
import { defineStore } from 'pinia'

import {
  loadObsStatusFixture,
  loadObsTimelineFixture,
  type ObsStatus,
  type ObsStatusScenario,
  type ObsTimeline,
  type ObsTimelineScenario,
} from '../api/obs'

/**
 * 过程可观测只读 store：从 fixture 加载 status / timeline。
 * 失败不抛未捕获异常；error 供页面 el-alert。
 */
export const useObsStore = defineStore('obs', () => {
  const status = ref<ObsStatus | null>(null)
  const timeline = ref<ObsTimeline | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const statusScenario = ref<ObsStatusScenario>('ready')
  const timelineScenario = ref<ObsTimelineScenario>('events')

  async function load(): Promise<void> {
    if (loading.value) return
    loading.value = true
    error.value = null
    try {
      const [s, t] = await Promise.all([
        loadObsStatusFixture(statusScenario.value),
        loadObsTimelineFixture(timelineScenario.value),
      ])
      status.value = s
      timeline.value = t
    } catch (e) {
      const msg = e instanceof Error ? e.message : '无法加载过程投影'
      error.value = msg || '无法加载过程投影'
    } finally {
      loading.value = false
    }
  }

  async function setStatusScenario(scenario: ObsStatusScenario): Promise<void> {
    statusScenario.value = scenario
    // 与场景语义对齐：满闸配有事件；阻塞配空时间线
    timelineScenario.value = scenario === 'ready' ? 'events' : 'empty'
    await load()
  }

  return {
    status,
    timeline,
    loading,
    error,
    statusScenario,
    timelineScenario,
    load,
    setStatusScenario,
  }
})
