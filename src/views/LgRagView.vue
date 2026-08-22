<script setup lang="ts">
import { computed, ref } from 'vue'

import type { LgRagMode } from '../api/lgRag'
import { useLgRagStore } from '../stores/lgRag'

const store = useLgRagStore()

/** 输入草稿：提交前本地校验（query 1..8000），不发请求 */
const draft = ref('')
const threadDraft = ref('')
const modeDraft = ref<LgRagMode>('router')
const formError = ref('')

const QUERY_MAX = 8000

const isIdle = computed(() => !store.loading && !store.result && !store.error)

const isRefuse = computed(() => {
  const r = store.result
  if (!r) return false
  return r.route === 'refuse' || r.chain_meta.gate_action === 'refuse'
})

const hasChainMeta = computed(() => {
  const r = store.result
  if (!r) return false
  const m = r.chain_meta
  return (
    m.gate_action !== '' ||
    m.hit_count > 0 ||
    m.kept_count > 0 ||
    m.best_relevance !== '' ||
    m.grade_count > 0
  )
})

const hasSubtasks = computed(() => (store.result?.subtasks.length ?? 0) > 0)
const hasSubtaskResults = computed(() => (store.result?.subtask_results.length ?? 0) > 0)

const copyFeedback = ref('')

function routeTagType(route: string): 'success' | 'warning' | 'danger' | 'info' {
  if (route === 'rag') return 'success'
  if (route === 'direct') return 'info'
  if (route === 'refuse') return 'danger'
  return 'info'
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2)
}

function onSubmit(): void {
  const q = draft.value.trim()
  if (!q) {
    formError.value = '请输入 query'
    return
  }
  if (q.length > QUERY_MAX) {
    formError.value = `query 超长：${q.length}/${QUERY_MAX}`
    return
  }
  const tid = threadDraft.value.trim()
  if (tid.length > 255) {
    formError.value = 'thread_id 超长（≤255）'
    return
  }
  formError.value = ''
  void store.invoke(q, modeDraft.value, tid)
}

function onRetry(): void {
  const q = (store.query || draft.value).trim()
  if (!q) {
    formError.value = '请输入 query'
    return
  }
  void store.invoke(q, store.mode, store.threadId)
}

function onAbort(): void {
  store.abort()
}

function onUseThreadId(): void {
  store.useThreadId()
  threadDraft.value = store.threadId
}

async function onCopyThreadId(): Promise<void> {
  const id = store.result?.thread_id
  if (!id) return
  try {
    await navigator.clipboard.writeText(id)
    copyFeedback.value = '已复制'
  } catch {
    copyFeedback.value = '复制失败'
  }
}
</script>

<template>
  <div class="lg-rag-page">
    <el-alert
      class="lg-rag-page__boundary"
      type="info"
      :closable="false"
      show-icon
      title="本页 = lg_rag 旁路实验（LangGraph）；Chat = 生产 LangGraph；LC Evidence = LCEL 旁路"
    />

    <el-card class="lg-rag-page__card" shadow="never">
      <el-form @submit.prevent="onSubmit">
        <el-form-item label="Mode">
          <el-radio-group v-model="modeDraft" :disabled="store.loading">
            <el-radio-button value="router">router（默认·推荐）</el-radio-button>
            <el-radio-button value="basic">basic</el-radio-button>
            <el-radio-button value="supervisor">
              supervisor（多智能体拆解·慢，可能 2–4 分钟）
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :error="formError" label="Query">
          <el-input
            v-model="draft"
            type="textarea"
            :rows="4"
            :disabled="store.loading"
            :maxlength="QUERY_MAX"
            show-word-limit
            placeholder="输入问法（1..8000 字）"
          />
          <p v-if="formError" class="lg-rag-page__form-error">{{ formError }}</p>
        </el-form-item>
        <el-form-item label="thread_id（可选，留空 = 新会话）">
          <el-input
            v-model="threadDraft"
            :disabled="store.loading"
            :maxlength="255"
            placeholder="同 thread_id 再发问 = 续写（仅服务进程内有效，重启即丢）"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="store.loading" :disabled="store.loading">
            提交
          </el-button>
          <el-button v-if="store.loading" @click="onAbort">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-alert
      v-if="store.error"
      class="lg-rag-page__error"
      type="error"
      :title="store.error.message || '调用失败'"
      :closable="false"
    >
      <el-button size="small" @click="onRetry">重试</el-button>
    </el-alert>

    <el-empty v-if="isIdle" class="lg-rag-page__empty" description="尚未发起请求" />

    <div v-if="store.loading" class="lg-rag-page__loading" v-loading="true">
      <span>已等待 {{ store.elapsedSeconds }} 秒…</span>
      <p v-if="store.mode === 'supervisor'" class="lg-rag-page__loading-hint">
        多智能体拆解中，复合问题可能需要 2–4 分钟
      </p>
    </div>

    <template v-if="store.result && !store.error">
      <el-alert
        v-if="isRefuse"
        class="lg-rag-page__refuse"
        type="warning"
        :closable="false"
        show-icon
        title="无可用证据（refuse 是正常响应，可换问法重试）"
      />

      <el-card class="lg-rag-page__card lg-rag-page__status" shadow="never">
        <div class="lg-rag-page__meta-row">
          <span>mode</span>
          <el-tag disable-transitions>{{ store.result.mode }}</el-tag>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>route</span>
          <el-tag :type="routeTagType(store.result.route)" disable-transitions>
            {{ store.result.route === '' ? '（空 · basic 正常值）' : store.result.route }}
          </el-tag>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>retry_count</span>
          <strong>{{ store.result.retry_count }}</strong>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>thread_id</span>
          <code class="lg-rag-page__thread-id">{{ store.result.thread_id }}</code>
          <el-button size="small" @click="onCopyThreadId">复制</el-button>
          <span v-if="copyFeedback" class="lg-rag-page__copy-feedback">{{ copyFeedback }}</span>
          <el-button size="small" type="primary" plain @click="onUseThreadId">
            用此 thread_id 继续
          </el-button>
          <span class="lg-rag-page__thread-hint">续写仅在服务进程内有效，重启即丢</span>
        </div>
      </el-card>

      <el-card v-if="hasChainMeta" class="lg-rag-page__card lg-rag-page__chain" shadow="never">
        <h3 class="lg-rag-page__title">chain_meta</h3>
        <div class="lg-rag-page__meta-row">
          <span>gate_action</span>
          <el-tag :type="store.result.chain_meta.gate_action === 'refuse' ? 'danger' : 'success'" disable-transitions>
            {{ store.result.chain_meta.gate_action || '（空）' }}
          </el-tag>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>hit_count</span>
          <strong>{{ store.result.chain_meta.hit_count }}</strong>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>kept_count</span>
          <strong>{{ store.result.chain_meta.kept_count }}</strong>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>best_relevance</span>
          <strong>{{ store.result.chain_meta.best_relevance || '（空）' }}</strong>
        </div>
        <div class="lg-rag-page__meta-row">
          <span>grade_count</span>
          <strong>{{ store.result.chain_meta.grade_count }}</strong>
        </div>
      </el-card>

      <el-card v-if="hasSubtasks" class="lg-rag-page__card" shadow="never">
        <h3 class="lg-rag-page__title">subtasks（supervisor 拆解）</h3>
        <el-collapse>
          <el-collapse-item
            v-for="(subtask, i) in store.result.subtasks"
            :key="i"
            :title="`subtask #${i + 1}`"
            :name="String(i)"
          >
            <pre class="lg-rag-page__json">{{ prettyJson(subtask) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card v-if="hasSubtaskResults" class="lg-rag-page__card" shadow="never">
        <h3 class="lg-rag-page__title">subtask_results</h3>
        <el-collapse>
          <el-collapse-item
            v-for="(subResult, i) in store.result.subtask_results"
            :key="i"
            :title="`subtask_result #${i + 1}`"
            :name="String(i)"
          >
            <pre class="lg-rag-page__json">{{ prettyJson(subResult) }}</pre>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card class="lg-rag-page__card" shadow="never">
        <h3 class="lg-rag-page__title">Answer</h3>
        <pre class="lg-rag-page__answer">{{ store.result.answer }}</pre>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.lg-rag-page {
  max-width: 880px;
}

.lg-rag-page__boundary {
  margin-bottom: 16px;
}

.lg-rag-page__card {
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  margin-bottom: 16px;
}

.lg-rag-page__form-error {
  margin: 8px 0 0;
  color: var(--ops-danger);
}

.lg-rag-page__error,
.lg-rag-page__refuse {
  margin-bottom: 16px;
}

.lg-rag-page__empty {
  padding: 48px 0;
}

.lg-rag-page__loading {
  min-height: 120px;
  color: var(--ops-text-secondary);
}

.lg-rag-page__loading-hint {
  margin: 8px 0 0;
  color: var(--ops-text-secondary);
}

.lg-rag-page__meta-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--ops-text-secondary);
}

.lg-rag-page__meta-row:last-child {
  margin-bottom: 0;
}

.lg-rag-page__thread-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--ops-text);
}

.lg-rag-page__copy-feedback,
.lg-rag-page__thread-hint {
  font-size: 12px;
  color: var(--ops-text-secondary);
}

.lg-rag-page__title {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ops-text);
}

.lg-rag-page__json,
.lg-rag-page__answer {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  color: var(--ops-text);
}

.lg-rag-page__json {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
}
</style>
