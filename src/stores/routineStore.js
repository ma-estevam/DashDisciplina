import { defineStore } from 'pinia'

const ROUTINE_KEY = 'disciplina_247_routine_type'

export const useRoutineStore = defineStore('routine', {
  state: () => ({
    currentRoutine: localStorage.getItem(ROUTINE_KEY) || 'vacation',

    routines: [
      {
        id: 'vacation',
        name: 'Férias',
        badge: 'Modo completo',
        description:
          'Rotina mais completa, com mais tempo para treino, estudo, cozinha, leitura, crochê e descanso.',
        schedule: [
          { time: '06:15', activity: 'Treino da manhã — 1h15' },
          { time: '08:10', activity: 'Estudo profundo' },
          { time: '11:40', activity: 'Cozinhar e preparar almoço' },
          { time: '13:30', activity: 'Leitura leve ou revisão' },
          { time: '17:20', activity: 'Crochê' },
          { time: '22:30', activity: 'Preparar o dia seguinte' },
        ],
      },
      {
        id: 'college',
        name: 'Faculdade',
        badge: 'Modo adaptado',
        description:
          'Rotina adaptada para os dias de aula, considerando saída às 16h50 e retorno por volta de 00h.',
        schedule: [
          { time: '08:30', activity: 'Acordar e organizar o início do dia' },
          { time: '09:00', activity: 'Treino da manhã — 1h15' },
          { time: '11:00', activity: 'Estudo principal' },
          { time: '12:20', activity: 'Cozinhar e almoçar' },
          { time: '13:20', activity: 'Descanso ou crochê leve' },
          { time: '14:00', activity: 'Revisão ou tarefas da faculdade' },
          { time: '15:30', activity: 'Se arrumar para sair' },
          { time: '16:50', activity: 'Sair de casa' },
          { time: '00:00', activity: 'Chegar, banho, desacelerar e dormir' },
        ],
      },
    ],
  }),

  getters: {
    activeRoutine: (state) => {
      return (
        state.routines.find((routine) => routine.id === state.currentRoutine) ||
        state.routines[0]
      )
    },
  },

  actions: {
    setRoutine(routineId) {
      this.currentRoutine = routineId
      localStorage.setItem(ROUTINE_KEY, routineId)
    },
  },
})