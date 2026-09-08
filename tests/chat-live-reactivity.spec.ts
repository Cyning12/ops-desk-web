import { createPinia, setActivePinia } from 'pinia'
import { effect } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { LgRagSseCallbacks } from '../src/composables/useLgRagSse'

vi.mock('../src/api/chat', () => ({
  fetchLatestSession: vi.fn(),
}))

vi.mock('../src/composables/useLgRagSse', () => ({
  streamLgRag: vi.fn(),
  replayLgRag: vi.fn(),
}))

import { fetchLatestSession } from '../src/api/chat'
import { replayLgRag, streamLgRag } from '../src/composables/useLgRagSse'
import { useChatStore } from '../src/stores/chat'
import { REVEAL_TICK_MS } from '../src/composables/useRevealQueue'

const fakeSession = {
  id: 's-1',
  user_id: 'u-1',
  title: 'New Chat',
  created_at: '2026-07-24T01:00:00',
  updated_at: '2026-07-24T01:00:00',
}

let captured: LgRagSseCallbacks

describe('stores/chat · 实流响应式回归（web-fix-chat-live-reactivity）', () => {
  beforeEach(async () => {
    window.localStorage.clear()
    setActivePinia(createPinia())
    vi.clearAllMocks()

    vi.mocked(streamLgRag).mockImplementation((_input, callbacks) => {
      captured = callbacks ?? {}
      return { abort: vi.fn(), done: Promise.resolve() }
    })
    vi.mocked(replayLgRag).mockImplementation(() => ({
      abort: vi.fn(),
      done: Promise.resolve(),
    }))
    vi.mocked(fetchLatestSession).mockResolvedValue(fakeSession)
    const chat = useChatStore()
    await chat.loadLatestSession()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('effect 监听末条消息 thinking/subtasks/content：喂 running+step+answer delta 帧后重跑且读到新值', () => {
    vi.useFakeTimers()
    const chat = useChatStore()
    chat.sendMessage('你好')

    // 快照：thinking 块数 | subtask 块数 | answer content 长度 | subtask[0] content 长度
    const seen: string[] = []
    effect(() => {
      const last = chat.messages[chat.messages.length - 1]
      const subLen = last.subtasks[0]?.content.length ?? 0
      seen.push(`${last.thinking.length}|${last.subtasks.length}|${last.content.length}|${subLen}`)
    })
    expect(seen).toEqual(['0|0|0|0'])

    captured.onEvent?.({
      event_type: 'node.progress',
      agent_role: 'intent',
      payload: { summary: '意图识别完成' },
    })
    captured.onEvent?.({
      event_type: 'subtask.progress',
      agent_role: 'rag_subtask',
      payload: { status: 'running', subtask_id: 'st-1', type: 'rag' },
    })
    captured.onEvent?.({
      event_type: 'subtask.progress',
      agent_role: 'rag_subtask',
      payload: { status: 'step', subtask_id: 'st-1', step: 'retrieve', action: 'start' },
    })
    captured.onEvent?.({
      event_type: 'answer',
      agent_role: 'aggregator',
      payload: { delta: '一二三四五六' },
    })
    vi.advanceTimersByTime(REVEAL_TICK_MS)

    // effect 必须随每类突变重跑（修复前 raw 突变绕过响应式 → seen 恒为初始快照）
    expect(seen.length).toBeGreaterThanOrEqual(4)
    expect(seen.some((s) => s.startsWith('1|'))).toBe(true) // thinking 入列被观测
    expect(seen.some((s) => s.split('|')[1] === '1')).toBe(true) // subtask 入列被观测
    const stepContentLen = chat.messages[1].subtasks[0].content.length
    expect(seen.some((s) => s === `1|1|0|${stepContentLen}`)).toBe(true) // step 替换被观测
    // answer delta 出队 tick 后 content 增长被观测（每 tick 3 字）
    expect(chat.messages[1].content).toBe('一二三')
    expect(seen[seen.length - 1]).toBe(`1|1|3|${stepContentLen}`)
  })

  it('R1-N1：done 帧带 subtask_result.output → fake timers 逐 tick，effect 观测 block content 单调增长且终态 == output', () => {
    vi.useFakeTimers()
    const chat = useChatStore()
    chat.sendMessage('你好')
    const output = '这是一段足够长的子任务输出文本，用于打字机渐显的响应式观测。'

    captured.onEvent?.({
      event_type: 'subtask.progress',
      agent_role: 'rag_subtask',
      payload: {
        status: 'done',
        subtask_id: 'st-1',
        subtask_result: JSON.stringify({ id: 'st-1', output, hits: 2 }),
      },
    })

    const lengths: number[] = []
    effect(() => {
      const block = chat.messages[chat.messages.length - 1]?.subtasks[0]
      if (block) lengths.push(block.content.length)
    })
    expect(lengths).toEqual([0])

    for (let i = 0; i < 200 && chat.messages[1].subtasks[0].content.length < output.length; i++) {
      vi.advanceTimersByTime(REVEAL_TICK_MS)
    }

    // 修复前 reveal 闭包直写 raw block → effect 零重跑（lengths 恒 [0]）
    expect(lengths.length).toBeGreaterThan(2)
    for (let i = 1; i < lengths.length; i++) {
      expect(lengths[i]).toBeGreaterThanOrEqual(lengths[i - 1])
    }
    expect(lengths.some((n) => n > 0 && n < output.length)).toBe(true) // 观测到严格中间态
    expect(lengths[lengths.length - 1]).toBe(output.length)
    expect(chat.messages[1].subtasks[0].content).toBe(output)
    expect(chat.messages[1].subtasks[0].revealing).toBe(false)
  })
})
