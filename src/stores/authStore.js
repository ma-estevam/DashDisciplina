import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

let sessionRestorePromise = null

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
      if (this.initialized) return this.currentUser
      if (sessionRestorePromise) return sessionRestorePromise

      sessionRestorePromise = this.restoreSession().finally(() => {
        sessionRestorePromise = null
      })

      return sessionRestorePromise
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
      } catch (error) {
        console.error('Erro ao carregar perfil:', error)
        return null
      }
    },

    async upsertProfile(user, name) {
      if (!user?.id) return

      try {
        const { error } = await supabase.from('profiles').upsert({
          id: user.id,
          name: name || fallbackName(user),
          email: user.email,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error
      } catch (error) {
        console.error('Erro ao salvar perfil:', error)
      }
    },

    async restoreSession() {
      if (this.initialized) return this.currentUser
      this.loading = true

      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (!data.session?.user) {
          this.currentUser = null
          return null
        }

        const user = data.session.user
        const profile = await this.loadUserProfile(user)
        const name = profile?.name || fallbackName(user)

        this.currentUser = {
          id: user.id,
          email: profile?.email || user.email,
          name,
        }

        return this.currentUser
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error)
        this.currentUser = null
        return null
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async register({ name, email, password }) {
      if (this.loading) return this.currentUser
      this.loading = true

      try {
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

        if (error) throw error

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

        return this.currentUser
      } catch (error) {
        console.error('Erro ao criar conta:', error)
        throw new Error(error.message || 'Não foi possível criar sua conta.', { cause: error })
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async login({ email, password }) {
      if (this.loading) return this.currentUser
      this.loading = true

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        })

        if (error) {
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

        return this.currentUser
      } catch (error) {
        console.error('Erro ao fazer login:', error)
        throw error
      } finally {
        this.loading = false
        this.initialized = true
      }
    },

    async logout() {
      this.loading = true

      try {
        await supabase.auth.signOut()
      } finally {
        this.currentUser = null
        this.loading = false
        this.initialized = true
      }
    },
  },
})
