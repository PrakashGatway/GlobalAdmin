import apiService from './apiService'

export const userService = {
  // Get all users
  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/users?${queryString}` : '/users'
    return apiService.get(endpoint)
  },

  // Get single user
  getUser: async (id) => {
    return apiService.get(`/users/${id}`)
  },

  // Create user
  createUser: async (userData) => {
    return apiService.post('/users', userData)
  },

  // Update user
  updateUser: async (id, userData) => {
    return apiService.put(`/users/${id}`, userData)
  },

  // Delete user
  deleteUser: async (id) => {
    return apiService.delete(`/users/${id}`)
  },
}

export default userService
