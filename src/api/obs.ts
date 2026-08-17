/**
 * 过程可观测只读契约（对齐 dsh-coding-kit obs_status.v1 / obs_timeline.v1，原 @cyning/harness）。
 * 本棒仅从 fixture 加载；禁止在浏览器执行 npx。
 */

export interface ObsGate {
  id: string
  status: string
  blocks_hats: string
}

export interface ObsStatus {
  schema_version: string
  task_slug: string
  task_path: string
  status: string
  gates: ObsGate[]
  may_start_30: boolean
  blockers: string[]
  last_invoke: { path: string | null; hat_id: string | null }
  reviews: { R1: boolean; CLOSE: boolean }
  verify_preview: { ok: boolean; reason: string }
  hgm: { event_count: number | null; last_at: string | null }
  kpi_section: boolean
  next_hint: string
}

export interface ObsTimelineEvent {
  event_id?: string
  type: string
  occurred_at: string
  subject?: string
  summary?: string
  data?: Record<string, unknown>
}

export interface ObsTimeline {
  schema_version: string
  task_slug: string
  task_path: string
  event_count: number
  returned: number
  limit: number | null
  ingested: boolean
  ingest: unknown
  events: ObsTimelineEvent[]
}

/** fixture 场景：满闸可开工 / 缺审查阻塞 */
export type ObsStatusScenario = 'ready' | 'blocked'

/** fixture 场景：空时间线 / 有事件 */
export type ObsTimelineScenario = 'empty' | 'events'

export async function loadObsStatusFixture(
  scenario: ObsStatusScenario,
): Promise<ObsStatus> {
  const mod =
    scenario === 'ready'
      ? await import('../fixtures/obs/status_ready.json')
      : await import('../fixtures/obs/status_blocked.json')
  return mod.default as ObsStatus
}

export async function loadObsTimelineFixture(
  scenario: ObsTimelineScenario,
): Promise<ObsTimeline> {
  const mod =
    scenario === 'empty'
      ? await import('../fixtures/obs/timeline_empty.json')
      : await import('../fixtures/obs/timeline_events.json')
  return mod.default as ObsTimeline
}
