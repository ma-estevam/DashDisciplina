import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'disciplina_247_exceptions_v1'

const defaultExceptions = [
  {
    id: 'f189b790-5b55-46b1-92b4-1116b81f1d7a',
    date: '2026-07-05',
    title: 'Dia de descanso e recuperação',
    description: 'Manter leitura leve, organização da semana e crochê se possível.',
    type: 'Descanso',
    minimumHabits: 2,
    notes: '',
    showOnDashboard: true,
  },
  {
    id: 'f7a4c1b4-3434-4c80-98d5-2957a87fbe8f',
    date: '2026-07-16',
    title: 'Rotina reduzida',
    description: 'Priorizar treino curto, estudo essencial e descanso.',
    type: 'Rotina reduzida',
    minimumHabits: 3,
    notes: '',
    showOnDashboard: true,
  },
  {
    id: '8814b172-3769-423d-8c77-43b49733cf3c',
    date: '2026-08-15',
    title: 'Dia flexível',
    description: 'Usar para descanso, crochê, organização pessoal e preparação.',
    type: 'Flexível',
    minimumHabits: 2,
    notes: '',
    showOnDashboard: true,
  },
  {
    id: '734ac20d-5523-40f7-ae79-f194d78ed6ef',
    date: '2026-08-25',
    title: 'Rotina mínima',
    description: 'Priorizar estudo importante, alimentação organizada e descanso.',
    type: 'Rotina mínima',
    minimumHabits: 2,
    notes: '',
    showOnDashboard: true,
  },
]

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { version: 1, users: {} }
  } catch {
    return { version: 1, users: {} }
  }
}

function safeId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '')
    ? id
    : crypto.randomUUID()
}

function normalizeException(row) {
  return {
    id: safeId(row.id),
    date: row.exception_date || row.date,
    title: row.title || 'Exceção sem título',
    description: row.description || '',
    type: row.type || 'Exceção',
    minimumHabits: Number(row.minimum_habits ?? row.minimumHabits ?? 1) || 1,
    notes: row.notes || '',
    showOnDashboard: row.show_on_dashboard ?? row.showOnDashboard ?? true,
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt || new Date().toISOString(),
  }
}

function toSupabase(exception, userId) {
  return {
    id: exception.id,
    user_id: userId,
    exception_date: exception.date,
    title: exception.title,
    description: exception.description,
    type: exception.type,
    minimum_habits: Number(exception.minimumHabits) || 1,
    notes: exception.notes || '',
    show_on_dashboard: Boolean(exception.showOnDashboard),
    updated_at: new Date().toISOString(),
  }
}

export const useExceptionStore = defineStore('exceptions', {
  state: () => ({
    userId: null,
    exceptions: [],
    loading: false,
    usingLocalFallback: false,
  }),

  getters: {
    sortedExceptions: (state) =>
      [...state.exceptions].sort((a, b) => a.date.localeCompare(b.date)),

    dashboardExceptions: (state) =>
      [...state.exceptions]
        .filter((item) => item.showOnDashboard)
        .sort((a, b) => a.date.localeCompare(b.date)),

    getExceptionByDate: (state) => (date) =>
      state.exceptions.find((item) => item.date === date) || null,
  },

  actions: {
    async initialize() {
      await this.loadExceptions()
    },

    loadLocal(userId) {
      const storage = readStorage()
      const userData = storage.users[userId]

      if (Array.isArray(userData?.exceptions)) {
        this.exceptions = userData.exceptions.map(normalizeException)
      } else {
        this.exceptions = defaultExceptions.map((item) => normalizeException(item))
        storage.users[userId] = { exceptions: this.exceptions }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      }
    },

    persistLocal() {
      if (!this.userId) return
      const storage = readStorage()
      storage.users[this.userId] = { exceptions: this.exceptions }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    },

    async loadExceptions() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id

      if (!userId) {
        this.userId = null
        this.exceptions = []
        return
      }

      this.loading = true
      this.userId = userId

      try {
        const { data, error } = await supabase
          .from('routine_exceptions')
          .select('*')
          .eq('user_id', userId)
          .order('exception_date', { ascending: true })

        if (error) throw error

        if (data?.length) {
          this.exceptions = data.map(normalizeException)
        } else {
          this.exceptions = defaultExceptions.map((item) => normalizeException(item))
          await Promise.all(
            this.exceptions.map((exception) =>
              supabase.from('routine_exceptions').upsert(toSupabase(exception, userId)),
            ),
          )
        }

        this.usingLocalFallback = false
        this.persistLocal()
      } catch {
        this.usingLocalFallback = true
        this.loadLocal(userId)
      } finally {
        this.loading = false
      }
    },

    async saveException(exceptionData) {
      const now = new Date().toISOString()
      const exception = normalizeException({
        id: exceptionData.id || crypto.randomUUID(),
        date: exceptionData.date,
        title: exceptionData.title?.trim() || 'Exceção sem título',
        description: exceptionData.description?.trim() || '',
        type: exceptionData.type?.trim() || 'Exceção',
        minimumHabits: exceptionData.minimumHabits,
        notes: exceptionData.notes?.trim() || '',
        showOnDashboard: exceptionData.showOnDashboard,
        createdAt: exceptionData.createdAt || now,
        updatedAt: now,
      })

      const sameDate = this.exceptions.find((item) => item.date === exception.date && item.id !== exception.id)

      if (!exceptionData.id && sameDate) {
        exception.id = sameDate.id
      }

      const existing = this.exceptions.find((item) => item.id === exception.id)

      if (existing) {
        Object.assign(existing, exception)
      } else {
        this.exceptions.push(exception)
      }

      this.persistLocal()

      if (!this.usingLocalFallback && this.userId) {
        try {
          await supabase.from('routine_exceptions').upsert(toSupabase(exception, this.userId))
        } catch {
          this.usingLocalFallback = true
        }
      }

      return exception
    },

    async deleteException(exceptionId) {
      this.exceptions = this.exceptions.filter((item) => item.id !== exceptionId)
      this.persistLocal()

      if (!this.usingLocalFallback && this.userId) {
        try {
          await supabase.from('routine_exceptions').delete().eq('id', exceptionId).eq('user_id', this.userId)
        } catch {
          this.usingLocalFallback = true
        }
      }
    },
  },
})
