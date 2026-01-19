import apiService from './apiService'

export const applicationService = {
  // Get all applications
  getApplications: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    const endpoint = queryString ? `/applications?${queryString}` : '/applications'
    return apiService.get(endpoint)
  },

  // Get single application
  getApplication: async (id) => {
    return apiService.get(`/applications/${id}`)
  },

  // Create application
  createApplication: async (applicationData) => {
    return apiService.post('/applications', applicationData)
  },

  // Update application
  updateApplication: async (id, applicationData) => {
    return apiService.put(`/applications/${id}`, applicationData)
  },

  // Delete application
  deleteApplication: async (id) => {
    return apiService.delete(`/applications/${id}`)
  },

  // Download all applications
  downloadAllApplications: async () => {
    return apiService.get('/applications/download/all')
  },
}

export default applicationService
