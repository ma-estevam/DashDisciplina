import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

import DashboardView from '../views/DashboardView.vue'
import DailyRegisterView from '../views/DailyRegisterView.vue'
import ReportsView from '../views/ReportsView.vue'
import ExceptionsView from '../views/ExceptionsView.vue'
import EvidenceView from '../views/EvidenceView.vue'
import LoginView from '../views/LoginView.vue'
import RoutineSettingsView from '../views/RoutineSettingsView.vue'
import BodyProgressView from '../views/BodyProgressView.vue'
import BooksView from '../views/BooksView.vue'
import CoursesView from '../views/CoursesView.vue'
import CustomModulesView from '../views/CustomModulesView.vue'
import CustomModuleDetailView from '../views/CustomModuleDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/rotina',
      name: 'routine',
      component: RoutineSettingsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/registro-diario',
      name: 'daily-register',
      component: DailyRegisterView,
      meta: { requiresAuth: true },
    },
    {
      path: '/relatorios',
      name: 'reports',
      component: ReportsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/excecoes',
      name: 'exceptions',
      component: ExceptionsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/evidencias',
      name: 'evidences',
      component: EvidenceView,
      meta: { requiresAuth: true },
    },
    {
      path: '/evolucao-fisica',
      name: 'body-progress',
      component: BodyProgressView,
      meta: { requiresAuth: true },
    },
    {
      path: '/livros',
      name: 'books',
      component: BooksView,
      meta: { requiresAuth: true },
    },
    {
      path: '/cursos',
      name: 'courses',
      component: CoursesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/modulos',
      name: 'custom-modules',
      component: CustomModulesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/modulos/:moduleId',
      name: 'custom-module-detail',
      component: CustomModuleDetailView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.initialize()
  }

  const isLoggedIn = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isLoggedIn) {
    if (to.name !== 'login') return { name: 'login' }
  }

  if (to.name === 'login' && isLoggedIn) {
    return { name: 'dashboard' }
  }
})

export default router
