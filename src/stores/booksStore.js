import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'disciplina_247_books_v1'

function createId() {
  return crypto.randomUUID()
}

function toBook(row) {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title || '',
    author: row.author || '',
    status: row.status || 'quero ler',
    totalPages: Number(row.total_pages || 0),
    currentPage: Number(row.current_page || 0),
    startDate: row.start_date || '',
    finishDate: row.finish_date || '',
    category: row.category || '',
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function toRow(book, userId) {
  return {
    user_id: userId,
    title: book.title || '',
    author: book.author || '',
    status: book.status || 'quero ler',
    total_pages: Number(book.totalPages || 0),
    current_page: Number(book.currentPage || 0),
    start_date: book.startDate || null,
    finish_date: book.finishDate || null,
    category: book.category || '',
    notes: book.notes || '',
  }
}

function defaultBooks(userId) {
  return [
    {
      id: 'suggested-bruxaria-raymond',
      userId,
      title: 'Bruxaria de Raymond',
      author: '',
      status: 'quero ler',
      totalPages: 0,
      currentPage: 0,
      startDate: '',
      finishDate: '',
      category: 'Sugestão',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'suggested-biblia-taro',
      userId,
      title: 'Bíblia Clássica do Tarô',
      author: '',
      status: 'quero ler',
      totalPages: 0,
      currentPage: 0,
      startDate: '',
      finishDate: '',
      category: 'Sugestão',
      notes: '',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'suggested-disciplina-liberdade',
      userId,
      title: 'Disciplina é Liberdade',
      author: '',
      status: 'quero ler',
      totalPages: 0,
      currentPage: 0,
      startDate: '',
      finishDate: '',
      category: 'Sugestão',
      notes: '',
      createdAt: new Date().toISOString(),
    },
  ]
}

function getLocalKey(userId) {
  return `${STORAGE_KEY}:${userId || 'guest'}`
}

function loadLocal(userId) {
  try {
    const saved = JSON.parse(localStorage.getItem(getLocalKey(userId)) || '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function saveLocal(userId, books) {
  localStorage.setItem(getLocalKey(userId), JSON.stringify(books))
}

export const useBooksStore = defineStore('books', {
  state: () => ({
    books: [],
    loading: false,
    usingLocalFallback: false,
    userId: null,
  }),

  getters: {
    totalBooks: (state) => state.books.length,
    readingBooks: (state) => state.books.filter((book) => book.status === 'lendo'),
    completedBooks: (state) => state.books.filter((book) => book.status === 'concluído'),
    pagesRead: (state) => state.books.reduce((sum, book) => sum + Number(book.currentPage || 0), 0),

    generalProgress(state) {
      const total = state.books.reduce((sum, book) => sum + Number(book.totalPages || 0), 0)
      if (!total) return 0
      return Math.round((this.pagesRead / total) * 100)
    },

    currentBook() {
      return this.readingBooks[0] || this.books[0] || null
    },
  },

  actions: {
    async initialize() {
      await this.loadBooks()
    },

    async loadBooks() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id
      this.userId = userId || null
      this.loading = true

      if (!userId) {
        this.books = loadLocal(null)
        if (!this.books.length) this.books = defaultBooks(null)
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('books')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.books = (data || []).map(toBook)
        this.usingLocalFallback = false
        if (!this.books.length) this.books = defaultBooks(userId)
      } catch {
        this.usingLocalFallback = true
        this.books = loadLocal(userId)
        if (!this.books.length) this.books = defaultBooks(userId)
      } finally {
        this.loading = false
      }
    },

    persistLocal() {
      saveLocal(this.userId, this.books)
    },

    async createBook(bookData) {
      const userId = useAuthStore().currentUser?.id || this.userId
      const localBook = { id: createId(), userId, createdAt: new Date().toISOString(), ...bookData }

      if (userId && !this.usingLocalFallback) {
        try {
          const { data, error } = await supabase.from('books').insert(toRow(localBook, userId)).select().single()
          if (error) throw error
          const created = toBook(data)
          this.books.unshift(created)
          return created
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.books.unshift(localBook)
      this.persistLocal()
      return localBook
    },

    async updateBook(bookId, bookData) {
      const index = this.books.findIndex((book) => book.id === bookId)
      if (index === -1) return
      const updated = { ...this.books[index], ...bookData }

      if (this.userId && !this.usingLocalFallback && !bookId.startsWith('suggested-')) {
        try {
          const { error } = await supabase
            .from('books')
            .update(toRow(updated, this.userId))
            .eq('id', bookId)
            .eq('user_id', this.userId)
          if (error) throw error
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.books[index] = updated
      this.persistLocal()
    },

    async deleteBook(bookId) {
      this.books = this.books.filter((book) => book.id !== bookId)
      if (this.userId && !this.usingLocalFallback && !bookId.startsWith('suggested-')) {
        try {
          await supabase.from('books').delete().eq('id', bookId).eq('user_id', this.userId)
        } catch {
          this.usingLocalFallback = true
        }
      }
      this.persistLocal()
    },
  },
})
