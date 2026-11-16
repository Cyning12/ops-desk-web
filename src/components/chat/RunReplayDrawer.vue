<template>
  <el-drawer
    v-model="visible"
    :title="`轨迹回放 · ${run?.query_summary || run?.run_id || ''}`"
    size="480px"
    data-test="replay-drawer"
  >
    <div class="replay-body">
      <el-skeleton v-if="loading" :rows="4" animated />
      <p v-else-if="loadFailed" class="replay-empty" data-test="replay-error">
        回放数据暂不可用
      </p>
      <template v-else-if="events.length > 0">
        <el-timeline data-test="replay-timeline">
          <el-timeline-item
            v-for="event in events"
            :key="event.seq"
            :timestamp="fmtTs(event.created_at)"
            :type="timelineType(event.event_type)"
            :data-test="`replay-item-${event.event_type}`"
          >
            <div class="replay-item">
              <span class="replay-item__label">{{ eventLabel(event.event_type) }}</span>
              <span class="replay-item__type">{{ event.event_type }}</span>
              <pre v-if="payloadText(event)" class="replay-item__payload">{{ payloadText(event) }}</pre>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-button
          v-if="truncated && nextAfterSeq !== null"
          class="replay-more"
          size="small"
          text
          :loading="loadingMore"
          data-test="replay-more"
          @click="loadMore"
        >
          加载更早事件
        </el-button>
      </template>
      <p v-else class="replay-empty" data-test="replay-empty">暂无事件</p>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

import { fetchRunEvents, type RunEventItem, type ThreadRunItem } from '../../api/taskPanel'

/**
 * P3-T8 轨迹回放抽屉（14 §2.4：el-drawer 右侧 · el-timeline 按序铺 · 静态不回放光标动画 ·
 * 数据 = runs/{run_id}/events 只读 · 白名单八值帧 · ≤500 截断 next_after_seq 翻页 ·
 * 跨用户/未知 run → 404 中性化空态）。
 */
const props = defineProps<{ run: ThreadRunItem | null }>()
const visible = defineModel<boolean>({ default: false })

/** 白名单八值 → 中文标签（15 §1 · 未知值宽松展示原词） */
const EVENT_LABELS: Record<string, string> = {
  'run.start': '任务开始',
  answer: '回答',
  'subtask.progress': '子任务进度',
  'node.progress': '节点进度',
  'hitl.waiting': '等待审批',
  done: '完成',
  error: '错误',
  'hitl.resumed': '审批恢复',
}

const events = ref<RunEventItem[]>([])
const loading = ref(false)
const loadingMore = ref(false)
const loadFailed = ref(false)
const truncated = ref(false)
const nextAfterSeq = ref<number | null>(null)

function eventLabel(eventType: string): string {
  return EVENT_LABELS[eventType] ?? eventType
}

function timelineType(eventType: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  switch (eventType) {
    case 'done':
      return 'success'
    case 'error':
      return 'danger'
    case 'hitl.waiting':
      return 'warning'
    case 'run.start':
      return 'primary'
    default:
      return 'info'
  }
}

function fmtTs(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function payloadText(event: RunEventItem): string {
  const keys = Object.keys(event.payload ?? {})
  if (keys.length === 0) return ''
  const text = JSON.stringify(event.payload)
  return text.length > 160 ? `${text.slice(0, 160)}…` : text
}

async function loadFirst(): Promise<void> {
  const run = props.run
  if (!run) return
  loading.value = true
  loadFailed.value = false
  try {
    const page = await fetchRunEvents(run.run_id)
    events.value = page.events
    truncated.value = page.truncated
    nextAfterSeq.value = page.next_after_seq
  } catch {
    // 404 跨用户/未知 run、网络错 → 中性化（FP-F8 同口径 · 401 已由拦截器接管）
    events.value = []
    truncated.value = false
    nextAfterSeq.value = null
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

async function loadMore(): Promise<void> {
  const run = props.run
  const after = nextAfterSeq.value
  if (!run || after === null || loadingMore.value) return
  loadingMore.value = true
  try {
    const page = await fetchRunEvents(run.run_id, after)
    const seen = new Set(events.value.map((event) => event.seq))
    events.value = [...events.value, ...page.events.filter((event) => !seen.has(event.seq))]
    truncated.value = page.truncated
    nextAfterSeq.value = page.next_after_seq
  } catch {
    // 翻页失败保留现状
  } finally {
    loadingMore.value = false
  }
}

// 打开即拉（watch immediate：初始 modelValue=true 场景 EP drawer 不发 open 事件 ·
// open 仅在 modelValue watch 回调内 emit · use-dialog.mjs 实证）
watch(visible, (v) => {
  if (v) void loadFirst()
}, { immediate: true })

watch(
  () => props.run?.run_id,
  () => {
    if (visible.value) void loadFirst()
  },
)
</script>

<style scoped>
.replay-body {
  padding: 0 4px;
  font-size: 13px;
  color: #2c2c2c;
}

.replay-empty {
  margin: 12px 0;
  color: rgba(44, 44, 44, 0.5);
}

.replay-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.replay-item__label {
  font-weight: 600;
}

.replay-item__type {
  font-family: monospace;
  font-size: 11px;
  color: rgba(44, 44, 44, 0.5);
}

.replay-item__payload {
  margin: 4px 0 0;
  padding: 6px 8px;
  border-radius: 4px;
  background: #f9f9f7;
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
}

.replay-more {
  margin-top: 8px;
}
</style>
