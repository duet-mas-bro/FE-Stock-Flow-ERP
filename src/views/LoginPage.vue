<template>
  <div class="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-sm">
      <img class="mx-auto h-10 w-auto" src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company" />
      <h2 class="mt-10 text-center text-3xl font-bold tracking-tight text-white">Sign in to your account</h2>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
      <form class="space-y-6" @submit.prevent="handleLogin">
        <div>
          <label for="username" class="block text-base font-medium text-gray-100">Username</label>
          <div class="mt-2">
            <input
              v-model="username"
              type="text"
              name="username"
              id="username"
              autocomplete="username"
              required
              :disabled="loading"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-base font-medium text-gray-100">Password</label>
            <div class="text-sm">
              <a href="#" class="font-semibold text-indigo-400 hover:text-indigo-300">Forgot password?</a>
            </div>
          </div>
          <div class="mt-2 relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              id="password"
              autocomplete="current-password"
              required
              :disabled="loading"
              class="block w-full rounded-md bg-white/5 px-3 py-1.5 pr-10 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              :disabled="loading"
              class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <EyeIcon v-if="!showPassword" class="h-5 w-5" aria-hidden="true" />
              <EyeSlashIcon v-else class="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full justify-center items-center rounded-md bg-indigo-500 px-3 py-1.5 text-base font-semibold text-white hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Logging in...' : 'Log in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { defineEmits, ref } from 'vue'
import { authService } from '@/services/authService'
import { useToast } from '@/composables/useToast'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const emit = defineEmits(['loginSuccess'])
const { success, error } = useToast()

const username = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  if (!username.value || !password.value) {
    error('Please fill in all fields')
    return
  }

  loading.value = true

  try {
    // Call API login
    const response = await authService.login(username.value, password.value)

    if (response.status === 'success' && response.data) {
      // Simpan tokens di localStorage
      localStorage.setItem('accessToken', response.data.access_token)
      localStorage.setItem('refreshToken', response.data.refresh_token)

      // Get user profile untuk mendapatkan user info
      try {
        const profileResponse = await authService.getProfile()
        if (profileResponse.status === 'success' && profileResponse.data) {
          // Simpan user info
          localStorage.setItem('user', JSON.stringify(profileResponse.data))
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile:', profileError)
      }

      // Show success notification
      success('Login successful!')

      // Emit success event
      setTimeout(() => {
        emit('loginSuccess')
      }, 500)
    } else {
      error(response.message || 'Login failed')
    }
  } catch (err) {
    console.error('Login error:', err)

    // Show error notification
    if (err.status === 'fail') {
      error(err.message || 'Invalid credentials')
    } else {
      error('Network error. Please try again.')
    }
  } finally {
    loading.value = false
  }
}
</script>
