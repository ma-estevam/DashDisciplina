<script setup>
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import { localDateKey, useDisciplineStore } from '../stores/disciplineStore'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
const disciplineStore = useDisciplineStore()
routineStore.initialize()
disciplineStore.initialize()

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
</script>

<template>
  <section class="dashboard-page">
    <div class="hero-panel">
      <div class="hero-content">
        <span class="eyebrow light">Rotina com propósito</span>
        <h2>{{ activeRoutine?.name || 'Crie sua primeira rotina.' }}</h2>
        <p>
          {{ activeRoutine?.description || 'Configure horários e hábitos para começar a acompanhar sua constância.' }}
        </p>
        <div class="hero-actions">
          <RouterLink to="/registro-diario" class="btn-primary">Registrar meu dia</RouterLink>
          <RouterLink to="/rotina" class="btn-secondary">Configurar rotina</RouterLink>
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
      <StatCard title="Progresso hoje" :value="`${progress}%`" subtitle="dos hábitos planejados" type="primary" />
      <StatCard title="Hábitos ativos" :value="String(activeRoutine?.habits.length || 0)" subtitle="na rotina atual" />
      <StatCard title="Atividades" :value="String(activeRoutine?.activities.length || 0)" subtitle="horários cadastrados" />
      <StatCard
        title="Primeiro compromisso"
        :value="firstActivity?.startTime || '—'"
        :subtitle="firstActivity?.title || 'agenda vazia'"
      />
    </div>

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
