<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useObsStore } from '../stores/obs'
import type { ObsStatusScenario } from '../api/obs'

const store = useObsStore()

onMounted(() => {
  void store.load()
})

const status = computed(() => store.status)
const timeline = computed(() => store.timeline)

function formatBool(v: boolean | null | undefined): string {
  if (v === true) return '是'
  if (v === false) return '否'
  return '—'
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', { hour12: false })
}

async function onScenarioChange(v: string | number | boolean | undefined): Promise<void> {
  const scenario = (v === 'blocked' ? 'blocked' : 'ready') as ObsStatusScenario
  await store.setStatusScenario(scenario)
}
</script>

<template>
  <div class="obs-view">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="只读投影 · 非签收真值"
      description="本页展示 harness status / timeline 契约形状（当前为 fixture）。不可在此代签闸表；正式开工仍须 harness verify。"
      class="obs-view__banner"
    />

    <div class="obs-view__toolbar">
      <span class="obs-view__label">Fixture 场景</span>
      <el-radio-group
        :model-value="store.statusScenario"
        :disabled="store.loading"
        @change="onScenarioChange"
      >
        <el-radio-button value="ready">满闸可开工</el-radio-button>
        <el-radio-button value="blocked">缺 R1 阻塞</el-radio-button>
      </el-radio-group>
      <el-button :loading="store.loading" @click="store.load()">重新加载</el-button>
    </div>

    <el-alert
      v-if="store.error"
      type="error"
      :closable="false"
      show-icon
      class="obs-view__error"
    >
      <template #title>无法加载过程投影</template>
      <p>{{ store.error }}</p>
      <el-button size="small" @click="store.load()">重试</el-button>
    </el-alert>

    <el-skeleton v-if="store.loading && !status" :rows="6" animated />

    <template v-if="status">
      <el-card shadow="never" class="obs-view__card">
        <template #header>
          <div class="obs-view__card-head">
            <span>Status · {{ status.schema_version }}</span>
            <el-tag :type="status.may_start_30 ? 'success' : 'danger'" size="small">
              may_start_30 = {{ formatBool(status.may_start_30) }}
            </el-tag>
          </div>
        </template>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="task_slug">{{ status.task_slug || '—' }}</el-descriptions-item>
          <el-descriptions-item label="status">{{ status.status || '—' }}</el-descriptions-item>
          <el-descriptions-item label="task_path" :span="2">
            {{ status.task_path || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="reviews.R1">
            {{ formatBool(status.reviews?.R1) }}
          </el-descriptions-item>
          <el-descriptions-item label="reviews.CLOSE">
            {{ formatBool(status.reviews?.CLOSE) }}
          </el-descriptions-item>
          <el-descriptions-item label="last_invoke" :span="2">
            {{ status.last_invoke?.path || '—' }}
            <template v-if="status.last_invoke?.hat_id">
              （hat={{ status.last_invoke.hat_id }}）
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="verify_preview" :span="2">
            <el-tag :type="status.verify_preview?.ok ? 'success' : 'warning'" size="small">
              {{ status.verify_preview?.ok ? 'PASS' : 'BLOCK' }}
            </el-tag>
            {{ status.verify_preview?.reason || '—' }}
          </el-descriptions-item>
          <el-descriptions-item label="hgm.events">
            {{
              status.hgm?.event_count == null ? '—' : String(status.hgm.event_count)
            }}
          </el-descriptions-item>
          <el-descriptions-item label="hgm.last_at">
            {{ formatDateTime(status.hgm?.last_at) }}
          </el-descriptions-item>
          <el-descriptions-item label="next_hint" :span="2">
            {{ status.next_hint || '—' }}
          </el-descriptions-item>
        </el-descriptions>

        <h3 class="obs-view__sub">人工闸</h3>
        <el-table :data="status.gates ?? []" size="small" empty-text="—">
          <el-table-column prop="id" label="闸" min-width="160" />
          <el-table-column prop="status" label="状态" width="120" />
          <el-table-column prop="blocks_hats" label="阻塞帽" width="120" />
        </el-table>

        <h3 class="obs-view__sub">blockers</h3>
        <ul v-if="status.blockers?.length" class="obs-view__list">
          <li v-for="(b, i) in status.blockers" :key="i">{{ b }}</li>
        </ul>
        <p v-else class="obs-view__muted">无阻塞</p>
      </el-card>

      <el-card v-if="timeline" shadow="never" class="obs-view__card">
        <template #header>
          <div class="obs-view__card-head">
            <span>Timeline · {{ timeline.schema_version }}</span>
            <span class="obs-view__muted">
              events={{ timeline.event_count ?? 0 }} · returned={{ timeline.returned ?? 0 }}
            </span>
          </div>
        </template>
        <el-alert
          v-if="!timeline.events?.length"
          type="warning"
          :closable="false"
          show-icon
          title="无 HGM 事件"
          description="对齐 CLI：无匹配事件时可 WARN + exit 0。可先 graph ingest 或 timeline --ingest（本页为 fixture，不写盘）。"
          class="obs-view__timeline-empty"
        />
        <el-table
          v-else
          :data="timeline.events"
          size="small"
          empty-text="暂无事件"
        >
          <el-table-column prop="occurred_at" label="时间" min-width="160">
            <template #default="{ row }">
              {{ formatDateTime(row.occurred_at) }}
            </template>
          </el-table-column>
          <el-table-column prop="type" label="类型" width="140" />
          <el-table-column prop="summary" label="摘要" min-width="200">
            <template #default="{ row }">
              {{ row.summary || '—' }}
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.obs-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 960px;
}

.obs-view__banner {
  margin-bottom: 0;
}

.obs-view__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.obs-view__label {
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.obs-view__error {
  margin: 0;
}

.obs-view__card {
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
}

.obs-view__card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.obs-view__sub {
  margin: 16px 0 8px;
  font-size: 14px;
  font-weight: 600;
}

.obs-view__list {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--ops-text);
}

.obs-view__muted {
  margin: 0;
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.obs-view__timeline-empty {
  margin-bottom: 12px;
}
</style>
