import axios from 'axios'

const getApiBaseUrl = () => {
  // If explicitly set via environment variable, use that
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }

  // Auto-detect hostname from current window location (works for network access)
  // if (typeof window !== 'undefined') {
  //   const hostname = window.location.hostname
  //   // Use the same hostname but port 5000 for API
  //   return `http://${hostname}:5000/api`
  // }
  // return `http://localhost:5000/api`
  return 'https://api.ooshasglobal.com/api'
}

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token and log requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Log complete JSON payload in formatted way
    if (config.data) {
      console.log(' Complete Request Payload (JSON):', JSON.stringify(config.data, null, 2))
      console.log(' Request Payload Size:', JSON.stringify(config.data).length, 'bytes')
    }

    return config
  },
  (error) => {
    console.error('Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Log error response for Network tab visibility
    if (error.response) {
      console.error(' API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
        timestamp: new Date().toISOString()
      })
      // Server responded with error status
      const message = error.response.data?.message || 'Something went wrong'
      // Preserve the full error object to access response.data
      const errorWithResponse = new Error(message)
      errorWithResponse.response = error.response
      throw errorWithResponse
    } else if (error.request) {
      console.error(' Network Error - No Response:', {
        url: error.config?.url,
        message: 'Request made but no response received',
        timestamp: new Date().toISOString()
      })
      // Request made but no response received
      throw new Error('Network error. Please check your connection.')
    } else {
      console.error('❌ Request Setup Error:', {
        message: error.message || 'An error occurred',
        timestamp: new Date().toISOString()
      })
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


let pageData;

const loadPageSchemas = async () => {
  const res = await apiService.get("/page-json");
  pageData = res;
};

loadPageSchemas();

export { pageData }

export default apiService
