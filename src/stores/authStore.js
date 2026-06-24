import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

function fallbackName(user) {
  return user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuária'
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    loading: false,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
    authLoading: (state) => state.loading || !state.initialized,
  },

  actions: {
    async initialize() {
      await this.restoreSession()
    },

    async loadUserProfile(user) {
      if (!user?.id) return null

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name,email')
          .eq('id', user.id)
          .maybeSingle()

        if (error) throw error
        return data
      } catch {
        return null
      }
    },

    async upsertProfile(user, name) {
      if (!user?.id) return

      try {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: name || fallbackName(user),
          email: user.email,
          updated_at: new Date().toISOString(),
        })
      } catch {
        // A tabela profiles pode ainda não existir. O Auth metadata continua sendo o fallback.
      }
    },

    async restoreSession() {
      this.loading = true

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error || !data.session?.user) {
          this.currentUser = null
          return
        }

        const user = data.session.user
        const profile = await this.loadUserProfile(user)
        const name = profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuária'

        this.currentUser = {
          id: user.id,
          email: profile?.email || user.email,
          name,
        }
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async register({ name, email, password }) {
      this.loading = true

      const cleanName = name.trim()
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: cleanName,
          },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      this.loading = false
      this.initialized = true

      if (error) {
        throw new Error(error.message)
      }

      const user = data.user

      if (!user) {
        throw new Error('Não foi possível criar o usuário.')
      }

      await this.upsertProfile(user, cleanName)

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: cleanName || fallbackName(user),
      }
    },

    async login({ email, password }) {
      this.loading = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      if (error) {
        this.loading = false
        this.initialized = true
        throw new Error('E-mail ou senha inválidos.')
      }

      const user = data.user
      const profile = await this.loadUserProfile(user)
      const name = profile?.name || fallbackName(user)

      this.currentUser = {
        id: user.id,
        email: profile?.email || user.email,
        name,
      }

      this.loading = false
      this.initialized = true
    },

    async logout() {
      await supabase.auth.signOut()
      this.currentUser = null
      this.initialized = true
    },
  },
})
