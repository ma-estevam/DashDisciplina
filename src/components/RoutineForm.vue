<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  routine: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: '',
  description: '',
  type: 'custom',
  icon: 'Target',
  color: '#8f1828',
  weeklyGoalPercent: 70,
  startDate: '',
  endDate: '',
})

watch(
  () => props.routine,
  (routine) => {
    form.name = routine?.name || ''
    form.description = routine?.description || ''
    form.type = routine?.type || 'custom'
    form.icon = routine?.icon || 'Target'
    form.color = routine?.color || '#8f1828'
    form.weeklyGoalPercent = routine?.weeklyGoalPercent || 70
    form.startDate = routine?.startDate || ''
    form.endDate = routine?.endDate || ''
  },
  { immediate: true },
)

function submit() {
  if (!form.name.trim()) return
  emit('save', { ...form, name: form.name.trim() })
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <div class="form-grid">
      <div class="form-group">
        <label for="routine-name">Nome</label>
        <input id="routine-name" v-model="form.name" required maxlength="60" placeholder="Ex: Rotina de Trabalho" />
      </div>

      <div class="form-group">
        <label for="routine-type">Tipo</label>
        <select id="routine-type" v-model="form.type">
          <option value="vacation">Férias</option>
          <option value="college">Faculdade</option>
          <option value="work">Trabalho</option>
          <option value="custom">Personalizada</option>
        </select>
      </div>

      <div class="form-group">
        <label for="routine-icon">Ícone</label>
        <input id="routine-icon" v-model="form.icon" maxlength="40" placeholder="Ex: Target, BookOpen" />
      </div>

      <div class="form-group">
        <label for="routine-color">Cor</label>
        <input id="routine-color" v-model="form.color" type="color" />
      </div>

      <div class="form-group">
        <label for="routine-weekly-goal">Meta semanal (%)</label>
        <input id="routine-weekly-goal" v-model.number="form.weeklyGoalPercent" min="0" max="100" type="number" />
      </div>

      <div class="form-group">
        <label for="routine-start">Data inicial</label>
        <input id="routine-start" v-model="form.startDate" type="date" />
      </div>

      <div class="form-group">
        <label for="routine-end">Data final</label>
        <input id="routine-end" v-model="form.endDate" type="date" />
      </div>
    </div>

    <div class="form-group">
      <label for="routine-description">Descrição</label>
      <textarea
        id="routine-description"
        v-model="form.description"
        maxlength="240"
        placeholder="Conte como esta rotina funciona."
      ></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">
        {{ routine ? 'Salvar alterações' : 'Criar rotina' }}
      </button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
