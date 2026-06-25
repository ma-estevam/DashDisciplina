import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

const DEFAULT_COLOR = '#8f1828'
const DEFAULT_ICON = 'Target'

function createId() {
  return crypto.randomUUID()
}

function nowIso() {
  return new Date().toISOString()
}

async function getAuthUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user?.id) throw new Error('Faça login para gerenciar suas rotinas.')
  return user
}

function asArray(value) {
  if (Array.isArray(value)) return value
  if (!value) return []
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }
  return []
}

function getDefaultRoutines() {
  return [
    {
      id: createId(),
      name: 'Férias',
      description: 'Rotina completa para o período de férias.',
      icon: 'Sun',
      color: DEFAULT_COLOR,
      type: 'vacation',
      weeklyGoalPercent: 70,
      startDate: '',
      endDate: '',
      activities: [
        {
          id: createId(),
          startTime: '06:15',
          endTime: '07:30',
          title: 'Treino',
          description: 'Treino da manhã — 1h15',
          daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
          category: 'Saúde',
          requiresEvidence: true,
        },
        {
          id: createId(),
          startTime: '08:10',
          endTime: '10:10',
          title: 'Estudo profundo',
          description: 'Bloco principal de estudo.',
          daysOfWeek: ['mon', 'tue', 'wed', 'thu', 'fri'],
          category: 'Estudo',
          requiresEvidence: true,
        },
      ],
      habits: [
        {
          id: createId(),
          name: 'Treino',
          description: 'Treinar pela manhã.',
          dailyGoal: 75,
          unit: 'minutos',
          frequency: 'daily',
          targetDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          isRequired: true,
          requiresEvidence: true,
        },
        {
          id: createId(),
          name: 'Estudo',
          description: 'Estudar com foco.',
          dailyGoal: 120,
          unit: 'minutos',
          frequency: 'daily',
          targetDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
          isRequired: true,
          requiresEvidence: true,
        },
      ],
    },
  ]
}

function toRoutine(row, activities = [], habits = []) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || '',
    description: row.description || '',
    icon: row.icon || DEFAULT_ICON,
    color: row.color || DEFAULT_COLOR,
    type: row.routine_type || row.type || 'custom',
    routineType: row.routine_type || row.type || 'custom',
    isActive: Boolean(row.is_active),
    weeklyGoalPercent: Number(row.weekly_goal_percent || 70),
    startDate: row.start_date || '',
    endDate: row.end_date || '',
    createdAt: row.created_at || nowIso(),
    updatedAt: row.updated_at || row.created_at || nowIso(),
    activities,
    habits,
  }
}

function toActivity(row) {
  return {
    id: row.id,
    routineId: row.routine_id,
    userId: row.user_id,
    title: row.title || '',
    description: row.description || '',
    startTime: row.start_time?.slice(0, 5) || '',
    endTime: row.end_time?.slice(0, 5) || '',
    daysOfWeek: asArray(row.days_of_week),
    category: row.category || '',
    position: Number(row.position || 0),
    requiresEvidence: Boolean(row.requires_evidence),
  }
}

function toHabit(row) {
  const goal = row.goal_value ?? ''

  return {
    id: row.id,
    routineId: row.routine_id,
    userId: row.user_id,
    name: row.name || '',
    description: row.description || '',
    dailyGoal: goal,
    goal: goal,
    goalValue: goal,
    unit: row.goal_unit || '',
    goalUnit: row.goal_unit || '',
    frequency: row.frequency || 'daily',
    targetDays: asArray(row.target_days),
    isRequired: row.is_required ?? true,
    requiresEvidence: Boolean(row.requires_evidence),
    position: Number(row.position || 0),
  }
}

function routineRow(routine, userId, isActive = false) {
  return {
    id: routine.id,
    user_id: userId,
    name: routine.name?.trim() || 'Rotina sem nome',
    description: routine.description || '',
    icon: routine.icon || DEFAULT_ICON,
    color: routine.color || DEFAULT_COLOR,
    routine_type: routine.routineType || routine.type || 'custom',
    is_active: isActive,
    weekly_goal_percent: Number(routine.weeklyGoalPercent || routine.weekly_goal_percent || 70),
    start_date: routine.startDate || null,
    end_date: routine.endDate || null,
    updated_at: nowIso(),
  }
}

function activityRow(activity, routineId, userId, position = 0) {
  return {
    id: activity.id || createId(),
    routine_id: routineId,
    user_id: userId,
    title: activity.title?.trim() || 'Atividade sem título',
    description: activity.description || '',
    start_time: activity.startTime,
    end_time: activity.endTime,
    days_of_week: activity.daysOfWeek || [],
    category: activity.category || '',
    position,
    requires_evidence: Boolean(activity.requiresEvidence),
  }
}

function habitRow(habit, routineId, userId, position = 0) {
  return {
    id: habit.id || createId(),
    routine_id: routineId,
    user_id: userId,
    name: habit.name?.trim() || 'Hábito sem nome',
    description: habit.description || '',
    goal_value: habit.dailyGoal === '' || habit.dailyGoal === undefined ? null : Number(habit.dailyGoal),
    goal_unit: habit.unit || habit.goalUnit || '',
    frequency: habit.frequency || 'daily',
    target_days: habit.targetDays || [],
    is_required: habit.isRequired ?? true,
    requires_evidence: Boolean(habit.requiresEvidence),
    position,
  }
}

export const useRoutineStore = defineStore('routine', {
  state: () => ({
    routines: [],
    activeRoutineId: null,
    loaded: false,
    loading: false,
    error: '',
    userId: null,
  }),

  getters: {
    currentRoutine: (state) => state.activeRoutineId,

    activeRoutine(state) {
      return (
        state.routines.find((routine) => routine.id === state.activeRoutineId) ||
        state.routines.find((routine) => routine.isActive) ||
        state.routines[0] ||
        null
      )
    },

    activeRoutineName() {
      return this.activeRoutine?.name || 'Nenhuma rotina'
    },

    activeRoutineType() {
      return this.activeRoutine?.type || 'custom'
    },

    activeActivities() {
      return this.activeRoutine?.activities || []
    },

    activeHabits() {
      return this.activeRoutine?.habits || []
    },
  },

  actions: {
    async requireUser() {
      const user = await getAuthUser()
      this.userId = user.id
      return user.id
    },

    async initialize() {
      await this.loadRoutines()
    },

    async loadRoutines() {
      this.loading = true
      this.error = ''

      try {
        const user = await getAuthUser()
        this.userId = user.id

        const [
          { data: routinesData, error: routinesError },
          { data: activitiesData, error: activitiesError },
          { data: habitsData, error: habitsError },
        ] = await Promise.all([
          supabase.from('user_routines').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
          supabase.from('routine_activities').select('*').eq('user_id', user.id).order('position', { ascending: true }),
          supabase.from('routine_habits').select('*').eq('user_id', user.id).order('position', { ascending: true }),
        ])

        if (routinesError || activitiesError || habitsError) {
          throw routinesError || activitiesError || habitsError
        }

        if (!routinesData?.length) {
          await this.seedDefaultRoutines(user.id)
          return
        }

        const activitiesByRoutine = new Map()
        for (const activity of (activitiesData || []).map(toActivity)) {
          if (!activitiesByRoutine.has(activity.routineId)) activitiesByRoutine.set(activity.routineId, [])
          activitiesByRoutine.get(activity.routineId).push(activity)
        }

        const habitsByRoutine = new Map()
        for (const habit of (habitsData || []).map(toHabit)) {
          if (!habitsByRoutine.has(habit.routineId)) habitsByRoutine.set(habit.routineId, [])
          habitsByRoutine.get(habit.routineId).push(habit)
        }

        this.routines = routinesData.map((routine) =>
          toRoutine(
            routine,
            activitiesByRoutine.get(routine.id) || [],
            habitsByRoutine.get(routine.id) || [],
          ),
        )
        this.activeRoutineId =
          this.routines.find((routine) => routine.isActive)?.id || this.routines[0]?.id || null
        this.loaded = true
      } catch (error) {
        this.error = error.message || 'Não foi possível carregar suas rotinas.'
        this.routines = []
        this.activeRoutineId = null
        this.loaded = true
      } finally {
        this.loading = false
      }
    },

    async loadActiveRoutine() {
      if (!this.loaded) await this.loadRoutines()
      return this.activeRoutine
    },

    async loadActivities(routineId = this.activeRoutineId) {
      if (!routineId) return []
      const userId = await this.requireUser()
      const { data, error } = await supabase
        .from('routine_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .order('position', { ascending: true })

      if (error) throw error
      const routine = this.routines.find((item) => item.id === routineId)
      const activities = (data || []).map(toActivity)
      if (routine) routine.activities = activities
      return activities
    },

    async loadHabits(routineId = this.activeRoutineId) {
      if (!routineId) return []
      const userId = await this.requireUser()
      const { data, error } = await supabase
        .from('routine_habits')
        .select('*')
        .eq('user_id', userId)
        .eq('routine_id', routineId)
        .order('position', { ascending: true })

      if (error) throw error
      const routine = this.routines.find((item) => item.id === routineId)
      const habits = (data || []).map(toHabit)
      if (routine) routine.habits = habits
      return habits
    },

    async seedDefaultRoutines(userId) {
      const defaults = getDefaultRoutines()

      for (const [routineIndex, routine] of defaults.entries()) {
        if (routineIndex === 0) {
          await supabase.from('user_routines').update({ is_active: false }).eq('user_id', userId)
        }

        const { error: routineError } = await supabase
          .from('user_routines')
          .insert(routineRow(routine, userId, routineIndex === 0))

        if (routineError) throw routineError

        if (routine.activities.length) {
          const { error } = await supabase
            .from('routine_activities')
            .insert(routine.activities.map((activity, index) => activityRow(activity, routine.id, userId, index)))
          if (error) throw error
        }

        if (routine.habits.length) {
          const { error } = await supabase
            .from('routine_habits')
            .insert(routine.habits.map((habit, index) => habitRow(habit, routine.id, userId, index)))
          if (error) throw error
        }
      }

      await this.loadRoutines()
    },

    async setActiveRoutine(routineId) {
      const userId = await this.requireUser()
      const previousActiveId = this.activeRoutineId

      const { error } = await supabase.from('user_routines').update({ is_active: false }).eq('user_id', userId)
      if (error) throw error

      const { error: activeError } = await supabase
        .from('user_routines')
        .update({ is_active: true, updated_at: nowIso() })
        .eq('id', routineId)
        .eq('user_id', userId)

      if (activeError) {
        this.activeRoutineId = previousActiveId
        throw activeError
      }

      this.activeRoutineId = routineId
      this.routines = this.routines.map((routine) => ({
        ...routine,
        isActive: routine.id === routineId,
      }))
    },

    async setRoutine(routineId) {
      await this.setActiveRoutine(routineId)
    },

    async createRoutine(routineData) {
      const userId = await this.requireUser()
      const newRoutine = {
        id: createId(),
        ...routineData,
        activities: [],
        habits: [],
      }

      await supabase.from('user_routines').update({ is_active: false }).eq('user_id', userId)

      const { data, error } = await supabase
        .from('user_routines')
        .insert(routineRow(newRoutine, userId, true))
        .select()
        .single()

      if (error) throw error

      const created = toRoutine(data, [], [])
      this.routines = this.routines.map((routine) => ({ ...routine, isActive: false }))
      this.routines.unshift(created)
      this.activeRoutineId = created.id
      return created
    },

    async updateRoutine(routineId, routineData) {
      const userId = await this.requireUser()
      const current = this.routines.find((item) => item.id === routineId)
      const { data, error } = await supabase
        .from('user_routines')
        .update(routineRow({ id: routineId, ...routineData }, userId, current?.isActive || false))
        .eq('id', routineId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      const index = this.routines.findIndex((item) => item.id === routineId)
      if (index !== -1) {
        this.routines[index] = toRoutine(
          data,
          this.routines[index].activities,
          this.routines[index].habits,
        )
      }
    },

    async deleteRoutine(routineId) {
      const userId = await this.requireUser()

      if (this.routines.length <= 1) {
        throw new Error('Mantenha pelo menos uma rotina cadastrada.')
      }

      const wasActive = this.activeRoutineId === routineId
      const { error } = await supabase.from('user_routines').delete().eq('id', routineId).eq('user_id', userId)
      if (error) throw error

      this.routines = this.routines.filter((routine) => routine.id !== routineId)

      if (wasActive && this.routines[0]?.id) {
        await this.setActiveRoutine(this.routines[0].id)
      }
    },

    async createActivity(routineId, activityData) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return null

      const row = activityRow(activityData, routineId, userId, routine.activities.length)
      const { data, error } = await supabase.from('routine_activities').insert(row).select().single()
      if (error) throw error

      const activity = toActivity(data)
      routine.activities.push(activity)
      return activity
    },

    async updateActivity(routineId, activityId, activityData) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return null

      const position = routine.activities.findIndex((item) => item.id === activityId)
      const { data, error } = await supabase
        .from('routine_activities')
        .update(activityRow({ ...activityData, id: activityId }, routineId, userId, Math.max(position, 0)))
        .eq('id', activityId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      const index = routine.activities.findIndex((item) => item.id === activityId)
      const activity = toActivity(data)
      if (index !== -1) routine.activities[index] = activity
      return activity
    },

    async deleteActivity(routineId, activityId) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return

      const { error } = await supabase.from('routine_activities').delete().eq('id', activityId).eq('user_id', userId)
      if (error) throw error

      routine.activities = routine.activities.filter((item) => item.id !== activityId)
    },

    async saveActivity(routineId, activityData) {
      if (activityData.id) return this.updateActivity(routineId, activityData.id, activityData)
      return this.createActivity(routineId, activityData)
    },

    async createHabit(routineId, habitData) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return null

      const row = habitRow(habitData, routineId, userId, routine.habits.length)
      const { data, error } = await supabase.from('routine_habits').insert(row).select().single()
      if (error) throw error

      const habit = toHabit(data)
      routine.habits.push(habit)
      return habit
    },

    async updateHabit(routineId, habitId, habitData) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return null

      const position = routine.habits.findIndex((item) => item.id === habitId)
      const { data, error } = await supabase
        .from('routine_habits')
        .update(habitRow({ ...habitData, id: habitId }, routineId, userId, Math.max(position, 0)))
        .eq('id', habitId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error

      const index = routine.habits.findIndex((item) => item.id === habitId)
      const habit = toHabit(data)
      if (index !== -1) routine.habits[index] = habit
      return habit
    },

    async deleteHabit(routineId, habitId) {
      const userId = await this.requireUser()
      const routine = this.routines.find((item) => item.id === routineId)
      if (!routine) return

      const { error } = await supabase.from('routine_habits').delete().eq('id', habitId).eq('user_id', userId)
      if (error) throw error

      routine.habits = routine.habits.filter((item) => item.id !== habitId)
    },

    async saveHabit(routineId, habitData) {
      if (habitData.id) return this.updateHabit(routineId, habitData.id, habitData)
      return this.createHabit(routineId, habitData)
    },
  },
})
