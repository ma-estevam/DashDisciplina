import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'disciplina_247_discipline_v1'
const LEGACY_EVIDENCE_KEY = 'disciplina_247_evidencias'

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { version: 1, users: {} }
  } catch {
    return { version: 1, users: {} }
  }
}

function readLegacyEvidences() {
  try {
    return JSON.parse(localStorage.getItem(LEGACY_EVIDENCE_KEY)) || []
  } catch {
    return []
  }
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const useDisciplineStore = defineStore('discipline', {
  state: () => ({
    userId: null,
    records: [],
    evidences: [],
  }),

  getters: {
    recordByDate: (state) => (date) =>
      state.records.find((record) => record.date === date) || null,
    evidencesByDate: (state) => (date) =>
      state.evidences.filter((evidence) => evidence.date === date),
  },

  actions: {
    initialize() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id

      if (!userId) {
        this.userId = null
        this.records = []
        this.evidences = []
        return
      }

      if (this.userId === userId) return

      const storage = readStorage()
      let userData = storage.users[userId]

      if (!userData) {
        const legacyEvidences = readLegacyEvidences()

        userData = {
          records: [],
          evidences: legacyEvidences.map((item) => ({
            ...item,
            habitId: null,
            habitName: item.habit,
            routineId: null,
          })),
        }
        storage.users[userId] = userData
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      }

      this.userId = userId
      this.records = userData.records || []
      this.evidences = userData.evidences || []
    },

    persist() {
      if (!this.userId) return
      const storage = readStorage()
      storage.users[this.userId] = {
        records: this.records,
        evidences: this.evidences,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    },

    saveRecord({ date, routine, entries, note }) {
      const snapshot = {
        date,
        routineId: routine?.id || null,
        routineName: routine?.name || 'Rotina sem nome',
        plannedHabitCount: entries.length,
        entries: entries.map((entry) => ({ ...entry })),
        note: note?.trim() || '',
        updatedAt: new Date().toISOString(),
      }
      const existing = this.records.find((record) => record.date === date)

      if (existing) {
        Object.assign(existing, snapshot)
      } else {
        this.records.push({
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          ...snapshot,
        })
      }

      this.persist()
    },

    addEvidence(evidence) {
      const item = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...evidence,
      }
      this.evidences.push(item)
      this.persist()
      return item
    },

    deleteEvidence(evidenceId) {
      this.evidences = this.evidences.filter((item) => item.id !== evidenceId)
      for (const record of this.records) {
        for (const entry of record.entries) {
          entry.evidenceIds = (entry.evidenceIds || []).filter((id) => id !== evidenceId)
        }
      }
      this.persist()
    },
  },
})
