import axios from 'axios'
import api from '@/utils/axios'

const API_URL = 'https://api-stockflow-production.up.railway.app:443/api/auth'

export const authService = {
  // Login
  async login(username, password) {
    try {
      const response = await axios.post(`${API_URL}/login`, {
        username,
        password
      })
      return response.data
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Network error' }
    }
  },

  // Logout
  async logout() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await axios.delete(`${API_URL}/logout`, {
          data: { refresh_token: refreshToken }
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Hapus tokens dari localStorage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
    }
  },

  // Get Profile (menggunakan access token)
  async getProfile() {
    try {
      const response = await api.get(`${API_URL}/profile`)
      return response.data
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Failed to get profile' }
    }
  },

  // Register
  async register(userData) {
    try {
      const response = await axios.post(`${API_URL}/register`, userData)
      return response.data
    } catch (error) {
      throw error.response?.data || { status: 'error', message: 'Registration failed' }
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('accessToken')
  },

  // Get current user from localStorage
  getCurrentUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}
