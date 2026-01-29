import apiService from './apiService'

export const universityService = {
  // Get all universities
  getUniversities: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/universities${queryString ? `?${queryString}` : ''}`)
  },

  // Get single university
  getUniversity: async (id) => {
    return apiService.get(`/universities/${id}`)
  },

  // Create university
  createUniversity: async (universityData) => {
    return apiService.post('/universities', universityData)
  },

  // Update university
  updateUniversity: async (id, universityData) => {
    return apiService.put(`/universities/${id}`, universityData)
  },

  // Delete university
  deleteUniversity: async (id) => {
    return apiService.delete(`/universities/${id}`)
  },
}

export default universityService
