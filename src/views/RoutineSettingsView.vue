<script setup>
import { computed, ref } from 'vue'
import HabitForm from '../components/HabitForm.vue'
import RoutineActivityForm from '../components/RoutineActivityForm.vue'
import RoutineForm from '../components/RoutineForm.vue'
import { useRoutineStore } from '../stores/routineStore'

const routineStore = useRoutineStore()
routineStore.initialize()

const selectedRoutineId = ref(routineStore.activeRoutineId)
const routineEditorOpen = ref(false)
const activityEditorOpen = ref(false)
const habitEditorOpen = ref(false)
const editingRoutine = ref(null)
const editingActivity = ref(null)
const editingHabit = ref(null)
const message = ref('')
const messageType = ref('success')

const selectedRoutine = computed(
  () =>
    routineStore.routines.find((routine) => routine.id === selectedRoutineId.value) ||
    routineStore.activeRoutine,
)

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3500)
}

function openNewRoutine() {
  editingRoutine.value = null
  routineEditorOpen.value = true
}

function openRoutineEdit() {
  editingRoutine.value = selectedRoutine.value
  routineEditorOpen.value = true
}

function saveRoutine(data) {
  if (editingRoutine.value) {
    routineStore.updateRoutine(editingRoutine.value.id, data)
    notify('Rotina atualizada com sucesso.')
  } else {
    const routine = routineStore.createRoutine(data)
    selectedRoutineId.value = routine.id
    notify('Nova rotina criada.')
  }
  routineEditorOpen.value = false
}

function activateRoutine(routineId) {
  routineStore.setActiveRoutine(routineId)
  selectedRoutineId.value = routineId
  notify('Rotina ativa alterada.')
}

function removeRoutine() {
  const routine = selectedRoutine.value
  if (!routine || !window.confirm(`Excluir a rotina "${routine.name}"?`)) return

  try {
    routineStore.deleteRoutine(routine.id)
    selectedRoutineId.value = routineStore.activeRoutineId
    notify('Rotina excluída.')
  } catch (error) {
    notify(error.message, 'error')
  }
}

function openActivity(activity = null) {
  editingActivity.value = activity
  activityEditorOpen.value = true
}

function saveActivity(data) {
  routineStore.saveActivity(selectedRoutine.value.id, data)
  activityEditorOpen.value = false
  editingActivity.value = null
  notify(data.id ? 'Atividade atualizada.' : 'Atividade adicionada.')
}

function removeActivity(activity) {
  if (!window.confirm(`Excluir a atividade "${activity.title}"?`)) return
  routineStore.deleteActivity(selectedRoutine.value.id, activity.id)
  notify('Atividade excluída.')
}

function openHabit(habit = null) {
  editingHabit.value = habit
  habitEditorOpen.value = true
}

function saveHabit(data) {
  routineStore.saveHabit(selectedRoutine.value.id, data)
  habitEditorOpen.value = false
  editingHabit.value = null
  notify(data.id ? 'Hábito atualizado.' : 'Hábito adicionado.')
}

function removeHabit(habit) {
  if (!window.confirm(`Excluir o hábito "${habit.name}"? Os registros anteriores serão preservados.`)) return
  routineStore.deleteHabit(selectedRoutine.value.id, habit.id)
  notify('Hábito excluído.')
}
</script>

<template>
  <section class="page-section routine-settings-page">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Configuração de rotina</span>
        <h2>Monte uma rotina que cabe na sua vida.</h2>
        <p>Crie rotinas, organize horários e escolha os hábitos que deseja acompanhar.</p>
      </div>
      <button class="btn-primary" type="button" @click="openNewRoutine">Nova rotina</button>
    </div>

    <p v-if="message" :class="['feedback-message', `feedback-${messageType}`]">
      {{ message }}
    </p>

    <RoutineForm
      v-if="routineEditorOpen"
      class="panel editor-panel"
      :routine="editingRoutine"
      @save="saveRoutine"
      @cancel="routineEditorOpen = false"
    />

    <div v-if="routineStore.routines.length" class="routine-options">
      <article
        v-for="routine in routineStore.routines"
        :key="routine.id"
        :class="['routine-option-card', { active: selectedRoutine?.id === routine.id }]"
        @click="selectedRoutineId = routine.id"
      >
        <div class="routine-option-header">
          <span>{{ routine.id === routineStore.activeRoutineId ? 'Ativa agora' : 'Disponível' }}</span>
          <strong>{{ routine.name }}</strong>
        </div>
        <p>{{ routine.description || 'Sem descrição.' }}</p>
        <small>{{ routine.activities.length }} atividades · {{ routine.habits.length }} hábitos</small>
        <button
          v-if="routine.id !== routineStore.activeRoutineId"
          class="btn-compact"
          type="button"
          @click.stop="activateRoutine(routine.id)"
        >
          Tornar ativa
        </button>
      </article>
    </div>

    <template v-if="selectedRoutine">
      <div class="routine-toolbar panel">
        <div>
          <span class="eyebrow">Editando</span>
          <h3>{{ selectedRoutine.name }}</h3>
          <p>{{ selectedRoutine.description || 'Adicione uma descrição para esta rotina.' }}</p>
        </div>
        <div class="form-actions">
          <button class="btn-ghost" type="button" @click="openRoutineEdit">Editar dados</button>
          <button class="btn-danger" type="button" @click="removeRoutine">Excluir rotina</button>
        </div>
      </div>

      <section class="settings-section panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Agenda</span>
            <h3>Atividades e horários</h3>
          </div>
          <button class="btn-compact" type="button" @click="openActivity()">Adicionar atividade</button>
        </div>

        <RoutineActivityForm
          v-if="activityEditorOpen"
          :activity="editingActivity"
          @save="saveActivity"
          @cancel="activityEditorOpen = false"
        />

        <div v-if="selectedRoutine.activities.length" class="editable-list">
          <article v-for="activity in selectedRoutine.activities" :key="activity.id" class="editable-item">
            <div class="time-range">
              <strong>{{ activity.startTime }}</strong>
              <span>até {{ activity.endTime }}</span>
            </div>
            <div class="editable-item-content">
              <strong>{{ activity.title }}</strong>
              <p>{{ activity.description || 'Sem descrição.' }}</p>
            </div>
            <div class="item-actions">
              <button type="button" @click="openActivity(activity)">Editar</button>
              <button class="danger-link" type="button" @click="removeActivity(activity)">Excluir</button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state compact-empty">
          <h3>Nenhuma atividade cadastrada</h3>
          <p>Adicione horários para montar a timeline desta rotina.</p>
        </div>
      </section>

      <section class="settings-section panel">
        <div class="section-header">
          <div>
            <span class="eyebrow">Hábitos</span>
            <h3>Checklist da rotina</h3>
          </div>
          <button class="btn-compact" type="button" @click="openHabit()">Adicionar hábito</button>
        </div>

        <HabitForm
          v-if="habitEditorOpen"
          :habit="editingHabit"
          @save="saveHabit"
          @cancel="habitEditorOpen = false"
        />

        <div v-if="selectedRoutine.habits.length" class="editable-list habit-editable-list">
          <article v-for="habit in selectedRoutine.habits" :key="habit.id" class="editable-item">
            <div class="habit-icon">{{ habit.name.charAt(0).toUpperCase() }}</div>
            <div class="editable-item-content">
              <strong>{{ habit.name }}</strong>
              <p>{{ habit.description || 'Sem descrição.' }}</p>
              <small>
                {{ habit.dailyGoal ? `Meta: ${habit.dailyGoal} ${habit.unit}` : 'Sem meta numérica' }}
                · {{ habit.requiresEvidence ? 'Exige evidência' : 'Evidência opcional' }}
              </small>
            </div>
            <div class="item-actions">
              <button type="button" @click="openHabit(habit)">Editar</button>
              <button class="danger-link" type="button" @click="removeHabit(habit)">Excluir</button>
            </div>
          </article>
        </div>
        <div v-else class="empty-state compact-empty">
          <h3>Nenhum hábito cadastrado</h3>
          <p>Adicione hábitos para habilitar o registro diário e os relatórios.</p>
        </div>
      </section>
    </template>
  </section>
</template>
