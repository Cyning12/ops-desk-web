<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { MemoryFact } from '../api/adminMemory'
import {
  MEMORY_EPISODE_OUTCOMES,
  MEMORY_EPISODE_STATUSES,
  MEMORY_FACT_KINDS,
  MEMORY_FACT_STATUSES,
  MEMORY_PAGE_LIMITS,
} from '../api/adminMemory'
import type { ApiError } from '../api/http'
import { useAdminMemoryStore } from '../stores/adminMemory'
import { useAuthStore } from '../stores/auth'

/**
 * P3-T9 admin memory 管理页（task_web_p3_t9_admin_memory · issue web#106 ·
 * 14-p3-schedule-taskcard-design §4 D-D + 15-p3-contracts §5）。
 *
 * - admin 面 = 跨租户运维面（R7）：maintainer 可达 · **非租户管理员**（14 §4 明示）。
 * - 零探测面（CapabilityCatalogView 先例）：非 maintainer 不渲染数据区不请求 admin 端点，
 *   仅渲染权限提示；服务端 403（会话角色漂移）经 store error 态照登为错误条。
 * - revoke 幂等：200 affected=0/N 皆正常态（ElMessage 呈现 · 非错误非 409）。
 */

const auth = useAuthStore()
const store = useAdminMemoryStore()

const isMaintainer = computed(() => auth.user?.role === 'maintainer')
const activeTab = ref<'facts' | 'episodes'>('facts')

onMounted(() => {
  // 零探测面：非 maintainer 不发起任何 admin 请求
  if (isMaintainer.value) void store.applyFactsFilters()
})

function onTabChange(name: string | number): void {
  // episodes 首次切页加载（之后由过滤/翻页驱动 · 不重复拉）
  if (name === 'episodes' && store.episodesIsEmpty && !store.episodesLoading && !store.episodesError) {
    void store.applyEpisodesFilters()
  }
}

async function onRevoke(row: MemoryFact): Promise<void> {
  const scope = row.user_id ? `用户 ${row.user_id}` : '全部用户'
  try {
    await ElMessageBox.confirm(
      `确定撤销记忆「${row.key}」？（tenant=${row.tenant_id} · ${scope} · 幂等操作，已撤销/无匹配返回 affected=0）`,
      '撤销确认',
      { confirmButtonText: '确认撤销', cancelButtonText: '取消', type: 'warning' },
    )
  } catch {
    return // 取消：静默
  }
  try {
    const affected = await store.revokeFact(row)
    if (affected > 0) {
      ElMessage.success(`已撤销 ${affected} 条记忆（affected=${affected}）`)
    } else {
      // 幂等正常态：已撤销/无匹配（14 §4 D-D · 否 409）
      ElMessage.info('无匹配记忆或已撤销（affected=0 · 幂等正常态）')
    }
  } catch (error) {
    const apiError = error as ApiError
    ElMessage.error(`撤销失败：${apiError.message}`)
  }
}

function fmt(value: string | null | undefined): string {
  return value ?? '—'
}
</script>

<template>
  <div class="admin-memory">
    <!-- 非 maintainer：零探测面（不渲染数据区 · 不请求 admin 端点 · 页内判定承接深链直达） -->
    <el-result
      v-if="!isMaintainer"
      data-testid="admin-memory-forbidden"
      icon="error"
      title="403"
      sub-title="仅 maintainer 可访问记忆治理面（admin 面 · 非租户管理员）"
    />
    <template v-else>
      <el-alert
        type="info"
        :closable="false"
        class="admin-memory__notice"
        title="admin 面 = 跨租户运维面（maintainer 全局角色 · 非租户管理员）；tenant_id 为必填查询入参。"
      />
      <el-tabs v-model="activeTab" data-testid="admin-memory-tabs" @tab-change="onTabChange">
        <!-- ============ 记忆 facts ============ -->
        <el-tab-pane label="记忆 facts" name="facts">
          <div class="admin-memory__filters" data-testid="facts-filters">
            <el-input
              v-model="store.factsTenantId"
              class="admin-memory__filter-tenant"
              placeholder="tenant_id（必填）"
              data-testid="facts-filter-tenant"
              @change="store.applyFactsFilters()"
            />
            <el-input
              v-model="store.factsUserId"
              class="admin-memory__filter-user"
              placeholder="user_id（可选）"
              data-testid="facts-filter-user"
              @change="store.applyFactsFilters()"
            />
            <el-select
              v-model="store.factsStatus"
              placeholder="status"
              data-testid="facts-filter-status"
              @change="store.applyFactsFilters()"
            >
              <el-option label="status：全部" value="" />
              <el-option v-for="s in MEMORY_FACT_STATUSES" :key="s" :label="s" :value="s" />
            </el-select>
            <el-select
              v-model="store.factsKind"
              placeholder="kind"
              data-testid="facts-filter-kind"
              @change="store.applyFactsFilters()"
            >
              <el-option label="kind：全部" value="" />
              <el-option v-for="k in MEMORY_FACT_KINDS" :key="k" :label="k" :value="k" />
            </el-select>
            <el-select
              v-model="store.factsLimit"
              data-testid="facts-filter-limit"
              @change="store.applyFactsFilters()"
            >
              <el-option v-for="n in MEMORY_PAGE_LIMITS" :key="n" :label="`每页 ${n}`" :value="n" />
            </el-select>
            <el-button
              type="primary"
              :disabled="!store.factsTenantId.trim()"
              data-testid="facts-search"
              @click="store.applyFactsFilters()"
            >
              查询
            </el-button>
          </div>

          <el-alert
            v-if="store.factsError"
            type="error"
            :closable="false"
            class="admin-memory__error"
            data-testid="facts-error"
          >
            <template #title>
              <span v-if="store.factsError.status === 403">权限不足（403 · maintainer 角色校验失败）</span>
              <span v-else>加载记忆失败：{{ store.factsError.message }}</span>
              <el-button size="small" text type="primary" data-testid="facts-retry" @click="store.applyFactsFilters()">
                重试
              </el-button>
            </template>
          </el-alert>

          <el-empty
            v-else-if="store.factsIsEmpty && !store.factsLoading"
            description="暂无记忆（或 tenant_id 未填）"
            data-testid="facts-empty"
          />

          <template v-else>
            <el-table
              v-loading="store.factsLoading"
              :data="store.facts"
              class="admin-memory__table"
              data-testid="facts-table"
            >
              <el-table-column prop="key" label="key" min-width="140" show-overflow-tooltip />
              <el-table-column prop="value" label="value" min-width="200" show-overflow-tooltip />
              <el-table-column prop="kind" label="kind" width="100" />
              <el-table-column label="status" width="110">
                <template #default="{ row }">
                  <el-tag
                    :type="row.status === 'active' ? 'success' : row.status === 'revoked' ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="tenant_id" label="tenant_id" min-width="130" show-overflow-tooltip />
              <el-table-column prop="user_id" label="user_id" min-width="120" show-overflow-tooltip />
              <el-table-column label="source_run_id" min-width="140" show-overflow-tooltip>
                <template #default="{ row }">{{ fmt(row.source_run_id) }}</template>
              </el-table-column>
              <el-table-column prop="source_turn" label="source_turn" width="110" />
              <el-table-column label="expires_at" min-width="160">
                <template #default="{ row }">{{ fmt(row.expires_at) }}</template>
              </el-table-column>
              <el-table-column prop="created_at" label="created_at" min-width="160" />
              <el-table-column prop="updated_at" label="updated_at" min-width="160" />
              <el-table-column prop="id" label="id" min-width="120" show-overflow-tooltip />
              <el-table-column label="操作" width="90" fixed="right">
                <template #default="{ row }">
                  <el-button
                    size="small"
                    type="danger"
                    text
                    :disabled="row.status === 'revoked'"
                    data-testid="facts-revoke-btn"
                    @click="onRevoke(row)"
                  >
                    撤销
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-memory__pager" data-testid="facts-pager">
              <el-button size="small" :disabled="!store.factsCanPrev" data-testid="facts-prev" @click="store.prevFactsPage()">
                上一页
              </el-button>
              <span class="admin-memory__page-index">第 {{ store.factsPageIndex }} 页</span>
              <el-button size="small" :disabled="!store.factsCanNext" data-testid="facts-next" @click="store.nextFactsPage()">
                下一页
              </el-button>
            </div>
          </template>
        </el-tab-pane>

        <!-- ============ 历程 episodes（只读） ============ -->
        <el-tab-pane label="历程 episodes" name="episodes">
          <div class="admin-memory__filters" data-testid="episodes-filters">
            <el-input
              v-model="store.episodesTenantId"
              class="admin-memory__filter-tenant"
              placeholder="tenant_id（必填）"
              data-testid="episodes-filter-tenant"
              @change="store.applyEpisodesFilters()"
            />
            <el-input
              v-model="store.episodesRunId"
              class="admin-memory__filter-user"
              placeholder="run_id（可选）"
              data-testid="episodes-filter-run"
              @change="store.applyEpisodesFilters()"
            />
            <el-select
              v-model="store.episodesStatus"
              placeholder="status"
              data-testid="episodes-filter-status"
              @change="store.applyEpisodesFilters()"
            >
              <el-option label="status：全部" value="" />
              <el-option v-for="s in MEMORY_EPISODE_STATUSES" :key="s" :label="s" :value="s" />
            </el-select>
            <el-select
              v-model="store.episodesOutcome"
              placeholder="outcome"
              data-testid="episodes-filter-outcome"
              @change="store.applyEpisodesFilters()"
            >
              <el-option label="outcome：全部" value="" />
              <el-option v-for="o in MEMORY_EPISODE_OUTCOMES" :key="o" :label="o" :value="o" />
            </el-select>
            <el-select
              v-model="store.episodesLimit"
              data-testid="episodes-filter-limit"
              @change="store.applyEpisodesFilters()"
            >
              <el-option v-for="n in MEMORY_PAGE_LIMITS" :key="n" :label="`每页 ${n}`" :value="n" />
            </el-select>
            <el-button
              type="primary"
              :disabled="!store.episodesTenantId.trim()"
              data-testid="episodes-search"
              @click="store.applyEpisodesFilters()"
            >
              查询
            </el-button>
          </div>

          <el-alert
            v-if="store.episodesError"
            type="error"
            :closable="false"
            class="admin-memory__error"
            data-testid="episodes-error"
          >
            <template #title>
              <span v-if="store.episodesError.status === 403">权限不足（403 · maintainer 角色校验失败）</span>
              <span v-else>加载历程失败：{{ store.episodesError.message }}</span>
              <el-button size="small" text type="primary" data-testid="episodes-retry" @click="store.applyEpisodesFilters()">
                重试
              </el-button>
            </template>
          </el-alert>

          <el-empty
            v-else-if="store.episodesIsEmpty && !store.episodesLoading"
            description="暂无历程（或 tenant_id 未填）"
            data-testid="episodes-empty"
          />

          <template v-else>
            <el-table
              v-loading="store.episodesLoading"
              :data="store.episodes"
              class="admin-memory__table"
              data-testid="episodes-table"
            >
              <el-table-column prop="task_domain" label="task_domain" min-width="130" show-overflow-tooltip />
              <el-table-column prop="plan_summary" label="plan_summary" min-width="220" show-overflow-tooltip />
              <el-table-column label="tool_sequence" min-width="180" show-overflow-tooltip>
                <template #default="{ row }">{{ (row.tool_sequence ?? []).join(' → ') || '—' }}</template>
              </el-table-column>
              <el-table-column label="outcome" width="100">
                <template #default="{ row }">
                  <el-tag
                    :type="row.outcome === 'success' ? 'success' : row.outcome === 'failure' ? 'danger' : 'warning'"
                    size="small"
                  >
                    {{ row.outcome }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="failure_class" min-width="120" show-overflow-tooltip>
                <template #default="{ row }">{{ fmt(row.failure_class) }}</template>
              </el-table-column>
              <el-table-column prop="status" label="status" width="90" />
              <el-table-column prop="run_id" label="run_id" min-width="140" show-overflow-tooltip />
              <el-table-column prop="tenant_id" label="tenant_id" min-width="130" show-overflow-tooltip />
              <el-table-column prop="context_fingerprint" label="context_fingerprint" min-width="150" show-overflow-tooltip />
              <el-table-column prop="created_at" label="created_at" min-width="160" />
              <el-table-column prop="id" label="id" min-width="120" show-overflow-tooltip />
            </el-table>
            <div class="admin-memory__pager" data-testid="episodes-pager">
              <el-button size="small" :disabled="!store.episodesCanPrev" data-testid="episodes-prev" @click="store.prevEpisodesPage()">
                上一页
              </el-button>
              <span class="admin-memory__page-index">第 {{ store.episodesPageIndex }} 页</span>
              <el-button size="small" :disabled="!store.episodesCanNext" data-testid="episodes-next" @click="store.nextEpisodesPage()">
                下一页
              </el-button>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<style scoped>
.admin-memory__notice {
  margin-bottom: 12px;
}

.admin-memory__filters {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.admin-memory__filter-tenant {
  width: 220px;
}

.admin-memory__filter-user {
  width: 180px;
}

.admin-memory__error {
  margin-bottom: 12px;
}

.admin-memory__table {
  width: 100%;
}

.admin-memory__pager {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  justify-content: flex-end;
}

.admin-memory__page-index {
  font-size: 12px;
  color: var(--ops-text-secondary);
}
</style>
