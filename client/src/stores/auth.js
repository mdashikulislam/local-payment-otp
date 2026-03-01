import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('admin_token') || null)
  const admin = ref(JSON.parse(localStorage.getItem('admin_data') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value)

  const setAuth = (newToken, newAdmin) => {
    token.value = newToken
    admin.value = newAdmin
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_data', JSON.stringify(newAdmin))
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
  }

  const clearAuth = () => {
    token.value = null
    admin.value = null
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_data')
    delete api.defaults.headers.common['Authorization']
  }

  const login = async (username, password) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', {
        username: username.trim(),
        password
      })

      if (response.data.success) {
        setAuth(response.data.token, response.data.admin)
        return { success: true }
      }
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed. Please try again.'
      error.value = message
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearAuth()
  }

  const verifyToken = async () => {
    if (!token.value) return false

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const response = await api.post('/auth/verify')

      if (response.data.success) {
        admin.value = response.data.admin
        return true
      }
    } catch (err) {
      clearAuth()
      return false
    }
  }

  const initAuth = () => {
    if (token.value) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    }
  }

  return {
    token,
    admin,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    verifyToken,
    initAuth
  }
})
