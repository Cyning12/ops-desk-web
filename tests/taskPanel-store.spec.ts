import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/taskPanel', () => ({
  listThreadRuns: vi.fn(),
  fetchRunEvents: vi.fn(),
  listThreadSchedules: vi.fn(),
  patchSchedule: vi.fn(),
}))

import {
  listThreadRuns,
  listThreadSchedules,
  patchSchedule,
} from '../src/api/taskPanel'
import type { ApiError } from '../src/api/http'
import type { ScheduleItem, ThreadRunItem } from '../src/api/taskPanel'
import {
  RUN_STATUS_META,
  runStatusMeta,
  useTaskPanelStore,
} from '../src/stores/taskPanel'

/**
 * P3-T8 taskPanel store 单测（14 §2.4 SSE 增量 + 15 §1/§3 状态机）：
 * REST 全量拉幂等/降级（FP-F8）· 徽标计数口径（running+waiting_approval）·
 * run.start 幂等插卡 · done 终态映射 · hitl.waiting 置待审批 · 终态粘滞不回退 ·
 * keyset 翻页去重 · 行内状态流转 422 detail 逐字 / 404 重拉对账。
 */

function run(overrides: Partial<ThreadRunItem> = {}): ThreadRunItem {
  return {
    run_id: 'run-1',
    thread_id: 'th-1',
    status: 'running',
    created_at: '2026-11-16T10:00:00Z',
    finished_at: null,
    query_summary: '任务甲',
    schedule_attribution: null,
    ...overrides,
  }
}

function schedule(overrides: Partial<ScheduleItem> = {}): ScheduleItem {
  return {
    schedule_id: 'sch-1',
    tenant_id: 't',
    user_id: 'u',
    thread_id: 'th-1',
    name: '晨报',
    instruction: '推送晨报',
    schedule_kind: 'daily_at',
    run_at: null,
    interval_seconds: null,
    time_of_day: '08:30',
    timezone: 'Asia/Shanghai',
    next_fire_at: '2026-11-17T00:30:00Z',
    catchup_policy: 'skip',
    status: 'active',
    fire_count: 0,
    max_fires: null,
    last_fired_at: null,
    created_at: '2026-11-10T00:00:00Z',
    updated_at: '2026-11-10T00:00:00Z',
    humanized_display: '每天 08:30（Asia/Shanghai）',
    ...overrides,
  }
}

describe('stores/taskPanel（P3-T8）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('状态六词表元数据齐备；未知词兜底 info 不崩', () => {
    expect(Object.keys(RUN_STATUS_META).sort()).toEqual(
      ['disconnected', 'done', 'error', 'resumed', 'running', 'waiting_approval'].sort(),
    )
    expect(RUN_STATUS_META.running.action).toBe('resume')
    expect(RUN_STATUS_META.waiting_approval.action).toBe('scroll-hitl')
    expect(RUN_STATUS_META.done.action).toBe('replay')
    expect(RUN_STATUS_META.disconnected.action).toBe('resume')
    const fallback = runStatusMeta('mystery')
    expect(fallback.tagType).toBe('info')
    expect(fallback.label).toBe('mystery')
  })

  it('loadPanel 成功：runs+schedules 填充 · 徽标 = running + waiting_approval', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({
      runs: [
        run({ run_id: 'r-running', status: 'running' }),
        run({ run_id: 'r-waiting', status: 'waiting_approval' }),
        run({ run_id: 'r-done', status: 'done' }),
      ],
      next_cursor: null,
    })
    vi.mocked(listThreadSchedules).mockResolvedValue([schedule()])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')

    expect(store.runs).toHaveLength(3)
    expect(store.schedules).toHaveLength(1)
    expect(store.inProgressCount).toBe(2)
    expect(store.runsDegraded).toBe(false)
    expect(store.schedulesDegraded).toBe(false)
  })

  it('loadPanel 404/失败静默降级空态不抛出（FP-F8）· loadPanel(null) 清空', async () => {
    vi.mocked(listThreadRuns).mockRejectedValue({ status: 404, message: 'Not Found' })
    vi.mocked(listThreadSchedules).mockRejectedValue({ status: 404, message: 'Not Found' })

    const store = useTaskPanelStore()
    await store.loadPanel('th-x')

    expect(store.runs).toEqual([])
    expect(store.runsDegraded).toBe(true)
    expect(store.schedules).toEqual([])
    expect(store.schedulesDegraded).toBe(true)

    await store.loadPanel(null)
    expect(store.panelThreadId).toBeNull()
    expect(store.runsDegraded).toBe(false)
    expect(store.schedulesDegraded).toBe(false)
  })

  it('loadMoreRuns：keyset 翻页追加去重 · 游标耗尽即止', async () => {
    vi.mocked(listThreadRuns)
      .mockResolvedValueOnce({ runs: [run({ run_id: 'r-2' }), run({ run_id: 'r-1' })], next_cursor: 'cur-2' })
      .mockResolvedValueOnce({ runs: [run({ run_id: 'r-1' }), run({ run_id: 'r-0' })], next_cursor: null })

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')
    expect(store.runs.map((r) => r.run_id)).toEqual(['r-2', 'r-1'])

    await store.loadMoreRuns()
    expect(vi.mocked(listThreadRuns).mock.calls[1][1]).toEqual({ cursor: 'cur-2' })
    expect(store.runs.map((r) => r.run_id)).toEqual(['r-2', 'r-1', 'r-0'])
    expect(store.runsNextCursor).toBeNull()

    await store.loadMoreRuns()
    expect(vi.mocked(listThreadRuns)).toHaveBeenCalledTimes(2)
  })

  it('SSE run.start → 幂等插 running 卡（query 截 80 · 跨 thread 忽略）', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({ runs: [], next_cursor: null })
    vi.mocked(listThreadSchedules).mockResolvedValue([])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')

    const longQuery = '长'.repeat(100)
    const frame = {
      run_id: 'run-live',
      seq: 1,
      event_type: 'run.start',
      payload: { thread_id: 'th-1', query: longQuery },
    }
    store.applySseFrame(frame)
    store.applySseFrame({ ...frame, seq: 2 }) // replay 重放幂等

    expect(store.runs).toHaveLength(1)
    expect(store.runs[0].status).toBe('running')
    expect(store.runs[0].query_summary).toHaveLength(80)
    expect(store.inProgressCount).toBe(1)

    store.applySseFrame({
      run_id: 'run-other',
      seq: 1,
      event_type: 'run.start',
      payload: { thread_id: 'th-OTHER', query: '别会话' },
    })
    expect(store.runs).toHaveLength(1) // 跨 thread 不入当前面板
  })

  it('SSE done → 终态映射（completed→done · failed→error · waiting_approval→待审批）', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({
      runs: [run({ run_id: 'r-a', status: 'running' }), run({ run_id: 'r-b', status: 'running' })],
      next_cursor: null,
    })
    vi.mocked(listThreadSchedules).mockResolvedValue([])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')

    store.applySseFrame({ run_id: 'r-a', seq: 9, event_type: 'done', payload: { status: 'failed' } })
    const a = store.runs.find((r) => r.run_id === 'r-a')!
    expect(a.status).toBe('error')
    expect(a.finished_at).toBeTruthy()

    store.applySseFrame({ run_id: 'r-b', seq: 9, event_type: 'done', payload: { status: 'waiting_approval' } })
    expect(store.runs.find((r) => r.run_id === 'r-b')!.status).toBe('waiting_approval')

    store.applySseFrame({ run_id: 'r-c', seq: 1, event_type: 'done', payload: {} })
    expect(store.runs.find((r) => r.run_id === 'r-c')!.status).toBe('done')
  })

  it('SSE hitl.waiting → 置待审批；终态粘滞不回退（replay 重放防御）', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({
      runs: [run({ run_id: 'r-live', status: 'running' }), run({ run_id: 'r-term', status: 'done', finished_at: '2026-11-16T11:00:00Z' })],
      next_cursor: null,
    })
    vi.mocked(listThreadSchedules).mockResolvedValue([])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')

    store.applySseFrame({ run_id: 'r-live', seq: 5, event_type: 'hitl.waiting', payload: {} })
    expect(store.runs.find((r) => r.run_id === 'r-live')!.status).toBe('waiting_approval')

    store.applySseFrame({ run_id: 'r-term', seq: 3, event_type: 'hitl.waiting', payload: {} })
    expect(store.runs.find((r) => r.run_id === 'r-term')!.status).toBe('done') // 不回退

    store.applySseFrame({ run_id: 'r-unknown', seq: 1, event_type: 'hitl.waiting', payload: {} })
    expect(store.runs.find((r) => r.run_id === 'r-unknown')).toBeUndefined() // 无卡不造
  })

  it('setScheduleStatus 成功整体替换；422 detail 逐字落 actionError 不二次包装', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({ runs: [], next_cursor: null })
    vi.mocked(listThreadSchedules).mockResolvedValue([schedule()])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')

    vi.mocked(patchSchedule).mockResolvedValue(schedule({ status: 'paused' }))
    expect(await store.setScheduleStatus('sch-1', 'paused')).toBe(true)
    expect(store.schedules[0].status).toBe('paused')
    expect(store.scheduleActionError).toBeNull()

    vi.mocked(patchSchedule).mockRejectedValue({
      status: 422,
      message: '请求参数无效',
      detail: '已取消的定时任务不可修改',
    } as ApiError)
    expect(await store.setScheduleStatus('sch-1', 'cancelled')).toBe(false)
    expect(store.scheduleActionError).toBe('已取消的定时任务不可修改')
    expect(store.schedules[0].status).toBe('paused') // 失败不乐观改
  })

  it('setScheduleStatus 404 → 重拉对账；无 detail 时回退 message', async () => {
    vi.mocked(listThreadRuns).mockResolvedValue({ runs: [], next_cursor: null })
    vi.mocked(listThreadSchedules).mockResolvedValue([schedule()])

    const store = useTaskPanelStore()
    await store.loadPanel('th-1')
    vi.mocked(listThreadSchedules).mockClear()

    vi.mocked(patchSchedule).mockRejectedValue({ status: 404, message: '资源不存在' } as ApiError)
    expect(await store.setScheduleStatus('sch-ghost', 'paused')).toBe(false)
    expect(store.scheduleActionError).toBe('资源不存在')
    expect(listThreadSchedules).toHaveBeenCalledTimes(1) // 对账重拉
  })
})
