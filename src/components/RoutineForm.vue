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
})

watch(
  () => props.routine,
  (routine) => {
    form.name = routine?.name || ''
    form.description = routine?.description || ''
    form.type = routine?.type || 'custom'
  },
  { immediate: true },
)

function submit() {
  if (!form.name.trim()) return
  emit('save', { ...form })
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
