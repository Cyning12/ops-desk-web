import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchLatestSession } from '../api/chat'
import type { ChatSession } from '../api/chat'
import { fetchThreadHistory } from '../api/chatHistory'
import type { ChatHistoryRun } from '../api/chatHistory'
import { decideHitlRequest, fetchHitlPending, resumeHitlRequest } from '../api/hitl'
import type { HitlDecision, HitlDecideResponse, HitlPendingItem, HitlResumeMode } from '../api/hitl'
import type { ApiError } from '../api/http'
import { replayLgRag, streamLgRag } from '../composables/useLgRagSse'
import type { LgRagSseController, LgRagSseEvent } from '../composables/useLgRagSse'
import {
  REVEAL_REPLAY_SPEED_MULTIPLIER,
  RevealQueue,
} from '../composables/useRevealQueue'
import { useAuthStore } from './auth'
import { localizeHttpErrorDetail } from './httpErrorI18n'

/**
 * lg-rag thread_id 本地持久化键（T3 · 00 定夺：SoT=thread_id · 登出/401 清除）。
 * stores/auth.ts clearSession 直写同键清除（避免 auth→chat 循环 import），改动须双侧同步。
 */
export const LG_RAG_THREAD_ID_STORAGE_KEY = 'ops.lg-rag.thread-id'

/** 读已存 thread_id；localStorage 不可用 → 返回 null（内存态降级，刷新即新会话，不 crash） */
function readStoredThreadId(): string | null {
  try {
    return window.localStorage.getItem(LG_RAG_THREAD_ID_STORAGE_KEY)
  } catch {
    return null
  }
}

function writeStoredThreadId(id: string): void {
  try {
    window.localStorage.setItem(LG_RAG_THREAD_ID_STORAGE_KEY, id)
  } catch {
    // localStorage 不可用：仅内存态生效，静默降级
  }
}

function clearStoredThreadId(): void {
  try {
    window.localStorage.removeItem(LG_RAG_THREAD_ID_STORAGE_KEY)
  } catch {
    // 静默降级
  }
}

/**
 * T4 · active-run 本地持久化键（00 定夺：续看 SoT = run_id + seq/cursor，run 级与 thread 正交）。
 * 值形 {run_id, last_seq, thread_id, updated_at}；run 终态清除：done 按 payload.status 分支
 * （waiting_approval **保留**供审批后续看接力 · F2-4/FP-F1）· completed/failed/无 status 与
 * error/abort 即清除；localStorage 不可用退化内存态（刷新即失，静默降级）。
 * stores/auth.ts clearSession 直写同键清除。
 */
export const LG_RAG_ACTIVE_RUN_STORAGE_KEY = 'ops.lg-rag.active-run'

export interface LgRagActiveRun {
  run_id: string
  last_seq: number
  thread_id: string | null
  updated_at: string
}

/** 读已存 active-run；缺失/坏 JSON/键不齐/localStorage 不可用 → null（静默降级，不 crash） */
function readStoredActiveRun(): LgRagActiveRun | null {
  try {
    const raw = window.localStorage.getItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<LgRagActiveRun>
    if (typeof parsed.run_id !== 'string' || !parsed.run_id) return null
    if (typeof parsed.last_seq !== 'number' || !Number.isFinite(parsed.last_seq)) return null
    return {
      run_id: parsed.run_id,
      last_seq: parsed.last_seq,
      thread_id: typeof parsed.thread_id === 'string' ? parsed.thread_id : null,
      updated_at: typeof parsed.updated_at === 'string' ? parsed.updated_at : '',
    }
  } catch {
    return null
  }
}

function writeStoredActiveRun(run: LgRagActiveRun): void {
  try {
    window.localStorage.setItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY, JSON.stringify(run))
  } catch {
    // localStorage 不可用：仅内存态生效，静默降级
  }
}

function clearStoredActiveRun(): void {
  try {
    window.localStorage.removeItem(LG_RAG_ACTIVE_RUN_STORAGE_KEY)
  } catch {
    // 静默降级
  }
}

/** assistant 消息的思考过程分块（按 agent_role 聚合） */
export interface ChatThinkingBlock {
  role: string
  content: string
  /** subtask.progress 合并键（payload.subtask_id / id · §10.7） */
  id?: string
  /** running | step | done 等（§10.7 起步/里程碑/完成帧） */
  status?: string
  /** subtask output 打字机进行中（progressive-reveal 光标态） */
  revealing?: boolean
}

/**
 * F2 · hitl.waiting 帧提取的审批申请（契约：payload.requests[] 原样透传 · 申请 id 在条目内；
 * 未知额外键容忍不依赖 · SPEC §2 / 上游 collect_hitl_requests）
 */
export interface ChatHitlRequest {
  id: string
  [key: string]: unknown
}

/**
 * F2 · 消息流内联审批卡片状态机（裁定 F-A）：
 * - waiting：待审批（双按钮可动作）
 * - acting：decide→resume 两步链进行中（loading · 禁重复点击）
 * - decided：decide+resume 成功（FP-F7：卡片保持「已批准/已驳回 · 点击续看推进」可再触发）
 * - resolved：409 已被处理 / 404 不存在（中性 · 不可再动作）
 * - forbidden：403 非 maintainer（动作隐藏/降级 · FP-F4）
 * - unavailable：hitl.waiting 帧缺 requests / 空 requests[]（FP-F11：仅 reason 展示 · 不崩 · 不当完成态）
 */
export type ChatHitlCardStatus =
  | 'waiting'
  | 'acting'
  | 'decided'
  | 'resolved'
  | 'forbidden'
  | 'unavailable'

export interface ChatHitlState {
  reason: string
  requests: ChatHitlRequest[]
  status: ChatHitlCardStatus
  /** decide 成功后的决策（approved/rejected）；未决策为 null */
  decision: HitlDecision | null
  /** 卡片状态文案（已被处理 / 无审批权限 / 审批详情不可用 / 已批准·续看推进 等） */
  note: string | null
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** 纯文本（markdown 不渲染，保留换行） */
  content: string
  /** 编排节点进度（node.progress） */
  thinking: ChatThinkingBlock[]
  /** 子任务过程（subtask.progress · rag_subtask / info_extract / tool_exec） */
  subtasks: ChatThinkingBlock[]
  /** F2 · 待审批卡片态（hitl.waiting 帧 / 历史 terminal_status=waiting_approval 映射）；null = 无审批 */
  hitl: ChatHitlState | null
  /** F1 · 历史 answer 超 32000 字符截断标记（上游 answer_truncated · AC6） */
  truncated?: boolean
  /**
   * D3 · History/live 机读终态（running / error / disconnected / completed / waiting_approval）
   * 驱动徽标与「继续回复」CTA；waiting_approval 仍走 hitl 零 diff
   */
  runTerminalStatus?: string | null
  /** D3 · error/disconnected（及 live worker_failed）可点「继续回复」 */
  allowContinueReply?: boolean
  /** D3 · 可选 continue_from_run_id 源（失败/中止 run）；缺省仍可新 stream（FP-4） */
  continueFromRunId?: string | null
}

/** D3 ·「继续回复」新 stream 的固定 query 字面（30 裁定 · Vitest 钉死；api 再拼 partial 草稿） */
export const CONTINUE_REPLY_QUERY = '请继续完成回答。'

/** SSE error 事件 / 传输层错误的统一展示结构 */
export interface ChatErrorState {
  stage: string
  message: string
  retryable: boolean
}

export interface ChatDoneInfo {
  /** 裁定 A（web-hitl-fobs-receipt）：缺键存 null（裁 ': 0' 假值兜底 · 徽标耗时段显「—」）；实值 int≥0 原样透传 */
  latency_ms: number | null
  /** 裁定 B：后端 FP-1 钉案 model 键永不提供 → 兜底 '' 保留零改动（v-if 缺省不渲染） */
  model: string
}

function payloadString(event: LgRagSseEvent, key: string): string {
  const value = event.payload?.[key]
  return typeof value === 'string' ? value : ''
}

/**
 * 进度帧 payload → 单行摘要（api sse_stream._summarize_payload 真实键形）：
 * - 优先直出 summary/content/message（字符串键）
 * - 否则按已知键拼 `key: value`（JSON 截断），最多 3 段
 * - 兜底列出 payload 键名
 */
const PROGRESS_DIRECT_KEYS = ['summary', 'content', 'message'] as const
const PROGRESS_DETAIL_KEYS = [
  'intent',
  'route',
  'critic_verdict',
  'subtasks',
  'allowed_capability_ids',
  'subtask_result',
  'answer_preview',
  'retry_count',
  'rebinding_count',
  'keys',
] as const

function summarizeProgress(payload: Record<string, unknown> | undefined): string {
  if (!payload) return ''
  for (const key of PROGRESS_DIRECT_KEYS) {
    const value = payload[key]
    if (typeof value === 'string' && value) return value
  }
  const parts: string[] = []
  for (const key of PROGRESS_DETAIL_KEYS) {
    const value = payload[key]
    if (value === undefined || value === null) continue
    const text = typeof value === 'string' ? value : JSON.stringify(value)
    if (!text) continue
    parts.push(`${key}: ${text.length > 80 ? text.slice(0, 79) + '…' : text}`)
    if (parts.length >= 3) break
  }
  if (parts.length) return parts.join(' · ')
  return Object.keys(payload).slice(0, 5).join(', ')
}

/**
 * §10.7 可选 payload.message（api subtask_message.py 确定性模板）：
 * 非空字符串才视为有效（空串按缺省处理，与 api「禁止空串冒充有内容」对齐）。
 * subtask.progress 三态对 message **显式优先**于 summary/content（R1-N1/N2）；
 * 本函数不影响 node.progress 的 summarizeProgress 直出顺序。
 */
function extractPayloadMessage(payload: Record<string, unknown> | undefined): string {
  const value = payload?.message
  return typeof value === 'string' && value ? value : ''
}

/** §10.7：从 payload 取合并键（subtask_id 优先，其次 id） */
function extractSubtaskBlockId(payload: Record<string, unknown> | undefined): string | undefined {
  if (!payload) return undefined
  const raw = payload.subtask_id ?? payload.id
  if (typeof raw === 'string' && raw) return raw
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw)
  return undefined
}

/** F2 · hitl.waiting payload.requests / 历史 run.hitl → 审批申请列表（仅收 dict 条目 · id 缺失置空串） */
function extractHitlRequests(raw: unknown): ChatHitlRequest[] {
  if (!Array.isArray(raw)) return []
  const out: ChatHitlRequest[] = []
  for (const item of raw) {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const record = item as Record<string, unknown>
      const id = record.id
      out.push({ ...record, id: typeof id === 'string' && id ? id : '' })
    }
  }
  return out
}

/** F2 / FP-F11：requests 含可动作申请（id 非空）→ waiting；否则降级 unavailable（仅 reason · 不崩 · 不当完成态） */
function buildHitlState(reason: string, requests: ChatHitlRequest[]): ChatHitlState {
  const actionable = requests.some((request) => request.id)
  return {
    reason,
    requests,
    status: actionable ? 'waiting' : 'unavailable',
    decision: null,
    note: actionable ? null : '审批详情不可用',
  }
}

/** §10.7 running 起步帧：可读文案（勿落成裸键名列表）；
 * 非空 message 原样零前缀（R1-N3：不再包「执行中 ·」叠句）；无 message 走本地兜底 */
function formatRunningSubtaskContent(
  payload: Record<string, unknown> | undefined,
  role: string,
  id: string | undefined,
): string {
  const message = extractPayloadMessage(payload)
  if (message) return message
  if (payload) {
    for (const key of PROGRESS_DIRECT_KEYS) {
      const value = payload[key]
      if (typeof value === 'string' && value) return `执行中 · ${value}`
    }
  }
  const kind =
    (payload && typeof payload.type === 'string' && payload.type) || role || 'subtask'
  return id ? `执行中 · ${kind} · ${id}` : `执行中 · ${kind}`
}

/** status=step：即时可读行（如 retrieve · start）；不做打字机；
 * 非空 message 原样即时上屏（R1-N1：显式优先于 summary/content 与本地 step 拼装） */
function formatStepSubtaskContent(payload: Record<string, unknown> | undefined): string {
  if (!payload) return 'step'
  const message = extractPayloadMessage(payload)
  if (message) return message
  for (const key of PROGRESS_DIRECT_KEYS) {
    const value = payload[key]
    if (typeof value === 'string' && value) return value
  }
  const step =
    (typeof payload.step === 'string' && payload.step) ||
    (typeof payload.node === 'string' && payload.node) ||
    (typeof payload.phase === 'string' && payload.phase) ||
    (typeof payload.name === 'string' && payload.name) ||
    'step'
  const action =
    (typeof payload.action === 'string' && payload.action) ||
    (typeof payload.event === 'string' && payload.event) ||
    ''
  const detailParts: string[] = []
  for (const key of ['kept', 'hits', 'retry', 'retry_count'] as const) {
    const value = payload[key]
    if (typeof value === 'number' || typeof value === 'boolean') {
      detailParts.push(`${key}=${value}`)
    } else if (typeof value === 'string' && value && value.length <= 40) {
      detailParts.push(`${key}=${value}`)
    }
  }
  if (action && detailParts.length) return `${step} · ${action} · ${detailParts.join(',')}`
  if (action) return `${step} · ${action}`
  if (detailParts.length) return `${step} · ${detailParts.join(',')}`
  return step
}

/**
 * status=done：解析 subtask_result（字符串 JSON）取 output；
 * 失败则降级可读摘要（禁 JSON dump / 80 字截断当终稿）。
 * 无 output 时：非空 message **显式优先**作完成摘要（R1-N1/N2），
 * 再降级 summary/content；有 output 时 message 不得覆盖/截断/替代（走 reveal）。
 */
function extractSubtaskDoneText(payload: Record<string, unknown> | undefined): {
  text: string
  fromOutput: boolean
} {
  const raw = payload?.subtask_result
  if (typeof raw === 'string' && raw) {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const output = (parsed as Record<string, unknown>).output
        if (typeof output === 'string' && output) {
          return { text: output, fromOutput: true }
        }
      }
    } catch {
      // 非 JSON → 降级
    }
  } else if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const output = (raw as Record<string, unknown>).output
    if (typeof output === 'string' && output) {
      return { text: output, fromOutput: true }
    }
  }

  // §10.7：无 output 时非空 message 显式优先（R1-N1/N2：先于 summary/content）
  const message = extractPayloadMessage(payload)
  if (message) return { text: message, fromOutput: false }

  if (payload) {
    for (const key of PROGRESS_DIRECT_KEYS) {
      const value = payload[key]
      if (typeof value === 'string' && value) return { text: value, fromOutput: false }
    }
  }
  const kind =
    (payload && typeof payload.type === 'string' && payload.type) || 'subtask'
  const id = extractSubtaskBlockId(payload)
  const text = id ? `已完成 · ${kind} · ${id}` : `已完成 · ${kind}`
  return { text, fromOutput: false }
}

/**
 * Chat 会话状态（T3 · freeze lg-rag-sse-v1）：
 * - 进入页面 loadLatestSession() 获取/创建 session（元数据端点，仅 T2 门控，非 lg-rag SoT）
 * - sendMessage() 追加 user/assistant 消息并启动 lg-rag SSE 流（POST /api/ops/lg-rag/stream）；
 *   node.progress → thinking（编排进度）；subtask.progress → subtasks（子任务过程）；
 *   answer 整段/delta 填入 content、done/error 收尾
 * - thread_id 会话连续性（T3）：客户端不自生成；首轮留空 → api 生成 → run.start payload 捕获；
 *   localStorage 持久化（key=ops.lg-rag.thread-id，不可用则内存态降级）；
 *   刷新/重进恢复（仅后端上下文，不回显历史消息，顶部提示条）；
 *   401/登出清除；已存 id 遇 404/422 → 清本地 id + 提示，不自动重发；
 *   startNewSession() 开新会话（清 id + 清消息 + 清提示）
 * - 断联/replay 续看（T4 · freeze lg-rag-sse-v1 沿用）：每帧捕获可选顶层 cursor（缺失以 run_id+seq 合成），
 *   active-run 持久化（key=ops.lg-rag.active-run）；run 终态清除：done 按 payload.status 分支
 *   （waiting_approval **保留** active-run 供审批后续看接力 · F2-4/FP-F1）· completed/failed/无 status
 *   与 error/abort 即清除；
 *   断网/超时 mid-stream → 错误条 + 「续看」（手动触发 replay，不自动重试）；
 *   刷新/重进有未完成 run → 「上次回答未完成·续看」条；replay 帧复用同一渲染管线、渲染进新建 assistant 消息；
 *   per run_id 记 lastAppliedSeq，seq <= lastAppliedSeq 的帧忽略（answer 不重复 · thinking 不重复）；
 *   replay 404/422 → 清 active-run + 提示不重试；401（live/replay）→ 清 thread_id + 清 active-run + 跳登录
 * - answer 打字机（T5 · freeze 沿用）：payload 含 delta 键 → 追加；含 content 键 → 全量替换
 *   （终帧 final:true 同此 · 严禁终帧叠加到 delta 拼接后）；两键同帧 content 优先 + warn（R1-N1）；
 *   done/error/abort/传输层终断后停止追加（迟到帧忽略）；无 delta 帧自然降级 T2 整段行为；
 *   replay 含 delta 帧复用同一 processFrame 管线
 * - 客户端 reveal 队列（progressive-reveal）：delta 先入网络缓冲，UI 按 REVEAL_CHARS_PER_SECOND 匀速出队到
 *   content（同 tick 多帧不瞬满）；content/final 取消队列并以终稿替换；done/error/abort 刷齐已收；
 *   subtask step 即时可读；done 解析 subtask_result.output 打字机；replay 默认 ≥4× 加速
 * - stopStreaming() abort 中断，可继续重发
 * - F1/F2（web-chat-history-hitl-ux · freeze lg-rag-sse-v1 只消费既有帧）：
 *   hitl.waiting 帧 → 消息流内联审批卡片（reason + 申请 id + 批准/驳回 → B2 decide → resume 两步链）；
 *   done 按 payload.status 分支（waiting_approval ≠ 完成态：不清场 · 保持待审批视觉 · 保留续看游标）；
 *   openHistoryThread(threadId) → B1 history 映射既有 ChatMessage 结构（F-C）渲染 + waiting_approval
 *   thread 以 active-run 语义挂起、续看复用 resumeFromCursor/replayLgRag（不新造机制 · F1-4）
 * - 主路径传输 = lg-rag SSE；旧 chat stream 已弃用（api 410 Gone · web 封装随 T6 删除；
 *   切流史见 docs/tasks/done/task_web_lg_rag_sse_t2.md）
 */
export const useChatStore = defineStore('chat', () => {
  const session = ref<ChatSession | null>(null)
  const sessionLoading = ref(false)
  /** latest session 获取失败的提示文案（401 由全局拦截跳登录） */
  const sessionError = ref<string | null>(null)

  // T3：刷新/重进恢复已存 thread_id（仅恢复后端上下文，不回显历史消息）
  const initialThreadId = readStoredThreadId()
  /** lg-rag 会话 SoT（禁止当 chat session_id 用）；null = 下轮由 api 生成 */
  const threadId = ref<string | null>(initialThreadId)
  /** 重进恢复了已存 thread_id 时展示顶部提示条（可关闭） */
  const restoredNotice = ref<boolean>(initialThreadId !== null)

  // T4：刷新/重进恢复未完成 run 的续看游标（run 级 SoT，与 thread_id 正交）
  const initialActiveRun = readStoredActiveRun()
  /** 未完成 run 的续看游标；done 按 status 分支（waiting_approval 保留）· error/abort 清除；null = 无可续看 */
  const activeRun = ref<LgRagActiveRun | null>(initialActiveRun)
  /** 刷新/重进发现有未完成 run 时展示「上次回答未完成·续看」条（手动触发，不自动 replay） */
  const resumeNotice = ref<boolean>(initialActiveRun !== null)
  /** 续看提示（replay 空流「暂无新进度」/ 接力「仍在生成中」等一次性文案） */
  const resumeHint = ref<string | null>(null)

  const messages = ref<ChatMessage[]>([])
  const streaming = ref(false)
  /** 流被手动中断（abort）后的一次性提示标记 */
  const interrupted = ref(false)
  const error = ref<ChatErrorState | null>(null)
  const lastDone = ref<ChatDoneInfo | null>(null)

  // F1 · 历史加载态（B1 history · FP-F8/F10 降级文案 · 不阻塞 Chat 主路径）
  const historyLoading = ref(false)
  const historyError = ref<string | null>(null)
  // F2 · B2 pending 核对快照（AC16 两消费点：动作后刷新 + 进入 waiting_approval thread 一次性核对 · 不轮询 · 非全局面板）
  const hitlPending = ref<HitlPendingItem[]>([])
  /** pending 核对降級文案（403 无审批权限 / 404·501·网络错 审批服务暂不可用 · FP-F4/F8） */
  const hitlPendingError = ref<string | null>(null)
  /**
   * web-ux-state-sync D2：「fetch 成功过」标志位（卡片对账判据之一 · FP-4/FP-5 防误对账）。
   * 仅 refreshHitlPending 成功路径置 true；403/网络/401 一律不置位 → 取回前或取回失败的空列表
   * 不等于「服务端已无该申请」，不做对账。
   */
  const hitlPendingFetched = ref(false)
  /**
   * web-hitl-overlay-reconcile-race · DP-1 形态 A（HG-DESIGN-FORM · NIT-2 帧首见锁）：
   * 对账纪元。每次 refreshHitlPending 成功 +1；hitlFirstSeenStamps 记录各 request id
   * 「本端经 hitl.waiting 帧 / 历史 / replay 首见」时的纪元值。仅首见纪元早于最近一次
   * 成功快照的 id 参账；快照后首见（SSE 新到 · 实体键滞后 · issue #95）不参账，待下一次
   * 成功刷新确证。零轮询 · 不依赖后端 created_at（SSE 事件表零 diff 自洽）。
   */
  const hitlSnapshotStamp = ref(0)
  const hitlFirstSeenStamps = new Map<string, number>()

  /** 可点「续看」：有未完成 run 且当前无流在进行 */
  const canResume = computed(() => activeRun.value !== null && !streaming.value)

  let controller: LgRagSseController | null = null
  // D3 追帧器（chaseResumedRun）：退避定时器句柄 + 代际戳；stopStreaming/startNewSession/切会话
  // 使在飞与待触发的追帧一并失效（FP-H10 不泄漏）
  let chaseTimer: ReturnType<typeof setTimeout> | null = null
  let chaseGeneration = 0
  // web-hitl-resume-chase-ux 范围1：chase 链 run 级唯一性（同 run 活链在飞则新链入口直返 · 实测 14>10 根因=多链并发）
  let activeChaseRunId: string | null = null
  // 范围4：本端已受理的 HITL 申请 id（幂等）——已决单重入/重放 waiting 帧打回卡片后不得再发 decide+resume
  const hitlActedRequestIds = new Set<string>()
  let messageSeq = 0
  // T4：per run_id 的 seq 去重基线（lastAppliedSeq）；run 切换即重置
  let currentRunId: string | null = null
  let lastAppliedSeq = 0
  // T5：run 终态（done/error/abort/传输层错误）后停止追加 answer——迟到帧忽略（00 定夺 done 语义）；
  // sendMessage/resumeFromCursor 开局重置
  let answerTerminal = false

  // progressive-reveal：answer / subtask-output 双缓冲队列（展示前缀 ≤ 已收）
  let answerReveal: RevealQueue | null = null
  const subtaskReveals = new Map<string, RevealQueue>()
  let revealSpeedMultiplier = 1

  function resetRevealQueues(): void {
    answerReveal?.stop()
    answerReveal = null
    for (const queue of subtaskReveals.values()) queue.stop()
    subtaskReveals.clear()
  }

  /** 终止路径：停定时器并刷齐已收缓冲 */
  function flushRevealQueues(): void {
    answerReveal?.flush()
    for (const queue of subtaskReveals.values()) queue.flush()
    subtaskReveals.clear()
  }

  function ensureAnswerReveal(assistant: ChatMessage): RevealQueue {
    if (!answerReveal) {
      answerReveal = new RevealQueue((text) => {
        assistant.content = text
      })
      answerReveal.setSpeedMultiplier(revealSpeedMultiplier)
    }
    return answerReveal
  }

  function cancelSubtaskReveal(key: string): void {
    const queue = subtaskReveals.get(key)
    if (!queue) return
    queue.stop()
    subtaskReveals.delete(key)
  }

  function upsertSubtaskBlock(assistant: ChatMessage, block: ChatThinkingBlock): number {
    if (block.id) {
      const idx = assistant.subtasks.findIndex((b) => b.id === block.id)
      if (idx >= 0) {
        assistant.subtasks[idx] = block
        return idx
      }
    }
    assistant.subtasks.push(block)
    return assistant.subtasks.length - 1
  }

  function startSubtaskOutputReveal(
    assistant: ChatMessage,
    block: ChatThinkingBlock,
    fullText: string,
  ): void {
    const key = block.id ?? `anon:${assistant.subtasks.indexOf(block)}`
    cancelSubtaskReveal(key)
    block.content = ''
    block.revealing = true
    const queue = new RevealQueue((text) => {
      block.content = text
      block.revealing = text.length < fullText.length
    })
    queue.setSpeedMultiplier(revealSpeedMultiplier)
    subtaskReveals.set(key, queue)
    queue.enqueue(fullText)
  }

  async function loadLatestSession(): Promise<void> {
    if (sessionLoading.value) return
    sessionLoading.value = true
    sessionError.value = null
    try {
      session.value = await fetchLatestSession()
    } catch (err) {
      const apiError = err as ApiError
      sessionError.value = apiError.message || '获取会话失败'
    } finally {
      sessionLoading.value = false
    }
  }

  function pushMessage(role: ChatMessage['role']): ChatMessage {
    const message: ChatMessage = {
      id: `m-${++messageSeq}`,
      role,
      content: '',
      thinking: [],
      subtasks: [],
      hitl: null,
    }
    messages.value.push(message)
    // 必须返回经响应式数组取回的代理而非 raw 引用：之后 processFrame/reveal 对
    // assistant.* 的突变若落在 raw 对象上，不经过 Vue proxy set 陷阱 → 不触发任何
    // effect → 实流零渲染/无打字机（web-fix-chat-live-reactivity）
    return messages.value[messages.value.length - 1]
  }

  /** 清 active-run（ref + localStorage + 刷新续看条）；run 终态/401/手动停止/新会话调用 */
  function clearActiveRun(): void {
    activeRun.value = null
    resumeNotice.value = false
    clearStoredActiveRun()
  }

  interface FrameCursor {
    runId: string | null
    seq: number | null
  }

  /**
   * T4 帧游标提取：优先帧自带顶层 run_id/seq；可选顶层 cursor="{run_id}:{seq}" 兜底合成；
   * run.start 等帧 run_id 可能仅在 payload。seq 非有限数按缺失处理（该帧不参与去重/持久化）。
   */
  function extractFrameCursor(event: LgRagSseEvent): FrameCursor {
    let runId = typeof event.run_id === 'string' && event.run_id ? event.run_id : null
    let seq = typeof event.seq === 'number' && Number.isFinite(event.seq) ? event.seq : null
    const cursor = typeof event.cursor === 'string' ? event.cursor : ''
    if (cursor && (!runId || seq === null)) {
      const idx = cursor.lastIndexOf(':')
      if (idx > 0) {
        if (!runId) runId = cursor.slice(0, idx)
        if (seq === null) {
          const cursorSeq = Number(cursor.slice(idx + 1))
          if (Number.isFinite(cursorSeq)) seq = cursorSeq
        }
      }
    }
    if (!runId) {
      const payloadRunId = payloadString(event, 'run_id')
      if (payloadRunId) runId = payloadRunId
    }
    return { runId, seq }
  }

  /**
   * T4 统一帧入口（live / replay 同一管线）：
   * - per run_id 记 lastAppliedSeq，seq <= lastAppliedSeq 的帧整体忽略（answer 不重复 append · thinking 不重复入列）
   * - 每推进一格 seq 即持久化 active-run（断网/刷新后可接力）；终态帧由 handleEvent 内清除兜底
   * - 无 run_id/seq 的帧（旧帧形）不参与去重与持久化，直接渲染（T2/T3 行为不回退）
   */
  function processFrame(event: LgRagSseEvent, assistant: ChatMessage): void {
    const { runId, seq } = extractFrameCursor(event)
    if (runId && runId !== currentRunId) {
      currentRunId = runId
      lastAppliedSeq = 0
    }
    if (runId && seq !== null) {
      if (seq <= lastAppliedSeq) return
      lastAppliedSeq = seq
      activeRun.value = {
        run_id: runId,
        last_seq: seq,
        thread_id: threadId.value,
        updated_at: new Date().toISOString(),
      }
      writeStoredActiveRun(activeRun.value)
    }
    handleEvent(event, assistant)
  }

  function handleEvent(event: LgRagSseEvent, assistant: ChatMessage): void {
    switch (event.event_type) {
      case 'run.start': {
        // T3：捕获 api 生成/回显的 thread_id 并落存（幂等赋值 · 唯一捕获点，不做响应头校验——R1-N3）；
        // 缺 id 仅记 warn，本轮退化为无续写，不阻断展示；seq/cursor 由 processFrame 统一消费（T4）
        const capturedThreadId = payloadString(event, 'thread_id')
        if (capturedThreadId) {
          threadId.value = capturedThreadId
          writeStoredThreadId(capturedThreadId)
        } else {
          console.warn('[chat] run.start 缺 thread_id：本轮无续写，不阻断展示')
        }
        break
      }
      case 'node.progress': {
        // 编排节点完成摘要（非全文 dump · api §4.2）
        const content = summarizeProgress(event.payload)
        if (!content) break
        assistant.thinking.push({ role: event.agent_role ?? event.event_type, content })
        break
      }
      case 'subtask.progress': {
        // 子任务过程单独入列（§10.6 UI 分区 · §10.7 running→step→done 同 id 合并）
        const payload = event.payload
        const status = typeof payload?.status === 'string' ? payload.status : undefined
        const id = extractSubtaskBlockId(payload)
        const role = event.agent_role ?? event.event_type

        if (status === 'running') {
          if (id) cancelSubtaskReveal(id)
          const content = formatRunningSubtaskContent(payload, role, id)
          if (!content) break
          const block: ChatThinkingBlock = { role, content }
          if (id) block.id = id
          block.status = status
          upsertSubtaskBlock(assistant, block)
          break
        }

        if (status === 'step') {
          if (id) cancelSubtaskReveal(id)
          const content = formatStepSubtaskContent(payload)
          if (!content) break
          const block: ChatThinkingBlock = { role, content }
          if (id) block.id = id
          block.status = status
          upsertSubtaskBlock(assistant, block)
          break
        }

        if (status === 'done') {
          const { text, fromOutput } = extractSubtaskDoneText(payload)
          if (!text) break
          const block: ChatThinkingBlock = {
            role,
            content: fromOutput ? '' : text,
            status: 'done',
          }
          if (id) block.id = id
          if (fromOutput) block.revealing = true
          const idx = upsertSubtaskBlock(assistant, block)
          if (fromOutput) {
            // R1-N1：upsert 为整体替换，reveal 闭包必须持有替换后数组中的代理 block，
            // 否则 tick 直写 raw block.content 同样绕过响应式
            startSubtaskOutputReveal(assistant, assistant.subtasks[idx], text)
          } else if (id) {
            cancelSubtaskReveal(id)
          }
          break
        }

        // 无 status / 旧完成帧：即时摘要（非 done output 渐显路径）
        if (id) cancelSubtaskReveal(id)
        const content = summarizeProgress(payload)
        if (!content) break
        const block: ChatThinkingBlock = { role, content }
        if (id) block.id = id
        if (status) block.status = status
        upsertSubtaskBlock(assistant, block)
        break
      }
      case 'answer': {
        // T5 + progressive-reveal：
        // - content 键 → 取消队列并以终稿替换（终帧 final:true 同此）
        // - 仅 delta → 入网络缓冲队，匀速出队到 assistant.content（同 tick 不瞬满）
        // - 两键同帧：content 优先 + warn（R1-N1）
        if (answerTerminal) break // done/error/abort 后迟到帧忽略
        const payload = event.payload ?? {}
        if ('content' in payload) {
          if ('delta' in payload) {
            console.warn('[chat] answer 帧同含 content 与 delta：content 优先替换，忽略 delta（R1-N1 防御）')
          }
          ensureAnswerReveal(assistant).replace(payloadString(event, 'content'))
        } else if ('delta' in payload) {
          ensureAnswerReveal(assistant).enqueue(payloadString(event, 'delta'))
        }
        break
      }
      case 'hitl.waiting': {
        // F2-1（裁定 F-A）：审批等待帧 → store 审批态 → 消息流内联审批卡片；
        // replay/历史视图复用同一渲染管线天然重现。SSE 零新事件 · 传输/解析层零改动
        // （帧经 useLgRagSse 按 event_type 透传，仅 store 层新增消费分支）
        const payload = event.payload ?? {}
        const reason = typeof payload.reason === 'string' ? payload.reason : ''
        const requests = extractHitlRequests(payload.requests)
        // web-hitl-resume-chase-ux 范围4：replay 重放本端已受理的申请帧不得把已决卡片打回 waiting
        // （陈旧游标重放 hitl.waiting → 守卫重置 → 再入第二 chase 链 = 实测 14>10 根因链路）
        if (!requests.some((request) => request.id && hitlActedRequestIds.has(request.id))) {
          assistant.hitl = buildHitlState(reason, requests)
          stampHitlFirstSeen(requests) // DP-1 形态 A：帧首见登记（对账纪元判据）
        }
        break
      }
      case 'done': {
        streaming.value = false
        flushRevealQueues() // R1-N2：刷齐已收
        answerTerminal = true // T5：done 后停止追加（迟到 answer 帧忽略）
        // F2-4（FP-F1 修现状 bug · SPEC 建议②）：done 按 payload.status 分支——
        // waiting_approval ≠ 完成态：**不调 clearActiveRun()**（续看游标保留 · 审批后接力）、
        // **不记 lastDone**（不呈现「完成 · 耗时」假完成），待审批视觉由 hitl 卡片持续承担；
        // completed/failed/无 status（旧帧）→ 维持现行清除语义
        // （含 replay 补发的 done——断连期间服务端跑完的收尾闭环）
        if (payloadString(event, 'status') === 'waiting_approval') {
          break
        }
        const latency = event.payload?.latency_ms
        const model = event.payload?.model
        lastDone.value = {
          // 裁定 A：裁 ': 0' 假值兜底——缺键存 null（徽标显「—」如实）；实值原样透传（F-OBS-1）
          latency_ms: typeof latency === 'number' ? latency : null,
          // 裁定 B：model 兜底保留零改动（后端永不提供 · v-if 缺省不渲染）
          model: typeof model === 'string' ? model : '',
        }
        clearActiveRun()
        break
      }
      case 'error': {
        const retryable = event.payload?.retryable
        const stage = payloadString(event, 'stage') || 'unknown'
        error.value = {
          stage,
          message: payloadString(event, 'message') || '对话出错',
          retryable: retryable === true,
        }
        streaming.value = false
        flushRevealQueues() // R1-N2
        answerTerminal = true // T5：error 后停止追加
        // D3：失败后可「继续回复」（新 stream · 非 replay）——清 active-run 前捕获 run_id
        const failedRunId =
          (activeRun.value?.run_id && activeRun.value.run_id) ||
          (typeof event.run_id === 'string' ? event.run_id : null) ||
          currentRunId
        assistant.runTerminalStatus = 'error'
        assistant.allowContinueReply = true
        assistant.continueFromRunId = failedRunId
        clearActiveRun() // T4：error 终态清除续看游标；「继续回复」≠「续看」
        break
      }
      default:
        // tool_call / model.fallback 等 v1 未展示的事件：忽略
        break
    }
  }

  /**
   * live / continueReply 共用的 stream 回调装订（同 processFrame 管线）。
   * 「继续回复」走本路径 · **永不**走 HITL resume / replay。
   */
  function startLgRagStream(
    input: {
      query: string
      threadId?: string | null
      continueFromRunId?: string | null
    },
    assistant: ChatMessage,
  ): void {
    const sentThreadId = input.threadId || null
    controller = streamLgRag(
      {
        query: input.query,
        mode: 'supervisor',
        ...(sentThreadId ? { threadId: sentThreadId } : {}),
        ...(input.continueFromRunId ? { continueFromRunId: input.continueFromRunId } : {}),
      },
      {
        onEvent: (event) => processFrame(event, assistant),
        onError: (transportError) => {
          streaming.value = false
          flushRevealQueues() // R1-N2：传输层终断刷齐已收
          answerTerminal = true // T5：传输层终断后停止追加（续看 replay 渲染进新消息并自行重置）
          if (transportError.status === 401) {
            // SSE fetch 不经 axios 拦截器：本地清会话 + thread_id + active-run（R1-N3），交给路由守卫/视图跳登录
            clearThreadId()
            clearActiveRun()
            useAuthStore().clearSession()
            error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
          } else if ((transportError.status === 404 || transportError.status === 422) && sentThreadId) {
            // 已存 thread_id 失效（404 会话失效/他用户 · 422 非法/超长防御）：
            // 清本地 id + 用户可见提示；不自动重发（用户重发将以新 thread 进行）
            clearThreadId()
            error.value = {
              stage: 'session',
              message:
                transportError.status === 404
                  ? '会话已失效，请重新发送'
                  : '会话校验未通过，请重新发送（' + localizeHttpErrorDetail(transportError.message) + '）',
              retryable: true,
            }
          } else {
            // T4：断网/超时 mid-stream —— active-run 已随帧推进保留，错误条 + 「续看」手动接力（不自动重试）
            error.value = {
              stage: transportError.kind,
              message: localizeHttpErrorDetail(transportError.message),
              retryable: true,
            }
          }
        },
        onAborted: () => {
          streaming.value = false
          interrupted.value = true
          flushRevealQueues() // R1-N2
          answerTerminal = true // T5：abort 终态，停止追加
          clearActiveRun() // T4：abort 属 run 终态（00 定夺）；停止后不可续看（R1-N6 产品语义）
        },
        onDone: () => {
          streaming.value = false
        },
      },
    )
  }

  function sendMessage(text: string): void {
    const content = text.trim()
    if (!content || streaming.value || !session.value) return

    error.value = null
    lastDone.value = null
    interrupted.value = false
    resumeHint.value = null

    // 422 预检（SPEC §3.1：query 1..8000）；后端仍兜底校验
    if (content.length > 8000) {
      pushMessage('user').content = content
      pushMessage('assistant')
      error.value = { stage: 'validation', message: '消息过长（上限 8000 字），请精简后重发', retryable: false }
      return
    }

    pushMessage('user').content = content
    const assistant = pushMessage('assistant')

    streaming.value = true
    answerTerminal = false // T5：新 run 开局，允许 answer 追加/替换
    resetRevealQueues()
    revealSpeedMultiplier = 1 // live 速率
    // T3：已存 thread_id 则带上续问（同会话同一 id）；无则由 api 生成（run.start 捕获落存）
    startLgRagStream({ query: content, threadId: threadId.value }, assistant)
  }

  /**
   * D3 ·「继续回复」：同 thread **新** POST /lg-rag/stream + 可选 continue_from_run_id。
   * **禁** HITL resume · **禁** replay 当 LLM 续算。query 字面钉 CONTINUE_REPLY_QUERY。
   */
  function continueReply(fromAssistant: ChatMessage): void {
    if (!fromAssistant.allowContinueReply || streaming.value || !session.value) return
    const tid = threadId.value
    if (!tid) {
      error.value = {
        stage: 'session',
        message: '缺少会话上下文，请重新提问',
        retryable: true,
      }
      return
    }

    error.value = null
    lastDone.value = null
    interrupted.value = false
    resumeHint.value = null
    // 清除源消息 CTA，避免重复点击；半截内容仍保留在历史气泡
    fromAssistant.allowContinueReply = false

    pushMessage('user').content = CONTINUE_REPLY_QUERY
    const assistant = pushMessage('assistant')

    streaming.value = true
    answerTerminal = false
    resetRevealQueues()
    revealSpeedMultiplier = 1
    startLgRagStream(
      {
        query: CONTINUE_REPLY_QUERY,
        threadId: tid,
        continueFromRunId: fromAssistant.continueFromRunId,
      },
      assistant,
    )
  }

  function stopStreaming(): void {
    // D3：追帧退避定时器一并清除（不泄漏 · FP-H10）；代际戳使在飞 step 的后续调度失效
    if (chaseTimer !== null) {
      clearTimeout(chaseTimer)
      chaseTimer = null
    }
    chaseGeneration += 1
    activeChaseRunId = null // 范围1：停流即释放活链（同 run 之后可重起 · 手动续看不阻）
    controller?.abort()
    controller = null
    // TC11：追帧间隙（退避定时器挂起 · 无在飞请求）abort 为 no-op，须本地复位 streaming/刷齐队列
    // （live/在飞路径由 onAborted 回调置位 · 幂等双写不冲突）
    streaming.value = false
    flushRevealQueues()
  }

  /** 清本地 thread_id（ref + localStorage + 恢复提示条） */
  function clearThreadId(): void {
    threadId.value = null
    restoredNotice.value = false
    clearStoredThreadId()
  }

  /** 新会话：清 thread_id + 清消息 + 清提示 + 清 active-run；下轮发送 body 不带 thread_id（api 生成新 id） */
  function startNewSession(): void {
    stopStreaming() // streaming 中先 abort（R1-N4）
    resetRevealQueues()
    clearThreadId()
    clearActiveRun() // T4：显式放弃旧上下文，未完成 run 一并丢弃（30 内决，对齐「新会话」语义）
    messages.value = []
    error.value = null
    lastDone.value = null
    interrupted.value = false
    resumeHint.value = null
  }

  /** 关闭「已恢复上次会话上下文」提示条 */
  function dismissRestoredNotice(): void {
    restoredNotice.value = false
  }

  /** 关闭「上次回答未完成·续看」提示条（保留 active-run，仅不再打扰） */
  function dismissResumeNotice(): void {
    resumeNotice.value = false
  }

  // D3 追帧上限（task 定稿 · 双界先到为准）：连续追帧 ≤10 次 且 墙钟 ≤120s
  const CHASE_MAX_ATTEMPTS = 10
  const CHASE_MAX_WALL_MS = 120_000
  /** 递增退避起始间隔 / replay 409 缺 Retry-After 头的默认退避（毫秒 · web-hitl-resume-chase-ux：起始 2s 钉死） */
  const CHASE_INTERVAL_MS = 2_000
  /** web-hitl-resume-chase-ux 范围3：干净结束未见终帧的递增退避（×1.5 · 封顶 8s）→ 阶梯 2s/3s/4.5s/6.75s/8s×5，
   * 10 次墙钟 56.25s 远低于 120s 双界（次数先到为准）；FP-H2 409 Retry-After 优先于阶梯且不推进阶梯 */
  const CHASE_BACKOFF_FACTOR = 1.5
  const CHASE_MAX_DELAY_MS = 8_000

  /** D11（task_web_hitl_approval_overlay_ux）：历史全量翻页 limit（契约上限 100 · src/api/chatHistory.ts:15 超限 422） */
  const HISTORY_PAGE_LIMIT = 100

  /** D1 空泡判据（task_web_hitl_approval_overlay_ux）：replay 帧中计入「内容落墨」的事件类型
   * （answer→content · node.progress→thinking · subtask.progress→subtasks · hitl.waiting→hitl）；
   * error 帧带 runTerminalStatus 徽标+继续回复 CTA 视为可见落墨（空泡回收不吞错误落点 · failure_paths）；
   * run.start/done 等纯元信息帧不计（R1-N1：done 仅元信息零落墨同属回收判据不逃逸） */
  const CONTENT_INK_EVENT_TYPES = new Set([
    'answer',
    'node.progress',
    'subtask.progress',
    'hitl.waiting',
    'error',
  ])

  /** 解析 resume 200 携 replay.cursor（"{run_id}:{seq}" · 与 extractFrameCursor :574-597 同兜底规则）；非法 → null（FP-H1 回退手动路径） */
  function parseReplayCursor(cursor: string): { run_id: string; after_seq: number } | null {
    const idx = cursor.lastIndexOf(':')
    if (idx <= 0) return null
    const runId = cursor.slice(0, idx)
    const seq = Number(cursor.slice(idx + 1))
    if (!runId || !Number.isFinite(seq)) return null
    return { run_id: runId, after_seq: seq }
  }

  /**
   * web-hitl-resume-chase-ux 范围5：resume 409 detail 分类（detail 只消费 · hitl-browser-decide-v1 契约不改）。
   * 判据 = 后端 api/app/ops/hitl/ 文案子串（router.py:553/561-572 · resume.py:249/329 · router.py:421）；
   * 未识别一律落中性默认（裸 code 串面存续 · TC10「stranded_checkpoint」钉死）。
   */
  function resumeConflictMessage(detail: string): string {
    if (detail.includes('没有 thread_id')) return '该申请缺少会话定位信息，无法恢复，请重新开会话'
    if (detail.includes('没有 interrupt 元数据')) return '该会话挂起点为旧版本残留，无法恢复，请作废重开'
    if (detail.includes('拿不到待解锁的步骤')) return '已批准但无可解锁步骤，无法恢复，请重新开会话'
    return '该会话已无法恢复，请重新开会话'
  }

  /**
   * D3 · resume 受理后的自动追帧器（FP-H2/H3/H4 · 帧复用 processFrame 同一管线 · 渲染进当前 assistant 消息）：
   * - replay 干净结束未见终帧（恢复段在写）→ 携末帧 cursor 约 2s 再追（FP-H3）
   * - replay 409 + Retry-After → 按头秒数退避自动重试（缺头默认 2s · D-C retryAfterSeconds）· 不弹错误条（FP-H2）
   * - 上限：连续追帧 ≤10 次 且 墙钟 ≤120s（先到为准 · 409 并入同一上限）；超限降级
   *   「恢复仍在进行，可稍后手动续看」+ active-run 保留不清（canResume 为真 · 手动续看兜底 FP-H11/FP-T5）
   * - web-hitl-resume-chase-ux 范围1：同一 run 只允许一条活链（activeChaseRunId 入口拦截 · 14>10 根因修复）；
   *   范围2：退避等待期进度双落点常驻（hitl.note + resumeHint · 恢复段长耗时不再死等），终帧即消（回 settledNote 收官）；
   *   范围3：干净结束未见终帧的再追为递增退避（2s 起 ×1.5 封顶 8s · 起始 2s 钉死）
   * - 传输层终断（401/404/422/网络错）语义沿用 resumeFromCursor · 不并入退避重试
   * - stopStreaming/startNewSession → 清退避定时器 + 代际戳失效 + 活链释放（FP-H10 不泄漏）
   */
  function chaseResumedRun(
    assistant: ChatMessage,
    start: { run_id: string; after_seq: number },
    settledNote: string,
  ): void {
    // 范围1：同 run 活链在飞 → 新链入口直返（单链计数器作用域完好 · 实测 14>10 唯多链并发可破 · 此处截断）
    if (activeChaseRunId === start.run_id) return
    activeChaseRunId = start.run_id
    const generation = ++chaseGeneration
    const startedAt = Date.now()
    let attempts = 0
    let cursor = start
    // 范围3：递增退避阶梯游标（仅干净结束未见终帧推进；FP-H2 409 Retry-After 优先且不动阶梯）
    let delayMs = CHASE_INTERVAL_MS

    const releaseChase = (): void => {
      if (activeChaseRunId === start.run_id) activeChaseRunId = null
    }
    // 范围2：追帧等待期（恢复段长耗时执行中）进度可见——卡片/提示条双落点常驻，终帧即消
    const showProgress = (): void => {
      const text = settledNote + " · 恢复中 · 正在获取进展（第 " + (attempts + 1) + " 次）…"
      if (assistant.hitl) assistant.hitl.note = text
      resumeHint.value = text
    }

    const degrade = (): void => {
      // 超限降级：active-run 保留不清 · 卡片/提示条双落点 · 可手动续看
      releaseChase()
      streaming.value = false
      flushRevealQueues()
      answerTerminal = true
      if (assistant.hitl) assistant.hitl.note = '恢复仍在进行，可稍后手动续看'
      resumeHint.value = '恢复仍在进行，可稍后手动续看'
    }

    const scheduleNext = (delayMs: number): void => {
      if (generation !== chaseGeneration) return
      if (chaseTimer !== null) clearTimeout(chaseTimer)
      chaseTimer = setTimeout(() => {
        chaseTimer = null
        void step()
      }, delayMs)
    }

    const step = async (): Promise<void> => {
      if (generation !== chaseGeneration) return
      if (attempts >= CHASE_MAX_ATTEMPTS || Date.now() - startedAt >= CHASE_MAX_WALL_MS) {
        degrade()
        return
      }
      attempts += 1
      // 接力去重基线：已推进的 seq 一律忽略（与 resumeFromCursor 同防御）
      currentRunId = cursor.run_id
      lastAppliedSeq = cursor.after_seq
      let sawTerminal = false
      let lastSeq = cursor.after_seq
      let backoffMs: number | null = null

      error.value = null
      resumeHint.value = null
      streaming.value = true
      answerTerminal = false // T5：replay 接力重置（同 resumeFromCursor）
      resetRevealQueues()
      revealSpeedMultiplier = REVEAL_REPLAY_SPEED_MULTIPLIER

      await new Promise<void>((resolve) => {
        controller = replayLgRag(cursor, {
          onEvent: (event) => {
            if (event.event_type === 'done' || event.event_type === 'error') sawTerminal = true
            const { seq } = extractFrameCursor(event)
            if (seq !== null) lastSeq = Math.max(lastSeq, seq)
            processFrame(event, assistant)
          },
          onError: (transportError) => {
            if (transportError.status === 409) {
              // FP-H2：run 在飞 replay 409 + Retry-After → 退避自动重试 · 不弹错误条不计失败
              backoffMs = (transportError.retryAfterSeconds ?? CHASE_INTERVAL_MS / 1000) * 1000
              streaming.value = false
              flushRevealQueues()
              resolve()
              return
            }
            streaming.value = false
            flushRevealQueues()
            answerTerminal = true
            sawTerminal = true // 传输层终断：不再自动追（401/404/422/网络错各有落点 · 不并退避）
            if (transportError.status === 401) {
              // replay 401：清 thread_id + 清 active-run + 清 auth，跳登录（FP-H7 · 与 live 401 同语义）
              clearThreadId()
              clearActiveRun()
              useAuthStore().clearSession()
              error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
            } else if (transportError.status === 404 || transportError.status === 422) {
              // FP-H6：404 未知/跨用户 run · 422 非法游标 → 清 active-run + 中性提示（语义沿用 resumeFromCursor）
              clearActiveRun()
              error.value = {
                stage: 'resume',
                message:
                  transportError.status === 404
                    ? '已无法续看（对话记录不存在或已过期），请重新提问'
                    : '续看请求校验未通过（' + localizeHttpErrorDetail(transportError.message) + '），请重新提问',
                retryable: false,
              }
            } else {
              // 网络错/超时：保留 active-run 可手动续看（非 409 不自动退避重试）
              error.value = {
                stage: transportError.kind,
                message: localizeHttpErrorDetail(transportError.message),
                retryable: true,
              }
            }
            resolve()
          },
          onAborted: () => {
            streaming.value = false
            interrupted.value = true
            flushRevealQueues()
            answerTerminal = true
            clearActiveRun()
            resolve()
          },
          onDone: () => resolve(),
        })
      })

      if (generation !== chaseGeneration) return // 追帧期间 stopStreaming/startNewSession 已接管清理（活链随之释放）
      if (sawTerminal) {
        // 终帧/终断：done/error 帧由 handleEvent 收尾（streaming=false+clearActiveRun 等）；传输层错误已在 onError 落点
        streaming.value = false
        flushRevealQueues()
        // 范围2 终帧即消：进度可见态撤回收官文案 · 恢复提示条清空 · 活链释放（验收2：零续追 · 同 run 手动续看不阻）
        if (assistant.hitl) assistant.hitl.note = settledNote
        resumeHint.value = null
        releaseChase()
        return
      }
      // FP-H3 干净结束未见终帧 → 携末帧 cursor 递增退避再追；FP-H2 409 → 按 Retry-After 退避（不动阶梯）
      cursor = { run_id: cursor.run_id, after_seq: lastSeq }
      scheduleNext(backoffMs ?? delayMs)
      if (backoffMs === null) {
        delayMs = Math.min(Math.round(delayMs * CHASE_BACKOFF_FACTOR), CHASE_MAX_DELAY_MS)
      }
      showProgress()
    }

    void step()
  }

  /**
   * T4 续看：从 active-run 游标调 replay（POST /api/ops/lg-rag/replay · body {run_id, after_seq:last_seq}），
   * 帧复用 processFrame 同一渲染管线；渲染目标为**新建** assistant 消息（R1-N5：刷新后 messages 为空，
   * 断连续看亦新开一条承接后续帧）。手动触发，绝不自动 replay。
   */
  function resumeFromCursor(): void {
    const run = activeRun.value
    if (!run || streaming.value) return

    error.value = null
    resumeHint.value = null
    resumeNotice.value = false

    const assistant = pushMessage('assistant')
    // 接力去重基线：已推进的 seq 一律忽略（防御 replay 与 live 已收帧重叠）
    currentRunId = run.run_id
    lastAppliedSeq = run.last_seq
    let sawTerminal = false
    // D1 零内容落墨判据：字段态不可读（answer 帧进 RevealQueue 渐显，onDone 时 content 可能仍为空），
    // 故在 onEvent 包装层按帧类型记落墨（CONTENT_INK_EVENT_TYPES）
    let sawInk = false

    streaming.value = true
    answerTerminal = false // T5：replay 接力重置（渲染目标为新建 assistant 消息）
    resetRevealQueues()
    revealSpeedMultiplier = REVEAL_REPLAY_SPEED_MULTIPLIER // R1-N3：replay ≥4× live
    controller = replayLgRag(
      { run_id: run.run_id, after_seq: run.last_seq },
      {
        onEvent: (event) => {
          if (event.event_type === 'done' || event.event_type === 'error') sawTerminal = true
          if (CONTENT_INK_EVENT_TYPES.has(event.event_type)) sawInk = true
          processFrame(event, assistant)
        },
        onError: (transportError) => {
          streaming.value = false
          flushRevealQueues()
          answerTerminal = true // T5：replay 传输层终断后停止追加（再续看时重置）
          if (transportError.status === 401) {
            // replay 401：清 thread_id + 清 active-run + 清 auth，跳登录（与 live 401 同语义）
            clearThreadId()
            clearActiveRun()
            useAuthStore().clearSession()
            error.value = { stage: 'auth', message: '登录已过期，请重新登录', retryable: false }
          } else if (transportError.status === 404 || transportError.status === 422) {
            // 404 未知/跨用户 run · 422 非法游标（防御）：清 active-run + 用户可见提示，不自动重试
            clearActiveRun()
            error.value = {
              stage: 'resume',
              message:
                transportError.status === 404
                  ? '已无法续看（对话记录不存在或已过期），请重新提问'
                  : '续看请求校验未通过（' + localizeHttpErrorDetail(transportError.message) + '），请重新提问',
              retryable: false,
            }
          } else {
            // replay 网络错/超时：保留 active-run，可再点「续看」
            error.value = {
              stage: transportError.kind,
              message: localizeHttpErrorDetail(transportError.message),
              retryable: true,
            }
          }
        },
        onAborted: () => {
          streaming.value = false
          interrupted.value = true
          flushRevealQueues()
          answerTerminal = true // T5：abort 终态（与 live 一致）
          clearActiveRun() // abort 终态（与 live 一致）
        },
        onDone: () => {
          streaming.value = false
          // D1（task_web_hitl_approval_overlay_ux · 维护者需求①）：replay 干净结束且零内容落墨
          // → 回收空 assistant 泡（不渲染空气泡）；错误分态走 onError 不经本路径，回收不吞错误落点。
          // 典型场景：chase 超限 / 挂起中点「续看推进」→ 服务端合法零新帧返回（范围②调查结论）。
          if (!sawInk) {
            const idx = messages.value.findIndex((m) => m.id === assistant.id)
            if (idx !== -1) messages.value.splice(idx, 1)
          }
          // R1-N4 空流/未完边界：replay 干净结束但未见终态帧 → run 仍在服务端推进；
          // 保留 active-run，提示稍后再试（seq 已推进则提示接力）——resumeHint 兜底存续（D1 不受回收影响）
          if (!sawTerminal && activeRun.value) {
            resumeHint.value =
              activeRun.value.last_seq > run.last_seq
                ? '回答仍在生成中，可稍后再次「续看」接力'
                : '暂无新进度，稍后再点「续看」'
          }
        },
      },
    )
  }

  /**
   * F2 / AC16 · B2 pending 一次性核对刷新（两消费点：① decide/resume 动作链后 ② 进入
   * waiting_approval thread 时）。**不轮询**、非全局面板；403/404/501/网络错降级呈现不炸屏
   * （FP-F4/F8）；401 由 http.ts 拦截器全局跳登录。
   */
  async function refreshHitlPending(): Promise<void> {
    try {
      const resp = await fetchHitlPending()
      hitlPending.value = resp.items
      hitlPendingError.value = null
      hitlPendingFetched.value = true // D2：fetch 成功过 → 卡片对账判据生效（FP-4/5：失败路径不置位）
      hitlSnapshotStamp.value += 1 // 形态 A：快照纪元 +1（对账键口径统一的分水岭）
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 403) {
        hitlPendingError.value = '无审批权限'
      } else if (apiError.status !== 401) {
        hitlPendingError.value = '审批服务暂不可用'
      }
    }
  }

  /** DP-1 形态 A：登记请求 id 首见（live 帧 / 历史 / replay 三入口统一 · 仅首写幂等） */
  function stampHitlFirstSeen(requests: ChatHitlRequest[]): void {
    const stamp = hitlSnapshotStamp.value
    for (const request of requests) {
      if (request.id && !hitlFirstSeenStamps.has(request.id)) {
        hitlFirstSeenStamps.set(request.id, stamp)
      }
    }
  }

  /**
   * web-ux-state-sync D2 · chat 卡片对账（零轮询零新端点 · 复用 refreshHitlPending 既有刷新点 ·
   * ChatView 挂载/动作链后已自动刷新）；web-hitl-overlay-reconcile-race · DP-1 形态 A 修订判据
   * （键口径统一 · 帧首见纪元锁）：渲染 waiting 卡时以本函数判定「已被服务端处理而本端未感知」。
   * - true（转只读「已被处理或已失效」）：已成功取回（hitlPendingFetched 且 hitlPendingError===null）
   *   且 request id 不在 pending 列，且**首见纪元早于最近一次成功快照**（形态 A：快照后首见的
   *   SSE 新到 id 不参账，待下一次成功刷新确证——修 issue #95 实体键滞后误转死态）；
   * - false（不做对账）：fetch 未成功/未跑过（FP-4 403 · FP-5 网络错 · 取回前空列表）；
   *   本地已动作（FP-6 · hitlActedRequestIds 优先 · 已决单不得被「不在列」误判回 waiting）；
   *   id 在列（保持可点）；本端未经帧/历史首见（渲染卡的 id 必经首见登记，防御性 false）。
   */
  function isHitlRequestReconciled(requestId: string): boolean {
    if (!requestId) return false
    if (hitlActedRequestIds.has(requestId)) return false // FP-6：本地已动作优先
    if (!hitlPendingFetched.value || hitlPendingError.value !== null) return false // FP-4/FP-5：fetch 未成功
    if (hitlPending.value.some((item) => item.id === requestId)) return false // 在列 → 保持可点
    // DP-1 形态 A：仅首见纪元 < 当前快照纪元的 id 参账（首见晚于最近一次成功快照 = 实体键滞后，不参账）
    const firstSeen = hitlFirstSeenStamps.get(requestId)
    if (firstSeen === undefined) return false
    return firstSeen < hitlSnapshotStamp.value
  }

  /**
   * F2-3 · 审批动作链（契约两步钉死 · 不合并单端点）：
   * 批准/驳回 → POST decide {decision}（T-W2 可选 resume_mode · 默认 inherit 不送）→ 成功 → POST resume（链式两调用 · decide 先于 resume）。
   * 例外（响应驱动 · 非请求臆断）：decide 响应 resume.required=false（immediate 后端已自动续跑）→ 跳过第二步 resume（S3 实证再链必 409）。
   * D3：resume 200 携 replay.cursor → 自动追帧（chaseResumedRun · 复用 processFrame 管线）；cursor 缺失/非法回退手动续看（FP-H1）；
   * resume 在飞 409 →「恢复进行中」分流不并发重提（FP-H4）；503/stranded 409 → 中性错误条不自动重试（FP-H12）。
   * 动作中卡片 acting（loading · 禁重复点击）；decide 成功后 decided +「已批准/已驳回 · 恢复进行中/点击续看推进」。
   * 分态（FP-F2/F4/F10）：decide 409 → 已被处理（不弹错误条 · 刷新审批态）；404 → 中性「申请不存在或已处理」；
   * 403 → 动作隐藏/降级「无审批权限」（不炸屏）；401 → http 拦截器全局跳登录；其他 → 回 waiting 可重试。
   */
  async function decideHitl(
    assistant: ChatMessage,
    requestId: string,
    decision: HitlDecision,
    resumeMode: HitlResumeMode = 'inherit',
  ): Promise<void> {
    const hitl = assistant.hitl
    if (!hitl || !requestId) return
    if (hitl.status !== 'waiting') return // acting/decided/resolved/forbidden/unavailable 不可重复触发
    // web-hitl-resume-chase-ux 范围4 幂等：本端已受理的申请（连点/已决单重入/卡片态被重放帧打回 waiting 的再入）只发一次 decide+resume
    if (hitlActedRequestIds.has(requestId)) return
    hitl.status = 'acting'
    hitlActedRequestIds.add(requestId)
    hitl.note = null
    // D3：外 try 只包 decide；resume 失败不再混入 decide 分态（FP-H4 分流前提）
    let decideResp: HitlDecideResponse
    try {
      // T-W2：resume_mode 可选键——默认 inherit **不送**（保持 {decision} 载荷字面 · 两步钉死不破）；
      // 仅 immediate/manual 透传第三参（非法值由后端白名单 400 → 走下方通用错误分支展示，不本地臆造第四值）
      decideResp =
        resumeMode === 'inherit'
          ? await decideHitlRequest(requestId, decision)
          : await decideHitlRequest(requestId, decision, resumeMode)
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 409) {
        // FP-F2：重复 decide / 申请已决 → 卡片转「已被处理」态 · 不弹错误条 · 刷新审批态
        hitl.status = 'resolved'
        hitl.note = '该申请已被处理'
        void refreshHitlPending()
        return
      }
      if (apiError.status === 404) {
        // FP-F10：中性文案，不区分越权与不存在（归属不泄露）
        hitl.status = 'resolved'
        hitl.note = '申请不存在或已处理'
        return
      }
      if (apiError.status === 403) {
        // FP-F4：非 maintainer → 动作隐藏/降级呈现 · 不以 403 炸错误屏
        hitl.status = 'forbidden'
        hitl.note = '无审批权限'
        return
      }
      if (apiError.status === 401) {
        // 401 由 http.ts 拦截器全局跳登录；卡片回待审批态（登录后可重试）
        hitl.status = 'waiting'
        hitlActedRequestIds.delete(requestId) // decide 未决：解除受理标记，登录后可重试（幂等不误伤合法重试）
        return
      }
      // 网络/其他错误：卡片回 waiting 可重试（不弹全局错误条 · 审批动作局部呈现）
      hitl.status = 'waiting'
      hitlActedRequestIds.delete(requestId) // decide 未决：解除受理标记
      hitl.note = apiError.message || '审批操作失败，请重试'
      return
    }
    hitl.status = 'decided'
    hitl.decision = decision
    const decidedNote = decision === 'approved' ? '已批准' : '已驳回'
    // T-W2 S3 实证例外存续：immediate 时后端 decide 即进程内自动续跑（required=false · auto_triggered=true），
    // 前端再链第二步 resume 必撞 409——不调 resume；有 active-run 游标则直接起追帧（D2-1 同管线），
    // 无游标（异常面）回退手动续看（FP-H1 同形回退）
    if (decideResp.resume?.required === false) {
      const run = activeRun.value
      if (run) {
        hitl.note = `${decidedNote} · 恢复进行中`
        chaseResumedRun(assistant, { run_id: run.run_id, after_seq: run.last_seq }, decidedNote)
      } else {
        hitl.note = `${decidedNote} · 点击续看推进`
      }
      void refreshHitlPending() // AC16①：动作链完成后刷新审批态
      return
    }
    // inherit/manual：两步钉死第二步 resume（D2-1 消费 replay.cursor）
    try {
      const resumeResp = await resumeHitlRequest(requestId)
      // D2-1：resume 秒回 200 携 replay.cursor → 自动起追帧（复用 processFrame 管线 · 渲染进当前 assistant 消息）；
      // cursor 空串/缺失/非法（best-effort 契约）→ FP-H1 回退既有手动路径零回归
      const cursorText = typeof resumeResp.replay?.cursor === 'string' ? resumeResp.replay.cursor : ''
      const start = cursorText ? parseReplayCursor(cursorText) : null
      if (start) {
        hitl.note = `${decidedNote} · 恢复进行中`
        chaseResumedRun(assistant, start, decidedNote)
      } else {
        hitl.note = `${decidedNote} · 点击续看推进`
      }
      void refreshHitlPending() // AC16①
      return
    } catch (err) {
      const apiError = err as ApiError
      // D3-4 分流（FP-H4 修现状假相）：resume 在飞 409「该申请的恢复正在执行中」（api router.py:565 文案子串判据）
      // →「恢复进行中」· 不并发重提 · 有 active-run 游标则起追帧等沉降；**禁**呈「已被处理」（那是 decide 409 语义）
      if (apiError.status === 409 && apiError.message.includes('正在执行中')) {
        hitl.note = '恢复进行中'
        const run = activeRun.value
        if (run) chaseResumedRun(assistant, { run_id: run.run_id, after_seq: run.last_seq }, decidedNote)
        void refreshHitlPending()
        return
      }
      // FP-H12：resume 503（checkpoint 未配置）/ stranded_checkpoint 409 → 中性错误条 · 不当可重试面自动重试
      if (apiError.status === 503 || apiError.status === 409) {
        hitl.note = `${decidedNote} · 点击续看推进`
        error.value = {
          stage: 'resume',
          message:
            apiError.status === 503
              ? '恢复服务暂不可用，请稍后重试'
              : resumeConflictMessage(apiError.message), // 范围5：409 detail 分类（只消费 · 契约不改）
          retryable: false,
        }
        void refreshHitlPending()
        return
      }
      if (apiError.status === 404) {
        // FP-F10 存续：中性文案，不区分越权与不存在（归属不泄露）
        hitl.status = 'resolved'
        hitl.note = '申请不存在或已处理'
        return
      }
      if (apiError.status === 403) {
        // FP-F4 存续：非 maintainer → 动作隐藏/降级呈现
        hitl.status = 'forbidden'
        hitl.note = '无审批权限'
        return
      }
      if (apiError.status === 401) {
        // 401 由 http.ts 拦截器全局跳登录；卡片回待审批态（登录后可重试 · decide 幂等由后端 409 兜底）
        hitl.status = 'waiting'
        hitlActedRequestIds.delete(requestId)
        return
      }
      // resume 网络/其他错误：decide 已决（不可回 waiting 重复 decide）· 错误条可重试提示 · 手动续看兜底
      hitl.note = `${decidedNote} · 恢复失败，请稍后重试`
      error.value = {
        stage: 'resume',
        message: localizeHttpErrorDetail(apiError.message) || '恢复失败，请稍后重试',
        retryable: true,
      }
      void refreshHitlPending()
    }
  }

  /** F1-3（裁定 F-C）：B1 history run 消息视图 → 既有 ChatMessage 结构（query→user · answer→assistant ·
   * subtasks→子任务过程 · terminal_status/hitl→run 末态/审批卡片）；与 live 帧管线同构 */
  function mapHistoryRunsToMessages(runs: ChatHistoryRun[]): ChatMessage[] {
    const mapped: ChatMessage[] = []
    for (const run of runs) {
      const query = typeof run.query === 'string' ? run.query.trim() : ''
      // FP-F6：老 run 缺 query → run_id 前缀+时间兜底（承服务端 FP-4 再兜底 · 不崩）
      const runIdShort = typeof run.run_id === 'string' ? run.run_id.slice(0, 8) : ''
      const startedAt = typeof run.started_at === 'string' ? run.started_at : ''
      const fallbackTitle = `run ${runIdShort} · ${startedAt}`.trim()
      mapped.push({
        id: `h-${++messageSeq}`,
        role: 'user',
        content: query || fallbackTitle,
        thinking: [],
        subtasks: [],
        hitl: null,
      })
      const subtasks: ChatThinkingBlock[] = Array.isArray(run.subtasks)
        ? run.subtasks.map((item) => {
            const role =
              typeof item.agent_role === 'string' && item.agent_role ? item.agent_role : 'subtask'
            const message = typeof item.message === 'string' ? item.message : ''
            const step = typeof item.step === 'string' ? item.step : ''
            const status = typeof item.status === 'string' ? item.status : ''
            const block: ChatThinkingBlock = {
              role,
              content: message || step || status || 'subtask',
            }
            if (status) block.status = status
            return block
          })
        : []
      const terminal = typeof run.terminal_status === 'string' ? run.terminal_status : ''
      const assistant: ChatMessage = {
        id: `h-${++messageSeq}`,
        role: 'assistant',
        // F1：running/error/disconnected 均保留已聚合半截 answer（勿因非 completed 清空）
        content: typeof run.answer === 'string' ? run.answer : '',
        thinking: [],
        subtasks,
        hitl: null,
        truncated: run.answer_truncated === true,
        runTerminalStatus: terminal || null,
      }
      // terminal_status=waiting_approval → 待审批形态（**非**完成态 · FP-F1 同口径）；
      // 历史 hitl 为 requests 列表（上游 collect_hitl_requests 透传），reason 取首条申请自带 reason
      if (terminal === 'waiting_approval') {
        const requests = extractHitlRequests(run.hitl)
        const firstReason = requests.find((request) => typeof request.reason === 'string')
        assistant.hitl = buildHitlState(
          typeof firstReason?.reason === 'string' ? firstReason.reason : '',
          requests,
        )
        stampHitlFirstSeen(requests) // DP-1 形态 A：历史/replay 首见登记（口径同 live 帧）
      } else if (terminal === 'error' || terminal === 'disconnected') {
        // D3：失败/补偿中止 →「继续回复」= 新 stream（禁 HITL resume · 禁假续算）
        assistant.allowContinueReply = true
        assistant.continueFromRunId =
          typeof run.run_id === 'string' && run.run_id ? run.run_id : null
      }
      // running：半截可见 + 生成中徽标；**勿** allowContinueReply（TC-W2）
      mapped.push(assistant)
    }
    return mapped
  }

  /**
   * D11（task_web_hitl_approval_overlay_ux）：历史全量翻页循环 —— fetchThreadHistory 携 cursor
   * 翻至 next_cursor=null（limit=100 · 契约上限），消除「服务端默认首页 20 runs 静默截断」。
   * 游标回环防御（后端异常同 cursor 复现）→ 中断不空转（无可见截断面：单 run 视图全量返回是常态）。
   */
  async function fetchAllThreadRuns(tid: string): Promise<ChatHistoryRun[]> {
    const runs: ChatHistoryRun[] = []
    let cursor: string | null = null
    for (;;) {
      const page = await fetchThreadHistory(
        tid,
        cursor ? { limit: HISTORY_PAGE_LIMIT, cursor } : { limit: HISTORY_PAGE_LIMIT },
      )
      if (Array.isArray(page.runs)) runs.push(...page.runs)
      const next =
        typeof page.next_cursor === 'string' && page.next_cursor ? page.next_cursor : null
      if (!next || next === cursor) break
      cursor = next
    }
    return runs
  }

  /**
   * F1-3/F1-4 · 点击历史 thread：B1 history（D11 全量翻页 · 复用 fetchAllThreadRuns 同一数据链）
   * → 映射进既有消息流渲染；
   * 最新 run 挂 waiting_approval → 以 active-run 语义挂起展示（last_seq 契约未提供 → 0 从头 replay），
   * 手动「续看」走既有 resumeFromCursor/replayLgRag（**不新造续看机制/端点**），
   * 并一次性 fetchHitlPending 核对（AC16② · 不轮询 · 403/404 降级不炸屏）。
   * 失败：404 → 中性「会话不存在或已过期」（FP-F10）；其余 → 「历史服务暂不可用」（FP-F8 · 不阻塞 Chat 主路径）。
   */
  async function openHistoryThread(tid: string): Promise<void> {
    if (!tid || historyLoading.value) return
    historyLoading.value = true
    historyError.value = null
    try {
      const runs = await fetchAllThreadRuns(tid)
      stopStreaming() // 切换 thread 前中断在途流（abort 终态语义沿用）
      resetRevealQueues()
      messages.value = mapHistoryRunsToMessages(runs)
      // 切入该 thread：续问带 thread_id（T3 语义沿用 · run.start 捕获点不受影响）
      threadId.value = tid
      writeStoredThreadId(tid)
      restoredNotice.value = false
      error.value = null
      lastDone.value = null
      interrupted.value = false
      resumeHint.value = null
      const latest = runs[runs.length - 1]
      if (
        latest &&
        latest.terminal_status === 'waiting_approval' &&
        typeof latest.run_id === 'string' &&
        latest.run_id
      ) {
        activeRun.value = {
          run_id: latest.run_id,
          last_seq: 0,
          thread_id: tid,
          updated_at: new Date().toISOString(),
        }
        writeStoredActiveRun(activeRun.value)
        void refreshHitlPending() // AC16②：进入即一次性核对（不轮询）
      } else {
        clearActiveRun()
      }
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 404) {
        historyError.value = '会话不存在或已过期'
      } else if (apiError.status !== 401) {
        // 401 由 http.ts 拦截器全局跳登录；404/501/网络错 → FP-F8 降级不阻塞主路径
        historyError.value = '历史服务暂不可用'
      }
    } finally {
      historyLoading.value = false
    }
  }

  /**
   * D11/D12（task_web_hitl_approval_overlay_ux · 维护者需求④）：刷新/重进且 localStorage 已存
   * thread_id 时，进入 Chat 页自动全量加载该会话历史回显（触发点 = ChatView onMounted ·
   * 复用 openHistoryThread 数据链 fetchAllThreadRuns + mapHistoryRunsToMessages 同一实现 ·
   * 不复制第二份映射逻辑）。
   * 边界（D12）：无 thread_id 零加载零打扰；loadLatestSession 元数据调用存续；active-run
   * 「不自动 replay」存续（T4 断线游标已恢复则保留不覆盖 · last_seq 精度优先；无 T4 游标且最新
   * run waiting_approval → 沿用 openHistoryThread 挂起闭环 last_seq=0 手动续看）；
   * 失败 → FP-F8/F10 降级（404「会话不存在或已过期」· 其余「历史服务暂不可用」）不阻塞主路径。
   * 交叉（D14/验收10）：刷新后 streaming 必 false 不与在途流并存；加载完成时若 messages 已有
   * 新内容（视图 loading 门控被绕过的理论面）→ 放弃覆盖，live 内容优先不双轨渲染。
   */
  async function restoreThreadHistory(): Promise<void> {
    const tid = threadId.value
    if (!tid || historyLoading.value) return
    historyLoading.value = true
    historyError.value = null
    try {
      const runs = await fetchAllThreadRuns(tid)
      if (messages.value.length > 0) return // D14：live 内容优先，不双轨渲染（finally 仍复位 loading）
      messages.value = mapHistoryRunsToMessages(runs)
      const latest = runs[runs.length - 1]
      if (
        !activeRun.value &&
        latest &&
        latest.terminal_status === 'waiting_approval' &&
        typeof latest.run_id === 'string' &&
        latest.run_id
      ) {
        activeRun.value = {
          run_id: latest.run_id,
          last_seq: 0,
          thread_id: tid,
          updated_at: new Date().toISOString(),
        }
        writeStoredActiveRun(activeRun.value)
        void refreshHitlPending() // AC16② 同口径：进入即一次性核对（不轮询）
      }
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 404) {
        historyError.value = '会话不存在或已过期'
      } else if (apiError.status !== 401) {
        // 401 由 http.ts 拦截器全局跳登录；404/501/504/网络错 → FP-F8 降级不阻塞主路径
        historyError.value = '历史服务暂不可用'
      }
    } finally {
      historyLoading.value = false
    }
  }

  return {
    session,
    sessionLoading,
    sessionError,
    threadId,
    restoredNotice,
    activeRun,
    resumeNotice,
    resumeHint,
    canResume,
    messages,
    streaming,
    interrupted,
    error,
    lastDone,
    historyLoading,
    historyError,
    hitlPending,
    hitlPendingError,
    hitlPendingFetched, // D2：「fetch 成功过」标志位（卡片对账判据 · 测试/渲染可读）
    hitlSnapshotStamp, // DP-1 形态 A：对账纪元（每次成功刷新 +1 · 测试可读）
    isHitlRequestReconciled, // D2 + 形态 A：waiting 卡对账（true=服务端已无 → 转只读）
    loadLatestSession,
    sendMessage,
    continueReply,
    stopStreaming,
    startNewSession,
    dismissRestoredNotice,
    dismissResumeNotice,
    resumeFromCursor,
    refreshHitlPending,
    decideHitl,
    openHistoryThread,
    restoreThreadHistory,
  }
})
