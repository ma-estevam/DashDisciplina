<script setup>
import {
  BookOpen,
  Droplets,
  Heart,
  Home,
  Moon,
  Pencil,
  Play,
  Smile,
  Sparkles,
  Target,
  Trash2,
  Wallet,
} from 'lucide-vue-next'

const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const icons = { Target, Droplets, Moon, Heart, Smile, BookOpen, Wallet, Home, Sparkles }

function formatDate(date) {
  if (!date) return 'sem registros'
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')
}

function lastRecord() {
  return props.module.records?.[0] || null
}
</script>

<template>
  <article class="tracker-card custom-module-card">
    <div class="tracker-card-content">
      <div class="custom-module-heading">
        <div class="custom-module-icon" :style="{ background: module.color || '#8f1828' }">
          <component :is="icons[module.icon] || Target" aria-hidden="true" />
        </div>
        <div>
          <span class="eyebrow">{{ module.trackingType || 'livre' }}</span>
          <h3>{{ module.name || 'Módulo sem nome' }}</h3>
        </div>
      </div>

      <p>{{ module.description || 'Sem descrição.' }}</p>
      <div class="mini-metrics">
        <span>{{ module.records?.length || 0 }} registros</span>
        <span>Último: {{ formatDate(lastRecord()?.recordDate) }}</span>
        <span v-if="module.goal">Meta: {{ module.goal }}</span>
      </div>

      <div class="item-actions">
        <RouterLink class="btn-compact" :to="`/modulos/${module.id}`">
          <Play class="button-icon" aria-hidden="true" />
          Acessar
        </RouterLink>
        <button type="button" @click="$emit('edit', module)">
          <Pencil class="button-icon" aria-hidden="true" />
          Editar
        </button>
        <button class="danger-link" type="button" @click="$emit('delete', module)">
          <Trash2 class="button-icon" aria-hidden="true" />
          Excluir
        </button>
      </div>
    </div>
  </article>
</template>
