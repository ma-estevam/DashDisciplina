<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  course: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const progress = () => {
  if (!props.course.totalHours) return 0
  return Math.min(100, Math.round((props.course.completedHours / props.course.totalHours) * 100))
}
</script>

<template>
  <article class="tracker-card">
    <div class="tracker-card-content">
      <span class="status-pill">{{ course.status || 'não iniciado' }}</span>
      <h3>{{ course.name || 'Curso sem nome' }}</h3>
      <p>{{ course.platform || 'Plataforma não informada' }} · {{ course.category || 'Sem categoria' }}</p>
      <div class="progress-bar progress-bar-light">
        <div :style="{ width: `${progress()}%` }"></div>
      </div>
      <small>{{ course.completedHours || 0 }}/{{ course.totalHours || 0 }} horas · {{ progress() }}%</small>
      <a v-if="course.courseUrl" class="text-link" :href="course.courseUrl" target="_blank" rel="noreferrer">abrir curso</a>
      <p v-if="course.notes" class="tracker-note">{{ course.notes }}</p>
      <div class="item-actions">
        <button type="button" @click="$emit('edit', course)">
          <Pencil class="button-icon" aria-hidden="true" />
          Editar
        </button>
        <button class="danger-link" type="button" @click="$emit('delete', course)">
          <Trash2 class="button-icon" aria-hidden="true" />
          Excluir
        </button>
      </div>
    </div>
  </article>
</template>
