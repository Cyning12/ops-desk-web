<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useAuthStore } from '../stores/auth'
import { useCapabilityStore } from '../stores/capability'

const store = useCapabilityStore()
const auth = useAuthStore()

/** maintainer 面显隐唯一判据：/auth/me role（非前端硬编码账号） */
const isMaintainer = computed(() => auth.user?.role === 'maintainer')

onMounted(() => {
  void store.load()
})

function formatTags(tags: string[] | null | undefined): string {
  return tags && tags.length ? tags.join('、') : '—'
}

function formatBool(v: boolean | null | undefined): string {
  if (v === true) return '是'
  if (v === false) return '否'
  return '—'
}
</script>

<template>
  <div class="capability-view">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="Capability 目录 · 只读"
      description="当前账号可见能力集（GET /capability/mine 九键投影照登）。本页不提供任何写操作/工具执行入口。"
      class="capability-view__banner"
    />

    <el-alert
      v-if="store.error"
      type="error"
      :closable="false"
      show-icon
      class="capability-view__error"
    >
      <template #title>无法加载 Capability 可见集</template>
      <p>{{ store.error.message }}</p>
      <el-button size="small" @click="store.load()">重试</el-button>
    </el-alert>

    <el-skeleton v-if="store.loading && !store.items.length" :rows="6" animated />

    <template v-if="!store.error">
      <div v-if="!store.loading || store.items.length" class="capability-view__meta">
        <span class="capability-view__count" data-testid="capability-count">
          可见集 · count={{ store.count }}
        </span>
        <el-button size="small" :loading="store.loading" @click="store.load()">重新加载</el-button>
      </div>

      <el-empty
        v-if="store.isEmpty"
        description="暂无可见 Capability（可见集为空）"
        class="capability-view__empty"
      />

      <el-table
        v-else-if="store.items.length"
        :data="store.items"
        size="small"
        class="capability-view__table"
        data-testid="capability-table"
      >
        <el-table-column prop="id" label="id" min-width="160" />
        <el-table-column prop="kind" label="kind" width="110" />
        <el-table-column prop="description" label="description" min-width="200" show-overflow-tooltip />
        <el-table-column prop="when_to_use" label="when_to_use" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.when_to_use || '—' }}</template>
        </el-table-column>
        <el-table-column label="tags" min-width="140">
          <template #default="{ row }">{{ formatTags(row.tags) }}</template>
        </el-table-column>
        <el-table-column prop="risk_level" label="risk_level" width="110" />
        <el-table-column prop="side_effect" label="side_effect" width="120">
          <template #default="{ row }">{{ row.side_effect || '—' }}</template>
        </el-table-column>
        <el-table-column label="enabled" width="90">
          <template #default="{ row }">{{ formatBool(row.enabled) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="status" width="110" />
      </el-table>
    </template>

    <!-- maintainer 面：/auth/me role 驱动显隐 · 普通用户零探测面（不渲染不请求） -->
    <el-card
      v-if="isMaintainer"
      shadow="never"
      class="capability-view__manifest"
      data-testid="manifest-section"
    >
      <template #header>
        <div class="capability-view__manifest-head">
          <span>Manifest 故障详情（maintainer）</span>
          <el-tag
            v-if="store.manifest && store.manifest.manifest_errors !== null"
            :type="store.manifest.manifest_errors > 0 ? 'danger' : 'success'"
            size="small"
            data-testid="manifest-errors-tag"
          >
            manifest_errors = {{ store.manifest.manifest_errors }}
          </el-tag>
        </div>
      </template>

      <el-alert
        v-if="store.manifestError"
        type="error"
        :closable="false"
        show-icon
        class="capability-view__manifest-error"
      >
        <template #title>无法加载 manifest 故障详情</template>
        <p>{{ store.manifestError.message }}</p>
        <el-button size="small" @click="store.loadManifest()">重试</el-button>
      </el-alert>

      <el-skeleton v-if="store.manifestLoading && !store.manifest" :rows="3" animated />

      <template v-if="store.manifest">
        <el-alert
          v-if="store.manifest.manifest_errors === null"
          type="warning"
          :closable="false"
          show-icon
          title="catalog summary 缺 manifest_errors 键"
          description="与 B2 契约不符（已照登空态并记录 · 报回 api 侧核对）。"
          class="capability-view__manifest-missing"
          data-testid="manifest-missing-keys"
        />
        <p
          v-else-if="store.manifest.manifest_errors === 0"
          class="capability-view__muted"
          data-testid="manifest-ok"
        >
          无 manifest 加载故障
        </p>
        <el-table
          v-if="store.manifest.manifest_error_details.length"
          :data="store.manifest.manifest_error_details"
          size="small"
          empty-text="—"
          data-testid="manifest-details-table"
        >
          <el-table-column prop="path" label="path" min-width="220" />
          <el-table-column prop="error" label="error" min-width="260" show-overflow-tooltip />
        </el-table>
      </template>
    </el-card>
  </div>
</template>

<style scoped>
.capability-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 1200px;
}

.capability-view__banner {
  margin-bottom: 0;
}

.capability-view__error {
  margin: 0;
}

.capability-view__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.capability-view__count {
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.capability-view__table {
  background: var(--ops-bg-paper);
}

.capability-view__manifest {
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
}

.capability-view__manifest-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.capability-view__manifest-error {
  margin: 0 0 12px;
}

.capability-view__manifest-missing {
  margin-bottom: 12px;
}

.capability-view__muted {
  margin: 0;
  font-size: 13px;
  color: var(--ops-text-secondary);
}
</style>
