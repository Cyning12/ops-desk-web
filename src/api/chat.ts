import { http } from './http'

/**
 * Chat 接口封装（契约：ops-desk-api docs/ios/api-auth-chat.md §3）。
 * 响应直取，无 { ok, data } 包装外壳。
 *
 * SSE 流式接口（POST /ops/chat/stream）不走 axios，
 * 见 src/composables/useOpsChatSse.ts。
 */

export interface ChatSession {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

/** 获取最新 chat session；无则后端自动创建（不会 404） */
export async function fetchLatestSession(): Promise<ChatSession> {
  const { data } = await http.get<ChatSession>('/ops/chat/sessions/latest')
  return data
}
