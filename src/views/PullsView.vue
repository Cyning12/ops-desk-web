<script setup lang="ts">
import { onMounted } from 'vue'

import { PULL_CI_STATUS_OPTIONS, PULL_STATE_OPTIONS } from '../api/pulls'
import type { PullItem } from '../api/pulls'
import { usePullsStore } from '../stores/pulls'

const pulls = usePullsStore()

function stateTagType(state: string): 'success' | 'info' | 'warning' {
  if (state === 'open') return 'success'
  if (state === 'merged') return 'warning'
  return 'info'
}

function ciTagType(ciStatus: string | null): 'success' | 'danger' | 'warning' | 'info' {
  if (ciStatus === 'success') return 'success'
  if (ciStatus === 'failure') return 'danger'
  if (ciStatus === 'pending') return 'warning'
  return 'info'
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function displayTitle(row: PullItem): string {
  return row.draft ? `[Draft] ${row.title}` : row.title
}

onMounted(() => {
  void pulls.load()
})
</script>

<template>
  <div class="pulls-page">
    <header class="pulls-page__header">
      <h1 class="pulls-page__title">Pull Requests</h1>
      <div class="pulls-page__filters">
        <el-select
          :model-value="pulls.filters.state"
          placeholder="State：全部"
          clearable
          class="pulls-page__filter"
          @update:model-value="(v: string) => pulls.setFilter('state', v ?? '')"
        >
          <el-option v-for="s in PULL_STATE_OPTIONS" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select
          :model-value="pulls.filters.ci_status"
          placeholder="CI：全部"
          clearable
          class="pulls-page__filter"
          @update:model-value="(v: string) => pulls.setFilter('ci_status', v ?? '')"
        >
          <el-option v-for="c in PULL_CI_STATUS_OPTIONS" :key="c" :label="c" :value="c" />
        </el-select>
      </div>
    </header>

    <el-alert
      v-if="pulls.error"
      type="error"
      :title="pulls.error.message || '加载失败'"
      class="pulls-page__error"
      :closable="false"
    >
      <el-button size="small" @click="pulls.retry()">重试</el-button>
    </el-alert>

    <template v-else>
      <el-table v-loading="pulls.loading" :data="pulls.items" class="pulls-page__table">
        <el-table-column prop="number" label="#" width="90" />
        <el-table-column label="标题" min-width="280">
          <template #default="{ row }">
            <span>{{ displayTitle(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="State" width="110">
          <template #default="{ row }">
            <el-tag :type="stateTagType(row.state)" size="small">{{ row.state }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="CI" width="110">
          <template #default="{ row }">
            <el-tag v-if="row.ci_status" :type="ciTagType(row.ci_status)" size="small">
              {{ row.ci_status }}
            </el-tag>
            <span v-else class="pulls-page__ci-empty">—</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" width="200">
          <template #default="{ row }">
            {{ formatUpdatedAt(row.updated_at) }}
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无 Pull Requests" />
        </template>
      </el-table>

      <el-pagination
        v-if="pulls.total > 0"
        class="pulls-page__pagination"
        background
        layout="total, prev, pager, next"
        :total="pulls.total"
        :current-page="pulls.page"
        :page-size="pulls.pageSize"
        @current-change="(p: number) => pulls.setPage(p)"
      />
    </template>
  </div>
</template>

<style scoped>
.pulls-page {
  padding: 24px 32px;
}

.pulls-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.pulls-page__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.pulls-page__filters {
  display: flex;
  gap: 8px;
}

.pulls-page__filter {
  width: 160px;
}

.pulls-page__error {
  margin-bottom: 16px;
}

.pulls-page__table {
  width: 100%;
  background: var(--ops-bg-paper);
}

.pulls-page__ci-empty {
  color: var(--ops-text-secondary);
}

.pulls-page__pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
</style>
