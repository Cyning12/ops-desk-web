/**
 * task_web_http_error_i18n 裁定 A：Chat 错误条后端 detail 机器串 → 中文用户文案映射。
 * 七枚举真值 = ops-desk-api master HEAD d3fd056 亲读：
 *   tenant_context.py:53（tenant_header_mismatch · 403）· tenant_context.py:40/51（unknown_tenant:<id> · 422 前缀）
 *   lg_rag/router.py:419（Run is still in flight… · 409）· router.py:205 / history_router.py:88（Thread not found · 404）
 *   router.py:425（Run not found · 404）· router.py:403 / history_router.py:41（invalid cursor · 422）
 *   history_router.py:122/151（History aggregation timeout · 504）
 * 裁定 B：映射仅作用 error.value 呈现面；判据输入（chat.ts:1314 '正在执行中' 子串 / useLgRagSse 非 2xx 分类 /
 * freeze lg-rag-sse-v1）零触达。
 * FP-3：未命中 → 原文兜底（禁吞错 · 禁空串 · 禁抛错）；FP-8：unknown_tenant 的 id 不回显（脱敏防注入呈现）；
 * 空串进空出（保 chat.ts:1356 `apiError.message || '恢复失败，请稍后重试'` 短路语义）。
 * 观察项源：web-tenant-context-chat 40 invoke §5（[http] tenant_header_mismatch 红条实录 · PR #77 备录）。
 */

/** 精确枚举映射（后端 detail 字面 → 中文用户文案 · 与 tests/chat-http-error-i18n.spec.ts 同源锁存） */
const EXACT_DETAIL_MAP: Readonly<Record<string, string>> = {
  tenant_header_mismatch: '租户状态已变化，请重新选择租户后再发送',
  'Run is still in flight; retry after it settles.': '回答仍在生成中，请稍后点「续看」接力',
  'Thread not found': '会话不存在或已失效，请重新提问',
  'Run not found': '对话记录不存在或已过期，请重新提问',
  'invalid cursor': '续看位置已失效，请重新提问',
  'History aggregation timeout': '历史记录加载超时，请稍后重试',
}

const UNKNOWN_TENANT_PREFIX = 'unknown_tenant:'
const UNKNOWN_TENANT_MESSAGE = '所选租户不可用，请重新选择租户'

/** 后端 detail 机器串 → 中文用户文案；unknown_tenant 前缀命中（id 不回显）；未命中原文兜底；空串进空出 */
export function localizeHttpErrorDetail(detail: string): string {
  if (!detail) return ''
  if (detail.startsWith(UNKNOWN_TENANT_PREFIX)) return UNKNOWN_TENANT_MESSAGE
  return EXACT_DETAIL_MAP[detail] ?? detail
}

/** 裁定 C：错误条 stage 前缀渲染层中文化映射（store state 的 stage 字面不动 · chat-store 断言零回归） */
const STAGE_LABEL_MAP: Readonly<Record<string, string>> = {
  http: '请求失败',
  network: '网络异常',
  timeout: '超时',
  session: '会话',
  auth: '登录',
  validation: '校验',
  resume: '续看',
}

/** stage 机器串 → 中文标签；未知 stage 原值透传（不劣化） */
export function localizeErrorStage(stage: string): string {
  return STAGE_LABEL_MAP[stage] ?? stage
}
