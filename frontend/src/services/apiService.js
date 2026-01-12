// Base API service with authentication
// Use import.meta.env for Vite, fallback to default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token')
}

// Make authenticated API request
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken()
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong')
    }

    return data
  } catch (error) {
    throw error
  }
}

// Generic CRUD operations
export const apiService = {
  // GET request
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

  // POST request
  post: (endpoint, body) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),

  // PUT request
  put: (endpoint, body) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),

  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
}

export default apiService
