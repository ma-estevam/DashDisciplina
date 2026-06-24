<script setup>
import { computed } from 'vue'
import { useCustomModulesStore } from '../stores/customModulesStore'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
const customStore = useCustomModulesStore()
routineStore.initialize()
disciplineStore.initialize()
customStore.initialize()

const weekDays = computed(() => {
  const today = new Date()
  const monday = new Date(today)
  const offset = today.getDay() === 0 ? -6 : 1 - today.getDay()
  monday.setDate(today.getDate() + offset)

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday)
    date.setDate(monday.getDate() + index)
    return date
  })
})

const weeklyRows = computed(() =>
  weekDays.value.map((date) => {
    const dateKey = localDateKey(date)
    const record = disciplineStore.recordByDate(dateKey)
    const planned = record?.plannedHabitCount ?? routineStore.activeRoutine?.habits.length ?? 0
    const completed = record?.entries.filter((entry) => entry.completed).length || 0

    return {
      date: dateKey,
      label: date.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      planned,
      completed,
      percentage: planned ? Math.round((completed / planned) * 100) : 0,
    }
  }),
)

const plannedTotal = computed(() => weeklyRows.value.reduce((sum, day) => sum + day.planned, 0))
const completedTotal = computed(() => weeklyRows.value.reduce((sum, day) => sum + day.completed, 0))
const weeklyPercentage = computed(() =>
  plannedTotal.value ? Math.round((completedTotal.value / plannedTotal.value) * 100) : 0,
)

const customRows = computed(() =>
  customStore.modules.map((module) => {
    const recordsThisWeek = (module.records || []).filter((record) => weekDays.value.some((date) => localDateKey(date) === record.recordDate))
    return {
      id: module.id,
      name: module.name,
      total: module.records?.length || 0,
      week: recordsThisWeek.length,
      goal: module.goal || '-',
      last: module.records?.[0]?.recordDate || null,
    }
  }),
)

function formatDate(date) {
  if (!date) return 'sem registro'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}
</script>

<template>
  <section class="page-section">
    <div class="page-title">
      <span class="eyebrow">Relatórios</span>
      <h2>Acompanhe sua evolução semanal.</h2>
      <p>O cálculo usa os hábitos planejados em cada dia e preserva o histórico das rotinas anteriores.</p>
    </div>

    <div class="stats-grid report-stats">
      <article class="stat-card stat-card-primary">
        <span>Hábitos planejados</span>
        <strong>{{ plannedTotal }}</strong>
        <p>{{ routineStore.activeRoutine?.habits.length || 0 }} hábitos na rotina ativa</p>
      </article>
      <article class="stat-card">
        <span>Hábitos concluídos</span>
        <strong>{{ completedTotal }}</strong>
        <p>registros desta semana</p>
      </article>
      <article class="stat-card">
        <span>Porcentagem semanal</span>
        <strong>{{ weeklyPercentage }}%</strong>
        <p>meta mínima: 70%</p>
      </article>
    </div>

    <article class="panel weekly-panel">
      <div class="section-header">
        <div>
          <span class="eyebrow">Semana atual</span>
          <h3>Desempenho por dia</h3>
        </div>
      </div>

      <div class="weekly-list">
        <div v-for="day in weeklyRows" :key="day.date" class="weekly-row">
          <strong>{{ day.label }}</strong>
          <div class="weekly-progress">
            <div :style="{ width: `${day.percentage}%` }"></div>
          </div>
          <span>{{ day.completed }}/{{ day.planned }}</span>
          <strong>{{ day.percentage }}%</strong>
        </div>
      </div>
    </article>

    <article class="panel weekly-panel">
      <div class="section-header">
        <div>
          <span class="eyebrow">Módulos personalizados</span>
          <h3>Uso dos seus acompanhamentos</h3>
        </div>
      </div>

      <div v-if="customRows.length" class="custom-report-list">
        <RouterLink v-for="row in customRows" :key="row.id" :to="`/modulos/${row.id}`" class="custom-report-row">
          <strong>{{ row.name || 'Módulo sem nome' }}</strong>
          <span>{{ row.total }} registros</span>
          <span>{{ row.week }} nesta semana</span>
          <span>Meta: {{ row.goal }}</span>
          <span>Último: {{ formatDate(row.last) }}</span>
        </RouterLink>
      </div>

      <div v-else class="empty-state compact-empty">
        <h3>Nenhum módulo personalizado</h3>
        <p>Crie módulos próprios para ver relatórios de uso por aqui.</p>
      </div>
    </article>
  </section>
</template>
