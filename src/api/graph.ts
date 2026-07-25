import { http } from './http'

/**
 * Graph 接口封装（契约：ops-desk-api `GET /api/ops/graph`，见 app/ops/graph.py）。
 * 响应直取，无 { ok, data } 包装外壳。
 *
 * 当前后端实测（无快照时）返回全 null：
 *   { "snapshot": null, "module_matrix": null, "repo_id": null, "created_at": null }
 *
 * module_matrix 有数据时的结构以后端实际响应为准（JSONB），前端做防御性渲染，
 * 因此此处类型保持宽松（unknown）。
 */
export interface GraphResponse {
  /** 图谱快照 payload（JSONB），无快照时为 null */
  snapshot: Record<string, unknown> | null
  /** module × issue 矩阵（JSONB），结构未知，防御性消费 */
  module_matrix: unknown
  /** 仓库 ID；无快照时为 null */
  repo_id: string | null
  /** 快照创建时间（ISO 字符串）；无快照时为 null */
  created_at: string | null
}

/** 拉取最新图谱快照与 module_matrix */
export async function fetchGraph(): Promise<GraphResponse> {
  const { data } = await http.get<GraphResponse>('/ops/graph')
  return data
}
