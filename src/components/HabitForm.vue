<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  habit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const weekDays = [
  { value: 'mon', label: 'Seg' },
  { value: 'tue', label: 'Ter' },
  { value: 'wed', label: 'Qua' },
  { value: 'thu', label: 'Qui' },
  { value: 'fri', label: 'Sex' },
  { value: 'sat', label: 'Sáb' },
  { value: 'sun', label: 'Dom' },
]

const form = reactive({
  name: '',
  description: '',
  dailyGoal: '',
  unit: '',
  frequency: 'daily',
  targetDays: [],
  isRequired: true,
  requiresEvidence: false,
})

watch(
  () => props.habit,
  (habit) => {
    form.name = habit?.name || ''
    form.description = habit?.description || ''
    form.dailyGoal = habit?.dailyGoal ?? ''
    form.unit = habit?.unit || ''
    form.frequency = habit?.frequency || 'daily'
    form.targetDays = [...(habit?.targetDays || [])]
    form.isRequired = habit?.isRequired ?? true
    form.requiresEvidence = Boolean(habit?.requiresEvidence)
  },
  { immediate: true },
)

function submit() {
  if (!form.name.trim()) return
  emit('save', { id: props.habit?.id, ...form, name: form.name.trim() })
}
</script>

<template>
  <form class="editor-form inline-editor" @submit.prevent="submit">
    <div class="form-grid">
      <div class="form-group">
        <label for="habit-name">Nome</label>
        <input id="habit-name" v-model="form.name" required maxlength="60" placeholder="Ex: Leitura" />
      </div>
      <div class="form-group">
        <label for="habit-description">Descrição</label>
        <input id="habit-description" v-model="form.description" maxlength="160" placeholder="Objetivo do hábito" />
      </div>
      <div class="form-group">
        <label for="habit-goal">Valor da meta</label>
        <input id="habit-goal" v-model="form.dailyGoal" min="0" step="0.1" type="number" placeholder="Ex: 30" />
      </div>
      <div class="form-group">
        <label for="habit-unit">Unidade</label>
        <select id="habit-unit" v-model="form.unit">
          <option value="">Sem unidade</option>
          <option value="minutos">Minutos</option>
          <option value="horas">Horas</option>
          <option value="páginas">Páginas</option>
          <option value="vezes">Vezes</option>
        </select>
      </div>
      <div class="form-group">
        <label for="habit-frequency">Frequência</label>
        <select id="habit-frequency" v-model="form.frequency">
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="free">Livre</option>
        </select>
      </div>
    </div>

    <div class="form-group">
      <label>Dias alvo</label>
      <div class="toggle-row">
        <label v-for="day in weekDays" :key="day.value" class="check-field">
          <input v-model="form.targetDays" type="checkbox" :value="day.value" />
          {{ day.label }}
        </label>
      </div>
    </div>

    <div class="toggle-row">
      <label class="check-field">
        <input v-model="form.isRequired" type="checkbox" />
        Hábito obrigatório
      </label>

      <label class="check-field">
        <input v-model="form.requiresEvidence" type="checkbox" />
        Exigir evidência para este hábito
      </label>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ habit ? 'Atualizar' : 'Adicionar hábito' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
