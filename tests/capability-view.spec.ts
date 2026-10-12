import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../src/api/capability', () => ({
  fetchCapabilityMine: vi.fn(),
  fetchAdminCapabilityCatalog: vi.fn(),
}))

import { fetchAdminCapabilityCatalog, fetchCapabilityMine } from '../src/api/capability'
import { useAuthStore } from '../src/stores/auth'
import CapabilityCatalogView from '../src/views/CapabilityCatalogView.vue'

const MINE_ITEMS = [
  {
    id: 'deploy_service',
    kind: 'write',
    description: '部署服务到目标环境',
    when_to_use: '需要发布新版本时',
    tags: ['deploy', 'prod'],
    risk_level: 'high',
    side_effect: 'write',
    enabled: true,
    status: 'available',
  },
  {
    id: 'search_docs',
    kind: 'read',
    description: '检索文档',
    when_to_use: '',
    tags: [],
    risk_level: 'low',
    side_effect: '',
    enabled: false,
    status: 'available',
  },
]

function setRole(role: string | null): void {
  const auth = useAuthStore()
  auth.user = role === null ? null : { id: 'u-1', username: 'u', role }
}

function mountView() {
  return mount(CapabilityCatalogView, {
    global: { plugins: [ElementPlus] },
  })
}

describe('CapabilityCatalogView 渲染（F5 · 九键投影表）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('可见集表：九键投影渲染 + count 照登', async () => {
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: MINE_ITEMS, count: 2 })
    setRole('viewer')

    const wrapper = mountView()
    await flushPromises()

    expect(fetchCapabilityMine).toHaveBeenCalledTimes(1)
    const text = wrapper.text()
    expect(text).toContain('count=2')
    // 九键列值可见
    expect(text).toContain('deploy_service')
    expect(text).toContain('write')
    expect(text).toContain('部署服务到目标环境')
    expect(text).toContain('需要发布新版本时')
    expect(text).toContain('deploy、prod')
    expect(text).toContain('high')
    expect(text).toContain('available')
    // 空字段占位符
    expect(text).toContain('—')
    expect(wrapper.find('[data-testid="capability-table"]').exists()).toBe(true)
    expect(wrapper.find('.el-empty').exists()).toBe(false)
  })

  it('空集（items=[]）：渲染 el-empty 空态 · 不渲染表格', async () => {
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: [], count: 0 })
    setRole('viewer')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.el-empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('暂无可见 Capability')
    expect(wrapper.find('[data-testid="capability-table"]').exists()).toBe(false)
    expect(wrapper.text()).toContain('count=0')
  })

  it('接口错误：渲染 el-alert 与重试按钮', async () => {
    vi.mocked(fetchCapabilityMine).mockRejectedValue({ status: 500, message: '服务器错误', raw: null })
    setRole('viewer')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('.el-alert--error').exists()).toBe(true)
    expect(wrapper.text()).toContain('服务器错误')
    expect(wrapper.text()).toContain('重试')
  })
})

describe('CapabilityCatalogView · maintainer 面 role 显隐（零探测面三级核对）', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(fetchCapabilityMine).mockResolvedValue({ items: MINE_ITEMS, count: 2 })
  })

  it('viewer：不渲染 manifest 区 · 不请求 admin 端点', async () => {
    setRole('viewer')

    const wrapper = mountView()
    await flushPromises()

    expect(fetchAdminCapabilityCatalog).not.toHaveBeenCalled()
    expect(wrapper.find('[data-testid="manifest-section"]').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Manifest 故障详情')
  })

  it('maintainer + 故障态：manifest_errors 计数 + details 表渲染', async () => {
    vi.mocked(fetchAdminCapabilityCatalog).mockResolvedValue({
      manifest_errors: 2,
      manifest_error_details: [
        { path: '/manifests/bad_a.yaml', error: 'yaml parse error' },
        { path: '/manifests/bad_b.yaml', error: 'missing field kind' },
      ],
    })
    setRole('maintainer')

    const wrapper = mountView()
    await flushPromises()

    expect(fetchAdminCapabilityCatalog).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-testid="manifest-section"]').exists()).toBe(true)
    const text = wrapper.text()
    expect(text).toContain('manifest_errors = 2')
    expect(text).toContain('/manifests/bad_a.yaml')
    expect(text).toContain('yaml parse error')
    expect(text).toContain('/manifests/bad_b.yaml')
    // 可见集表同时渲染
    expect(wrapper.find('[data-testid="capability-table"]').exists()).toBe(true)
  })

  it('maintainer + 零故障：渲染无故障态', async () => {
    vi.mocked(fetchAdminCapabilityCatalog).mockResolvedValue({
      manifest_errors: 0,
      manifest_error_details: [],
    })
    setRole('maintainer')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.text()).toContain('manifest_errors = 0')
    expect(wrapper.find('[data-testid="manifest-ok"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无 manifest 加载故障')
    expect(wrapper.find('[data-testid="manifest-details-table"]').exists()).toBe(false)
  })

  it('maintainer + summary 缺键（manifest_errors=null）：渲染空态警示（契约不符照登）', async () => {
    vi.mocked(fetchAdminCapabilityCatalog).mockResolvedValue({
      manifest_errors: null,
      manifest_error_details: [],
    })
    setRole('maintainer')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="manifest-missing-keys"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('缺 manifest_errors 键')
  })

  it('maintainer + admin 面失败：manifest 区错误警示 · 可见集表不受影响', async () => {
    vi.mocked(fetchAdminCapabilityCatalog).mockRejectedValue({
      status: 403,
      message: 'Maintainer role required',
      raw: null,
    })
    setRole('maintainer')

    const wrapper = mountView()
    await flushPromises()

    expect(wrapper.find('[data-testid="manifest-section"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('无法加载 manifest 故障详情')
    expect(wrapper.find('[data-testid="capability-table"]').exists()).toBe(true)
  })
})
