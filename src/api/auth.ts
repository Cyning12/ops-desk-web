import { http } from './http'

/**
 * Auth 接口封装（契约：ops-desk-api docs/ios/api-auth-chat.md）。
 * 响应直取，无 { ok, data } 包装外壳：
 * - login  → { ok: true, user }
 * - me     → { user }
 * - logout → { ok: true }
 */

export interface AuthUser {
  id: string
  username: string
  role: string
}

/** 用户名 + 邀请密钥登录；成功时后端通过 Set-Cookie 写入 HttpOnly ops_session */
export async function login(username: string, inviteToken: string): Promise<AuthUser> {
  const { data } = await http.post<{ ok: boolean; user: AuthUser }>('/ops/auth/login', {
    username,
    invite_token: inviteToken,
  })
  return data.user
}

/** 获取当前登录用户；未登录时后端返回 401 */
export async function fetchMe(): Promise<AuthUser> {
  const { data } = await http.get<{ user: AuthUser }>('/ops/auth/me')
  return data.user
}

/** 登出：服务端删除 session 并清 cookie */
export async function logout(): Promise<void> {
  await http.post('/ops/auth/logout')
}
