<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '../stores/auth'
import type { ApiError } from '../api/http'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  username: '',
  inviteToken: '',
})
const submitting = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  inviteToken: [{ required: true, message: '请输入邀请密钥', trigger: 'blur' }],
}

async function onSubmit(): Promise<void> {
  if (submitting.value) return
  submitting.value = true
  try {
    await auth.login(form.username, form.inviteToken)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
    await router.push(redirect && redirect.startsWith('/') ? redirect : '/chat')
  } catch (error) {
    const apiError = error as ApiError
    // 网络层失败（无响应）时给出可达性提示；否则展示后端 message（detail）
    const message =
      apiError.status === null ? '服务不可达，请稍后重试' : apiError.message || '登录失败'
    ElMessage.error(message)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <el-card class="login-page__card">
      <h1 class="login-page__title">Ops Desk 登录</h1>
      <el-form
        :model="form"
        :rules="rules"
        label-position="top"
        size="large"
        @submit.prevent="onSubmit"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="username" placeholder="username" />
        </el-form-item>
        <el-form-item label="邀请密钥" prop="inviteToken">
          <el-input
            v-model="form.inviteToken"
            type="password"
            show-password
            autocomplete="off"
            placeholder="invite token"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <el-button
          class="login-page__submit"
          type="primary"
          native-type="submit"
          :loading="submitting"
        >
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ops-bg);
  color: var(--ops-text);
}

.login-page__card {
  width: 360px;
  background: var(--ops-bg-paper);
}

.login-page__title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 0.05em;
}

.login-page__submit {
  width: 100%;
}
</style>
