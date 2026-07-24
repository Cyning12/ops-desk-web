import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { GraphResponse } from '../src/api/graph'
import type { ApiError } from '../src/api/http'

vi.mock('../src/api/graph', () => ({
  fetchGraph: vi.fn(),
}))

import { fetchGraph } from '../src/api/graph'
import { useGraphStore } from '../src/stores/graph'

/** 当前后端实测响应：无快照时全 null */
const nullResponse: GraphResponse = {
  snapshot: null,
  module_matrix: null,
  repo_id: null,
  created_at: null,
}

const dataResponse: GraphResponse = {
  snapshot: { node_count: 120, edge_count: 340 },
  module_matrix: [{ module_id: 'core', issue_count: 12 }],
  repo_id: 'repo-1',
  created_at: '2026-07-15T08:00:00Z',
}

function serverError(message = 'Internal Server Error'): ApiError {
  return { status: 500, message, raw: null }
}

describe('stores/graph', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('load 成功（全 null 空态）：写入数据且无错误', async () => {
    vi.mocked(fetchGraph).mockResolvedValue(nullResponse)
    const graph = useGraphStore()

    await graph.load()

    expect(graph.data).toEqual(nullResponse)
    expect(graph.error).toBeNull()
    expect(graph.loaded).toBe(true)
    expect(graph.loading).toBe(false)
  })

  it('load 成功（有数据）：写入数据', async () => {
    vi.mocked(fetchGraph).mockResolvedValue(dataResponse)
    const graph = useGraphStore()

    await graph.load()

    expect(graph.data).toEqual(dataResponse)
    expect(graph.error).toBeNull()
  })

  it('load 失败：写入 ApiError，不抛异常，可重试后恢复', async () => {
    vi.mocked(fetchGraph).mockRejectedValueOnce(serverError()).mockResolvedValueOnce(nullResponse)
    const graph = useGraphStore()

    await graph.load()
    expect(graph.data).toBeNull()
    expect(graph.error?.status).toBe(500)
    expect(graph.loaded).toBe(false)

    // 重试成功后清除错误
    await graph.load()
    expect(graph.error).toBeNull()
    expect(graph.data).toEqual(nullResponse)
    expect(graph.loaded).toBe(true)
  })

  it('load 进行中防重入：并发调用共享同一请求', async () => {
    let resolveFetch!: (r: GraphResponse) => void
    vi.mocked(fetchGraph).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )
    const graph = useGraphStore()

    const p1 = graph.load()
    const p2 = graph.load()
    expect(graph.loading).toBe(true)

    resolveFetch(nullResponse)
    await Promise.all([p1, p2])
    expect(fetchGraph).toHaveBeenCalledTimes(1)
    expect(graph.loading).toBe(false)
  })

  it('reset 清空全部状态', async () => {
    vi.mocked(fetchGraph).mockResolvedValue(dataResponse)
    const graph = useGraphStore()

    await graph.load()
    graph.reset()

    expect(graph.data).toBeNull()
    expect(graph.error).toBeNull()
    expect(graph.loaded).toBe(false)
    expect(graph.loading).toBe(false)
  })
})
