<script setup>
const props = defineProps({
  book: {
    type: Object,
    required: true,
  },
})

defineEmits(['edit', 'delete'])

const progress = () => {
  if (!props.book.totalPages) return 0
  return Math.min(100, Math.round((props.book.currentPage / props.book.totalPages) * 100))
}
</script>

<template>
  <article class="tracker-card">
    <div class="tracker-card-content">
      <span class="status-pill">{{ book.status || 'quero ler' }}</span>
      <h3>{{ book.title || 'Livro sem título' }}</h3>
      <p>{{ book.author || 'Autor não informado' }}</p>
      <div class="progress-bar progress-bar-light">
        <div :style="{ width: `${progress()}%` }"></div>
      </div>
      <small>{{ book.currentPage || 0 }}/{{ book.totalPages || 0 }} páginas · {{ progress() }}%</small>
      <p v-if="book.notes" class="tracker-note">{{ book.notes }}</p>
      <div class="item-actions">
        <button type="button" @click="$emit('edit', book)">Editar</button>
        <button class="danger-link" type="button" @click="$emit('delete', book)">Excluir</button>
      </div>
    </div>
  </article>
</template>
