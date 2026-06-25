import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

function createId() {
  return crypto.randomUUID()
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.id) throw new Error('Faça login para salvar seus registros.')
  return user
}

function logToEntry(log) {
  return {
    logId: log.id,
    habitId: log.routine_habit_id,
    habitName: log.habit_name || 'Hábito sem nome',
    completed: Boolean(log.done),
    amount: log.value_done ?? '',
    unit: log.unit || '',
    note: log.notes || '',
    evidenceIds: log.evidence_url ? [log.id] : [],
    evidenceUrl: log.evidence_url || '',
    evidencePath: log.evidence_path || '',
  }
}

function toRecord(row, logs = []) {
  const entries = logs.map(logToEntry)

  return {
    id: row.id,
    userId: row.user_id,
    date: row.record_date,
    routineId: row.routine_id,
    routineName: row.routine_name || 'Rotina sem nome',
    plannedHabitCount: Number(row.planned_habits || 0),
    habitsCompleted: Number(row.completed_habits || 0),
    progressPercent: Number(row.progress_percent || 0),
    entries,
    note: row.notes || '',
    isExceptionDay: Boolean(row.is_exception_day),
    exceptionId: row.exception_id || null,
    exceptionReason: row.exception_reason || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
  }
}

function toEvidence(log, recordDate, routineId) {
  return {
    id: log.id,
    date: recordDate,
    routineId,
    habitId: log.routine_habit_id,
    habitName: log.habit_name || 'Hábito sem nome',
    note: log.notes || '',
    image: log.evidence_url || '',
    evidenceUrl: log.evidence_url || '',
    evidencePath: log.evidence_path || '',
    fileName: '',
    createdAt: log.updated_at || log.created_at || new Date().toISOString(),
  }
}

function calculateProgressValues(entries, exceptionData = null) {
  const completed = entries.filter((entry) => entry.completed).length
  const isExceptionDay = Boolean(exceptionData?.isExceptionDay)
  const minimumGoal = Number(exceptionData?.minimumHabitsGoal) || completed || 1
  const planned = isExceptionDay ? minimumGoal : entries.length
  const progress = planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0

  return { planned, completed, progress, isExceptionDay }
}

export const useDisciplineStore = defineStore('discipline', {
  state: () => ({
    userId: null,
    records: [],
    evidences: [],
    loading: false,
    loaded: false,
    error: '',
  }),

  getters: {
    recordByDate: (state) => (date) =>
      state.records.find((record) => record.date === date) || null,
    evidencesByDate: (state) => (date) =>
      state.evidences.filter((evidence) => evidence.date === date),
  },

  actions: {
    async requireUser() {
      const user = await getAuthUser()
      this.userId = user.id
      return user.id
    },

    async initialize() {
      await this.loadData()
    },

    async loadData() {
      this.loading = true
      this.error = ''

      try {
        const user = await getAuthUser()
        this.userId = user.id

        const [
          { data: recordsData, error: recordsError },
          { data: logsData, error: logsError },
        ] = await Promise.all([
          supabase
            .from('routine_daily_records')
            .select('*')
            .eq('user_id', user.id)
            .order('record_date', { ascending: false }),
          supabase
            .from('routine_habit_logs')
            .select('*')
            .eq('user_id', user.id),
        ])

        if (recordsError || logsError) throw recordsError || logsError

        const logsByRecord = new Map()
        for (const log of logsData || []) {
          if (!logsByRecord.has(log.daily_record_id)) logsByRecord.set(log.daily_record_id, [])
          logsByRecord.get(log.daily_record_id).push(log)
        }

        this.records = (recordsData || []).map((record) =>
          toRecord(record, logsByRecord.get(record.id) || []),
        )
        this.evidences = []

        for (const record of recordsData || []) {
          for (const log of logsByRecord.get(record.id) || []) {
            if (log.evidence_url) this.evidences.push(toEvidence(log, record.record_date, record.routine_id))
          }
        }

        this.loaded = true
      } catch (error) {
        this.error = error.message || 'Não foi possível carregar seus registros.'
        this.records = []
        this.evidences = []
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    calculateProgress(entries = [], exceptionData = null) {
      return calculateProgressValues(entries, exceptionData).progress
    },

    async loadRecordByDate(date) {
      if (!this.loaded) await this.loadData()
      return this.recordByDate(date)
    },

    async loadWeekRecords(dateKeys = []) {
      if (!this.loaded) await this.loadData()
      return this.records.filter((record) => dateKeys.includes(record.date))
    },

    async ensureDailyRecord({ date, routine, entries = [], note = '', exceptionData = null }) {
      const userId = await this.requireUser()
      const { planned, completed, progress, isExceptionDay } = calculateProgressValues(entries, exceptionData)
      const existing = this.records.find((record) => record.date === date)
      const row = {
        user_id: userId,
        routine_id: routine?.id || null,
        routine_name: routine?.name || 'Rotina sem nome',
        record_date: date,
        is_exception_day: isExceptionDay,
        exception_id: exceptionData?.exceptionId || null,
        exception_reason: exceptionData?.exceptionReason || exceptionData?.exceptionTitle || '',
        planned_habits: planned,
        completed_habits: completed,
        progress_percent: progress,
        notes: note?.trim() || '',
        updated_at: new Date().toISOString(),
      }

      let query = supabase.from('routine_daily_records')

      if (existing?.id) {
        query = query.update(row).eq('id', existing.id).eq('user_id', userId)
      } else {
        query = query.insert({ id: createId(), ...row })
      }

      const { data, error } = await query.select().single()
      if (error) throw error

      const saved = toRecord(data, existing?.entries || [])
      if (existing) Object.assign(existing, saved)
      else this.records.unshift(saved)

      return saved
    },

    async upsertHabitLog(dailyRecord, entry, existingLogId = null) {
      const userId = await this.requireUser()
      const existingLog =
        existingLogId ||
        entry.logId ||
        entry.evidenceIds?.[0] ||
        dailyRecord.entries.find((item) => item.habitId === entry.habitId)?.logId ||
        null

      const existingEvidence = existingLog
        ? this.evidences.find((item) => item.id === existingLog)
        : null

      const row = {
        user_id: userId,
        daily_record_id: dailyRecord.id,
        routine_habit_id: entry.habitId,
        habit_name: entry.habitName || 'Hábito sem nome',
        done: Boolean(entry.completed),
        value_done: entry.amount === '' || entry.amount === undefined ? null : Number(entry.amount),
        unit: entry.unit || '',
        notes: entry.note || '',
        evidence_url: entry.evidenceUrl || existingEvidence?.image || null,
        evidence_path: entry.evidencePath || existingEvidence?.evidencePath || null,
        updated_at: new Date().toISOString(),
      }

      let query = supabase.from('routine_habit_logs')

      if (existingLog) {
        query = query.update(row).eq('id', existingLog).eq('user_id', userId)
      } else {
        query = query.insert({ id: createId(), ...row })
      }

      const { data, error } = await query.select().single()
      if (error) throw error

      return data
    },

    async saveRecord({ date, routine, entries, note, exceptionData = null }) {
      const dailyRecord = await this.ensureDailyRecord({ date, routine, entries, note, exceptionData })
      const savedLogs = []

      for (const entry of entries) {
        savedLogs.push(await this.upsertHabitLog(dailyRecord, entry))
      }

      const savedEntries = savedLogs.map(logToEntry)
      const updatedRecord = toRecord(
        {
          id: dailyRecord.id,
          user_id: dailyRecord.userId,
          record_date: date,
          routine_id: routine?.id || dailyRecord.routineId,
          routine_name: routine?.name || dailyRecord.routineName,
          planned_habits: dailyRecord.plannedHabitCount,
          completed_habits: dailyRecord.habitsCompleted,
          progress_percent: dailyRecord.progressPercent,
          notes: note || '',
          is_exception_day: dailyRecord.isExceptionDay,
          exception_id: dailyRecord.exceptionId,
          exception_reason: dailyRecord.exceptionReason,
          created_at: dailyRecord.createdAt,
          updated_at: new Date().toISOString(),
        },
        savedLogs,
      )

      const index = this.records.findIndex((record) => record.id === dailyRecord.id)
      if (index !== -1) this.records[index] = updatedRecord
      else this.records.unshift(updatedRecord)

      this.evidences = this.evidences.filter((item) => item.date !== date)
      for (const log of savedLogs) {
        if (log.evidence_url) this.evidences.push(toEvidence(log, date, routine?.id || dailyRecord.routineId))
      }

      return { ...updatedRecord, entries: savedEntries }
    },

    async addEvidence(evidence) {
      let dailyRecord = this.recordByDate(evidence.date)

      if (!dailyRecord) {
        dailyRecord = await this.ensureDailyRecord({
          date: evidence.date,
          routine: { id: evidence.routineId, name: evidence.routineName || 'Rotina sem nome' },
          entries: [],
        })
      }

      const log = await this.upsertHabitLog(dailyRecord, {
        habitId: evidence.habitId,
        habitName: evidence.habitName,
        completed: false,
        amount: '',
        unit: evidence.unit || '',
        note: evidence.note || '',
        evidenceUrl: evidence.image || evidence.evidenceUrl,
        evidencePath: evidence.evidencePath || '',
      })

      const item = toEvidence(log, evidence.date, evidence.routineId)
      this.evidences = this.evidences.filter((evidenceItem) => evidenceItem.id !== item.id)
      this.evidences.unshift(item)
      return item
    },

    async deleteEvidence(evidenceId) {
      const userId = await this.requireUser()
      const { data, error } = await supabase
        .from('routine_habit_logs')
        .update({ evidence_url: null, evidence_path: null, updated_at: new Date().toISOString() })
        .eq('id', evidenceId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      this.evidences = this.evidences.filter((item) => item.id !== evidenceId)
      for (const record of this.records) {
        for (const entry of record.entries || []) {
          if (entry.logId === data.id) {
            entry.evidenceIds = []
            entry.evidenceUrl = ''
            entry.evidencePath = ''
          }
        }
      }
    },
  },
})
