<script setup>
import { ref } from 'vue'
import BookCard from '../components/BookCard.vue'
import BookForm from '../components/BookForm.vue'
import StatCard from '../components/StatCard.vue'
import { useBooksStore } from '../stores/booksStore'

const booksStore = useBooksStore()
booksStore.initialize()

const editorOpen = ref(false)
const editingBook = ref(null)
const message = ref('')

function notify(text) {
  message.value = text
  window.setTimeout(() => {
    if (message.value === text) message.value = ''
  }, 3500)
}

function openNewBook() {
  editingBook.value = null
  editorOpen.value = true
}

function openEdit(book) {
  editingBook.value = book
  editorOpen.value = true
}

async function saveBook(data) {
  if (editingBook.value) {
    await booksStore.updateBook(editingBook.value.id, data)
    notify('Livro atualizado.')
  } else {
    await booksStore.createBook(data)
    notify('Livro adicionado.')
  }
  editorOpen.value = false
  editingBook.value = null
}

async function deleteBook(book) {
  if (!book || !window.confirm(`Excluir "${book.title || 'este livro'}"?`)) return
  await booksStore.deleteBook(book.id)
  notify('Livro removido.')
}
</script>

<template>
  <section class="page-section tracker-page">
    <div class="page-title page-title-with-action">
      <div>
        <span class="eyebrow">Livros</span>
        <h2>Organize leituras e progresso.</h2>
        <p>Cadastre livros, atualize páginas lidas e acompanhe seu ritmo de leitura.</p>
      </div>
      <button class="btn-primary" type="button" @click="openNewBook">Novo livro</button>
    </div>

    <p v-if="message" class="feedback-message">{{ message }}</p>

    <div class="stats-grid tracker-stats">
      <StatCard title="Livros cadastrados" :value="String(booksStore.totalBooks)" subtitle="incluindo sugestões" type="primary" />
      <StatCard title="Em andamento" :value="String(booksStore.readingBooks.length)" subtitle="status lendo" />
      <StatCard title="Concluídos" :value="String(booksStore.completedBooks.length)" subtitle="leituras finalizadas" />
      <StatCard title="Páginas lidas" :value="String(booksStore.pagesRead)" :subtitle="`${booksStore.generalProgress}% geral`" />
    </div>

    <article v-if="editorOpen" class="panel editor-panel">
      <BookForm :book="editingBook" @save="saveBook" @cancel="editorOpen = false" />
    </article>

    <p v-if="booksStore.usingLocalFallback" class="feedback-message feedback-warning">
      Salvando temporariamente no navegador até a tabela de livros estar disponível no Supabase.
    </p>

    <div v-if="booksStore.books.length" class="tracker-grid">
      <BookCard v-for="book in booksStore.books" :key="book.id" :book="book" @edit="openEdit" @delete="deleteBook" />
    </div>

    <div v-else class="panel empty-state">
      <h3>Nenhum livro cadastrado</h3>
      <p>Adicione seu primeiro livro para começar a acompanhar a leitura.</p>
      <button class="btn-primary empty-action" type="button" @click="openNewBook">Adicionar primeiro livro</button>
    </div>
  </section>
</template>
