<script setup lang="ts">
/**
 * D2–D6（task_web_hitl_approval_overlay_ux · 维护者需求②）：HITL 审批动作面自消息流内联
 * 迁移为 composer 上方独立浮层（非全屏模态 · 不遮输入 · 不遮消息流尾 · 窄屏 100% 通栏 D10）。
 * 数据源 = 当前最新 hitl 态消息的 message.hitl（D3 数据层零改 · 单一数据源）；
 * 动作面复用 HitlApprovalCard 零分叉（D4 三入口同形态：live hitl.waiting 帧 / replay 重放 /
 * 历史 waiting_approval）；chase 进度落点 = hitl.note（D5 · showProgress
 * src/stores/chat.ts showProgress 写入 · 禁另造 store 字段）；decided+canResume「续看推进」随迁（D6）。
 * streaming 中批准/驳回/resume_mode 禁用沿用卡片 :disabled="chat.streaming" 语义（D10④）。
 * 零 setInterval（guards TC3 白名单外禁引入）。
 */
import HitlApprovalCard from './HitlApprovalCard.vue'
import type { ChatMessage } from '../../stores/chat'

defineProps<{ message: ChatMessage }>()
</script>

<template>
  <section class="hitl-overlay" data-test="hitl-overlay" aria-label="人工审批浮层">
    <HitlApprovalCard :message="message" />
  </section>
</template>

<style scoped>
/* D10①：浮层恒居条带区之下、composer 正上方，纵向并列互不覆盖；③ 窄屏通栏（容器已 100%） */
.hitl-overlay {
  flex: none;
  width: 100%;
  margin-top: 8px;
}

/* 卡片内联态 margin-top 由浮层接管间距 */
.hitl-overlay :deep(.hitl-card) {
  margin-top: 0;
  /* 浮层态加强投影分层（水墨风克制阴影） */
  box-shadow: 0 2px 10px rgba(44, 44, 44, 0.08);
}
</style>
