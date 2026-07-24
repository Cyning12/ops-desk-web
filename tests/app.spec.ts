import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'

import App from '../src/App.vue'
import OverviewView from '../src/views/OverviewView.vue'

describe('App 冒烟', () => {
  it('挂载 App 并渲染 /overview 占位视图', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/overview', component: OverviewView }],
    })
    router.push('/overview')
    await router.isReady()

    const wrapper = mount(App, {
      global: { plugins: [router] },
    })

    expect(wrapper.text()).toContain('Overview')
    expect(wrapper.text()).toContain('W3')
  })
})
