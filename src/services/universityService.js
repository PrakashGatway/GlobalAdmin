import apiService from './apiService'
const getUniversities = (params = {}) => {
  return apiService.get('/universities', { params })
}

const getUniversityById = (id) => {
  return apiService.get(`/universities/${id}`)
}

const createUniversity = (data) => {
  return apiService.post('/universities', data)
}

const updateUniversity = (id, data) => {
  return apiService.put(`/universities/${id}`, data)
}

const deleteUniversity = (id) => {
  return apiService.delete(`/universities/${id}`)
}

export default {
  getUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity,
}
