const SESSION_KEY = 'disciplina_247_current_user'

export function getLoggedUser() {
  const savedUser = localStorage.getItem(SESSION_KEY)

  if (!savedUser) {
    return null
  }

  try {
    return JSON.parse(savedUser)
  } catch {
    return null
  }
}

export function getUserStorageKey(baseKey) {
  const user = getLoggedUser()
  const userId = user?.email || 'guest'

  return `disciplina_247:${userId}:${baseKey}`
}

export function loadUserData(baseKey, fallbackValue) {
  const storageKey = getUserStorageKey(baseKey)
  const savedData = localStorage.getItem(storageKey)

  if (!savedData) {
    return fallbackValue
  }

  try {
    return JSON.parse(savedData)
  } catch {
    return fallbackValue
  }
}

export function saveUserData(baseKey, value) {
  const storageKey = getUserStorageKey(baseKey)
  localStorage.setItem(storageKey, JSON.stringify(value))
}