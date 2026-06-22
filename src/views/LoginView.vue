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

function resetError() {
  errorMessage.value = ''
}

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  name.value = ''
  email.value = ''
  password.value = ''
  errorMessage.value = ''
}

function handleSubmit() {
  resetError()

  if (!email.value || !password.value) {
    errorMessage.value = 'Preencha e-mail e senha.'
    return
  }

  if (isRegisterMode.value && !name.value) {
    errorMessage.value = 'Preencha seu nome.'
    return
  }

  try {
    if (isRegisterMode.value) {
      authStore.register({
        name: name.value,
        email: email.value,
        password: password.value,
      })
    } else {
      authStore.login({
        email: email.value,
        password: password.value,
      })
    }

    router.push('/')
  } catch (error) {
    errorMessage.value = error.message
  }
}
</script>

<template>
  <main class="auth-page">
    <section class="auth-card">
      <div class="auth-brand">
        <div class="brand-mark">D</div>

        <div>
          <h1>Disciplina 24/7</h1>
          <p>Sistema de comprovação pessoal</p>
        </div>
      </div>

      <div class="auth-content">
        <span class="eyebrow">
          {{ isRegisterMode ? 'Criar conta' : 'Acessar sistema' }}
        </span>

        <h2>
          {{ isRegisterMode ? 'Comece seu plano de disciplina.' : 'Entre para registrar sua rotina.' }}
        </h2>

        <p>
          Acompanhe seus hábitos, evidências, relatórios e dias de exceção em um só lugar.
        </p>
      </div>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <div v-if="isRegisterMode" class="form-group">
          <label for="name">Nome</label>
          <input
            id="name"
            v-model="name"
            type="text"
            placeholder="Seu nome"
          />
        </div>

        <div class="form-group">
          <label for="email">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="seuemail@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Digite sua senha"
          />
        </div>

        <p v-if="errorMessage" class="auth-error">
          {{ errorMessage }}
        </p>

        <button class="btn-primary auth-button" type="submit">
          {{ isRegisterMode ? 'Criar conta' : 'Entrar' }}
        </button>
      </form>

      <button class="auth-switch" type="button" @click="toggleMode">
        {{ isRegisterMode ? 'Já tenho conta' : 'Criar uma conta' }}
      </button>

      
    </section>
  </main>
</template>