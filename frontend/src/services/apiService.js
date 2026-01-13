import axios from 'axios'

// Base API service with authentication
// Use import.meta.env for Vite, or auto-detect from current hostname for network access
const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Auto-detect hostname from current window location (works for network access)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // Use the same hostname but port 5000 for API
    return `http://${hostname}:5000/api`
  }
  
  // Fallback to localhost (for SSR or build time)
  return 'http://localhost:5000/api'
}

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Something went wrong'
      throw new Error(message)
    } else if (error.request) {
      // Request made but no response received
      throw new Error('Network error. Please check your connection.')
    } else {
      // Something else happened
      throw new Error(error.message || 'An error occurred')
    }
  }
)

// Generic CRUD operations
export const apiService = {
  // GET request
  get: (endpoint, config = {}) => apiClient.get(endpoint, config),

  // POST request
  post: (endpoint, body, config = {}) => apiClient.post(endpoint, body, config),

  // PUT request
  put: (endpoint, body, config = {}) => apiClient.put(endpoint, body, config),

  // DELETE request
  delete: (endpoint, config = {}) => apiClient.delete(endpoint, config),
}

export default apiService
