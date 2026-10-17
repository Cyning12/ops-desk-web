<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import HitlApprovalCard from '../components/chat/HitlApprovalCard.vue'
import ChatHistoryPanel from '../components/chat-history/ChatHistoryPanel.vue'
import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'
import { localizeErrorStage } from '../stores/httpErrorI18n'

const chat = useChatStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const draft = ref('')
const listEl = ref<HTMLElement | null>(null)
// F1（裁定 F-B）：历史侧栏内嵌 Chat 页 · 可折叠 · 默认收起（单列 860px 布局最小增量）
const historyOpen = ref(false)

onMounted(() => {
  void chat.loadLatestSession()
  // F1/D1-1（web-hitl-decision-surface）：进入 Chat 页一次性 pending 核对（第三消费点 · 承 done task AC16①/② · S1 事件驱动零定时器）
  void chat.refreshHitlPending()
})

onBeforeUnmount(() => {
  chat.stopStreaming()
})

// SSE 流 401 时 store 已清空本地会话；这里负责跳登录（对齐 axios 拦截器语义）
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (!loggedIn) {
      void router.push({ path: '/login', query: { redirect: route.fullPath } })
    }
  },
)

// 消息增长时滚动到底部
watch(
  () => {
    const last = chat.messages[chat.messages.length - 1]
    return (
      chat.messages.length +
      (last
        ? last.content.length + last.thinking.length + last.subtasks.length
        : 0)
    )
  },
  async () => {
    await nextTick()
    listEl.value?.scrollTo({ top: listEl.value.scrollHeight })
  },
)

function onSend(): void {
  chat.sendMessage(draft.value)
  if (!chat.streaming) return
  draft.value = ''
}

function onStop(): void {
  chat.stopStreaming()
}

function onNewSession(): void {
  chat.startNewSession()
}

// F1/D1-3：pending 手动刷新最小入口（单行提示 + 刷新钮 · 非全局面板 · 不轮询）
function onRefreshPending(): void {
  void chat.refreshHitlPending()
}

// T4：手动触发 replay 续看（断连错误条 / 刷新「上次回答未完成」条共用；不自动 replay）
function onResume(): void {
  chat.resumeFromCursor()
}

// D3：失败/中止后「继续回复」= 同 thread 新 stream（≠ 续看 replay · ≠ HITL resume）
function onContinueReply(message: (typeof chat.messages)[number]): void {
  chat.continueReply(message)
}

// F1：点击历史条目 → B1 history 加载渲染 + waiting_approval thread 续看挂起（store 内闭环）
function onSelectHistory(threadId: string): void {
  void chat.openHistoryThread(threadId)
}

function onToggleHistory(): void {
  historyOpen.value = !historyOpen.value
}
</script>

<template>
  <div class="chat-page">
    <aside v-if="historyOpen" class="chat-page__sidebar">
      <ChatHistoryPanel @select="onSelectHistory" />
    </aside>

    <div class="chat-page__main">
      <header class="chat-page__header">
        <el-button
          class="chat-page__history-toggle"
          size="small"
          text
          data-test="history-toggle"
          @click="onToggleHistory"
        >
          {{ historyOpen ? '收起历史' : '历史' }}
        </el-button>
        <h1 class="chat-page__title">Chat</h1>
        <p v-if="chat.session" class="chat-page__session">
          {{ chat.session.title || 'New Chat' }}
          <span class="chat-page__session-id">#{{ chat.session.id }}</span>
        </p>
        <p v-else-if="chat.sessionLoading" class="chat-page__session">加载会话中…</p>
        <span v-if="chat.threadId" class="chat-page__thread-id" :title="chat.threadId">
          thread {{ chat.threadId.slice(0, 8) }}
        </span>
        <el-button class="chat-page__new-session" size="small" plain @click="onNewSession">
          新会话
        </el-button>
      </header>

    <el-alert
      v-if="chat.restoredNotice"
      class="chat-page__alert"
      type="info"
      show-icon
      title="已恢复上次会话上下文（历史消息不回显）"
      @close="chat.dismissRestoredNotice()"
    />

    <el-alert
      v-if="chat.resumeNotice && chat.activeRun"
      class="chat-page__alert"
      type="warning"
      show-icon
      title="上次回答未完成"
      @close="chat.dismissResumeNotice()"
    >
      <div class="chat-page__alert-body">
        <span>断线前的回答可从中断处继续查看</span>
        <el-button size="small" plain :disabled="chat.streaming" @click="onResume">
          续看
        </el-button>
      </div>
    </el-alert>

    <el-alert
      v-if="chat.sessionError"
      class="chat-page__alert"
      type="error"
      :title="`获取会话失败：${chat.sessionError}`"
      :closable="false"
      show-icon
    />

    <el-alert
      v-if="chat.historyError"
      class="chat-page__alert"
      type="warning"
      show-icon
      :title="chat.historyError"
      data-test="history-error"
      @close="chat.historyError = null"
    />

    <div ref="listEl" class="chat-page__messages">
      <p v-if="!chat.messages.length" class="chat-page__empty">
        向 Ops Desk 提问，例如「#545 这个 issue 在说什么？」
      </p>

      <div
        v-for="message in chat.messages"
        :key="message.id"
        class="chat-message"
        :class="`chat-message--${message.role}`"
      >
        <div class="chat-message__bubble">
          <template v-if="message.role === 'assistant'">
            <el-collapse
              v-if="message.thinking.length || message.subtasks.length"
              class="chat-message__thinking"
            >
              <el-collapse-item v-if="message.thinking.length" title="编排进度" name="thinking">
                <div
                  v-for="(block, index) in message.thinking"
                  :key="`t-${index}`"
                  class="chat-message__thinking-block"
                >
                  <span class="chat-message__thinking-role">{{ block.role }}</span>
                  <span class="chat-message__thinking-text">{{ block.content }}</span>
                </div>
              </el-collapse-item>
              <el-collapse-item v-if="message.subtasks.length" title="子任务过程" name="subtasks">
                <div
                  v-for="(block, index) in message.subtasks"
                  :key="block.id ?? `s-${index}`"
                  class="chat-message__thinking-block"
                  :class="{
                    'chat-message__thinking-block--running': block.status === 'running',
                  }"
                >
                  <span class="chat-message__thinking-role">{{ block.role }}</span>
                  <span
                    v-if="block.status === 'running'"
                    class="chat-message__thinking-status"
                    >执行中</span
                  >
                  <span
                    class="chat-message__thinking-text"
                    :class="{
                      'chat-message__thinking-text--revealing': block.revealing,
                    }"
                    >{{ block.content }}</span
                  >
                </div>
              </el-collapse-item>
            </el-collapse>
            <span
              v-if="message.content"
              class="chat-message__text"
              :class="{
                'chat-message__text--streaming':
                  chat.streaming && message.id === chat.messages[chat.messages.length - 1]?.id,
              }"
              >{{ message.content }}</span
            >
            <span
              v-else-if="chat.streaming && (message.thinking.length || message.subtasks.length)"
              class="chat-message__pending"
              >子任务执行中…</span
            >
            <span v-else-if="chat.streaming" class="chat-message__pending">处理中…</span>
            <p
              v-if="message.runTerminalStatus === 'running'"
              class="chat-message__run-status"
              data-test="run-status-running"
            >
              生成中…
            </p>
            <p
              v-else-if="message.runTerminalStatus === 'error' || message.runTerminalStatus === 'disconnected'"
              class="chat-message__run-status chat-message__run-status--failed"
              data-test="run-status-failed"
            >
              {{ message.runTerminalStatus === 'disconnected' ? '已中止' : '生成失败' }}
            </p>
            <el-button
              v-if="message.allowContinueReply"
              size="small"
              plain
              class="chat-message__continue-reply"
              data-test="continue-reply"
              :disabled="chat.streaming"
              @click="onContinueReply(message)"
            >
              继续回复
            </el-button>
            <p v-if="message.truncated" class="chat-message__truncated" data-test="answer-truncated">
              内容过长已截断
            </p>
            <HitlApprovalCard v-if="message.hitl" :message="message" />
          </template>
          <span v-else class="chat-message__text">{{ message.content }}</span>
        </div>
      </div>
    </div>

    <el-alert
      v-if="chat.error"
      class="chat-page__alert"
      type="error"
      show-icon
      :closable="false"
      :title="`[${localizeErrorStage(chat.error.stage)}] ${chat.error.message}`"
    >
      <div class="chat-page__alert-body">
        <span>{{
          chat.canResume
            ? '连接中断，已收到的内容不会丢失'
            : chat.error.retryable
              ? '可重试：请重新发送消息'
              : '不可重试，请联系管理员'
        }}</span>
        <el-button v-if="chat.canResume" size="small" plain @click="onResume">续看</el-button>
      </div>
    </el-alert>
    <p v-if="chat.resumeHint" class="chat-page__hint">{{ chat.resumeHint }}</p>
    <p v-if="chat.hitlPendingError" class="chat-page__hint" data-test="hitl-pending-error">
      {{ chat.hitlPendingError }}
    </p>
    <p v-if="chat.hitlPending.length" class="chat-page__hint" data-test="hitl-pending-hint">
      待审批 {{ chat.hitlPending.length }} 条
      <el-button size="small" plain data-test="hitl-pending-refresh" @click="onRefreshPending">
        刷新
      </el-button>
    </p>
    <p v-if="!chat.error && chat.interrupted" class="chat-page__hint">已中断，可修改后重新发送。</p>
    <p v-if="!chat.error && !chat.interrupted && chat.lastDone" class="chat-page__hint">
      完成 · 耗时 {{ chat.lastDone.latency_ms === null ? '—' : `${chat.lastDone.latency_ms}ms` }}<template v-if="chat.lastDone.model">
        · 模型 {{ chat.lastDone.model }}</template
      >
    </p>

    <footer class="chat-page__composer">
      <el-input
        v-model="draft"
        type="textarea"
        :rows="2"
        resize="none"
        placeholder="输入消息，Enter 发送（Shift+Enter 换行）"
        :disabled="!chat.session || chat.streaming"
        @keydown.enter.exact.prevent="onSend"
      />
      <el-button
        v-if="chat.streaming"
        class="chat-page__send"
        type="danger"
        plain
        @click="onStop"
      >
        停止
      </el-button>
      <el-button
        v-else
        class="chat-page__send"
        type="primary"
        :disabled="!chat.session || !draft.trim()"
        @click="onSend"
      >
        发送
      </el-button>
    </footer>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: var(--ops-bg);
  color: var(--ops-text);
}

/* F1（裁定 F-B）：内嵌历史侧栏（可折叠 · 不新开路由） */
.chat-page__sidebar {
  flex: none;
  width: 240px;
  padding: 16px 12px;
  border-right: 1px solid rgba(44, 44, 44, 0.1);
  overflow-y: auto;
  box-sizing: border-box;
}

.chat-page__main {
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 16px 24px;
  box-sizing: border-box;
}

.chat-page__header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex: none;
}

.chat-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.chat-page__session {
  margin: 0;
  font-size: 13px;
  opacity: 0.7;
}

.chat-page__session-id {
  font-family: monospace;
  font-size: 12px;
  opacity: 0.7;
}

.chat-page__thread-id {
  font-family: monospace;
  font-size: 12px;
  opacity: 0.55;
}

.chat-page__new-session {
  flex: none;
  margin-left: auto;
}

.chat-page__alert {
  margin-top: 12px;
  flex: none;
}

.chat-page__alert-body {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chat-page__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-page__empty {
  margin: auto;
  font-size: 13px;
  opacity: 0.5;
}

.chat-message {
  display: flex;
}

.chat-message--user {
  justify-content: flex-end;
}

.chat-message__bubble {
  max-width: 78%;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--ops-bg-paper, #fff);
  border: 1px solid rgba(44, 44, 44, 0.08);
  font-size: 14px;
  line-height: 1.6;
}

.chat-message--user .chat-message__bubble {
  background: rgba(44, 44, 44, 0.06);
}

.chat-message__text {
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message__pending {
  font-size: 13px;
  opacity: 0.6;
}

/* F1 · 历史 answer 截断标记（上游 answer_truncated · AC6） */
.chat-message__truncated {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.55;
  font-style: italic;
}

/* D3 · terminal_status 轻量徽标 +「继续回复」（≠「续看」） */
.chat-message__run-status {
  margin: 6px 0 0;
  font-size: 12px;
  opacity: 0.7;
}

.chat-message__run-status--failed {
  color: var(--el-color-danger);
  opacity: 0.85;
}

.chat-message__continue-reply {
  margin-top: 8px;
}

/* T5 打字机光标态（R1-N4 内决 · 最小 UI 增量）：streaming 中最新 assistant 气泡尾随闪烁光标 */
.chat-message__text--streaming::after {
  content: '▍';
  margin-left: 1px;
  opacity: 0.55;
  animation: chat-cursor-blink 1s steps(1) infinite;
}

@keyframes chat-cursor-blink {
  50% {
    opacity: 0;
  }
}

.chat-message__thinking {
  margin-bottom: 8px;
  border: none;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-content-bg-color: transparent;
}

.chat-message__thinking-block {
  font-size: 12px;
  opacity: 0.75;
  margin-bottom: 6px;
}

.chat-message__thinking-block--running {
  opacity: 1;
}

.chat-message__thinking-role {
  font-family: monospace;
  margin-right: 6px;
  opacity: 0.7;
}

.chat-message__thinking-status {
  margin-right: 6px;
  font-size: 11px;
  opacity: 0.85;
}

.chat-message__thinking-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* progressive-reveal：子任务 output 渐显光标（沿用 T5 思路） */
.chat-message__thinking-text--revealing::after {
  content: '▍';
  margin-left: 1px;
  opacity: 0.55;
  animation: chat-cursor-blink 1s steps(1) infinite;
}

.chat-page__hint {
  flex: none;
  margin: 4px 0 0;
  font-size: 12px;
  opacity: 0.6;
}

.chat-page__composer {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding-top: 8px;
}

.chat-page__send {
  flex: none;
}
</style>
