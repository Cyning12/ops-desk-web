<template>
  <div class="task-panel" data-test="task-panel">
    <el-collapse v-model="collapseValue">
      <el-collapse-item name="tasks" data-test="task-panel-collapse">
        <template #title>
          <span class="task-panel__title">任务</span>
          <span class="task-panel__badge" data-test="task-panel-badge"
            >任务 · {{ taskPanel.inProgressCount }} 进行中</span
          >
        </template>

        <!-- 任务卡片区 -->
        <div class="task-panel__runs" data-test="task-panel-runs">
          <el-skeleton v-if="taskPanel.runsLoading && taskPanel.runs.length === 0" :rows="2" animated />
          <template v-else-if="taskPanel.runs.length > 0">
            <TaskCard
              v-for="run in taskPanel.runs"
              :key="run.run_id"
              :run="run"
              @activate="onActivate"
            />
            <el-button
              v-if="taskPanel.runsNextCursor"
              class="task-panel__more"
              size="small"
              text
              :loading="taskPanel.runsLoading"
              data-test="task-panel-more"
              @click="taskPanel.loadMoreRuns()"
            >
              加载更多
            </el-button>
          </template>
          <p v-else class="task-panel__empty" data-test="task-panel-runs-empty">
            {{ taskPanel.runsDegraded ? '任务列表暂不可用，稍后重试' : '暂无任务' }}
          </p>
        </div>

        <!-- 定时任务子区 -->
        <div class="task-panel__schedules" data-test="task-panel-schedules">
          <p class="task-panel__zone-title">定时任务</p>
          <template v-if="taskPanel.schedules.length > 0">
            <div
              v-for="schedule in taskPanel.schedules"
              :key="schedule.schedule_id"
              class="schedule-row"
              :class="`schedule-row--${schedule.status}`"
              data-test="schedule-row"
            >
              <div class="schedule-row__main">
                <span class="schedule-row__name" data-test="schedule-name">{{ schedule.name }}</span>
                <el-tag
                  size="small"
                  :type="scheduleTagType(schedule.status)"
                  :effect="schedule.status === 'cancelled' ? 'plain' : 'light'"
                  data-test="schedule-status"
                >
                  {{ scheduleStatusLabel(schedule.status) }}
                </el-tag>
                <span class="schedule-row__desc" data-test="schedule-desc">{{
                  schedule.humanized_display
                }}</span>
                <span
                  v-if="schedule.status === 'active' && schedule.next_fire_at"
                  class="schedule-row__next"
                  data-test="schedule-next"
                  >下次 {{ fmtNextFire(schedule.next_fire_at) }}</span
                >
              </div>
              <div v-if="schedule.status !== 'cancelled'" class="schedule-row__actions">
                <el-button
                  v-if="schedule.status === 'active'"
                  size="small"
                  text
                  data-test="schedule-pause"
                  @click="onPause(schedule)"
                >
                  暂停
                </el-button>
                <el-button
                  v-else
                  size="small"
                  text
                  type="primary"
                  data-test="schedule-resume"
                  @click="onResume(schedule)"
                >
                  恢复
                </el-button>
                <el-button
                  size="small"
                  text
                  type="danger"
                  data-test="schedule-cancel"
                  @click="onCancel(schedule)"
                >
                  取消
                </el-button>
              </div>
            </div>
          </template>
          <p v-else class="task-panel__empty" data-test="task-panel-schedules-empty">
            {{ taskPanel.schedulesDegraded ? '定时任务暂不可用，稍后重试' : '暂无定时任务' }}
          </p>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import TaskCard from './TaskCard.vue'
import { runStatusMeta, useTaskPanelStore } from '../../stores/taskPanel'
import type { ScheduleItem, ScheduleStatus, ThreadRunItem } from '../../api/taskPanel'

/**
 * P3-T8 任务面板（14 §2.2：el-collapse 内嵌 ChatView 顶部 · 默认收起 ·
 * 徽标「任务 · N 进行中」收起亦可见 · 定时任务子区行内 pause/resume/cancel 双确认 ·
 * daily_at 人类化优先服务端 humanized_display）。
 */
const emit = defineEmits<{
  activate: [run: ThreadRunItem, action: 'resume' | 'scroll-hitl' | 'replay']
}>()

const taskPanel = useTaskPanelStore()

/** el-collapse v-model（组件内独立 · 默认收起 · 不锁死用户展开） */
const collapseValue = ref<string[]>([])

function onActivate(run: ThreadRunItem): void {
  emit('activate', run, runStatusMeta(run.status).action)
}

function scheduleStatusLabel(status: ScheduleStatus): string {
  return status === 'active' ? '已启用' : status === 'paused' ? '已暂停' : '已取消'
}

function scheduleTagType(status: ScheduleStatus): 'success' | 'info' {
  return status === 'active' ? 'success' : 'info'
}

function fmtNextFire(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 操作失败：422 detail 逐字 toast（store 已透传 · 不二次包装） */
async function applyScheduleAction(scheduleId: string, status: ScheduleStatus): Promise<void> {
  const ok = await taskPanel.setScheduleStatus(scheduleId, status)
  if (!ok && taskPanel.scheduleActionError) {
    ElMessage.error(taskPanel.scheduleActionError)
    taskPanel.dismissScheduleActionError()
  }
}

async function onPause(schedule: ScheduleItem): Promise<void> {
  try {
    await ElMessageBox.confirm(`暂停后「${schedule.name}」将不再按时触发，可随时恢复。`, '暂停定时任务', {
      confirmButtonText: '确认暂停',
      cancelButtonText: '再想想',
      type: 'warning',
    })
  } catch {
    return // 取消
  }
  await applyScheduleAction(schedule.schedule_id, 'paused')
}

async function onResume(schedule: ScheduleItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `恢复后「${schedule.name}」将按既定计划继续触发。`,
      '恢复定时任务',
      {
        confirmButtonText: '确认恢复',
        cancelButtonText: '再想想',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  await applyScheduleAction(schedule.schedule_id, 'active')
}

async function onCancel(schedule: ScheduleItem): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `取消后「${schedule.name}」将永久停止触发，且不可恢复（R2 终态不可逆）。`,
      '取消定时任务',
      {
        confirmButtonText: '确认取消',
        cancelButtonText: '再想想',
        type: 'warning',
      },
    )
  } catch {
    return
  }
  await applyScheduleAction(schedule.schedule_id, 'cancelled')
}
</script>

<style scoped>
.task-panel {
  background: #f9f9f7;
}

.task-panel :deep(.el-collapse-item__header) {
  background: #f9f9f7;
  color: #2c2c2c;
  font-size: 13px;
}

.task-panel :deep(.el-collapse-item__wrap) {
  background: #f9f9f7;
}

.task-panel__title {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.task-panel__badge {
  margin-left: 10px;
  padding: 0 8px;
  border-radius: 9px;
  background: rgba(44, 44, 44, 0.08);
  color: rgba(44, 44, 44, 0.75);
  font-size: 11px;
  line-height: 18px;
  font-variant-numeric: tabular-nums;
}

.task-panel__runs {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-panel__more {
  align-self: center;
}

.task-panel__zone-title {
  margin: 14px 0 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(44, 44, 44, 0.6);
  letter-spacing: 0.04em;
}

.task-panel__empty {
  margin: 4px 0;
  font-size: 12px;
  color: rgba(44, 44, 44, 0.5);
}

.schedule-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border: 1px solid rgba(44, 44, 44, 0.12);
  border-radius: 6px;
  background: #ffffff;
  font-size: 12px;
  line-height: 1.6;
}

.schedule-row + .schedule-row {
  margin-top: 6px;
}

.schedule-row--cancelled {
  opacity: 0.6;
}

.schedule-row__main {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.schedule-row__name {
  font-weight: 600;
  color: #2c2c2c;
}

.schedule-row__desc {
  color: rgba(44, 44, 44, 0.7);
}

.schedule-row__next {
  color: rgba(44, 44, 44, 0.5);
  font-variant-numeric: tabular-nums;
}

.schedule-row__actions {
  margin-left: auto;
  flex: none;
  display: flex;
  gap: 4px;
}
</style>
