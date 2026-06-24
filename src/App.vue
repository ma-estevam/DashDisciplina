<script setup>
import { computed } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import {
  Activity,
  BarChart3,
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  GraduationCap,
  LayoutDashboard,
  Pin,
} from 'lucide-vue-next'
import AppSidebar from './components/AppSidebar.vue'
import AppTopbar from './components/AppTopbar.vue'
import MobileNavigation from './components/MobileNavigation.vue'
import { useAuthStore } from './stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isAuthPage = computed(() => route.name === 'login')

const navItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: LayoutDashboard,
  },
  {
    label: 'Registro diário',
    to: '/registro-diario',
    icon: CheckCircle2,
  },
  {
    label: 'Relatórios',
    to: '/relatorios',
    icon: BarChart3,
  },
  {
    label: 'Exceções',
    to: '/excecoes',
    icon: Pin,
  },
  {
    label: 'Evidências',
    to: '/evidencias',
    icon: Camera,
  },
  {
    label: 'Evolução Física',
    to: '/evolucao-fisica',
    icon: Activity,
  },
  {
    label: 'Livros',
    to: '/livros',
    icon: BookOpen,
  },
  {
    label: 'Cursos',
    to: '/cursos',
    icon: GraduationCap,
  },
  {
    label: 'Rotina',
    to: '/rotina',
    icon: CalendarDays,
  },
]

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <RouterView v-if="isAuthPage" />

  <div v-else class="app-shell">
    <AppSidebar :nav-items="navItems" />

    <main class="main-content">
      <AppTopbar :current-user="authStore.currentUser" @logout="handleLogout" />
      <RouterView />
    </main>

    <MobileNavigation :nav-items="navItems" @logout="handleLogout" />
  </div>
</template>
