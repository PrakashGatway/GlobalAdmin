import apiService from './apiService'

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Get user from localStorage
const getUser = () => {
  const userStr = localStorage.getItem('user')
  return userStr ? JSON.parse(userStr) : null
}

// Save token and user to localStorage
const saveAuth = (token, user) => {
  localStorage.setItem('token', token)
}

// Clear auth data
const logout = () => {
  localStorage.removeItem('token')
}

export const authService = {
  // Send OTP
  sendOTP: async (email, role) => {
    return apiService.post('/auth/send-otp', { email, role })
  },

  // Verify OTP and login
  verifyOTP: async (email, otp, role) => {
    const response = await apiService.post('/auth/verify-otp', { email, otp, role })
    if (response.success && response.token) {
      saveAuth(response.token, response.data)
    }
    return response
  },

  // Register new user
  register: async (userData) => {
    const response = await apiService.post('/auth/register', userData)
    if (response.success && response.token) {
      saveAuth(response.token, response.data)
    }
    return response
  },

  // Get current user from API
  getCurrentUser: async () => {
    const response = await apiService.get('/auth/me')
    if (response.success) {
      saveAuth(getToken(), response.data)
      return response.data
    }
    throw new Error(response.message || 'Failed to get user')
  },

  // Get current user profile
  getMe: async () => {
    return apiService.get('/auth/me')
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiService.put('/auth/profile', profileData)
  },

  // Get token
  getToken,

  // Get user
  getUser,

  // Logout
  logout,
}

export default authService
