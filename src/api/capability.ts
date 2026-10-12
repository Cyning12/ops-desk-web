import { http } from './http'

/**
 * F5 Capability 目录页 client（task_web_capability_catalog · SPEC-web-integration §4 F5 ·
 * A 面 SPEC tool-catalog-page · 契约冻结面照抄上游 · 只承接禁改）。
 *
 * 上游真值（ops-desk-api · 只读 · FP-1 以端点实际行为为准）：
 * - GET /api/ops/capability/mine（app/ops/capability_mine.py:64-74）：当前登录用户可见集
 *   （任意登录用户 · Q3 裁定 CurrentUser 口径）；九键白名单投影（project_capability ·
 *   **排除 adapter/args_schema** 及一切内部装配）；{items,count} 外形；空集 200 如实
 *   {"items": [], "count": 0}；只读零写。
 * - GET /api/ops/admin/capability/catalog（app/ops/admin/capability.py:206-275）：本 client
 *   **只消费顶层两键** manifest_errors（int）/ manifest_error_details（[{path,error}] ·
 *   get_manifest_load_errors 按 path 排序）；cookie maintainer 200 · viewer 403 ·
 *   未登录 401（401 跳登录复用 http.ts 全局拦截器）。admin 操作面（sync/memory purge ·
 *   Bearer 机读 · runtime/metrics/receipts/idempotency）按 Q3 裁定不在本期范围，零触碰。
 *
 * 权限口径：cookie 会话 + CORS credentials；maintainer 面由调用方按 /auth/me role
 * 驱动显隐（SPEC §3.4 · 普通用户零探测面：不渲染不请求 admin 端点）。
 * 响应体 snake_case 原始体照登，前端不做包装/转换。
 */

export const CAPABILITY_MINE_PATH = '/ops/capability/mine'
export const ADMIN_CAPABILITY_CATALOG_PATH = '/ops/admin/capability/catalog'

/**
 * 可见集单条：九键白名单投影（上游 project_capability 逐键对齐 · 不自造字段）。
 * status 为常量 "available"（能进可见集即当前可用 · 上游语义照登）。
 */
export interface CapabilityItem {
  id: string
  kind: string
  description: string
  when_to_use: string
  tags: string[]
  risk_level: string
  side_effect: string
  enabled: boolean
  status: string
}

export interface CapabilityMineResponse {
  items: CapabilityItem[]
  count: number
}

/** manifest 加载失败单条（上游 get_manifest_load_errors · [{path, error}] 原样） */
export interface ManifestErrorDetail {
  path: string
  error: string
}

/**
 * maintainer 故障详情（catalog 顶层两键 · 其余键不消费）。
 * manifest_errors 缺键时为 null（契约不符情形照登 · 由页面渲染空态并记录，
 * failure_paths：summary 无 manifest_errors → 渲染空态 + invoke 记录）。
 */
export interface CapabilityManifestSummary {
  manifest_errors: number | null
  manifest_error_details: ManifestErrorDetail[]
}

/** 「我的工具箱」：当前登录用户可见能力集（九键投影 · {items,count} 照登） */
export async function fetchCapabilityMine(): Promise<CapabilityMineResponse> {
  const { data } = await http.get<CapabilityMineResponse>(CAPABILITY_MINE_PATH)
  const items = Array.isArray(data?.items) ? data.items : []
  const count = typeof data?.count === 'number' ? data.count : items.length
  return { items, count }
}

/**
 * maintainer 故障详情：GET admin catalog 只取顶层 summary 两键
 * （键缺失照登为 null/[] · 不臆造 · 其余 catalog 键不消费）。
 */
export async function fetchAdminCapabilityCatalog(): Promise<CapabilityManifestSummary> {
  const { data } = await http.get<{
    manifest_errors?: number
    manifest_error_details?: ManifestErrorDetail[]
  }>(ADMIN_CAPABILITY_CATALOG_PATH)
  const details = Array.isArray(data?.manifest_error_details) ? data.manifest_error_details : []
  const errors = typeof data?.manifest_errors === 'number' ? data.manifest_errors : null
  return { manifest_errors: errors, manifest_error_details: details }
}
