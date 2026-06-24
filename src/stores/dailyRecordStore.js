import { defineStore } from 'pinia'
import { useDisciplineStore } from './disciplineStore'
import { useExceptionStore } from './exceptionStore'

export const useDailyRecordStore = defineStore('dailyRecords', {
  actions: {
    initialize() {
      const disciplineStore = useDisciplineStore()
      disciplineStore.initialize()
    },

    loadDailyRecordByDate(date) {
      const disciplineStore = useDisciplineStore()
      return disciplineStore.recordByDate(date)
    },

    checkIfExceptionDay(date) {
      const exceptionStore = useExceptionStore()
      return exceptionStore.getExceptionByDate(date)
    },

    calculateDailyProgress({ entries = [], isExceptionDay = false, minimumHabitsGoal = 0 }) {
      const completed = entries.filter((entry) => entry.completed).length
      const planned = isExceptionDay ? Number(minimumHabitsGoal) || completed || 1 : entries.length
      return planned ? Math.min(100, Math.round((completed / planned) * 100)) : 0
    },

    saveDailyRecord(payload) {
      const disciplineStore = useDisciplineStore()
      return disciplineStore.saveRecord(payload)
    },

    updateDailyRecord(payload) {
      return this.saveDailyRecord(payload)
    },
  },
})
