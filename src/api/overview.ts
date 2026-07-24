import { http } from './http'

/**
 * Overview 接口封装（契约：ops-desk-api app/ops/overview.py 实测）。
 * 响应直取，snake_case、无 { ok, data } 包装外壳。
 *
 * 注意：后端 dev 库当前为空 —— median_days 为 null、sync_run/scan_snapshot
 * 为 null、trend 全 0 均属正常返回，调用方必须按空态渲染。
 */

/** PR cycle/review 时长指标（中位数，单位：天） */
export interface MedianMetric {
  /** 中位天数；样本为空时为 null */
  median_days: number | null
  sample_size: number
}

export interface IssueThroughput {
  count: number
  period_days: number
}

/** 最近一次同步运行；从未同步时为 null */
export interface SyncRun {
  id: string
  started_at: string | null
  finished_at: string | null
  status: string
  records_issue: number | null
  records_pr: number | null
}

/** 最近一次扫描快照；从未扫描时为 null。parsed_summary 为扫描器透传的自由结构 */
export interface ScanSnapshot {
  parsed_summary: Record<string, unknown>
  created_at: string | null
}

export interface TrendPoint {
  /** YYYY-MM-DD */
  date: string
  closed_issues: number
  merged_prs: number
}

export interface Overview {
  cycle_time: MedianMetric
  review_time: MedianMetric
  issue_throughput: IssueThroughput
  /** 数据截止时间（ISO 8601） */
  as_of: string
  /** idle（从未同步）或最近一次 sync_run 的 status */
  sync_status: string
  sync_run: SyncRun | null
  scan_snapshot: ScanSnapshot | null
  /** 近 30 天逐日数据（含今日，零填充） */
  trend: TrendPoint[]
}

/** 获取总览指标；401 由全局拦截器处理跳登录 */
export async function fetchOverview(): Promise<Overview> {
  const { data } = await http.get<Overview>('/ops/overview')
  return data
}
