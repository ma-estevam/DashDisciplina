<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const isRegisterMode = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

function resetError() {
  errorMessage.value = ''
}

function toggleMode() {
  if (isSubmitting.value) return
  isRegisterMode.value = !isRegisterMode.value
  name.value = ''
  email.value = ''
  password.value = ''
  errorMessage.value = ''
}

async function handleSubmit() {
  if (isSubmitting.value) return
  resetError()

  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha e-mail e senha.'
    return
  }

  if (isRegisterMode.value && !name.value) {
    errorMessage.value = 'Preencha seu nome.'
    return
  }

  isSubmitting.value = true

  try {
    if (isRegisterMode.value) {
      await authStore.register({
        name: name.value,
        email: email.value,
        password: password.value,
      })
    } else {
      await authStore.login({
        email: email.value,
        password: password.value,
      })
    }

    await router.push('/')
  } catch (error) {
    errorMessage.value = error.message || 'Não foi possível entrar. Tente novamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-brand">
        <div class="brand-mark">H</div>

        <div>
          <h1>HubDisciplina</h1>
          <p>Seu centro de rotina e evolução pessoal</p>
        </div>
      </div>

      <div class="auth-content">
        <span class="eyebrow">
          {{ isRegisterMode ? 'Criar conta' : 'Acessar hub' }}
        </span>

        <h2>
          {{ isRegisterMode ? 'Comece a organizar seu progresso.' : 'Entre no seu HubDisciplina.' }}
        </h2>

        <p>
          Acompanhe sua rotina, registre evidências e visualize sua evolução pessoal em um só lugar.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="isRegisterMode" class="form-group">
          <label for="name">Nome</label>
          <input id="name" v-model="name" type="text" placeholder="Seu nome" />
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input id="email" v-model="email" type="email" placeholder="seuemail@email.com" />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input id="password" v-model="password" type="password" placeholder="Digite sua senha" />
        </div>

        <p v-if="errorMessage" class="auth-error">
          {{ errorMessage }}
        </p>

        <button class="btn-primary auth-button" type="submit" :disabled="isSubmitting || authStore.loading">
          {{ isSubmitting || authStore.loading ? (isRegisterMode ? 'Criando...' : 'Entrando...') : (isRegisterMode ? 'Criar conta' : 'Entrar') }}
        </button>
      </form>

      <button class="auth-switch" type="button" :disabled="isSubmitting || authStore.loading" @click="toggleMode">
        {{ isRegisterMode ? 'Já tenho conta' : 'Criar uma conta' }}
      </button>
    </section>
  </main>
</template>
