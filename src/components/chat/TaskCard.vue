<template>
  <div
    class="task-card"
    :class="`task-card--${run.status}`"
    data-test="task-card"
    :data-run-id="run.run_id"
    role="button"
    tabindex="0"
    @click="onActivate"
    @keydown.enter="onActivate"
  >
    <div class="task-card__header">
      <el-tag
        class="task-card__status"
        :type="meta.tagType"
        :effect="meta.plain ? 'plain' : 'light'"
        size="small"
        data-test="task-card-status"
      >
        <span v-if="meta.spinning" class="task-card__spinner" aria-hidden="true" />
        {{ meta.label }}
      </el-tag>
      <span class="task-card__time">{{ timeLabel }}</span>
    </div>
    <p class="task-card__query" data-test="task-card-query">
      <span v-if="run.schedule_attribution" class="task-card__attr" data-test="task-card-attr"
        >「{{ run.schedule_attribution.name }}」</span
      >{{ displayQuery }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { runStatusMeta } from '../../stores/taskPanel'
import type { ThreadRunItem } from '../../api/taskPanel'

/**
 * P3-T8 任务卡片（14 §2.3 同构 HitlApprovalCard：border-left 3px 状态色 + 水墨风）。
 * 状态六词表视觉态由 store RUN_STATUS_META 驱动；定时归因展示「name」+ ·（R12 前端仅展示不拼归因）。
 */
const props = defineProps<{ run: ThreadRunItem }>()
const emit = defineEmits<{ activate: [run: ThreadRunItem] }>()

const meta = computed(() => runStatusMeta(props.run.status))

const displayQuery = computed(
  () => props.run.query_summary || props.run.run_id,
)

function fmtTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const timeLabel = computed(() => {
  const created = fmtTime(props.run.created_at)
  const finished = fmtTime(props.run.finished_at)
  return finished ? `${created} → ${finished}` : created
})

function onActivate(): void {
  emit('activate', props.run)
}
</script>

<style scoped>
.task-card {
  padding: 10px 12px;
  border: 1px solid rgba(44, 44, 44, 0.16);
  border-left: 3px solid rgba(44, 44, 44, 0.35);
  border-radius: 6px;
  background: #ffffff;
  font-size: 13px;
  line-height: 1.6;
  cursor: pointer;
  transition: background 0.15s ease;
}

.task-card:hover {
  background: #f2f2ef;
}

/* 状态色（对齐 Element Plus tag 色系 · 六词表） */
.task-card--running {
  border-left-color: #409eff;
  background: rgba(64, 158, 255, 0.06);
}
.task-card--waiting_approval {
  border-left-color: #e6a23c;
  background: rgba(230, 162, 60, 0.07);
}
.task-card--done {
  border-left-color: #67c23a;
}
.task-card--error {
  border-left-color: #f56c6c;
  background: rgba(245, 108, 108, 0.05);
}
.task-card--disconnected {
  border-left-color: rgba(44, 44, 44, 0.45);
  background: rgba(44, 44, 44, 0.04);
}
.task-card--resumed {
  border-left-color: #67c23a;
}

.task-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-card__status {
  flex: none;
}

.task-card__spinner {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 4px;
  border: 1.5px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: task-card-spin 0.8s linear infinite;
  vertical-align: -1px;
}

@keyframes task-card-spin {
  to {
    transform: rotate(360deg);
  }
}

.task-card__time {
  margin-left: auto;
  font-size: 11px;
  color: rgba(44, 44, 44, 0.5);
  font-variant-numeric: tabular-nums;
}

.task-card__query {
  margin: 6px 0 0;
  color: #2c2c2c;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.task-card__attr {
  color: #409eff;
  margin-right: 2px;
}
</style>
