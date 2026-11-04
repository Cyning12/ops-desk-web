<script setup lang="ts">
/**
 * 独立 HITL 审批页（task_web-hitl-approval-page · 第四审批入口 · D1–D9）。
 *
 * - D2 冻结契约零分叉：只消费 src/api/hitl.ts 三函数，字段族照登，不自造 resume_mode 第四值。
 * - D4 决策：批准/驳回二次确认 + 决策中防重复提交；resume_mode 三选文案与
 *   src/components/chat/HitlApprovalCard.vue:49-60 同语义（默认 inherit 不送键）。
 * - D5 两步钉死：decide 成功 ≠ 自动 resume；required=true 且非 auto_triggered 时
 *   显式「续跑」按钮调 resumeHitlRequest；auto_triggered 时显示已自动续跑提示。
 * - D6 「回到会话查看」仅跳 { name: 'chat' }，不携 thread_id / 任何 query。
 * - D7 不轮询：手动刷新按钮 + visibilitychange hidden→visible 边沿刷新一次，卸载移除监听。
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { ElMessageBox } from 'element-plus'

import {
  decideHitlRequest,
  fetchHitlPending,
  resumeHitlRequest,
} from '../api/hitl'
import type { HitlDecision, HitlPendingItem, HitlResumeMode } from '../api/hitl'
import type { ApiError } from '../api/http'

type RowStatus =
  | 'pending'
  | 'await_resume'
  | 'auto_resumed'
  | 'done'
  | 'rejected'
  | 'resumed'

interface RowVm {
  item: HitlPendingItem
  resumeMode: HitlResumeMode
  status: RowStatus
  deciding: boolean
  resuming: boolean
  /** 行级提示（FP-5/6/7/8/11）：过期 / 已被处理 / 不存在 / 决策失败 / 续跑失败 */
  error: string
  /** resume 成功后的 replay 摘要（只展示 run_id/cursor，不消费补帧 · 非范围） */
  replay: { run_id: string; cursor: string } | null
}

const loading = ref(false)
const rows = ref<RowVm[]>([])
const listError = ref<ApiError | null>(null)

/* ==================== web-ux-state-sync D1 · 已决区会话内保留（sessionStorage · F1/F2） ==================== */

/** 已决区存储键（版本化 · FP-3 损坏/版本不符整键丢弃） */
const DECIDED_STORAGE_KEY = 'ops.hitl.decided.v1'
/** 快照版本字段（D1 定值 · 校验用） */
const DECIDED_SNAPSHOT_VERSION = 1
/** FIFO 上限（FP-12） */
const DECIDED_FIFO_LIMIT = 20

/** 已决行快照（sessionStorage 序列化面 · 版本字段 v 校验 · item 照登 HitlPendingItem 六键） */
interface DecidedSnapshot {
  v: number
  id: string
  item: HitlPendingItem
  decision: HitlDecision | null
  status: RowStatus
  replay: { run_id: string; cursor: string } | null
  decidedAt: number
}

/** 已决区行 VM（快照 + 本会话交互态 · resuming/error 为内存态不落盘） */
interface DecidedRowVm extends DecidedSnapshot {
  resuming: boolean
  error: string
}

const decidedRows = ref<DecidedRowVm[]>([])

function isValidDecidedSnapshot(value: unknown): value is DecidedSnapshot {
  if (typeof value !== 'object' || value === null) return false
  const snap = value as Record<string, unknown>
  return (
    snap.v === DECIDED_SNAPSHOT_VERSION &&
    typeof snap.id === 'string' &&
    typeof snap.item === 'object' &&
    snap.item !== null &&
    ['await_resume', 'auto_resumed', 'done', 'rejected', 'resumed'].includes(snap.status as string)
  )
}

/** 读盘回灌：损坏/版本不符 → 整键丢弃（FP-3）· 读取异常静默（sessionStorage 可能不可用） */
function loadDecidedSnapshots(): DecidedSnapshot[] {
  try {
    const raw = window.sessionStorage.getItem(DECIDED_STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || !parsed.every(isValidDecidedSnapshot)) {
      window.sessionStorage.removeItem(DECIDED_STORAGE_KEY)
      return []
    }
    // FP-12 双向：回灌即裁 FIFO 上限（历史超容数据入列前最旧被挤掉）
    return parsed.slice(-DECIDED_FIFO_LIMIT)
  } catch {
    try {
      window.sessionStorage.removeItem(DECIDED_STORAGE_KEY)
    } catch {
      /* 静默：sessionStorage 不可用时页面不炸 */
    }
    return []
  }
}

/** 写盘 best-effort：失败静默降级内存态（FP-2 · 等同现状不劣化） */
function persistDecidedSnapshots(list: DecidedSnapshot[]): void {
  try {
    window.sessionStorage.setItem(DECIDED_STORAGE_KEY, JSON.stringify(list))
  } catch {
    /* FP-2 静默降级：内存态仍可渲染已决区 */
  }
}

/** pending 行 → 已决快照（decision 由行态推定 · rejected 专属 · 其余已决态=approved） */
function toDecidedSnapshot(row: RowVm): DecidedSnapshot {
  return {
    v: DECIDED_SNAPSHOT_VERSION,
    id: row.item.id,
    item: row.item,
    decision: row.status === 'rejected' ? 'rejected' : 'approved',
    status: row.status,
    replay: row.replay,
    decidedAt: Date.now(),
  }
}

/** VM → 纯快照（落盘/回灌边界剥离交互态） */
function toSnapshotOfVm(row: DecidedRowVm): DecidedSnapshot {
  return {
    v: row.v,
    id: row.id,
    item: row.item,
    decision: row.decision,
    status: row.status,
    replay: row.replay,
    decidedAt: row.decidedAt,
  }
}

/** 落盘合并：同 id 去重替换（FP-11）+ FIFO 20（FP-12） */
function upsertDecidedSnapshot(snapshot: DecidedSnapshot): void {
  const rest = decidedRows.value
    .filter((row) => row.id !== snapshot.id)
    .map((row) => toSnapshotOfVm(row))
  const next = [...rest, snapshot].slice(-DECIDED_FIFO_LIMIT)
  decidedRows.value = next.map((snap) => ({ ...snap, resuming: false, error: '' }))
  persistDecidedSnapshots(next)
}

function decidedStatusLabel(status: RowStatus): string {
  switch (status) {
    case 'await_resume':
      return '已批准 · 待显式续跑'
    case 'auto_resumed':
      return '已批准并自动续跑'
    case 'done':
      return '已批准'
    case 'rejected':
      return '已驳回'
    case 'resumed':
      return '已续跑'
    default:
      return status
  }
}

/** D1：已决区显式续跑（approved·待续跑入口 · 两步钉死存续 · 失败文案与 pending 行同 resumeErrorText） */
async function onDecidedResume(row: DecidedRowVm): Promise<void> {
  if (row.resuming) return
  row.resuming = true
  row.error = ''
  try {
    const resp = await resumeHitlRequest(row.id)
    upsertDecidedSnapshot({
      ...toSnapshotOfVm(row),
      status: 'resumed',
      replay: resp.replay ? { run_id: resp.replay.run_id, cursor: resp.replay.cursor } : null,
    })
    void refresh()
  } catch (error) {
    const apiError = error as ApiError
    row.error = resumeErrorText(apiError)
    if (apiError.status === 404 || apiError.status === 409 || /过期|expired/i.test(apiError.message)) {
      void refresh()
    }
  } finally {
    row.resuming = false
  }
}

function toVm(item: HitlPendingItem): RowVm {
  return {
    item,
    resumeMode: 'inherit',
    status: 'pending',
    deciding: false,
    resuming: false,
    error: '',
    replay: null,
  }
}

/**
 * 刷新合并策略：decide/resume 成功后的行保留本地态（两行链 UI 不被刷新抹掉 · D5），
 * 服务端仍返回的已决行不重复入列（以本地已决态为准）。
 */
async function refresh(): Promise<void> {
  loading.value = true
  try {
    const resp = await fetchHitlPending()
    const kept = rows.value.filter((row) => row.status !== 'pending')
    const keptIds = new Set(kept.map((row) => row.item.id))
    const prevById = new Map(rows.value.map((row) => [row.item.id, row]))
    const next = resp.items
      .filter((item) => !keptIds.has(item.id))
      .map((item) => {
        const prev = prevById.get(item.id)
        if (prev && prev.status === 'pending') {
          prev.item = item
          return prev
        }
        return toVm(item)
      })
    rows.value = [...next, ...kept]
    listError.value = null
  } catch (error) {
    listError.value = error as ApiError
  } finally {
    loading.value = false
  }
}

function onManualRefresh(): void {
  void refresh()
}

/** D7：visibilitychange hidden→visible 边沿刷新一次（事件驱动单次 · 非轮询） */
function onVisibilityChange(): void {
  if (document.hidden) return
  void refresh()
}

onMounted(() => {
  // D1：会话内保留回灌（损坏/版本不符整键丢弃 · FP-3）
  decidedRows.value = loadDecidedSnapshots().map((snap) => ({
    ...snap,
    resuming: false,
    error: '',
  }))
  document.addEventListener('visibilitychange', onVisibilityChange)
  void refresh()
})

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityChange)
})

/** decide 失败行级文案（FP-5 过期 / FP-6 409 / FP-7 404 / FP-8 400 / 泛化兜底） */
function decideErrorText(error: ApiError): string {
  if (/过期|expired/i.test(error.message)) return '审批已过期，请刷新列表'
  if (error.status === 409) return '该审批已被处理，列表已刷新'
  if (error.status === 404) return '审批不存在或无权处理，列表已刷新'
  if (error.status === 400) return '决策失败：续跑方式（resume_mode）未被后端接受'
  return `决策失败：${error.message}`
}

async function onDecide(row: RowVm, decision: HitlDecision): Promise<void> {
  if (row.deciding || row.resuming) return
  row.deciding = true
  row.error = ''
  try {
    await ElMessageBox.confirm(
      decision === 'approved' ? '确认批准该审批？' : '确认驳回该审批？',
      '二次确认',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    row.deciding = false
    return
  }
  try {
    const resp = await decideHitlRequest(
      row.item.id,
      decision,
      // D4：inherit 送 undefined → 契约层不送 resume_mode 键（hitl.ts:99-100）
      row.resumeMode === 'inherit' ? undefined : row.resumeMode,
    )
    if (decision === 'rejected') {
      row.status = 'rejected'
    } else if (resp.resume?.auto_triggered) {
      row.status = 'auto_resumed'
    } else if (resp.resume?.required) {
      row.status = 'await_resume'
    } else {
      row.status = 'done'
    }
    upsertDecidedSnapshot(toDecidedSnapshot(row)) // D1：decide 成功 → 已决区快照落盘（含两步链态）
    void refresh()
  } catch (error) {
    const apiError = error as ApiError
    row.error = decideErrorText(apiError)
    // FP-5/6/7：已决/不存在/过期 → 联动刷新列表使该项被移除或标记
    if (apiError.status === 409 || apiError.status === 404 || /过期|expired/i.test(apiError.message)) {
      void refresh()
    }
  } finally {
    row.deciding = false
  }
}

/**
 * resume 失败行级文案（与 decide 路径 decideErrorText 同机制 · W-web-1：FP-5 过期映射增量，文案同 :111）。
 * web-ux-state-sync D4：resume 409 写窗冲突中性化——子串判据 = 后端恢复写面文案
 * （"writing new events" / "settles"）→「恢复写入中，请稍后重试」；未命中维持 409 透传（FP-8）。
 */
function resumeErrorText(error: ApiError): string {
  if (/过期|expired/i.test(error.message)) return '审批已过期，请刷新列表'
  if (error.status === 409 && /writing new events|settles/i.test(error.message)) {
    return '恢复写入中，请稍后重试'
  }
  if (error.status === 404 || error.status === 409) return `续跑失败：${error.message}`
  return '续跑失败（网络/服务异常），可重试'
}

async function onResume(row: RowVm): Promise<void> {
  if (row.deciding || row.resuming) return
  row.resuming = true
  row.error = ''
  try {
    const resp = await resumeHitlRequest(row.item.id)
    row.status = 'resumed'
    row.replay = resp.replay
      ? { run_id: resp.replay.run_id, cursor: resp.replay.cursor }
      : null
    upsertDecidedSnapshot(toDecidedSnapshot(row)) // D1：resume 成功 → 快照链态推进为 resumed + replay 摘要
    void refresh()
  } catch (error) {
    const apiError = error as ApiError
    row.error = resumeErrorText(apiError)
    // FP-5/6/7：过期/不存在/409 → 联动刷新列表（与 decide 路径 :153 同机制）
    if (apiError.status === 404 || apiError.status === 409 || /过期|expired/i.test(apiError.message)) {
      void refresh()
    }
  } finally {
    row.resuming = false
  }
}

/** D3：thread_id/run_id 截断展示（完整值留 title 供人工对照） */
function truncateId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 12)}…` : id
}

/** D3：blocked_by 只读 JSON 快照（对应后端 hitl_snapshot_fields 防批A执行B语义） */
function blockedBySnapshot(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? 'null'
  } catch {
    return String(value)
  }
}

/**
 * web-ux-state-sync D3：created_at 本地化渲染（Intl 本地时区 · title 保 UTC 原文 ·
 * FP-9 非法值回退原文直出不炸）。验收面 = /hitl 行 meta（NIT-3 · 浮层卡不渲染 created_at）。
 */
function formatCreatedAt(createdAt: string): string {
  const ts = Date.parse(createdAt)
  if (Number.isNaN(ts)) return createdAt
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'medium' }).format(
    new Date(ts),
  )
}

function formatWait(createdAt: string): string {
  const start = Date.parse(createdAt)
  if (Number.isNaN(start)) return '已等待 —'
  const diffMin = Math.max(0, Math.floor((Date.now() - start) / 60_000))
  if (diffMin >= 60 * 24) return `已等待 ${Math.floor(diffMin / (60 * 24))} 天`
  if (diffMin >= 60) return `已等待 ${Math.floor(diffMin / 60)} 小时 ${diffMin % 60} 分`
  return `已等待 ${diffMin} 分钟`
}
</script>

<template>
  <div class="hitl-page" data-test="hitl-page">
    <div class="hitl-page__header">
      <h2 class="hitl-page__title">人工审批</h2>
      <el-button
        size="small"
        data-test="hitl-refresh"
        :loading="loading"
        @click="onManualRefresh"
      >
        刷新
      </el-button>
    </div>

    <div
      v-if="loading && rows.length === 0 && !listError"
      class="hitl-page__state"
      data-test="hitl-loading"
    >
      加载中…
    </div>

    <template v-else-if="listError && rows.length === 0">
      <el-alert
        v-if="listError.status === 403"
        type="error"
        :closable="false"
        data-test="hitl-error-forbidden"
        title="无权限查看审批列表"
        description="当前账号无审批权限（需 maintainer），请切换有权限的账号后重试。"
      />
      <el-alert
        v-else-if="listError.status === null"
        type="error"
        :closable="false"
        data-test="hitl-error-network"
        title="网络请求失败，请检查连接后重试"
        :description="listError.message"
      />
      <el-alert
        v-else
        type="error"
        :closable="false"
        data-test="hitl-error"
        :title="`加载失败（HTTP ${listError.status}）`"
        :description="listError.message"
      />
      <el-button
        size="small"
        class="hitl-page__retry"
        data-test="hitl-retry"
        @click="onManualRefresh"
      >
        重试
      </el-button>
    </template>

    <div
      v-else-if="rows.length === 0"
      class="hitl-page__state"
      data-test="hitl-empty"
    >
      无待审批
    </div>

    <el-alert
      v-if="listError && rows.length > 0"
      type="error"
      :closable="false"
      class="hitl-page__inline-error"
      data-test="hitl-error-inline"
      title="刷新失败，列表为上次结果"
      :description="listError.message"
    />

    <ul v-if="rows.length > 0" class="hitl-page__list" data-test="hitl-list">
      <li v-for="row in rows" :key="row.item.id" class="hitl-row" data-test="hitl-row">
        <div class="hitl-row__head">
          <span class="hitl-row__reason">{{ row.item.reason || '（无 reason）' }}</span>
          <span class="hitl-row__wait">{{ formatWait(row.item.created_at) }}</span>
        </div>
        <div class="hitl-row__meta">
          <span data-test="hitl-created-at" :title="row.item.created_at"
            >创建时间 {{ formatCreatedAt(row.item.created_at) }}</span
          >
          <span :title="row.item.thread_id">thread {{ truncateId(row.item.thread_id) }}</span>
          <span :title="row.item.run_id">run {{ truncateId(row.item.run_id) }}</span>
        </div>
        <pre class="hitl-row__snapshot" data-test="hitl-blocked-by">{{ blockedBySnapshot(row.item.blocked_by) }}</pre>

        <p v-if="row.error" class="hitl-row__error" data-test="hitl-row-error">{{ row.error }}</p>

        <template v-if="row.status === 'pending'">
          <el-radio-group
            v-model="row.resumeMode"
            size="small"
            class="hitl-row__resume-mode"
            data-test="hitl-resume-mode"
            :disabled="row.deciding || row.resuming"
          >
            <el-radio-button value="inherit">续跑默认</el-radio-button>
            <el-radio-button value="immediate">批准即续跑</el-radio-button>
            <el-radio-button value="manual">手动续跑</el-radio-button>
          </el-radio-group>
          <div class="hitl-row__actions">
            <el-button
              size="small"
              type="primary"
              data-test="hitl-approve"
              :disabled="row.deciding || row.resuming"
              :loading="row.deciding"
              @click="onDecide(row, 'approved')"
            >
              批准
            </el-button>
            <el-button
              size="small"
              type="danger"
              plain
              data-test="hitl-reject"
              :disabled="row.deciding || row.resuming"
              @click="onDecide(row, 'rejected')"
            >
              驳回
            </el-button>
          </div>
        </template>

        <template v-else-if="row.status === 'await_resume'">
          <p class="hitl-row__note">已批准。按两步链需显式续跑：</p>
          <el-button
            size="small"
            type="primary"
            plain
            data-test="hitl-resume"
            :disabled="row.resuming"
            :loading="row.resuming"
            @click="onResume(row)"
          >
            续跑
          </el-button>
        </template>

        <template v-else-if="row.status === 'auto_resumed'">
          <p class="hitl-row__note" data-test="hitl-auto-note">已批准并自动续跑。</p>
          <router-link class="hitl-row__back" data-test="hitl-back-to-chat" :to="{ name: 'chat' }">
            回到会话查看
          </router-link>
        </template>

        <template v-else-if="row.status === 'resumed'">
          <p class="hitl-row__note">已续跑。</p>
          <p v-if="row.replay" class="hitl-row__replay" data-test="hitl-replay">
            run {{ row.replay.run_id }} · cursor {{ row.replay.cursor }}
          </p>
          <router-link class="hitl-row__back" data-test="hitl-back-to-chat" :to="{ name: 'chat' }">
            回到会话查看
          </router-link>
        </template>

        <p v-else-if="row.status === 'rejected'" class="hitl-row__note" data-test="hitl-rejected-note">
          已驳回。
        </p>

        <template v-else>
          <p class="hitl-row__note">已批准。</p>
          <router-link class="hitl-row__back" data-test="hitl-back-to-chat" :to="{ name: 'chat' }">
            回到会话查看
          </router-link>
        </template>
      </li>
    </ul>

    <!-- web-ux-state-sync D1 · 已决区（sessionStorage 会话内保留 · 刷新/重挂后仍在 · 真源以服务端为准） -->
    <section v-if="decidedRows.length > 0" class="hitl-decided" data-test="hitl-decided">
      <h3 class="hitl-decided__title">已决单（本会话内保留 · 刷新后仍在 · 真源以服务端为准）</h3>
      <ul class="hitl-page__list">
        <li
          v-for="row in decidedRows"
          :key="`decided-${row.id}`"
          class="hitl-row hitl-row--decided"
          data-test="hitl-decided-row"
        >
          <div class="hitl-row__head">
            <span class="hitl-row__reason">{{ row.item.reason || '（无 reason）' }}</span>
            <span class="hitl-row__status">{{ decidedStatusLabel(row.status) }}</span>
          </div>
          <div class="hitl-row__meta">
            <span data-test="hitl-created-at" :title="row.item.created_at"
              >创建时间 {{ formatCreatedAt(row.item.created_at) }}</span
            >
            <span :title="row.item.thread_id">thread {{ truncateId(row.item.thread_id) }}</span>
            <span :title="row.item.run_id">run {{ truncateId(row.item.run_id) }}</span>
          </div>
          <pre class="hitl-row__snapshot">{{ blockedBySnapshot(row.item.blocked_by) }}</pre>

          <p v-if="row.error" class="hitl-row__error" data-test="hitl-decided-error">{{ row.error }}</p>

          <!-- 两步钉死存续：approved·待续跑保留显式续跑入口（走 resumeHitlRequest） -->
          <template v-if="row.status === 'await_resume'">
            <p class="hitl-row__note">已批准。按两步链需显式续跑：</p>
            <el-button
              size="small"
              type="primary"
              plain
              data-test="hitl-decided-resume"
              :disabled="row.resuming"
              :loading="row.resuming"
              @click="onDecidedResume(row)"
            >
              续跑
            </el-button>
          </template>
          <template v-else-if="row.status === 'resumed'">
            <p class="hitl-row__note">已续跑。</p>
            <p v-if="row.replay" class="hitl-row__replay">run {{ row.replay.run_id }} · cursor {{ row.replay.cursor }}</p>
          </template>
          <p v-else-if="row.status === 'rejected'" class="hitl-row__note">已驳回。</p>
          <p v-else-if="row.status === 'auto_resumed'" class="hitl-row__note">已批准并自动续跑。</p>
          <p v-else class="hitl-row__note">已批准。</p>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.hitl-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.hitl-page__title {
  margin: 0;
  font-size: 18px;
}

.hitl-page__state {
  padding: 48px 0;
  text-align: center;
  color: var(--ops-text-secondary);
}

.hitl-page__retry {
  margin-top: 12px;
}

.hitl-page__inline-error {
  margin-bottom: 12px;
}

.hitl-page__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hitl-decided {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed rgba(44, 44, 44, 0.18);
}

.hitl-decided__title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: var(--ops-text-secondary);
}

.hitl-row--decided {
  opacity: 0.92;
}

.hitl-row__status {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--ops-text-secondary);
}

.hitl-row {
  padding: 12px 14px;
  border: 1px solid rgba(230, 162, 60, 0.55);
  border-left: 3px solid #e6a23c;
  border-radius: 6px;
  background: var(--ops-bg-paper);
  font-size: 13px;
  line-height: 1.6;
}

.hitl-row__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.hitl-row__reason {
  font-weight: 600;
  white-space: pre-wrap;
  word-break: break-word;
}

.hitl-row__wait {
  color: #e6a23c;
  white-space: nowrap;
}

.hitl-row__meta {
  margin-top: 4px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--ops-text-secondary);
  font-family: monospace;
  font-size: 12px;
}

.hitl-row__snapshot {
  margin: 8px 0 0;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(44, 44, 44, 0.04);
  font-size: 12px;
  overflow-x: auto;
  user-select: text;
}

.hitl-row__error {
  margin: 8px 0 0;
  color: #f56c6c;
}

.hitl-row__resume-mode {
  margin-top: 8px;
}

.hitl-row__actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.hitl-row__note {
  margin: 8px 0 0;
  opacity: 0.75;
}

.hitl-row__replay {
  margin: 4px 0 0;
  font-family: monospace;
  font-size: 12px;
  color: var(--ops-text-secondary);
}

.hitl-row__back {
  display: inline-block;
  margin-top: 8px;
  color: var(--el-color-primary);
  text-decoration: none;
}
</style>
