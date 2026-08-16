<script setup lang="ts">
import { computed, ref } from 'vue'

import { useLcEvidenceStore } from '../stores/lcEvidence'

const store = useLcEvidenceStore()

/** 输入草稿：提交前校验空 query，不发请求 */
const draft = ref('')
const formError = ref('')

const isIdle = computed(() => !store.loading && !store.result && !store.error)

const showPartialHint = computed(() => {
  const current = store.result
  if (!current) return false
  if (current.meta.gate_action !== 'answer_partial') return false
  return !current.answer.includes('仅部分证据')
})

const isRefuse = computed(() => store.result?.meta.gate_action === 'refuse')

function relevanceTagType(relevance: string): 'success' | 'warning' | 'info' | 'danger' {
  if (relevance === 'exact') return 'success'
  if (relevance === 'related') return 'warning'
  if (relevance === 'weak') return 'info'
  return 'danger'
}

function gateTagType(action: string): 'success' | 'warning' | 'danger' {
  if (action === 'answer') return 'success'
  if (action === 'answer_partial') return 'warning'
  return 'danger'
}

function onSubmit(): void {
  const q = draft.value.trim()
  if (!q) {
    formError.value = '请输入 query'
    return
  }
  formError.value = ''
  void store.invoke(q)
}

function onRetry(): void {
  const q = (store.query || draft.value).trim()
  if (!q) {
    formError.value = '请输入 query'
    return
  }
  void store.invoke(q)
}

function onAbort(): void {
  store.abort()
}
</script>

<template>
  <div class="lc-evidence-page">
    <el-alert
      class="lc-evidence-page__boundary"
      type="info"
      :closable="false"
      show-icon
      title="本页 = LangChain 旁路实验；Chat = 生产 LangGraph"
    />

    <el-card class="lc-evidence-page__card" shadow="never">
      <el-form @submit.prevent="onSubmit">
        <el-form-item :error="formError" label="Query">
          <el-input
            v-model="draft"
            type="textarea"
            :rows="4"
            :disabled="store.loading"
            placeholder="输入检索问法"
          />
          <p v-if="formError" class="lc-evidence-page__form-error">{{ formError }}</p>
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
      class="lc-evidence-page__error"
      type="error"
      :title="store.error.message || '调用失败'"
      :closable="false"
    >
      <el-button size="small" @click="onRetry">重试</el-button>
    </el-alert>

    <el-empty v-if="isIdle" class="lc-evidence-page__empty" description="尚未发起检索" />

    <div v-if="store.loading" class="lc-evidence-page__loading" v-loading="true">
      <span>正在检索与打分…</span>
    </div>

    <template v-if="store.result && !store.error">
      <el-alert
        v-if="isRefuse"
        class="lc-evidence-page__refuse"
        type="warning"
        :closable="false"
        show-icon
        title="无可用证据"
      />
      <el-alert
        v-else-if="showPartialHint"
        class="lc-evidence-page__partial"
        type="warning"
        :closable="false"
        title="仅部分证据可用于作答"
      />

      <el-card class="lc-evidence-page__card lc-evidence-page__meta" shadow="never">
        <div class="lc-evidence-page__meta-row">
          <span>gate_action</span>
          <el-tag :type="gateTagType(store.result.meta.gate_action)" disable-transitions>
            {{ store.result.meta.gate_action }}
          </el-tag>
        </div>
        <div class="lc-evidence-page__meta-row">
          <span>best_relevance</span>
          <el-tag :type="relevanceTagType(store.result.meta.best_relevance)" disable-transitions>
            {{ store.result.meta.best_relevance }}
          </el-tag>
        </div>
        <div class="lc-evidence-page__meta-row">
          <span>kept_count</span>
          <strong>{{ store.result.meta.kept_count }}</strong>
        </div>
      </el-card>

      <el-card
        v-for="item in store.result.evidence"
        :key="item.id"
        class="lc-evidence-page__card lc-evidence-page__evidence"
        shadow="never"
      >
        <div class="lc-evidence-page__evidence-head">
          <span class="lc-evidence-page__anchor">{{ item.anchor }}</span>
          <el-tag :type="relevanceTagType(item.grade.relevance)" disable-transitions>
            {{ item.grade.relevance }}
          </el-tag>
        </div>
        <h3 class="lc-evidence-page__title">{{ item.title ?? '（无标题）' }}</h3>
        <el-collapse :model-value="[String(item.id)]">
          <el-collapse-item title="snippet / reason" :name="String(item.id)">
            <p class="lc-evidence-page__snippet">{{ item.snippet }}</p>
            <p class="lc-evidence-page__reason">{{ item.grade.reason }}</p>
          </el-collapse-item>
        </el-collapse>
      </el-card>

      <el-card class="lc-evidence-page__card" shadow="never">
        <h3 class="lc-evidence-page__title">Answer</h3>
        <pre class="lc-evidence-page__answer">{{ store.result.answer }}</pre>
      </el-card>
    </template>
  </div>
</template>

<style scoped>
.lc-evidence-page {
  max-width: 880px;
}

.lc-evidence-page__boundary {
  margin-bottom: 16px;
}

.lc-evidence-page__card {
  background: var(--ops-bg-paper);
  border: 1px solid var(--ops-border);
  margin-bottom: 16px;
}

.lc-evidence-page__form-error {
  margin: 8px 0 0;
  color: var(--ops-danger);
}

.lc-evidence-page__error,
.lc-evidence-page__refuse,
.lc-evidence-page__partial {
  margin-bottom: 16px;
}

.lc-evidence-page__empty {
  padding: 48px 0;
}

.lc-evidence-page__loading {
  min-height: 120px;
  color: var(--ops-text-secondary);
}

.lc-evidence-page__meta {
  display: block;
}

.lc-evidence-page__meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  color: var(--ops-text-secondary);
}

.lc-evidence-page__meta-row:last-child {
  margin-bottom: 0;
}

.lc-evidence-page__evidence-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.lc-evidence-page__anchor {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  color: var(--ops-text-secondary);
}

.lc-evidence-page__title {
  margin: 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--ops-text);
}

.lc-evidence-page__snippet,
.lc-evidence-page__reason {
  margin: 0 0 8px;
  white-space: pre-wrap;
  color: var(--ops-text);
}

.lc-evidence-page__answer {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  color: var(--ops-text);
}
</style>
