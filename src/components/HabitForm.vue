<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  habit: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: '',
  description: '',
  dailyGoal: '',
  unit: '',
  requiresEvidence: false,
})

watch(
  () => props.habit,
  (habit) => {
    form.name = habit?.name || ''
    form.description = habit?.description || ''
    form.dailyGoal = habit?.dailyGoal ?? ''
    form.unit = habit?.unit || ''
    form.requiresEvidence = habit?.requiresEvidence || false
  },
  { immediate: true },
)

function submit() {
  if (!form.name.trim()) return
  emit('save', { id: props.habit?.id, ...form })
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
        <label for="habit-goal">Meta diária (opcional)</label>
        <input id="habit-goal" v-model="form.dailyGoal" min="0" step="0.1" type="number" placeholder="Ex: 30" />
      </div>
      <div class="form-group">
        <label for="habit-unit">Unidade (opcional)</label>
        <select id="habit-unit" v-model="form.unit">
          <option value="">Sem unidade</option>
          <option value="minutos">Minutos</option>
          <option value="horas">Horas</option>
          <option value="páginas">Páginas</option>
          <option value="vezes">Vezes</option>
        </select>
      </div>
    </div>

    <label class="check-field">
      <input v-model="form.requiresEvidence" type="checkbox" />
      <span>Exigir evidência para este hábito</span>
    </label>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ habit ? 'Atualizar' : 'Adicionar hábito' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
