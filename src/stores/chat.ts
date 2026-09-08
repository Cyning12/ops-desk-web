import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchLatestSession } from '../api/chat'
import type { ChatSession } from '../api/chat'
import type { ApiError } from '../api/http'
import { replayLgRag, streamLgRag } from '../composables/useLgRagSse'
import type { LgRagSseController, LgRagSseEvent } from '../composables/useLgRagSse'
import {
  REVEAL_REPLAY_SPEED_MULTIPLIER,
  RevealQueue,
} from '../composables/useRevealQueue'
import { useAuthStore } from './auth'

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
 * 值形 {run_id, last_seq, thread_id, updated_at}；run 终态（done/error/abort）即清除；
 * localStorage 不可用退化内存态（刷新即失，静默降级）。stores/auth.ts clearSession 直写同键清除。
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

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  /** 纯文本（markdown 不渲染，保留换行） */
  content: string
  /** 编排节点进度（node.progress） */
  thinking: ChatThinkingBlock[]
  /** 子任务过程（subtask.progress · rag_subtask / info_extract / tool_exec） */
  subtasks: ChatThinkingBlock[]
}

/** SSE error 事件 / 传输层错误的统一展示结构 */
export interface ChatErrorState {
  stage: string
  message: string
  retryable: boolean
}

export interface ChatDoneInfo {
  latency_ms: number
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
 *   active-run 持久化（key=ops.lg-rag.active-run）；run 终态（done/error/abort）即清除；
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
  /** 未完成 run 的续看游标；run 终态（done/error/abort）即清除；null = 无可续看 */
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

  /** 可点「续看」：有未完成 run 且当前无流在进行 */
  const canResume = computed(() => activeRun.value !== null && !streaming.value)

  let controller: LgRagSseController | null = null
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
      case 'done': {
        const latency = event.payload?.latency_ms
        const model = event.payload?.model
        lastDone.value = {
          latency_ms: typeof latency === 'number' ? latency : 0,
          model: typeof model === 'string' ? model : '',
        }
        streaming.value = false
        flushRevealQueues() // R1-N2：刷齐已收
        answerTerminal = true // T5：done 后停止追加（迟到 answer 帧忽略）
        clearActiveRun() // T4：run 终态即清除 active-run（含 replay 补发的 done——断连期间服务端跑完的收尾闭环）
        break
      }
      case 'error': {
        const retryable = event.payload?.retryable
        error.value = {
          stage: payloadString(event, 'stage') || 'unknown',
          message: payloadString(event, 'message') || '对话出错',
          retryable: retryable === true,
        }
        streaming.value = false
        flushRevealQueues() // R1-N2
        answerTerminal = true // T5：error 后停止追加
        clearActiveRun() // T4：error 终态同清除（服务端已判失败，续看无意义）
        break
      }
      default:
        // tool_call / model.fallback 等 v1 未展示的事件：忽略
        break
    }
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
    const sentThreadId = threadId.value
    controller = streamLgRag(
      { query: content, mode: 'supervisor', ...(sentThreadId ? { threadId: sentThreadId } : {}) },
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
                  : '会话校验未通过，请重新发送（' + transportError.message + '）',
              retryable: true,
            }
          } else {
            // T4：断网/超时 mid-stream —— active-run 已随帧推进保留，错误条 + 「续看」手动接力（不自动重试）
            error.value = {
              stage: transportError.kind,
              message: transportError.message,
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

  function stopStreaming(): void {
    controller?.abort()
    controller = null
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

    streaming.value = true
    answerTerminal = false // T5：replay 接力重置（渲染目标为新建 assistant 消息）
    resetRevealQueues()
    revealSpeedMultiplier = REVEAL_REPLAY_SPEED_MULTIPLIER // R1-N3：replay ≥4× live
    controller = replayLgRag(
      { run_id: run.run_id, after_seq: run.last_seq },
      {
        onEvent: (event) => {
          if (event.event_type === 'done' || event.event_type === 'error') sawTerminal = true
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
                  : '续看请求校验未通过（' + transportError.message + '），请重新提问',
              retryable: false,
            }
          } else {
            // replay 网络错/超时：保留 active-run，可再点「续看」
            error.value = {
              stage: transportError.kind,
              message: transportError.message,
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
          // R1-N4 空流/未完边界：replay 干净结束但未见终态帧 → run 仍在服务端推进；
          // 保留 active-run，提示稍后再试（seq 已推进则提示接力）
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
    loadLatestSession,
    sendMessage,
    stopStreaming,
    startNewSession,
    dismissRestoredNotice,
    dismissResumeNotice,
    resumeFromCursor,
  }
})
