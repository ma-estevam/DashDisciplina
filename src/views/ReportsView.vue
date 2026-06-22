<script setup>
import { computed } from 'vue'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
routineStore.initialize()
disciplineStore.initialize()

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
</script>

<template>
  <section class="page-section">
    <div class="page-title">
      <span class="eyebrow">Relatórios</span>
      <h2>Acompanhe sua evolução semanal.</h2>
      <p>O cálculo usa os hábitos realmente planejados em cada dia e preserva o histórico das rotinas anteriores.</p>
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
  </section>
</template>
