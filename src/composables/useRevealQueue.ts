/**
 * 客户端 reveal 队列（progressive-reveal · 非新 SSE）：
 * 网络缓冲 received 与展示前缀分离；出队速率为单一可测常量。
 */

/** 匀速出队速率（字/秒）· R1-N1 锁死 */
export const REVEAL_CHARS_PER_SECOND = 60

/** 定时器间隔（ms） */
export const REVEAL_TICK_MS = 50

/** 每 tick 出队字数：60 × 50/1000 = 3 */
export const REVEAL_CHARS_PER_TICK = Math.max(
  1,
  Math.round((REVEAL_CHARS_PER_SECOND * REVEAL_TICK_MS) / 1000),
)

/** replay 相对 live 的默认加速倍数（≥4× · R1-N3） */
export const REVEAL_REPLAY_SPEED_MULTIPLIER = 4

export type RevealSink = (displayed: string) => void

/**
 * 双缓冲 reveal：enqueue 只扩 received；定时器按常量把前缀推到 sink。
 * 禁止发明未到达字符（shownLen ≤ received.length）。
 */
export class RevealQueue {
  private received = ''
  private shownLen = 0
  private timer: ReturnType<typeof setInterval> | null = null
  private speedMultiplier = 1
  private readonly sink: RevealSink

  constructor(sink: RevealSink) {
    this.sink = sink
  }

  get receivedText(): string {
    return this.received
  }

  get displayedText(): string {
    return this.received.slice(0, this.shownLen)
  }

  get receivedLength(): number {
    return this.received.length
  }

  get displayedLength(): number {
    return this.shownLen
  }

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = Math.max(1, multiplier)
  }

  /** 入队网络缓冲；同 tick 多段亦不瞬满展示态 */
  enqueue(chunk: string): void {
    if (!chunk) return
    this.received += chunk
    this.ensureTimer()
  }

  /** 终帧/整段：取消队列并以终稿替换（T5 替换语义） */
  replace(text: string): void {
    this.clearTimer()
    this.received = text
    this.shownLen = text.length
    this.sink(text)
  }

  /** done/error/abort：停定时器并刷齐已收缓冲（R1-N2） */
  flush(): void {
    this.clearTimer()
    this.shownLen = this.received.length
    this.sink(this.received)
  }

  stop(): void {
    this.clearTimer()
  }

  reset(): void {
    this.clearTimer()
    this.received = ''
    this.shownLen = 0
  }

  private charsPerTick(): number {
    return Math.max(1, Math.round(REVEAL_CHARS_PER_TICK * this.speedMultiplier))
  }

  private ensureTimer(): void {
    if (this.timer !== null) return
    if (this.shownLen >= this.received.length) return
    this.timer = setInterval(() => this.tick(), REVEAL_TICK_MS)
  }

  private tick(): void {
    if (this.shownLen >= this.received.length) {
      this.clearTimer()
      return
    }
    this.shownLen = Math.min(this.received.length, this.shownLen + this.charsPerTick())
    this.sink(this.received.slice(0, this.shownLen))
    if (this.shownLen >= this.received.length) {
      this.clearTimer()
    }
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }
}
