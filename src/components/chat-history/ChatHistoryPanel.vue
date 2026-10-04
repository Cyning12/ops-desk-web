<script setup lang="ts">
/**
 * F1 · 历史会话侧栏面板（裁定 F-B · Chat 页内嵌 · web-chat-history-hitl-ux）。
 * B1 只读契约承接：threads 列表（标题 / 末活动时间 / run 数 / latest_run_status 徽标）+
 * cursor 分页「加载更多」（不重不漏 · FP-F9）；点击条目 emit select → ChatView 调 store
 * openHistoryThread 加载历史并续看。
 * 降级：空态「暂无历史会话」（FP-F6）；title 空 → run_id 前缀+时间兜底；
 * 404/501/网络错 → 「历史服务暂不可用」（FP-F8 · 不阻塞 Chat 主路径）；401 走全局跳登录。
 */
import { onMounted, ref } from 'vue'

import { fetchChatThreads } from '../../api/chatHistory'
import type { ChatThreadItem } from '../../api/chatHistory'
import type { ApiError } from '../../api/http'

const emit = defineEmits<{ select: [threadId: string] }>()

const threads = ref<ChatThreadItem[]>([])
const nextCursor = ref<string | null>(null)
const loading = ref(false)
const loadingMore = ref(false)
/** FP-F8 降级文案（端点未上线 / 网络错）；null = 正常 */
const unavailable = ref<string | null>(null)

function toUnavailableMessage(err: unknown): string {
  const apiError = err as ApiError
  // 401 由 http.ts 拦截器全局跳登录，本面板不额外呈现
  if (apiError.status === 401) return ''
  return '历史服务暂不可用'
}

async function loadFirst(): Promise<void> {
  if (loading.value) return
  loading.value = true
  unavailable.value = null
  try {
    const page = await fetchChatThreads()
    threads.value = page.threads
    nextCursor.value = page.next_cursor
  } catch (err) {
    const message = toUnavailableMessage(err)
    if (message) unavailable.value = message
  } finally {
    loading.value = false
  }
}

/** FP-F9：cursor 分页「加载更多」拼接不重不漏（按 thread_id 去重） */
async function loadMore(): Promise<void> {
  if (loadingMore.value || !nextCursor.value) return
  loadingMore.value = true
  try {
    const page = await fetchChatThreads({ cursor: nextCursor.value })
    const seen = new Set(threads.value.map((thread) => thread.thread_id))
    for (const thread of page.threads) {
      if (seen.has(thread.thread_id)) continue
      seen.add(thread.thread_id)
      threads.value.push(thread)
    }
    nextCursor.value = page.next_cursor
  } catch (err) {
    const message = toUnavailableMessage(err)
    if (message) unavailable.value = message
  } finally {
    loadingMore.value = false
  }
}

/** FP-F6：title 空 → run_id 前缀+时间兜底（承服务端 FP-4 再兜底 · 不崩） */
function displayTitle(thread: ChatThreadItem): string {
  const title = typeof thread.title === 'string' ? thread.title.trim() : ''
  if (title) return title
  return `run ${thread.thread_id.slice(0, 8)} · ${thread.last_activity_at}`
}

function onSelect(thread: ChatThreadItem): void {
  emit('select', thread.thread_id)
}

onMounted(() => {
  void loadFirst()
})
</script>

<template>
  <div class="chat-history" data-test="chat-history-panel">
    <div class="chat-history__header">
      <span class="chat-history__title">历史会话</span>
      <el-button size="small" text :disabled="loading" @click="loadFirst">刷新</el-button>
    </div>

    <p v-if="unavailable" class="chat-history__unavailable" data-test="chat-history-unavailable">
      {{ unavailable }}
    </p>
    <p v-else-if="loading" class="chat-history__empty">加载中…</p>
    <p v-else-if="!threads.length" class="chat-history__empty" data-test="chat-history-empty">
      暂无历史会话
    </p>

    <ul v-else class="chat-history__list">
      <li
        v-for="thread in threads"
        :key="thread.thread_id"
        class="chat-history__item"
        data-test="chat-history-item"
        @click="onSelect(thread)"
      >
        <div class="chat-history__item-head">
          <span class="chat-history__item-title">{{ displayTitle(thread) }}</span>
          <span
            v-if="thread.latest_run_status === 'waiting_approval'"
            class="chat-history__badge"
            data-test="chat-history-badge"
            >待审批</span
          >
        </div>
        <div class="chat-history__item-meta">
          <span>{{ thread.last_activity_at }}</span>
          <span>· {{ thread.run_count }} run</span>
        </div>
      </li>
    </ul>

    <el-button
      v-if="nextCursor && !unavailable"
      class="chat-history__more"
      size="small"
      plain
      :loading="loadingMore"
      data-test="chat-history-more"
      @click="loadMore"
    >
      加载更多
    </el-button>
  </div>
</template>

<style scoped>
.chat-history {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-size: 13px;
}

.chat-history__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: none;
  padding-bottom: 8px;
}

.chat-history__title {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.chat-history__empty,
.chat-history__unavailable {
  margin: 24px 0;
  text-align: center;
  opacity: 0.55;
}

.chat-history__unavailable {
  opacity: 0.75;
}

.chat-history__list {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.chat-history__item {
  padding: 8px 10px;
  border: 1px solid rgba(44, 44, 44, 0.1);
  border-radius: 6px;
  background: var(--ops-bg-paper, #fff);
  cursor: pointer;
}

.chat-history__item:hover {
  border-color: rgba(44, 44, 44, 0.3);
}

.chat-history__item-head {
  display: flex;
  align-items: center;
  gap: 6px;
}

.chat-history__item-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-history__badge {
  flex: none;
  padding: 0 6px;
  border-radius: 4px;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
}

.chat-history__item-meta {
  margin-top: 4px;
  font-size: 11px;
  opacity: 0.55;
  display: flex;
  gap: 6px;
}

.chat-history__more {
  flex: none;
  margin-top: 8px;
}
</style>
