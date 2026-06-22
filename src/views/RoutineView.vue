<script setup>
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
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
          <span>{{ routine.badge }}</span>
          <strong>{{ routine.name }}</strong>
        </div>

        <p>{{ routine.description }}</p>
      </label>
    </div>

    <article class="panel">
      <div class="section-header">
        <div>
          <span class="eyebrow">Rotina ativa</span>
          <h3>{{ routineStore.activeRoutine.name }}</h3>
        </div>
      </div>

      <div class="timeline">
        <div
          v-for="item in routineStore.activeRoutine.schedule"
          :key="`${item.time}-${item.activity}`"
          class="timeline-item"
        >
          <span>{{ item.time }}</span>
          <p>{{ item.activity }}</p>
        </div>
      </div>
    </article>
  </section>
</template>