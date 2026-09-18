/** 阶段 T Fixture：当前租户本地可见状态（与 session 切换配合）。 */

export const TENANT_A = 'ops-desk-pilot'
export const TENANT_B = 'ops-desk-pilot-b'
export const TENANT_HEADER = 'X-Ops-Tenant-Id'
export const TENANT_STORAGE_KEY = 'ops.tenant-id'
export const PILOT_TENANTS = [TENANT_A, TENANT_B] as const

export function getStoredTenant(): string {
  try {
    const raw = window.localStorage.getItem(TENANT_STORAGE_KEY)
    if (raw === TENANT_A || raw === TENANT_B) return raw
  } catch {
    // localStorage 不可用
  }
  return TENANT_A
}

export function setStoredTenant(tenantId: string): void {
  const value = tenantId === TENANT_B ? TENANT_B : TENANT_A
  try {
    window.localStorage.setItem(TENANT_STORAGE_KEY, value)
  } catch {
    // 忽略
  }
}
