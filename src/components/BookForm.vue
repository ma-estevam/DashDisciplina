<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  book: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'cancel'])

const form = reactive({
  title: '',
  author: '',
  status: 'quero ler',
  totalPages: 0,
  currentPage: 0,
  startDate: '',
  finishDate: '',
  category: '',
  notes: '',
})

watch(
  () => props.book,
  (book) => {
    form.title = book?.title || ''
    form.author = book?.author || ''
    form.status = book?.status || 'quero ler'
    form.totalPages = book?.totalPages || 0
    form.currentPage = book?.currentPage || 0
    form.startDate = book?.startDate || ''
    form.finishDate = book?.finishDate || ''
    form.category = book?.category || ''
    form.notes = book?.notes || ''
  },
  { immediate: true },
)

function submit() {
  if (!form.title.trim()) return
  emit('save', {
    ...form,
    title: form.title.trim(),
    author: form.author.trim(),
    totalPages: Number(form.totalPages || 0),
    currentPage: Math.min(Number(form.currentPage || 0), Number(form.totalPages || 0) || Number(form.currentPage || 0)),
  })
}
</script>

<template>
  <form class="editor-form" @submit.prevent="submit">
    <div class="form-grid">
      <div class="form-group">
        <label for="book-title">Título</label>
        <input id="book-title" v-model="form.title" required maxlength="120" />
      </div>
      <div class="form-group">
        <label for="book-author">Autor</label>
        <input id="book-author" v-model="form.author" maxlength="100" />
      </div>
      <div class="form-group">
        <label for="book-status">Status</label>
        <select id="book-status" v-model="form.status">
          <option>quero ler</option>
          <option>lendo</option>
          <option>concluído</option>
          <option>pausado</option>
        </select>
      </div>
      <div class="form-group">
        <label for="book-category">Categoria</label>
        <input id="book-category" v-model="form.category" maxlength="80" />
      </div>
      <div class="form-group">
        <label for="book-total">Total de páginas</label>
        <input id="book-total" v-model.number="form.totalPages" type="number" min="0" />
      </div>
      <div class="form-group">
        <label for="book-current">Página atual</label>
        <input id="book-current" v-model.number="form.currentPage" type="number" min="0" />
      </div>
      <div class="form-group">
        <label for="book-start">Início</label>
        <input id="book-start" v-model="form.startDate" type="date" />
      </div>
      <div class="form-group">
        <label for="book-finish">Conclusão</label>
        <input id="book-finish" v-model="form.finishDate" type="date" />
      </div>
    </div>

    <div class="form-group">
      <label for="book-notes">Observação</label>
      <textarea id="book-notes" v-model="form.notes"></textarea>
    </div>

    <div class="form-actions">
      <button class="btn-primary" type="submit">{{ book ? 'Salvar alterações' : 'Adicionar livro' }}</button>
      <button class="btn-ghost" type="button" @click="$emit('cancel')">Cancelar</button>
    </div>
  </form>
</template>
