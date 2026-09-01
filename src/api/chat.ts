import { http } from './http'

/**
 * Chat 接口封装（契约：ops-desk-api docs/ios/api-auth-chat.md §3）。
 * 响应直取，无 { ok, data } 包装外壳。
 *
 * 历史注记：旧 chat SSE 流式接口已弃用（api 410 Gone · web 封装随 T6 删除），
 * 传输主线为 lg-rag SSE（src/composables/useLgRagSse.ts）；
 * 切流史见 docs/tasks/done/task_web_lg_rag_sse_t2.md。
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
