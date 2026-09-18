import { http } from './http'
import { TENANT_A, setStoredTenant } from '../tenant'

export interface AuthUser {
  id: string
  username: string
  role: string
}

export interface MeResult {
  user: AuthUser
  tenantId: string
}

export async function login(username: string, inviteToken: string): Promise<AuthUser> {
  const { data } = await http.post<{ ok: boolean; user: AuthUser }>('/ops/auth/login', {
    username,
    invite_token: inviteToken,
  })
  setStoredTenant(TENANT_A)
  return data.user
}

export async function fetchMe(): Promise<MeResult> {
  const { data } = await http.get<{ user: AuthUser; tenant_id?: string }>('/ops/auth/me')
  const tenantId = data.tenant_id || TENANT_A
  setStoredTenant(tenantId)
  return { user: data.user, tenantId }
}

export async function switchTenant(tenantId: string): Promise<string> {
  const { data } = await http.post<{ ok: boolean; tenant_id: string }>('/ops/auth/tenant', {
    tenant_id: tenantId,
  })
  setStoredTenant(data.tenant_id)
  return data.tenant_id
}

export async function logout(): Promise<void> {
  await http.post('/ops/auth/logout')
}
