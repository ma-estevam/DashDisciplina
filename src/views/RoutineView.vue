<script setup>
import { computed } from 'vue'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
routineStore.initialize()

const activeRoutine = computed(() => routineStore.activeRoutine)
const activeActivities = computed(() => routineStore.activeActivities)
</script>

<template>
  <section class="page-section">
    <div class="page-title">
      <span class="eyebrow">Tipo de rotina</span>
      <h2>Escolha qual rotina está ativa agora.</h2>
      <p>
        Selecione entre rotina de férias ou rotina de faculdade. O Dashboard será atualizado automaticamente.
      </p>
    </div>

    <div class="routine-options">
      <label
        v-for="routine in routineStore.routines"
        :key="routine.id"
        :class="[
          'routine-option-card',
          { active: routineStore.currentRoutine === routine.id }
        ]"
      >
        <input
          type="radio"
          name="routine"
          :value="routine.id"
          :checked="routineStore.currentRoutine === routine.id"
          @change="routineStore.setRoutine(routine.id)"
        />

        <div class="routine-option-header">
          <span>{{ routine.type || 'Personalizada' }}</span>
          <strong>{{ routine.name || 'Rotina sem nome' }}</strong>
        </div>

        <p>{{ routine.description }}</p>
      </label>
    </div>

    <article v-if="activeRoutine" class="panel">
      <div class="section-header">
        <div>
          <span class="eyebrow">Rotina ativa</span>
          <h3>{{ routineStore.activeRoutineName }}</h3>
        </div>
      </div>

      <div v-if="activeActivities.length" class="timeline">
        <div
          v-for="item in activeActivities"
          :key="item.id"
          class="timeline-item"
        >
          <span>{{ item.startTime }}</span>
          <p><strong>{{ item.title }}</strong><small>até {{ item.endTime }}</small></p>
        </div>
      </div>
      <div v-else class="empty-state compact-empty">
        <h3>Agenda vazia</h3>
        <p>Cadastre atividades para montar a timeline desta rotina.</p>
      </div>
    </article>

    <article v-else class="panel empty-state">
      <h3>Nenhuma rotina ativa</h3>
      <p>Crie uma rotina para começar seus registros.</p>
    </article>
  </section>
</template>
