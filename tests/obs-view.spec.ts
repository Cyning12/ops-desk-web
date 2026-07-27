import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
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
import ObsView from '../src/views/ObsView.vue'

const READY: ObsStatus = {
  schema_version: 'obs_status.v1',
  task_slug: 'demo-ready',
  task_path: 'docs/tasks/active/task_demo_ready.md',
  status: 'in_progress',
  gates: [
    { id: 'HG-GRAPH-MODULES', status: 'approved', blocks_hats: '30' },
    { id: 'HG-AUDIT-R1', status: 'approved', blocks_hats: '30' },
  ],
  may_start_30: true,
  blockers: [],
  last_invoke: { path: 'inv.md', hat_id: '30' },
  reviews: { R1: true, CLOSE: false },
  verify_preview: { ok: true, reason: 'PASS' },
  hgm: { event_count: 2, last_at: '2026-07-27T12:00:00.000Z' },
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
      type: 'GateApproved',
      occurred_at: '2026-07-27T12:00:00.000Z',
      summary: 'HG-AUDIT-R1 approved',
    },
  ],
}

function mountView() {
  return mount(ObsView, {
    global: {
      plugins: [createPinia(), ElementPlus],
    },
  })
}

describe('ObsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('渲染只读声明 + 满闸 fixture', async () => {
    vi.mocked(loadObsStatusFixture).mockResolvedValue(READY)
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EVENTS_TL)

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('只读投影')
    expect(w.text()).toContain('may_start_30')
    expect(w.text()).toContain('demo-ready')
    expect(w.text()).toContain('HG-AUDIT-R1 approved')
  })

  it('空 timeline 显示无 HGM 事件提示', async () => {
    vi.mocked(loadObsStatusFixture).mockResolvedValue(BLOCKED)
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EMPTY_TL)

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('无 HGM 事件')
    expect(w.text()).toContain('missing R1')
  })

  it('fixture 失败显示错误提示', async () => {
    vi.mocked(loadObsStatusFixture).mockRejectedValue(new Error('boom'))
    vi.mocked(loadObsTimelineFixture).mockResolvedValue(EMPTY_TL)

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('无法加载过程投影')
    expect(w.text()).toContain('boom')
  })
})
