<script setup>
import { reactive, watch } from 'vue'
import { COURSE_CATEGORIES } from '../stores/coursesStore'

const props = defineProps({
  course: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  name: '',
  platform: '',
  category: COURSE_CATEGORIES[0],
  status: 'não iniciado',
  totalHours: 0,
  completedHours: 0,
  startDate: '',
  finishDate: '',
  courseUrl: '',
  notes: '',
})

watch(
  () => props.course,
  (course) => {
    form.name = course?.name || ''
    form.platform = course?.platform || ''
    form.category = course?.category || COURSE_CATEGORIES[0]
    form.status = course?.status || 'não iniciado'
    form.totalHours = course?.totalHours || 0
    form.completedHours = course?.completedHours || 0
    form.startDate = course?.startDate || ''
    form.finishDate = course?.finishDate || ''
    form.courseUrl = course?.courseUrl || ''
    form.notes = course?.notes || ''
  },
  { immediate: true },
)

function submit() {
  if (!form.name.trim()) return
  emit('save', {
    ...form,
    name: form.name.trim(),
    totalHours: Number(form.totalHours || 0),
    completedHours: Math.min(Number(form.completedHours || 0), Number(form.totalHours || 0) || Number(form.completedHours || 0)),
  })
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <div class="form-grid">
      <div class="form-group">
        <label for="course-name">Nome do curso</label>
        <input id="course-name" v-model="form.name" required maxlength="140" />
      </div>
      <div class="form-group">
        <label for="course-platform">Plataforma</label>
        <input id="course-platform" v-model="form.platform" maxlength="100" />
      </div>
      <div class="form-group">
        <label for="course-category">Categoria</label>
        <select id="course-category" v-model="form.category">
          <option v-for="category in COURSE_CATEGORIES" :key="category">{{ category }}</option>
        </select>
      </div>
      <div class="form-group">
        <label for="course-status">Status</label>
        <select id="course-status" v-model="form.status">
          <option>não iniciado</option>
          <option>em andamento</option>
          <option>concluído</option>
          <option>pausado</option>
        </select>
      </div>
      <div class="form-group">
        <label for="course-total">Carga horária total</label>
        <input id="course-total" v-model.number="form.totalHours" type="number" min="0" step="0.5" />
      </div>
      <div class="form-group">
        <label for="course-completed">Horas concluídas</label>
        <input id="course-completed" v-model.number="form.completedHours" type="number" min="0" step="0.5" />
      </div>
      <div class="form-group">
        <label for="course-start">Início</label>
        <input id="course-start" v-model="form.startDate" type="date" />
      </div>
      <div class="form-group">
        <label for="course-finish">Conclusão</label>
        <input id="course-finish" v-model="form.finishDate" type="date" />
      </div>
    </div>

    <div class="form-group">
      <label for="course-url">Link do curso</label>
      <input id="course-url" v-model="form.courseUrl" type="url" placeholder="https://" />
    </div>

    <div class="form-group">
      <label for="course-notes">Observação</label>
      <textarea id="course-notes" v-model="form.notes"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ course ? 'Salvar alterações' : 'Adicionar curso' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
