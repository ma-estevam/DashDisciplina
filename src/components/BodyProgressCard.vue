<script setup>
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps({
  record: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

function formatDate(date) {
  if (!date) return 'Sem data'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}
</script>

<template>
  <article class="tracker-card body-progress-card">
    <img v-if="record.photoUrl" :src="record.photoUrl" alt="Foto de evolução física" loading="lazy" />
    <div class="tracker-card-content">
      <span class="eyebrow">{{ formatDate(record.recordDate) }}</span>
      <h3>{{ record.weight || 0 }} kg</h3>
      <p>{{ record.goal || 'Objetivo não informado' }}</p>
      <div class="mini-metrics">
        <span>Altura: {{ record.height || '-' }} m</span>
        <span v-if="record.waist">Cintura: {{ record.waist }} cm</span>
        <span v-if="record.hip">Quadril: {{ record.hip }} cm</span>
        <span v-if="record.arm">Braço: {{ record.arm }} cm</span>
        <span v-if="record.leg">Perna: {{ record.leg }} cm</span>
        <span v-if="record.chest">Tórax: {{ record.chest }} cm</span>
      </div>
      <p v-if="record.notes" class="tracker-note">{{ record.notes }}</p>
      <div class="item-actions">
        <button type="button" @click="$emit('edit', record)">
          <Pencil class="button-icon" aria-hidden="true" />
          Editar
        </button>
        <button class="danger-link" type="button" @click="$emit('delete', record)">
          <Trash2 class="button-icon" aria-hidden="true" />
          Excluir
        </button>
      </div>
    </div>
  </article>
</template>
