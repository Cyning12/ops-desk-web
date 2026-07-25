<script setup lang="ts">
import { computed, onMounted } from 'vue'

import { useOverviewStore } from '../stores/overview'
import type { MedianMetric, TrendPoint } from '../api/overview'

const store = useOverviewStore()

onMounted(() => {
  void store.load()
})

const data = computed(() => store.data)

/* ---------- 格式化（空值一律兜底，杜绝 NaN/undefined 上屏） ---------- */

function formatMedian(metric: MedianMetric | undefined): string {
  const v = metric?.median_days
  return typeof v === 'number' && Number.isFinite(v) ? `${v} 天` : '—'
}

function formatSampleSize(metric: MedianMetric | undefined): string {
  const n = metric?.sample_size
  return `样本 ${typeof n === 'number' && Number.isFinite(n) ? n : 0}`
}

function formatCount(v: number | null | undefined): string {
  return typeof v === 'number' && Number.isFinite(v) ? String(v) : '—'
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString('zh-CN', { hour12: false })
}

const SYNC_STATUS_TEXT: Record<string, string> = {
  idle: '空闲（尚未同步）',
  running: '同步中',
  success: '成功',
  failed: '失败',
}

const syncStatusText = computed(() => {
  const s = data.value?.sync_status
  if (!s) return '—'
  return SYNC_STATUS_TEXT[s] ?? s
})

/** parsed_summary 为扫描器透传的自由结构，防御性摘取常见字段 */
const scanSummaryText = computed(() => {
  const snap = data.value?.scan_snapshot
  if (!snap) return ''
  const summary = snap.parsed_summary ?? {}
  const total = summary['total_open']
  return typeof total === 'number' && Number.isFinite(total)
    ? `开放事项 ${total} 项`
    : '扫描快照已生成'
})

/* ---------- 手绘 SVG trend 图（不引图表库；全 0 数据画基线平线） ---------- */

const CHART_W = 720
const CHART_H = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 36 }

const trend = computed<TrendPoint[]>(() => data.value?.trend ?? [])

const trendMax = computed(() => {
  let max = 0
  for (const p of trend.value) {
    if (Number.isFinite(p.closed_issues)) max = Math.max(max, p.closed_issues)
    if (Number.isFinite(p.merged_prs)) max = Math.max(max, p.merged_prs)
  }
  // 全 0 时按上限 1 缩放，折线贴基线正常渲染
  return Math.max(max, 1)
})

function pointX(index: number, count: number): number {
  const innerW = CHART_W - PAD.left - PAD.right
  const step = count > 1 ? innerW / (count - 1) : 0
  return PAD.left + index * step
}

function pointY(value: number): number {
  const innerH = CHART_H - PAD.top - PAD.bottom
  const v = Number.isFinite(value) ? value : 0
  return PAD.top + innerH - (v / trendMax.value) * innerH
}

function linePoints(key: 'closed_issues' | 'merged_prs'): string {
  const pts = trend.value
  return pts.map((p, i) => `${pointX(i, pts.length)},${pointY(p[key])}`).join(' ')
}

const issueLine = computed(() => linePoints('closed_issues'))
const prLine = computed(() => linePoints('merged_prs'))

const baselineY = computed(() => CHART_H - PAD.bottom)

/** X 轴刻度：首 / 中 / 尾三个日期（MM-DD） */
const xTicks = computed(() => {
  const pts = trend.value
  if (pts.length === 0) return []
  const indexes = [...new Set([0, Math.floor((pts.length - 1) / 2), pts.length - 1])]
  return indexes.map((i) => ({
    x: pointX(i, pts.length),
    label: (pts[i]?.date ?? '').slice(5),
  }))
})
</script>

<template>
  <div class="overview-page">
    <!-- 加载骨架 -->
    <el-skeleton v-if="store.loading && !data" :rows="6" animated />

    <!-- 错误态：alert + 重试 -->
    <el-alert
      v-else-if="store.error && !data"
      type="error"
      :title="'总览数据加载失败'"
      show-icon
      :closable="false"
      class="overview-page__alert"
    >
      <p class="overview-page__alert-desc">{{ store.error.message || '请稍后重试' }}</p>
      <el-button size="small" class="overview-page__retry" @click="store.load()">重试</el-button>
    </el-alert>

    <template v-else-if="data">
      <!-- 指标卡片 -->
      <section class="metric-cards">
        <div class="metric-card">
          <div class="metric-card__label">PR 周期时长（中位）</div>
          <div class="metric-card__value">{{ formatMedian(data.cycle_time) }}</div>
          <div class="metric-card__meta">{{ formatSampleSize(data.cycle_time) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__label">PR 评审时长（中位）</div>
          <div class="metric-card__value">{{ formatMedian(data.review_time) }}</div>
          <div class="metric-card__meta">{{ formatSampleSize(data.review_time) }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-card__label">Issue 吞吐</div>
          <div class="metric-card__value">{{ formatCount(data.issue_throughput?.count) }}</div>
          <div class="metric-card__meta">
            近 {{ data.issue_throughput?.period_days ?? '—' }} 天关闭
          </div>
        </div>
      </section>

      <!-- sync / scan 状态区 -->
      <section class="status-panels">
        <div class="status-panel">
          <h2 class="status-panel__title">同步状态</h2>
          <p class="status-panel__line">当前状态：{{ syncStatusText }}</p>
          <template v-if="data.sync_run">
            <p class="status-panel__line">开始：{{ formatDateTime(data.sync_run.started_at) }}</p>
            <p class="status-panel__line">结束：{{ formatDateTime(data.sync_run.finished_at) }}</p>
            <p class="status-panel__line">
              记录：Issue {{ formatCount(data.sync_run.records_issue) }} / PR
              {{ formatCount(data.sync_run.records_pr) }}
            </p>
          </template>
          <p v-else class="status-panel__empty">暂无同步记录</p>
        </div>
        <div class="status-panel">
          <h2 class="status-panel__title">扫描快照</h2>
          <template v-if="data.scan_snapshot">
            <p class="status-panel__line">{{ scanSummaryText }}</p>
            <p class="status-panel__line">
              生成于：{{ formatDateTime(data.scan_snapshot.created_at) }}
            </p>
          </template>
          <p v-else class="status-panel__empty">暂无扫描快照</p>
        </div>
      </section>

      <!-- trend 图：近 30 天 closed_issues / merged_prs 双线（手绘 SVG） -->
      <section class="trend-panel">
        <h2 class="status-panel__title">近 30 天趋势</h2>
        <div class="trend-panel__legend">
          <span class="trend-panel__legend-item">
            <i class="trend-panel__swatch trend-panel__swatch--issue" />关闭 Issue
          </span>
          <span class="trend-panel__legend-item">
            <i class="trend-panel__swatch trend-panel__swatch--pr" />合并 PR
          </span>
        </div>
        <svg
          v-if="trend.length > 0"
          class="trend-panel__chart"
          :viewBox="`0 0 ${CHART_W} ${CHART_H}`"
          role="img"
          aria-label="近 30 天关闭 Issue 与合并 PR 趋势"
        >
          <!-- 基线与纵轴上限 -->
          <line
            :x1="PAD.left"
            :y1="baselineY"
            :x2="CHART_W - PAD.right"
            :y2="baselineY"
            class="trend-panel__axis"
          />
          <text :x="PAD.left - 6" :y="PAD.top + 4" class="trend-panel__tick" text-anchor="end">
            {{ trendMax }}
          </text>
          <text :x="PAD.left - 6" :y="baselineY + 4" class="trend-panel__tick" text-anchor="end">
            0
          </text>
          <!-- 双线 -->
          <polyline :points="issueLine" class="trend-panel__line trend-panel__line--issue" />
          <polyline :points="prLine" class="trend-panel__line trend-panel__line--pr" />
          <!-- X 轴刻度 -->
          <text
            v-for="tick in xTicks"
            :key="tick.x"
            :x="tick.x"
            :y="CHART_H - 8"
            class="trend-panel__tick"
            text-anchor="middle"
          >
            {{ tick.label }}
          </text>
        </svg>
        <p v-else class="status-panel__empty">暂无趋势数据</p>
      </section>

      <p class="overview-page__as-of">数据截止：{{ formatDateTime(data.as_of) }}</p>
    </template>
  </div>
</template>

<style scoped>
.overview-page {
  max-width: 880px;
  color: var(--ops-text);
}

.overview-page__alert {
  background: var(--ops-bg-paper);
}

.overview-page__alert-desc {
  margin: 0;
  font-size: 13px;
}

.overview-page__retry {
  margin-top: 8px;
}

/* 指标卡片 */
.metric-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 16px 20px;
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  border-radius: var(--ops-radius);
}

.metric-card__label {
  font-size: 13px;
  color: var(--ops-text-secondary);
}

.metric-card__value {
  margin-top: 6px;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.3;
}

.metric-card__meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--ops-text-secondary);
}

/* sync / scan 状态区 */
.status-panels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.status-panel {
  padding: 16px 20px;
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  border-radius: var(--ops-radius);
}

.status-panel__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.status-panel__line {
  margin: 4px 0;
  font-size: 13px;
}

.status-panel__empty {
  margin: 4px 0;
  font-size: 13px;
  color: var(--ops-text-secondary);
}

/* trend 图 */
.trend-panel {
  padding: 16px 20px;
  margin-bottom: 16px;
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  border-radius: var(--ops-radius);
}

.trend-panel__legend {
  display: flex;
  gap: 20px;
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--ops-text-secondary);
}

.trend-panel__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.trend-panel__swatch {
  display: inline-block;
  width: 16px;
  height: 2px;
}

.trend-panel__swatch--issue {
  background: var(--ops-accent);
}

.trend-panel__swatch--pr {
  background: #9a7b4f;
}

.trend-panel__chart {
  width: 100%;
  height: auto;
  display: block;
}

.trend-panel__axis {
  stroke: var(--ops-border);
  stroke-width: 1;
}

.trend-panel__tick {
  font-size: 10px;
  fill: var(--ops-text-secondary);
}

.trend-panel__line {
  fill: none;
  stroke-width: 2;
  stroke-linejoin: round;
  stroke-linecap: round;
}

.trend-panel__line--issue {
  stroke: var(--ops-accent);
}

.trend-panel__line--pr {
  stroke: #9a7b4f;
}

.overview-page__as-of {
  margin: 0;
  font-size: 12px;
  color: var(--ops-text-secondary);
  text-align: right;
}
</style>
