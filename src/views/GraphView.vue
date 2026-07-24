<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useGraphStore } from '../stores/graph'

const graph = useGraphStore()

onMounted(() => {
  void graph.load()
})

type MatrixRow = Record<string, unknown>

interface NormalizedMatrix {
  columns: string[]
  rows: MatrixRow[]
}

function isPlainObject(value: unknown): value is MatrixRow {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * 防御性表格化：module_matrix 结构以后端有数据时的实际响应为准，前端按
 * 对象/数组通用结构尽量转成「列 + 行」：
 * - 数组：每个对象元素为一行，列取全部元素键的并集；非对象元素归入「值」列
 * - 对象（值全为对象）：视为 module → 详情 映射，首列补 module 名
 * - 对象（含标量值）：键值两列
 * - 标量：单列单值
 */
function normalizeMatrix(matrix: unknown): NormalizedMatrix | null {
  if (matrix === null || matrix === undefined) return null

  if (Array.isArray(matrix)) {
    const rows: MatrixRow[] = matrix.map((item) => (isPlainObject(item) ? item : { 值: item }))
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    return { columns, rows }
  }

  if (isPlainObject(matrix)) {
    const entries = Object.entries(matrix)
    if (entries.length > 0 && entries.every(([, value]) => isPlainObject(value))) {
      const rows = entries.map(([key, value]) => ({ module: key, ...(value as MatrixRow) }))
      const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
      return { columns, rows }
    }
    return {
      columns: ['字段', '值'],
      rows: entries.map(([key, value]) => ({ 字段: key, 值: value })),
    }
  }

  return { columns: ['值'], rows: [{ 值: matrix }] }
}

const matrix = computed<NormalizedMatrix | null>(() => normalizeMatrix(graph.data?.module_matrix))

const hasSnapshotMeta = computed(() => Boolean(graph.data?.repo_id || graph.data?.created_at))

/** snapshot payload 中的标量字段（防御性展示，未知结构下尽量可见） */
const snapshotMeta = computed<Array<{ key: string; value: unknown }>>(() => {
  const snapshot = graph.data?.snapshot
  if (!isPlainObject(snapshot)) return []
  return Object.entries(snapshot)
    .filter(([, value]) => !isPlainObject(value) && !Array.isArray(value))
    .map(([key, value]) => ({ key, value }))
})

const createdAtText = computed(() => {
  const raw = graph.data?.created_at
  if (!raw) return '—'
  const date = new Date(raw)
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleString()
})

function cellText(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>

<template>
  <div class="graph-page">
    <header class="graph-page__header">
      <h1 class="graph-page__title">Graph 图谱</h1>
      <el-button :loading="graph.loading" @click="graph.load()">刷新</el-button>
    </header>

    <el-alert
      v-if="graph.error"
      class="graph-page__alert"
      type="error"
      :title="graph.error.message || '加载图谱失败'"
      show-icon
      :closable="false"
    >
      <el-button size="small" @click="graph.load()">重试</el-button>
    </el-alert>

    <section v-loading="graph.loading" class="graph-page__section">
      <h2 class="graph-page__section-title">Snapshot 元信息</h2>
      <p v-if="!hasSnapshotMeta && !graph.loading" class="graph-page__hint">暂无图谱快照</p>
      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="repo_id">{{ graph.data?.repo_id ?? '—' }}</el-descriptions-item>
        <el-descriptions-item label="created_at">{{ createdAtText }}</el-descriptions-item>
        <el-descriptions-item v-for="item in snapshotMeta" :key="item.key" :label="item.key">
          {{ cellText(item.value) }}
        </el-descriptions-item>
      </el-descriptions>
    </section>

    <section class="graph-page__section">
      <h2 class="graph-page__section-title">Module × Issue 矩阵</h2>
      <el-empty v-if="!matrix" description="暂无 module_matrix 数据">
        <p class="graph-page__hint">需先在后端执行 scan/graph 生成图谱快照</p>
      </el-empty>
      <el-empty v-else-if="matrix.rows.length === 0" description="module_matrix 为空" />
      <div v-else class="graph-page__table-wrap">
        <table class="graph-page__table">
          <thead>
            <tr>
              <th v-for="col in matrix.columns" :key="col">{{ col }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, rowIndex) in matrix.rows" :key="rowIndex">
              <td v-for="col in matrix.columns" :key="col">{{ cellText(row[col]) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.graph-page {
  padding: 24px;
  color: var(--ops-text);
}

.graph-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.graph-page__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.graph-page__alert {
  margin-bottom: 16px;
}

.graph-page__section {
  margin-bottom: 24px;
  padding: 16px;
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  border-radius: var(--ops-radius);
}

.graph-page__section-title {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 600;
}

.graph-page__hint {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.graph-page__table-wrap {
  overflow-x: auto;
}

.graph-page__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.graph-page__table th,
.graph-page__table td {
  padding: 8px 12px;
  border: 1px solid var(--ops-border);
  text-align: left;
  white-space: nowrap;
}

.graph-page__table th {
  background: var(--ops-accent-soft);
  font-weight: 600;
}
</style>
