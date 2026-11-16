import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus, { ElMessage, ElMessageBox } from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import type { MessageBoxData } from 'element-plus'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('element-plus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('element-plus')>()
  return {
    ...actual,
    ElMessageBox: { confirm: vi.fn() },
    ElMessage: { success: vi.fn(), info: vi.fn(), error: vi.fn(), warning: vi.fn() },
  }
})

vi.mock('../src/api/adminMemory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/api/adminMemory')>()
  return {
    ...actual,
    fetchMemoryFacts: vi.fn(),
    fetchMemoryEpisodes: vi.fn(),
    revokeMemoryFact: vi.fn(),
  }
})

import { fetchMemoryEpisodes, fetchMemoryFacts, revokeMemoryFact } from '../src/api/adminMemory'
import { useAuthStore } from '../src/stores/auth'
import AdminMemoryView from '../src/views/AdminMemoryView.vue'

const FACT = {
  id: 'fact-1',
  tenant_id: 'tenant-a',
  user_id: 'u-1',
  key: 'preferred_language',
  value: 'zh-CN',
  kind: 'preference',
  source_run_id: 'run-9',
  source_turn: 3,
  status: 'active',
  expires_at: null,
  created_at: '2026-11-16T10:00:00Z',
  updated_at: '2026-11-16T10:00:00Z',
}

const EPISODE = {
  id: 'ep-1',
  tenant_id: 'tenant-a',
  run_id: 'run-9',
  task_domain: 'deploy',
  context_fingerprint: 'fp-abc',
  plan_summary: '部署三步走',
  tool_sequence: ['search_docs', 'deploy_service'],
  outcome: 'success',
  failure_class: null,
  status: 'active',
  created_at: '2026-11-16T10:00:00Z',
}

/** ElMessageBox.confirm 确认态（MessageBoxData 型对齐 · 字符串 'confirm' 非合法值故显式断言） */
const CONFIRM_YES = 'confirm' as unknown as MessageBoxData

function setRole(role: string | null): void {
  const auth = useAuthStore()
  auth.user = role === null ? null : { id: 'u-1', username: 'u', role }
}

function mountView() {
  return mount(AdminMemoryView, {
    global: { plugins: [ElementPlus] },
  })
}

/**
 * P3-T9 admin memory 页测试（task_web_p3_t9_admin_memory · 14 §4 D-D）：
 * 零探测面（非 maintainer 不渲染不请求）· facts 表渲染 · revoke 双确认流程
 * （affected=0/N 正常态）· 403 错误条 · episodes 只读 tab。
 */
describe('AdminMemoryView · maintainer 可达性（零探测面）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('viewer：渲染 403 权限态 · 不请求任何 admin 端点', async () => {
    setRole('viewer')

    const wrapper = mountView()
    await flushPromises()

    expect(fetchMemoryFacts).not.toHaveBeenCalled()
    expect(fetchMemoryEpisodes).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="admin-memory-forbidden"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('仅 maintainer 可访问记忆治理面')
    expect(wrapper.find('[data-testid="facts-table"]').exists()).toBe(false)
  })

  it('user=null（未解析）：同样零请求渲染权限态', async () => {
    setRole(null)

    const wrapper = mountView()
    await flushPromises()

    expect(fetchMemoryFacts).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="admin-memory-forbidden"]').exists()).toBe(true)
  })

  it('maintainer：挂载即拉 facts 首页 · 不拉 episodes（tab 懒加载）', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    setRole('maintainer')

    const wrapper = mountView()
    await flushPromises()

    expect(fetchMemoryFacts).toHaveBeenCalledTimes(1)
    expect(fetchMemoryEpisodes).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="admin-memory-forbidden"]').exists()).toBe(false)
  })
})

describe('AdminMemoryView · facts 表与 revoke 流程', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    setRole('maintainer')
  })

  it('facts 表：十二字段值渲染 · next_cursor=null 禁用下一页', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="facts-table"]').exists()).toBe(true)
    const text = wrapper.text()
    expect(text).toContain('preferred_language')
    expect(text).toContain('zh-CN')
    expect(text).toContain('preference')
    expect(text).toContain('active')
    expect(text).toContain('tenant-a')
    expect(text).toContain('u-1')
    expect(text).toContain('run-9')
    expect(text).toContain('fact-1')
    // expires_at=null 占位符
    expect(text).toContain('—')
    expect(wrapper.find('[data-testid="facts-empty"]').exists()).toBe(false)
    const nextBtn = wrapper.find('[data-testid="facts-next"]')
    expect(nextBtn.attributes('disabled')).toBeDefined()
    const prevBtn = wrapper.find('[data-testid="facts-prev"]')
    expect(prevBtn.attributes('disabled')).toBeDefined()
  })

  it('revoke：双确认 → POST → 成功重拉 · affected=2 成功提示', async () => {
    vi.mocked(fetchMemoryFacts)
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: null })
      .mockResolvedValueOnce({ facts: [{ ...FACT, status: 'revoked' }], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockResolvedValue({ affected: 2 })
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(CONFIRM_YES)

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-testid="facts-revoke-btn"]').trigger('click')
    await flushPromises()

    expect(ElMessageBox.confirm).toHaveBeenCalledTimes(1)
    const confirmArgs = vi.mocked(ElMessageBox.confirm).mock.calls[0]
    expect(String(confirmArgs[0])).toContain('preferred_language')
    expect(String(confirmArgs[0])).toContain('tenant=tenant-a')
    expect(confirmArgs[1]).toBe('撤销确认')
    expect(revokeMemoryFact).toHaveBeenCalledTimes(1)
    expect(vi.mocked(revokeMemoryFact).mock.calls[0]).toEqual([
      'preferred_language',
      { tenantId: 'tenant-a', userId: 'u-1' },
    ])
    // 成功重拉当前页
    expect(fetchMemoryFacts).toHaveBeenCalledTimes(2)
    expect(ElMessage.success).toHaveBeenCalledWith('已撤销 2 条记忆（affected=2）')
    expect(wrapper.text()).toContain('revoked')
  })

  it('revoke affected=0：幂等正常态 info 提示（非错误）', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockResolvedValue({ affected: 0 })
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(CONFIRM_YES)

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-testid="facts-revoke-btn"]').trigger('click')
    await flushPromises()

    expect(ElMessage.info).toHaveBeenCalledWith('无匹配记忆或已撤销（affected=0 · 幂等正常态）')
    expect(ElMessage.error).not.toHaveBeenCalled()
  })

  it('revoke 取消（confirm reject）：不发 POST 静默返回', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    vi.mocked(ElMessageBox.confirm).mockRejectedValue(new Error('cancel'))

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-testid="facts-revoke-btn"]').trigger('click')
    await flushPromises()

    expect(revokeMemoryFact).not.toHaveBeenCalled()
    expect(ElMessage.success).not.toHaveBeenCalled()
    expect(ElMessage.error).not.toHaveBeenCalled()
  })

  it('revoke 失败（403）：ElMessage.error · 列表保持', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [FACT], nextCursor: null })
    vi.mocked(revokeMemoryFact).mockRejectedValue({ status: 403, message: 'Maintainer role required', raw: null })
    vi.mocked(ElMessageBox.confirm).mockResolvedValue(CONFIRM_YES)

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-testid="facts-revoke-btn"]').trigger('click')
    await flushPromises()

    expect(ElMessage.error).toHaveBeenCalledWith('撤销失败：Maintainer role required')
    expect(fetchMemoryFacts).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="facts-table"]').exists()).toBe(true)
  })

  it('加载 403：错误条「权限不足」 · 不渲染表格', async () => {
    vi.mocked(fetchMemoryFacts).mockRejectedValue({ status: 403, message: 'Maintainer role required', raw: null })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="facts-error"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('权限不足（403')
    expect(wrapper.find('[data-testid="facts-table"]').exists()).toBe(false)
  })

  it('空集：渲染 facts-empty 空态', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [], nextCursor: null })

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="facts-empty"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="facts-table"]').exists()).toBe(false)
  })

  it('翻页：下一页携带 cursor · 上一页回首页', async () => {
    vi.mocked(fetchMemoryFacts)
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: 'cur-2' })
      .mockResolvedValueOnce({ facts: [{ ...FACT, id: 'fact-2', key: 'k2' }], nextCursor: null })
      .mockResolvedValueOnce({ facts: [FACT], nextCursor: 'cur-2' })

    const wrapper = mountView()
    await flushPromises()

    await wrapper.find('[data-testid="facts-next"]').trigger('click')
    await flushPromises()
    expect(vi.mocked(fetchMemoryFacts).mock.calls[1][0].cursor).toBe('cur-2')
    expect(wrapper.text()).toContain('k2')
    expect(wrapper.text()).toContain('第 2 页')

    await wrapper.find('[data-testid="facts-prev"]').trigger('click')
    await flushPromises()
    expect(vi.mocked(fetchMemoryFacts).mock.calls[2][0].cursor).toBeNull()
    expect(wrapper.text()).toContain('第 1 页')
  })
})

describe('AdminMemoryView · episodes 只读 tab', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    setRole('maintainer')
  })

  it('切 episodes tab：懒加载首拉 · 十一字段渲染 · 无操作列', async () => {
    vi.mocked(fetchMemoryFacts).mockResolvedValue({ facts: [], nextCursor: null })
    vi.mocked(fetchMemoryEpisodes).mockResolvedValue({ episodes: [EPISODE], nextCursor: null })

    const wrapper = mountView()
    await flushPromises()

    const tabs = wrapper.findAll('.el-tabs__item')
    const episodesTab = tabs.find((t) => t.text().includes('episodes'))
    expect(episodesTab).toBeDefined()
    await episodesTab!.trigger('click')
    await flushPromises()

    expect(fetchMemoryEpisodes).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="episodes-table"]').exists()).toBe(true)
    const text = wrapper.text()
    expect(text).toContain('deploy')
    expect(text).toContain('部署三步走')
    expect(text).toContain('search_docs → deploy_service')
    expect(text).toContain('success')
    expect(text).toContain('run-9')
    expect(text).toContain('fp-abc')
    // 只读：无撤销按钮
    expect(wrapper.find('[data-testid="episodes-table"] [data-testid="facts-revoke-btn"]').exists()).toBe(false)
  })
})