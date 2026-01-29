import apiService from './apiService'

export const programService = {
  // Get all programs
  getPrograms: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/programs${queryString ? `?${queryString}` : ''}`)
  },

  // Get single program
  getProgram: async (id) => {
    return apiService.get(`/programs/${id}`)
  },

  // Create program
  createProgram: async (programData) => {
    return apiService.post('/programs', programData)
  },

  // Update program
  updateProgram: async (id, programData) => {
    return apiService.put(`/programs/${id}`, programData)
  },

  // Delete program
  deleteProgram: async (id) => {
    return apiService.delete(`/programs/${id}`)
  },
}

export default programService
