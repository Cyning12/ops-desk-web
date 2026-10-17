import { describe, expect, it } from 'vitest'

import { localizeHttpErrorDetail } from '../src/stores/httpErrorI18n'

/**
 * TC1（task_web_http_error_i18n 裁定 A）：后端 detail 机器串 → 中文用户文案映射。
 * 七枚举真值 = ops-desk-api master HEAD d3fd056 亲读（tenant_context.py / lg_rag/router.py / history_router.py）。
 * 未命中 → 原文兜底（FP-3 禁吞错）；unknown_tenant:<id> 前缀命中且 id 不回显（FP-8 脱敏）；
 * 空串进空出（保 chat.ts:1356 `apiError.message || '恢复失败…'` 短路语义）。
 */
describe('stores/httpErrorI18n · localizeHttpErrorDetail（TC1）', () => {
  it.each([
    ['tenant_header_mismatch', '租户状态已变化，请重新选择租户后再发送'],
    ['Run is still in flight; retry after it settles.', '回答仍在生成中，请稍后点「续看」接力'],
    ['Thread not found', '会话不存在或已失效，请重新提问'],
    ['Run not found', '对话记录不存在或已过期，请重新提问'],
    ['invalid cursor', '续看位置已失效，请重新提问'],
    ['History aggregation timeout', '历史记录加载超时，请稍后重试'],
  ])('枚举命中：%s → 中文字面', (detail, expected) => {
    expect(localizeHttpErrorDetail(detail)).toBe(expected)
  })

  it('unknown_tenant:<id> 前缀命中 → 中文文案且 id 不回显（FP-8 脱敏）', () => {
    const out = localizeHttpErrorDetail('unknown_tenant:evil-tenant')
    expect(out).toBe('所选租户不可用，请重新选择租户')
    expect(out).not.toContain('evil-tenant')
  })

  it('未知机器串 → 原文兜底返回（FP-3 禁吞错 · 禁空串 · 禁抛错）', () => {
    expect(localizeHttpErrorDetail('brand_new_machine_string')).toBe('brand_new_machine_string')
  })

  it('空串进空出（保 chat.ts:1356 || 短路语义）', () => {
    expect(localizeHttpErrorDetail('')).toBe('')
  })
})
