<script setup>
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthPage = computed(() => route.name === 'login')

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: '🏠',
  },
  {
    label: 'Registro diário',
    to: '/registro-diario',
    icon: '✅',
  },
  {
    label: 'Relatórios',
    to: '/relatorios',
    icon: '📊',
  },
  {
    label: 'Exceções',
    to: '/excecoes',
    icon: '📌',
  },
  {
    label: 'Evidências',
    to: '/evidencias',
    icon: '📷',
  },
  {
    label: 'Configurar rotina',
    to: '/rotina',
    icon: '🗓️',
  },
]

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <RouterView v-if="isAuthPage" />

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">D</div>

        <div>
          <h1>Disciplina 24/7</h1>
          <p>Plano de constância pessoal</p>
        </div>
      </div>

      <nav class="nav-menu" aria-label="Menu principal">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav-link">
          <span>{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="sidebar-card">
        <span class="sidebar-card-label">Meta semanal</span>
        <strong>70%</strong>
        <p>O foco é constância, não perfeição.</p>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div>
          <span class="eyebrow">Sistema de comprovação</span>
          <h2>Plano de Disciplina Pessoal</h2>
        </div>

        <div class="topbar-actions">
          <div class="user-badge">
            <span></span>
            {{ authStore.currentUser?.name || 'Usuária' }}
          </div>

          <button class="logout-btn" type="button" @click="handleLogout">
            Sair
          </button>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>
