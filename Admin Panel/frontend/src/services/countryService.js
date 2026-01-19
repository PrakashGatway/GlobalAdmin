import apiService from './apiService'

export const countryService = {
  // Get all countries
  getCountries: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiService.get(`/countries${queryString ? `?${queryString}` : ''}`)
  },

  // Get single country
  getCountry: async (id) => {
    return apiService.get(`/countries/${id}`)
  },

  // Create country
  createCountry: async (countryData) => {
    return apiService.post('/countries', countryData)
  },

  // Update country
  updateCountry: async (id, countryData) => {
    return apiService.put(`/countries/${id}`, countryData)
  },

  // Delete country
  deleteCountry: async (id) => {
    return apiService.delete(`/countries/${id}`)
  },
}

export default countryService
