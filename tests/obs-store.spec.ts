import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/obs', () => ({
  loadObsStatusFixture: vi.fn(),
  loadObsTimelineFixture: vi.fn(),
}))

import {
  loadObsStatusFixture,
  loadObsTimelineFixture,
  type ObsStatus,
  type ObsTimeline,
} from '../src/api/obs'
import { useObsStore } from '../src/stores/obs'

const READY: ObsStatus = {
  schema_version: 'obs_status.v1',
  task_slug: 'demo-ready',
  task_path: 'docs/tasks/active/task_demo_ready.md',
  status: 'in_progress',
  gates: [
    { id: 'HG-AUDIT-R1', status: 'approved', blocks_hats: '30' },
  ],
  may_start_30: true,
  blockers: [],
  last_invoke: { path: null, hat_id: null },
  reviews: { R1: true, CLOSE: false },
  verify_preview: { ok: true, reason: 'PASS' },
  hgm: { event_count: 1, last_at: '2026-07-27T12:00:00.000Z' },
  kpi_section: false,
  next_hint: 'ok',
}

const BLOCKED: ObsStatus = {
  ...READY,
  task_slug: 'demo-blocked',
  may_start_30: false,
  blockers: ['HG-AUDIT-R1=pending'],
  reviews: { R1: false, CLOSE: false },
  verify_preview: { ok: false, reason: 'missing R1' },
}

const EMPTY_TL: ObsTimeline = {
  schema_version: 'obs_timeline.v1',
  task_slug: 'demo-blocked',
  task_path: 'x.md',
  event_count: 0,
  returned: 0,
  limit: null,
  ingested: false,
  ingest: null,
  events: [],
}

const EVENTS_TL: ObsTimeline = {
  ...EMPTY_TL,
  task_slug: 'demo-ready',
  event_count: 1,
  returned: 1,
  events: [
    {
      type: 'TaskCreated',
      occurred_at: '2026-07-27T10:00:00.000Z',
      summary: 'created',
    },
  ],
}

describe('obs store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('load ready fixture → may_start_30 true + timeline 有事件', async () => {
    vi.mocked(loadObsStatusFixture).mockResolvedValue(READY)
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EVENTS_TL)

    const store = useObsStore()
    await store.load()

    expect(store.error).toBeNull()
    expect(store.status?.may_start_30).toBe(true)
    expect(store.timeline?.events).toHaveLength(1)
  })

  it('切换 blocked 场景 → may_start_30 false + 空 timeline', async () => {
    vi.mocked(loadObsStatusFixture).mockResolvedValue(BLOCKED)
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EMPTY_TL)

    const store = useObsStore()
    await store.setStatusScenario('blocked')

    expect(store.statusScenario).toBe('blocked')
    expect(store.timelineScenario).toBe('empty')
    expect(store.status?.may_start_30).toBe(false)
    expect(store.timeline?.event_count).toBe(0)
  })

  it('fixture 加载失败 → error 态不抛出', async () => {
    vi.mocked(loadObsStatusFixture).mockRejectedValue(new Error('bad json'))
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EMPTY_TL)

    const store = useObsStore()
    await store.load()

    expect(store.error).toContain('bad json')
    expect(store.status).toBeNull()
  })
})
