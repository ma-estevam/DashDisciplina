import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'
import { useAuthStore } from './authStore'

export const COURSE_CATEGORIES = [
  'Desenvolvimento Web com IA',
  'Front-end',
  'Back-end',
  'Supabase/Firebase',
  'UX/UI',
  'Mercado de TI',
  'Automação com IA',
  'Prompt Engineering',
]

function createId() {
  return crypto.randomUUID()
}

function toCourse(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name || '',
    platform: row.platform || '',
    category: row.category || '',
    status: row.status || 'não iniciado',
    totalHours: Number(row.total_hours || 0),
    completedHours: Number(row.completed_hours || 0),
    startDate: row.start_date || '',
    finishDate: row.finish_date || '',
    courseUrl: row.course_url || '',
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

function toRow(course, userId) {
  return {
    user_id: userId,
    name: course.name || '',
    platform: course.platform || '',
    category: course.category || '',
    status: course.status || 'não iniciado',
    total_hours: Number(course.totalHours || 0),
    completed_hours: Number(course.completedHours || 0),
    start_date: course.startDate || null,
    finish_date: course.finishDate || null,
    course_url: course.courseUrl || '',
    notes: course.notes || '',
  }
}

function loadLocal() {
  return []
}

function saveLocal() {
  // Cursos agora são persistidos apenas no Supabase.
}

export const useCoursesStore = defineStore('courses', {
  state: () => ({
    courses: [],
    loading: false,
    usingLocalFallback: false,
    userId: null,
  }),

  getters: {
    totalCourses: (state) => state.courses.length,
    activeCourses: (state) => state.courses.filter((course) => course.status === 'em andamento'),
    completedCourses: (state) => state.courses.filter((course) => course.status === 'concluído'),
    studiedHours: (state) =>
      state.courses.reduce((sum, course) => sum + Number(course.completedHours || 0), 0),

    generalProgress(state) {
      const total = state.courses.reduce((sum, course) => sum + Number(course.totalHours || 0), 0)
      if (!total) return 0
      return Math.round((this.studiedHours / total) * 100)
    },

    currentCourse() {
      return this.activeCourses[0] || this.courses[0] || null
    },
  },

  actions: {
    async initialize() {
      await this.loadCourses()
    },

    async loadCourses() {
      const authStore = useAuthStore()
      const userId = authStore.currentUser?.id
      this.userId = userId || null
      this.loading = true

      if (!userId) {
        this.courses = loadLocal(null)
        this.loading = false
        return
      }

      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (error) throw error

        this.courses = (data || []).map(toCourse)
        this.usingLocalFallback = false
      } catch {
        this.usingLocalFallback = true
        this.courses = loadLocal(userId)
      } finally {
        this.loading = false
      }
    },

    persistLocal() {
      saveLocal(this.userId, this.courses)
    },

    async createCourse(courseData) {
      const userId = useAuthStore().currentUser?.id || this.userId
      const localCourse = { id: createId(), userId, createdAt: new Date().toISOString(), ...courseData }

      if (userId && !this.usingLocalFallback) {
        try {
          const { data, error } = await supabase
            .from('courses')
            .insert(toRow(localCourse, userId))
            .select()
            .single()
          if (error) throw error
          const created = toCourse(data)
          this.courses.unshift(created)
          return created
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.courses.unshift(localCourse)
      this.persistLocal()
      return localCourse
    },

    async updateCourse(courseId, courseData) {
      const index = this.courses.findIndex((course) => course.id === courseId)
      if (index === -1) return
      const updated = { ...this.courses[index], ...courseData }

      if (this.userId && !this.usingLocalFallback) {
        try {
          const { error } = await supabase
            .from('courses')
            .update(toRow(updated, this.userId))
            .eq('id', courseId)
            .eq('user_id', this.userId)
          if (error) throw error
        } catch {
          this.usingLocalFallback = true
        }
      }

      this.courses[index] = updated
      this.persistLocal()
    },

    async deleteCourse(courseId) {
      this.courses = this.courses.filter((course) => course.id !== courseId)
      if (this.userId && !this.usingLocalFallback) {
        try {
          await supabase.from('courses').delete().eq('id', courseId).eq('user_id', this.userId)
        } catch {
          this.usingLocalFallback = true
        }
      }
      this.persistLocal()
    },
  },
})
