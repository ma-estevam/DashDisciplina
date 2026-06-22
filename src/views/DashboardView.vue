<script setup>
import { computed } from 'vue'
import StatCard from '../components/StatCard.vue'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()

const activeRoutine = computed(() => routineStore.activeRoutine)

const habits = [
  {
    name: 'Treino',
    detail: '1h15 pela manhã',
    status: 'Pendente',
  },
  {
    name: 'Estudo',
    detail: 'Blocos de foco',
    status: 'Pendente',
  },
  {
    name: 'Cozinhar',
    detail: 'Alimentação organizada',
    status: 'Pendente',
  },
  {
    name: 'Leitura',
    detail: '10 a 20 minutos',
    status: 'Pendente',
  },
  {
    name: 'Crochê',
    detail: 'Descanso ativo',
    status: 'Pendente',
  },
  {
    name: 'Descanso',
    detail: 'Sono e pausa real',
    status: 'Pendente',
  },
]
</script>

<template>
  <section class="dashboard-page">
    <div class="hero-panel">
      <div class="hero-content">
        <span class="eyebrow light">Rotina com propósito</span>
        <h2>Construa disciplina com registros diários.</h2>
        <p>
          Acompanhe treino, estudos, cozinha, leitura, crochê e descanso em um só lugar.
          O objetivo inicial é cumprir pelo menos 70% da rotina semanal.
        </p>

        <div class="hero-actions">
          <RouterLink to="/registro-diario" class="btn-primary">
            Registrar meu dia
          </RouterLink>

          <RouterLink to="/relatorios" class="btn-secondary">
            Ver relatórios
          </RouterLink>
        </div>
      </div>

      <div class="hero-progress-card">
        <span>Progresso de hoje</span>
        <strong>0/6</strong>
        <p>hábitos concluídos</p>

        <div class="progress-bar">
          <div style="width: 0%"></div>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <StatCard title="Meta semanal" value="70%" subtitle="mínimo de constância" type="primary" />

      <StatCard title="Treino" value="1h15" subtitle="pela manhã" />

      <StatCard title="Rotina atual" :value="activeRoutine.name" :subtitle="activeRoutine.badge" />

      <StatCard title="Próxima exceção" value="05/07" subtitle="rotina reduzida" />
    </div>

    <section class="content-grid">
      <article class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Hábitos</span>
            <h3>Checklist do dia</h3>
          </div>

          <RouterLink to="/registro-diario" class="text-link">
            editar
          </RouterLink>
        </div>

        <div class="habits-grid">
          <div v-for="habit in habits" :key="habit.name" class="habit-card">
            <div>
              <strong>{{ habit.name }}</strong>
              <p>{{ habit.detail }}</p>
            </div>

            <span class="status-pill">{{ habit.status }}</span>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Agenda</span>
            <h3>Rotina base</h3>
          </div>
        </div>

        <div class="timeline">
  <div
    v-for="item in activeRoutine.schedule"
    :key="`${item.time}-${item.activity}`"
    class="timeline-item"
  >
    <span>{{ item.time }}</span>
    <p>{{ item.activity }}</p>
  </div>
</div>

          <div class="timeline-item">
            <span>08:10</span>
            <p>Estudo profundo</p>
          </div>

          <div class="timeline-item">
            <span>11:40</span>
            <p>Cozinhar e almoçar</p>
          </div>

          <div class="timeline-item">
            <span>17:20</span>
            <p>Crochê</p>
          </div>

          <div class="timeline-item">
            <span>22:30</span>
            <p>Preparar o dia seguinte</p>
          </div>
        
      </article>
    </section>
  </section>
</template>