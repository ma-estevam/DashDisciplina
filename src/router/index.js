import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase'

import DashboardView from '../views/DashboardView.vue'
import DailyRegisterView from '../views/DailyRegisterView.vue'
import ReportsView from '../views/ReportsView.vue'
import ExceptionsView from '../views/ExceptionsView.vue'
import EvidenceView from '../views/EvidenceView.vue'
import LoginView from '../views/LoginView.vue'
import RoutineView from '../views/RoutineView.vue'
import BodyProgressView from '../views/BodyProgressView.vue'
import BooksView from '../views/BooksView.vue'
import CoursesView from '../views/CoursesView.vue'

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
      component: RoutineView,
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
  ],
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const isLoggedIn = Boolean(data.session)

  if (to.meta.requiresAuth && !isLoggedIn) {
    return '/login'
  }

  if (to.name === 'login' && isLoggedIn) {
    return '/'
  }
})

export default router
