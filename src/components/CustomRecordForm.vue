<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  record: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  recordDate: '',
  values: {},
  evidenceUrl: '',
  notes: '',
})

watch(
  () => [props.module, props.record],
  () => {
    form.recordDate = props.record?.recordDate || new Date().toISOString().slice(0, 10)
    form.values = { ...(props.record?.values || {}) }
    form.evidenceUrl = props.record?.evidenceUrl || ''
    form.notes = props.record?.notes || ''
  },
  { immediate: true },
)

function handleEvidence(event) {
  const file = event.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    form.evidenceUrl = reader.result
  }
  reader.readAsDataURL(file)
}

function handleFieldImage(event, key) {
  const file = event.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = () => {
    form.values[key] = reader.result
  }
  reader.readAsDataURL(file)
}

function save() {
  emit('save', {
    recordDate: form.recordDate,
    values: form.values,
    evidenceUrl: form.evidenceUrl,
    notes: form.notes,
  })
}
</script>

<template>
  <form class="editor-form custom-record-form" @submit.prevent="save">
    <div class="form-group">
      <label for="custom-record-date">Data</label>
      <input id="custom-record-date" v-model="form.recordDate" type="date" required />
    </div>

    <div class="custom-record-fields">
      <div v-for="field in module.fields" :key="field.fieldKey" class="form-group">
        <label :for="`record-${field.fieldKey}`">{{ field.label }}</label>

        <textarea
          v-if="field.fieldType === 'long_text'"
          :id="`record-${field.fieldKey}`"
          v-model="form.values[field.fieldKey]"
          :required="field.required"
        ></textarea>

        <select
          v-else-if="field.fieldType === 'select'"
          :id="`record-${field.fieldKey}`"
          v-model="form.values[field.fieldKey]"
          :required="field.required"
        >
          <option value="">Selecionar</option>
          <option v-for="option in field.options" :key="option" :value="option">{{ option }}</option>
        </select>

        <label v-else-if="field.fieldType === 'checkbox'" class="check-field inline-check">
          <input v-model="form.values[field.fieldKey]" type="checkbox" />
          Marcar
        </label>

        <input
          v-else-if="field.fieldType === 'image'"
          :id="`record-${field.fieldKey}`"
          type="file"
          accept="image/*"
          @change="handleFieldImage($event, field.fieldKey)"
        />

        <input
          v-else
          :id="`record-${field.fieldKey}`"
          v-model="form.values[field.fieldKey]"
          :required="field.required"
          :type="
            field.fieldType === 'number' ||
            field.fieldType === 'percentage' ||
            field.fieldType === 'money' ||
            field.fieldType === 'scale_5' ||
            field.fieldType === 'scale_10'
              ? 'number'
              : field.fieldType === 'date'
                ? 'date'
                : field.fieldType === 'time'
                  ? 'time'
                  : 'text'
          "
          :min="field.fieldType === 'scale_5' || field.fieldType === 'scale_10' ? 1 : undefined"
          :max="field.fieldType === 'scale_5' ? 5 : field.fieldType === 'scale_10' ? 10 : undefined"
          :step="field.fieldType === 'money' ? '0.01' : undefined"
        />
      </div>
    </div>

    <div v-if="module.allowEvidence" class="form-group">
      <label for="custom-evidence">Evidência por foto</label>
      <input id="custom-evidence" type="file" accept="image/*" @change="handleEvidence" />
    </div>

    <div class="form-group">
      <label for="custom-notes">Observação</label>
      <textarea id="custom-notes" v-model="form.notes"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ record ? 'Salvar registro' : 'Adicionar registro' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
