<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'
import { useChatStore } from '../stores/chat'

const chat = useChatStore()
const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

const draft = ref('')
const listEl = ref<HTMLElement | null>(null)

onMounted(() => {
  void chat.loadLatestSession()
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

// T4：手动触发 replay 续看（断连错误条 / 刷新「上次回答未完成」条共用；不自动 replay）
function onResume(): void {
  chat.resumeFromCursor()
}
</script>

<template>
  <div class="chat-page">
    <header class="chat-page__header">
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
      :title="`[${chat.error.stage}] ${chat.error.message}`"
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
    <p v-if="!chat.error && chat.interrupted" class="chat-page__hint">已中断，可修改后重新发送。</p>
    <p v-if="!chat.error && !chat.interrupted && chat.lastDone" class="chat-page__hint">
      完成 · 耗时 {{ chat.lastDone.latency_ms }}ms<template v-if="chat.lastDone.model">
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
</template>

<style scoped>
.chat-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 860px;
  margin: 0 auto;
  padding: 16px 24px;
  box-sizing: border-box;
  background: var(--ops-bg);
  color: var(--ops-text);
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
