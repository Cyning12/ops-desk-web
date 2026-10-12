<script setup lang="ts">
/**
 * F2 · 消息流内联 HITL 审批卡片（裁定 F-A · web-chat-history-hitl-ux）。
 * live hitl.waiting 帧 / replay / 历史 waiting_approval run 三入口同一渲染形态零分叉。
 * 动作链：批准/驳回 → store decideHitl（POST decide → 成功 → POST resume · 契约两步链式）。
 * T-W2：decide 可选键 resume_mode 三选（inherit/immediate/manual · 默认 inherit 不送键 ·
 * 后端 router.py:184 白名单兜底 400 · 前端不臆造第四值）。
 */
import { ref } from 'vue'
import { useChatStore } from '../../stores/chat'
import type { ChatMessage } from '../../stores/chat'
import type { HitlDecision, HitlResumeMode } from '../../api/hitl'

const props = defineProps<{ message: ChatMessage }>()

const chat = useChatStore()

// T-W2：decide 卡片 resume_mode 三选（默认 inherit = 跟随后端全局 env · 不送键）
const resumeMode = ref<HitlResumeMode>('inherit')

function onDecide(requestId: string, decision: HitlDecision): void {
  void chat.decideHitl(props.message, requestId, decision, resumeMode.value)
}

// FP-F7：decide+resume 成功后卡片保持可再触发「续看推进」（走既有 resumeFromCursor · 不新造机制）
function onResume(): void {
  chat.resumeFromCursor()
}
</script>

<template>
  <div
    v-if="message.hitl"
    class="hitl-card"
    :class="`hitl-card--${message.hitl.status}`"
    data-test="hitl-card"
  >
    <div class="hitl-card__header">
      <span class="hitl-card__title">人工审批</span>
      <span v-if="message.hitl.status === 'waiting'" class="hitl-card__badge">待审批</span>
    </div>
    <p v-if="message.hitl.reason" class="hitl-card__reason">{{ message.hitl.reason }}</p>
    <ul v-if="message.hitl.requests.length" class="hitl-card__requests">
      <li v-for="(request, index) in message.hitl.requests" :key="request.id || `req-${index}`">
        申请 <code class="hitl-card__request-id">{{ request.id || '（无 id）' }}</code>
      </li>
    </ul>

    <el-radio-group
      v-if="message.hitl.status === 'waiting'"
      v-model="resumeMode"
      size="small"
      class="hitl-card__resume-mode"
      data-test="hitl-resume-mode"
      :disabled="chat.streaming"
    >
      <el-radio-button value="inherit">续跑默认</el-radio-button>
      <el-radio-button value="immediate">批准即续跑</el-radio-button>
      <el-radio-button value="manual">手动续跑</el-radio-button>
    </el-radio-group>
    <div v-if="message.hitl.status === 'waiting'" class="hitl-card__actions">
      <el-button
        class="hitl-card__approve"
        size="small"
        type="primary"
        :disabled="chat.streaming"
        @click="onDecide(message.hitl.requests.find((r) => r.id)?.id ?? '', 'approved')"
      >
        批准
      </el-button>
      <el-button
        class="hitl-card__reject"
        size="small"
        type="danger"
        plain
        :disabled="chat.streaming"
        @click="onDecide(message.hitl.requests.find((r) => r.id)?.id ?? '', 'rejected')"
      >
        驳回
      </el-button>
    </div>
    <p v-else-if="message.hitl.status === 'acting'" class="hitl-card__note">提交审批中…</p>
    <template v-else>
      <p class="hitl-card__note">{{ message.hitl.note }}</p>
      <el-button
        v-if="message.hitl.status === 'decided' && chat.canResume"
        class="hitl-card__resume"
        size="small"
        plain
        @click="onResume"
      >
        续看推进
      </el-button>
    </template>
  </div>
</template>

<style scoped>
.hitl-card {
  margin-top: 8px;
  padding: 10px 12px;
  border: 1px solid rgba(230, 162, 60, 0.55);
  border-left: 3px solid #e6a23c;
  border-radius: 6px;
  background: rgba(230, 162, 60, 0.08);
  font-size: 13px;
  line-height: 1.6;
}

.hitl-card--decided {
  border-color: rgba(103, 194, 58, 0.5);
  border-left-color: #67c23a;
  background: rgba(103, 194, 58, 0.07);
}

.hitl-card--resolved,
.hitl-card--forbidden,
.hitl-card--unavailable {
  border-color: rgba(44, 44, 44, 0.18);
  border-left-color: rgba(44, 44, 44, 0.35);
  background: rgba(44, 44, 44, 0.04);
}

.hitl-card__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hitl-card__title {
  font-weight: 600;
  letter-spacing: 0.04em;
}

.hitl-card__badge {
  padding: 0 6px;
  border-radius: 4px;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  line-height: 18px;
}

.hitl-card__reason {
  margin: 6px 0 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.hitl-card__requests {
  margin: 6px 0 0;
  padding-left: 18px;
}

.hitl-card__request-id {
  font-family: monospace;
  font-size: 12px;
  opacity: 0.85;
}

.hitl-card__actions {
  margin-top: 8px;
  display: flex;
  gap: 8px;
}

.hitl-card__resume-mode {
  margin-top: 8px;
}

.hitl-card__note {
  margin: 6px 0 0;
  opacity: 0.75;
}

.hitl-card__resume {
  margin-top: 8px;
}
</style>
