import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  LG_RAG_RUN_EVENTS_PATH,
  LG_RAG_THREAD_RUNS_PATH,
  SCHEDULES_PATH,
  fetchRunEvents,
  listThreadRuns,
  listThreadSchedules,
  patchSchedule,
} from '../src/api/taskPanel'
import { http } from '../src/api/http'

/**
 * P3-T8 taskPanel client 契约测试（15-p3-contracts §1/§3 逐键 · 只承接禁改）：
 * URL/参数拼装 + {ok,data} 拆壳 + next_cursor/next_after_seq 透传 + humanized_display 字段族 +
 * 契约外宽松容忍（非外壳形原样返回 · 未知键不依赖）。
 */

const RUN_ITEM = {
  run_id: 'run-1',
  thread_id: 'th-1',
  status: 'running',
  created_at: '2026-11-16T10:00:00Z',
  finished_at: null,
  query_summary: '每天早上推送晨报',
  schedule_attribution: { schedule_id: 'sch-1', name: '晨报', fire_id: 'fire-9' },
}

const EVENT_ITEM = {
  seq: 1,
  event_type: 'run.start',
  payload: { query: '每天早上推送晨报' },
  created_at: '2026-11-16T10:00:01Z',
}

const SCHEDULE_ITEM = {
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
  fire_count: 3,
  max_fires: null,
  last_fired_at: '2026-11-16T00:30:00Z',
  created_at: '2026-11-10T00:00:00Z',
  updated_at: '2026-11-16T00:00:00Z',
  humanized_display: '每天 08:30（Asia/Shanghai）',
}

describe('api/taskPanel（P3-T8 · 契约字段族逐键对齐）', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('GET /ops/lg-rag/threads/{id}/runs：拆壳 + keyset 参数透传 + next_cursor 保真', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { runs: [RUN_ITEM], next_cursor: 'cur-2' } },
    })

    const page = await listThreadRuns('th-1', { cursor: 'cur-1', limit: 20 })

    const [url, config] = get.mock.calls[0]
    expect(url).toBe(`${LG_RAG_THREAD_RUNS_PATH}/th-1/runs`)
    expect(url).toBe('/ops/lg-rag/threads/th-1/runs')
    expect(config).toEqual({ params: { cursor: 'cur-1', limit: 20 } })
    expect(page.runs).toHaveLength(1)
    expect(page.runs[0].schedule_attribution?.name).toBe('晨报')
    expect(page.next_cursor).toBe('cur-2')
  })

  it('runs 无参调用不带 cursor/limit；next_cursor 缺省 → null', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { runs: [] } },
    })

    const page = await listThreadRuns('th-1')

    expect(get.mock.calls[0][1]).toEqual({ params: {} })
    expect(page.next_cursor).toBeNull()
  })

  it('GET /ops/lg-rag/runs/{id}/events：after_seq 透传 + truncated/next_after_seq 保真', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: {
        ok: true,
        data: { run_id: 'run-1', events: [EVENT_ITEM], truncated: true, next_after_seq: 500 },
      },
    })

    const page = await fetchRunEvents('run-1', 42)

    const [url, config] = get.mock.calls[0]
    expect(url).toBe(`${LG_RAG_RUN_EVENTS_PATH}/run-1/events`)
    expect(url).toBe('/ops/lg-rag/runs/run-1/events')
    expect(config).toEqual({ params: { after_seq: 42 } })
    expect(page.events[0].event_type).toBe('run.start')
    expect(page.truncated).toBe(true)
    expect(page.next_after_seq).toBe(500)
  })

  it('GET /ops/schedules?thread_id=：humanized_display 字段族透传（前端不自拼）', async () => {
    const get = vi.spyOn(http, 'get').mockResolvedValue({
      data: { ok: true, data: { schedules: [SCHEDULE_ITEM] } },
    })

    const schedules = await listThreadSchedules('th-1')

    expect(get.mock.calls[0][0]).toBe(SCHEDULES_PATH)
    expect(get.mock.calls[0][1]).toEqual({ params: { thread_id: 'th-1' } })
    expect(schedules).toHaveLength(1)
    expect(schedules[0].humanized_display).toBe('每天 08:30（Asia/Shanghai）')
    expect(schedules[0].schedule_kind).toBe('daily_at')
  })

  it('PATCH /ops/schedules/{id}：body 仅 status · 返回 data.schedule 整体', async () => {
    const patch = vi.spyOn(http, 'patch').mockResolvedValue({
      data: { ok: true, data: { schedule: { ...SCHEDULE_ITEM, status: 'paused' } } },
    })

    const updated = await patchSchedule('sch-1', { status: 'paused' })

    expect(patch.mock.calls[0][0]).toBe(`${SCHEDULES_PATH}/sch-1`)
    expect(patch.mock.calls[0][1]).toEqual({ status: 'paused' })
    expect(updated.status).toBe('paused')
    expect(updated.humanized_display).toBe('每天 08:30（Asia/Shanghai）')
  })

  it('契约外宽松容忍：非 {ok,data} 外壳形原样返回不炸', async () => {
    vi.spyOn(http, 'get').mockResolvedValue({
      data: { runs: [RUN_ITEM], next_cursor: null },
    })

    const page = await listThreadRuns('th-1')

    expect(page.runs).toHaveLength(1)
  })
})
