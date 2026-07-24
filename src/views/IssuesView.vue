<script setup lang="ts">
import { onMounted, reactive } from 'vue'

import { useIssuesStore } from '../stores/issues'

const issues = useIssuesStore()

/** state 下拉选项（契约：open / closed） */
const STATE_OPTIONS = ['open', 'closed']

/**
 * scan_status 下拉选项（可配置常量）。
 * 后端 scan_status 为自由字符串字段，暂无固定枚举；按实际数据取值调整。
 */
const SCAN_STATUS_OPTIONS = ['pending', 'running', 'success', 'failed']

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

/** 筛选表单草稿：点击「查询」后才 applyFilters（page 重置 1 并重新请求） */
const draft = reactive({ ...issues.filters })

function onSearch(): void {
  void issues.applyFilters({ ...draft })
}

function onReset(): void {
  Object.assign(draft, { state: '', label: '', module: '', scan_status: '' })
  void issues.resetFilters()
}

function onPageChange(nextPage: number): void {
  void issues.setPage(nextPage)
}

function onSizeChange(nextSize: number): void {
  void issues.setPageSize(nextSize)
}

function stateTagType(state: string): 'success' | 'info' {
  return state === 'open' ? 'success' : 'info'
}

/** updated_at 本地化展示；空值显示占位 */
function formatUpdatedAt(value: string | null): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

onMounted(() => {
  void issues.load()
})
</script>

<template>
  <div class="issues-page">
    <el-card class="issues-page__card" shadow="never">
      <el-form class="issues-page__filters" inline @submit.prevent="onSearch">
        <el-form-item label="State">
          <el-select
            v-model="draft.state"
            class="issues-page__filter-select"
            placeholder="全部"
            clearable
          >
            <el-option v-for="s in STATE_OPTIONS" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="Label">
          <el-input v-model="draft.label" placeholder="label" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="Module">
          <el-input v-model="draft.module" placeholder="module" clearable @keyup.enter="onSearch" />
        </el-form-item>
        <el-form-item label="Scan Status">
          <el-select
            v-model="draft.scan_status"
            class="issues-page__filter-select"
            placeholder="全部"
            clearable
          >
            <el-option v-for="s in SCAN_STATUS_OPTIONS" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="issues.loading">
            查询
          </el-button>
          <el-button @click="onReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="issues.error"
        class="issues-page__error"
        type="error"
        :title="issues.error.message || '加载失败'"
        :closable="false"
      >
        <el-button size="small" @click="issues.load()">重试</el-button>
      </el-alert>

      <template v-if="!issues.error">
        <el-table v-if="issues.items.length > 0" v-loading="issues.loading" :data="issues.items">
          <el-table-column prop="number" label="#" width="90" />
          <el-table-column prop="title" label="Title" min-width="240" show-overflow-tooltip />
          <el-table-column label="State" width="110">
            <template #default="{ row }">
              <el-tag :type="stateTagType(row.state)" disable-transitions>{{ row.state }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="Labels" min-width="180">
            <template #default="{ row }">
              <el-tag
                v-for="label in row.labels"
                :key="label"
                class="issues-page__label-tag"
                size="small"
                disable-transitions
              >
                {{ label }}
              </el-tag>
              <span v-if="row.labels.length === 0">—</span>
            </template>
          </el-table-column>
          <el-table-column label="Module" width="140">
            <template #default="{ row }">
              {{ row.module_tag ?? '—' }}
            </template>
          </el-table-column>
          <el-table-column label="Updated At" width="180">
            <template #default="{ row }">
              {{ formatUpdatedAt(row.updated_at) }}
            </template>
          </el-table-column>
        </el-table>

        <el-empty
          v-else-if="!issues.loading"
          class="issues-page__empty"
          description="暂无 Issues 数据"
        />
      </template>

      <div class="issues-page__pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="issues.total"
          :current-page="issues.page"
          :page-size="issues.pageSize"
          :page-sizes="PAGE_SIZE_OPTIONS"
          :disabled="issues.loading"
          @current-change="onPageChange"
          @size-change="onSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.issues-page {
  padding: 24px;
}

.issues-page__card {
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
}

.issues-page__filters {
  margin-bottom: 8px;
}

.issues-page__filter-select {
  width: 140px;
}

.issues-page__error {
  margin: 8px 0 16px;
}

.issues-page__label-tag {
  margin-right: 4px;
}

.issues-page__empty {
  padding: 48px 0;
}

.issues-page__pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
