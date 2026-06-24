import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'disciplina_247_body_progress_v1'

function createId() {
  return crypto.randomUUID()
}

function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toRecord(row) {
  return {
    id: row.id,
    userId: row.user_id,
    recordDate: row.record_date,
    weight: Number(row.weight || 0),
    height: Number(row.height || 0),
    goal: row.goal || '',
    notes: row.notes || '',
    waist: row.waist ?? '',
    hip: row.hip ?? '',
    arm: row.arm ?? '',
    leg: row.leg ?? '',
    chest: row.chest ?? '',
    photoUrl: row.photo_url || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function toRow(record, userId) {
  return {
    user_id: userId,
    record_date: record.recordDate,
    weight: Number(record.weight || 0),
    height: Number(record.height || 0),
    goal: record.goal || '',
    notes: record.notes || '',
    waist: record.waist === '' ? null : Number(record.waist),
    hip: record.hip === '' ? null : Number(record.hip),
    arm: record.arm === '' ? null : Number(record.arm),
    leg: record.leg === '' ? null : Number(record.leg),
    chest: record.chest === '' ? null : Number(record.chest),
    photo_url: record.photoUrl || null,
  }
}

function defaultRecord(userId) {
  return {
    id: 'initial-body-progress',
    userId,
    recordDate: localDateKey(),
    weight: 68,
    height: 1.7,
    goal: 'Ganho de massa corporal',
    notes: 'Registro inicial para acompanhamento pessoal.',
    waist: '',
    hip: '',
    arm: '',
    leg: '',
    chest: '',
    photoUrl: '',
    createdAt: new Date().toISOString(),
  }
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

function saveLocal(userId, records) {
  localStorage.setItem(getLocalKey(userId), JSON.stringify(records))
}

export const useBodyProgressStore = defineStore('bodyProgress', {
  state: () => ({
    records: [],
    loading: false,
    usingLocalFallback: false,
    userId: null,
  }),

  getters: {
    sortedRecords: (state) =>
      [...state.records].sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate)),

    latestRecord() {
      return this.sortedRecords[0] || null
    },

    initialRecord() {
      return this.sortedRecords[this.sortedRecords.length - 1] || null
    },

    currentWeight() {
      return this.latestRecord?.weight || 0
    },

    initialWeight() {
      return this.initialRecord?.weight || 0
    },

    weightDifference() {
      if (!this.latestRecord || !this.initialRecord) return 0
      return Number((this.latestRecord.weight - this.initialRecord.weight).toFixed(1))
    },

    currentGoal() {
      return this.latestRecord?.goal || 'Ganho de massa corporal'
    },
  },

  actions: {
    async initialize() {
      await this.loadRecords()
    },

    async loadRecords() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id

      this.userId = userId || null
      this.loading = true

      if (!userId) {
        this.records = loadLocal(null)
        if (!this.records.length) {
          this.records = [defaultRecord(null)]
          saveLocal(null, this.records)
        }
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('body_progress')
          .select('*')
          .eq('user_id', userId)
          .order('record_date', { ascending: false })

        if (error) throw error

        this.records = (data || []).map(toRecord)
        this.usingLocalFallback = false

        if (!this.records.length) {
          const created = await this.createRecord(defaultRecord(userId))
          this.records = [created]
        }
      } catch {
        this.usingLocalFallback = true
        this.records = loadLocal(userId)
        if (!this.records.length) {
          this.records = [defaultRecord(userId)]
          saveLocal(userId, this.records)
        }
      } finally {
        this.loading = false
      }
    },

    persistLocal() {
      saveLocal(this.userId, this.records)
    },

    async createRecord(recordData) {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id || this.userId
      const localRecord = {
        id: createId(),
        userId,
        createdAt: new Date().toISOString(),
        ...recordData,
      }

      if (userId && !this.usingLocalFallback) {
        try {
          const { data, error } = await supabase
            .from('body_progress')
            .insert(toRow(localRecord, userId))
            .select()
            .single()

          if (error) throw error

          const created = toRecord(data)
          this.records.unshift(created)
          return created
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.records.unshift(localRecord)
      this.persistLocal()
      return localRecord
    },

    async updateRecord(recordId, recordData) {
      const index = this.records.findIndex((record) => record.id === recordId)
      if (index === -1) return

      const updated = { ...this.records[index], ...recordData }

      if (this.userId && !this.usingLocalFallback && recordId !== 'initial-body-progress') {
        try {
          const { error } = await supabase
            .from('body_progress')
            .update(toRow(updated, this.userId))
            .eq('id', recordId)
            .eq('user_id', this.userId)

          if (error) throw error
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.records[index] = updated
      this.persistLocal()
    },

    async deleteRecord(recordId) {
      this.records = this.records.filter((record) => record.id !== recordId)

      if (this.userId && !this.usingLocalFallback && recordId !== 'initial-body-progress') {
        try {
          await supabase.from('body_progress').delete().eq('id', recordId).eq('user_id', this.userId)
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.persistLocal()
    },
  },
})
