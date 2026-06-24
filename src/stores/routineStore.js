import { defineStore } from 'pinia'
import { loadUserData, saveUserData } from '../services/storageService'

const ROUTINES_KEY = 'routines'
const ACTIVE_ROUTINE_KEY = 'active_routine'

function createId() {
  return crypto.randomUUID()
}

function getDefaultRoutines() {
  return [
    {
      id: 'vacation',
      name: 'Férias',
      description: 'Rotina completa para o período de férias.',
      type: 'Férias',
      activities: [
        {
          id: createId(),
          startTime: '06:15',
          endTime: '07:30',
          title: 'Treino',
          description: 'Treino da manhã — 1h15',
        },
        {
          id: createId(),
          startTime: '08:10',
          endTime: '10:10',
          title: 'Estudo profundo',
          description: 'Bloco principal de estudo.',
        },
        {
          id: createId(),
          startTime: '11:40',
          endTime: '12:40',
          title: 'Cozinhar',
          description: 'Preparar almoço e organizar alimentação.',
        },
        {
          id: createId(),
          startTime: '17:20',
          endTime: '18:20',
          title: 'Crochê',
          description: 'Descanso ativo.',
        },
      ],
      habits: [
        {
          id: createId(),
          name: 'Treino',
          description: 'Treinar pela manhã.',
          goal: '1h15',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Estudo',
          description: 'Estudar com foco.',
          goal: '2h',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Cozinhar',
          description: 'Preparar ou organizar alimentação.',
          goal: '1 refeição',
          unit: 'vezes',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Leitura',
          description: 'Ler um pouco todos os dias.',
          goal: '10 minutos',
          unit: 'tempo',
          requiresEvidence: false,
        },
        {
          id: createId(),
          name: 'Crochê',
          description: 'Praticar crochê.',
          goal: '30 minutos',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Descanso',
          description: 'Dormir e desacelerar.',
          goal: '7h',
          unit: 'tempo',
          requiresEvidence: false,
        },
      ],
    },
    {
      id: 'college',
      name: 'Faculdade',
      description: 'Rotina adaptada para dias de aula.',
      type: 'Faculdade',
      activities: [
        {
          id: createId(),
          startTime: '08:30',
          endTime: '09:00',
          title: 'Acordar',
          description: 'Organizar o início do dia.',
        },
        {
          id: createId(),
          startTime: '09:00',
          endTime: '10:15',
          title: 'Treino',
          description: 'Treino da manhã — 1h15.',
        },
        {
          id: createId(),
          startTime: '11:00',
          endTime: '12:20',
          title: 'Estudo',
          description: 'Estudo principal antes da faculdade.',
        },
        {
          id: createId(),
          startTime: '15:30',
          endTime: '16:50',
          title: 'Se arrumar',
          description: 'Preparação para sair de casa.',
        },
        {
          id: createId(),
          startTime: '16:50',
          endTime: '00:00',
          title: 'Faculdade',
          description: 'Deslocamento, aula e retorno.',
        },
      ],
      habits: [
        {
          id: createId(),
          name: 'Treino',
          description: 'Treino de 1h15 pela manhã.',
          goal: '1h15',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Estudo',
          description: 'Estudo antes da faculdade.',
          goal: '1h',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Cozinhar',
          description: 'Alimentação organizada.',
          goal: '1 refeição',
          unit: 'vezes',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Leitura',
          description: 'Leitura leve no dia.',
          goal: '10 minutos',
          unit: 'tempo',
          requiresEvidence: false,
        },
        {
          id: createId(),
          name: 'Crochê',
          description: 'Crochê leve se houver tempo.',
          goal: '15 minutos',
          unit: 'tempo',
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Descanso',
          description: 'Desacelerar ao chegar em casa.',
          goal: 'dormir cedo',
          unit: 'qualidade',
          requiresEvidence: false,
        },
      ],
    },
  ]
}

export const useRoutineStore = defineStore('routine', {
  state: () => ({
    routines: [],
    activeRoutineId: null,
    loaded: false,
  }),

  getters: {
    activeRoutine(state) {
      return (
        state.routines.find((routine) => routine.id === state.activeRoutineId) ||
        state.routines[0]
      )
    },
  },

  actions: {
    loadRoutines() {
      const savedRoutines = loadUserData(ROUTINES_KEY, null)
      const savedActiveRoutine = loadUserData(ACTIVE_ROUTINE_KEY, null)

      if (savedRoutines && Array.isArray(savedRoutines) && savedRoutines.length > 0) {
        this.routines = savedRoutines
      } else {
        this.routines = getDefaultRoutines()
        saveUserData(ROUTINES_KEY, this.routines)
      }

      this.activeRoutineId = savedActiveRoutine || this.routines[0]?.id || null
      this.loaded = true
    },

    persist() {
      saveUserData(ROUTINES_KEY, this.routines)
      saveUserData(ACTIVE_ROUTINE_KEY, this.activeRoutineId)
    },

    setActiveRoutine(routineId) {
      this.activeRoutineId = routineId
      this.persist()
    },

    createRoutine(routineData) {
      const newRoutine = {
        id: createId(),
        name: routineData.name,
        description: routineData.description || '',
        type: routineData.type || 'Personalizada',
        activities: [],
        habits: [],
      }

      this.routines.push(newRoutine)
      this.activeRoutineId = newRoutine.id
      this.persist()
    },

    updateRoutine(routineId, routineData) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      routine.name = routineData.name
      routine.description = routineData.description
      routine.type = routineData.type

      this.persist()
    },

    deleteRoutine(routineId) {
      this.routines = this.routines.filter((routine) => routine.id !== routineId)

      if (this.activeRoutineId === routineId) {
        this.activeRoutineId = this.routines[0]?.id || null
      }

      this.persist()
    },

    addActivity(routineId, activityData) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      routine.activities.push({
        id: createId(),
        startTime: activityData.startTime,
        endTime: activityData.endTime,
        title: activityData.title,
        description: activityData.description || '',
      })

      this.persist()
    },

    updateActivity(routineId, activityId, activityData) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      const activity = routine.activities.find((item) => item.id === activityId)

      if (!activity) return

      activity.startTime = activityData.startTime
      activity.endTime = activityData.endTime
      activity.title = activityData.title
      activity.description = activityData.description || ''

      this.persist()
    },

    deleteActivity(routineId, activityId) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      routine.activities = routine.activities.filter((item) => item.id !== activityId)

      this.persist()
    },

    addHabit(routineId, habitData) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      routine.habits.push({
        id: createId(),
        name: habitData.name,
        description: habitData.description || '',
        goal: habitData.goal || '',
        unit: habitData.unit || '',
        requiresEvidence: !!habitData.requiresEvidence,
      })

      this.persist()
    },

    updateHabit(routineId, habitId, habitData) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      const habit = routine.habits.find((item) => item.id === habitId)

      if (!habit) return

      habit.name = habitData.name
      habit.description = habitData.description || ''
      habit.goal = habitData.goal || ''
      habit.unit = habitData.unit || ''
      habit.requiresEvidence = !!habitData.requiresEvidence

      this.persist()
    },

    deleteHabit(routineId, habitId) {
      const routine = this.routines.find((item) => item.id === routineId)

      if (!routine) return

      routine.habits = routine.habits.filter((item) => item.id !== habitId)

      this.persist()
    },
  },
})