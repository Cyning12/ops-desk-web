import { flushPromises, mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { LcEvidenceResult } from '../src/api/lcEvidence'

vi.mock('../src/api/lcEvidence', async () => {
  const actual = await vi.importActual<typeof import('../src/api/lcEvidence')>('../src/api/lcEvidence')
  return {
    ...actual,
    invokeLcEvidence: vi.fn(),
  }
})

import { invokeLcEvidence } from '../src/api/lcEvidence'
import LcEvidenceView from '../src/views/LcEvidenceView.vue'

function successResult(overrides: Partial<LcEvidenceResult> = {}): LcEvidenceResult {
  return {
    query: '示例问法',
    evidence: [
      {
        id: 1,
        source_type: 'issue',
        source_id: '2720',
        chunk_index: 4,
        anchor: '2720#4',
        title: '示例标题',
        url: null,
        snippet: '证据片段必须存在',
        grade: { evidence_id: 1, relevance: 'exact', reason: '命中关键句' },
      },
    ],
    answer: '基于证据的回答\n第二行',
    meta: {
      hit_count: 5,
      graded: true,
      grade_count: 5,
      kept_count: 1,
      gate_action: 'answer',
      best_relevance: 'exact',
    },
    ...overrides,
  }
}

function mountView() {
  return mount(LcEvidenceView, {
    global: { plugins: [ElementPlus] },
  })
}

describe('LcEvidenceView 渲染', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('未请求：边界文案 + 空态', () => {
    const wrapper = mountView()
    const text = wrapper.text()
    expect(text).toContain('LangChain 旁路实验')
    expect(text).toContain('生产 LangGraph')
    expect(text).toContain('尚未发起检索')
    expect(wrapper.find('.el-alert--error').exists()).toBe(false)
  })

  it('空 query 提交：表单校验，不发请求', async () => {
    const wrapper = mountView()
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(invokeLcEvidence).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('请输入 query')
  })

  it('成功：渲染 evidence / answer / meta', async () => {
    vi.mocked(invokeLcEvidence).mockResolvedValue(successResult())
    const wrapper = mountView()

    await wrapper.get('textarea').setValue('示例问法')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const text = wrapper.text()
    expect(text).toContain('answer')
    expect(text).toContain('exact')
    expect(text).toContain('1')
    expect(text).toContain('示例标题')
    expect(text).toContain('证据片段必须存在')
    expect(text).toContain('基于证据的回答')
    expect(text).toContain('第二行')
  })

  it('refuse：强调无可用证据，不是错误态', async () => {
    vi.mocked(invokeLcEvidence).mockResolvedValue(
      successResult({
        evidence: [],
        answer: '没有足够证据作答。',
        meta: {
          hit_count: 2,
          graded: true,
          grade_count: 2,
          kept_count: 0,
          gate_action: 'refuse',
          best_relevance: 'none',
        },
      }),
    )
    const wrapper = mountView()

    await wrapper.get('textarea').setValue('无关问题')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('无可用证据')
    expect(wrapper.find('.el-alert--error').exists()).toBe(false)
  })

  it('接口错误：渲染 el-alert 与重试', async () => {
    vi.mocked(invokeLcEvidence).mockRejectedValue({
      status: 500,
      message: '服务器错误',
      raw: null,
    })
    const wrapper = mountView()

    await wrapper.get('textarea').setValue('示例问法')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    const alert = wrapper.find('.el-alert--error')
    expect(alert.exists()).toBe(true)
    expect(wrapper.text()).toContain('服务器错误')
    expect(wrapper.text()).toContain('重试')
  })
})
