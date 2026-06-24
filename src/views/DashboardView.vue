<script setup>
import { computed } from 'vue'
import {
  Activity,
  Blocks,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  GraduationCap,
  ListChecks,
} from 'lucide-vue-next'
import StatCard from '../components/StatCard.vue'
import { useBodyProgressStore } from '../stores/bodyProgressStore'
import { useBooksStore } from '../stores/booksStore'
import { useCoursesStore } from '../stores/coursesStore'
import { useCustomModulesStore } from '../stores/customModulesStore'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
const bodyStore = useBodyProgressStore()
const booksStore = useBooksStore()
const coursesStore = useCoursesStore()
const customStore = useCustomModulesStore()
routineStore.initialize()
disciplineStore.initialize()
bodyStore.initialize()
booksStore.initialize()
coursesStore.initialize()
customStore.initialize()

const activeRoutine = computed(() => routineStore.activeRoutine)
const todayRecord = computed(() => disciplineStore.recordByDate(localDateKey()))
const completedCount = computed(
  () => todayRecord.value?.entries.filter((entry) => entry.completed).length || 0,
)
const totalHabits = computed(
  () => todayRecord.value?.plannedHabitCount ?? activeRoutine.value?.habits.length ?? 0,
)
const progress = computed(() =>
  totalHabits.value ? Math.round((completedCount.value / totalHabits.value) * 100) : 0,
)
const habits = computed(() =>
  (activeRoutine.value?.habits || []).map((habit) => {
    const entry = todayRecord.value?.entries.find((item) => item.habitId === habit.id)
    return {
      ...habit,
      status: entry?.completed ? 'Concluído' : 'Pendente',
      completed: Boolean(entry?.completed),
    }
  }),
)
const firstActivity = computed(() => activeRoutine.value?.activities[0] || null)
const currentBook = computed(() => booksStore.currentBook)
const currentCourse = computed(() => coursesStore.currentCourse)

function formatDate(date) {
  if (!date) return 'sem atualização'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}
</script>

<template>
  <section class="dashboard-page">
    <div class="hero-panel">
      <div class="hero-content">
        <span class="eyebrow light">HubDisciplina</span>
        <h2>Bem-vinda ao seu HubDisciplina.</h2>
        <p>Acompanhe sua rotina, seus hábitos, seus estudos e sua evolução em um só lugar.</p>
        <div class="hero-actions">
          <RouterLink to="/registro-diario" class="btn-primary">Registrar meu dia</RouterLink>
          <RouterLink to="/relatorios" class="btn-secondary">Ver relatórios</RouterLink>
        </div>
      </div>

      <div class="hero-progress-card">
        <span>Progresso de hoje</span>
        <strong>{{ completedCount }}/{{ totalHabits }}</strong>
        <p>hábitos concluídos</p>
        <div class="progress-bar">
          <div :style="{ width: `${progress}%` }"></div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard
        title="Progresso hoje"
        :value="`${progress}%`"
        subtitle="dos hábitos planejados"
        type="primary"
        :icon="CheckCircle2"
      />
      <StatCard
        title="Hábitos ativos"
        :value="String(activeRoutine?.habits.length || 0)"
        subtitle="na rotina atual"
        :icon="ListChecks"
      />
      <StatCard
        title="Atividades"
        :value="String(activeRoutine?.activities.length || 0)"
        subtitle="horários cadastrados"
        :icon="CalendarClock"
      />
      <StatCard
        title="Primeiro compromisso"
        :value="firstActivity?.startTime || '-'"
        :subtitle="firstActivity?.title || 'agenda vazia'"
        :icon="CalendarClock"
      />
    </div>

    <section class="dashboard-modules-grid">
      <RouterLink to="/evolucao-fisica" class="module-summary-card">
        <div class="module-summary-header">
          <span class="eyebrow">Evolução física</span>
          <Activity class="module-icon" aria-hidden="true" />
        </div>
        <strong>{{ bodyStore.currentWeight || 0 }} kg</strong>
        <p>{{ bodyStore.currentGoal }} · {{ formatDate(bodyStore.latestRecord?.recordDate) }}</p>
      </RouterLink>

      <RouterLink to="/livros" class="module-summary-card">
        <div class="module-summary-header">
          <span class="eyebrow">Livro em andamento</span>
          <BookOpen class="module-icon" aria-hidden="true" />
        </div>
        <strong>{{ currentBook?.title || 'Nenhum livro' }}</strong>
        <p>{{ booksStore.generalProgress }}% de progresso geral · {{ booksStore.pagesRead }} páginas</p>
      </RouterLink>

      <RouterLink to="/cursos" class="module-summary-card">
        <div class="module-summary-header">
          <span class="eyebrow">Curso em andamento</span>
          <GraduationCap class="module-icon" aria-hidden="true" />
        </div>
        <strong>{{ currentCourse?.name || 'Nenhum curso' }}</strong>
        <p>{{ coursesStore.generalProgress }}% de progresso geral · {{ coursesStore.studiedHours }}h estudadas</p>
      </RouterLink>
    </section>

    <section v-if="customStore.dashboardModules.length" class="dashboard-modules-grid">
      <RouterLink
        v-for="module in customStore.dashboardModules"
        :key="module.id"
        :to="`/modulos/${module.id}`"
        class="module-summary-card"
      >
        <div class="module-summary-header">
          <span class="eyebrow">Módulo personalizado</span>
          <Blocks class="module-icon" aria-hidden="true" />
        </div>
        <strong>{{ module.name || 'Módulo sem nome' }}</strong>
        <p>
          {{ module.records?.length || 0 }} registros · último:
          {{ formatDate(module.records?.[0]?.recordDate) }}
        </p>
      </RouterLink>
    </section>

    <section class="content-grid">
      <article class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Hábitos</span>
            <h3>Checklist do dia</h3>
          </div>
          <RouterLink to="/registro-diario" class="text-link">registrar</RouterLink>
        </div>

        <div v-if="habits.length" class="habits-grid">
          <div v-for="habit in habits" :key="habit.id" :class="['habit-card', { 'habit-done': habit.completed }]">
            <div>
              <strong>{{ habit.name || 'Hábito sem nome' }}</strong>
              <p>
                {{ habit.dailyGoal ? `${habit.dailyGoal} ${habit.unit}` : habit.description || 'Sem meta numérica' }}
              </p>
            </div>
            <span class="status-pill">{{ habit.status }}</span>
          </div>
        </div>
        <div v-else class="empty-state compact-empty">
          <h3>Sem hábitos por enquanto</h3>
          <p>Adicione hábitos à rotina ativa para acompanhar o dia.</p>
        </div>
      </article>

      <article class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Agenda</span>
            <h3>Timeline de hoje</h3>
          </div>
        </div>

        <div v-if="activeRoutine?.activities.length" class="timeline">
          <div v-for="item in activeRoutine.activities" :key="item.id" class="timeline-item">
            <span>{{ item.startTime }}</span>
            <p><strong>{{ item.title }}</strong><small>até {{ item.endTime }}</small></p>
          </div>
        </div>
        <div v-else class="empty-state compact-empty">
          <h3>Agenda vazia</h3>
          <p>Cadastre atividades e horários na configuração.</p>
        </div>
      </article>
    </section>
  </section>
</template>
