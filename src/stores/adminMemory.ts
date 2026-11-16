import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import {
  fetchMemoryEpisodes,
  fetchMemoryFacts,
  MEMORY_DEFAULT_LIMIT,
  revokeMemoryFact,
} from '../api/adminMemory'
import type {
  MemoryEpisode,
  MemoryEpisodeOutcome,
  MemoryEpisodeStatus,
  MemoryFact,
  MemoryFactKind,
  MemoryFactStatus,
} from '../api/adminMemory'
import type { ApiError } from '../api/http'
import { getStoredTenant } from '../tenant'

/**
 * P3-T9 admin memory 管理页状态（task_web_p3_t9_admin_memory · 14 §4 D-D + 15 §5）。
 *
 * - admin 面 = 跨租户运维面：tenant_id 为必填查询入参（默认取当前 tenant 存储值 · 可改）；
 *   空值不发起请求（上游 strip 空 400 不触达 · 前端必填闸）。
 * - keyset 分页无总数：cursor 栈（pageCursors 顶=当前页所用 cursor · 首页 null）；
 *   上一页=弹栈重拉 · 下一页=推入 next_cursor 重拉 · next_cursor=null 禁用下一页。
 * - revoke 幂等：200 affected=0/N 皆正常态（视图层呈现 · 非错误）；成功后重拉当前页。
 * - 403（cookie 非 maintainer「Maintainer role required」）：error 态照登，不炸页不抛异常；
 *   非 maintainer 的零探测面由视图层 isMaintainer 判定承接（不渲染不请求）。
 */
export const useAdminMemoryStore = defineStore('adminMemory', () => {
  // ---------- facts ----------
  const facts = ref<MemoryFact[]>([])
  const factsNextCursor = ref<string | null>(null)
  const factsLoading = ref(false)
  const factsError = ref<ApiError | null>(null)
  /** 当前页所用 cursor 栈（首页 null） */
  const factsPageCursors = ref<(string | null)[]>([null])

  const factsTenantId = ref(getStoredTenant())
  const factsUserId = ref('')
  const factsStatus = ref<MemoryFactStatus | ''>('active')
  const factsKind = ref<MemoryFactKind | ''>('')
  const factsLimit = ref<number>(MEMORY_DEFAULT_LIMIT)

  const factsIsEmpty = computed(() => facts.value.length === 0)
  const factsCanPrev = computed(() => factsPageCursors.value.length > 1)
  const factsCanNext = computed(() => factsNextCursor.value !== null)
  const factsPageIndex = computed(() => factsPageCursors.value.length)

  async function loadFacts(cursor: string | null): Promise<void> {
    const tenantId = factsTenantId.value.trim()
    if (!tenantId) return // 前端必填闸：tenant_id 空不发起请求（上游 400 不触达）
    factsLoading.value = true
    factsError.value = null
    try {
      const page = await fetchMemoryFacts({
        tenantId,
        userId: factsUserId.value.trim() || undefined,
        status: factsStatus.value || undefined,
        kind: factsKind.value || undefined,
        limit: factsLimit.value,
        cursor,
      })
      facts.value = page.facts
      factsNextCursor.value = page.nextCursor
    } catch (error) {
      factsError.value = error as ApiError
      facts.value = []
      factsNextCursor.value = null
    } finally {
      factsLoading.value = false
    }
  }

  /** 过滤条件变更：重置分页栈并拉首页 */
  async function applyFactsFilters(): Promise<void> {
    factsPageCursors.value = [null]
    await loadFacts(null)
  }

  async function nextFactsPage(): Promise<void> {
    if (!factsNextCursor.value) return
    factsPageCursors.value = [...factsPageCursors.value, factsNextCursor.value]
    await loadFacts(factsNextCursor.value)
  }

  async function prevFactsPage(): Promise<void> {
    if (factsPageCursors.value.length <= 1) return
    const stack = factsPageCursors.value.slice(0, -1)
    factsPageCursors.value = stack
    await loadFacts(stack[stack.length - 1])
  }

  /** 重拉当前页（revoke 成功后调用 · cursor 栈不动） */
  async function reloadFactsPage(): Promise<void> {
    const stack = factsPageCursors.value
    await loadFacts(stack[stack.length - 1])
  }

  /**
   * 撤销记忆（行级）：body {tenant_id, user_id=行 user_id}（行级精确 scope ·
   * user_id 空不出站）。成功（幂等 200 affected=0/N）后重拉当前页；affected 返回视图层呈现。
   * 失败（403/网络等）抛 ApiError 由视图层错误提示（不重拉不吞错）。
   */
  async function revokeFact(row: MemoryFact): Promise<number> {
    const { affected } = await revokeMemoryFact(row.key, {
      tenantId: row.tenant_id,
      userId: row.user_id || undefined,
    })
    await reloadFactsPage()
    return affected
  }

  // ---------- episodes ----------
  const episodes = ref<MemoryEpisode[]>([])
  const episodesNextCursor = ref<string | null>(null)
  const episodesLoading = ref(false)
  const episodesError = ref<ApiError | null>(null)
  const episodesPageCursors = ref<(string | null)[]>([null])

  const episodesTenantId = ref(getStoredTenant())
  const episodesRunId = ref('')
  const episodesStatus = ref<MemoryEpisodeStatus | ''>('')
  const episodesOutcome = ref<MemoryEpisodeOutcome | ''>('')
  const episodesLimit = ref<number>(MEMORY_DEFAULT_LIMIT)

  const episodesIsEmpty = computed(() => episodes.value.length === 0)
  const episodesCanPrev = computed(() => episodesPageCursors.value.length > 1)
  const episodesCanNext = computed(() => episodesNextCursor.value !== null)
  const episodesPageIndex = computed(() => episodesPageCursors.value.length)

  async function loadEpisodes(cursor: string | null): Promise<void> {
    const tenantId = episodesTenantId.value.trim()
    if (!tenantId) return // 前端必填闸（同 facts）
    episodesLoading.value = true
    episodesError.value = null
    try {
      const page = await fetchMemoryEpisodes({
        tenantId,
        runId: episodesRunId.value.trim() || undefined,
        status: episodesStatus.value || undefined,
        outcome: episodesOutcome.value || undefined,
        limit: episodesLimit.value,
        cursor,
      })
      episodes.value = page.episodes
      episodesNextCursor.value = page.nextCursor
    } catch (error) {
      episodesError.value = error as ApiError
      episodes.value = []
      episodesNextCursor.value = null
    } finally {
      episodesLoading.value = false
    }
  }

  async function applyEpisodesFilters(): Promise<void> {
    episodesPageCursors.value = [null]
    await loadEpisodes(null)
  }

  async function nextEpisodesPage(): Promise<void> {
    if (!episodesNextCursor.value) return
    episodesPageCursors.value = [...episodesPageCursors.value, episodesNextCursor.value]
    await loadEpisodes(episodesNextCursor.value)
  }

  async function prevEpisodesPage(): Promise<void> {
    if (episodesPageCursors.value.length <= 1) return
    const stack = episodesPageCursors.value.slice(0, -1)
    episodesPageCursors.value = stack
    await loadEpisodes(stack[stack.length - 1])
  }

  return {
    // facts
    facts,
    factsNextCursor,
    factsLoading,
    factsError,
    factsTenantId,
    factsUserId,
    factsStatus,
    factsKind,
    factsLimit,
    factsIsEmpty,
    factsCanPrev,
    factsCanNext,
    factsPageIndex,
    loadFacts,
    applyFactsFilters,
    nextFactsPage,
    prevFactsPage,
    revokeFact,
    // episodes
    episodes,
    episodesNextCursor,
    episodesLoading,
    episodesError,
    episodesTenantId,
    episodesRunId,
    episodesStatus,
    episodesOutcome,
    episodesLimit,
    episodesIsEmpty,
    episodesCanPrev,
    episodesCanNext,
    episodesPageIndex,
    loadEpisodes,
    applyEpisodesFilters,
    nextEpisodesPage,
    prevEpisodesPage,
  }
})
