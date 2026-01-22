import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api-stockflow-production.up.railway.app:443/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request Interceptor - Tambahkan Access Token di setiap request
api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor - Handle token expired dan auto refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config

    // Jika token expired (401) dan belum retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')

        if (!refreshToken) {
          // Tidak ada refresh token, redirect ke login
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Request access token baru menggunakan refresh token
        const response = await axios.put('https://api-stockflow-production.up.railway.app:443/api/auth/refresh', {
          refresh_token: refreshToken
        })

        const newAccessToken = response.data.data.access_token

        // Simpan access token baru
        localStorage.setItem('accessToken', newAccessToken)

        // Retry request yang gagal dengan token baru
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        // Jika refresh token juga invalid/expired, redirect ke login
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
