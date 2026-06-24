import { defineStore } from 'pinia'
import { supabase } from '../services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    currentUser: null,
    loading: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.currentUser),
  },

  actions: {
    async restoreSession() {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session?.user) {
        this.currentUser = null
        return
      }

      const user = data.session.user

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      }
    },

    async register({ name, email, password }) {
      this.loading = true

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            name: name.trim(),
          },
        },
      })

      this.loading = false

      if (error) {
        throw new Error(error.message)
      }

      const user = data.user

      if (!user) {
        throw new Error('Não foi possível criar o usuário.')
      }

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: name.trim(),
      }
    },

    async login({ email, password }) {
      this.loading = true

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      })

      this.loading = false

      if (error) {
        throw new Error('E-mail ou senha inválidos.')
      }

      const user = data.user

      this.currentUser = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || user.email,
      }
    },

    async logout() {
      await supabase.auth.signOut()
      this.currentUser = null
    },
  },
})