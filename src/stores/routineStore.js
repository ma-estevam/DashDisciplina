import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

const STORAGE_KEY = 'disciplina_247_routines_v1'
const LEGACY_ROUTINE_KEY = 'disciplina_247_routine_type'

function createDefaultRoutines() {
  const now = new Date().toISOString()

  return [
    {
      id: crypto.randomUUID(),
      legacyId: 'vacation',
      name: 'Rotina de Férias',
      description:
        'Rotina mais completa, com mais tempo para treino, estudo, cozinha, leitura, crochê e descanso.',
      type: 'vacation',
      createdAt: now,
      updatedAt: now,
      activities: [
        { id: crypto.randomUUID(), startTime: '06:15', endTime: '07:30', title: 'Treino da manhã', description: '' },
        { id: crypto.randomUUID(), startTime: '08:10', endTime: '10:10', title: 'Estudo profundo', description: '' },
        { id: crypto.randomUUID(), startTime: '11:40', endTime: '12:40', title: 'Cozinhar e preparar almoço', description: '' },
        { id: crypto.randomUUID(), startTime: '13:30', endTime: '14:00', title: 'Leitura leve ou revisão', description: '' },
        { id: crypto.randomUUID(), startTime: '17:20', endTime: '18:20', title: 'Crochê', description: '' },
        { id: crypto.randomUUID(), startTime: '22:30', endTime: '22:45', title: 'Preparar o dia seguinte', description: '' },
      ],
      habits: createDefaultHabits(),
    },
    {
      id: crypto.randomUUID(),
      legacyId: 'college',
      name: 'Rotina de Faculdade',
      description:
        'Rotina adaptada para os dias de aula, considerando saída às 16h50 e retorno por volta de 00h.',
      type: 'college',
      createdAt: now,
      updatedAt: now,
      activities: [
        { id: crypto.randomUUID(), startTime: '08:30', endTime: '09:00', title: 'Organizar o início do dia', description: '' },
        { id: crypto.randomUUID(), startTime: '09:00', endTime: '10:15', title: 'Treino da manhã', description: '' },
        { id: crypto.randomUUID(), startTime: '11:00', endTime: '12:20', title: 'Estudo principal', description: '' },
        { id: crypto.randomUUID(), startTime: '12:20', endTime: '13:20', title: 'Cozinhar e almoçar', description: '' },
        { id: crypto.randomUUID(), startTime: '14:00', endTime: '15:30', title: 'Tarefas da faculdade', description: '' },
        { id: crypto.randomUUID(), startTime: '16:50', endTime: '23:59', title: 'Faculdade', description: '' },
      ],
      habits: createDefaultHabits(),
    },
  ]
}

function createDefaultHabits() {
  return [
    { id: crypto.randomUUID(), name: 'Treino', description: 'Movimentar o corpo e cuidar da saúde.', dailyGoal: 75, unit: 'minutos', requiresEvidence: true },
    { id: crypto.randomUUID(), name: 'Estudo', description: 'Cumprir os blocos de foco planejados.', dailyGoal: 2, unit: 'horas', requiresEvidence: false },
    { id: crypto.randomUUID(), name: 'Cozinhar', description: 'Manter a alimentação organizada.', dailyGoal: 1, unit: 'vezes', requiresEvidence: false },
    { id: crypto.randomUUID(), name: 'Leitura', description: 'Reservar um momento para ler.', dailyGoal: 20, unit: 'minutos', requiresEvidence: false },
    { id: crypto.randomUUID(), name: 'Crochê', description: 'Praticar um descanso criativo.', dailyGoal: 30, unit: 'minutos', requiresEvidence: false },
    { id: crypto.randomUUID(), name: 'Descanso', description: 'Priorizar sono e pausas reais.', dailyGoal: 8, unit: 'horas', requiresEvidence: false },
  ]
}

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { version: 1, users: {} }
  } catch {
    return { version: 1, users: {} }
  }
}

export const useRoutineStore = defineStore('routine', {
  state: () => ({
    userId: null,
    routines: [],
    activeRoutineId: null,
  }),

  getters: {
    activeRoutine: (state) =>
      state.routines.find((routine) => routine.id === state.activeRoutineId) || null,
  },

  actions: {
    initialize() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id

      if (!userId) {
        this.userId = null
        this.routines = []
        this.activeRoutineId = null
        return
      }

      if (this.userId === userId && this.routines.length) return

      const storage = readStorage()
      let userData = storage.users[userId]

      if (!userData) {
        const routines = createDefaultRoutines()
        const legacyRoutine = localStorage.getItem(LEGACY_ROUTINE_KEY)
        const activeRoutine =
          routines.find((routine) => routine.legacyId === legacyRoutine) || routines[0]

        userData = {
          activeRoutineId: activeRoutine.id,
          routines,
        }
        storage.users[userId] = userData
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
      }

      this.userId = userId
      this.routines = userData.routines || []
      this.activeRoutineId =
        userData.activeRoutineId &&
        this.routines.some((routine) => routine.id === userData.activeRoutineId)
          ? userData.activeRoutineId
          : this.routines[0]?.id || null
    },

    persist() {
      if (!this.userId) return

      const storage = readStorage()
      storage.users[this.userId] = {
        activeRoutineId: this.activeRoutineId,
        routines: this.routines,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
    },

    setActiveRoutine(routineId) {
      if (!this.routines.some((routine) => routine.id === routineId)) return
      this.activeRoutineId = routineId
      this.persist()
    },

    createRoutine(data) {
      const now = new Date().toISOString()
      const routine = {
        id: crypto.randomUUID(),
        name: data.name.trim(),
        description: data.description?.trim() || '',
        type: data.type || 'custom',
        createdAt: now,
        updatedAt: now,
        activities: [],
        habits: [],
      }

      this.routines.push(routine)
      if (!this.activeRoutineId) this.activeRoutineId = routine.id
      this.persist()
      return routine
    },

    updateRoutine(routineId, data) {
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return

      routine.name = data.name.trim()
      routine.description = data.description?.trim() || ''
      routine.type = data.type || 'custom'
      routine.updatedAt = new Date().toISOString()
      this.persist()
    },

    deleteRoutine(routineId) {
      if (this.routines.length === 1) {
        throw new Error('Crie outra rotina antes de excluir a única rotina existente.')
      }

      this.routines = this.routines.filter((routine) => routine.id !== routineId)
      if (this.activeRoutineId === routineId) {
        this.activeRoutineId = this.routines[0]?.id || null
      }
      this.persist()
    },

    saveActivity(routineId, data) {
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return

      const activity = data.id
        ? routine.activities.find((item) => item.id === data.id)
        : null

      if (activity) {
        Object.assign(activity, {
          startTime: data.startTime,
          endTime: data.endTime,
          title: data.title.trim(),
          description: data.description?.trim() || '',
        })
      } else {
        routine.activities.push({
          id: crypto.randomUUID(),
          startTime: data.startTime,
          endTime: data.endTime,
          title: data.title.trim(),
          description: data.description?.trim() || '',
        })
      }

      routine.activities.sort((a, b) => a.startTime.localeCompare(b.startTime))
      routine.updatedAt = new Date().toISOString()
      this.persist()
    },

    deleteActivity(routineId, activityId) {
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return
      routine.activities = routine.activities.filter((item) => item.id !== activityId)
      routine.updatedAt = new Date().toISOString()
      this.persist()
    },

    saveHabit(routineId, data) {
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return

      const habit = data.id ? routine.habits.find((item) => item.id === data.id) : null
      const values = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        dailyGoal:
          data.dailyGoal === '' || data.dailyGoal === null
            ? null
            : Number(data.dailyGoal),
        unit: data.unit || '',
        requiresEvidence: Boolean(data.requiresEvidence),
      }

      if (habit) {
        Object.assign(habit, values)
      } else {
        routine.habits.push({ id: crypto.randomUUID(), ...values })
      }

      routine.updatedAt = new Date().toISOString()
      this.persist()
    },

    deleteHabit(routineId, habitId) {
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return
      routine.habits = routine.habits.filter((item) => item.id !== habitId)
      routine.updatedAt = new Date().toISOString()
      this.persist()
    },
  },
})
