<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  record: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  recordDate: '',
  weight: 68,
  height: 1.7,
  goal: 'Ganho de massa corporal',
  notes: '',
  waist: '',
  hip: '',
  arm: '',
  leg: '',
  chest: '',
  photoUrl: '',
})

watch(
  () => props.record,
  (record) => {
    form.recordDate = record?.recordDate || new Date().toISOString().slice(0, 10)
    form.weight = record?.weight || 68
    form.height = record?.height || 1.7
    form.goal = record?.goal || 'Ganho de massa corporal'
    form.notes = record?.notes || ''
    form.waist = record?.waist ?? ''
    form.hip = record?.hip ?? ''
    form.arm = record?.arm ?? ''
    form.leg = record?.leg ?? ''
    form.chest = record?.chest ?? ''
    form.photoUrl = record?.photoUrl || ''
  },
  { immediate: true },
)

function handlePhoto(event) {
  const file = event.target.files?.[0]
  if (!file || !file.type.startsWith('image/')) return

  const reader = new FileReader()
  reader.onload = () => {
    form.photoUrl = reader.result
  }
  reader.readAsDataURL(file)
}

function submit() {
  emit('save', {
    ...form,
    weight: Number(form.weight || 0),
    height: Number(form.height || 0),
  })
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <div class="form-grid">
      <div class="form-group">
        <label for="body-date">Data</label>
        <input id="body-date" v-model="form.recordDate" type="date" required />
      </div>
      <div class="form-group">
        <label for="body-weight">Peso atual (kg)</label>
        <input id="body-weight" v-model.number="form.weight" type="number" min="0" step="0.1" required />
      </div>
      <div class="form-group">
        <label for="body-height">Altura (m)</label>
        <input id="body-height" v-model.number="form.height" type="number" min="0" step="0.01" required />
      </div>
      <div class="form-group">
        <label for="body-goal">Objetivo</label>
        <select id="body-goal" v-model="form.goal">
          <option>Ganho de massa corporal</option>
          <option>Manter peso</option>
          <option>Perder gordura</option>
          <option>Recomposição corporal</option>
        </select>
      </div>
    </div>

    <div class="form-grid measurements-grid">
      <div class="form-group">
        <label for="body-waist">Cintura (cm)</label>
        <input id="body-waist" v-model="form.waist" type="number" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label for="body-hip">Quadril (cm)</label>
        <input id="body-hip" v-model="form.hip" type="number" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label for="body-arm">Braço (cm)</label>
        <input id="body-arm" v-model="form.arm" type="number" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label for="body-leg">Perna (cm)</label>
        <input id="body-leg" v-model="form.leg" type="number" min="0" step="0.1" />
      </div>
      <div class="form-group">
        <label for="body-chest">Tórax (cm)</label>
        <input id="body-chest" v-model="form.chest" type="number" min="0" step="0.1" />
      </div>
    </div>

    <div class="form-group">
      <label for="body-notes">Observação</label>
      <textarea id="body-notes" v-model="form.notes" placeholder="Como foi sua evolução neste registro?"></textarea>
    </div>

    <div class="form-group">
      <label for="body-photo">Foto de evolução</label>
      <input id="body-photo" type="file" accept="image/*" @change="handlePhoto" />
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ record ? 'Salvar alterações' : 'Adicionar registro' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
