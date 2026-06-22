<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  activity: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  startTime: '',
  endTime: '',
  title: '',
  description: '',
})

watch(
  () => props.activity,
  (activity) => {
    form.startTime = activity?.startTime || ''
    form.endTime = activity?.endTime || ''
    form.title = activity?.title || ''
    form.description = activity?.description || ''
  },
  { immediate: true },
)

function submit() {
  if (!form.startTime || !form.endTime || !form.title.trim()) return
  emit('save', { id: props.activity?.id, ...form })
}
</script>

<template>
  <form class="editor-form inline-editor" @submit.prevent="submit">
    <div class="form-grid activity-form-grid">
      <div class="form-group">
        <label for="activity-start">Início</label>
        <input id="activity-start" v-model="form.startTime" required type="time" />
      </div>
      <div class="form-group">
        <label for="activity-end">Fim</label>
        <input id="activity-end" v-model="form.endTime" required type="time" />
      </div>
      <div class="form-group form-span-2">
        <label for="activity-title">Atividade</label>
        <input id="activity-title" v-model="form.title" required maxlength="70" placeholder="Ex: Estudo de Vue" />
      </div>
    </div>

    <div class="form-group">
      <label for="activity-description">Descrição</label>
      <textarea id="activity-description" v-model="form.description" maxlength="180" placeholder="Detalhes opcionais"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ activity ? 'Atualizar' : 'Adicionar atividade' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
