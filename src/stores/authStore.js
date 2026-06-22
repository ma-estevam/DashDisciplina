import { defineStore } from 'pinia'

const USERS_KEY = 'disciplina_247_users'
const SESSION_KEY = 'disciplina_247_current_user'

function getSavedUsers() {
  const savedUsers = localStorage.getItem(USERS_KEY)

  if (savedUsers) {
    return JSON.parse(savedUsers)
  }

  const defaultUsers = [
    {
      id: crypto.randomUUID(),
      name: 'Maria',
      email: 'maria@disciplina.com',
      password: '123456',
    },
  ]

  localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers))

  return defaultUsers
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    users: getSavedUsers(),
    currentUser: JSON.parse(localStorage.getItem(SESSION_KEY)) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.currentUser,
  },

  actions: {
    saveUsers() {
      localStorage.setItem(USERS_KEY, JSON.stringify(this.users))
    },

    register({ name, email, password }) {
      const userAlreadyExists = this.users.some(
        (user) => user.email.toLowerCase() === email.toLowerCase()
      )

      if (userAlreadyExists) {
        throw new Error('Este e-mail já está cadastrado.')
      }

      const newUser = {
        id: crypto.randomUUID(),
        name,
        email,
        password,
      }

      this.users.push(newUser)
      this.saveUsers()

      const userSession = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      }

      this.currentUser = userSession
      localStorage.setItem(SESSION_KEY, JSON.stringify(userSession))
    },

    login({ email, password }) {
      const user = this.users.find(
        (item) =>
          item.email.toLowerCase() === email.toLowerCase() &&
          item.password === password
      )

      if (!user) {
        throw new Error('E-mail ou senha inválidos.')
      }

      const userSession = {
        id: user.id,
        name: user.name,
        email: user.email,
      }

      this.currentUser = userSession
      localStorage.setItem(SESSION_KEY, JSON.stringify(userSession))
    },

    logout() {
      this.currentUser = null
      localStorage.removeItem(SESSION_KEY)
    },
  },
})